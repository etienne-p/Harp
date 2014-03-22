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

	// create canvas
	var canvas = document.getElementById('mycanvas'),
		requestUpdate = new lib.Signal(),
		str = new OSCString(requestUpdate);

	function render(particles) {
		var ctx = canvas.getContext('2d'),
			pi2 = 2 * Math.PI,
			p = null,
			i = 0,
			len = particles.length,
			w = canvas.width = window.innerWidth,
			h = canvas.height = window.innerHeight;

		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = '#ff0000';
		ctx.strokeStyle = '#ff0000';

		p = particles[0];
		ctx.moveTo(p.x * w, p.y * h);

		for (i = 1; i < len; ++i) {
			p = particles[i];
			ctx.lineTo(p.x * w, p.y * h);
		}

		ctx.stroke();
	}

	requestUpdate.add(function(who, what) {
		console.log('str: [' + who + '] needs update: [' + what + ']');
	});

	str.init(0.5, 0.1, 0.5, 0.9, 24);

	var fps = new lib.FPS(),
		mouse = new lib.Mouse(false, document);

	// update and render on canvas
	fps.tick.add(function() {
		render(str.update());
	});

	mouse.click.add(function(x, y) {
		var len = str.particles.length;
		var index = Math.floor(len * y / window.innerHeight);
		index = Math.min(len - 2, Math.max(1, index));
		str.particles[index].vx += 0.2 * (0.5 - Math.random());
	});

	// interact with mouse

	// add gui
	var gui = new dat.GUI();
	gui.add(str, 'acceleration', 0, 1);
	gui.add(str, 'originAcceleration', 0, 1);
	gui.add(str, 'friction', 0, 1);

	// start
	mouse.enabled(true);
	fps.enabled(true);
}

window.onload = testString;