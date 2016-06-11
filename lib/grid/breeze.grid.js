/*
 * Balancebeam Widget Grid 1.0
 *
 * Description : Support the massive data and plug-ins
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

 $.widget("ui.grid", $.ui.container,{
	options: {
		//是否百分比表格
		percentage : false,
		//高度
		height : "260px",
		//宽度
		width : "700px",
		//默认列宽，单位px
		columnWidth : 200,
		//默认行高，单位px
		rowHeight : 21,
		//默认表头高度，单位px 
		headerHeight : 25,
		//布局定义
		layout : [],
		//数据源
		dataProvider : [],
		//是否隐藏表头
		untitled : false,
		//是否有边框
		noborder : false,
		//插件
		plugins : {
			scroller : true
		}		
	},
	//滚动条的占位大小
	scrollerOffset : 17,
	//渲染表格
	render : function() {
		/**
		 * running 运行期所需的数据结构
		 * @param dataProvider 数据集合
		 * 	   [{d : {},s : true,o :{},t : 1},{d : {},s : true,o :{},t : 1}]
		 * 		d : 数据对象引用
		 * 		s : 选择状态
		 *     t : 行状态(更新、新增、普通)
		 *     o : 修改过的字段
		 * @param lockedRowDataProvider 锁定数据集合
		 * @param filterProvider 过滤数据集合
		 * @param layout 展现结构
		 * @param playout 扩展的展现结构
		 * @param lockedRowRowPosition锁定行位置
		 */
		var options = this.options,
			runtime = this.runtime = {
				layout : [],
				playout : [],
				nlayout : [],
				dataProvider : [],
				filterProvider : [],
				lockedRowDataProvider : [],
				lockedRowPosition : "bottom"
			};
			
		//定义数据结构
		var dp = runtime["dataProvider"];
		for(var i=0,dataProvider=options.dataProvider,d;d =dataProvider[i];i++){
			dp.push({d : d});
		}
		//定义视图
		this.views = [];
		//定义主题
		this._topics = {};
		//定义插件集合
		this.pluginInstances = {};
		//定义表格结构
		var element = this.element,
			html = [];
		html.push("<div class='breeze-grid'>");
		html.push("<div class='headers'></div>");
		html.push("<div class='contents'></div>");
		html.push("</div>");
		element.css("overflow","hidden");
		element.html(html.join(""));
		this.gridElement = $(">.breeze-grid",element);
		this.options.noborder && this.gridElement.css("border","0");
		this.headersNode = $(">.headers",this.gridElement);
		//隐藏表头
		if(this.options.untitled){
			this.headersNode.css("display","none");
		}
		this.contentsNode = $(">.contents",this.gridElement);		
		//初始化plugins
		var classes = $.ui.grid.plugins.classes,
			plugins = this.options.plugins;
		for(var name in classes){
			if(!plugins[name]){
				continue;
			}
			var clazz = classes[name]; 			
			this.pluginInstances[name] = new clazz(this,plugins[name]);
		 };
		//创建显示视图
		this.createViews();
	},
	//创建视图
	createViews : function(){
		while(this.views.length){
			this.views.pop().destroy();
		}
		var runtime = this.runtime;
		runtime.layout = [];
		//定义有效的展现列
		for(var i=0,vl;vl=this.options.layout[i];i++){
			var t1 = [];
			for(var j=0,cls;cls = vl[j];j++){
				var t2 = [];
				for(var k=0,cl;cl = cls[k];k++){
					true!=cl.hidden && t2.push(cl);
				}
				t2.length && t1.push(t2);
			}
			t1.length && runtime.layout.push(t1);
		};
		var layout = runtime.layout,
			nlayout = runtime.nlayout,
			playout = runtime.playout;
			
		if(nlayout.length>0){
			Array.prototype.unshift.apply(layout[0][layout[0].length-1],nlayout);
		}
		if(playout.length>0){
			layout.unshift([playout]);
		}
		var l = layout.length - 1;
		for(var i=0;i<l;i++){
			var view = new $.ui.grid.view(this,layout[i],true);
			this.views.push(view);
		}
		this.views.push(this.normalView = new $.ui.grid.view(this,layout[l],false));
		//发布创建视图的事件
		this.publish("createView",[this.views]);
	},
	//获取列的信息
	getColumnMarkup : function(element){
		var idx = Number(element.attr("idx")),
			header = element.parents(".header")[0],
			viewIndex = $(">.header",this.headersNode).index(header),
			view = this.views[viewIndex];
		return	{
			idx : idx,
			view : view ,
			layoutIndex : viewIndex  + this.options.layout.length - this.runtime.layout.length,
			element : element,
			column : view.columns[idx]
		};
	},	
	//改变大小
	resize : function(wr){
		//防止固定的表格充分执行window的onresize操作	
		if(true==wr 
			&& this._hasResized
			&& !/%/.test(String(this.options.width)) 
			&& !/%/.test(String(this.options.height))){
			return;
		}
		this._hasResized = true;
		var element = this.element,
			gridElement = this.gridElement,
			options = this.options,
			height = element.height()-(options.noborder?0:2),
			width = element.width()-(options.noborder?0:2),
			self = this,
			headerNodeHeight = this.normalView.layout.length * options.headerHeight;
		gridElement.width(width);
		gridElement.height(height);
		//减去其他节点高度
		var extendsHeight = 0;
		$.each(gridElement.children(),function(index,elem){
			if(self.headersNode[0]!=elem 
					&& self.contentsNode[0]!=elem){
				extendsHeight+= elem.offsetHeight;
			}
		});
		height = height - extendsHeight;
		//如果是自动高度
		if("auto"==options.height){
			height = (this.runtime.dataProvider.length + this.runtime.lockedRowDataProvider.length)* options.rowHeight;
			var h = height + extendsHeight + (!options.untitled ? (headerNodeHeight+1) : 0);
			gridElement.height(h);
			element.height(h+2);
		}
		else{
			//当显示表头时计算view的高度
			if(!options.untitled){
				height = height - headerNodeHeight-1; //1像素的边框
			}
		}
		//如果是自动宽度
		if("auto"==options.width){
			//此时不能是百分比表格
			options.percentage = false;
			width = 0;
			for (var i = 0, view; view = this.views[i]; i++) {
				width+= view.getHeaderTableWidth();
			}
			gridElement.width(width);
			element.width(width+2);
		}
		this.headersNode.height(headerNodeHeight);
		this.contentsNode.height(height);
		//设置滚动条的宽高
		var xscrollerWidth = width,
			yscrollerHeight = height;

		//调整各视图大小
		for (var i = 0,position = 0, view; view = this.views[i]; i++) {    		
    		view.setLeftPosition(position);
    		view.setHeaderNodeHeight(headerNodeHeight);
    		if(view.noscroll){
				var w = view.getHeaderTableWidth();
				position += w;
    			width= width - w;
    			view.resize(w,height);
    			//最后一个锁定视图
    			if(this.views.length-2 == i){
    				view.headerNode.addClass("splitter");
    				view.contentNode.addClass("splitter");
    			}
    			continue;
    		}
    		view.resize(width,height);
    	}
		//设置锁定视图的高度
		var viewport = this.normalView.viewport;
		for (var i = 0, view; view = this.views[i]; i++) {    		
    		if(view.noscroll){
    			var h = viewport.contentHeight;
    			view.contentNode.height(view.viewport.contentHeight = h);
    			h = viewport.height;
    			view.viewportNode.height(view.viewport.height = h);
    		}
    	}
		//发布grid的resize事件
		this.publish("resize",[xscrollerWidth,yscrollerHeight]);
		//执行渲染
		this.doYScroll();
	},
	//执行纵向滚动操作
	doYScroll : function(){
		var viewport = this.normalView.viewport;
		this.publish("renderContent",[viewport]);
		for (var i = 0, view; view = this.views[i]; i++) {    		
			var vp = view.viewport;
			vp.beginRowIndex = viewport.beginRowIndex;
			vp.visibleRows = viewport.visibleRows;
			vp.endRowEdge = viewport.endRowEdge;
			view.renderContent();
		}
		if(viewport.endRowEdge){
			//发布事件
			this.publish("endRowEdge");
		}
	},
	//发布消息
	publish : function(topic,args){
		/**
		 * grid.publish("headerClick",["1","2"]);
		 */
		$.each(this._topics[topic] || [],function(index,method){
			method.apply(null,args || []);
		});
	},
	//订阅消息
	subscribe : function(topic,context,method){
		/**
		 * grid.subscribe("headerClick.uniqid",null,function(){});
		 */
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
		/**
		 * grid.unsubscribe("headerClick.uniqid");
		 */
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
	},
	//获取插件实例
	getPlugin : function(name){
		return this.pluginInstances[name];
	},
	//销毁
	destroy : function(){
		for(var name in this.pluginInstances){
			this.pluginInstances[name].destroy && this.pluginInstances[name].destroy();
		}
		delete this._topics;
		delete this.views;
		this.element.html("");
	},
	//刷新表格
	refresh : function(){
		var viewport = this.normalView.viewport,
			beginRowIndex = viewport.beginRowIndex,
			beginCellIndex = viewport.beginCellIndex;
		this.createViews();
		viewport = this.normalView.viewport;
		viewport.beginRowIndex = beginRowIndex;
		viewport.beginCellIndex = beginCellIndex;
		this.resize();
	},
	setDataProvider : function(dataProvider){
		this.runtime.filterProvider = [];
		this.runtime.dataProvider = [];
		var dp = this.runtime.dataProvider;
		for(var i=0,d;d =dataProvider[i];i++){
			dp.push({d : d});
		}
		if(this.normalView){
			this.normalView.resetViewport();
			this.resize();
		} 
	},
	//事件代理
	funnelEvents : function(){
		var self = this;
		this.element.click(function(e){
			self.switchEvent(e,"click");
		});
	},
	//装饰Event对象
	decoratedEvent : function(e){
		return e;
	},
	//转发事件
	switchEvent  : function(e,type){
		var target = $(e.target),
			bbEvts = target.attr("bbEvents");
		if(null!=bbEvts){
			var events = {},
				t1 = bbEvts.split(";");
			for(var i=0,t2;t2 = t1[i];i++){
				var t3 = t2.split(":");
				events[t3[0]] = t3[1];
			}
			if(type in events){
				this.publish(events[type],[this.decoratedEvent(e)]);
			}
		}
	}
});

