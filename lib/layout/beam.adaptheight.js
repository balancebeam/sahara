/*
 * Balancebeam Widget AdaptHeight 1.0
 *
 * Description : Support highly adaptive
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 *		balancebeam/lib/jquery/jquery.ui.core.js
 *		balancebeam/lib/jquery/jquery.ui.widget.js
 * 		balancebeam/lib/widget/layout/beam.container.js
 */


 /*示例代码：
  html:
  <div id="adaptheight">
  	<div id="titlepane1">
  		<!-- @uit(ui=titlepane,) -->
  		<div>这是可伸缩容器</div>
  	</div>
  	<div id="titlepane2">
  		<div>这是可伸缩容器2</div>
  	</div>
  	<div id="adapt1">
  		这是个适应容器
  	</div>
  </div>
  script:
  $(function(){
  	 $("#adaptheight").adaptheight({
  	 	height : "100%",
  	 	adaptions : "adapt1"
  	 });
  	 $("#titlepane1").titlepane({});
  	 $("#titlepane2").titlepane({});
  	 $("#adapt1").container({});
  	 $("#adaptheight").adaptheight("resize");
  });
  
  */

 (function( $, undefined ) {
	 
 $.widget("ui.adaptheight",$.ui.container, {
	options: {
		adaptions : []
	},
	render : function(){
		this.element.css({"overflow" : "hidden"});
		var adaptions = this.options.adaptions;
		if(!jQuery.isArray(adaptions)){
			adaptions = adaptions.split(",");
		}
		this.options.adaptions = $.array2obj(adaptions);
	},
	resize : function(){
		var height = this.element.height(),
			adaptheightContainers = [],
			adaptheightSize = [],
			totalSize = 0,
			self = this;
		$.each(this.getChildren(),function(index,child){
			if(child.element.attr("id") in self.options.adaptions){
				adaptheightContainers.push(child);
				var size = (child.options.height == "auto"? 100 : parseInt(child.options.height,10));
				totalSize+=size;
				adaptheightSize.push(size);
				height = height - child.options.marginTop - child.options.marginBottom;
				child.element.height(0);
			}
			else{
				!this._inited && (this._inited = true) && child.resize();
				var h = child.element.height();
				if(h){ //如果是0高度则不计算上下边距
					height = height - h - child.options.marginTop - child.options.marginBottom;
				}
			}
		});
		
		if(height>0){
			$.each(adaptheightContainers,function(index,child){
				var h = Math.floor(adaptheightSize[index]*height/totalSize);
				child.element.height(h);
				//调整子元素的高度大小等
				child.resize();
			});
		}
	},
	//通知到父容器做调整
	notifyParentResize : function(){
		var self = this;
		setTimeout(function(){
			self.resize();
		},0)
	}
});

})(jQuery);