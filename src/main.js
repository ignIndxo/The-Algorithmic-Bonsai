import { LSystem, PRESETS } from './lsystem.js';

// Console-verify presets at depth 3
for (const [key, preset] of Object.entries(PRESETS)) {
  const ls = new LSystem(preset);
  const out = ls.generate(3);
  console.log(`[${key}] depth=3 len=${out.length} preview="${out.slice(0, 60)}..."`);
}

new p5((p) => {
  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noSmooth();
    p.pixelDensity(1);
    p.background('#0e1015');
  };

  p.draw = function () {
    // drawing logic added in later phases
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.background('#0e1015');
  };
});
