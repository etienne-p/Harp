// responsible for managing a pool of synthesizers
var AudioControl = function() {
	this._audioContext = lib.AudioUtil.getContext();
	this._maxPoolSize = 12; // 4 voices
	this._bufferLength = 256,
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

	note: function(pitch, velocity) {
		var synth = this._getLowestLevelSynth();
		synth.active = true;
		synth.delay = 1024 / pitch;
		synth.mul = velocity;
		synth.pluck();
	},

	_getLowestLevelSynth: function() {
		var rv = null,
			level = Number.MAX_VALUE,
			i = 0,
			synth = null,
			len = this._synths.length;
		for (; i < len; ++i) {
			synth = this._synths[i];
			if (synth.level < level) {
				level = (rv = synth).level;
			}
		}
		return rv;
	},

	_addSynth: function() {

		// TODO: handle pitch
		var rv = new KarplusStrong();
		rv.delay = 1024;
		rv.burstLen = 1024;
		rv.feedback = 0.99;
		rv.dry = 0.5;
		rv.alpha = 0.1;
		rv.mul = 0;

		this._synths.push(rv);
		return rv;
	},

	_processAudio: function(e) {
		// compute active processors
		var outputBuf = e.outputBuffer.getChannelData(0),
			i = 0,
			synth = null;
		len = this._synths.length;
		for (; i < len; ++i) {
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
addGroupAccessor('burstSawMul');
addGroupAccessor('burstSawAlpha');
addGroupAccessor('burstNoiseMul');
addGroupAccessor('burstNoiseAlpha');
