/*
 * Balancebeam Widget Grid_Plugin_Rownumber 1.0
 *
 * Description : Support Row Number
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 * 		balancebeam/lib/widget/grid/beam.grid.js
 */

(function($, undefined ) {
 
$.ui.grid.rownumber = function(grid,params){
	 this.grid = grid;
	 this._create(params);
};
//rownumber原型定义
$.ui.grid.rownumber.prototype = {

	_create : function(params){
		var self = this,
			grid = this.grid,
			width = Math.max(2,String(grid.runtime.dataProvider.length).length)*7 + 11;
			
		var column = {
			width : width,
			resizable:false,
			sortable: false,
			dropmenu:false,
			draggable:false,
			hclassName : "rownumber",
			className : "rownumber",
			noswap:true,
			format : function(inRowIndex){
				return inRowIndex+1;
			},
			lockedRowFormat : function(inRowIndex){
				return inRowIndex+1;
			},
			formatHeader:function(){
				return "No.";
			}
		};
		grid.runtime.playout.unshift(column);
	},	
	
	destroy : function(){
	
	}
 };
//注入plugin
$.ui.grid.plugins.register("rownumber",$.ui.grid.rownumber);

})(jQuery);
