// --- 1. CONFIGURATION & WEIGHTS ---
const WEIGHTS = {
    gpi: 0.13,
    gti: 0.22,
    diplomacy: 0.02,
    aqi: 0.01
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
        // Apply 1.2x penalty to homicide rate
        const penalizedHom = raw.homicide_rate * 1.7;
        homicideScore = Math.max(0, ((50 - penalizedHom) / 50) * 100);
        femicideScore = 0; 
        
        // Reallocate weights
        finalHomicideWeight = 0.62;
        finalFemicideWeight = 0;
        penaltyApplied = true;
    } else {
        homicideScore = Math.max(0, ((50 - raw.homicide_rate) / 50) * 100);
        femicideScore = Math.max(0, ((20 - raw.femicide_rate) / 20) * 100);
        
        finalHomicideWeight = 0.25;
        finalFemicideWeight = 0.37;
    }

    // Final Base Calculation
    let totalScore = 
        (gpiScore * WEIGHTS.gpi) +
        (gtiScore * WEIGHTS.gti) +
        (diplomacyScore * WEIGHTS.diplomacy) +
        (aqiScore * WEIGHTS.aqi) +
        (homicideScore * finalHomicideWeight) +
        (femicideScore * finalFemicideWeight) - ((raw.rape_rate)/35 *2.5);

    // --- NEW: Isolation / Diplomacy Penalty ---
    let isolationPenaltyText = '';
    
    if (raw.passport_vfs < 33) {
        totalScore -= 60;
        isolationPenaltyText = '*Extreme inaccessibility penalty applied (-60)';
    } else if (raw.passport_vfs < 50) {
        totalScore -= 10;
        isolationPenaltyText = '*High inaccesibility penalty applied (-10)';
    } else if (raw.passport_vfs < 55) {
        totalScore -= 5;
        isolationPenaltyText = '*Moderate inaccesibility penalty applied (-5)';
    }

    // Ensure the score doesn't drop below 0 to keep the UI clean
    totalScore = Math.max(0, totalScore);

    return {
        score: totalScore.toFixed(2),
        penaltyApplied: penaltyApplied, // The femicide flag
        isolationPenaltyText: isolationPenaltyText // The new diplomacy flag
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

// --- 4. ACCORDION TOGGLE ---
function toggleDetails(element) {
    // Finds the next sibling element (the details div) and toggles the 'show' class
    const detailsDiv = element.nextElementSibling;
    detailsDiv.classList.toggle('show');
}

// --- 5. RENDER TO DOM ---
function renderList(rankedCountries) {
    const container = document.getElementById('results-container');
    document.getElementById('loading').style.display = 'none';
    
    let html = '';
    
    rankedCountries.forEach((c, index) => {
        // Penalty flags
        const femicideText = c.penaltyApplied ? `<br><span class="penalty-flag">*Femicide data missing, homicide penalty applied (1.7x)</span>` : '';
        const isolationText = c.isolationPenaltyText ? `<br><span class="penalty-flag">${c.isolationPenaltyText}</span>` : '';
        
        // Status Indicator Logic
        let statusText = '';
        let statusClass = '';
        
        if (c.final_score >= 85) {
            statusText = '(Highly Recommended)';
            statusClass = 'status-highly-recommended';
        } else if (c.final_score >= 70) {
            statusText = '(Okay to Visit)';
            statusClass = 'status-okay';
        } else if (c.final_score >= 50) {
            statusText = '(Avoid Visiting)';
            statusClass = 'status-avoid';
        } else {
            statusText = '(DO NOT VISIT)';
            statusClass = 'status-danger';
        }
        
        html += `
            <div class="country-card">
                <div>
                    <h2>#${index + 1} ${c.country} <span class="${statusClass}" style="font-size: 1rem; margin-left: 10px;">${statusText}</span></h2>
                    <div class="details">
                        General Risk (Higher is Worse): ${c.scores_raw.gpi} | Geopolitical Situation Risk (Higher is Worse): ${c.scores_raw.gti} | Diplomacy Score (Higher is better): ${c.scores_raw.passport_vfs} | Homicides per 100K (Higher is worse): ${c.scores_raw.homicide_rate}  | Sexual Crime Risk (Higher is worse) (Global Average is 40): ${c.scores_raw.rape_rate} 
                        ${femicideText}
                        ${isolationText}
                    </div>
                </div>
                <div class="score">${c.final_score}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// --- 6. INITIALIZATION ---
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
                penaltyApplied: calc.penaltyApplied,
                isolationPenaltyText: calc.isolationPenaltyText // <-- FIXED: Added missing variable pass-through
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