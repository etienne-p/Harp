KSMixin = (function() {

	function zero(len_) {
		var rv = [],
			len = Math.floor(len_);
		for (var i = 0; i < len; ++i) rv[i] = 0;
		return rv;
	}

	function noise(len_) {
		var rv = [],
			len = Math.floor(len_),
			i = 0;
		for (; i < len; ++i) rv[i] = Math.random() * 2 - 1;
		return rv;
	}

	function saw(len_) {
		var rv = [],
			len = Math.floor(len_),
			i = 0;
		for (; i < len; ++i) {
			ratio = i / len;
			rv[i] = ((1 - ratio) * 2) - 1;
		}
		return rv;
	}

	function mix(a, b, mulA, mulB) {
		var i = 0,
			len = Math.min(a.length, b.length),
			rv = [];
		for (; i < len; ++i) rv[i] = a[i] * mulA + b[i] * mulB;
		return rv;
	}

	return function() {
		this.zero = zero;
		this.noise = noise;
		this.saw = saw;
		this.mix = mix;
		return this;
	}
})();

var KarplusStrong = function() {
	this.mul = 1;
	this.alpha = 0; // low pass alpha
	this._feedback = 0;
	this._dry = 0.5;
	this._index = -1; // sample index, init in updateWavetable
	this._delay = -1;
	//...
	this.burstSawMul = 0.5;
	this.burstSawAlpha = 0.5;
	this.burstNoiseMul = 0.5;
	this.burstNoiseAlpha = 0.5;

	this._wavetable = this.zero(2048); // 2048: max delay

	this.level = 0;
	this.latestPluck = 0;
	this.active = false;
}

KarplusStrong.prototype = {

	constructor: KarplusStrong,

	pluck: function() {
		// add burst in wavetable
		this.latestPluck = Date.now();
		var i = 0,
			len = Math.min(this._burst.length, this._delay);
		for (; i < len; ++i) this._wavetable[i] += this._burst[i];
	},

	processAudio: function(buffer) {
		var i = 0,
			bufLen = buffer.length,
			wave = this._wavetable,
			waveLen = this._delay,
			prevIndex = this._index,
			a = this.alpha,
			mul = this.mul,
			dry = this._feedback * this._dry,
			lp = this._feedback * (1 - this._dry),
			index = 0,
			acc = 0,
			val = 0; // wave sample index

		for (; i < bufLen; ++i) {
			index = (prevIndex + 1) % waveLen;
			val = wave[index] = dry * wave[index] + lp * (a * wave[index] + (1 - a) * wave[prevIndex]);
			buffer[i] += mul * val;
			acc += Math.abs(val);
			prevIndex = index;
		}
		this.level = mul * acc / bufLen;
		this._index = index;
		return buffer;
	}
}

KSMixin.call(KarplusStrong.prototype);

// accessors

Object.defineProperty(KarplusStrong.prototype, 'delay', {
	get: function() {
		return this._delay;
	},
	set: function(len) {
		this._delay = Math.min(Math.floor(len), this._wavetable.length);
		this._index = 0;
	}
});

Object.defineProperty(KarplusStrong.prototype, 'burstLen', {
	get: function() {
		return this._burst.length;
	},
	// TODO find a way to easily regenerates the burst when one of the parameters change
	set: function(len) {
		this._burst = this.mix(
			lib.DSPUtil.lowpass(this.saw(len), 0.5),
			lib.DSPUtil.lowpass(this.noise(len), 0.5),
			0.6, 0.2);
	}
});

Object.defineProperty(KarplusStrong.prototype, 'feedback', {
	get: function() {
		return this._feedback;
	},
	set: function(value) {
		return this._feedback = Math.max(0, Math.min(1, value));
	}
});

Object.defineProperty(KarplusStrong.prototype, 'dry', {
	get: function() {
		return this._dry;
	},
	set: function(value) {
		return this._dry = Math.max(0, Math.min(1, value));
	}
});