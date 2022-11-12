export default class CirclePacker {
    constructor(p5, wid, hei, gridDivs, gridPadding) {
        this.p = p5;
        this.wid = wid
        this.hei = hei

        // gridDivs (grid divisions) number of cells we want to split the grid into
        this.gridDivs = gridDivs
        this.pad = gridPadding

        // size of the grid cells
        this.gridSizeX = this.wid / this.gridDivs
        this.gridSizeY = this.hei / this.gridDivs

        this.items = []
        
        this.generateGrid();
        
    }

    generateGrid() {
        const grid = []
        for (let x = 0; x < this.gridDivs; x++) {
            grid[x] = []
            for (let y = 0; y < this.gridDivs; y++) {
                grid[x][y] = {
                    x,
                    y,
                    c: []
                }
            }
        }
        this.grid = grid
    }

    // utility to check distance between two circles
    circleDistance(c1, c2) {
        return (c1.x - c2.x)**2+ (c2.y-c1.y)**2   - (c1.r / 2 + c2.r / 2)**2
    }

    // given an x and y coordinate, returns the grid cell it falls into
    getTile(x, y) {
        return this.grid[this.p.floor(x / this.gridSizeX)][this.p.floor(y / this.gridSizeY)]
    }

    // get all circles which collide with the current position
    getCircles(x, y) {
        const tile = this.getTile(x, y)
        const circles = []
        tile.c.forEach(
            c => {
                if (this.circleDistance(c, {
                    x,
                    y,
                    r: 0
                }) < 0) circles.push(c)
            }
        )
        return circles;
    }

    // gets tiles that are touched by a certain circle
    getGridTilesAround(x, y, r) {
        const tl = [
            this.p.floor((x - r - this.pad) / this.gridSizeX),
            this.p.floor((y - r - this.pad) / this.gridSizeY),
        ]

        const br = [
            this.p.floor((x + r + this.pad) / this.gridSizeX),
            this.p.floor((y + r + this.pad) / this.gridSizeY),
        ]

        //console.log(tl, br)
        const tiles = []
        for (let i = tl[0]; i <= br[0]; i++) {
            for (let j = tl[1]; j <= br[1]; j++) {
                //console.log(i, j)
                if (i < 0 || j < 0 || i >= this.gridDivs || j >= this.gridDivs) continue
                tiles.push(this.grid[i][j])
            }
        }

        //console.log(tiles)
        return tiles
    }

    addCircle(c) {
        // break early if out of grid
        if (
            c.x - c.r < 0 || c.x + c.r > this.wid ||
            c.y - c.r < 0 || c.y + c.r > this.hei
        ) {
            return null
        }

        // get grid items it could intersect
        // basically check which tiles the circle to be added is touching
        const gridTiles = this.getGridTilesAround(c.x, c.y, c.r)

        // Need to add the circle to each one of the grids arrays
        // need to add the tiles to the circle's array
        gridTiles.forEach(
            t => {
                this.grid[t.x][t.y].c.push(c)
                if (!c.t) c.t = []
                c.t.push(`${t.x},${t.y}`)
            }
        )
        this.items.push(c)
        return c;
    }

    tryToAddShape(circles, actuallyAdd = true){
        for (let c of circles) {
            if (!this.tryToAddCircle(c.x, c.y, c.r, c.r, false)) {
                return null
            }
        }
        if (actuallyAdd) {
            circles.forEach(c => this.addCircle(c))
        }
        return circles;
    }

    tryToAddCircle(x, y, minRadius = 3, maxRadius = 200, actuallyAdd = true) {
        let c1 = {
            x,
            y,
            r: minRadius,
            t: []
        }

        while (true) {

            // break early if out of grid
            if (
                c1.x - c1.r < 0 ||
                c1.x + c1.r > this.wid ||
                c1.y - c1.r < 0 ||
                c1.y + c1.r > this.hei
            ) {
                return null
            }

            // get grid items it could intersect
            const gridTiles = this.getGridTilesAround(x, y, c1.r)

            //console.log(gridTiles)

            // check against all circles
            for (let tile of gridTiles) {
                for (let c2 of tile.c) {
                    const d = this.circleDistance(c1, c2)
                    if (d - this.pad < 0) {
                        if (c1.r === minRadius) {
                            console.log('aborted here')
                            return null;
                        } 
                        else {
                            if (actuallyAdd) {
                                // add to tiles, and tiles to circles
                                gridTiles.forEach(
                                    t => {
                                        this.grid[t.x][t.y].c.push(c1)
                                        c1.t.push(`${t.x},${t.y}`)
                                    }
                                )
                                this.items.push(c1)
                            }
                            return c1
                        }
                    }
                }
            }

            c1.r += 1
            if (c1.r > maxRadius) {
                if (actuallyAdd) {
                    // add to tiles, and tiles to circles
                    gridTiles.forEach(
                        t => {
                            this.grid[t.x][t.y].c.push(c1)
                            c1.t.push(`${t.x},${t.y}`)
                        }
                    )
                    this.items.push(c1)
                }
                return c1
            }
        }
    }

    update() {
        
    }

    draw() {
       
    }
}