$(document).ready(function() {

	pageLoader.mountPage("/login", function(wnd) {
		$.ajax({
			url: 'pages/login.htm',
			cache: false,
			datatype: 'html',
			success: function(data) {
				wnd.html(data);
				$("#username").focus();
				$("#login-form").submit(function(e) {
					UserApi.authenticate();
					if(e.preventDefault) e.preventDefault();
					return false;
				});
				var errors = pageLoader.getErrors();
				for(var i = 0; i < errors.length; i++) {
					switch(errors[i].field) {
						case 'global':	$('#login-error').html(errors[i].message);
								break;
					}
				}
				pageLoader.notifyDone();
			},
			error: function() {
				pageLoader.loadHandler(404);
			}
		});
	});

});