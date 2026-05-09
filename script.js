// ---- Defaults ----
const FACTORS = {
  electricity_kg_per_kwh: 0.581,
  transport: {
    car_gas: 0.161,
    car_diesel: 0.153,
    jeepney: 0.150,
    tricycle: 0.056,
    bus: 1.045,
    motorcycle: 0.07255
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
if (darkToggle) {
  const savedDark = localStorage.getItem('theme') === 'dark';
  darkToggle.checked = savedDark;
  if (savedDark) document.documentElement.setAttribute('data-theme','dark');

  darkToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.documentElement.setAttribute('data-theme','dark');
      localStorage.setItem('theme','dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('theme');
    }
  });
}
const estimateBtn = document.getElementById('estimateBtn');
const distanceInput = document.getElementById('distance');
const distanceUnit = document.getElementById('distanceUnit');

// NEW: controls for extra transports
const addAnotherBtn = document.getElementById('addAnotherBtn');
const moreTransports = document.getElementById('moreTransports');

// ---- State ----
let selectedTransport = null;
let selectedFuel = 'gasoline';

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

// Helper to create an additional transport entry (select + distance + unit + fuel if car)
function createTransportEntry() {
  const entry = document.createElement('div');
  entry.className = 'transport-entry card';
  entry.style.display = 'flex';
  entry.style.gap = '8px';
  entry.style.alignItems = 'center';
  entry.style.marginTop = '8px';

  entry.innerHTML = `
    <select class="input trans-type" style="width:180px">
      <option value="car">Car</option>
      <option value="jeepney">Jeepney</option>
      <option value="tricycle">Tricycle</option>
      <option value="bus">Bus</option>
      <option value="motorcycle">Motorcycle</option>
    </select>
    <input class="input trans-distance" type="number" min="0" step="0.1" placeholder="Distance" style="width:120px" required>
    <select class="select trans-unit" style="width:110px">
      <option value="km" selected>km</option>
      <option value="mi">mi</option>
    </select>
    <div class="trans-fuel" style="display:none;gap:6px">
      <button class="input fuel-btn fuel-gas" style="width:90px;cursor:pointer">Gasoline</button>
      <button class="input fuel-btn fuel-diesel" style="width:90px;cursor:pointer">Diesel</button>
    </div>
    <button class="input remove-entry" style="width:90px;cursor:pointer">Remove</button>
  `;

  // wire events for the created elements
  const typeSel = entry.querySelector('.trans-type');
  const distInput = entry.querySelector('.trans-distance');
  const unitSel = entry.querySelector('.trans-unit');
  const fuelDiv = entry.querySelector('.trans-fuel');
  const gasBtn = entry.querySelector('.fuel-gas');
  const dieselBtn = entry.querySelector('.fuel-diesel');
  const removeBtn = entry.querySelector('.remove-entry');
  let fuelChoice = 'gasoline';

  function updateFuelUI() {
    if (typeSel.value === 'car') {
      fuelDiv.style.display = 'flex';
      gasBtn.style.background = 'var(--primary)'; gasBtn.style.color = 'white';
      dieselBtn.style.background = 'transparent'; dieselBtn.style.color = 'var(--text)';
      fuelChoice = 'gasoline';
    } else {
      fuelDiv.style.display = 'none';
      fuelChoice = null;
    }
  }

  typeSel.addEventListener('change', updateFuelUI);
  gasBtn.addEventListener('click', ()=> {
    fuelChoice = 'gasoline';
    gasBtn.style.background = 'var(--primary)'; gasBtn.style.color = 'white';
    dieselBtn.style.background = 'transparent'; dieselBtn.style.color = 'var(--text)';
  });
  dieselBtn.addEventListener('click', ()=> {
    fuelChoice = 'diesel';
    dieselBtn.style.background = 'var(--primary)'; dieselBtn.style.color = 'white';
    gasBtn.style.background = 'transparent'; gasBtn.style.color = 'var(--text)';
  });

  removeBtn.addEventListener('click', ()=> {
    moreTransports.removeChild(entry);
  });

  // expose a small API for reading values
  entry.getData = function(){
    const type = typeSel.value;
    let dist = parseFloat(distInput.value) || 0;
    const unit = unitSel.value;
    if (unit === 'mi') dist *= 1.60934;
    const fuel = fuelChoice;
    return { type, dist, fuel };
  };

  updateFuelUI();
  return entry;
}

