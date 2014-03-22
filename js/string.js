OSCStringUtil = (function() {

	function initPoints(stX, stY, eX, eY, nPts) {

		function p(x, y) {
			return {
				x: x,
				y: y,
				ox: x, 
				oy: y,
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

	function updateParticles(particles, acceleration, originAcceleration, friction) {
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
			node.vx += acceleration * (prevNode.x - node.x);
			node.vy += acceleration * (prevNode.y - node.y);

			// attracted by next
			node.vx += acceleration * (nextNode.x - node.x);
			node.vy += acceleration * (nextNode.y - node.y);

			// attracted by origin
			node.vx += originAcceleration * (node.ox - node.x);
			node.vy += originAcceleration * (node.oy - node.y);

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
		this.updateParticles = updateParticles;
		return this;
	}
})()

var OSCString = function(requestUpdate) {
	this.acceleration = 0.99;
	this.originAcceleration = 0.8;
	this.friction = 0.45;
	this.requestUpdate = requestUpdate; // used to notify that the string should be updated & rendered
}

OSCString.prototype = {

	constructor: OSCString,

	init: function(fromX, fromY, toX, toY, numPts){
		this.particles = this.initPoints(fromX, fromY, toX, toY, numPts)
	},

	update: function(){
		var sumVel = this.updateParticles(this.particles, this.acceleration, this.originAcceleration, this.friction);
		if (sumVel < 0.001) this.requestUpdate.dispatch(this, false);
		return this.particles;
	},

	pluck: function(){
		this.requestUpdate(this, true)
	}
}

OSCStringUtil.call(OSCString.prototype);