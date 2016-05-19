$(document).ready(function() {

	var sidebar = new Sidebar(document.getElementById("sidebar"), document.getElementById("mobile_menu"), {
		close: destroyMobileMenu
	});

	// Bind handler for the framing of the window
	equalizeMainContentColumnSizes();
	$(window).load(equalizeMainContentColumnSizes);
	$(window).resize(equalizeMainContentColumnSizes);

	// Bind handler for vertical centering
	vcenter();
	$(window).load(vcenter);
	$(window).resize(vcenter);

	// Make mobile buttons work
	$('.toggle-menu').click(createMobileMenu.bind(window, sidebar));
	$('.toggle-menu-hide').click(destroyMobileMenu.bind(window, sidebar));
	$('.toggle-notif').click(createMobileNotifications.bind(window, sidebar));
	$('.toggle-notif-hide').click(destroyMobileNotifications.bind(window, sidebar));
	$('.toggle-search').click(createMobileSearchBar.bind(window, sidebar));
	$('.toggle-search-hide').click(destroyMobileSearchBar.bind(window, sidebar));

	notificationManager.setMobileCloseHandler(handleMobileNotificationClose);

	// Bind the search form(s) to the correct handler
	var bigSearchForm = $(".bigSearchForm");
	var bigSearchBar = $("#query");
	bigSearchForm.submit(searchForm.bind(bigSearchBar[0], bigSearchBar));

	// Load appropriate links in the navigation bar
	checkLoginState();

	// Bind an interface to pageLoader for apiHandler's loading icon IE let
	// pageLoader manage the icon
	apiHandler.setLoadingIcon({
		show: pageLoader.forceIsLoading.bind(pageLoader, true),
		hide: pageLoader.forceIsLoading.bind(pageLoader, false)
	});

	// Start-up configuration the pageLoader framework
	pageLoader.beforeChange(apiHandler.cancelRunning.bind(apiHandler));
	pageLoader.pageChange(destroyMobileMenu.bind(window, sidebar));
	pageLoader.pageChange(destroyMobileNotifications.bind(window, sidebar));
	pageLoader.pageChange(destroyMobileSearchBar.bind(window, sidebar));
	pageLoader.pageChange(function() {
		linkHelper.setPage(pageLoader.getMainPath(), window.location.hash.substring(2));
	});
	if(window.location.hash.length > 2)
		pageLoader.reloadPage();
	else 
		pageLoader.redirect("/index");

});

function equalizeMainContentColumnSizes() {
	var sidebar = $('.sidebar-container.hide-for-small');
	var maincontent = $('.main-container');
	var overlay = $('.overlay');
	
	sidebar.css("height", "auto");
	maincontent.css("height", "auto");
	
	var sidebarHeight = sidebar.outerHeight();
	var maincontentHeight = maincontent.outerHeight();
	
	var columnHeight = (sidebarHeight > maincontentHeight)? sidebarHeight : maincontentHeight;
	sidebar.css("height", columnHeight + "px");
	maincontent.css("height", columnHeight + "px");
	overlay.css("height", columnHeight + "px");
}

function vcenter() {
	var elems = $('.vcenter');
	elems.each(function() {
		var instance = $(this);
		var parent = instance.parent();

		var instanceHeight = instance.outerHeight();
		var parentHeight = parent.outerHeight();

		var topMargin = parentHeight / 2 - instanceHeight / 2;
		instance.css("margin-top", topMargin + "px");
	});
}

function createMobileMenu(sidebar) {
	destroyMobileSearchBar();
	destroyMobileNotifications();

	sidebar.openMobileMenu(pageLoader.getMainPath(), window.location.hash.substring(2));

	var overlay = $('<div class="overlay show-for-small">&nbsp;</div>')
		  .click(destroyMobileMenu.bind(window, sidebar))
		  .css('background-color', 'rgba(0, 0, 0, 0.8')
		  .css('width', '100%')
		  .css('position', 'absolute')
		  .css('z-index', '45');

	var maincontentHeight = $('.main-container').outerHeight();
	overlay.css('height', maincontentHeight + "px");
	$(document.body).append(overlay);
	$('.toggle-menu').hide();
	$('.toggle-menu-hide').show();
	$(window).scrollTop(0);
}