// Add another transport button handler
if (addAnotherBtn && moreTransports) {
  addAnotherBtn.addEventListener('click', ()=> {
    const e = createTransportEntry();
    moreTransports.appendChild(e);
    e.scrollIntoView({behavior:'smooth', block:'center'});
  });
}

// ---- Helper: Generate recommendations based on contributor ----
function generateRecommendations(mainContributor) {
  if (mainContributor === 'transportation') {
    return [
      'Carpool twice weekly',
      'Use public transport when possible',
      'Reduce unnecessary trips',
      'Combine errands into single trips'
    ];
  } else {
    return [
      'Switch to renewable energy sources',
      'Use LED lighting throughout home',
      'Improve insulation and reduce heating/cooling',
      'Use energy-efficient appliances'
    ];
  }
}

// ---- Helper: Select random tree ----
function getRandomTree() {
  const trees = [
    { name: 'Narra', factor: FACTORS.trees_kg_per_year.narra },
    { name: 'Mahogany', factor: FACTORS.trees_kg_per_year.mahogany },
    { name: 'Mango', factor: FACTORS.trees_kg_per_year.mango }
  ];
  return trees[Math.floor(Math.random() * trees.length)];
}

// ---- Helper: Determine eco level ----
function getEcoLevel(yearCO2) {
  if (yearCO2 < 2000) return 'Excellent';
  if (yearCO2 < 4000) return 'Good';
  if (yearCO2 < 7000) return 'Moderate Impact';
  if (yearCO2 < 10000) return 'High Impact';
  return 'Very High Impact';
}

// ---- Helper: Calculate potential savings ----
function calculatePotentialSavings(mainContributor, electricityEmission, transportEmission) {
  if (mainContributor === 'transportation') {
    // 30% reduction in transportation is realistic
    return transportEmission * 0.30 * 365;
  } else {
    // 25% reduction in electricity is realistic
    return electricityEmission * 0.25 * 365;
  }
}

// ---- Display insights ----
function displayInsights(electricityEmission, transportEmission, yearCO2) {
  const insightsContainer = document.getElementById('insightsContainer');
  const mainContributorEl = document.getElementById('mainContributor');
  const suggestionsListEl = document.getElementById('suggestionsList');
  const potentialSavingsEl = document.getElementById('potentialSavings');
  const offsetSuggestionEl = document.getElementById('offsetSuggestion');
  const ecoLevelEl = document.getElementById('ecoLevel');

  // Calculate percentages
  const totalDirect = electricityEmission + transportEmission;
  const elecPercent = totalDirect > 0 ? Math.round((electricityEmission / totalDirect) * 100) : 0;
  const transPercent = totalDirect > 0 ? Math.round((transportEmission / totalDirect) * 100) : 0;

  // Determine main contributor
  const mainContributor = electricityEmission > transportEmission ? 'electricity' : 'transportation';
  const mainPercent = mainContributor === 'electricity' ? elecPercent : transPercent;
  const mainLabel = mainContributor === 'electricity' ? 'Electricity' : 'Transportation';

  // Set main contributor
  mainContributorEl.textContent = `${mainLabel} (${mainPercent}%)`;

  // Generate and display recommendations
  const recommendations = generateRecommendations(mainContributor);
  suggestionsListEl.innerHTML = recommendations
    .map(rec => `<li>${rec}</li>`)
    .join('');

  // Calculate and display potential savings
  const potentialSavings = calculatePotentialSavings(mainContributor, electricityEmission, transportEmission);
  potentialSavingsEl.textContent = `Up to ${fmt(potentialSavings)} kg CO₂/year`;

  // Calculate and display tree offset
  const randomTree = getRandomTree();
  const treesNeeded = Math.ceil(yearCO2 / randomTree.factor);
  offsetSuggestionEl.textContent = `Plant approximately ${treesNeeded} ${randomTree.name.toLowerCase()} trees yearly`;

  // Set eco level
  ecoLevelEl.textContent = getEcoLevel(yearCO2);

  // Show insights
  insightsContainer.classList.remove('hidden');
}

