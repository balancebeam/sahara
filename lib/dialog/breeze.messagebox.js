/*
 * Balancebeam Widget Dialog 1.0
 *
 * Description : Support open modal Dialog
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 *		balancebeam/lib/jquery/jquery.ui.core.js
 *		balancebeam/lib/jquery/jquery.ui.widget.js
 *		balancebeam/lib/widget/beam.toolkit.js
 *		balancebeam/lib/widget/layout/beam.container.js
 */
 
 (function( $, undefined ) {
	 MessageBox = {
		show : function(inData){
			var element = $("<div class='breeze-messagebox'></div>"),
				content = $("<div class='messagebox'><div class='msg'></div><div class='buttons'></div></div>");
			//添加样式名称
			content.addClass(inData.type);
			//添加图片
			inData.icon &&	content.prepend("<div class='icon'></div>");			
			//设置内容
			$(">.msg",content).html(inData.msg);	
			//添加按钮
			inData.buttons = inData.buttons || [];
			for(var i=0,btn;btn =inData.buttons[i];i++){
				var button = $("<div></div>");
				(function(btn){					
					btn.className && button.addClass(btn.className);
					button.button({
						title: btn.title,
						onClick : function(){
							btn.onClick(element);
						}
					});
				})(btn);
				$(">.buttons",content).append(button);
			}
			//声明对话窗口
			element.dialog({
				title: inData.title,
				node: content,
				resizable: false,
				suitable: true,
				width: 50,
				minWidth: 50,
				height: 50,
				minHeight: 50,
				animation: false,
				closable: inData.closable!=false,
				draginout: false,
				onOpen: function(){
					inData.onOpen && inData.onOpen(element);
				},
				onClose: function(){
					inData.onClose && inData.onClose(element);
					element.remove();
				}
			});
			element.appendTo('body');
			element.dialog("open");
		},
		args2data : function(){
			var inData = arguments[0];
			if(typeof(inData)=="string"){
				inData = {
					title: arguments[0],
					msg: arguments[1],
					onClose: arguments[2]
				};
			}
			return inData;
		},
		alert : function(title,msg,onClose){
			var inData =this.args2data.apply(this,arguments);
			(inData.buttons = []).push({
				title: "确定",
				className: "ok",
				onClick: function(element){
					element.dialog("close");
				}
			});
			this.show(inData);
		},
		info : function(title,msg,onClose){
			var inData =this.args2data.apply(this,arguments);
			inData.type="info";
			inData.icon = true;
			this.alert(inData);
		},
		question : function(title,msg,onClose){
			var inData =this.args2data.apply(this,arguments);
			inData.type="question";
			inData.icon = true;
			this.alert(inData);
		},
		warn : function(title,msg,onClose){
			var inData =this.args2data.apply(this,arguments);
			inData.type="warn";
			inData.icon = true;
			this.alert(inData);
		},
		error : function(title,msg,onClose){
			var inData =this.args2data.apply(this,arguments);
			inData.type="error";
			inData.icon = true;
			this.alert(inData);
		},
		confirm: function(inData){
			inData.type="confirm";
			inData.icon = true;
			var buttons = (inData.buttons = []);
			buttons.push({
				title: "确定",
				className: "ok",
				onClick: function(element){
					inData.onOk && inData.onOk();		
					element.dialog("close");								
				}
			});
			buttons.push({
				title: "取消",
				className: "cancel",
				onClick: function(element){
					inData.onCancel && inData.onCancel();
					element.dialog("close");										
				}
			});
			this.show(inData);
		},
		prompt: function(inData){
			if(inData.multiline){
				inData.type= "prompt-multiline";
				inData.msg = inData.msg+"<textarea  class='input'></textarea>";
			}
			else{
				inData.type="prompt";
				inData.msg = inData.msg+"<input type='text' class='input'>";
			}
			inData.onOpen = function(element){
				setTimeout(function(){
					$(".input",element).focus();
				},0);				
			} 
			var buttons = (inData.buttons = []);
			buttons.push({
				title: "确定",
				className: "ok",
				onClick: function(element){
					var value = $(".input",element).val();
					inData.onOk && inData.onOk(value);		
					element.dialog("close");								
				}
			});
			buttons.push({
				title: "取消",
				className: "cancel",
				onClick: function(element){
					var value = $(".input",element).val();
					inData.onCancel && inData.onCancel(value);
					element.dialog("close");										
				}
			});
			this.show(inData);
		},
		ync : function(inData){
			inData.type="ync";
			inData.icon = true;
			var buttons = (inData.buttons = []);
			buttons.push({
				title: "是",
				className: "yes",
				onClick: function(element){
					inData.onOk && inData.onOk();		
					element.dialog("close");								
				}
			});
			buttons.push({
				title: "否",
				className: "no",
				onClick: function(element){
					inData.onNo && inData.onNo();
					element.dialog("close");										
				}
			});
			buttons.push({
				title: "取消",
				className: "cancel",
				onClick: function(element){
					inData.onCancel && inData.onCancel();
					element.dialog("close");										
				}
			});
			this.show(inData);
		},
		notify : function(title,msg,onClose){
			var inData =this.args2data.apply(this,arguments);
			inData.type="notify";
			inData.closable = false;
			inData.onOpen = function(element){
				setTimeout(function(){
					element.dialog("close");
				},2000);
			} 
			this.show(inData);
		}
	 }
 
})(jQuery);