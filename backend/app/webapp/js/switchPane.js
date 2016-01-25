(function( $ ) {

		var SwitchPane = function(elem) {
		if(this === window) return new SwitchPane(elem);

		this.elem = $(elem);

		this.switch_pane = $('<div class="switch_pane" />');
		this.elem.append(this.switch_pane);

		this.tab_pane = this.elem.find(".tab_pane");
		this.tabs = this.tab_pane.find("a");

		var switchPaneObj = this;
		this.tabs.each(function() {
			var instance = $(this);
			var tabId = this.id.substring(SwitchPane.linkPrefix.length);
			var template = switchPaneObj.elem.find(SwitchPane.templatePrefix + tabId);
			var clickFN = (function(switcher, template, link) {
				return function() {
					switcher.swapTo(template);
					switcher.elem.find(".active").removeClass("active");
					link.addClass("active");
				}
			})(switchPaneObj, template, instance);
			instance.click(clickFN);
		});

		var currentActive = this.elem.find(".active");
		var currentActiveId = currentActive.attr("id").substring(SwitchPane.linkPrefix.length);
		var template = this.elem.find(SwitchPane.templatePrefix + currentActiveId);
		this.swapTo(template);
	};
	SwitchPane.prototype.swapTo = function(template) {
		this.switch_pane.html(template.html());
	};
	SwitchPane.linkPrefix = "tab_";
	SwitchPane.templatePrefix = "#switch_pane_";

	window.SwitchPane = SwitchPane;

})( jQuery );