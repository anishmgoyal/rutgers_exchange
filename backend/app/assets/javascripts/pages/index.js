$(document).ready(function() {

	pageLoader.mountPage("/index", false, function(wnd) {
		var instance = this;
		ProductApi.getProductList(
			function success(apiResponse) {
				$.ajax({
					url: 'pages/index.htm',
					cache: false,
					dataType: 'html',
					success: function(data) {
						wnd.html(data);
						loadPage_index(instance, wnd, apiResponse.products);
					},
					error: function() {
						instance.loadHandler(404);
					}
				});
			}, function error(code) {
				instance.loadHandler(code);
			}
		);
	});
	pageLoader.addAlias("/home", "/index");
	
	function loadPage_index(pageLoader, wnd, products) {
		var i, item;
	
		var sectionTemplate = wnd.find('#sectTemplate1').html();
		var itemTemplate = wnd.find('#productTemplate1').html();

		var recentAdded = $('<section />').html(sectionTemplate);
		recentAdded.find('.template_title').text("Recently Added");
		recentAdded.find('.template_link').each(function() {
			var instance = $(this);
			var curr_attr = instance.attr("href");
			var final_attr = curr_attr.replace(/:url/g, "/sect");
			instance.attr("href", final_attr);
		});
		var recentAddedList = recentAdded.find('.template_list');
		if(products.length == 0) {
			recentAddedList.text("There are currently no items available that have not been sold.");
		} else {
			for(i = 0; i < products.length; i++) {
				item = $(itemTemplate);
				var clickFN = (function(id) {
					return function() {
						pageLoader.redirect("/products/view/" + id);
					}
				})(products[i].product_id);
				item.find('.template_image').attr("src", ImageApi.serverImageURL(products[i].thumbnail, ImageApi.PRODUCT));
				item.find('.template_name').text(products[i].product_name);
				item.find('.template_price').text("$" + apiHandler.serverCurrencyToClient(products[i].product_price));
				item.click(clickFN);
				recentAddedList.append(item);
			}
		}
		wnd.append(recentAdded);

		if(pageLoader.hasParam("username")) {
			ProductApi.getUserProductList(pageLoader.getParam("username"), function success(wnd, sectionTemplate, itemTemplate, data) {
				var products = data.products;
				if(products.length > 0 && pageLoader.getMainPath() == "/index") {
					var myListQuickView = $('<section />').html(sectionTemplate);
					myListQuickView.find('.template_title').text("My Products");
					myListQuickView.find('.template_link').each(function() {
						var instance = $(this);
						var curr_attr = instance.attr("href");
						var final_attr = curr_attr.replace(/:url/g, "/products");
						instance.attr("href", final_attr);
					});
					var mlqvList = myListQuickView.find('.template_list');
					for(var i = 0; i < products.length; i++) {
						var item = $(itemTemplate);
						var clickFN = pageLoader.redirect.bind(pageLoader, "/products/view/" + products[i].product_id);
						item.find('.template_image').attr("src", ImageApi.serverImageURL(products[i].thumbnail, ImageApi.PRODUCT));
						item.find('.template_name').text(products[i].product_name);
						item.find('.template_price').text("$" + apiHandler.serverCurrencyToClient(products[i].product_price));
						item.click(clickFN);
						mlqvList.append(item);
					}
					wnd.append(myListQuickView);
					this.notifyChange();
				}
			}.bind(pageLoader, wnd, sectionTemplate, itemTemplate), function error(code) {
				// Let this one slide...
			});
		}

		wnd.find('.template').remove();
		pageLoader.notifyDone();
	}

});
