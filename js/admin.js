// Admin Module

var Admin = (function (window, document, $, undefined) {

    var module = {};

    $(document).on( 'ready', check_browser );

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
            	localStorage.setItem("username", '');
                localStorage.setItem("token", '');
                localStorage.setItem("role", '');
            	localStorage.removeItem("username");
            	localStorage.removeItem("token");
            	localStorage.removeItem("role");
        		window.location.assign(HOME_URL);
		    } else { // Something unexpected happened
			    alertify.alert("ERROR: " + response_data["message"] + "\n(Status: " + xmlhttp.status + ")", function(){});
		    }
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
			    alertify.alert("ERROR: " + reponse_data["message"] + "\n(Status: " + xmlhttp.status + ")", function(){});
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

        var context;
        context = "<fieldset><legend>User</legend><table class='project'>";
        context += "<tr><td><label>Name: </label></td><td>" + obj["name"] + "</td></tr>";
        context += "<tr><td><label>Surname: </label></td><td>" + obj["surname"] + "</td></tr>";
        context += "<tr><td><label>Username: </label></td><td>" + udisplay[i][2] + "</td></tr>";
        context += "<tr><td><label>Email: </label></td><td>" + obj["email"] + "</td></tr>";
        context += "<tr><td><label>Role: </label></td><td>" + obj["role"] + "</td></tr>";
        context += '<tr><td><button onclick="Admin.deluser()">Delete</button></td><td style="text-align: right;"><button onclick="Admin.resetpassword()">Reset Password</button></td><button onclick="Admin.goback()">Go Back</button></td></tr></table></fieldset>';
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
            alert("Username already taken!");
            return false;
        }

        // Check both passwords are the same
        if(info.password !== info.repassword) {
            alertify.alert("Passwords do not match!", function(){});
            return false;
        }

        // Check roles have been selected
        var projman = document.getElementById("project").checked;
        var editor = document.getElementById("editor").checked;
        if((projman === false) && (editor === false)) {
            alert("You must select a role!");
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
			    alertify.alert("ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }
    }

    // User cancelled adding new user - display current list
    module.adduser_cancel = function() {
        populate_users(users);
    }

    // Remove user from the system
    module.deluser = function() {
        if(selected == -1) {
            alertify.alert("No user selected!", function(){});
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
                alertify.success("User deleted");
                listusers();
		    } else { // Something unexpected happened
			    alertify.alert("ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }
    }

    // Reset a users password
    module.resetpassword = function() {
        if(selected == -1) {
            alertify.alert("No user selected!", function(){});
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
			    alertify.alert("ERROR: " + response_data["message"], function(){});
                document.body.className = 'vbox viewport';
		    }
	    }
    }

    return module;

})(window, document, jQuery);

