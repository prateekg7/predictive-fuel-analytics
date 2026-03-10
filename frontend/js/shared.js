// ======== SHARED DATA & CONSTANTS ========

const METRICS = {
  BlendProperty1:  { mae: 0.0362, r2: 0.9979 },
  BlendProperty2:  { mae: 0.0373, r2: 0.9976 },
  BlendProperty3:  { mae: 0.0369, r2: 0.9975 },
  BlendProperty4:  { mae: 0.0392, r2: 0.9972 },
  BlendProperty5:  { mae: 0.0805, r2: 0.9464 },
  BlendProperty6:  { mae: 0.0352, r2: 0.9976 },
  BlendProperty7:  { mae: 0.0384, r2: 0.9974 },
  BlendProperty8:  { mae: 0.0548, r2: 0.9940 },
  BlendProperty9:  { mae: 0.0441, r2: 0.9965 },
  BlendProperty10: { mae: 0.0372, r2: 0.9978 },
};

const PROPS = Object.keys(METRICS);

const COLORS = [
  '#f5a623','#00d4ff','#4ade80','#ff4d6d','#c084fc',
  '#fb923c','#38bdf8','#a3e635','#f472b6','#fbbf24',
];

const PROP_META = [
  { key: 'BlendProperty1',  code: 'BP1',  name: 'Blend Property 1',  abbr: 'BP1',  unit: '(anon)', desc: 'Anonymous blend property — could represent viscosity, octane number, aromatics content, etc.',            color: COLORS[0] },
  { key: 'BlendProperty2',  code: 'BP2',  name: 'Blend Property 2',  abbr: 'BP2',  unit: '(anon)', desc: 'Anonymous blend property — could represent density, flash point, cetane number, etc.',                    color: COLORS[1] },
  { key: 'BlendProperty3',  code: 'BP3',  name: 'Blend Property 3',  abbr: 'BP3',  unit: '(anon)', desc: 'Anonymous blend property — could represent cloud point, distillation temp, lubricity, etc.',              color: COLORS[2] },
  { key: 'BlendProperty4',  code: 'BP4',  name: 'Blend Property 4',  abbr: 'BP4',  unit: '(anon)', desc: 'Anonymous blend property — could represent combustibility, energy content, RON/MON, etc.',                color: COLORS[3] },
  { key: 'BlendProperty5',  code: 'BP5',  name: 'Blend Property 5',  abbr: 'BP5',  unit: '(anon)', desc: 'Anonymous blend property — could represent volatility, boiling range, sulfur content, etc.',              color: COLORS[4] },
  { key: 'BlendProperty6',  code: 'BP6',  name: 'Blend Property 6',  abbr: 'BP6',  unit: '(anon)', desc: 'Anonymous blend property — could represent thermal stability, freeze point, water content, etc.',          color: COLORS[5] },
  { key: 'BlendProperty7',  code: 'BP7',  name: 'Blend Property 7',  abbr: 'BP7',  unit: '(anon)', desc: 'Anonymous blend property — could represent net heating value, specific gravity, etc.',                    color: COLORS[6] },
  { key: 'BlendProperty8',  code: 'BP8',  name: 'Blend Property 8',  abbr: 'BP8',  unit: '(anon)', desc: 'Anonymous blend property — could represent oxidation stability, smoke point, etc.',                       color: COLORS[7] },
  { key: 'BlendProperty9',  code: 'BP9',  name: 'Blend Property 9',  abbr: 'BP9',  unit: '(anon)', desc: 'Anonymous blend property — could represent T90 distillation, naphthalene content, etc.',                  color: COLORS[8] },
  { key: 'BlendProperty10', code: 'BP10', name: 'Blend Property 10', abbr: 'BP10', unit: '(anon)', desc: 'Anonymous blend property — could represent aromatic content, pour point, cold filter point, etc.',        color: COLORS[9] },
];

const COMP_NAMES = [
  { short: 'C1', full: 'Component 1', color: COLORS[0] },
  { short: 'C2', full: 'Component 2', color: COLORS[1] },
  { short: 'C3', full: 'Component 3', color: COLORS[2] },
  { short: 'C4', full: 'Component 4', color: COLORS[3] },
  { short: 'C5', full: 'Component 5', color: COLORS[4] },
];

// ======== CHART.JS DEFAULTS ========
if (typeof Chart !== 'undefined') {
  Chart.defaults.color = '#5a6075';
  Chart.defaults.borderColor = '#1e2330';
  Chart.defaults.font.family = "'Space Mono', monospace";
  Chart.defaults.font.size = 10;
}

// ======== SEEDED RNG ========
function seededRand(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ======== DATA GENERATION ========
function generateData() {
  const predicted = [];
  const actual = [];
  const n = 500;

  for (let i = 0; i < n; i++) {
    const pred = { ID: i + 1 };
    const act  = { ID: i + 1 };
    const rng  = seededRand(i * 31337);

    PROPS.forEach((p) => {
      let u1 = rng(), u2 = rng();
      let z  = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
      let val = z * 0.9;

      let u3 = rng(), u4 = rng();
      let noise = Math.sqrt(-2 * Math.log(Math.max(u3, 1e-10))) * Math.cos(2 * Math.PI * u4) * METRICS[p].mae * 1.2;

      pred[p] = Math.round(val * 1000) / 1000;
      act[p]  = Math.round((val + noise) * 1000) / 1000;
    });

    predicted.push(pred);
    actual.push(act);
  }
  return { predicted, actual };
}

const DATA = generateData();

// ======== SHARED HELPERS ========
function makePropSelector(containerId, activeProp, callback) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  PROPS.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.className = 'prop-btn' + (i === activeProp ? ' active' : '');
    btn.textContent = PROP_META[i].abbr;
    btn.title = PROP_META[i].name;
    btn.onclick = () => {
      container.querySelectorAll('.prop-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      callback(i);
    };
    container.appendChild(btn);
  });
}
