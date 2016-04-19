$(document).ready(function() {

	pageLoader.mountPage("/register", false, function(wnd) {
		$.ajax({
			url: 'pages/register.htm',
			cache: false,
			datatype: 'html',
			success: function(data) {
				wnd.html(data);
				$("#username").focus();
				$("#register-form").submit(function(e) {
					UserApi.register();
					if(e.preventDefault) e.preventDefault();
					return false;
				});
				var errors = pageLoader.getErrors();
				for(var i = 0; i < errors.length; i++) {
					$("#" + errors[i].field + "_error").html(errors[i].message);
				}
				pageLoader.notifyDone();
			},
			error: function() {
				pageLoader.loadHandler(404);
			}
		});
	});

	pageLoader.unauthOnly("/register");

});
