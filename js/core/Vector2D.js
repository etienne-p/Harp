var Vector2D = function(x_, y_) {
    this.x = typeof x_ === 'number' ? x_ : 0;
    this.y = typeof y_ === 'number' ? y_ : 0;
}

Vector2D.prototype = {

    contructor: Vector2D,

    add: function(vec) {
        this.x += vec.x;
        this.y += vec.y;
        return this;
    },

    sub: function(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
        return this;
    },

    mul: function(vec) {
        this.x *= vec.x;
        this.y *= vec.y;
        return this;
    },

    div: function(vec) {
        this.x /= vec.x;
        this.y /= vec.y;
        return this;
    },

    length: function() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    },

    normalize: function() {
        var iLen = 1 / this.length();
        this.x *= iLen;
        this.y *= iLen;
        return this;
    },

    dot: function(arg) {
        return (this.x * arg.x) + (this.y * arg.y);
    },

    angle: function() {
        return Math.atan2(this.y, this.x);
    },

    rotate: function(angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            ox = this.x,
            oy = this.y;
        this.x = ox * cos - oy * sin;
        this.y = ox * sin + oy * cos;
        return this;
    },

    project: function(on){
        var mul = (on.x * this.x + on.y * this.y) / (on.x * on.x + on.y * on.y);
        this.x = mul * on.x;
        this.y = mul * on.y;
        return this;
    },

    clone: function() {
        return new Vector2D(this.x, this.y);
    }
}