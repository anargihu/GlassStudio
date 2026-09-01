const MODES = ['card','button','input','navbar','panel'];

const NOISE_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E";

const PRESETS = {
  frosted: { blur: 16, saturation: 140, opacity: 14, borderWidth: 1, borderOpacity: 22, radius: 20, shadow: 28 },
  neon:    { blur: 8,  saturation: 200, opacity: 18, borderWidth: 2, borderOpacity: 50, radius: 16, shadow: 40 },
  subtle:  { blur: 10, saturation: 110, opacity: 8,  borderWidth: 1, borderOpacity: 12, radius: 14, shadow: 14 },
  heavy:   { blur: 28, saturation: 160, opacity: 30, borderWidth: 2, borderOpacity: 35, radius: 24, shadow: 50 }
};

function defaultSettings() {
  return {
    blur: 16, saturation: 140, opacity: 14, borderWidth: 1, borderStyle: 'solid',
    borderOpacity: 22, radius: 20, shadow: 28, insetShadow: false, noise: false,
    tint: '#ffffff', gradientEnabled: false, tint2: '#a78bfa',
    textColor: '#ffffff', hoverIntensity: 6
  };
}

const saved = (() => {
  const base = {};
  MODES.forEach(m => base[m] = defaultSettings());
  try {
    const stored = JSON.parse(localStorage.getItem('glassStudioSettings') || 'null');
    if (stored) {
      MODES.forEach(m => {
        if (stored[m]) base[m] = Object.assign({}, defaultSettings(), stored[m]);
      });
    }
  } catch (e) {}
  return base;
})();

const glow = (() => {
  try {
    const stored = JSON.parse(localStorage.getItem('glassStudioGlow') || 'null');
    if (stored) return stored;
  } catch (e) {}
  return { glowA: '#7c6fff', glowB: '#4fd1c5', glowC: '#ff6fa5' };
})();

let currentMode = 'card';
let previewLight = false;
try { previewLight = localStorage.getItem('glassStudioPreviewLight') === '1'; } catch (e) {}

const nodes = {
  card: document.getElementById('glassCard'),
  button: document.getElementById('glassButton'),
  input: document.getElementById('glassInput'),
  navbar: document.getElementById('glassNavbar'),
  panel: document.getElementById('glassPanel')
};

const allNodes = {
  card: document.getElementById('allCard'),
  button: document.getElementById('allButton'),
  input: document.getElementById('allInput'),
  navbar: document.getElementById('allNavbar'),
  panel: document.getElementById('allPanel')
};

function persist() {
  localStorage.setItem('glassStudioSettings', JSON.stringify(saved));
  localStorage.setItem('glassStudioGlow', JSON.stringify(glow));
}

function hexToRgb(hex) {
  const b = parseInt(hex.replace('#',''), 16);
  return { r: (b >> 16) & 255, g: (b >> 8) & 255, b: b & 255 };
}

function randHex() {
  const c = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return '#' + c;
}

