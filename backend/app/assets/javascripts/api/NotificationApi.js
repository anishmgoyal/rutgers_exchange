(function( $ ) {
	
	var NotificationApi = {};

	NotificationApi.stem = "/notifications/";
	NotificationApi.websock_stem = "/faye";

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
			// Do nothing, just be happy.
		}, function error(message) {
			new Dialog({
				title: "Failed to connect",
				content: "Failed to connect to server. Realtime events will not be available.",
				wnd: pageLoader.getWnd(),
				offsets: {
					top: $("#nav")
				}
			}).show();
		});
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

	window.NotificationApi = NotificationApi;

})( jQuery );