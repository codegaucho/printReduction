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
    public class CaptionController : BaseController
    {
        static MongoRepository<Caption> captionrepo = new MongoRepository<Caption>();

        //
        // GET: /Caption/AsJSON/7
        // 
        [AllowAnonymous]
        public JsonResult AsJSON(string id)
        {
            var caption = captionrepo.GetById(id);

            return Json(caption, JsonRequestBehavior.AllowGet);
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
            var result = captionrepo.Where(c => c.Key == id).OrderByDescending(c => c.Votes);

            return Json(result, JsonRequestBehavior.AllowGet);

        }

        //
        // POST: /Caption/Create
        // 
        [HttpPost]
        public ActionResult Create(Caption caption)
        {
            try
            {
                if (caption.Title != null)
                {
                    caption.Updated = DateTime.Now;

                    //strip off the AA and set case
                    string user = User.Identity.Name;
                    if (user.Contains("\\"))
                    {
                        user = user.Substring(3).ToLower();
                    }
                    caption.UpdatedBy = user;

                    caption.Votes = 1;

                    HashSet<string> voters = new HashSet<string>();
                    voters.Add(user);

                    caption.Voters = voters;

                    captionrepo.Add(caption);

                    //now log it
                    bool logged = logAction("Created Caption " + caption.Key, "Informational");

                    TempData["flash"] = buildFlash("success", "Caption Created", "Caption has been created");
                }
                else 
                {
                    TempData["flash"] = buildFlash("oops", "Caption NOT Created", "Your caption was blank");
                }
                

                return RedirectToAction("CaptionContest", "Template", new { id = caption.Key });
            }
            catch 
            {
                ViewBag.flash = buildFlash("danger", "Error", "Error Creating Template");

                return View();
            }
        }

        //
        // POST: /Caption/CreateAsync
        //
        //going to be creating asynchronously - and returning json
        [HttpPost]
        public JsonResult CreateAsync(Caption caption)
        {
            try
            {
                caption.Updated = DateTime.Now;

                //strip off the AA and set case
                string user = User.Identity.Name;
                if (user.Contains("\\"))
                {
                    user = user.Substring(3).ToLower();
                }
                caption.UpdatedBy = user;

                caption.Votes = 1;

                HashSet<string> voters = new HashSet<string>();
                voters.Add(user);

                caption.Voters = voters;

                captionrepo.Add(caption);

                //now log it
                bool logged = logAction("Created Caption " + caption.Key, "Informational");

                return Json(caption);

            }
            catch
            {
                //is there a better thing to pass back.  Perhaps json {"error": "no template found"} or some such
                return Json(null);
            }
        }

        //
        // POST: /Caption/Vote/5
        // 
        public ActionResult Vote(string id)
        {
            try
            {
                Caption caption = captionrepo.GetById(id);

                caption.Votes += 1;

                //strip off the AA and set case
                string user = User.Identity.Name;
                if (user.Contains("\\"))
                {
                    user = user.Substring(3).ToLower();
                }
                
                caption.Voters.Add(user);

                captionrepo.Update(caption);

                //now log it
                bool logged = logAction("Vote " + id, "Informational");

                TempData["flash"] = buildFlash("success", "Vote Registered", "Your vote has been captured");

                return RedirectToAction("CaptionContest", "Template", new { id = caption.Key });
            }
            catch
            {
                ViewBag.flash = buildFlash("danger", "Error", "Voting Irregularity");

                return View();
            }
        }

        //
        // GET: /Caption/Delete/5
        // usually we don't want a get for a delete, but in this case, as it is only a caption and such ...
        public ActionResult Delete(string id)
        {
            try
            {
                string comment = "";
                if (isInRole(User.Identity.Name, "Admin"))
                {
                    Caption caption = captionrepo.GetById(id);
                    string title = caption.Key;
                    string key = caption.Key;

                    captionrepo.Delete(id);
                    //now log this          
                    comment = "The " + title + " caption has been deleted";
                    logAction(comment, "Informational");

                    TempData["flash"] = buildFlash("success", "Caption Deleted", comment);

                    return RedirectToAction("CaptionContest", "Template", new { id = key });
                }
                else
                {
                    comment = "You have insufficient rights to delete this caption";
                    logAction(comment, "Warning");
                    TempData["flash"] = buildFlash("warning", "Insufficient Rights", comment);

                    return RedirectToAction("Index");
                }
            }
            catch
            {
                string comment = "Error deleting caption";
                logAction(comment, "Error");
                TempData["flash"] = buildFlash("danger", "Error", comment);

                return RedirectToAction("Index");

            }
        }

        



        /* Anything below here has not yet been implemented */


        //
        // GET: /Caption/
        public ActionResult Index()
        {
            return View();
        }

        //
        // GET: /Caption/Details/5
        public ActionResult Details(int id)
        {
            return View();
        }

        //
        // GET: /Caption/Create
        public ActionResult Create()
        {
            return View();
        }



        //
        // GET: /Caption/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        //
        // POST: /Caption/Edit/5
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


        
    }
}
