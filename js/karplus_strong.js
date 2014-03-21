var KarplusStrong = function() {
	this.mul = 1;
	this.alpha = 0; // low pass alpha
	this._feedback = 0;
	this._dry = 0.5;
	this._index = -1; // sample index, init in updateWavetable
}

KarplusStrong.prototype = {

	constructor: KarplusStrong,

	emptyBuffer: function(len_) {
		var rv = [],
			len = Math.floor(len_);
		for (var i = 0; i < len; ++i) rv[i] = 0;
		console.log('emptyBuffer');
		return rv;
	},

	noiseBuffer: function(len_) {
		var rv = [],
			len = Math.floor(len_),
			i = 0;
		for (; i < len; ++i) rv[i] = Math.random() * 2 - 1;
		return rv;
	},

	pluck: function() {
		// add burst in wavetable
		var i = 0,
			len = Math.min(this._burst.length, this._wavetable.length);
		for (; i < len; ++i) this._wavetable[i] += this._burst[i];
	},

	processAudio: function(buffer) {
		var i = 0,
			bufLen = buffer.length,
			wave = this._wavetable,
			waveLen = this._wavetable.length,
			prevIndex = this._index,
			a = this.alpha,
			mul = this.mul,
			dry = this._feedback * this._dry,
			lp = this._feedback * (1 - this._dry),
			index = 0,
			val = 0; // wave sample index

		for (; i < bufLen; ++i) {
			index = (prevIndex + 1) % waveLen;
			val = wave[index] = dry * wave[index] + lp * (a * wave[index] + (1 - a) * wave[prevIndex]);
			buffer[i] = mul * val;
			prevIndex = index;
		}

		this._index = index;
		return buffer;
	}
}

// accessors

Object.defineProperty(KarplusStrong.prototype, 'delay', {
	get: function() {
		return this._wavetable.length;
	},
	set: function(len) {
		this._wavetable = this.emptyBuffer(len);
		this._index = 0;
	}
});

Object.defineProperty(KarplusStrong.prototype, 'burstLen', {
	get: function() {
		return this._burst.length;
	},
	set: function(len) {
		this._burst = this.noiseBuffer(len);
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