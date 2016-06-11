/*
 * Balancebeam Widget Accordion 1.0
 *
 * Description : Support Accordion style menu
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
 
 $.widget("ui.accordion", $.ui.container,{
	options: {
		//定义元数据
		metadata : {
			//唯一标识字段
			id : "id", 
			//标题字段
			title : "title", 
			//选择字段
			selected : "selected", 
			 //参数字段
			parameters : "parameters",
			//图标字段
			iconURL : "iconURL",
			//指定html片段
			html : "html",
			//指定dom节点
			node : "node",
			//回调方法
			get : "get",
			//连接地址			
			url : "url",			
			//加载方式
			pattern : "pattern" 
		},	
		height : "100%",		
		//菜单表头高度
		headerHeight : 26,
		//没有外边框
		noborder : false,
		//数据源
		dataProvider : [],
		//加载数据回调
		loadItem : null
	},
	render : function() {	
		//创建展现节点
		var element = this.element,
			fragment = document.createDocumentFragment(),
			options = this.options,
			metadata = options.metadata,
			selectedIndex = 0,
			dataProvider = options.dataProvider,
			lastIndex = dataProvider.length-1,
			self = this;
		element.addClass("breeze-accordion");	
		options.noborder && element.addClass("accordion-noborder");	
		$.each(dataProvider,function(index,item){
			var itemElement = $("<div class='accordion-item'></div>"),
				html = ["<div class='accordion-header'>"];
				html.push(self.getItemIcon(item));
				html.push("<div class='accordion-collapse'></div>");
				html.push("<div class='accordion-title'>");
				html.push(item[metadata.title]);
				html.push("</div>");
				html.push("<div style='clear:both;'></div>");
				html.push("</div>");
			itemElement
				.append($(html.join("")).height(options.headerHeight-11))
				.append($("<div class='accordion-body'></div>"));
			if(0==index){
				itemElement.addClass("accordion-item-firstchild");
			}
			else if(index==lastIndex){
				itemElement.addClass("accordion-item-lastchild");
			}
			fragment.appendChild(itemElement[0]);			
			if(item[metadata.selected] ){
				selectedIndex = index;
			}
		});
		//选中展开指定节点		
		element.append(fragment);
		if(dataProvider.length){
			$($(">.accordion-item",element).get(selectedIndex)).addClass("collapsed");
			this.load(selectedIndex);
		}
	},
	//菜单项的图标标识
	getItemIcon : function(item){
		var iconURL = this.options.metadata.iconURL;
		if(item[iconURL]){
			return "<img class='accordion-icon' src='" + item[iconURL] + "'></img>";
		}
		return "";
	},
	//初始化指定项中的内容
	load : function(index){
		var element = $($(">.accordion-item",this.element).get(index));
		//已经加载过就直接返回	
		if(element.attr("loaded")){
			this.resize2();
			return;
		}
		//设置加载过标识
		element.attr("loaded",true);
		var metadata = this.options.metadata,
			index = $(">.accordion-item",this.element).index(element),
			item = this.options.dataProvider[index],
			loadItem =this.options.loadItem,
			self = this;
		if(!jQuery.isFunction(loadItem)){			
			this.loadContext({
				context : $(">.accordion-body",element),
				html : item[metadata.html],
				node : item[metadata.node],
				get : item[metadata.get],			
				url : item[metadata.url],
				pattern : item[metadata.pattern],
				parameters : item[metadata.parameters],
				complete : function(){self.resize2();}
			});	
		}
		else{
			loadItem(item,function(node){				
				$(">.accordion-body",element).append(node || document.createTextNode("&nbsp;"));
			});
		}
	},	
	//改变大小
	resize : function(){
		this.resize0();
		this.resize1();		
		this.resize2();	
	},
	//确定宽高
	resize0 : function(){
		var options = this.options;
		this.collapsedItemHeight = this.element.height() - (options.headerHeight-1) * (options.dataProvider.length-1) -1;
	},
	//调整各容器显示状态
	resize1 : function(){
		var self = this,
			top = 0;
		$.each($(">.accordion-item",this.element),function(){
			var element = $(this);
			element.css("top",top+"px");
			if(element.hasClass("collapsed")){
				element.height(self.collapsedItemHeight+(element.hasClass("accordion-item-lastchild") && 1 ||0));
				top+=self.collapsedItemHeight;
			}
			else{
				element.height(self.options.headerHeight);
				top+=self.options.headerHeight-1;
			}
		});
	},
	//调整显示的子容器大小
	resize2 : function(){
		$.each(this.getChildren($(">.collapsed",this.element),function(index,child){
			child.resize();
		}));
	},
	//绑定事件
	funnelEvents : function(){
		var self = this;
		this.element.click(function(e){		
			var element = $(e.target),
				elems = [];			
			while(element[0]!=self.element[0]){
				elems.unshift(element);
				element = element.parent();
			}
			element =elems[1];
			if(element && element.hasClass("accordion-header")){
				self.toggle(element.parent());
			}
		});
	},
	//展开某个菜单项
	toggle : function(element){
		if(element.hasClass("collapsed")){
			var neighbor = element.next();
			if(neighbor[0]){
				this.toggle(neighbor);
			}
			else{
				neighbor = element.prev();
				if(neighbor[0]){
					this.toggle(neighbor);
				}
			}
			return;
		} 
		var selectedELement = $(">.collapsed",this.element),
			elements = $(">.accordion-item",this.element),
			oIndex = elements.index(selectedELement),
			nIndex = elements.index(element),
			self = this,
			step=Math.floor(this.collapsedItemHeight/10),
			begin,end,asc=1,top,distance=0;
		selectedELement.removeClass("collapsed");
		element.addClass("collapsed");	
		if(oIndex>nIndex){
			begin = nIndex+1;
			end = oIndex;
		}
		else{
			begin = oIndex+1;
			end = nIndex;
			asc=-1;
		}
		top = parseInt($(elements[begin]).css("top"),10);
		var h = self.collapsedItemHeight -26- (asc!=1 ? 0 : (end-begin+1)*26),
			selectedELementHeight = selectedELement.height();
		(function(){
			var func = arguments.callee;
			distance+=asc*step;				
			if(Math.abs(distance)<h){			
				for(var i=begin;i<=end;i++){
					$(elements[i]).css("top",(top+distance+25*(i-begin))+"px");
				}
				var h1 = Math.abs(distance);
				selectedELement.height(selectedELementHeight-h1);
				element.height(h1+26);
				setTimeout(func,10);
				return;
			}
			self.resize1();
			self.load(nIndex);
		})();
	},
	//显示某菜单项
	showItem : function(index){
		this.toggle($(">.accordion-item",this.element)[index]);
	}	
 });
 
 })(jQuery);
