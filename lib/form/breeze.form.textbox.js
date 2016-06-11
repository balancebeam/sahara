/*

 */

 (function( $, undefined ) {
	 
 $.widget("ui.textbox",{
	options: {
		required: true,
		arrow: true
	},
	_create: function(){
		this.element.addClass("breeze-textbox");
		var html = ["<div class='wrapper'>"];
		html.push("<input type='text' class='textbox'>");
		html.push("</div>");
		if(this.options.arrow){
			this.element.addClass("arrow");
			html.push("<div class='arrow'></div>");
		}
		if(this.options.required){
			this.element.addClass("required");			
		}	
		html.push("<div class='required'>*</div>");
		this.element.html(html.join(""));
		this._funnelEvents();
	},
	//ÉèÖÃ±ØÌîÊôÐÔ
	setRequired: function(required){
		this.options.required=required? this.element.addClass("required") : this.element.removeClass("required");
	},
	_funnelEvents: function(){
		var self = this,
			element = this.element;
		$(">.wrapper>.textbox",element).focus(function(e){
			element.addClass("focus");
		})
		.blur(function(e){
			element.removeClass("focus");
		});
	}	
});
})(jQuery);
