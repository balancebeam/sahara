/*
 * Balancebeam Tree logic 1.0
 *
 * Description : tree logic
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 * 		lib/tree/breeze.tree.js
 */

(function( $, undefined ) {
 
 $.ui.tree.edit = function(tree,params){
	 this.tree = tree;
	 this.params = params || {};
	 this._create();
 };
$.ui.tree.edit.prototype = {	
	_create : function(){			
	},
	startup : function(){			
	},
	//增加节点
	add : function(treeNode,children){
		children = children || [];
		if(0==children.length){ 
			return;
		}
		var node = treeNode.getNode(),
			runtimeData=treeNode.getRuntimeData();
		//如果叶子结点
		this.tree.transformtreedata(runtimeData,children);
		if(this.tree.isLeafByNode(node)){
			var data = treeNode.getData(),
				md = this.tree.options.metadata;
			if(data[md["leaf"]]){
				data[md["leaf"]] =false; 
			}			
			//修改节点的样式
			node.removeClass("leaf");
			node.addClass("collapsed");
		}
		else{
			var subtree = $(">.subtree",node);
			//如果存在子树，则追加新节点
			if(subtree.length){
				var fragment = document.createDocumentFragment(),
					paddingLeft = this.tree.getLeftPadding(node)+20,
					newChildren = runtimeData["c"];
				for(var i=newChildren.length-children.length,child;child = newChildren[i];i++){
					var n =this.tree.renderNode(child,paddingLeft)[0];
					fragment.appendChild(n);
				}
				subtree.append(fragment);
			}			
		}
		//回调事件
		var onAdd = this.params.onAdd;
		onAdd && onAdd(treeNode);
	},
	//更新结点，重新加载
	update : function(treeNode){
		var node = treeNode.getNode(),
			newHeader =$(">.header",this.tree.renderNode(treeNode.getRuntimeData(),this.tree.getLeftPadding(node),true));
		node.prepend(newHeader);
		newHeader.next().remove();
		//回调事件
		var onUpdate = this.params.onUpdate;
		onUpdate && onUpdate(treeNode);
	},
	//删除结点
	remove : function(treeNode){	
		var node = treeNode.getNode(),		
			md = this.tree.options.metadata,
			self =this;
		//根节点不能删除
		if(node.hasClass("root")) return;
		//删除所有缓存数据
		this.tree.foreach({
			treeNode : treeNode,
			each : function(runtimeData){
				var data = runtimeData["d"],
					id = data[md["id"]];
				delete self.tree.runtimedatasbase[id];
				delete self.tree.nodesbase[id];
			}
		});
		//删除在父结点中所持的数据
		var index = treeNode.getIndex(),
			parentTreeNode = treeNode.getParent();
			pRuntimeData = parentTreeNode.getRuntimeData(),
			pNode = parentTreeNode.getNode();
		pRuntimeData["c"].splice(index,1);
		//删除页面的结点
		node.remove();
		//调整父节点
		if(this.tree.isLeafByData(pRuntimeData)){
			pNode.removeClass("expanded");
			pNode.removeClass("collapsed");
			pNode.addClass("leaf");
			$(">.subtree",pNode).remove();
		}
		//回调事件
		var onRemove = this.params.onRemove;
		onRemove && onRemove(treeNode);
	},
	//上移结点
	slideUp : function(treeNode){
		var prevNode = treeNode.getPrev();
		if(prevNode!=null){
			var parentTreeNode = treeNode.getParent(),
			index = treeNode.getIndex(),
			children = parentTreeNode.getRuntimeData()["c"],
			temp = children[index];
			//交换数据位置
			children[index] = children[index-1];
			children[index-1]=temp;		
			//交换结点位置
			prevNode.getNode().before(treeNode.getNode());
			//回调事件
			var onSlideUp = this.params.onSlideUp;
			onSlideUp && onSlideUp(treeNode);
		}
	},
	//下移结点
	slideDown : function(treeNode){
		var nextNode = treeNode.getNext();
		if(nextNode!=null){
			var parentTreeNode = treeNode.getParent(),
			index = treeNode.getIndex(),
			children = parentTreeNode.getRuntimeData()["c"],
			temp = children[index];
			//交换数据位置
			children[index] = children[index+1];
			children[index+1]=temp;		
			//交换结点位置
			nextNode.getNode().after(treeNode.getNode());
			//回调事件
			var onSlideDown = this.params.onSlideDown;
			onSlideDown && onSlideDown(treeNode);
		}
	}

 };
//注入plugin
$.ui.tree.plugins.register("edit",$.ui.tree.edit);
 
})(jQuery);
