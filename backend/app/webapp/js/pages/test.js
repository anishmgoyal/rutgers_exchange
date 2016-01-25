$(document).ready(function() {

	pageLoader.mountPage("/test", function(wnd) {
		setTimeout(markDone, 1000);
	});
	
	var markDone = function() {
		console.log("Done");
		pageLoader.notifyDone();
	};

});