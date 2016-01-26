/**
 * Created by Anish M Goyal (founder)
 *
 * This is a loading icon for the first release of the ruxchange webapp. It fades a
 * string of text in and out while it is visible.
 */
(function( $ ) {
	
	var loadingIcon = function loadingIcon_cons(params) {
		if(this.constructor !== loadingIcon_cons) {
			return new loadingIcon_cons(params);
		}
		
		// Initialize all animation related fields
		this.isVisible = false;
		this.direction = 1;
		this.op = 0;
		this.speed = 0.04;
		this.intervalTime = 20;
		
		// Font sizing
		this.fontSize = 2;
		this.letterSpacing = 4;
		
		// Calculate offsets for loading icon. Adjust by any offsets.
		this.wnd = params.params.wnd;
		this.offsets = params.params.offsets;
		
		// Create the overlay container
		this.container = $('<div />')
			.css("display", "none")
			// Position it
			.css("position", "fixed")
			.css("top", 0)
			.css("left", 0)
			// Properties of the overlay itself
			.css("background-color", "rgba(0, 0, 0, 0.8)")
			.css("z-index", 950);
			
		// Make and attach a text element.
		this.textElem = $('<div class="centered load">' + params.content + '</div>')
			.css("color", "white")
			.css("display", "none")
			.css("font-weight", "bold")
			.css("font-size", this.fontSize + "em")
			.css("letter-spacing", this.letterSpacing + "px")
			.css("position", "fixed")
			.css("white-space", "nowrap");
		
		// Add all of this to the body
		this.container.append(this.textElem);
		$(document.body).append(this.container);
		
		return this;
	};
	loadingIcon.prototype.show = function() {
		$(document.body).append(this.container);
		if(!this.isVisible) {
			var instance = this;
			var intFn = (function(instance) {
				return function() {instance.tick.call(instance);};
			})(instance);
			var resizeFn = (function(resize) {
				return function() {instance.resize.call(instance);};
			})(instance);
			this.interval = setInterval(intFn, this.intervalTime);
			this.isVisible = true;
			this.container.css("display", "block");
			this.textElem.css("display", "block");
			this.resizer = resizeFn;
			this.textElem.css("opacity", this.op);
			this.resizer();
			$(window).bind("resize", this.resizer);
		}
	};
	loadingIcon.prototype.hide = function() {
		if(this.isVisible) {
			this.direction = 1;
			this.op = 0;
			clearInterval(this.interval);
			$(window).unbind("resize", this.resizer);
			delete this.resizer;
			this.container.css("display", "none");
			this.textElem.css("display", "none");
			this.isVisible = false;
		}
	};
	loadingIcon.prototype.tick = function() {
		if(this.direction == 1) {
			this.op += this.speed;
			if(this.op >= 1) {
				this.op = 1;
				this.direction = 0;
			}
		} else {
			this.op -= this.speed;
			if(this.op <= 0) {
				this.op = 0;
				this.direction = 1;
			}
		}
		this.textElem.css("opacity", this.op);
	};
	loadingIcon.prototype.resize = function() {
		if(this.isVisible) {
			// Calculate the top left corner's position
			var posX = 0;
			var posY = 0;
			var extraPosX = 0;
			var extraPosY = 0;
			if(typeof this.wnd !== "undefined") {
				posX = this.wnd.position().left;
				posY = this.wnd.position().top;
			}
			if(typeof this.offsets !== "undefined") {
				if(typeof this.offsets.left !== "undefined") {
					extraPosX = this.offsets.left.outerHeight();
					posX += this.offsets.left.outerWidth();
				}
				if(typeof this.offsets.top !== "undefined") {
					extraPosY = this.offsets.top.outerHeight();
					posY += this.offsets.top.outerHeight();
				}
			}
			
			// Precalculate reused values
			var wndWidth = (typeof this.wnd === "undefined")? $(window).width() : this.wnd.outerWidth();
			var wndHeight = (typeof this.wnd === "undefined")? $(window).height() : this.wnd.outerHeight();
			
			// Adjust the height in case the selected window is really large
			var wndHeightLim = $(window).height();
			if(wndHeightLim < wndHeight) wndHeight = wndHeightLim;
			
			var overlayWidth = wndWidth - extraPosX;
			var overlayHeight = wndHeight - extraPosY;
	
			// Apply changes to container
			this.container
				.css("left", posX)
				.css("top", posY)
				.css("width", overlayWidth)
				.css("height", overlayHeight);
			
			// Fix the font size of text elem
			this.textElem.css("font-size", fontSize + "em");
			var fontSize = this.fontSize;
			
			// Precalculate text sizing
			var textWidth = this.textElem.outerWidth();
			var textHeight = this.textElem.outerHeight();
			
			while(textWidth > wndWidth - 50) {
				fontSize -= 0.1;
				this.textElem.css("font-size", fontSize + "em");
				textWidth = this.textElem.outerWidth();
			}
			
			// Apply changes to text elem
			this.textElem
				.css("left", posX + (overlayWidth - textWidth) / 2)
				.css("top", posY + (overlayHeight - textHeight) / 2)
		}
	};

	$.fn.LoadingIcon = function(params) {
		if(typeof params === "undefined") params = {};
		this.css("display", "none");
		var lIcon = new loadingIcon({
			content: this.html(),
			params: params
		});
		return lIcon;
	};

})( jQuery );

jQuery(document).ready(function() {
	
	if (typeof pageLoader === "undefined") pageLoader = {
		setLoadingIcon: function(li) {},
		getWnd: function() {return undefined;}
	}
	
	var loadingIcon = $('#loadingIcon').LoadingIcon({
		wnd: pageLoader.getWnd(),
		offsets: {
			top: $("#nav")
		}
	});
	pageLoader.setLoadingIcon(loadingIcon);
	
});