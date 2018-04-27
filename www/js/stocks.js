ob.pages.stocks = {
	init: function( page ) {
		ob.pages.stocks.container = $(page.container);
		ob.pages.stocks.locationId = page.query.locationId;
		var lo = ob.pages.stocks.container.find('.ob-locations');
		lo.find('.item-title').text(unescape(page.query.title));
		lo.find('.item-subtitle').text(unescape(page.query.title));
		lo.find('.item-text .a1').text(unescape(page.query.a1));
		lo.find('.item-text .a2').text(unescape(page.query.a2));

		if(ob.session.status === 'success') {
			ob.loading(true);
			ob.ajax({
				url: ob.url('/oauth2/resource/malo/ManagedLocationDetail.List'),
				data: {
					locationId: ob.pages.stocks.locationId
				},
				method: 'GET',
				success: function(dt) {
					try {
						var json = JSON.parse(dt);
						if(json.status === 'success') {
							if(json.count > 0) {
								ob.pages.stocks.container.find('.ob-stock-balance > .ob-empty').hide();
								var ul = ob.pages.stocks.container.find('.ob-stock-balance > .ob-stock-list > ul');
								var template = ul.children('li:first').clone(false);
								ul.empty();
								for(var index=0; index<json.data.length; index++) {
									var item = json.data[index];
									var li = template.clone(false);
									li.data('id', item['m.detailId']);
									li.find('img').attr('data-src', 'https://www.kumpulan.com.sg/images/catalog/' + item['sku.product_image']).attr('data-rel', 'external');;
									li.find('.item-title').text(item['sku.product_name'] || '');
									li.find('.item-after').text((item['m.inStock'] || '0') + ' ' + (item['sku.product_uom'] || ''))
										.data('qty', item['m.inStock'] || 0)
										.on('click', function() {
											ob.locations.updateStockBalance(this);
											return false;
										});
									li.find('.item-subtitle').text(item['sku.product_code'] || '');
									li.find('.item-text .a1').text(item['m.productSpec'] || '');
									li.find('.item-text .a2').text('');
									ul.append(li);
								}
								ul.parent().show();
							}
						} else {
							ob.error('It fails to connect Kumpulan Online.')
						}
					} catch(e) {
						ob.error(e);
					}
				},
				error: function(xhr, code) {
					if(code === 403 || code === 401) {
						fw.loginScreen();
					} else {
						ob.error(code);
					}
				}
			});
		}
	}
};

fw.onPageInit('stocks', function (page) {
	ob.pages.stocks.init(page);
});
fw.onPageAfterAnimation('stocks', function (page) { 
	ob.toolbar.init(page);
});
