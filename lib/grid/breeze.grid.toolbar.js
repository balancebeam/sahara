/*
 * Balancebeam Widget Grid_Plugin_Toolbar 1.0
 *
 * Description : Support the hidden columns
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 * 		balancebeam/lib/widget/grid/beam.grid.js
 * 		balancebeam/lib/widget/menu/beam.menu.js
 */

(function( $, undefined ) {
 
$.ui.grid.toolbar = function(grid,params){
	 this.grid = grid;
	 this._create(params);
};
//draggable原型定义
$.ui.grid.toolbar.prototype = {
	//bind event
	_create : function(params){
		this.filedIndex = params.filedIndex || 0;
		var self = this,
			grid = this.grid,
			html = [];
		html.push("<div class='toolbar'>");
		html.push("<div class='menu-btn'>更多功能</div>");
		html.push("<div class='query'>");
		html.push("<input type='text'>");
		html.push("</div>");
		html.push("</div>");
		grid.gridElement.prepend(this.toolbarNode = $(html.join("")));
		this.toolbarNode.bind("click.grid-toolbar",function(e){
			var target = $(e.target);
			if(target.hasClass("menu-btn")){
				var popMenu = self.createPopMenu();
				popMenu.show();
			}
		});
		
		$("input",this.toolbarNode).keydown(function(e){
			if(13==e.keyCode){				
				self.doQuery($(this).val());			
			}
		});
	},
	doQuery : function(value){
		var grid = this.grid,
			runtime = grid.runtime,
			reg = new RegExp(value,"ig");
		runtime.dataProvider = runtime.dataProvider.concat(runtime.filterProvider);
		runtime.filterProvider = [];
		for(var dataProvider = runtime.dataProvider, i=dataProvider.length-1,d;i>=0;i--){
			var row = dataProvider[i],
				v = row["d"][this.filedIndex];
			if(!v.match(reg)){
				runtime.filterProvider.push(row);
				dataProvider.splice(i,1);
			}
		}
		grid.resize();
	},
	createPopMenu : function(){
		this.popMenu && this.popMenu.remove();
		var iconPath = breeze.getBreezeContextPath()+"themes/default/images/",
			popMenu = $("<div style='dropmenu'></div>"),
			columns = this.columns = [],
			children = [],
			self = this,
			grid = this.grid,
			layout = this.grid.options.layout,
			columnIndex = 0;
		for(var i=0,vl;vl=layout[i];i++){
			for(var k=0,cl;cl = vl[0][k];k++){
				columns.push(cl);
				children.push({
					id : String(columnIndex),
					normal : layout.length - 1 == i,
					column : true,
					title : cl.title || "",
					iconURL : iconPath+(cl.hidden ? "grid-menu-unchecked.gif" : "grid-menu-checked.gif")
				});
				columnIndex++;
			}
			if(0==i && layout.length>1){
				children.push({
					seperator : true  
				});
			}
		};
		popMenu.menu({
			menuBar : false,
			closableRoot : true,
			dataProvider : [
			       {	
			    	    id:"columns",
			    	    title:"展现列",
			    	    icon:iconPath+"grid-menu-columns.gif",
			    	    children : children
			       }
			],
			onClick : function(data,menuItem){
				if(data.column){
					var column = columns[Number(data.id)];
					column.hidden = !column.hidden;
					self.checkVNColumn(popMenu,columns);
					$(".menu-item-icon",menuItem).attr("src",iconPath + (column.hidden ? "grid-menu-unchecked.gif" : "grid-menu-checked.gif"));
					grid.refresh();					
					return false;
				}
			}
		});
		this.checkVNColumn(popMenu,columns);
		this.toolbarNode.append(popMenu);		
		return popMenu;
	},
	checkVNColumn : function(popMenu,columns){
		var layout = this.grid.options.layout,
			l = layout.length>1 ? layout[0][0].length : 0,
			result = [];
		for(var i=columns.length-1;i>=l;i--){
			if(!columns[i].hidden){
				result.push(i);
			}
			popMenu.menu("setDisabled",String(i),false);
		}
		if(1==result.length){
			popMenu.menu("setDisabled",String(result[0]),true);
		}
	},
	destroy : function(){
		 this.popMenu && this.popMenu.remove();
	}
 };
//注入plugin
$.ui.grid.plugins.register("toolbar",$.ui.grid.toolbar);

})(jQuery);
