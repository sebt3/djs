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
