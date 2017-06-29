CKEDITOR.plugins.add( 'audio',
{
	init: function( editor )
	{
		editor.addCommand( 'start_audio_play',
		{
			exec : function( editor )
			{    
				Editor.wavesurfer.play();
			}
		});

		editor.ui.addButton( 'Play Audio',
		{
			label: 'Start Audio Playback',
			command: 'start_audio_play',
			icon: this.path + 'images/play.png'
		} );

		editor.addCommand( 'stop_audio_play',
		{
			exec : function( editor )
			{    
				Editor.wavesurfer.stop();
			}
		});

		editor.ui.addButton( 'Stop Audio',
		{
			label: 'Stop Audio Playback',
			command: 'stop_audio_play',
			icon: this.path + 'images/stop.png'
		} );

		editor.addCommand( 'pause_audio_play',
		{
			exec : function( editor )
			{    
				Editor.wavesurfer.pause();
			}
		});

		editor.ui.addButton( 'Pause Audio',
		{
			label: 'Pause Audio Playback',
			command: 'pause_audio_play',
			icon: this.path + 'images/pause.png'
		} );


		editor.addCommand( 'forward_audio_play',
		{
			exec : function( editor )
			{    
				Editor.wavesurfer.skip(Editor.get_audio_skip_length());
			}
		});

		editor.ui.addButton( 'Forward Audio',
		{
			label: 'Skip Forward',
			command: 'forward_audio_play',
			icon: this.path + 'images/ff.png'
		} );

		editor.addCommand( 'backward_audio_play',
		{
			exec : function( editor )
			{    
				Editor.wavesurfer.skip(-Editor.get_audio_skip_length());
			}
		});

		editor.ui.addButton( 'Backward Audio',
		{
			label: 'Skip Backwards',
			command: 'backward_audio_play',
			icon: this.path + 'images/rewind.png'
		} );

	}
} );

