(function( $ ) {
	
	var NotificationApi = {};

	NotificationApi.stem = "/notifications/";
	NotificationApi.websock_stem = "/faye";

	NotificationApi.client = null;

	NotificationApi.checkForDisconnect = false;

	NotificationApi.tick = function() {

		if(this.client != null) {
			this.endSession();
		}

		var client = new Faye.Client(apiHandler.server + NotificationApi.websock_stem);
		client.addExtension({
			outgoing: function(message, callback) {
				if(!message.hasOwnProperty("ext")) message.ext = {};
				apiHandler.requireAuth(message.ext);
				callback(message);
			}
		});
		client.subscribe("/user/" + pageLoader.getParam("username"), function(message) {
			if(message.type == "NOTIF_NEW_MESSAGE") {
				handleNewMessage(message.value);
			}
		}).then(function success(message) {
			NotificationApi.checkForDisconnect = true;
		}, function error(message) {
			new Dialog({
				title: "Failed to Connect",
				content: "Failed to connect to server. Messages and notifications will not be available.",
				wnd: pageLoader.getWnd(),
				offsets: {
					top: $("#nav")
				}
			}).show();
		});

		client.subscribe("/session/" + pageLoader.getParam("session_token"), function(message) {
			if(message.type == "SESSION_END_NOTICE") {
				if(!NotificationApi.checkForDisconnect) return;

				UserApi.dethenticate();

				new Dialog({
					confirm: true,
					title: "Logged Out",
					content: "Your session on " + window.server.serviceName + " has expired. Would you like to log back in? " +
							 "Any unsaved changes will be lost.",
					wnd: pageLoader.getWnd(),
					offsets: {top: $("#nav")},
					onconfirm: function() {
						pageLoader.loadPage("/login");
					}
				}).show();
			}
		}).then(function success(message) {
			// Do nothing, just be happy.
		}, function error(message) {
			// Do nothing, just be sad.
		});

		client.on('transport:down', function() {
			if(!NotificationApi.checkForDisconnect) return;

			NotificationApi.endSession();
			NotificationApi.checkForDisconnect = false;

			NotificationApi.tryReconnect(1);
		});

		NotificationApi.client = client;
	};

	NotificationApi.endSession = function() {
		NotificationApi.checkForDisconnect = false;
		if(NotificationApi.client) {
			NotificationApi.client.disconnect();
			NotificationApi.client = null;
		}
	};

	NotificationApi.tryReconnect = function(attempts) {
		if(attempts > 5) {
			new Dialog({
				confirm: true,
				title: "Disconnected from " + window.server.serviceName,
				content: "It seems like you've been disconnected from the server. This means you will not be " +
						 "able to receive notifications or messages. Would you like to reload the page and try again?",
				wnd: pageLoader.getWnd(),
				offsets: {top: $("#nav")},
				onconfirm: function() {
					window.location.reload();
				}
			}).show();
		} else {
			UserApi.asyncVerifySession(function success(data) {
				NotificationApi.checkForDisconnect = true;
				NotificationApi.tick();
			}, function error(code) {
				if(code == 403) {
					new Dialog({
						confirm: true,
						title: "Logged Out",
						content: "Your session on " + window.server.serviceName + " has expired. Would you like to log back in? " +
								 "Any unsaved changes will be lost.",
						wnd: pageLoader.getWnd(),
						offsets: {top: $("#nav")},
						onconfirm: function() {
							pageLoader.loadPage("/login");
						}
					}).show();
				} else {
					NotificationApi.tryReconnect(attempts + 1);
				}
			});
		}
	};

	var handleNewMessage = function(notification) {
		if(pageLoader.getMainPath() == "/messages") {
			var messageApplication = pageLoader.getParam("messageApplication");
			messageApplication.processChatNotification.call(messageApplication, notification);
		} else {
			if(notification.message.user.id != pageLoader.getParam("user_id")) {
				var usernameStub = "{m:" +
									notificationManager.encodeString(notification.conversation.toString()) +
									":" +
									notificationManager.encodeString(notification.message.user.first_name) +
									"}";

				var messageText = notification.message.message;
				if(messageText.length >= 100) messageText = messageText.substring(0, 97) + "...";

				var timeString = notification.message.created_at;
				timeString = timeString.substring(timeString.indexOf("at") + 3).toUpperCase();

				var messageTitle = notification.product.product_name;

				notificationManager.addNotification({
					tool: messageTitle,
					link: "/messages/" + encodeURIComponent(notification.conversation),
					icon: "mail",
					text: usernameStub + notificationManager.encodeString(": " + messageText),
					time: timeString
				});
			}
		}
	};

	var handleNewProduct = function(notification) {
		if(pageLoader.getMainPath() == "/index") {
			var list = $('.template_list');
			var template = list.find('.template_item').first();
			var new_item = $(template.clone());
			new_item.find('.template_name').text(notification.product.product_name);
			new_item.find('.template_price').text(apiHandler.serverCurrencyToClient(notification.product.price));
			new_item.click(function(id) {pageLoader.redirect("/products/view/" + id); }.bind(this, notification.product.id));
			new_item.hide();
			list.prepend(new_item);
			new_item.fadeIn();
		}
	}

	window.NotificationApi = NotificationApi;

})( jQuery );