// responsible for managing a pool of synthesizers
var AudioControl = function() {
	this._audioContext = lib.AudioUtil.getContext();
	this._maxPoolSize = 12; // 4 voices
	this._bufferLength = 512,
	this._scriptProcessor = this._audioContext.createScriptProcessor(this._bufferLength, 0, 1),
	window.xxx = this._scriptProcessor; // prevent buggy garbage collection
	this._synths = []; // so we can quickly iterate
	this._scriptProcessor.onaudioprocess = this._processAudio.bind(this);

	var i = this._maxPoolSize;
	while (i--) this._addSynth().active = false;
}

AudioControl.prototype = {

	constructor: AudioControl,

	pause: function() {
		this._scriptProcessor.disconnect(this._audioContext.destination);
	},

	resume: function() {
		this._scriptProcessor.connect(this._audioContext.destination);
	},

	note: function(freq) {
		var synth = this._getFreeSynth();
		synth.active = true;
		synth.delay = 44100 / freq;
		synth.pluck();
		console.log('frreq: [' + freq + '], delay: [' + synth.delay + ']');
	},

	_getFreeSynth: function() {
		var rv = this._synths[0],
			time = Number.MAX_VALUE,
			i = 0,
			len = this._synths.length;
		for (; i < len; ++i) {
			synth = this._synths[i];
			if (synth.latestPluck < time) {
				time = (rv = synth).latestPluck;
			}
		}
		return rv;
	},

	_addSynth: function() {
		var rv = new KarplusStrong();
		rv.delay = 1024;
		rv.burstLen = 1024;
		rv.feedback = 0.99;
		rv.dry = 0.5;
		rv.alpha = 0.1;
		rv.mul = 0.2;
		this._synths.push(rv);
		return rv;
	},

	_processAudio: function(e) {
		// compute active processors
		var outputBuf = e.outputBuffer.getChannelData(0),
			i = 0,
			synth = null,
			bufLen = outputBuf.length,
			len = this._synths.length;

		for (i = 0; i < bufLen; ++i) outputBuf[i] = 0;

		for (i = 0; i < len; ++i) {
			synth = this._synths[i];
			if (synth.active) {
				synth.processAudio(outputBuf);
				synth.active = synth.level > 0.001;
			}
		}
	}
}

function addGroupAccessor(propName) {
	Object.defineProperty(AudioControl.prototype, propName, {
		get: function() {
			return this._synths[0][propName];
		},
		set: function(value) {
			var i = 0,
				len = this._synths.length;
			for (; i < len; ++i) this._synths[i][propName] = value;
		}
	});
}

addGroupAccessor('burstLen');
addGroupAccessor('feedback');
addGroupAccessor('dry');
addGroupAccessor('alpha');
addGroupAccessor('mul');
addGroupAccessor('burstSawMul');
addGroupAccessor('burstSawAlpha');
addGroupAccessor('burstNoiseMul');
addGroupAccessor('burstNoiseAlpha');