function destroyMobileMenu(sidebar) {
	$('.overlay').remove();
	sidebar.closeMobileMenu(pageLoader.getMainPath(), window.location.hash.substring(2));
	$('.toggle-menu').show();
	$('.toggle-menu-hide').hide();
	$(window).trigger("resize");
}

function createMobileNotifications(sidebar) {
	destroyMobileMenu(sidebar);
	destroyMobileSearchBar();
	notificationManager.renderMobileNotifications();
	$(".toggle-notif").hide();
	$(".toggle-notif-hide").show();
}

function destroyMobileNotifications(sidebar) {
	notificationManager.forceCloseMobileNotifications();
	$(".toggle-notif").show();
	$(".toggle-notif-hide").hide();
	$(window).trigger("resize");
}

function handleMobileNotificationClose() {
	$(".toggle-notif").show();
	$(".toggle-notif-hide").hide();
	$(window).trigger("resize");
}

function createMobileSearchBar(sidebar) {
	destroyMobileMenu(sidebar);
	destroyMobileNotifications();
	$(".toggle-search").hide();
	$(".toggle-search-hide").show();

	var queryBar = $('<div class="show-for-small query-box small-12 columns" />')
			.css("position", "fixed")
			.css("top", 0)
			.css("padding-top", "75px")
			.css("background-color", "rgb(158,34,34)")
			.css("box-shadow", "0 0 10px #222");
	var queryForm = $('<form class="search" />');
	var queryInput = $('<input type="text" id="mobile_query" name="query" placeholder="Search for..." />');
	var submitButton = $('<button type="submit"><i class="fi-magnifying-glass"></i></button>')
			.css("color", "black")	
			.css("position", "fixed")
			.css("top", "84px")
			.css("right", "25px")
			.css("background", "none")
			.css("padding", 0);
	queryForm.submit(searchForm.bind(queryInput[0], queryInput));
	queryBar.append(queryForm.append(queryInput).append(submitButton));
	$(document.body).append(queryBar);
}

function destroyMobileSearchBar(sidebar) {
	$(".toggle-search").show();
	$(".toggle-search-hide").hide();
	$(".query-box").remove();
}

function searchForm(searchBar, e) {
	destroyMobileSearchBar();
	pageLoader.redirect("/search/" + encodeURIComponent(searchBar.val()));
	if(e.preventDefault) e.preventDefault();
	return false;
}

function checkLoginState() {
	var auth = cookieManager.checkAuth();
	if(auth.logged_in) {
		UserApi.verifySession(auth.user_id, auth.session_token, auth.csrf_token, function success(auth, data) {
			pageLoader.setParam("user_id", auth.user_id);
			pageLoader.setParam("username", auth.username);
			pageLoader.setParam("session_token", auth.session_token);
			pageLoader.setParam("csrf_token", auth.csrf_token);
			linkHelper.loadState("STATE_AUTH");

			ConversationApi.getCounter(function success(data) {
				if(data.unread_count != 0) {
					notificationManager.addNotification({
						tool: "Messages",
						link: "/messages/",
						icon: "mail",
						text: notificationManager.encodeString("You have " + data.unread_count + " unread message" + ((data.unread_count == 1)? "" : "s") + "."),
						time: notificationManager.currentTimeString()
					});
				}
			});

			NotificationApi.tick();
		}.bind(pageLoader, auth), function error(code) {
			linkHelper.loadState("STATE_UNAUTH");
			cookieManager.deleteAuth();
		});
	} else {
		linkHelper.loadState("STATE_UNAUTH");
	}
}

function _id(id) {return document.getElementById(id);}
