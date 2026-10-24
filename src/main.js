import { LSystem, PRESETS } from './lsystem.js';
import { drawLSystem, drawGround } from './renderer.js';
import { PALETTES }         from './palette.js';
import { buildUI }          from './ui.js';

const SYMBOLS_PER_FRAME = 60;
const MAX_PARTICLES      = 40;

let sentence       = '';
let currentPalette = PALETTES.spring;
let currentPreset  = PRESETS.tree;
let angle          = 25;
let depth          = 5;
let randomness     = 0;
let seed           = 42;
let cursor         = 0;       // incremental growth cursor
let growing        = false;
let particles      = [];
let reducedMotion  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let p5instance;

// ── Seed display element ───────────────────────────────────────────────────
function updateSeedDisplay() {
  let el = document.getElementById('seed-display');
  if (!el) {
    el = document.createElement('div');
    el.id = 'seed-display';
    document.body.appendChild(el);
  }
  el.textContent = `seed: ${seed.toString(16).padStart(6, '0')}`;
}

// ── Particle system ────────────────────────────────────────────────────────
function spawnParticle(p) {
  return {
    x:     p.width  / 2 + (Math.random() - 0.5) * 220,
    y:     p.height * 0.3 + Math.random() * p.height * 0.4,
    vy:    -(0.3 + Math.random() * 0.5),
    vx:    (Math.random() - 0.5) * 0.4,
    life:  1,
    decay: 0.004 + Math.random() * 0.006,
    size:  Math.random() < 0.5 ? 1 : 2,
  };
}

function updateParticles(p) {
  if (particles.length < MAX_PARTICLES && Math.random() < 0.12) {
    particles.push(spawnParticle(p));
  }
  p.noStroke();
  particles = particles.filter(pt => pt.life > 0);
  for (const pt of particles) {
    pt.x   += pt.vx;
    pt.y   += pt.vy;
    pt.life -= pt.decay;
    p.fill(255, 255, 220, pt.life * 200);
    p.rect(Math.round(pt.x), Math.round(pt.y), pt.size, pt.size);
  }
}

// ── L-System rebuild ───────────────────────────────────────────────────────
function rebuild() {
  const rules = applyRandomness(currentPreset.rules, randomness);
  const ls = new LSystem({ ...currentPreset, rules, angle, seed });
  sentence = ls.generate(depth);
  cursor   = 0;
  growing  = !reducedMotion;
  updateSeedDisplay();
  if (p5instance) p5instance.loop();
}

function applyRandomness(rules, r) {
  if (r === 0) return rules;
  const out = {};
  for (const [k, v] of Object.entries(rules)) {
    if (typeof v === 'string') {
      out[k] = [
        { symbol: v,       weight: 1 - r },
        { symbol: v + '+', weight: r * 0.5 },
        { symbol: v + '-', weight: r * 0.5 },
      ];
    } else {
      out[k] = v;
    }
  }
  return out;
}

function drawSignature(p, palette) {
  p.noStroke();
  p.fill(palette.blossom);
  p.textFont('Courier New');
  p.textSize(11);
  p.textAlign(p.CENTER, p.BOTTOM);
  p.drawingContext.globalAlpha = 0.45;
  p.text('kai patel', p.width / 2, p.height - 48);
  p.drawingContext.globalAlpha = 1;
}

// ── p5 sketch ─────────────────────────────────────────────────────────────
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

    // Advance growth cursor
    if (growing) {
      cursor += SYMBOLS_PER_FRAME;
      if (cursor >= sentence.length) {
        cursor  = sentence.length;
        growing = false;
      }
    } else {
      cursor = sentence.length;
    }

    drawGround(p, currentPalette);
    drawLSystem(p, sentence, angle, currentPalette, cursor);
    updateParticles(p);

    if (!growing) drawSignature(p, currentPalette);

    if (!growing && particles.length === 0) p.noLoop();
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.loop();
  };
});
