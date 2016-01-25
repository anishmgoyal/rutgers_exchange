(function( $ ) {
	
	var AnimHelper = {
		schedule: function(callback, delay) {
			var callbackHelper = function(callback, delay, start, now) {
				var elapsed = now - start;
				var stepsCompleted = elapsed / delay;
				callback(elapsed, stepsCompleted);
			};

			var timeoutHelper = function(callbackHelper, callback, delay, start) {
				var now = new Date().getTime();
				callbackHelper.call(this, callback, delay, start, now);
			};

			var now = AnimHelper.currTime();
			
			if ("requestAnimationFrame" in window) {
				var animFrame = window.requestAnimationFrame(callbackHelper.bind(this, callback, delay, now));
				return animFrame;
			} else {
				var timeout = window.setTimeout(timeoutHelper.bind(this, callbackHelper, callback, delay, now), delay);
				return timeout;
			}
		},
		clear: function(id) {

			if ("requestAnimationFrame" in window) {
				window.cancelAnimationFrame(id);
			} else {
				window.clearTimeout(id);
			}

		},
		currTime: function() {
			if(typeof performance !== "undefined" && "now" in performance) {
				return performance.now();
			} else {
				return new Date().getTime();
			}
		}
	};

	window.AnimHelper = AnimHelper;

})( jQuery );