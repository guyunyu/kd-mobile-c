ob.pages.scanproduct = {
	init: function( page ) {
		ob.pages.scanproduct.container = $(page.container);
		ob.pages.scanproduct.productId = unescape(page.query.productId);
		ob.pages.scanproduct.productCode = unescape(page.query.productCode);
		ob.pages.scanproduct.productName = unescape(page.query.productName);
		ob.pages.scanproduct.productUom = unescape(page.query.productUom);
		ob.pages.scanproduct.productSpec = unescape(page.query.productSpec);
		ob.pages.scanproduct.productImage = unescape(page.query.productImage);
		ob.pages.scanproduct.barcode = unescape(page.query.barcode);
		if(ob.pages.scanproduct.productImage) {
			ob.pages.scanproduct.container.find('div.main-img > img').attr('data-src', ob.primaryServer + '/images/catalog/large/' + ob.pages.scanproduct.productImage).attr('data-rel', 'external');
		}
		ob.pages.scanproduct.container.find('div.title > div.name').text(ob.pages.scanproduct.productName);
		if(ob.pages.scanproduct.productSpec) {
			ob.pages.scanproduct.container.find('div.spec > div.name').text(ob.pages.scanproduct.productSpec);
		}
		
		var lo = ob.pages.scanproduct.container.find('.ob-locations');
		lo.find('.item-title').text('Barcode: ' + unescape(ob.pages.scanproduct.barcode));
		var li = ob.pages.scanproduct.container.find('.ob-stock-balance > .ob-stock-list > ul > li');
		if(ob.pages.scanproduct.productImage) {
			li.find('img').attr('data-src', ob.primaryServer + '/images/catalog/large/' + ob.pages.scanproduct.productImage).attr('data-rel', 'external');
		}
		li.find('.item-title').text(ob.pages.scanproduct.productName || '');
		li.find('.item-subtitle').text(ob.pages.scanproduct.productCode || '');
		li.find('.item-text .a1').text(ob.pages.scanproduct.productSpec || '');
		li.find('.item-text .a2').text('');
	}
};

fw.onPageInit('scanproduct', function (page) {
	ob.pages.scanproduct.init(page);
});
fw.onPageAfterAnimation('scanproduct', function (page) { 
	ob.toolbar.init(page);
});
