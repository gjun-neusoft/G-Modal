
/**
 * dialog组件
 * @Author   G.Jun
 * @DateTime 2017-10-17
 * @param    {[type]}   options 
 * @element				obj			创建节点
 * @addClass 			string 		添加样式
 * @width 				num 		宽
 * @height 				num 		高，值 为空时，高度自适应
 * @top 				num 		上边距离
 * @left 				num 		左边距离
 * @title 				string 		标题
 * @content 			string 		内容
 * @contentHeight 		num 		内容高度， 值 为空时，高度自适应
 * @hasHeader 			boolean 	是否要头部
 * @hasFooter			boolean		是否要页脚
 * @sureButtonText  	string		确认按钮文本
 * @cancelButtonText	string		取消按钮文本
 * @closeButtonText		string 		关闭按钮文本
 * @hasSure				boolean		是否显示确认按钮
 * @hasCancel 			boolean		是否显示 取消按钮
 * @hasClose 			boolean	 	是否显示关闭按钮
 * @closeOnPressEscape	boolean		是否ESC键关闭弹层
 * @disabledSure		boolean		是否禁用确认按钮
 * @disabledCancel		boolean		是否禁用取消按钮
 * @delay 				boolean		是否启用延时关闭
 * @seconds 			num 		当delay = true时，设置延时多少秒关闭
 * @hasModal 			boolean 	是否显蒙层
 * @closeOnClickModal 	boolean		是否点击蒙层关闭窗口
 * @sureBeforeCallBack	function 	点击确认按钮弹层关闭前回调，如果false将终止关闭弹层
 * @sureAfterCallBack	function 	点击确认按钮弹层关闭后回调
 * @cancelCallBack 		function 	取消按钮回调
 * @closeCallBack 		function 	关闭按钮回调
 * @modalCallBack 		function 	蒙层回调
 * @return   {[type]}           [description]
 */
