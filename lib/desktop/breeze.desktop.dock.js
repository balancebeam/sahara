/*
 * Balancebeam widget Desktop Screen 1.0
 *
 * Description : Support Desktop Screen
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 * 		balancebeam/lib/widget/desktop/beam.desktop.js
 */

(function( $, undefined ) {
 
 $.ui.desktop.dock = function(desktop,params){
	 this.desktop = desktop;
	 this.params = params;
	 this._create();
 };
$.ui.desktop.dock.prototype = {	
	_create : function(){		
	},
	startup : function(){		
		var desktop = this.desktop,
			dock = $("<div></div>");
		dock.dock({
			dataProvider : this.params.dataProvider,
			onClick : function(data){
				desktop.openDialog(data);
			}
		});
		dock.appendTo($(">.desktop-body",this.desktop.element));
	}	
 };
//注入plugin
$.ui.desktop.plugins.register("dock",$.ui.desktop.dock);
 
})(jQuery);
