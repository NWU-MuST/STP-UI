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

		editor.ui.addButton( 'Generate a transcription',
		{
			label: 'Generate a transcription',
			command: 'recognize_audio',
			icon: this.path + 'images/recognize.png'
		} );

	}
} );

