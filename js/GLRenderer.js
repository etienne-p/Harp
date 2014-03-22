var GLRenderer = function() {
	this.width = 400;
	this.height = 300;
	this.renderer = null;
	this.camera = null;
	this.scene = null;
	this.material = null;
	this.geometries = {};
	this._resized = false;
}

GLRenderer.prototype = {

	constructor: GLRenderer,

	init: function() {

		this.material = new THREE.LineBasicMaterial({
			color: '#2FA1D6'
		})

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.camera = new THREE.OrthographicCamera(
			this.width / -2,
			this.width / 2,
			this.height / 2,
			this.height / -2, 0, 500);

		this.scene = new THREE.Scene();

		this.camera.z = 0;
		this.camera.lookAt(new THREE.Vector3(0, 0, 1));

		this.scene.add(this.camera);
		document.getElementById('container').appendChild(this.renderer.domElement);
		return this;
	},

	addLine: function(id, particleCount) {

		if (this.geometries.hasOwnProperty(id)) throw 'geometry [' + id + '] already exists'

		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute('position', Float32Array, particleCount, 3);
		geometry.dynamic = true;

		this.geometries[id] = geometry;
		this.scene.add(new THREE.Line(geometry, this.material));
		return this;
	},

	resize: function(w, h) {
		this.renderer.setSize(this.width = w, this.height = h);
		this.camera.left = this.width / -2;
		this.camera.right = this.width / 2;
		this.camera.top = this.height / 2;
		this.camera.bottom = this.height / -2;
		this.camera.updateProjectionMatrix();
		this._resized = true; // so we force update on next render
		return this;
	},

	render: function(strings) {
		var i = 0;
		len = strings.length, geometry = null, string = null;
		for (; i < len; ++i) {
			string = strings[i];
			if (string.active || this._resized) {
				geometry = this.geometries[string.id];
				this._updateVertices(geometry.attributes.position.array, string.particles);
				geometry.attributes.position.needsUpdate = true;
			}
		}
		this._resized = false;
		this.renderer.render(this.scene, this.camera);
		return this;
	},

	_updateVertices: function(positions, particles) {

		var i = 0,
			index = -1,
			p = null,
			verticeCount = Math.floor(positions.length / 3);

		for (i = 0; i < verticeCount; ++i) {
			p = particles[i];
			positions[++index] = (0.5 - p.x) * this.width;
			positions[++index] = (0.5 - p.y) * this.height;
			positions[++index] = 0; // TODO, if it remains constant, don't set it
		}

		return positions;
	}
}