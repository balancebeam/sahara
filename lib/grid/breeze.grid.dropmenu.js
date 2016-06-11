/*
 * Balancebeam Widget Grid_Plugin_Dropmenu 1.0
 *
 * Description : Support pop-up menu for locked columns
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
 
$.ui.grid.dropmenu = function(grid){
	 this.grid = grid;
	 this._create();
 };
$.ui.grid.dropmenu.prototype = {
	//bind event
	_create : function(){
		var self = this,
			grid = this.grid,
			headersNode = grid.headersNode;
		
		//定义点击下拉菜单的按钮
		var dropBtn = this.dropBtn = $("<div class='drop-btn'></div>");
		
		headersNode.bind("mousedown.grid-dropmenu",function(e){
			var target = $(e.target);
			if(!target.hasClass("drop-btn"))
				return;
			var dropMenu = self.dropMenu = self.dropMenu || self.createPopMenu();
			
			var columnMarkup = grid.getColumnMarkup(target.parent()),
				left = dropBtn.offset().left - headersNode.offset().left,
				top = headersNode.height()-1;
			//判断列是否能排序
			if(false==columnMarkup.column.sortable){
				dropMenu.menu("setDisabled","asc",true);
				dropMenu.menu("setDisabled","desc",true);
			}
			else{
				dropMenu.menu("setDisabled","asc",false);
				dropMenu.menu("setDisabled","desc",false);
			}
			//设置弹出菜单项是否可用
			if(columnMarkup.view == grid.normalView){ //不是非锁定视图
				dropMenu.menu("setDisabled","lock",1==grid.normalView.columns.length);
				dropMenu.menu("setDisabled","unlock",true);
			}
			else{
				dropMenu.menu("setDisabled","lock",true);
				dropMenu.menu("setDisabled","unlock",false);
			}
			dropMenu.css({
				top : top + "px",
				left : left + "px",
				display : "block"
			});
			breeze.stopEvent(e);
		});
		headersNode.bind("mouseover.grid-dropmenu",function(e){
			var target = $(e.target);
			if(null!=target.attr("idx")){
				var columnMarkup = grid.getColumnMarkup(target);
				if(false==columnMarkup.column.dropmenu){
					return;
				}
				if(self.dropMenu && "none"!=self.dropMenu.css("display")){
					return;
				}
				target.append(dropBtn);
				dropBtn.show();
			};
		});
		headersNode.bind("mouseout.grid-dropmenu",function(e){
			if(dropBtn[0]!=e.relatedTarget 
					&& (!self.dropMenu || "none"==self.dropMenu.css("display"))){
				dropBtn.hide();
			}
		});
	},
	createPopMenu : function(){
		var incoPath = breeze.getBreezeContextPath()+"themes/default/images/",
			self = this,
			grid = this.grid,
			headersNode = grid.headersNode;
		//定义下拉菜单
		var dropMenu = $("<div class='dropmenu'></div>").appendTo(headersNode);
		dropMenu.menu({
			menuBar : false,
			closableRoot : true,
			dataProvider : [
			{
				id : "asc",
				title : "升序",
				iconURL : incoPath + "grid-menu-asc.gif"
			},{
				id : "desc",
				title : "降序",
				iconURL : incoPath + "grid-menu-desc.gif"
			},{
				seperator : true
			},
			{
				id : "lock",
				title : "锁定",
				iconURL : incoPath + "grid-menu-lock.gif"
			},{
				id : "unlock",
				title : "解锁",
				iconURL : incoPath + "grid-menu-unlock.gif"
			}],
			onClick : function(data){
				var columnMarkup = grid.getColumnMarkup(self.dropBtn.parent());
				switch(data.id){
					case "asc" : 
						self.grid.publish("sort",[columnMarkup,true]);
						break;
					case "desc" : 
						self.grid.publish("sort",[columnMarkup,false]);
						break;
					case "lock" :
						self.lock(columnMarkup.idx);
						break;
					case "unlock" :
						self.unlock(columnMarkup.idx);
				}
			},
			onClose : function(e){
				var target = $(e.target);
				if($("div.th",headersNode).index(target)>-1){
					var columnMarkup = grid.getColumnMarkup(target);
					if(false!=columnMarkup.column.dropmenu){
						target.append(self.dropBtn);
						return;
					}
				}
				self.dropBtn.hide();
			}
		});
		return dropMenu;
	},
	//锁定列
	lock : function(index){
		var grid = this.grid,
			layout = grid.options.layout;
		if(1==layout.length){
			layout.unshift([[]]);
		}
		var columns = layout[1][0];
		index = this.getRealPosition(index,columns);
		var column = columns[index];
		layout[0][0].push(column);
		columns.splice(index,1);

//		if(0==columns.length){
//			layout.splice(1,1);
//		}
		grid.refresh();
	},
	//解锁列
	unlock : function(index){
		var grid = this.grid,
			layout = grid.options.layout,
			columns = layout[0][0];
		index = this.getRealPosition(index,columns);
		var column = columns[index];
		layout[1][0].unshift(column);
		columns.splice(index,1);
		
		if(0==columns.length){
			layout.splice(0,1);
		}
		grid.refresh();
	},
	getRealPosition : function(index,columns){
		var vIndex = 0;
		for(var i=0,column;column=columns[i];i++){
			if(column.hidden) continue;
			if(index==vIndex){
				return i;
			}
			vIndex++;
		}
		return columns.length-1;
	},
	//销毁下拉菜单插件
	destroy : function(){
		var headersNode = this.grid.headersNode;
		this.dropBtn && this.dropBtn.remove();
		this.dropMenu && this.dropMenu.remove();
		headersNode.unbind("mousedown.grid-dropmenu");
		headersNode.unbind("mouseover.grid-dropmenu");
		headersNode.unbind("mouseout.grid-dropmenu");
	}
 };
//注入plugin
$.ui.grid.plugins.register("dropmenu",$.ui.grid.dropmenu);
})(jQuery);
