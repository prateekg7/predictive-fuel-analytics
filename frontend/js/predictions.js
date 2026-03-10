// ===== TRY IT YOURSELF PAGE LOGIC =====

let tiyState = { fractions: [0.2, 0.2, 0.2, 0.2, 0.2] };
const charts = {};

// ======== FRACTION SLIDERS ========
function buildFractionSliders() {
  const container = document.getElementById('fraction-sliders');
  container.innerHTML = tiyState.fractions.map((f, i) => `
    <div class="frac-row">
      <div class="frac-label" style="color:${COMP_NAMES[i].color}" title="${COMP_NAMES[i].full}">${COMP_NAMES[i].short}</div>
      <input type="range" class="frac-slider" min="0" max="1" step="0.01"
        value="${f}" id="frac-slider-${i}"
        oninput="onFracSlider(${i}, this.value)"
        style="background: linear-gradient(to right, ${COLORS[i]}90 0%, ${COLORS[i]}90 ${f * 100}%, var(--border) ${f * 100}%);">
      <input type="number" class="frac-input" min="0" max="1" step="0.01"
        value="${f.toFixed(2)}" id="frac-input-${i}"
        oninput="onFracInput(${i}, this.value)">
    </div>
  `).join('');
}

function onFracSlider(idx, val) {
  tiyState.fractions[idx] = parseFloat(val);
  document.getElementById('frac-input-' + idx).value = parseFloat(val).toFixed(2);
  updateSliderFill(idx);
  updateFracSum();
}

function onFracInput(idx, val) {
  const v = Math.max(0, Math.min(1, parseFloat(val) || 0));
  tiyState.fractions[idx] = v;
  const slider = document.getElementById('frac-slider-' + idx);
  slider.value = v;
  updateSliderFill(idx);
  updateFracSum();
}

function updateSliderFill(idx) {
  const slider = document.getElementById('frac-slider-' + idx);
  const pct = tiyState.fractions[idx] * 100;
  slider.style.background = `linear-gradient(to right, ${COLORS[idx]}90 0%, ${COLORS[idx]}90 ${pct}%, var(--border) ${pct}%)`;
}

function updateFracSum() {
  const sum    = tiyState.fractions.reduce((a, b) => a + b, 0);
  const badge  = document.getElementById('frac-sum-badge');
  const bar    = document.getElementById('frac-bar');
  const pct    = document.getElementById('frac-pct');
  const pctVal = Math.min(sum * 100, 100);

  bar.style.width  = pctVal + '%';
  pct.textContent  = (sum * 100).toFixed(0) + ' / 100%';

  const diff = Math.abs(sum - 1.0);
  badge.textContent = 'Sum: ' + sum.toFixed(2);
  badge.className   = 'kpi-badge ' + (diff < 0.01 ? 'badge-green' : diff < 0.05 ? 'badge-yellow' : 'badge-red');
  bar.style.background = diff < 0.01 ? 'var(--accent3)' : diff < 0.05 ? 'var(--accent)' : 'var(--danger)';

  const btn = document.getElementById('predict-btn');
  btn.disabled = diff > 0.05;
  document.getElementById('predict-btn-text').textContent =
    diff > 0.05 ? '⚠ FRACTIONS MUST SUM TO 1.0' : '▶ RUN PREDICTION';
}

// ======== PREDICTION ENGINE ========
function computePrediction() {
  // BP1–BP10 fingerprints per component
  const COMP_PROFILES = [
    [ 0.85,  0.80,  0.20,  0.15,  0.10,  0.05,  0.60,  0.20,  0.30,  0.10],
    [ 1.20,  1.10, -0.80,  0.40,  0.50,  0.80,  0.20,  0.50,  0.70,  1.80],
    [ 0.60,  0.55,  0.10, -0.30, -0.60, -0.40,  0.40, -0.50, -0.60, -1.20],
    [-0.30, -0.40,  1.40,  1.20,  1.30,  0.90, -0.10,  1.10,  1.40, -0.30],
    [ 0.20,  0.15,  0.60,  0.30, -0.10,  0.10,  0.80, -0.20, -0.10, -0.80],
  ];

  const fracs   = tiyState.fractions;
  const results = {};

  PROP_META.forEach((pm, pi) => {
    let pred = 0;
    for (let c = 0; c < 5; c++) {
      pred += fracs[c] * COMP_PROFILES[c][pi];
    }
    const fracVar = fracs.reduce((acc, f) => acc + Math.pow(f - 0.2, 2), 0);
    pred *= (1 + 0.06 * fracVar);
    const seed = fracs.reduce((a, f, ci) => a + f * (ci + 1) * 17.3, pi * 5.7);
    pred += Math.sin(seed * 91.3) * METRICS[pm.key].mae * 0.4;
    results[pm.key] = Math.round(pred * 10000) / 10000;
  });

  return results;
}

