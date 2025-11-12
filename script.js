document.getElementById("estimateBtn").addEventListener("click", async () => {
      const apiKey = "Bearer 0YMWY736TN6XDE50GJ7GV455HC"; // Replace with your real key
      const url = "https://api.climatiq.io/estimate";

      const energyRaw = document.getElementById("energy")?.value;
    const region = document.getElementById("region")?.value || "US"; // default if input missing
        const energy = parseFloat(energyRaw);

         if (isNaN(energy) || energy <= 0) {
      document.getElementById("output").textContent = "Error: enter a valid energy value (kWh).";
      return;
    }
    
      const data = {
       "emission_factor": {
		"activity_id": "electricity-supply_grid-source_supplier_mix",
		"source": "CT",
		"region": region,
		"year": 2019,
		"source_lca_activity": "electricity_generation",
		"data_version": "^27",
		"allowed_data_quality_flags": [
			"partial_factor"
		]
	},
	"parameters": {
		"energy": energy,
		"energy_unit": "kWh"
	}
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();

         document.getElementById("output").textContent = `
        Region: ${region}
        Electricity Used: ${energy} kWh
        Estimated Emissions: ${result.co2e.toFixed(2)} ${result.co2e_unit} CO₂e
        `;
      } catch (err) {
        document.getElementById("output").textContent = "Error: " + err.message;
      }
    });