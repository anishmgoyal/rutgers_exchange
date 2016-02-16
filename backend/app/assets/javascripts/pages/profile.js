(function( $ ) {
	
	pageLoader.mountPage("/profile", function(wnd) {

		var subpath = pageLoader.getSubPath();
		var username = subpath.substring(1);

		if(username == "me") {
			var current = pageLoader.getParam("username");
			if(current) username = current;
		}

		pageLoader.getTemplate("profile/index", function(wnd) {
			load_page_index(wnd, username);
		});

	});

	var load_page_index = function(wnd, username) {
		UserApi.getUserInformation(username, function success(data) {
			wnd.find("#template_user_fullname").text(data.first_name + " " + data.last_name);
			wnd.find("#template_username").text(data.username);
			wnd.find("#template_service_name").text(server.serviceName);
			wnd.find("#template_created_at").text(data.created_at);
			if(data.email_address) {
				wnd.find(".template_show_for_other").hide();
			} else {
				wnd.find(".template_show_for_self").hide();
			}
			wnd.find("#template_user_info").css("display", "block");
		}, function error(code) {
			pageLoader.loadHandler(code);
		});

		ProductApi.getRecentUserProductListWithSold(username, function success(data) {
			data = data.products;
			if(data.length > 0) {
				var targetDiv = $("#template_products").text("");

				var listTemplate = wnd.find("#template_product_list").html();
				var itemTemplate = wnd.find("#template_product").html();

				var activeList = $(listTemplate);
				var soldList = $(listTemplate);

				var numActive = 0;
				var numSold = 0;

				for(var i = 0; i < data.length; i++) {
					var product = data[i];

					var item = $(itemTemplate);
					item.find(".template_image").attr("src", ImageApi.serverImageURL(product.thumbnail, ImageApi.PRODUCT));
					item.find(".template_name").text(product.product_name);
					item.find(".template_price").text("$" + apiHandler.serverCurrencyToClient(product.product_price));

					if(!product.sold) {
						activeList.append(item);
						item.click(pageLoader.redirect.bind(pageLoader, "/products/view/" + product.product_id));
						numActive ++;
					} else {
						soldList.append(item);
						item.css("cursor", "default");
						numSold ++;
					}
				}

				if(numActive > 0) {
					activeList.find(".template_title").text("Recent Listings for Sale");
					targetDiv.append(activeList);
				}
				if(numSold > 0) {
					soldList.find(".template_title").text("Recently Sold");
					targetDiv.append(soldList);
				}
				pageLoader.notifyChange();
			}
			$(".template").remove();
		}, function error(code) {
			pageLoader.loadHandler(code);
		});
	};

})( jQuery );
