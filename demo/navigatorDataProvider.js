var navigatorDataProvider = 
[
	{				
		id: "grid",
		title : "数据表格",
		iconURL : "css/images/accordion_icon.png",
		url: "pages/grid/grid_navigator.html",
		children:[
				{title : "基本表格",id:"grid_base",url:"pages/grid/grid_base.html",iconURL:"css/images/grid.png"},
				{title : "数据结构",id:"grid_objectlist",url:"pages/grid/grid_objectlist.html",iconURL:"css/images/grid.png"},   
				{title : "大数据量",id:"grid_largedata",url:"pages/grid/grid_largedata.html",iconURL:"css/images/grid.png"},
				{title : "多层标题",id:"grid_multitle",url:"pages/grid/grid_multitle.html",iconURL:"css/images/grid.png"},
				{title : "隐藏标题",id:"grid_hideheader",url:"pages/grid/grid_hideheader.html",iconURL:"css/images/grid.png"},
				{title : "自动宽度",id:"grid_autowidth",url:"pages/grid/grid_autowidth.html",iconURL:"css/images/grid.png"},
				{title : "自动高度",id:"grid_autoheight",url:"pages/grid/grid_autoheight.html",iconURL:"css/images/grid.png"},
				{title : "宽百分比",id:"grid_percentage",url:"pages/grid/grid_percentage.html",iconURL:"css/images/grid.png"},
				{title : "排序功能",id:"grid_sortable",url:"pages/grid/grid_sortable.html",iconURL:"css/images/grid.png"},
				{title : "改变列宽",id:"grid_resizable",url:"pages/grid/grid_resizable.html",iconURL:"css/images/grid.png"},
				{title : "锁定多列",id:"grid_lockcolumn",url:"pages/grid/grid_lockcolumn.html",iconURL:"css/images/grid.png"},
				{title : "锁定多行",id:"grid_lockrow",url:"pages/grid/grid_lockrow.html",iconURL:"css/images/grid.png"},
				{title : "调整位置",id:"grid_draggable",url:"pages/grid/grid_draggable.html",iconURL:"css/images/grid.png"},
				{title : "弹出菜单",id:"grid_dropmenu",url:"pages/grid/grid_dropmenu.html",iconURL:"css/images/grid.png"},
				{title : "本地翻页",id:"grid_paging",url:"pages/grid/grid_paging.html",iconURL:"css/images/grid.png"},
				{title : "拖动翻页",id:"grid_lazypaging",url:"pages/grid/grid_lazypaging.html",iconURL:"css/images/grid.png"},
				{title : "工具条栏",id:"grid_toolbar",url:"pages/grid/grid_toolbar.html",iconURL:"css/images/grid.png"},
				{title : "多选选择",id:"grid_selectable",url:"pages/grid/grid_selectable.html",iconURL:"css/images/grid.png"},
				{title : "单选选择",id:"grid_singleselectable",url:"pages/grid/grid_singleselect.html",iconURL:"css/images/grid.png"},
				{title : "综合应用",id:"grid_composite",url:"pages/grid/grid_composite.html",iconURL:"css/images/grid.png"},
				{title : "树形表格",id:"grid_tree",url:"pages/grid/grid_treeview.html",iconURL:"css/images/grid.png"},	
				{title : "合并单元格",id:"grid_group",url:"pages/grid/grid_mergecol.html",iconURL:"css/images/grid.png"},	
				{title : "行列编辑",id:"grid_edit",url:"",iconURL:"css/images/grid.png"}	
		]
	},
	{
		id: "metro",
		iconURL : "css/images/accordion_icon.png",
		title : "Metro",
		children:[
			{
				id: "1",
				row: 1,
				col: 1,
				title: "基本表格",
				color: "darkblue",
				url:"pages/grid/grid_mergecol.html",
				iconURL : ["css/images/metro/tshirt.jpg"]					
			},
			{
				id: "2",
				row: 1,
				col: 1,
				title: "编辑表格",
				color: "red",
				url:"pages/grid/grid_mergecol.html",
				iconURL : "css/images/metro/king.jpg"
			},
			{
				id: "3",
				row: 2,
				col: 1,
				title: "翻页表格",
				color: "orange",
				url:"pages/grid/grid_mergecol.html",
				iconURL : "css/images/metro/beckham.jpg"
			},
			{
				id: "4",
				row: 1,
				col: 2,
				title: "拖拽表格",
				color: "red",
				url:"pages/grid/grid_mergecol.html",
				iconURL : "css/images/metro/ferguson.jpg"
			},
			{
				id: "5",
				row: 2,
				col: 2,
				title: "合并单元格",
				color: "purple",
				url:"pages/grid/grid_mergecol.html",
				iconURL : ["css/images/metro/ronaldo.jpg","css/images/metro/rooney.jpg","css/images/metro/tshirt.jpg"],
				animation: "flip",
				orientation: "horizontal"
			},
			{
				id: "6",
				row: 1,
				col: 1,
				title: "手风琴",
				color: "red",
				iconURL : "css/images/metro/rooney.jpg"
			},
			{
				id: "7",
				row: 1,
				col: 1,
				title: "伸缩容器",
				color: "grey",
				url:"pages/grid/grid_mergecol.html",
				iconURL : "css/images/metro/ronaldo.jpg"
			},
			{
				id: "8",
				row: 1,
				col: 2,
				title: "方位布局",
				color: "orange",
				url:"pages/grid/grid_mergecol.html",
				iconURL : "css/images/metro/paper.jpg"
			},
			{
				id: "9",
				row: 1,
				col: 2,
				title: "消息提示",
				color: "purple",
				url:"pages/grid/grid_mergecol.html",
				iconURL : "css/images/metro/rio.jpg"
			},				
			{
				id: "11",
				row: 3,
				col: 3,
				title: "个人主页",
				color: "green",
				url:"pages/grid/grid_mergecol.html",
				iconURL : ["css/images/metro/ronaldo.jpg","css/images/metro/rooney.jpg","css/images/metro/tshirt.jpg"],
				animation: "roll",
				orientation: "horizontal"
			},
			{
				id: "12",
				row: 2,
				col: 4,
				title: "电子表单",
				color: "darkblue",
				url:"pages/grid/grid_mergecol.html",
				content: [{url:"pages/grid/grid_base.html"},{url:"pages/grid/grid_sortable.html"}],
				iconURL : "css/images/metro/ferguson.jpg"
			},
			{
				id: "10",
				row: 3,
				col: 2,
				title: "弹出窗口",
				color: "yellow",
				url:"pages/grid/grid_mergecol.html",
				iconURL : "css/images/metro/group.jpg"
			},
			{
				id: "13",
				row: 1,
				col: 3,
				title: "编辑树",
				color: "red",
				url:"pages/grid/grid_mergecol.html",
				iconURL : "css/images/metro/champ.jpg"
			},
			{
				id: "14",
				row: 1,
				col: 3,
				title: "时间轴",
				color: "green",
				url:"pages/grid/grid_mergecol.html",
				iconURL : ["css/images/metro/wallpaper.jpg","css/images/metro/paper.jpg"],
				animation: "flip",
				orientation: "vertical"
			}
		]
	},
	{		
		id: "form",
		iconURL : "css/images/accordion_icon.png",
		url: "pages/form/form_navigator.html",
		title : "表单组件",
		selected: true
	},
	{		
		id: "tree",		
		iconURL : "css/images/accordion_icon.png",		
		url: "pages/tree/tree_navigator.html",
		title : "树型组件"
	},
	{		
		id: "layout",		
		iconURL : "css/images/accordion_icon.png"	,	
		url: "pages/layout/layout_navigator.html",
		title : "容器组件"
	},
	{		
		id: "dialog",		
		iconURL : "css/images/accordion_icon.png"	,	
		url: "pages/dialog/dialog_navigator.html",
		title : "弹出窗口"
	},
	{		
		id: "menu",
		iconURL : "css/images/accordion_icon.png"	,	
		url: "pages/menu/menu_navigator.html",
		title : "菜单组件"
		
	}
];
