import { stampLeaf, stampBlossom, stampMoss } from './sprites.js';

function drawPixelLine(p, len, color, weight) {
  p.stroke(color);
  p.strokeWeight(Math.max(1, weight));
  p.line(0, 0, 0, -len);
  p.translate(0, -len);
}

// Draw up to `limit` symbols from sentence. Returns total symbol count so
// the caller can advance the cursor each frame for incremental growth.
export function drawLSystem(p, sentence, angle, palette, limit = Infinity) {
  p.push();
  p.translate(p.width / 2, p.height - 40);

  const len = (p.height * 0.55) / Math.max(sentence.length, 1) ** 0.45;

  let depth = 0;
  let maxDepth = 1;
  for (const ch of sentence) {
    if (ch === '[') { depth++; maxDepth = Math.max(maxDepth, depth); }
    else if (ch === ']') depth--;
  }

  depth = 0;
  let drawn = 0;

  for (const ch of sentence) {
    if (drawn >= limit) break;
    drawn++;

    const weight      = Math.max(1, 4 - (depth / maxDepth) * 3);
    const branchColor = depth < maxDepth * 0.4 ? palette.branch : palette.branchLt;

    switch (ch) {
      case 'F':
        drawPixelLine(p, len, branchColor, weight);
        break;
      case '+':
        p.rotate(angle * Math.PI / 180);
        break;
      case '-':
        p.rotate(-angle * Math.PI / 180);
        break;
      case '[':
        p.push();
        depth++;
        break;
      case ']':
        p.pop();
        depth--;
        break;
      case 'X':
      case 'L':
        p.push();
        stampLeaf(p, palette);
        p.pop();
        break;
      case 'B':
        p.push();
        stampBlossom(p, palette);
        p.pop();
        break;
    }
  }

  p.pop();
}

export function drawGround(p, palette) {
  const y = p.height - 40;
  p.noStroke();

  // Ground line
  p.fill(palette.ground);
  p.rect(p.width / 2 - 80, y, 160, 3);

  // Moss patches — stamp a few clusters left and right of trunk base
  const offsets = [-55, -35, -18, 18, 35, 55];
  for (const dx of offsets) {
    p.push();
    p.translate(p.width / 2 + dx, y - 2);
    stampMoss(p, palette);
    p.pop();
  }
}
