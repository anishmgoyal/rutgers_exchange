$(document).ready(function() {
	
	if(window.server.configuration.indexOf("development") > -1) {
		pageLoader.mountPage("/debug", false, function(wnd) {
			var subpath = pageLoader.getSubPath();
			if(subpath == "" || subpath == "/") subpath = "/index";
			subpath += ".htm";
			$.ajax({
				url: "pages/debug" + subpath,
				cache: false,
				dataType: 'html',
				success: function(data) {
					wnd.html(data);
					pageLoader.notifyDone();
				},
				error: function() {
					pageLoader.notifyDone();
					pageLoader.loadHandler(404);
				}
			});
		});
	}

});
