ob.pages.my = {
	init: function( page ) {

		ob.pages.my.container = $(page.container);

		if(ob.session.status === 'success') {
			ob.pages.my.container.find('.ob-icon-login').find('.icon > i').text('person');
			ob.pages.my.container.find('.ob-icon-login').find('a > span.name').text(ob.session.mn);
			ob.pages.my.container.find('.ob-signed-in a.signout').on('click', function() {
				window.localStorage.setItem('session', '{}');
				ob.session = {};
				window.location.reload();
				return false;
			});

			ob.ajax({
				url: ob.url('/oauth2/resource/malo/UserInfo'),
				method: 'GET',
				success: function(dt) {
					try {
						var json = JSON.parse(dt);
						if(json.status === 'success') {
							ob.pages.my.data = json.data;
							ob.pages.my.show();
						} else {
							ob.error('It fails to connect Office Buddy.')
						}
					} catch(e) {
						ob.error(e);
					}
				},
				error: function(xhr, code) {
					if(code === 403) {
						fw.loginScreen();
					} else {
						ob.error(code);
					}
				}
			});
			ob.pages.my.container.find('.ob-signed-in').show();
			ob.pages.my.container.find('.ob-signed-out').hide();
		} else {
			ob.pages.my.container.find('.ob-signed-out').find('a.sign-in').on('click', function() {
				fw.loginScreen();
				return false;
			});
			ob.pages.my.container.find('.ob-signed-out').show();
			ob.pages.my.container.find('.ob-signed-in').hide();
		}
	},
	show: function() {
		var json = ob.pages.my.data;
		ob.pages.my.container.find('.ob-signed-in .name').text(json['u.userName']);
	}
};

fw.onPageInit('my', function (page) {
	ob.pages.my.init(page);
});
fw.onPageAfterAnimation('my', function (page) { 
	ob.toolbar.init(page);
});