function cssForMode(mode) {
  const s = saved[mode];
  const { r, g, b } = hexToRgb(s.tint);
  const { r: r2, g: g2, b: b2 } = hexToRgb(s.tint2);
  const alpha = (s.opacity / 100).toFixed(2);
  const flatColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
  const gradientColor = `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, ${alpha}), rgba(${r2}, ${g2}, ${b2}, ${alpha}))`;
  const border = `rgba(${r}, ${g}, ${b}, ${(s.borderOpacity / 100).toFixed(2)})`;
  let shadowCss = `0 ${Math.round(s.shadow * 0.6)}px ${s.shadow * 2}px rgba(0,0,0,0.35)`;
  if (s.insetShadow) {
    shadowCss += `, inset 0 1px 1px rgba(255,255,255,0.25), inset 0 -1px 6px rgba(0,0,0,0.25)`;
  }
  const filterCss = `blur(${s.blur}px) saturate(${s.saturation}%)`;
  const className = `glass-${mode}`;

  const bgLines = [];
  if (s.noise && s.gradientEnabled) {
    bgLines.push(`  background-image: url("${NOISE_SVG}"), ${gradientColor};`);
  } else if (s.noise) {
    bgLines.push(`  background-color: ${flatColor};`);
    bgLines.push(`  background-image: url("${NOISE_SVG}");`);
  } else if (s.gradientEnabled) {
    bgLines.push(`  background-image: ${gradientColor};`);
  } else {
    bgLines.push(`  background: ${flatColor};`);
  }

  let css = `.${className} {
${bgLines.join('\n')}
  backdrop-filter: ${filterCss};
  -webkit-backdrop-filter: ${filterCss};
  border: ${s.borderWidth}px ${s.borderStyle} ${border};
  border-radius: ${s.radius}px;
  box-shadow: ${shadowCss};
  color: ${s.textColor};`;

  if (mode === 'button') {
    css += `
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 12px 28px;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
}

.${className}:hover {
  transform: translateY(-2px);
  background: rgba(${r}, ${g}, ${b}, ${((s.opacity + s.hoverIntensity) / 100).toFixed(2)});
}`;
  } else if (mode === 'input') {
    css += `
  padding: 12px 16px;
  font-size: 14px;
  outline: none;
  width: 100%;
}

.${className}::placeholder {
  color: rgba(255, 255, 255, 0.5);
}`;
  } else if (mode === 'navbar') {
    css += `
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 14px 24px;
}`;
  } else if (mode === 'panel') {
    css += `
  width: 100%;
  padding: 40px;
}`;
  } else {
    css += `
  padding: 28px;
}`;
  }

  return { css, flatColor, gradientColor, border, shadowCss, filterCss };
}

function htmlForMode(mode) {
  if (mode === 'card') return `<div class="glass-card">\n  <div class="dot"></div>\n  <h3>Frosted panel</h3>\n  <p>Your text here.</p>\n</div>`;
  if (mode === 'button') return `<button class="glass-button">Get started</button>`;
  if (mode === 'input') return `<input class="glass-input" type="text" placeholder="Type something...">`;
  if (mode === 'navbar') return `<div class="glass-navbar">\n  <div class="nav-brand">Studio</div>\n  <div class="nav-links">\n    <a href="#">Home</a>\n    <a href="#">Explore</a>\n    <a href="#">Profile</a>\n  </div>\n</div>`;
  if (mode === 'panel') return `<div class="glass-panel">\n  <p>Your content here.</p>\n</div>`;
  return '';
}

function applyChildTextColor(node, mode, color) {
  if (mode === 'card') {
    const h3 = node.querySelector('h3');
    const p = node.querySelector('p');
    if (h3) h3.style.color = color;
    if (p) p.style.color = color;
  } else if (mode === 'navbar') {
    const brand = node.querySelector('.nav-brand');
    const links = node.querySelector('.nav-links');
    if (brand) brand.style.color = color;
    if (links) links.style.color = color;
  } else if (mode === 'panel') {
    const span = node.querySelector('span');
    if (span) span.style.color = color;
  }
}

function styleNode(node, mode, displayValue) {
  const s = saved[mode];
  const result = cssForMode(mode);
  node.style.display = displayValue;

  if (s.noise && s.gradientEnabled) {
    node.style.background = '';
    node.style.backgroundColor = '';
    node.style.backgroundImage = `url("${NOISE_SVG}"), ${result.gradientColor}`;
  } else if (s.noise) {
    node.style.background = '';
    node.style.backgroundColor = result.flatColor;
    node.style.backgroundImage = `url("${NOISE_SVG}")`;
  } else if (s.gradientEnabled) {
    node.style.background = '';
    node.style.backgroundColor = '';
    node.style.backgroundImage = result.gradientColor;
  } else {
    node.style.backgroundImage = '';
    node.style.backgroundColor = '';
    node.style.background = result.flatColor;
  }

  node.style.backdropFilter = result.filterCss;
  node.style.webkitBackdropFilter = result.filterCss;
  node.style.border = `${s.borderWidth}px ${s.borderStyle} ${result.border}`;
  node.style.borderRadius = `${s.radius}px`;
  node.style.boxShadow = result.shadowCss;
  node.style.color = s.textColor;

  applyChildTextColor(node, mode, s.textColor);

  return result.css;
}

function displayFor(mode) {
  return mode === 'button' ? 'inline-block'
    : mode === 'input' ? 'block'
    : mode === 'navbar' ? 'flex'
    : mode === 'panel' ? 'flex'
    : 'block';
}