// ---- Input validation ----
function validateInputs(){
  const errors = [];
  const kwhEl = document.getElementById('kwh');
  const kwh = kwhEl ? parseFloat(kwhEl.value) : NaN;


  const primaryDistRaw = parseFloat(distanceInput?.value || NaN);

  if (kwh < 0) errors.push('Enter a valid electricity consumption.');
  if (isNaN(primaryDistRaw) || primaryDistRaw < 0) errors.push('Enter a valid primary distance.');

  if (!selectedTransport) errors.push('Select a primary transport method.');

  if (selectedTransport === 'car' && !selectedFuel) errors.push('Select a fuel for the primary car.');

  // validate added entries individually
  Array.from(moreTransports?.children || []).forEach((entry, i) => {
    if (typeof entry.getData !== 'function') {
      errors.push(`Added entry ${i+1} is invalid.`);
      return;
    }
    const d = entry.getData();
    if (isNaN(d.dist) || d.dist <= 0) errors.push(`Entry ${i+1}: enter a valid distance.`);
    if (d.type === 'car' && !d.fuel) errors.push(`Entry ${i+1}: select fuel for car.`);
  });

  return errors;
}

// ---- Estimate button ----
if (estimateBtn) {
  estimateBtn.addEventListener('click', ()=> {
  const errors = validateInputs();
  if (errors.length){
    alert(errors.join('\n'));
    return;
  }

  const kwh = parseFloat(document.getElementById('kwh').value) || 0;
  let distance = parseFloat(distanceInput.value) || 0;

  // Convert miles → km if needed
  if(distanceUnit.value==='mi') distance *= 1.60934;

  // ---- Transport factor for primary selection ----
  let tf = 0;
  switch(selectedTransport){
    case 'car': tf = selectedFuel==='diesel'? FACTORS.transport.car_diesel : FACTORS.transport.car_gas; break;
    case 'jeepney': tf = FACTORS.transport.jeepney; break;
    case 'tricycle': tf = FACTORS.transport.tricycle; break;
    case 'bus': tf = FACTORS.transport.bus; break;
    case 'motorcycle': tf = FACTORS.transport.motorcycle; break;
    default: tf = 0;
  }

  // primary transport emission (uses global distance input)
  let transportEmissions = distance * tf;

  // sum emissions from added transport entries
  if (moreTransports) {
    Array.from(moreTransports.children).forEach(entry => {
      if (typeof entry.getData !== 'function') return;
      const d = entry.getData();
      let tfEntry = 0;
      if (d.type === 'car') {
        tfEntry = d.fuel === 'diesel' ? FACTORS.transport.car_diesel : FACTORS.transport.car_gas;
      } else if (FACTORS.transport[d.type] !== undefined) {
        tfEntry = FACTORS.transport[d.type];
      }
      transportEmissions += d.dist * tfEntry;
    });
  }

  // ---- Compute emissions ----
  const dailyCO2 = (kwh * FACTORS.electricity_kg_per_kwh) + transportEmissions;
  const weekCO2 = dailyCO2 * 7;
  const monthCO2 = dailyCO2 * 30;
  const yearCO2 = dailyCO2 * 365;

  // ---- Display emission summary ----
  document.getElementById('perDay').textContent = fmt(dailyCO2)+' kg CO₂';
  document.getElementById('perWeek').textContent = fmt(weekCO2)+' kg CO₂';
  document.getElementById('perMonth').textContent = fmt(monthCO2)+' kg CO₂';
  document.getElementById('perYear').textContent = fmt(yearCO2)+' kg CO₂';

  // ---- Calculate electricity and transportation emissions separately ----
  const electricityEmissionDaily = kwh * FACTORS.electricity_kg_per_kwh;
  const transportEmissionDaily = transportEmissions;

  // ---- Display offset insights ----
  displayInsights(electricityEmissionDaily, transportEmissionDaily, yearCO2);

  // ---- Make results section visible ----
  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) {
    resultsSection.classList.add('visible');
  }
 
  });
}