//
// Send data to the application server and register the response callback function
//

function appserver_send(url, data, statechange) {
	var xmlhttp;

	// Register a new XML object
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		// TODO: should limit this to Chrome only
		xmlhttp=new XMLHttpRequest();
	} else { // code for IE6, IE5
		alert('Sorry browser too old! Not supported!');
		window.location.assign(CHROME_URL);
	}

	// Set response callback function
	xmlhttp.onreadystatechange = function() {statechange(xmlhttp)};

	// POST data to application server
	xmlhttp.open("POST", url, true);
	xmlhttp.setRequestHeader('content-type', 'application/json');

	// send the collected data as JSON
	xmlhttp.send(JSON.stringify(data));
}

//
function appserver_send_var(url, data, statechange, output) {
	var xmlhttp;

	// Register a new XML object
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		// TODO: should limit this to Chrome only
		xmlhttp=new XMLHttpRequest();
	} else { // code for IE6, IE5
		alert('Sorry browser too old! Not supported!');
		window.location.assign(CHROME_URL);
	}

	// Set response callback function
	xmlhttp.onreadystatechange = function() {statechange(xmlhttp, output)};

	// POST data to application server
	xmlhttp.open("POST", url, true);
	xmlhttp.setRequestHeader('content-type', 'application/json');

	// send the collected data as JSON
	xmlhttp.send(JSON.stringify(data));
}

