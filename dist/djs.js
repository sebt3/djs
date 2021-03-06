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
	d3.select(window).on('load.jslides',	function() {
		var footer = d3.select('.jslides .footer footer');
		slides.all = d3.select('.jslides .slides').selectAll('section');
		slides.all.classed('out',true);
		d3.select(slides.all.nodes()[nav.current]).classed('out',false);

		/* Add navigation buttons */
		var bar = d3.select('body').append('div').classed('nav_buttons',true);
		bar.append('div').classed('grow',true).html('&lsaquo;')
			.on('click', nav.prev);
		bar.append('div').classed('grow',true).html('&rsaquo;')
			.on('click',nav.next);
		
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

	});
	if (typeof global.hljs === 'object')
		hljs.initHighlightingOnLoad();
	slides.render = nav.render
	slides.hashchange = nav.hashchange
	slides.prev = nav.prev
	slides.next = nav.next
	slides.current = function() { return nav.current; }
}));
(function(global, factory) {
	if (typeof global.d3 !== 'object' || typeof global.d3.version !== 'string')
		throw new Error('tables requires d3v4');
	var v = global.d3.version.split('.');
	if (v[0] != '4')
		throw new Error('tables requires d3v4');
	factory(global.slides = global.slides || {}, d3, global);
})(this, (function(slides, d3, global) {
	var events = {}
	events.keydown = function() {
		switch(d3.event.keyCode) {
			case 8:  // back
			case 37: // left
			case 38: // up
			case 33: // pageup
			case 109:// kp_minus
				slides.prev();break;
			case 13: // enter
			case 32: // space
			case 34: // pagedown
			case 39: // right
			case 40: // down
			case 107:// kp_plus
				slides.next();break;
			case 83: // "s"
				if (typeof slides.speaker === 'object')
					slides.speaker.start();break;
			//default:console.log(d3.event.keyCode);
		}
	}
	events.wheel = function() {
		if(d3.event.wheelDelta<0)
			slides.next();
		else if(d3.event.wheelDelta>0)
			slides.prev();
	}
	events.slide = {}
	events.slide.x = 0;
	function unify(e) {	return e.changedTouches ? e.changedTouches[0] : e };
	events.slide.start = function() {
		events.slide.x = unify(d3.event).clientX;
	}
	events.slide.end = function() {
		if (events.slide.x === 0) return;
		var dx = unify(d3.event).clientX - events.slide.x;
		events.slide.x = 0;
		slides.render(slides.current()-Math.sign(dx));
	}
	d3.select(window).on('load.events.jslides',	function() {
		d3.select(window)
			.on(     'wheel.jslides',	events.wheel, {passive: true})
			.on(   'keydown.jslides',	events.keydown)
			.on('touchstart.jslides',	events.slide.start)
			.on(  'touchend.jslides',	events.slide.end)
			.on('hashchange.jslides',	slides.hashchange);
			/*.on( 'mousedown.jslides',	events.slide.start)
			.on(   'mouseup.jslides',	events.slide.end);*/
	});

}));
(function(global, factory) {
	if (typeof global.d3 !== 'object' || typeof global.d3.version !== 'string')
		throw new Error('tables requires d3v4');
	var v = global.d3.version.split('.');
	if (v[0] != '4')
		throw new Error('tables requires d3v4');
	factory(global.slides = global.slides || {}, d3, global);
})(this, (function(slides, d3, global) {
	var speaker = {}
	speaker.nav = function(id) {
		if ('w' in speaker === false) return;
		if (speaker.w.closed) return;

		speaker.slides_cur.classed('out',true);
		speaker.slides_next.classed('out',true);
		d3.select(speaker.slides_cur.nodes()[id]).classed('out',false);
		if (id<slides.all.nodes().length)
			d3.select(speaker.slides_next.nodes()[id+1]).classed('out',false);
		speaker.notes.html('');
		var notes = d3.select(slides.all.nodes()[id]).select('.notes');
		if (! notes.empty() )
			speaker.notes.node().insertBefore(notes.node().cloneNode(true),undefined);
	}
	speaker.start = function() {
		if ('w' in speaker && ! speaker.w.closed) {
			speaker.w.moveBy(0, 0);
			speaker.w.focus();
			return;
		}
		/* Create the window and the pointers */
		speaker.w  = window.open('', '_blank', 'toolbar=0,location=0,menubar=0');
		speaker.w.document.write('<html><head><title>speaker view</title><style>.column{margin:0 0;padding:10px 10px;float:left;width:50%; height:100%;box-sizing: border-box;} iframe{width:190%;height:90%;box-sizing: border-box;margin: 2% 2%;transform-origin: 0 0;transform: scale(0.50);margin-bottom:-45%;} .right .control{border-bottom:1px solid black;} button{margin:5px 5px;}</style></head><body><div class="column left"><iframe class="current"></iframe><iframe class="next"></iframe></div><div class="column right"><div class="control"></div><div class="notes"></div></div></body></html>');
		speaker.frame_cur = d3.select(speaker.w.document).select('.current');
		speaker.frame_next = d3.select(speaker.w.document).select('.next');
		speaker.control = d3.select(speaker.w.document).select('.control');
		speaker.notes = d3.select(speaker.w.document).select('.notes');
		speaker.current = d3.select(speaker.frame_cur.node().contentDocument);
		speaker.next = d3.select(speaker.frame_next.node().contentDocument);
		/* set the controls bar */
		var tb = speaker.control.append('div');
		tb.append('button').attr('type','button').html('&laquo;').on('click',function() {slides.prev(5)});
		tb.append('button').attr('type','button').html('&lsaquo;').on('click',slides.prev);
		tb.append('button').attr('type','button').html('&rsaquo;').on('click',slides.next);
		tb.append('button').attr('type','button').html('&raquo;').on('click',function() {slides.next(5)});
		var s = tb.append('select').attr('id','select').on('change',function() {
			slides.render(tb.select('#select').property('value')-1);
		});
		slides.all.each(function(i){
			var t;
			var me = d3.select(this).select(".title");
			if (!me.select('h1').empty())
				t = me.select('h1').text();
			else if (d3.select(this).classed('first') && !d3.select(this).select('h1').empty())
				t = d3.select(this).select('h1').text();
			else
				t = 'slide '+i;
			if (!me.select('h2').empty()) 
				t+=' - '+me.select('h2').text();
			s.append('option').attr('value',i).text(t);
		});

		/* Copy the stylesheets */
		for (var i = 0, len = document.styleSheets.length; i < len; i++) {
			if(document.styleSheets[i].href != null) {
				speaker.current.select('head').append('link')
					.attr('rel','stylesheet')
					.attr('href',document.styleSheets[i].href);
				speaker.next.select('head').append('link')
					.attr('rel','stylesheet')
					.attr('href',document.styleSheets[i].href);
			}
		}
		/* Copy the styles */
		d3.select('head').selectAll('style').nodes().forEach(function(s) {
			speaker.current.select('head').node().insertBefore(s.cloneNode(true),undefined);
			speaker.next.select('head').node().insertBefore(s.cloneNode(true),undefined);
		});
		/* Copy the slides */
		speaker.current.select('body')
			.append('div').classed('jslides',true)
			.append('div').classed('slides',true).node()
			.insertBefore(d3.select('.jslides .slides').node().cloneNode(true),undefined);
		speaker.next.select('body')
			.append('div').classed('jslides',true)
			.append('div').classed('slides',true).node()
			.insertBefore(d3.select('.jslides .slides').node().cloneNode(true),undefined);
		speaker.slides_cur = speaker.current.select('.jslides .slides').selectAll('section');
		speaker.slides_next = speaker.next.select('.jslides .slides').selectAll('section');
		speaker.nav(slides.current());

	}
	slides.speaker = {}
	slides.speaker.nav = speaker.nav
	slides.speaker.start = speaker.start
}));