function toggleGradientControl() {
  document.getElementById('tint2Row').style.display = document.getElementById('gradientEnabled').checked ? 'block' : 'none';
}

function toggleHoverControl() {
  document.getElementById('hoverIntensityRow').style.display = currentMode === 'button' ? 'block' : 'none';
}

function loadControlsFromState(mode) {
  const s = saved[mode];
  ['blur','saturation','opacity','borderWidth','borderOpacity','radius','shadow','hoverIntensity'].forEach(id => {
    document.getElementById(id).value = s[id];
  });
  document.getElementById('tint').value = s.tint;
  document.getElementById('tint2').value = s.tint2;
  document.getElementById('textColor').value = s.textColor;
  document.getElementById('borderStyle').value = s.borderStyle;
  document.getElementById('insetShadow').checked = s.insetShadow;
  document.getElementById('noise').checked = s.noise;
  document.getElementById('gradientEnabled').checked = s.gradientEnabled;
  toggleGradientControl();
  toggleHoverControl();
}

function updateReadouts(mode) {
  const s = saved[mode];
  document.getElementById('vBlur').textContent = s.blur + 'px';
  document.getElementById('vSaturation').textContent = s.saturation + '%';
  document.getElementById('vOpacity').textContent = s.opacity + '%';
  document.getElementById('vBorderWidth').textContent = s.borderWidth + 'px';
  document.getElementById('vBorder').textContent = s.borderOpacity + '%';
  document.getElementById('vRadius').textContent = s.radius + 'px';
  document.getElementById('vShadow').textContent = s.shadow;
  document.getElementById('vTint').textContent = s.tint;
  document.getElementById('vTextColor').textContent = s.textColor;
  document.getElementById('vHoverIntensity').textContent = s.hoverIntensity;
}

function applyPreviewMode() {
  const box = document.querySelector('.preview-box');
  if (previewLight) { box.classList.add('light'); } else { box.classList.remove('light'); }
  document.getElementById('previewToggleBtn').textContent = previewLight ? 'Preview: Light' : 'Preview: Dark';
}

function render() {
  document.getElementById('glowA').style.background = glow.glowA;
  document.getElementById('glowB').style.background = glow.glowB;
  document.getElementById('glowC').style.background = glow.glowC;

  const controlsPanel = document.getElementById('controlsPanel');
  const toolsPanel = document.getElementById('toolsPanel');
  const allNote = document.getElementById('allNote');
  const allPreview = document.getElementById('allPreview');

  if (currentMode === 'all') {
    controlsPanel.style.display = 'none';
    toolsPanel.style.display = 'none';
    allNote.style.display = 'block';
    allPreview.style.display = 'flex';
    Object.keys(nodes).forEach(key => { nodes[key].style.display = 'none'; });

    const bgCss = `body {
  background: #07080d;
  position: relative;
  overflow-x: hidden;
}

.glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

#glowA {
  width: 42rem;
  height: 42rem;
  top: -10%;
  left: -8%;
  opacity: .4;
  background: ${glow.glowA};
  filter: blur(60px);
}

#glowB {
  width: 38rem;
  height: 38rem;
  bottom: -15%;
  right: -6%;
  opacity: .35;
  background: ${glow.glowB};
  filter: blur(60px);
}

#glowC {
  width: 30rem;
  height: 30rem;
  top: 35%;
  right: 22%;
  opacity: .3;
  background: ${glow.glowC};
  filter: blur(60px);
}`;

    let fullCss = bgCss;
    MODES.forEach((mode) => {
      const css = styleNode(allNodes[mode], mode, mode === 'card' ? 'block' : displayFor(mode));
      fullCss += '\n\n' + css;
    });
    document.getElementById('cssOutput').textContent = fullCss;
  } else {
    controlsPanel.style.display = 'block';
    toolsPanel.style.display = 'block';
    allNote.style.display = 'none';
    allPreview.style.display = 'none';
    Object.keys(nodes).forEach(key => { nodes[key].style.display = 'none'; });

    updateReadouts(currentMode);
    const css = styleNode(nodes[currentMode], currentMode, displayFor(currentMode));
    document.getElementById('cssOutput').textContent = css;
  }
}

