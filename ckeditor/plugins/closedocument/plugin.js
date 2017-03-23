CKEDITOR.plugins.add( 'closedocument',
{
	init: function( editor )
	{
		editor.addCommand( 'close_document',
		{
            readOnly : 1,
			exec : function( editor )
			{
				Editor.close_save();
			}
		});

		editor.ui.addButton( 'Close Document',
		{
			label: 'Close Editor',
			command: 'close_document',
			icon: this.path + 'images/close.png'
		} );

	}
} );

