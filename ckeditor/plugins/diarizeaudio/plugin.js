CKEDITOR.plugins.add( 'diarizeaudio',
{
	init: function( editor )
	{
		editor.addCommand( 'diarize_audio',
		{
			exec : function( editor )
			{
				Editor.speech_service('diarize');
			}
		});

		editor.ui.addButton( 'Create Audio Segments',
		{
			label: 'Create Audio Segments',
			command: 'diarize_audio',
			icon: this.path + 'images/diarize.png'
		} );

	}
} );

