/*
 * breeze common 1.0
 *
 * Description : Various tools
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 *		lib/jquery.js
 */
 
 function getOwnerContext(){
 	return document.body;
 }
 
(function($){
//构建全局的breeze对象
if(!window.breeze){
	breeze={};
}
//获取应用的上下文路径 	
breeze.getBreezeContextPath = function(){
	/**
	 * ip address such as :
	 * http://192.168.1.1/framework/breeze/lib/jquery.js
	 * http://192.168.1.1/breeze/lib/jquery.js
	 * http://www.breeze.cc/framework/breeze/lib/jquery.js
	 * http://www.breeze.cc/breeze/lib/jquery.js
	 */
	var head = document.getElementsByTagName("head")[0] || document.documentElement,
		scripts = head.getElementsByTagName("script");
	for(var i=0,script,src,matcher;script=scripts[i];i++){
		if((src = script.src) && (matcher = src.match(/\/jquery[^\/]*\.js$/i))){
			var contextPath = "";
			//采用的是相对路径
			if(!/(^\/)|(^http)/.test(script.getAttribute("src"))){
				contextPath = src.substring(0,src.lastIndexOf("/")+1) + "../";
			}
			else{
				src = src.substring(0,src.indexOf("/lib"));
				contextPath = src +"/";
			}
			return (breeze.getBreezeContextPath= function(){
				return contextPath;
			})();
		}
	}
	throw new Error("miss jQuery lib,can not to analysis application context path.");
};
/**
*构建遮挡层
*/
breeze.mask = new function(){
	var pageMask = null;
	//显示页面遮挡层
	this.showPageMask = function(){
		if(null==pageMask){
			var html =["<div class='breeze-pagemask'>"];
			html.push("<div class='chunkA'></div>");
			html.push("<div class='chunkB'></div>");
			html.push("<div class='chunkC'></div>");
			html.push("<div class='chunkD'></div>");
			html.push("</div>");
			pageMask = $(html.join(""));
			pageMask.appendTo('body');
		}
		pageMask.show();
		$(">.chunkA",pageMask).animate({
			width: "50%",
			height: "50%"
		},"slow");
		$(">.chunkB",pageMask).animate({
			width: "50%",
			height: "50%"
		},"slow");
		$(">.chunkC",pageMask).animate({
			width: "50%",
			height: "50%"
		},"slow");
		$(">.chunkD",pageMask).animate({
			width: "50%",
			height: "50%"
		},"slow");		
	};
	//隐藏页面遮挡层
	this.hidePageMask = function(){
		if(null!=pageMask){
			$(">.chunkA",pageMask).animate({
				width: "0",
				height: "0"
			},"slow");
			$(">.chunkB",pageMask).animate({
				width: "0",
				height: "0"
			},"slow");
			$(">.chunkC",pageMask).animate({
				width: "0",
				height: "0"
			},"slow");
			$(">.chunkD",pageMask).animate({
				width: "0",
				height: "0"
			},"slow",function(){
				pageMask.hide();
			});		
		}		
	}
	
	var ajaxMask = null;
	//显示ajax请求遮挡层
	this.showAjaxMask = function(){
		if(!ajaxMask){
			var html = ["<div class='breeze-ajaxmask'>"];
			html.push("<div class='mask'></div>");
			html.push("<div class='detail'>");
			html.push("<div class='shift'>");
			html.push("<label>正在加载请稍候...</label>");
			html.push("</div>");
			html.push("</div>");
			html.push("</div>");
			ajaxMask = $(html.join("")).appendTo('body'); 
		}
		ajaxMask.show();
	}
	//隐藏ajax请求遮挡层
	this.hideAjaxMask = function(){
		ajaxMask && ajaxMask.hide();
	}
	//显示容器的进度条
	this.showBoxLoading = function(box){
		box.append($("<div class='breeze-boxloading'></div>"));
	}
	this.hideBoxLoading = function(box){
		var loading = $(">.breeze-boxloading",box);
		loading.fadeOut("normal",function(){
			loading.remove();
		});
	}
}();
//停止冒泡
breeze.stopEvent = function(e){
	e.stopPropagation ? e.stopPropagation():(e.cancelBubble=true);	
};
//却空格操作
breeze.trim = function(s){
	return s.replace(/(^\s+)|(\s+$)/g,"");
}
//转换模板，返回transformer
breeze.transformTemplate = function(templateString){
	/**
	 * var template = "<div class='$className'><lable>#content</label></div>";
	 * var transform = breeze.transformTemplate(template);
	 * var html = transform({className : "welcome",content:"hello world."});  
	 */
	var func = [],
		str = templateString,
		variants={}, //过程变量记录器
		result,
		index,
		x=0;
	function parseString(s){		
		return s.replace(/"/g,"\\\"").replace(/[\n\r]+/g,"\\\n");
	}
	function parseBracket(s){ //获取括号表达式
		var v = [],r,m = 0;		
		do{
			if(r=s.match(/[\(\)]+?/)){
				v.push(s.substring(0,r.index+1));
				s = s.substring(r.index+1);
				"("==r[0] ? m++ :m--;
			}
			else{
				break;
			}
		}while(m);
		return v.join("");
	}
	function parseExpression(s){
		var r,m,i;
		while(r=s.match(/\$[\w\.]+/)){
			if(i = r.index){						
				func.push(s.substring(0,i));		
			}
			m = r[0];
			s = s.substring(i+m.length);
			var keys = m.replace(/^\$/,""),
				firstKey = keys.split(".")[0];
			//如果是自定义变量
			if(firstKey in variants){						
				func.push(keys);						
			}
			else{						
				func.push("dataMap."+keys);						
			}		
		}
		func.push(s);
	}
	//构造匿名函数
	func.push("var html=\"\";\n");
	while(result=str.match(/(#|\$)[\w\.]+/)){ //
		//如果坐标位置大于0
		if(index = result.index){
			func.push(" html+=\"");
			func.push(parseString(str.substring(0,index)));
			func.push("\";\n");	
		}
		//截取剩余的模板串
		str = str.substring(index+result[0].length); 
		//匹配表达式
		switch(result[0]){
			case "#if" :	
				func.push(" if");				
				//截取括号表达式
				result=parseBracket(str); //if($var>1 && ($abc<1 || $abc>0))
				str = str.substring(result.length);
				parseExpression(result);
				func.push("{\n");
				break;
			case "#else" :
				func.push("}\nelse{\n");
				break;
			case "#set" :
				//截取括号表达式	
				result=parseBracket(str);//$set($o=$objs[$item])
				str = str.substring(result.length);
				var entry = result.replace(/\(|\)/g,"").split("="),
					key= breeze.trim(entry[0]).replace(/^\$/,""),
					value=breeze.trim(entry[1]);
				func.push("var ");
				func.push(key);
				func.push("=");	
				parseExpression(value);
				func.push(";\n");
				variants[key] = 1;	
				break;
			case "#expression":
				//截取括号表达式
				result=parseBracket(str);	//$expression($objs[$item].getTitle())
				str = str.substring(result.length);
				func.push("html+=");
				parseExpression(result.replace(/^\(|\)$/g,""));
				func.push(";\n");
				break;
			case "#foreach" :
				//截取括号表达式
				result=parseBracket(str);
				str = str.substring(result.length);
				if(/\sin\s/.test(result)){ //foreach($var in $object)
					var entry = result.replace(/\(|\)/g,"").split(" in "),
						key = breeze.trim(entry[0]).replace(/^\$/,""),
						object =  breeze.trim(entry[1]).replace(/^\$/,"");
					func.push("for(var ");
					func.push(key);
					func.push(" in ");
					var firstKey = object.split(".")[0];	
					func.push(((firstKey in variants)?"":"dataMap.")+object);
					func.push(")");	
					func.push("{\n");
					variants[key] = 1;
				}
				else{
					var entry =  result.replace(/\(|\)/g,"").split(/[:,]/),
						key = breeze.trim(entry[0]).replace(/^\$/,""),
						array = breeze.trim(entry[1]).replace(/^\$/,""),
						index = entry[2] && breeze.trim(entry[2]).replace(/^\$/,"");
					if(!isNaN(array)){// foreach($var : 5)
						func.push("for(var ");
						func.push(key);
						func.push("=0;");
						func.push(key);
						func.push("<");
						func.push(array);
						func.push(";");
						func.push(key);
						func.push("++)");
						func.push("{\n");
					}
					else{ //foreach($var : $array|Number,$index)
						var lvar = "x"+x,
							dataList = "dataList"+x, 
							len="len"+x;
						func.push("for(var ");
						func.push(lvar)
						func.push("=0,");
						func.push(dataList);
						func.push("=");
						var firstKey = array.split(".")[0];	
						func.push(((firstKey in variants)?"":"dataMap.")+array);
						func.push(",");
						func.push(len);
						func.push("=");
						func.push(dataList);
						func.push(".length");
						func.push(",");
						if(null!=index){
							func.push(index);
							func.push(",");
						}
						func.push(key);
						func.push(";");
						func.push(lvar);
						func.push("<");
						func.push(len);						
						func.push(";");
						func.push(lvar);
						func.push("++)");
						func.push("{\n");
						func.push(key);
						func.push("=");
						func.push(dataList);
						func.push("[");
						func.push(lvar);
						func.push("];\n");
						if(null!=index){
							func.push(index);
							func.push("=");
							func.push(lvar);
							func.push(";\n");
							variants[index] = 1;
						}
						x++;
					}
					variants[key] = 1;
				}				
				break;
			case "#end" :
				func.push("}\n");
				break;
			default : 
				var keys = result[0].replace(/^\$/,""),
					firstKey = keys.split(".")[0];
				//执行用户回调方法
							
				//如果是自定义变量
				if(firstKey in variants){
					func.push(" html+=");
					func.push(keys);
					func.push(";\n");
				}
				else{
					func.push(" html+=");
					func.push("dataMap."+keys);
					func.push(";\n");
				}
		}	
	}
	func.push("html+=\"");
	func.push(parseString(str));
	func.push("\";\n");
	func.push("return html;\n");
	return new Function("dataMap",func.join(""));	
};

//$.transformTemplate = function(templateString,objects){
	/**
	 * var template = "<div class='#{className}'><lable>#{content}</label></div>";
	 * var transform = $.transformTemplate(template);
	 * var html = transform({className : "welcome",content:"hello world."});  
	 * 
	 * 		or
	 * var template = "<div class='#{0}'><lable>#{1}</label></div>";
	 * var transform = $.transformTemplate(template);
	 * var html = transform([ "welcome","hello world."]);  
	 */
//	var str = templateString, 
//		expression = /#\{[<>a-zA-Z0-9]+\}/,
//		substitute =  /(#\{)|(\})/g,
//		markup = [],
//		mapping =[]
//		r = null;
//	objects = objects || {};
//	while(r = str.match(expression)){
//		var index = r.index;
//		if(index!=0){
//			markup.push(str.substring(0,index));
//		}
//		mapping.push([markup.length,r[0].replace(substitute,"")]);
//		markup.push(r[0]);
//		str = str.substring(index+r[0].length);
//	}
//	str!="" && markup.push(str);
//	return function(data,param){
//			var html = [];
//			for(var i=0,map;map =mapping[i];i++){
//				var index = map[0],
//			  	name = map[1],
//			  	value = "";
//				if(name in objects){
//			  		value = objects[name](data,param);
//			  	}
//				else if(null!=data[name]){
//			  		value = String(data[name]);
//			  	}
//				markup[index] = value;
//			}	
//			html.push(markup.join(""));
//			return html.join("");
//		}
//};
//获取幂级父节点
breeze.getPowerParent = function(node,power){
	while(power--){
		node = node.parentNode;
	}
	return node;
}
//获取最外层top帧
breeze.getTop = function(){
	var win = window.opener || window;
	try{
		win.top.navigator;
		return win.top;
	}catch(e){
		try{
			do{
				var pwin = win.parent;
				pwin.navigator;
				win = pwin;
			}while(win);
		}catch(e1){
			return win;
		}
	}
}
//把数组转换成对象
breeze.array2obj = function(array){
	var obj = {};
	for(var i = array.length -1; i>=0;i--){
		obj[array[i]] = 1;
	}
	return obj;
}
//获取参数，如果有回调方法则执行
breeze.getParameters = function(parameters){
	var data = {};
	for(var name in parameters){
		data[name] =  jQuery.isFunction(parameters[name]) ? parameters[name]() : parameters[name];
	}
	return data;
}
//获取空白图片内容
breeze.getBlankIcon = function(){
	return "data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
}
//统一的XHR请求
breeze.ajax = function(data){
	$.ajax({
		url: data.url,
		data: data.data,
		asyn: data.asyn,
		dataType: data.dataTpye || "text",
		success: function(response){
			//处理超时问题
			data.success && data.success(response);
		},
		error: function(err){
			data.error && data.error(err);
		}
	});
}
//获取第一个匹配的结点
breeze.parent = function(element,className,context){
	context = $(context || document.body)[0];
	var node = $(element);
	do{
		if(node.hasClass(className)){
			return node;
		}
		node = node.parent();
	}while(node[0]!=context)
	return null;
}
//获取第一个匹配的结点
breeze.parents = function(element,className,context){
	context = $(context || document.body)[0];
	var node = $(element).parent(),
		nodes=[];
	while(node[0]!=context){
		if(node.hasClass(className)){
			nodes.push(node);
		}
		node = node.parent();
	}
	return nodes;
}
/**
 * jQuery patch
 */
var opt = Object.prototype.toString;
function isObject(o){
	return "[object Object]"==opt.call(o);
}
function extendOptions(o1,o2){
	for(var name in o2){
		if(name in o1){
			if(null!=o1[name] 
				&& isObject(o1[name])
				&& isObject(o2[name])){
				extendOptions(o1[name],o2[name]);
				continue;
			}			
		}
		o1[name] = o2[name];			
	}
}

 $.Widget.prototype._createWidget= function( options, element ) {
		// $.widget.bridge stores the plugin instance, but we do it anyway
		// so that it's stored even before the _create function runs
		$.data( element, this.widgetName, this );
		this.element = $( element );
		this.options = $.extend( true, {},
			this.options,
			this._getCreateOptions());

		extendOptions(this.options,options);

		var self = this;
		this.element.bind( "remove." + this.widgetName, function() {
			self.destroy();
		});

		this._create();
		this._trigger( "create" );
		this._init();
}
function copy2array(collection){
	var array = [];
	for(var i=0,l=collection.length;i<l;i++){
		array.push(collection[i]);
	}
	return array;
}
//执行javascript脚本
function evalScript(data){
	var head = document.getElementsByTagName("head")[0] || document.documentElement,
		scriptElement = document.createElement("script");
	scriptElement.type = "text/javascript";
	scriptElement.text = data;
	head.appendChild(scriptElement);
	head.removeChild(scriptElement);
}
var _loadedResources = null,
	autowire = ["function getOwnerContext(){return ownerContext;}\n"];

breeze.xhrload = function(data){
	if("string"== typeof(data)){
		data = {url : data, context : document.body};
	}
	var url = data.url,
		parameters = data.parameters || {},
		load = data.load,
		context = $(data.context);
	//清空内容	
	context.empty();
	//弹出进度条
	breeze.mask.showBoxLoading(context);
	$.ajax({
		url : url,
		dataType : "html",
		data : breeze.getParameters(parameters),
		error : function(){
			//加载页面出错
			context.html("<div class='error'></div>");
			breeze.mask.hideBoxLoading(context);
		},
		success : function(html){
			var head = document.getElementsByTagName("head")[0] || document.documentElement,
				safeFragment = document.createDocumentFragment(),
				div = document.createElement("div");
			
			if(null==_loadedResources){
				_loadedResources = {};
				var scripts = head.getElementsByTagName("script");
				for(var i=0,script;script=scripts[i];i++){
					if(script.src){
						_loadedResources[script.src] = 1;
					}
				}
			}	
			safeFragment.appendChild(div);
			div.innerHTML = "div<div>"+html + "</div>";
			div = div.lastChild;
			div.insertBefore(document.createTextNode(""), div.firstChild);
			
			//收集script节点
			var scripts =[],
					scriptElements = copy2array(div.getElementsByTagName("script"));
			for(var i = 0; script =scriptElements[i] ;i++){
				script.parentNode.removeChild(script);
				if(script.src){
					var src = script.getAttribute("src");
					if(!/^\/|^http/.test(src)){
						script.setAttribute("src",url.substring(0,url.lastIndexOf("/")+1)+src);
						src=script.src;
					}
					if(!(src in _loadedResources)){
						scripts.push(script);
						_loadedResources[src] = 1;
					}
				}
				else{
					scripts.push(script);
				}					
			}
			//添加DOM
			
			while(div.hasChildNodes()){
				context.append(div.firstChild);
			}
			//执行脚本
			(function(i){
				var script = scripts[i];
				if(null==script){
					breeze.mask.hideBoxLoading(context);
					load && load();
				}
				else{
					var func = arguments.callee,
						scriptContext = script.getAttribute("context"),
						src = script.src;
					if(src){
						if(scriptContext){
							$.ajax({
								url : src,
								dataType : "text",
								success : function(data){
									autowire[1]=data;
									(new Function("ownerContext",autowire.join("")))(context);
									func(i+1);
								},
								error: function(){
									//加载脚本出错
									func(i+1);
								}
							});
						}
						else{
							var scriptElement = document.createElement("script");
							scriptElement.type = "text/javascript";
							scriptElement.src = src;
							scriptElement.onload = scriptElement.onreadystatechange = scriptElement.onerror =function(){ 
								if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete" ) {
									this.onload = this.onreadystatechange = this.onerror = null;
									this.parentNode.removeChild(this);
									func(i+1);
								}
							}
							head.appendChild(scriptElement);
						}
					}
					else{
						var data = script.text || script.textContent || script.innerHTML || "";
						if(scriptContext){
							autowire[1]=data;
							(new Function("ownerContext",autowire.join("")))(context);
						}
						else{
							evalScript(data);
						}
						func(i + 1);
					}
				}
			})(0);
		}
	});
}

 })(jQuery);
