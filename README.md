# BAKAS — Carbon Footprint Estimator

BAKAS is a lightweight web app for estimating carbon emissions from:
- Daily electricity use (kWh/day)
- Daily transportation distance (with support for multiple transport entries)

It also estimates how many trees are needed to help offset your annual footprint.

## Features

- Estimate CO₂ emissions per day, week, month, and year
- Transportation options:
	- Car (gasoline or diesel)
	- Jeepney
	- Tricycle
	- Bus
	- Motorcycle
- Add multiple transportation entries in one calculation
- Distance unit support: kilometers and miles (miles are converted to km automatically)
- Tree offset estimates for:
	- Narra
	- Mahogany
	- Mango
- Dark mode with saved preference (`localStorage`)
- Responsive, mobile-friendly interface

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript

No build tools or external dependencies are required.

## Project Structure

```
BAKAS/
├─ index.html
├─ style.css
├─ script.js
├─ README.md
└─ images/
	 └─ favicon_io/
```

## How to Use

1. Enter electricity usage in **kWh per day** (optional).
2. Select your primary transportation type.
3. If transport is **Car**, choose fuel type.
4. Enter daily distance and unit (km or mi).
5. (Optional) Click **Add another transportation** to include more trips.
6. Click **ESTIMATE**.

The app shows:
- Estimated CO₂ emissions (day/week/month/year)
- Estimated number of trees needed to offset emissions

## Default Emission Factors

### Electricity

- `0.581 kg CO₂ / kWh`

### Transport

Values in `kg CO₂ / km`:
- Car (gasoline): `0.161`
- Car (diesel): `0.153`
- Jeepney: `0.150`
- Tricycle: `0.056`
- Bus: `1.045`
- Motorcycle: `0.07255`

### Tree Absorption

Values in `kg CO₂ / year`:
- Narra: `147`
- Mahogany: `15.24`
- Mango: `274`

## Notes

- Results are estimates and depend on the chosen factors.
- Values can be adjusted in `script.js` (`FACTORS` object) to match updated references.

## License

This project is for educational/school use.