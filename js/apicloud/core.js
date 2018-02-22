var BASE_URL = '';
(function(window) {
	'use strict';
	var u = {};
	var self = this;
	var isAndroid = (/android/gi).test(navigator.appVersion);
	var isIos = (/iPhone/gi).test(navigator.appVersion);
	//缓存实例化
	function uzStorage() {
		var ls = window.localStorage;
		if(isAndroid) {
			ls = os.localStorage();
		}
		return ls;
	};
	//ajax获取数据(jquery)
	u.request = function(path, callback, data) {
		var requestUrl = BASE_URL + path;
		var token = $core.getStorage('token') || '';
		var data = data || {};
		data.token = token;
		var option = {
			type: 'post',
			url: requestUrl,
			data: data,
			async: true,
			dataType: 'json',
			timeout: 10000,
			success: function(ret) {
				//关闭进度条和下拉刷新
				$core.hideProgress();
				$core.hideFreshHeader();
				if(ret) {
					callback(ret);
				}
			},
			error: function(ret) {
				//隐藏进度条
				$core.hideProgress();
				$core.hideFreshHeader();
				//接口错误提示
				callback({ state: 'error' });
			}
		};
		$.ajax(option);
	}
	//打开一个window
	u.open = function(url, pageParam, name, mode) {
		var name = name || url.replace(/.*\/(\w*)\.html$/g, '$1');
		try {
			api.openWin({
				url: url,
				pageParam: pageParam,
				name: name,
				reload: false,
				vScrollBarEnabled: false,
				hScrollBarEnabled: false,
				slidBackEnabled: true, //ios左划返回
				allowEdit: false,
				softInputMode: mode || 'pan'
			})
		} catch(e) {
			window.location.href = url;
		}
	}
	//关闭一个window
	u.close = function(name) {
		try {
			api.closeWin({
				name: name,
			});
		} catch(e) {
			history.back();
		}
	}
	//关闭至指定窗口
	u.closeToWin = function(name) {
		try {
			api.closeToWin({
				name: name
			});
		} catch(e) {
			history.back();
		}
	}
	//打开一个frame
	u.openFrame = function(url, rect, pageParam, bounce, bgColor, name) {
		var name = name || url.replace(/.*\/(\w*)\.html$/g, '$1');
		try {
			api.openFrame({
				url: url,
				rect: rect,
				pageParam: pageParam,
				bounces: bounce,
				bgColor: bgColor,
				name: name,
				allowEdit: false,
				vScrollBarEnabled: false,
				hScrollBarEnabled: false
			});
		} catch(e) {
			window.location.href = url;
		}
	}
	//关闭一个frame
	u.closeFrame = function(name) {
		api.closeFrame({
			name: name
		});
	}
	//设置frame是否可弹动
	u.setFrameBounces = function(val, name) {
		try {
			api.setFrameAttr({
				bounces: val,
				name: name || api.frameName
			});
		} catch(e) {}
	}
	//设置frame是否可见
	u.setFrameHidden = function(val, name) {
		api.setFrameAttr({
			hidden: val,
			name: name || api.frameName
		});
	}
	//获取系统类型
	u.systemType = function() {
		return api.systemType;
	}
	//是否支持沉浸式
	u.appearance = function() {
		return api.statusBarAppearance;
	}
	//header高度
	u.statusBar = function() {
		var header = document.querySelector('header');
		//顶部非白色
		if(this.appearance() && header) {
			header.style.paddingTop = '20px';
		}
		//顶部白色
		//		if(isIos && header) {
		//			header.style.paddingTop = '20px';
		//		}
		//计算容器距离header的高度
		this.conPadT();
	}
	//计算容器距离header的高度
	u.conPadT = function() {
		var top = $('header').outerHeight();
		$('.contentTop').css('padding-top', top);
	}
	//添加缓存
	u.setStorage = function(key, value) {
		if(arguments.length === 2) {
			var v = value;
			if(typeof v == 'object') {
				v = JSON.stringify(v);
				v = 'obj-' + v;
			} else {
				v = 'str-' + v;
			}
			var ls = uzStorage();
			if(ls) {
				ls.setItem(key, v);
			}
		}
	};
	//获取缓存
	u.getStorage = function(key) {
		var ls = uzStorage();
		if(ls) {
			var v = ls.getItem(key);
			if(!v) { return; }
			if(v.indexOf('obj-') === 0) {
				v = v.slice(4);
				return JSON.parse(v);
			} else if(v.indexOf('str-') === 0) {
				return v.slice(4);
			}
		}
	};
	//清空某个缓存
	u.rmStorage = function(key) {
		var ls = uzStorage();
		if(ls && key) {
			ls.removeItem(key);
		}
	};
	//清空所有缓存
	u.clearStorage = function() {
		var ls = uzStorage();
		if(ls) {
			ls.clear();
		}
	};
	//发送一个事件消息
	u.sendEvent = function(name, value) {
		try {
			api.sendEvent({
				name: name,
				extra: value
			});
		} catch(e) {}
	}
	//接受一个事件消息
	u.addEvent = function(name, callback) {
		api.addEventListener({
			name: name
		}, function(ret, err) {
			callback(ret.value);
		});
	}
	//移除一个监听事件
	u.removeEvent = function(name) {
		api.removeEventListener({
			name: name
		});
	}
	//下拉刷新
	u.freshHeader = function(callback) {
		api.setRefreshHeaderInfo({
			visible: true,
			loadingImg: '',
			bgColor: '#fff',
			textColor: '#666',
			textDown: '下拉刷新...',
			textUp: '松开刷新...',
			showTime: true
		}, function(ret, err) {
			if(ret) {
				callback();
			}
		});
	}
	//关闭下拉刷新
	u.hideFreshHeader = function() {
		try {
			api.refreshHeaderLoadDone();
		} catch(e) {}
	}
	//监听滚到到底部
	u.freshBottom = function(callback) {
		api.addEventListener({
			name: 'scrolltobottom',
		}, function(ret, err) {
			callback();
		});
	}
	//显示进度提示框
	u.showProgress = function(title, text, modal) {
		try {
			api.showProgress({
				title: title || '努力加载中...',
				text: text || ' ',
				modal: modal || true
			});
		} catch(e) {}

	}
	//隐藏进度提示框
	u.hideProgress = function() {
		try {
			api.hideProgress();
		} catch(e) {}
	}
	//弹出带按钮的confirm对话框
	u.confirm = function(msg, buttons, callback) {
		api.confirm({
			title: '',
			msg: msg,
			buttons: buttons
		}, function(ret, err) {
			if(ret) {
				callback(ret.buttonIndex);
			}
		});
	}
	//底部弹出框
	u.actionSheet = function(data, callback) {
		api.actionSheet({
			title: '提示',
			cancelTitle: '取消',
			buttons: data
		}, function(ret, err) {
			var index = ret.buttonIndex - 1;
			callback(index);
		});
	}
	//弹出一个定时自动关闭的提示框
	u.toast = function(msg, location, global, time) {
		try {
			api.toast({
				msg: msg,
				location: location || 'middle',
				global: global,
				duration: time
			});
		} catch(e) {}
	};
	//时间选择器
	u.openPicker = function(type, date, callback) {
		api.openPicker({
			type: type,
			date: date,
			title: '选择时间'
		}, function(ret, err) {
			if(ret) {
				callback(ret);
			}
		});
	}
	//拨打电话
	u.call = function(tel) {
		api.call({
			type: 'tel_prompt',
			number: tel || '4006663773'
		});
	}
	//alert提示框
	u.alert = function(msg) {
		try {
			api.alert({
				title: '',
				msg: msg,
				buttons: ['确定']
			}, function(ret, err) {

			});
		} catch(e) {
			alert(msg);
		}
	}
	//给生成的元素添加tapmode
	u.tapmode = function() {
		try {
			api.parseTapmode();
		} catch(e) {}
	}
	//打印Object
	u.alertObj = function(obj) {
		alert(JSON.stringify(obj));
	}
	//打印Object
	u.logObj = function(obj) {
		console.log(JSON.stringify(obj));
	}
	//文字大小自适应
	u.flex = function() {
		! function(e) {
			function t(a) { if(i[a]) return i[a].exports; var n = i[a] = { exports: {}, id: a, loaded: !1 }; return e[a].call(n.exports, n, n.exports, t), n.loaded = !0, n.exports }
			var i = {};
			return t.m = e, t.c = i, t.p = "", t(0)
		}([function(e, t) {
			"use strict";
			Object.defineProperty(t, "__esModule", { value: !0 });
			var i = window;
			t["default"] = i.flex = function(e, t) {
				var a = e || 100,
					n = t || 1,
					r = i.document,
					o = navigator.userAgent,
					d = o.match(/Android[\S\s]+AppleWebkit\/(\d{3})/i),
					l = o.match(/U3\/((\d+|\.){5,})/i),
					c = l && parseInt(l[1].split(".").join(""), 10) >= 80,
					p = navigator.appVersion.match(/(iphone|ipad|ipod)/gi),
					s = i.devicePixelRatio || 1;
				p || d && d[1] > 534 || c || (s = 1);
				var u = 1 / s,
					m = r.querySelector('meta[name="viewport"]');
				m || (m = r.createElement("meta"), m.setAttribute("name", "viewport"), r.head.appendChild(m)), m.setAttribute("content", "width=device-width,user-scalable=no,initial-scale=" + u + ",maximum-scale=" + u + ",minimum-scale=" + u), r.documentElement.style.fontSize = a / 2 * s * n + "px"
			}, e.exports = t["default"]
		}]);
		flex(100, 1);
	}
	window.$core = u;
	//文字大小自适应
	$core.rem();
})(window);
//FastClick使用
$(function() {
	//页面自适应
	$core.flex();
	//去除300ms
	FastClick.attach(document.body);
});
//当前时间格式化
Date.prototype.pattern = function(fmt) {
	var o = {
		'M+': this.getMonth() + 1, //月份           
		'd+': this.getDate(), //日           
		'h+': this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时           
		'H+': this.getHours(), //小时           
		'm+': this.getMinutes(), //分           
		's+': this.getSeconds(), //秒           
		'q+': Math.floor((this.getMonth() + 3) / 3), //季度           
		'S': this.getMilliseconds() //毫秒           
	};
	var week = {
		'0': '/u65e5',
		'1': '/u4e00',
		'2': '/u4e8c',
		'3': '/u4e09',
		'4': '/u56db',
		'5': '/u4e94',
		'6': '/u516d'
	};
	if(/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
	}
	if(/(E+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '/u661f/u671f' : '/u5468') : '') + week[this.getDay() + '']);
	}
	for(var k in o) {
		if(new RegExp('(' + k + ')').test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
		}
	}
	return fmt;
}
//金钱转化
String.prototype.formatMoney = function(type) {
	if(this == null || this == '') return '0';
	if(/[^-?0-9\.]/.test(this)) return '0';
	var s = this.replace(/^(-?\d*)$/, '$1.');
	s = (s + '00').replace(/(\d*\.\d\d)\d*/, '$1');
	s = s.replace('.', ',');
	var re = /(\d)(\d{3},)/;
	while(re.test(s))
		s = s.replace(re, '$1,$2');
	s = s.replace(/,(\d\d)$/, '.$1');
	if(type == 0) {
		var a = s.split('.');
		if(a[1] == '00') {
			s = a[0];
		}
	}
	return s;
}