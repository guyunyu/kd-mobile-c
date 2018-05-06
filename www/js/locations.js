ob.locations = {
	barcodeKey: 'bar-',
	render: function( dt ) {
		var json;
		if(typeof dt === 'string') {
			json = JSON.parse(dt);
		} else {
			json = dt;
		}
		if(json.status === 'success') {
			if(json.count > 0) {
				$('.ob-main-body > .main-body-inner > .ob-empty').hide();
				var ul = $('.ob-main-body > .main-body-inner > .ob-locations > ul');
				var template = ul.children('li:first').clone(false);
				ul.empty();
				for(var index=0; index<json.data.length; index++) {
					var item = json.data[index];
					var li = template.clone(false);
					li.find('.item-title').text(item['lo.location_name'] || '');
					li.find('.item-after').text('');
					li.find('.item-subtitle').text(item['lo.address3'] || '');
					li.find('.item-text .a1').text(item['lo.address1'] || '');
					li.find('.item-text .a2').text(item['lo.address2'] || '');
					li.find('a').data('lo', item['lo.location_id']).on('click', function() {
						var url = 'pages/stocks.html?locationId=' + $(this).data('lo')
							+ '&title=' + escape($(this).find('.item-title').text())
							+ '&subtitle=' + escape($(this).find('.item-subtitle').text())
							+ '&a1=' + escape($(this).find('.item-text .a1').text())
							+ '&a2=' + escape($(this).find('.item-text .a2').text())
						ob.mainView.router.load({
							url: url
						});
						return false;
					});
					ul.append(li);
				}
				ul.parent().show();
			}
		}
	},
	
	updateStockBalance: function( opt ) {
		var popup = $('.popup-update-stockbalance');
		if(!popup.data('init')) {
			popup.data('init', true);
			popup.find('a.update').on('click', function() {
				var data = {};
				$(this).parents('.popup').find('.column').each(function() {
					data[$(this).attr('name')] = ob.getValue(this);
				});
				if(!data['m.inStock'] || data['m.inStock'] < 0) {
					fw.alert('Stock quantity must be zero or greater.');
					return false;
				}
				ob.ajax({
					url: ob.url('/oauth2/resource/execute/malo/UpdateStockBalance'),
					method: 'POST',
					data: data,
					success: function(dt) {
						try {
							var json = JSON.parse(dt);
							if(json.status === 'success') {
								if(ob.pages.stocks && ob.pages.stocks.container) {
									ob.pages.stocks.update(opt, json.rflag.detailId, json.rflag.inStock);
								}
								fw.closeModal('.popup-update-stockbalance.modal-in');
							} else {
								ob.error('update is not successful');
							}
						} catch(e) {
							ob.error(e);
						}
					}
				});
				return false;
			});
		}
		fw.popup(popup);
		popup.find('.column').each(function() {
			if(this.name === 'm.currentStock') {
				ob.setValue(this, opt.qty + ' ' + opt.productUom);
			} else if(this.name === 'm.inStock') {
				ob.setValue(this, '');
				this.select();
				this.focus();
			} else if(this.name === 'm.detailId') {
				ob.setValue(this, opt.detailId || '');
			} else if(this.name === 'm.productId') {
				ob.setValue(this, opt.productId);
			} else if(this.name === 'm.productSpec') {
				ob.setValue(this, opt.productSpec || '');
			} else if(this.name === 'lo.locationId') {
				ob.setValue(this, opt.locationId);
			}
		});
		popup.find('.card-content-inner.sku > .sku-image > img').attr('src', opt.productImage);
		popup.find('.card-content-inner.sku > .sku-name .name').text(opt.productName);
		popup.find('.card-content-inner.sku > .sku-name .spec').text(opt.productSpec || '');
	},

	receiveTx: function( tx ) {
		var popup = $('.popup-scan-tx');
		if(!popup.data('init')) {
			popup.data('init', true);
			popup.find('a.update').on('click', function() {
				var data = {};
				$(this).parents('.popup').find('.column').each(function() {
					data[$(this).attr('name')] = ob.getValue(this);
				});
				ob.ajax({
					url: ob.url('/oauth2/resource/execute/malo/ReceiveTx'),
					method: 'POST',
					data: data,
					success: function(dt) {
						try {
							var json = JSON.parse(dt);
							if(json.status === 'success' && json.rflag.updates > 0) {
								fw.closeModal('.popup-scan-tx.modal-in');
							} else {
								ob.error('Update is not successful. Please make sure the delivery order / invoice is scanned & received once only.', true);
							}
						} catch(e) {
							ob.error(e);
						}
					}
				});
				return false;
			});
		}
		fw.popup(popup);
		popup.find('.column').each(function() {
			if(this.name === 'tx') {
				ob.setValue(this, tx);
			}
		});
	},
	
	processProductBarcode: function( barcode ) {
		var v = this.resolveBarcodeLocally(barcode);
		if(v && v.productId) {
			return this.scanProduct(v);
		} else {
			this.resolveBarcodeRemotely(barcode, function( v, code ) {
				if(v && v.productId) {
					this.cacheBarcodeLocally(code, v);
					if(v.barcode !== code) {
						this.cacheBarcodeLocally(v.barcode, v);
					}
					return this.scanProduct(v);
				} else {
					fw.alert('Barcode ' + code + ' does not match any valid product.');
				}
			});
		}
	},

	resolveBarcodeLocally: function( barcode ) {
		var value = window.localStorage.getItem(this.barcodeKey + barcode);
		if(typeof value === 'string') {
			var v = JSON.parse(value);
			if(v.productId) {
				return v;
			}
		}
		return false;
	},

	cacheBarcodeLocally: function( barcode, v) {
		var text = JSON.stringify(v);
		window.localStorage.setItem(this.barcodeKey + barcode, text);
	},

	resolveBarcodeRemotely: function( barcode, cb ) {
		var caller = this;
		ob.ajax({
			url: ob.url('/oauth2/resource/malo/LookupBarcode.List'),
			method: 'GET',
			data: { barcode: barcode },
			success: function( dt ) {
				try {
					var json = JSON.parse(dt);
					if(json.status === 'success' && json.count > 0 && json.data) {
						if(json.data.length > 1) {
							for(var index=0; index<json.data.length; index++) {
								var e = json.data[index];
								if(barcode === e['ba.barcode_value']) {
									var result = {
											productId: e['sku.product_id'],
											productCode: e['sku.product_code'],
											productName: e['sku.product_name'],
											productSpec: e['ba.product_spec_a'],
											productUom: e['sku.product_uom'],
											productImage: e['sku.product_image'],
											barcode: e['ba.barcode_value']
									};
									cb.call(caller, result, barcode);
									return;
								}
							}
						}
						var e = json.data[0];
						var result = {
								productId: e['sku.product_id'],
								productCode: e['sku.product_code'],
								productName: e['sku.product_name'],
								productSpec: e['ba.product_spec_a'],
								productUom: e['sku.product_uom'],
								productImage: e['sku.product_image'],
								barcode: e['ba.barcode_value']
						};
						cb.call(caller, result, barcode);
					} else {
						cb.call(caller, {}, barcode);
					}
				} catch(e) {
					ob.error(e);
				}
			}
		});
	},
	
	scanProduct: function( v ) {
//		var url = 'pages/scanproduct.html?productId=' + v.productId
//				+ '&productCode=' + escape(v.productCode)
//				+ '&productName=' + escape(v.productName)
//				+ '&productSpec=' + escape(v.productSpec ? v.productSpec : '')
//				+ '&productUom=' + escape(v.productUom)
//				+ '&productImage=' + escape(v.productImage ? v.productImage : '')
//				+ '&barcode=' + v.barcode;
//		ob.mainView.router.load({
//			url: url
//		});
		if(!ob.pages.stocks || !ob.pages.stocks.container) {
			fw.alert('It is allowed to scan a product at stock balance page only.');
			return false;
		}
		if(!ob.pages.stocks.locationId) {
			fw.alert('It is allowed to scan a product after you choose a location.');
			return false;
		}
		var qty = 0, detailId = '';
		ob.pages.stocks.container.find('.ob-stock-list > ul').children('li').each(function() {
			if($(this).data('sku') === v.productId) {
				if(($(this).data('spec') || '') === (v.productSpec || '')) {
					detailId = $(this).data('id');
					qty = $(this).find('a.item-after').data('qty');
				}
			}
		});
		ob.locations.updateStockBalance({
			detailId: detailId,
			productId: v.productId,
			productCode: v.productCode,
			productSpec: v.productSpec,
			productUom: v.productUom,
			locationId: ob.pages.stocks.locationId,
			productName: v.productName,
			productImage: ob.primaryServer + '/images/catalog/large/' + v.productImage,
			qty: qty
		});
		return false;
	}

};