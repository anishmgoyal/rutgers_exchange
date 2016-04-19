$(document).ready(function() {

	pageLoader.mountHandler(403, function(wnd) {
		if(pageLoader.isAuth()) {
			messageTool.loadMessage(wnd, "Forbidden",
				"Uh oh! You do not have access to view this. If you believe this is wrong, please contact support at " +
				window.server.supportEmail +
				" for assistance."
			);
			pageLoader.notifyDone();
		} else {
			pageLoader.redirect("/login");
		}
	});

});
