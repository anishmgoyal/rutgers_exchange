(function( $ ) {
	
	pageLoader.mountPage("/activate", false, function(wnd) {
		var subpath = pageLoader.getSubPath().substring(1);
		subpath = subpath.split("/");
		var username = subpath[0];
		var activation = subpath[1];
		UserApi.activate(username, activation, function success(data) {
			messageTool.loadMessage(pageLoader.getWnd(),
				"Activation Successful",
				"Congratulations! You have successfully joined " +
				window.server.serviceName +
				". You can now make offers, chat with users, and create " +
				"listings of your own. Click <a href='#!/login'>here</a> " +
				" to login!"
			);
		}, function error(code) {
			messageTool.loadMessage(pageLoader.getWnd(),
				"Activation Not Successful",
				"Either the username provided, or the activation key " +
				"specified was incorrect. Please double check the link " +
				"you received in your email from us. If you already have, feel free to email " + 
				"support@rutgersxchange.com for further assistance."
			);
		});
	});

})( jQuery );
