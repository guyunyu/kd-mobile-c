ob.locations = {
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
	
	updateStockBalance: function( a ) {
		var popup = $('.popup-update-stockbalance');
		if(!popup.data('init')) {
			popup.data('init', true);
			popup.find('a.update').on('click', function() {
				var data = {};
				$(this).parents('.popup').find('.column').each(function() {
					data[$(this).attr('name')] = ob.getValue(this);
				});
				ob.ajax({
					url: ob.url('/oauth2/resource/execute/malo/UpdateStockBalance'),
					method: 'POST',
					data: data,
					success: function(dt) {
						try {
							var json = JSON.parse(dt);
							if(json.status === 'success') {
								$(a).parents('ul:first').children('li').each(function() {
									if($(this).data('id') === json.rflag.detailId) {
										var ax = $(this).find('.item-after');
										$(ax).data('qty', json.rflag.inStock);
										var text = $(ax).text();
										text = json.rflag.inStock + text.substr(text.indexOf(' '));
										$(ax).text(text);
									}
								});
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
		var li = $(a).parents('li:first');
		popup.find('.column').each(function() {
			if(this.name === 'm.currentStock') {
				ob.setValue(this, $(a).data('qty'));
			} else if(this.name === 'm.inStock') {
				ob.setValue(this, '');
				this.select();
				this.focus();
			} else if(this.name === 'm.detailId') {
				ob.setValue(this, li.data('id'));
			}
		});
		popup.find('.card-content-inner.name').text(li.find('.item-title').text());
		popup.find('.card-content-inner.spec').text(li.find('.item-text .a1').text());
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
	}

};