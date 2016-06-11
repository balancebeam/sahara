/*
 *
 */

 (function( $, undefined ) {

 var styleSheets = {};
	 
 $.widget("ui.metro",$.ui.container, {
	options: {
		//宽度
		width: "auto",
		//间距
		margin: 10,
		//大小
		size: 100,
		//放大比例
		//scale: 1.1,
		//自动布局
		layout: "fluid", //流式布局（fluid）、自动布局（auto）、自由布局（free）
		//列个数定义
		column: "fluid",
		//最大块数
		maxColumn: 20,
		//是否显示标题
		untitled: false,
		//数据源
		dataProvider: [],
		//动画执行时间
		animationExecutionTime: 500, 
		//动画间隔时间
		animationIntervalTime: 5000,
		//点击事件
		onClick: null,
		//关闭事件
		onClose: null,
		//是否拖拽调整位置
		draggable: true,
		//是否拖拽调整大小
		resizable: true,
		//统一的颜色
		color: null,
		//是否可删除
		removable: true
	},
	//随机颜色
	colors: ["darkblue","orange","red","blue","darkgreen","darkred","green","purple","yellow","grey"],
	//动画效果
	animations: ["flip","roll"],
	//动画方向
	orientations: ["horizontal","vertical"],
	//渲染内容
	render : function(){
		this.index= 0;
		this.nodebase = []; //节点缓存
		this.database = {}; //数据缓存
		this.animationbase={}; //执行动画缓存
		this.element.addClass("breeze-metro");
		this.options.untitled && this.element.addClass("untitled");
		this.element.addClass("fluid"==this.options.layout?"fluid":"autoplace");
		this.cols = this.options.column;
		this.gridmap = [];
		var dataProvider = this.options.dataProvider,
			fragment = document.createDocumentFragment();
		for(var i=0,data;data=dataProvider[i];i++){
			fragment.appendChild(this.generateTile(data));
		}
		this.createRuntimeStyle();
		this.element.append(fragment);
	},
	//创建运行时样式
	createRuntimeStyle : function(){
		if(this.styleId!=null){
			this.element.removeClass(this.styleId);
		}
		var html = [],
			options = this.options,
			size = options.size,
			margin = options.margin,
			styleId = this.styleId = ("m"+size+"-"+margin);
		this.element.addClass(this.styleId);
		if(styleId in styleSheets){
			return;
		}
		var css = document.createElement('style');
		css.setAttribute('type', 'text/css');
		styleSheets[styleId] = css;	
				
		for(var i=1,maxColumn=options.maxColumn,width,height;i<=maxColumn;i++){
			//定义宽度样式
			html.push(".");
			html.push(styleId);
			html.push(">");
			html.push(".tile.col");
			html.push(i);
			html.push("{");
			html.push("width: ");
			html.push(width=(size*i+(i-1)*margin));
			html.push("px;}\n");			
			//定义高度样式
			html.push(".");
			html.push(styleId);
			html.push(">");
			html.push(".tile.row");
			html.push(i);
			html.push("{");
			html.push("height: ");
			html.push(height=(size*i+(i-1)*margin));
			html.push("px;}\n");			
		}		
		var cssText = html.join("");
		if(css.styleSheet) { // IE
			css.styleSheet.cssText = cssText;
		} else {
			css.appendChild(document.createTextNode(cssText));
		}
		document.getElementsByTagName("head")[0].appendChild(css); 			
	},
	//构建一个Tile结点
	generateTile : function(data){
		var html=[],			
			tileId = this.index++;
		html.push("<div class='tile unloaded ");
		html.push( "col"+(data.col || 1)+" row"+(data.row || 1));
		html.push("'>");
		html.push("<div class='close'></div>");
		html.push("<div class='container'>");	
		html.push("</div>");
		html.push("<span class='title'>");
		html.push(data.title || "");
		html.push("</span>");
		if("free"==this.options.layout && 
			this.options.resizable){
			html.push("<div class='tile-resize s'></div>");
			html.push("<div class='tile-resize e'></div>");
			html.push("<div class='tile-resize se'></div>");
		}
		html.push("</div>");
		var node = $(html.join("")),
			color = data.color || this.options.color || this.colors[Math.floor(Math.random()*this.colors.length)];
		node.addClass(color);	
		node.attr("tileId",tileId);
		data.tileId = tileId;
		if(!data.content){
			var urls = data.iconURL || breeze.getBlankIcon(),
				container = $(">.container",node);
			if(typeof(urls)=="string"){
				urls = [urls];
			}
			for(var i=0,url;url=urls[i];i++){
				var box = $("<img ondragstart='return false' class='box'/>");
				box.attr("src",url);
				container.append(box);
			}
		}
		else{
			var container = $(">.container",node),
				content = data.content;
			if(!jQuery.isArray(content)){
				content =[content];
			}
			for(var i=0;i<content.length;i++){
				var box = $("<div class='box'></div>");
				this.loadContext(jQuery.extend({context:box},content[i]));
				container.append(box);
			}
		}
		if($(">.container",node).children().length>1){
			node.append($("<div class='prev'></div>"));
			node.append($("<div class='next'></div>"));
		}
		if(this.options.untitled){
			$(">.title",node).addClass(color);
		}
		this.nodebase.push(node[0]);
		this.database[tileId]=data;	
		this.makeTileAnimation(node);
		return node[0];
	},
	//增加一个Tile
	addTile : function(data){
		var node = this.generateTile(data);
		this.element.append(node);
		$.each(this.getChildren(node),function(index,child){
			child.resize(wr);
		});
		this.resize0();
	},
	resize : function(){
		var onResize = this.options.onResize;
		this.runtimeWidth = this.element.width();
		if(this.options.column=="fluid"){
			var margin = this.options.margin, 
				size = this.options.size;
			this.cols = Math.max(1,Math.floor((this.runtimeWidth+margin)/(size+margin)));
			if(this.options.layout=="free"){
				this.cols = this.options.column= this.options.maxColumn;
			}
		}
		else if(this._hasInitited){
			onResize && onResize(this.runtimeWidth);
			return;
		}
		if(!this._hasInitited){ //因为Tile是固定大小，初始化只执行一次
			$.each(this.getChildren(),function(index,child){
				child.resize(wr);
			});
		}
		this.resize0();
		onResize && onResize(this.runtimeWidth);
		this._hasInitited = true;
	},
	resize0 : function(){
		var options = this.options,
			margin = options.margin, 
		    size = options.size,
			flipNodes = [],
			self = this;
		
		switch(options.layout){
			case "fluid":
				for(var i=0,node;node=this.nodebase[i];i++){
					node = $(node);
					if(node.hasClass("unloaded")){
						flipNodes.push(node);
					}
				}
				break;
			case "auto": 
				this.gridmap = [];
				for(var i=0,node;node=this.nodebase[i];i++){
					node = $(node);
					var position = this.fixNodePosition(node),
						nLeft = position.x*(size+margin)+"px",
						nTop =  position.y*(size+margin)+"px";
					node.css({
						left: nLeft,
						top: nTop
					});
					if(node.hasClass("unloaded")){						
						flipNodes.push(node);						
					}					
				}
				break;
			case "free": 
				var autoArray = [];
				for(var i=0,node;node=this.nodebase[i];i++){
					node = $(node);
					node.stop();					
					var tileId = node.attr("tileId"),
						data = this.database[tileId];
					if(("x" in data) && ("y" in data)){						
						var x = data.x,
							y = data.y,
							row =data.row || 1,
							col = data.col || 1,
							nLeft = x*(size+margin)+"px",
							nTop = y*(size+margin)+"px";
						if(node.hasClass("unloaded")){
							//只有在新增的情况下设置gridmap的位置
							for(var k=y;k<y+row;k++){
								null==this.gridmap[k] && (this.gridmap[k]=[]);
								for(var j=x;j<x+col;j++){
									this.gridmap[k][j] =tileId; 
								}
							}
							flipNodes.push(node);
						}
						if(!node.hasClass("mouseAction")){
							node.css({
								left: nLeft,
								top: nTop
							});
						}					
					}
					else{
						autoArray.push(node);
					}
				}
				//初始化时自由布局一个合适的位置
				for(var i=0,node;node=autoArray[i];i++){
					var tileId = node.attr("tileId"),
						data = this.database[tileId],
						position = this.fixNodePosition(node),
						nLeft = (data.x = position.x)*(size+margin)+"px",
						nTop = (data.y = position.y)*(size+margin)+"px";

					if(node.hasClass("unloaded")){						
						flipNodes.push(node);						
					}
					node.css({
						left: nLeft,
						top: nTop
					});
				}
		}	
		//执行初始化动画
		(function(){
			if(0==flipNodes.length){
				return;
			}
			var func = arguments.callee,
				node = flipNodes.shift();						
			setTimeout(function(){
				node.addClass("loaded");	
				setTimeout(function(){
					node.removeClass("unloaded");
					node.removeClass("loaded");
					self.doTileAnimation(node);
				},300);	
				func();
			},100);					
		})();		
	},	
	//自动布局
	fixNodePosition : function(node){
		var tileId = node.attr("tileId"),
			data = this.database[tileId],
			row = data.row || 1,
			col = data.col || 1,
			rowIndex = 0;

		while(true){
			if(col>=this.cols){
				col = this.cols;
			}			
outer:	for(var colIndex=0;colIndex<this.cols;colIndex++){
				var endRowIndex = rowIndex+row,
						endColIndex = colIndex+ col;
				if(endColIndex>this.cols){
					break ;
				}
				for(var i=rowIndex;i<endRowIndex;i++){
					null==this.gridmap[i] && (this.gridmap[i]=[]);
					for(var j=colIndex;j<endColIndex;j++){
						if(null!=this.gridmap[i][j]){
							continue outer;
						}
					}
				}
				for(var i=rowIndex;i<endRowIndex;i++){
					for(var j=colIndex;j<endColIndex;j++){
						this.gridmap[i][j] = tileId;					
					}
				}
				return {y: rowIndex,x:colIndex};
			}
			rowIndex++;
		}
	},
	//创建Tile动画
	makeTileAnimation : function(node){
		var boxs = $(">.container>.box",node);
		if(boxs.length==1) return;
		var tileId = node.attr("tileId"),
			data = this.database[tileId],
			animations= this.animations,
			orientations = this.orientations,
			animation = data.animation || animations[Math.floor(animations.length*Math.random())],
			orientation = data.orientation || orientations[Math.floor(orientations.length*Math.random())],
			runtimeAnimation = this.animationbase[tileId] = {
				animation: animation,
				orientation: orientation
			};		
		//设置动画样式
		if("roll"==animation){	
			var nodes = [];
			runtimeAnimation["nodes"]= nodes;
			runtimeAnimation["focusIndex"]= 0;
			switch(orientation){
				case "vertical":
					jQuery.each(boxs,function(index){
						var box = $(this);
						box.css("top",(index*100)+"%");
						nodes.push(box);
					});
					runtimeAnimation["divisor"] = -1;
					runtimeAnimation["styleAttr"] = "top";
					break;				
				case "horizontal":
					jQuery.each(boxs,function(index){
						var box = $(this);
						box.css("left",(index*100)+"%");
						nodes.push(box);
					});
					runtimeAnimation["divisor"] = -1;
					runtimeAnimation["styleAttr"] = "left";									
					break;				
			}			
		}
		else if("flip"==animation){
			var head,tail;
			jQuery.each(boxs,function(index){
				var obj = {node:$(this)};
				if(head==null){
					head = obj;
					tail = obj;
				}
				else{
					tail.next = obj;
					tail = obj;
					obj.node.addClass("out");
				}						
			});
			tail.next = head;
			runtimeAnimation["head"] = head;			
		}
	},
	//执行Tile动画
	doTileAnimation : function(node){
		var tileId = node.attr("tileId"),			
			runtimeAnimation = this.animationbase[tileId];
		if(null==runtimeAnimation){
			return;
		}
		//设置动画样式
		switch(runtimeAnimation.animation){
			case "roll" :
				//设置动画样式
				switch(runtimeAnimation.orientation){
					case "horizontal" : 
						node.addClass("animate-roll-horizontal");
						break;
					case "vertical" :
						node.addClass("animate-roll-vertical");
						break;
				}
				this.doRollingAnimation(node);
				break;
			case "flip" :
				switch(runtimeAnimation.orientation){
					case "horizontal" : 
						node.addClass("animate-flip-horizontal");
						break;
					case "vertical" :
						node.addClass("animate-flip-vertical");
						break;
				}
				this.doFlippingAnimation(node);
				break;
		}			
	},
	//执行翻转动画
	doFlippingAnimation : function(node){
		var tileId = node.attr("tileId"),
			runtimeAnimation = this.animationbase[tileId],
			head = runtimeAnimation.head,
			animationExecutionTime = this.options.animationExecutionTime,
			self = this;
		runtimeAnimation["handle"] =setTimeout(function(){
			head.node.addClass("in2out");
			setTimeout(function(){
				head.node.removeClass("in2out");
				head.node.addClass("out");
				head= head.next;
				runtimeAnimation.head=head;
				head.node.removeClass("out");
				head.node.addClass("out2in");
				setTimeout(function(){
					head.node.removeClass("out2in");					
					self.doFlippingAnimation(node);
				},animationExecutionTime);
			},animationExecutionTime);
		},this.options.animationIntervalTime);
	},	
	//执行滚动动画
	doRollingAnimation : function(node){
		var tileId = node.attr("tileId"),
			runtimeAnimation = this.animationbase[tileId],
			focusIndex = runtimeAnimation["focusIndex"],
			nodes = runtimeAnimation["nodes"],
			self = this;		
			for(var i=0,n;n=nodes[i];i++){
				n.css(runtimeAnimation["styleAttr"],(focusIndex+i)*100+"%");
			}
			if(focusIndex==0){
				runtimeAnimation["divisor"] =-1;
			}
			else if(Math.abs(focusIndex)==Math.abs(nodes.length-1)){
				runtimeAnimation["divisor"] = 1;
			}
		runtimeAnimation["handle"] = setTimeout(function(){
			runtimeAnimation["focusIndex"]+=runtimeAnimation["divisor"];
			self.doRollingAnimation(node);
		},this.options.animationIntervalTime || 3000);
	},
	//暂停动画
	pauseTileAnimation : function(node){
		var tileId = node.attr("tileId"),
			base = this.animationbase[tileId],
			handle = base["handle"];
		clearTimeout(handle);
	},
	//删除
	removeTile : function(node){
		var tileId = node.attr("tileId"),
			data= this.database[tileId];
		for(var i=0,n;n=this.nodebase[i];i++){
			if(n==node[0]){
				this.nodebase.splice(i,1);
				if(this.options.layout!="fluid"){
					if(this.options.layout=="free"){
						for(var i=data.y;i<data.y+(data.row || 1);i++){
							 for(var j=data.x;j<data.x+(data.col || 1);j++){
								this.gridmap[i][j] = null;
							}
						}
						this.transformGridmap();
					}
					this.resize0();
				}
				break;
			}
		}		
		delete this.database[tileId];
		delete this.animationbase[tileId];
		//执行删除节点操作
		node.fadeOut("normal",function(){			
			node.remove();
		});
		var onClose = this.options.onClose;
		onClose && onClose(data);	
	},
	funnelEvents : function(){
		var self = this;
		//定义鼠标的移动事件		
		this.element.mouseover(function(e){
			var target = $(e.target),
				tile = breeze.parent(target,"tile");
			if(null!=tile){
				if(self.hoverTile==tile[0]){
					return;
				}
				else if(null!=self.hoverTile){
					var tileId =$(self.hoverTile).attr("tileId");
					if(self.animationbase[tileId]){
						self.doTileAnimation($(self.hoverTile));
					}
				}
				var tileId = tile.attr("tileId");
				if(self.animationbase[tileId]){					
					clearTimeout(self.animationbase[tileId].handle);
				}
				self.hoverTile = tile[0];
			}
			else{
				if(null!=self.hoverTile){
					var tileId =$(self.hoverTile).attr("tileId");
					if(self.animationbase[tileId]){
						self.doTileAnimation($(self.hoverTile));
					}
					self.hoverTile = null;
				}
			}
		});		
		//鼠标点击事件
		this.element.mousedown(function(e){
			self.runtimeXY= (e.clientX+":"+e.clientY);
			var target = $(e.target),
				node = breeze.parent(target,"tile");
			if(node==null){ 
				return;
			}
			if(self.options.removable){
				if(target.hasClass("close")){
					breeze.stopEvent(e);				
					self.removeTile(node);
					return;
				}
				self.doWobble(target);
			}
			if("free"==self.options.layout){
				if(target.hasClass("tile-resize")){
					self.doResize(node,target,e);
				}
				else if(self.options.draggable){
					self.doDrag(node,e);
				}
			}			
		});	 
		//点击事件鼠标未发生位移即可执行
		this.element.click(function(e){
			var target = $(e.target),
				tile = breeze.parent(target,"tile"),
				runtimeXY= (e.clientX+":"+e.clientY);
			if(null!=tile && !self.element.hasClass("wobble") && runtimeXY==self.runtimeXY){
				var onClick = self.options.onClick,
				tileId = tile.attr("tileId"),
					data = self.database[tileId];
				onClick && onClick(data,e);
			}
		});
	},
	doWobble : function(target){
		if(target.hasClass("tile-resize")){
			return;
		}
		var element = this.element;
		function dobodyclick(ex){
			element.removeClass("wobble");
			$(document.body).unbind("mousedown",dobodyclick);
		}
		var handle = setTimeout(function(){
			element.addClass("wobble");
			$(document.body).bind("mousedown",dobodyclick);
		},750);
		function domousemove(ex){
			clearTimeout(handle);
			$(document.body).unbind("mousemove",domousemove);
		}
		$(document.body).bind("mousemove",domousemove);
		function domouseup(ex){
			clearTimeout(handle);
			element.unbind("mouseup",domouseup);
		}
		element.bind("mouseup",domouseup);
	},
	doResize : function(node,target,e){
		var self = this,			
			tileId = node.attr("tileId"),
			data = self.database[tileId],
			clientX =e.clientX,
			clientY =e.clientY,
			oLeft = parseInt(node.css("left"),10),
			oTop = parseInt(node.css("top"),10),
			proxy = null,
			gridmap =self.gridmap,
			cols = self.cols,
			margin = self.options.margin,
			size = self.options.size,
			oWidth = node.width(),
			oHeight = node.height(),
			dimension =size+margin,
			oCol = data.col || 1,
			oRow = data.row || 1,
			oX= data.x,
			oY =data.y,
			mWidth = (cols-oX)*dimension-margin;
		function doresizemousemove(e){
			if(proxy==null){
				document.attachEvent && document.body.setCapture();
				self.element.addClass("breeze-noselectable");
				node.removeClass("row"+oRow);
				node.removeClass("col"+oCol);
				proxy= $("<div class='proxy'></div>");				
				proxy.css({
					left: oLeft+"px",
					top: oTop+"px",
					width: (oWidth-4)+"px",
					height: (oHeight-4)+"px"
				});
				proxy.appendTo(self.element);
				node.addClass("mouseAction");
			}
			var nWidth,nHeight;
			if(target.hasClass("s")){ //南向
				nWidth = oWidth;
				nHeight = oHeight+e.clientY - clientY;
			}
			else if(target.hasClass("e")){ //东向
				nWidth = oWidth+e.clientX - clientX;
				nHeight = oHeight;
			}
			else if(target.hasClass("se")){ //东南向
				nWidth = oWidth+e.clientX - clientX;
				nHeight = oHeight+e.clientY - clientY;
			}
			if(nWidth<size){ //最小值判断
				nWidth =size;
			}
			if(nWidth>mWidth){//最大值判断
				nWidth= mWidth;
			}
			if(nHeight<size){
				nHeight =size;
			}
			node.css({
				width: nWidth+"px",
				height: nHeight+"px"
			});
			nWidth=Math.max(nWidth,dimension);
			nHeight=Math.max(nHeight,dimension);
			var nCol = Math.floor(nWidth/dimension),
				nRow= Math.floor(nHeight/dimension);
			if(nWidth%dimension>15){
				nCol++;
			}
			if(nHeight%dimension>15){
				nRow++;
			}
			if(oCol!=nCol || oRow!=nRow){
				//转换gridmap数据
				self.transform(data,tileId,oY,oX,oY,oX,oRow,oCol,nRow,nCol);	
				//设置当前位置					
				proxy.css({
					width: (data.col*dimension-margin)+"px",
					height: (data.row*dimension-margin)+"px"
				});		
				nY = data.y;
				oCol =data.col;
				oRow =data.row;
			}
		}
		function doresizemouseup(e){
			self.element.removeClass("breeze-noselectable");
			document.attachEvent && document.body.releaseCapture();
			$(document).unbind("mousemove",doresizemousemove);
			$(document).unbind("mouseup",doresizemouseup);
			if(proxy!=null){		
				proxy.remove();
				node.removeClass("mouseAction");				
				node.addClass("row"+data.row);
				node.addClass("col"+data.col);
				node.attr("style","left:"+oLeft+"px;top:"+oTop+"px;");
				setTimeout(function(){
					$.each(self.getChildren(node[0]),function(index,child){
						child.resize();
					});
				},300);
			}
		}
		$(document).bind("mousemove",doresizemousemove);
		$(document).bind("mouseup",doresizemouseup);
	},
	//拖动实现
	doDrag : function(node,e){
		var self = this,			
			tileId = node.attr("tileId"),
			data = self.database[tileId],
			clientX =e.clientX,
			clientY =e.clientY,
			oLeft = parseInt(node.css("left"),10),
			oTop = parseInt(node.css("top"),10),
			proxy = null,
			gridmap =self.gridmap,
			cols = self.cols,
			margin = self.options.margin,
			size = self.options.size,
			dimension =size+margin,
			oCol = data.col || 1,
			oRow = data.row || 1,
			oX = data.x,
			oY = data.y;
			if(oCol>cols){
				oCol = cols;
			}
			function dodragmousemove(e){
				if(proxy==null){
					document.attachEvent && document.body.setCapture();
					self.element.addClass("breeze-noselectable");
					proxy= $("<div class='proxy'></div>");				
					proxy.css({
						left: oLeft+"px",
						top: oTop+"px",
						width: (node.width()-4)+"px",
						height: (node.height()-4)+"px"
					});
					proxy.appendTo(self.element);
					node.addClass("mouseAction");
				}
				var nLeft = oLeft + e.clientX-clientX,
					nTop = oTop + e.clientY-clientY;
				node.css({
					left: nLeft+"px",
					top: nTop+"px"
				});
				var nY = Math.floor(Math.max(0,nTop)/dimension),
					nX =Math.floor(Math.max(0,nLeft)/dimension);
				//确定初始位置
				nTop%dimension>size/2 && nY++;				
				nLeft%dimension>size/2 && nX++;
				//从此位置检查一直到rowindex=0，并且colindex小于等于column-colspan数且大于等于0
				if(nX+oCol>cols){
					nX= cols-oCol;
				}
				//确定纵向的坐标不能超出gridmap最大行数
				if(nY>=gridmap.length){
					nY = gridmap.length;
					gridmap.push([]);
				}
				//确定是否可以移动的位置
				if(oX!=nX || oY!=nY){
					//转换gridmap数据
					self.transform(data,tileId,oY,oX,nY,nX,oRow,oCol,oRow,oCol);					
					//设置当前位置					
					proxy.css({
						left: data.x*dimension+"px",
						top: data.y*dimension+"px"
					});
					oX = data.x;
					oY = data.y;	
				}
			}
			function dodragmouseup(e){
				if(proxy!=null){					
					proxy.remove();
					node.removeClass("mouseAction");
					node.css({
						left: data.x*dimension+"px",
						top: data.y*dimension+"px"
					});
				}	
				document.attachEvent && document.body.releaseCapture();
				self.element.removeClass("breeze-noselectable");
				$(document).unbind("mousemove",dodragmousemove);
				$(document).unbind("mouseup",dodragmouseup);
			}
			$(document).bind("mousemove",dodragmousemove);
			$(document).bind("mouseup",dodragmouseup);
	},
	transform : function(data,tileId,oY,oX,nY,nX,oRow,oCol,nRow,nCol){
		//清除原来位置存储的值	
		var gridmap = this.gridmap;
		for(var i=oY;i<oY+oRow;i++){
			for(var j=oX;j<oX+oCol;j++){
				gridmap[i][j]=null;
			}
		}
		var ys = [nY],xms=[nX],xxs=[nX+nCol],minY,minX,maxX,newArray = [];
		for(var j=nX;j<nX+nCol;j++){
			var id = gridmap[nY][j];	
			if(null!=id){
				var d =this.database[id];
				ys.push(d.y);
				xms.push(d.x);
				xxs.push(d.x+(d.col || 1));
			}
		}
		//最顶部的纵坐标
		minY =Math.min.apply(Math,ys);
		if(minY<nY){						
			for(var k=0;k<nY-minY;k++){
				newArray.push([]);
			}
			minX = Math.min.apply(Math,xms);
			maxX = Math.max.apply(Math,xxs);
			for(var j=minX;j<maxX;j++){	
				var id = gridmap[nY][j];
				if(gridmap[nY][j]!=gridmap[nY-1][j] || id==null){ //上一个节点
					for(var k=0;k<nY-minY;k++){
						newArray[k][j] = gridmap[minY+k][j];//赋值
						gridmap[minY+k][j] = null;
					}
				}
				else{
					var ty = this.database[id].y;
					for(var k=0;k<ty-minY;k++){
						newArray[k][j] = gridmap[minY+k][j];//赋值
						gridmap[minY+k][j] = null;
					}
				}
			}
			nY = minY;
		}
		//插入单元格所在的新行
		for(var i=0;i<nRow;i++){
			var array = [];
			for(var j=nX;j<nX+nCol;j++){
				array[j]=tileId;
			}
			newArray.push(array);
		}	
		newArray.unshift(0);
		newArray.unshift(nY);
		Array.prototype.splice.apply(gridmap,newArray);
		data.col= nCol;
		data.row= nRow;	
		this.transformGridmap();	
		this.resize0();	
	},
	//调整布局信息
	transformGridmap : function(){
		var gridmap = this.gridmap;
		for(var i=1;i<gridmap.length;i++){
			for(var j=0,k,tileId;j<this.cols;j++){
				if((tileId=gridmap[i][j])!=null){					
					k = j+1;
					//同一列的相同值，找到其最右边位置
					while(gridmap[i][k]==tileId){
						k++;
					}
					//和上一行空白处交换位置
					this.swap(i,j,k,tileId); 
					//指针进行跳跃到下一个不同值的单元格
					j=k-1;	
				}
			}
		}
		//删除多余的行
	outer:	for(var i=gridmap.length-1;i>=0;i--){
			for(var j=0;j<this.cols;j++){
				if(gridmap[i][j]!=null){
					break outer;
				}
			}
			gridmap.pop();
		}
		//确定各个Tile的新位置
		var map = {};
		for(var i=0,l=gridmap.length;i<l;i++){
			for(var j=0;j<this.cols;j++){
				var tileId = gridmap[i][j];
				if(tileId!=null && !(tileId in map)){
					map[tileId] = 1;
					var data = this.database[tileId];
					data.y = i;
					data.x = j;
				}
			}
		}		
	},
    //交换位置
	swap : function(rowIndex,beginColIndex,endColIndex,value){
		for(var colIndex=beginColIndex;colIndex<endColIndex;colIndex++){
			if(null!=this.gridmap[rowIndex-1][colIndex]){
				return;
			}
		}
		for(var colIndex=beginColIndex;colIndex<endColIndex;colIndex++){
			this.gridmap[rowIndex-1][colIndex] = value;
			this.gridmap[rowIndex][colIndex] = null;
		}
		if((--rowIndex)>0){
			this.swap(rowIndex,beginColIndex,endColIndex,value);
		}	
	},
	//序列化数据
	serialize: function(){
		var result = [];
		for(var i=0,node;node = this.nodebase[i];i++){
			node = $(node);
			result.push(this.database[node.attr("tileId")]);
		}
		return result;
	},
	//改变大小
	changeSize: function(size,margin){
		var self = this,
			oSize = this.options.size,			
			oMargin = this.options.margin;
		if(size==oSize && margin==oMargin){
			return;
		}
		this.options.size = size || oSize;
		this.options.margin = margin || oMargin;
		this.createRuntimeStyle();
		this.resize0();
		setTimeout(function(){
			$.each(self.getChildren(),function(index,child){
				child.resize();
			});
		},300);
	}
});

})(jQuery);
