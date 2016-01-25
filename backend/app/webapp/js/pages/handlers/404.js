$(document).ready(function() {

	pageLoader.mountHandler(404, function(wnd) {
		$.ajax({
			url: 'pages/handlers/404.htm',
			cache: false,
			datatype: 'html',
			success: function(data) {
				wnd.html(data);
				pageLoader.notifyDone();
			},
			error: function() {
				// Uh oh, this IS our 404 handler...
				wnd.html("We can't serve that request right now; sorry... Please click <a href='#!/index'>here</a> to go back to the homepage.");
			}
		});
	});

});