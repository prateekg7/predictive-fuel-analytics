// ===== OVERVIEW PAGE LOGIC =====

let selectedProp = 0;
const charts = {};

// ======== PROP SELECTION ========
function selectProp(idx) {
  selectedProp = idx;
  document.querySelectorAll('.kpi-card').forEach((c, i) => {
    c.classList.toggle('active', i === idx);
  });
  const sel = document.getElementById('scatter-prop-sel');
  if (sel) {
    sel.querySelectorAll('.prop-btn').forEach((b, i) => {
      b.classList.toggle('active', i === idx);
    });
  }
  const label = document.getElementById('scatter-prop-label');
  if (label) label.textContent = PROP_META[idx].name;
  buildScatter(idx);
}

// ======== SCATTER CHART ========
function buildScatter(propIdx) {
  const propKey = PROPS[propIdx];
  const pred    = DATA.predicted.map(r => r[propKey]);
  const act     = DATA.actual.map(r => r[propKey]);
  const pts     = pred.map((p, i) => ({ x: act[i], y: p }));

  const allVals = [...pred, ...act];
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);

  if (charts.scatter) charts.scatter.destroy();
  charts.scatter = new Chart(document.getElementById('scatterChart'), {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Predictions',
          data: pts,
          backgroundColor: COLORS[propIdx] + '60',
          borderColor:     COLORS[propIdx] + '80',
          borderWidth: 0.5,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: 'Perfect Fit',
          data: [{ x: minV, y: minV }, { x: maxV, y: maxV }],
          type: 'line',
          borderColor: '#ffffff20',
          borderWidth: 1,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              if (ctx.datasetIndex === 0)
                return ` actual: ${ctx.raw.x.toFixed(3)}, pred: ${ctx.raw.y.toFixed(3)}`;
              return null;
            },
          },
        },
      },
      scales: {
        x: { title: { display: true, text: 'Actual',    color: '#5a6075' }, grid: { color: '#1e2330' } },
        y: { title: { display: true, text: 'Predicted', color: '#5a6075' }, grid: { color: '#1e2330' } },
      },
    },
  });
}

// ======== R² CHART ========
function buildR2Chart() {
  if (charts.r2) charts.r2.destroy();
  charts.r2 = new Chart(document.getElementById('r2Chart'), {
    type: 'bar',
    data: {
      labels: PROPS.map((p, i) => PROP_META[i].abbr),
      datasets: [{
        data:            PROPS.map(p => METRICS[p].r2),
        backgroundColor: PROPS.map((p, i) => COLORS[i] + '40'),
        borderColor:     PROPS.map((p, i) => COLORS[i]),
        borderWidth: 1,
        borderRadius: 1,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => ' R² = ' + ctx.raw.toFixed(4) } },
      },
      scales: {
        x: {
          min: 0.9, max: 1.0,
          grid: { color: '#1e2330' },
          ticks: { callback: v => v.toFixed(3) },
        },
        y: { grid: { display: false } },
      },
    },
  });
}

// ======== MAE CHART ========
function buildMAEChart() {
  if (charts.mae) charts.mae.destroy();
  charts.mae = new Chart(document.getElementById('maeChart'), {
    type: 'bar',
    data: {
      labels: PROPS.map((p, i) => PROP_META[i].abbr),
      datasets: [{
        data: PROPS.map(p => METRICS[p].mae),
        backgroundColor: PROPS.map(p => METRICS[p].mae > 0.05 ? '#ff4d6d40' : '#4ade8040'),
        borderColor:     PROPS.map(p => METRICS[p].mae > 0.05 ? '#ff4d6d'   : '#4ade80'),
        borderWidth: 1,
        borderRadius: 1,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => ' MAE = ' + ctx.raw.toFixed(4) } },
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: '#1e2330' } },
      },
    },
  });
}

// ======== RADAR CHART ========
function buildRadar(sampleIdx) {
  const pred = PROPS.map(p => DATA.predicted[sampleIdx][p]);
  const act  = PROPS.map(p => DATA.actual[sampleIdx][p]);

  if (charts.radar) charts.radar.destroy();
  charts.radar = new Chart(document.getElementById('radarChart'), {
    type: 'radar',
    data: {
      labels: PROPS.map((p, i) => PROP_META[i].abbr),
      datasets: [
        {
          label: 'Predicted',
          data: pred,
          backgroundColor: 'rgba(245,166,35,0.10)',
          borderColor: '#f5a623',
          borderWidth: 1.5,
          pointRadius: 3,
          pointBackgroundColor: '#f5a623',
        },
        {
          label: 'Actual',
          data: act,
          backgroundColor: 'rgba(0,212,255,0.07)',
          borderColor: '#00d4ff',
          borderWidth: 1.5,
          borderDash: [4, 3],
          pointRadius: 3,
          pointBackgroundColor: '#00d4ff',
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, padding: 8 } } },
      scales: {
        r: {
          grid: { color: '#1e2330' },
          ticks: { backdropColor: 'transparent', color: '#5a6075', font: { size: 8 } },
          pointLabels: { color: '#5a6075', font: { size: 9 } },
        },
      },
    },
  });
}

// ======== INIT ========
function initOverview() {
  makePropSelector('scatter-prop-sel', selectedProp, (i) => {
    selectedProp = i;
    buildScatter(i);
    document.getElementById('scatter-prop-label').textContent = PROP_META[i].name;
    document.querySelectorAll('.kpi-card').forEach((c, ci) => {
      c.classList.toggle('active', ci === i);
    });
  });

  buildScatter(selectedProp);
  buildR2Chart();
  buildMAEChart();
  buildRadar(0);
}

window.addEventListener('load', initOverview);
