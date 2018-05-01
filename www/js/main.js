var fw = new Framework7({
	modalTitle: 'Kumpulan Online'
});

var $$ = Dom7;

var ob = new Object();

ob.mainView = fw.addView('.view-main', {
	dynamicNavbar: true,
	tapHold: true
});

ob.version = '0.0.1';
ob.debug = false;
ob.online = true;
ob.$ = 'SGD';
ob.pages = {};
ob.device = {};
ob.publicKey = 'KDMOB-201804260620';

ob.url = function( uri ) {
	var url = window.localStorage.getItem('url');
	if(typeof url === 'string') {
		return url + uri;
	} else {
		return 'https://www.kumpulan.com.sg/ebiz-online' + uri;
	}
};

ob.error = function(e, f) {
	if(ob.debug || f) {
		fw.alert(e);
	} else {
		fw.alert('Oops! Something goes wrong.');
	}
};

ob.quantity = function( q ) {
	var v;
	if(q || typeof q === 'number') {
		v = q.toString();
		if(v.indexOf('.') > 0) {
			v = v.substr(0, v.indexOf('.'));
		}
	} else {
		v = '0';
	}
	return v;
};

ob.currency = function( q ) {
	var v;
	if(q || typeof q === 'number') {
		v = q.toString();
		var i = v.indexOf('.');
		if(i > 0) {
			if(i < v.length - 2) {
				v = v.substr(0, i + 3);
			} else if(i < v.length - 1) {
				v = v.substr(0, i + 2) + '0';
			} else {
				v = v + '00';
			}
		} else {
			v = v + '.00';
		}
	} else {
		v = '0.00';
	}
	return v;
};

ob.date = function( v ) {
	var d = new Date(v);
	var m = d.getMonth() + 1;
	var date = d.getDate();
	return (date < 10 ? '0' + date + '/' : date + '/') + (m < 10 ? '0' + m + '/' : m + '/') + d.getFullYear();
};

ob.datetime = function( v ) {
	var d = new Date(v);
	var m = d.getMonth() + 1;
	var date = d.getDate();
	var h = d.getHours();
	var min = d.getMinutes();
	var s = d.getSeconds();
	return (date < 10 ? '0' + date + '/' : date + '/') + (m < 10 ? '0' + m + '/' : m + '/') + d.getFullYear()
		+ ' '
		+ ( h < 10 ? '0' + h + ':' : h + ':')
		+ ( min < 10 ? '0' + min + ':' : min + ':')
		+ ( s < 10 ? '0' + s : s);
};

ob.escapeHtml = function( m ) {
	var esc = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		'\'': '&#39;'
	};
	return m.replace(/[&<>"']/g, function( m ) {
		return esc[m];
	});
};

ob.setValue = function( i, v ) {
	var $i = $(i);
	if($i.attr('type') === 'checkbox') {
		if($i.data('yes') === v) {
			$i.prop('checked', true);
		} else {
			$i.prop('checked', false);
		}
	} else {
		$i.val(v);
	}
};

ob.getValue = function( i ) {
	var $i = $(i);
	if($i.attr('type') === 'checkbox') {
		if($i.prop('checked')) {
			return $i.data('yes');
		} else {
			return $i.data('no');
		}
	} else {
		return $i.val();
	}
};

ob.loading = function( flag ) {
	if(flag) {
		$('div.loading').show();
	} else {
		$('div.loading').hide();
	}
};

ob.init = function() {
	var session = window.localStorage.getItem('session');
	if(typeof session === 'string') {
		ob.session = JSON.parse(session);
	} else {
		ob.session = {};
	}
	if(ob.session.status !== 'success') {
		$('.ob-icon-login').on('click', function() {
			if(ob.session.status !== 'success') {
				fw.loginScreen();
			} else {
				//TODO
			}
			return false;
		});
	} else {
		$('.ob-icon-login').children('i').text('person');
	}
	{
		$('div.login-screen .ob-btn-login').on('click', function() {
			var f = $(this).parents('form')[0];
			var data = {
				timestamp: new Date().getTime()
			};
			for(var index=0; index<f.elements.length; index++) {
				var e = f.elements[index];
				if(!e.value) {
					var popover = '<div class="popover popover-password">'
                        + '<div class="popover-angle"></div>'
                        + '<div class="popover-inner">'
                        + '<div class="content-block" style="padding: 0px 20px;">'
                        + '<p>Oops!</p>'
                        + '<p>This field is required to sign in!</p>'
                        + '</div>'
                        + '</div>'
                        + '</div>';
					fw.popover(popover, e);
					return false;
				} else {
					data[e.name] = e.value;
				}
			}
			data.checksum = md5(data.j_company + data.j_password + data.timestamp + data.j_username + ob.publicKey);
			ob.ajax({
				url: ob.url('/mobile/auth'),
				method: 'POST',
				data: data,
				success: function(dt) {
					var json = JSON.parse(dt);
					if(json.status === 'success') {
						window.localStorage.setItem('session', dt);
						fw.closeModal();
						window.location.reload();
					} else {
						fw.alert('Oops! It fails to sign in.');
					}
				}
			});
			return false;
		});
		$('div.login-screen .ob-btn-login-cancel').on('click', function() {
			fw.closeModal();
			return false;
		});
	}
	if(ob.session.status == 'success') {
		ob.loading(true);
		ob.ajax({
			url: ob.url('/oauth2/resource/malo/ManagedLocation.List'),
			method: 'GET',
			data: {},
			success: function(dt) {
				try {
					ob.locations.render(dt);
				} catch(e) {
					ob.error(e);
				}
				ob.loading(false);
			}
		});
	}
};

