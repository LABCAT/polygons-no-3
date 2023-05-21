import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';
import { TetradicColourCalculator } from './functions/ColourCalculators.js';
import Polygon from "./classes/Polygon";

import audio from "../audio/polygons-no-3.ogg";
import midi from "../audio/polygons-no-3.mid";


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
                    const noteSet1 = result.tracks[8].notes; // Combinator No. 2 - Yamahaha Bassonics
                    console.log(result);
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

        p.colourSets = [];

        p.currentColourSet = [];

        p.possibleSides = [3, 5, 6, 8];

        p.numberOfSides = 6;

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.colorMode(p.HSB);
            p.angleMode(p.DEGREES);
            p.noLoop()
            p.background(255);
            p.stroke(0);
            p.strokeWeight(4);

            let baseHue = p.random(0, 20);
            p.possibleSides.forEach(element => {
                p.colourSets[element] = TetradicColourCalculator(
                    p,
                    baseHue,
                    p.random(75, 100),
                    p.random(75, 100),
                );
                baseHue = baseHue + 20;
            });
            
        }


        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){

            }
        }

        p.polygons = [];

        p.executeCueSet1 = (note) => {
            const { duration } = note;
            const numOfShapes = duration > 0.1 ? Math.floor(p.random(12, 24)) : Math.floor(p.random(4, 8));
            const stroke = duration > 0.1 ? p.color(0) : p.color(255);
            const possibleSides = [...p.possibleSides];
            possibleSides.splice(possibleSides.indexOf(p.numberOfSides), 1);

            p.polygons = [];
            p.numberOfSides = p.random(possibleSides);
            p.currentColourSet = p.colourSets[p.numberOfSides];

            for (let i = 0; i < numOfShapes; i++) {
                const x = p.random(0, p.width - (p.width / p.numberOfSides));
                const y = p.random(0, p.height - (p.height / p.numberOfSides));
                const size = p.random(p.height / 8, p.height / 16);
                const set = [];
                set.push(
                    new Polygon(
                        p, 
                        x,
                        y,
                        p.random(p.currentColourSet),
                        stroke,
                        p.numberOfSides,
                        size 
                    )
                );
                set.push(
                    new Polygon(
                        p, 
                        x,
                        y,
                        p.random(p.currentColourSet),
                        stroke,
                        p.numberOfSides,
                        size / 2
                    )
                );
                p.polygons.push(set);
            }

            const delayAmount = parseInt(duration * 1000) / p.polygons.length * 0.75;
            for (let i = 0; i < p.polygons.length; i++) {
                setTimeout(
                    function () {
                        p.polygons[i][0].draw();
                        p.polygons[i][1].draw();
                    },
                    (delayAmount * i)
                );
            }
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
