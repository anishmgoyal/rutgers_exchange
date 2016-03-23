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
        misc: {
            section_title: "Miscellaneous",
            section_code: "MISC"
        }
    };

    pageLoader.mountPage("/sect", function (wnd) {
        pageLoader.getTemplate("section/index", function(wnd) {
            var section = sectionList[pageLoader.getSubPath().substring(1)];
            if (section === undefined) {
                console.log("Undefined section");
                console.log(pageLoader.getSubPath());
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
                    pageSize: 50,
                    loadingIcon: loadingIcon,
                    loadPageApi: ProductApi,
                    loadPageParameters: [section.section_code],
                    loadPageFunction: ProductApi.getProductListSect,
                    loadPageSuccess: function (data) {
                        var target = $("#main-list");
                        var products = data.products;
                        for (var i = 0; i < products.length; i++) {
                            var product = products[i];
                            var productElem = $(itemTemplate);
                            productElem.find(".template_name").text(product.product_name);
                            productElem.find(".template_price").text("$" + apiHandler.serverCurrencyToClient(product.product_price));
                            productElem.find(".template_image").attr("src", ImageApi.serverImageURL(product.thumbnail, ImageApi.PRODUCT));
                            productElem.click(pageLoader.redirect.bind(pageLoader, "/product/view/" + product.product_id));
                            target.append(productElem);
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