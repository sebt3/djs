(function(global, factory) {
	if (typeof global.d3 !== 'object' || typeof global.d3.version !== 'string')
		throw new Error('tables requires d3v4');
	var v = global.d3.version.split('.');
	if (v[0] != '4')
		throw new Error('tables requires d3v4');
	factory(global.slides = global.slides || {}, d3, global);
})(this, (function(slides, d3, global) {
	var all_slides = [];
	var current = 0;
	function render(id) {
		if (id<0||id>=all_slides.nodes().length||current==id) return null;
		d3.select(all_slides.nodes()[current]).classed('out',true);
		d3.select(all_slides.nodes()[id]).classed('out',false);
		current = id;
	}
	function prev() { render(current-1); }
	function next() { render(current+1); }
	slides.all = function() {return all_slides; }
	d3.select(window).on('load.jslides',	function() {
		var footer = d3.select('.jslides .footer footer');
		all_slides = d3.select('.jslides .slides').selectAll('section');
		all_slides.classed('out',true);
		d3.select(all_slides.nodes()[current]).classed('out',false);
		// Complete slide number and optional footer
		all_slides.each(function(d,t){
			var me = d3.select(this).datum(t+1);
			if(!me.classed('first')) {
				if (me.select(".title").empty()) {
					me.insert('div',':first-child').classed('title',true);
				}
				me.select(".title").append('span').classed('num',true).text((t+1)+'/'+all_slides.nodes().length);
			}
			if (! footer.empty())
				me.node().insertBefore(footer.node().cloneNode(true),undefined);
		});
		// Complete optional toc
		d3.select('.jslides .slides').selectAll('section.index').each(function(d,t) {
			var ol = d3.select(this).append('ol');
			var li;
			var prev = '';
			var sub = '';
			var have_child = false;
			all_slides.each(function(i){
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
		});
		

		//d3.select(window).on('click.jslides', next);
		d3.select(window).on('keydown.jslides', function() {
			switch(event.keyCode) {
				case 8:  // back
				case 37: // left
				case 38: // up
				case 109:// kp_minus
					prev();break;
				case 13: // enter
				case 32: // space
				case 39: // right
				case 40: // down
				case 107:// kp_plus
					next();break;
				//default:console.log(event.keyCode);
			}
		});
		d3.select(window).on('wheel.jslides', function() {
			if(event.wheelDelta<0)
				next();
			else if(event.wheelDelta>0)
				prev();
		}, {passive: true});
	});
	if (typeof global.hljs === 'object')
		hljs.initHighlightingOnLoad();
}));