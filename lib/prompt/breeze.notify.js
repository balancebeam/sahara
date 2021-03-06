/*
 *
 */

 (function( $, undefined ) {
	 
 $.widget("ui.notify", $.ui.container,{
	options: {	
		height: "100%",
		interval: 12,
		delay: 3000
	},
	render: function(){
		this.element.addClass("breeze-notify");
		this.nodebase = [];
		this.database ={};
		this.newIndex = 0;
	},
	addNotify : function(data){
		var html = ["<div class='notify unloaded'>"];
		html.push("<div class='container'>");
		if(data.closebtn){
			html.push("<div class='closebtn'></div>");
		}
		html.push("<img class='icon "+(data.iconClass || "")+"'/>");
		html.push("<div class='details'>");
		if(data.title){
			html.push("<div class='title'>");
			html.push(data.title);
			html.push("</div>");
		}		
		html.push("<div class='summary'>");
		html.push(data.summary);
		html.push("</div>");
		html.push("</div>");
		html.push("</div>");
		html.push("</div>");			
		var node = $(html.join("")),
			index = this.newIndex++,
			self = this;
		$(">.container>.icon",node).attr("src",(data.iconURL || breeze.getBlankIcon()));
		node.attr("index",index);
		this.nodebase.push(node[0]);
		this.database[index] = data;
		this.element.append(node);		
		this.resize0();
		if(false!=data.autoClose){
			setTimeout(function(){
				self.remove(node[0]);
			},this.options.delay);
		}
	},
	resize : function(){
		this.runtimeHeight = this.element.height();
		this.resize0();
	},
	resize0 : function(){
		var top = right = interval = this.options.interval,
			flippingNodes = [],
			height = this.runtimeHeight;
		for(var i=0,node;node=this.nodebase[i];i++){
			node = $(node);
			node.stop();
			var nRight= right+"px",
				nTop = top+"px",
				distance = node.height();
			if(interval==top || (height>=top+distance)){
				if(node.hasClass("unloaded")){
					flippingNodes.push(node);
					node.css({
						top: nTop,
						right: nRight
					});
				}
				else if(node.css("top")!=nTop || node.css("right")!=nRight){
					node.animate({
						right: nRight,
						top: nTop
					},"normal");
				}
				top+=distance+interval;
			}
			else{
				i--;
				top=interval;
				right+=node.width()+interval;
			}
		}
		//执行初始化动画
		(function(){
			if(0==flippingNodes.length){
				return;
			}
			var func = arguments.callee,
				node = flippingNodes.shift();
			node.addClass("loaded");	
			setTimeout(func,100);
			setTimeout(function(){
				node.removeClass("unloaded");
				node.removeClass("loaded");
			},1000);	
		})();		
	},
	remove : function(node){
		for(var i=0,n;n=this.nodebase[i];i++){
			if(n==node){
				this.nodebase.splice(i,1);
				this.resize0();
				break;
			}
		}
		node = $(node);
		var index = node.attr("index"),
			data= this.database[index];
		delete this.database[index];		
		//执行删除节点操作
		node.fadeOut("normal",function(){			
			node.remove();
		});
		data.onClose && data.onClose();
	},
	funnelEvents : function(){
		var self = this;
		this.element.click(function(e){
			var target = $(e.target);
			if(target.hasClass("closebtn")){
				var node = breeze.parent(target,"notify");
				self.remove(node[0]);
			}		
		});
	}
});
})(jQuery);
