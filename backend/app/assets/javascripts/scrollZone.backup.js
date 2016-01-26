(function( $ ) {
	
	var ScrollZone = function ScrollZone_cons(params) {
		if(this.constructor !== ScrollZone_cons) return new ScrollZone_cons(params);

		// Define the defaults
		var settings = {
			elem: $("<div />"), // Safe escape for bad reference
			scrollZoneInnerClassName: 'scrollZone-inner-pane',
			scrollbarTrackClassName: 'scrollZone-scrollbar-track',
			scrollbarClassName: 'scrollZone-scrollbar',
			scrollbarWidth: 5,
			scrollbarVertPadding: 0,
			scrollbarMarginTop: 0,
			borderRadius: 0,
			fg: '#444',
			bg: 'rgba(0, 0, 0, 0.3)',
			autoResize: true,
			layout: "vertical"
		};

		var fields = {
			handlers: {}
		};

		// Run user overrides
		for(var param in params) {
			if (params.hasOwnProperty(param)) settings[param] = params[param];
		}

		if(settings.layout == "horizontal") {
			settings.scrollZoneInnerClassName += "-horiz";
			settings.scrollbarTrackClassName += "-horiz";
			settings.scrollbarClassName += "-horiz";
			settings.fixedDimension = "height";
			settings.variableDimension = "width";
		} else {
			settings.fixedDimension = "width";
			settings.variableDimension = "height";
		}

		this.fields = fields;
		this.settings = settings;

		this.settings.elem.css("overflow", "hidden");

		this.elemContent = $('<div />')
			.css("box-sizing", "border-box")
			.css("padding-left", this.settings.elem.css("padding-left"))
			.css("padding-right", this.settings.elem.css("padding-right"))
			.css("padding-top", this.settings.elem.css("padding-top"))
			.css("padding-bottom", this.settings.elem.css("padding-bottom"))
			.html(this.settings.elem.html());

		this.settings.elem.css("padding", 0);

		this.elemInner = $('<div class="' + this.settings.scrollZoneInnerClassName +'" />')
			.html(this.elemContent);
		this.settings.elem.html("").append(this.elemInner);

		this.measureScrollbarHeight();
		this.addScrollBarToElem();
		this.bindScrollEvents();
		this.bindResizeEvents();
		this.bindScrollDragEvents();
		this.scrollEvent();

		return this;
	}
	ScrollZone.prototype.measureScrollbarHeight = function() {
		var initialCSSHeight = this.elemInner.css("height");
		this.elemHeight = this.elemInner.height();
		this.elemOuterHeight = this.elemInner.outerHeight();

		this.fullHeight = this.elemInner.prop("scrollHeight");
		if(typeof this.fullHeight === "undefined") {
			this.elemInner.css("height", "auto");
			this.fullHeight = this.elemInner.height();
			this.elemInner.css("height", "100%");
		}

		this.fields.scrollbarNormalizedHeight = this.elemHeight / this.fullHeight;
		this.scrollbarHeight = Math.max(4, this.elemHeight * this.fields.scrollbarNormalizedHeight);

		this.trackEffectiveHeight = this.elemOuterHeight - this.scrollbarHeight - this.settings.scrollbarVertPadding * 2;
	};
	ScrollZone.prototype.addScrollBarToElem = function() {
		if(this.settings.elem.css("position") == "static") this.settings.elem.css("position", "relative");
		this.scrollbarTrack = $('<div class="' + this.settings.scrollbarTrackClassName +'" />')
			.css("background-color", this.settings.bg)
			.css("border-radius", this.settings.borderRadius + "px")
			.css("top", this.settings.scrollbarMarginTop + "px")
			.css("width", this.settings.scrollbarWidth + "px");

		this.settings.elem.append(this.scrollbarTrack);
		this.scrollbar = $('<div class="' + this.settings.scrollbarClassName + '" />')
			.css("background-color", this.settings.fg)
			.css("border-radius", this.settings.borderRadius + "px")
			.css("width", this.settings.scrollbarWidth + "px")
			.css("height", this.scrollbarHeight + "px")
			.css("top", this.settings.scrollbarVertPadding);
		this.scrollbarTrack.append(this.scrollbar);
	};
	ScrollZone.prototype.bindScrollEvents = function() {
		this.disableScrollEvents = false;
		this.fields.handlers.onscroll = this.scrollEvent.bind(this);
		this.elemInner.scroll(this.fields.handlers.onscroll);
	};
	ScrollZone.prototype.bindResizeEvents = function() {
		this.disableResizeEvents = false;
		this.fields.handlers.onresize = this.resizeEvent.bind(this);
		if(this.settings.autoResize) {
			$(window).on('resize', this.fields.handlers.onresize);
		}
	};
	ScrollZone.prototype.bindScrollDragEvents = function() {
		this.disableScrollDragEvents = false;
		this.scrollbar.mousedown((function(scrollZone, e) {
			var scrollbar = this;
			scrollZone.fields.scrollBarOffset = e.pageY - scrollbar.offset().top;
			scrollZone.disableScrollEvents = true;

			$(document.body).on('mousemove', scrollZone.scrollDragEvent.bind(scrollZone));

			$(document.body).one("mouseup", (function(scrollZone, e) {
				$(this).off('mousemove');
				scrollZone.disableScrollEvents = false;
			}).bind(document.body, scrollZone));
			e.preventDefault();
		}).bind(this.scrollbar, this));

	};
	ScrollZone.prototype.scrollEvent = function(e) {
		if(!this.disableScrollEvents) {
			this.fields.percentScrolled = this.elemInner.scrollTop() / (this.fullHeight - this.elemHeight);
			var top = this.trackEffectiveHeight * this.fields.percentScrolled + this.settings.scrollbarVertPadding;
			this.scrollbar.css("top", top + "px");
		}
	};
	ScrollZone.prototype.resizeEvent = function(e) {
		if(!this.disableResizeEvents) {
			if(this.settings.autoResize && !$.contains(document.body, this.settings.elem[0])) {
				this.disableResizeEvents = true;
				if(typeof this.fields.handlers.onresize !== "undefined") {
					$(window).off('resize', this.fields.handlers.onresize);
					delete this.fields.handlers.onresize;
				}
			}
			this.recalculateSizes();
			if(this.fields.scrollbarNormalizedHeight >= 1) {
				this.scrollbarTrack.css("display", "none");
			} else {
				this.scrollbarTrack.css("display", "inline-block");
			}
		}
	};
	ScrollZone.prototype.scrollDragEvent = function(e) {
		if(!this.disableScrollDragEvents) {
			var offset = this.fields.scrollBarOffset;

			var minimumTop = this.settings.scrollbarVertPadding;
			var maximumTop = this.elemHeight - this.settings.scrollbarVertPadding - this.scrollbarHeight;

			var target = e.pageY - this.settings.elem.offset().top - offset;
			var location = Math.min(maximumTop, Math.max(minimumTop, target));
			this.scrollbar.css("top", location + "px");

			this.fields.percentScrolled = (location - this.settings.scrollbarVertPadding) / this.trackEffectiveHeight;
			this.elemInner.scrollTop((this.fullHeight - this.elemHeight) * this.fields.percentScrolled);
		}
	};
	ScrollZone.prototype.recalculateSizes = function() {
		this.measureScrollbarHeight();
		this.scrollbar.css("height", this.scrollbarHeight + "px");
		this.setScrollPosition({percentage: this.fields.percentScrolled})
		this.scrollEvent();
	};

	// For internal as well as external use
	ScrollZone.prototype.setScrollPosition = function(params) {
		if(params.percentage) {
			this.fields.percentScrolled = params.percentage;
		} else if(params.position) {
			this.fields.percentScrolled = Math.min(1, Math.max(0, params.position / this.fullHeight));
		}
		this.elemInner.scrollTop((this.fullHeight - this.elemHeight) * this.fields.percentScrolled);
		var scrollbarTop = this.trackEffectiveHeight * this.fields.percentScrolled + this.settings.scrollbarVertPadding;
		this.scrollbar.css("top", scrollbarTop + "px");
	};
	ScrollZone.prototype.applyCSS = function(css) {
		for (var param in css) {
			if (css.hasOwnProperty(param)) {
				this.elemInner.css(param, css[param]);
			}
		}
	}
	ScrollZone.prototype.trigger = function(trigger, e) {
		var handler = this.fields.handlers[trigger];
		if(typeof handler === "undefined") {
			handler = this.fields.handlers["on" + trigger];
		}
		if(typeof handler !== "undefined") {
			handler.call(this, e);
		}
	};

	window.ScrollZone = ScrollZone;

})( jQuery );