window.gDialog = function(options){
	var that = this;
	var defaults = {
		element: window,
		addClass:'',
		width: 200,
		height: 155,
		top: 0,
		left: 0,
		title: 'dialog',

		content: 'this is content',
		contentHeight: 80,
		hasHeader: true,
		hasFooter: true,
		
		sureButtonText: '确定',
		cancelButtonText: '取消',
		closeButtonText: '',
		hasSure: true,
		hasCancel: true,
		hasClose: true,

		closeOnPressEscape: true,
		
		disabledSure: false,
		disabledCancel: false,

		delay: false,
		seconds: 0,

		hasModal: true,
		closeOnClickModal: false,
		sureAfterCallBack: null,
		sureBeforeCallBack: null,
		cancelCallBack: null,
		closeCallBack: null,
		modalCallBack: null

	}
	this.opts = $.extend({}, defaults, options);
	this.$ = {
		el:  $(this.opts.element),
		body: $('body')
	};
	var closeBtnHTML = this.opts.closeButtonText !== '' ? '<i class="close">' + this.opts.closeButtonText+ '</i>' : '<i class="close fa fa-close"></i>';
	this.node = {
		sureBtn : this.opts.hasSure ? '<button class="sure btn btn-default btn-sm">'+ this.opts.sureButtonText +'</button>' : '',
		closeBtn : this.opts.hasClose ? closeBtnHTML : '',
		cancelBtn : this.opts.hasCancel ? '<button class="cancel btn btn-default btn-sm">' + this.opts.cancelButtonText+ '</button>' : ''
	}
	this.node.header = this.opts.hasHeader ? '<div class="header">'+ '<b>'+this.opts.title+'</b></div>' : '';
	this.node.footer = this.opts.hasFooter ? '<div class="footer">' + this.node.sureBtn + this.node.cancelBtn + '</div>' : '';

	this.init();
	this.bind();

}
gDialog.prototype = {
	init: function(){
		this.$.dialog = $('<div class="g-dialog '+ this.opts.addClass +'">'+
							this.node.closeBtn +
							this.node.header +
							'<div class="content">'+
								this.opts.content +
							'</div>'+
							this.node.footer +
						'</div>');
		this.$.dialog.css({
			'width': this.opts.width,
			'height': this.opts.height !== '' ? this.opts.height : ''
		})
		this.$.modal = $('<div id="myModal" class="g-modal"></div>');
		this.$.modal.append(this.$.dialog);
		this.opts.element === window ? this.$.body.append(this.$.modal) : this.$.el.append(this.$.modal);
		this.$.content = this.$.dialog.find('.content');
		this.$.content.css({'height':this.opts.contentHeight});
		if (this.opts.hasModal) {
			this.$.modal.css({
				'width': this.$.el.width(),
				'height': this.$.el.height(),
				'backgroundColor': 'rgba(0,0,0,.5)'
			})
			var dialogPositionTop = this.$.el.height() > this.$.dialog.height() ? Math.floor((this.$.el.height() - this.$.dialog.height())/2) : 0;
			this.$.dialog.css({
				'marginTop': this.opts.top !== 0 ? this.opts.top : dialogPositionTop,
				'marginLeft': this.opts.left !== 0 ? this.opts.left : ''
			})
		}else{
			var length = this.opts.element === window ? this.$.body.find('.g-modal').length : this.$.el.find('.g-modal').length;
				this.$.modal.css({
				'width': this.$.dialog.width(),
				'height': this.$.dialog.outerHeight(),
				'top': (this.$.el.height() - this.$.dialog.height())/2 + (length-1) * 10,
				'left': (this.$.el.width() - this.$.dialog.width())/2 + (length-1) * 10,
				'backgroundColor': 'rgba(0,0,0,0)',
				'boxShadow': 'rgba(0,0,0,.3) 0px 0px 5px 0px',
				'borderRadius':5
			})
			this.$.dialog.css({
				'marginTop': 0,
				'marginBottom': 0
			})
		}
	},
	bind: function(){
		var that = this;
		this.$.close = this.$.dialog.find('.close');
		this.$.cancel = this.$.dialog.find('.cancel');
		this.$.sure = this.$.dialog.find('.sure');

		this.opts.disabledSure ? $(this.$.sure).attr('disabled','disabled') : '';
		this.opts.disabledCancel ? $(this.$.cancel).attr('disabled','disabled') : '';

		this.$.sure.on('click', function(){
			var callBackFns;
				callBackFns = {
					beforeFn: that.opts.sureBeforeCallBack ? that.opts.sureBeforeCallBack : '',
					afterFn: that.opts.sureAfterCallBack ? that.opts.sureAfterCallBack : ''
				}
			that.close(callBackFns);
		})
 		this.$.close.on('click', function(){
			that.opts.closeCallBack ? that.opts.closeCallBack() : '';
			that.close();
		})
		this.$.cancel.on('click', function(){
			that.opts.cancelCallBack ? that.opts.cancelCallBack() : '';
			that.close();
		})
		this.$.modal.on('click', function(ev){
			if ($(ev.target).hasClass('g-modal')) {
				that.opts.modalCallBack ? that.opts.modalCallBack() : '';
				that.opts.closeOnClickModal ? that.close() : '';
			}
		})
		this.$.body.on('keyup', function(event){
			if (event.keyCode === 27) {
				that.opts.closeOnPressEscape ? that.close() : '';
			}
		})
	},
	show: function(){
		var that = this;
		setTimeout(function(){
			that.$.modal.addClass('g-modal-show');
		},10)
		if (that.opts.delay) {
			that.close({seconds: that.opts.seconds})
		}
	},
	hide: function(seconds){
		var that = this;
		if (that.opts.delay) {
			setTimeout(function(){
				that.$.modal.addClass('g-modal-hide');
			}, seconds)
		}else{
			that.$.modal.addClass('g-modal-hide');
		}
		setTimeout(function(){
			that.$.modal.css('display','none');
		},seconds + 300)
	},
	close: function(options){
		var that = this;
		var defaults = {
			seconds: 0,
			beforeFn: null,
			afterFn: null
		}
		var isBreak;
		var opts = $.extend({}, defaults, options);
		if (opts.beforeFn) {
			isBreak = opts.beforeFn();
		}
		if (isBreak === false) {
			return false;
		}
		if (that.opts.delay) {
			setTimeout(function(){
				that.$.modal.addClass('g-modal-hide');
			}, opts.seconds)
		}else{
			that.$.modal.addClass('g-modal-hide');
		}
		setTimeout(function(){
			that.$.modal.remove();
			opts.afterFn ? opts.afterFn() : '';
		}, opts.seconds + 300)

	}
}

