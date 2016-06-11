/*



 */

 (function( $, undefined ) {
	 
 $.widget("ui.button",{
	options: {
		title : "标题",
		//默认是否打开的
		expanded : true,
		//是否能进行打开和关闭操作
		toggleable : true,
		//打开时的回调
		onExpand : null,
		//关闭时的回调
		onCollapse : null,
		//自定义按钮
		buttons : [],
		//点击表头是否可以toggle
		headerToggle : true
	},
	_render: function(){
		
	}
	
});
})(jQuery);