ob.ajax = function( opt ) {
	if(!ob.online) {
		if(!opt.daemon) {
			fw.alert('Oops! Please check your network connection!');
		}
		return false;
	}
	var headers = opt.headers || {};
	if(ob.session && ob.session.status === 'success') {
		headers['authorization'] = 'Bearer ' + ob.session.v2;
	}
	headers['ver'] = ob.version;
	var data = opt.data || {};
	if(!data.signature && !data.checksum) {
		data['timestamp'] = new Date().getTime();
		var keyset = [];
		for(var key in data) {
			keyset.push(key);
		}
		var message = '';
		keyset = keyset.sort();
		for(var index=0; index<keyset.length; index++) {
			message += keyset[index];
			message += data[keyset[index]];
		}
		data['signature'] = md5(message + ob.session.v1);
	}
	try {
		$$.ajax({
			url: opt.url,
			method: opt.method,
			data: data,
			timeout: opt.timeout || 20000,
			headers: headers,
			success: function(dt) {
				if(!opt.daemon) {
					ob.loading(false);
				}
				opt.success(dt);
			},
			error: function(xhr, code) {
				if(!opt.daemon) {
					ob.loading(false);
				}
				if(ob.debug) {
					fw.alert('visit to url ' + opt.url + ' encounters error in ajax!');
				}
				if(typeof opt.error === 'function') {
					opt.error(xhr, code);
				} else {
					if(!opt.daemon) {
						ob.error(code);
					}
				}
			}
		});
		if(!opt.daemon) {
			ob.loading(true);
		}
	} catch(e) {
		if(!opt.daemon) {
			ob.loading(false);
		}
		if(ob.debug) {
			fw.alert('visit to url ' + opt.url + ' encounters error in try-catch!');
		}
		if(typeof opt.error === 'function') {
			opt.error(e);
		} else {
			ob.error(e);
		}
	}
};

ob.checkNetwork = function() {
	if(navigator && navigator.connection) {
		var n = navigator.connection.type;
		if(n === Connection.NONE) {
			ob.online = false;
		} else {
			ob.online = true;
		}
	}
};

ob.ready = function() {

	ob.loading(true);

	if($(window).width() < 300) {
		fw.alert('Screen resolution is too low. Kumpulan Online display could possibly go out of shape.');
	}

	ob.toolbar.init({
		name: 'index'
	});
	ob.barcode.init();

	if(typeof cordova !== 'undefined') {
		$(document).on('deviceready', function() {

			if(typeof device !== 'undefined') {
				ob.device.model = device.model;
				ob.device.platform  = device.platform;
				ob.device.version = device.version;
			}

			document.addEventListener("backbutton", function(e) {
				if(ob.mainView.activePage.name === 'index') {
					fw.closeModal();
					fw.actions([
						{
							text: '<i class="icon f7-icons">reply</i>&nbsp;<span>Stay</span>',
						},
						{
							text: '<i class="icon f7-icons">logout</i>&nbsp;<span>Quit</span>',
							color: 'red',
							onClick: function() {
								try {
									navigator.app.exitApp();
								} catch(e) {}
							}
						}
					]);
				} else {
					ob.mainView.router.back();
				}
			});

			document.addEventListener('offline', function() {
				ob.checkNetwork();
			}, false);
			document.addEventListener('online', function() {
				ob.checkNetwork();
			}, false);
			ob.checkNetwork();

			ob.init();

			navigator.splashscreen.hide();

		});
	} else {
		ob.init();
	}

	fw.swiper('div.ob-main-slide > .swiper-container');
	$('.view-main > .navbar').addClass('ob-22418a');

	ob.loading(false);

	return false;
};

fw.onPageInit('index', function (page) {
	ob.init();
	ob.barcode.init();
});

fw.onPageAfterAnimation('index', function (page) { 
	ob.toolbar.init({
		name: 'index'
	});
	$('.view-main > .navbar').addClass('ob-22418a');
});
