import { PALETTES } from './palette.js';
import { PRESETS }  from './lsystem.js';

export function buildUI({ onAngle, onDepth, onRandomness, onPalette, onPreset, onRegrow, onSave }) {
  const panel = document.createElement('div');
  panel.id = 'ui-panel';
  panel.innerHTML = `
    <button id="ui-toggle" aria-label="Toggle controls">⚙</button>
    <div id="ui-inner">
      <h2 class="ui-title">Bonsai Controls</h2>

      <label class="ui-label">Angle <span id="angle-val">25°</span>
        <input type="range" id="slider-angle" min="5" max="60" value="25" step="1">
      </label>

      <label class="ui-label">Depth <span id="depth-val">5</span>
        <input type="range" id="slider-depth" min="1" max="7" value="5" step="1">
      </label>

      <label class="ui-label">Randomness <span id="rand-val">0.0</span>
        <input type="range" id="slider-rand" min="0" max="1" value="0" step="0.01">
      </label>

      <div class="ui-row">
        <span class="ui-label-sm">Palette</span>
        <div class="palette-btns">
          ${Object.entries(PALETTES).map(([key, p]) =>
            `<button class="pal-btn" data-key="${key}" title="${p.label}">${p.label}</button>`
          ).join('')}
        </div>
      </div>

      <label class="ui-label">Preset
        <select id="preset-select">
          ${Object.entries(PRESETS).map(([key, p]) =>
            `<option value="${key}">${p.label}</option>`
          ).join('')}
        </select>
      </label>

      <div class="ui-actions">
        <button id="btn-regrow">Regrow</button>
        <button id="btn-save">Save PNG</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  // Toggle collapse
  document.getElementById('ui-toggle').addEventListener('click', () => {
    panel.classList.toggle('collapsed');
  });

  // Debounce helper
  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  const angleSlider = document.getElementById('slider-angle');
  const depthSlider = document.getElementById('slider-depth');
  const randSlider  = document.getElementById('slider-rand');

  angleSlider.addEventListener('input', debounce(() => {
    document.getElementById('angle-val').textContent = angleSlider.value + '°';
    onAngle(Number(angleSlider.value));
  }, 16));

  depthSlider.addEventListener('input', debounce(() => {
    document.getElementById('depth-val').textContent = depthSlider.value;
    onDepth(Number(depthSlider.value));
  }, 16));

  randSlider.addEventListener('input', debounce(() => {
    document.getElementById('rand-val').textContent = Number(randSlider.value).toFixed(2);
    onRandomness(Number(randSlider.value));
  }, 16));

  document.querySelectorAll('.pal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pal-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onPalette(btn.dataset.key);
    });
  });
  document.querySelector('.pal-btn').classList.add('active');

  document.getElementById('preset-select').addEventListener('change', (e) => {
    onPreset(e.target.value);
  });

  document.getElementById('btn-regrow').addEventListener('click', onRegrow);
  document.getElementById('btn-save').addEventListener('click', onSave);
}
