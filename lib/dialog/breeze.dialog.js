/*
 * Balancebeam Widget Dialog 1.0
 *
 * Description : Support open modal Dialog
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 *		balancebeam/lib/jquery/jquery.ui.core.js
 *		balancebeam/lib/jquery/jquery.ui.widget.js
 *		balancebeam/lib/widget/beam.toolkit.js
 *		balancebeam/lib/widget/layout/beam.container.js
 */
 
 (function( $, undefined ) {
	 
 $.widget("ui.dialog", $.ui.container,{
	options: {
		//标题
		title : "对话窗口",
		//最小宽度
		minWidth : 200,
		//宽度
		width : 600,
		//最小高度
		minHeight : 100,
		//高度
		height : 350,
		//自定义html内容
		html : null,		
		//请求地址
		url : null,
		//传递参数
		parameters : null,
		//加载方式
		pattern : "xhr", //xhr、iframe
		//回调生成内容
		get : null,
		//加载回调
		onload : null,
		//打开是否重新加载
		reload : false,		
		//根据内容自适应大小
		suitable : false,
		//拖拽
		draggable : true,
		//改变大小
		resizable : true,
		//模态窗口
		modal : true,
		//最小化
		minimize : false,
		//最大化
		maximize : false,
		//关闭
		closable: true,
		//图标
		icon : null,
		//打开窗口的回调事件
		onOpen : null,
		//最小化回调事件
		onMinimize : null,
		//最大化回调事件
		omMaximize : null,
		//恢复回调事件
		onRestore : null,
		//关闭回调事件
		onClose : null,
		//是否显示动画
		animation: true,
		//定义显示位置
		position : {
			left : "center",
			top : "center"
		},
		//拖动中是否隐藏内容
		draginout: true,
		//是否在body中显示
		fixed2body : false,
		//起始聚焦元素
		animateTarget: null,
		//默认起始坐标
		"start-pos" : {
			left : "center",
			top : "center"
		}
	},
	//构造notice的展现结构
	render : function() {
		this.runtime = {};
		var element = this.element,
			options = this.options,
			node = element[0],
			fragment = document.createDocumentFragment();
		while(node.hasChildNodes()){
			fragment.appendChild(node.firstChild);
		}
		element.addClass("breeze-dialog");
		element.css("position",options.fixed2body ?"fixed" :"absolute");

		var html = ["<div class='resizing'></div>"];		
		html.push("<div class='header' >");
		if(options.closable){
			html.push("<div class='btn close'></div>");
		}
		//如果没有根据内容适应大小情况
		if(!options.suitable && options.maximize){
			html.push("<div class='btn maximize'></div>");
		}
		if(options.minimize){
			html.push("<div class='btn minimize'></div>");
		}		
		html.push("<div unselectable='on'  class='caption'>");
		if(options.icon){
			html.push("<img class='icon' src='");			
			html.push(options.icon);
			html.push("'>");
			html.push("</img>");
		}		
		html.push("<span unselectable='on' class='title'>");
		html.push(options.title);
		html.push("</span>");
		html.push("</div>");
		html.push("</div>");
		html.push("<div class='body'>");
		html.push("<div class='content'></div>");
		html.push("</div>");
		element.html(html.join(""));
		$(">.body>.content",element).append(fragment);
		this.setAnimateTarget(this.options.animateTarget);
	},
	resize : function(wr){
		if(this.options.suitable 
			|| (wr && !this.isMaximized())){ 
			return;
		}
		var element = this.element,
			height = element.height();
		$(">.body",element).height(height - 30);	
		$.each(this.getChildren(),function(index,child){
			child.resize(wr);
		});
	},	
	//绑定事件
	funnelEvents : function(){
		var self = this,
			options = this.options,
			element = this.element;
		//拖拽窗口
		if(options.draggable && $.fn.draggable){
			$(">.header",element).addClass("draggable");
			element.draggable({
				cancel: ">.header>.btn",
				handle : ">.header",
				start: function(event, ui) {
					//如果放大的时候不需要拖拽位置
					if(self.isMaximized()){
						return false;
					}
					options.draginout && self._fadeOut();
				},
				stop: function(event,ui) {
					options.draginout && self._fadeIn();
			}});
		}
		//如果自适应宽高没有resize的功能
		if (!options.suitable
				&& options.resizable
				&& $.fn.resizable) {
			var resizing = $(">.resizing",element);
			resizing.resizable({
				handles: "n,e,s,w,se,sw,ne,nw",
				minWidth : options.minWidth,
				minHeight : options.minHeight,
				start : function(event,ui){
					resizing.css("visibility","visible");
				},
				stop : function(event,ui){
					resizing.css("visibility","hidden");
					self.dragresize();
				}
			});
		}
		//定义标题栏的按钮事件
		$(">.header",element).click(function(e){
			breeze.stopEvent(e);
			var target = $(e.target);
			if(!target.hasClass("btn")) return;
			if(target.hasClass("close")){
				self.close();
			}
			else if(target.hasClass("minimize")){
				self.minimize();
			}
			else if(target.hasClass("maximize")){
				target.hasClass("restore") ? self.restore() : self.maximize();
			}			
		});
		//定义双击事件
		$(">.header",element).dblclick(function(e){
			breeze.stopEvent(e);
			var target = $(e.target);
			if(target.hasClass("btn")) return;
			target = $(">.header>.maximize",self.element);
			if(target.length){
				target.hasClass("restore") ? self.restore() : self.maximize();
			}
		});
	},
	_fadeOut : function(){
		$(">.header>.btn",this.element).css("visibility","hidden");
		$(">.body>.content",this.element).css("visibility","hidden");
		this.element.css("opacity",0.7);
	},
	_fadeIn : function(){
		$(">.header>.btn",this.element).css("visibility","visible");
		$(">.body>.content",this.element).css("visibility","visible");
		this.element.css("opacity",1);
	},
	//设置高度和宽度 fitDialogWidth&Height
	dragresize : function(){
		var element = this.element,
			resizing = $(">.resizing",element),
			width = resizing.width(),
			height = resizing.height(),
			top = parseInt(resizing.css("top"),10),
			left = parseInt(resizing.css("left"),10);
		resizing.css({
			"left": "0px",
			"top": "0px",
			"width": "100%",
			"height": "100%"
		});		
		element.css({
			"top": (parseInt(element.css("top"),10)+ top) +"px",
			"left": (parseInt(element.css("left"),10)+ left) +"px",
			"width": width+"px",
			"height": height+"px"
		});
		this.resize();
	},	
	//最大化窗口
	maximize: function(){
		var btn = $(">.header>.maximize",this.element);
		if(0==btn.length || btn.hasClass("restore")) return;
		btn.addClass("restore");
		var element = this.element,
			self = this;
		this.runtime.nWidth = parseInt(element.css("width"),10);
		this.runtime.nHeight = parseInt(element.css("height"),10);
		this.runtime.nLeft = element.css("left");
		this.runtime.nTop = element.css("top");		
		this._fadeOut();
		$(">.resizing",this.element).hide();
		element.animate({
			width : "100%",
			height : "100%",
			left : "0px",
			top : "0px"
		},"fast",function(){
			self._fadeIn();
			self.resize();
			self.options.onMaximize && self.options.onMaximize();
		});
	},
	restore : function(){
		var btn = $(">.header>.maximize",this.element);
		if(0==btn.length || !btn.hasClass("restore")) return;
		btn.removeClass("restore");
		var self = this;
		this._fadeOut();
		$(">.resizing",this.element).show();
		this.element.animate({
			width : this.runtime.nWidth+"px",
			height : this.runtime.nHeight+"px",
			left : this.runtime.nLeft,
			top : this.runtime.nTop
		},"fast",function(){
			self._fadeIn();
			self.resize();
			self.options.onRestore && self.options.onRestore();
		});
	},
	isOpened : function(){
		return "none"!=this.element.css("display");
	},
	isMaximized : function(){
		return $(">.header>.btn.maximize",this.element).hasClass("restore");
	},
	getAnimateTargetOffset: function(){
		if(this.animateTarget){
			var offset =  this.animateTarget.offset();		
			return offset;
		}
		return null;
	},
	//打开窗口
	open : function(e){
		//如果是可见的返回
		if(this.isOpened()) return;		
		var self = this,
			options = this.options,
			position = options.position,
			parent = this.element.parent(),
			pWidth = parent.width(),
			pHeight = parent.height(),
			speOffset =this.getAnimateTargetOffset(), 
			oLeft =speOffset && (speOffset.left+"px") || e && (e.clientX+"px") || this._getPos(0,pWidth,this.options["start-pos"].left) ,
			oTop = speOffset && (speOffset.top+"px") ||e && (e.clientY+"px") || this._getPos(0,pHeight,this.options["start-pos"].top),
			btn = $(">.header>.maximize",this.element),
			nWidth = "100%",
			nHeight = "100%",
			nLeft = "0px",
			nTop = "0px";		
		if(!btn.hasClass("restore")){				
			nWidth = this.runtime.nWidth || parseInt(this.element.css("width"),10);
			nHeight = this.runtime.nHeight || parseInt(this.element.css("height"),10);
			nLeft = this.runtime.nLeft || this._getPos(nWidth,pWidth,position.left);
			nTop = this.runtime.nTop || this._getPos(nHeight,pHeight,position.top);
			nWidth+="px";
			nHeight+="px";
		}		
		//存储原始信息
		this.runtime.oLeft = oLeft;
		this.runtime.oTop = oTop;
		
		//如果存在模态设置
		if(options.modal){
			if(!this.modalLayer){
				this.element.before(this.modalLayer=$("<div class='dialog-modal'></div>"));
				if(options.fixed2body){
					this.modalLayer.css("position","fixed");
				}
			}
			this.modalLayer.show();
		}
		if(this.options.animation){
			//设置初始的状态
			this.element.css({
				width : "5px",
				height : "5px",
				left : oLeft,
				top : oTop ,
				display : "block"
			});
			this._fadeOut();

			this.element.animate({			
				width : nWidth,
				height : nHeight,
				left : nLeft,
				top : nTop
			},"fast",function(){
				self._fadeIn();
				if(self.options.reload || !self._loaded){
					self.load();
					self._loaded = true;
				}
			});
		}
		else{
			this.element.css({			
				width : nWidth,
				height : nHeight,
				left : nLeft,
				top : nTop,
				display : "block"
			});
			if(self.options.reload || !self._loaded){
				self.load();
				self._loaded = true;
			}
		}
		this.options.onOpen && this.options.onOpen()
	},
	//设置起始的元素
	setAnimateTarget: function(animateTarget){
		if(null!=animateTarget){
			if(typeof(animateTarget)=="string"){
				animateTarget=$(animateTarget);
			}
			this.animateTarget = animateTarget;
		}		
	},
	//获取弹出窗口的位置
	_getPos : function(num,pNum,pos){
		switch(pos){
			case "center" :				
				return Math.max(Math.ceil((pNum-num)/2),0)+"px";
			case "left" :
			case "top" :
				return "0px";
			case "right" :
			case "bottom" :				
				return (pNum-num)+"px";
			default :
				return pos;
		}
	},
	//隐藏窗口
	hide : function(callback){
		var self = this;
		var btn = $(">.header>.maximize",this.element);
		if(!btn.hasClass("restore")){
			this.runtime.nWidth = parseInt(this.element.css("width"),10);
			this.runtime.nHeight = parseInt(this.element.css("height"),10);
			this.runtime.nLeft = this.element.css("left");
			this.runtime.nTop = this.element.css("top");
		}		
		if(this.options.modal){		
			this.modalLayer.hide();
		}
		if(this.options.animation){
			this._fadeOut();
			var speOffset =this.getAnimateTargetOffset();
			this.element.animate({
				width : "5px",
				height : "5px",
				left : speOffset && (speOffset.left+"px") ||this.runtime.oLeft,
				top : speOffset && (speOffset.top+"px") ||this.runtime.oTop
			},"fast",function(){
				self.element.hide();
				callback.call(self);
			});	
		}
		else{
			this.element.hide();
			callback.call(self);
		}
	},
	//最小化
	minimize: function(){
		this.hide(function(){
			this.options.onMinimize && this.options.onMinimize();
		});	
	},
	//关闭
	close: function(){
		this.hide(function(){
			this.options.onClose && this.options.onClose();
		});		
	},
	//加载数据
	load : function(){
		var options = this.options,
			element = this.element,
			content = $(">.body>.content",element),
			height = element.height(),
			self = this;			
		$(">.body",element).height(height - 30);	
		content.empty();
		
		this.loadContext({
			context : content,
			html : options.html,
			node : options.node,
			get : options.get,			
			url : options.url,
			pattern : options.pattern,
			parameters : options.parameters,
		    complete : function(){
				options.onload && options.onload();
				self.suitoffset();
			}
		});			
	},
	//自适应内容高度和宽度
	suitoffset : function(){
		var options = this.options;
		if(!options.suitable){
			this.resize();
			return;
		}
		var content = $(">.body>.content",this.element), 
			iframe = $(">iframe",content), 
			width =0 ,
			height = 0;
		//如果是iframe
		if(iframe.length>0){
			var children = $(iframe[0].contentWindow.document.body).children();
			$.each(children,function(index,c){
				c = $(c);
				width = Math.max(width,c.width());
				height += c.height();
			});
		}
		else{
			content.css({
				width : "auto",
				height : "auto",
				overflow : "hidden"
			});
			width = content.width();
			height = content.height();
			content.css({
				width : "100%",
				height : "100%",
				overflow : "visible"
			});
		}
		width = Math.max(width,options.minWidth -30);
		height = Math.max(height,options.minHeight -10);
		this.element.css({
			width: (width + 10)+"px",
			height: (height + 30)+"px"
		});
		$(">.body",this.element).height(height);	
	},
	destroy : function(){
		this.modalLayer && this.modalLayer.remove();
	}
});
})(jQuery);