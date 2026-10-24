// 6×6 pixel art sprite definitions — each row is a bitmask (left→right = bit 5→0)
const LEAF_PIXELS = [
  0b001100,
  0b011110,
  0b111111,
  0b111111,
  0b011110,
  0b001100,
];

const BLOSSOM_PIXELS = [
  0b010010,
  0b111111,
  0b111111,
  0b111111,
  0b010010,
  0b000000,
];

const MOSS_PIXELS = [
  0b010101,
  0b111111,
  0b111111,
  0b011110,
  0b001100,
  0b000000,
];

function stampSprite(p, pixels, color, size = 2) {
  p.noStroke();
  p.fill(color);
  for (let row = 0; row < pixels.length; row++) {
    for (let col = 0; col < 6; col++) {
      if (pixels[row] & (1 << (5 - col))) {
        p.rect(
          (col - 3) * size,
          (row - 3) * size,
          size,
          size
        );
      }
    }
  }
}

export function stampLeaf(p, palette) {
  stampSprite(p, LEAF_PIXELS, palette.leaf);
}

export function stampBlossom(p, palette) {
  stampSprite(p, BLOSSOM_PIXELS, palette.blossom);
}

export function stampMoss(p, palette) {
  stampSprite(p, MOSS_PIXELS, palette.moss, 1);
}
