/*
 * Balancebeam Widget Grid_Plugin_Treeview 1.0
 *
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 * 		balancebeam/lib/widget/grid/beam.grid.js
 */

(function( $, undefined ) {
 
$.ui.grid.treeview = function(grid,params){
	 this.grid = grid;
	 this._create(params || {});
};

$.ui.grid.treeview.prototype = {
	_create : function(params){
		var grid = this.grid,
			filedIndex = params.filedIndex || "id";
		grid.subscribe("expandTreeNode.grid-treeview",this,"expand");
		var column =this.column= {
				width : 100,
				resizable:true,
				sortable: false,
				dropmenu:false,
				draggable:false,
				noswap:true,
				title : params.title || "",
				format : function(inRowIndex){
					var data = grid.runtime.dataProvider[inRowIndex];
					var html = [];						
					html.push("<div class='treeview' ");
					html.push("style='margin-left:");
					html.push((data.layer || 0)*12);
					html.push("px'>");
					if(data.d.children){
						html.push("<div class='arrow ");
						html.push(data.opened && "opened");
						html.push("' rowIndex=");
						html.push(inRowIndex);
						html.push(" bbEvents='click:expandTreeNode'></div>");						
					}
					html.push(data.d[filedIndex] || "&nbsp;");
					html.push("</div>");
					return html.join("");
				}
		};
		if(grid.options.layout.length>1){
			grid.runtime.playout.push(column);
		}
		else{
			grid.runtime.nlayout.push(column);
		}
		this.dp = this.grid.runtime.dataProvider;
	},
	makeTree2List : function(){
		var dp = this.grid.runtime.dataProvider = [];
		for(var i=0,child;child=this.dp[i];i++){
			this._recurrence(child,dp);
		}
	},
	_recurrence : function(data,dp){
		dp.push(data);
		if(data.opened){
			if(!data.children){
				var children = [];
				for(var i=0,d,cld=data.d.children;d=cld[i];i++){
					var item = {d : d};
					item.layer = (data.layer || 0)+1;
					dp.push(item);
					children.push(item);
				}
				data.children = children;
			}
			else{
				for(var i=0,child;child=data.children[i];i++){
					this._recurrence(child,dp);
				}
			}
		}
	},
	expand : function(e){
		var rowIndex = $(e.target).attr("rowIndex"),
			data = this.grid.runtime.dataProvider[rowIndex];
		data.opened = !data.opened;
		this.makeTree2List();
		this.grid.refresh();
	} ,
	destroy : function(){
		//TODO
	}
 };
//注入plugin
$.ui.grid.plugins.register("treeview",$.ui.grid.treeview);

})(jQuery);
