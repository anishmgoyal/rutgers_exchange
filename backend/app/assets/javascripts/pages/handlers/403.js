$(document).ready(function() {

	pageLoader.mountHandler(403, function(wnd) {
		pageLoader.redirect("/login");
	});

});
