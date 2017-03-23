CKEDITOR.plugins.add( 'clearerror',
{
	init: function( editor )
	{
		editor.addCommand( 'clear_error',
		{
			exec : function( editor )
			{
				Editor.clearerror();
			}
		});

		editor.ui.addButton( 'Clear Error',
		{
			label: 'Clear Error From Server',
			command: 'clear_error',
			icon: this.path + 'images/clearerror.png'
		} );

	}
} );

