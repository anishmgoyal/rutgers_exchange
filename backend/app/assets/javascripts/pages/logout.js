$(document).ready(function() {

	pageLoader.mountPage("/logout", function(wnd) {
		UserApi.dethenticate();
		pageLoader.ev.onload = loadLogoutMessage;
		pageLoader.notifyDoneWithoutAjax();
	});
	
	var loadLogoutMessage = function(wnd) {
		messageTool.loadMessage(wnd, "Logged Out", "You have successfully logged out of " + window.server.serviceName + ". We hope that you're satisfied with your experience, and that you'll be back soon!", "/index");
	}

});