/**
 * Grid 视图定义（locked/normal）
 * @author yangzz
 * @version 1.0
 * @private
 * @param grid Grid对象引用
 * @param layout 视图的布局信息
 * @param noscroll 锁定或非锁定
 */
$.ui.grid.view = function(grid,layout,noscroll){
	 this.grid = grid;
	 this.layout = layout;
	 this.columns = [];
	 for(var i=0;layout[i];i++){
		 for(var j=0,column;column=layout[i][j];j++){
			 !column.multiTitle &&  this.columns.push(column);
		 }
	 }
	 this.noscroll = noscroll;
	 this._create();
 }
$.ui.grid.view.prototype = {
	 //创建view视图
	_create : function(){
		this.headerNode = $("<div class='header'></div>");
		this.grid.headersNode.append(this.headerNode);	
		this.contentNode =  $("<div class='content'></div>");
		if(this.noscroll){
			this.headerNode.addClass("locked");
			this.contentNode.addClass("locked");
		}
		this.viewportNode = $("<div class='viewport'></div>");
		this.contentNode.append(this.viewportNode);
		this.lockedRowViewportNode = $("<div class='viewport locked'></div>");
		this.contentNode.append(this.lockedRowViewportNode);
		if("bottom"==this.grid.runtime.lockedRowPosition){
			this.viewportNode.css("top","0px");
			this.lockedRowViewportNode.css("bottom","0px");
			this.lockedRowViewportNode.addClass("bottom");
		}
		else{
			this.viewportNode.css("bottom","0px");
			this.lockedRowViewportNode.css("top","0px");
			this.lockedRowViewportNode.addClass("top");
		}
		if(!this.grid.runtime.lockedRowDataProvider.length){
			this.lockedRowViewportNode.hide();
		}
		
		this.grid.contentsNode.append(this.contentNode);	
		this.resetViewport();
		//初始化viewport参数
		this.renderHeader();		
	},
	resetViewport : function(){
		this.viewport = {
				beginRowIndex : 0,
				beginColumnIndex : 0,
				endRowEdge : false,
				endColumnEdge : false
			};
	},
	//渲染表头
	renderHeader : function(){
		var html = [];
		html.push("<div class='inner' style='width:");
		html.push(this.getHeaderWidth());		
		html.push(";'>");
		html.push("<table  cellspacing='0' cellpadding='0'>");		
		html.push(this.getHeaderTableColgroup());
		html.push("<tbody>");
		
		for(var i=0,idx=0,columns;columns = this.layout[i];i++){
			html.push("<tr");
			if(this.layout.length-1 == i){
				html.push(" class='splitter'");
			}
			html.push(">");
			for(var j=0,l=columns.length-1,column;column = columns[j];j++){
				html.push("<th");
				if(column.colspan){
					html.push(" colspan='");
					html.push(column.colspan);
					html.push("'");
				}
				else if(column.rowspan){
					html.push(" rowspan='");
					html.push(column.rowspan);
					html.push("'");
				}
				html.push(">");
				html.push("<div class='th ");
				html.push(j==l ? "splitter " :"");				
				html.push(column.multiTitle ? "multi " : "");
				html.push(column["hclassName"] || "");
				html.push("' ");
				!column.multiTitle && html.push("idx="+idx++);
				html.push(">");
				if(column.formatHeader){
					html.push(column.formatHeader());
				}
				else{
					html.push(column.title);
				}
				html.push("</div>");
				html.push("</th>");				
			}
			html.push("</tr>");
		}
		html.push("</tbody>");
		html.push("</table>");
		html.push("</div>");
		this.headerNode.html(html.join(""));	
		this.grid.publish("renderHeader",[this]);
	},
	getHeaderWidth : function(){
		return (this.noscroll || !this.grid.options.percentage )? this.getHeaderTableWidth()+"px" : "100%";
	},
	//获取表头Colgroup信息
	getHeaderTableColgroup : function(){
		var unit = (this.noscroll || !this.grid.options.percentage ) ? "px" : "",
			html = ["<colgroup>"];
		for(var i=0,column;column = this.columns[i];i++){
			html.push("<col style='width:");
			html.push(column.width || this.grid.options.columnWidth);
			html.push(unit);
			html.push("'>");
		}
		html.push("</colgroup>");	
		return html.join("");
	},
	//获取表头的宽度
	getHeaderTableWidth : function(){
		var width = 0;
		for(var i=0,column;column = this.columns[i];i++){
			width += column.width || this.grid.options.columnWidth;			
		}
		return width;
	},
	renderContent : function(){
		this.renderViewport();
		this.renderLockedRowViewport();
		this.positionHeader();
	},
	positionHeader : function(){
		//调整表头的位置
		if(this.noscroll){ 
			return;
		}
		var endColumnEdge = this.viewport.endColumnEdge,
			left = endColumnEdge ? "auto" : -this.getScrollLeft() + "px",
			right = endColumnEdge ? "0" : "auto"; 
		
		$(">.inner",this.headerNode).css({
			"left" : left,
			"right" : right
		});
	},
	//渲染可视表格内容
	renderViewport : function(){
		var options = this.grid.options,
			dataProvider = this.grid.runtime.dataProvider,
			rowHeight = this.grid.options.rowHeight,			
			viewport = this.viewport,
			mergeColsMap =  this.grid.runtime.mergeColsMap || {},
			b = 0,
			html = [];
		if(!dataProvider.length){
			return;
		}
		if("top"==this.grid.runtime.lockedRowPosition){
			b = this.grid.runtime.lockedRowDataProvider.length %2;
		}
		html.push("<div class='inner' style='width:");
		html.push((this.noscroll || !options.percentage )? this.getViewportTableWidth()+"px" : "100%");	
		html.push(";");
		viewport.endRowEdge && html.push("bottom:0;");		
		viewport.endColumnEdge && html.push("right:0;");		
		html.push("'>");
		html.push("<table  cellspacing='0' cellpadding='0'>");		
		html.push(this.getViewportTableColgroup());
		html.push("<tbody>");
		for(var i=0,row;i<viewport.visibleRows;i++){
			html.push("<tr");
			html.push((b+i)%2 ? " class='odd'" : "");
			html.push(">");
			row = dataProvider[viewport.beginRowIndex + i]["d"];
			for(var j=0,column,l=viewport.visibleColumns-1,filedIndex;j<=l;j++){
				column =  this.columns[viewport.beginColumnIndex + j];
				filedIndex = column["filedIndex"];
				if(filedIndex in mergeColsMap){
					var rowspan = mergeColsMap[filedIndex][i];
					if(null==rowspan){
						continue;
					}
					html.push("<td rowspan='");
					html.push(rowspan);
					html.push("'>");
					html.push("<div style='height:"+(rowspan*rowHeight-1)+"px;line-height:"+(rowspan*rowHeight-1)+"px;' ");
				}
				else{
					html.push("<td>");
					html.push("<div ");
				}
				html.push("class='td ");
				html.push(j==l ? "splitter " :"");
				html.push(column["className"] || "");
				html.push("'>");
				if(column.format){
					if(null!=filedIndex){
						html.push(column.format(viewport.beginRowIndex+i,row[filedIndex])); 
					}
					else{
						html.push(column.format(viewport.beginRowIndex+i));
					}
				}
				else if(null!=filedIndex){
					html.push(row[filedIndex]);
				}	
				html.push("</div>");
				html.push("</td>");
			}
			html.push("</tr>");
		}
		html.push("</tbody>");
		html.push("</table>");
		html.push("</div>");
		this.viewportNode.html(html.join(""));
		
	},
	//渲染锁定行视图
	renderLockedRowViewport : function(){
		var options = this.grid.options,
			lockedRowDataProvider = this.grid.runtime.lockedRowDataProvider,
			viewport = this.viewport,
			b= 0,
			html = [];
		if(!lockedRowDataProvider.length) {
			return;
		}
		var splitter = lockedRowDataProvider.length -1;
		if("bottom"==this.grid.runtime.lockedRowPosition){
			b = viewport.visibleRows %2;
			splitter = 0;
		}
		html.push("<div class='inner' style='width:");
		html.push((this.noscroll || !options.percentage )? this.getViewportTableWidth()+"px" : "100%");	
		html.push(";");
		viewport.endColumnEdge && html.push("right:0;");		
		html.push("'>");
		html.push("<table cellspacing='0' cellpadding='0'>");		
		html.push(this.getViewportTableColgroup());
		html.push("<tbody>");
		for(var i=0,row;lockedRowDataProvider[i];i++){
			row = lockedRowDataProvider[i]["d"];
			html.push("<tr class='");
			html.push((b+i)%2 ? "odd " : "");
			if(splitter==i){
				html.push("splitter");
			}
			html.push("'>");
			for(var j=0,column,l=viewport.visibleColumns-1,filedIndex;j<=l;j++){
				column =  this.columns[viewport.beginColumnIndex + j];
				filedIndex = column["filedIndex"];
				html.push("<td>");
				html.push("<div class='td ");
				html.push(j==l ? "splitter " :"");
				html.push(column["className"] || "");
				html.push("'>");
				if(column.lockedRowFormat){
					if(null!=filedIndex){
						html.push(column.lockedRowFormat(i,row[filedIndex])); 
					}
					else{
						html.push(column.lockedRowFormat(i));
					}
				}
				else if(null!=filedIndex){
					html.push(row[filedIndex]);
				}	
				html.push("</div>");
				html.push("</td>");
			}
			html.push("</tr>");
		}
		html.push("</tbody>");
		html.push("</table>");
		html.push("</div>");
		this.lockedRowViewportNode.html(html.join(""));		
	},
	//渲染可视表格Colgroup
	getViewportTableColgroup : function(){
		var viewport = this.viewport,
			unit = (this.noscroll || !this.grid.options.percentage ) ? "px" : "",
			html = ["<colgroup>"];
		for(var i=0,column; i< viewport.visibleColumns;i++){
			column =  this.columns[viewport.beginColumnIndex + i];
			html.push("<col style='width:");
			html.push(column.width || this.grid.options.columnWidth);
			html.push(unit);
			html.push("'>");
		}
		html.push("</colgroup>");	
		return html.join("");
	},
	//渲染可视表格的宽度
	getViewportTableWidth : function(){
		var viewport = this.viewport,
			width = 0;
		for(var i=0,column; i< viewport.visibleColumns;i++){
			column =  this.columns[viewport.beginColumnIndex + i];			
			width += column.width || this.grid.options.columnWidth;
		}
		return width;
	},
	setLeftPosition : function(leftPosition){
		this.headerNode.css("left",leftPosition+"px");
		this.contentNode.css("left",leftPosition+"px");
	},
	setHeaderNodeHeight : function(height){
		this.headerNode.height(height);
	},
	//左边滚动的宽度
	getScrollLeft : function(){
		var w = 0;
		for(var i=0,column;i<this.viewport.beginColumnIndex;i++){
			column = this.columns[i];
			w += column.width || this.grid.options.columnWidth;			
		}
		return w;
	},
	//调整大小
	resize : function(width,height){
		var viewport = this.viewport,
			grid = this.grid,
			options = grid.options,
			scrollerOffset = grid.scrollerOffset,
			lockedRowHeight = grid.runtime.lockedRowDataProvider.length * options.rowHeight;
		//先计算锁定行高
		this.lockedRowViewportNode.height(lockedRowHeight);
		height = height - lockedRowHeight;
		if(width<= scrollerOffset){
			width = this.getHeaderTableWidth() + scrollerOffset+1;
		}
		height = height< scrollerOffset ? scrollerOffset : height+1;
		viewport.width = width;
		viewport.height = height;
		viewport.yscroller = false;
		viewport.xscroller = false;
		//先计算高度
		var rowCount = grid.runtime.dataProvider.length,
			rowHeight = options.rowHeight,
			rowsHeight = rowCount * rowHeight;
		viewport.rowCount = rowCount;
		viewport.rowHeight = rowHeight;
		viewport.rowsHeight = rowsHeight;
		//如果是锁定视图则不计算高度
		if(!this.noscroll && rowsHeight > height){
			viewport.yscroller = true;
			viewport.width = width - scrollerOffset;
		}
		//如果锁定视图或百分比表格
		viewport.visibleColumns = this.columns.length;
		if(!this.noscroll && !grid.options.percentage){
			//计算是否应该有横向滚动条
			var headerTableWidth = this.getHeaderTableWidth();
			viewport.headerTableWidth = headerTableWidth;
			//如果表头的宽度大于容器的宽度
			if(headerTableWidth > width){
				viewport.xscroller = true;
				var beginColumnIndex = viewport.beginColumnIndex,
					visibleTableWidth = 0;
				viewport.visibleColumns = 0;
				for(var i=beginColumnIndex,column;column = this.columns[i];i++){
					visibleTableWidth+=column.width || grid.options.columnWidth;
					viewport.visibleColumns ++;
					if(visibleTableWidth >= width){
						break;
					}
				}
				//判断beginColumnIndex的合法性
				for(;visibleTableWidth < width;){
					viewport.endColumnEdge = true;
					viewport.beginColumnIndex--;
					visibleTableWidth += this.columns[viewport.beginColumnIndex].width || grid.options.columnWidth;
					viewport.visibleColumns ++;
					if(0==viewport.beginColumnIndex) break;
				}
				viewport.height = height -scrollerOffset;
				//如果此时的还存在纵向滚动条的场景
				if(!viewport.yscroller){
					if(rowsHeight > viewport.height){
						//如果grid是自动的撑高度
						if("auto"==grid.options.height){
							viewport.height  = height;
							var h = parseInt(gridElement.css("height"),10)+scrollerOffset;
							grid.gridElement.height(h);
							grid.element.height(h+2);
							grid.contentsNode.height(parseInt(grid.contentsNode.css("height"),10)+scrollerOffset);
						}
						else{
							viewport.yscroller = true;
							viewport.width = width - scrollerOffset;
						}
					}
				}
			}
			else{
				if(viewport.yscroller){
					if(headerTableWidth + scrollerOffset > width){
						//如果grid是自动的撑宽度
						if("auto"==grid.options.width){
							viewport.width  = width;
							var w = parseInt(grid.gridElement.css("width"),10)+scrollerOffset;
							grid.gridElement.width(w);
							grid.element.width(w+2);
						}
						else{
							viewport.xscroller = true;
							viewport.height = height - scrollerOffset;
						}
					}
					else{
						viewport.endColumnEdge = false;
					}
				}
				else{
					viewport.endColumnEdge = false;
				}
			}
		}
		//非锁定视图再设置应该显示多少条记录
		if(!this.noscroll){
			//设置表头外层容器的宽度
			$(">.headers>.placeholder",grid.gridElement).remove();
			if(viewport.yscroller){
				var placeholder = $("<div class='placeholder'></div>");
				$(">.headers",grid.gridElement).append(placeholder);
			}
			this.headerNode.width(viewport.width);
			viewport.visibleRows = Math.min(Math.ceil(viewport.height / rowHeight),rowCount);
			viewport.endRowEdge = false;
			//考虑当前的beginRowIndex的合法性，可视的记录小于visibleRows，重新确定beginRowIndex			
			if(viewport.beginRowIndex + viewport.visibleRows > rowCount){
				viewport.beginRowIndex = rowCount - viewport.visibleRows;
				viewport.yscroller && (viewport.endRowEdge = true)
			}		

			//设置Viewport容器和滚动条的宽高
			viewport.contentHeight = viewport.height + lockedRowHeight;
			this.viewportNode.height(viewport.height);
			this.contentNode.css({
				"width": viewport.width+"px",
				"height" : viewport.contentHeight +"px"
			});
		}
		else{
			var w = parseInt(grid.gridElement.css("width"),10);
			if(width>w) {
				width = w-scrollerOffset;
			}
			this.headerNode.width(width);
			this.contentNode.width(width);
		}	
		this.positionHeader();		
	},
	destroy : function(){
		this.headerNode.remove();
		this.contentNode.remove();
	}
}; 

 /**
  * 定义Grid扩展插件
  * @author yangzz
  * @version 1.0
  */
 $.ui.grid.plugins = new function(){
	 this.classes = {};
	 this.register = function(name,clazz){
		 this.classes[name] = clazz;
	 };
 }();
 
})(jQuery);
