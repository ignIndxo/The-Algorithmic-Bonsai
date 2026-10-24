# The Maths Behind the Bonsai

A walkthrough of every formula in the codebase and why it works.

---

## 1. Segment length scaling

```js
const len = (p.height * 0.55) / Math.max(sentence.length, 1) ** 0.45;
```

This is the most important formula — it decides how long each drawn line segment is.

### The problem it solves

At depth 1 a tree sentence might be 30 characters. At depth 5 the same grammar produces 5,000+ characters because rules expand exponentially. If every character drew the same fixed length, a shallow tree would be tiny and a deep tree would fly off the screen.

### Breaking it down

**`p.height * 0.55`** — the *budget*. This is the target size of the whole tree expressed in pixels. `0.55` means "aim to use about 55% of the screen height". This replaces the old hardcoded `220`, which was calibrated for one specific screen.

**`sentence.length ** 0.45`** — a *dampening factor*. Raising the sentence length to a power less than 1 compresses the range. Some examples:

| Depth | ~Sentence length | `length ** 0.45` | `len` on a 900px screen |
|-------|-----------------|-----------------|------------------------|
| 2     | 50              | 5.0             | ~99 px per segment     |
| 3     | 300             | 9.8             | ~50 px per segment     |
| 4     | 1,500           | 18.8            | ~26 px per segment     |
| 5     | 5,000           | 30.0            | ~16 px per segment     |

Without the `** 0.45` (i.e. dividing by `length` directly), a depth-5 tree would have 5,000× shorter segments than a depth-1 tree — invisible. With it, the range compresses to about a 6× difference, which keeps every depth readable.

**Why 0.45 specifically?** It's between a square root (`** 0.5`) and a cube root (`** 0.33`). The value was tuned so the tree looks balanced across depths 1–7. A higher exponent (closer to 1) makes deep trees tinier; a lower exponent makes shallow trees overflow the canvas.

**`Math.max(sentence.length, 1)`** — guards against dividing by zero if the sentence is somehow empty.

---

## 2. Angle conversion

```js
p.rotate(angle * Math.PI / 180);
```

p5.js `rotate()` takes **radians**, not degrees. The UI slider gives degrees (more intuitive). The conversion is:

```
radians = degrees × (π / 180)
```

This comes from the fact that a full circle is 360° and also 2π radians, so one degree = π/180 radians ≈ 0.01745 radians.

---

## 3. Branch taper

```js
const weight = Math.max(1, 4 - (depth / maxDepth) * 3);
```

This makes branches thinner as they get further from the trunk — mimicking real trees.

- At the trunk (`depth = 0`): `4 - 0 = 4` pixels wide
- At the tips (`depth = maxDepth`): `4 - 3 = 1` pixel wide
- In between it interpolates linearly

`depth / maxDepth` normalises the current depth to a 0–1 range, so the taper always spans the full width regardless of how deep the grammar goes. `Math.max(1, ...)` clamps it so branches never disappear below 1 pixel.

---

## 4. The mulberry32 PRNG

```js
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = seed + 0x6d2b79f5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
```

A **pseudo-random number generator** (PRNG) produces a sequence of numbers that looks random but is entirely determined by the starting value (the seed). Given the same seed, you always get the same sequence — that's what makes bonsai seeds shareable and reproducible.

`mulberry32` is a specific algorithm that operates on 32-bit integers:

- **`seed |= 0`** — coerces the seed to a 32-bit integer (JavaScript floats can drift)
- **`seed + 0x6d2b79f5`** — adds a large odd constant (a "magic number" chosen to scatter bits evenly)
- **`^ seed >>> 15`** — XOR with a right-shifted version of itself ("xorshift"), which mixes the bits
- **`Math.imul`** — 32-bit integer multiplication (regular `*` in JS uses 64-bit floats and loses precision)
- **`/ 4294967296`** — divides by 2³², converting the final integer to a float in [0, 1)

Each call advances the internal state, so calling it repeatedly gives a stream of unrelated-looking values. The key property is that it's **fast** and **seedable** — unlike `Math.random()`, which can't be seeded.

---

## 5. L-System string rewriting

```js
generate(n) {
  const rng = mulberry32(this.seed);
  let s = this.axiom;
  for (let i = 0; i < n; i++) {
    s = [...s].map(c => this._apply(c, rng)).join('');
  }
  return s;
}
```

This is the engine. Each iteration replaces every character in the string simultaneously using the production rules.

**Why `[...s]`?** The spread operator splits the string into an array of individual characters (including any multi-byte Unicode characters), so `.map()` can iterate symbol by symbol.

**Why simultaneously?** The original string is fully consumed before the replacements are applied. If you replaced in-place left-to-right, newly introduced `F` symbols would get expanded again in the same pass, producing wrong results. The `.map().join('')` pattern creates a new string, leaving the source untouched.

**Growth rate:** If a rule replaces `F` with a string of length *k*, after *n* iterations the sentence length is roughly *k*ⁿ. That's exponential growth — which is why depth 7 can produce millions of characters and why the segment-length formula above has to compress the range.

---

## 6. Stochastic rule selection

```js
_apply(c, rng) {
  const rule = this.rules[c];
  if (typeof rule === 'string') return rule;

  const total = rule.reduce((sum, r) => sum + r.weight, 0);
  let pick = rng() * total;
  for (const r of rule) {
    pick -= r.weight;
    if (pick <= 0) return r.symbol;
  }
  return rule[rule.length - 1].symbol;
}
```

When a rule is an array of `{ symbol, weight }` options, this selects one by **weighted random sampling**:

1. Sum all the weights to find the total probability mass
2. Pick a random number in `[0, total)`
3. Walk through the options subtracting each weight — whichever option causes `pick` to cross zero is selected

For example, weights `[0.5, 0.3, 0.2]` give a 50/30/20% chance respectively. The rng call is seeded, so at the same randomness level with the same seed the same choices are always made — the tree is still reproducible even in stochastic mode.
