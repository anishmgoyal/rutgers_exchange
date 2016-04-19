(function() {

	pageLoader.redirect("/index");
	pageLoader.mountPage("/core", false, function() { window.location = "/core"; });

})();
