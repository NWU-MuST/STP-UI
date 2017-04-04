// Home module

var Home = (function (window, document, $, undefined) {

    var module = {};

    $(document).on( 'ready', check_browser );

    var help_message = "";

    // Setup variables
    function check_browser() {
        document.body.className = 'vbox viewport';

	    // Are you using Chrome?
	    var is_chrome;
	    is_chrome = /chrome/.test( navigator.userAgent.toLowerCase() );
	    if((is_chrome == false) || (is_chrome == null)) {
		    alertify.alert('Sorry you must use Chrome!', function(){});
		    window.location.assign(CHROME_URL);
	    }

        localStorage.setItem("role", "");
        localStorage.removeItem("role");

        help_message = "<h1>Home Page</h1>";
        help_message += "<p>Click on a button to proceed to a login screen.</p>";
        help_message += "<b>Administration</b> -- user administration interface";
        help_message += "<b>Project Manager</b> -- project management interface";
        help_message += "<b>Editor</b> -- editor interface";
    }

    // Goto to administration
    module.admin = function() {
        localStorage.setItem("role", ADMIN_INTF);
        document.body.className = 'vbox viewport waiting';
	    window.location.assign(LOGIN_URL);
    }

    // Goto to project manager
    module.projectmanager = function() {
        localStorage.setItem("role", PROJECT_INTF);
        document.body.className = 'vbox viewport waiting';
	    window.location.assign(LOGIN_URL);
    }

    // Goto to editor
    module.editor = function() {
        localStorage.setItem("role", EDITOR_INTF);
        document.body.className = 'vbox viewport waiting';
	    window.location.assign(LOGIN_URL);
    }

    // Return a help message for the context
    module.help = function() {
        if(help_message.length > 0) {
            alertify.alert("Help", message, function(){});
        } else {
            alertify.alert("Help", "Sorry no help provided for this context!");
        }
    }

    return module;

})(window, document, jQuery);

