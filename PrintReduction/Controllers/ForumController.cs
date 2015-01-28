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
    public class ForumController : BaseController
    {
        static MongoRepository<Forum> forumrepo = new MongoRepository<Forum>();

        //
        // GET: /Forum/AsJSON/7
        // 
        [AllowAnonymous]
        public JsonResult AsJSON(string id)
        {
            var forum = forumrepo.GetById(id);

            return Json(forum, JsonRequestBehavior.AllowGet);
        }


        //
        // GET: /Caption/ByKeyAsJSON/About - return all captions for a given key, ordered by votes -1
        //
        // 
        //index 
        // key 1, votes -1
        [AllowAnonymous]
        public JsonResult ByKeyAsJSON(string id)
        {
            var result = forumrepo.Where(c => c.Key == id).OrderByDescending(c => c.Votes);

            return Json(result, JsonRequestBehavior.AllowGet);

        }

        //
        // POST: /Forum/Create
        // 
        [HttpPost]
        public ActionResult Create(Forum forum)
        {
            try
            {
                if (forum.Title != null)
                {
                    forum.Updated = DateTime.Now;

                    //strip off the AA and set case
                    string user = User.Identity.Name;
                    if (user.Contains("\\"))
                    {
                        user = user.Substring(3).ToLower();
                    }
                    forum.UpdatedBy = user;

                    forum.Votes = 1;

                    HashSet<string> voters = new HashSet<string>();
                    voters.Add(user);

                    forum.Voters = voters;

                    forumrepo.Add(forum);

                    //now log it
                    bool logged = logAction("Forum topic created " + forum.Key, "Informational");

                    TempData["flash"] = buildFlash("success", "Forum topic Created", "Forum Topic has been created");
                }
                else
                {
                    TempData["flash"] = buildFlash("oops", "Forum topic NOT Created", "Your title was blank");
                }


                return RedirectToAction("Forum", "Template", new { id = forum.Key });
            }
            catch
            {
                ViewBag.flash = buildFlash("danger", "Error", "Error Creating Forum topic");

                return View();
            }
        }

        //
        // POST: /Forum/AddComment/id
        // 
        [HttpPost]
        public ActionResult AddComment(string id, Comment response) 
        {
            try
            {
                Forum forum = forumrepo.GetById(id);

                response.Updated = DateTime.Now;

                //strip off the AA and set case
                string user = User.Identity.Name;
                if (user.Contains("\\"))
                {
                    user = user.Substring(3).ToLower();
                }
                response.UpdatedBy = user;

                if (forum.Responses == null)
                { 
                    //adding first response
                    List<Comment> responses = new List<Comment>();
                    responses.Add(response);
                    forum.Responses = responses;
                }
                else
                {
                    forum.Responses.Add(response);
                }

                forumrepo.Update(forum);

                string comment = user + " commented on this forum";
                string alertTitle = "Comment Added";
                string alertType = "success";

                //now log it
                logAction(comment, "Informational");

                //add flash
                TempData["flash"] = buildFlash(alertType, alertTitle, comment);

                //return RedirectToAction("Details", new { id = id });
                return RedirectToAction("Forum", "Template", new { id = forum.Key });
            }
            catch
            {
                string comment = "Error adding comment to this forum";

                //create flash
                TempData["flash"] = buildFlash("warning", "Add Comment Error", comment);

                //now log it
                logAction(comment, "Error");

                return RedirectToAction("Index");
            }
        }

        //
        // POST: /Forum/Vote/5
        // 
        public ActionResult Vote(string id)
        {
            try
            {
                Forum forum = forumrepo.GetById(id);

                forum.Votes += 1;

                //strip off the AA and set case
                string user = User.Identity.Name;
                if (user.Contains("\\"))
                {
                    user = user.Substring(3).ToLower();
                }

                forum.Voters.Add(user);

                forumrepo.Update(forum);

                //now log it
                bool logged = logAction("Vote " + id, "Informational");

                TempData["flash"] = buildFlash("success", "Vote Registered", "Your vote has been captured");

                return RedirectToAction("Forum", "Template", new { id = forum.Key });
            }
            catch
            {
                ViewBag.flash = buildFlash("danger", "Error", "Voting Irregularity");

                //return View();
                //but what if not having an id was the problem??
                return RedirectToAction("Forum", "Template", new { id = id });
            }
        }



        /* Anything below here has not yet been implemented */

        //
        // GET: /Forum/
        public ActionResult Index()
        {
            return View();
        }

        //
        // GET: /Forum/Details/5
        public ActionResult Details(int id)
        {
            return View();
        }

        //
        // GET: /Forum/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        //
        // POST: /Forum/Edit/5
        [HttpPost]
        public ActionResult Edit(int id, FormCollection collection)
        {
            try
            {
                // TODO: Add update logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }

        //
        // GET: /Forum/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        //
        // POST: /Forum/Delete/5
        [HttpPost]
        public ActionResult Delete(int id, FormCollection collection)
        {
            try
            {
                // TODO: Add delete logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }
    }
}
