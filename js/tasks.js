// Tasks module

var Tasks = (function (window, document, $, undefined) {

    var module = {};

    $(document).on( 'ready', check_browser );

    var project = null;
    var languages = null;
    var editors = null;
    var wavesurfer = null;
    var color1 = 'rgba(255,0,0,0.5)';
    var color2 = 'rgba(0,0,255,0.5)';
    var colorflag;
    var segments_dirty = false;

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

        get_audio();
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
                console.log(tasks);
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

        for(var id = 0; id < tasks.length; id++) {
            options = {};
            options['id'] = id;
            options['start'] = tasks[id]['start'];
            options['end'] = tasks[id]['end'];
            options['color'] = color1;

            wavesurfer.addRegion(options);
            wavesurfer.regions.list[options['id']].editor = tasks[id]['editor'];
            wavesurfer.regions.list[options['id']].language = tasks[id]['language'];
            wavesurfer.regions.list[options['id']].speaker = tasks[id]['speaker'];
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

        var waveform_height = Math.round(window.innerHeight * 0.14);

        wavesurfer.init({
            container: '#waveform',
            waveColor: '#00FF00',
            scrollParent: true,
            fillParent: false,
            minPxPerSec: 10,
            height: waveform_height,
            pixelRatio: 1
        });
            //progressColor: 'purple',
        wavesurfer.enableDragSelection({
                color: 'rgba(255,0,0,0.5)'
        });

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
        });

        wavesurfer.on('seek', region_click);
        wavesurfer.on('region-created', region_created);
        wavesurfer.on('region-updated', region_updated);
        wavesurfer.on('region-click', region_click);
        wavesurfer.on('region-delete', region_delete);

        if(audio_url != null) {
            wavesurfer.load(audio_url);
        }
    }

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
       add_controls();
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

        chtml = '<p><font color="red">Draw regions on the waveform to add segments, select regions to delete and select and hold to move regions around.</font></p>';
        chtml += '<table><tr><td><button onclick="Tasks.play_audio()">Play</button>';
        chtml += '<button onclick="Tasks.pause_audio()">Pause</button>';
        chtml += '<button onclick="Tasks.stop_audio()">Stop</button>  &nbsp;';
        chtml += '<label>Volume:</label><input type="range" id="volume" onchange="Tasks.setVolume(this.value)" min="0" max="100"></td>';

        chtml += '<td><button onclick="Tasks.zoom_in_audio()">Zoom in</button>';
        chtml += '<button onclick="Tasks.zoom_out_audio()">Zoom out</button>';
        chtml += '<label>Zoom factor:</label><input type="text" id="zoomFactor" value="20"/></td>';

        chtml += '<td><button onclick="Tasks.delete_region()">Delete Region</button>';
        chtml += '<button onclick="Tasks.remove_regions()">Remove All Regions</button></td></tr><hr>';

        shtml += '</table><br><button onclick="Tasks.save_tasks()">Save Project Tasks</button>';
        gh.innerHTML = chtml;
    }

    // Play audio
    module.play_audio = function() {
      if(selected_region == null) {
        wavesurfer.play();
      } else {
        wavesurfer.play(selected_region.start, selected_region.end);
      }
    }

    // Pause audio
    module.pause_audio = function() {
      wavesurfer.pause();
    }

    // Stop audio
    module.stop_audio = function() {
      wavesurfer.stop();
    }

    // Set the playback volume
    module.setVolume = function(volume) {
      wavesurfer.setVolume(parseInt(volume)/100.0);
    }

    // Zoom in audio
    var zoom_factor;
    module.zoom_in_audio = function() {
      var gh = document.getElementById('zoomFactor');
      var fact = gh.value;

      zoom_factor = zoom_factor - parseInt(fact);
      if(zoom_factor < fact) {
        zoom_factor = fact;
      }
      audio_zoom_change(zoom_factor);
    }

    // Zoom out audio
    module.zoom_out_audio = function() {
      var gh = document.getElementById('zoomFactor');
      var fact = gh.value;

      zoom_factor = zoom_factor + parseInt(fact);
      if(zoom_factor > wavesurfer.getDuration()) {
        zoom_factor = wavesurfer.getDuration();
      }
      audio_zoom_change(zoom_factor);
    }

    // region clicked
    var selected_region = null;
    var seek_flag = true;
    function region_click(region) {
      if(seek_flag) {
        if(region.hasOwnProperty('id')) {
          selected_region = region;
          seek_flag = false;
        } else {
          selected_region = null;
        }
      } else {
        seek_flag = true;
      }
    }

    // Delete a selected region
    module.delete_region = function() {
      if(selected_region != null) {
        selected_region.remove();
        selected_region = null;
        populate_segments();
      }
    }

    // A region was deleted
    function region_delete() {
    //  populate_segments();
    }

    // Remove all regions
    module.remove_regions = function() {
        alertify.confirm('Are you sure you want to remove all defined regions?',
            function() {
                wavesurfer.clearRegions();
                var gh = document.getElementById('segments');
                gh.innerHTML = "";
            }, function() {alertify.error("Remove segments canceled")});
    }

    // New region added
    function region_created(region, mEvent) {
      populate_segments();
    }

    // New region added
    function region_updated(region, mEvent) {
      populate_segments();
    }

    // Convert regions to segments
    var region_backup = [];
    function populate_segments() {
      segments_dirty = true;
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
        if(a.start > b.start) {
          return 1;
        }
        if(a.start < b.start) {
          return -1;
        }
        return 0;
      });

      arr.sort();

      colorflag = true;
      shtml = '<br><table class="project"><tr><th>Time</th><th>Editor</th><th>Language</th><th>Speaker</th></tr>';
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

          shtml += '<tr ><td>'+ region.formatTime(region.start, region.end) +'</td>';
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
          shtml += '<td><input type="text" oninput="Tasks.assign_speaker(this.id,this.value)" maxlength="32" id="spk_' + key +'" name="spk_' + key + '"/></td></tr>'
      }
      shtml += '</table><br><button onclick="Tasks.save_tasks()">Save Project Tasks</button>';

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

            //segments[key]['id'] = region['id'];
            ctask['start'] = region['start'];
            ctask['end'] = region['end'];
            //segments[key]['loop'] = region['loop'];
            //segments[key]['drag'] = region['drag'];
            //segments[key]['resize'] = region['resize'];
            //segments[key]['color'] = region['color'];
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
            //segments[key]['status'] = 'Created';
            ctask['taskid'] = ndx;
            ctask['projectid'] = project['projectid'];
            ctask['editing'] = region['editor'];
            all_tasks.push(ctask);
            ndx++;
        });

        // Adjust times so all regions are contigious
        if(all_task.length > 0) {
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

    return module;

})(window, document, jQuery);

