/*
 * Balancebeam Widget Titlepane 1.0
 *
 * Description : Support flexible container
 * Copyright 2011
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
	 
 $.widget("ui.titlepane",$.ui.container, {
	options: {
		title : "标题",
		//默认是否打开的
		expanded : true,
		//是否能进行打开和关闭操作
		toggleable : true,
		//打开时的回调
		onExpand : null,
		//关闭时的回调
		onCollapse : null,
		//自定义按钮
		buttons : [],
		//点击表头是否可以toggle
		headerToggle : true
	},
	render : function(){
		var element = this.element,
			options = this.options,
			header = $("<div class='header'>" +
				"<div class='buttons'>"+this.generateButtons() + "</div>" + 
				"<div class='toggle'></div>" + 
				"<div class='title'>" + options.title + "</div>" + 		
				"</div>"),
			body = $("<div class='body'></div>");
		options.expanded ? header.addClass("on") :  body.hide();
		if(!options.toggleable){
			$(">.toggle",header).hide();
		}
		element.addClass("breeze-titlepane");
		element.append(header).append(body);
	},
	//调整展现区域的高度大小
	resize : function(){
		var height = this.options.height,
			element = this.element;		
		if(!this._hasInit){
			var options = this.options;
			this.loadContext({
				context : $(">.body",this.element),
				html : options.html,
				node : options.node,
				get : options.get,			
				url : options.url,
				pattern : options.pattern,
				parameters : options.parameters,
			    complete : options.onload
			});		
			this._hasInit = true;
		}
		if(!$(">.header",this.element).hasClass("on")){
			return;
		}
		//如果是百分高度或者固定高度修正容器的高度
		if(height != "auto"){
			element.height(height);
			var h = element.height();
			element.height("auto");
			$(">.body",element).height(h - 27);
		}
		$.each(this.getChildren(),function(index,child){
			child.resize();
		});
	},
	//生成辅助按钮
	generateButtons : function(){
		var html = [];
		for(var i=0,b;b=this.options.buttons[i];i++){
			html.push("<img class='button "+(b.cls || "")+"' title='"+(b.title || "")+"' src='"+(b.iconURL || breeze.getBlankIcon())+"'>");
		}
		return html.join("");
	},
	//绑定事件
	funnelEvents : function(){
		var self = this;
		$(">.header",this.element).click(function(e){
			var target = $(e.target);
			if(target.hasClass("button")){
				var index = $(">.button",target.parent()).index(target),
					onClick = self.options.buttons[index].onClick;
				onClick && onClick(self);
				return;
			}
			if(self.options.headerToggle || 
				target.hasClass("toggle")){
				self.toggle();
			}			
		});
	},
	//打开或关闭
	toggle : function(){
		if(false==this.options.toggleable) return;
		var header = $(">.header",this.element),self = this;
		if(header.hasClass("on")){
			header.removeClass("on");
			$(">.body",this.element).slideUp("fast",function(){
				self.onCollapse && self.onCollapse();
				//通知父亲
				self.notifyParentResize();
			});
		}
		else{
			header.addClass("on");
			$(">.body",this.element).slideDown("fast",function(){
				self.resize();
				self.onExpand && self.onExpand();
				//通知父亲
				self.notifyParentResize();
			});
		}
	},
	//打开
	expand : function(){
		var header = $(">.header",this.element);
		if(!header.hasClass("on")){
			this.toggle();
		}
	},
	//关闭
	collapse : function(){
		var header = $(">.header",this.element);
		if(header.hasClass("on")){
			this.toggle();
		}
	}
});
})(jQuery);
