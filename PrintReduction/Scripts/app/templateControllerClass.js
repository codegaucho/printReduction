/*
 * Tom Murphy
 *
 * 05/13/2014 - created
 *
 *
 *  a dojo object defined to represent the template
 *
 *
 *
 */
define(["dojo/_base/declare"], function (declare) {
    return declare(null, {

        constructor: function () {
            //any constructor?
        },

        strLeft: function (sourceStr, keyStr) {
            return (sourceStr.indexOf(keyStr) == -1 | keyStr == '') ? '' : sourceStr.split(keyStr)[0];
        },

        strRight: function (sourceStr, keyStr) {
            idx = sourceStr.indexOf(keyStr);
            return (idx == -1 | keyStr == '') ? '' : sourceStr.substr(idx + keyStr.length);
        },

        read: function () {
            var _obj = this;

        },

        create: function () {
            var _obj = this;

            _obj._createEdit();
        },

        edit: function () {
            var _obj = this;
            _obj._createEdit();
        },

        _createEdit: function () {
            //the functions common to both create and edit

            //attach editor to body
            require(["use!tinymce", "dojo/domReady!"], function (tinymce) {
                tinymce.init({
                    selector: 'textarea',
                    plugins: [
                            "advlist autolink lists link image charmap print preview anchor",
                            "searchreplace visualblocks code fullscreen",
                            "insertdatetime media table contextmenu paste"
                    ],
                    toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
                    autosave_ask_before_unload: false,
                    max_height: 200,
                    min_height: 160,
                    height: 180
                });
            });
        },

        index: function () {
        },

        buildCaptionResultsTable: function (data, targetnode, isAdmin) {
            var _obj = this;
            //given data, and a targetnode, will build our table of results
            require(["dojo/_base/array", "dojo/dom", "dojo/dom-construct", "dojo/dom-class", "dojo/on"], function (array, dom, domConstruct, domClass, on) {
                //domConstruct.create("div", null, win.body(), "first");
                //domClass.add("someNode", "newClass");
                var table;
                var thead;
                var tbody;
                var tr;
                var th;
                var td;
                var button;
                var span;

                table = domConstruct.create("table", null, targetnode, "last");
                domClass.add(table, ["table", "table-striped", "table-hover"]);

                thead = domConstruct.create("thead", null, table, "last");
                tr = domConstruct.create("tr", null, thead, "last");
                th = domConstruct.create("th", { innerHTML: "#" }, tr, "last");
                th = domConstruct.create("th", { innerHTML: "Caption" }, tr, "last");
                th = domConstruct.create("th", { innerHTML: "Captioner" }, tr, "last");
                th = domConstruct.create("th", { innerHTML: "Votes" }, tr, "last");
                th = domConstruct.create("th", { innerHTML: "Unique Voters" }, tr, "last");

                //caption contest complete, don't allow votes
                //th = domConstruct.create("th", { innerHTML: "Vote" }, tr, "last");

                if (isAdmin) {
                    th = domConstruct.create("th", { innerHTML: "Delete" }, tr, "last");
                }

                tbody = domConstruct.create("tbody", null, table, "last");
                array.forEach(data, function (item, i) {
                    tr = domConstruct.create("tr", null, tbody, "last");
                    td = domConstruct.create("td", { innerHTML: i + 1 }, tr, "last");
                    td = domConstruct.create("td", { innerHTML: item.Title }, tr, "last");
                    td = domConstruct.create("td", { innerHTML: item.UpdatedBy }, tr, "last");
                    td = domConstruct.create("td", { innerHTML: item.Votes }, tr, "last");
                    td = domConstruct.create("td", { innerHTML: item.Voters.length }, tr, "last");

                    /*
                    //caption contest over, so we are not adding the vote button
                    td = domConstruct.create("td", null, tr, "last");

                    //now build button in last td
                    button = domConstruct.create("button", {type: "button"}, td, "last");
                    domClass.add(button, ["btn", "btn-sm"]);
                    span = domConstruct.create("span", null, button, "last");
                    domClass.add(span, ["glyphicon", "glyphicon-heart"]);
                    span = domConstruct.create("span", { innerHTML: " I Like" }, button, "last");

                    //now connect the on click
                    on(button, "click", function (evt) {
                        location.assign(dojoConfig.app.path + "Caption/Vote/" + item.Id);
                    });
                    */

                    if (isAdmin) {
                        td = domConstruct.create("td", null, tr, "last");

                        //now build delete button
                        button = domConstruct.create("button", { type: "button" }, td, "last");
                        domClass.add(button, ["btn", "btn-danger", "btn-sm"]);
                        span = domConstruct.create("span", null, button, "last");
                        domClass.add(span, ["glyphicon", "glyphicon-trash"]);
                        span = domConstruct.create("span", { innerHTML: " Delete" }, button, "last");

                        //now connect the on click
                        on(button, "click", function (evt) {
                            //this is a get - not usually what we want from our deletes - but as we are checking for admin and this is only a caption, ...
                            //add an "are you sure?
                            location.assign(dojoConfig.app.path + "Caption/Delete/" + item.Id);
                        });
                    }
                });

                
            });
        },

        getHumanDate: function (msdate) {
            try {
                //given a ms date "/Date(1409232304629)/", will return a human readable version
                var _obj = this;
                //get right of /Date(
                msdate = _obj.strRight(msdate, "(");

                //get left of )/
                msdate = _obj.strLeft(msdate, ")");

                //turn into date object
                var d = new Date(parseInt(msdate));

                return d.toLocaleDateString();
            } catch (e) {
                return "";
            }
        },

        buildForumComment: function(item, target) {
            var _obj = this;
            require(["dojo/dom", "dojo/dom-construct", "dojo/dom-class"], function (dom, domConstruct, domClass) {
                var media = domConstruct.create("div", null, target, "last");
                domClass.add(media, "media");

                //right now we are pointing them to Yue-On's tool for adding an AD photo
                //in long run, open the users ConnectR2 info
                var a = domConstruct.create("a", { href: "https://x0202tnythnetpd.aa.ad.epa.gov/adservice/Home/Login?ReturnUrl=%2fadservice%2fPictures", target: "_blank" }, media, "last");
                domClass.add(a, "pull-left");

                //replace the img with the users AD image
                var src = "https://x0202tnythnetpd.aa.ad.epa.gov/adservice/api/users/ADImage/" + item.UpdatedBy;
                var img = domConstruct.create("img", { src: src }, a, "last");
                domClass.add(img, "media-object");

                var body = domConstruct.create("div", {innerHTML: item.Body}, media, "last");
                domClass.add(body, "media-body");

                var by = domConstruct.create("div", { innerHTML: item.UpdatedBy + " - " + _obj.getHumanDate(item.Updated) }, body, "first");
                //domClass.add(by, "pull-right");
            });
        },

        buildForumItem: function (item, target, isAdmin, isRoot) {
            var _obj = this;
            require(["dojo/_base/array", "dojo/dom", "dojo/dom-construct", "dojo/dom-class", "dojo/on"], function (array, dom, domConstruct, domClass, on) {
                var media = domConstruct.create("li", null, target, "last");
                domClass.add(media, "media");

                //right now we are pointing them to Yue-On's tool for adding an AD photo
                //in long run, open the users ConnectR2 info
                var a = domConstruct.create("a", { href: "https://x0202tnythnetpd.aa.ad.epa.gov/adservice/Home/Login?ReturnUrl=%2fadservice%2fPictures", target:"_blank" }, media, "last");
                domClass.add(a, "pull-left");

                //replace the img with the users AD image
                var src = "https://x0202tnythnetpd.aa.ad.epa.gov/adservice/api/users/ADImage/" + item.UpdatedBy;
                var img = domConstruct.create("img", { src: src }, a, "last");
                domClass.add(img, "media-object");

                var body = domConstruct.create("div", null, media, "last");
                domClass.add(body, "media-body");

                if (isRoot) {
                    //cause comments don't have a title
                    var h4 = domConstruct.create("h4", { innerHTML: item.Title }, body, "first");
                    domClass.add(h4, "media-heading");
                }

                var bodyContents = domConstruct.create("div", { innerHTML: item.Body }, body, "last");

                var by = domConstruct.create("div", { innerHTML: item.UpdatedBy + " - " + _obj.getHumanDate(item.Updated) }, body, "first");
                domClass.add(by, "pull-right");

                //if it is a root item, put in the buttons to allow a comment, or a vote
                if (isRoot) {
                    //vote button
                    var votebutton = domConstruct.create("button", { type: "button" }, body, "last");
                    domClass.add(votebutton, ["btn", "btn-info", "btn-sm"]);

                    var span = domConstruct.create("span", null, votebutton, "last");
                    domClass.add(span, ["glyphicon", "glyphicon-thumbs-up"]);

                    // for all votes, we would use item.Votes, but right now we want unique votes
                    // (" + item.Voters.length + ")
                    span = domConstruct.create("span", { innerHTML: " Like " }, votebutton, "last");

                    //now add badge
                    var badge = domConstruct.create("span", { innerHTML: item.Voters.length }, votebutton, "last")
                    domClass.add(badge, "badge");

                    //now connect the on click
                    on(votebutton, "click", function (evt) {
                        location.assign(dojoConfig.app.path + "Forum/Vote/"+ item.Id);
                    });

                    //and now solution button
                    var button = domConstruct.create("button", { type: "button" }, body, "last");
                    domClass.add(button, ["btn", "btn-primary", "btn-sm"]);

                    span = domConstruct.create("span", null, button, "last");
                    domClass.add(span, ["glyphicon", "glyphicon-comment"]);

                    span = domConstruct.create("span", { innerHTML: " Comment..." }, button, "last");

                    //now connect the on click
                    on(button, "click", function (evt) {                     
                        //first change action on comment form
                        //document.CommentForm.action = "../../Forum/AddComment/" + item.Id;
                        document.CommentForm.action = dojoConfig.app.path + "Forum/AddComment/" + item.Id;

                        //now show modal
                        $('#addCommentModal').modal({show: true})
                    });
                }

                //now if there are any nested comments
                //var ul = domConstruct.create("ul", null, body, "last");
                //domClass.add(ul, "media-list");
                isRoot = false;
                array.forEach(item.Responses, function (response, i) {
                    //_obj.buildForumItem(response, ul, isAdmin, isRoot);
                    _obj.buildForumComment(response, body);
                });

             
            });
        },

        buildForumResultsList: function (data, targetnode, isAdmin) {
            var _obj = this;
            //given data, and a targetnode, will build our table of results
            require(["dojo/_base/array", "dojo/dom", "dojo/dom-construct", "dojo/dom-class", "dojo/on"], function (array, dom, domConstruct, domClass, on) {
                //domConstruct.create("div", null, win.body(), "first");
                //domClass.add("someNode", "newClass");

                var mediaList = domConstruct.create("ul", null, targetnode, "last");
                domClass.add(mediaList, "media-list");

                array.forEach(data, function (item, i) {
                    _obj.buildForumItem(item, mediaList, isAdmin, true);
                });
            });
        },

        getCaptionResults: function (key, targetnode, isAdmin) {
            var _obj = this;
            require(["dojo/request/xhr"], function (xhr) {
                xhr(dojoConfig.app.path + "Caption/ByKeyAsJSON/" + key , {
                    handleAs: "json"
                }).then(function (data) {
                    //now build us a table
                    _obj.buildCaptionResultsTable(data, targetnode, isAdmin);
                }, function (err) {
                    // Handle the error condition
                }, function (evt) {
                    // Handle a progress event from the request if the
                    // browser supports XHR2
                });
            });

        },

        getForumResults: function (key, targetnode, isAdmin) {
            var _obj = this;
            require(["dojo/request/xhr"], function (xhr) {
                //IE is very sticky, and we are refreshing the page when they add a new comment, so we need to force the request from scratch
                xhr(dojoConfig.app.path + "Forum/ByKeyAsJSON/" + key + "?timestamp=" + Date.now(), {
                    handleAs: "json"
                }).then(function (data) {
                    //now build us a media list
                    _obj.buildForumResultsList(data, targetnode, isAdmin);
                }, function (err) {
                    // Handle the error condition
                }, function (evt) {
                    // Handle a progress event from the request if the
                    // browser supports XHR2
                });
            });

        },

        captionContest: function (key, isAdmin) {
            var _obj = this;

            _obj.getCaptionResults(key, "captionResultsDiv", isAdmin);

            //get json for all captions already submitted for this key - /Caption/ByKeyAsJSON/About

            //build table with this info
        },

        forumTopic: function (key, targetnode, isAdmin) {
            //get json for all captions already submitted for this key and build a media-list for this
            var _obj = this;

            _obj.getForumResults(key, targetnode, isAdmin);
        }

    });
});