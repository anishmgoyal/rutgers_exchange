$(document).ready(function() {

	pageLoader.mountHandler(404, function(wnd) {
		messageTool.loadMessage(wnd, "Not Found",
			"Uhhh... that's not here. If you got here by clicking something on this site, that's bad. It's possible " +
			"whatever happened fixed itself, so try going back. If you end up here again, please send us an email about what " +
			" got you here at " + window.server.supportEmail + ", and we'll try to figure out why you're seeing this.<br /><br />" +
			"In the mean time, you can click <a href='#!/index'>here</a> to go back to the home page."
		);
		pageLoader.notifyDone();
	});

});
