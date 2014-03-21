OSCStringMixin = (function() {

	function initPoints(stX, stY, eX, eY, nPts) {

		function p(x, y) {
			return {
				x: x,
				y: y,
				vx: 0,
				vy: 0
			}
		}

		var dx = (eX - stX) / nPts,
			dy = (eY - stY) / nPts,
			i = 0,
			rv = [];

		for (; i < nPts; ++i) rv[i] = p(stX + i * dx, stY + i * dy);
		return rv;
	}

	function updateParticles(particles, acceleration, friction) {
		var i = 0,
			len = particles.length,
			prevNode = null,
			nextNode = null,
			node = null,
			sumVel = 0;

		node = particles[0];
		nextNode = particles[1];

		for (i = 1; i < len - 1; i++) {

			prevNode = node;
			node = nextNode;
			nextNode = particles[i + 1];

			// attracted by previous
			node.vx += acceleration * (prevNode.x - p.x);
			node.vy += acceleration * (prevNode.y - p.y);

			// attracted by next
			node.vx += acceleration * (nextNode.x - p.x);
			node.vy += acceleration * (nextNode.y - p.y);

			node.vx *= friction;
			node.vy *= friction;
			node.x += node.vx;
			node.y += node.vy;

			sumVel += Math.abs(node.vx) + Math.abs(node.vy);
		}

		return sumVel;
	}

	return function() {
		this.initPoints = initPoints;
		return this;
	}
})()

var OSCString = function() {
	this.acceleration = 0.5;
	this.friction = 0.5;
	this.requestUpdate = new lib.Signal(); // used to notify that the string should be updated & rendered
}

OSCString.prototype = {

	constructor: OSCString,

	init: function(from, to, numPts){
		this.particles = this.initPoints(from.x, from.y, to.x, to.y, numPts)
	}

	update: function(){
		var sumVel = this.updateParticles(this.particles, this.acceleration, this.friction);
		if (sumVel < 0.1) this.requestUpdate(this, false)
	}

	pluck: function(){
		this.requestUpdate(this, true)
	}
}

OSCStringMixin.call(OSCString.prototype);