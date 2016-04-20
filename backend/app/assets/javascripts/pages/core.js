(function() {

	pageLoader.mountPage("/core", false, function() { 
		pageLoader.redirect("/index");
		window.location = "/core";
	});

})();