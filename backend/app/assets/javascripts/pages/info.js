(function() {

	pageLoader.mountPage("/info", false, function(wnd) {

		var subpath = pageLoader.getSubPath();

		if(subpath == "") {
			load_page_about(wnd);
		} else if(subpath == "/tos") {
			load_page_tos(wnd);
		} else if(subpath == "/contact") {
			load_page_contact(wnd);
		} else if(subpath == "/help") {
			load_page_help(wnd);
		} else pageLoader.loadHandler(404);

	});

	var load_page_about = function(wnd) {
		pageLoader.getTemplate("info/about", function(wnd) {
			pageLoader.notifyDone();
		});
	};

	var load_page_tos = function(wnd) {
		pageLoader.getTemplate("info/tos", function(wnd) {
			pageLoader.notifyDone();
		});
	};

	var load_page_contact = function(wnd) {
		pageLoader.getTemplate("info/contact", function(wnd) {
			pageLoader.notifyDone();
		});
	};

	var load_page_help = function(wnd) {
		pageLoader.getTemplate("info/help", function(wnd) {
			pageLoader.notifyDone();
		});
	};

})();
