/*
 * Balancebeam Tree draggable 1.0
 *
 * Description : tree draggable
 * Copyright 2013
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 * 		lib/tree/breeze.tree.js
 */

(function( $, undefined ) {
 
 $.ui.tree.draggable = function(tree,params){
	 this.tree = tree;
	 this.params = params || {};
	 this._create();
 };
$.ui.tree.draggable.prototype = {	
	_create : function(){			
	},
	startup : function(){
		var self = this,
			element = this.tree.element;
		element.bind("mousedown.draggable",function(e){
			var oTarget = $(e.target);
			if(!oTarget.hasClass("title")){
				return;
			}
			element.addClass("breeze-noselectable");
			var oNode =breeze.parent(oTarget,"node"),
				clientX = e.clientX,
				clientY = e.clientY,
				oTargetLeft = oTarget.offset().left,	
				oTargetTop =  oTarget.offset().top,
				elementOffset = element.offset(),
				oLeft = clientX - elementOffset.left + 13 ,
				oTop =clientY- elementOffset.top + 20,
				handle = -1,nNode,place="",
				dragNode = self.dragNode =
					$("<span class='drag-proxy'><label></label></span>")
					.css({
						display : "none",
						left : oLeft+ "px",
						top : oTop + "px"
					})
					.appendTo(element),
				placeNode = self.placeNode = 
					$("<div class='place-proxy'></div>")
					.appendTo(element);
				$(">label",dragNode).html(oTarget.html());
			function domousemove(e){
				dragNode.css({
					display : "block",
					left : (oLeft +e.clientX -clientX)+ "px",
					top : (oTop + e.clientY-clientY)+ "px"
				});
				var target = $(e.target);
				nNode = breeze.parent(target,"node");
				// 如果鼠标停留在展开图标上时
				clearTimeout(handle);
				if(target.hasClass("status") && nNode.hasClass("collapsed")){
					handle = setTimeout(function(){
						self.tree.toggle(nNode);
					},750);
				}
				if(!nNode 
					|| nNode[0]==oNode[0] 
					|| jQuery.contains(oNode[0],nNode[0])){
					dragNode.removeClass("on");
					return;
				}
				place = "";
				placeNode.css("display","none");
				dragNode.addClass("on");
				var nNodeTop = nNode.offset().top- elementOffset.top,
					nTop = e.clientY - elementOffset.top;
				if(nTop -nNodeTop<=5){//上边沿
					//看一下p元素是不是oNode
					if(nNode.prev()[0]==oNode[0] || nNode[0] == $(">.root",self.tree.element)[0]){
						dragNode.removeClass("on");
						return;
					}
					placeNode.css({
						display: "block",
						top : nNodeTop+"px"
					});
					place="top";
				}
				else if(nNodeTop+20 -nTop<=5){ //下边沿
					//看一下next元素是不是oNode
					if(nNode.next()[0]==oNode[0] || nNode[0] == $(">.root",self.tree.element)[0]){
						dragNode.removeClass("on");
						return;
					}
					placeNode.css({
						display: "block",
						top : (nNodeTop+20)+"px"
					});
					place="bottom";
				}
				else{ //处于中间
					var pNode = self.tree.getTreeNode(oNode).getParent();
					if(pNode && (pNode.getNode()[0] == nNode[0])){
						dragNode.removeClass("on");
						return;
					}
					place="middle";
				}
				
			}
			function domouseup(e){
				element.removeClass("breeze-noselectable");
				if(dragNode.hasClass("on")){
					var nTreeNode = self.tree.getTreeNode(nNode),
						oTreeNode = self.tree.getTreeNode(oNode),
						npTreeNode = nTreeNode.getParent();
					switch(place){
						case "middle" :
							self.move(nTreeNode,oTreeNode,-1);
							break;
						case "top" :
							self.move(npTreeNode,oTreeNode,nTreeNode.getIndex());
							break;
						case "bottom" :
							self.move(npTreeNode,oTreeNode,nTreeNode.getIndex()+1);
							break;
					}
					self.dragNode.remove();
				}
				else{
					if("block"==self.dragNode.css("display")){
						self.dragNode.animate({
								left :  (oTargetLeft - elementOffset.left) + "px",
								top :  (oTargetTop - elementOffset.top) + "px",
								opacity : 'toggle'
							},300,function(){
								self.dragNode.remove();
						});
					}
					else{
						self.dragNode.remove();
					}
				}
				clearTimeout(handle);
				element.removeClass("noselectable");
				self.placeNode.remove();
				$(document).unbind("mousemove",domousemove);
				$(document).unbind("mouseup",domouseup);
			}
			$(document).bind("mousemove",domousemove);
			$(document).bind("mouseup",domouseup);
		});	
	},
	move : function(npTreeNode,treeNode,nIndex){
		/**
		*移动节点到指定的位置
		*/
		var opTreeNode = treeNode.getParent(),
			oIndex = treeNode.getIndex(),
			self = this;
		if(npTreeNode.getNode().hasClass("leaf")){ //如果是叶子节点的话
			var node = npTreeNode.getNode();
			node.append("<div class='subtree'></div>");
			node.removeClass("leaf");
			node.addClass("expanded");
			(npTreeNode.getRuntimeData()["c"] = []).push(treeNode.getRuntimeData());
			opTreeNode.getRuntimeData()["c"].splice(oIndex,1);
			if(self.tree.isLeafByData(opTreeNode.getRuntimeData())){
				opTreeNode.getNode().removeClass("expanded").addClass("leaf");
				$(">.subtree",opTreeNode.getNode()).remove();
			}
			$(">.subtree",node).append(treeNode.getNode()).css("display","block");
			self._amendPaddingLeft(treeNode.getNode());
			self.params.onMove && self.params.onMove(npTreeNode,treeNode,nIndex);
			return;
		}
		function _move(){
			if(nIndex==-1){ //追加到最后
				opTreeNode.getRuntimeData()["c"].splice(oIndex,1); 
				if(self.tree.isLeafByData(opTreeNode.getRuntimeData())){
					opTreeNode.getNode().removeClass("expanded").addClass("leaf");
					$(">.subtree",opTreeNode.getNode()).remove();
				}
				npTreeNode.getRuntimeData()["c"].push(treeNode.getRuntimeData());
				$(">.subtree",npTreeNode.getNode()).append(treeNode.getNode());
				self._amendPaddingLeft(treeNode.getNode());
			}
			else{
				if(opTreeNode.getNode()[0]==npTreeNode.getNode()[0]){ //如果只是调整位置
					var array = npTreeNode.getRuntimeData()["c"];
					if(oIndex<nIndex){
						array.splice(nIndex,0,treeNode.getRuntimeData());
						array.splice(oIndex,1);
						$(">.subtree>.node:eq("+(nIndex-1)+")",npTreeNode.getNode()).after(treeNode.getNode());
					}
					else{
						array.splice(oIndex,1);
						array.splice(nIndex,0,treeNode.getRuntimeData());
						$(">.subtree>.node:eq("+nIndex+")",npTreeNode.getNode()).before(treeNode.getNode());
					}
				}
				else{					
					opTreeNode.getRuntimeData()["c"].splice(oIndex,1); 
					if(self.tree.isLeafByData(opTreeNode.getRuntimeData())){
						opTreeNode.getNode().removeClass("expanded").addClass("leaf");
						$(">.subtree",opTreeNode.getNode()).remove();
					}
					npTreeNode.getRuntimeData()["c"].splice(nIndex,0,treeNode.getRuntimeData());
					if(nIndex==0){
						$(">.subtree>.node:eq("+nIndex+")",npTreeNode.getNode()).before(treeNode.getNode());
					}
					else{
						$(">.subtree>.node:eq("+(nIndex-1)+")",npTreeNode.getNode()).after(treeNode.getNode());						
					}
					self._amendPaddingLeft(treeNode.getNode());
				}
			}
			self.params.onMove && self.params.onMove(npTreeNode,treeNode,nIndex);
		}		
		self.tree.makeupsubtree(npTreeNode.getNode(),_move);
	},
	_amendPaddingLeft: function(node){ //修正左偏移量
		var paddingLeft = parseInt($(">.header",this.tree.getTreeNode(node).getParent().getNode()).css("paddingLeft"),10);
		$(">.header",node).css("paddingLeft",(paddingLeft+20)+"px");
		var children = $(">.subtree>.node",node);
		for(var i=0,n;child=children[i];i++){
			this._amendPaddingLeft($(child));
		}
	}
 };
//注入plugin
$.ui.tree.plugins.register("draggable",$.ui.tree.draggable);
 
})(jQuery);
