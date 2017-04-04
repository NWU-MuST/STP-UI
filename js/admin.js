// Admin Module

var Admin = (function (window, document, $, undefined) {

    var module = {};

    $(document).on( 'ready', check_browser );

    var help_message = "";

    // Make sure user is using chrome
    function check_browser() {
        document.body.className = 'vbox viewport';

	    var is_chrome = /chrome/.test( navigator.userAgent.toLowerCase() );
	    if((is_chrome == false) || (is_chrome == null)) {
		    alertify.alert('Sorry you must use Chrome!', function(){});
		    window.location.assign(CHROME_URL);
	    }

        if(localStorage.getItem("role") === null) {
            alertify.alert("No role selected from Home page! Redirecting you back to Home...", function(){});
		    window.location.assign(HOME_URL);
        }

        if(localStorage.getItem("token") === null) {
            alertify.alert("No token found! Redirecting you back to Home...", function(){});
		    window.location.assign(HOME_URL);
        }

        listusers();
    }

    // Redirect the user to the homepage
    module.home = function() {
        alertify.confirm('Redirecting to the Home page. Leave anyway?',
            function() {
            var items = ["username", "token", "home", "role"];
            for(var ndx = 0; ndx < items.length; items++) {
    	        localStorage.setItem(items[ndx], '');
    	        localStorage.removeItem(items[ndx]);
            }
	        window.location.assign(HOME_URL);
        }, function(){});
    }

    // User is trying to logout 
    module.logout = function() {
	    var data = {};
	    data['token'] = localStorage.getItem("token");
	    appserver_send(APP_ALOGOUT, data, logout_callback);
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
        		window.location.assign(HOME_URL);
		    } else { // Something unexpected happened
			    alertify.alert("LOGOUT ERROR: " + response_data["message"] + "\n(Status: " + xmlhttp.status + ")", function(){});
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("LOGOUT Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Get a list of registered users
    function listusers() {
        document.body.className = 'waiting';
	    var data = {};
	    data['token'] = localStorage.getItem("token");
	    appserver_send(APP_ALOADUSERS, data, listusers_callback);
    }
    module.listusers = function() { listusers(); };

    //
    var users;
    function listusers_callback(xmlhttp) {
	    // No running server detection
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    // Load users application was successful
		    if(xmlhttp.status==200) {
                alertify.success("Users loaded");
                users = response_data;
                populate_users(response_data);
		    } else { // Something unexpected happened
			    alertify.alert("LISTUSERS ERROR: " + reponse_data["message"] + "\n(Status: " + xmlhttp.status + ")", function(){});
                document.body.className = 'vbox viewport';
		    }
	    }
    }

    // Selected a column to sort by
    var asort = 0;
    module.sortselect = function(tag) {
        asort = tag;
        populate_users(users);
    }

    // Populate the users on the UI
    var udisplay;
    function populate_users(data) {
	    var adsp = document.getElementById("adminspace");

        help_message = "<h1>Administration Page</h1><hr>";
        help_message += "<p>Manage users -- add new user, delete existing users and view a user's information.</p>";
        help_message += "<h2>User list table</h2>";
        help_message += "<p>This table shows a list of registered users.";
        help_message += "You can click on a user's row to access more information pertaining to that user.";
        help_message += "Clicking on the table headings will sort the list by that heading.</p>";
        help_message += "<h2>Navigation</h2>";
        help_message += "<p><b>Home</b> -- return you to the Home page.<br>";
        help_message += "<b>Refresh Users</b> -- refresh the user's display list.<br>";
        help_message += "<b>Add User</b> -- add a user to the system.<br>";
        help_message += "<b>Logout</b> -- logout and return to the Home page.<br>";
        help_message += "<b>Help</b> -- provides the message.</p>";

        udisplay = [];
        var i = 0;
        for (var usrn in data) {
            udisplay.push([data[usrn]["name"], data[usrn]["surname"], usrn, data[usrn]["email"], data[usrn]["role"]]);
            i++;
        }

        // Sort information by what user clicks
        udisplay.sort(function(a,b){
            return a[asort] > b[asort] ? 1 : -1;
        });

        var context;
        context = "<table class='project'>";
        context += "<tr> <th onclick='Admin.sortselect(0)'>Name</th> <th onclick='Admin.sortselect(1)'>Surname</th> <th onclick='Admin.sortselect(2)'>Username</th>";
        context += "<th onclick='Admin.sortselect(3)'>Email</th> <th onclick='Admin.sortselect(4)'>Role</th> </tr>";
        for (var i = 0, len = udisplay.length; i < len; i++) {
            var obj = data[udisplay[i][2]];
            context += "<tr onclick='Admin.user_selected("+ i +")'><td>" + obj["name"] + "</td>";
            context += "<td> " + obj["surname"] + "</td>";
            context += "<td> " + udisplay[i][2] + "</td>";
            context += "<td> " + obj["email"] + "</td>";
            context += "<td> " + obj["role"] + "</td></tr>";
        }
        context += "</table>";
        adsp.innerHTML = context;
        document.body.className = 'vbox viewport';
    }

    // User selected a user and set selected variable
    var selected;
    module.user_selected = function(i) {
        var adsp = document.getElementById("adminspace");
        adsp.innerHTML = "";
        var obj = users[udisplay[i][2]];
        selected = i;

        help_message = "<h1>Administration Page</h1><hr>";
        help_message += "<p>User's information display</p>";

        help_message += "<h2>Buttons</h2>";
        help_message += "<p><b>Go Back</b> -- return you to the main Adminstration page<br>";
        help_message += "<b>Delete User</b> -- remove user from the system.<br>";
        help_message += "<b>Reset Password</b> -- reset the user's password. An email containing the new temporay password will be sent to the user's email address.";
        help_message += "<strong>The user can only use this password once and must change after logging in.</strong>";
        help_message += "The user can change their password once logged in the <strong>Project Manager</strong> or <strong>Editor</strong> interfaces.</p>";

        help_message += "<h2>Navigation</h2>";
        help_message += "<p><b>Home</b> -- return you to the Home page.<br>";
        help_message += "<b>Refresh Users</b> -- refresh the user's display list.<br>";
        help_message += "<b>Add User</b> -- add a user to the system.<br>";
        help_message += "<b>Logout</b> -- logout and return to the Home page.<br>";
        help_message += "<b>Help</b> -- provides the message.</p>";

        var context;
        context = "<fieldset><legend>User</legend><table class='project'>";
        context += "<tr><td><label>Name: </label></td><td>" + obj["name"] + "</td></tr>";
        context += "<tr><td><label>Surname: </label></td><td>" + obj["surname"] + "</td></tr>";
        context += "<tr><td><label>Username: </label></td><td>" + udisplay[i][2] + "</td></tr>";
        context += "<tr><td><label>Email: </label></td><td>" + obj["email"] + "</td></tr>";
        context += "<tr><td><label>Role: </label></td><td>" + obj["role"] + "</td></tr>";
        context += '<tr><td><button onclick="Admin.deluser()">Delete User</button></td><td style="text-align: right;"><button onclick="Admin.resetpassword()">Reset Password</button></td><button onclick="Admin.goback()">Go Back</button></td></tr></table></fieldset>';
        adsp.innerHTML = context;
    }

    // Go back to listing projects
    module.goback = function() {
        selected = -1;
        populate_users(users);
    }

    // Collect user information
    module.adduser = function() {
        selected = -1;
        var adsp = document.getElementById("adminspace");
        adsp.innerHTML = "";

        help_message = "<h1>Administration Page</h1><hr>";
        help_message += "<p>Add a new user to the system. You need to fill in all the details:";
        help_message += "<emph>name, surname, username, email and password</emph>. The <strong>username and <strong>email must be unique.";
        help_message += "You must also select the user's role which can be a Project Manager, an Editor or both.</p>";

        help_message += "<h2>Buttons</h2>";
        help_message += "<p><b>Add user</b> -- add a new user to the system after completing all the details.<br>";
        help_message += "<b>Cancel</b> -- cancel the add user process.</p>";

        help_message += "<h2>Navigation</h2>";
        help_message += "<p><b>Home</b> -- return you to the Home page.<br>";
        help_message += "<b>Refresh Users</b> -- refresh the user's display list.<br>";
        help_message += "<b>Add User</b> -- add a user to the system.<br>";
        help_message += "<b>Logout</b> -- logout and return to the Home page.<br>";
        help_message += "<b>Help</b> -- provides the message.</p>";

        var context;
        context = "<fieldset><legend>New User</legend><table class='project'>";
        context += "<tr><td style='text-align: left;'><label>Name: </label></td>";
        context += '<td align="left"><input id="name" name="name" placeholder="" type="text" maxlength="32"/></td><td></td></tr>';

        context += "<tr><td style='text-align: left;'><label>Surname: </label></td>";
        context += '<td align="left"><input id="surname" name="surname" placeholder="" type="text" maxlength="32"/></td><td></td></tr>';

        context += "<tr><td style='text-align: left;'><label>Username: </label></td>";
        context += '<td align="left"><input id="username" name="username" placeholder="" type="text" maxlength="32"/></td><td></td></tr>';

        context += "<tr><td style='text-align: left;'><label>Email: </label></td>";
        context += '<td align="left"><input id="email" name="email" placeholder="" type="email" maxlength="32"/></td><td></td></tr>';

        context += "<tr><td style='text-align: left;'><label>Password: </label></td>";
        context += '<td align="left"><input id="password" name="password" placeholder="" type="password" maxlength="32"/></td><td></td></tr>';

        context += "<tr><td style='text-align: left;'><label>Password (Re-type): </label></td>";
        context += '<td align="left"><input id="repassword" name="repassword" placeholder="" type="password" maxlength="32"/></td><td></td></tr>';

        context += "<tr><td style='text-align: left;'><label>Role: </label></td>";
        context += '<td align="left"><input id="project" name="project" type="checkbox"/>Project Manager';
        context += '<input id="editor" name="editor" type="checkbox"/>Editor</td></tr>';

        context += '<tr><td><button onclick="Admin.new_user()">Add User</button></td>';
        context += '<td style="text-align: left;"><button onclick="Admin.adduser_cancel()">Cancel</button></td></tr></table></fieldset>';
        adsp.innerHTML = context;
    }

    // Check provided information and go ahead and add user if verified
    module.new_user = function() {
        var info = { name: "", surname : "", username : "", email : "", password : "", repassword : ""};

        // Check provided details
        for(var key in info) {
            var tmp = document.getElementById(key).value;
            if(tmp == "") {
                alertify.alert("No " + key + "specified!", function(){});
                return false;
            }
            info[key] = tmp;
        }

        // Check that the username hasn't been taken yet
        if(users.hasOwnProperty(info.username)) { 
            alert("Sorry username already taken!");
            return false;
        }

        // Check both passwords are the same
        if(info.password !== info.repassword) {
            alertify.alert("Your provided passwords do not match!", function(){});
            return false;
        }

        // Check roles have been selected
        var projman = document.getElementById("project").checked;
        var editor = document.getElementById("editor").checked;
        if((projman === false) && (editor === false)) {
            alert("You must select a role for the new user!");
            return false;
        }

        // Map the roles to DB string entries
        var role;
        if((projman === true) && (editor === true)) {
            role = PROJECT_ROLE + ";" + EDITOR_ROLE;
        } else if(projman === true) {
            role = PROJECT_ROLE;
        } else {
            role = EDITOR_ROLE;
        }

        document.body.className = 'waiting';
	    var data = {};
	    data["token"] = localStorage.token;
        data["name"] = info.name;
        data["surname"] = info.surname;
        data["username"] = info.username;
        data["email"] = info.email;
        data["password"] = info.password;
        data["role"] = role;

	    appserver_send(APP_AADDUSER, data, new_user_callback);
    }

    // Check add user application server response
    function new_user_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("New user added");
                listusers();
		    } else { // Something unexpected happened
			    alertify.alert("ADDUSER ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("ADDUSER Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // User cancelled adding new user - display current list
    module.adduser_cancel = function() {
        populate_users(users);
    }

    // Remove user from the system
    module.deluser = function() {
        if(selected == -1) {
            alertify.alert("Please select a user to delete!", function(){});
            return false;
        }
        alertify.confirm("Are you sure you want to delete this user?",
            function() {remove_user(selected);
        }, function(){});   
    }

    // Delete user from application server
    function remove_user(ndx) {
        document.body.className = 'waiting';
	    var data = {};
	    data["token"] = localStorage.token;
        data["username"] = udisplay[selected][2];
	    appserver_send(APP_ADELUSER, data, remove_user_callback);
    }

    // Check remove user application server response
    function remove_user_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("User has been deleted");
                listusers();
		    } else { // Something unexpected happened
			    alertify.alert("DELUSER ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("DELUSER Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Reset a users password
    module.resetpassword = function() {
        if(selected == -1) {
            alertify.alert("Please selected a user who's password you would like to reset!", function(){});
            return false;
        }
       alertify.confirm("Are you sure you want to reset this user's password?",
            function() {reset_user(selected);
        }, function(){});
    }

    // Ask app server to reset the password
    function reset_user(ndx) {
        document.body.className = 'waiting';
	    var data = {};
        data["username"] = udisplay[selected][2];
	    appserver_send(APP_PRESETPASSWORD, data, reset_user_callback);
    }

    // Check rest user application server response
    function reset_user_callback(xmlhttp) {
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);
		    if(xmlhttp.status==200) {
                alertify.success("User's password reset");
                populate_users(users);
                document.body.className = 'vbox viewport';
		    } else { // Something unexpected happened
			    alertify.alert("RESETPASSWORD ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("RESTPASSWORD Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
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

