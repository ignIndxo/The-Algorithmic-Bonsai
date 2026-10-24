# The Algorithmic Bonsai

A generative art web app that grows pixel-art bonsai trees using L-System fractals. Every tree is unique — tune the parameters, hit **Regrow**, and share your favourite seed.

**[Live demo →](https://ignIndxo.github.io/The-Algorithmic-Bonsai)**

---

## Controls

| Control | Description |
|---|---|
| **Angle** | Branch angle in degrees (5°–60°). Lower = upright; higher = sprawling. |
| **Depth** | Rewriting iterations (1–7). Each step multiplies branch count. |
| **Randomness** | Blends stochastic rule weights (0 = deterministic, 1 = chaotic). |
| **Palette** | Spring / Summer / Autumn / Winter colour themes. |
| **Preset** | Tree, Fern, or Bush grammar. |
| **Regrow** | Re-seeds the RNG for a brand-new bonsai. |
| **Save PNG** | Downloads the current canvas as a PNG. |
| **Seed** | Hex code shown bottom-left. Share it to recreate an exact bonsai. |

---

## How L-Systems work

An L-System (Lindenmayer System) is a string-rewriting grammar invented by biologist Aristid Lindenmayer in 1968 to model plant growth. It starts with an **axiom** — a short seed string like `F` — and a set of **production rules** that replace each symbol with a longer string on every iteration. After several passes the string encodes the full branching structure of a plant.

The string is then interpreted by a **turtle graphics** renderer: `F` means "draw a line forward", `+` and `-` rotate the turtle left or right, and `[` / `]` save and restore the turtle's position — creating branches. Because the rules apply uniformly at every scale, the resulting shapes have the same self-similar character as real plants: every sub-branch looks like a miniature version of the whole.

This app adds a **stochastic** layer on top: rules can carry probability weights so each symbol resolves to one of several alternatives at random. Seeded with a fixed number (the hex seed displayed bottom-left), the output is fully reproducible — the same seed always grows the same bonsai, on any device, any browser.

---

## Tech stack

- [p5.js](https://p5js.org) v1.9.4 — canvas rendering
- Vanilla JS ES2022 modules — no framework, no build step
- HTML5 Canvas — `noSmooth()` + `pixelDensity(1)` for crisp pixel art
- GitHub Pages — served directly from `main` branch root

## Project structure

```
src/
  main.js        p5 sketch entry, growth animation, particle system
  lsystem.js     L-System engine — string rewriting + stochastic rules
  renderer.js    Turtle graphics interpreter + ground/moss detail
  sprites.js     6×6 pixel art leaf, blossom, moss stamps
  palette.js     Four seasonal colour palettes
  ui.js          Control panel DOM + event bindings
  randomness.js  Seeded mulberry32 PRNG
index.html
style.css
```
