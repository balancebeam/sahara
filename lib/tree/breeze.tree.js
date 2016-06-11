/*
 * Balancebeam Widget Tree 1.0
 *
 * Description : Support a tree structure
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 *		balancebeam/lib/jquery/jquery.ui.core.js
 *		balancebeam/lib/jquery/jquery.ui.widget.js
 *		balancebeam/lib/widget/beam.toolkit.js
 */
 
 (function( $, undefined ) {
/**
*树结点对象
*/
function TreeNode(tree,node,runtimeData){
	this.tree = tree;
	this.node = node;
	this.runtimeData = runtimeData;
};
//方法定义
TreeNode.prototype={
	getNode : function(){
		return this.node;
	},
	getRuntimeData : function(){
		return this.runtimeData;
	},
	getData : function(){
		return this.runtimeData["d"];
	},
	setChecked : function(checked){
		this.runtimeData["s"] = checked;
	},
	getChecked : function(){
		return !!this.runtimeData["s"];
	},
	toggle : function(){
		this.tree.toggle(this.node);
	},
	getParent : function(){
		if(this.node.hasClass("root")){
			return null;
		}		
		return this.tree.getTreeNode(this.node.parent().parent());		
	},
	getNext : function(){
		var node = this.node.next();
		if(node.length){
			return this.tree.getTreeNode(node);		
		}
		return null;
	},
	getPrev : function(){
		var node = this.node.prev();
		if(node.length){
			return this.tree.getTreeNode(node);		
		}
		return null;
	},
	getIndex : function(){
		return $(">.node",this.node.parent()).index(this.node)
	}
};
 /**
  Tree的运行时结构{d:data,c:[],s:true}
 */
 $.widget("ui.tree", {
	options: {
		 //树节点元数据定义
		 metadata: {
			id: "id", //树结点唯一标识
			pId: "pId",//父节点标识
			title: "title",//树节点显示文本
			iconURL: "iconURL",//节点图片
			leaf: "leaf",//叶子节点
			children: "children"//子节点
		 },
		//定义根节点
		root:{
			visibility: true,//显示根节点
			iconURL: "",//节点图片
			title: "Root",//根节点内容
			id: "---root---"//树跟结点的唯一标识
		 },
		//定义数据源
		dataProvider : [], 
		//XHR请求
		xhr : null,
		//树节点点击事件
		onClick : null,
		//树节点加载后事件
		onLoad: null,
		//树节点展开事件
		onExpand: null,
		//树节点合拢事件
		onCollapse: null,
		//单层展开
		exclusive: false,
		//插件
		plugins : null
	},
	_create : function(){
		//定义插件集合
		this.pluginInstances = {};
		//初始化消息栈
		this._topics = {};
		//树结点缓存仓库
		this.nodesbase = {};		
		//初始化plugins
		var classes = $.ui.tree.plugins.classes,
			plugins = this.options.plugins || {};
		for(var name in classes){
			if(!plugins[name]){
				continue;
			}
			var clazz = classes[name]; 			
			this.pluginInstances[name] = new clazz(this,plugins[name]);
		};
		this.transformdata(this.options.dataProvider);
		this._render();
		this._funnelEvents();
		//插件启动
		for(var name in this.pluginInstances){
			var instance = this.pluginInstances[name];
			instance.startup && instance.startup();
		}	
	},
	//树结点模板
	templateTreeNode : (function(){
		var html = ["<div class='node'>"]; //节点样式
		html.push("<div class='header'>"); //节点头信息
		html.push("<div class='status'></div>"); //节点状态
		html.push("<div class='logic'></div>"); //节点逻辑框
		html.push("<img class='icon'></img>");  //节点图标
		html.push("<div class='title'></div>"); //节点内容
		html.push("</div>");
		html.push("</div>");
		return $(html.join(""))[0];
	})(),
	//列表结构数据转换成树型结构
	transformdata : function(dataProvider){
		var treeMapping = {},
			rootData=this.options.root,
			root={c:[],d:{}},
			_rd = root.d,
			self =this,
			md = this.options.metadata;
		//定义虚拟跟节点
		this.root =root;
		_rd[md.id] = rootData.id; 
		_rd[md.title] = rootData.title;
		_rd[md.iconURL]=rootData.iconURL;
		_rd[md.leaf] =false;
		//数据仓库
		this.runtimedatasbase = {};
		//如果数据为空返回
		if(!dataProvider.length){
			return;
		}
		//转换属性结构
		if(!(md["pId"] in dataProvider[0])){
			this.transformtreedata(root,dataProvider);
			return; 
		}
		//创建虚拟跟结点
		var treeMapping = {"" : root};
		//构建树型结构，一次循环
		for(var i=0,data;data=dataProvider[i];i++){
			var id = data[md.id],
				pId = data[md.pId] || "";
			//树结点在构造器中
			(id in treeMapping) ? (treeMapping[id]["d"] =data) : (treeMapping[id]={d : data});
			//如果父结点在构造器中
			if(pId in treeMapping){
				var pData =treeMapping[pId];
				(pData["c"] || (pData["c"]=[])).push(treeMapping[id]);
			}
			else{ //否则构建空的结点在构造器中
				var pData = {c:[]};
				pData["c"].push(treeMapping[id]);
				treeMapping[pId]=pData;
			}
		}
		this.runtimedatasbase =treeMapping;
		delete treeMapping[""];
	},
	transformtreedata : function(runtimeData,children){
		var md = this.options.metadata;
		if(children){
			var dp = runtimeData["c"] || (runtimeData["c"]=[]);
			for(var i=0,d;d=children[i];i++){
				var rd ={d:d};
				dp.push(rd);
				//缓存数据
				this.runtimedatasbase[d[md["id"]]] = rd;
				this.transformtreedata(rd,d[md["children"]]);
			}
		}		
	},
	//构建树结构
	_render : function(){
		var element = this.element,
			options = this.options;
		element.addClass("breeze-tree");	
		//构造跟结点数据
		var rootNode = this.renderNode(this.root,0);
		rootNode.addClass("root");		
		if(!this.options.root.visibility){
			rootNode.addClass("noroot");
		}
		element.append(rootNode);
		//展开根结点
		this.expandNode(rootNode);
	},	
	//渲染树结点
	renderNode : function(runtimeData,paddingLeft,nocached){
		var md = this.options.metadata,
			node = $(this.templateTreeNode.cloneNode(true)),
			header=$(">.header",node),
			data=runtimeData["d"],
			id = data[md.id];
		//设置左偏移量
		header.css("paddingLeft",paddingLeft+"px");
		//设置节点唯一标识
		node.attr("nodeId",id);
		//设置用户自定义的节点图片
		$(">.icon",header).attr("src",data[md.iconURL] || breeze.getBlankIcon());
		//设置树节点标题
		$(">.title",header).html(data[md.title] || "&nbsp;");
		//设置树节点的状态
		node.addClass(this.isLeafByData(runtimeData)?"leaf":"collapsed");	
		//把树结点数据结构和展现结构存入缓存中
		if(true!=nocached){
			var treeNode = new TreeNode(this,node,runtimeData);
			this.nodesbase[id] = treeNode;
		}
		//发布事件
		this.publish("renderNode",[treeNode]);
		return node;
	},
	//根据数据判断是否是叶子节点
	isLeafByData : function(runtimeData){
		var md = this.options.metadata,
			xhr = this.options.xhr,
			data =runtimeData["d"],
			children = runtimeData["c"];
		//leaf字段不为空，则此优先级最高
		return null!=data[md.leaf] ? data[md.leaf] :(children!=null ? children.length==0 : (xhr!=null ? false:  true));
	},
	//判断结点是不是叶子结点
	isLeafByNode : function(node){		
		return node.hasClass("leaf");
	},
	//构建子树
	makeupsubtree : function(node,callback){
		if($(">.subtree",node).length){
			callback && callback();
			return;
		}
		var xhr = this.options.xhr,
			md = this.options.metadata,
			treeNode = this.getTreeNode(node),
			runtimeData =treeNode.getRuntimeData(),			
			children = runtimeData["c"],
			self= this;
		if(null==children && null!=xhr){
			//异步获取子结点
			node.addClass("loading");
			//XHR回调方法，用户自己写ajax方法
			xhr(runtimeData["d"],function(children){
				node.removeClass("loading");
				//如果返回的子节点为空
				children = children || [];
				var dp =[];
				for(var k=0,child;child=children[k];k++){
					var rd = {d:child};
					self.runtimedatasbase[child[md["id"]]] = rd;
					dp.push(rd);
				}
				runtimeData["c"] = dp;
				self.publish("xhr-render",[treeNode]);		
				self._makeupsubtree2(treeNode,callback);
			});
			return;
		}
		this._makeupsubtree2(treeNode,callback);
	},
	_makeupsubtree2: function(treeNode,callback){
		var node = treeNode.getNode(),
			runtimeData = treeNode.getRuntimeData(),
			children = runtimeData["c"] || [];
		if(this.isLeafByData(runtimeData)){
			node.removeClass("collapsed");
			node.addClass("leaf");
			return;
		}
		var subtree = $("<div class='subtree'></div>"),
			paddingLeft = this.getLeftPadding(node)+20;
		//创建子节点
		for(var i=0,child;child = children[i];i++){
			subtree.append(this.renderNode(child,paddingLeft));
		}
		//插入子树
		node.append(subtree);
		//发布创建子树的事件
		this.publish("makeupsubtree",[treeNode]);
		//执行回调
		callback && callback();
	},
	//展开某一节点
	expandNode : function(node,callback,exclusive){
		if(this.isLeafByNode(node)) return;
		//互斥展开
		if(exclusive){
			var nodes = $(">.node.expanded",node.parent());
			for(var i=0,bn;bn=nodes[i];i++){		
				(bn!=node[0]) && this.collapseNode($(bn));
			}
		}
		//获取结点的状态和标识元素
		var subtree = $(">.subtree",node),
			self =this;
		//存在子树容器
		if(subtree.length){
			if(node.hasClass("collapsed")){
				node.removeClass("collapsed");
				node.addClass("expanded");
				setTimeout(function(){
					if(subtree.width()){
						subtree.show("fast",function(){
							callback && callback();
							var onExpand =  self.options.onExpand;
							onExpand && onExpand();							
						});
					}
					else{
						subtree.css("display","block");
						callback && callback();
					} 
				},0);
			}
			else{
				callback && callback();
			}
			return;
		}
		//如果子树容器不存在则创建
		var self = this;
		this.makeupsubtree(node,function(){
			//重新调用展开方法
			self.expandNode(node,callback,exclusive);
		});
	},
	getLeftPadding : function(node){
		return  parseInt($(">.header",node).css("paddingLeft"),10);
	},
	//关闭某一节点
	collapseNode : function(node,callback){
		if(this.isLeafByNode(node)) return;
		//获取结点的状态和标识元素
		var subtree = $(">.subtree",node),
			self =this;
		if(subtree.length){
			if(node.hasClass("expanded")){ //如果是关闭的
				node.removeClass("expanded");
				node.addClass("collapsed");
				subtree.hide("fast",function(){					
					callback && callback();
					var onCollapse = self.options.onCollapse;
					onCollapse && onCollapse();
				});
			}
		}
	},
	//展开/关闭某一结点
	toggle : function(node){
		this._toggle(node,this.options.exclusive);
	},
	_toggle : function(node,exclusive){
		node.hasClass("expanded") ? this.collapseNode(node) : this.expandNode(node,null,exclusive);
	},
	//获取树节点对象
	getTreeNode : function(node){
		return this.nodesbase[node.attr("nodeId")];
	},
	refresh : function(treeNode){
		/**
		* 刷新结点，重新构造其子树等内容
		*/
		var self = this,
			md= this.options.metadata,
			node = treeNode.getNode();
		this.foreach({
			treeNode : treeNode,
			each : function(runtimeData){
				var data = runtimeData["d"],
					id = data[md["id"]];
				delete self.runtimedatasbase[id];
				delete self.nodesbase[id];
			}
		});
		var newNode = this.renderNode(treeNode.getRuntimeData(),this.getLeftPadding(node));		
		node.after(newNode);
		node.remove();
		//保留选中样式
		if(this.selectedNode && (this.selectedNode[0] ==node[0])){
			this.selectedNode = newNode;
			newNode.addClass("selected");
		}
	},
	expandAll: function(){
		/**
			展开所有节点
		**/
		var expendingNodeList = [];		
		var nodeList = $(".node.collapsed",this.element);
		for(var i=0,childNode;childNode=nodeList[i];i++){
			expendingNodeList.push($(childNode));
		}		
		this._expandAll2(expendingNodeList);		
	},
	_expandAll2 : function(expendingNodeList){
		var self =this;
		(function(expendingNodeList){
			if(expendingNodeList.length==0) return;
			var func = arguments.callee,
				node = expendingNodeList.shift();
			self.expandNode(node,function(){
				var nodeList = $(">.subtree>.node.collapsed",node);
				for(var i=nodeList.length-1,childNode;childNode=nodeList[i];i--){
					expendingNodeList.unshift($(childNode));
				}
				self._expandAll2(expendingNodeList);
			});		
		})(expendingNodeList);
	},
	collapseAll: function(){
		/**
			合拢所有节点
		**/
		var nodeList = $(".node.expanded",this.element),
			self = this;
		(function(index){
			if(index<0) return;
			var func =arguments.callee;
			self.collapseNode($(nodeList[index]),function(){
				func(index-1);
			});		
		})(nodeList.length-1);
	},
	//获取根节点对象
	getRootNode : function(){
		return this.getTreeNode($(">.root",this.element));
	},
	//遍历树结点数据
	foreach : function(inData){
		/**
		* 
		* each
		* complete
		* allLoading
		*/
		var xhr = this.options.xhr,
			md =this.options.metadata,
			runtimeData=inData.treeNode.getRuntimeData(),
			each = inData.each,
			complete = inData.complete,
			whole = inData.whole,
			self =this;
		(function(loadingList){
			if(0==loadingList.length){
				complete && complete();
				return;
			}
			var func = arguments.callee,
				data=loadingList.shift();
			//遍历节点执行回调
			each && each(data);
			//递归
			if(self.isLeafByData(data)){
				func(loadingList);
			}
			else{
				var children = data["c"];
				if(null!=children){ //本地存在
					Array.prototype.push.apply(loadingList,children);
					func(loadingList);
				}
				else if(whole && xhr!=null){
					xhr(data["d"],function(children){	
						children = children || [];
						var dp =[];
						for(var k=0,child;child=children[k];k++){
							var rd = {d:child};
							self.runtimedatasbase[child[md["id"]]] = rd;
							dp.push(rd);
						}
						Array.prototype.push.apply(loadingList,data["c"] = dp);
						func(loadingList);
					});
				}
				else{
					func(loadingList);
				}
			}			
		})([runtimeData]);
	},	
	expand: function(xpath,callback){
		/**
			根据指定路径展开指定结点
		**/
		var exclusive=this.options.exclusive,
			ids = xpath.split("/"),
			self = this;
		//如果只有一个参数
		if(ids.length==1){
			var treeNode = this.nodesbase[xpath];
			if(treeNode){
				var node = treeNode.getNode().parent();
				while(this.element[0]!=node[0]){
					if(node.hasClass("node")){
						ids.unshift(node.attr("nodeId"));
					}
					node=node.parent();
				}
				ids.shift();
			}
		}
		ids.unshift(this.options.root.id);
		(function(subtree){			
			var func = arguments.callee,
				node = $(">.node[nodeId='"+ids.shift()+"']",subtree);
			if(!node.hasClass("leaf")){
				self.expandNode(node,function(){
					ids.length ? func($(">.subtree",node)) : (callback && callback(node));
				},exclusive);
			}
			else{
				callback && callback(node);
			}
		})(this.element);
	},
	select: function(xpath,callback){
		/**
			根据指定路径选择并展开指定结点
		**/
		var ids = xpath.split("/"),
			self = this,
			exclusive=this.options.exclusive;
		//如果只有一个参数
		if(ids.length==1){
			var treeNode = this.nodesbase[xpath];
			if(treeNode){
				var node = treeNode.getNode().parent();
				while(this.element[0]!=node[0]){
					if(node.hasClass("node")){
						ids.unshift(node.attr("nodeId"));
					}
					node=node.parent();
				}
				ids.shift();
			}
		}
		ids.unshift(this.options.root.id);	
		(function(subtree){			
			var func = arguments.callee,
				node = $(">.node[nodeId='"+ids.shift()+"']",subtree);
			if(ids.length==0){
				self.switchSelectedNode(node);
				callback && callback();
				return;
			}
			if(!node.hasClass("leaf")){
				self.expandNode(node,function(){
					func($(">.subtree",node));
				},exclusive);
			}					
		})(this.element);
	},
	getSelected : function(){
		/**
			选取选中的节点
		**/
		if(this.selectedNode){
		    return this.nodesbase[this.selectedNode.attr("nodeId")];
		}
	},
	//切换选中节点
	switchSelectedNode : function(node){
		if(this.selectedNode){
			this.selectedNode.removeClass("selected");
		}
		node.addClass("selected");
		this.selectedNode = node;
	},
	clearSelectedNode : function(){
		if(this.selectedNode){
			this.selectedNode.removeClass("selected");
			this.selectedNode =null;
		}
	},	
	//绑定事件
	_funnelEvents : function(){
		var self = this;
		this.element.click(function(e){
			var element = $(e.target);
			//点击树结点图标
			if(element.hasClass("status") || element.hasClass("icon")){
				self.toggle(breeze.parent(element,"node"));
			}
			//执行点击文本的处理
			else if(element.hasClass("title")){
				var node = breeze.parent(element,"node"),	
					onClick = self.options.onClick;
				self.switchSelectedNode(node);
				onClick && onClick(self.getTreeNode(node));
			}
		});
	},
	//获取插件实例
	getPlugin : function(name){
		return this.pluginInstances[name];
	},
	//发布消息
	publish : function(topic,args){		
		$.each(this._topics[topic] || [],function(index,method){
			method.apply(null,args || []);
		});
	},
	//订阅消息
	subscribe : function(topic,context,method){		
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
	}
});
  /**
  * 定义Grid扩展插件
  * @author yangzz
  * @version 1.0
  */
 $.ui.tree.plugins = new function(){
	 this.classes = {};
	 this.register = function(name,clazz){
		 this.classes[name] = clazz;
	 };
 }();
})(jQuery);
