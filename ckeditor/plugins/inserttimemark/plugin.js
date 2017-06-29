CKEDITOR.plugins.add( 'inserttimemark',
{
	init: function( editor )
	{
		editor.addCommand( 'add_time_mark',
		{
			exec : function( editor )
			{    
				var time = Editor.wavesurfer.getCurrentTime();
				var date = new Date(1970,0,1);
				date.setSeconds(time);
				var display_time = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
				editor.insertHtml('<p><time type="mark" style="background-color: #AAAAAA;" datetime="' + time +'">' + display_time + '</time></p>');
			}
		});

		editor.ui.addButton( 'Time Mark',
		{
			label: 'Add Time Mark',
			command: 'add_time_mark',
			icon: this.path + 'images/time-marker.png'
		} );

	}
} );

