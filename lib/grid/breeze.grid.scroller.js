/*
 * Balancebeam Widget Grid_Plugin_Scroller 1.0
 *
 * Description : Support drag head for exchange columns
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 * 		balancebeam/lib/widget/grid/beam.grid.js
 */

(function( $, undefined ) {
 
$.ui.grid.scroller = function(grid){
	 this.grid = grid;
	 this._create();
 }
$.ui.grid.scroller.prototype = {
	_create : function(){
		var grid = this.grid,
			contentsNode = grid.contentsNode;
		//define vertical scroller element
		var html = [];
		html.push("<div class='y-scroller'>");
		html.push("<div class='top'></div>");
		html.push("<div class='bottom'></div>");
		html.push("<div class='bar'>");
		html.push("<div class='bar-up'></div>");
		html.push("<div class='bar-tumble'></div>");
		html.push("<div class='bar-down'></div>");
		html.push("</div>");
		html.push("</div>");
		this.yscrollerNode = $(html.join(""));
		$("*",this.yscrollerNode).attr("UNSELECTABLE","on");
		this.yscrollerBarNode = $(">.bar",this.yscrollerNode);
		contentsNode.append(this.yscrollerNode);		
		//define horizontal scroller element
		html = [];
		html.push("<div class='x-scroller'>");
		html.push("<div class='left'></div>");
		html.push("<div class='right'></div>");
		html.push("<div class='bar'>");
		html.push("<div class='bar-up'></div>");
		html.push("<div class='bar-tumble'></div>");
		html.push("<div class='bar-down'></div>");
		html.push("</div>");
		html.push("</div>");
		this.xscrollerNode = $(html.join(""));
		$("*",this.xscrollerNode).attr("UNSELECTABLE","on");
		this.xscrollerBarNode = $(">.bar",this.xscrollerNode);
		contentsNode.append(this.xscrollerNode);	
		this.funnelEvents();
		grid.subscribe("resize.grid-scroller",this,"resize");
	},
	//bind event
	funnelEvents : function(){
		var self = this;
		//bind event
		this.yscrollerNode.mousedown(function(e){
			breeze.stopEvent(e);
			var target = e.target;
			switch(target.className){
				case "top" :
					self.scrollToTop(1);
					break;
				case "bottom" :
					self.scrollToBottom(1);
					break;
				case "y-scroller" :
					//TODO
					break;
				default : 
					if(/^bar/.test(target.className)){
						self.scrollMoveY(e);
					}
			}
		});
		this.xscrollerNode.mousedown(function(e){
			breeze.stopEvent(e);
			var target = e.target;
			switch(target.className){
				case "left" :
					self.scrollToLeft();
					break;
				case "right" :
					self.scrollToRight();
					break;
				case "x-scroller" :
					//TODO
					break;
				default : 
					if(/^bar/.test(target.className)){
						self.scrollMoveX(e);
					}
				}
		});	
		//定义鼠标的滚轮事件
			this.grid.contentsNode.bind(
				document.addEventListener ? "DOMMouseScroll.grid-scroller":"mousewheel.grid-scroller",function(e){				
			if(!self.grid.normalView.viewport.yscroller){
				return;
			}
			breeze.stopEvent(e);
			var delta = 0,
				step =3;
			if (null!=e.originalEvent.wheelDelta) {
				delta = e.originalEvent.wheelDelta/120;
		    } else if (null!=e.originalEvent.detail) {
		    	delta = -e.originalEvent.detail/3;
		    }
			if(delta>0){ //向上滚动
				self.scrollToTop(delta*step);
			}
			else{//向下滚动
				self.scrollToBottom(-delta*step);
			}
		});
	},
	scrollToBottom : function(step){
		var viewport = this.grid.normalView.viewport;
		if(viewport.endRowEdge){
			return;
		}
		viewport.beginRowIndex+=step;
		var h = viewport.rowHeight* (viewport.rowCount-viewport.beginRowIndex);
		for(;h<viewport.height;){
			h+=viewport.rowHeight;
			viewport.beginRowIndex--;
			viewport.endRowEdge = true;
		}
		this.grid.doYScroll();
		this.positionY();
	},
	scrollToTop : function(step){
		var viewport = this.grid.normalView.viewport;
		if(!viewport.endRowEdge){
			if(viewport.beginRowIndex>0){
				viewport.beginRowIndex = viewport.beginRowIndex - step;
				if(viewport.beginRowIndex<0){
					viewport.beginRowIndex = 0;
				}
			}
			else{
				return;
			}
		}		
		viewport.endRowEdge = false;
		this.grid.doYScroll();
		this.positionY();	
	},
	scrollMoveY : function(e){
		var clientY =e.clientY,
			handleY = -1,
			self = this,
			viewport = this.grid.normalView.viewport,
			top = this.yscrollerBarNode.css("top");
		top = "auto"==top ? (this.yscrollerHeight - 16 - this.yscrollerBarHeight) : parseInt(top,10);
		document.attachEvent && document.body.setCapture();
		function mousemoveEvent(e){
			breeze.stopEvent(e);
			clearTimeout(handleY);
			var newTop = top + e.clientY - clientY,
				endRowEdge = false;
			//上边界
			if(newTop<16){
				newTop = 16;
			}
			//下边界
			else if(newTop+self.yscrollerBarHeight+16>self.yscrollerHeight){
				newTop = self.yscrollerHeight - self.yscrollerBarHeight -16;
				endRowEdge = true;
			}
			self.yscrollerBarNode.css("top",newTop+"px");
			var rowIndex = Math.floor((newTop -16) * (viewport.rowsHeight - viewport.height) / ((self.yscrollerHeight -32 - self.yscrollerBarHeight) *  viewport.rowHeight));
			if(viewport.beginRowIndex == rowIndex  
					&& endRowEdge==viewport.endRowEdge){
				return false;
			}
			handleY = setTimeout(function(){
				viewport.endRowEdge = endRowEdge;
				viewport.beginRowIndex = rowIndex;
				self.grid.doYScroll();
			},10);
			return false;
		}
		function mouseupEvent(e){
			document.attachEvent && document.body.releaseCapture();
			$(document).unbind("mousemove",mousemoveEvent);
			$(document).unbind("mouseup",mouseupEvent);
		}
		$(document).bind("mousemove",mousemoveEvent);
		$(document).bind("mouseup",mouseupEvent);
	},
	scrollToRight : function(){
		var normalView = this.grid.normalView,
			viewport = normalView.viewport;
		if(viewport.endColumnEdge){
			return;
		}
		viewport.beginColumnIndex++;
		var w = 0;
		viewport.visibleColumns = 0;
		for(var i=viewport.beginColumnIndex,column;column=normalView.columns[i];i++){
			w += column.width || this.grid.options.columnWidth;	
			viewport.visibleColumns++;
			if(w>=viewport.width){
				break;
			}
		}
		viewport.endColumnEdge = false;
		if(w<viewport.width){
			viewport.endColumnEdge = true;
			viewport.visibleColumns++;
			viewport.beginColumnIndex--;
		}
		normalView.renderContent();
		this.positionX();
	},
	scrollToLeft : function(){
		var normalView = this.grid.normalView,
			viewport = normalView.viewport;
		if(!viewport.endColumnEdge){
			viewport.beginColumnIndex--;
			if(viewport.beginColumnIndex<0){
				viewport.beginColumnIndex = 0;
				return;
			}
			var w = 0;
			viewport.visibleColumns=0;
			for(var i=viewport.beginColumnIndex,column;column=normalView.columns[i];i++){
				w += column.width || this.grid.options.columnWidth;	
				viewport.visibleColumns++;
				if(w>=viewport.width){
					break;
				}
			}
		}		
		viewport.endColumnEdge = false;
		normalView.renderContent();
		this.positionX();		
	},
	scrollMoveX : function(e){
		var clientX =e.clientX,
			handleX = -1,
			self = this,
			normalView = this.grid.normalView,
			viewport = normalView.viewport,
			left = this.xscrollerBarNode.css("left");
		left = "auto"==left ? (this.xscrollerWidth - 16 - this.xscrollerBarWidth) : parseInt(left,10);
		document.attachEvent && document.body.setCapture();
		function mousemoveEvent(e){
			breeze.stopEvent(e);
			clearTimeout(handleX);
			var newLeft = left + e.clientX - clientX,
				endColumnEdge = false,
				columnIndex = 0,
				visibleColumns = 0;
			//下边界
			if(newLeft+self.xscrollerBarWidth+16>self.xscrollerWidth){
				newLeft = self.xscrollerWidth - self.xscrollerBarWidth -16;
				endColumnEdge = true;
				self.xscrollerBarNode.css({
					"left" : "auto",
					"right" : "16px"
				});
				var w = 0;
				for(var i=normalView.columns.length-1,column;column=normalView.columns[i];i--){
					w += column.width || self.grid.options.columnWidth;	
					visibleColumns++;
					if(w>=viewport.width){
						columnIndex = i;
						break;
					}
				}
			}
			else{
				//上边界
				if(newLeft<16){
					newLeft = 16;
				}
				self.xscrollerBarNode.css({
					"left" : newLeft+"px",
					"right" : "auto"
				});
				var scrollWidth = (newLeft -16) * (normalView.getHeaderTableWidth() - viewport.width) / (self.xscrollerWidth -32 - self.xscrollerBarWidth);
				var w = 0;
				for(var i=0,column;column=normalView.columns[i];i++){
					w += column.width || self.grid.options.columnWidth;	
					if(w>=scrollWidth){
						columnIndex=i;
						break;
					}
				}
				w = 0;
				for(var i=columnIndex,column;column=normalView.columns[i];i++){
					w += column.width || self.grid.options.columnWidth;	
					visibleColumns++;
					if(w>=viewport.width){
						break;
					}
				}
				for(;w<viewport.width;){
					columnIndex--;
					visibleColumns++;
					w += normalView.columns[columnIndex].width || self.grid.options.columnWidth;	
				}
			}
			if(viewport.beginColumnIndex ==columnIndex  
					&& endColumnEdge==viewport.endColumnEdge){
				return false;
			}
			handleX = setTimeout(function(){
				viewport.endColumnEdge = endColumnEdge;
				viewport.beginColumnIndex = columnIndex;
				viewport.visibleColumns = visibleColumns;
				normalView.renderContent();
			},10);
			return false;
		}
		function mouseupEvent(e){
			document.attachEvent && document.body.releaseCapture();
			$(document).unbind("mousemove",mousemoveEvent);
			$(document).unbind("mouseup",mouseupEvent);
		}
		$(document).bind("mousemove",mousemoveEvent);
		$(document).bind("mouseup",mouseupEvent);
	},
	resize : function(xscrollerWidth,yscrollerHeight){
		this.xscrollerWidth = xscrollerWidth;
		this.yscrollerHeight = yscrollerHeight;
		var grid = this.grid,
			viewport = grid.normalView.viewport;
		this.yscrollerNode.css("display",viewport.yscroller ? "block" : "none");	
		this.xscrollerNode.css("display",viewport.xscroller ? "block" : "none");	
		
		$(">.contents>.placeholder",grid.gridElement).remove();
		if(viewport.yscroller && viewport.xscroller){
			this.yscrollerHeight = this.yscrollerHeight - grid.scrollerOffset;
			this.xscrollerWidth = this.xscrollerWidth - grid.scrollerOffset;
			$(">.contents",grid.gridElement).append($("<div class='placeholder'></div>"))
		}
		this.xscrollerNode.width(this.xscrollerWidth);
		this.yscrollerNode.height(this.yscrollerHeight);
	
		if(viewport.yscroller){
			this.yscrollerBarHeight = viewport.height * (this.yscrollerHeight-30)/viewport.rowsHeight;
			if(this.yscrollerBarHeight<15){
				this.yscrollerBarHeight = 15;
			}
			this.yscrollerBarNode.height(this.yscrollerBarHeight);
			this.positionY();
		}
		if(viewport.xscroller){
			this.xscrollerBarWidth = viewport.width * (this.xscrollerWidth-30)/viewport.headerTableWidth;
			if(this.xscrollerBarWidth<15){
				this.xscrollerBarWidth = 15;
			}
			this.xscrollerBarNode.width(this.xscrollerBarWidth);
			this.positionX();
		}
	},
	positionY : function(){
		var grid = this.grid,
			viewport = grid.normalView.viewport;
		this.yscrollerBarNode.css("bottom","auto");
		if(viewport.endRowEdge){
			this.yscrollerBarNode.css({
				"top" : "auto",
				 "bottom" : "16px"
			});
		}
		else{
			var h = viewport.beginRowIndex * viewport.rowHeight,
				y= h * (this.yscrollerHeight-30- this.yscrollerBarHeight) / (viewport.rowsHeight - viewport.height);
			this.yscrollerBarNode.css("top",(y+16)+"px");
		}
	},
	positionX : function(){
		var grid = this.grid,
			normalView = grid.normalView,
			viewport = normalView.viewport;
		this.xscrollerBarNode.css("right","auto");
		if(viewport.endColumnEdge){
			this.xscrollerBarNode.css({
				"left" : "auto",
				 "right" : "16px"
			});
		}
		else{
			var w = normalView.getScrollLeft();
			var x = w * (this.xscrollerWidth - this.xscrollerBarWidth - 30) / (normalView.getHeaderTableWidth() -  viewport.width);
			this.xscrollerBarNode.css("left",(x+16)+"px");
		}
	},
	destroy : function(){
		this.yscrollerNode.unbind("mousedown");
		this.xscrollerNode.unbind("mousedown");
		this.grid.contentsNode.unbind(document.addEventListener ? "DOMMouseScroll.grid-scroller":"mousewheel.grid-scroller");
		delete this.yscrollerNode;
		delete this.xscrollerNode;
	}
 };
$.ui.grid.plugins.register("scroller",$.ui.grid.scroller);
 
})(jQuery);
