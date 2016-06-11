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
 $.widget("ui.menuviewer",{
	options: {
		dataProvider : []	
	},
	_create : function(){
		var self = this,
			viewer = $("<div></div>"),
			navigator = $("<div></div>"),
			contents = $("<div></div>");
		//初始化导航树	
		navigator.accordion({
			noborder : true,
			loadItem: function(item,callback){
				var node = $("<div></div>");
				node.tree({
					root: {
						visibility: false
					},
					dataProvider: item.children,
					onClick : function(treeNode){
						var data = treeNode.getData();
						if(data.url){
							var dataProvider = contents.tabs("getDataProvider");
							for(var i=0,d;d =dataProvider[i];i++){
								if(data.url == d.url){
									contents.tabs("selectTab",i);
									return;
								}				
							}
							contents.tabs("addTab",{
								url : data.url,
								title : data.title,
								closable : true,
								iconURL : data.iconURL
							});
						}
					}
			    });
				callback(node);
			},
			dataProvider: this.options.dataProvider
		});	
		//工作区
		contents.tabs({
			noborder : true,
			height : "100%",
			dataProvider : [],
			plugins: {
				contextmenu: true
			}
		});
		//访问布局部分
		viewer.borderlayout({
			regions : [{
				region: 'center',
				untitled : true,	
				overflow : "auto",
				node: contents
			},{
				region: 'west',
				collapsible: true,
				title: '资源管理器',
				split: true,
				width: 260,
				minWidth: 100,
				node: navigator,
				overflow : "auto",
				draggable : true
			}]
		});	
	}
 });
 
})(jQuery);
