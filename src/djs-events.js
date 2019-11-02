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
