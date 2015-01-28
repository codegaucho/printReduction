using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Configuration;
using System.Text;
using System.Net.Mail;
using MongoRepository;
using PrintReduction.Data;
using PrintReduction.Rabbit;

namespace PrintReduction.Controllers
{
    public class InviteController : BaseController
    {
        static MongoRepository<Invite> inviterepo = new MongoRepository<Invite>();

        //given a string, will replace any of our replacement sring with the appropriate value from our ticket
        //we use stringbuilder to avoid the performance problems of normal replaces (which builds a new string each time)
        private string decodedTemplate(Invite invite, string templatestring)
        {
            try
            {
                //{{client}}, {{comment}}, {{db_link}}
                StringBuilder tstr = new StringBuilder(templatestring);
                string dburl = buildURL(null, null, null);
                tstr.Replace("{{db_url}}", dburl);

                //{{db_link}}
                string dblink = "<a href=\"" + dburl + "\">" + dburl + "</a>";
                tstr.Replace("{{db_link}}", dblink);

                //{{client}}
                tstr.Replace("{{client}}", invite.SentBy_EName);

                //{{comment}}
                tstr.Replace("{{comment}}", invite.Comment);

                return tstr.ToString();
            }
            catch
            {
                return templatestring;
            }
        }

        //
        // GET: /Invite/AsJSON/TPMurphy
        // given a lanID, will return all invites sent by this person
        //index collection by UpdatedBy
        [AllowAnonymous]
        public JsonResult AsJSON(string id)
        {
            var result = inviterepo.Where(c => c.UpdatedBy == "AA\\" + id);

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public bool hasFriendTakenPledge(string emailAddress)
        {
            try
            {
                //check to see if this person has taken pledge
                //index to make this more efficient
                MongoRepository<Survey> surveyrepo = new MongoRepository<Survey>();
                var result = surveyrepo.Where(c => c.Client.Email == emailAddress.ToLower());
                return result.Count() > 0;
            }
            catch 
            {
                //is false appropriate to return here?
                return false;
            }
            
        }

        //we are going to try to send out an invite, and will return true if all seems to go well
        public bool sendInvite(Invite invite)
        {
            try
            {
                //try to send message
                string key = "Invite_Friend";
                MongoRepository<Template> templaterepo = new MongoRepository<Template>();
                Template template = templaterepo.First(c => c.Key == key);

                //public bool smtpMailHelper(MailAddressCollection toCollection, MailAddressCollection ccCollection, string subject, string body, bool isHtml, MailAddress from, string priority)
                string subject = decodedTemplate(invite, template.Subject);
                string body = decodedTemplate(invite, template.Body);

                //only passing a single email, but our helper is expecitng a collection
                MailAddressCollection toCollection = new MailAddressCollection();
                toCollection.Add(new MailAddress(invite.SendTo));

                MailAddressCollection ccCollection = new MailAddressCollection();

                //public bool smtpMailHelper(MailAddressCollection toCollection, MailAddressCollection ccCollection, string subject, string body, bool isHtml, MailAddress from, string priority)


                return smtpMailHelper(toCollection, ccCollection, subject, body, true, new MailAddress(invite.SentBy_Email), "Normal");
                
            }
            catch 
            {
                return false;
            }
        }

        //
        // POST: /Invite/Send
        //in the case of the invite, will be ajax, so we are returning a jsonResult
        [HttpPost]
        public JsonResult Send(Invite invite)
        {
            try
            {
                invite.SentDate = DateTime.Now;
                invite.UpdatedBy = User.Identity.Name;

                //SentBy is a more complex user object

                //send invite only if person hasn't taken pledge
                invite.Redundant = hasFriendTakenPledge(invite.SendTo);
                if (invite.Redundant)
                {
                    //person has taken pledge - no need to actually send invite
                    //now log it
                    bool logged = logAction("Invite not needed" + invite.Id, "Informational");

                    //flash data won't do anything as this is json
                    //TempData["flash"] = buildFlash("info", "Already Pledged", "This user has already taken pledge, so we will not spam them with redundant invites");
                }
                else
                {
                    //now attempt to send mail

                    bool inviteSent = sendInvite(invite);
                    invite.Sent = inviteSent;
                    inviterepo.Add(invite);

                    if (inviteSent)
                    {
                        //now log it
                        bool logged = logAction("Sent invite" + invite.Id, "Informational");
                        //flash data won't do anything as this is json
                        //TempData["flash"] = buildFlash("success", "Invite Created", "Invite has been created");
                    }
                    else
                    {
                        //now log it
                        bool logged = logAction("Invite not sent" + invite.Id, "Informational");
                        //flash data won't do anything as this is json
                        //TempData["flash"] = buildFlash("failure", "Invite Not Created", "Invite has not been created");
                    }
                }

                return Json(invite, JsonRequestBehavior.AllowGet);

            }
            catch
            {
                //ViewBag.flash = buildFlash("danger", "Error", "Error Creating Invite");

                //can you just return false, or do you need to return an object?
                return Json(false, JsonRequestBehavior.AllowGet);
            }
        }
    }
}
