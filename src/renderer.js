import { stampLeaf, stampBlossom } from './sprites.js';

function drawPixelLine(p, len, color, weight) {
  p.stroke(color);
  p.strokeWeight(Math.max(1, weight));
  p.line(0, 0, 0, -len);
  p.translate(0, -len);
}

export function drawLSystem(p, sentence, angle, palette) {
  p.push();
  p.translate(p.width / 2, p.height - 40);

  // Scale line length so deeper trees still fit the canvas
  const len = 220 / Math.max(sentence.length, 1) ** 0.45;

  let depth = 0;
  let maxDepth = 1;

  // First pass: measure max stack depth for taper calculation
  for (const ch of sentence) {
    if (ch === '[') { depth++; maxDepth = Math.max(maxDepth, depth); }
    else if (ch === ']') depth--;
  }

  depth = 0;

  for (const ch of sentence) {
    const weight = Math.max(1, 4 - (depth / maxDepth) * 3);
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
