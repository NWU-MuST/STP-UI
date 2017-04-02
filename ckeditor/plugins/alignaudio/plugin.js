CKEDITOR.plugins.add( 'alignaudio',
{
	init: function( editor )
	{
		editor.addCommand( 'align_audio',
		{
			exec : function( editor )
			{
				Editor.speech_service('align');
			}
		});

		editor.ui.addButton( 'Align Audio and Text',
		{
			label: 'Align Audio and Text',
			command: 'align_audio',
			icon: this.path + 'images/align.png'
		} );

	}
} );

