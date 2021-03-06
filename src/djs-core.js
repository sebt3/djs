(function(global, factory) {
	if (typeof global.d3 !== 'object' || typeof global.d3.version !== 'string')
		throw new Error('tables requires d3v4');
	var v = global.d3.version.split('.');
	if (v[0] != '4')
		throw new Error('tables requires d3v4');
	factory(global.slides = global.slides || {}, d3, global);
})(this, (function(slides, d3, global) {
	var nav = {}

	/*
	 * Navigation
	 *************/
	nav.read = function() {
		if (window.location.hash.length == 0) return 0;
		var id = Number.parseInt(window.location.hash.substring(1));
		if (Number.isNaN(id))	return 0;
		return id;
	}
	nav.write = function(id) { window.location.hash = id; }
	nav.current = nav.read();
	nav.render = function(id) {
		if (id<0)
			id=0;
		if(id>=slides.all.nodes().length)
			id=slides.all.nodes().length-1;
		if (nav.current==id) return null;
		d3.select(slides.all.nodes()[nav.current]).classed('out',true);
		d3.select(slides.all.nodes()[id]).classed('out',false);
		if (typeof slides.speaker === 'object') slides.speaker.nav(id);
		nav.current = id;
		nav.write(id);
	}
	nav.hashchange = function() {
		nav.render(nav.read());
	}
	nav.prev = function(m) { if(typeof m === 'undefined')m=1;nav.render(nav.current-m); }
	nav.next = function(m) { if(typeof m === 'undefined')m=1;nav.render(nav.current+m); }

	/*
	 * Complete the document after loading
	 **************************************/
	slides.init = 	function() {
		var footer = d3.select('.jslides .footer footer');
		slides.all = d3.select('.jslides .slides').selectAll('section');
		slides.all.classed('out',true);
		d3.select(slides.all.nodes()[nav.current]).classed('out',false);
		
		/* Complete slide number and optional footer */
		slides.all.each(function(d,t){
			var me = d3.select(this).datum(t+1);
			if(!me.classed('first')) {
				if (me.select(".title").empty()) {
					me.insert('div',':first-child').classed('title',true);
				}
				me.select(".title").append('span').classed('num',true).text((t+1)+'/'+slides.all.nodes().length);
			}
			if (! footer.empty())
				me.node().insertBefore(footer.node().cloneNode(true),undefined);
		});
		/* Complete optional toc */
		d3.select('.jslides .slides').selectAll('section.index').each(function(d,t) {
			var ol = d3.select(this).append('div').classed('content',true).append('ol');
			var li;
			var prev = '';
			var sub = '';
			var have_child = false;
			slides.all.each(function(i){
				var t1, t2='';
				if (i<=d) return;
				var me = d3.select(this).select(".title");
				if (me.select('h1').empty()) return;
 				t1 = me.select('h1').text();
				if (!me.select('h2').empty()) 
					t2=me.select('h2').text();
				if (t1 != prev) {
					have_child = false;
					prev = t1;
					sub = t2;
					li = ol.append('li').attr('value',i).text(t1);
				} else if (have_child && t2!='') {
					li.select('ol').append('li').attr('value',i).text(t2);
				} else if (! have_child && t2!='' && sub!='') {
					have_child = true;
					var o = li.append('ol');
					o.append('li').attr('value',li.attr('value')).text(sub);
					o.append('li').attr('value',i).text(t2);
				}
			});
			if (ol.selectAll('li').nodes().length>40) {
				ol.selectAll('ol').remove();
			}
			var th = window.innerHeight -  d3.select(this).select('div.title').node().getBoundingClientRect().height;
			var h = ol.node().getBoundingClientRect().height;
			if (h>th) {
				ol.style('transform-origin','top');
				ol.style('transform','scale('+0.9*th/h+')');
			}
			/*if (ol.selectAll('li').nodes().length>10)
				ol.style('font-size', 50/(ol.selectAll('li').nodes().length)+'vh');*/
		});

	}
	d3.select(window).on('load.jslides',slides.init);
	if (typeof global.hljs === 'object')
		hljs.initHighlightingOnLoad();
	slides.render = nav.render
	slides.hashchange = nav.hashchange
	slides.prev = nav.prev
	slides.next = nav.next
	slides.current = function() { return nav.current; }
}));
