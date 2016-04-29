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
			if(NotificationApi.handlers.hasOwnProperty(message.type)) {
				NotificationApi.handlers[message.type](message.value);
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

	var handleNewOffer = function(notification) {
		if(pageLoader.getMainPath() == "/offers" && pageLoader.getSubPath().indexOf("/selling") > -1) {
			pageLoader.reloadPage();
		}
		
		var stubs = offerStubs(notification);
		var message = "You received an offer of $" + apiHandler.serverCurrencyToClient(notification.offer.price) +
					  " for your listing " + stubs.product + " from " + stubs.username + ".";
		offerNotif(notification, "Selling", message);
	};

	var handleNewConversation = function(notification) {
		if(pageLoader.getMainPath() == "/messages") {

		} 

		var stubs = offerStubs(notification);
		stubs.conversation = "{m:" + notification.conversation + ":here}";

		var message = "Your offer of $" + apiHandler.serverCurrencyToClient(notification.offer.price) +
					  " for " + stubs.product + " was accepted by " + stubs.username + ". You may now chat " +
					  "with them " + stubs.conversation + ".";

		notificationManager.addNotification({
			tool: "Messages",
			icon: "mail",
			link: "/messages/" + encodeURIComponent(notification.conversation),
			text: message,
			time: notificationManager.currentTimeString()
		});
	};

	var handleUpdatedOffer = function(notification) {
		if(pageLoader.getMainPath() == "/offers" && pageLoader.getSubPath().indexOf("/selling") > -1) {
			pageLoader.reloadPage();
		}

		var stubs = offerStubs(notification);
		var message = stubs.username + "'s offer of $" + apiHandler.serverCurrencyToClient(notification.offer.prev_price) +
				      " for your listing " + stubs.product + " was changed to " +
					  "$" + apiHandler.serverCurrencyToClient(notification.offer.price) + ".";
		offerNotif(notification, "Selling", message);
	};

	var handleRevokedOffer = function(notification) {
		if(pageLoader.getMainPath() == "/offers" && pageLoader.getSubPath().indexOf("/selling") > -1) {
			pageLoader.reloadPage();
		}

		var stubs = offerStubs(notification);
		var message = stubs.username + "'s offer of $" + apiHandler.serverCurrencyToClient(notification.offer.price) +
					  " for your listing " + stubs.product + " was revoked.";
		offerNotif(notification, "Selling", message);
	};

	var handleRejectedOffer = function(notification) {
		if(pageLoader.getMainPath() == "/offers" && pageLoader.getSubPath().indexOf("/buying") > -1) {
			pageLoader.reloadPage();
		}

		var stubs = offerStubs(notification);
		var message = stubs.username + " rejected your offer of $" + apiHandler.serverCurrencyToClient(notification.offer.price) +
					  " for the listing " + stubs.product + ".";
		offerNotif(notification, "Buying", message);
	};

	var handleTransactionFinished = function(notification) {
		if(pageLoader.getMainPath() == "/messages") {

		}

		var stubs = offerStubs(notification);

		var message = stubs.username + " marked the listing " + stubs.product +
					  " as sold to you.";
					  
		notificationManager.addNotification({
			tool: "Messages",
			icon: "mail",
			link: "/messages",
			text: message,
			time: notificationManager.currentTimeString()
		});
	};

	NotificationApi.handlers = {
		NOTIF_NEW_MESSAGE: handleNewMessage,
		NOTIF_NEW_OFFER: handleNewOffer,
		NOTIF_NEW_CONVERSATION: handleNewConversation,
		NOTIF_OFFER_UPDATED: handleUpdatedOffer,
		NOTIF_OFFER_REVOKE: handleRevokedOffer,
		NOTIF_OFFER_REJECT: handleRejectedOffer,
		NOTIF_TRANSACTION_FINISHED: handleTransactionFinished
	};

	var offerStubs = function(notification) {
		var usernameStub = "{u:" +
							notificationManager.encodeString(notification.user.username) +
							":" +
							notificationManager.encodeString(notification.user.first_name + " " + notification.user.last_name) +
							"}";

		var productStub = "{p:" +
						  notificationManager.encodeString(notification.product.id.toString()) +
						  ":" +
						  notificationManager.encodeString(notification.product.product_name) +
						  "}";

		return {username: usernameStub, product: productStub};
	};

	var offerNotif = function(notification, page, message) {
		notificationManager.addNotification({
			tool: page,
			link: "/offers/" + page.toLowerCase(),
			icon: "price-tag",
			text: message,
			time: notification.offer.created_at
		});
	};

	window.NotificationApi = NotificationApi;

})( jQuery );