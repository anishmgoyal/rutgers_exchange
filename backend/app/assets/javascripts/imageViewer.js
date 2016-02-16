(function( $ ) {
	
	var ImageViewer = function ImageViewer_cons(params) {

		if(this.constructor !== ImageViewer_cons) return new ImageViewer_cons(params);

		var settings = {
			container: $(".image-viewer").first(),
			imageTemplate: $("#image-viewer-image-template").html(),
			tick: {
				delay: 100
			},
			scrollSpeed: 300,
			eagerScroll: 20
		};

		for(var param in params) {
			if(params.hasOwnProperty(param)) {
				this.settings[param] = params[param];
			}
		}

		this.settings = settings;
		this.settings.mainImage = this.settings.container.find(".image-viewer-selected img");
		this.settings.slider = this.settings.container.find(".image-viewer-slider");
		this.settings.controls = this.settings.container.find(".image-viewer-lr-control");

		this.fields = {
			delta: 0,
			updating: false,
			scroll: {
				max: -4,
				offset: -4,
				min: this.settings.slider.width(),
				minPadding: 4
			},
			previousFrame: {
				pageX: 0,
				time: 0,
				velocity: 0
			},
			currentFrame: {
				pageX: 0,
				time: 0
			},
			target: {
				start: 0,
				end: 0,
				isActive: false,
				elapsed: 0
			}
		};

		this.handlers = {};

		this.images = [];

		this.compatibilityCheck();
		this.bindResize();
		this.bindSliderEvents(this.settings.slider);
		this.bindControlEvents(this.settings.controls);

		return this;

	};

	// Main event handlers

	ImageViewer.prototype.bindSliderEvents = function(slider) {

		this.handlers.startHandler = function(e) {
			this.fields.moveActive = true;
			this.fields.delta = 0;
			this.fields.previousFrame.pageX = this.fields.currentFrame.pageX = this.pageX(e);
			this.fields.previousFrame.time = this.fields.currentFrame.time = AnimHelper.currTime();
			this.fields.previousFrame.velocity /= 7;
			if(e.type.indexOf("touch") == -1) {
				if(e.preventDefault) e.preventDefault();
				else return false;
			}
		}.bind(this);

		this.handlers.moveHandler = function(e) {
			if(this.fields.moveActive) {
				this.fields.currentFrame.pageX = this.pageX(e);
				this.fields.currentFrame.time = AnimHelper.currTime();
			}
		}.bind(this);

		this.handlers.wheelHandler = function(e) {
			var ev = e.originalEvent;
			if(ev.deltaX || ev.wheelDeltaX) {
				var delta = ev.deltaX || ev.wheelDeltaX;
				if(Math.abs(delta) > 0.8) delta = (delta < 0 ? -0.8 : 0.8);
				this.fields.previousFrame.velocity = -delta;
			}
		}.bind(this);

		this.handlers.endHandler = function(e) {
			if(this.fields.moveActive) {
				this.fields.moveActive = false;
				if(e.preventDefault) e.preventDefault();
				else return false;
			}
		}.bind(this);

		var $window = $(window);
		this.settings.slider.on('mousedown touchstart', this.handlers.startHandler);
		this.settings.slider.on('wheel', this.handlers.wheelHandler);
		$window.on('mousemove touchmove', this.handlers.moveHandler);
		$window.on('mouseup touchend', this.handlers.endHandler);

	};
	ImageViewer.prototype.bindControlEvents = function(controls) {

		var handler = function(instance) {
			return function(e) {

				var isRight = $(this).hasClass("image-viewer-right-control");
				var currentActive = $(".image-viewer-active");

				var siblingSelector = (isRight)? "next" : "prev";
				var siblingSelectorFN = currentActive[siblingSelector + "All"];
				var siblings = siblingSelectorFN.call(currentActive, ".image-viewer-slider-image");

				if(siblings.length > 0) {
					instance.fields.delta = 0;

					var target = siblings.first();
					target.trigger("click");
				}

				if(e.preventDefault) e.preventDefault();
				else return false;

			}
		}(this);

		controls.on('mousedown touchend', handler);

	};
	ImageViewer.prototype.bindImageEvents = function(img) {

		var handler = function(instance) {
			return function(e) {

				if(Math.abs(instance.fields.delta) < 3 && !instance.fields.updating && !$(this).hasClass("image-viewer-active")) {

					$(".image-viewer-active").removeClass("image-viewer-active");
					$(".image-viewer-lr-control-disabled").removeClass("image-viewer-lr-control-disabled");

					$(this).addClass("image-viewer-active");

					var image = $(this).find("img");
					var mainImage = instance.settings.mainImage;

					//new
					var replacement = document.createElement("img");
					replacement.src = image.attr("src").slice(0, -1);
					instance.fields.updating = true;
					$(replacement).on('load', function(image, replacement, instance) {
						image.fadeOut({duration: 200, complete: function(image, replacement, instance) {
							image.remove();
							$(this).append($(replacement).hide());
							instance.fields.updating = false;
							$(replacement).hide().fadeIn(200);
						}.bind(this, image, replacement, instance)});
					}.bind(mainImage.parent(), mainImage, replacement, instance));

					instance.settings.mainImage = $(replacement);

					var targetLeftOffset = $(this).position().left;
					var targetWidth = $(this).outerWidth();
					var targetInnerWidth = $(this).find("img").outerWidth();
					var paddingDiff = targetWidth - targetInnerWidth;
					var sliderWidth = instance.settings.slider.parent().innerWidth();
					var sliderPosition = instance.fields.scroll.offset;

					if(targetLeftOffset < 0) {
						// Scroll to the left
						instance.fields.target.elapsed = 0;
						instance.fields.target.isActive = true;
						instance.fields.target.start = sliderPosition;
						instance.fields.target.end = sliderPosition + paddingDiff - targetLeftOffset + instance.settings.eagerScroll;
					}
					else if(targetLeftOffset + targetWidth > sliderWidth) {
						// Scroll to the right
						instance.fields.target.elapsed = 0;
						instance.fields.target.isActive = true;
						instance.fields.target.start = sliderPosition;
						instance.fields.target.end = sliderPosition + sliderWidth + paddingDiff * 1.5 - targetLeftOffset - targetWidth - instance.settings.eagerScroll;
					}

					var next = $(this).next('.image-viewer-slider-image');
					var prev = $(this).prev('.image-viewer-slider-image');

					if(next.length == 0) {
						instance.settings.controls.filter(".image-viewer-right-control").addClass("image-viewer-lr-control-disabled");
					}
					if(prev.length == 0) {
						instance.settings.controls.filter(".image-viewer-left-control").addClass("image-viewer-lr-control-disabled");
					}

				}

				instance.fields.delta = 0;

			};
		}(this);

		img.on('click touchend', handler);

	};
	ImageViewer.prototype.bindResize = function() {
		this.resizeHandler = this.resize.bind(this);
		$(window).on('resize', this.resizeHandler);
	};
	ImageViewer.prototype.resize = function() {
		this.fields.scroll.min = this.settings.slider.parent().width() - this.settings.slider.prop("scrollWidth") + this.fields.scroll.minPadding;
		this.moveByDelta(0);
	};

	// Tick handler

	ImageViewer.prototype.tick = function() {
		AnimHelper.schedule(this.update.bind(this), this.settings.tick.delay);
	};

	ImageViewer.prototype.update = function(timerElapsed, timerSteps) {
		var currentFrame, delta, elapsed, normalized, now, previousFrame, target;

		if($.contains(document.body, this.settings.container[0])) {
			if(this.fields.moveActive) {

				currentFrame = this.fields.currentFrame;
				previousFrame = this.fields.previousFrame;

				delta = currentFrame.pageX - previousFrame.pageX;
				elapsed = currentFrame.time - previousFrame.time;

				this.fields.previousFrame.pageX = currentFrame.pageX;
				this.fields.previousFrame.time = currentFrame.time;

				this.fields.target.isActive = false;

				if(Math.abs(delta) > 2) {
					this.fields.delta += delta;
					this.fields.previousFrame.velocity = delta / elapsed;
					this.moveByDelta(delta);
				} else {
					now = AnimHelper.currTime();
					elapsed = now - previousFrame.time;
					this.moveByDelta(previousFrame.velocity * elapsed);

					var deceleration = 1.0 * elapsed / 1000;
					if(deceleration >= Math.abs(previousFrame.velocity)) {
						previousFrame.velocity = 0;
					} else {
					 	deceleration = deceleration * (previousFrame.velocity > 0 ? -1 : 1);
					 	previousFrame.velocity += deceleration;
					}
					this.fields.previousFrame.velocity = previousFrame.velocity;
					this.fields.currentFrame.time = now;
				}

			} else if(this.fields.target.isActive) {

				this.fields.target.elapsed += timerElapsed;
				elapsed = this.fields.target.elapsed;
				normalized = elapsed / this.settings.scrollSpeed;
				if(normalized > 1) {
					normalized = 1;
					this.fields.target.isActive = false;
				}

				position = normalized * this.fields.target.end + (1 - normalized) * this.fields.target.start;
				
				this.setDelta(position);

			} else if(this.fields.previousFrame.velocity != 0) {

				currentFrame = this.fields.currentFrame;
				previousFrame = this.fields.previousFrame;

				now = AnimHelper.currTime();
				elapsed = now - previousFrame.time;
				this.moveByDelta(previousFrame.velocity * elapsed);

				if(this.fields.scroll.offset == this.fields.scroll.min || this.fields.scroll.offset == this.fields.scroll.max) {
					var calculatedBounce = -previousFrame.velocity / 30;
					var bounceConstraint = (previousFrame.velocity > 0 ? -1 : 1) * 0.2;
					previousFrame.velocity = Math.abs(calculatedBounce) < Math.abs(bounceConstraint) ? calculatedBounce : bounceConstraint;
				}

				var deceleration = 1.0 * elapsed / 1000;
				if(deceleration >= Math.abs(previousFrame.velocity)) {
					previousFrame.velocity = 0;
				} else {
				 	deceleration = deceleration * (previousFrame.velocity > 0 ? -1 : 1);
				 	previousFrame.velocity += deceleration;
				}
				this.fields.previousFrame.velocity = previousFrame.velocity;
				this.fields.previousFrame.time = now;

			}
			this.tick();
		} else {
			var handlers = this.handlers;
			var hasProp = handlers.hasOwnProperty.bind(handlers);
			var $window = $(window);

			if(hasProp("moveHandler")) $window.off('mousemove touchmove', handlers.moveHandler);
			if(hasProp("endHandler")) $window.off('mouseup touchend', handlers.endHandler);
		}
	};

	// Functions related to changing the state of the image viewer

	ImageViewer.prototype.addImage = function(id) {
		console.log("Image being added");
		var img = $(this.settings.imageTemplate);
		var imageTag = img.find("img");
		imageTag.attr("src", ImageApi.serverThumbnailURL(id, ImageApi.PRODUCT)).on('load', this.handleImageLoad.bind(this, imageTag));
		this.bindImageEvents(img);

		if(this.images.length == 0) {
			img.trigger("click");
		} else {
			this.settings.controls.filter(".image-viewer-right-control").removeClass("image-viewer-lr-control-disabled");
		}
		this.images.push(id);

		this.settings.slider.append(img);

		this.fields.scroll.min = this.settings.slider.parent().width() - this.settings.slider.prop("scrollWidth");

	};
	ImageViewer.prototype.handleImageLoad = function(img, e) {
		this.resize();
		pageLoader.resizeNow();
	};
	ImageViewer.prototype.loadComplete = function() {
		setTimeout(this.tick.bind(this), 300);
	};
	ImageViewer.prototype.moveByDelta = function(delta) {
		this.fields.scroll.offset += delta;
		this.fields.scroll.offset = Math.min(this.fields.scroll.max, Math.max(this.fields.scroll.min, this.fields.scroll.offset));
		
		if(this.settings.useTransform) {
			this.settings.slider[0].style[this.settings.transformRule] = "translate3d(" + this.fields.scroll.offset + "px, 0, 0)";
		} else {
			this.settings.slider.parent().scrollLeft(this.settings.slider.parent().scrollLeft() - delta);
		}
	};
	ImageViewer.prototype.setDelta = function(delta) {
		this.fields.scroll.offset = delta;
		this.moveByDelta(0);
		if(!this.settings.useTransform) {
			this.settings.slider.parent().scrollLeft(-delta);
		}
	};

	// Compatibility functions

	ImageViewer.prototype.compatibilityCheck = function() {
		var rules = ["WebkitTransform", "MozTransform", "OTransform", "msTransform"];
		var testDiv = document.createElement("div");
		for(var i = 0; i < rules.length; i++) {
			if(testDiv && typeof testDiv.style[rules[i]] !== "undefined") {
				this.settings.transformRule = rules[i];
				this.settings.useTransform = true;
				return;
			}
		}
		this.settings.useTransform = false;
	};
	ImageViewer.prototype.pageX = function(ev) {
		if(ev.type.indexOf("touch") > -1) {
			return ev.originalEvent.targetTouches ? ev.originalEvent.targetTouches[0].pageX : ev.originalEvent.touches ? ev.originalEvent.touches[0].pageX : ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0].pageX : ev.pageX;
		}
		else {
			return ev.pageX;
		}
	};

	window.ImageViewer = ImageViewer;

})( jQuery );
