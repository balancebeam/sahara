/*
 * Balancebeam Widget Resource 1.0
 *
 * Description : Support Resource
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 *		balancebeam/lib/widget/dialog/beam.dialog.js
 * 		balancebeam/lib/widget/layout/beam.borderlayout.js
 *		balancebeam/lib/widget/tree/beam.tree.js
 */

(function( $, undefined ) {
 $.widget("ui.resource",{
	options: {
		title : "导航",
		icon : null,
		dataProvider : [],
		exclude : "seperator",
		onClick : function(){},
		onClose : null
	},
	_create : function() {
		this.map = {};
		this.root = {id : "root",title : "资源根目录"};
		this.parse(this.root,this.options.dataProvider);
		this.render();
		this.funnelEvents();
		this.fetchItem(this.root);
	},
	parse : function(data,children){
		var rc = [];
		for(var i=0,c;c=children[i];i++){
			if(c.children && c.children.length){
				rc.push(this.parse({id : c.id,title : c.title,icon:"collapse"},c.children));
			}
		}
		if(rc.length){
			data.rc = rc;
		}
		data.children = children;
		return data;
	},
	render : function(){
		var self = this,
			navigator = $("<div></div>");
		navigator.tree({
			hideRoot : true,
			children : "rc",
			dataProvider : [this.root],
			onClick : function(treeNode){
				self.fetchItem(treeNode.getData());
			}
		});
		var layout = $("<div></div>");
		layout.borderlayout({
			regions : [{
				region: 'center',
				untitled : true,	
				overflow : "auto",
				node: (this.main=$("<ul class='breeze-resource'></ul>"))
			},{
				region: 'west',
				collapsible: true,
				title: '资源管理器',
				split: true,
				width: 200,
				minWidth: 100,
				node: navigator,
				overflow : "auto",
				draggable : true
			}]
		});
		this.element.dialog({
			title : this.options.title,
			startPosElement: this.options.startPosElement,
			modal : true,
			width : 700,
			height : 400,
			maximize : true,
			icon : this.options.icon || (breeze.getBreezeContextPath()+"themes/default/images/resource-navigator.png"),			
			node : layout,
			onClose : this.options.onClose
		});
	},
	funnelEvents : function(){
		var self = this;
		this.main.dblclick(function(e){
			var target = $(e.target);
			while(target[0]!=this){
				if(target.hasClass("resource-item")){
					var id = target.attr("resource-id");
					self.openItem(id);
					return;
				}
				target = target.parent();
			}
		});
	},
	fetchItem : function(data){
		var folder = [],
			leaf = [],
			children = data.children;
		for(var i=0,child;child = children[i];i++){
			!this.map[child.id] && (this.map[child.id] = child);
			var html = ["<li resource-id='"];
			html.push(child.id);
			html.push("' class='resource-item'>");
			html.push("<img ondragstart='return false' border='0' src='");
			if(child[this.options.exclude]){
				continue;
			}
			if(child.children && child.children){
				html.push(breeze.getBreezeContextPath()+"themes/default/images/resource-folder.png");
			}
			else{
				html.push(child.icon || (breeze.getBreezeContextPath()+"themes/default/images/resource-file.png"));
			}			
			html.push("'/>");
			html.push(child.title);
			html.push("</li>");
			if(child.children && child.children){
				folder.push(html.join(""));
			}
			else{
				leaf.push(html.join(""));				
			}
		}
		this.main.html(folder.join("")+leaf.join(""));
	},
	openItem : function(id){
		var data = this.map[id];
		if(data.children && data.children.length){
			this.fetchItem(data);
		}
		else{
			this.options.onClick(data);
		}
	},
	open : function(e){
		this.element.dialog("open",e);
	},
	close : function(){
		this.element.hide();
	}
 });
 
})(jQuery);
