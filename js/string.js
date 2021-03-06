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

		var dx = (eX - stX) / (nPts - 1),
			dy = (eY - stY) / (nPts - 1),
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

		for (i = 1; i < len - 1; ++i) {

			prevNode = node;
			node = nextNode;
			nextNode = particles[i + 1];

			// attracted by previous
			node.vx += acceleration * (prevNode.x - node.x);
			node.vy += acceleration * (prevNode.y - node.y);

			// attracted by next
			node.vx += acceleration * (nextNode.x - node.x);
			node.vy += acceleration * (nextNode.y - node.y);

			node.vx *= friction;
			node.vy *= friction;
			node.x += node.vx;
			node.y += node.vy;

			//sumVel += Math.abs(node.vx) + Math.abs(node.vy);
		}

		node = particles[len - 1]
		prevNode = particles[len - 2]

		for (i = len - 2; i > 0; --i) {

			nextNode = node;
			node = prevNode;
			prevNode = particles[i - 1];

			// attracted by previous
			node.vx += acceleration * (prevNode.x - node.x);
			node.vy += acceleration * (prevNode.y - node.y);

			// attracted by next
			node.vx += acceleration * (nextNode.x - node.x);
			node.vy += acceleration * (nextNode.y - node.y);

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

var OSCString = function(id) {
	this.id = id;
	this.acceleration = 0.999;
	this.friction = 0.499;
	this.active = true;
}

OSCString.prototype = {

	constructor: OSCString,

	init: function(fromX, fromY, toX, toY, numPts) {
		this.particles = this.initPoints(fromX, fromY, toX, toY, numPts)
	},

	update: function() {
		var sumVel = this.updateParticles(this.particles, this.acceleration, this.originAcceleration, this.friction);
		this.active = (sumVel > 0.0001);
		return this.particles;
	},

	pluck: function() {
		this.requestUpdate(this, true)
	}
}

OSCStringUtil.call(OSCString.prototype);