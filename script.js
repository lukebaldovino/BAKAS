// ---- Defaults ----
const FACTORS = {
  electricity_kg_per_kwh: 0.581,
  transport: {
    car_gas: 0.161,
    car_diesel: 0.153,
    jeepney: 0.150,
    tricycle: 0.056,
    bus: 1.045,
    motorcycle: 0.103
  },
  trees_kg_per_year: {
    narra: 147,
    mahogany: 15.24,
    mango: 274
  }
};

// ---- Format numbers ----
function fmt(n){
  return (Math.round(n*100)/100).toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:2});
}

// ---- UI elements ----
const transportBtns = document.querySelectorAll('.transport-btn');
const carFuel = document.getElementById('carFuel');
const fuelGas = document.getElementById('fuelGas');
const fuelDiesel = document.getElementById('fuelDiesel');
const darkToggle = document.getElementById('darkToggle');
const estimateBtn = document.getElementById('estimateBtn');
const distanceInput = document.getElementById('distance');
const distanceUnit = document.getElementById('distanceUnit');

// ---- State ----
let selectedTransport = null;
let selectedFuel = 'gasoline';

// ---- Dark mode ----
darkToggle.addEventListener('change', (e)=>{
  if(e.target.checked){
    document.documentElement.setAttribute('data-theme','dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
});

// ---- Update placeholder ----
distanceUnit.addEventListener('change', ()=>{
  distanceInput.placeholder = distanceUnit.value === 'km' ? 'Enter distance in km' : 'Enter distance in miles';
});

// ---- Transport selection ----
transportBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    transportBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    selectedTransport = btn.dataset.type;

    if(selectedTransport==='car'){
      carFuel.classList.remove('hidden');
      fuelGas.style.background = 'var(--primary)'; fuelGas.style.color='white';
      fuelDiesel.style.background = 'transparent'; fuelDiesel.style.color='var(--text)';
      selectedFuel = 'gasoline';
    } else {
      carFuel.classList.add('hidden');
      selectedFuel = null;
    }
  });
});

// ---- Fuel selection ----
fuelGas.addEventListener('click', ()=>{
  selectedFuel = 'gasoline';
  fuelGas.style.background = 'var(--primary)'; fuelGas.style.color='white';
  fuelDiesel.style.background = 'transparent'; fuelDiesel.style.color='var(--text)';
});
fuelDiesel.addEventListener('click', ()=>{
  selectedFuel = 'diesel';
  fuelDiesel.style.background = 'var(--primary)'; fuelDiesel.style.color='white';
  fuelGas.style.background = 'transparent'; fuelGas.style.color='var(--text)';
});

// ---- Helper: day of year ----
Date.prototype.getDayOfYear = function(){
  const start = new Date(this.getFullYear(),0,0);
  const diff = this - start + ((start.getTimezoneOffset() - this.getTimezoneOffset())*60*1000);
  return Math.floor(diff / (1000*60*60*24));
}

// ---- Helper: trees needed to offset total emission ----
function treesForEmission(totalEmissionKg, treeKgPerYear){
  if(treeKgPerYear <= 0) return '—';
  return Math.ceil(totalEmissionKg / treeKgPerYear);
}

// ---- Helper: trees needed to offset per period ----
function treesForEmissionPeriod(totalEmissionKg, treeKgPerYear, periodDays){
  return Math.ceil(totalEmissionKg / (treeKgPerYear * (periodDays / 365)));
}

