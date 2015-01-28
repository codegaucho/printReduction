using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MongoRepository;
using PrintReduction.Data;

namespace PrintReduction.Controllers
{
    public class HomeController : BaseController
    {
        //
        // GET: /Home/
        public ActionResult Index()
        {
            MongoRepository<Template> templaterepo = new MongoRepository<Template>();

            ViewBag.isAdmin = isInRole(User.Identity.Name, "Admin");

            
                Template template = null;
                string key = "Welcome";

                if (templaterepo.Exists(c => c.Key == key))
                {
                    template = templaterepo.First(c => c.Key == key);
                }
                else
                {
                    template = new Template()
                    {
                        Subject = "Welcome",
                        Body = "A custom Welcome page has not been created for this <strong>application</strong> - you can create one under Admin - Templates"
                    };
                }
                return View(template);

        }

        //awful way to do this - but don't know how else to see if 
        public bool hasKey(string key) 
        {
            try
            {
                MongoRepository<Template> templaterepo = new MongoRepository<Template>();

                var template = templaterepo.Where(c => c.Key == key).First();

                return (template != null);
            }
            catch
            {
                return false;

            }
        
        }

        //
        // GET: /Home/Graph/
        public ActionResult Graph(string id)
        {
            MongoRepository<Template> templaterepo = new MongoRepository<Template>();

            Template template = new Template()
            {
                Subject = "",
                Body = ""
            };

            string key = "Graph_" + id;

            if (hasKey(key))
            {
                template = templaterepo.First(c => c.Key == key);
            }

            return View(template);
        }

        //
        // GET: /Home/DualGraph/
        public ActionResult DualGraph(string id)
        {
            MongoRepository<Template> templaterepo = new MongoRepository<Template>();

            Template template = new Template()
            {
                Subject = "",
                Body = ""
            };

            string key = "DualGraph_" + id;

            if (hasKey(key))
            {
                template = templaterepo.First(c => c.Key == key);
            }

            return View(template);
        }

	}
}