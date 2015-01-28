/*
 * Tom Murphy
 *
 * 05/02/2014 - created
 *
 *
 *  a dojo object defined to represent the survey form
 *
 *
 *
 */
define(["dojo/_base/declare"], function (declare) {
    return declare(null, {

        constructor: function () {
            //any constructor?
        },

        hasKey: function(object, key) {
            //from lodash has
            return object ? hasOwnProperty.call(object, key) : false;
        },

        rightBack: function (sourceStr, keyStr) {
            //equivalent of @RightBack
            //Author: Phillip Roberts - phillroberts@yahoo.com
            //Released under GNU General Public License : http://www.gnu.org/copyleft/gpl.html
            arr = sourceStr.split(keyStr);
            return (sourceStr.indexOf(keyStr) == -1 | keyStr=='') ? '' : arr.pop()
        },

        strLeft: function (sourceStr, keyStr) {
            //equivalent of @Left
            //Author: Phillip Roberts - phillroberts@yahoo.com
            //Released under GNU General Public License : http://www.gnu.org/copyleft/gpl.html
            return (sourceStr.indexOf(keyStr) == -1 | keyStr=='') ? '' : sourceStr.split(keyStr)[0];
        },

        resolveAnswer: function (questionKey, answerKey) {
            //given a question key and an answer key, will use the answerKeyStore to return the full answer
            var _obj = this;
            try {
                return _obj.answerKeyStore.query({ questionKey: questionKey, answerKey: answerKey })[0].answer;
            } catch (e) {
                return answerKey;
            }
        },

        buildUserAnswers: function (targetNode, userAnswers) {
            //build memory store for answerkey
            var _obj = this;
            require(["dojo/dom-construct", "dojo/_base/array", "dojo/store/Memory"], function (domConstruct, array, Memory) {
                var dl = domConstruct.create("dl", null, targetNode, "last");

                _obj.answerKeyStore = new Memory({ data: _obj.answerKeyData });

                //{ questionKey: "PrintImpact", answerKey: "Something", answer: "A more complete answer for something" },
                //store.get(1) -> Returns the object with an id of 1

                //multipleQuestionArray found in _obj.questionKeyData
                var dd;
                var ul;
                var resolvedAnswer;
                array.forEach(_obj.questionKeyData, function (questionitem) {
                    //have one question, create a dt and a dd for this
                    domConstruct.create("dt", { innerHTML: questionitem.question }, dl, "last");

                    if (_obj.hasKey(userAnswers, questionitem.questionKey)) {

                        //user has at least one answer for this
                        //now take the question key and look up the answers
                        dd = domConstruct.create("dd", null, dl, "last");
                        ul = domConstruct.create("ul", null, dd, "last");
                        //loop through all the answers they have for this question

                        array.forEach(userAnswers[questionitem.questionKey], function (answeritem) {
                            domConstruct.create("li", { innerHTML: _obj.resolveAnswer(questionitem.questionKey, answeritem) }, ul, "last");
                        });
                    }

                });


            });
        },

        showInviteList: function (lanid, targetnode) {
            //given a lan id (in the form of ccich), will ask the server for all invites sent by this user
            //and if any are found, will create a list of same
            require(["dojo/request/xhr", "dojo/_base/array", "dojo/dom-construct"], function (xhr, array, domConstruct) {
                var url = dojoConfig.app.path + "Invite/AsJSON/" + lanid;
                xhr(url, {
                    handleAs: "json"
                }).then(function (data) {
                    if (data.length > 0) {
                        //print the heading that includes the length
                        domConstruct.create("div", {innerHTML: "Has invited " +  data.length + " to participate"}, targetnode, "last");
                        var ul = domConstruct.create("ul", null, targetnode, "last");

                        //now loop through the array and print each entry
                        var li;
                        array.forEach(data, function (item) {
                            //create the li
                            li = domConstruct.create("li", { innerHTML: item.SendTo }, ul, "last");
                        });
                    }
                    

                });
            });
        },

        read: function (targetNode, id, isMySurvey) {
            //given a pledgeid, will grab the results as json and rebuild answers
            // [{"questionKey": "PrintImpact", "shortAnswers": ["Adjust Margins","Print Preview"]}...
            // we will resolve the short Answers into the longer answers using the answerKey
            var _obj = this;

            //going to get the pledge as json so we can rebuild the questions http://localhost:64590/Survey/AsJSON/538f1785b61e890d2855fbdc

            //get pledge as json so we can resolve questions
            require(["dojo/request/xhr"], function (xhr) {

                var url = dojoConfig.app.path + "Survey/AsJSON/" + id;
                xhr(url, {
                    handleAs: "json"
                }).then(function (data) {
                    //take the data and resolve the answers into a usersAnswers object
                    _obj.buildUserAnswers(targetNode, data);

                    //check that the user is sharing their number - or that this is the current users pledge
                    //check that there is a Client, and then check that client has a LanId
                    if (isMySurvey || data.ShareNumber) {
                        if (_obj.hasKey(data, "Client")) {
                            if (_obj.hasKey(data.Client, "LanId")) {
                                _obj.showUserGraph(data.Client.LanId);
                            }
                        }
                    }

                    //now show the list of invites for thei user;
                    //deriving lanid from UpdatedBy instead of Client.LanId because case will match database
                    var lanid = _obj.rightBack(data.UpdatedBy, "\\");
                    _obj.showInviteList(lanid, "inviteList");

                });

            });
           
        },

        create: function (lanid) {
            var _obj = this;

     
            _obj.getClientInfo(lanid);

            //we want to record the users monthly average at the time they took the survey
            _obj.getMonthlyAverage(lanid);

            _obj.showUserGraph(lanid);

            _obj.hookUpTooltips();

            _obj._createEdit();
        },

        hookUpTooltips: function () {
            require(["dijit/Tooltip"], function (Tooltip) {
                new Tooltip({
                    connectId: ["shareMyNumberLabel"],
                    label: "By sharing your number, you will be sharing your the number of pages you print with everyone in the Region"
                });

                new Tooltip({
                    connectId: ["shareMyPledgeLabel"],
                    label: "By sharing your pledge, you will be sharing the amount that you have pledged to reduce, and the actions you selected to help you reach that amount. Other pledge takers will be able to see how much you have reduced your printing by as a percentage, but they will not see the number of pages you print."
                });

                new Tooltip({
                    connectId: ["myNumberIsWrap"],
                    label: "This is the average number of pages you print in a month (averaged over the past year)."
                });

            });
        },

        getMonthlyAverage: function (lanid) {
            //going to go get monthly average and shove it into the create form
            var _obj = this;
            var url = "http://r2webapps.r02.epa.gov/gov/epa/r2/papercut/papercut_stats_jsonp.cfm?lanid=" + lanid;
            require(["dojo/request/script", "dojo/dom"], function (script, dom) {

                script.get(url, {
                    jsonp: "callback"
                }).then(function (data) {
                    //the totals in this feed are over the last year
                    var monthlyAverage = data[0].pages / 12;
                    //do we need to convert to int?
                    monthlyAverage = Math.round(monthlyAverage);
                    dom.byId("MonthlyAverage").value = monthlyAverage;

                    //now also put it in our display using innerHTML
                    //we should probably change this so we build the entire well here, so if failure, it just does nothing
                    dom.byId("myNumber").innerHTML = monthlyAverage;
                });
            });
        },

        showUserGraph: function (lanid) {
            //given a lan id, will create a graph and display it on the survey page
            require(["printReduction/graphingControllerClass"], function (graphController) {
                graphing = new graphController();
                graphing.userVsRegional_bar(lanid, "reportTotalsChartDiv");
            });
        },

        getClientInfo: function (lanid) {
            //alert("lanid = " + lanid);
            //given a lanid, will do a request for the info, and fill in the appropriate fields
            var _obj = this;
            var url = "http://intranet.r02.epa.gov/RestService/rest/userinfo/javascript/lanid/" + lanid;
            require(["dojo/request/script"], function (script) {

                script.get(url, {
                    jsonp: "callback"
                }).then(function (data) {
                    _obj.fillInClientInfo(data);
                });
            });

        },

        fillInClientInfo: function (datum) {
            //given an employee record (either the initial lookup, or as a result of a typeahead selection)
            //we are going to fill in the appropriate fields
            var _obj = this;
            require(["dojo/dom"], function (dom) {
                //alert("bbbb = " + datum.org);
                dom.byId("Client_LanId").value = datum.lanId;
                dom.byId("Client_Org").value = datum.org;

                //we want to put division in a field as well
                dom.byId("Client_Division").value = _obj.strLeft(datum.org + "-", "-");
                /*
                require(["dojo/json"], function (JSON) {
                    var jsonString = JSON.stringify(datum);
                    alert("datum = " + jsonString);
                });
                */
                dom.byId("Client_Email").value = datum.email;
                dom.byId("Client_EName").value = datum.ename;
                dom.byId("Client_Location").value = datum.location;
                dom.byId("Client_AmpBox").value = datum.ampBox;

                //now for the display field
                //dom.byId("client-display").innerHTML = datum.lanId + " - " + datum.ename;
            });
        },

        //answer key will have the memory story in it
       
        questionKeyData: [
            { "questionKey": "PrintImpact", "question": "I will Reduce My Print Impacts by" },
            { "questionKey": "ReduceEmailPrinting", "question": "I will Reduce Email Printing by" },
            { "questionKey": "PrintingAgendas", "question": "I will Reduce My Printing Agendas by" },
            { "questionKey": "PrintingForEditing", "question": "I will Reduce Printing for Editing by" },
            { "questionKey": "InternetPrinting", "question": "I will Reduce Internet Printing by" },
            { "questionKey": "PrintingLargeDocuments", "question": "I will Reduce Printing Large Documents by" },
            { "questionKey": "ReduceColorPrinting", "question": "I will Reduce Color Printing by" },
        ],

        answerKeyData: [
            { "questionKey": "PrintImpact", "answerKey": "Adjust Margins", "answer": "Adjusting the default print margins for Microsoft applications" },
            { "questionKey": "PrintImpact", "answerKey": "Print Preview", "answer": "Using Print Preview to make sure that I'm not printing blank or nearly blank pages" },
            { "questionKey": "PrintImpact", "answerKey": "Multiple Slides", "answer": "Printing multiple slides per page for PowerPoint presentations" },
            { "questionKey": "PrintImpact", "answerKey": "Electronic Filing", "answer": "Transitioning to an electronic filing system for my documents (and scanning as needed)" },
            { "questionKey": "PrintImpact", "answerKey": "Four on One", "answer": "Print four pages on one piece of paper" },
            { "questionKey": "ReduceEmailPrinting", "answerKey": "EZ Mail", "answer": "Using EPA's EZ Mail Records Tool" },
            { "questionKey": "ReduceEmailPrinting", "answerKey": "PDF", "answer": "Saving the email as a PDF and filing in the appropriate electronic file " },
            { "questionKey": "ReduceEmailPrinting", "answerKey": "Print Only First Page", "answer": "Printing only the first page of the email (if printing is essential)" },
            { "questionKey": "PrintingAgendas", "answerKey": "Bring Laptops", "answer": "Telling attendees that paper agendas will not be provided at the meeting and asking them to bring their laptops" },
            { "questionKey": "PrintingAgendas", "answerKey": "Laptop for Notes", "answer": "Taking my laptop to meetings to avoid printing agendas and taking meeting notes" },
            { "questionKey": "PrintingAgendas", "answerKey": "Projecting Agendas", "answer": "Projecting agendas in the conference room for everyone to view (in rooms equipped for projection)" },
            { "questionKey": "PrintingAgendas", "answerKey": "Single Poster", "answer": "Printing a single poster-size agenda for an on-site conference" },
            { "questionKey": "PrintingAgendas", "answerKey": "Scrap Paper", "answer": "Jotting down agenda topics on scrap paper (which will be recycled anyway)" },
            { "questionKey": "PrintingForEditing", "answerKey": "OneDrive", "answer": "Using Outlook’s Sky/One Drive on EPA’s  Workplace to share and electronically edit documents with multiple people" },
            { "questionKey": "PrintingForEditing", "answerKey": "Word Track Changes", "answer": "Using Track Changes to edit and comment on Word documents" },
            { "questionKey": "PrintingForEditing", "answerKey": "Only Necessary Pages", "answer": "Printing only the pages/sections that you need to edit (PDF, Word) and are absolutely necessary to complete your assignment" },
            { "questionKey": "PrintingForEditing", "answerKey": "Projecting Document", "answer": "Projecting documents during meetings to facilitate group editing (in rooms equipped for projection)" },
            { "questionKey": "PrintingForEditing", "answerKey": "Double-sided", "answer": "Ensuring documents are double-sided" },
            { "questionKey": "PrintingForEditing", "answerKey": "Laptop Monitor", "answer": "Using my laptop monitor as a secondary monitor to assist with editing " },
            { "questionKey": "InternetPrinting", "answerKey": "Save as PDF", "answer": "Using the “Save As” option for webpages or webpage content and filing the PDF in the appropriate electronic file" },
            { "questionKey": "InternetPrinting", "answerKey": "Personal Printing", "answer": "Minimizing at-work de minimus personal printing" },
            { "questionKey": "PrintingLargeDocuments", "answerKey": "Save as PDF", "answer": "Saving documents  as a PDF and filing in the appropriate electronic file" },
            { "questionKey": "PrintingLargeDocuments", "answerKey": "Only needed pages", "answer": "Printing only the pages/sections that are absolutely needed to complete your work assignment" },
            { "questionKey": "PrintingLargeDocuments", "answerKey": "Multiple pages on one sheet", "answer": "Printing multiple pages on a sheet, such as 2 pages per side or 4 pages per sheet (Word, PDF, Excel)" },
            { "questionKey": "PrintingLargeDocuments", "answerKey": "Only Final Copies", "answer": "Printing  only final copies (as a matter of record)" },
            { "questionKey": "PrintingLargeDocuments", "answerKey": "Double-sided", "answer": "Ensuring the documents are printed double-sided" },
            { "questionKey": "PrintingLargeDocuments", "answerKey": "Needed Reference Sections", "answer": "Printing only the reference sections that I need for my particular job" },
            { "questionKey": "ReduceColorPrinting", "answerKey": "Graph Patterns", "answer": "Creating graphs and tables that use patterns instead of colors (Excel, PowerPoint, Word)" },
            { "questionKey": "ReduceColorPrinting", "answerKey": "Needed for Interpretation", "answer": "Selecting color printing for graphs and tables only if it is necessary for interpretation" },
            { "questionKey": "ReduceColorPrinting", "answerKey": "Final Production", "answer": "Printing color only when needed for final production" },
            { "questionKey": "ReduceColorPrinting", "answerKey": "Gray Scale", "answer": "Ensuring that documents are printed in gray scale" },
            { "questionKey": "ReduceColorPrinting", "answerKey": "No Cover Page", "answer": "Not printing color cover pages of reference documents and reports" }
        ],

        answerKeyStore: null,
        userAnswerStore: null,

        edit: function () {
            var _obj = this;
            _obj._createEdit();
        },

        buildGraph: function (lanid, target) {
            //build a graph for this user and stick in target
        },

        displayNumber: function(lanid) {
            //display monthly number for this user
        },

        _createEdit: function () {
            //the functions common to both create and edit
            var _obj = this;

        },

        index: function () {
        }

    });
});