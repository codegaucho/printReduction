using System;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoRepository;

// for data annotaions and validations
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace PrintReduction.Data
{
    /*
     * Flash is used to display alerts to the screen
     */
    public class Flash
    {
        public string type { get; set; }
        public string body { get; set; }
        public string title { get; set; }
    }

    /*
     * Log entries are going to be kept in their own collection - Log (this may end if we really get into rabbit MQ)
     * We are also going to toss the log out to rabbit MQ - thus we need an app id and title (get from ARS)
     */
    public class Log : Entity
    {
        public string CreatedBy { get; set; }
        public DateTime Created { get; set; }
        public string Controller { get; set; }
        public string Action { get; set; }
        public string Comment { get; set; }
        public string RefId { get; set; }
        public string AppId { get; set; }
        public string AppTitle { get; set; }
        public string URL { get; set; }
        //added some fields to map better to syslog
        //Severity: Emergency, Alert, Critical, Error, Warning, Notice, Informational, Debug - see http://en.wikipedia.org/wiki/Syslog or RFC5424
        public string Severity { get; set; }
        public string Hostname { get; set; }
        //App-Name - use AppTitle
    }

    /*
     * roles allow us to assign superusers that can work across locations
     */
    public class Role : Entity
    {
        public string Title { get; set; }
        public HashSet<string> Members { get; set; }
        public string Body { get; set; }
    }

    /*
     * MailAddresses are multipart.  Junkmail filters are currently catching things with display name - so we aren't using the DisplayName much
     * but we will store both parts for now (it is also needed for calendar entries)
     */
    public class eMailAddress
    {
        public string Address { get; set; }
        public string DisplayName { get; set; }
    }

    /*
     * A template is used for sending mail, or for providing text blurbs at various points
     * 
     * index:
     * Key
     */
    public class Template : Entity
    {
        public string Key { get; set; }
        public string Description { get; set; }
        public string Priority { get; set; }
        public eMailAddress From { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        //retired, all templates will be html or mime
        //public bool isHTML { get; set; }
    }

    /*
     * a user represents one person - we are going to want to collect a good bit of info regarding one person
     */
    public class User
    {
        public string LanId { get; set; }
        public string Email { get; set; }
        public string EName { get; set; }
        public string Org { get; set; }
        public string Division { get; set; }
        public string Location { get; set; }
        public string AmpBox { get; set; }
    }

    /*
     *  the survey itself
     */
    public class Survey : Entity 
    {
        public User Client { get; set; }
        public int MonthlyAverage { get; set; }
        public string Percentage { get; set; }
        public List<string> PrintImpact { get; set; }
        public List<string> ReduceEmailPrinting { get; set; }
        public List<string> PrintingAgendas { get; set; }
        public List<string> PrintingForEditing { get; set; }
        public List<string> InternetPrinting { get; set; }
        public List<string> PrintingLargeDocuments { get; set; }
        public List<string> ReduceColorPrinting { get; set; }
        public bool EncourageOthers { get; set; }
        public bool StopPrintingOutlookCalendars { get; set; }
        public bool SharePledge { get; set; }
        public bool ShareNumber { get; set; }
        public string Comment { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime Updated { get; set; }
    }

    /*
     * used by partial to allow a user to change their sharing options
     */
    public class SharingOptions
    {
        public string id { get; set; }
        public bool SharePledge { get; set; }
        public bool ShareNumber { get; set; }
    }

    /*
     * 
     */
    public class Invite : Entity
    {
        public string SentBy_Email { get; set; }
        public string SentBy_EName { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime SentDate { get; set; }
        public string SendTo { get; set; }
        public string Comment { get; set; }
        public bool Sent { get; set; }
        public bool Redundant { get; set; }
    }

    /*
     * a caption is used by the caption contest - folks enter a caption for a template, and others can vote on it
     * Key is the Key of the template that is displayed  ( may use templateid instead)
     * 
     * index:
     * Key
     * Key +1 votes -1
     * id +1 votes -1
     */ 
    public class Caption : Entity 
    {
        public string UpdatedBy { get; set; }
        public DateTime Updated { get; set; }
        public string Title { get; set; }
        public string Key { get; set; }
        public string TemplateID { get; set; }
        public HashSet<string> Voters { get; set; }
        public int Votes { get; set; }
    }

    /*
     Forums are used to collect feedback and comments - foster a discussion
     * Key/TemplateID points to the template where we have the the proposal for which we are commenting on
     * Responses holds a list of the responses (and response to responses for this topic
     */

    public class Comment
    {
        public string UpdatedBy { get; set; }
        public DateTime Updated { get; set; }
        public string Body { get; set; }
    }

    public class Forum : Entity
    {
        public string UpdatedBy { get; set; }
        public DateTime Updated { get; set; }

        [Required]
        public string Title { get; set; }
        //public string TemplateID { get; set; }
        public string Key { get; set; }

        [Required]
        public string Body { get; set; }

        public HashSet<string> Voters { get; set; }
        public int Votes { get; set; }
        public List<Comment> Responses { get; set; }
    }

}
