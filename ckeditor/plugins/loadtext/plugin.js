CKEDITOR.plugins.add( 'loadtext',
{
	init: function( editor )
	{
		editor.addCommand( 'load_text',
		{
			exec : function( editor )
			{
				Editor.load_text();
			}
		});

		editor.ui.addButton( 'Load Text',
		{
			label: 'Load Text From Server',
			command: 'load_text',
			icon: this.path + 'images/load.png'
		} );

	}
} );

