function main() {

	var uid = (function() {
		var index = -1;
		return function() {
			return 'id_' + (++index);
		}
	})();

	// create canvas
	var w = -1,
		h = -1,
		frontCanvas = document.getElementById('front');
	strings = [],
	renderer = new GLRenderer().init(),
	fps = new lib.FPS(),
	mouse = new lib.Mouse(false, document),
	findIntersection = lib.GeomUtil.findIntersection,
	distance = lib.GeomUtil.distance,
	audioControl = new AudioControl(),
	physicsUpdateRate = 8,
	lenToFreq = 80,
	mouseMoved = false,
	prevMousePos = {
		x: -1,
		y: -1
	},
	mousePos = {
		x: -1,
		y: -1
	}, startAt = null,
	endAt = null,
	gui = null;

	function pluck(particles, at, dx, dy) {
		var i = 0,
			len = particles.length,
			strLen = distance(particles[0].x, particles[0].y, particles[len - 1].x, particles[len - 1].y)
			d = 0,
			mul = 0,
			p = null,
			stringVec = new Vector2D(
				particles[len - 1].x - particles[0].x,
				particles[len - 1].y - particles[0].y),
			mouseVec = new Vector2D(dx, dy); //TODO: cache vectors, no need to instanciate new ones

		stringVec.rotate(Math.PI * 0.5); // perpendicular to string
		mouseVec.project(stringVec);// project mouse vector on perpendicular

		for (; i < len; ++i) {
			p = particles[i];
			d = distance(at.x, at.y, p.x, p.y);
			mul = Math.exp(-d * 100 / strLen)
			p.vx += mouseVec.x * mul;
			p.vy += mouseVec.y * mul;
		}
		audioControl.note(lenToFreq / strLen);
	}

	function checkPluck(str) {
		// check segment intersect
		var intersect = findIntersection(
			str.particles[0],
			str.particles[str.particles.length - 1],
			prevMousePos, mousePos);

		if (intersect) {
			str.active = true;
			pluck(str.particles,
				intersect,
				mousePos.x - prevMousePos.x,
				mousePos.y - prevMousePos.y);
		}
	}

	function addString(fromX, fromY, toX, toY) {
		var str = new OSCString(uid());
		str.init(fromX, fromY, toX, toY, 24);
		str.active = true;
		renderer.addLine(str.id, 24);
		strings.push(str);
	}

	// add Audio params
	function addGui() {

		var rv = new dat.GUI();

		var audioFolder = rv.addFolder('Audio');
		audioFolder.add(audioControl, 'burstLen', 12, 1024);
		audioFolder.add(audioControl, 'feedback', 0.8, 0.99);
		audioFolder.add(audioControl, 'dry', 0, 1);
		audioFolder.add(audioControl, 'alpha', 0, 1);
		audioFolder.add(audioControl, 'mul', 0, 0.8);

		var burstProps = ['burstSawMul', 'burstSawAlpha', 'burstNoiseMul', 'burstNoiseAlpha'];

		function updateBurst() {
			audioControl.burstLen = audioControl.burstLen;
		}
		for (var i = 0; i < burstProps.length; ++i) {
			audioFolder.add(audioControl, burstProps[i], 0, 1).onChange(updateBurst);
		}


		var UIFolder = rv.addFolder('UI'),
			mock = {
				acceleration: 0,
				friction: 0,
				physicsUpdateRate: physicsUpdateRate,
				lenToFreq: lenToFreq
			};

		function syncStringProp(propName, newValue) {
			var i = 0,
				len = strings.length;
			for (; i < len; ++i) strings[i][propName] = newValue;
		}

		function addProp(propName) {
			mock[propName] = strings[0][propName];
			UIFolder.add(mock, propName, 0, 1).onChange(syncStringProp.bind(undefined, propName));
		}

		addProp('acceleration');
		addProp('friction');
		UIFolder.add(mock, 'physicsUpdateRate', 1, 20).onChange(function(newValue) {
			physicsUpdateRate = Math.floor(newValue);
		});
		UIFolder.add(mock, 'lenToFreq', 20, 160).onChange(function(newValue) {
			lenToFreq = newValue;
		});

		// disable mouse over gui
		rv.domElement.addEventListener('mouseover', function() {
			mouse.enabled(false);
		});
		rv.domElement.addEventListener('mouseout', function() {
			mouse.enabled(true);
		});

		return rv;
	}

	function updateFrontCanvas() {
		var ctx = frontCanvas.getContext('2d');
		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = '#2FA1D6';
		ctx.strokeStyle = '#2FA1D6';

		ctx.beginPath();
		ctx.arc(startAt.x * w, startAt.y * h, 4, 0, 2 * Math.PI);
		ctx.fill();

		ctx.beginPath();
		ctx.arc(mouse.x, mouse.y, 4, 0, 2 * Math.PI);
		ctx.fill();

		ctx.moveTo(startAt.x * w, startAt.y * h);
		ctx.lineTo(mouse.x, mouse.y);
		ctx.stroke();
	}

	// interact with mouse
	function storeMousePos(x, y) {
		mouseMoved = true;
		mousePos = {
			x: x / w,
			y: y / h
		};
	}

	mouse.position.add(storeMousePos);

	function mouseUpHandler() {
		fps.tick.remove(updateFrontCanvas);
		mouse.up.remove(mouseUpHandler);
		frontCanvas.getContext('2d').clearRect(0, 0, w, h);
		endAt = {
			x: mouse.x / w,
			y: mouse.y / h
		};
		if (distance(startAt.x, startAt.y, endAt.x, endAt.y) > 0.1) {
			addString(startAt.x, startAt.y, endAt.x, endAt.y);
			renderer.resize(w, h);
			if (!gui) gui = addGui();
		}
		mouse.down.add(mouseDownHandler);
	}

	function mouseDownHandler() {
		mouse.down.remove(mouseDownHandler);
		startAt = {
			x: mouse.x / w,
			y: mouse.y / h
		};
		mouse.up.add(mouseUpHandler);
		fps.tick.add(updateFrontCanvas);
	}

	mouse.down.add(mouseDownHandler);

	// update and render on canvas
	fps.tick.add(function(dt) {
		var i = 0,
			j = 0,
			len = strings.length;
		if (mouseMoved) {
			for (i = 0; i < len; ++i) checkPluck(strings[i]);
			prevMousePos = mousePos;
			mouseMoved = false;
		}
		for (i = 0; i < len; ++i) {
			if (strings[i].active) {
				j = physicsUpdateRate;
				while (j--) strings[i].update();
			}
		}
		renderer.render(strings);
	});

	// resize
	function resize() {
		frontCanvas.width = w = window.innerWidth;
		frontCanvas.height = h = window.innerHeight;
		renderer.resize(w, h);
	}
	window.addEventListener('resize', resize);
	resize();

	// start
	mouse.enabled(true);
	fps.enabled(true);
	audioControl.resume();

	window.addEventListener('click', function()	{
		audioControl.note(250);
		})
}

window.onload = main;