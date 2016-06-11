/*
 * Balancebeam Widget BorderLayout 1.0
 *
 * Description : Support position layout
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
	 
 $.widget("ui.borderlayout",$.ui.container, {
	options: {
		//默认高度
		height : "100%",
		//默认方位容器的宽高
		defaultRect : 150,
		//布局定义
		regions : [ {region: 'center'} ]
	},
	//渲染layout容器
	render : function(){
		var options = this.options,
			self = this,
			fragment = document.createDocumentFragment();
		//设置borderlayout的样式定义
		this.element.addClass("breeze-borderlayout");		
		var viewport =this.viewport= $("<div class='region-viewport'></div>");
		fragment.appendChild(viewport[0]);
		//渲染方位容器
		$.each(options.regions,function(index,data){
			switch(data.region){
				case "north" : 
					data.height = data.height || self.options.defaultRect;
					var element = self.generateRegionElement(data)
						.addClass("y-region")
						.addClass("north-region")
						.attr("region","north");
					viewport.before(element);
					self.northRegion = {
						element : element,
						data : data
					}
					if(data.split){
						var splitter = self.generateSplitterElement(data)
							.addClass("y-splitter")
							.addClass("north-splitter")
							.attr("region","north");
						viewport.before(splitter);
						self.northRegion.splitter = splitter;
					}
					self.load(data,element);
					break;
				case "south" :
					data.height = data.height || self.options.defaultRect;
					var element = self.generateRegionElement(data)
						.addClass("y-region")
						.addClass("south-region")
						.attr("region","south");
					viewport.after(element);
					self.southRegion = {
						element : element,
						splitter : splitter,
						data : data
					}
					if(data.split){
						var splitter = self.generateSplitterElement(data)
							.addClass("y-splitter")
							.addClass("south-splitter")
							.attr("region","south");
						viewport.after(splitter);
						self.southRegion.splitter = splitter;
					}
					self.load(data,element);
					break;
				case "west" : 
					data.width = data.width || self.options.defaultRect;
					var element = self.generateRegionElement(data)
						.addClass("x-region")
						.addClass("west-region")
						.attr("region","west");
					viewport.prepend(element);
					self.westRegion = {
						element : element,
						splitter : splitter,
						data : data
					}
					if(data.split){
						var splitter = self.generateSplitterElement(data)
							.addClass("x-splitter")
							.addClass("west-splitter")
							.attr("region","west");
						element.after(splitter);
						self.westRegion.splitter = splitter;
					}
					self.load(data,element);
					break;
				case "east" :
					data.width = data.width || self.options.defaultRect;
					var element = self.generateRegionElement(data)
						.addClass("x-region")
						.addClass("east-region")
						.attr("region","east");
					viewport.append(element);
					self.eastRegion = {
						element : element,
						data : data
					}
					if(data.split){
						var splitter = self.generateSplitterElement(data)
							.addClass("x-splitter")
							.addClass("east-splitter")
							.attr("region","east");
						element.before(splitter);
						self.eastRegion.splitter = splitter;
					}
					self.load(data,element);
					break;
				case "center" : 
					var element = self.generateRegionElement(data)
						.addClass("x-region")
						.addClass("center-region")
						.attr("region","center");
					viewport.append(element);
					self.centerRegion = {
						element : element,
						data : data
					}
					self.load(data,element);
					break;
			}
		});
		this.element.append(fragment);
	},	
	//生成方位DOM对象
	generateRegionElement : function(data){
		var element = $("<div><div class='region-header'><div class='region-collapse'></div><div class='region-title'></div></div><div class='region-body'></div></div>");
		//设置标题
		$(">.region-header>.region-title",element).html(data.title);
		//如果不可以合拢操作
		!data.collapsible && element.addClass("no-collapse");
		//隐藏表头
		data.untitled && element.addClass("untitled");
		//如果初始化时合拢的
		data.collapsed && element.addClass("collapsed");
		//设置overflow
		data.overflow && $(">.region-body",element).css("overflow",data.overflow);
		return element;
	},
	//生成分隔DOM对象
	generateSplitterElement : function(data){
		var splitter = $("<div><div class='region-collapse'></div></div>");
		//如果不可以合拢操作
		!data.collapsible && splitter.addClass("no-collapse");
		//如果初始化时合拢的
		data.collapsed && splitter.addClass("collapsed");
		//如果可以拖动
		data.draggable && splitter.addClass("draggable");
		return splitter;
	},
	//加载数据
	load : function(data,element){
		this.loadContext({
			context : $(">.region-body",element),
			html : data.html,
			node : data.node,
			get : data.get,			
			url : data.url,
			pattern : data.pattern,
			parameters : data.parameters,
		    complete : data.onload
		});		
	},
	//绑定事件
	funnelEvents : function(){
		var self = this;
		this.element.click(function(e){		
			var target = $(e.target);
			if(target.hasClass("region-collapse")){
				breeze.stopEvent(e);
				//不是本Layout容器中的元素
				var region = self.getRegionByElement(e.target),
					data = region.data;
				if(region){
					var type = ("north"==data.region || "south"==data.region) ? "height" : "width";
					if(region.data.collapsed){
						region.element.removeClass("collapsed");
						region.splitter && region.splitter.removeClass("collapsed");
						region.data.collapsed = false;
						region.element.show();
						self.animateCollapse(region.element,data[type],type,function(){
							self.resize();
						});
					}
					else{
						switch(data.region){
							case "north" : 
								var top = 5+(!data.untitled?26:0);
								if(region.splitter){
									region.splitter.css("top",top+"px");
									top+=5;
								}
								self.viewport.css("top",top+"px");
								break;
							case "south" :
								var bottom = 5+(!data.untitled?26:0);
								if(region.splitter){
									region.splitter.css("bottom",bottom+"px");
									bottom+=5;
								}
								self.viewport.css("bottom",bottom+"px");
								break;
							case "west" :
								var left = 5+(!data.untitled?26:0);
								if(region.splitter){
									region.splitter.css("left",left+"px");
									left+=5;
								}
								self.centerRegion.element.css("left",left+"px");
								break;
							case "east" :
								var right = 5+(!data.untitled?26:0);
								if(region.splitter){
									region.splitter.css("right",right+"px");
									right+=5;
								}
								self.centerRegion.element.css("right",right+"px");
								break;
						}
						self.animateCollapse(region.element,(!data.untitled?26:0),type,function(){
							region.data.collapsed = true;
							region.element.addClass("collapsed");
							region.splitter && region.splitter.addClass("collapsed");
							self.resize();
						});
					}
				}
			}
		}).mousedown(function(e){
			var target = $(e.target);
			if(target.hasClass("y-splitter") || target.hasClass("x-splitter")){
				var region = self.getRegionByElement(e.target);
				if(region){ 
					var data = region.data;
					if(data.draggable && !data.collapsed){
						var data = region.data,splitter=region.splitter,type,client$,desc$,asc$,loc$,distance = 0,region;
						switch(region=region.data.region){
							case "north" : 
								desc$ = data.height;
								asc$ = self.centerRegion.element.height();
								client$ = e.clientY;
								type = "top";
								break;
							case "south" : 
								desc$ = self.centerRegion.element.height();
								asc$ = data.height;
								client$ = e.clientY;
								type = "top";
								break;
							case "west" :
								desc$ = data.width;
								asc$ = self.centerRegion.element.width();
								client$ = e.clientX;
								type = "left";
								break;
							case "east" :
								desc$ = self.centerRegion.element.width();
								asc$ = data.width;
								client$ = e.clientX;
								type = "left";
								break;
						}
						loc$ = parseInt(splitter.css(type),10);
						splitter.addClass("dragging");				
						document.attachEvent && document.body.setCapture();
						function mousemove(e){
							distance = ("top"==type ? e.clientY : e.clientX) -  client$;
							if(distance<0){
								Math.abs(distance)+50>desc$ && (distance = 50-desc$);
							}
							else{
								distance+50>asc$ && (distance = asc$-50);
							}
							splitter.css(type,(loc$ + distance)+"px");
						}
						function mouseup(){
							document.attachEvent && document.body.releaseCapture();
							$(document).unbind("mousemove",mousemove);
							$(document).unbind("mouseup",mouseup);
							switch(region){
								case "north":
									data["height"]+=distance;
									break;
								case "south":
									data["height"]-=distance;
									splitter.css("top","auto");
									break;
								case "west":
									data["width"]+=distance;
									break;
								case "east":
									data["width"]-=distance;
									splitter.css("left","auto");
									break;
							}
							splitter.removeClass("dragging");							
							self.resize();
						}
						$(document).bind("mousemove",mousemove);
						$(document).bind("mouseup",mouseup);
					}
				}
			}
		});
	},
	animateCollapse : function(element,val,type,complete){
		var animates = {};
		element.css("zIndex","2");
		animates[type] = val+"px";
		element.animate(animates,"fast",function(){
			complete();
			element.css("zIndex","auto");
		});
	},
	getRegionByElement : function(node){
		var nodes = [],regionName = "";
		while(this.element[0]!=node){
			nodes.unshift(node);
			node = node.parentNode;
		}
		while(nodes.length){
			if(null!=(regionName=$(nodes[0]).attr("region"))){
				if(!$(nodes[1]).hasClass("region-body"))
				return this[regionName+"Region"];
			}
			nodes.shift();
		}
		return null;
	},
	resize : function(wr){
		this.resize0();
		$.each(this.getChildren(),function(index,child){
			child.resize(wr);
		});
	},
	resize0 : function(){
		var region = null,
			top = 5,
			bottom=5;
		//如果存在北向容器
		if(region = this.northRegion){
			var data = region.data,
				collapsed = data.collapsed,
				untitled = data.untitled,
				h = 0;
			if(untitled && collapsed){
				region.element.css("display","none");
			}
			else{
				h = collapsed ? 26 : data.height;
				region.element.css({
					display : "block",
					top : top+"px",					
					height : h+"px"
				});
				top+=h;
			}
			//计算splitter
			if(data.split){
				region.splitter.css("top",top+"px");
				top+=5;
			}
		}
		//如果存在南向容器
		if(region = this.southRegion){
			var data = region.data,
				collapsed = data.collapsed,
				untitled = data.untitled,
				h = 0;
			if(untitled && collapsed){
				region.element.css("display","none");
			}
			else{
				h = collapsed ? 26 : data.height;
				region.element.css({
					display : "block",
					bottom : bottom+"px",
					height : h+"px"
				});
				bottom+=h;
			}
			//计算splitter
			if(data.split){
				region.splitter.css("bottom", bottom+"px");
				bottom+=5;
			}
		}
		//设置Viewport的高度、宽度和位置
		this.viewport.css({
			top : (top || 5)+"px",
			bottom : (bottom || 5)+"px"			
		});
		var left= 5,
			right= 5;
		//如果存在西向容器
		if(region = this.westRegion){
			var data = region.data,
				collapsed = data.collapsed,
				untitled = data.untitled,
				w = 0;
			if(untitled && collapsed){
				region.element.css("display","none");
			}
			else{
				w = collapsed ? 26 : data.width;
				region.element.css({
					display : "block",
					left : left+"px",
					width : w+"px"
				});
				left+=w;
			}
			//计算splitter
			if(data.split){
				region.splitter.css("left" , left+"px");
				left+=5;
			}
		}	
		//如果存在东向容器
		if(region = this.eastRegion){
			var data = region.data,
				collapsed = data.collapsed,
				untitled = data.untitled,
				w=0;
			if(untitled && collapsed){
				region.element.css("display","none");
			}
			else{
				w = collapsed ? 26 : data.width;
				region.element.css({
					display : "block",
					right : right+"px",
					width : w+"px"
				});
				right+=w;
			}
			//计算splitter
			if(data.split){
				region.splitter.css("right", right+"px");
				right+=5;
			}
		}
		//设置中间容器的宽度和位置
		if(region=this.centerRegion){
			region.element.css({
				left : left +"px",
				right: right+"px"
			});
		}	
	}
});
})(jQuery);