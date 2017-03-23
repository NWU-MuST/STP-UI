CKEDITOR.plugins.add( 'textselection',
{
	init: function( editor )
	{
		editor.addCommand( 'gettextselection',
		{
			exec : function( editor )
			{    
				var text = editor.getSelection().getSelectedText();
				alert( text );
			}
		});

		editor.ui.addButton( 'Textselection',
		{
			label: 'Text selection',
			command: 'gettextselection',
			icon: this.path + 'images/select_all_text_icon.png'
		} );

	}
} );

