(function( $ ) {
	
	pageLoader.mountHandler(0, function(wnd) {
		pageLoader.notifyDone();
		new Dialog({
			title: "No Internet",
			content: "Failed to load the page because you are not connected to the internet",
			deleteOnHide: true,
			offsets: {top: $("#nav")},
			wnd: wnd
		}).show();
	});

})( jQuery );