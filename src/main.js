import { LSystem, PRESETS } from './lsystem.js';
import { drawLSystem }      from './renderer.js';
import { PALETTES }         from './palette.js';

let sentence = '';
let currentPalette = PALETTES.spring;
let currentPreset  = PRESETS.tree;
let depth = 5;

function rebuild() {
  const ls = new LSystem({ ...currentPreset, seed: 42 });
  sentence = ls.generate(depth);
}

new p5((p) => {
  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noSmooth();
    p.pixelDensity(1);
    rebuild();
  };

  p.draw = function () {
    p.background(currentPalette.bg);
    drawLSystem(p, sentence, currentPreset.angle, currentPalette);
    p.noLoop();
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.loop();
  };
});
