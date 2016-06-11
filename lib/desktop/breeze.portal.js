/*
 * Balancebeam Widget Portal 1.0
 *
 * Description : Support Portal
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
	 
 $.widget("ui.portal",$.ui.container, {
	options: {
		layout : "1:1:1",
		dataProvider : [
			[],[],[]
		]		
	},
	render : function(){
		var element = this.element,
			options = this.options,			
			fragment = document.createDocumentFragment(),
			html = [];
		this.element.addClass("breeze-portal");
		html.push("<div>");
		html.push("<table cellpadding='0' cellspacing='0'>");
		html.push("<colgroup>");
		for(var i=0,layout=options.layout.split(":");layout[i];i++){
			html.push("<col style='width:");
			html.push(layout[i]);
			html.push(";'/>");
		}
		html.push("</colgroup>");
		html.push("<tbody>");
		html.push("<tr>");
		html.push("</tr>");
		html.push("</tbody>");
		html.push("</table>");
		html.push("</div>");
		var node = $(html.join("")),
			tr = $("tr",node);
		
		for(var i=0,cell;cell=options.dataProvider[i];i++){
			var td = $("<td valign='top'></td>");
			for(var j=0,widget;widget = cell[j];j++){
				var pane = $("<div class='portal-pane'></div>"),
					param = {
						width:"auto",
						marginTop : 5,
						headerToggle:false
				};
				param.buttons = widget.buttons || [];
				widget.settable && param.buttons.push({
					cls : "settable",
					onClick : function(o){								
					}
				});
				widget.closable && param.buttons.push({
					cls : "closable",
					title : "关闭",
					onClick : function(o){
						var elem = o.element;
						elem.animate({opacity: 'toggle'},"fast",function(){
							elem.remove();
						});
					}
				});				
				pane.titlepane(jQuery.extend(widget,param));
				td.append(pane);
			}		
			tr.append(td);			
		}
		this.element.append(node);
	},
	//绑定事件
	funnelEvents : function(){		
		var self = this;
		this.element.mousedown(function(e){
			var target = $(e.target);
			if(target.hasClass("title")){
				target = target.parent().parent();
			}
			else if(target.hasClass("header")){
				target = target.parent();
			}
			if(!target.hasClass("portal-pane")){
				return;
			}		
			var oClientX = e.clientX,
				oClientY = e.clientY,
				offset = target.offset(),
				oLeft = offset.left,
				oTop = offset.top,
				element = self.element,
				elementOffset = element.offset(),
				elementLeft = elementOffset.left,
				elementTop = elementOffset.top,
				elementWidth = element.width(),
				elementHeight = element.height(),
				tdps = [],
				x,y,td,proxy,oIndex1,oIndex2;
				$.each($(">div>table>tbody>tr>td",element),function(index,elem){
					var td = $(elem),
						offset = td.offset();
					tdps.push({td : td,left : offset.left, right : (offset.left+td.width())});
				});				
			document.attachEvent && document.body.setCapture();
			function mousemove(e){
				if(null==proxy){
					var p=target.parent();
					oIndex1 = $(">td",p.parent()).index(p);
					oIndex2 = $(">div",p).index(target);
					proxy = $("<div class='portal-proxy'></div>");
					proxy.height(target.height()-4);
					target.before(proxy);
					target.width(target.width());
					target.addClass("dragging");					
					target.appendTo('body');				
				}				
				target.css({
					left : (e.clientX-oClientX+oLeft) +"px",
					top : (e.clientY-oClientY+oTop) +"px"
				});
				x= e.clientX;
				if(elementLeft > e.clientX){
					x = elementLeft;
				}
				else if(elementLeft + elementWidth < e.clientX){
					x = elementLeft + elementWidth;
				}
				y=e.clientY;
				if(elementTop+5>e.clientY){
					y = elementTop+5;
				}
				else if(elementTop+elementHeight<e.clientY){
					y = elementTop+elementHeight;
				}				
				for(var i=0,tdp;tdp = tdps[i];i++){
					if(tdp.left<=x && x<=tdp.right){
						td = tdp.td;
						break;
					}
				}
				var children = $(">div",td);
				for(var i=0,elem;elem=children[i];i++){
					elem = $(elem);
					var top = elem.offset().top,
						h = elem.height();
					if(e.clientY<=top+h/2){
						if(!elem.hasClass("portal-proxy") && 
							!elem.prev().hasClass("portal-proxy")){
							elem.before(proxy);
						}						
						return;
					}
					else if(e.clientY<=top+h){
						if(!elem.hasClass("portal-proxy") && 
							!elem.next().hasClass("portal-proxy")){
							elem.after(proxy);
						}						
						return;
					}					
				};	
				if(!td.last().hasClass("portal-proxy")){
					td.append(proxy);			
				}				
			}
			function mouseup(e){
				if(proxy!=null){
					target.css("width","auto");
					target.removeClass("dragging");				
					proxy.after(target);
					proxy.remove();	
					proxy=null;
					var p=target.parent(),
						nIndex1 = $(">td",p.parent()).index(p),
						nIndex2 = $(">div",p).index(target),
						dataProvider = self.options.dataProvider;					
					dataProvider[nIndex1].splice(nIndex2,0,dataProvider[oIndex1].splice(oIndex2,1)[0]);
				}
				document.attachEvent && document.body.releaseCapture();
				$(document).unbind("mousemove",mousemove);
				$(document).unbind("mouseup",mouseup);
			}
			$(document).bind("mousemove",mousemove);
			$(document).bind("mouseup",mouseup);					
		});
	}	
});

})(jQuery);