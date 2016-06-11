/*
 * Balancebeam Widget Grid_Plugin_Selectable 1.0
 *
 * Description : Support for multiple-choice
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 * 		balancebeam/lib/widget/grid/beam.grid.js
 */

(function($, undefined ) {
 
$.ui.grid.selectable = function(grid,params){
	 this.grid = grid;
	 this._create(params);
};
//selectable原型定义
$.ui.grid.selectable.prototype = {
	//bind event
	_create : function(params){
		var self = this,
			grid = this.grid,
			id = grid.element.attr("id");
		switch(params.checklogic){
			case "multiple" :	
				grid.subscribe("multiplenormalselect.grid-selectable",this,"multiplenormalselect");
				grid.subscribe("multiplelockedselect.grid-selectable",this,"multiplelockedselect");
				grid.subscribe("selectAll.grid-selectable",this,"selectAll");
				var column =this.column= {
					width : 28,
					resizable:false,
					sortable: false,
					dropmenu:false,
					draggable:false,
					noswap:true,
					format : function(inRowIndex){
						var html = [],
							checked = !!grid.runtime.dataProvider[inRowIndex]["s"] && "checked" || "";
						html.push("<input type='checkbox' class='checklogic' ");
						html.push(checked);
						html.push(" rowIndex=");
						html.push(inRowIndex);
						html.push(" bbEvents='click:multiplenormalselect'");
						html.push(">");
						return html.join("");
					},
					lockedRowFormat : function(inRowIndex){
						var html = [],
							checked = !!grid.runtime.lockedRowDataProvider[inRowIndex]["s"] && "checked" || "";
						html.push("<input type='checkbox' class='checklogic' ");
						html.push(checked);
						html.push(" rowIndex=");
						html.push(inRowIndex);
						html.push(" bbEvents='click:multiplelockedselect'");
						html.push(">");
						return html.join("");
					},
					formatHeader:function(){
						var html = [],
							checked = column.checkedAll ?  "checked" : "";
						html.push("<input type='checkbox' class='checklogic' ");
						html.push(checked);
						html.push(" bbEvents='click:selectAll'");
						html.push(">");
						return html.join("");
					}
				};
				grid.runtime.playout.push(column);
				break;
			case "single" :
				grid.subscribe("singlenormalselect.grid-selectable",this,"singlenormalselect");
				grid.subscribe("singlelockedselect.grid-selectable",this,"singlelockedselect");
				this.originalNormalSelected = 0;
				this.originalLockedSelected = 0;
				var id= this.grid.id, 
					column =this.column= {
					width : 28,
					resizable:false,
					sortable: false,
					dropmenu:false,
					draggable:false,
					noswap:true,
					format : function(inRowIndex){
						var html = [],
							checked = !!grid.runtime.dataProvider[inRowIndex]["s"] && "checked" || "";
						html.push("<input type='radio' class='checklogic' name='");
						html.push( id);
						html.push("_normalradio' ");
						html.push(checked);
						html.push(" rowIndex=");
						html.push(inRowIndex);
						html.push(" bbEvents='click:singlenormalselect'");
						html.push(">");
						return html.join("");
					},
					lockedRowFormat : function(inRowIndex){
						var html = [],
							checked = !!grid.runtime.lockedRowDataProvider[inRowIndex]["s"] && "checked" || "";
						html.push("<input type='radio' class='checklogic' lockedView=true name='");
						html.push( id);
						html.push("_lockedradio' ");
						html.push(checked);
						html.push(" rowIndex=");
						html.push(inRowIndex);
						html.push(" bbEvents='click:singlelockedselect'");
						html.push(">");
						return html.join("");
					}
				};					
				grid.runtime.playout.push(column);					
				break;
		}
	},	
	//选中某一个记录
	multiplenormalselect : function(e){
		var target = $(e.target),
			rowIndex = Number(target.attr("rowIndex"));		
		this.grid.runtime.dataProvider[rowIndex]["s"]  = target[0].checked;		
	},
	multiplelockedselect : function(e){
		var target = $(e.target),
			rowIndex = Number(target.attr("rowIndex"));
		this.grid.runtime.lockedRowDataProvider[rowIndex]["s"]  = target[0].checked;	
	},
	//选中所有记录
	selectAll : function(e){
		var target = $(e.target),
			checked = target[0].checked,
			dataProvider = this.grid.runtime.dataProvider;
		this.column.checkedAll = checked;
		for(var i=0,d;d = dataProvider[i];i++){
			d["s"] = checked;
		}
		dataProvider = this.grid.runtime.lockedRowDataProvider;
		for(var i=0,d;d = dataProvider[i];i++){
			d["s"] = checked;
		}
		this.grid.resize();
	},
	//获取所有选中记录
	getSelected : function(){
		var dataProvider = this.grid.runtime.dataProvider,
			selected = [];
		for(var i=0,d;d = dataProvider[i];i++){
			if(d["s"]){
				selected.push(d["d"]);
			}
		}
		return selected;
	},
	singlenormalselect : function(e){
		var target = $(e.target),
			rowIndex = Number(target.attr("rowIndex")),
			dataProvider = this.grid.runtime.dataProvider;
		dataProvider[this.originalNormalSelected]["s"] = false;
		dataProvider[rowIndex]["s"]  = true;
		this.originalNormalSelected = rowIndex;		
	},
	singlelockedselect : function(e){
		var target = $(e.target),
			rowIndex = Number(target.attr("rowIndex")),
			dataProvider = this.grid.runtime.lockedRowDataProvider;
		dataProvider[this.originalLockedSelected]["s"] = false;
		dataProvider[rowIndex]["s"]  = true;
		this.originalLockedSelected = rowIndex;		
	},
	destroy : function(){
		this.grid.unsubscribe("select.grid-selectable");
		this.grid.unsubscribe("selectAll.grid-selectable");
	}
 };
//注入plugin
$.ui.grid.plugins.register("selectable",$.ui.grid.selectable);

})(jQuery);
