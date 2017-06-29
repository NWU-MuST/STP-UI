CKEDITOR.plugins.add( 'recognizeaudio',
{
	init: function( editor )
	{
		editor.addCommand( 'recognize_audio',
		{
			exec : function( editor )
			{
				Editor.speech_service('recognize');
			}
		});

		editor.ui.addButton( 'Generate A Transcription',
		{
			label: 'Generate A Transcription',
			command: 'recognize_audio',
			icon: this.path + 'images/recognize.png'
		} );

	}
} );

