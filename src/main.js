import { LSystem, PRESETS } from './lsystem.js';
import { drawLSystem }      from './renderer.js';
import { PALETTES }         from './palette.js';
import { buildUI }          from './ui.js';

let sentence       = '';
let currentPalette = PALETTES.spring;
let currentPreset  = PRESETS.tree;
let angle          = 25;
let depth          = 5;
let randomness     = 0;
let seed           = 42;
let p5instance;

function rebuild() {
  const rules = applyRandomness(currentPreset.rules, randomness);
  const ls = new LSystem({ ...currentPreset, rules, angle, seed });
  sentence = ls.generate(depth);
  if (p5instance) p5instance.loop();
}

// Blend stochastic weight — at randomness=0 rules are deterministic strings,
// at randomness=1 the stochastic weights spread evenly.
function applyRandomness(rules, r) {
  if (r === 0) return rules;
  const out = {};
  for (const [k, v] of Object.entries(rules)) {
    if (typeof v === 'string') {
      out[k] = [
        { symbol: v,         weight: 1 - r },
        { symbol: v + '+',   weight: r * 0.5 },
        { symbol: v + '-',   weight: r * 0.5 },
      ];
    } else {
      out[k] = v;
    }
  }
  return out;
}

new p5((p) => {
  p5instance = p;

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noSmooth();
    p.pixelDensity(1);

    buildUI({
      onAngle:      (v) => { angle = v;      rebuild(); },
      onDepth:      (v) => { depth = v;      rebuild(); },
      onRandomness: (v) => { randomness = v; rebuild(); },
      onPalette:    (k) => { currentPalette = PALETTES[k]; p.loop(); },
      onPreset:     (k) => { currentPreset = PRESETS[k]; angle = currentPreset.angle; rebuild(); },
      onRegrow:     ()  => { seed = Math.floor(Math.random() * 0xFFFFFF); rebuild(); },
      onSave:       ()  => p.saveCanvas('bonsai', 'png'),
    });

    rebuild();
  };

  p.draw = function () {
    p.background(currentPalette.bg);
    drawLSystem(p, sentence, angle, currentPalette);
    p.noLoop();
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.loop();
  };
});
