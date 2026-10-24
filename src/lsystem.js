import { mulberry32 } from './randomness.js';

export class LSystem {
  constructor({ axiom, rules, angle = 25, seed = 42 }) {
    this.axiom = axiom;
    this.rules = rules;
    this.angle = angle;
    this.seed  = seed;
  }

  generate(n) {
    const rng = mulberry32(this.seed);
    let s = this.axiom;
    for (let i = 0; i < n; i++) {
      s = [...s].map(c => this._apply(c, rng)).join('');
    }
    return s;
  }

  // Rules can be a plain string or an array of { symbol, weight } for stochastic branching.
  _apply(c, rng) {
    const rule = this.rules[c];
    if (!rule) return c;
    if (typeof rule === 'string') return rule;

    // stochastic: pick a weighted symbol
    const total = rule.reduce((sum, r) => sum + r.weight, 0);
    let pick = rng() * total;
    for (const r of rule) {
      pick -= r.weight;
      if (pick <= 0) return r.symbol;
    }
    return rule[rule.length - 1].symbol;
  }
}

// ── Named plant presets ────────────────────────────────────────────────────

export const PRESETS = {
  tree: {
    label: 'Tree',
    axiom: 'F',
    angle: 25,
    rules: {
      F: 'FF+[+F-F-F]-[-F+F+F]',
    },
  },

  fern: {
    label: 'Fern',
    axiom: 'X',
    angle: 25,
    rules: {
      X: 'F+[[X]-X]-F[-FX]+X',
      F: 'FF',
    },
  },

  bush: {
    label: 'Bush',
    axiom: 'F',
    angle: 22.5,
    rules: {
      F: [
        { symbol: 'FF+[+F-F-F]-[-F+F+F]', weight: 0.5 },
        { symbol: 'F[+F]F[-F]F',           weight: 0.3 },
        { symbol: 'F[+F][-F]FF',           weight: 0.2 },
      ],
    },
  },
};
