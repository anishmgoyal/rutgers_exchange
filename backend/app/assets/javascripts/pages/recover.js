(function( $ ) {
	
	pageLoader.mountPage("/recover", false, function(wnd) {

		var subpath = pageLoader.getSubPath();
		switch(subpath) {
			case "":
			case "/":
				if(!pageLoader.isAuth())
					load_page_(wnd);
				else
					pageLoader.redirect("/index");
				break;
			default:
				if(subpath.indexOf("/apply") == 0) {
					if(!pageLoader.isAuth())
						load_page_apply(wnd, subpath);
					else
						pageLoader.redirect("/index");
				} else if(subpath.indexOf("/remove") == 0) {
					load_page_remove(wnd, subpath);
				} else {
					pageLoader.loadHandler(404);
				}
		}
	});

	var load_page_ = function(wnd) {
		pageLoader.getTemplate("recover/index", function(wnd) {
			$("#email_address").focus();

			var errors = pageLoader.getErrors();
			for(var i = 0; i < errors.length; i++) {
				var error = errors[i];
				if(error.field == "global") {
					$("#recovery-error").text(error.message);
				}
			}

			$("#recovery-form").submit(function(e) {
				RecoveryApi.create(function success(data) {
					messageTool.loadMessage(
							pageLoader.getWnd(),
							"Request Successful",
							"We sent you an email with a link as well as " +
								"a short five to seven digit code. Please check your " +
								"spam box if you don't find it in your inbox. " +
								"It may take about five to ten minutes for the email " +
								"to arrive. The link and code will be valid for " +
								"seven days. " +
								"Click <a href='#!/login'>here</a> to go back to " +
								"the login page, or <a href='#!/index'>here</a> to " +
								"go back to the home page."
						);
				}, function error(code) {
					if(code == 472) {
						messageTool.loadMessage(
							pageLoader.getWnd(),
							"Too Many Recovery Requests",
							"It looks like you've already asked us to send you " +
								"an email so that you can reset your password. If you " +
								"didn't receive the email, try checking your spam box. If " +
								"you deleted the email, or still can't find it, please either " +
								"wait seven days, or contact support at " + window.server.supportEmail +
								", and we'll get back to you as soon as we can. " +
								"Click <a href='#!/index'>here</a> to go back to " +
								"the home page."
						);
					} else if(code == 404) {
						pageLoader.addError({field: "global", message: "There is no account under that email address."});
						pageLoader.reloadForm(apiHandler.processForm("email_address"));
					} else pageLoader.loadHandler(code);
				});
				if(e.preventDefault) e.preventDefault();
				else return false;
			});
			pageLoader.notifyDone();
		});
	};

	load_page_apply = function(wnd, subpath) {
		var segments = subpath.split("/");
		if(segments.length < 2) {
			pageLoader.loadHandler(404);
		} else {
			var userId = segments[3];
			var recoveryString = decodeURIComponent(segments[2]);
			
			pageLoader.getTemplate("recover/apply", function success(wnd) {
				$("#user_id").val(userId);
				$("#recovery_string").val(recoveryString);
				$("#recovery_code").focus();

				var errors = pageLoader.getErrors();
				for(var i = 0; i < errors.length; i++) {
					$("#" + errors[i].field + "_error").text(errors[i].message);
				}

				$("#recovery-form").submit(function(e) {
					RecoveryApi.apply(function success(data) {
						if(data.error) {
							pageLoader.addErrors(data.errors);
							pageLoader.reloadForm(apiHandler.processForm("user_id", "recovery_string", "recovery_code"));
						} else {
							messageTool.loadMessage(
								pageLoader.getWnd(),
								"Password Reset",
								"Your password has been successfully reset. We are now redirecting you to the " +
									"login page.",
								"/login"
							);
						}
					}, function error(code) {
						if(code == 404) {
							pageLoader.addError({
								field: "recovery_code",
								message: "The code or link you entered is invalid."
							});
							pageLoader.reloadForm(apiHandler.processForm("user_id", "recovery_string", "recovery_code", "password", "password_confirmation"));
						} else pageLoader.loadHandler(code);
					});
					if(e.preventDefault) e.preventDefault();
					else return false;
				});

				pageLoader.notifyDone();
			});
		}
	};

	var load_page_remove = function(wnd, subpath) {
		var segments = subpath.split("/");
		pageLoader.notifyDone();
		if(segments.length < 2) {
			pageLoader.loadHandler(404);
		} else {
			var userId = segments[3];
			var recoveryString = decodeURIComponent(segments[2]);

			RecoveryApi.remove(userId, recoveryString, function success(data) {
				messageTool.loadMessage(
					pageLoader.getWnd(),
					"Removed Successfully",
					"The password recovery request has been removed, and " +
						"no recovery requests can be made for your account for the " +
						"next seven days. If you need your password reset in that " +
						"time, please send an email to " + window.server.supportEmail +
						"from the email address your account is under, and we'll get " +
						"back to you as soon as we can. Click <a href='#!/index'>here</a> " +
						"to go back to the home page."
				);
			}, function error(code) {
				pageLoader.loadHandler(code);
			});
		}
	};

})( jQuery );
