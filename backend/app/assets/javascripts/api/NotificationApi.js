(function( $ ) {
	
	var NotificationApi = {};

	NotificationApi.stem = "/notifications/";
	NotificationApi.websock_stem = "/faye";

	NotificationApi.client = null;

	NotificationApi.checkForDisconnect = false;

	NotificationApi.tick = function() {
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
			// Start watching for any disconnects.
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

				NotificationApi.endSession();
				pageLoader.removeParam("user_id");
				pageLoader.removeParam("username");
				pageLoader.removeParam("session_token");
				pageLoader.removeParam("csrf_token");
				linkHelper.loadState("STATE_UNAUTH");
				cookieManager.deleteAuth();

				new Dialog({
					confirm: true,
					title: "Logged Out",
					content: "Your session on " + window.serviceName + " has expired. Would you like to log back in? " +
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
			UserApi.asyncVerifySession(function success(data) {
				NotificationApi.checkForDisconnect = true;
				NotificationApi.tick();
			}, function error(code) {
				if(code == 403) {
					new Dialog({
						confirm: true,
						title: "Logged Out",
						content: "Your session on " + window.serviceName + " has expired. Would you like to log back in? " +
								 "Any unsaved changes will be lost.",
						wnd: pageLoader.getWnd(),
						offsets: {top: $("#nav")},
						onconfirm: function() {
							pageLoader.loadPage("/login");
						}
					}).show();
				} else {
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
				}
			});
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

	var handleNewMessage = function(notification) {
		if(pageLoader.getMainPath() == "/messages") {
			var messageApplication = pageLoader.getParam("messageApplication");
			messageApplication.processChatNotification.call(messageApplication, notification);
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

	// TODO: Plan of action for this code segment
	// Legacy - should be determined if this is even useful
	// If so: should be integrated with the backend again
	// If not: should be removed
	NotificationApi.tickShortPoll = function() {
		var params = apiHandler.requireAuth();
		apiHandler.skipIcon(params);
		apiHandler.skipRegistry(params);
		apiHandler.doRequest("get", NotificationApi.stem, params, function success(data) {

			for(var i = 0; i < data.notifications.length; i++) {
				if(data.notifications[i].type == "NOTIF_NEW_MESSAGE") {
					handleNewMessage(data.notifications[i].value);
				} else if(data.notifications[i].type == "NOTIF_NEW_PRODUCT") {
					handleNewProduct(data.notifications[i].value);
				}
			}

			var nextTick = data.tick_delay;
			if(nextTick < 2) nextTick = 2;
			setTimeout(NotificationApi.tick, data.tick_delay * 1000);
			
		}, function error(code) {
			console.log(code);
		});
	};

	window.NotificationApi = NotificationApi;

})( jQuery );