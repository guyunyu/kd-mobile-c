ob.barcode = {
	init: function() {
		$('.ob-icon-scan').on('click', function() {
			if(typeof cordova !== 'undefined') {
				try {
					cordova.plugins.barcodeScanner.scan(
						function (result) {
							if(!result.cancelled) {
								ob.barcode.handle(result);
							}
						},
						function (error) {
							fw.alert("Scanning failed: " + error);
						},
						{
							prompt: 'Place a barcode inside the scan area'
						}
					);
				} catch(e) {
					fw.alert(e);
				}
			}
		});
	},
	handle: function( c ) {
		if(typeof c.text === 'string') {
			if(/^\/\/[A-Z0-9]+\/?[0-9]+#[0-9]+(F|M)K$/.test(c.text)) {
				var tx = c.text.substring(2, c.text.indexOf('#'));
				ob.locations.receiveTx(tx);
			} else {
				fw.alert('Barcode is not recognized: ' + c.text);
			}
		}
	}
};