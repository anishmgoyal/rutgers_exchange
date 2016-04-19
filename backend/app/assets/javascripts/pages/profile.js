(function( $ ) {
	
	pageLoader.mountPage("/profile", false, function(wnd) {

		var subpath = pageLoader.getSubPath();
		var username = subpath.substring(1);

		if(username == "me") {
			if(pageLoader.isAuth()) {
				var current = pageLoader.getParam("username");
				if(current) username = current;
			} else {
				pageLoader.requireAuth();
				return;
			}
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
				map_edit_link(data);
			} else {
				wnd.find(".template_show_for_self").hide();
			}
			wnd.find("#template_user_info").css("display", "block");
			pageLoader.notifyChange();
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
			$(".template_p").remove();
		}, function error(code) {
			pageLoader.loadHandler(code);
		});
	};

	var map_edit_link = function(user) {
		var form = $("#template_edit_form").html();

		var link = $("#template_edit_link");
		link.click(function(user, e) {
			var submitFn = function(e) {
					UserApi.updateProfile(function success(data) {
						if(!data.error) {
							var first_name = $("#first_name").val();
							if(first_name.length > 0) user.first_name = first_name;
							var last_name = $("#last_name").val();
							if(last_name.length > 0) user.last_name = last_name;
							$("#template_user_fullname").text(user.first_name + " " + user.last_name);
							this.hide();
						} else {
							var errors = data.errors;
							for(var i = 0; i < errors.length; i++) {
								$("#" + errors[i].field + "_error").html(errors[i].message);
							}
						}
					}.bind(this), function error(code) {
						pageLoader.loadHandler(code);
					}.bind(this));

					if(e && e.preventDefault) e.preventDefault();
					else return false;
			};

			var dialog = new Dialog({
				title: "Edit Account",
				content: form,
				buttonText: "Save Details",
				height: 475,
				width: 400,
				wnd: pageLoader.getWnd(),
				offsets: {
					top: $("#nav")
				},
				onsubmit: submitFn
			}).show();

			$("#template_update_profile_form").submit(submitFn.bind(dialog));

			$("#first_name")[0].value = user.first_name;
			$("#last_name")[0].value = user.last_name;

			if(e.preventDefault) e.preventDefault();
			else return false;
		}.bind(window, user));

		$(".template_u").remove();
	};

})( jQuery );
