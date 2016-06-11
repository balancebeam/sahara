/*

 */

 (function( $, undefined ) {
	 
 $.widget("ui.timeline",{
	options: {
		
	},
	_create: function(){
		this.element.addClass("breeze-timeline");
		var html = [];
		html.push("<div class='bg'><div class='bg-img'></div></div>");
		this.element.html(html.join(""));
		this._funnelEvents();
	},
	_funnelEvents: function(){
	
	}	
});
})(jQuery);
