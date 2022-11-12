export default class RecatangularShape {
    constructor(p5, sizeW, sizeH) {
        this.p = p5;
        this.original = []
        this.circles = []

        this.heightsizeW = sizeW
        this.sizeH = sizeH
        
        
    }

    makeOriginal() {
        for (let a = this.p.PI / 4; a < this.p.TAU + this.p.PI / 4; a += this.p.TAU / 4) {
        // https://math.stackexchange.com/a/279209/673569
        let ax = .5 * this.p.sizeW * Math.sign(this.p.cos(a))
        let ay = .5 * this.p.sizeH * Math.sign(this.p.sin(a))

        let axn = .5 * this.p.sizeW * Math.sign(this.p.cos(a + this.p.PI / 2))
        let ayn = .5 * this.p.sizeH * Math.sign(this.p.sin(a + this.p.PI / 2))


        for (let inter = 0; inter < 1; inter += .02) {
            let xi = ax * inter + axn * (1 - inter)
            let yi = ay * inter + ayn * (1 - inter)

            this.original.push({x: xi, y: yi, r: this.p.sizeW/24})
        }
        }

        this.circles = this.original.map(
            c => ({
                ...c
            })
        )
    }

    scaleRotateTranslate(scale, rotateRadians, translateX, translateY) {

        this.circles = []
        this.original.forEach(
            c => {
                const x = c.x * scale
                const y = c.y * scale
                const r = c.r * scale
                // rotate and translate each x and y
                const x2 = x * Math.cos(rotateRadians) - y * Math.sin(rotateRadians) + translateX
                const y2 = x * Math.sin(rotateRadians) + y * Math.cos(rotateRadians) + translateY

                this.circles.push({
                    x: x2,
                    y: y2,
                    r
                })
            }
        );
    }

    update() {
        
    }

    draw() {
       
    }
}