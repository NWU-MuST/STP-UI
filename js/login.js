// Login Module

var Login = (function (window, document, $, undefined) {

    var module = {};

    $(document).on( 'ready', check_browser );

    var help_message = "";
    var KEY_ENTER = 13;

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

	    localStorage.setItem("username", '');
	    localStorage.setItem("token", '');
	    localStorage.removeItem("username");
	    localStorage.removeItem("token");

	    var role = document.getElementById("role");
        role.innerHTML = localStorage.getItem("role");

        help_message = "<h1>Login Page</h1><hr>";
        help_message += "<p>Provide login credentials to proceed to chosen interface or remove a session token from application server.</p>";

        help_message += "<h2>Input boxes</h2>";
        help_message += "<p><b>Username</b> -- your username<br>";
        help_message += "<b>Password</b> -- your password<br></p>";

        help_message += "<h2>Buttons</h2>";
        help_message += "<p><b>Log on</b> -- after providing credentials: click on this button to log on.<br>";
        help_message += "<b>Log out</b> -- after providing credentials: you can use this button to remove a token that prevents you from logging in.";
        help_message += "This happens when you try to login and the system says there is a <strong>ConflictError</strong>. After removing the token you will be able to login.</p>";

        help_message += "<h2>Navigation</h2>";
        help_message += "<p><b>Home</b> -- clicking on Home will return you to the Home page.<br>";
        help_message += "<b>Help</b> -- provides the message.</p>";

        document.getElementById("password")
            .addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.keyCode == KEY_ENTER) {
                document.getElementById("dologin").click();
            }
        });
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

    // User is trying to login with provided username and password
    module.login = function() {
	    var username = document.getElementById("username").value;
	    var password = document.getElementById("password").value;

	    // Test if username set
	    var errorFlag = false;
	    if(username == "") {
		    document.getElementById("username").placeholder = "No username";
		    errorFlag = true;
	    } else {
		    document.getElementById("username").placeholder = "";
	    }

	    // Test if password set
	    if(password == "") {
		    document.getElementById("password").placeholder = "No password";
		    errorFlag = true;
	    } else {
		    document.getElementById("password").placeholder = "";
	    }

	    // Return if errorFlag has been set
	    if(errorFlag) { return; }

        var role = localStorage.getItem("role");
        var APP_LOGIN, NOW_ROLE;
        if(role === ADMIN_INTF) {
            APP_LOGIN = APP_ALOGIN;
            NOW_ROLE = ADMIN_ROLE;
            localStorage.setItem("interface", ADMIN_URL);
        } else if (role === PROJECT_INTF) {
            APP_LOGIN = APP_PLOGIN;
            NOW_ROLE = PROJECT_ROLE;
            localStorage.setItem("interface", PROJECT_URL);
        } else if (role === EDITOR_INTF) {
            APP_LOGIN = APP_ELOGIN;
            NOW_ROLE = EDITOR_ROLE;
            localStorage.setItem("interface", JOB_URL);
        } else {
            alertify.alert("LOGIN ERROR Unknown role:" + role + "\nRedirecting you back to the Home page...", function(){});
		    window.location.assign(HOME_URL);
        }

        document.body.className = 'vbox viewport waiting';
	    var data = {};
	    data['username'] = username;
	    data['password'] = password;
        data['role'] = NOW_ROLE;
	    appserver_send(APP_LOGIN, data, login_callback);
    }

    // Callback for server response
    function login_callback(xmlhttp) {
	    // No running server detection
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);

		    // Login application was successful
		    if(xmlhttp.status==200) {
                var username = document.getElementById("username").value;
			    localStorage.setItem("username", username);
			    localStorage.setItem("token", response_data['token']);
                localStorage.setItem("templogin", response_data["templogin"]);
			    username = '';
			    password = '';
                document.body.className = 'vbox viewport';
			    window.location.assign(localStorage.getItem("interface"));
		    } else { // Something unexpected happened
			    alertify.alert("LOGIN ERROR: " + response_data["message"] + "\n(Status: " + xmlhttp.status + ")", function(){});
                document.body.className = 'vbox viewport';
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("LOGIN Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // User is trying to logout (i.e. remove token) with provided username and password
    module.logout = function() {
	    var username = document.getElementById("username").value;
	    var password = document.getElementById("password").value;

	    // Test if username set
	    var errorFlag = false;
	    if(username == "") {
		    document.getElementById("username").placeholder = "No username";
		    errorFlag = true;
	    } else {
		    document.getElementById("username").placeholder = "";
	    }

	    // Test if password set
	    if(password == "") {
		    document.getElementById("password").placeholder = "No password";
		    errorFlag = true;
	    } else {
		    document.getElementById("password").placeholder = "";
	    }

	    // Return if errorFlag has been set
	    if(errorFlag) { return; }

        var role = localStorage.getItem("role");
        var APP_LOGOUT2;
        if(role === ADMIN_INTF) {
            APP_LOGOUT2 = APP_ALOGOUT2;
        } else if (role === PROJECT_INTF) {
            APP_LOGOUT2 = APP_PLOGOUT2;
        } else if (role === EDITOR_INTF) {
            APP_LOGOUT2 = APP_ELOGOUT2;
        } else {
            alertify.alert("LOGOUT ERROR Unknown role:" + role + "\nRedirecting you back to the Home page...", function(){});
		    window.location.assign(HOME_URL);
        }

	    var data = {};
	    data['username'] = username;
	    data['password'] = password;
	    appserver_send(APP_LOGOUT2, data, logout_callback);
    }

    // Callback for server response
    function logout_callback(xmlhttp) {
	    // No running server detection
	    if ((xmlhttp.status==503)) {
		    alertify.alert("Application server unavailable", function(){});
	    }

	    if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
		    var response_data = JSON.parse(xmlhttp.responseText);

		    // Login application was successful
		    if(xmlhttp.status==200) {
                alertify.success("User token has been removed from application server", function(){});
		    } else { // Something unexpected happened
			    alertify.alert("LOGOUT ERROR: " + response_data["message"] + "\n(Status: " + xmlhttp.status + ")", function(){});
		    }
	    }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("LOGOUT Network Error. Please check your connection and try again later!", function(){});
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

