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

		editor.ui.addButton( 'Recognize Audio',
		{
			label: 'Recognize Audio',
			command: 'recognize_audio',
			icon: this.path + 'images/recognize.png'
		} );

	}
} );

