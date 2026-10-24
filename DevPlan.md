6-Hour Build Plan · Generative Art

# The *Algorithmic* Bonsai

L-System fractals rendered as cozy pixel-art flora — a generative web app with interactive growth controls. Development roadmap with Git workflow.

p5.js L-Systems Pixel Art HTML5 Canvas Vanilla JS Dark UI

Sections

[Overview](#overview) [Repository](#structure)

[Phase 1 — Setup](#phase1) [Phase 2 — L-System](#phase2) [Phase 3 — Renderer](#phase3) [Phase 4 — UI](#phase4) [Phase 5 — Polish](#phase5) [Phase 6 — Ship](#phase6)

[Branch Map](#branches) [Pull Requests](#prs)

00

## Project Overview

Total Duration

6h

6 phases × \~1h each

Commits

18

conventional commits

Pull Requests

5

feature branches → main

Core Files

8

JS modules + assets

Setup → L-System Engine → Pixel Renderer → UI Controls → Polish → Deploy

### Tech Stack

p5.js v1.9.4

Vanilla JS ES2022

HTML5 Canvas

CSS Custom Props

Vite dev server

GitHub Pages deploy

**Design constraint:** No framework, no build step for the final bundle — ship a single self-contained HTML file + optional sprite sheet. p5.js loaded from CDN. The pixel aesthetic is achieved via `noSmooth()` + custom sprite stamps, not CSS `image-rendering`.

01

## Repository Structure

algorithmic-bonsai/ ├── src/ │ ├── main.js // p5 sketch entry point │ ├── lsystem.js // L-System engine (axiom → string) │ ├── renderer.js // Turtle graphics + pixel stamps │ ├── sprites.js // Pixel sprite definitions (leaf, petal, moss) │ ├── palette.js // Cozy colour palettes array │ ├── ui.js // Slider panel & event bindings │ └── randomness.js // Seeded RNG wrapper (mulberry32) ├── assets/ │ └── sprites.png // Optional: sprite sheet atlas ├── index.html // Shell; loads p5, imports main.js ├── style.css ├── vite.config.js // Dev only, not in final bundle └── README.md

### Branch Strategy

**main** is always deployable. Each phase lives on a short-lived feature branch, merged via PR. Hotfixes go straight to `main` with a `fix:` commit.

02

## Phases & Git Workflow

Phase 1 — Project Scaffold & Canvas Bootstrap \~45 min ›

**Branch:** `feat/scaffold` from `main`

- 📁 Init repo, add `.gitignore` (node_modules, dist, .DS_Store)
- 📄 Write `index.html` — load p5.js 1.9.4 from cdnjs, link CSS, defer `main.js`
- 🎨 Author `style.css`: dark background (#0e1015), CSS custom props for all palette colours
- ⚙️ Stub `main.js` with empty p5 `setup()` + `draw()`; confirm canvas appears
- 📐 Wire canvas to 100% viewport, call `noSmooth()` and `pixelDensity(1)` for crisper pixels

a1b2c3 chore: initialise repo with gitignore and readme chore

d4e5f6 chore: add HTML shell with p5.js CDN and CSS reset chore

g7h8i9 feat: bootstrap p5 sketch — full-viewport canvas, noSmooth pixel mode feat

Pull Request #1

feat/scaffold → main: Project scaffold & canvas setup

Establishes the repo skeleton, HTML shell, and a blank p5 canvas in pixel-perfect mode. No drawing logic yet.

✓ loads in browser ✓ canvas visible no tests yet

Phase 2 — L-System Engine \~75 min ›

**Branch:** `feat/lsystem-engine` from `main`

- 🌿 Implement `LSystem` class in `lsystem.js` — takes `{ axiom, rules, angle, iterations }`
- 🔁 `generate(n)` method: iterate string rewriting *n* times using production rules map
- 🎲 Add stochastic support: rules can be arrays of `{ symbol, weight }` — use seeded RNG
- 🌲 Preload 3 classic plant grammars (simple tree, fern, bush) as named presets
- 🧪 Console-test output strings for known axioms (e.g. Lindenmayer's algae: `F → FF`)

```
// lsystem.js — core string rewriting
export class LSystem {
  constructor({ axiom, rules, angle = 25 }) {
    this.axiom = axiom;
    this.rules = rules;  // { 'F': 'FF+[+F-F-F]-[-F+F+F]' }
    this.angle = angle;
  }
  generate(n) {
    let s = this.axiom;
    for (let i = 0; i < n; i++)
      s = [...s].map(c => this.rules[c] ?? c).join('');
    return s;
  }
}
```

j1k2l3 feat(lsystem): add LSystem class with string rewriting and deterministic rules feat

m4n5o6 feat(lsystem): stochastic rule support with seeded mulberry32 RNG feat

p7q8r9 feat(lsystem): add three plant grammar presets (tree, fern, bush) feat

Pull Request #2

feat/lsystem-engine → main: L-System string rewriting engine

Pure-logic module with no drawing dependency. Includes stochastic production rules and three named plant presets. Verified via console output.

✓ deterministic mode ✓ stochastic mode ✓ 3 presets

Phase 3 — Pixel Renderer (Turtle Graphics) \~90 min ›

**Branch:** `feat/pixel-renderer` from `main`

- 🐢 Implement turtle interpreter in `renderer.js` — parse L-System string symbol by symbol
- 📚 Use p5's matrix stack (`push()`/`pop()`) for `[` and `]` branching
- 🖌️ Draw branches as *chunky pixel lines* — use `strokeWeight` that tapers by stack depth
- 🍃 On leaf symbols (`X`, `L`), stamp a pixel sprite from `sprites.js` instead of a circle
- 🎨 Apply cozy palette from `palette.js`: mossy greens, warm browns, soft blush for blossoms
- 🌱 Wire to main sketch: generate string → render on canvas centre-bottom

```
// renderer.js — turtle walk with pixel stamps
export function drawLSystem(p, sentence, angle, palette) {
  p.translate(p.width / 2, p.height - 40);
  const len = 220 / Math.max(sentence.length, 1) ** 0.45;

  for (const ch of sentence) {
    switch (ch) {
      case 'F': drawPixelLine(p, len, palette.branch); break;
      case '+': p.rotate( angle * Math.PI / 180); break;
      case '-': p.rotate(-angle * Math.PI / 180); break;
      case '[': p.push(); break;
      case ']': p.pop(); break;
      case 'L': stampLeaf(p, palette); break;
    }
  }
}
```

s1t2u3 feat(renderer): turtle interpreter with p5 push/pop branching stack feat

v4w5x6 feat(renderer): pixel sprite stamp for leaves — 6×6 pixel art leaf shapes feat

y7z8a1 feat(renderer): cozy palette module with four seasonal colour themes feat

b2c3d4 fix(renderer): branch taper formula — weight now scales correctly with depth fix

Pull Request #3

feat/pixel-renderer → main: Turtle interpreter & pixel art rendering

The visual heart of the app. Translates L-System strings into p5 draw calls with pixel-art leaf sprites and depth-tapered branch strokes. Four cozy seasonal palettes included.

✓ tree renders ✓ fern renders ✓ no stack overflow at depth 6 perf: 60fps at depth ≤5

Phase 4 — Interactive UI Panel \~60 min ›

**Branch:** `feat/ui-controls` from `main`

- 🎛️ Build dark glass panel (CSS backdrop-filter) fixed to lower-right; collapsible on mobile
- 📏 Slider: **Angle** (5°–60°) — redraws immediately via `redraw()`
- 📏 Slider: **Depth** (iterations 1–7) — triggers `generate(n)` + redraw
- 📏 Slider: **Randomness** (0–1) — blends stochastic rule weight, re-seeds RNG
- 🌸 Palette picker — 4 buttons (Spring / Summer / Autumn / Winter)
- 🌱 Preset selector — dropdown for 3 plant grammars
- 🔄 "Regrow" button — re-seeds RNG with a random seed, triggers fresh generation
- 💾 "Save PNG" button — calls p5's `saveCanvas()`

e5f6g7 feat(ui): dark glass panel layout — sliders, palette picker, preset select feat

h8i9j0 feat(ui): wire sliders to lsystem params with debounced redraw (16ms) feat

k1l2m3 style(ui): responsive collapse for mobile — panel becomes bottom drawer style

Pull Request #4

feat/ui-controls → main: Interactive parameter panel

Adds the dark glass control panel with angle, depth, and randomness sliders, palette swatches, preset switcher, and a "Regrow" seed button. Canvas redraws in real time.

✓ sliders update canvas ✓ palette switching ✓ mobile drawer ✓ save PNG works

Phase 5 — Cozy Polish Pass \~45 min ›

**Branch:** `feat/polish` from `main`

- 🌸 Animated growth — draw incrementally per frame (turtle cursor advances N symbols per draw tick)
- 🌫️ Soft vignette overlay on canvas edges via radial-gradient div
- ✨ Occasional pixel firefly particles — tiny white dots that float upward around the tree
- 🍂 Seasonal ambient detail: fallen leaves on ground line, moss patches on lower trunk
- 🔤 Pixel-art styled seed number readout (shows current RNG seed so users can share a bonsai)
- ♿ `prefers-reduced-motion`: skip the growth animation, render complete instantly

n4o5p6 feat(polish): incremental growth animation — N symbols drawn per frame feat

q7r8s9 feat(polish): ambient particle system — floating firefly pixels feat

t0u1v2 feat(polish): seed display + share text; respects prefers-reduced-motion feat

w3x4y5 style(polish): vignette, ground line, moss sprites on lower branches style

Pull Request #5

feat/polish → main: Cozy ambient details & growth animation

Elevates the feel from demo to experience — incremental growth reveal, ambient particles, seasonal ground details, and a seed code so any bonsai can be regrown and shared.

✓ growth animation ✓ reduced-motion respected ✓ seed share text ✓ perf at 60fps

Phase 6 — Deploy to GitHub Pages \~15 min ›

- 📝 Write `README.md`: what it is, screenshot, controls reference, how L-Systems work (3 paragraphs)
- ⚙️ In repo Settings → Pages: set source to `main` branch, `/ (root)`
- 🔗 Add live demo link to `README` and repo About field
- 🏷️ Tag release `v1.0.0` with `git tag v1.0.0 && git push --tags`

z6a7b8 docs: add README with screenshot, controls reference, and L-System explainer docs

c9d0e1 chore: tag v1.0.0 release chore

**No build step needed.** `index.html` loads p5.js from CDN and ES-module imports the sketch files. GitHub Pages serves it directly — no CI pipeline required for v1.

03

## Branch Map

main ●────────────────────────────────────────────────────● v1.0.0 │ │ │ │ │ │ │ │ │ │ feat/ │ scaffold │ lsystem- │ pixel- │ ui- │ polish │ ●──●──● │ engine │ renderer │ controls │ ●──●──●──● │ ↓PR#1 ●──●──● │ ●──●──●──● │ ●──●──● │ ↓PR#5 │ ↓PR#2 ↓PR#3 ↓PR#4

Each feature branch is cut from an up-to-date `main`. Branches are **short-lived** (one phase = one branch = one PR). No long-running develop branch — keeping the graph simple for a solo 6-hour project.

04

## Pull Request Summary

PR #1 · feat/scaffold → main

Project scaffold & canvas setup

3 commits — repo init, HTML shell, p5 bootstrap with noSmooth pixel mode.

PR #2 · feat/lsystem-engine → main

L-System string rewriting engine

3 commits — LSystem class, stochastic rules, 3 plant presets. Pure logic, no drawing.

PR #3 · feat/pixel-renderer → main

Turtle interpreter & pixel art rendering

4 commits — turtle walk, push/pop stack, leaf sprites, palette module.

PR #4 · feat/ui-controls → main

Interactive parameter panel

3 commits — glass panel, sliders, palette swatches, mobile drawer.

PR #5 · feat/polish → main

Cozy ambient details & growth animation

4 commits — incremental growth, particles, vignette, seed sharing, reduced-motion.

**Commit convention:** All commits follow [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `chore:`, `style:`, `docs:`. This makes the changelog readable and keeps PR diffs focused.