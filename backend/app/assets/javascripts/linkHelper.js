(function( $ ) {

	var LinkHelper = function linkHelper_cons(params) {
		if(this.constructor !== linkHelper_cons) return new linkHelper_cons();
		this.navPane = params.navPane;
		this.pages = {};
		this.linkSets = {};
	};
	LinkHelper.prototype.loadState = function(state) {
		var linkSet = this.linkSets[state];
		for(var param in linkSet.mount) {
			if(linkSet.mount.hasOwnProperty(param)) {
				var section = $('#nav_links_' + param);
				var pages = linkSet.mount[param];
				for(var i = 0; i < pages.length; i++) {
					var page = this.pages[pages[i]];
					if(page) {
						// Remove any existing version of the page to prevent duplicates, then add the new link.
						section.find("#mounted_page_" + pages[i]).remove();
						section.append($('<a id="mounted_page_' + pages[i] + '" href="#!' + page.uri + '">' + page.text + '</a>'));
					}
				}
			}
		}
		for(param in linkSet.unmount) {
			if(linkSet.unmount.hasOwnProperty(param)) {
				section = $('#nav_links_' + param);
				pages = linkSet.unmount[param];
				for(i = 0; i < pages.length; i++) {
					section.find("#mounted_page_" + pages[i]).remove();
				}
			}
		}
		this.updateBadge("messages", 0);
	};
	LinkHelper.prototype.updateBadge = function(page, count) {
		var link = $("#mounted_page_" + page);
		var page = this.pages[page];
		if(page) {
			if(count == 0) {
				link.css("font-weight", "normal");
				link.text(page.text);
			} else {
				link.css("font-weight", "bold");
				link.text("(" + count + ") " + page.text);
			}
		}
	};
	
	var constants = {
		SECT_STUB: "/sect/"
	};
	
	var defaultMountablePages = {
		index: {
			uri: "/index",
			text: "Home"
		},
		listnew: {
			uri: "/products/new",
			text: "Post Products"
		},
		login: {
			uri: "/login",
			text: "Login"
		},
		logout: {
			uri: "/logout",
			text: "Logout"
		},
		messages: {
			uri: "/messages",
			text: "Messages",
			badge: true
		},
		myprofile: {
			uri: "/profile/me",
			text: "My Profile"
		},
		offers: {
			uri: "/offers",
			text: "Offers",
			badge: true
		},
		products: {
			uri: "/products",
			text: "My Products"
		},
		register: {
			uri: "/register",
			text: "Register"
		}
	}
	
	var defaultLinkSets = {
		STATE_UNAUTH: {
			mount: {
				main: [
					"index",
					"login",
					"register"
				]
			},
			unmount: {
				main: [
					"messages",
					"offers",
					"products",
					"listnew",
					"myprofile",
					"logout"
				]
			}
		},
		STATE_AUTH: {
			mount: {
				main: [
					"index",
					"messages",
					"offers",
					"products",
					"listnew",
					"myprofile",
					"logout"
				]
			},
			unmount: {
				main: [
					"login",
					"register"
				]
			}
		}
	};
	
	window.LinkHelper = LinkHelper;
	$(document).ready(function() {
		window.linkHelper = new LinkHelper({navPane: $("nav")});
		
		// Load all constants
		for(var param in constants) {
			if(constants.hasOwnProperty(param)) {
				linkHelper[param] = constants[param];
			}
		}
		
		// Load default page set
		for(var param in defaultMountablePages) {
			if(defaultMountablePages.hasOwnProperty(param)) {
				linkHelper.pages[param] = defaultMountablePages[param];
			}
		}
		
		// Load default link sets
		for(var param in defaultLinkSets) {
			if(defaultLinkSets.hasOwnProperty(param)) {
				linkHelper.linkSets[param] = defaultLinkSets[param];
			}
		}
		
	});

})( jQuery );