/**
 * alert警告
 * @Author   G.Jun
 * @DateTime 2017-10-19
 * @title			标题，必选参数		string
 * @description 	辅助性文字			string
 * @type 			主题	[success/warning/info/error]string
 * @closable		是否可关闭			boolean
 * @closeText   	关闭按钮自定义文本	string
 * @showIcon		是否显示 图标			boolean
 * @return   {[type]}           [description]
 */
window.gAlert = function(options){
	var defaults = {
		title: '这里是内容',
		description: '',
		type: 'success',
		closable: true,
		closeText: '',
		showIcon: true
	}
	this.opts_1= $.extend({}, defaults, options);
	var showIcon = this.opts_1.showIcon ? this.opts_1.type : '',
		contentHtml = '',
		stylename = '';

	if (this.opts_1.showIcon) {
		// fa fa-check-circle-o
		switch (this.opts_1.type){
			case 'success':
				stylename = this.opts_1.description === '' ? 'fa fa-check-circle-o' : 'fa fa-check-circle-o empty';
			break;
			case 'info':
				stylename = this.opts_1.description === '' ? 'fa fa-info-circle' : 'fa fa-info-circle empty';
			break;
			case 'warning':
				stylename = this.opts_1.description === '' ? 'fa fa-warning' : 'fa fa-warning empty';
			break;
			case 'error':
				stylename = this.opts_1.description === '' ? 'fa fa-times-circle-o' : 'fa fa-times-circle-o empty';
			break;
			// fa fa-warning
		}
		this.opts_1.type += ' icon';
		contentHtml = '<i class="icon-'+ this.opts_1.type +' '+ stylename +'"></i><p class="title">'+ this.opts_1.title +'</p><p class="desc">'+ this.opts_1.description +'</p>';
	} else {
		contentHtml = '<p class="title">'+ this.opts_1.title +'</p><p class="desc">'+ this.opts_1.description +'</p>';
	}
	this.opts_2 = {
		width: '100%',
		height: '',
		title: this.opts_1.title,
		hasClose: this.opts_1.closable,
		closeButtonText: this.opts_1.closeText,
		content: contentHtml,
		contentHeight: '',
		addClass: 'g-alert g-alert-' + this.opts_1.type,
		hasHeader: false,
		hasFooter: false,
		hasModal: false
	}
	this.init();
}
gAlert.prototype.init = function(){
	var alert = new gDialog(this.opts_2);
	alert.show();
}


window.gLoading = function(options){
	var defaults = {
		target: window,
		text: 'loading',
		customClass: 'g-loading'
	}

	this.opts_1 = $.extend({}, defaults, options);

	// $(this.opts_1.target).find('.g-modal').css('position', 'static');

	var loaderHtml = '<div class="loader">'+
				        '<div class="loader-inner ball-pulse">'+
				          '<div></div>'+
				          '<div></div>'+
				          '<div></div>'+
				        '</div>'+
				        '<div class="g-loading-text">正在拼命加载...</div>'+
				    '</div>';
	this.opts_2 = {
		element: this.opts_1.target,
		hasHeader: false,
		hasFooter: false,
		height: '',
		hasClose: false,
		content: loaderHtml,
		contentHeight: '',
		addClass: this.opts_1.customClass
	}
	this.init();
}
gLoading.prototype.init = function(){
	this.loading = new gDialog(this.opts_2);
}
gLoading.prototype.show = function(){
	this.loading.show();
}
gLoading.prototype.close = function(){
	this.loading.close();
}

