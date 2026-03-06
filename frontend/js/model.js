// ===== MODEL PAGE LOGIC =====

const charts = {};

function initModel() {
  if (charts.modelR2) charts.modelR2.destroy();
  charts.modelR2 = new Chart(document.getElementById('modelR2Chart'), {
    type: 'bar',
    data: {
      labels: PROPS.map((p, i) => PROP_META[i].name),
      datasets: [{
        label: 'R² Score',
        data:            PROPS.map(p => METRICS[p].r2),
        backgroundColor: PROPS.map((p, i) => COLORS[i] + '55'),
        borderColor:     PROPS.map((p, i) => COLORS[i]),
        borderWidth: 1,
        borderRadius: 2,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ` R² = ${ctx.raw.toFixed(4)} · MAE = ${METRICS[PROPS[ctx.dataIndex]].mae.toFixed(4)}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          min: 0.93, max: 1.0,
          grid: { color: '#1e2330' },
          ticks: { callback: v => v.toFixed(3) },
        },
      },
    },
  });
}

window.addEventListener('load', initModel);
