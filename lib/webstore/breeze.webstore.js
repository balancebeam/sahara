/*
 * Balancebeam WebStore 1.0
 *
 * Description : Web Store
 * Copyright 2012
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 *		balancebeam/lib/jquery.js
 */
 
(function( $, undefined ) {

function getStar(star){
	var html = [];
	for(var i=0;i<5;i++){
		html.push("<div class='star "+(star>i?"":"unstar")+"'></div>");
	}
	return html.join("");
}
var objects = {
	getStar : function(data){
		return getStar(data["star"]);
	},
	getFloat : function(data,direct){
		return direct;
	}
}
var tileTemplate =
	"<div appId='$id' class='item tile'>"+
		"<div class='body'>"+
			"<div class='wrapper'>"+
				"<img class='icon' src='$nIcon'/>"+
				"<div class='company'></div>"+
				"<div class='brief'>"+
					"<div class='title'>$title</div>"+
					"<div class='stars'>"+
						"#foreach($i : 5)"+
							"<div class='star "+
							"#if($star<=$i)"+
								"unstar"+
							"#end"+
							"'></div>"+							
						"#end"+
					"</div>"+
				"</div>"+
			"</div>"+
		"</div>"+
	"</div>",
tileTransform = breeze.transformTemplate(tileTemplate,objects),
metroTemplate = 
	"<div appId='$id' class='item tile metro'>"+
		"<div class='body $getFloat'>"+		
			"<div class='wrapper'>"+
				"<img class='icon' src='$lIcon'/>"+
				"<div class='company'></div>"+
				"<div class='brief'>"+
					"<div class='title'>$title</div>"+
					"<div class='stars'>$getStar</div>"+
				"</div>"+
			"</div>"+
		"</div>"+
	"</div>",
metroTransform = breeze.transformTemplate(metroTemplate,objects),
listTemplate = 
	"<div appId='$id' class='item list'>"+
		"<table><tbody><tr>" +
			"<td class='cell1'><img class='icon' src='$icon'></td>"+
			"<td class='cell2'>"+
				"<div class='title'>$title</div>" +
				"<div class='author'>作者：$author</div>"+
				"<div class='summary'>$summary</div>"+
			"</td>"+
			"<td class='cell3'>"+
				"<div class='stars'>$getStar</div>"+
				"<div class='users'>$users 位用户</div>"+
			"</td>"+
			"<td class='cell4'><div class='download'>下载应用</div></td>"+
		"</tr></tbody></table>"+
	"</div>",
listTransform = breeze.transformTemplate(listTemplate,objects),
tileSummary = 
	"<div class='hover-tile'>"+
		"<img class='icon' src='$icon'/>"+
		"<div class='brief'>"+
			"<div class='title'>$title</div>"+
			"<div class='users'>$users 位用户</div>"+
		"</div>"+
		"<div class='summary'>$summary</div>"+
		"<div class='download'>下载应用</div>"+
	"</div>",
tileSummaryTransform= breeze.transformTemplate(tileSummary,objects),
metroSummary = 
	"<div class='hover-metro'>"+
		"<div class='title'>$title</div>"+
		"<div class='users'>$users 位用户</div>"+
		"<div class='summary'>$summary</div>"+
		"<div class='download'>下载应用</div>"+
	"</div>";	
metroSummaryTransform= breeze.transformTemplate(metroSummary,objects);

 $.widget("ui.webstore", {
	options: {
		title : "应用商店",
		pageNumber : 14,
		view : "metro",//tile、metro、list
		loadContent : function(inData){
			$.ajax({
				url : "data.json",		
				dataType : "text",
				success : function(dataList){
					inData.load(dataList);
				}
			});
		}
	},
	_create : function(){
		var options = this.options,
			element = this.element,
			template = "<div class='breeze-webstore'>"+
			"<div class='panel'>"+
			"<div class='header'>"+
			"<div class='logo'></div>"+
			"<span class='text'>"+options.title+"</span>"+
			"<div style='clear:both;'></div>"+
			"</div>"+
			"<input class='search' type='text' maxlength='300' placeholder='搜索应用' dir='ltr' autocomplete='off' spellcheck='false'>"+
			"<div class='navigator'><div class='container'></div></div>"+
			"</div>"+
			"<div class='main'>"+
			"<div class='header'></div>"+
			"<div class='content'><div class='container'></div></div>"+
			"</div>"+
			"</div>";
		element.html(template);		
		this.navigator = $(">.breeze-webstore>.panel>.navigator>.container",element);
		this.content = $(">.breeze-webstore>.main>.content>.container",element);
		this.reset();
		this.loadContent();
		this.funnelEvents();

	},
	reset : function(){
		this.content.html("<div></div>");
		this.dataObjects = {};
		this.last = false;
		this.loading = false;
	},	
	makupNavigator : function(){
	},
	loadContent : function(){
		//如果是最后
		if(this.last || this.loading){
			return;
		}
		this.loading = true;
		var self = this;		
		this.options.loadContent({
			pageNo : this.content.children().length,
			load : function(dataList){
				dataList = eval("("+dataList+")");
				var html = [],
					page = $(self.content[0].lastChild),
					view =self.options.view;
				
				switch(view){
					case "list" :
						for(var i=0,d;d = dataList[i];i++){
							self.dataObjects[d.id] = d;
							html.push(listTransform(d));
						}
						break;
					case "metro" : 
						for(var i=0,l=dataList.length,d;d=dataList[i];i++){
							self.dataObjects[d.id] = d;
							if(i%14==0 && i+14<=l){
								if(0!=i){
									html.push("<div style='clear:both;'></div>");
								}
								html.push(metroTransform(d,"left"));
								continue;
							}
							if(i%14==11 && i+3<=l){
								html.push(metroTransform(d,"right"));
								continue;
							}
							html.push(tileTransform(d));
						}
						break;
					case "tile" : 
						for(var i=0,d;d = dataList[i];i++){
							self.dataObjects[d.id] = d;
							html.push(tileTransform(d));
						}	
				}				
				setTimeout(function(){
					page.css("opacity",".20")
						.html(html.join(""));							
					self.loading = false;
					self.last = dataList.length<self.options.pageNumber;
					page.animate({
						opacity : "1.0"
					},500);
				},500);
			}
		});		
	},
	//是否正在执行cancel hover的动作，如果是阻止其他的cancel动作
	_canceling: false,
	_cancelHoverTile : function(){
		var self = this;
		if(!this._canceling){
			if(this._hoverTile){
				this._canceling = true;
				if($(this._hoverTile).hasClass("metro")){
					var summary = $(">.body>.hover-metro",this._hoverTile),
						hoverTile = $(this._hoverTile);
					summary.animate({
						marginTop : "49px"
					},"fast",function(){
						self._canceling = false;
						summary.remove();
						hoverTile.removeClass("hover");
						self.executeHover();
					});
				}
				else{
					var summary = $(">.body>.hover-tile",this._hoverTile);
					$(">.body>.wrapper",this._hoverTile).animate({
						marginTop : "0px"
					},"fast",function(){
						self._canceling = false;
						summary.remove();
						self.executeHover();
					});
				}
			}
		}
	},
	executeHover : function(){
		if(!this._hoverTile) return;
		var hoverTile =this._hoverTile,
			tile = $(hoverTile),
			data = this.dataObjects[$(hoverTile).attr("appId")];
		if(tile.hasClass("metro")){ 							
			tile.addClass("hover");
			var summary = $(metroSummaryTransform(data));
			$(">.body",hoverTile).append(summary);
			summary.animate({
				height : "109px"
			},"fast");
	   }
	   else{
			$(">.body",hoverTile).append($(tileSummaryTransform(data)));
			$(">.body>.wrapper",hoverTile).animate({
				marginTop : "-200px"
			},"fast");
	   }	
	},
	funnelEvents : function(){
		var self = this;
		$(document).mouseover(function(e){
			if("list"==self.options.view) return;
			var target = $(e.target),
				tile = target.parents(".tile");
			clearTimeout(self._handle);
			self.handle = setTimeout(function(){
				if(tile.length){
					if(tile[0] != self._hoverTile){						
						if(self._hoverTile){
							self._cancelHoverTile();
							self._hoverTile= tile[0];		
						}			
						else{
							self._hoverTile= tile[0];		
							self.executeHover();
						}										
					}
					return;
				}				
				self._cancelHoverTile();	
				self._hoverTile = null;
			},200);
		});
		$(window).bind("scroll",function(e){			
			var elem = document.documentElement,
				scrollTop = elem.scrollTop || document.body.scrollTop;
			if(self.last 
				|| self.loading 
				|| elem.scrollHeight<=elem.offsetHeight 
				||(elem.scrollHeight>=scrollTop+elem.offsetHeight+200)){
				return;
			}
			self.content.append($("<div><div class='loading'></div></div>"));
			self.loadContent();
		});
	}
});

})(jQuery);