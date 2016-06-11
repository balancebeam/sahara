/*
 * Balancebeam Widget Grid_Plugin_Sortable 1.0
 *
 * Description : Support column sorting
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 * 		balancebeam/lib/widget/grid/beam.grid.js
 */

(function( $, undefined ) {
 
$.ui.grid.sortable = function(grid){
	 this.grid = grid;
	 this._create();
 };
$.ui.grid.sortable.prototype = {
	//bind event
	_create : function(){
		var self = this,
			grid = this.grid,
			headersNode = grid.headersNode;
		this.sortNode = $("<div class='sortable asc'></div>");
		this.sortingColumn= null;
		headersNode.bind("click.grid-sortable",function(e){
			var target = $(e.target);
			if(null==target.attr("idx")){
				return;
			}
			var columnMarkup = grid.getColumnMarkup(target);
			self.sort(columnMarkup);	
		});
		//订阅表头刷新的方法
		grid.subscribe("renderHeader.grid-sortable",this,"renderSortIcon");
		grid.subscribe("sort.grid-sortable",this,"sort");
	},
	/**
	 * 为指定列排序
	 * @param culumnMarkup 列描述信息
	 * @param asc 升序/降序/Null
	 */
	sort : function(columnMarkup,asc){
		var column = columnMarkup.column,
			element = columnMarkup.element,
			sortNode = this.sortNode;
		if(false==column.sortable){
			return;
		}
		if(column == this.sortingColumn){
			if(sortNode.hasClass("asc")){
				sortNode.removeClass("asc");
				sortNode.addClass("desc");
			}
			else{
				sortNode.removeClass("desc");
				sortNode.addClass("asc");
			}
		}
		else{
			sortNode.parent().removeClass("sort");
			element.addClass("sort");
			element.append(sortNode);
			if(sortNode.hasClass("desc")){
				sortNode.removeClass("desc");
				sortNode.addClass("asc");
			}
			this.sortingColumn = column;
		}
		if(null!=asc){
			if(asc){
				if(sortNode.hasClass("desc")){
					sortNode.removeClass("desc");
					sortNode.addClass("asc");
				}
			}
			else{
				sortNode.removeClass("asc");
				sortNode.addClass("desc");
			}
		}
		this.sortData(column,sortNode.hasClass("asc"));
	},
	//数据排序操作
	sortData : function(column,asc){
		var dp = this.grid.runtime["dataProvider"],
			filedIndex = column.filedIndex;
		dp.sort(function(o1,o2){
			if("number"==column.dataType){
				return (asc?1:-1) * (Number(o1["d"][filedIndex] || 0) - Number(o2["d"][filedIndex] || 0));
			}
			return (asc?1:-1) * String(o1["d"][filedIndex]).localeCompare(String(o2["d"][filedIndex]));
		});
		this.grid.resize();
	},
	//渲染排序列的图标
	renderSortIcon : function(view){
		var sortingColumn = this.sortingColumn;
		if(null == sortingColumn){
			return;
		}
		for(var i=0,column;column = view.columns[i];i++){
			if(column == sortingColumn){
				var target = $("div[idx="+i+"]",view.headerNode);
				target.addClass("sort");
				target.append(this.sortNode);
				return;
			}
		}
	},
	//销毁排序插件
	destroy : function(){
		var grid=this.grid;
			headersNode = grid.headersNode;
		headersNode.unbind("click.grid-sortable");
		grid.unsubscribe("renderHeader.grid-sortable");
		grid.unsubscribe("sort.grid-sortable");
		this.sortNode.remove();
	}
 };
//注入plugin
$.ui.grid.plugins.register("sortable",$.ui.grid.sortable);

})(jQuery);