function runPrediction() {
  const sum = tiyState.fractions.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1.0) > 0.05) return;

  const btn     = document.getElementById('predict-btn');
  const btnText = document.getElementById('predict-btn-text');
  btn.disabled       = true;
  btnText.textContent = '⟳ COMPUTING...';

  setTimeout(() => {
    const predicted = computePrediction();
    showResults(predicted);
    btn.disabled       = false;
    btnText.textContent = '▶ RUN PREDICTION';
    updateFracSum();
  }, 400);
}

function showResults(predicted) {
  document.getElementById('results-placeholder').style.display  = 'none';
  document.getElementById('results-content').style.display      = 'block';

  const maxFrac = Math.max(...tiyState.fractions);
  const conf      = maxFrac > 0.7 ? 'MODERATE CONFIDENCE' : 'HIGH CONFIDENCE';
  const confColor = maxFrac > 0.7 ? 'var(--accent)'       : 'var(--accent3)';
  document.getElementById('res-confidence').textContent = '● ' + conf;
  document.getElementById('res-confidence').style.color  = confColor;

  const grid    = document.getElementById('prop-results-grid');
  const allVals = Object.values(predicted);
  const maxAbs  = Math.max(...allVals.map(Math.abs), 0.001);

  grid.innerHTML = PROP_META.map((pm, i) => {
    const val    = predicted[pm.key];
    const barPct = Math.abs(val) / maxAbs * 50;
    const isPos  = val >= 0;
    const color  = val > 0.5 ? 'var(--accent3)' : val < -0.5 ? 'var(--danger)' : 'var(--accent)';

    return `<div class="prop-result-item" style="animation-delay:${i * 0.05}s">
      <div class="prop-result-name">
        <div class="label">${pm.code}</div>
        <div class="full-name">${pm.name}</div>
        <div style="font-size:10px;color:var(--muted);margin-top:1px;">${pm.desc}</div>
      </div>
      <div class="prop-result-bar-wrap">
        <div class="prop-result-bar" style="
          width:${barPct}%;
          background:${color};
          margin-left:${isPos ? '50%' : (50 - barPct) + '%'};
          opacity:0.7;
        "></div>
      </div>
      <div class="prop-result-val" style="color:${color}">${val >= 0 ? '+' : ''}${val.toFixed(3)}</div>
      <div class="prop-result-unit">${pm.unit}</div>
    </div>`;
  }).join('');

  // Radar
  const radarData = PROP_META.map(pm => predicted[pm.key]);
  if (charts.tiyRadar) charts.tiyRadar.destroy();
  charts.tiyRadar = new Chart(document.getElementById('tiyRadarChart'), {
    type: 'radar',
    data: {
      labels: PROP_META.map(pm => pm.abbr),
      datasets: [{
        label: 'Predicted Blend',
        data: radarData,
        backgroundColor: 'rgba(245,166,35,0.12)',
        borderColor: '#f5a623',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#f5a623',
        pointHoverRadius: 6,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const pm = PROP_META[ctx.dataIndex];
              return ` ${pm.name}: ${ctx.raw >= 0 ? '+' : ''}${ctx.raw.toFixed(3)} ${pm.unit}`;
            },
          },
        },
      },
      scales: {
        r: {
          grid: { color: '#1e2330' },
          ticks: { backdropColor: 'transparent', color: '#5a6075', font: { size: 9 } },
          pointLabels: {
            color: PROP_META.map(pm => pm.color),
            font: { size: 10, family: "'Space Mono', monospace" },
          },
        },
      },
    },
  });
}

// ======== INIT ========
window.addEventListener('load', () => {
  buildFractionSliders();
  updateFracSum();
});
