(function(window) {
	'use strict';
	var host = 'http://www.xxx.com';
	var u = {};
	var self = this;
	var isAndroid = (/android/gi).test(navigator.appVersion);
	var isIos = (/iPhone/gi).test(navigator.appVersion);
	//缓存实例化
	function uzStorage() {
		var ls = window.localStorage;
		return ls;
	};
	//ajax获取数据(jquery)
	u.request = function(path, callback, data, sync) {
		var isHttp = path.indexOf('http') < 0;
		var requestUrl = isHttp ? host + path : path;
		var token = $core.getStorage('token') || '';
		var data = data || {};
		//统一增加请求参数tokenId，没有值则传空，与具体项目有关，根据实际情况处理
		data.token = token;
		var option = {
			type: 'post',
			url: requestUrl,
			data: data,
			async: sync === false ? false : true,
			dataType: 'json',
			timeout: 10000,
			success: function(ret) {
				//关闭进度条
				$core.closeKeyFrame();
				if(ret) {
					//其他情况在业务方法判断
					if(ret.resultCode === NOT_LOGIN) {
						$core.open(LOGIN_URL);
						return;
					}
					callback(ret);
				} else {
					$core.toast(ERROR_MSG);
				}
			},
			error: function(ret) {
				//隐藏进度条
				$core.closeKeyFrame();
				callback({ resultCode: 'error', resultMsg: '网络异常' });
			}
		};
		$.ajax(option);
	}
	//上传文件
	u.upLoadFile = function(path, callback, data) {
		var requestUrl = NEW_CRM_URL + path;
		api.ajax({
			url: requestUrl,
			method: 'post',
			data: {
				values: data.values,
				files: data.files
			}
		}, function(ret, err) {
			if(ret) {
				callback(ret);
			} else {
				callback({ resultCode: 'error' });
			}
		});
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
				slidBackEnabled: true,
				allowEdit: false,
				softInputMode: mode || 'pan'
			});
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
	u.openFrame = function(url, rect, pageParam, bounce, bgColor, mode, name) {
		var name = name || url.replace(/.*\/(\w*)\.html$/g, '$1');
		var bounce = bounce === false ? false : true;
		if(rect === 'content') {
			rect = {};
			rect.marginTop = $('header').height();
		}
		if(rect === 'body') {
			rect = {};
			rect.marginTop = $('header').height();
			rect.marginBottom = $core.getStorage('indexFooterH');
		}
		rect = rect || {};
		rect.h = rect.h || 'auto';
		rect.w = rect.w || 'auto';
		try {
			api.openFrame({
				url: url,
				rect: rect,
				pageParam: pageParam,
				bounces: bounce,
				bgColor: bgColor,
				name: name,
				softInputMode: mode,
				allowEdit: false,
				vScrollBarEnabled: false,
				hScrollBarEnabled: false
			});
		} catch(e) {
			//			window.location.href = url;
		}
	}
	//关闭一个frame
	u.closeFrame = function(name) {
		try {
			api.closeFrame({
				name: name
			});
		} catch(e) {}
	}
	//创建frame组
	u.initFrames = function(urls, bounces) {
		var frames = [];
		for(var i = 0; i < urls.length; i++) {
			var url = urls[i];
			var frame = {
				url: url,
				name: url.replace(/.*\/(\w*)\.html$/g, '$1'),
				bounces: bounces,
				vScrollBarEnabled: false,
				hScrollBarEnabled: false
			}
			frames.push(frame);
		}
		return frames;
	}
	//打开一个frameGroup
	u.openFrameGroup = function(obj, callback) {
		var rect = {
			h: 'auto',
			w: 'auto',
			marginTop: $core.getStorage('indexHeaderH') || '',
			marginBottom: $core.getStorage('indexFooterH') || ''
		}
		api.openFrameGroup({
			name: obj.name,
			rect: obj.rect || rect,
			frames: obj.frames,
			preload: obj.preload,
			scrollEnabled: obj.scrollEnabled,
			index: 0
		}, function(ret, err) {
			callback(ret);
		});
	}
	//关闭framegroup
	u.closeFrameGroup = function(name) {
		api.closeFrameGroup({ name: name });
	}
	//设置frame组当前可见frame
	u.setFrameGroupIndex = function(name, index) {
		try {
			api.setFrameGroupIndex({
				name: name,
				index: index
			});
		} catch(e) {}
	}
	//设置frameGroup是否可见
	u.setFrameGroupHidden = function(name, val) {
		try {
			api.setFrameGroupAttr({
				name: name,
				hidden: val
			});
		} catch(e) {}

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
	//设置frame位置
	u.setFrameRect = function(rect, name) {
		try {
			api.setFrameAttr({
				rect: rect,
				name: name || api.frameName
			});
		} catch(e) {}
	}
	//设置frame是否可见
	u.setFrameHidden = function(val, name) {
		try {
			api.setFrameAttr({
				hidden: val,
				name: name || api.frameName
			});
		} catch(e) {}
	}
	//调整 frame 到前面
	u.bringFrameToFront = function(val) {
		try {
			api.bringFrameToFront({
				from: val,
			});
		} catch(e) {}
	}
	//获取系统类型
	u.systemType = function() {
		//ios,android,win,wp
		return api.systemType;
	}
	//是否支持沉浸式
	u.appearance = function() {
		try {
			return api.statusBarAppearance;
		} catch(e) {}
	}
	//header高度
	u.statusBar = function() {
		var header = document.querySelector('header');
		//顶部非白色
		if(this.appearance() && header) {
			header.style.paddingTop = '1.25rem';
		}
		//计算容器距离header的高度
		this.conPadT();
	}
	//计算容器距离header的高度
	u.conPadT = function() {
		var top = $('header').height();
		$('.content-top').css('padding-top', top);
	}
	//设置状态栏样式为白色或黑色
	u.setStatusBarStyle = function(val) {
		api.setStatusBarStyle({
			style: val || 'light'
		});
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
	u.freshHeader = function(callback, bg) {
		var refreshContent = [];
		for(var i = 10; i < 21; i++) {
			refreshContent.push('widget://img/loading/' + i + '.png');
		}
		api.setCustomRefreshHeaderInfo({
			bgColor: bg || '#fff',
			loadAnimInterval: 30,
			refreshHeaderHeight: 40,
			image: {
				pull: ['widget://img/loading/10.png'],
				load: refreshContent,
			},
			isScale: false
		}, function(ret, err) {
			callback();
		});
	}
	//loading加载框
	u.loading = function() {
		try {
			window.uiloading = api.require('UILoading');
			var content = [];
			for(var i = 10; i < 21; i++) {
				content.push({
					frame: 'widget://img/loading/' + i + '.png'
				});
			}
			uiloading.keyFrame({
				rect: {
					w: 80,
					h: 100
				},
				styles: {
					bg: 'rgba(0,0,0,0)',
					corner: 1,
					interval: 40,
					frame: {
						w: 70,
						h: 70
					}
				},
				mask: 'rgba(0,0,0,0.3)',
				content: content
			}, function(ret) {

			});
		} catch(e) {}
	}
	//关闭帧动画
	u.closeKeyFrame = function() {
		try {
			uiloading.closeKeyFrame();
		} catch(e) {}
	}
	//关闭下拉刷新
	u.hideFreshHeader = function() {
		try {
			api.refreshHeaderLoadDone();
		} catch(e) {}
	}
	//监听滚到到底部
	u.freshBottom = function(callback, bottom) {
		api.addEventListener({
			name: 'scrolltobottom',
			threshold: bottom || 0
		}, function(ret, err) {
			callback();
		});
	}
	//多级选择器
	u.actionSelector = function(callback, param) {
		var UIActionSelector = api.require('UIActionSelector');
		var param = param || {};
		UIActionSelector.open({
			datas: 'widget://res/address.json',
			layout: {
				row: 5,
				col: 3,
				height: 40,
				size: 12,
				sizeActive: 14,
				rowSpacing: 4,
				colSpacing: 8,
				maskBg: 'rgba(0,0,0,0.2)',
				bg: '#fff',
				color: '#888',
				colorActive: '#888',
				colorSelected: '#888'
			},
			animation: true,
			cancel: {
				text: '取消',
				size: 12,
				w: 90,
				h: 35,
				bg: '#fff',
				bgActive: '#ccc',
				color: '#888',
				colorActive: '#fff'
			},
			ok: {
				text: '确定',
				size: 12,
				w: 90,
				h: 35,
				bg: '#fff',
				bgActive: '#ccc',
				color: '#888',
				colorActive: '#fff'
			},
			title: {
				text: '请选择',
				size: 12,
				h: 44,
				bg: '#eee',
				color: '#888'
			},
			actives: param.actives,
		}, function(ret, err) {
			if(ret) {
				ret.eventType === 'ok' && callback(ret);
			}
		});
	}
	//多项选择器
	u.multiSelector = function(data, callback, selectState) {
		window.UIMultiSelector = api.require('UIMultiSelector');
		UIMultiSelector.open({
			rect: {
				h: 244
			},
			text: {
				leftBtn: '取消',
				rightBtn: '确定',
				selectAll: '全选/取消全选'
			},
			max: 0,
			singleSelection: selectState,
			styles: {
				mask: 'rgba(0,0,0,0.2)',
				title: {
					bg: '#eee',
					color: '#888',
					size: 16,
					h: 44
				},
				leftButton: {
					bg: '#eee',
					w: 80,
					h: 35,
					marginT: 5,
					marginL: 8,
					color: '#888',
					size: 14,
					bgActive: '#ccc',
					colorActive: '#fff'
				},
				rightButton: {
					bg: '#eee',
					w: 80,
					h: 35,
					marginT: 5,
					marginR: 8,
					color: '#3498db',
					size: 14,
					bgActive: '#ccc',
					colorActive: '#fff'
				},
				item: {
					h: 35,
					bg: '#fff',
					bgActive: '#eaeaea',
					bgHighlight: '#eaeaea',
					color: '#888',
					active: '#888',
					highlight: '#888',
					size: 14,
					lineColor: '#ccc',
					textAlign: 'center'
				},
				icon: {
					w: 0,
					h: 0,
					marginT: 0,
					marginH: 0,
					bg: '#fff',
					bgActive: 'widget://img/common/ic_filter.png',
					align: 'left'
				}
			},
			animation: true,
			items: data,
		}, function(ret, err) {
			if(ret) {
				if(ret.eventType === 'clickRight') {
					callback(ret);
					UIMultiSelector.close()
				} else if(ret.eventType === 'clickLeft') {
					UIMultiSelector.close();
				}
			}
		});
	}
	//多项选择器(直接可点击)
	u.singleSelector = function(data, callback) {
		window.UIMultiSelector = api.require('UIMultiSelector');
		UIMultiSelector.open({
			rect: { h: 244 },
			singleSelection: true,
			styles: {
				mask: 'rgba(0,0,0,0.2)',
				title: { h: 0 },
				leftButton: { h: 0, size: 0 },
				rightButton: { h: 0, size: 0 },
				item: {
					h: 45,
					bg: '#fff',
					bgActive: '#eaeaea',
					bgHighlight: '#eaeaea',
					color: '#888',
					active: '#3498db',
					highlight: '#888',
					size: 14,
					lineColor: '#ccc',
					textAlign: 'center'
				},
				icon: {
					w: 0,
					marginH: 0
				}
			},
			items: data,
		}, function(ret, err) {
			if(ret && ret.eventType === 'clickItem') {
				callback(ret.items[0]);
				$core.closeSelector();
			}
		});
	}
	//关闭选择器
	u.closeSelector = function() {
		UIMultiSelector.close();
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
	u.openPicker = function(type, callback, date) {
		api.openPicker({
			type: type, //(date,time,date_time)
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
			type: 'tel',
			number: tel || '4006663773'
		});
	}
	//开始录音
	u.startRecord = function(name) {
		api.startRecord({
			path: api.fsDir + '/' + name + '.amr'
		});
	}
	//停止录音
	u.stopRecord = function(callback) {
		api.stopRecord(function(ret, err) {
			ret && callback(ret);
		});
	}
	//开始播放
	u.startPlay = function(path, callback) {
		api.startPlay({
			path: path
		}, function(ret, err) {
			if(ret) {
				ret && callback(ret);
			}
		});
	}
	//alert提示框
	u.alert = function(msg) {
		try {
			api.alert({
				title: '',
				msg: msg,
				buttons: ['确定']
			});
		} catch(e) {
			alert(msg);
		}
	}
	//移除启动页面
	u.removeLaunch = function() {
		api.removeLaunchView();
	}
	//当前网络连接类型
	u.connectionType = function() {
		try {
			return api.connectionType;
		} catch(e) {}
	}
	//监听设备断开网络的事件
	u.offline = function(callback) {
		api.addEventListener({
			name: 'offline'
		}, function(ret, err) {
			callback();
		});
	}
	//监听设备连接到网络的事件
	u.online = function(callback) {
		api.addEventListener({
			name: 'online'
		}, function(ret, err) {
			ret && callback(ret.connectionType);
		});
	}
	//全屏
	u.setFullScreen = function(val) {
		api.setFullScreen({
			fullScreen: val
		});
	}
	//ios键盘弹出事件
	u.keyboardshow = function(callback) {
		api.addEventListener({
			name: 'keyboardshow'
		}, function(ret, err) {
			ret && callback(ret.h);
		});
	}
	//ios键盘隐藏事件
	u.keyboardhide = function(callback) {
		api.addEventListener({
			name: 'keyboardhide'
		}, function(ret, err) {
			callback();
		});
	}
	//拍照,获取相册
	u.getPicture = function(callback, sourceType) {
		try {
			api.getPicture({
				sourceType: sourceType || 'album', //library camera album
				encodingType: 'jpg',
				mediaValue: 'pic',
				destinationType: 'url',
				quality: 30,
				targetWidth: 1000,
				saveToPhotoAlbum: false,
			}, function(ret, err) {
				ret && callback(ret);
			});
		} catch(e) {}
	}
	//气泡式菜单
	u.mnPopups = function(datas, callback, params) {
		var mnPopups = api.require('MNPopups');
		params ? '' : params = {};
		mnPopups.open({
			rect: params.rect || {
				w: 120,
				h: 45 * datas.length
			},
			position: params.position || {
				x: api.winWidth - 20,
				y: $('header').height()
			},
			styles: {
				mask: 'rgba(0,0,0,0.4)',
				bg: '#eee',
				cell: {
					bg: {
						normal: '',
						highlight: ''
					},
					h: 45,
					title: params.title || {
						marginL: 45,
						color: '#636363',
						size: 12,
					},
					icon: params.icon || {
						marginL: 10,
						w: 25,
						h: 25,
						corner: 2
					}
				},
				pointer: params.pointer || {
					size: 7,
					xPercent: 90,
					yPercent: 0,
					orientation: 'downward'
				}
			},
			datas: datas,
			animation: true
		}, function(ret) {
			if(ret.eventType === 'click') {
				callback(ret.index);
			}
		});
	}
	//打印Object
	u.alertObj = function(obj, msg) {
		msg === undefined ? alert(JSON.stringify(obj)) : alert(msg + ':' + JSON.stringify(obj));
	}
	//打印Object
	u.logObj = function(obj, msg) {
		msg === undefined ? console.log(JSON.stringify(obj)) : console.log(msg + ':' + JSON.stringify(obj));
	}
	//存入历史记录
	u.setHistory = function(obj) {
		var type = obj.type;
		var searchVal = obj.searchVal;
		var optionName = obj.optionName;
		var optionVal = obj.optionVal;
		if(searchVal) {
			var historys = $core.getStorage('historys') || {};
			var arrays = historys[type] || [];
			if(optionVal) {
				obj.showVal = optionName + ':' + searchVal;
			} else {
				obj.showVal = searchVal;
			}
			arrays.forEach(function(item, index) {
				if(item.optionVal === optionVal && item.searchVal === searchVal) {
					arrays.splice(index, 1);
				}
			});
			arrays.unshift(obj)
			historys[type] = arrays;
			$core.setStorage('historys', historys);
		}
	}
	//页面自适应
	u.rem = function() {
		(function(doc, win) {
			var docEl = doc.documentElement;
			var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
				recalc = function() {
					var clientWidth = docEl.clientWidth;
					if(!clientWidth) return;
					docEl.style.fontSize = 17 * (clientWidth / 320) + 'px';
				};
			if(!doc.addEventListener) return;
			win.addEventListener(resizeEvt, recalc, false);
			doc.addEventListener('DOMContentLoaded', recalc, false);
		})(document, window);
	}
	window.$core = u;

	//页面自适应
	$core.rem();
	//FastClick
	FastClick.attach(document.body);
})(window);
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