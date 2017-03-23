// Home module

var Home = (function (window, document, $, undefined) {

    var module = {};

    $(document).on( 'ready', check_browser );

    // Setup variables
    function check_browser() {
        document.body.className = 'vbox viewport';

	    // Are you using Chrome?
	    var is_chrome;
	    is_chrome = /chrome/.test( navigator.userAgent.toLowerCase() );
	    if((is_chrome == false) || (is_chrome == null)) {
		    alert('Sorry you must use Chrome!');
		    window.location.assign(CHROME_URL);
	    }

        localStorage.setItem("role", "");
        localStorage.removeItem("role");
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

    return module;

})(window, document, jQuery);

