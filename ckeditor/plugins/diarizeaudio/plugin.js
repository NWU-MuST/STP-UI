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

		editor.ui.addButton( 'Diarize Audio',
		{
			label: 'Diarize Audio',
			command: 'diarize_audio',
			icon: this.path + 'images/diarize.png'
		} );

	}
} );

