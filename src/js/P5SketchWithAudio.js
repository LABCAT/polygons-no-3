import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';
import CirclePacker from './classes/CirclePacker.js';
import RecatangularShape from './classes/RecatangularShape.js';

import audio from "../audio/circles-no-3.ogg";
import midi from "../audio/circles-no-3.mid";

//https://gorillasun.de/blog/a-simple-solution-for-shape-packing-in-2d

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    const noteSet1 = result.tracks[5].notes; // Synth 1
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.circles = []
        p.images = []

        p.ctx = null;

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.noLoop()
            p.background(0);
            p.pixelDensity(4);
            
            // p.ctx = p.canvas.getContext('2d');

            p.circlePacker = new CirclePacker(p, p.canvasWidth-50, p.canvasHeight-50, 200, 3)
            // p.circlePacker = new CirclePacker(p, 500, 500, 200, 3)

            
            p.packShapes();
            console.log(p.circlePacker);
            console.log(p.images);

            p.translate(25,25);

            // for (let n = 0; n < p.images.length; n++) {
            //     let i = p.images[n];

            //     if(i.type == 'R'){
            //         //drawRect(i.x, i.y, i.rotation, i.scale, i.sizeW, i.sizeH)
            //     }else if(i.type == 'T'){
            //         //drawTriangle(i.x, i.y, i.rotation, i.scale, i.sizeW, i.triangleSizes)
            //     }else{
            //         //drawCircle(i.x,i.y,i.sizeW,i.scale)
            //     }

            //     console.log(i);
            // }

            
        }

        p.packShapes = () => {
            const MIN_SCALE = 5,
                MAX_SCALE = 300,
                SCALE_INCREMENT = 10,
                NUM_ITEM_PLACE_TRIES = 2;

            for (let i = 0; i < NUM_ITEM_PLACE_TRIES; i++) {
                let currentScale = MIN_SCALE;
                let x = p.random(p.width);
                let y = p.random(p.height);
                let rotateRadians = p.random(p.TAU);
                let lastAdded = null;
                let lastAddedImage = null;

                let randW = p.random(1,15);
                let randH = p.random(1,15);

                let type = p.random(['R', 'T', 'C']);

                // get a shape to draw
                let currentShape = null;
                
                // if(type == 'R'){
                    
                // }
                // else if(type == 'T'){
                //     currentShape = p.makeTriangularShape(randW)
                // }
                // else{
                //     currentShape = p.makeEmptyCircle(randW)
                // }
                currentShape = new RecatangularShape(p, randW, randH);
                currentShape.makeOriginal()

                while (currentScale < MAX_SCALE) {
                    currentShape.scaleRotateTranslate(currentScale, rotateRadians, x, y);
                    console.log(currentShape.circles);
                    const added = p.circlePacker.tryToAddShape(currentShape.circles, false)

                    // // shape can't be placed break
                    // if (!added && !lastAdded) break

                    // // shape can't grow anymore, add the previous version
                    // if (!added && lastAdded) {
                    //     lastAdded.forEach(c => {
                    //     p.circles.push({
                    //         x: c.x,
                    //         y: c.y,
                    //         r: c.r
                    //     })
                    //     })

                    //     lastAdded.forEach(c => p.circlePacker.addCircle(c))
                    //     p.images.push(lastAddedImage)
                    //     break

                    // // shape grew, update
                    // } else if (added) {
                    //     lastAdded = [...added]

                    //     lastAddedImage = {
                    //     type: type,
                    //                 x: x,
                    //                 y: y,
                    //                 scale: currentScale,
                    //                 rotation: rotateRadians,
                    //     sizeW: randW,
                    //     sizeH: randH,
                    //     triangleSizes: (!currentShape.sizeParam)?0:currentShape.sizeParam
                    //             }
                    // }
                    currentScale += SCALE_INCREMENT
                }
            }
        }

        p.makeTriangularShape = (size) => {
            p.original = []
            p.circles = []

            p.size = size

            p.sizeParam = [p.random(.25,1.5),p.random(.25,1.5),p.random(.25,1.5)]
            //p.sizeParam = [1,1,.5]

            p.makeOriginal = function() {
                let count = 0
                for (let a = 0; a < p.TAU; a += p.TAU / 3) {
                // https://math.stackexchange.com/a/279209/673569
                let ax = p.size * p.cos(a) * p.sizeParam[count]
                let ay = p.size * p.sin(a) * p.sizeParam[count]

                let axn = p.size * p.cos(a + p.TAU/3) * p.sizeParam[(count+1)%3]
                let ayn = p.size * p.sin(a + p.TAU/3) * p.sizeParam[(count+1)%3]

                for (let inter = 0; inter < 1; inter += .05) {
                    let xi = ax * inter + axn * (1 - inter)
                    let yi = ay * inter + ayn * (1 - inter)

                    p.original.push({x: xi, y: yi, r: p.size/12})
                }

                count++
                }

                p.circles = p.original.map(c => ({
                ...c
                }))
            }

            p.scaleRotateTranslate =
            function(scale, rotateRadians, translateX, translateY) {

                p.circles = []
                p.original.forEach(c => {
                const x = c.x * scale
                const y = c.y * scale
                const r = c.r * scale
                // rotate and translate each x and y
                const x2 = x * Math.cos(rotateRadians) - y * Math.sin(rotateRadians) + translateX
                const y2 = x * Math.sin(rotateRadians) + y * Math.cos(rotateRadians) + translateY

                p.circles.push({
                    x: x2,
                    y: y2,
                    r
                })
                })
            }
            }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){

            }
        }

        p.executeCueSet1 = (note) => {
            p.background(p.p.random(255), p.p.random(255), p.p.random(255));
            p.fill(p.p.random(255), p.p.random(255), p.p.random(255));
            p.noStroke();
            p.ellipse(p.width / 2, p.height / 2, p.width / 4, p.width / 4);
        }

        p.hasStarted = false;

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                        if (typeof window.dataLayer !== typeof undefined){
                            window.dataLayer.push(
                                { 
                                    'event': 'play-animation',
                                    'animation': {
                                        'title': document.title,
                                        'location': window.location.href,
                                        'action': 'replaying'
                                    }
                                }
                            );
                        }
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                    if (typeof window.dataLayer !== typeof undefined && !p.hasStarted){
                        window.dataLayer.push(
                            { 
                                'event': 'play-animation',
                                'animation': {
                                    'title': document.title,
                                    'location': window.location.href,
                                    'action': 'start playing'
                                }
                            }
                        );
                        p.hasStarted = false
                    }
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
