
var treeDataProvider = [
	{id:"1",title:"Node1",children:[
		{id:"11",title:"Node11"},
		{id:"12",title:"Node12",children:[
			{id:"121",title:"Node121"},
			{id:"122",title:"Node122"},
			{id:"123",title:"Node123"},
			{id:"124",title:"Node124"}
		]},
		{id:"13",title:"Node13"},
		{id:"14",title:"Node14"},
		{id:"15",title:"Node15",children:[
			{id:"151",title:"Node151"},
			{id:"152",title:"Node152"},
			{id:"153",title:"Node153"},
			{id:"154",title:"Node154",children:[
				{id:"1541",title:"Node1541"},
				{id:"1542",title:"Node1542"},
				{id:"1543",title:"Node1543"}
			]}
		]},
		{id:"16",title:"Node16"}
	]},
	{id:"2",title:"Node2",children:[
		{id:"21",title:"Node21"},
		{id:"22",title:"Node22"}
	]},
	{id:"3",title:"Node3",children:[
		{id:"31",title:"Node31"},
		{id:"32",title:"Node32"},
		{id:"33",title:"Node33",children:[
			{id:"331",title:"Node331"}
		]},
	]},
	{id:"4",title:"Node4"}  
];
var treeArrayDataProvider = [
	{id:"1",title:"Node1",pId:""},
	{id:"11",title:"Node11",pId:"1"},
	{id:"12",title:"Node12",pId:"1"},
	{id:"121",title:"Node121",pId:"12"},
	{id:"122",title:"Node122",pId:"12"},
	{id:"123",title:"Node123",pId:"12"},
	{id:"124",title:"Node124",pId:"12"},
	{id:"13",title:"Node13",pId:"1"},
	{id:"14",title:"Node14",pId:"1"},
	{id:"15",title:"Node15",pId:"1"},
	{id:"151",title:"Node151",pId:"15"},
	{id:"152",title:"Node152",pId:"15"},
	{id:"153",title:"Node153",pId:"15"},
	{id:"154",title:"Node154",pId:"15"},
	{id:"1541",title:"Node1541",pId:"154"},
	{id:"1542",title:"Node1542",pId:"154"},
	{id:"1543",title:"Node1543",pId:"154"},
	{id:"16",title:"Node16",pId:"1"},
	{id:"2",title:"Node2",pId:""},
	{id:"21",title:"Node21",pId:"2"},
	{id:"22",title:"Node22",pId:"2"},
	{id:"3",title:"Node3",pId:""},
	{id:"31",title:"Node31",pId:"3"},
	{id:"32",title:"Node32",pId:"3"},
	{id:"33",title:"Node33",pId:"3"},
	{id:"331",title:"Node331",pId:"33"},
	{id:"4",title:"Node4",pId:""}  
];