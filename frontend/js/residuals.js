// ===== RESIDUALS PAGE LOGIC =====

const charts = {};

// ======== RESIDUAL HISTOGRAM ========
function buildResidHist(propIdx) {
  const propKey   = PROPS[propIdx];
  const residuals = DATA.predicted.map((r, i) => r[propKey] - DATA.actual[i][propKey]);

  const bins  = 25;
  const minV  = Math.min(...residuals);
  const maxV  = Math.max(...residuals);
  const range = maxV - minV;
  const step  = range > 0.0001 ? range / bins : 0.01;
  const lo    = range > 0.0001 ? minV : -0.125;

  const counts = new Array(bins).fill(0);
  residuals.forEach(v => {
    const b = Math.min(Math.max(Math.floor((v - lo) / step), 0), bins - 1);
    counts[b]++;
  });

  const labels       = counts.map((_, i) => (lo + i * step + step / 2).toFixed(3));
  const colors       = labels.map(l => parseFloat(l) < 0 ? '#ff4d6d60' : '#4ade8060');
  const borderColors = labels.map(l => parseFloat(l) < 0 ? '#ff4d6d'   : '#4ade80');

  if (charts.residHist) charts.residHist.destroy();
  charts.residHist = new Chart(document.getElementById('residHistChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data:            counts,
        backgroundColor: colors,
        borderColor:     borderColors,
        borderWidth: 1,
        borderRadius: 1,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
        y: { grid: { color: '#1e2330' } },
      },
    },
  });
}

// ======== RESIDUALS VS FITTED ========
function buildResidFitted(propIdx) {
  const propKey   = PROPS[propIdx];
  const fitted    = DATA.predicted.map(r => r[propKey]);
  const residuals = DATA.predicted.map((r, i) => r[propKey] - DATA.actual[i][propKey]);
  const pts       = fitted.map((f, i) => ({ x: f, y: residuals[i] }));

  if (charts.residFitted) charts.residFitted.destroy();
  charts.residFitted = new Chart(document.getElementById('residFittedChart'), {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Residuals',
          data: pts,
          backgroundColor: COLORS[propIdx] + '55',
          borderColor:     COLORS[propIdx] + '70',
          borderWidth: 0.5,
          pointRadius: 3,
        },
        {
          label: 'Zero Line',
          data: [{ x: Math.min(...fitted), y: 0 }, { x: Math.max(...fitted), y: 0 }],
          type: 'line',
          borderColor: '#ffffff30',
          borderWidth: 1,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: 'Fitted Values', color: '#5a6075' }, grid: { color: '#1e2330' } },
        y: { title: { display: true, text: 'Residual',      color: '#5a6075' }, grid: { color: '#1e2330' } },
      },
    },
  });
}

// ======== MAE BARS ========
function buildMAEBars() {
  const container = document.getElementById('mae-bars');
  const maxMAE    = Math.max(...PROPS.map(p => METRICS[p].mae));

  container.innerHTML = PROPS.map((p, i) => {
    const mae = METRICS[p].mae;
    const pct = (mae / maxMAE * 100).toFixed(1);
    const color = mae > 0.05 ? '#ff4d6d' : mae > 0.04 ? '#f5a623' : '#4ade80';
    return `
      <div class="residual-row">
        <div class="res-label">${PROP_META[i].abbr}</div>
        <div class="res-bar-wrap">
          <div class="res-bar" style="width:${pct}%;background:${color};"></div>
        </div>
        <div class="res-val" style="color:${color}">${mae.toFixed(4)}</div>
      </div>`;
  }).join('');
}

// ======== INIT ========
function initResiduals() {
  makePropSelector('res-prop-sel', 0, (i) => {
    buildResidHist(i);
    buildResidFitted(i);
  });
  buildResidHist(0);
  buildResidFitted(0);
  buildMAEBars();
}

window.addEventListener('load', initResiduals);
