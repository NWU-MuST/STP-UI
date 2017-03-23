CKEDITOR.plugins.add( 'audiorate',
{
	init: function( editor )
	{
		editor.addCommand( 'audiorateDialog', new CKEDITOR.dialogCommand( 'audiorateDialog' ) );

		editor.ui.addButton( 'Audio Rate',
		{
			label: 'Audio Playback Rate Change',
			command: 'audiorateDialog',
			icon: this.path + 'images/audio_rate.png'
		});

		CKEDITOR.dialog.add( 'audiorateDialog', function( editor )
		{
			return {
				title : 'Audio Playback Rate Change',
				minWidth : 400,
				minHeight : 200,
				contents :
				[
					{
						id : 'general',
						label : 'Settings',
						elements :
						[
							{
								type: 'html',
								html: 'Enter playback speed (0.5 - 2.0):'
							},
							{
								type: 'text',
								id: 'rate_seconds',
								label: 'Seconds:',
								validate: function() {
									if(!this.getValue()) {
										alert('No number entered!');
										return false;
									} 
								},
								required: true,
								commit: function (data) {
									data.seconds = this.getValue();
								}
							}
						],
					}
				],
				onOk: function() {
					var data = {};
					this.commitContent( data );
					Editor.audio_rate_change(data.seconds)
				}
			};
		});
	}
});

