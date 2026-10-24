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
