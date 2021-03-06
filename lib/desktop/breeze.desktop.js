/*
 * Balancebeam Widget Desktop 1.0
 *
 * Description : Support Desktop
 * Copyright 2012
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 *		balancebeam/lib/jquery/jquery.ui.core.js
 *		balancebeam/lib/jquery/jquery.ui.widget.js
 *		balancebeam/lib/widget/beam.toolkit.js
 * 		balancebeam/lib/widget/layout/beam.container.js
 */

(function( $, undefined ) {
 
 $.widget("ui.desktop", $.ui.container,{
	options: {
		width : "100%",
		height : "100%",
		bgImg : null,
		//多实例
		multipleInstance : false,
		//树型结构数据源
		dataProvider : [],
		//快捷方式
		shortcuts : [[]],
		//是编辑桌面
		screenEditable: true,
		//展现适配器
		shortcutAdapter: "shortcut", //metro、shortcut
		//扩展插件
		plugins : {}
	},
	render : function() {
		var element = this.element,
			fragment = document.createDocumentFragment();		
		element.addClass("breeze-desktop");	
		//弹出对话框集合
		this._dialogs = {};
		//初始化消息栈
		this._topics = {};
		//定义插件集合
		this.pluginInstances = {};
		//数据集合
		this.database = {};
		//数据索引处理
		this.transformdata(this.options.dataProvider);
		var shortcutAdapter = this.options.shortcutAdapter;
		if(shortcutAdapter==null){
			shortcutAdapter = {style:"shortcut"};
		}
		else if(typeof(shortcutAdapter)=="string"){
			shortcutAdapter = {style:shortcutAdapter};
		}
		if(!shortcutAdapter.style){
			shortcutAdapter.style = "shortcut";
		}
		this.options.shortcutAdapter = shortcutAdapter;

		//初始化plugins
		var classes = $.ui.desktop.plugins.classes,
			plugins = this.options.plugins;
		for(var name in classes){
			if(!plugins[name]){
				continue;
			}
			var clazz = classes[name]; 			
			this.pluginInstances[name] = new clazz(this,plugins[name]);
		 };
		
		var navigator = $("<div class='desktop-nav'><div class='nav1'><div class='nav2'><div class='screens'></div></div></div></div>"),
			screens = $(".screens",navigator),			
			body = $("<div class='desktop-body'><div class='desktop-viewport'></div></div>"),
			viewport = $(">.desktop-viewport",body),			
			shortcuts = this.options.shortcuts  || (this.options.shortcuts=[[]]);
		//增加多窗口编辑按钮
		if(this.options.screenEditable){
			$("<div class='screen-more'></div>").appendTo($(".nav2",navigator));
		}
		
		//设置背景图片
		if(this.options.bgImg){
			body.css("backgroundImg",this.options.bgImg);
		}
		!shortcuts.length && shortcuts.push([]);
		//创建多屏
		for(var i=0,datalist;datalist=shortcuts[i];i++){			
			this.createScreen(datalist,screens,viewport);
		}
		
		$(">.screen:first-child",screens).addClass("selected");				
		fragment.appendChild(navigator[0]);
		fragment.appendChild(body[0]);
		element.append(fragment);
		for(var name in this.pluginInstances){
			var instance = this.pluginInstances[name];
			instance.startup && instance.startup();
		}		
	},
	//转换数据为key：value结构
	transformdata : function(list){
		for(var i=0,data;data=list[i];i++){
			this.database[data.id] =data;
			if(data.children){
				this.transformdata(data.children);
			}
		}
	},
	//创建滚动屏幕
	createScreen : function(shortcuts,screens,viewport){
		var self = this;
		screens =screens || $(">.desktop-nav .screens",this.element),
		viewport =viewport || $(">.desktop-body>.desktop-viewport",this.element);
		screens.append($("<div class='screen'></div>"));
		var screen = $("<div class='desktop-screen screen-drag'></div>"),
			dataProvider =[],
			shortcutAdapter = this.options.shortcutAdapter;
		for(var i=0,shortcut;shortcut=shortcuts[i];i++){
			if(typeof(shortcut)=="string"){
				if(this.database[shortcut]){
					dataProvider.push(jQuery.extend({},this.database[shortcut]));
				}				
			}
			else{
				if(this.database[shortcut.id]){
					dataProvider.push(jQuery.extend(shortcut,this.database[shortcut.id]));
				}
			}
		}
		switch(shortcutAdapter.style){
			case "metro":
				var node = $("<div class='screen-drag'></div>");
				node.metro(jQuery.extend({},{
					width: 1100,
					column: 10,
					dataProvider: dataProvider,
					layout: "free",
					onClick: function(data,e){
						self.openDialog(data);
					},
					onResize: function(){
						var w = self.element.width();
						if(w<1200){
							node.width(900);
							node.metro("changeSize",80);
						}
						else{
							node.width(1100);
							node.metro("changeSize",100);
						}
					}
				},shortcutAdapter.params));	
				screen.append(node);
				break;
			default:
				var node = $("<div class='screen-drag'></div>");
				node.shortcut(jQuery.extend({},shortcutAdapter.params,{
					dataProvider:  dataProvider,
					onClick: function(data,e){
						self.openDialog(data);
					}
				}));	
				screen.append(node);
		}
		
		this.publish("createScreen",[screen]);
		viewport.append(screen);
	},
	//调整展现区域的高度大小
	resize : function(){
		this.runtimeWidth = this.element.width();
		this.runtimeHeight = this.element.height();
		this.publish("resize");
		this.resize0();
		jQuery.each(this.getChildren(),function(index,child){
			child.resize();
		});
	},
	resize0 : function(){
		var width =this.runtimeWidth,
			element = this.element,
			selectedIndex = $(">.desktop-nav .screen",this.element).index($(">.desktop-nav .selected",this.element));
		$(">.desktop-body>.desktop-viewport",element).css("left", "0");
		$.each($(">.desktop-body>.desktop-viewport>.desktop-screen",element),function(index,screen){
			$(screen).css("left",(index-selectedIndex)*width+"px");
		});
	},	
	funnelEvents : function(){
		var self = this;
		$(">.desktop-nav .screens",this.element).click(function(e){
			breeze.stopEvent(e);
			var target = $(e.target);
			if(target.hasClass("screen")){				
				self.selectDesktop($(".screen",this).index(target));			
			}
		});	
		if(this.options.screenEditable){
			$(">.desktop-nav .screen-more",this.element).click(function(e){
				self.showEditScreenDialog(e);
			});			
		}
		$(">.desktop-body",this.element).mousedown(function(e){
			var target = $(e.target);
			if(target.hasClass("screen-drag")){ 
				target = breeze.parent(target,"desktop-screen");
				self.dragScreen(target,e);
				return;
			}			
		});
	},
	//弹出多屏编辑窗口
	showEditScreenDialog : function(e){
		var self = this;		
		function generateScreensHTML(){
			var html = [],
				removable = self.options.shortcuts.length>1;
			$.each(self.options.shortcuts,function(index){
				html.push("<div class='screen'>"+(index+1)+(removable?"<div class='remove'>":"")+"</div></div>");
			});
			html.push("<div class='screen screen-add'></div>");
			return html.join("");
		}			
		var screenDialog = $("<div class='screen-dialog'></div>");
		screenDialog.appendTo(this.element);
		screenDialog.dialog({
			title : "分屏设置",
			modal : true,
			icon : breeze.getBreezeContextPath()+"themes/default/images/desktop-screen-icon.png",
			width : 775,
			height : 350,
			resizable : false,
			get : function(load){
				var screens = $("<div class='screens'></div>");	
				screens.html(generateScreensHTML());
				load(screens);	
				screens.click(function(e){
					var target = $(e.target);
					if(target.hasClass("screen-add")){
						self.addDesktop([]);
						setTimeout(function(){screens.html(generateScreensHTML());},0);							
					}
					else if(target.hasClass("remove")){
						self.removeDesktop($(">.screen",screens).index(target.parent()));	
						setTimeout(function(){screens.html(generateScreensHTML());},0);				
					}					
				});					
			},
			onClose : function(){
				screenDialog.remove();
			}
		});		
		screenDialog.dialog("open",e);
	},
	//拖动滚动屏幕
	dragScreen : function(target,e){
		var self = this,
			clientX = e.clientX,
			distance = 0,
			lastIndex = this.options.shortcuts.length-1;
			viewport = $(">.desktop-body>.desktop-viewport",this.element),
			selectedIndex = $(">.desktop-nav .screen",this.element).index($(">.desktop-nav .selected",this.element));
			
		document.attachEvent && document.body.setCapture();
		function mousemoveDesktop(e){
			distance = e.clientX-clientX;
			viewport.css("left",distance+"px");
		}
		function mouseupDesktop(e){	
			document.attachEvent && document.body.releaseCapture();
			$(document).unbind("mousemove",mousemoveDesktop);
			$(document).unbind("mouseup",mouseupDesktop);
			//拖动的幅度小于200，不执行切换桌面				
			if(Math.abs(distance)<200 || 
				(0==selectedIndex && distance>0) || 
				(lastIndex==selectedIndex && distance<0)){
				viewport.animate({"left":"0px"},"fast");
			}
			else{
				self.selectDesktop(selectedIndex+(distance<0?1:-1));
			}
		}
		$(document).bind("mousemove",mousemoveDesktop);
		$(document).bind("mouseup",mouseupDesktop);
	},
	//增加快捷方式
	addShortcut : function(data){
		var selectedIndex = $(">.desktop-nav .screen",this.element).index($(">.desktop-nav .selected",this.element)),
			screen = $(">.desktop-body>.desktop-viewport>.desktop-screen",this.element).eq(selectedIndex);
		switch(this.options.shortcutAdapter.style){
			case "metro":
				$(">div",screen).metro("addTile",jQuery.extend({},data));
				break;			
			default: 
				$(">div",screen).shortcut("addShortcut",jQuery.extend({},data));
		}
	},
	//选择桌面
	selectDesktop : function(nIndex){
		var screens = $(">.desktop-nav .screen",this.element),
			oIndex = $(">.desktop-nav .screen",this.element).index($(">.desktop-nav .selected",this.element)),
			self = this;
		if(nIndex==oIndex){
			return;
		}
		$(screens[oIndex]).removeClass("selected");
		$(screens[nIndex]).addClass("selected");
		$(">.desktop-body>.desktop-viewport",this.element).animate({
			"left" : (oIndex-nIndex) * this.runtimeWidth + "px"
		},"normal",function(){
			self.resize0();
		});
	},
	//删除桌面
	removeDesktop : function(index){
		var screens = $(">.desktop-nav .screen",this.element),
			screen = $(screens[index]);
		if(1==screens.length) {
			return;
		}
		if(screen.hasClass("selected")){					
			(screen.next().length && screen.next() || screen.pre()).addClass("selected");
		}
		screen.remove();
		this.options.shortcuts.splice(index,1);		
		$($(">.desktop-body>.desktop-viewport>.desktop-screen",this.element)[index]).remove();		
		this.resize0();		
	},
	//增加桌面
	addDesktop : function(data){
		data = data || [];
		this.options.shortcuts.push(data);
		this.createScreen(data);
		this.resize0();	
	},
	//弹出对话窗口
	openDialog : function(data){
		var id = this.options['multipleInstance'] ? new Date().getTime() : data.id,
			dialog = this._dialogs[id];
		if(!dialog){
			var self = this;
			dialog = $("<div dialogId='"+id+"'><div>");	
			dialog.mousedown(function(e){
				self.toggleDialog($(this));
			});
			dialog.appendTo($(">.desktop-body",this.element));			
			dialog.dialog(jQuery.extend({				
				maximize : true,
				icon : data.iconURL,
				title : data.title,
				url : data.url,	
				pattern : data.pattern || this.options.pattern,
				"start-pos" : {
					left : "50px",
					top : "bottom"
				},
				onOpen : function(){
					self.toggleDialog(dialog);
				},
				onClose : function(){
					dialog.remove();
					delete self._dialogs[id];
					self.publish("closeDialog",[id]);
				}
			},this.options.minimize? {
				minimize : true,
				onMinimize : function(){
					self.publish("minimizeDialog",[id]);
				}
			} : {}));
			this._dialogs[id] = dialog;						
			this.publish("newDialog",[id,data]);			
		}	
		dialog.dialog("isOpened") ? this.toggleDialog(dialog) : dialog.dialog("open");
	},
	toggleDialog : function(dialog){
		var lastDialog = $(">.desktop-body>.breeze-dialog",this.element).last();
		if(lastDialog[0]!=dialog[0]){		
			lastDialog.after(dialog);		
		}	
		this.publish("toggleDialog",[dialog]);		
	},
	//发布消息
	publish : function(topic,args){		
		$.each(this._topics[topic] || [],function(index,method){
			method.apply(null,args || []);
		});
	},
	//订阅消息
	subscribe : function(topic,context,method){		
		topic = topic.split(".");
		var id = topic[1] || "";
		topic = topic[0];
		var listener = this._topics[topic] || (this._topics[topic] = []);
		function fn(){
			(jQuery.isFunction(method) && method || context[method]).apply(context,arguments);
		}
		fn.id = id;
		listener.push(fn);
	},
	//取消订阅
	unsubscribe : function(topic){		
		topic = topic.split(".");
		var id = topic[1] || "";
		topic = topic[0];
		if(null==id){
			delete this._topics[topic];
			return;
		}
		var listener = this._topics[topic] || [];
		for(var i=listener.length-1,fn;fn =listener[i];i--){
			if(fn.id==id){
				listener.splice(i,1);
			}
		}
	}
 });
  /**
  * 定义Grid扩展插件
  * @author yangzz
  * @version 1.0
  */
 $.ui.desktop.plugins = new function(){
	 this.classes = {};
	 this.register = function(name,clazz){
		 this.classes[name] = clazz;
	 };
 }();
})(jQuery);
