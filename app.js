let allCountriesData = []; // Holds the master dataset for searching

// --- 1. CONFIGURATION & WEIGHTS ---
const WEIGHTS = {
    gpi: 0.13,
    gti: 0.22,
    diplomacy: 0.02,
    aqi: 0.01
};

// ISO Codes for recognized microstates (< 1000 sq km or population < 100k)
const MICROSTATES = ['VA', 'MC', 'NR', 'TV', 'SM', 'LI', 'MH', 'KN', 'MV', 'MT', 'AD', 'PW', 'FM', 'VC', 'BB', 'AG', 'SC' ,'BN','SG'];

// NATO members + Austria, Switzerland, Ireland
const EUROCENTRIC_NATIONS = [
    'AL', 'BE', 'BG', 'CA', 'HR', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 
    'HU', 'IS', 'IT', 'LV', 'LT', 'LU', 'ME', 'MK', 'NL', 'NO', 'PL', 'PT', 
    'RO', 'SK', 'SI', 'ES', 'SE', 'TR', 'GB', 'US', 'AT', 'CH', 'IE','VA',
    'MC','SM', 'LI','MH','KN','MT','AD','VC','BB','AG'
];

// --- 2. THE MATH ENGINE ---
function calculateFinalScore(country, liveAqi, advisoryData) {
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
        const penalizedHom = raw.homicide_rate * 1.7;
        homicideScore = Math.max(0, ((50 - penalizedHom) / 50) * 100);
        femicideScore = 0; 
        
        finalHomicideWeight = 0.62;
        finalFemicideWeight = 0;
        penaltyApplied = true;
    } else {
        homicideScore = Math.max(0, ((50 - raw.homicide_rate) / 50) * 100);
        femicideScore = Math.max(0, ((20 - raw.femicide_rate) / 20) * 100);
        
        finalHomicideWeight = 0.25;
        finalFemicideWeight = 0.37;
    }
    // --- NEW: Economic Metrics (With Fallbacks for Null Data) ---
    
    // Default to neutral 5/10 if data is missing so we don't unfairly penalize the total score
    let gdpScore = 5.00; 
    let displayGdp = "Data Missing";
    
    if (raw.gdp !== null && raw.gdp !== undefined) {
        // Logarithmic scale: GDP spans from $60M (Tuvalu) to $27T (US)
        const logGdp = Math.log10(raw.gdp);
        gdpScore = ((logGdp - 7.5) / (13.5 - 7.5)) * 10;
        gdpScore = Math.max(0, Math.min(10, gdpScore)); // Clamp strictly between 0 and 10
        displayGdp = `$${(raw.gdp / 1000000000).toFixed(2)} Billion`; 
    }

    // Default to neutral 2.5/5 if data is missing
    let cpiScore = 2.50; 
    let displayCpi = "Data Missing";
    
    if (raw.cpi !== null && raw.cpi !== undefined) {
        // Assuming a Cost of Living Index where ~120 is highly expensive and ~30 is dirt cheap
        cpiScore = ((120 - raw.cpi) / (120 - 30)) * 5;
        cpiScore = Math.max(0, Math.min(5, cpiScore)); // Clamp strictly between 0 and 5
        displayCpi = raw.cpi;
    }

    // Final Base Calculation
    let totalScore = 
        (gpiScore * WEIGHTS.gpi) +
        (gtiScore * WEIGHTS.gti) +
        (diplomacyScore * WEIGHTS.diplomacy) +
        (aqiScore * WEIGHTS.aqi) +
        (homicideScore * finalHomicideWeight) +
        (femicideScore * finalFemicideWeight) - ((raw.rape_rate)/35 * 2.5) +
        gdpScore + cpiScore;

    // Isolation / Diplomacy Penalty
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

    // --- NEW: Microstate Penalty ---
    let microstatePenaltyText = '';
    if (MICROSTATES.includes(country.iso_code)) {
        totalScore -= 2.77;
        microstatePenaltyText = '*Microstate score penalty applied (-2.77)';
    }

    // --- NEW: Eurocentric Reporting Adjustment ---
    let eurocentricPenaltyText = '';
    if (EUROCENTRIC_NATIONS.includes(country.iso_code)) {
        const deduction = totalScore * 0.05;
        totalScore -= deduction;
        eurocentricPenaltyText = `*Eurocentric reporting adjustment applied (-5%)`;
    }

    // Smartraveller API Penalty
    let advisoryLevel = null;
    let advisoryWarning = null;

    if (advisoryData) {
        if (advisoryData.level >= 4) {
            totalScore -= 50; 
            advisoryLevel = advisoryData.level;
            advisoryWarning = advisoryData.advice;
        } else if (advisoryData.level === 3) {
            totalScore -= 10; 
            advisoryLevel = advisoryData.level;
            advisoryWarning = advisoryData.advice;
        }
    }

    totalScore = Math.max(0, totalScore);

    return {
        score: totalScore, 
        penaltyApplied: penaltyApplied,
        isolationPenaltyText: isolationPenaltyText,
        microstatePenaltyText: microstatePenaltyText,
        eurocentricPenaltyText: eurocentricPenaltyText,
        advisoryLevel: advisoryLevel,
        advisoryWarning: advisoryWarning,
        displayGdp: displayGdp,
        gdpScore: gdpScore,
        displayCpi: displayCpi,
        cpiScore: cpiScore
    };
}

