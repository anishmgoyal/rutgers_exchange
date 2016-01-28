$(document).ready(function() {

	// Bind handler for the framing of the window
	equalizeMainContentColumnSizes();
	$(window).load(equalizeMainContentColumnSizes);
	$(window).resize(equalizeMainContentColumnSizes);

	// Bind handler for vertical centering
	vcenter();
	$(window).load(vcenter);
	$(window).resize(vcenter);

	// Make mobile buttons work
	$('.toggle-menu').click(createMobileMenu);
	$('.toggle-menu-hide').click(destroyMobileMenu);
	$('.toggle-search').click(createMobileSearchBar);
	$('.toggle-search-hide').click(destroyMobileSearchBar);

	// Bind the search form(s) to the correct handler
	var bigSearchForm = $(".bigSearchForm");
	var bigSearchBar = $("#query");
	bigSearchForm.submit(searchForm.bind(bigSearchBar[0], bigSearchBar));
	
	// Load appropriate links in the navigation bar
	checkLoginState();
	
	// Start-up configuration the pageLoader framework
	pageLoader.pageChange(destroyMobileMenu);
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
		console.log("Vertical centering...");
		var instance = $(this);
		var parent = instance.parent();

		var instanceHeight = instance.outerHeight();
		var parentHeight = parent.outerHeight();

		var topMargin = parentHeight / 2 - instanceHeight / 2;
		instance.css("margin-top", topMargin + "px");
	});
}

function createMobileMenu() {
	destroyMobileSearchBar();
	var mobileMenu = $('<div class="show-for-small sidebar-container small-12 columns" />').html($('.sidebar-container').html());
	mobileMenu.css('z-index', '50')
		  .css('height', 'auto')	
		  .css('position', 'absolute');
	mobileMenu.find('.sidebar').css("height", "auto");

	var overlay = $('<div class="overlay show-for-small">&nbsp;</div>')
		  .click(destroyMobileMenu)
		  .css('background-color', 'rgba(0, 0, 0, 0.8')
		  .css('width', '100%')
		  .css('position', 'absolute')
		  .css('z-index', '45');

	var topbarHeight = $('nav').outerHeight();
	var maincontentHeight = $('.main-container').outerHeight();
	mobileMenu.css('top', topbarHeight + "px");
	overlay.css('height', maincontentHeight + "px");
	$(document.body).append(mobileMenu);
	$(document.body).append(overlay);
	$('.toggle-menu').hide();
	$('.toggle-menu-hide').show();
	$(window).scrollTop(0);
}

function destroyMobileMenu() {
	$('.sidebar-container.show-for-small,.overlay').remove();
	$('.toggle-menu').show();
	$('.toggle-menu-hide').hide();
}

function createMobileSearchBar() {
	destroyMobileMenu();
	$(".toggle-search").hide();
	$(".toggle-search-hide").show();

	var queryBar = $('<div class="show-for-small query-box small-12 columns" />')
			.css("position", "fixed")
			.css("top", 0)
			.css("padding-top", "75px")
			.css("background-color", "#3b3b3c")
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

function destroyMobileSearchBar() {
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
		pageLoader.setParam("user_id", auth.user_id);
		pageLoader.setParam("session_token", auth.session_token);
		pageLoader.setParam("csrf_token", auth.csrf_token);
		linkHelper.loadState("STATE_AUTH");
	} else {
		linkHelper.loadState("STATE_UNAUTH");
	}
}

function _id(id) {return document.getElementById(id);}