// ---- Estimate button ----
estimateBtn.addEventListener('click', ()=> {
  const kwh = parseFloat(document.getElementById('kwh').value) || 0;
  let distance = parseFloat(distanceInput.value) || 0;

  // Convert miles → km if needed
  if(distanceUnit.value==='mi') distance *= 1.60934;

  if(!selectedTransport){
    alert('Please choose a transportation type.');
    return;
  }
  if(kwh <= 0 && distance <= 0){
    alert('Please enter electricity usage or daily distance.');
    return;
  }

  // ---- Transport factor ----
  let tf = 0;
  switch(selectedTransport){
    case 'car': tf = selectedFuel==='diesel'? FACTORS.transport.car_diesel : FACTORS.transport.car_gas; break;
    case 'jeepney': tf = FACTORS.transport.jeepney; break;
    case 'tricycle': tf = FACTORS.transport.tricycle; break;
    case 'bus': tf = FACTORS.transport.bus; break;
    case 'motorcycle': tf = FACTORS.transport.motorcycle; break;
    default: tf = 0;
  }

  // ---- Compute emissions ----
  const dailyCO2 = (kwh * FACTORS.electricity_kg_per_kwh) + (distance * tf);
  const weekCO2 = dailyCO2 * 7;
  const monthCO2 = dailyCO2 * 30;
  const yearCO2 = dailyCO2 * 365;

  // ---- Display emission summary ----
  document.getElementById('perDay').textContent = fmt(dailyCO2)+' kg CO₂';
  document.getElementById('perWeek').textContent = fmt(weekCO2)+' kg CO₂';
  document.getElementById('perMonth').textContent = fmt(monthCO2)+' kg CO₂';
  document.getElementById('perYear').textContent = fmt(yearCO2)+' kg CO₂';

  // ---- Total emission this year ----
  const today = new Date();
  const dayOfYear = today.getDayOfYear();
  const totalEmissionThisYear = dailyCO2 * dayOfYear;
  document.getElementById('todayText').textContent =
    `As of today (${today.toLocaleDateString()}), your total carbon emission this year is: ${fmt(totalEmissionThisYear)} kg CO₂`;

  // ---- Trees note ----
  document.getElementById('treesNote').textContent =
    "The following tree estimates are based on your total carbon emissions so far this year.";

  // ---- Trees needed to offset total emission this year ----
  document.getElementById('narraDay').textContent   =
    'With ' + treesForEmissionPeriod(yearCO2, FACTORS.trees_kg_per_year.narra, 1) + ' Trees';
  document.getElementById('narraWeek').textContent  =
    'With ' + treesForEmissionPeriod(yearCO2, FACTORS.trees_kg_per_year.narra, 7) + ' Trees';
  document.getElementById('narraMonth').textContent =
    'With ' + treesForEmissionPeriod(yearCO2, FACTORS.trees_kg_per_year.narra, 30) + ' Trees';
  document.getElementById('narraYear').textContent  =
    'With ' + treesForEmission(yearCO2, FACTORS.trees_kg_per_year.narra) + ' Trees';

  document.getElementById('mahDay').textContent   =
    'With ' + treesForEmissionPeriod(yearCO2, FACTORS.trees_kg_per_year.mahogany, 1) + ' Trees';
  document.getElementById('mahWeek').textContent  =
    'With ' + treesForEmissionPeriod(yearCO2, FACTORS.trees_kg_per_year.mahogany, 7) + ' Trees';
  document.getElementById('mahMonth').textContent =
    'With ' + treesForEmissionPeriod(yearCO2, FACTORS.trees_kg_per_year.mahogany, 30) + ' Trees';
  document.getElementById('mahYear').textContent  =
    'With ' + treesForEmission(yearCO2, FACTORS.trees_kg_per_year.mahogany) + ' Trees';

  document.getElementById('mangoDay').textContent   =
    'With ' + treesForEmissionPeriod(yearCO2, FACTORS.trees_kg_per_year.mango, 1) + ' Trees';
  document.getElementById('mangoWeek').textContent  =
    'With ' + treesForEmissionPeriod(yearCO2, FACTORS.trees_kg_per_year.mango, 7) + ' Trees';
  document.getElementById('mangoMonth').textContent =
    'With ' + treesForEmissionPeriod(yearCO2, FACTORS.trees_kg_per_year.mango, 30) + ' Trees';
  document.getElementById('mangoYear').textContent  =
    'With ' + treesForEmission(yearCO2, FACTORS.trees_kg_per_year.mango) + ' Trees';

  // ---- Show results ----
  document.getElementById('resultsSection').classList.add('visible');
  document.getElementById('resultsSection').scrollIntoView({behavior:'smooth', block:'start'});
});