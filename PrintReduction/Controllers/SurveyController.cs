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
    public class SurveyController : BaseController
    {

        static MongoRepository<Survey> surveyrepo = new MongoRepository<Survey>();

        public bool isMySurvey(Survey survey)
        {
            string user = User.Identity.Name;
            string owner = "";
            if (survey.Client.LanId != null)
            {
                owner = survey.Client.LanId.ToUpper();
            }

            //we want to correct for user names in the form AA\tpmurphy
            if (user.Contains("\\"))
            {
                user = user.Substring(3).ToUpper();
            }

            return (user == owner);
        }

        // will return the survey for current user, or else return null
        public Survey getMySurvey()
        {
            try
            {
                string user = User.Identity.Name;
                //we want to correct for user names in the form AA\tpmurphy
                if (user.Contains("\\"))
                {
                    user = user.Substring(3).ToUpper();
                }

                Survey survey = surveyrepo.First(c => c.Client.LanId.ToUpper() == user);

                return survey;
            }
            catch
            {
                return null;
            }
        }

        //
        // GET: /Survey/AsJSON/7 - for specific survey
        // GET: /Survey/AsJSON - for all surveys
        [AllowAnonymous]
        public JsonResult AsJSON(string id)
        {
            if (id == null)
            {
                //return all surveys
                return Json(surveyrepo, JsonRequestBehavior.AllowGet);
            }
            else
            {
                //returning a specific survey
                var survey = surveyrepo.GetById(id);

                return Json(survey, JsonRequestBehavior.AllowGet);
            }
            
        }

        //
        // GET: /Survey/ByLocationAsJSON/NY - return all surveys for a specific location
        //index database by client.Location
        [AllowAnonymous]
        public JsonResult ByLocationAsJSON(string id)
        {
            var result = surveyrepo.Where(c => c.Client.Location == id);

            return Json(result, JsonRequestBehavior.AllowGet);

        }

        //
        // GET: /Survey/LocationListAsJSON - return list of all locations in the database
        //index database by client.Location
        [AllowAnonymous]
        public JsonResult LocationListAsJSON()
        {
            var result = surveyrepo.Select(c => c.Client.Location).Distinct();

            return Json(result, JsonRequestBehavior.AllowGet);

        }

        //
        // GET: /Survey/DivisionListAsJSON - return list of all divisions in the database
        //index database by client.Division
        [AllowAnonymous]
        public JsonResult DivisionListAsJSON()
        {
            var result = surveyrepo.Select(c => c.Client.Division).Distinct();

            return Json(result, JsonRequestBehavior.AllowGet);

        }

        //
        // GET: /Survey/ByDivisionAsJSON/NY - return all surveys for a specific location
        //index database by client.Org
        [AllowAnonymous]
        public JsonResult ByDivisionAsJSON(string id)
        {
            var result = surveyrepo.Where(c => c.Client.Org.Contains(id));

            return Json(result, JsonRequestBehavior.AllowGet);

        }

        //
        // GET: /Survey/
        [AllowAnonymous]
        public ActionResult Index()
        {

            ViewBag.flash = TempData["flash"];
            bool isAdmin = isInRole(User.Identity.Name, "Admin");
            ViewBag.isAdmin = isAdmin;

            //give it a bogus search just to var the variable
            var result = surveyrepo.Where(s => s.Client.EName == "bobo");

            if (isAdmin)
            { 
                //send all - use OrderBy
                result = surveyrepo.OrderBy(s => s.Client.EName);
            }
            else 
            {
                //do where user has checked off Share Pledge
                result = surveyrepo.Where(c => c.SharePledge == true).OrderBy(s => s.Client.EName);
            }

            return View(result);
        }

        //
        // GET: /Survey/Details/5
        //ViewBag.id and ViewBag.controller
        public ActionResult Details(string id)
        {
            try 
            {
                var survey = surveyrepo.GetById(id);
                //Survey survey = surveyrepo.GetById(id);

                bool isAdmin = isInRole(User.Identity.Name, "Admin");
                ViewBag.isAdmin = isAdmin;
                ViewBag.isMySurvey = isMySurvey(survey);

                //we need to set to ViewBag properties to have the delete button, add plate, and remove plate buttons work
                ViewBag.id = survey.Id;
                ViewBag.controller = RouteData.Values["controller"].ToString();

                return View(survey);
            }
            catch 
            {
                Flash flash = new Flash()
                {
                    type = "warning",
                    title = "Survey Not Found",
                    body = "No survey with id of " + id + " has been found in the database"
                };

                TempData["flash"] = flash;

                return RedirectToAction("Index");
            }
            
        }

        //
        // GET: /Survey/MySurvey
        // will return the current users ticket, if it exists, otherwise start new one
        public ActionResult MySurvey()
        {

            Survey survey = getMySurvey();

            if (survey == null)
            {
                string comment = "No survey for you has been found - please create one";
                TempData["flash"] = buildFlash("warning", "No Survey Found", comment);
                //ViewBag.flash = TempData["flash"];

                return RedirectToAction("Create");
            }
            else
            {
                bool isAdmin = isInRole(User.Identity.Name, "Admin");
                ViewBag.isAdmin = isAdmin;
                ViewBag.isMySurvey = isMySurvey(survey);

                //we need to set to ViewBag properties to have the delete button, add plate, and remove plate buttons work
                ViewBag.id = survey.Id;
                ViewBag.controller = RouteData.Values["controller"].ToString();

                return View("Details", survey);
            }

        }

        //
        // GET: /Survey/Create
        public ActionResult Create()
        {
            return View(
                new Survey() {
                    //they chaned their mind and don't want these checked by default
                    //ShareNumber = true,
                    //SharePledge = true
                }
            );

        }

        //
        // POST: /Survey/Create
        [HttpPost]
        public ActionResult Create(Survey survey)
        {
            try
            {
                survey.Updated = DateTime.Now;
                survey.UpdatedBy = User.Identity.Name;

                surveyrepo.Add(survey);

                //now log it
                bool logged = logAction("Created Survey " + survey.Id, "Informational");

                TempData["flash"] = buildFlash("success", "Survey Created", "Survey has been created");

                return RedirectToAction("Display", "Template", new { id = "Post_Submit_Pledge" });

                //return RedirectToAction("Index");
            }
            catch
            {
                ViewBag.flash = buildFlash("danger", "Error", "Error Creating Survey");

                return View();
            }
        }

        //
        //GET: /Survey/Edit/id
        public ActionResult Edit(string id)
        {
            Survey survey = surveyrepo.GetById(id);

            return View(survey);
        }

        //
        // POST: /Survey/Edit
        // Would have prefered using [AllowHTML] on just the body, rather than disabling validation for this action
        // but as this action is an admin only action, we should be OK
        [ValidateInput(false)]
        [HttpPost]
        public ActionResult Edit(Survey survey)
        {
            try
            {
                surveyrepo.Update(survey);

                //now log it
                bool logged = logAction("Updated Survey " + survey.Id, "Informational");

                TempData["flash"] = buildFlash("success", "Survey Updated", "Survey has been updated");

                return RedirectToAction("Index");
            }
            catch
            {
                ViewBag.flash = buildFlash("danger", "Error", "Error Updating Survey");

                return View();
            }
        }

        //
        // GET: /Survey/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }


        // POST: /Survey/SharingOptions
        [HttpPost]
        public ActionResult SharingOptions(string id, Survey survey_sharing)
        {
            try
            {
                Survey survey = surveyrepo.GetById(id);
                survey.ShareNumber = survey_sharing.ShareNumber;
                survey.SharePledge = survey_sharing.SharePledge;

                surveyrepo.Update(survey);

                //now log this        
                string comment = "Your pledge sharing options have been updated to:  SharePledge = " + survey.SharePledge.ToString() + ", ShareNumber = " + survey.ShareNumber.ToString();
                logAction(comment, "Informational");

                //set flash
                TempData["flash"] = buildFlash("success", "Sharing Options Updated", comment);

                //return somewhere
                return RedirectToAction("Details", new { id = id });
            }
            catch 
            { 
                //set flash
                string failcomment = "Your attempt to change Sharing Options has failed";
                TempData["flash"] = buildFlash("danger", "Failed to change Sharing Options", failcomment);

                //return somewhere
                return RedirectToAction("Index");
            }
        }
          
        //
        // POST: /Survey/Delete
        [HttpPost]
        public ActionResult Delete(string id)
        {
            try
            {
                string comment = "";
                if (isInRole(User.Identity.Name, "Admin"))
                {
                    Survey survey = surveyrepo.GetById(id);
                    string title = survey.UpdatedBy;

                    surveyrepo.Delete(id);
                    //now log this          
                    comment = title + "'s pledge has been deleted";
                    logAction(comment, "Informational");

                    TempData["flash"] = buildFlash("success", "Pledge Deleted", comment);

                    return RedirectToAction("Index");
                }
                else
                {
                    comment = "You have insufficient rights to delete this pledge";
                    logAction(comment, "Warning");
                    TempData["flash"] = buildFlash("warning", "Insufficient Rights", comment);

                    return RedirectToAction("Index");
                }
            }
            catch
            {
                string comment = "Error deleting pledge";
                logAction(comment, "Error");
                TempData["flash"] = buildFlash("danger", "Error", comment);

                return RedirectToAction("Index");

            }
        }

    }
}
