// Tasks module

var Tasks = (function (window, document, $, undefined) {

    var module = {};

    $(document).on( 'ready', check_browser );

    var project = null;
    var languages = null;
    var editors = null;
    var wavesurfer = null;
    var color1 = 'hsla(100, 100%, 30%, 0.1)', color2 = 'hsla(200, 100%, 30%, 0.1)';
    var colorflag;
    var segments_dirty = false;
    var notset = ["null", null, undefined];
    var help_message = "";
    var keys = [];
    var KEY_CTRL = 17, KEY_SHIFT = 16, KEY_ESC = 27, KEY_TAB = 9;
    var split_times = [];
    var audio_playing = false;

    // Key up events
    window.onkeyup = function(e) {
        keys[e.keyCode] = false;

        if(e.keyCode == KEY_TAB) {
            if(!audio_playing) {
                audio_playing = true;
                if(wavesurfer) { wavesurfer.play(); }
            }

        }
        if(e.keyCode == KEY_ESC) {
            if(audio_playing) {
                audio_playing = false;
                if(wavesurfer) { wavesurfer.pause(); }
            }
        }
    }

    window.onkeydown = function(e) { keys[e.keyCode]=true; }

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

        project = JSON.parse(localStorage.getItem("project"));
        editors = JSON.parse(localStorage.getItem("editors"));
        languages = JSON.parse(localStorage.getItem("languages"));

        var gh = document.getElementById('controls');
        gh.innerHTML = '<table><tr><td>Loading audio...</td><td><img src="/speechui/static/loading.gif" width="140" height="100"></td></tr></table>';

        get_audio();

        help_message = "<h1>Project Manager Tasks Creation</h1><hr>";
        help_message += "<p>This interface provides a means to create tasks for the editors.</p> ";
        help_message += "<p>You can do this by manually creating segments on the audio or by requesting a speech service to automatically perform the segmentation. ";
        help_message += "To manually create tasks you must holding down the SHIFT button and clicking on the waveform. To delete a region hold down CTRL button and clicking on a region.";
        help_message += "You can change the size of the segments by dragging the endpoints.</p><br>";

        help_message += "<p>Each region that is created will produce a task information row that will appear at the bottom of the buttons. ";
        help_message += "<p>You must complete all information: select an <b>Editor</b>, select a <b>Language</b> and provide a <b>Speaker Name</b>.</p><br>";

        help_message += "<p><b>You must save all changes periodically using the <em>Save Project Tasks</em> button</b>.</p>";

        help_message += "<h2>Buttons and Sliders</h2>";
        help_message += "<p><b>Play</b> -- play audio.<br>";
        help_message += "<b>Pause</b> -- pause playback.<br>";
        help_message += "<b>Stop</b> -- stop playback.<br>";
        help_message += "<b>Volume</b> -- set audio audio.<br>";
        help_message += "<b>Zoom in</b> -- zoom into audio.<br>";
        help_message += "<b>Zoom out</b> -- zoom out of audio.<br>";
        help_message += "<b>Zoom factor</b> -- the amount of in or out zoom.<br>";
        help_message += "<b>Vertical Zoom</b> -- zoom the height of the waveform.<br>";
        help_message += "<b>Remove all regions</b> -- remove all created regions. <br>";
        help_message += "<b>Save Project Tasks</b> -- save all tasks to the server.<br>";
        help_message += "<b>Automatically Create Segments</b> -- request a speech service to automatically create editor tasks. <b>This will lock the project and return you to the Projects Page.</b></p>";

        help_message += "<h2>Navigation</h2>";
        help_message += "<p><b>Home</b> -- return you to the Home page.<br>";
        help_message += "<b>Back to Projects</b> -- return back to the project page.<br>";
        help_message += "<b>Logout</b> -- logout and return to the Home page.<br>";
        help_message += "<b>Help</b> -- provides this message.</p>";

        //document.addEventListener("keydown", function(){ MD = true; });
    }

    // Remove the events handler
    function removeHandlers() {
        document.removeEventListener("mousedown", function() {});
        document.removeEventListener("mouseup", function(){});
    }

    // User needs to register therefore forward them to the registration page
    module.home = function() {
        if(segments_dirty) {
            alertify.confirm('There are unsaved changes to the tasks. Leave anyway?',
                    function() {
                        cleanandgo();
                    }, function() {"Going Home canceled"});
        } else {
            cleanandgo();
        }
    }

    // Clear some local storage variables
    function cleanandgo() {
        var items = ["username", "token", "home", "role", "projects", "editors", "languages"];
        for(var ndx = 0; ndx < items.length; items++) {
            localStorage.setItem(items[ndx], '');
            localStorage.removeItem(items[ndx]);
        }
        destory_wavesurfer();
        wavesurfer = null;
        removeHandlers();
        window.location.assign(HOME_URL);
    }

    // Return to the projects
    module.projects = function() {
        if(segments_dirty) {
            alertify.confirm('There are unsaved changes to the current tasks. Leave anyway?',
                    function() {
                        backtoproject(); 
                    }, function() {alertify.error('Returning to projects canceled');});
        } else {
            backtoproject(); 
        }
    }

    // Clear a few variables and go to projects page
    function backtoproject() {
        var items = ["projects", "editors", "languages"];
        for(var ndx = 0; ndx < items.length; items++) {
            localStorage.setItem(items[ndx], '');
            localStorage.removeItem(items[ndx]);
        }
        destory_wavesurfer();
        wavesurfer = null;
        removeHandlers();
        window.location.assign(PROJECT_URL);
    }

    // User is trying to logout
    module.logout = function() {
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
                var items = ["username", "token", "home", "role", "projects", "editors", "languages"];
                for(var ndx = 0; ndx < items.length; items++) {
                    localStorage.setItem(items[ndx], '');
                    localStorage.removeItem(items[ndx]);
                }
                removeHandlers();
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

    // User is trying to logout
    function loadproject() {
        var data = {};
        data['token'] = localStorage.getItem("token");
        data['projectid'] = project['projectid'];
        appserver_send(APP_PLOADPROJECT, data, loadproject_callback);
    }

    // Callback for server response
    var tasks;
    function loadproject_callback(xmlhttp) {
        // No running server detection
        if ((xmlhttp.status==503)) {
            alertify.alert("Application server unavailable", function(){});
        }

        if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
            var response_data = JSON.parse(xmlhttp.responseText);

            // Logout application was successful
            if(xmlhttp.status==200) {
                tasks = response_data["tasks"];
                if(tasks.length != 0) {
                    extract_regions();
                }
            } else { // Something unexpected happened
                alertify.alert("LOADPROJECT ERROR: " + response_data["message"] + "\n(Status: " + xmlhttp.status + ")", function(){});
            }
        }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("LOADPROJECT Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    // Convert tasks to region segments
    function extract_regions() {
        var options = {};
        split_times = [];

        for(var id = 0; id < tasks.length; id++) {
            options = {};
            options['id'] = id;
            options['start'] = tasks[id]['start'];
            options['end'] = tasks[id]['end'];
            options['color'] = color1;
            options['resize'] = false;
            options['drag'] = false;

            split_times.push(tasks[id]['end']);

            wavesurfer.addRegion(options);
            wavesurfer.regions.list[options['id']].editor = tasks[id]['editor'];
            wavesurfer.regions.list[options['id']].language = tasks[id]['language'];
            wavesurfer.regions.list[options['id']].speaker = tasks[id]['speaker'];
        }

        if(split_times.length != 0) {
            split_times.push(0);
            split_times.sort(function(a,b) { return a - b;});
        }

        populate_segments();
    }

    // Load project audio
    function get_audio() {
        var data_url = APP_PGETAUDIO;
        data_url += "?token=" + localStorage.token;
        data_url += "&projectid=" + project["projectid"];
        load_wavesurfer(data_url);
    }

    // Get wavesurfer ready - if an audio url is available
    var waveform_width_pixel;
    function init_wavesurfer(audio_url) {
        // Initialise wavesurfer
        wavesurfer = Object.create(WaveSurfer);

        var waveform_height = Math.round(window.innerHeight * 0.2);

        wavesurfer.init({
            container: '#waveform',
            waveColor: 'violet',
            progressColor: '#AAAAAA',
            scrollParent: true,
            fillParent: false,
            minPxPerSec: 10,
            height: waveform_height,
            barHeight: 0.5,
            pixelRatio: 1
        });

        wavesurfer.enableDragSelection({color: 'rgba(255,0,0,0.5)'});

        wavesurfer.on('ready', function () {
            timeline = Object.create(WaveSurfer.Timeline);

            timeline.init({
                wavesurfer: wavesurfer,
                primaryLabelInterval: 1,
                secondaryLabelInterval: 1,
                container: "#waveform_timeline"
            });

            waveform_width_pixel = $('#waveform_timeline').width();
            zoom_factor = wavesurfer.getDuration();
            audio_zoom_change(wavesurfer.getDuration());

            loadproject();
            add_controls();
        });

        wavesurfer.on("finish", reset_play);
        wavesurfer.on('seek', seek_click);
        wavesurfer.on('region-updated', region_updated);
        wavesurfer.on('region-click', region_click);

        if(audio_url != null) { wavesurfer.load(audio_url); }
    }

    // Audio finished playing
    function reset_play() { wavesurfer.stop(); }

    // Clear this wavesurfer instance
    function destory_wavesurfer() {
        if(wavesurfer != null) {
            wavesurfer.destroy();
        }
    }

    // Load audio
    function load_wavesurfer(audio_url) {
        destory_wavesurfer();
        init_wavesurfer(audio_url);
    }

    // Adjust waveform zoom
    function audio_zoom_change(seconds) {
        wavesurfer.zoom(waveform_width_pixel / seconds);
        redraw_regions();
    }

    // Add audio zoom
    function add_controls() {
        var gh = document.getElementById('controls');
        var chtml;

        //chtml = '<p><font color="red">Draw regions on the waveform to add segments, select regions to delete and select and hold to move regions around.</font></p>';
        chtml = '<fieldset style="width: 45%; display: inline;"><legend>Audio Controls</legend>';
        chtml += '<button style="padding: 1px; width: 10%; height: 10%;" onclick="Tasks.play_audio()"><img style="width: 25%; height: 25%;" src="/speechui/static/play.png"></button>';
        chtml += '<button style="padding: 1px; width: 10%; height: 10%;" onclick="Tasks.pause_audio()"><img style="width: 25%; height: 25%;" src="/speechui/static/pause.png"></button>';
        chtml += '<button style="padding: 1px; width: 10%; height: 10%;" onclick="Tasks.stop_audio()"><img style="width: 25%; height: 25%;" src="/speechui/static/stop.png"></button>';
        chtml += '<img style="width: 3%; height: 3%;" src="/speechui/static/volume.png"><input style="border: none; width: 20%;" type="range" id="volume" onchange="Tasks.setVolume(this.value)" min="0" max="100">';
        chtml += '<label>Playback Speed:</label><input style="border: none; width: 20%;" type="range" value="100" id="playrate" onchange="Tasks.setPlaybackRate(this.value)" min="0" max="300"></fieldset>';

        chtml += '<fieldset style="width: 45%; display: inline;"><legend>Zoom</legend>';
        chtml += '<button style="padding: 1px; width: 10%; height: 10%;" onclick="Tasks.zoom_in_audio()"><img style="width: 25%; height: 25%;" src="/speechui/static/zoom_in.png"></button>';
        chtml += '<button style="padding: 1px; width: 10%; height: 10%;" onclick="Tasks.zoom_out_audio()"><img style="width: 25%; height: 25%;" src="/speechui/static/zoom_out.png"></button>';
        chtml += '<label>Zoom Factor:</label><input style="border: none; width: 20%;" value="20" type="range" id="zoomFactor" min="0" max="100">';
        chtml += '<label>Vertical Zoom:</label><input style="border: none; width: 20%;" type="range" value="100" id="barheight" onchange="Tasks.setHeight(this.value)" min="0" max="500"></fieldset>';

        chtml += '<div><button onclick="Tasks.remove_regions()">Remove All Regions</button> <button onclick="Tasks.diarize()">Automatically Create Segments</button></div>';
        gh.innerHTML = chtml;
    }

    // Play audio
    module.play_audio = function() { wavesurfer.play(); }

    // Pause audio
    module.pause_audio = function() { wavesurfer.pause(); }

    // Stop audio
    module.stop_audio = function() { wavesurfer.stop(); }

    // Set the playback volume
    module.setVolume = function(volume) {
        alertify.success("Volume set to " + parseInt(volume)/100.0);
        wavesurfer.setVolume(parseInt(volume)/100.0);
    }

    // Set the waveform height
    module.setHeight = function(height) {
        alertify.success("Vertical zoom set to " + (height/100.0));
        wavesurfer.params.barHeight = (height/100.0);
        wavesurfer.empty();
        wavesurfer.drawBuffer();
    }

    // Set playback rate
    module.setPlaybackRate = function(rate) {
        alertify.success("Playback speed set to " + (rate/100.0));
        wavesurfer.setPlaybackRate(rate/100.0);
    }

    // Zoom in audio
    var zoom_factor;
    module.zoom_in_audio = function() {
        var gh = document.getElementById('zoomFactor');
        var fact = gh.value;

        zoom_factor = zoom_factor - parseInt(fact);
        if(zoom_factor < fact) { zoom_factor = fact; }
        audio_zoom_change(zoom_factor);
    }

    // Zoom out audio
    module.zoom_out_audio = function() {
        var gh = document.getElementById('zoomFactor');
        var fact = gh.value;

        zoom_factor = zoom_factor + parseInt(fact);
        if(zoom_factor > wavesurfer.getDuration()) { zoom_factor = wavesurfer.getDuration(); }
        audio_zoom_change(zoom_factor);
    }

    // region clicked
    var selected_region = null;
    var seek_flag = true;
    function seek_click(seek_pos) {
        if(keys[KEY_SHIFT] == true) {
            if(split_times.length == 0) {
                split_times.push(0.0);
                split_times.push(wavesurfer.getDuration());
            }

            split_times.push(wavesurfer.getCurrentTime());
            add_regions();
            redraw_regions();
        }
    }

    // From split_times create regions
    function add_regions() {
        wavesurfer.clearRegions();
        split_times.sort(function(a,b) { return a - b;});
        var options = {};
        for(var ndx = 0; ndx < split_times.length-1; ndx++) {
            options = {};           
            options['id'] = ndx;
            options['start'] = split_times[ndx];
            options['end'] = split_times[ndx+1];
            options['resize'] = false;
            options['drag'] = false;
            if(ndx%2 != 1) { options['color'] = color1;}
            else { options['color'] = color2; }
            wavesurfer.addRegion(options);
            segments_dirty = true;
        }
        populate_segments();
    }

    // region click - if CTRL keydown 
    function region_click(region) {
        if(region) {
            console.log(region);
            if(keys[KEY_CTRL] == true) {

                var value = region["end"];
                if(region["end"] == wavesurfer.getDuration()) { value = region["start"]; }

                var ndx = split_times.indexOf(value);
                split_times.splice(ndx, 1);

                if(split_times.length == 1) {
                    if(split_times[0] == wavesurfer.getDuration()) { split_times = []; }
                }
                region.remove();
                add_regions();
                redraw_regions();
                populate_segments();
            }
        }
    }

    function closest (num, arr) {
        var mid;
        var lo = 0;
        var hi = arr.length - 1;
        while (hi - lo > 1) {
            mid = Math.floor ((lo + hi) / 2);
            if (arr[mid] < num) { lo = mid; }
            else { hi = mid; }
        }
        if (num - arr[lo] <= arr[hi] - num) { return lo; }
        return hi;
    }

    // Delete a selected region
    module.delete_region = function() {
        if(selected_region != null) {
            selected_region.remove();
            selected_region = null;
            populate_segments();
        }
    }

    // Remove all regions
    module.remove_regions = function() {
        alertify.confirm('Are you sure you want to remove all defined regions?',
                function() {
                    wavesurfer.clearRegions();
                    split_times = [];
                    var gh = document.getElementById('segments');
                    gh.innerHTML = "";
                }, function() {alertify.error("Remove segments canceled")});
    }

    // Add mouse events
    var drag_region;
    var MD = false;
    document.addEventListener("mousedown", function(){ MD = true; });

    document.addEventListener("mouseup", function(){
        if((MD == true)&&(drag_region != null)) {
            MD = false;
            var mid = drag_region["start"] + (drag_region["end"] - drag_region["start"]) / 2.0;
            wavesurfer.seekAndCenter(mid / wavesurfer.getDuration());

            wavesurfer.zoom(waveform_width_pixel / (drag_region["end"]-drag_region["start"]));
            drag_region.remove();
            drag_region = null;
        }
    });

    // New region added
    function region_updated(region, mEvent) {
        drag_region = region;
    }

    // Convert regions to segments
    var region_backup = [];
    function populate_segments() {
        var gh = document.getElementById('segments');
        gh.innerHTML = "";
        var shtml;

        var arr = [];
        Object.keys(wavesurfer.regions.list).forEach(function (key) {
            if(!wavesurfer.regions.list[key].hasOwnProperty('status')) {
                wavesurfer.regions.list[key].status = 'Created';
            }
            arr.push(wavesurfer.regions.list[key]);
        });

        arr.sort(function (a,b) {
            if(a.start > b.start) { return 1; }
            else if(a.start < b.start) { return -1; }
            return 0;
        });

        arr.sort();

        colorflag = true;
        if(arr.length > 0 ) {
            shtml = '<br>You must select an Editor, select a language and enter a speaker name for each task, then save the information, before assigning the project.';
            shtml += '<br><table class="project"><tr><th>Task ID</th><th>Time</th><th>Editor</th><th>Language</th><th>Speaker</th></tr>';
            var ndx = 0;
            for(var key in arr) {
                var region = arr[key];
                // Alternate region color
                if(colorflag) {
                    region.color = color1;
                    colorflag = false;
                } else {
                    colorflag = true;
                    region.color = color2;
                }

                shtml += '<tr ><td> ' + ndx + ' </td> <td>'+ region.formatTime(region.start, region.end) +'</td>';
                shtml += '<td ><select id="editor_'+ key +'" onchange="Tasks.assign_editor(this.id,this.value)">';
                shtml += '<option value="null">Editor...</option>';
                for(var edit in editors) {
                    var name = editors[edit]["name"] + " " + editors[edit]["surname"];
                    shtml += '<option value="'+ edit +'">'+ name +'</option>';
                }
                shtml += '</select></td>';

                shtml += '<td><select id="lang_'+ key +'" onchange="Tasks.assign_lang(this.id,this.value)">';
                shtml += '<option value="null">Language...</option>';
                for(var i = 0; i < languages.length; i++) {
                    shtml += '<option value="'+ languages[i] +'">'+ languages[i] +'</option>';
                }
                shtml += '</select></td>';
                shtml += '<td><input type="text" oninput="Tasks.assign_speaker(this.id,this.value)" maxlength="32" id="spk_' + key +'" name="spk_' + key + '"/></td></tr>';
                ndx += 1;
            }
            shtml += '</table>';
            shtml += '<div><button onclick="Tasks.save_tasks()">Save Project Tasks</button></div>';

            region_backup = arr;
            gh.innerHTML = shtml;

            for(var key in arr) {
                var region = arr[key];
                if(region.hasOwnProperty('editor')) {
                    gh = document.getElementById('editor_' + key);
                    gh.value = region.editor;
                }
                if(region.hasOwnProperty('language')) {
                    gh = document.getElementById('lang_' + key);
                    gh.value = region.language;
                }
                if(region.hasOwnProperty('speaker')) {
                    gh = document.getElementById('spk_' + key);
                    gh.value = region.speaker;
                }
            }
            redraw_regions();
        } else {
            gh.innerHTML = '';
        }
    }

    // User has assigned an editor to segment
    module.assign_editor = function(id, value) {
        var parts = id.split("_");
        var region = region_backup[parts[1]];
        region.editor = value;
    }

    // User has assigned a language to segment
    module.assign_lang = function(id, value) {
        var parts = id.split("_");
        var region = region_backup[parts[1]];
        region.language = value;
    }

    // User has assigned a speaker tag to segment
    module.assign_speaker = function(id, value) {
        var parts = id.split("_");
        var region = region_backup[parts[1]];
        region.speaker = value;
    }

    // Update the regions on canvas as they move around when zooming
    function redraw_regions(){
        Object.keys(wavesurfer.regions.list).forEach(function (key) {
            wavesurfer.regions.list[key].updateRender();
        });
    }

    //Save tasks to app server
    module.save_tasks = function() {
        var data = {};
        var segments = {};
        var all_tasks = [];
        var ndx = 0;

        // Extract data from regions and verify data
        Object.keys(wavesurfer.regions.list).forEach(function (key) {
            var region = wavesurfer.regions.list[key];
            var ctask = {};

            ctask['start'] = region['start'];
            ctask['end'] = region['end'];

            if((region['editor'] === undefined)||(region['editor'] == "null")) {
                alertify.alert("Cannot save -- no Editor assign for segment: " + region.formatTime(region.start, region.end) + "!", function(){});
                return false;
            }
            ctask['editor'] = region['editor'];
            if((region['language'] === undefined)||(region['language'] == "null")) {
                alertify.alert("Cannot save -- no language has been selected for segment: " + region.formatTime(region.start, region.end) + "!", function(){});
                return false;
            }
            ctask['language'] = region['language'];
            if((region['speaker'] === undefined)||(region['speaker'] == "null")) {
                alertify.alert("Cannot save -- no speaker has been specified for segment: " + region.formatTime(region.start, region.end) + "!", function(){});
                return false;
            }

            ctask['speaker'] = region['speaker'];
            ctask['taskid'] = ndx;
            ctask['projectid'] = project['projectid'];
            ctask['editing'] = region['editor'];
            all_tasks.push(ctask);
            ndx++;
        });

        // Adjust times so all regions are contigious
        if(all_tasks.length > 0) {
            all_tasks[0]['start'] = 0.0;
            for(var ndx = 0; ndx < all_tasks.length-1; ndx++) {
                now = all_tasks[ndx];
                next = all_tasks[ndx+1];
                now['end'] = next['start'];
            }
            all_tasks[all_tasks.length-1]['end'] = project['audiodur'];
        }
        // Create app server payload
        data['token'] = localStorage.getItem('token');
        data['projectid'] = project['projectid'];
        data['tasks'] = all_tasks;
        var proj = {};
        proj["projectstatus"] = "In Progress";
        proj["category"] = project["category"];
        data['project'] = proj
            console.log(data);
        appserver_send(APP_PSAVEPROJECT, data, saveproject_callback);
    }

    function saveproject_callback(xmlhttp) {
        // No running server detection
        if ((xmlhttp.status==503)) {
            alertify.alert("Application server unavailable", function(){});
        }

        if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
            var response_data = JSON.parse(xmlhttp.responseText);
            // Logout application was successful
            if(xmlhttp.status==200) {
                alertify.success("Editor tasks saved!");
                segments_dirty = false;
            } else { // Something unexpected happened
                alertify.alert("SAVEPROJECT ERROR: " + response_data["message"] + "\n(Status: " + xmlhttp.status + ")", function(){});
            }
        }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("SAVEPROJECT Network Error. Please check your connection and try again later!", function(){});
            document.body.className = 'vbox viewport';
        }
    }

    function isInt(value) {
        return !isNaN(value) && 
            parseInt(Number(value)) == value && 
            !isNaN(parseInt(value, 10));
    }

    // Automatically create segments
    module.diarize = function() {
        if(notset.indexOf(project["audiofile"]) !== -1) {
            alertify.alert("Please upload an audio file before trying to create tasks!", function(){});
            return false;
        }

        var segmentno = 0;
        alertify.prompt("How many segments would you like to create? Please enter an integer:", 0,
                function(evt, value ){
                    segmentno = value;
                    alertify.success('Number of segments set to ' + value);

                    if(isInt(segmentno) === false) {
                        alertify.alert("You must provide an integer for the number of segments!", function(){});
                        return false;
                    }

                    if(segmentno == 0) {
                        alertify.alert("You must specify the number of segments for diarization!", function(){});
                        return false;
                    }

                    var data = {};
                    data["token"] = localStorage.token;
                    data["projectid"] = project["projectid"];
                    data["segmentno"] = segmentno;
                    appserver_send(APP_PDIARIZEAUDIO, data, diarize_callback);
                },
                function(){
                    alertify.error('Cancel');
                });
    }

    // Diarize callack
    function diarize_callback(xmlhttp) {
        // No running server detection
        if ((xmlhttp.status==503)) {
            alertify.alert("Application server unavailable", function(){});
        }

        if ((xmlhttp.readyState==4) && (xmlhttp.status != 0)) {
            var response_data = JSON.parse(xmlhttp.responseText);

            // Logout application was successful
            if(xmlhttp.status==200) {
                alertify.alert('This project will be locked! Returning you to the Project Page.',
                        function() {
                            backtoproject();
                            document.body.className = 'vbox viewport';
                        });
            } else { // Something unexpected happened
                alertify.alert("DIARIZEAUDIO ERROR: " + response_data["message"] + "\n(Status: " + xmlhttp.status + ")", function(){});
                document.body.className = 'vbox viewport';
            }
        }

        if ((xmlhttp.readyState==4) && (xmlhttp.status == 0)) {
            alertify.alert("DIARIZEAUDIO Network Error. Please check your connection and try again later!", function(){});
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

