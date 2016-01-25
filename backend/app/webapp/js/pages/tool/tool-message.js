$(document).ready(function() {
	
	window.messageTool = {
		currentRedirect: "/index",
		currentTimeout: 0,
		delaySeconds: 5,
		loadMessage: function(wnd, title, body, redirect) {	
			// Clear the page
			wnd.html("");

			var redirectLink = '<p><a href="#!' + redirect + '">Click here if you are not redirected within ten seconds.</a></p>';
			
			// Load the page
			wnd.append('' +
				'<br />' +
				'<br />' +
				'<div class="row">' +
					'<div class="small-12 medium-centered medium-10 columns">' +
						'<h4>' + title + '</h4>' +
						'<p>' + body + '</p>' +
						((typeof redirect !== "undefined")? redirectLink : '') +
					'</div>' +
				'</div>' +
			'');

			// Set the stage for redirection
			if(typeof redirect !== "undefined") {
				messageTool.currentRedirect = redirect;
				messageTool.currentTimeout = setTimeout(function() {
					pageLoader.redirect(messageTool.currentRedirect);
					messageTool.currentRedirect = "/index";
				}, messageTool.delaySeconds * 1000);
			}
		}
	};
	
	// Make sure that if a page is loaded, we don't hijack the page with a stale redirection timer.
	pageLoader.pageChange(function() {
		clearTimeout(messageTool.currentTimeout);
		messageTool.currentTimeout = 0;
	});

});