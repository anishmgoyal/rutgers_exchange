$(document).ready(function() {

	pageLoader.mountHandler(403, function(wnd) {
		if(pageLoader.isAuth()) {
			UserApi.verifySession(pageLoader.getParam("user_id"), pageLoader.getParam("session_token"), pageLoader.getParam("csrf_token"), function success(data) {
				// Seems like a mistake in our API, but the user is certainly forbidden at this point
				messageTool.loadMessage(wnd, "Forbidden",
					"Uh oh! You do not have access to view this. If you believe this is wrong, please contact support at " +
					window.server.supportEmail +
					" for assistance."
				);
			}, function error(code) {
				// Seems like the user was logged out due to inactivity; invalidate the session
				UserApi.dethenticate();
				pageLoader.reloadPage(); // We'll come back to this handler if auth is required
			});
			pageLoader.notifyDone();
		} else {
			pageLoader.loadPage("/login");
		}
	});

	pageLoader.mountPage('/err403', false, function(wnd) {
		pageLoader.loadHandler(403);
	});

});
