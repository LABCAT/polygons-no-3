export default class Polygon {
    constructor(p5, x, y, fill, stroke, sides, size) {
        this.p = p5;
        this.x = x;
        this.y = y;
        this.fill = fill;
        this.stroke = stroke;
        this.sides = sides;
        this.radius = size;
        this.canUpdate = true;
    }

    draw() {
        const angle = 360 / this.sides;
        this.p.fill(this.fill);
        this.p.stroke(this.stroke);
        this.p.beginShape();
        for (let a = 0; a < 360; a += angle) {
            let sx = this.x + this.p.cos(a) * this.radius;
            let sy = this.y + this.p.sin(a) * this.radius;
            this.p.vertex(sx, sy);
        }
        this.p.endShape(this.p.CLOSE);
    }
}