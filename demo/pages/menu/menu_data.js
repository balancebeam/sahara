var incoPath = breeze.getBreezeContextPath()+"themes/default/images/",
	 menuDataProvider = [
			{
				id : "liaoning",
				title : "liaoning",
				icon : incoPath + "grid-menu-asc.gif",
				disabledIcon : incoPath + "grid-menu-asc.gif",
				children : [
				     { id:"shenyang",title:"shenyang",children:[
							{ id:"sy-heping",title:"heping"},
							{ id:"sy-shenhe",title:"shenhe",href : "http://www.163.com"},
							{ id:"sy-tiexi",title:"tiexi",href : "http://www.sohu.com"},
							{ id:"sy-huanggu",title:"huanggu"},
							{ id:"sy-yuhong",title:"yuhong"},
							{ id:"sy-dadong",title:"dadong"},
							{ id:"sy-hunnan",title:"hunnan"}
                      ]},
				     { id:"dalian",title:"dalian",disabled:true,children :[
                     		{ id:"dl-zhongshan",title:"zhongsan"},
                     		{ id:"dl-xiguang",title:"xigang"},
                     		{ id:"dl-shahekou",title:"shahekou"},
                     		{ id:"dl-ganjingzi",title:"ganjingzhi"}
                     ]},
				     { seperator:true },
				     { id:"anshan",title:"anshan",children:[
                    		{ id:"as-tiedong",title:"tiedong"},
                    		{ id:"as-tiexi",title:"tiexi"},
                    		{ id:"as-lishan",title:"lishan"},
                    		{ id:"as-qianshan",title:"qianshan"}
                    ]},
				     { seperator:true },
				     { id:"fushun",title:"fushun",icon : incoPath + "grid-menu-lock.gif"},
				     { id:"benxi",title:"benxi"},
				     { id:"dandong",title:"dandong"},
				     { id:"jinzhou",title:"jinzhou",disabled:true},
				     { id:"yingkou",title:"yingkou",disabled:true},
				     { id:"liaoyang",title:"liaoyang"},
				     { seperator:true },
				     { id:"tieling",title:"tieling"},
				     { id:"fuxin",title:"fuxi"},
				     { id:"chaoyang",title:"chaoyang"}
				]
			},
			{
				id : "guangdong",
				title : "guangdong",
				children : [
				            	{ id:"guangzhou",title:"guangzhou"},
				            	{ id:"shezhen",title:"shezhen"},
				            	{ id:"foshan",title:"foshan"}
				            ]
			},
			{
				id : "shandong",
				title : "shandong",
				children : [
				            	{ id:"jinnan",title:"jinnan"},
				            	{ id:"qingdao",title:"qingdao"},
				            	{ id:"yantai",title:"yantai"}
				            ]
			},
			{
				id : "beijing",
				title : "beijing",
				onClick : function(){
					alert("Hello：beijing");
				}
			},
			{
				id : "shanghai",
				title : "shanghai",
				href : "http://www.baidu.com",
				icon : incoPath + "grid-menu-unlock.gif"
			}
	   ];
