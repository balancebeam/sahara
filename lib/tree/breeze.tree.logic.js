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
 
 $.ui.tree.logic = function(tree,params){
	 this.tree = tree;
	 this.params = params || {};
	 this._create();
 };
$.ui.tree.logic.prototype = {	
	_create : function(){	
		this.tree.element.addClass("logic");
		this.tree.subscribe("renderNode.logic",this,"renderNode");
		this.tree.subscribe("xhr-render.logic",this,"xhrRender");
	},
	renderNode : function(treeNode){
		var node= treeNode.getNode(),
			runtimeData = treeNode.getRuntimeData(),
			logic=$(">.header>.logic",node);
		runtimeData["s"] ? logic.addClass("checked") : logic.removeClass("checked");
	},
	xhrRender : function(treeNode){
		switch(this.params.type){
			case "cascade" :
			case "cascade-children" :
			case "cascade-half" :
				if($(">.header>.logic",treeNode.getNode()).hasClass("checked")){
					this.tree.foreach({
						treeNode : treeNode,
						each : function(runtimeData){
							runtimeData["s"] =true;
						}
					});
				}
				break;
		};
	},
	startup : function(){	
		var self =this;
		this.tree.element.click(function(e){
			var logicNode = $(e.target);
			//点击树结点图标
			if(logicNode.hasClass("logic") && !logicNode.hasClass("disabled")){
				var onBeforeCheck = self.params.onBeforeCheck,
					node=breeze.parent(logicNode,"node"),
					treeNode=self.tree.getTreeNode(node);
				if(onBeforeCheck && 
					false==onBeforeCheck(treeNode)){
						return;
				}
				var checked = logicNode.hasClass("checked")?
					(logicNode.removeClass("checked") && false): 
					(logicNode.addClass("checked") && true);
				//设置当前选中状态
				treeNode.getRuntimeData()["s"] = checked;
				switch(self.params.type){
					case "cascade" :
						self.doCascadeCheck(treeNode,checked);
						break;
					case "cascade-parent" :
						self.doParentCheck(treeNode,checked);
						break;
					case "cascade-children" :
						self.doChildrenCheck(treeNode,checked);
						break;
					case "cascade-half" :
						self.doHalfCheck(treeNode,checked);
						break;
				}
			}
		});
	},	
	
	checkAll : function(whole){
		/**
		  * 全选操作
		  */
		var logicNodes = $(".logic",this.tree.element);
		logicNodes.removeClass("half").addClass("checked");
		this.tree.foreach({
			treeNode : this.tree.getRootNode(),
			whole : whole,
			each : function(runtimeData){
				runtimeData["s"] =true;
			}
		});
	},
	disCheckAll : function(){
		/**
		  * 取消全选
		  */
		var logicNodes = $(".logic",this.tree.element);
		logicNodes.removeClass("half").removeClass("checked");
		this.tree.foreach({
			treeNode : this.tree.getRootNode(),
			each : function(runtimeData){
				runtimeData["s"] =false;
			}
		});
	},
	setChecked : function(ids){
		/**
		  * 设置选中的结点
		  */
		ids = jQuery.isArray(ids) ? ids : [ids];
		var datasbase = this.tree.runtimedatasbase;
		for(var i=0,id;id=ids[i];i++){
			var runtimeData = datasbase[id];
			if(runtimeData!=null){
				runtimeData["s"] = true;
				var treeNode = this.tree.nodesbase[id];
				if(treeNode){
					$(">.header>.logic",treeNode.getNode()).addClass("checked");
				}
			}
		}
	},
	getChecked : function(){
		/**
		  * 获取选中的结点
		  */
		var checkedArray=[];
		this.tree.foreach({
			treeNode : this.tree.getRootNode(),
			each : function(runtimeData){
				if(runtimeData["s"]){
					checkedArray.push(runtimeData["d"]);
				}
			}
		});
		return checkedArray;
	},
	doCascadeCheck : function(treeNode,checked){
		this.doParentCheck(treeNode,checked);
		this.doChildrenCheck(treeNode,checked);
	},
	//级联选择父亲
	doParentCheck : function(treeNode,checked){
		if(checked){
			var nodes = breeze.parents(treeNode.getNode(),"node",this.tree.element);
			for(var i=0,pn;pn=nodes[i];i++){
				$(">.header>.logic",pn).addClass("checked");
				this.tree.getTreeNode(pn).setChecked(true);
			}
		}
	},
	//选择父亲
	doChildrenCheck : function(treeNode,checked){
		var logicNodes = $(".logic",treeNode.getNode().children(".subtree"));
		checked ? logicNodes.addClass("checked") : logicNodes.removeClass("checked");
		this.tree.foreach({
			treeNode : treeNode,
			each : function(runtimeData){
				runtimeData["s"] =checked;
			}
		});		
	},
	doHalfCheck: function(treeNode,checked){
		//处理父亲的逻辑
		var node = treeNode.getNode(),
			nodes = breeze.parents(node,"node",this.tree.element);
		for(var i=0,pn;pn=nodes[i];i++){
			if(checked){
				$(">.header>.logic",pn).addClass("checked");
				this.tree.getTreeNode(pn).setChecked(true);
			}
			//设置半选的状态
			var logicNodes = $(">.subtree>.node>.header>.logic",pn);
			$(">.header>.logic",pn).removeClass("half");
			for(var j=0,logicNode;logicNode=logicNodes[j];j++){
				if(!$(logicNode).hasClass("checked")){
					$(">.header>.logic",pn).addClass("half");
					break;
				}
			}
		}
		//处理自己和子节点
		$(">.header>.logic",node).removeClass("half");
		var logicNodes = $(".logic",node.children(".subtree"));
		logicNodes.removeClass("half");
		checked ? logicNodes.addClass("checked") : logicNodes.removeClass("checked");
		this.tree.foreach({
			treeNode : treeNode,
			each : function(runtimeData){
				runtimeData["s"] =checked;
			}
		});	
	}
 };
//注入plugin
$.ui.tree.plugins.register("logic",$.ui.tree.logic);
 
})(jQuery);
