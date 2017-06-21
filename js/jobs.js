// Jobs module

var Jobs = (function (window, document, $, undefined) {

    var module = {};

    $(document).on( 'ready', check_browser );

    var diarize_sub;
    var recognize_sub;
    var align_sub;
    var notset = ["null", null, undefined];
    var help_message = "";
    var active_job_view = null;
    var GUI_STATE = "LS";
    var REFRESH_TIME = 10000;
    var TIMER = null;

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

    // Return the value if not null or return a string
    function normnull(value, string) {
        if(notset.indexOf(value) === -1) {
            return value;
        } else {
            return string;
        }
    }

    // Set the timer to refresh the project list
    function refresh_timer() {
        if((GUI_STATE == "LS")&&(TIMER == null)) {
            //alertify.success("SETTING TIMER");
            TIMER = setTimeout(function(){ get_jobs(); }, REFRESH_TIME);
        }
    }

    // Clear the timer
    function clear_timer() {
        if(TIMER != null) { clearTimeout(TIMER); TIMER = null; }//alertify.success("CLEAR TIMER"); }
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

      if(jobName == "jobspace") {
            help_message = "<h1>Jobs Page</h1><hr>";
            help_message += "<h2>Editing jobs</h2>";
            help_message += "<p>This table shows a list <strong>Editing Jobs</strong> and <strong>Collator Jobs</strong>. ";
            help_message += "You can change between these editing types by clicking on the corresponding tabs.  ";
            help_message += "To access the editing jobs's information, click on a table row. ";
            help_message += "Filter the jobs by typing job text or selecting a filter by date.</p>";
            help_message += "<h2>Editor Workflow</h2>";
            help_message += "<p>A typical editor workflow is as follows:<br>";
            help_message += "Select a job and transcribe the associated audio.<br>";
            help_message += "When the transcription effort is completed, click on the <b>Job Done</b> button.<br>";
            help_message += "After marking a job as done, you can still view your transcription but it will be read only. </p>";

            help_message += "<h2>Buttons</h2>";
            help_message += "<p><b>Refresh</b> -- refresh the editing and collating jobs list.</p>";
            help_message += "<h2>Navigation</h2>";
            help_message += "<p><b>Home</b> -- return you to the Home page.<br>";
            help_message += "<b>Refresh Jobs</b> -- refresh the editing and collating jobs list.<br>";
            help_message += "<b>Update Password</b> -- update your password.<br>";
            help_message += "<b>Logout</b> -- logout and return to the Home page.<br>";
            help_message += "<b>Help</b> -- provides this message.</p>";

        } else {
            help_message = "<h1>Jobs Page</h1><hr>";
            help_message += "<h2>Collator jobs</h2>";
            help_message += "<p>This table shows a list <strong>Editing Jobs</strong> and <strong>Collator Jobs</strong>. ";
            help_message += "You can change between these editing types by clicking on the corresponding tabs.  ";
            help_message += "To access a collator jobs's information, click on a table row. ";
            help_message += "Clicking on the table headings will sort the job list by that heading.</p>";
            help_message += "<h2>Collating Workflow</h2>";
            help_message += "<p>A typical collating workflow is as follows:<br>";
            help_message += "Wait for an editor to mark that their job is done.<br>";
            help_message += "Review the transcription and if needed you can re-assign the job back to the editor to re-transcribe.<br>";
            help_message += "At any stage the collator can download a master document by clicking on Master Document button. <br>";
            help_message += "A master document is a document that contains a collection of all the transcriptions.</p>";

            help_message += "<h2>Buttons</h2>";
            help_message += "<p><b>Refresh</b> -- refresh the editing and collating jobs list.<br>";
            help_message += "<b>Master Document</b> -- download a master document that contains all the transcriptions from the defined jobs.</p>";

            help_message += "<h2>Navigation</h2>";
            help_message += "<p><b>Home</b> -- return you to the Home page.<br>";
            help_message += "<b>Refresh Jobs</b> -- refresh the editing and collating jobs list.<br>";
            help_message += "<b>Update Password</b> -- update your password.<br>";
            help_message += "<b>Logout</b> -- logout and return to the Home page.<br>";
            help_message += "<b>Help</b> -- provides this message.</p>";
        }
        active_job_view = jobName;
    }

    // Add filter results input
    function addfilter() {
   	    var fil = document.getElementById("filterjob");
        var content = '<table style="border: none; width: 100%;"><tr><td>';
        content += '<input type="text" id="myInput" style="background-size: 5%; width: 80%" onkeyup="Jobs.filterjobs();" placeholder="Filter jobs by text..." title="Type in a name, surname, username or full name"/>';
        content += '</td><td align="right"><label>Filter by Date:</label>&nbsp;<input type="date" id="myCal" onchange="Jobs.filterjobs();" /></td></tr></table>';
        fil.innerHTML = content;
    }

    // Remove filter results input
    function removefilter() {
   	    var fil = document.getElementById("filterjob");
        fil.innerHTML = "";
    }

    // show the job tab
    function showjobtab() {
   	    var tab = document.getElementById("jobtab");
        tab.style.display = "block";
        tab.style.border = "1px solid #ccc";

   	    var tab = document.getElementById("jobspace");
        tab.style.borderTop = "none";
    }

    // hide the job tab
    function hidejobtab() {
   	    var tab = document.getElementById("jobtab");
        tab.style.display = "none";
        tab.style.border = "none";

   	    var tab = document.getElementById("jobspace");
        tab.style.borderTop = "1px solid #ccc";
    }

    // Get assigned tasks
    function get_jobs() {
        if(GUI_STATE == "LS") {
            document.body.className = 'vbox viewport waiting';
            addfilter();
            showjobtab();
	        var data = {};
	        data["token"] = localStorage.token;
	        appserver_send(APP_ELOADTASKS, data, jobs_callback);
        }
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
                //alertify.success("Jobs loaded");
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

    // Get languages application server response
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

   // Filter list as user types
    module.filterjobs = function() {
        if(active_job_view == "jobspace") {
            display_editor(editing);
        } else {
            display_collator(collating);
        }
    }

    // Zero pad a string
    function pad(string, size) {
        var s = string.toString();
        while (s.length < (size || 2)) {s = "0" + s;}
        return s;
    }

    // Do a search for sub string in name, surname and username
    function searchcheck(obj, editor) {
        var input, filter, cal, select_date;
        input = document.getElementById("myInput");
        if(input === undefined) { return false; }
        filter = input.value.toUpperCase();

        select_date = document.getElementById("myCal");
        if(select_date === undefined) { return false; }

        function checksearchstring() {
            // Search through job details
            var items = ["projectname", "category", "editing"];
            for(var ndx = 0; ndx < items.length; ndx++) {
                if(notset.indexOf(obj[items[ndx]]) === -1) {
                    if (obj[items[ndx]].toUpperCase().indexOf(filter) > -1) {
                        return true;
                    }
                }
            }

            if (parseInt(obj["taskid"]) == parseInt(filter)) { return true; }

            if (editor.toUpperCase().indexOf(filter) > -1) { return true; }

            // Include string version of the date
            if(obj["completed"] != null) {
                var d = new Date();
                d.setTime(parseFloat(obj["completed"])*1000.0);
                var ds = d.toDateString();
                if (ds.toUpperCase().indexOf(filter) > -1) { return true; }
            }

            var d = new Date();
            d.setTime(parseFloat(obj["creation"])*1000.0);
            var ds = d.toDateString();
            if (ds.toUpperCase().indexOf(filter) > -1) { return true; }

            return false;
        }
        var ssr = checksearchstring();

        // User may be filtering by date picker
        if(obj["completed"] != null) {
            var d = new Date();
            d.setTime(parseFloat(obj["completed"])*1000.0);
            if(select_date.value.length > 0) {
                jobdate = d.getFullYear() + "-" + pad(d.getMonth()+1, 2) + "-" + pad(d.getDate(), 2);
                if(jobdate == select_date.value) {
                    if(ssr === true) {
                        return true;
                    }
                } else {
                    return false;
                }
            }
        }

        var d = new Date();
        d.setTime(parseFloat(obj["creation"])*1000.0);
        if(select_date.value.length > 0) {
            jobdate = d.getFullYear() + "-" + pad(d.getMonth()+1, 2) + "-" + pad(d.getDate(), 2);
            //console.log(jobdate);
            //console.log(select_date.value);
            //console.log(ssr);
            if(jobdate == select_date.value) {
                if(ssr === true) {
                    return true;
                }
            } else {
                return false;
            }
        }

        return ssr;
    }

    // Display owned projects
    var edisplay;
    function display_editor(data) {
        var js = document.getElementById("jobspace");
        if(data.length > 0) {
            edisplay = [];
            for (var i = 0, len = data.length; i < len; i++) {
                var obj = data[i];
                edisplay.push([i, obj["projectname"], obj["taskid"], obj["category"], obj["editing"], obj["creation"], parseFloat(obj["completed"])]);
            }

            // Sort projects by time
            edisplay.sort(function(a, b){ return a[1] > b[1] ? 1 : -1; });

            var context;
            var oldprojectname = "";
            context = "<table class='project'>";

            context += "<tr><th> JOBS </th></tr>";
            var prev_proj = "";
            for (var i = 0, len = edisplay.length; i < len; i++) {
                var obj = data[edisplay[i][0]];

                var editor = "Missing Editor";
                if(users.hasOwnProperty(obj["editing"])) {
                    editor = users[obj["editing"]]["name"] + " " + users[obj["editing"]]["surname"];
                }

                var result = searchcheck(obj, editor);
                if(result === true) {
                    context += "<tr onclick='Jobs.editor_selected("+ edisplay[i][0] +")'>";
                } else {
                    context += "<tr style='display: none;' onclick='Jobs.editor_selected("+ edisplay[i][0] +")'>";
                }
                if(prev_proj != obj["projectname"]) {
                    context += "<td><strong style='color: #395870;'>" + obj["projectname"] + "</strong> <span class='text-offset' style='padding: none;'><table><tr>";
                    prev_proj = obj["projectname"];
                } else {
                    context += "<td><strong style='color: #395870;'></strong> <span class='text-offset' style='padding: none;'><table><tr>";
                }

                if(notset.indexOf(obj["jobid"]) === -1) {
                    context += '<td><strong>This project is locked while a speech job is running</strong></td></tr></table></span></td></tr>';
                } else if(notset.indexOf(obj["errstatus"]) === -1) {
                    context += '<td style="color: red;">ERRSTATUS: <strong>' + obj["errstatus"] +'</strong></td></tr></table></span></td></tr>';
                } else {
                    context += "<td style='border: none;'> JOB ID: <strong>" + obj["taskid"] + "</strong></td>";
                    context += "<td style='border: none;'> CATEGORY: <strong>" + obj["category"] + "</strong></td>";
                    context += "<td style='border: none;'> EDITING: <strong>" + editor + "</strong></td>";
                    var d = new Date();
                    d.setTime(parseFloat(obj["creation"])*1000.0);
                    context += "<td style='border: none;'>CREATED: <strong>" + d.toDateString() + "</strong></td>";

                    if(obj["completed"] != null) {
                        var d = new Date();
                        d.setTime(parseFloat(obj["completed"])*1000.0);
                        context += "<td style='border: none;'>COMPLETED: <strong>" + d.toDateString() + "</strong></td></tr></table></span></td></tr>";
                    } else {
                        context += "<td style='border: none;'>COMPLETED: <strong> Not Completed </strong></td></tr></table></span></td></tr>";
                    }
                }
            }
            context += "</table>";
            js.innerHTML = context;
            refresh_timer();
        } else {
            js.innerHTML = "<p>No editing jobs</p>";
        }
        document.body.className = 'vbox viewport';
    }

    // Display collator jobs
    var cdisplay;
    function display_collator(data) {
        var cs = document.getElementById("collatorspace");

        if(data.length > 0) {
            cdisplay = [];
            for (var i = 0, len = data.length; i < len; i++) {
                var obj = data[i];
                cdisplay.push([i, obj["projectname"], obj["taskid"], obj["category"], obj["editing"], obj["creation"], parseFloat(obj["completed"])]);
            }

            // Sort projects by time
            cdisplay.sort(function(a, b){ return a[1] > b[1] ? 1 : -1; });

            var context;
            var oldprojectname = "";
            context = "<table class='project'>";

            context += "<tr><th> JOBS </th></tr>";
            var prev_proj = "";
            for (var i = 0, len = cdisplay.length; i < len; i++) {
                var obj = data[cdisplay[i][0]];

                var editor = "Missing Editor";
                if(users.hasOwnProperty(obj["editing"])) {
                    editor = users[obj["editing"]]["name"] + " " + users[obj["editing"]]["surname"];
                }

                var result = searchcheck(obj, editing);
                if(result === true) {
                    context += "<tr onclick='Jobs.collator_selected("+ cdisplay[i][0] +")'>";
                } else {
                    context += "<tr style='display: none;' onclick='Jobs.collator_selected("+ cdisplay[i][0] +")'>";
                }
                if(prev_proj != obj["projectname"]) {
                    context += "<td><strong style='color: #395870;'>" + obj["projectname"] + "</strong> <button style='float: right;' onclick='Jobs.masterfile("+ cdisplay[i][0] +")'>Download Master Document</button>";
                    context += "<span class='text-offset' style='padding: none;'><table><tr>";
                    prev_proj = obj["projectname"];
                } else {
                    context += "<td><strong style='color: #395870;'></strong> <span class='text-offset' style='padding: none;'><table><tr>";
                }

                if(notset.indexOf(obj["jobid"]) === -1) {
                    context += '<td><strong>This project is locked while a speech job is running</strong></td></tr></table></span></td></tr>';
                } else if(notset.indexOf(obj["errstatus"]) === -1) {
                    context += '<td style="color: red;">ERRSTATUS: <strong>' + obj["errstatus"] +'</strong></td></tr></table></span></td></tr>';
                } else {
                    context += "<td style='border: none;'> JOB ID: <strong>" + obj["taskid"] + "</strong></td>";
                    context += "<td style='border: none;'> CATEGORY: <strong>" + obj["category"] + "</strong></td>";
                    context += "<td style='border: none;'> EDITING: <strong>" + editor + "</strong></td>";
                    var d = new Date();
                    d.setTime(parseFloat(obj["creation"])*1000.0);
                    context += "<td style='border: none;'>CREATED: <strong>" + d.toDateString() + "</strong></td>";

                    if(obj["completed"] != null) {
                        var d = new Date();
                        d.setTime(parseFloat(obj["completed"])*1000.0);
                        context += "<td style='border: none;'>COMPLETED: <strong>" + d.toDateString() + "</strong></td></tr></table></span></td></tr>";
                    } else {
                        context += "<td style='border: none;'>COMPLETED: <strong> Not Completed </strong></td></tr></table></span></td></tr>";
                    }
                }
            }
            context += "</table>";
            cs.innerHTML = context;
            refresh_timer();
        } else {
            cs.innerHTML = "<p>No collating jobs</p>";
        }
        document.body.className = 'vbox viewport';
    }

    // User selected editing job and set eselected variable
    var eselected;
    module.editor_selected = function(i) {
        GUI_STATE = "JS";
        clear_timer();
        removefilter();
        hidejobtab();
        var js = document.getElementById("jobspace");
        js.innerHTML = "";
        var obj = editing[i];
        eselected = i;

        help_message = "<h1>Editor Page</h1><hr>";
        help_message += "<p>A displayed of the selected editing job's information.</p>";
        help_message += "<h2>Editing Job Information</h2>";
        help_message += "<p>This view shows all the editing job's information. ";
        help_message += "You can click on the job-related buttons, located after the job information, to perform certain actions on the job. ";
        help_message += "The first step is to edit the job which means transcribing the audio. You can edit and save iteratively. ";
        help_message += "Once the transcribing has been completed you can mark the job as complete by clicking on the <b>Set Job Done button</b>.";
        help_message += "The Collator will review your transcription and could reassign the job back to you for further editing. </p>";

        help_message += "<h2>Buttons</h2>";
        help_message += "<p><b>Refresh</b> -- refresh the project list.<br>";
        help_message += "<b>Edit Job</b> -- edit the currently selected job. This action will transfer you to an editor.<br>";
        help_message += "<b>Set Job Done</b> -- mark the transcription job as complete. This will transfer the ownership of the job to the Collator. You will only have read-only rights to the transcription. <br>";
        help_message += "<b>Clear Project Error</b> -- clear a job error so you can access the job. This may occur when a requested speech service terminated incorrectly.<br>";
        help_message += "<b>Unlock Project</b> -- unlock a job that has been locked by a requested speech service. The job will be highlighted red when locked.<br>";
        help_message += "<b>Go Back</b> -- return to the project list view.</p>";

        help_message += "<h2>Navigation</h2>";
        help_message += "<p><b>Home</b> -- return you to the Home page.<br>";
        help_message += "<b>Refresh Jobs</b> -- refresh the editing and collating jobs list.<br>";
        help_message += "<b>Update Password</b> -- update your password.<br>";
        help_message += "<b>Logout</b> -- logout and return to the Home page.<br>";
        help_message += "<b>Help</b> -- provides this message.</p>";

        var content;
        js.innerHTML = "";

        if(notset.indexOf(obj["errstatus"]) === -1) {
            content = "<table class='project'><tr><th colspan='2' style='background-color: #4CAF50; color: white;'>" + obj["projectname"] + "</th></tr></table>";
            content += "<dl>";
            content += "<dt style='background: #ff0000;'>JOB ERROR STATUS:</dt><dd>" + obj["errstatus"] + "</dd>";
            content += '<button onclick="Jobs.clearerror_job()">Clear Job Error</button>&nbsp;&nbsp;<button onclick="Jobs.goback(0)">Go Back</button></div>';
        } else if(notset.indexOf(obj["jobid"]) === -1) {
            content = "<table class='project'><tr><th colspan='2' style='background-color: #4CAF50; color: white;'>" + obj["projectname"] + "</th></tr></table>";
            content += "<dl>";
            content += "<dt style='background: #ff0000;'>JOB LOCKED BY CURRENTLY RUNNING SPEECH JOB</dt><dd>" + obj["errstatus"] + "</dd>";
            content += '<button onclick="Jobs.unlock_jobs(0)">Unlock Job</button>&nbsp;&nbsp;<button onclick="Jobs.goback(0)">Go Back</button></div>';
        } else {
            content = "<table class='project'><tr><th colspan='2' style='background-color: #4CAF50; color: white;'>" + obj["projectname"] + "</th></tr>";
            content += "<td><strong style='color: #395870;'> AUDIO DETAILS </strong> <span class='text-offset' style='padding: none;'><table><tr>";
            content += "<td style='border: none;'> CATEGORY: <strong>" + obj["category"] + "</strong></td>";
            content += "<td style='border: none;'> LANGUAGE: <strong>" + obj["language"] + "</strong></td>";
            content += "<td style='border: none;'> SPEAKER: <strong>" + obj["speaker"] + "</strong></td>";
            content += "</tr></table></span></td></tr>";

            var editor = "Missing Editor";
            if(users.hasOwnProperty(obj["editing"])) {
                editor = users[obj["editing"]]["name"] + " " + users[obj["editing"]]["surname"];
            }
            content += "<td><strong style='color: #395870;'> JOB DETAILS </strong> <span class='text-offset' style='padding: none;'><table><tr>";
            content += "<td style='border: none;'> EDITING: <strong>" + editor + "</strong></td>";
            content += "<td style='border: none;'> JOB ID: <strong>" + obj["taskid"] + "</strong></td>";
            var d = new Date();
            d.setTime(parseFloat(obj["creation"])*1000.0);
            content += "<td style='border: none;'> CREATION DATE: <strong>" + d.toDateString() + "</strong></td>";
            var d = new Date();
            d.setTime(parseFloat(obj["modified"])*1000.0);
            content += "<td style='border: none;'> LAST MODIFIED: <strong>" + d.toDateString() + "</strong></td>";

            if(obj["completed"] != null) {
                var d = new Date();
                d.setTime(parseFloat(obj["completed"])*1000.0);
                content += "<td style='border: none;'> DATE COMPLETED: <strong>" + d.toDateString() + "</strong></td>";
            } else { 
                content += "<td style='border: none;'> DATE COMPLETED: <strong> NOT COMPLETED </strong></td>";
            }
            content += "</tr></table></span></td></tr></table>";

        content += '<button onclick="Jobs.edit_job(0)">Edit Job </button> <button onclick="Jobs.job_done()">Set Job Done </button>';
        content += '&nbsp;&nbsp;<button onclick="Jobs.goback(0)">Go Back</button>';
        }
        js.innerHTML = content;
        document.body.className = 'vbox viewport';
    }

    // User selected editing job and set eselected variable
    var cselected;
    module.collator_selected = function(i) {
        GUI_STATE = "CS";
        clear_timer();
        removefilter();
        hidejobtab();

        var cs = document.getElementById("collatorspace");
        cs.innerHTML = "";
        var obj = collating[i];
        cselected = i;

        help_message = "<h1>Editor Page</h1><hr>";
        help_message += "<p>A displayed of the selected collator job's information.</p>";
        help_message += "<h2>Collator Job Information</h2>";
        help_message += "<p>This view shows all the collator job's information. ";
        help_message += "You can click on the job-related buttons, located after the job information, to perform certain actions on the job. ";
        help_message += "The first step is to edit the job which means transcribing the audio. You can edit and save iteratively. ";
        help_message += "Once the transcribing has been completed you can mark the job as complete by clicking on the <b>Set Job Done button</b>.";
        help_message += "The Collator will review your transcription and could reassign the job back to you for further editing. </p>";

        help_message += "<h2>Buttons</h2>";
        help_message += "<p><b>Refresh</b> -- refresh the project list.<br>";
        help_message += "<b>Edit Job</b> -- edit the currently selected job. This action will transfer you to an editor.<br>";
        help_message += "<b>Re-assign Job</b> -- transfer ownership of the job back to editor. They must re-work the transcription. <br>";
        help_message += "<b>Clear Project Error</b> -- clear a job error so you can access the job. This may occur when a requested speech service terminated incorrectly.<br>";
        help_message += "<b>Unlock Project</b> -- unlock a job that has been locked by a requested speech service. The job will be highlighted red when locked.<br>";
        help_message += "<b>Go Back</b> -- return to the project list view.</p>";

        help_message += "<h2>Navigation</h2>";
        help_message += "<p><b>Home</b> -- return you to the Home page.<br>";
        help_message += "<b>Refresh Jobs</b> -- refresh the editing and collating jobs list.<br>";
        help_message += "<b>Update Password</b> -- update your password.<br>";
        help_message += "<b>Logout</b> -- logout and return to the Home page.<br>";
        help_message += "<b>Help</b> -- provides this message.</p>";

        var content;
        cs.innerHTML = "";

        if(notset.indexOf(obj["errstatus"]) === -1) {
            content = "<table class='project'><tr><th colspan='2' style='background-color: #4CAF50; color: white;'>" + obj["projectname"] + "</th></tr></table>";
            content += "<dl>";
            content += "<dt style='background: #ff0000;'>JOB ERROR STATUS:</dt><dd>" + obj["errstatus"] + "</dd>";
            content += '<button onclick="Jobs.clearerror_job()">Clear Job Error</button>&nbsp;&nbsp;<button onclick="Jobs.goback(1)">Go Back</button></div>';
        } else if(notset.indexOf(obj["jobid"]) === -1) {
            content = "<table class='project'><tr><th colspan='2' style='background-color: #4CAF50; color: white;'>" + obj["projectname"] + "</th></tr></table>";
            content += "<dl>";
            content += "<dt style='background: #ff0000;'>JOB LOCKED BY CURRENTLY RUNNING SPEECH JOB</dt><dd>" + obj["errstatus"] + "</dd>";
            content += '<button onclick="Jobs.unlock_jobs(1)">Unlock Job</button>&nbsp;&nbsp;<button onclick="Jobs.goback(1)">Go Back</button></div>';
        } else {
            content = "<table class='project'><tr><th colspan='2' style='background-color: #4CAF50; color: white;'>" + obj["projectname"] + "</th></tr>";
            content += "<td><strong style='color: #395870;'> AUDIO DETAILS </strong> <span class='text-offset' style='padding: none;'><table><tr>";
            content += "<td style='border: none;'> CATEGORY: <strong>" + obj["category"] + "</strong></td>";
            content += "<td style='border: none;'> LANGUAGE: <strong>" + obj["language"] + "</strong></td>";
            content += "<td style='border: none;'> SPEAKER: <strong>" + obj["speaker"] + "</strong></td>";
            content += "</tr></table></span></td></tr>";

            var editor = "Missing Editor";
            if(users.hasOwnProperty(obj["editing"])) {
                editor = users[obj["editing"]]["name"] + " " + users[obj["editing"]]["surname"];
            }
            content += "<td><strong style='color: #395870;'> JOB DETAILS </strong> <span class='text-offset' style='padding: none;'><table><tr>";
            content += "<td style='border: none;'> EDITING: <strong>" + editor + "</strong></td>";
            content += "<td style='border: none;'> JOB ID: <strong>" + obj["taskid"] + "</strong></td>";
            var d = new Date();
            d.setTime(parseFloat(obj["creation"])*1000.0);
            content += "<td style='border: none;'> CREATION DATE: <strong>" + d.toDateString() + "</strong></td>";
            var d = new Date();
            d.setTime(parseFloat(obj["modified"])*1000.0);
            content += "<td style='border: none;'> LAST MODIFIED: <strong>" + d.toDateString() + "</strong></td>";

            if(obj["completed"] != null) {
                var d = new Date();
                d.setTime(parseFloat(obj["completed"])*1000.0);
                content += "<td style='border: none;'> DATE COMPLETED: <strong>" + d.toDateString() + "</strong></td>";
            } else { 
                content += "<td style='border: none;'> DATE COMPLETED: <strong> NOT COMPLETED </strong></td>";
            }
            content += "</tr></table></span></td></tr></table>";

        content += '<button onclick="Jobs.edit_job(1)">Edit Job </button> <button onclick="Jobs.reassign_job()">Re-assign Job </button>';
        content += '&nbsp;&nbsp;<button onclick="Jobs.goback(1)">Go Back</button>';
        }
        cs.innerHTML = content;
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

       if(notset.indexOf(obj["jobid"]) == -1) {
            alertify.alert("This job is waiting for a requested speech service to finish!", function(){});
            return false;
        }

       if(notset.indexOf(obj["errstatus"]) == -1) {
            alertify.alert("Job has an error! Please clear the error first.", function(){});
            return false;
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

        clear_timer();
        localStorage.setItem("job", JSON.stringify(obj)); 
	    window.location.assign(EDITOR_URL);
    }

    // Go back to listing projects
    module.goback = function(type) {
        addfilter();
        showjobtab();
        if(type == 0) {
            GUI_STATE = "LS";
            eselected = -1;
            display_editor(editing);
        } else {
            GUI_STATE = "LS";
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

       if(notset.indexOf(obj["jobid"]) == -1) {
            alertify.alert("This job is waiting for a requested speech service to finish!", function(){});
            return false;
        }

       if(notset.indexOf(obj["errstatus"]) == -1) {
            alertify.alert("Job has an error! Please clear the error first.", function(){});
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
                GUI_STATE = "LS";
                get_jobs();
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

       if(notset.indexOf(obj["jobid"]) == -1) {
            alertify.alert("This job is waiting for a requested speech service to finish!", function(){});
            return false;
        }

       if(notset.indexOf(obj["errstatus"]) == -1) {
            alertify.alert("Job has an error! Please clear the error first.", function(){});
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
                GUI_STATE = "LS";
                get_jobs();
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

        if(notset.indexOf(obj["errstatus"]) == -1) {
            alertify.alert("Job has an error! Please clear the error first.", function(){});
            return false;
        }

        if(notset.indexOf(obj["jobid"]) !== -1) {
            alertify.alert("This project is not currently locked by speech service request!", function(){});
            return false;
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
        GUI_STATE = "CP";
        clear_timer();
        removefilter();
        hidejobtab();

        document.getElementById("defjob").click();

        var ps = document.getElementById("jobspace");
        ps.innerHTML = "";

        help_message = "<h1>Editor Page</h1><hr>";
        help_message += "<p>Update your password.</p>";
        help_message += "<h2>Update Password</h2>";
        help_message += "<p>You can update your password at any stage using the update password interface. ";
        help_message += "<strong>You have to change your password if the administrator resets your password</strong>.</p> ";

        help_message += "<h2>Buttons</h2>";
        help_message += "<p><b>Refresh</b> -- refresh the project list.<br>";
        help_message += "<b>Update Password</b> -- update your password once you have typed the new password twice.<br>";
        help_message += "<b>Cancel</b> -- cancel the update password process.</p>";

        help_message += "<h2>Navigation</h2>";
        help_message += "<p><b>Home</b> -- return you to the Home page.<br>";
        help_message += "<b>Refresh Jobs</b> -- refresh the editing and collating jobs list.<br>";
        help_message += "<b>Update Password</b> -- update your password.<br>";
        help_message += "<b>Logout</b> -- logout and return to the Home page.<br>";
        help_message += "<b>Help</b> -- provides this message.</p>";

        var context;

        var context;
        context = '<dl><dt>PASSWORD: </dt><dd style="background: #ffffff;"><input id="password" name="password" placeholder="Type password" type="password" maxlength="32"/></dd>';
        context += '<dt>RE-TYPE PASSWORD: </dt><dd style="background: #ffffff;"><input id="repassword" name="repassword" placeholder="Re-type password" type="password" maxlength="32"/></dd></dl>';
        context += '<div><button onclick="Jobs.update_password()">Update Password</button> &nbsp;&nbsp;<button onclick="Jobs.password_cancel()">Cancel</button></div>';
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
                GUI_STATE = "LS";
                get_jobs();
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
        GUI_STATE = "LS";
        addfilter();
        showjobtab();
        display_editor(editing);
    }

  // Return a help message for the context
    module.help = function() {
        if(help_message.length > 0) {
            alertify.alert("Help", help_message, function(){});
        } else {
            alertify.alert("Help", "Sorry no help provided for this context!");
        }
    }

    return module;

})(window, document, jQuery);

