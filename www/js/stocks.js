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
									ul.append(li);
									ob.pages.stocks.render(li, {
										productId: item['m.productId'],
										productCode: item['sku.product_code'],
										productName: item['sku.product_name'],
										productSpec: item['m.productSpec'],
										productUom: item['sku.product_uom'],
										productImage: ob.primaryServer + '/images/catalog/large/' + item['sku.product_image'],
										locationId: item['m.locationId'],
									}, item['m.detailId'], item['m.inStock']);
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

		ob.barcode.init($('.ob-icon-scan'));
	},

	render: function( li, opt, detailId, inStock ) {
		li.data('id', detailId)
			.data('sku', opt.productId)
			.data('spec', opt.productSpec)
			.data('uom', opt.productUom)
			.data('lo', opt.locationId);
		li.find('img').attr('data-src', opt.productImage).attr('data-rel', 'external');
		li.find('.item-title').text(opt.productName || '');
		li.find('.item-after').text((inStock || '0') + ' ' + (opt.productUom || ''))
			.data('qty', inStock || 0)
			.on('click', function() {
				var clickingLi = $(this).parents('li:first');
				ob.locations.updateStockBalance({
					detailId: clickingLi.data('id'),
					productId: clickingLi.data('sku'),
					productSpec: clickingLi.data('spec'),
					productUom: clickingLi.data('uom'),
					locationId: clickingLi.data('lo'),
					productName: clickingLi.find('.item-title').text(),
					productImage: clickingLi.find('img').attr('src'),
					qty: $(this).data('qty')
				});
				return false;
			});
		li.find('.item-subtitle').text(opt.productCode || '');
		li.find('.item-text .a1').text(opt.productSpec || '');
		li.find('.item-text .a2').text('');
	},

	update: function( originals, detailId, inStock ) {
		if(ob.pages.stocks.container) {
			var existing = false;
			ob.pages.stocks.container.find('.ob-stock-list > ul').children('li').each(function() {
				if($(this).data('id') === detailId) {
					var ax = $(this).find('.item-after');
					$(ax).data('qty', inStock);
					var text = $(ax).text();
					text = inStock + text.substr(text.indexOf(' '));
					$(ax).text(text);
					existing = true;
				}
			});
			if(!existing) {
				var ul = ob.pages.stocks.container.find('.ob-stock-balance > .ob-stock-list > ul');
				var li = ul.children('li:first').clone(false);
				ul.prepend(li);
				li.find('img').attr('src', originals.productImage);
				this.render(li, {
					productId: originals.productId,
					productCode: originals.productCode,
					productName: originals.productName,
					productSpec: originals.productSpec,
					productUom: originals.productUom,
					productImage: originals.productImage,
					locationId: originals.locationId,
				}, detailId, inStock);
			}
		}
	}
};

fw.onPageInit('stocks', function (page) {
	ob.pages.stocks.init(page);
});
fw.onPageAfterAnimation('stocks', function (page) { 
	ob.toolbar.init(page);
});
