var BASE_URL = 'http://172.16.36.208:8080/saas_b/admin/';
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
					//其他情况在业务方法判断
					if(ret.state === NOT_LOGIN && path !== 'app/userInfo/index') {
						$core.open(LOGIN_URL, { msg: ret.respMsg });
						return;
					}
					callback(ret);
				} else {
					$core.toast(ERROR_MSG);
				}
			},
			error: function(ret) {
				$core.toast('服务器或网络异常!');
				//隐藏进度条
				$core.hideProgress();
				$core.hideFreshHeader();
				//接口错误提示
				callback({ state: 'error' });
			}
		};
		$.ajax(option);
	}
	//打印Object
	u.alertObj = function(obj) {
		alert(JSON.stringify(obj));
	}
	//打印Object
	u.logObj = function(obj) {
		console.log(JSON.stringify(obj));
	}
	//页面自适应
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