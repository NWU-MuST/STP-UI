// Project module
//<div>Icons made by <a href="http://www.flaticon.com/authors/pixel-buddha" title="Pixel Buddha">Pixel Buddha</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
var Project = (function (window, document, $, undefined) {

    var module = {};

    $(document).on( 'ready', check_browser );

    var project_status = ["Created", "In Progress", "Completed"];
    var notset = ["null", null, undefined];
    var help_message = "";
    var active_project_view = null;
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
            alertify.alert("No role selected from Home page! Redirecting you back to Home page...", function(){});
		    window.location.assign(HOME_URL);
        }

        if(localStorage.getItem("token") === null) {
            alertify.alert("No token found! Redirecting you back to the Home page...", function(){});
		    window.location.assign(HOME_URL);
        }

        // Load data from server - stagger the calls with delays
        get_users();
        setTimeout(function() { get_categories(); }, 100);
        setTimeout(function() { get_languages(); }, 200);
        setTimeout(function() { get_projects(); }, 300);
        setTimeout(function() { get_createdprojects(); }, 400);

        // User logged on using a temporary password
        if(localStorage.templogin === true) {
            alertify.alert("You need to change your password now!\nIf you do not, you will not be able to login once you leave this session.", function(){changepassword();});
        }
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
            TIMER = setTimeout(function(){ get_all_projects(); }, REFRESH_TIME);
        }
    }

    // Clear the timer
    function clear_timer() {
        if(TIMER != null) { clearTimeout(TIMER); TIMER = null; } //alertify.success("CLEAR TIMER"); }
    }

    // Redirect the user to the homepage
    module.home = function() {
        alertify.confirm('You will be redirected to the Home page. Leave anyway?',
            function() {
                var items = ["username", "token", "home", "role"];
                for(var ndx = 0; ndx < items.length; items++) {
        	        localStorage.setItem(items[ndx], '');
        	        localStorage.removeItem(items[ndx]);
                }
                clear_timer();
	            window.location.assign(HOME_URL);
        }, function(){alertify.error("Redirect to the Home page canceled")});
    }

    // Tab selection code for different projects
    module.openProject = function(evt, projectName) {
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
        document.getElementById(projectName).style.display = "block";
        evt.currentTarget.className += " active";

        if(projectName == "projectspace") {
            help_message = "<h1>Project Manager Page</h1><hr>";
            help_message += "<p>Manage projects</p>";
            help_message += "<h2>Project list table</h2>";
            help_message += "<p>This table shows a list <strong>owned projects</strong> and <strong>created projects</strong>. ";
            help_message += "You can change between these project types by clicking on the corresponding tabs.  ";
            help_message += "To access the project's information, click on a table row. ";
            help_message += "You can filter the projects, by typing text associated with the project or setting the filter date.</p>";
            help_message += "<h2>Project Workflow</h2>";
            help_message += "<p>A typical project creation process is as follows:<br>";
            help_message += "Create a new project.<br>";
            help_message += "Upload an OGG Vorbis audio file (1 channel, 16kHz).<br>";
            help_message += "Create tasks -- split the audio into regions that are allocated to editors.<br>";
            help_message += "Assign tasks -- once the tasks have been created, assign them to the editors<br></p>";

            help_message += "<h2>Buttons</h2>";
            help_message += "<p><b>Refresh</b> -- refresh the project list.</p>";
            help_message += "<h2>Navigation</h2>";
            help_message += "<p><b>Home</b> -- return you to the Home page.<br>";
            help_message += "<b>Refresh Projects</b> -- refresh the project list.<br>";
            help_message += "<b>Create Project</b> -- create a new project.<br>";
            help_message += "<b>Update Password</b> -- update your password.<br>";
            help_message += "<b>Logout</b> -- logout and return to the Home page.<br>";
            help_message += "<b>Help</b> -- provides this message.</p>";

        } else {
            help_message = "<h1>Project Manager Page</h1><hr>";
            help_message += "<p>A display of created projects. You do not have access to these projects.</p>";
        }
        active_project_view = projectName;
    }

  // Add filter results input
    function addfilter() {
   	    var fil = document.getElementById("filterproject");
        var content = '<table style="border: none; width: 100%;"><tr><td>';
        content += '<input type="text" id="myInput" style="background-size: 5%; width: 80%" onkeyup="Project.filterprojects();" placeholder="Filter projects by any displayed project text..." title="Type in a name, surname, username or full name"/>';
        content += '</td><td align="right"><label>Filter by Date:</label>&nbsp;<input type="date" id="myCal" onchange="Project.filterprojects();" /></td></tr></table>';
        fil.innerHTML = content;
    }

    // Remove filter results input
    function removefilter() {
   	    var fil = document.getElementById("filterproject");
        fil.innerHTML = "";
    }

    // show the project tab
    function showprojecttab() {
   	    var tab = document.getElementById("projecttab");
        tab.style.display = "block";
        tab.style.border = "1px solid #ccc";

   	    var tab = document.getElementById("projectspace");
        tab.style.borderTop = "none";
    }

    // hide the project tab
    function hideprojecttab() {
   	    var tab = document.getElementById("projecttab");
        tab.style.display = "none";
        tab.style.border = "none";

   	    var tab = document.getElementById("projectspace");
        tab.style.borderTop = "1px solid #ccc";
    }

    // Get a list of categories from the app server
    function get_categories() {
        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data["token"] = localStorage.token;
	    appserver_send(APP_PLISTCATEGORIES, data, categories_callback);
    }

    // Save the categories
    var categories;
    function categories_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                categories = response_data["categories"];
                document.body.className = 'vbox viewport';
		    } else { 
			    alertify.alert("CATEGORIES ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("CATEGORIES Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Get a list of languages from the app server
    function get_languages() {
        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data["token"] = localStorage.token;
	    appserver_send(APP_PLISTLANGUAGES, data, languages_callback);
    }

    // Get languages callback
    var languages;
    function languages_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                languages = response_data["languages"];
                languages.sort();
                document.body.className = 'vbox viewport';
		    } else { 
			    alertify.alert("LANGUAGES ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("LANGUAGES Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Get a list of users from the app server
    function get_users() {
        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data["token"] = localStorage.token;
	    appserver_send(APP_PLOADUSERS, data, users_callback);
    }

    // Get users callback
    var users;
    var editors = {};
    var projectmanagers = {};
    function users_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Users loaded");
                users = response_data;
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
            if(role.indexOf(PROJECT_ROLE) != -1) {
                projectmanagers[key] = users[key];
            }
            if(role.indexOf(EDITOR_ROLE) != -1) {
                editors[key] = users[key];
            }
        }
        document.body.className = 'vbox viewport';
    }

    // Get projects owned by this user
    function get_projects() {
        if(GUI_STATE == "LS") {
            clear_timer();
            addfilter();
            showprojecttab();
            document.body.className = 'vbox viewport waiting';
	        var data = {};
	        data["token"] = localStorage.token;
	        appserver_send(APP_PLISTPROJECTS, data, projects_callback);
        }
    }

    // Get all projects
    function get_all_projects() {
        clear_timer();
        GUI_STATE = "LS";
        get_projects();
        get_createdprojects();
    }

    module.get_all_projects = function() {
        get_all_projects();
    };

    // Project application server response
    var projects;
    function projects_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                //alertify.success("Retrieved Projects");
                projects = response_data;
                display_projects(response_data);
                document.getElementById("defproject").click();
                document.body.className = 'vbox viewport';
		    } else { 
			    alertify.alert("LISTPROJECTS ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("LISTPROJECTS Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Get all projects created by this user
    function get_createdprojects() {
        if(GUI_STATE == "LS") {
            document.body.className = 'vbox viewport waiting';
    	    var data = {};
    	    data["token"] = localStorage.token;
    	    appserver_send(APP_PLISTCREATEDPROJECTS, data, createdprojects_callback);
        }
    }

    // Project application server response
    var created_projects;
    function createdprojects_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                //alertify.success("Retrieved create projects");
                created_projects = response_data;
                display_createdprojects(response_data);
		    } else { 
			    alertify.alert("LISTCREATEDPROJECTS ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("LISTCREATEDPROJECTS Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

   // Filter list as user types
    module.filterprojects = function() {
        if(active_project_view == "projectspace") {
            display_projects(projects);
        } else {
            display_createdprojects(created_projects);
        }
    }

    // Zero pad a string
    function pad(string, size) {
        var s = string.toString();
        while (s.length < (size || 2)) {s = "0" + s;}
        return s;
    }

    // Do a search for sub string in name, surname and username
    function searchcheck(obj, projman, collator) {
        var input, filter, cal, select_date;
        input = document.getElementById("myInput");
        if(input === undefined) { return false; }
        filter = input.value.toUpperCase();

        select_date = document.getElementById("myCal");
        if(select_date === undefined) { return false; }

        var d = new Date();
        d.setTime(parseFloat(obj["creation"])*1000.0);
        function checksearchstring() {
            // Search through project details
            var items = ["projectname", "category", "errstatus"];
            for(var ndx = 0; ndx < items.length; ndx++) {
                if(notset.indexOf(obj[items[ndx]]) === -1) {
                    if (obj[items[ndx]].toUpperCase().indexOf(filter) > -1) {
                        return true;
                    }
                }
            }

            if (projman.toUpperCase().indexOf(filter) > -1) { return true; }

            if (collator.toUpperCase().indexOf(filter) > -1) { return true; }

            // Include string version of the date
            var ds = d.toDateString();
            if (ds.toUpperCase().indexOf(filter) > -1) { return true; }
            return false;
        }
        var ssr = checksearchstring();

        // User may be filtering by date picker
        if(select_date.value.length > 0) {
            projdate = d.getFullYear() + "-" + pad(d.getMonth()+1, 2) + "-" + pad(d.getDate(), 2);
            if(projdate == select_date.value) {
                if(ssr === true ) { return true;
                } else { return false; }
            } else { return false; }
        }

        return ssr;
    }

    // Display owned projects
    var pdisplay;
    function display_projects(data) {
        var ps = document.getElementById("projectspace");
        var data = data["projects"];

        if(data.length > 0) {
            pdisplay = [];
            for (var i = 0, len = data.length; i < len; i++) {
                var obj = data[i];
                pdisplay.push([i, obj["projectname"], obj["projectmanager"], obj["collator"], obj["category"], parseFloat(obj["creation"]), obj["errstatus"]]);
            }

            // Sort projects by time
            pdisplay.sort(function(a, b) { return a[1] > b[1] ? 1 : -1; });

            var context;
            context = "<table class='project'>";
            context += "<tr><th>PROJECTS</th></tr>"
            for (var i = 0, len = pdisplay.length; i < len; i++) {
                var obj = data[pdisplay[i][0]];
                var projman = "Not Selected";
                if(users.hasOwnProperty(obj["projectmanager"])) {
                    projman = users[obj["projectmanager"]]["name"] + " " + users[obj["projectmanager"]]["surname"];
                }
                var collator = "Not Selected";
                if(users.hasOwnProperty(obj["collator"])) {
                    collator = users[obj["collator"]]["name"] + " " + users[obj["collator"]]["surname"];
                }

                var result = searchcheck(obj, projman, collator);
                if(result === true) {
                    context += "<tr onclick='Project.project_selected("+ pdisplay[i][0] +")'>";
                } else {
                    context += "<tr style='display: none;' onclick='Project.project_selected("+ pdisplay[i][0] +")'>";
                }
                context += "<td><strong style='color: #395870;'>" + obj["projectname"] + "</strong> <span class='text-offset' style='padding: none;'><table><tr>";

                if(notset.indexOf(obj["jobid"]) === -1) {
                    context += '<td><strong>This project is locked while a speech job is running</strong></td></tr></table></span></td></tr>';
                } else if(notset.indexOf(obj["errstatus"]) === -1) {
                    context += '<td style="color: red;">ERRSTATUS: <strong>' + obj["errstatus"] +'</strong></td></tr></table></span></td></tr>';
                } else {
                    context += "<td style='border: none;'> PROJECT MANAGER: <strong>" + projman + "</strong></td>";
                    context += "<td style='border: none;'> COLLATOR: <strong>" + collator + "</strong></td>";
                    context += "<td style='border: none;'> CATEGORY: <strong>" + obj["category"] + "</strong></td>";
                    var d = new Date();
                    d.setTime(parseFloat(obj["creation"])*1000.0);
                    context += "<td style='border: none;'>CREATED: <strong>" + d.toDateString() + "</strong></td></tr></table></span></td></tr>";
                }
            }
            context += "</table>";
            refresh_timer();
        } else {
            context = "<p>No projects</p>";
        }
        ps.innerHTML = context;
        document.body.className = 'vbox viewport';
    }

    // Display created projects
    var cpdisplay;
    function display_createdprojects(data) {
        var cps = document.getElementById("created");
        var data = data["projects"];

        if(data.length > 0) {
            var cpdisplay = [];
            for (var i = 0, len = data.length; i < len; i++) {
                var obj = data[i];
                cpdisplay.push([i, obj["projectname"], obj["projectmanager"], obj["collator"], obj["category"], parseFloat(obj["creation"]), obj["errstatus"]]);
            }

            // Sort projects by time
            cpdisplay.sort(function(a, b) { return a[1] > b[1] ? 1 : -1; });

            var context;
            context = "<table class='project'>";
            context += "<tr><th>CREATED PROJECTS</th></tr>"
            for (var i = 0, len = cpdisplay.length; i < len; i++) {
                var obj = data[cpdisplay[i][0]];
                var projman = "Not Selected";
                if(users.hasOwnProperty(obj["projectmanager"])) {
                    projman = users[obj["projectmanager"]]["name"] + " " + users[obj["projectmanager"]]["surname"];
                }
                var collator = "Not Selected";
                if(users.hasOwnProperty(obj["collator"])) {
                    collator = users[obj["collator"]]["name"] + " " + users[obj["collator"]]["surname"];
                }

                var result = searchcheck(obj, projman, collator);
                if(result === true) {
                    context += "<tr>";
                } else {
                    context += "<tr style='display: none;'>";
                }
                context += "<td><strong style='color: #395870;'>" + obj["projectname"] + "</strong> <span class='text-offset' style='padding: none;'><table><tr>";
                context += "<td style='border: none;'> PROJECT MANAGER: <strong>" + projman + "</strong></td>";
                context += "<td style='border: none;'> COLLATOR: <strong>" + collator + "</strong></td>";
                context += "<td style='border: none;'> CATEGORY: <strong>" + obj["category"] + "</strong></td>";
                var d = new Date();
                d.setTime(parseFloat(obj["creation"])*1000.0);
                context += "<td style='border: none;'>CREATED: <strong>" + d.toDateString() + "</strong></td></tr></table></span></td></tr>";
            }
            context += "</table>";
            cps.innerHTML = context;
            refresh_timer();
        } else {
            cps.innerHTML = "<p>No projects</p>";
        }
        document.body.className = 'vbox viewport';
    }

    // User selected project and set selected variable
    var selected;
    module.project_selected = function(i) {
        GUI_STATE = "PS";
        clear_timer();
        var obj = projects["projects"][i];
        selected = i;

        help_message = "<h1>Project Manager Page</h1><hr>";
        help_message += "<p>A displayed of the selected project's information.</p>";
        help_message += "<h2>Project information</h2>";
        help_message += "<p>This project view shows all the project information. ";
        help_message += "You can click on the project-related buttons, depending on the project state, to perform certain actions on the projects. ";
        help_message += "Once you have uploaded audio, the next step is to create tasks. After creating tasks you can assign them to the editors. ";
        help_message += "Once assigned, you cannot access the project tasks. </p>";

        help_message += "<h2>Buttons</h2>";
        help_message += "<p><b>Refresh</b> -- refresh the project list.<br>";
        help_message += "<b>Create/Edit Tasks</b> -- create tasks or edit existing tasks for editors by splitting up the audio.<br>";
        help_message += "<b>Assign Tasks</b> -- assign create editor tasks to the editors. <strong>Once you have pressed the assign button you CANNOT edit created tasks.</strong><br>";
        //help_message += "<b>Update Project info</b> -- update the information of a project that has been assigned. You can only change <strong>Project Manager, Project Category and Collators</strong>.<br>";
        help_message += "<b>Delete Project</b> -- delete the project and remove all editor tasks.<br>";
        help_message += "<b>Clear Project Error</b> -- clear a project error so you can access the project. This may occur when a requested speech service terminated incorrectly.<br>";
        help_message += "<b>Unlock Project</b> -- unlock a project that has been locked by a requested speech service. The project will be highlighted red when locked.<br>";
        help_message += "<b>Go Back</b> -- return to the project list view.</p>";

        help_message += "<h2>Navigation</h2>";
        help_message += "<p><b>Home</b> -- return you to the Home page.<br>";
        help_message += "<b>Refresh Projects</b> -- refresh the project list.<br>";
        help_message += "<b>Create Project</b> -- create a new project.<br>";
        help_message += "<b>Update Password</b> -- update your password.<br>";
        help_message += "<b>Logout</b> -- logout and return to the Home page.<br>";
        help_message += "<b>Help</b> -- provides this message.</p>";

        removefilter();
        hideprojecttab();
        var content;

        if(notset.indexOf(obj["errstatus"]) === -1) {
            var ps = document.getElementById("projectspace");
            ps.innerHTML = "";
            content = "<dl>";
            content += "<dt style='background: #ff0000;'>PROJECT ERROR STATUS:</dt><dd>" + obj["errstatus"] + "</dd>";
            content += '<button onclick="Project.clearerror_project()">Clear Project Error</button>&nbsp;&nbsp;<button onclick="Project.goback()">Go Back</button></div>';
            ps.innerHTML = content;
        } else {
            if(obj["assigned"] != "Y") {
                add_progress();
                var ps = document.getElementById("step_prompt");
                ps.innerHTML = "";

                content = "<table class='project'><tr><th colspan='2' style='background-color: #4CAF50; color: white;'>STEP 1: PROJECT NAME</th></tr>";
                content += "<tr><td id='projectname'></td><td></td></tr></table>";
                ps.innerHTML = content;
                var step = document.getElementById("step1");
                step.innerHTML = "<img src='/speechui/static/one_fill.png' width='30%' height='30%'>";

                content = "<table class='project'><tr><th colspan='2' style='background-color: #4CAF50; color: white;'>STEP 2: PROJECT MANAGER</th></tr>";
                content += "<tr><td id='projectmanager'></td><td></td></tr></table>";
                ps.innerHTML += content;
                step = document.getElementById("step2");
                step.innerHTML = "<img src='/speechui/static/two_fill.png' width='30%' height='30%'>";

                content = "<table class='project'><tr><th colspan='2' style='background-color: #4CAF50; color: white;'>STEP 3: PROJECT CATEGORY</th></tr>";
                content += "<tr><td id='projectcategory'></td><td></td></tr></table>";
                ps.innerHTML += content;
                step = document.getElementById("step3");
                step.innerHTML = "<img src='/speechui/static/three_fill.png' width='30%' height='30%'>";

                if(obj["audiofile"] == undefined) {
                    content = "<table class='project'><tr><th colspan='2' style='background-color: #4CAF50; color: white;'>STEP 4: PROJECT AUDIO</th></tr>";
                    content += '<tr><td><input type="file" onchange="Project.check_audio()"></td>';
                    content += "<td align='right'><button id='upload_btn' onclick='Project.upload_audio()'>Upload</button></td></tr></table>";
                } else {
                    content = "<table class='project'><tr><th colspan='2' style='background-color: #4CAF50; color: white;'>STEP 4: PROJECT AUDIO DURATION</th></tr>";
                    content += "<tr><td id='projectaudio'></td><td></td></tr></table>";
                    ps.innerHTML += content;
                    step = document.getElementById("step4");
                    step.innerHTML = "<img src='/speechui/static/four_fill.png' width='30%' height='30%'>";

                    if(notset.indexOf(obj["jobid"]) === -1) {
                        content = "<table class='project'><tr><th colspan='2' style='background-color: #4CAF50; color: white;'>STEP 5: PROJECT TASKS -- LOCKED</th></tr>";
                        content += "<tr><td>PROJECT LOCKED BY RUNNING SPEECH PROCESS <button onclick='Project.unlock_project()'>Unlock Project</button></td><td></td></tr></table>";
                    } else {
                        content = "<table class='project'><tr><th colspan='2' style='background-color: #4CAF50; color: white;'>STEP 5: PROJECT TASKS</th></tr>";
                        content += "<tr><td><button onclick='Project.task_project()'>Create/Edit Tasks</button></td><td></td></tr></table>";
    
                        content += "<table class='project'><tr><th colspan='2' style='background-color: #4CAF50; color: white;'>STEP 6: PROJECT COLLATOR ASSIGNMENT</th></tr><tr><td>";
                        content += "<select id='colsel' onchange='Project.assign_collator(this.id,this.value)'>";
                        content += '<option value="null">Collators...</option>';
                        var ed_users = [];
                        var ed_key = {};
                        for(var key in editors) {
                            var tmp = editors[key]["name"] + " " + editors[key]["surname"];
                            ed_users.push(tmp);
                            ed_key[tmp] = key;
                        }
                        ed_users.sort();
                        for(var ndx = 0; ndx < ed_users.length; ndx++) {
                            content += '<option value="' + ed_key[ed_users[ndx]] + '">' + ed_users[ndx] + '</option>';
                        }
                        content += "</select></td><td><button onclick='Project.assign_tasks()'>Assign Tasks</button></td></tr></table>";
                    }
                }

                content += '<div><button onclick="Project.delete_project()">Delete Project</button>&nbsp;&nbsp;<button onclick="Project.goback()">Go Back</button></div>';
                ps.innerHTML += content;

                var pe = document.getElementById("projectname");
                pe.innerHTML = obj["projectname"];
                pe = document.getElementById("projectmanager");
                pe.innerHTML = projectmanagers[obj["projectmanager"]]["name"] + " " + projectmanagers[obj["projectmanager"]]["surname"];
                pe = document.getElementById("projectcategory");
                pe.innerHTML = obj["category"];

                if(obj["audiofile"] == undefined) {
                    document.getElementById("upload_btn").disabled = true;
                } else {
                    var date = new Date(null);
                    date.setSeconds(parseFloat(obj["audiodur"])); // specify value for SECONDS here
                    pe = document.getElementById("projectaudio");
                    pe.innerHTML = date.toISOString().substr(11, 12);
                }

                if(obj["collator"] !== null) {
                  var gh = document.getElementById('colsel');
                  gh.value = obj["collator"];
                }
            } else {
                var ps = document.getElementById("projectspace");
                ps.innerHTML = "";
                content = "<dl>";
                content += "<dt>PROJECT NAME:</dt><dd>" + obj["projectname"] + "</dd>";
                content += "<dt>PROJECT MANAGER:</dt><dd>" + projectmanagers[obj["projectmanager"]]["name"] + " " + projectmanagers[obj["projectmanager"]]["surname"] + "</dd>";
                content += "<dt>PROJECT CATEGORY:</dt><dd>" + obj["category"] + "</dd>";
                var date = new Date(null);
                date.setSeconds(parseFloat(obj["audiodur"])); // specify value for SECONDS here
                content += "<dt>PROJECT AUDIO DURATION:</dt><dd>" + date.toISOString().substr(11, 12) + "</dd>";
                content += "<dt>PROJECT COLLATOR:</dt><dd>" + editors[obj["collator"]]["name"] + " " + editors[obj["collator"]]["surname"] + "</dd>";
                content += "<dt>PROJECT ASSIGNED:</dt><dd> YES </dd></dl>";
                content += '<div><button onclick="Project.delete_project()">Delete Project</button>&nbsp;&nbsp;<button onclick="Project.goback()">Go Back</button></div>';
                ps.innerHTML = content;
            }
        }
    }

    // User has assigned a collator
    var changes;
    module.assign_collator = function(id, value) {
        var obj = projects["projects"][selected];
        obj["collator"] = value;
        changes = true;
    }

    // Go back to listing projects
    module.goback = function() {
        if(changes) {
            alertify.confirm('There are unsaved changes to this project. Leave anyway?',
                function() {
                GUI_STATE = "LS";
                changes = false;
                selected = -1;
                addfilter();
                showprojecttab();
                display_projects(projects);
            }, function(){});
        } else {
            GUI_STATE = "LS";
            addfilter();
            showprojecttab();
            selected = -1;
            display_projects(projects);
        }
    }

    // Save current project information and goto tasks splitter
    module.task_project = function() {
        if(selected == -1) {
            alertify.alert("Please select a project before trying to create tasks!", function(){});
            return false;
        }

        var obj = projects["projects"][selected];
        if(obj["assigned"] == "Y") {
            alertify.alert("This project has been assigned so you will not be able to create tasks!", function(){});
            return false;
        }

        if(notset.indexOf(obj["audiofile"]) !== -1) {
            alertify.alert("Please upload an OGG Vorbis, single channel audio file!", function(){});
            return false;
        }

        if(obj["jobid"] !== null) {
            alertify.alert("This project has been locked by a speech service request and is waiting for process to finish!", function(){});
            return false;
        }

        localStorage.setItem("project", JSON.stringify(obj));
        localStorage.setItem("editors", JSON.stringify(editors));
        localStorage.setItem("languages", JSON.stringify(languages));
        clear_timer();
	    window.location.assign(TASK_URL);
    }

    // Update project - can only happen after assignment
    module.update_project = function() {
        if(selected == -1) {
            alertify.alert("Please select a project that you would like to update!", function(){});
            return false;
        }

        var obj = projects["projects"][selected];
        /*if(obj["assigned"] == "N") {
            alertify.alert("Project must been assigned first before updating!", function(){});
            return false;
        }*/

        if(obj["jobid"] !== null) {
            alertify.alert("This project has been locked by a speech service request and is waiting for process to finish!", function(){});
            return false;
        }

        document.body.className = 'vbox viewport waiting';
	    var data = {};
        var tasks = {};
        var project = {};

         // Setup project information
        project["projectname"] = obj["projectname"];
        project["category"] = obj["category"];
        project["projectmanager"] = obj["projectmanager"];
        project["collator"] = obj["collator"];
        project["projectstatus"] = obj["projectstatus"];
        project["errstatus"] = obj["errstatus"];

        // Setup request body
	    data["token"] = localStorage.token;
        data["projectid"] = obj["projectid"];
        data["project"] = project;
	    appserver_send(APP_PUPDATEPROJECT, data, update_project_callback);
    }

    // Update project callback
    function update_project_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Project updated");
                GUI_STATE = "LS";
                get_projects();
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("UPDATEPROJECT ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("UPDATEPROJECT Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Assign tasks
    module.assign_tasks = function() {
        if(selected == -1) {
            alertify.alert("No project selected!", function(){});
            return false;
        }

        var obj = projects["projects"][selected];
        if(notset.indexOf(obj["jobid"]) == -1) {
            alertify.alert("This project has been locked by a speech service request and is waiting for process to finish!", function(){});
            return false;
        }

        if(notset.indexOf(obj["audiofile"]) !== -1) {
            alertify.alert("Please upload an audio file and create tasks before assigning tasks!", function(){});
            return false;
        }

        if(obj["assigned"] == "Y") {
            alertify.alert("This project has been assigned already!", function(){});
            return false;
        }

        if(notset.indexOf(obj["collator"]) !== -1) {
            alertify.alert("Please select a collator before assigning the tasks!", function(){});
            return false;
        }

        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data["token"] = localStorage.token;
        data["projectid"] = obj["projectid"];
        data["collator"] = obj["collator"];
	    appserver_send(APP_PASSIGNTASKS, data, assign_tasks_callback);
    }

    // Assign task callback
    function assign_tasks_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
			    alertify.success("Tasks assigned to Editors");
                GUI_STATE = "LS";
                get_projects();
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("ASSIGNTASKS ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("ASSIGNTASKS Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // User has selected a file - check file type
    var audio_dur;
    var audio_file = null;
    var audio_result = null;
    module.check_audio = function() {
        //document.body.className = 'vbox viewport waiting';
        var file = document.querySelector('input[type=file]').files[0];
        var reader = new FileReader();

        reader.addEventListener("load", function () {
            //save_audio(file, reader.result);
            audio_file = file;
            audio_result = reader.result;
            document.getElementById("upload_btn").disabled = false;
        }, false);

        if (file) {
            // Check if audio is OGG Vorbis
            if(file.type != "audio/ogg") {
                alertify.alert("Only Vorbis OGG audio file format supported. Please convert your audio file before uploading!", function(){});
                audio_file = null;
                audio_result = null;
                return false;
            }

            // Stop user from uploading file larger than 100 Mb
            if(file.size > (100*1024*1024)) {
                alertify.alert("Audio file is too large -- check number of channels, sampling rate and encoding quality!", function(){});
                audio_file = null;
                audio_result = null;
                return false;
            }

            reader.readAsBinaryString(file);
        }
    }

    // User wants to upload an audio file
    module.upload_audio = function() {
        alertify.alert("Your audio file is going to be uploaded shortly. You will be returned to the project list after the upload has completed.", function(){});
        save_audio(audio_file, audio_result);
    }

    // Push audio to application server
    function save_audio(file, binary) {
        if(selected == -1) {
            alertify.alert("Please select a project first before uploading an audio file!", function(){});
            return false;
        }

        var obj = projects["projects"][selected];
        var boundary = "e672106676d345be8a7f2d4afe93feab";
        var data = "--" + boundary;

        data += "\r\n";
        data += 'Content-Disposition: form-data; name="token"; filename="token"\r\n';
        data += "\r\n";
        data += localStorage.token;
        data += "\r\n";
        data += "--" + boundary;
        data += "\r\n";

        data += 'Content-Disposition: form-data; name="projectid"; filename="projectid"\r\n';
        data += "\r\n";
        data += obj["projectid"];
        data += "\r\n";
        data += "--" + boundary;
        data += "\r\n";

        data += 'Content-Disposition: form-data; name="filename"; filename="filename"\r\n';
        data += "\r\n";
        data += file.name;
        data += "\r\n";
        data += "--" + boundary;
        data += "\r\n";

        data += 'Content-Disposition: form-data; name="file"; filename="' + file.name + '"\r\n';
        data += "\r\n";
        data += binary;
        data += "\r\n";
        data += "--" + boundary + "--";
        data += "\r\n";

        try {
            if (typeof XMLHttpRequest.prototype.sendAsBinary == 'undefined') {
                XMLHttpRequest.prototype.sendAsBinary = function(text){
                var data = new ArrayBuffer(text.length);
                var ui8a = new Uint8Array(data, 0);
                for (var i = 0; i < text.length; i++) ui8a[i] = (text.charCodeAt(i) & 0xff);
                    this.send(ui8a);
                }
            }
        } catch (e) {}

	    var xmlhttp = new XMLHttpRequest();
	    xmlhttp.onreadystatechange = function() {save_audio_callback(xmlhttp)};
	    xmlhttp.open("POST", APP_PUPLOADAUDIO, true);
        xmlhttp.setRequestHeader('Content-Type','multipart/form-data; boundary=' + boundary);
	    xmlhttp.sendAsBinary(data);
    }

    // Check audio upload application server response
    function save_audio_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Audio Uploaded");
                GUI_STATE = "LS";
                get_projects();
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("UPLOADAUDIO ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("UPLOADAUDIO Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Get details for a new project
    module.new_project = function() {
        GUI_STATE = "NP"
        clear_timer();
        var ps = document.getElementById("projectspace");
        ps.innerHTML = "";

        document.getElementById("defproject").click();

        help_message = "<h1>Project Manager Page</h1><hr>";
        help_message += "<p>Create a new project.</p>";
        help_message += "<h2>New Project</h2>";
        help_message += "<p>Provide a <strong>Project Name</strong>, select a <strong>Project Manager</strong> and select a <strong>Project Category</strong>. ";
        help_message += "An empty project will then be created an return you to the main project page. Next, you must select the project and upload project audio.";
        help_message += "After uploading the audio you will be returned to main project page. At this stage you should create editing tasks.";
        help_message += "Once done creating the editing tasks you can assign the tasks to the editors.</p>";

        help_message += "<h2>Buttons</h2>";
        help_message += "<p><b>Refresh</b> -- refresh the project list.<br>";
        help_message += "<b>Create Project</b> -- create a new project.<br>";
        help_message += "<b>Cancel</b> -- cancel project creation process.</p>";
        help_message += "<h2>Navigation</h2>";
        help_message += "<p><b>Home</b> -- return you to the Home page.<br>";
        help_message += "<b>Refresh Projects</b> -- refresh the project list.<br>";
        help_message += "<b>Create Project</b> -- create a new project.<br>";
        help_message += "<b>Update Password</b> -- update your password.<br>";
        help_message += "<b>Logout</b> -- logout and return to the Home page.<br>";
        help_message += "<b>Help</b> -- provides this message.</p>";

        removefilter();
        hideprojecttab();
        add_progress();
        module.get_projectdetails('name');
    }

    // Check project details and add steps progress
    function add_progress() {
        var ps = document.getElementById("projectspace");
        var content = "";

        // Project name -> project manager -> categories -> audio upload -> tasks -> assign
        content = "<table style='border-collapse: collapse; border-spacing: 0;border: none; padding: 0;'><tr>";
        content += "<td width='8%' style='text-align: center; border: none; padding: 0;'><div id='step1'><img src='/speechui/static/one.png' width='30%' height='30%'></div></td>";
        content += "<td width='8%' style='text-align: center; border: none; padding: 0;'><div><img src='/speechui/static/line.png'></div></td>";
        content += "<td width='8%' style='text-align: center; border: none; padding: 0;'><div id='step2'><img src='/speechui/static/two.png' width='30%' height='30%'></div></td>";
        content += "<td width='8%' style='text-align: center; border: none; padding: 0;'><div><img src='/speechui/static/line.png'></div></td>";
        content += "<td width='8%' style='text-align: center; border: none; padding: 0;'><div id='step3'><img src='/speechui/static/three.png' width='30%' height='30%'></div></td>";
        content += "<td width='8%' style='text-align: center; border: none; padding: 0;'><div><img src='/speechui/static/line.png'></div></td>";
        content += "<td width='8%' style='text-align: center; border: none; padding: 0;'><div id='step4'><img src='/speechui/static/four.png' width='30%' height='30%'></div></td>";
        content += "<td width='8%' style='text-align: center; border: none; padding: 0;'><div><img src='/speechui/static/line.png'></div></td>";
        content += "<td width='8%' style='text-align: center; border: none; padding: 0;'><div id='step5'><img src='/speechui/static/five.png' width='30%' height='30%'></div></td>";
        content += "<td width='8%' style='text-align: center; border: none; padding: 0;'><div><img src='/speechui/static/line.png'></div></td>";
        content += "<td width='8%' style='text-align: center; border: none; padding: 0;'><div id='step6'><img src='/speechui/static/six.png' width='30%' height='30%'></div></td>";
        content += "</tr></table><div id='step_prompt'></div>";
        ps.innerHTML = content;
    }

    // Get the user to add the project details as needed in a step-by-step process
    module.get_projectdetails = function(phase) {
        var ps = document.getElementById("step_prompt");
        var content;

        if(phase == "name") {
            ps.innerHTML = "";
            content = "<table class='project'><tr><th colspan='2' style='background-color: #4CAF50; color: white;'>STEP 1: PROJECT NAME</th></tr>";
            content += "<tr><td><input type='text' name='projectname' placeholder='Enter a project name' id='projectname'/></td>";
            content += "<td align='right'><button id='stepbutton1' onclick='Project.get_projectdetails(\"manager\")'>Next</button></td></tr></table>";
            ps.innerHTML = content;
        } else if(phase == "manager") {
            var pn = document.getElementById("projectname");

            if(pn.value.length == 0) {
                alertify.alert("Please enter a project name!", function(){});
                return false;
            }
            var projectname = pn.value;

            var step = document.getElementById("step1");
            step.innerHTML = "<img src='/speechui/static/one_fill.png' width='30%' height='30%'>";
            $("#stepbutton1").remove();

            content = "<table class='project'><tr><th colspan='2' style='background-color: #4CAF50; color: white;'>STEP 2: PROJECT MANAGER</th></tr>";
            content += '<tr><td><select id="projectmanager"><option value="null">Project Managers...</option>';
            var pj_users = [];
            var pj_key = {};
            for(var key in projectmanagers) {
                var tmp = projectmanagers[key]["name"] + " " + projectmanagers[key]["surname"];
                pj_users.push(tmp);
                pj_key[tmp] = key;
            }
            pj_users.sort();
            for(var ndx = 0; ndx < pj_users.length; ndx++) {
                content += '<option value="' + pj_key[pj_users[ndx]] + '">' + pj_users[ndx] + '</option>';
            }
            content += '</select></td>';
            content += "<td align='right'><span id='stepbutton2'><button onclick='Project.get_projectdetails(\"category\")'>Next</button></span></td></tr></table>";
            ps.innerHTML += content;
            var pn = document.getElementById("projectname");
            pn.value = projectname;
        } else if(phase == "category") {
            var pn = document.getElementById("projectname");
            var pm = document.getElementById("projectmanager");

            if(pm.value == "null") {
                alertify.alert("Please select a project manager!", function(){});
                return false;
            }
            var projectname = pn.value;
            var projectmanager = pm.value;

            var step = document.getElementById("step2");
            step.innerHTML = "<img src='/speechui/static/two_fill.png' width='30%' height='30%'>";
            $("#stepbutton2").remove();

            content = "<table class='project'><tr><th colspan='2' style='background-color: #4CAF50; color: white;'>STEP 3: PROJECT CATEGORY</th></tr>";
            content += '<tr><td><select id="projectcategory"><option value="null">Categories...</option>';

            for(var i = 0 ; i < categories.length; i++) {
                var key = categories[i];
                content += '<option value="' + key + '">' + key + '</option>';
            }

            content += '</select></td>';
            content += "<td align='right'><button id='stepbutton3' onclick='Project.get_projectdetails(\"create\")'>Next</button></td></tr></table>";
            ps.innerHTML += content;
            var pn = document.getElementById("projectname");
            var pm = document.getElementById("projectmanager");
            pn.value = projectname;
            pm.value = projectmanager;
        } else if(phase == "create") {
            var pn = document.getElementById("projectname");
            var pm = document.getElementById("projectmanager");
            var pc = document.getElementById("projectcategory");
            if(pc.value == "null") {
                alertify.alert("Please select a project category!", function(){});
                return false;
            }
            var projectname = pn.value;
            var projectmanager = pm.value;
            var projectcategory = pc.value;

            var pn = document.getElementById("projectname");
            var pm = document.getElementById("projectmanager");
            var pc = document.getElementById("projectcategory");
            pn.value = projectname;
            pm.value = projectmanager;
            pc.value = projectcategory;

            alertify.confirm("At this point we are going to create the project, refresh the projects, and return you to the project list after!\nIs all the project information correct?",
                function() {
                    GUI_STATE = "LS";
                    module.create_project();
                }, function(){"Project creation canceled"});
         } else {
           // Do nothing -- user has done something wrong
         }
    }

    // Go ahead and create new project
    module.create_project = function() {
	    var projectname = document.getElementById("projectname").value;

	    // Test if projectname set
	    if(projectname == "") {
            alertify.alert("Please enter a project name!", function(){});
            return false;
	    }

        // Check project manager has been selected
        var e = document.getElementById("projectmanager");
        var pjm = e.options[e.selectedIndex].value;
        if(pjm === "null") {
            alertify.alert("Please select a project manager!", function(){});
            return false;
        }

        // Check project category has been selected
        var e = document.getElementById("projectcategory");
        var cat = e.options[e.selectedIndex].value;
        var cattext = e.options[e.selectedIndex].text;
        if(cat === "null") {
            alertify.alert("Please select a project category!", function(){});
            return false;
        }

        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data["token"] = localStorage.token;
        data["projectname"] = projectname;
        data["projectmanager"] = pjm;
        data["category"] = cattext;
        data["projectstatus"] = "Created";
	    appserver_send(APP_PCREATEPROJECT, data, create_projects_callback);
        return true;
    }

    // Check create project application server response
    function create_projects_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Project Created");
                GUI_STATE = "LS";
                get_projects();
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("CREATEPROJECT ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("CREATEPROJECT Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // User cancelled new project - display current list
    module.project_cancel = function() {
        GUI_STATE = "LS";
        display_projects(projects);
    }

    // Delete the selected project
    module.delete_project = function() {
        if(selected == -1) {
            alertify.alert("Please select a project to delete!", function(){});
            return false;
        }

        alertify.confirm("Are you sure you want to delete this project?",
            function() {
                remove_project(selected);
            }, function(){"Project deletion canceled"});
    }

    // Delete project from application server
    function remove_project(ndx) {
        document.body.className = 'vbox viewport waiting';
        var obj = projects["projects"][ndx];
	    var data = {};
	    data["token"] = localStorage.token;
        data["projectid"] = obj["projectid"];
	    appserver_send(APP_PDELETEPROJECT, data, remove_project_callback);
    }

    // Check remove project application server response
    function remove_project_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Project Deleted");
                GUI_STATE = "LS";
                get_projects();
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("DELETEPROJECT ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("DELETEPROJECT Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    //Remove project error message
    module.clearerror_project = function() {
        if(selected == -1) {
            alertify.alert("Please select a project before trying to clear an error!", function(){});
            return false;
        }

        document.body.className = 'vbox viewport waiting';
        var obj = projects["projects"][selected];
	    var data = {};
	    data["token"] = localStorage.token;
        data["projectid"] = obj["projectid"];
	    appserver_send(APP_PCLEARERROR, data, clearerror_project_callback);
    }

    //clear project error callback
    function clearerror_project_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Error cleared");
                GUI_STATE = "LS";
                get_projects();
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

    //Unlock project that has been closed due to speech job
    module.unlock_project = function() {
        if(selected == -1) {
            alertify.alert("Please select a project to unlock!", function(){});
            return false;
        }
        var obj = projects["projects"][selected];

        if(notset.indexOf(obj["jobid"]) !== -1) {
            alertify.alert("This project is not currently locked by speech service request!", function(){});
            return false;
        }

        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data["token"] = localStorage.token;
        data["projectid"] = obj["projectid"];
	    appserver_send(APP_PUNLOCKPROJECT, data, unlock_project_callback);
    }

    //unlock project callback
    function unlock_project_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("Unlocked project!");
                GUI_STATE = "LS";
                get_projects();
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("UNLOCKPROJECT ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("UNLOCKPROJECT Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // User is trying to logout
    module.logout = function() {
        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data['token'] = localStorage.getItem("token");
	    appserver_send(APP_PLOGOUT, data, logout_callback);
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
                clear_timer();
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

     // User wants to change their password
    function changepassword() {
        GUI_STATE = "CP";
        clear_timer();
        removefilter();
        hideprojecttab();
        document.getElementById("defproject").click();

        var ps = document.getElementById("projectspace");
        ps.innerHTML = "";

        help_message = "<h1>Project Manager Page</h1><hr>";
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
        help_message += "<b>Refresh Projects</b> -- refresh the project list.<br>";
        help_message += "<b>Create Project</b> -- create a new project.<br>";
        help_message += "<b>Update Password</b> -- update your password.<br>";
        help_message += "<b>Logout</b> -- logout and return to the Home page.<br>";
        help_message += "<b>Help</b> -- provides this message.</p>";

        var context;
        context = '<dl><dt>PASSWORD: </dt><dd style="background: #ffffff;"><input id="password" name="password" placeholder="type password" type="password" maxlength="32"/></dd>';
        context += '<dt>RE-TYPE PASSWORD: </dt><dd style="background: #ffffff;"><input id="repassword" name="repassword" placeholder="re-type password" type="password" maxlength="32"/></dd></dl>';
        context += '<div><button onclick="Project.update_password()">Update Password</button> &nbsp;&nbsp;<button onclick="Project.password_cancel()">Cancel</button></div>';
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
            alertify.alert("The passwords do not match!", function(){});
            document.body.className = 'vbox viewport';
            return false;
        }

	    var data = {};
	    data['token'] = localStorage.getItem("token");
        data["password"] = password;
	    appserver_send(APP_PCHANGEPASSWORD, data, update_password_callback);
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
        GUI_STATE = "LS";
        addfilter();
        showprojecttab();
        display_projects(projects);
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

