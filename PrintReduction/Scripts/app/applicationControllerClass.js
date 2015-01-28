/*
 * Tom Murphy
 *
 * 04/30/2014 - created
 * 05/01/2014 - added function addAdminNavigator
 *
 *
 *  a dojo object defined to represent the general application
 *
 *
 *
 */
define(["dojo/_base/declare"], function (declare) {
    return declare(null, {

        constructor: function (isAdmin) {
            if (isAdmin) {
                //add admin specific navigation
                this.addAdminNavigator();
            }

            //add the print button navigator
            this.addPrintButtonNavigator();

            //add invite friend to button navigator
            this.addInviteFriendNavigator();

            //add page footer info if available
            this.addContactInfoToPageFooter();
        },

        createFlash: function (targetnode, flashClass, title, body) {
            //targetnode - where to put the alert
            //flashClass - the bootstrap alert class type (example "alert-warning")
            require(["dojo/dom-construct", "dojo/dom-class"], function (domConstruct, domClass) {
                var flash = domConstruct.create("div", null, targetnode, "last");
                domClass.add(flash, ["alert", "alert-dismissable", flashClass]);

                var opts = { "innerHTML": "x", "data-dismiss": "alert", "type": "button" };
                var node = domConstruct.create("button", opts, flash, "last");
                domClass.add(node, "close");

                if (title != null && title != "") {
                    domConstruct.create("h4", { innerHTML: title }, flash, "last");
                }

                domConstruct.create("p", { innerHTML: body }, flash, "last");

            });
        },

        addContactInfoToPageFooter: function () {
            require(["dojo/request/xhr", "dojo/dom-construct"], function (xhr, domConstruct) {
                var url =  dojoConfig.app.path + "Template/ByKeyAsJSON/Contact";
                xhr(url, {
                    handleAs: "json"
                }).then(function (data) {
                    //we have the contact doc as json, now stick this in
                    //From.Address and From.DisplayName

                    //instead of the mailto, replace this with a popup that gives various bits of info about the person - perhaps with an i circle
                    var target = "mailto:" + data.From.Address + "?Subject=Re: " + window.location.href;
                    var title = "Contact " + data.From.DisplayName;
                    var inner = data.From.DisplayName + ", ";
                    domConstruct.create("a", { href: target, title: title, innerHTML: inner }, "page-footer-copy", "first");

                    //test out the i stuff
                    //domConstruct.create("a", {},"page-footer-copy", "first");
                    //<a class="glyphicon glyphicon-info-sign pointer" onclick="userInfoModal.displayUserInfo('@Html.DisplayFor(model => model.PCDC)');"></a>

                });
            });
        },

        addAdminNavigator: function () {
            //going to add a drop down for admin functions to navigator
            require(["dojo/dom-construct", "dojo/dom-class"], function (domConstruct, domClass) {
                var li = domConstruct.create("li", {id: "navlist_item_Admin"}, "navlist", "first");
                domClass.add(li, "dropdown");

                var a = domConstruct.create("a", {"data-toggle": "dropdown", "href": "#", "id": "adminNav", "innerHTML": "Admin"}, li, "last");

                var span = domConstruct.create("span", null, a, "last");
                domClass.add(span, "caret");

                var ul = domConstruct.create("ul", { "aria-labelledby": "adminNav" }, li, "last");
                domClass.add(ul, "dropdown-menu");

                li = domConstruct.create("li", null, ul, "last");
                a = domConstruct.create("a", { innerHTML: "Roles", href: dojoConfig.app.path + "Role" }, li, "last");

                li = domConstruct.create("li", null, ul, "last");
                a = domConstruct.create("a", { innerHTML: "Templates", href: dojoConfig.app.path + "Template" }, li, "last");

                li = domConstruct.create("li", null, ul, "last");
                a = domConstruct.create("a", { innerHTML: "Surveys", href: dojoConfig.app.path + "Survey" }, li, "last");
            });
            
        },

        addInviteFriendNavigator: function () {
            //we want to add an "invite friend" to the navigator, that will fire off a dialog allowing them to choose friends
            require(["dojo/dom-construct", "dojo/dom-class", "dojo/on"], function (domConstruct, domClass, on) {
                //put it as the first button on the right side of the navigator
                //var li = domConstruct.create("li", null, "navbar_right", "first");
                var li = domConstruct.create("li", null, "surveyNav_ul", "last");
                
                var a = domConstruct.create("a", null, li, "last");

                var icon = domConstruct.create("span", null, a, "first");
                domClass.add(icon, ["glyphicon", "glyphicon-bullhorn"]);

                domConstruct.create("span", { innerHTML: " Invite Coworker" }, a, "last");

                //now hook up the click
                on(a, "click", function (e) {
                    if (app.inviteFriendDialog == null) {
                        app.createInviteFriendDialog();

                    } else {
                        app.inviteFriendDialog.show();
                    }
                });
            });
        },

        addPrintButtonNavigator: function () {
            //we want to create a print button on the navigator that will fire off a dialog telling them to not print
            //going to put it as the first element in navbar_right
            require(["dojo/dom-construct", "dojo/dom-class", "dojo/on"], function (domConstruct, domClass, on) {
                //var li = domConstruct.create("li", null, "navbar_right", "first");
                var li = domConstruct.create("li", null, "hello_ul", "first");

                var a = domConstruct.create("a", null, li, "last");

                var icon = domConstruct.create("span", null, a, "first");
                domClass.add(icon, ["glyphicon", "glyphicon-print"]);

                domConstruct.create("span", { innerHTML: " Print" }, a, "last");

                //now hook up the click
                on(a, "click", function (e) {
                    if (app.templateDialog["Print_Button"] == null) {
                        app.createTemplateDialog("Print_Button");

                    } else {
                        app.templateDialog["Print_Button"].show();
                    }
                });
            });
        },

        templateDialog: [],

        createTemplateDialog: function (template) {
            //going to create a dialog that simply displays a template as its content
            var _obj = this;
            //first get json for print button
            require(["dojo/request/xhr", "dijit/Dialog"], function (xhr, Dialog) {
                xhr(dojoConfig.app.path + "Template/ByKeyAsJSON/" + template, {
                    handleAs: "json"
                }).then(function (data) {
                    // now build me a dialog
                    _obj.templateDialog[template] = new Dialog({
                        title: data.Subject,
                        content: data.Body,
                        style: "width: 800px"
                    });

                    //now show it for the first time
                    _obj.templateDialog[template].show();
                });
            });
        },

        inviteFriendDialog: null,

        sendInviteFriendMessage: function () {
            var _obj = this;
            //user has decided to send message, AND recipient has not already received one
            var formElement = document.getElementById("inviteFriendForm");
            //var formData = new FormData(formElement);

            require(["dojo/dom", "dojo/request/xhr"], function (dom, xhr) {
                var postToURL = dojoConfig.app.path + "Invite/Send";
                xhr(postToURL, {
                    method: "POST",
                    //data: formData,
                    data: {
                        SendTo: dom.byId("invite-typeahead").value,
                        SentBy_Email: dom.byId("inviteFriendDialog_SentBy_Email").value,
                        SentBy_EName: dom.byId("inviteFriendDialog_SentBy_EName").value,
                        Comment: dom.byId("inviteFriendDialog_Comment").value
                    },
                    handleAs: "json"
                }).then(function (data) {
                    // write flash so they know what happened
                    var flashClass;
                    var title;
                    var body;
                    if (data.Sent) {
                        flashClass = "alert-success";
                        title = "Invite Sent";
                        body = "An invitation to take the pledge has been sent to " + data.SendTo;
                    } else {
                        if (data.Redundant) {
                            // the user already took pledge
                            flashClass = "alert-info";
                            title = "Invite Not Sent";
                            body = "As this fine user (" + data.SendTo + ") has already taken the pledge, an invite is not needed - but thanks for playing along.";
                        } else {
                            //not sent - why?
                            flashClass = "alert-warning";
                            title = "Invite Not Sent";
                            body = "An invitation to take the pledge has NOT been sent to " + data.SendTo;
                        }
                        
                    }
                    //write to flash
                    _obj.createFlash("flash-placeholder", flashClass, title, body);
                    //now close dialog
                    _obj.inviteFriendDialog.hide();
                }, function (err) {
                    // Handle the error condition
                    alert("error submitting form");
                });
            });
        },

        createInviteFriendDialog: function () {
            //going to give a dialog where we can select a friend whom we are going to send an invite to
            var _obj = this;

            require(["dojo/dom", "dijit/form/Button", "dijit/Dialog", "r2/typeaheadClass", "hogan", "use!typeahead"], function (dom, Button, Dialog, TypeaheadPrep, Hogan, Typeahead) {
                //template for dialog content
                var dc = [
                    '<div class="dijitDialogPaneContentArea" style="height:400px;">',
                    '<form method="post" id="inviteFriendForm">',
                    '<div>Invite <input id="invite-typeahead" name="SendTo" class="form-control from-typeahead"/> to participate in the print reduction pledge.</div>',
                    '<h3>Message to send</h3>',
                    '<div><textarea id="inviteFriendDialog_Comment" name="Comment" rows="8"  class="form-control" placeholder="add your message here"></textarea> </div>',
                    '<div class="hide"><input name="SentBy_Email" id="inviteFriendDialog_SentBy_Email" value="bogus@epa.gov" /><input id="inviteFriendDialog_SentBy_EName" name="SentBy_EName" value="Joe Bogus" />going to fill in from yue-On json</div>',
                    '</div>',

                    '<div class="dijitDialogPaneActionBar" id="inviteFriendDialogActionBar">',
                    //'<button type="submit" class="btn btn-primary btn-sm" id="inviteFriendDialogSend">Send Invite</button>',
                    //'<button type="button" class="btn btn-default btn-sm" id="inviteFriendDialogCancel">Cancel</button>',
                    '</div>',
                    '</form>'        
                ].join('');

                _obj.inviteFriendDialog = new Dialog({
                    title: "Invite Coworker",
                    //content: '<div style="height: 400px;"><div>Invite <input id="invite-typeahead" class="form-control from-typeahead"/> to participate in the print reduction pledge.</div><div>add comment textarea</div></div>',
                    content: dc,
                    style: "width: 500px;"
                });

                //now add cancel and send buttons
                //alternate would be to put the buttons in the template, and then use dojo/dom and dojo/class to locate button and attach an event
                new Button({
                    label: "Send Invite",
                    onClick: function () {
                        //we are now checking to see if they already have a pledge back on the server
                        _obj.sendInviteFriendMessage();   
                    }
                }).placeAt("inviteFriendDialogActionBar", "first");

                new Button({
                    label: "Cancel",
                    onClick: function () {
                        _obj.inviteFriendDialog.hide();
                    }
                }).placeAt("inviteFriendDialogActionBar", "first");

                //now fill in those two fields with the info from yue-on
                
                require(["dojo/request/script"], function (script) {
                    var url = "http://intranet.r02.epa.gov/RestService/rest/userinfo/javascript/lanid/" + dojoConfig.app.userName;
                    script.get(url, {
                        jsonp: "callback"
                    }).then(function (data) {
                        // Do something with the response data
                        dom.byId("inviteFriendDialog_SentBy_Email").value = data.email;
                        dom.byId("inviteFriendDialog_SentBy_EName").value = data.ename;  
                    }, function (err) {
                        // Handle the error condition
                    });
                    // Progress events are not supported
                });

                //template needed for eventual typeahead
                var t = [
                    '<p class="typeahead-address-suggestion-email">{{email}}</p>',
                    '<p class="typeahead-address-suggestion-ename">{{ename}}</p>',
                    '<p class="typeahead-address-suggestion-epaname">{{fullName}}</p>',
                    '<p class="typeahead-address-suggestion-lanid">{{lanId}}</p>'
                ].join('');

                var tt = Hogan.compile(t);

                //need to create a closure for suggestion to pass over to typeahead
                var typeahead_template = {
                    suggestion: function (e) {
                        return tt.render(e);
                    }
                };

                //typeahead stuff
                var typeaheadPrep = new TypeaheadPrep();
                var bloodhound = typeaheadPrep.activeUsers.buildBloodhound();
                bloodhound.initialize();

                var typeahead_onSelect = function (e, datum) {
                    //dom.byId("From_DisplayName").value = datum.ename;
                    //alert("boo");
                }

                //now apply typeahead to from field
                typeaheadPrep.applyTypeahead('#invite-typeahead', bloodhound.ttAdapter(), typeahead_template, typeahead_onSelect, "email");

                //now show dialog for the first time
                _obj.inviteFriendDialog.show();
            });
        }


    });
});