(function ( $ ) {

    var sectionList = {
        "": {
            section_title: "All Listings",
            section_code: null
        },
        textbook: {
            section_title: "Textbooks",
            section_code: "TEXTBOOK"
        },
	electronics: {
		section_title: "Electronics",
		section_code: "ELECTRONICS"
	},
	housing: {
		section_title: "Housing",
		section_code: "HOUSING"
	},
	homegoods: {
		section_title: "Home Goods & Furniture",
		section_code: "HOMEGOODS"
	},
	automotive: {
		section_title: "Automotive",
		section_code: "AUTOMOTIVE"
	},
	clothing: {
		section_title: "Clothing",
		section_code: "CLOTHING"
	},
	athletic: {
		section_title: "Athletic Equipment",
		section_code: "ATHLETIC"
	},
        misc: {
            section_title: "Miscellaneous",
            section_code: "MISC"
        }
    };

    pageLoader.mountPage("/sect", false, function (wnd) {
        pageLoader.getTemplate("section/index", function(wnd) {
            var section = sectionList[pageLoader.getSubPath().substring(1)];
            if (section === undefined) {
                pageLoader.loadHandler(404);
            } else {
                // Get the loading icon and remove it from the DOM
                var loadingIcon = $("#loadingIcon1").find("div")[0];
                loadingIcon.parentNode.removeChild(loadingIcon);

                var itemTemplate = $("#productTemplate1").html();
                var button = document.getElementById("template_lmb");
                $("#template_title").text(section.section_title);

                var pager = new Pager({
                    button: button,
                    pageList: "products",
                    pageSize: 24,
                    loadingIcon: loadingIcon,
                    loadPageApi: ProductApi,
                    loadPageParameters: [section.section_code],
                    loadPageFunction: ProductApi.getProductListSect,
                    loadPageSuccess: function (data) {
                        var target = $("#main-list");
                        var products = data.products;
                        $(".show-for-one-or-more-load").css("display", "block");
			if(products.length > 0) {
			    $(".show-for-none").remove();
			    for (var i = 0; i < products.length; i++) {
				var product = products[i];
				var productElem = $(itemTemplate);
				productElem.find(".template_name").text(product.product_name);
				productElem.find(".template_price").text("$" + apiHandler.serverCurrencyToClient(product.product_price));
				productElem.find(".template_image").attr("src", ImageApi.serverImageURL(product.thumbnail, ImageApi.PRODUCT));
				productElem.click(pageLoader.redirect.bind(pageLoader, "/products/view/" + product.product_id));
				target.append(productElem);
			    }
			}
                        pageLoader.notifyChange();
                    },
                    loadPageError: function (code) {
                        pageLoader.loadHandler(code);
                    }
                });
                pager.nextPage();
                pageLoader.notifyDone();
            }
        });
    });

})( jQuery );
