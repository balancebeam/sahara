/*
 * Balancebeam Widget Grid_Plugin_Toolbar 1.0
 *
 * Description : Support merge columns
 * Copyright 2012
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 * 		balancebeam/lib/widget/grid/beam.grid.js
 */

(function( $, undefined ) {
 
$.ui.grid.mergecol = function(grid,params){
	 this.grid = grid;
	 this._create(params);
};
//draggable原型定义
$.ui.grid.mergecol.prototype = {
	//bind event
	_create : function(params){
		this.params = params || {};
		this.grid.subscribe("renderContent.grid-mergecol",this,"mergeCol");
	},	
	mergeCol : function(viewport){
		//动态计算合并单元格的rowspan
		var beginIndex = viewport.beginRowIndex,
			cols=this.params.cols,
			cascade = false!=this.params.cascade,
			dataProvider = this.grid.runtime.dataProvider,
			visibleRows = viewport.visibleRows,
			mergeColsMap = {},
			value,
			preValue,					
			num=0;
		for(var i=0,col;null!=(col=cols[i]);i++){
			var mp = mergeColsMap[col] = [];
			preValue=null;
			for(var k=0,row;k<visibleRows;k++){
				row = dataProvider[beginIndex + k]["d"];						
				value=String(row[col]); //确保值不能为空
				if(null==preValue){
					num=1;
					preValue = value;
				}
				else{
					if(value!=preValue || 
						(cascade && 0!=i && null!=mergeColsMap[i-1][k])){
						mp[k-num] = num;		
						preValue = value;
						num=1;
					}
					else{
						num++;
					}
				}						
				//最后一行
				if(k==visibleRows-1){
					mp[visibleRows-num] = num;			
				}
			}					
		}
		this.grid.runtime.mergeColsMap = mergeColsMap;
	},	
	destroy : function(){
		this.grid.unsubscribe("renderContent.grid-mergecol");
	}
 };
//注入plugin
$.ui.grid.plugins.register("mergecol",$.ui.grid.mergecol);

})(jQuery);