// --- 3. DATA FETCHING ---
async function fetchStaticData() {
    const response = await fetch('./countries_safety_data.json');
    return await response.json();
}

async function fetchLiveAQI(isoCode) {
    let hash = 0;
    for (let i = 0; i < isoCode.length; i++) {
        hash = isoCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    const mockAqi = Math.abs(hash % 80) + 15;
    return mockAqi;
}

// --- 4. RENDER TO DOM ---
function renderList(rankedCountries) {
    const container = document.getElementById('results-container');
    document.getElementById('loading').style.display = 'none';
    
    let html = '';
    
    rankedCountries.forEach((c) => {
        const femicideText = c.penaltyApplied ? `<br><span class="penalty-flag">*Femicide data missing, homicide penalty applied (1.7x)</span>` : '';
        const isolationText = c.isolationPenaltyText ? `<br><span class="penalty-flag">${c.isolationPenaltyText}</span>` : '';
        const microText = c.microstatePenaltyText ? `<br><span class="penalty-flag">${c.microstatePenaltyText}</span>` : '';
        const euroText = c.eurocentricPenaltyText ? `<br><span class="penalty-flag">${c.eurocentricPenaltyText}</span>` : '';
        
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

        if (c.country === 'Palestine') {
            statusText += ' #FreePalestine';
        }
        
        let advisoryToast = '';
        if (c.advisoryLevel && c.advisoryLevel >= 3) {
            const toastClass = c.advisoryLevel >= 4 ? 'advisory-level-4' : 'advisory-level-3';
            const toastBody = `<span class="advisory-toast ${toastClass}">⚠️ Level ${c.advisoryLevel}: ${c.advisoryWarning}</span>`;
            
            if (c.advisoryPageUrl) {
                advisoryToast = `<a href="${c.advisoryPageUrl}" target="_blank" style="text-decoration: none;" onclick="event.stopPropagation();">${toastBody}</a>`;
            } else {
                advisoryToast = toastBody;
            }
        }

        // Apply .toFixed(2) exclusively on rendering
        const displayScore = c.final_score.toFixed(2);

        html += `
            <div class="country-card">
                <div class="card-header">
                    <h2 style="margin: 0;">
                        <span class="rank-number">#${c.original_rank}</span> 
                        <span class="country-name">${c.country}</span> 
                        <span class="status-indicator ${statusClass}">${statusText}</span>
                        ${advisoryToast}
                    </h2>
                    <div class="score">${displayScore}</div>
                </div>
                <div class="details">
                    <div class="stats-grid">
                        <div class="stat-box">
                            <span class="stat-label">General Risk (Higher is Worse)</span>
                            <span class="stat-value">${c.scores_raw.gpi}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Geopolitical Situation Risk (Higher is Worse)</span>
                            <span class="stat-value">${c.scores_raw.gti}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Diplomacy Score (Higher is better)</span>
                            <span class="stat-value">${c.scores_raw.passport_vfs}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Homicides per 100K (Higher is worse)</span>
                            <span class="stat-value">${c.scores_raw.homicide_rate}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Sexual Crime Risk (Higher is worse) (Global Average is 40)</span>
                            <span class="stat-value">${c.scores_raw.rape_rate}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">GDP (Logarithmic 0-10)</span>
                            <span class="stat-value">${c.displayGdp !== 'Data Missing' ? `${c.displayGdp} (+${c.gdpScore.toFixed(2)})` : 'Data Unavailable'}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Cost of Living (0-5, 5 is cheaper)</span>
                            <span class="stat-value">${c.displayCpi !== 'Data Missing' ? `${c.displayCpi} (+${c.cpiScore.toFixed(2)})` : 'Data Unavailable'}</span>
                        </div>
                    </div>
                    <!-- Penalties sit cleanly below the grid -->
                    <div style="margin-top: 10px;">
                        ${femicideText}
                        ${isolationText}
                        ${microText}
                        ${euroText}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;

    const headers = document.querySelectorAll('.card-header');
    headers.forEach(header => {
        header.addEventListener('click', function() {
            const detailsDiv = this.nextElementSibling;
            detailsDiv.classList.toggle('show');
        });
    });
}

// --- 5. INITIALIZATION ---
async function init() {
    try {
        const staticData = await fetchStaticData();
        
        let advisories = {};
        try {
            const advResponse = await fetch('https://smartraveller.kevle.xyz/api/advisories');
            if (advResponse.ok) {
                const advData = await advResponse.json();
                if (advData && advData.advisories) {
                    advData.advisories.forEach(item => {
                        if (item.country && item.country.alpha2) {
                            advisories[item.country.alpha2] = item;
                        }
                    });
                }
            }
        } catch (e) {
            console.warn("Smartraveller API unavailable. Continuing without live warnings.");
        }

        const processedData = [];

        // Process each country
        for (const country of staticData) {
            const liveAqi = await fetchLiveAQI(country.iso_code);
            const countryAdvisory = advisories[country.iso_code]; 
            
            const calc = calculateFinalScore(country, liveAqi, countryAdvisory);
            
            processedData.push({
                ...country,
                final_score: calc.score,
                penaltyApplied: calc.penaltyApplied,
                isolationPenaltyText: calc.isolationPenaltyText,
                microstatePenaltyText: calc.microstatePenaltyText,
                advisoryLevel: calc.advisoryLevel,
                advisoryWarning: calc.advisoryWarning,
                advisoryPageUrl: countryAdvisory ? countryAdvisory.pageUrl : null,
                displayGdp: calc.displayGdp,
                gdpScore: calc.gdpScore,
                displayCpi: calc.displayCpi,
                cpiScore: calc.cpiScore
            });
        }

        // Sort Highest to Lowest
        processedData.sort((a, b) => b.final_score - a.final_score);

        // Stamp the true rank
        processedData.forEach((c, i) => {
            c.original_rank = i + 1;
        });

        allCountriesData = processedData;

        renderList(allCountriesData);

        const searchInput = document.getElementById('searchInput');
        searchInput.style.display = 'block';
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredData = allCountriesData.filter(c => 
                c.country.toLowerCase().includes(searchTerm)
            );
            renderList(filteredData);
        });

    } catch (error) {
        console.error("Failed to load data:", error);
        document.getElementById('loading').innerText = "Error loading data.";
    }
}

init();