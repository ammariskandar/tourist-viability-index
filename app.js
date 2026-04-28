// --- 1. CONFIGURATION & WEIGHTS ---
const WEIGHTS = {
    gpi: 0.20,
    gti: 0.40,
    diplomacy: 0.03,
    aqi: 0.02
    // Homicide & Femicide handled dynamically based on data availability
};

// --- 2. THE MATH ENGINE ---
function calculateFinalScore(country, liveAqi) {
    const raw = country.scores_raw;
    
    // Normalizations
    const gpiScore = ((5 - raw.gpi) / 4) * 100;
    const gtiScore = ((10 - raw.gti) / 10) * 100;
    const diplomacyScore = (raw.passport_vfs / 195) * 100;
    const aqiScore = Math.max(0, ((500 - liveAqi) / 500) * 100);

    let homicideScore, femicideScore;
    let finalHomicideWeight, finalFemicideWeight;
    let penaltyApplied = false;

    // Femicide fallback logic
    if (raw.femicide_rate === null) {
        // Apply 1.05x penalty to homicide rate
        const penalizedHom = raw.homicide_rate * 1.08;
        homicideScore = Math.max(0, ((50 - penalizedHom) / 50) * 100);
        femicideScore = 0; 
        
        // Reallocate weights
        finalHomicideWeight = 0.35;
        finalFemicideWeight = 0;
        penaltyApplied = true;
    } else {
        homicideScore = Math.max(0, ((50 - raw.homicide_rate) / 50) * 100);
        femicideScore = Math.max(0, ((20 - raw.femicide_rate) / 20) * 100);
        
        finalHomicideWeight = 0.15;
        finalFemicideWeight = 0.2;
    }

    // Final Calculation
    const totalScore = 
        (gpiScore * WEIGHTS.gpi) +
        (gtiScore * WEIGHTS.gti) +
        (diplomacyScore * WEIGHTS.diplomacy) +
        (aqiScore * WEIGHTS.aqi) +
        (homicideScore * finalHomicideWeight) +
        (femicideScore * finalFemicideWeight);

    return {
        score: totalScore.toFixed(2),
        penaltyApplied: penaltyApplied
    };
}

// --- 3. DATA FETCHING ---
async function fetchStaticData() {
    // Fetch the actual JSON file
    const response = await fetch('./countries_safety_data.json');
    return await response.json();
}

async function fetchLiveAQI(isoCode) {
    // Deterministic mock generator: creates a stable AQI (15-95) based on the ISO string
    let hash = 0;
    for (let i = 0; i < isoCode.length; i++) {
        hash = isoCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Convert the hash to an absolute number between 15 and 95
    const mockAqi = Math.abs(hash % 80) + 15;
    return mockAqi;
}

// --- 4. RENDER TO DOM ---
function renderList(rankedCountries) {
    const container = document.getElementById('results-container');
    document.getElementById('loading').style.display = 'none';
    
    let html = '';
    
    rankedCountries.forEach((c, index) => {
        // Penalty flag logic
        const penaltyText = c.penaltyApplied ? `<br><span class="penalty-flag">*Femicide data missing, homicide penalty applied</span>` : '';
        
        // --- NEW: Status Indicator Logic ---
        let statusText = '';
        let statusClass = '';
        
        if (c.final_score >= 80) {
            statusText = '(Highly Recommended)';
            statusClass = 'status-highly-recommended';
        } else if (c.final_score >= 70) {
            statusText = '(Okay to Visit)';
            statusClass = 'status-okay';
        } else if (c.final_score >= 60) {
            statusText = '(Avoid Visiting)';
            statusClass = 'status-avoid';
        } else {
            statusText = '(High Risk)';
            statusClass = 'status-danger';
        }
        // -----------------------------------

        html += `
            <div class="country-card">
                <div>
                    <h2>#${index + 1} ${c.country} <span class="${statusClass}" style="font-size: 1rem; margin-left: 10px;">${statusText}</span></h2>
                    <div class="details">
                        GPI: ${c.scores_raw.gpi} | GTI: ${c.scores_raw.gti} | Diplomacy Score: ${c.scores_raw.passport_vfs} | Homicides per 100K: ${c.scores_raw.homicide_rate}
                        ${penaltyText}
                    </div>
                </div>
                <div class="score">${c.final_score}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// --- 5. INITIALIZATION ---
async function init() {
    try {
        const staticData = await fetchStaticData();
        const processedData = [];

        // Process each country
        for (const country of staticData) {
            const liveAqi = await fetchLiveAQI(country.iso_code);
            const calc = calculateFinalScore(country, liveAqi);
            
            processedData.push({
                ...country,
                final_score: parseFloat(calc.score),
                penaltyApplied: calc.penaltyApplied
            });
        }

        // Sort Highest to Lowest
        processedData.sort((a, b) => b.final_score - a.final_score);

        renderList(processedData);

    } catch (error) {
        console.error("Failed to load data:", error);
        document.getElementById('loading').innerText = "Error loading data.";
    }
}

// Boot the app
init();