// responsible for managing a pool of synthesizers
var AudioControl = function() {
	this._audioContext = lib.AudioUtil.getContext();
	this._maxPoolSize = 4;
	this._bufferLength = 1024,
	this._scriptProcessor = this._audioContext.createScriptProcessor(this._bufferLength, 0, 1),
	window.xxx = this._scriptProcessor; // prevent buggy garbage collection
	this._synths = []; // so we can quickly iterate
	this._synthIndex = {}; // and find by id
	this._scriptProcessor.onaudioprocess = this._processAudio.bind(this);
}

AudioControl.prototype = {

	constructor: AudioControl,

	pause: function() {
		this._scriptProcessor.disconnect(this._audioContext.destination);
	},

	resume: function() {
		this._scriptProcessor.connect(this._audioContext.destination);
	},

	playSynth: function(id) {
		var synth = this._synths[this._synthIndex[id]];
		synth.active = true;
		synth.pluck();
	},

	addSynth: function(id, pitch) {

		if (this._synthIndex.hasOwnProperty(id)) throw 'Synth id: [' + id + '] already exists'

		// TODO: handle pitch
		var rv = new KarplusStrong();
		rv.delay = 1024;
		rv.burstLen = 1024;
		rv.feedback = 0.99;
		rv.dry = 0.5;
		rv.mul = 0.1;
		rv.alpha = 0.1;

		this._synthIndex[id] = this._synths.length;
		this._synths[this._synths.length] = rv;
	},

	_processAudio: function(e) {
		// compute active processors
		var outputBuf = e.outputBuffer.getChannelData(0),
			i = 0,
			synth = null;
			len = this._synths.length;
		for(; i < len; ++i){
			synth = this._synths[i];
			if (synth.active) {
				synth.processAudio(outputBuf);
				synth.active = synth.level > 0.001;
			}
		}
	}
}