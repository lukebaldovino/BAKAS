const vehicleButtons = document.querySelectorAll('.vehicle-buttons button');
const carExpand = document.getElementById('carExpand');
const vehicleOptions = document.querySelectorAll('.vehicle-option');
const resultDiv = document.getElementById('result');
const periodSelect = document.getElementById('period');
const treeSelect = document.getElementById('treeType');
let selectedVehicle = '';
let selectedCarType = '';

// Vehicle type selection
vehicleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        vehicleButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedVehicle = btn.dataset.type;
        if (selectedVehicle === 'car') {
            carExpand.style.display = 'block';
        } else {
            carExpand.style.display = 'none';
            selectedCarType = '';
            vehicleOptions.forEach(opt => opt.classList.remove('selected'));
        }
    });
});

// Car category selection
vehicleOptions.forEach(option => {
    option.addEventListener('click', () => {
        vehicleOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedCarType = option.dataset.type;
    });
});

// Tree absorption rates (kg/day)
const treeAbsorb = { coconut: 0.37, acacia: 0.44, mango: 0.26 };
const periodFactor = { day:1, month:30, year:365 };

document.getElementById('calculateBtn').addEventListener('click', () => {
    const monthlyKwh = parseFloat(document.getElementById('kwh').value) || 0;
    const distance = parseFloat(document.getElementById('distance').value) || 0;
    const period = periodSelect.value;
    const treeType = treeSelect.value;

    if (!selectedVehicle) {
        resultDiv.innerHTML = "Please select a vehicle type.";
        return;
    }

    const dailyKwh = monthlyKwh / 30;
    let footprint = dailyKwh * 0.92;

    let transportFactor = 0;
    switch(selectedVehicle) {
        case 'car':
            if (!selectedCarType) { resultDiv.innerHTML = "Please select a car category."; return; }
            transportFactor = selectedCarType === 'car-luxury' ? 0.3 : 0.2; break;
        case 'jeepney': transportFactor = 0.15; break;
        case 'tricycle': transportFactor = 0.1; break;
        case 'bus': transportFactor = 0.25; break;
    }

    footprint += distance * transportFactor;

    const footprintPeriod = footprint * periodFactor[period];
    const treesNeeded = footprintPeriod / treeAbsorb[treeType];

    resultDiv.innerHTML = `
        ${footprintPeriod.toFixed(2)} kg CO₂<br>
        Approx. ${treesNeeded.toFixed(0)} fully grown ${treeType} tree(s) needed
    `;
});