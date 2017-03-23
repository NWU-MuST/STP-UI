CKEDITOR.plugins.add( 'audiozoom',
{
	init: function( editor )
	{
		editor.addCommand( 'audiozoomDialog', new CKEDITOR.dialogCommand( 'audiozoomDialog' ) );

		editor.ui.addButton( 'Audio Zoom',
		{
			label: 'Audio Zoom',
			command: 'audiozoomDialog',
			icon: this.path + 'images/zoom.png'
		});

		CKEDITOR.dialog.add( 'audiozoomDialog', function( editor )
		{
			return {
				title : 'Audio Zoom',
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
								html: 'Enter a number:'
							},
							{
								type: 'text',
								id: 'zoom_seconds',
								label: 'Seconds:',
								validate: function() {
									if(!this.getValue()) {
										alert('No number entered!');
										return false;
									} else if(Math.floor(this.getValue())!=this.getValue()) {
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
					Editor.audio_zoom_change(data.seconds)
				}
			};
		});
	}
});

