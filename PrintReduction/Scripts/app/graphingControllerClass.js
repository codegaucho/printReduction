/*
 * Tom Murphy
 *
 * 05/21/2014 - created
 *
 *
 *  a dojo object defined to represent the graphing/charting/data needs for this particular application
 *
 *
 *
 */
define(["dojo/_base/declare"], function (declare) {
    return declare(null, {

        constructor: function (isAdmin) {
            //add graphing links to navigator
            //this.addGraphingNavigator();
        },

        addGraphingNavigator: function () {
            //going to add links to the drop down for all graphs and such myPrintingNav_ul
            var _obj = this;
            require(["dojo/dom-construct", "dojo/on"], function (domConstruct, on) {
                var li = domConstruct.create("li", null, "myPrintingNav_ul", "last");
                var a = domConstruct.create("a", { innerHTML: "User 30 day Average", href: "#" }, li, "last");
                on(a, "click", function () {
                    _obj.testbar("tpmurphy")
                });
            });
        },

        userVsRegional_bar: function (username, target) {
            //will request the user and regional data from json, and display a bar chart comparing the two
            //regional data http://r2webapps.r02.epa.gov/gov/epa/r2/papercut/papercut_stats_jsonp.cfm?lanid=
            //user data http://r2webapps.r02.epa.gov/gov/epa/r2/papercut/papercut_stats_jsonp.cfm?lanid= + username
            var baseurl = "http://r2webapps.r02.epa.gov/gov/epa/r2/papercut/papercut_stats_jsonp.cfm?lanid=";
            var postBaseURL = "http://r2webapps.r02.epa.gov/gov/epa/r2/papercut/papercut_live_stats_jsonp.cfm?period_duration=&lanid=";
            var _obj = this;
            require(["dojo/promise/all", "dojo/request/script"], function (all, script) {
                all({
                    //baseline
                    user: script.get(baseurl + username, { jsonp: "callback" }),

                    //now that we are after baseline, we don't have to ask, it ain't going to change
                    //region: script.get(baseurl, { jsonp: "callback" }),

                    //post baseline
                    postuser: script.get(postBaseURL + username, { jsonp: "callback" }),
                    postregion: script.get(postBaseURL, { jsonp: "callback" })
                    
                }).then(function (results) {
                    //results will be using the keys user and region
                    

                    //baseline
                    //get the average per person, and get the average month
                    //var regionalAverage_all = results.region[0].pages / results.region[0].people_count / 12;
                    //var regionalAverage_color = results.region[0].color_pages / results.region[0].people_count / 12;
                    //don't have to ask, ain't going to change
                    var regionalAverage_all = 292;
                    var regionalAverage_color = 37;


                    var userMonthlyAverage_color = results.user[0].color_pages / 12;
                    var userMonthlyAverage = results.user[0].pages / 12;

                    //post baseline
                    var postUserMonthlyAverage_color = (results.postuser[0].color_pages / results.postuser[0].num_days_since_start) * 30 ;
                    var postUserMonthlyAverage = (results.postuser[0].pages / results.postuser[0].num_days_since_start) * 30;

                    var postRegionalAverage_all = (results.postregion[0].pages / results.postregion[0].people_count / results.postregion[0].num_days_since_start) * 30;
                    var postRegionalAverage_color = (results.postregion[0].color_pages / results.postregion[0].people_count / results.postregion[0].num_days_since_start) * 30;

                    //now use the data to prep the bar 
                    var series = [
                       //pre baseline
                        {
                            name: username + "_color_pre",
                            data: [
                                {
                                    x: 1,
                                    y: userMonthlyAverage_color,
                                    tooltip: username + " averaged " + userMonthlyAverage_color.toFixed(0) + " color pages per month pre papercut"
                                }
                            ]
                        },

                         {
                             name: username + "_all_pre",
                             data: [
                                 {
                                     x: 1,
                                     y: userMonthlyAverage,
                                     tooltip: username + " averaged " + userMonthlyAverage.toFixed(0) + " pages per month pre papercut"
                                 }
                            ]
                         },

                         //post baseline
                         {
                             name: username + "_color_post",
                             data: [
                                 {
                                     x: 2,
                                     y: postUserMonthlyAverage_color,
                                     tooltip: username + " averaged " + postUserMonthlyAverage_color.toFixed(0) + " color pages per month since papercut"
                                 }
                             ]
                         },

                         {
                             name: username + "_all_post",
                             data: [
                                 {
                                     x: 2,
                                     y: postUserMonthlyAverage,
                                     tooltip: username + " averaged " + postUserMonthlyAverage.toFixed(0) + " pages per month since papercut"
                                 }
                             ]
                         },

                         //regional baseline
                        {
                            name: "Regional_color_baseline",
                            data: [
                                {
                                    x: 3,
                                    y: regionalAverage_color,
                                    tooltip: "The Average user printed " + regionalAverage_color.toFixed(0) + " color pages per month pre papercut"
                                }
                            ]
                        },
                        {
                            name: "Regional_all_baseline",
                            data: [
                                {
                                    x: 3,
                                    y: regionalAverage_all,
                                    tooltip: "The Average user printed " + regionalAverage_all.toFixed(0) + " pages per month pre papercut"
                                }
                            ]
                        },
                        //regional post
                        {
                            name: "Regional_color",
                            data: [
                                {
                                    x: 4,
                                    y: postRegionalAverage_color,
                                    tooltip: "The Average user printed " + postRegionalAverage_color.toFixed(0) + " color pages per month since papercut"
                                }
                            ]
                        },
                        {
                            name: "Regional_all",
                            data: [
                                {
                                    x: 4,
                                    y: postRegionalAverage_all,
                                    tooltip: "The Average user printed " + postRegionalAverage_all.toFixed(0) + " pages per month since papercut"
                                }
                            ]
                        }
                    ];

                    var axis = [
                        {
                            name: "x",
                            kwArgs: {
                                labels: [{
                                    value: 1,
                                    text: username + " pre papercut"
                                }, {
                                    value: 2,
                                    text: username + " since papercut"
                                }, {
                                    value: 3,
                                    text: "Regional pre papercut"
                                },
                                {
                                    value: 4,
                                    text: "Regional since papercut"
                                }

                                ],
                                fixLower: "major",
                                fixUpper: "major"
                            }
                        },
                        {
                            name: "y",
                            kwArgs: {
                                vertical: true,
                                fixLower: "major",
                                fixUpper: "major",
                                min: 0
                            }
                        }
                    ];

                    var title = "user vs Regional Average";
                    _obj.bar(target, "dojox/charting/themes/Wetland", axis, series, title);

                });
            });
        },

        keys_bar: function (target, keys, baseurl, average, title) {
            //given an array of keyas, will append them to the base url and create a set of promises, and build a bar graph
            var _obj = this;

            var verb = (average) ? " averaged " : " printed ";
            require(["dojo/promise/all", "dojo/request/script", "dojo/_base/array"], function (all, script, array) {
                var promises = {};
                array.forEach(keys, function (item, i) {
                    //build a promis for each key
                    promises[item] = script.get(baseurl + item, { jsonp: "callback" })
                });
                all(promises).then(function (results) {
                    //results will be using the keys NY, NJ, and PR
                    var series = [];
                    var axis_labels = [];

                    var rawcount
                    var count;
                    var tooltip;
                    var cost;
                    array.forEach(keys, function (item, i) {
                        var seriesElement = {};
                        var axisElement = {};
                        //axis labels
                        axisElement.value = i + 1;
                        axisElement.text = item;
                        axis_labels.push(axisElement);

                        //series info, first the color info
                        seriesElement.name = item + "_color";

                        rawcount = results[item][0].color_pages;
                        count = (average) ? rawcount / results[item][0].people_count / 12 : rawcount;
                        //tooltip = (average) ? item + " averaged " + count.toFixed(0) / 12 + " per user per month color pages" : item + " printed " + count.toFixed(0) + " color pages over the past year";
                        if (average) {
                            tooltip = item + " averaged " + count.toFixed(0) + " color pages per user per month";
                        } else {
                            tooltip = item + " printed " + count.toFixed(0) + " color pages over the past year";
                        }
                        seriesElement.data = [
                            {
                                x: i + 1,
                                y: count,
                                tooltip: tooltip
                            }
                        ];
                        series.push(seriesElement);

                        //now the total info
                        var seriesElement_total = {};
                        seriesElement_total.name = item;

                        rawcount = results[item][0].pages;
                        count = (average) ? rawcount / results[item][0].people_count / 12 : rawcount;
                        cost = (average) ? results[item][0].cost / results[item][0].people_count / 12 : results[item][0].cost;

                        //tooltip = (average) ? item + " averaged " + count.toFixed(0) / 12 + " per user per month pages" : item + " printed " + count.toFixed(0) + " pages over the past year";
                        if (average) {
                            tooltip = item + " averaged " + count.toFixed(0) + " pages per user per month with an average monthly cost of $" + cost.toFixed(2);
                        } else {
                            tooltip = item + " printed " + count.toFixed(0) + " pages over the past year at a cost of $" + cost.toFixed(2);
                        }

                        seriesElement_total.data = [
                            {
                                x: i + 1,
                                y: count,
                                //tooltip: item + verb + count.toFixed(0) + " pages over the past year at a cost of $" + cost.toFixed(2)
                                tooltip: tooltip
                            }
                        ];
                        series.push(seriesElement_total);
                    });

                    var axis = [
                        {
                            name: "x",
                            kwArgs: {
                                labels: axis_labels,
                                majorTickStep: 1,
                                minorTicks: false
                            }

                        },
                        {
                            name: "y",
                            kwArgs: {
                                vertical: true,
                                fixLower: "major",
                                fixUpper: "major",
                                min: 0
                            }
                        }
                    ];

                    _obj.bar(target, "dojox/charting/themes/Harmony", axis, series, title);

                });
            });
        },

        climateChangeKeys_bar: function (target, keys, baseurl, average, title) {
            //given an array of keys, will append them to the base url and create a set of promises, and build a bar graph
            //almost the same as keys_bar, but this applies the climate change portions
            var _obj = this;

            var verb = (average) ? " averages " : " totals ";
            require(["dojo/promise/all", "dojo/request/script", "dojo/_base/array"], function (all, script, array) {
                var promises = {};
                array.forEach(keys, function (item, i) {
                    //build a promis for each key
                    promises[item] = script.get(baseurl + item, { jsonp: "callback" })
                });
                all(promises).then(function (results) {
                    //results will be using the keys NY, NJ, and PR
                    var series = [];
                    var axis_labels = [];

                    var rawcount
                    var count;
                    var cost;
                    array.forEach(keys, function (item, i) {
                        var seriesElement = {};
                        var axisElement = {};
                        //axis labels
                        axisElement.value = i + 1;
                        axisElement.text = item;
                        axis_labels.push(axisElement);

                        //Only one series
                        seriesElement.name = item;

                        rawcount = results[item][0].pages * 0.018;
                        count = (average) ? rawcount / results[item][0].people_count : rawcount;
                        seriesElement.data = [
                            {
                                x: i + 1,
                                y: count,
                                tooltip: item + verb + count.toFixed(0) + " lbs of CO2 equivalents"
                            }
                        ];
                        series.push(seriesElement);

                    });

                    var axis = [
                        {
                            name: "x",
                            kwArgs: {
                                labels: axis_labels,
                                majorTickStep: 1,
                                minorTicks: false
                            }

                        },
                        {
                            name: "y",
                            kwArgs: {
                                vertical: true,
                                fixLower: "major",
                                fixUpper: "major",
                                min: 0
                            }
                        }
                    ];

                    _obj.bar(target, "dojox/charting/themes/Harmony", axis, series, title);

                });
            });
        },

        whoIsTakingPledge_bar: function (target, keys, baseurl, title) {
            //given an array of keys, will append them to the base url and create a set of promises, and build a bar graph
            //almost the same as keys_bar, but this applies the climate change portions
            //a bit different than the rest as the data is not coming from a different domain
            var _obj = this;

            require(["dojo/promise/all", "dojo/request/xhr", "dojo/_base/array"], function (all, xhr, array) {
                var promises = {};
                array.forEach(keys, function (item, i) {
                    //build a promis for each key
                    promises[item] = xhr(baseurl + item, { handleAs: "json" })
                });

                all(promises).then(function (results) {
                    //results will be using the keys NY, NJ, and PR
                    var series = [];
                    var axis_labels = [];

                    var rawcount;
                    array.forEach(keys, function (item, i) {
                        var seriesElement = {};
                        var axisElement = {};
                        //axis labels
                        axisElement.value = i + 1;
                        axisElement.text = item;
                        axis_labels.push(axisElement);

                        //Only one series
                        seriesElement.name = item;
                        rawcount = results[item].length;
                        seriesElement.data = [
                            {
                                x: i + 1,
                                y: rawcount,
                                tooltip: rawcount + " " + item + "'ers have taken the pledge"
                            }
                        ];
                        series.push(seriesElement);

                    });

                    var axis = [
                        {
                            name: "x",
                            kwArgs: {
                                labels: axis_labels,
                                majorTickStep: 1,
                                minorTicks: false
                            }

                        },
                        {
                            name: "y",
                            kwArgs: {
                                vertical: true,
                                fixLower: "major",
                                fixUpper: "major",
                                min: 0
                            }
                        }
                    ];

                    _obj.bar(target, "dojox/charting/themes/Harmony", axis, series, title);

                });
            });
        },
        
        howMuchPledgedReduction_bar: function (target) {
            //going to get all surveyed and show a distribution of how much was pledged
            var _obj = this;
          
            require(["dojo/request/xhr", "dojo/_base/array"], function (xhr, array) {
                var url = dojoConfig.app.path + "Survey/AsJSON/";
                xhr(url, {
                    handleAs: "json"
                }).then(function (data) {
                    // Do something with the handled data

                    var datahash = {};
                    array.forEach(data, function (item, i) {
                        if (datahash.hasOwnProperty(item.Percentage)) {
                            datahash[item.Percentage]++;
                        } else {
                            datahash[item.Percentage] = 1;
                        }
                    });

                    var element;

                    var series = [];
                    var axis_labels = [];
                    var i = 0;
                    for (var p in datahash) {
                        //alert(p + " - " + datahash[p]);
                        i++;
                        var axisElement = {
                            value: i,
                            text: p
                        };
                        axis_labels.push(axisElement);

                        var seriesElement = {};
                        seriesElement.name = p;
                        seriesElement.data = [
                            {
                                //x: parseInt(p),
                                x: i,
                                y: datahash[p],
                                tooltip: datahash[p] + " users have pledged " + p + "%"
                            }
                        ];
                        series.push(seriesElement);
                    }

                    var axis = [
                        {
                            name: "x",
                            kwArgs: {
                                labels: axis_labels,
                                majorTickStep: true,
                                minorTicks: false
                            }

                        },
                        {
                            name: "y",
                            kwArgs: {
                                vertical: true,
                                fixLower: "major",
                                fixUpper: "major",
                                min: 0
                            }
                        }
                    ];
                    var title = "Pledged Reductions";
                    _obj.bar(target, "dojox/charting/themes/Harmony", axis, series, title);
                }, function (err) {
                    // Handle the error condition
                }, function (evt) {
                    // Handle a progress event from the request if the
                    // browser supports XHR2
                });
            });
            
        },

        sizeVsReduction_Scatter: function (target) {
            //given a target, will go through all pledge takes and plot size vs reduction
            var _obj = this;
            require(["dojo/promise/all", "dojo/request/xhr", "dojo/request/script", "dojo/_base/array", "dojo/store/Memory"], function (all, xhr, script, array, Memory) {
                //days back should go back to the start of our period - that is June 10, 2014
                var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                var todayDate = new Date();
                var startPledgeDate = new Date(2013, 6, 10);

                var daysBack = Math.round(Math.abs((startPledgeDate.getTime() - todayDate.getTime()) / (oneDay)));
                //we don't want to request more than one years of data, so set a ceiling of 1 year
                daysBack = ((daysBack > 365) ? 365 : daysBack);

                var promises = {
                    baseline: script.get("http://r2webapps.r02.epa.gov/gov/epa/r2/papercut/papercut_user_print_totals_jsonp.cfm", { jsonp: "callback" }),
                    postpledge: script.get("http://r2webapps.r02.epa.gov/gov/epa/r2/papercut/papercut_user_print_live_totals_jsonp.cfm?period_duration=" + daysBack, { jsonp: "callback" })
                };

                all(promises).then(function (results) {
                    //results will be using the keys listed in promises
                    //create memory stores for the baseline and postpledge to aid in searching
                    var baselineStore = new Memory({ data: results.baseline });
                    //var postpledgeStore = new Memory({ data: results.postpledge });

                    //spin through pledge data set and set the base, actual, and reduction properties as appropriate
                    var seriesdata = [];
                    array.forEach(results.postpledge, function (item, i) {
                        var username = item.user_name;
                        if (username != null) {
                            username = username.toLowerCase();

                            //console.log(username);

                            var baselineRecord = baselineStore.query({ user_name: username });
                            //var postpledgeRecord = postpledgeStore.query({ user_name: username });

                            if (baselineRecord == null || baselineRecord == undefined) {
                                item.baseline = 0;
                            } else {
                                //baseline is over 1 year, so get the monthly average
                                //console.log(baselineRecord[0].pages);
                                if (baselineRecord[0] == undefined) {
                                    item.baseline = 0;
                                } else {
                                    item.baseline = baselineRecord[0].pages / 12;
                                }
                            }

                           
                                //postpledge is floating - so we need to get a monthly average
                                item.postpledge = (item.pages / daysBack) * 30.4;
                                item.reduction = item.baseline - item.postpledge;
                                if (item.baseline == 0) {
                                    item.reductionPercent = 0;
                                } else {
                                    item.reductionPercent = item.reduction / item.baseline;
                                }



                            var displayname;
                            if (item.ShareNumber) {
                                displayname = "[undisclosed]";
                            } else {
                                displayname = username;
                            }

                            var tooltiptext = displayname + " pledged " + item.Percentage + "% reduction, but has achieved " + Math.round(item.reduction) + "% reduction.  Average monthly printing has gone from " + Math.round(item.baseline) + " to " + Math.round(item.postpledge);

                            var datapoint = {
                                y: item.reductionPercent * 100,
                                x: item.pages,
                                tooltip: tooltiptext
                            };

                            seriesdata.push(datapoint);
                        }



                    });

                    //now we have all of the data we need for any sort of graph in results.pledges
                    var series = [
                        {
                            name: "Reduction",
                            data: seriesdata
                        }
                    ];

                    var axis = [
                        {
                            name: "x",
                            kwArgs: {
                                //labels: axis_labels,
                                min: 0,
                               // max: 60,
                                majorTickStep: true,
                                minorTicks: false
                            }

                        },
                        {
                            name: "y",
                            kwArgs: {
                                //min: 0,
                                vertical: true,
                                fixLower: "major",
                                fixUpper: "major"
                            }
                        }
                    ];

                    var title = "Percent vs printing - all";
                    _obj.scatter(target, "dojox/charting/themes/Harmony", axis, series, title);

                });
            });
        },

        howMuchPledgersActualReduction_Scatter: function (target) {
            //going to spin through all the pledge takers, and figure out their actual reduction
            //and then plot actual reduction vs pledge reduction
            var _obj = this;
            require(["dojo/promise/all", "dojo/request/xhr", "dojo/request/script", "dojo/_base/array", "dojo/store/Memory"], function (all, xhr, script, array, Memory) {
                //days back should go back to the start of our period - that is June 10, 2014
                var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                var todayDate = new Date();
                var startPledgeDate = new Date(2013, 6, 10);

                var daysBack = Math.round(Math.abs((startPledgeDate.getTime() - todayDate.getTime()) / (oneDay)));
                //we don't want to request more than one years of data, so set a ceiling of 1 year
                daysBack = ((daysBack > 365) ? 365 : daysBack);

                var promises = {
                    pledges: xhr(dojoConfig.app.path + "Survey/AsJSON/", {handleAs: "json"}),
                    baseline: script.get("http://r2webapps.r02.epa.gov/gov/epa/r2/papercut/papercut_user_print_totals_jsonp.cfm", { jsonp: "callback" }),
                    postpledge: script.get("http://r2webapps.r02.epa.gov/gov/epa/r2/papercut/papercut_user_print_live_totals_jsonp.cfm?period_duration=" + daysBack, { jsonp: "callback" })
                };

                all(promises).then(function (results) {
                    //results will be using the keys listed in promises
                    //create memory stores for the baseline and postpledge to aid in searching
                    var baselineStore = new Memory({data: results.baseline});
                    var postpledgeStore = new Memory({data: results.postpledge});
                    
                    //spin through pledge data set and set the base, actual, and reduction properties as appropriate
                    var seriesdata = [];
                    array.forEach(results.pledges, function (item, i) {
                        var username = item.Client.LanId;
                        if (username != null) {
                            username = username.toLowerCase();

                            //console.log(username);

                            var baselineRecord = baselineStore.query({ user_name: username });
                            var postpledgeRecord = postpledgeStore.query({ user_name: username });

                            if (baselineRecord == null) {
                                item.baseline = 0;
                            } else {
                                //baseline is over 1 year, so get the monthly average
                                console.log(baselineRecord[0].pages);
                                item.baseline = baselineRecord[0].pages / 12;
                            }

                            if (postpledgeRecord == null) {
                                item.postpledge = 0;
                                item.reduction = item.baseline;
                            } else {
                                //postpledge is floating - so we need to get a monthly average
                                item.postpledge = (postpledgeRecord[0].pages / daysBack) * 30.4;
                                item.reduction = item.baseline - item.postpledge;
                                if (item.baseline == 0) {
                                    item.reductionPercent = 0;
                                } else {
                                    item.reductionPercent = item.reduction / item.baseline;
                                }
                                
                            }

                            var displayname;
                            if (item.ShareNumber) {
                                displayname = "[undisclosed]";
                            } else {
                                displayname = item.Client.EName;
                            }

                            var tooltiptext = displayname + " pledged " + item.Percentage + "% reduction, but has achieved " + Math.round(item.reduction) + "% reduction.  Average monthly printing has gone from " + Math.round(item.baseline) + " to " + Math.round(item.postpledge);

                            var datapoint = {
                                y: item.reductionPercent * 100,
                                x: item.Percentage,
                                tooltip: tooltiptext
                            };

                            seriesdata.push(datapoint);
                        }

                        

                    });

                    //now we have all of the data we need for any sort of graph in results.pledges
                    var series = [
                        {
                            name: "Reduction",
                            data: seriesdata
                        }
                    ];

                    var axis = [
                        {
                            name: "x",
                            kwArgs: {
                                //labels: axis_labels,
                                min: 0,
                                max: 60,
                                majorTickStep: true,
                                minorTicks: false
                            }

                        },
                        {
                            name: "y",
                            kwArgs: {
                                min: -60,
                                max: 70,
                                vertical: true
                                //,
                                //fixLower: "major",
                                //fixUpper: "major"
                            }
                        }
                    ];

                    var title = "Pledged vs Actual";
                    _obj.scatter(target, "dojox/charting/themes/Harmony", axis, series, title);

                });
            });

        },

        /*
        getSortedKeys: function (hash) {
            //given a hash hash["one"] = 22, hash["two"] = 3, ...
            // will return the keys in a sorted order ["two", "one"]
        },
        */

        howMuchPledgersActualReduction_bar: function (target) {
            //going to spin through all the pledge takers, and figure out their actual reduction
            //and then plot actual reduction as bar
            var _obj = this;
            require(["dojo/promise/all", "dojo/request/xhr", "dojo/request/script", "dojo/_base/array", "dojo/store/Memory"], function (all, xhr, script, array, Memory) {
                //days back should go back to the start of our period - that is June 10, 2014
                var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                var todayDate = new Date();
                var startPledgeDate = new Date(2013, 6, 10);

                var daysBack = Math.round(Math.abs((startPledgeDate.getTime() - todayDate.getTime()) / (oneDay)));
                //we don't want to request more than one years of data, so set a ceiling of 1 year
                daysBack = ((daysBack > 365) ? 365 : daysBack);

                var promises = {
                    pledges: xhr(dojoConfig.app.path + "Survey/AsJSON/", { handleAs: "json" }),
                    baseline: script.get("http://r2webapps.r02.epa.gov/gov/epa/r2/papercut/papercut_user_print_totals_jsonp.cfm", { jsonp: "callback" }),
                    postpledge: script.get("http://r2webapps.r02.epa.gov/gov/epa/r2/papercut/papercut_user_print_live_totals_jsonp.cfm?period_duration=" + daysBack, { jsonp: "callback" })
                };

                all(promises).then(function (results) {
                    //results will be using the keys listed in promises
                    //create memory stores for the baseline and postpledge to aid in searching
                    var baselineStore = new Memory({ data: results.baseline });
                    var postpledgeStore = new Memory({ data: results.postpledge });

                    //spin through pledge data set and set the base, actual, and reduction properties as appropriate
                    //we want to put them to the nearest 10%
                    var datahash = {};
                    array.forEach(results.pledges, function (item, i) {
                        var username = item.Client.LanId;
                        
                        if (username != null) {
                            username = username.toLowerCase();

                            //console.log(username);

                            var baselineRecord = baselineStore.query({ user_name: username });
                            var postpledgeRecord = postpledgeStore.query({ user_name: username });

                            if (baselineRecord == null) {
                                item.baseline = 0;
                            } else {
                                //baseline is over 1 year, so get the monthly average
                                console.log(baselineRecord[0].pages);
                                item.baseline = baselineRecord[0].pages / 12;
                            }

                            if (postpledgeRecord == null) {
                                item.postpledge = 0;
                                item.reduction = item.baseline;
                            } else {
                                //postpledge is floating - so we need to get a monthly average
                                item.postpledge = (postpledgeRecord[0].pages / daysBack) * 30.4;
                                item.reduction = item.baseline - item.postpledge;
                                if (item.baseline == 0) {
                                    item.reductionPercent = 0;
                                } else {
                                    //we want to floor to the nearest 10%
                                    var floorReduction = item.reduction / item.baseline;
                                    item.reductionPercent = floorReduction;
                                    console.log("floor reduction = " + floorReduction);
                                    //now bucket it
                                    floorReduction = Math.floor(floorReduction * 10) * 10;

                                    if (datahash.hasOwnProperty(floorReduction)) {
                                        datahash[floorReduction]++;
                                    } else {
                                        datahash[floorReduction] = 1;
                                    }

                                }
                            }
                        }
                    });

                    series = [];
                    var axis_labels = [];
                    var i = 0;
                    
                    //we want to sort our keys
                    var keys = [];

                    for (var key in datahash) {
                        keys.push(key);
                    }

                    var newkeys = keys.sort(function (a, b) { return a - b});

                    //for (var p in datahash) {
                    var p;
                    for (var j = 0; j < newkeys.length; j++) {
                        //p represents the key
                        p = newkeys[j];
                        //alert(p + " - " + datahash[p]);
                        

                        //we want to filter out ones
                        if (datahash[p] > 1) {
                            i++;
                            var upperLimit = parseInt(p) + 10;
                            var ave = (parseInt(p) + parseInt(upperLimit)) / 2;
                            var axisElement = {
                                value: i,
                                text: p + " - " +  upperLimit
                                //text: ave
                            };

                            axis_labels.push(axisElement);

                            //console.log(p + " - " + datahash[p]);

                            var seriesElement = {};
                            seriesElement.name = p;
                            seriesElement.data = [
                                {
                                    //x: parseInt(p),
                                    x: i,
                                    y: datahash[p],
                                    tooltip: datahash[p] + " users have reduced " + p + "%"
                                }
                            ];
 
                            series.push(seriesElement);
                        }
                        
                    }

                    var axis = [
                        {
                            name: "x",
                            kwArgs: {
                                labels: axis_labels,
                                majorTickStep: true,
                                minorTicks: false
                            }

                        },
                        {
                            name: "y",
                            kwArgs: {
                                vertical: true,
                                fixLower: "major",
                                fixUpper: "major"
                            }
                        }
                    ];

                    var title = "Actual Reduction";
                    _obj.bar(target, "dojox/charting/themes/Harmony", axis, series, title);

                });
            });

        },
        /*
        compareActualReduction_bar: function (target) {
            //going to compare the current users actual reduction vs reduction of all the pledgers, vs the reduction of everyone in the division, vs the reduciton in everyone in the region
            //and then plot actual reduction as bar
            var _obj = this;
            require(["dojo/promise/all", "dojo/request/xhr", "dojo/request/script", "dojo/_base/array", "dojo/store/Memory"], function (all, xhr, script, array, Memory) {
                //days back should go back to the start of our period - that is June 10, 2014
                var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                var todayDate = new Date();
                var startPledgeDate = new Date(2013, 6, 10);

                var daysBack = Math.round(Math.abs((startPledgeDate.getTime() - todayDate.getTime()) / (oneDay)));
                //we don't want to request more than one years of data, so set a ceiling of 1 year
                daysBack = ((daysBack > 365) ? 365 : daysBack);

                var promises = {
                    pledges: xhr(dojoConfig.app.path + "Survey/AsJSON/", { handleAs: "json" }),
                    baseline: script.get("http://r2webapps.r02.epa.gov/gov/epa/r2/papercut/papercut_user_print_totals_jsonp.cfm", { jsonp: "callback" }),
                    postpledge: script.get("http://r2webapps.r02.epa.gov/gov/epa/r2/papercut/papercut_user_print_live_totals_jsonp.cfm?period_duration=" + daysBack, { jsonp: "callback" })
                };

                all(promises).then(function (results) {
                    //results will be using the keys listed in promises
                    //create memory stores for the baseline and postpledge to aid in searching
                    var baselineStore = new Memory({ data: results.baseline });
                    var postpledgeStore = new Memory({ data: results.postpledge });

                    //spin through pledge data set and set the base, actual, and reduction properties as appropriate
                    var datahash = {};
                    array.forEach(results.pledges, function (item, i) {
                        var username = item.Client.LanId;
                        
                        if (username != null) {
                            username = username.toLowerCase();

                            console.log(username);

                            var baselineRecord = baselineStore.query({ user_name: username });
                            var postpledgeRecord = postpledgeStore.query({ user_name: username });

                            if (baselineRecord == null) {
                                item.baseline = 0;
                            } else {
                                //baseline is over 1 year, so get the monthly average
                                console.log(baselineRecord[0].pages);
                                item.baseline = baselineRecord[0].pages / 12;
                            }

                            if (postpledgeRecord == null) {
                                item.postpledge = 0;
                                item.reduction = item.baseline;
                            } else {
                                //postpledge is floating - so we need to get a monthly average
                                item.postpledge = (postpledgeRecord[0].pages / daysBack) * 30.4;
                                item.reduction = item.baseline - item.postpledge;
                                if (item.baseline == 0) {
                                    item.reductionPercent = 0;
                                } else {
                                    //we want to floor to the nearest 10%
                                    var floorReduction = item.reduction / item.baseline;
                                    item.reductionPercent = floorReduction;
                                    console.log("floor reduction = " + floorReduction);
                                    //now bucket it
                                    floorReduction = Math.floor(floorReduction * 10) * 10;

                                    if (datahash.hasOwnProperty(floorReduction)) {
                                        datahash[floorReduction]++;
                                    } else {
                                        datahash[floorReduction] = 1;
                                    }

                                }
                            }
                        }
                    });

                    series = [];
                    var axis_labels = [];
                    var i = 0;
                    for (var p in datahash) {
                        //alert(p + " - " + datahash[p]);
                        i++;
                        var axisElement = {
                            value: i,
                            text: p
                        };
                        axis_labels.push(axisElement);

                        console.log(p + " - " + datahash[p]);

                        var seriesElement = {};
                        seriesElement.name = p;
                        seriesElement.data = [
                            {
                                //x: parseInt(p),
                                x: i,
                                y: datahash[p],
                                tooltip: datahash[p] + " users have reduced " + p + "%"
                            }
                        ];
                        series.push(seriesElement);
                    }

                    var axis = [
                        {
                            name: "x",
                            kwArgs: {
                                labels: axis_labels,
                                majorTickStep: true,
                                minorTicks: false
                            }

                        },
                        {
                            name: "y",
                            kwArgs: {
                                vertical: true,
                                fixLower: "major",
                                fixUpper: "major"
                            }
                        }
                    ];

                    var title = "Actual Reduction";
                    _obj.bar(target, "dojox/charting/themes/Harmony", axis, series, title);

                });
            });

        },
        */
        dualGraph_bar: function (graphType, target1, target2) {
            //keys_bar: function (target, keys, baseurl, average, title)
            var _obj = this;
            var baseurl = "http://r2webapps.r02.epa.gov/gov/epa/r2/papercut/";
            var divisionKeys = ["ORA", "OPM", "ORC", "DECA", "CASD", "CWD", "ERRD", "DESA", "PAD", "CEPD", "NONR2"];
            var locationkeys = ["NY", "NJ", "PR"];
            
            switch (graphType) {
                case "Location":
                    baseurl = baseurl + "papercut_location_stats_jsonp.cfm?location=";
                    
                    _obj.keys_bar(target1, locationkeys, baseurl, true, "Printing by Location - Average per user per month");
                    _obj.keys_bar(target2, locationkeys, baseurl, false, "Printing by Location - Total");
                    break;
                case "Division":
                    baseurl = baseurl + "papercut_division_stats_jsonp.cfm?division=";
                    
                    _obj.keys_bar(target1, divisionKeys, baseurl, true, "Printing by Division - Average per user per month");
                    _obj.keys_bar(target2, divisionKeys, baseurl, false, "Printing by Division - Total");
                    break;
                case "CO2_Division":
                    //climateChangeKeys_bar: function (target, keys, baseurl, average, title)
                    baseurl = baseurl + "papercut_division_stats_jsonp.cfm?division=";
                    _obj.climateChangeKeys_bar(target1, divisionKeys, baseurl, true, "lbs CO2 Equivalent per user per month");
                    _obj.climateChangeKeys_bar(target2, divisionKeys, baseurl, false, "lbs CO2 Equivalent per year");
                    break;
                case "WhoIsTakingThePledge":
                    var division_baseurl = dojoConfig.app.path + "Survey/ByDivisionAsJSON/";
                    var location_baseurl = dojoConfig.app.path + "Survey/ByLocationAsJSON/";
                    _obj.whoIsTakingPledge_bar(target1, divisionKeys, division_baseurl, "Users who have taken pledge - by Division");
                    _obj.whoIsTakingPledge_bar(target2, locationkeys, location_baseurl, "Users who have taken pledge - by Location");
                    break;
                case "HowMuchAreWePledging":
                    //two bar graphs - one with the pledges by % pledged - the other with the actual amount these pledge takers reduced
                    _obj.howMuchPledgedReduction_bar(target1);

                    //_obj.howMuchPledgersActualReduction_Scatter(target2);
                    _obj.howMuchPledgersActualReduction_bar(target2);
                    break;
                case "CompareReduction":
                    _obj.compareActualReduction_bar(target1);

                    break;
                case "CompareScatter":
                    _obj.howMuchPledgersActualReduction_Scatter(target1);
                    _obj.sizeVsReduction_Scatter(target2);
                    break;
                default:
                    //assume Divisionbaseurl = baseurl + "papercut_division_stats_jsonp.cfm?division=";
                    _obj.keys_bar(target1, divisionKeys, baseurl, true, "Printing by Division - Average per user per month");
                    _obj.keys_bar(target2, divisionKeys, baseurl, false, "Printing by Division - Total");
            }

        },

        scatter: function (target, theme, axis, series, title) {
            //our generic scatter plot
            theme = (null) ? "dojox/charting/themes/Wetland" : theme;

            require(
                [
                    "dojo/_base/array",
                    "dojo/dom",
                    "dojox/charting/Chart2D",
                    "dojox/charting/plot2d/Scatter",
                    theme,
                    "dojox/charting/action2d/Highlight",
                    "dojox/charting/action2d/Tooltip"
                ],

                function (array, dom, Chart2D, Columns, Theme, Highlight, Tooltip) {
                    //blow away whatever is in target node - usually some sort of loading graphic
                    dom.byId(target).innerHTML = "";
                    var c = new dojox.charting.Chart2D(target, {
                        title: title
                    });
                    c.addPlot("default", {
                        type: "Scatter"
                        //,
                        //tension: 3,
                        //, gap: 10
                    });

                    //add axis info
                    array.forEach(axis, function (item) {
                        c.addAxis(item.name, item.kwArgs);
                    });

                    c.setTheme(Theme);

                    array.forEach(series, function (item) {
                        c.addSeries(item.name, item.data, item.kwArgs);
                    });

                    var a1 = new dojox.charting.action2d.Tooltip(c, "default");
                    var a2 = new dojox.charting.action2d.Highlight(c, "default");
                    c.render();
                }
            );
        },

        bar: function (target, theme, axis, series, title) {
            //our generic bar graph
            //target - where the graph will be built
            //theme - full path to theme, such as "dojox/charting/themes/Wetland"
            //title - title to put on graph

            //set default theme if not supplied
            theme = (null) ? "dojox/charting/themes/Wetland" : theme;

            require(
                [
                    "dojo/_base/array",
                    "dojo/dom",
                    "dojox/charting/Chart2D",
                    "dojox/charting/plot2d/Columns",
                    theme,
                    "dojox/charting/action2d/Highlight",
                    "dojox/charting/action2d/Tooltip"
                ],

                function (array, dom, Chart2D, Columns, Theme, Highlight, Tooltip) {
                    //blow away whatever is in target node - usually some sort of loading graphic
                    dom.byId(target).innerHTML = "";
                    var c = new dojox.charting.Chart2D(target, {
                        title: title
                    });
                    c.addPlot("default", {
                        type: "Columns"
                        //,
                        //tension: 3,
                        , gap: 10
                    });

                    //add axis info
                    array.forEach(axis, function (item) {
                        c.addAxis(item.name, item.kwArgs);
                    });

                    c.setTheme(Theme);

                    array.forEach(series, function (item) {
                        c.addSeries(item.name, item.data, item.kwArgs);
                    });

                    var a1 = new dojox.charting.action2d.Tooltip(c, "default");
                    var a2 = new dojox.charting.action2d.Highlight(c, "default");
                    c.render();
                }
            );
        }


    });
});