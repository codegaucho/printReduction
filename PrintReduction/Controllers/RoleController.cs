using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Configuration;
using MongoRepository;
using PrintReduction.Data;
using PrintReduction.Rabbit;

namespace PrintReduction.Controllers
{
    public class RoleController : BaseController
    {

        static MongoRepository<Role> rolerepo = new MongoRepository<Role>();

        //
        // GET: /Role/
        public ActionResult Index()
        {
            //isadmin is a little different than most views - if no admin role, consider them an admin, if admin role, use that
            bool isAdmin = false;
            if (doesAdminRoleExist())
            {
                isAdmin = isInRole(User.Identity.Name, "Admin");
            }
            else
            {
                isAdmin = true;
            }
            ViewBag.isAdmin = isAdmin;
            ViewBag.flash = TempData["flash"];
            return View(rolerepo);
        }

        //
        // GET: /Role/Details/5
        [AllowAnonymous]
        public ActionResult Details(string id)
        {
            Role role = rolerepo.GetById(id);

            bool isAdmin = isInRole(User.Identity.Name, "Admin");
            ViewBag.isAdmin = isAdmin;

            if (isAdmin)
            {
                //we need to set to ViewBag properties to have the delete button work
                ViewBag.id = id;
                ViewBag.controller = RouteData.Values["controller"].ToString(); ;
            }

            //pass along any flash that may have come from another action but that has not yet been displayed
            ViewBag.flash = TempData["flash"];
            return View(role);
        }

        //
        // GET: /Role/Create
        public ActionResult Create()
        {
            return View(
                new Role() { }
            );
        }

        //
        // POST: /Role/Create
        [HttpPost]
        public ActionResult Create(Role role)
        {
            try
            {
                //first make sure role doesn't already exist
                var resultCount = rolerepo.Where(c => c.Title == role.Title).Count();

                if (resultCount == 0)
                {
                    //we want to add this user as a member in this role - essential so the first user adding admin is actually an admin

                    string currentUser = User.Identity.Name;
                    //we want to correct for user names in the form AA\tpmurphy
                    if (currentUser.Contains("\\"))
                    {
                        currentUser = currentUser.Substring(3);
                    }

                    HashSet<string> members = new HashSet<string>();
                    members.Add(currentUser.ToUpper());
                    role.Members = members;

                    rolerepo.Add(role);

                    //now log it
                    bool logged = logAction("Role " + role.Title, "Informational");

                    TempData["flash"] = buildFlash("success", "Role Created", "Role has been created");

                    return RedirectToAction("Details", new { id = role.Id });
                }
                else
                {
                    //a role with this title already exists - bail

                    ViewBag.flash = buildFlash("warning", "Role Not Created", "Role with this name alreay exists");
                    return View();
                    //TempData["flash"] = buildFlash("warning", "Role Not Created", "Role with this name alreay exists");
                    //return RedirectToAction("Index");       
                }
            }
            catch
            {
                ViewBag.flash = buildFlash("danger", "Error", "Error Creating Role");

                return View();
            }
        }

        //
        // GET: /Role/Edit/5
        public ActionResult Edit(string id)
        {
            Role role = rolerepo.GetById(id);

            return View(role);
        }

        //
        // POST: /Role/Edit/5
        [HttpPost]
        public ActionResult Edit(Role mod_role)
        {
            try
            {
                //we don't want the role being passed back to get rid of all fields - just the couple that we allow editing on
                Role role = rolerepo.GetById(mod_role.Id);

                role.Title = mod_role.Title;
                role.Body = mod_role.Body;

                rolerepo.Update(role);

                //now log it
                bool logged = logAction("Updated Role " + role.Title, "Informational");

                TempData["flash"] = buildFlash("success", "Role Updated", "Role has been updated");

                //return RedirectToAction("Index");
                return RedirectToAction("Details", new { id = role.Id });
            }
            catch
            {
                ViewBag.flash = buildFlash("danger", "Error", "Error Updating Role");

                return View();
            }
        }

