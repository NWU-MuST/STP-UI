// Jobs module

var Jobs = (function (window, document, $, undefined) {

    var module = {};

    $(document).on( 'ready', check_browser );

    var diarize_sub;
    var recognize_sub;
    var align_sub;

    // Make sure user is using chrome
    function check_browser() {
        document.body.className = 'vbox viewport';

	    var is_chrome = /chrome/.test( navigator.userAgent.toLowerCase() );
	    if((is_chrome == false) || (is_chrome == null)) {
		    alertify.alert('Sorry you must use Chrome!', function(){});
		    window.location.assign(CHROME_URL);
	    }

        if(localStorage.getItem("role") === null) {
            alertify.alert("No role selected from Home page! Redirecting you back to the Home page...", function(){});
		    window.location.assign(HOME_URL);
        }

        if(localStorage.getItem("token") === null) {
            alertify.alert("No token found! Redirecting you back to the Home page...", function(){});
		    window.location.assign(HOME_URL);
        }

        get_users();
        setTimeout(function() { get_jobs(); }, 100);
        setTimeout(function() { get_languages(); }, 200);
        setTimeout(function() { get_speechsubsystems("diarize", diarize_sub); }, 300 );
        setTimeout(function() { get_speechsubsystems("recognize", recognize_sub); }, 400);
        setTimeout(function() { get_speechsubsystems("align", align_sub); }, 500);
    }

    // Redirect the user to the homepage
    module.home = function() {
        alertify.confirm('Going to redirect to the Home page. Leave anyway?',
            function() {
                var items = ["username", "token", "home", "role"];
                for(var ndx = 0; ndx < items.length; items++) {
        	        localStorage.setItem(items[ndx], '');
        	        localStorage.removeItem(items[ndx]);
                }
	            window.location.assign(HOME_URL);
        }, function(){alertify.error("Cancel")});
    }

    // Tab selection code for different projects
    module.openJob = function(evt, jobName) {
        // Declare all variables
        var i, tabcontent, tablinks;

        // Get all elements with class="tabcontent" and hide them
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        // Get all elements with class="tablinks" and remove the class "active"
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        // Show the current tab, and add an "active" class to the button that opened the tab
        document.getElementById(jobName).style.display = "block";
        evt.currentTarget.className += " active";
    }

    // Get assigned tasks
    function get_jobs() {
        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data["token"] = localStorage.token;
	    appserver_send(APP_ELOADTASKS, data, jobs_callback);
    }
    module.get_jobs = function() { get_jobs(); };

    // Get jobs application server response
    var jobs;
    var editing;
    var collating;
    function jobs_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                jobs = response_data;
                editing = jobs["editor"];
                collating = jobs["collator"];
                display_editor(editing);
                display_collator(collating);
                document.getElementById("defjob").click();
                alertify.success("Jobs loaded");
                document.body.className = 'vbox viewport';
		    } else { 
			    alertify.alert("LOADTASKS ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("LOADTASKS Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Get languages from app server
    function get_languages() {
        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data["token"] = localStorage.token;
	    appserver_send(APP_ELISTLANGUAGES, data, languages_callback);
    }

    // Get jobs application server response
    var languages;
    function languages_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                languages = response_data["languages"];
                document.body.className = 'vbox viewport';
		    } else { 
			    alertify.alert("LISTLANGUAGES ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("LISTLANGUAGES Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Get speech service subsystems from app server
    function get_speechsubsystems(service, output) {
        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data["token"] = localStorage.token;
        data["service"] = service;
	    appserver_send_var(APP_ESPEECHSUBSYSTEMS, data, speechsubsystems_callback, output);
    }

    // Get jobs application server response
    function speechsubsystems_callback(xmlhttp, output) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                output = response_data["systems"];
                document.body.className = 'vbox viewport';
		    } else { 
			    alertify.alert("SPEECHSUBSYSTEMS ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("SPEECHSUBSYSTEMS Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // User is trying to logout
    module.logout = function() {
        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data['token'] = localStorage.getItem("token");
	    appserver_send(APP_ELOGOUT, data, logout_callback);
    }

    // Callback for server response
    function logout_callback(xmlhttp) {
	    // No running server detection
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);

		    // Logout application was successful
		    if(xmlhttp.status==200) {
                var items = ["username", "token", "home", "role"];
                for(var ndx = 0; ndx < items.length; items++) {
        	        localStorage.setItem(items[ndx], '');
        	        localStorage.removeItem(items[ndx]);
                }
                document.body.className = 'vbox viewport';
        		window.location.assign(HOME_URL);
		    } else { // Something unexpected happened
			    alertify.alert("LOGOUT ERROR: " + response_data["message"] + "\n(Status: " + xmlhttp.status + ")", function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("LOGOUT Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Get a list of categories from the app server
    function get_users() {
        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data["token"] = localStorage.token;
	    appserver_send(APP_ELOADUSERS, data, users_callback);
    }

    // Save the categories
    var users;
    var editors = {};
    function users_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                users = response_data;
                console.log(users);
                filter_users();
                document.body.className = 'vbox viewport';
		    } else { 
			    alertify.alert("LOADUSERS ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("LOADUSERS Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Separate users by roles
    function filter_users() {
        for(var key in users) {
            var role = users[key]["role"];
            if(role.indexOf(EDITOR_ROLE) != -1) {
                editors[key] = users[key];
            }
        }
    }

    // Selected a column to sort by
    var esort = 0;
    module.sortselect = function(tag) {
        esort = tag;
        display_editor(editing);
    }

    // Display owned projects
    var edisplay;
    function display_editor(data) {
        var js = document.getElementById("jobspace");
        if(data.length > 0) {
            edisplay = [];
            for (var i = 0, len = data.length; i < len; i++) {
                var obj = data[i];
                edisplay.push([i, obj["projectname"], obj["taskid"], obj["category"], obj["editing"], obj["speaker"], parseFloat(obj["creation"]), parseFloat(obj["modified"]), parseFloat(obj["completed"]), obj["errstatus"]]);
            }

            // Sort projects by time
            edisplay.sort(function(a, b){
                return a[esort+1] > b[esort+1] ? 1 : -1;
            });

            var context;
            var oldprojectname = "";
            context = "<table class='project'>";
            context += "<tr> <th onclick='Jobs.sortselect(1)'>Task ID</th> <th onclick='Jobs.sortselect(2)'>Category</th> <th onclick='Jobs.sortselect(3)'>Editing</th> <th onclick='Jobs.sortselect(4)'>Speaker</th>";
            context += "<th onclick='Jobs.sortselect(5)'>Created</th> <th onclick='Jobs.sortselect(6)'>Modified</th> <th onclick='Jobs.sortselect(7)'>Completed</th> <th onclick='Jobs.sortselect(8)'> Error Status</th> </tr>";
            for (var i = 0, len = edisplay.length; i < len; i++) {
                var obj = data[edisplay[i][0]];

                if(oldprojectname != obj["projectname"]) { 
                    context += "<tr><td bgcolor='#CCCCCC' colspan='8' onclick='Jobs.sortselect(0)'>Project Name: " + obj["projectname"] + "</td></tr>";
                    oldprojectname = obj["projectname"];
                }

                context += "<tr onclick='Jobs.editor_selected("+ edisplay[i][0] +")'><td>" + obj["taskid"] + "</td>";
                context += "<td>" + obj["category"] + "</td>";
                var editing = "Missing Editor";
                if(users.hasOwnProperty(obj["editing"])) {
                    editing = users[obj["editing"]]["name"] + " " + users[obj["editing"]]["surname"];
                }
                context += "<td>" + editing + "</td>";
                context += "<td>" + obj["speaker"] + "</td>";

                var d = new Date();
                d.setTime(parseFloat(obj["creation"])*1000.0);
                context += "<td>" + d.toDateString() + "</td>";
                var d = new Date();
                d.setTime(parseFloat(obj["modified"])*1000.0);
                context += "<td>" + d.toDateString() + "</td>";
                if(obj["completed"] != null) {
                    var d = new Date();
                    d.setTime(parseFloat(obj["completed"])*1000.0);
                    context += "<td>" + d.toDateString() + "</td>";
                } else { 
                    context += "<td>Not completed</td>";
                }
                context += "<td> " + obj["errstatus"] + " </td></tr>";
            }
            context += "</table>";
            js.innerHTML = context;
        } else {
            js.innerHTML = "<p>No editing jobs</p>";
        }
        document.body.className = 'vbox viewport';
    }

    // Selected a column to sort by
    var csort = 0;
    module.csortselect = function(tag) {
        csort = tag;
        display_collator(collating);
    }

    // Display owned projects
    var cdisplay;
    function display_collator(data) {
        var cs = document.getElementById("collatorspace");

        if(data.length > 0) {
            cdisplay = [];
            for (var i = 0, len = data.length; i < len; i++) {
                var obj = data[i];
                cdisplay.push([i, obj["projectname"], obj["taskid"], obj["category"], obj["editing"], obj["speaker"], parseFloat(obj["creation"]), parseFloat(obj["modified"]), parseFloat(obj["completed"]), obj["errstatus"]]);
            }

            // Sort projects by time
            cdisplay.sort(function(a, b){
                return a[esort+1] > b[esort+1] ? 1 : -1;
            });

            var context;
            var oldprojectname = "";
            context = "<table class='project'>";
            context += "<tr> <th onclick='Jobs.csortselect(1)'>Task ID</th> <th onclick='Jobs.csortselect(2)'>Category</th> <th onclick='Jobs.csortselect(3)'>Editing</th> <th onclick='Jobs.csortselect(4)'>Speaker</th>";
            context += "<th onclick='Jobs.csortselect(5)'>Created</th> <th onclick='Jobs.csortselect(6)'>Modified</th> <th onclick='Jobs.csortselect(7)'>Completed</th> <th onclick='Jobs.csortselect(8)'> Error Status</th> </tr>";
            for (var i = 0, len = cdisplay.length; i < len; i++) {
                var obj = data[cdisplay[i][0]];

                if(oldprojectname != obj["projectname"]) { 
                    context += "<tr><td bgcolor='#CCCCCC' colspan='6' onclick='Jobs.sortselect(0)'>Project Name: " + obj["projectname"] + "</td>";
                    context += "<td bgcolor='#CCCCCC' colspan='2'><button onclick='Jobs.masterfile("+ cdisplay[i][0] +")'>Master Document</button></td></tr>";
                    oldprojectname = obj["projectname"];
                }

                context += "<tr onclick='Jobs.collator_selected("+ cdisplay[i][0] +")'><td>" + obj["taskid"] + "</td>";
                context += "<td>" + obj["category"] + "</td>";
                var editing = "Missing Editor";
                if(users.hasOwnProperty(obj["editing"])) {
                    editing = users[obj["editing"]]["name"] + " " + users[obj["editing"]]["surname"];
                }
                context += "<td>" + editing + "</td>";
                context += "<td>" + obj["speaker"] + "</td>";

                var d = new Date();
                d.setTime(parseFloat(obj["creation"])*1000.0);
                context += "<td>" + d.toDateString() + "</td>";
                var d = new Date();
                d.setTime(parseFloat(obj["modified"])*1000.0);
                context += "<td>" + d.toDateString() + "</td>";
                if(obj["completed"] != null) {
                    var d = new Date();
                    d.setTime(parseFloat(obj["completed"])*1000.0);
                    context += "<td>" + d.toDateString() + "</td>";
                } else { 
                    context += "<td>Not completed</td>";
                }
                context += "<td> " + obj["errstatus"] + " </td></tr>";
            }
            context += "</table>";
            cs.innerHTML = context;
        } else {
            cs.innerHTML = "<p>No collating jobs</p>";
        }
        document.body.className = 'vbox viewport';
    }

    // User selected editing job and set eselected variable
    var eselected;
    module.editor_selected = function(i) {
        var js = document.getElementById("jobspace");
        js.innerHTML = "";
        var obj = editing[i];
        eselected = i;

        var context;
        context = "<fieldset><legend>Job</legend><table class='project'>";
        context += "<tr><td><label>Project Name:</label></td> <td> " + obj["projectname"] + "</td> </tr>";
        context += "<tr><td><label>Project Category:</label></td> <td> " + obj["category"] + "</td> </tr>";
        context += "<tr><td><label>Current Editor:</label></td> <td> " + obj["editing"] + "</td> </tr>";
        context += "<tr><td><label>Job Speaker:</label></td> <td> " + obj["speaker"] + "</td> </tr>";
        var d = new Date();
        d.setTime(parseFloat(obj["creation"])*1000.0);
        context += "<tr><td><label>Job Created:</label></td> <td>" + d.toDateString() + "</td></tr>";
        var d = new Date();
        d.setTime(parseFloat(obj["modified"])*1000.0);
        context += "<tr><td><label>Job Modified:</label></td> <td>" + d.toDateString() + "</td></tr>";
        if(obj["completed"] != null) {
            var d = new Date();
            d.setTime(parseFloat(obj["completed"])*1000.0);
            context += "<tr><td><label>Job Completion:</label></td> <td>" + d.toDateString() + "</td></tr>";
        } else { 
            context += "<tr><td><label>Job Completion:</label></td> <td>Not completed</td></tr>";
        }
        context += "<tr><td><label>Job Error Status:</label></td> <td> " + obj["errstatus"] + " </td></tr>";
        context += '</table></fieldset><br><hr><br> <button onclick="Jobs.edit_job(0)">Edit Job </button> <button onclick="Jobs.job_done()">Set Job Done </button>';
        context += '<button onclick="Jobs.clearerror_job(0)">Clear Job Error</button> <button onclick="Jobs.unlock_job(0)">Unlock Job</button> ';
        context += '&nbsp;&nbsp;<button onclick="Jobs.goback(0)">Go Back</button>';
        js.innerHTML = context;
        document.body.className = 'vbox viewport';
    }

    // User selected editing job and set eselected variable
    var cselected;
    module.collator_selected = function(i) {
        var cs = document.getElementById("collatorspace");
        cs.innerHTML = "";
        var obj = collating[i];
        cselected = i;

        var context;
        context = "<fieldset><legend>Job</legend><table class='project'>";
        context += "<tr><td><label>Project Name:</label></td> <td> " + obj["projectname"] + "</td> </tr>";
        context += "<tr><td><label>Project Category:</label></td> <td> " + obj["category"] + "</td> </tr>";
        context += "<tr><td><label>Current Editor:</label></td> <td> " + obj["editing"] + "</td> </tr>";
        context += "<tr><td><label>Language:</label></td> <td> " + obj["language"] + "</td> </tr>";
        context += "<tr><td><label>Job Speaker:</label></td> <td> " + obj["speaker"] + "</td> </tr>";
        var d = new Date();
        d.setTime(parseFloat(obj["creation"])*1000.0);
        context += "<tr><td><label>Job Created:</label></td> <td>" + d.toDateString() + "</td></tr>";
        var d = new Date();
        d.setTime(parseFloat(obj["modified"])*1000.0);
        context += "<tr><td><label>Job Modified:</label></td> <td>" + d.toDateString() + "</td></tr>";
        if(obj["completed"] != null) {
            var d = new Date();
            d.setTime(parseFloat(obj["completed"])*1000.0);
            context += "<tr><td><label>Job Completion:</label></td> <td>" + d.toDateString() + "</td></tr>";
        } else { 
            context += "<tr><td><label>Job Completion:</label></td> <td>Not completed</td></tr>";
        }
        context += "<tr><td><label>Job Error Status:</label></td> <td> " + obj["errstatus"] + " </td></tr>";
        context += '</table></fieldset><br><hr><br> <button onclick="Jobs.edit_job(1)">Edit Job </button> <button onclick="Jobs.reassign_job()">Re-assign Job </button>';
        context += '<button onclick="Jobs.clearerror_job(1)">Clear Job Error</button> <button onclick="Jobs.unlock_job(1)">Unlock Job</button> ';
        context += '&nbsp;&nbsp;<button onclick="Jobs.goback(1)">Go Back</button>';
        cs.innerHTML = context;
        document.body.className = 'vbox viewport';
    }

    // Go edit a selected job
    module.edit_job = function(type) {
        if((eselected == -1)&&(cselected == -1)) {
		    alertify.alert("Please select a job to edit!", function(){});
            return false;
        }
        var obj;
        if(type == 0) {
            obj = editing[eselected];
        } else {
            obj = collating[cselected];
        }

        if(obj["editing"] == localStorage.username) {
            obj["readOnly"] = false;
        } else {
            obj["readOnly"] = true;
        }

        obj["languages"] = languages;
        obj["diarize_sub"] = diarize_sub;
        obj["recongize_sub"] = recognize_sub;
        obj["align_sub"] = align_sub;

        localStorage.setItem("job", JSON.stringify(obj)); 
	    window.location.assign(EDITOR_URL);
    }

    // Go back to listing projects
    module.goback = function(type) {
        if(type == 0) {
            eselected = -1;
            display_editor(editing);
        } else {
            cselected = -1;
            display_collator(collating);
        }
    }

    // Mark job completed
    module.job_done = function() {
        if(eselected == -1) {
		    alertify.alert("Please select an editing job to mark as done!", function(){});
            return false;
        }

        var obj = editing[eselected];
        if(obj["editing"] != localStorage.username) {
		    alertify.alert("You do not have ownership of the selected job!", function(){});
            return false;
        }

        document.body.className = 'vbox viewport waiting';
        var data = {};
	    data["token"] = localStorage.token;
        data["projectid"] = obj["projectid"];
        data["taskid"] = obj["taskid"];
	    appserver_send(APP_ETASKDONE, data, jobdone_callback);
    }

    //job done callback
    function jobdone_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }
	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Job marked as done");
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("TASKDONE ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("TASKDONE Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Collator re assign job to editor
    module.reassign_job = function() {
        if(cselected == -1) {
		    alertify.alert("Please select a collating job to reassign back to editor!", function(){});
            return false;
        }

        var obj = collating[cselected];
        if(obj["editing"] != localStorage.username) {
		    alertify.alert("You do not have ownership of the collating job!", function(){});
            return false;
        }

        document.body.className = 'vbox viewport waiting';
        var data = {};
	    data["token"] = localStorage.token;
        data["projectid"] = obj["projectid"];
        data["taskid"] = obj["taskid"];
	    appserver_send(APP_EREASSIGNTASK, data, reassignjob_callback);
    }

    // reassign job callback
    function reassignjob_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }
	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Job reassigned to editor");
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("REASSIGNTASK ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("REASSIGNTASK Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Clear error from job
    module.clearerror_job = function(type) {
        if((eselected == -1) && (cselected == -1)) {
		    alertify.alert("Please select an editing or collating job to clear a job error!", function(){});
            return false;
        }

        var obj;
        if(type == 0) {
            obj = editing[eselected]
        } else {
            obj = collating[cselected];
        }

        if(obj["editing"] != localStorage.username) {
		    alertify.alert("You do not have ownership of this job!", function(){});
            return false;
        }

        document.body.className = 'vbox viewport waiting';
        var data = {};
	    data["token"] = localStorage.token;
        data["projectid"] = obj["projectid"];
        data["taskid"] = obj["taskid"];
	    appserver_send(APP_ECLEARERROR, data, clearerror_callback);
    }

    //Clear error callback
    function clearerror_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }
	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Error cleared!");
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("CLEARERROR ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("CLEARERROR Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Unlock job
    module.unlock_job = function(type) {
        if((eselected == -1) && (cselected == -1)) {
		    alertify.alert("Please select an editing or collating job to unlock!", function(){});
            return false;
        }

        var obj;
        if(type == 0) {
            obj = editing[eselected]
        } else {
            obj = collating[cselected];
        }

        if(obj["editing"] != localStorage.username) {
		    alertify.alert("You do not have ownership of this job!", function(){});
            return false;
        }

        document.body.className = 'vbox viewport waiting';
        var data = {};
	    data["token"] = localStorage.token;
        data["projectid"] = obj["projectid"];
        data["taskid"] = obj["taskid"];
	    appserver_send(APP_EUNLOCKTASK, data, unlock_callback);
    }

    //Unlock callback
    function unlock_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }
	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Error cleared!");
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("UNLOCKTASK ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("UNLOCKTASK Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Get app server to generate a master document and download it
    var download_name = "Document.docx";
    module.masterfile = function(selection) {
        var obj = collating[selection];
        document.body.className = 'vbox viewport waiting';
        var data = {};
	    data["token"] = localStorage.token;
        data["projectid"] = obj["projectid"];
        data["taskid"] = obj["taskid"];
        download_name = collating[selection]["projectname"] + ".docx";
	    appserver_send(APP_EBUILDMASTER, data, buildmaster_callback);
    }

    // A call to build master has returned now try download document
    function buildmaster_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }
	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {

                var link = document.createElement('a');
                link.href = EBASE_URL + "/" + response_data["url"];
                link.download = download_name;
                document.body.appendChild(link);
                link.click();
                document.body.appendChild(link);
                download_name = "Document.docx";
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("BUILDMASTER ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("BUILDMASTER Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // User wants to change their password
    function changepassword() {
        document.getElementById("defjob").click();

        var ps = document.getElementById("jobspace");
        ps.innerHTML = "";

        var context;
        context = "<fieldset><legend>New Password</legend><table class='project'>";
        context += "<tr><td style='text-align: left;'><label>Password: </label></td>";
        context += '<td><input id="password" name="password" placeholder="" type="password" maxlength="32"/></td></tr>';
        context += "<tr><td style='text-align: left;'><label>Re-type Password: </label></td>";
        context += '<td><input id="repassword" name="repassword" placeholder="" type="password" maxlength="32"/></td></tr>';
        context += '</select></td></tr>';

        context += '<tr><td><button onclick="Jobs.update_password()">Update</button></td>';
        context += '<td style="text-align: right;"><button onclick="Jobs.password_cancel()">Cancel</button></td></tr></table></fieldset>';
        ps.innerHTML = context;

    }
    module.changepassword = function() { changepassword(); };

    // User wants to change password
    module.update_password = function() {
        document.body.className = 'vbox viewport waiting';
        var password = document.getElementById("password").value;
        var repassword = document.getElementById("repassword").value;

        if(password == "") {
            alertify.alert("Please enter password!", function(){});
            document.body.className = 'vbox viewport';
            return false;
        }

        if(repassword == "") {
            alertify.alert("Please re-type password!", function(){});
            document.body.className = 'vbox viewport';
            return false;
        }

        if(password != repassword) {
            alertify.alert("Your passwords do not match!", function(){});
            document.body.className = 'vbox viewport';
            return false;
        }

	    var data = {};
	    data['token'] = localStorage.getItem("token");
        data["password"] = password;
	    appserver_send(APP_ECHANGEPASSWORD, data, update_password_callback);
    }

    // Callback for server response
    function update_password_callback(xmlhttp) {
	    // No running server detection
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }
	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    // Logout application was successful
		    if(xmlhttp.status==200) {
			    alertify.alert("Password updated!", function(){});
                get_projects();
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("CHANGEPASSWORD ERROR: " + response_data["message"] + "\n(Status: " + xmlhttp.status + ")", function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("CHANGEPASSWORD Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // User cancelled password update
    module.password_cancel = function() {
        display_editor(editing);
    }

    return module;

})(window, document, jQuery);

