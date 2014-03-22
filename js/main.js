function testKarplusStrong() {

	function initKS() {
		rv = new KarplusStrong(),
		rv.delay = 1024;
		rv.burstLen = 1024;
		rv.feedback = 0.99;
		rv.dry = 0.5;
		rv.mul = 0.5;
		rv.alpha = 0.1;
		return rv;
	}

	var audioContext = lib.AudioUtil.getContext(),
		bufferLength = 1024,
		scriptProcessor = audioContext.createScriptProcessor(bufferLength, 0, 1),
		ks = initKS(),
		playing = false;

	window.xxx = scriptProcessor; // prevent buggy garbage collection

	scriptProcessor.onaudioprocess = function processAudio(e) {
		ks.processAudio(
			e.outputBuffer.getChannelData(0));
	};

	var gui = new dat.GUI();
	gui.add(ks, 'burstLen', 1, 3000);
	gui.add(ks, 'delay', 1, 3000);
	gui.add(ks, 'feedback', 0.95, 1);
	gui.add(ks, 'dry', 0, 1);
	gui.add(ks, 'mul', 0, 1);
	gui.add(ks, 'alpha', 0, 1);

	function updateBurst() {
		ks.burstLen = ks.burstLen;
	}

	// fine tuning the burst
	var burstProps = ['burstSawMul', 'burstSawAlpha', 'burstNoiseMul', 'burstNoiseAlpha'],
		i = 0;
	for (i; i < burstProps.length; ++i) {
		gui.add(ks, burstProps[i], 0, 1).onChange(updateBurst);
	}

	function audioPlaying(val) {
		if (val) scriptProcessor.connect(audioContext.destination);
		else scriptProcessor.disconnect(audioContext.destination);
		console.log(val ? 'resume' : 'pause');
	}

	function toggleAudio() {
		audioPlaying(playing = !playing);
	}

	window.addEventListener('click', function() {
		ks.pluck();
	});

	window.addEventListener('keydown', function() {
		toggleAudio();
	});

	toggleAudio();
}

function testString() {

	var uid = (function() {
		var index = -1;
		return function() {
			return 'id_' + (++index);
		}
	})();

	// create canvas
	var w = window.innerWidth,
		h = window.innerHeight,
		strings = [],
		renderer = new GLRenderer().init(),
		//...
		fps = new lib.FPS(),
		mouse = new lib.Mouse(false, document),
		//...
		findIntersection = lib.GeomUtil.findIntersection,
		distance = lib.GeomUtil.distance,
		mouseMoved = false,
		prevMousePos = {
			x: -1,
			y: -1
		},
		mousePos = {
			x: -1,
			y: -1
		};

	function pluck(particles, at, dx, dy) {
		var i = 0,
			len = particles.length,
			strLen = distance(particles[0].x, particles[0].y, particles[len - 1].x, particles[len - 1].y)
			d = 0,
			mul = 0,
			p = null;
		for (; i < len; ++i) {
			p = particles[i];
			d = distance(at.x, at.y, p.x, p.y);
			mul = Math.exp(-d * 100 / strLen)
			p.vx += dx * mul;
			p.vy += dy * mul;
		}
	}

	function checkPluck(str) {
		// check segment intersect
		var intersect = findIntersection(
			str.particles[0],
			str.particles[str.particles.length - 1],
			prevMousePos, mousePos); // TODO: build an object to fit function expectation?

		if (intersect) {
			str.active = true;
			pluck(str.particles,
				intersect,
				mousePos.x - prevMousePos.x,
				mousePos.y - prevMousePos.y);
		}
	}

	function storeMousePos(x, y) {
		mouseMoved = true;
		mousePos = {
			x: x / w,
			y: y / h
		};
	}

	function addString(fromX, fromY, toX, toY) {
		var str = new OSCString(uid());
		str.init(fromX, fromY, toX, toY, 24);
		str.active = true;
		renderer.addLine(str.id, 24);
		strings.push(str);
	}

	// add random lines
	var j = 60;
	while (j--) addString(Math.random(), Math.random(), Math.random(), Math.random());

	// interact with mouse
	mouse.position.add(storeMousePos);

	// update and render on canvas
	fps.tick.add(function() {
		var i = 0,
			len = strings.length;
		if (mouseMoved) {
			for (i = 0; i < len; ++i) checkPluck(strings[i]);
			prevMousePos = mousePos;
			mouseMoved = false;
		}
		for (i = 0; i < len; ++i) {
			if (strings[i].active) strings[i].update();
		}
		renderer.render(strings);
	});

	// add gui
	/*var gui = new dat.GUI();
	gui.add(str, 'acceleration', 0, 1);
	gui.add(str, 'originAcceleration', 0, 1);
	gui.add(str, 'friction', 0, 1);*/

	// resize
	window.addEventListener('resize', function() {
		w = window.innerWidth,
		h = window.innerHeight,
		renderer.resize(w, h);
	});

	renderer.resize(w, h);

	// start
	mouse.enabled(true);
	fps.enabled(true);
}

window.onload = testString;