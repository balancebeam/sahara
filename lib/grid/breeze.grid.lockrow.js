/*
 * Balancebeam Widget Grid_Plugin_Lockrow 1.0
 *
 * Description : Support lock row as misc excel
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 * 		balancebeam/lib/widget/grid/beam.grid.js
 */


(function( $, undefined ) {
 
$.ui.grid.lockrow = function(grid,params){
	 this.grid = grid;
	 this._create(params);
};
$.ui.grid.lockrow.prototype = {
	_create : function(params){
		var runtime = this.grid.runtime;
		var ldp = runtime["lockedRowDataProvider"] = [];
		for(var i=0,lockedRowDataProvider=params.dataProvider || [],d;d =lockedRowDataProvider[i];i++){
			ldp.push({d : d});
		}
		runtime.lockedRowPosition = params.position || "bottom";
	},
	destroy : function(){
		var runtime = this.grid.runtime;
		runtime.lockedRowDataProvider = [];
	}
 };
//注入plugin
$.ui.grid.plugins.register("lockrow",$.ui.grid.lockrow);

})(jQuery);