        //
        //POST: /Role/AddMember/5
        // We are adding a new member to membership of this role
        [HttpPost]
        public ActionResult AddMember(string id, string new_member)
        {
            try
            {
                Role role = rolerepo.GetById(id);

                string comment = "";
                string alertType = "info";
                string alertTitle = "Member Added";
                //new_member cannot be null
                if (new_member == "")
                {
                    comment = "Attempt to add null to " + role.Title;
                    alertTitle = "Member NOT added";
                    alertType = "warning";
                }
                else
                {
                    if (role.Members == null)
                    {
                        HashSet<string> members = new HashSet<string>();
                        members.Add(new_member.ToUpper());
                        role.Members = members;
                        rolerepo.Update(role);
                        comment = new_member + " was added to " + role.Title;
                        alertTitle = "Member Added";
                        alertType = "success";
                    }
                    else
                    {
                        if (role.Members.Contains(new_member))
                        {
                            //this test isn't really needed as a HashSet will not accept a duplicate - 
                            //but nice to tell the user they are trying to add a name that already exists
                            comment = new_member + " was already a member of " + role.Title;
                            alertTitle = "Member Already in Role";
                            alertType = "warning";
                        }
                        else
                        {
                            role.Members.Add(new_member.ToUpper());
                            rolerepo.Update(role);
                            comment = new_member + " was added to " + role.Title;
                            alertTitle = "Member Added";
                            alertType = "success";
                        }

                    }
                }

                //now log it
                logAction(comment, "Informational");

                //add flash
                TempData["flash"] = buildFlash(alertType, alertTitle, comment);

                //return RedirectToAction("Index");
                return RedirectToAction("Details", new { id = role.Id });
            }
            catch
            {
                string comment = "Error adding " + new_member + " to this role";

                //create flash
                TempData["flash"] = buildFlash("warning", "Add Member Error", comment);

                //now log it
                logAction(comment, "Error");

                return RedirectToAction("Index");
            }
        }

        //
        //POST: /Role/RemoveMember/5
        // We are removing a member from this role 
        [HttpPost]
        public ActionResult RemoveMember(string id, string old_member)
        {
            try
            {
                Role role = rolerepo.GetById(id);

                old_member = old_member.ToUpper();
                HashSet<string> members = role.Members;

                string comment = "";
                string alertType = "info";

                //go ahead and remove the old member from the list
                var itemToRemove = members.SingleOrDefault(r => r == old_member);
                if (itemToRemove != null)
                {
                    members.Remove(itemToRemove);
                    role.Members = members;
                    rolerepo.Update(role);

                    comment = "Removed " + old_member + " from role " + role.Title;
                    alertType = "success";
                }
                else
                {
                    comment = old_member + " was not found in role " + role.Title;
                    alertType = "warning";
                }

                //now log it
                logAction(comment, "Informational");

                //add flash
                TempData["flash"] = buildFlash(alertType, "Member Removed", comment);

                //return RedirectToAction("Index");
                return RedirectToAction("Details", new { id = role.Id });
            }
            catch
            {
                string comment = "Error removing " + old_member + " from role with id = " + id;

                //create flash
                TempData["flash"] = buildFlash("warning", "Remove Member Error", comment);

                //now log it
                logAction(comment, "Error");

                return RedirectToAction("Index");
            }
        }

        //
        // POST: /Role/Delete
        [HttpPost]
        public ActionResult Delete(string id)
        {
            try
            {
                string comment = "";
                if (isInRole(User.Identity.Name, "Admin"))
                {
                    Role role = rolerepo.GetById(id);
                    string title = role.Title;

                    rolerepo.Delete(id);
                    //now log this          
                    comment = "The " + title + " role has been deleted";
                    logAction(comment, "Informational");

                    TempData["flash"] = buildFlash("success", "Role Deleted", comment);

                    return RedirectToAction("Index");
                }
                else
                {
                    comment = "You have insufficient rights to delete this role";
                    logAction(comment, "Warning");
                    TempData["flash"] = buildFlash("warning", "Insufficient Rights", comment);

                    return RedirectToAction("Index");
                }
            }
            catch
            {
                string comment = "Error deleting role";
                logAction(comment, "Error");
                TempData["flash"] = buildFlash("danger", "Error", comment);

                return RedirectToAction("Index");

            }
        }
    }
}
