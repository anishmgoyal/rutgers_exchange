(function() {
	
	var Sidebar = function sidebar_constructor(elem, mobileElem, altParams) {
		if(!this.constructor == sidebar_constructor) return new sidebar_constructor(elem, mobileElem);

		this.elem = elem;
		this.mobileElem = mobileElem;
		this.linkSet = linkSet;

		this.altParams = altParams;

		var instance = this;

		loadLinkSet(this.linkSet, this.elem);
		loadMobileLinkSet(this.linkSet, this.mobileElem, this.mobileElem);

		eachByTag("a", function(link) {
			if(link.parentNode.className.indexOf("sidebar") > -1) {
				link.onclick = function() {
					setActiveClass(this, "active");
					eachByClass("dropdown_contents", startCollapse);
					if(this.className.indexOf("dropdown") > -1) {
						startExpand(elemById("dropdown_for_" + this.id));
					}
				}
			} else if(link.parentNode.className == "dropdown_contents") {
				link.onclick = function() {
					setActiveClass(this, "dropdown_active");
				}
			} else if(link.parentNode.className.indexOf("mobile_menu") > -1 || link.parentNode.className.indexOf("mobile_mount_section") > -1) {
				if(link.className.indexOf("mobile_dropdown") == -1) {
					link.onclick = function() {
						if(this.className.indexOf("active") > -1) {
							if(instance.altParams.close) instance.altParams.close.call(window, instance);
							else closeMobileMenu.bind(instance, instance.mobileElem);
						}
					}
				}
			}
		});

		return this;
	};
	Sidebar.prototype.openMobileMenu = function(mainPath, fullPath) {
		openMobileMenu(this.mobileElem, mainPath, fullPath);
	};
	Sidebar.prototype.closeMobileMenu = function() {
		closeMobileMenu(this.mobileElem);
	};

	//DATA

	var linkSet = [
		{name: "home", type: "link", active: true, text: "Home", path: "/index"},
		{name: "listings", type: "dropdown", text: "Listings", path: "/sect",
			children: [
				{name: "all", ddactive: true, type: "link", text: "All", path: "/sect"},
				{name: "textbook", type: "link", text: "Textbooks", path: "/sect/textbook"},
				{name: "misc", type: "link", text: "Miscellaneous", path: "/sect/misc"}
			]
		},
		{name: "offers", type: "dropdown", text: "Offers", path: "/offers/buying",
			children: [
				{name: "buying", type: "link", text: "Buying", path: "/offers/buying"},
				{name: "selling", type: "link", text: "Selling", path: "/offers/selling"}
			]
		},
		{name: "messages", type: "parentlink", text: "Messages", path: "/messages"},
		{name: "manage", type: "link", text: "My Listings", path: "/products"},
		{name: "unauth", type: "section", enable: true,
			children: [
				{name: "login", type: "link", text: "Login", path: "/login"},
				{name: "register", type: "link", text: "Register", path: "/register"}
			]
		},
		{name: "auth", type: "section", enable: false,
			children: [
				{name: "profile", type: "link", text: "My Profile", path: "/profile/me"},
				{name: "logout", type: "link", text: "Logout", path: "/logout"}
			]
		},
		{name: "info", type: "dropdown", text: "Info", path: "/info",
			children: [
				{name: "about", ddactive: true, type: "link", text: "About Us", path: "/info"},
				{name: "tos", type: "link", text: "Terms of Service", path: "/info/tos"},
				{name: "contact", type: "link", text: "Contact Us", path: "/info/contact"},
				{name: "help", type: "link", text: "Help", path: "/info/help"}
			]
		}
	];

	// {"path": {dropdown: null/dropdown, link: null/link}}
	var linkMap = {};
	var mobileLinkMap = {};

	// CONTROL FUNCTIONS

	var openMobileMenu = function(menu, mainPath, fullPath) {
	    mobileSetPage(mainPath, fullPath);
	    menu.style.height = "auto";
	};

	var closeMobileMenu = function(menu) {
		var openDropdown = eachByClass("mobile_menu_dropdown_open")[0];
		if(openDropdown != undefined) {
			closeMobileDropdown(menu, openDropdown);
		}
		menu.style.height = "0";
	};

	var openMobileDropdown = function (menu, dropdown) {
	    menu.style.height = "0";
	    dropdown.style.width = "100%";
		eachByClass("mobile_menu_dropdown_open", forceCloseMobileDropdown.bind(window));
		setActiveClass(dropdown, "mobile_menu_dropdown_open");
	};

	var forceCloseMobileDropdown = function (dropdown) {
	    dropdown.style.width = "100%";
	};

	var closeMobileDropdown = function (menu, dropdown) {
	    menu.style.height = "auto";
	    dropdown.style.width = "0";
		removeClass("mobile_menu_dropdown_open", dropdown);
	};

	var mount = function(section) {

		var hide = function(section) {
			section.style.display = "none";
		};
		var show = function(section) {
			section.style.display = "block";
		};

		eachByClass("sidebar_mount", hide);
		eachByClass("mobile_mount_section", hide);

		elemById("mount_section_" + section, show);
		elemById("mobile_mount_section_" + section, show);

	};

	var loadLinkSet = function(set, parent) {
		for(var i = 0, l = set.length; i < l; i++) {
			var item = set[i];
			if(item.type == "link") {
				addToLinkMap(item.path, addLink(item, parent), false);
			} else if(item.type == "parentlink") {
				var link = addLink(item, parent);
				addToLinkMap(item.path, link, false);
				addToLinkMap(item.path, link, true);
			} else if(item.type == "section") {
				addSection(item, parent);
			} else if(item.type == "dropdown") {
				addToLinkMap(item.path, addDropdown(item, parent), true);
			}
		}
	};

	var loadMobileLinkSet = function(set, parent, menu) {
		for(var i = 0, l = set.length; i < l; i++) {
			var item = set[i];
			if(item.type == "link") {
				addToMobileLinkMap(item.path, addMobileLink(item, parent, menu), false);
			} else if(item.type == "parentlink") {
				var link = addLink(item, parent, menu);
				addToMobileLinkMap(item.path, link, false);
				addToMobileLinkMap(item.path, link, true);
			} else if(item.type == "section") {
				addMobileSection(item, parent, menu);
			} else if(item.type == "dropdown") {
				addToMobileLinkMap(item.path, addMobileDropdown(item, parent, menu), true);
			}
		}
	};

	var setPage = function(mainPath, fullPath) {
		var set = linkMap[fullPath];
		var link, dropdown;

		if(!set) {
			set = linkMap[mainPath];
			if(set && !set.dropdown) set = null;
		} else {
			link = set.link;
		}

		eachByClass("dropdown_contents", startCollapse);

		if(set) {
			dropdown = set.dropdown;

			if(dropdown) {
				setActiveClass(dropdown, "active");
				var dropdownEl = elemById("dropdown_for_" + dropdown.id);
				if(dropdownEl) startExpand(dropdownEl);

				if(link) setActiveClass(link, "dropdown_active");
				else removeActiveClass("dropdown_active");
			} else {
				setActiveClass(link, "active");
			}
		} else {
			removeActiveClass("active");
		}
	};

	var mobileSetPage = function(mainPath, fullPath) {
		var set = mobileLinkMap[fullPath];
		var link, dropdown;

		if(!set) {
			set = mobileLinkMap[mainPath];
			if(set && !set.dropdown) set = null;
		} else {
			link = set.link;
		}

		if(set) {
			dropdown = set.dropdown;

			if(dropdown) {
				setActiveClass(dropdown, "mobile_active");

				if(link) setActiveClass(link, "mobile_ddactive");
				else removeActiveClass("mobile_ddactive");
			} else {
				setActiveClass(link, "mobile_active");
				removeActiveClass("mobile_ddactive");
			}
		} else {
			removeActiveClass("mobile_active");
		}
	};

	// ANIMATIONS

	var startExpand = function(elem, speed) {

		removeActiveClass("dropdown_active");
		var children = childrenOfClass("dropdown_default", elem);
		if(children.length > 0) {
			setActiveClass(children[0], "dropdown_active");
		}

		var current = elem.offsetHeight;
		elem.style.height = "auto";
		var target = elem.offsetHeight;
		elem.style.height = current + "px";

		if(target == 0) {
			elem.style.height = "auto"; // The element is either hidden, or not visible.
		}
		else {
			expand(elem, target, speed);
		}

	};
	var startCollapse = function(elem, speed) {
		var current = elem.offsetHeight;
		elem.style.height = current + "px";
		expand(elem, 0, speed);
	};
	var expand = function(elem, target, speed) {

		elem.style["overflow-y"] = "hidden";
		if(elem["data-timeout"]) {
			clearTimeout(elem["data-timeout"]);
			delete elem["data-timeout"];
		}

		var currHeight = parseInt(elem.style.height, 10);
		var dir = (currHeight - target > 0)? -1 : 1;
		var diff = Math.abs(currHeight - target);
		var step = (speed != undefined)? speed : 10;

		if(step > diff) {
			elem.style.height = target + "px";
		} else {
			currHeight = currHeight + (step * dir);
			elem.style.height = currHeight + "px";
			elem["data-timeout"] = setTimeout(expand.bind(window, elem, target), 10);
		}

	};

	var startLeftSlide = function(hideElem, showElem) {
		if(hideElem["data-curr"] == undefined) {
			hideElem["data-curr"] = 0;
		}
		showElem["data-curr"] = hideElem["data-curr"] + 100;

		slide(hideElem, -100, false);
		slide(showElem, 0, true);
	};
	var startRightSlide = function(showElem, hideElem) {
		if(showElem["data-curr"] == undefined) {
			showElem["data-curr"] = -100;
		}
		hideElem["data-curr"] = showElem["data-curr"] + 100;

		slide(showElem, 0, false);
		slide(hideElem, 100, true);
	};
	var slide = function(elem, target, doWidth) {

		if(elem["data-timeout-slide"]) {
			clearTimeout(elem["data-timeout-slide"]);
			delete elem["data-timeout-slide"];
		}

		var currSlide = elem["data-curr"];
		var dir = (currSlide - target > 0)? -1 : 1;
		var diff = Math.abs(currSlide - target);
		var step = 4;
		var width;
		var widthSlide;

		if(step > diff) {
			if(doWidth) {
				width = 100 - target;
				elem.style.width = width + "%";
			} else {
				elem.style.transform = "translate3d(" + target + "%, 0, 0)";
			}
		} else {
			currSlide = currSlide + (step * dir);
			if(doWidth) {
				width = 100 - currSlide;
				elem.style.width = width + "%";
			} else {
				elem.style.transform = "translate3d(" + currSlide + "%, 0, 0)";
			}
			elem["data-curr"] = currSlide;
			elem["data-timeout-slide"] = setTimeout(slide.bind(window, elem, target, doWidth), 10);
		}

	};

	// UTILITY FUNCTIONS
	var each = function(elems, callback) {
		for(var i = 0; i < elems.length; i++) {
			if(callback != undefined) callback.call(window, elems[i], i);
		}
		return elems;
	};
	var eachByClass = function(className, callback) {
		return each(document.getElementsByClassName(className), callback);
	};
	var eachByName = function(name, callback) {
		return each(document.getelementsByName(name), callback);
	};
	var eachByTag = function(tagName, callback) {
		return each(document.getElementsByTagName(tagName), callback);
	};
	var elemById = function(id, callback) {
		var elem = document.getElementById(id);
		if(callback != undefined) callback.call(window, elem);
		return elem;
	};
	var childrenOfClass = function(className, elem) {
		var children = elem.childNodes;
		var ret = [];
		for(var i = 0, l = children.length; i < l; i++) {
			var child = children[i];
			if(child.className && child.className.indexOf(className) > -1) ret.push(child);
		}
		return ret;
	};
	var addClass = function(className, elem) {
		elem.className += " " + className;
	};
	var removeClass = function(className, elem) {
		elem.className = elem.className.replace(new RegExp("\\b" + className + "\\b", "g"), "");
	};

	// SIDEBAR SPECIFIC UTILITY FUNCTIONS

	var setActiveClass = function(link, activeClass) {
		removeActiveClass(activeClass);
		link.className += " " + activeClass;
	};
	var removeActiveClass = function(activeClass) {
		eachByClass(activeClass, removeClass.bind(window, activeClass));
	};

	var addToLinkMap = function(path, elem, isDropdown) {
		var entry = linkMap[path];
		if(!entry) {
			entry = {}; linkMap[path] = entry;
		}
		entry[((isDropdown)? "dropdown" : "link")] = elem;
	};
	var addToMobileLinkMap = function(path, elem, isDropdown) {
		var entry = mobileLinkMap[path];
		if(!entry) {
			entry = {}; mobileLinkMap[path] = entry;
		}
		entry[((isDropdown)? "dropdown" : "link")] = elem;
	};

	var addLink = function(linkTemplate, parent) {
		var link = document.createElement("a");
		link.id = "mount_link_" + linkTemplate.name;
		link.href = "#!" + linkTemplate.path;
		link.className = (linkTemplate.active)? "active" : (linkTemplate.ddactive)? "dropdown_default" : "";
		link.appendChild(document.createTextNode(linkTemplate.text));
		parent.appendChild(link);
		return link;
	};
	var addMobileLink = function(linkTemplate, parent, menu) {
		var link = document.createElement("a");
		link.id = "mobile_mount_link_" + linkTemplate.name;
		link.href = "#!" + linkTemplate.path;
		link.className = (linkTemplate.active)? "mobile_active" : (linkTemplate.ddactive)? "dropdown_default" : "";
		link.appendChild(document.createTextNode(linkTemplate.text));
		parent.appendChild(link);
		return link;
	};
	var addSection = function(sectionTemplate, parent) {
		var section = document.createElement("section");
		section.id = "mount_section_" + sectionTemplate.name;
		section.className = "sidebar_mount";
		var children = sectionTemplate.children;
		for(var i = 0, l = children.length; i < l; i++) {
			var child = children[i];
			var isDropdown = (child.type == "dropdown");
			var isParentLink = (child.type == "parentlink");
			var elem = (isDropdown)? addDropdown(child, section) : addLink(child, section);
			addToLinkMap(child.path, elem, isDropdown);
			if(isParentLink) addToLinkMap(child.path, elem, true);
		}
		parent.appendChild(section);
		section.style.display = (sectionTemplate.enable)? "block" : "none";
		return section;
	};
	var addMobileSection = function(sectionTemplate, parent, menu) {
		var section = document.createElement("section");
		section.id = "mobile_mount_section_" + sectionTemplate.name;
		section.className = "mobile_mount_section";
		var children = sectionTemplate.children;
		for(var i = 0, l = children.length; i < l; i++) {
			var child = children[i];
			var isDropdown = (child.type == "dropdown");
			var isParentLink = (child.type == "parentlink");
			var elem = (isDropdown)? addMobileDropdown(child, section, menu) : addMobileLink(child, section, menu);
			addToMobileLinkMap(child.path, elem, isDropdown);
			if(isParentLink) addToMobileLinkMap(child.path, elem, true);
		}
		parent.appendChild(section);
		section.style.display = (sectionTemplate.enable)? "block" : "none";
		return section;
	};
	var addDropdown = function(dropdownTemplate, parent) {
		var dropdown = document.createElement("a");
		dropdown.id = "mount_link_" + dropdownTemplate.name;
		dropdown.className = "dropdown";
		dropdown.href = "#!" + dropdownTemplate.path;
		dropdown.appendChild(document.createTextNode(dropdownTemplate.text));
		parent.appendChild(dropdown);

		var children = dropdownTemplate.children;
		var dropdownElem = document.createElement("div");
		dropdownElem.id = "dropdown_for_mount_link_" + dropdownTemplate.name;
		dropdownElem.className = "dropdown_contents";
		for(var i = 0, l = children.length; i < l; i++) {
			var child = children[i];
			addToLinkMap(child.path, addLink(child, dropdownElem), false);
			addToLinkMap(child.path, dropdown, true);
		}
		parent.appendChild(dropdownElem);
		return dropdown;
	};
	var addMobileDropdown = function(dropdownTemplate, parent, menu) {
		var dropdown = document.createElement("a");
		dropdown.id = "mobile_mount_link_" + dropdownTemplate.name;
		dropdown.className = "mobile_dropdown";
		dropdown.href = "javascript:void(null)";
		dropdown.appendChild(document.createTextNode(dropdownTemplate.text));
		parent.appendChild(dropdown);

		var children = dropdownTemplate.children;
		var dropdownElem = document.createElement("div");
		dropdownElem.id = "dropdown_for_mobile_mount_link_" + dropdownTemplate.name;
		dropdownElem.className = "mobile_menu mobile_menu_dropdown";

		var returnLink = document.createElement("a");
		returnLink.className = "mobile_dropdown_return";
		returnLink.href = "javascript:void(null)";
		returnLink.appendChild(document.createTextNode("Go Back"));
		dropdownElem.appendChild(returnLink);

		for(var i = 0, l = children.length; i < l; i++) {
			var child = children[i];
			addToMobileLinkMap(child.path, addMobileLink(child, dropdownElem), false);
			addToMobileLinkMap(child.path, dropdown, true);
		}
		document.body.appendChild(dropdownElem);

		dropdown.onclick = openMobileDropdown.bind(window, menu, dropdownElem);
		returnLink.onclick = closeMobileDropdown.bind(window, menu, dropdownElem);

		return dropdown;
	};

	window.Sidebar = Sidebar;

	window.linkHelper = {
		loadState: function(state) {
			var state = state.substring("state_".length).toLowerCase();
			mount(state);
		},
		setPage: setPage
	};

})();
