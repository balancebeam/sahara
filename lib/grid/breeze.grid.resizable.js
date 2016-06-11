/*
 * Balancebeam Widget Grid_Plugin_Resizable 1.0
 *
 * Description : Support changing the column width
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 * 		balancebeam/lib/widget/grid/beam.grid.js
 */

(function( $, undefined ) {
 
$.ui.grid.resizable = function(grid){
	 this.grid = grid;
	 this._create();
 };
//draggable原型定义
$.ui.grid.resizable.prototype = {
	minWidth : 30,
	//bind event
	_create : function(){
		var self = this,
			grid = this.grid,
			headersNode = grid.headersNode;
		
		this.resizeProxyNode = $("<div class='resize-proxy'><span></span></div>")
			.appendTo(headersNode);
		
		this.colResizeNode = $("<div class='col-resize'></div>");
		
		headersNode.bind("mousedown.grid-resizable",function(e){
			var target = $(e.target);
			if(!target.hasClass("col-resize")) return;
			grid.element.addClass("breeze-noselectable");
			var element = target.parent(".th"),
				clientX = e.clientX,
				oTargetLeft = element.offset().left - headersNode.offset().left  ,
				nLeft = oLeft = oTargetLeft + element.width() +1;
			
			//$(">span",self.resizeProxyNode).html(element.width()+1);
			self.resizeProxyNode.css({
				left : oLeft + "px",
				height : (headersNode.height() +grid.normalView.contentNode.height())+ "px",
			});
			document.attachEvent && document.body.setCapture();
			function mousemove(e){
				self.resizeProxyNode.css("display","block");
				nLeft = oLeft + e.clientX - clientX;
				if(oTargetLeft + self.minWidth >nLeft) {
					nLeft = oTargetLeft + self.minWidth;
				}
				self.resizeProxyNode.css("left",nLeft + "px");
				//$(">span",self.resizeProxyNode).html(nLeft-oTargetLeft);
				breeze.stopEvent(e);
		        return false;
			}
			function mouseup(e){
				grid.element.removeClass("breeze-noselectable");
				self.resizeProxyNode.css("display","none");
				document.attachEvent && document.body.releaseCapture();
				$(document).unbind("mousemove",mousemove);
				$(document).unbind("mouseup",mouseup);
				var columnMarkup = grid.getColumnMarkup(element),
					nWidth = nLeft - oTargetLeft;
				if(nWidth != element[0].offsetWidth){ //不等的情况下重新设置宽度
					self.resizeColumn(columnMarkup.idx,columnMarkup.view,nWidth);
				}
			}
			$(document).bind("mousemove",mousemove);
			$(document).bind("mouseup",mouseup);
			
		});
		headersNode.bind("mouseover.grid-resizable",function(e){
			var target = $(e.target);
			if(null!=target.attr("idx")){
				if(false!=grid.getColumnMarkup(target).column.resizable){
					target.append(self.colResizeNode);
				}
			};
		});
		headersNode.bind("dblclick.grid-resizable",function(e){
			var target = $(e.target);
			if(target.hasClass("col-resize")){
				var element = target.parent(".th"),
					columnMarkup = grid.getColumnMarkup(element),
					autoWidth = self.getAutoWidth(columnMarkup.column);
				self.resizeColumn(columnMarkup.idx,columnMarkup.view,autoWidth);
			};
		});
	},
	resizeColumn : function(index,view,width){
		var column = view.columns[index];
		column.width = width;
//		$(">table>colgroup",view.headerNode).remove();
//		$(">table",view.headerNode).prepend($(view.getHeaderTableColgroup()));
//		$(">table",view.headerNode).css("width",view.getHeaderWidth());
		this.grid.refresh();
	},
	getAutoWidth : function(column){
		var dataProvider = this.grid.options.dataProvider,
			filedIndex =column.filedIndex;
		if(null == filedIndex){
			return this.minWidth;
		}
		var autoWidth = this.minWidth;
		for(var i=0,data;data=dataProvider[i];i++){
			var value = data[filedIndex];
			value = null==value ? "":String(value);
			//TODO
			autoWidth = Math.max(autoWidth,this.getStrPxLength(value));
		}
		autoWidth = Math.max(autoWidth,this.getStrPxLength(column.title));
		return autoWidth + 10;
	},
	getStrPxLength : function(str) {
		/*var result = ("<l>"+str+"</l>").match(/>[^<>]+</g);
		if(result){
			str = "";
			for(var i=0,s;s=result[i];i++){
				str+=s.substring(1,s.length-1);
			}
		}*/
		return 7 * str.replace(/[^\x00-\xff]/g,"xx").length; 
	},
	destroy : function(){
		var headersNode = this.grid.headersNode;
		this.resizeProxyNode.remove();
		this.colResizeNode.remove();
		headersNode.unbind("mousedown.grid-resizable");
		headersNode.unbind("mouseover.grid-resizable");
		headersNode.unbind("dblclick.grid-resizable");
	}
 };
//注入plugin
$.ui.grid.plugins.register("resizable",$.ui.grid.resizable);
})(jQuery);
