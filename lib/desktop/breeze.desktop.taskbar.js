/*
 * Balancebeam Widget Desktop Taskbar 1.0
 *
 * Description : Support Desktop Taskbar
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 * 		balancebeam/lib/widget/desktop/beam.desktop.js
 */

(function( $, undefined ) {
 
 $.ui.desktop.taskbar = function(desktop,params){
	 this.desktop = desktop;
	 this.params = params || {};
	 this._create();
 };
$.ui.desktop.taskbar.prototype = {
	_create : function(){	
		this.desktop.subscribe("resize.taskbar",this,"resize");
		this.desktop.subscribe("newDialog.taskbar",this,"newShortcut");
		this.desktop.subscribe("closeDialog.taskbar",this,"closeShortcut");
		this.desktop.subscribe("minimizeDialog.taskbar",this,"minimizeShortcut");
		this.desktop.subscribe("toggleDialog.taskbar",this,"toggleShortcut");
		this.desktop.options.minimize = true;		
		this._shortcuts = {};		
	},
	newShortcut : function(id,data){	
		//创建快捷方式
		var shortcut = $("<div shortcutId='"+id+"' class='shortcut actived'><div>"+(data.iconURL?"<img src='"+data.iconURL+"'/>":"")+"<span>"+data.title+"</span></div></div>");
		$(">.scrollBar>.shortcuts>.actived",this.taskbar).removeClass("actived");
		$(">.scrollBar>.shortcuts",this.taskbar).append(shortcut);		
		this._shortcuts[id] = shortcut;		
		var dialog = this.desktop._dialogs[id];
		dialog.dialog("setAnimateTarget",shortcut);
		this.resize();
	},
	resize: function(){
		var width = this.desktop.runtimeWidth -170,
			shortcuts = $(">.scrollBar>.shortcuts",this.taskbar);
		if(shortcuts.children().last()[0]){
			var lastShortcut = shortcuts.children().last()[0],			
				lastShortcutOffsetRight = lastShortcut.offsetWidth+2+lastShortcut.offsetLeft,
				shortcutsrollLeft = shortcuts.scrollLeft();
			if(shortcutsrollLeft+lastShortcutOffsetRight>width){
				$(">.scrollBar>.scrollLeft",this.taskbar).show();
				$(">.scrollBar>.scrollRight",this.taskbar).show();
				if(shortcutsrollLeft==0){
					$(">.scrollBar>.scrollLeft",this.taskbar).addClass("disabled");
				}
				else{
					$(">.scrollBar>.scrollLeft",this.taskbar).removeClass("disabled");
				}
				if(shortcuts.width()+shortcutsrollLeft<lastShortcutOffsetRight){
					$(">.scrollBar>.scrollRight",this.taskbar).removeClass("disabled");
				}
				else{
					$(">.scrollBar>.scrollRight",this.taskbar).addClass("disabled");
				}
				return;
			}			
		}
		$(">.scrollBar>.scrollLeft",this.taskbar).hide();
		$(">.scrollBar>.scrollRight",this.taskbar).hide();
	},
	closeShortcut : function(id){
		this._shortcuts[id].remove();
		delete this._shortcuts[id];	
		this.toggleShortcut();
		this.resize();
	},
	minimizeShortcut : function(){
		this.toggleShortcut();
	},
	toggleShortcut : function(){
		var dialogs = $(">.desktop-body>.breeze-dialog",this.desktop.element);
		$(">.scrollBar>.shortcuts>.actived",this.taskbar).removeClass("actived");
		for(var i=dialogs.length-1;i>=0;i--){
			if($(dialogs[i]).dialog("isOpened")){
				var id = $(dialogs[i]).attr("dialogId");			
				this._shortcuts[id].addClass("actived");
				return;
			}
		}
	},
	startup : function(){
		$(">.desktop-body",this.desktop.element).css("bottom","28px");
		var self = this;
		this.taskbar = $("<div class='desktop-taskbar'><div class='start'><div><img src='"+breeze.getBlankIcon()+"'><span>开始</span></div></div><div class='splitter left'></div><div class='scrollBar'><div class='scrollLeft'></div><div class='scrollRight'></div><div class='shortcuts'></div></div><div class='splitter right'></div><div class='timer'>...</div ></div>");
		this.desktop.element.append(this.taskbar);
		this.taskbar.click(function(e){
			var target = $(e.target);
			if(target.hasClass("scrollLeft") && !target.hasClass("disabled")){
				var shortcuts = $(">.scrollBar>.shortcuts",self.taskbar);
				shortcuts.scrollLeft(shortcuts.scrollLeft()-100);
				self.resize();
				return;
			}
			if(target.hasClass("scrollRight") && !target.hasClass("disabled")){
				var shortcuts = $(">.scrollBar>.shortcuts",self.taskbar);
				shortcuts.scrollLeft(shortcuts.scrollLeft()+100);
				self.resize();
				return;
			}
			var start = breeze.parent(target,"start");					
			if(start!=null){
				self.showStartMenu();
				return;
			}
			var shortcut = breeze.parent(target,"shortcut");			
			if(shortcut!=null){
				var id = shortcut.attr("shortcutId"),
					dialog = self.desktop._dialogs[id];
				if(shortcut.hasClass("actived")){
					dialog.dialog("minimize");
				}
				else if(!dialog.dialog("isOpened")){
					dialog.dialog("open");
				}
				else{
					self.desktop.toggleDialog(dialog);
				}
			}
		});
		$(">.scrollBar>.shortcuts",this.taskbar).bind("contextmenu",function(e){
			var target = breeze.parent($(e.target),"shortcut");
			if(target!=null){
				self.currentShortcutId = target.attr("shortcutId");
				self.showShortcutMenu(e);				
				return false;
			}			
		});
		var timer = $(">.timer",this.taskbar);
		(function(){
			var func = arguments.callee,
				date = new Date(),
				localeTime = date.getHours()+":"+date.getMinutes() +" "+(date.getHours()>=12?"PM":"AM");
			timer.html(localeTime)
			self.handler = setTimeout(function(){
				func();
			},1000);
		})();
	},
	//显示开始菜单
	showStartMenu : function(){
		if(!this.startMenu){
			var self = this,
				html = ["<div class='start-menu'><div class='header'><img class='icon' src='"];
			html.push(this.params.iconURL || (breeze.getBreezeContextPath()+"themes/default/images/desktop-person.png"));
			html.push("'/>");
			html.push("<span class='title'>");
			html.push(this.params.username || "匿名用户");
			html.push("</span></div><div class='body'></div><div class='settings'>");
			var settings = this.params.settings;
			if(settings){
				for(var i=0,setting;setting=settings[i];i++){
					if(true==setting.seperator){
						html.push("<div class='seperator'></div>");
					}
					else{
						html.push("<div class='setting'>");
						html.push("<img src='"+setting.iconURL+"'>");
						html.push("<span>"+setting.title+"</span>");
						html.push("</div>");
					}
				}
			}
			var isNeedSeperator = false;
			if(this.params.setting){
				html.push("<div class='setting'>设置</div>");
				isNeedSeperator = true;
			}
			if(this.params.logout){
				html.push("<div class='logout'>注销</div>");
			}
			html.push("</div></div>");
			this.startMenu = $(html.join("")).appendTo(this.desktop.element);
			$(">.body",this.startMenu).menu({
				menuBar : false,
				dataProvider : self.desktop.options.dataProvider,
				onClick : function(data){
					self.desktop.openDialog(data);
					self.startMenu.hide();
					$(">.start",self.taskbar).removeClass("actived");
				},
				onClose : function(e){
					var target = $(e.target);
					if(!target.parents(".start-menu").length){
						self.startMenu.hide();
						$(">.start",self.taskbar).removeClass("actived");
					}
				},
				onMousedown: function(menuItem,data,e){
					if(!data.url){
						return;
					}
					var proxy = null,
						oMouseLeft = e.clientX,
						oMouseTop = e.clientY,
						offset = self.desktop.element.offset(),
						oLeft = oMouseLeft - offset.left + 13 ,
						oTop =oMouseTop- offset.top + 20;

					self.desktop.element.addClass("breeze-noselectable");
					function domousemove(e){
						if(proxy==null){
							proxy = $("<span class='drag-proxy'><label></label></span>")
							proxy.css({
								left: oLeft+"px",
								top: oTop+ "px"
							});
							$(">label",proxy).html(data.title);
							proxy.appendTo(self.desktop.element);							
						}
						proxy.css({
							left : (oLeft +e.clientX -oMouseLeft)+ "px",
							top : (oTop + e.clientY-oMouseTop)+ "px"
						});
						if($(e.target).hasClass("screen-drag")){
							proxy.addClass("on");
						}
						else{
							proxy.removeClass("on");
						}
					}
					function domouseup(e){
						if(proxy!=null){
							if(proxy.hasClass("on")){
								proxy.remove();
								self.desktop.addShortcut(data);
							}
							else{
								proxy.animate({
									left :  oLeft+"px",
									top :  oTop+ "px",
									opacity : 'toggle'
								},300,function(){
									proxy.remove();
								});
							}							
						}
						self.desktop.element.removeClass("breeze-noselectable");
						$(document).unbind("mousemove",domousemove);
						$(document).unbind("mouseup",domouseup);
					}
					$(document).bind("mousemove",domousemove);
					$(document).bind("mouseup",domouseup);
				}
			});
			$(">.settings",this.startMenu).click(function(e){
				var target = $(e.target);
				if(!target.hasClass("setting")){
					target = target.parents(".setting");
					if(null==target[0]) return;
				}
				var index = $(">.settings>div",self.startMenu).index(target),
					setting = self.params.settings[index];
				setting.onClick && setting.onClick();
				self.startMenu.hide();
				$(">.start",self.taskbar).removeClass("actived");
			});
		}
		$(">.start",this.taskbar).addClass("actived");
		this.startMenu.show();
	},
	showShortcutMenu : function(e){
		if(!this.shortcutMenu){	
			var self = this;
			this.shortcutMenu = $("<div class='shortcut-menu'></div>").appendTo(this.desktop.element);this.shortcutMenu.menu({
				menuBar : false,
				dataProvider : [
					{
						id : "restore",
						title : "还原"
					},
					{
						id : "minimize",
						title : "最小化"
					},
					{
						id : "maximize",
						title : "最大化"
					},
					{
						seperator : true
					},
					{
						id : "close",
						title : "关闭"						
					}
					,
					{	
						id : "close-other",
						title : "关闭其他"						
					},
					{	
						id : "close-all",
						title : "关闭所有"						
					}
				],
				onClick : function(data){					
					self.shortcutMenu.hide();
					var id = self.currentShortcutId,
						dialog = self.desktop._dialogs[id];
					switch(data.id){
						case "restore" :
							if(dialog.dialog("isOpened")){
								dialog.dialog("restore");
							}
							else{
								dialog.dialog("open");
							}
							break;
						case "minimize" :
							dialog.dialog("minimize");
							break;
						case "maximize" : 
							dialog.dialog("maximize");
							break;
						case "close" :
							dialog.dialog("close");
							break;
						case "close-other" : 
							for(var key in self._shortcuts){
								if(key==id) continue;
								self._shortcuts[key].remove();
								self.desktop._dialogs[key].remove();
								delete self._shortcuts[key];
								delete self.desktop._dialogs[key];							
							}	
							self.toggleShortcut();
							self.resize();
							break;
						case "close-all" : 
							for(var key in self._shortcuts){
								self._shortcuts[key].remove();
								self.desktop._dialogs[key].remove();
								delete self._shortcuts[key];
								delete self.desktop._dialogs[key];
							}	
							self.resize();
							break;							
					}				
				},
				onClose : function(e){
					self.shortcutMenu.hide();
				}				
			});		
		}
		var id = this.currentShortcutId,
			dialog = this.desktop._dialogs[id],
			shortcutMenu = this.shortcutMenu;
			
		if(dialog.dialog("isOpened")){
			shortcutMenu.menu("setDisabled","minimize",false);
			if(dialog.dialog("isMaximized")){
				shortcutMenu.menu("setDisabled","restore",false);
				shortcutMenu.menu("setDisabled","maximize",true);	
			}
			else{
				shortcutMenu.menu("setDisabled","restore",true);
				shortcutMenu.menu("setDisabled","maximize",false);	
			}
		}
		else{
			shortcutMenu.menu("setDisabled","restore",false);
			shortcutMenu.menu("setDisabled","minimize",true);
			shortcutMenu.menu("setDisabled","maximize",true);			
		}
        if($(">.scrollBar>.shortcuts>.shortcut",this.taskbar).length>1){
			shortcutMenu.menu("setDisabled","close-other",false);
		}
		else{
			shortcutMenu.menu("setDisabled","close-other",true);
		}
			
		shortcutMenu.css({
			left : e.clientX+"px",
			top : (e.clientY-159)+"px",
			display : "block"
		});
	},
	//销毁下拉菜单插件
	destroy : function(){
		window.clearTimeout(this.handler);
	}
 };
//注入plugin
$.ui.desktop.plugins.register("taskbar",$.ui.desktop.taskbar);
 
})(jQuery);
