(function( $ ) {
	
	var NotificationApi = {};

	NotificationApi.stem = "/notifications/";

	NotificationApi.tick = function() {
		var params = apiHandler.requireAuth();
		apiHandler.doRequest("get", NotificationApi.stem, params, function success(data) {

			if(data.notifications.length > 0) {
				console.log(data.notifications);
			}

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
	}

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