/*
 * Balancebeam Widget Grid_Plugin_Pagging 1.0
 *
 * Description : Support client page
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 * 		balancebeam/lib/widget/grid/beam.grid.js
 */

(function( $, undefined ) {
 
$.ui.grid.paging = function(grid,params){
	 this.grid = grid;
	 this._create(params);
};
$.ui.grid.paging.prototype = {
	//bind event
	_create : function(params){
		this.dataProvider = params.dataProvider || [];
//		for(var i=0,dp = params.dataProvider || [];dp[i];i++){
//			this.dataProvider.push({d : dp[i]});
//		}
		this.perPageRowCount = params.perPageRowCount || 20;
		this.pageNumber = 1;
		this.totalRowCount = this.dataProvider.length;
		this.pageCount = Math.ceil(this.totalRowCount / this.perPageRowCount) || 1;
		
		if(params.lazyload){
			this.grid.subscribe("endRowEdge.grid-paging",this,"lazyload");
			this.grid.setDataProvider(this.getPartDataProvider());
		}else{
			this.vPageNumber = 8;
			var pagingNode = this.pagingNode = $("<div class='paging'></div>");
			this.refreshNavigator(this.pageNumber);
			this.grid.gridElement.append(pagingNode);
			this.grid.subscribe("page.grid-paging",this,"page");
		}		
	},
	lazyload : function(){
		if(this.pageCount<=this.pageNumber) return;	
		var l = this.getPartDataProvider();
		for(var i=0,d;d=l[i];i++){
			this.grid.runtime.dataProvider.push({d : d});
		}	
		this.grid.resize();
		this.pageNumber++;
	},
	page : function(e){
		var target = $(e.target),
			pageNumber = null;
		if(target.is("a") 
				&& null!=(pageNumber = target.attr("pageNumber"))){
			pageNumber = Number(pageNumber);
		}
		else if(target.is("button")){
			var value = $(">input",this.pagingNode).val();
			if(!isNaN(pageNumber=Number(value))	){
				pageNumber = pageNumber<1 ? 1 : (pageNumber>this.pageCount ? this.pageCount : pageNumber);
				if(pageNumber == this.pageNumber){
					return;
				}
			}
		}
		if(null!=pageNumber){
			this.refreshNavigator(this.pageNumber=pageNumber);
		}
	},
	refreshNavigator : function(pageNumber){
		var html = [];
		html.push("<span class='label'>");
		html.push("共")
		html.push(this.totalRowCount);
		html.push("条数据");
		html.push(" 页次:");
		html.push(this.pageNumber);
		html.push("/");
		html.push(this.pageCount);
		html.push("页");
		html.push("</span>");
		html.push("<a ");
		html.push(1==pageNumber? "class='disabled' ":"pageNumber=1");
		html.push(" href='javascript:void(0);' bbEvents='click:page'>首页</a>");
		html.push("<a ");
		html.push(1==pageNumber? "class='disabled'" :"pageNumber="+(pageNumber-1));
		html.push(" href='javascript:void(0);' bbEvents='click:page'>上一页</a>");
		var m = Math.ceil(this.vPageNumber/2),
			bn = Math.max(pageNumber - (m - 1),1),
			ln = Math.min(pageNumber + this.vPageNumber - m,this.pageCount);
		
		if(pageNumber <= m){
			ln = Math.min(this.vPageNumber,this.pageCount);
		}
		else if(this.pageCount- m<pageNumber){
			bn = Math.max(this.pageCount -this.vPageNumber,1);
		}
		
		for(var i=bn;i<pageNumber;i++){
			html.push("<a href='javascript:void(0);' pageNumber="+i+" bbEvents='click:page'>[");
			html.push(i);
			html.push("]</a>");
		}
		html.push("<span class='current'>");
		html.push(pageNumber);
		html.push("</span>");
		for(var i=pageNumber+1;i<=ln;i++){
			html.push("<a href='javascript:void(0);' pageNumber="+i+" bbEvents='click:page'>[");
			html.push(i);
			html.push("]</a>");
		}
		html.push("<a ");
		html.push(this.pageCount==pageNumber? "class='disabled'":"pageNumber="+(pageNumber+1));
		html.push(" href='javascript:void(0);'  bbEvents='click:page'>下一页</a>");
		html.push("<a ");
		html.push(this.pageCount==pageNumber? "class='disabled'":"pageNumber="+this.pageCount);
		html.push(" href='javascript:void(0);' bbEvents='click:page'>尾页</a>");
		html.push("<input type='text'>");
		html.push("<button  bbEvents='click:page'>跳转</button>");
		this.grid.setDataProvider(this.getPartDataProvider());
		this.pagingNode.html(html.join(""));
	},
	getPartDataProvider : function(){
		var provider = [];
		for(var i=(this.pageNumber-1)*this.perPageRowCount,l =this.pageNumber*this.perPageRowCount;i<l;i++){
			if(null==this.dataProvider[i]){
				break;
			}
			provider.push(this.dataProvider[i]);
		}
		return provider;
	},
	destroy : function(){
		this.grid.unsubscribe("page.grid-paging");
		this.grid.unsubscribe("endRowEdge.grid-paging");
	}
 };
//注入plugin
$.ui.grid.plugins.register("paging",$.ui.grid.paging);

})(jQuery);