function randomizeCurrent() {
  if (currentMode === 'all') return;
  const s = saved[currentMode];
  s.blur = Math.floor(Math.random() * 31);
  s.saturation = 100 + Math.floor(Math.random() * 121);
  s.opacity = 2 + Math.floor(Math.random() * 44);
  s.borderWidth = Math.floor(Math.random() * 5);
  s.borderOpacity = Math.floor(Math.random() * 61);
  s.radius = Math.floor(Math.random() * 41);
  s.shadow = Math.floor(Math.random() * 61);
  s.tint = randHex();
  persist();
  loadControlsFromState(currentMode);
  render();
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } catch (e) {}
  document.body.removeChild(ta);
}

function flashCopied(btn, label) {
  const original = label || 'Copy';
  btn.textContent = 'Copied';
  btn.classList.add('copied');
  setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1600);
}

document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentMode = btn.dataset.mode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (currentMode !== 'all') loadControlsFromState(currentMode);
    render();
  });
});

['blur','saturation','opacity','borderWidth','borderOpacity','radius','shadow','hoverIntensity'].forEach(id => {
  document.getElementById(id).addEventListener('input', e => {
    if (currentMode === 'all') return;
    saved[currentMode][id] = parseFloat(e.target.value);
    persist();
    render();
  });
});

document.getElementById('tint').addEventListener('input', e => {
  if (currentMode === 'all') return;
  saved[currentMode].tint = e.target.value;
  persist(); render();
});
document.getElementById('tint2').addEventListener('input', e => {
  if (currentMode === 'all') return;
  saved[currentMode].tint2 = e.target.value;
  persist(); render();
});
document.getElementById('textColor').addEventListener('input', e => {
  if (currentMode === 'all') return;
  saved[currentMode].textColor = e.target.value;
  persist(); render();
});
document.getElementById('borderStyle').addEventListener('change', e => {
  if (currentMode === 'all') return;
  saved[currentMode].borderStyle = e.target.value;
  persist(); render();
});
document.getElementById('insetShadow').addEventListener('change', e => {
  if (currentMode === 'all') return;
  saved[currentMode].insetShadow = e.target.checked;
  persist(); render();
});
document.getElementById('noise').addEventListener('change', e => {
  if (currentMode === 'all') return;
  saved[currentMode].noise = e.target.checked;
  persist(); render();
});
document.getElementById('gradientEnabled').addEventListener('change', e => {
  if (currentMode === 'all') return;
  saved[currentMode].gradientEnabled = e.target.checked;
  persist();
  toggleGradientControl();
  render();
});

document.getElementById('colA').addEventListener('input', e => { glow.glowA = e.target.value; persist(); render(); });
document.getElementById('colB').addEventListener('input', e => { glow.glowB = e.target.value; persist(); render(); });
document.getElementById('colC').addEventListener('input', e => { glow.glowC = e.target.value; persist(); render(); });

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (currentMode === 'all') return;
    const preset = PRESETS[btn.dataset.preset];
    Object.assign(saved[currentMode], preset);
    persist();
    loadControlsFromState(currentMode);
    render();
  });
});

document.getElementById('randomizeBtn').addEventListener('click', randomizeCurrent);

document.getElementById('previewToggleBtn').addEventListener('click', () => {
  previewLight = !previewLight;
  try { localStorage.setItem('glassStudioPreviewLight', previewLight ? '1' : '0'); } catch (e) {}
  applyPreviewMode();
});

document.getElementById('copyBtn').addEventListener('click', () => {
  copyText(document.getElementById('cssOutput').textContent);
  flashCopied(document.getElementById('copyBtn'), 'Copy CSS');
});

document.getElementById('copyHtmlBtn').addEventListener('click', () => {
  let combined = '';
  if (currentMode === 'all') {
    MODES.forEach((mode, i) => {
      const { css } = cssForMode(mode);
      combined += (i > 0 ? '\n\n' : '') + htmlForMode(mode) + '\n\n' + css;
    });
  } else {
    const { css } = cssForMode(currentMode);
    combined = htmlForMode(currentMode) + '\n\n' + css;
  }
  copyText(combined);
  flashCopied(document.getElementById('copyHtmlBtn'), 'Copy HTML+CSS');
});

document.getElementById('colA').value = glow.glowA;
document.getElementById('colB').value = glow.glowB;
document.getElementById('colC').value = glow.glowC;

applyPreviewMode();
loadControlsFromState(currentMode);
render();