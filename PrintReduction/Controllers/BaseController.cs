using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using System.Net.Mail;
using System.Net.Mime;
using MongoRepository;
using PrintReduction.Data;
using PrintReduction.Rabbit;

namespace PrintReduction.Controllers
{
    [Authorize]
    public class BaseController : Controller
    {
        //build the url a document
        //if controller is null, will return db url
        public String buildURL(string controller, string action, string id)
        {
            try
            {
                string ticketurl = "";
                string protocol = "http://";

                if (Request.Url.Scheme == Uri.UriSchemeHttps)
                    protocol = "https://";

                string port = Request.Url.Port.ToString();
                if (port == null || port == "80" || port == "443")
                    port = "";
                else
                    port = ":" + port;

                // application path returns /website1
                if (Request.ApplicationPath == "/")
                {
                    ticketurl = protocol + Request.Url.Host + port;
                }
                else
                {
                    ticketurl = protocol + Request.Url.Host + port + Request.ApplicationPath;
                }

                if (controller == null)
                {
                    //ticketurl = ticketurl;
                }
                else if (action == null)
                { 
                    ticketurl = ticketurl + "/" + controller;
                }
                else if (id == null)
                {
                    ticketurl = ticketurl + "/" + controller + "/" + action;
                }
                else
                {
                    ticketurl = ticketurl + "/" + controller + "/" + action + "/" + id;
                }

                return ticketurl;
            }
            catch
            {
                return "error building url";
            }
        }

        //a public method that tells us if user is in role
        //needed in all controllers, so it is part of base
        public Boolean isInRole(string user, string role)
        {
            try
            {
                //we want to correct for user names in the form AA\tpmurphy
                if (user.Contains("\\"))
                {
                    user = user.Substring(3);
                }

                MongoRepository<Role> rolerepo = new MongoRepository<Role>();
                var role_doc = rolerepo.Where(c => c.Title == role).First();

                //don't need to convert all members to upper, as we are doing this as we add them
                return role_doc.Members.Contains(user.ToUpper());
            }
            catch
            {
                return false;
            }
        }

        //a public method that returns the array of roles held by a user
        //if no user passed in, will return the roles for the current user
        public List<string> userRoles(string user)
        {
            try
            {
                if (user == null)
                {
                    user = User.Identity.Name;
                }

                if (user.Contains("\\"))
                {
                    user = user.Substring(3);
                }

                user = user.ToUpper();

                List<string> roles = new List<string>();

                MongoRepository<Role> rolerepo = new MongoRepository<Role>();

                foreach (Role role_doc in rolerepo)
                {
                    if (role_doc.Members.Contains(user))
                    {
                        roles.Add(role_doc.Title);
                    }

                }

                return roles;

            }
            catch
            {
                return new List<string>();
            }
        }

        public Boolean doesAdminRoleExist()
        {
            try
            {
                MongoRepository<Role> rolerepo = new MongoRepository<Role>();
                var role_doc = rolerepo.Where(c => c.Title == "Admin").First();

                //what happens if no role matching this???

                return (role_doc != null);

            }
            catch
            {
                return false;
            }
        }

        //rather than building the log in each action, we are going to handle it here and just pass the parameters
        public bool logAction(string comment, string severity)
        {
            try
            {
                Log log = new Log()
                {
                    CreatedBy = User.Identity.Name,
                    Created = DateTime.Now,
                    Controller = RouteData.Values["controller"].ToString(),
                    Action = RouteData.Values["action"].ToString(),
                    RefId = RouteData.Values["id"].ToString(),
                    Comment = comment,
                    URL = Request.Url.ToString(),
                    //also Request.UserHostAddress, Request.UserHostName, ...
                    //AppTitle = WebConfigurationManager.AppSettings["AppTitle"].ToString(),
                    //AppId = WebConfigurationManager.AppSettings["AppId"].ToString(),

                    Severity = severity
                };

                //at this stage we are storing it to database AND sending it to rabbit - this may change
                //best would be if we could pick the rabbit info up from the configuration somewhere
                //we could have a function in RabbitMQ's controller that would return if it were in effect or not.
                MongoRepository<Log> logrepo = new MongoRepository<Log>();
                logrepo.Add(log);

                //and also (or maybe only) send it to rabbit mq
                bool logged = sendToRabbitMQ("log", log);

                return logged;
            }
            catch
            {
                return false;
            }
        }

        public Flash buildFlash(string flashtype, string title, string body)
        {
            try
            {
                Flash flash = new Flash()
                {
                    type = flashtype,
                    title = title,
                    body = body
                };

                return flash;
            }
            catch
            {
                return null;
            }
        }

        //
        // will take our log and toss it to rabbit
        // key is appended to parkingPass. to create the route key.  We typically use "log", but could be something else
        public bool sendToRabbitMQ(string key, Log log)
        {
            try
            {
                RabbitProducer rabbitProducer = new RabbitProducer();
                var serializer = new JavaScriptSerializer();
                string payload = serializer.Serialize(log);
                return rabbitProducer.createMessage(key, payload);
            }
            catch
            {
                return false;
            }
        }

        //
        // same as above, but will be expecting a Dictionary (Dictionary is prefered over Hashtable)
        // for those cases where we aren't already building a log - and do not need to save it to the log collection
        // this will let us use anything and toss it to rabbit
        // key is appended to parkingPass. to create the route key.  We typically use "log", but could be something else
        public bool sendToRabbitMQ(string key, Dictionary<string, string> log)
        {
            try
            {
                RabbitProducer rabbitProducer = new RabbitProducer();
                var serializer = new JavaScriptSerializer();
                string payload = serializer.Serialize(log);
                return rabbitProducer.createMessage(key, payload);
            }
            catch
            {
                return false;
            }
        }


        //going to try to send mail
        //Very similar to what was used in pcbump, but we had a complex From in that one
        //and a Colleciton of mail addresses for the to and cc
        //the complex from ran afoul of the junk mail filter, so a simple email address is now used
        //warning - befre using - test the toCollection and cccolleciton as List vs the current mailAddressCollection - be nicer to keep things simple
        public bool smtpMailHelper(MailAddressCollection toCollection, MailAddressCollection ccCollection, string subject, string body, bool isHtml, MailAddress from, string priority)
        {
            try
            {
                SmtpClient smtpClient = new SmtpClient("smtp.epa.gov", 25);

                MailMessage mail = new MailMessage();

                if (from == null)
                {
                    mail.From = new MailAddress("murphy.tom@epa.gov");
                }
                else
                {
                    //Junk mail filter picks it up if we use a display name in the field, so for now create new address from just the email
                    mail.From = new MailAddress(from.Address);
                }

                foreach (MailAddress to in toCollection)
                {
                    mail.To.Add(to);
                }

                foreach (MailAddress cc in ccCollection)
                {
                    mail.CC.Add(cc);
                }

                mail.Subject = subject;
                mail.Body = body;
                mail.IsBodyHtml = isHtml;
                if (priority == "High")
                    mail.Priority = MailPriority.High;
                else if (priority == "Low")
                    mail.Priority = MailPriority.Low;
                else
                    mail.Priority = MailPriority.Normal;

                smtpClient.Send(mail);
                return true;
            }
            catch
            {
                return false;
            }
        }

        //
        // similar to abve, but will send a meeting invite
        public bool smtpMeetingHelper(MailAddressCollection toCollection, MailAddressCollection ccCollection, string subject, MailAddress from, string priority, DateTime startDate, DateTime endDate, string location, string summary)
        {
            //get from pcbump when we need it
            return true;
        }
	}
}