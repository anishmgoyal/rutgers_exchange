$(document).ready(function() {

	pageLoader.mountHandler(500, function(wnd) {
		messageTool.loadMessage(wnd, "Something Happened",
			"This one's our fault. Something happened while this page was loading, and we didn't expect it to, so we don't " +
			"exactly know why you're seeing this. But, if you email us at " + window.server.supportEmail + ", we can definitely " +
			"figure out why, and fix the problem.<br /><br />" +
			"Try going back to the <a href='#!/index'>home page</a> for now."
		);
		pageLoader.notifyDone();
	});

});