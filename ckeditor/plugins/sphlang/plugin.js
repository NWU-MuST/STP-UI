CKEDITOR.plugins.add( 'sphlang',
{   
   requires : ['richcombo'], //, 'styles' ],
   init : function( editor )
   {
      var config = editor.config,
         lang = editor.lang.format;
     
     // Create style objects for all defined styles.
      editor.ui.addRichCombo( 'sphlang',
         {
            label : "Langauge",
            title :"Langauge",
            voiceLabel : "Audio Language",
            className : 'cke_format',
            multiSelect : false,

         panel :
          {
            css: [ CKEDITOR.skin.getPath( 'editor' ) ].concat( config.contentsCss ),
          },

            init : function()
            {
               //this.startGroup( "English" );
               //this.add('value', 'drop_text', 'drop_label');
                // Get a list from the APP server
                var languages = Editor.getlanguages();
                languages.sort();
                this.add("Default", "Default", "Default");

                for(var ndx = 0; ndx < languages.length; ndx++) {
                    this.add(languages[ndx], languages[ndx], languages[ndx]);
                }
            },

            onClick : function( value )
            {         
               editor.focus();
               editor.fire( 'saveSnapshot' );
               // Define a global variable to store langauge
               Editor.set_speech_language(value);
               editor.fire( 'saveSnapshot' );
            }
         });
   }
});

