ob.toolbar = {
	init: function( page ) {
		var toolbar_showme = function() {
			if(!ob.mainView.allowPageChange) {
				ob.mainView.allowPageChange = true;
			}
			ob.mainView.router.load({
				url: 'pages/m/my.html'
			});
			return false;
		};
		$('.toolbar .me').off('click', toolbar_showme);
		if(page && page.name) {
			$('div.page').each(function() {
				if($(this).data('page') === page.name) {
					$(this).find('.toolbar .me').on('click', toolbar_showme);
				}
			});
		}
	}
};