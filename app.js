let allCountriesData = [];
let rawCountriesData = [];

const WEIGHTS = {
    gpi: 0.13,
    gti: 0.22,
    diplomacy: 0.02,
    aqi: 0.01
};

const MICROSTATES = ['VA', 'MC', 'NR', 'TV', 'SM', 'LI', 'MH', 'KN', 'MV', 'MT', 'AD', 'PW', 'FM', 'VC', 'BB', 'AG', 'SC' ,'BN','SG'];

const EUROCENTRIC_NATIONS = [
    'AL', 'BE', 'BG', 'CA', 'HR', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 
    'HU', 'IS', 'IT', 'LV', 'LT', 'LU', 'ME', 'MK', 'NL', 'NO', 'PL', 'PT', 
    'RO', 'SK', 'SI', 'ES', 'SE', 'TR', 'GB', 'US', 'AT', 'CH', 'IE','VA',
    'MC','SM', 'LI','MH','KN','MT','AD','VC','BB','AG'
];

const UNESCO_TOP_15 = ['IT', 'CN', 'DE', 'ES', 'FR', 'IN', 'MX', 'GB', 'RU', 'IR', 'US','JP','BR','CA','TR'];
const UNESCO_MIN_6 = ['IT', 'CN', 'DE', 'FR', 'ES', 'IN', 'MX', 'GB', 'RU', 'IR', 'US', 'JP', 'BR', 'CA', 'TR', 'AU', 'GR', 'PL', 'CZ', 'PT', 'KR', 'BE', 'SE', 'PE', 'NL', 'CH', 'ET', 'ZA', 'AR', 'AT', 'RO', 'DK', 'ID', 'BG', 'HR', 'CO', 'MA', 'TN', 'CU', 'IL', 'VN', 'TH', 'KE', 'UA', 'SA', 'LK', 'HU', 'SK', 'EG', 'TZ', 'DZ', 'UZ', 'CL', 'SN', 'BO', 'JO', 'FI', 'PK', 'PH', 'IQ', 'SY', 'KZ', 'LB', 'MN'];

const NATURE_TOP_8 = ['GR', 'IT', 'CH', 'ES', 'NZ', 'TH', 'No', 'IS',];

const MUSLIM_MAJORITY = ['MV', 'MR', 'IR', 'SO', 'AF', 'DJ', 'EH', 'DZ', 'MA', 'KM', 'NE', 'TJ', 'TN', 'PS', 'AZ', 'JO', 'SN', 'YE', 'LY', 'YT', 'PK', 'GM', 'ML', 'SA', 'SD', 'IQ', 'TM', 'XK', 'TR', 'BD', 'EG', 'GN', 'UZ', 'ID', 'SY', 'OM', 'BN', 'KG', 'SL', 'QA', 'KW', 'BH', 'AE', 'KZ', 'LB', 'BF', 'MY', 'TD', 'ER', 'AL', 'BA'];
const MUSLIM_FRIENDLY = ['NG', 'ET', 'TZ', 'RU', 'CN', 'CD', 'CI', 'CM', 'GH', 'MZ', 'TH', 'DE','AU','NZ','TW','SG','JP'];
const MUSLIM_HOSTILE = ['FR', 'IN', 'US', 'IL', 'GB'];

const HOLY_SITE_MUSLIM = ['SA'];
const HOLY_SITE_ABRAHAMIC = ['IL', 'PS'];
const HOLY_SITE_CATHOLIC = ['IT', 'VA'];
const HOLY_SITE_ORTHODOX = ['RU', 'GR'];

const OVERTOURISM_NATIONS = ['ES', 'IT', 'GR', 'NL', 'FR', 'JP', 'TH', 'VA', 'MA'];

const CENSORSHIP_ABSOLUTE = ['KP', 'TM'];
const CENSORSHIP_HIGH = ['ER', 'CN', 'IR', 'CU', 'BY'];

const IATA_TOP_20 = ['US', 'GB', 'CN', 'DE', 'JP', 'ES', 'IT', 'AE', 'FR', 'IN', 'TH', 'KR', 'TR', 'CA', 'SG', 'MX', 'HK', 'SA', 'TW', 'MY'];
const IATA_21_80 = ['VN', 'AU', 'ID', 'NL', 'CH', 'QA', 'PT', 'GR', 'PH', 'EG', 'IE', 'PL', 'RU', 'AT', 'DK', 'BR', 'PK', 'BE', 'MA', 'SE', 'DO', 'NO', 'CO', 'KW', 'FI', 'RO', 'IL', 'CZ', 'HU', 'NZ', 'PA', 'BD', 'AR', 'ZA', 'ET', 'CY', 'BH', 'OM', 'LK', 'DZ', 'IR', 'JO', 'HR', 'PE', 'RS', 'KH', 'CL', 'CR', 'UZ', 'TN', 'LB', 'KZ', 'MO', 'IQ', 'MV', 'JM', 'IS', 'NP', 'KE', 'BG'];
const IATA_81_100 = ['MT', 'SV', 'AZ', 'GE', 'AL', 'BS', 'NG', 'EC', 'CU', 'GT', 'LV', 'MU', 'LU', 'MD', 'TZ', 'LT', 'AW', 'LA', 'MM', 'AM'];

const MICHELIN_TOP_10 = ['FR', 'AE', 'IT', 'JP', 'DE', 'ES', 'US', 'GB', 'CH', 'CN'];

function calculateFinalScore(country, liveAqi, advisoryData, isSoloMode = false) {
    const raw = country.scores_raw;
    
    const gpiScore = ((5 - raw.gpi) / 4) * 100;
    const gtiScore = ((10 - raw.gti) / 10) * 100;
    const diplomacyScore = (raw.passport_vfs / 195) * 100;
    const aqiScore = Math.max(0, ((500 - liveAqi) / 500) * 100);

    let homicideScore, femicideScore;
    let finalHomicideWeight, finalFemicideWeight;
    let penaltyApplied = false;

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
    
    let gdpScore = 5.00; 
    let displayGdp = "Data Missing";
    
    if (raw.gdp !== null && raw.gdp !== undefined) {
        const logGdp = Math.log10(raw.gdp);
        gdpScore = ((logGdp - 7.5) / (13.5 - 7.5)) * 10;
        gdpScore = Math.max(0, Math.min(10, gdpScore));
        displayGdp = `$${(raw.gdp / 1000000000).toFixed(2)} Billion`; 
    }

    let cliScore = 4.50; 
    let displayCli = "Data Missing";
    
    if (raw.cli !== null && raw.cli !== undefined) {
        cliScore = ((80 - raw.cli) / (80 - 10)) * 10;
        cliScore = Math.max(0, Math.min(10, cliScore));
        displayCli = raw.cli;
    }

    let totalScore = 0;

    if (isSoloMode) {
        totalScore = 
            (((gpiScore * WEIGHTS.gpi*0.25) +
            (gtiScore * WEIGHTS.gti*1.25) +
            (diplomacyScore * WEIGHTS.diplomacy) +
            (aqiScore * WEIGHTS.aqi) +
            (homicideScore * finalHomicideWeight*1.25) +
            (femicideScore * finalFemicideWeight*1.25)) * 0.95 +
            (gdpScore * 0.35) + (cliScore * 0.15) - ((raw.rape_rate) / 35 * 5)*1.15);
    } else {
        totalScore = 
            ((gpiScore * WEIGHTS.gpi) +
            (gtiScore * WEIGHTS.gti) +
            (diplomacyScore * WEIGHTS.diplomacy) +
            (aqiScore * WEIGHTS.aqi) +
            (homicideScore * finalHomicideWeight) +
            (femicideScore * finalFemicideWeight)) * 0.80 +
            gdpScore + cliScore - ((raw.rape_rate) / 35 * 2.5);
    }

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

    let microstatePenaltyText = '';
    if (MICROSTATES.includes(country.iso_code)) {
        totalScore -= 7.77;
        microstatePenaltyText = '*Microstate score penalty applied (-7.77)';
    }

    let eurocentricPenaltyText = '';
    if (EUROCENTRIC_NATIONS.includes(country.iso_code)) {
        const deduction = totalScore * 0.03;
        totalScore -= deduction;
        eurocentricPenaltyText = `*Eurocentric reporting adjustment applied (-3%)`;
    }

    let advisoryLevel = null;
    let advisoryWarning = null;

    if (advisoryData) {
        if (advisoryData.level >= 4) {
            if (isSoloMode) {
                totalScore -= 100; 
                advisoryLevel = advisoryData.level;
                advisoryWarning = advisoryData.advice;
            }
            else{
                totalScore -= 50; 
                advisoryLevel = advisoryData.level;
                advisoryWarning = advisoryData.advice;
            }
        } else if (advisoryData.level === 3) {
            if (isSoloMode) {
                totalScore -= 50; 
                advisoryLevel = advisoryData.level;
                advisoryWarning = advisoryData.advice;
            }
            else{
                totalScore -= 10; 
                advisoryLevel = advisoryData.level;
                advisoryWarning = advisoryData.advice;
            }
        }
    }

    let unescoCombinedStatus = "Standard (6+ Sites, 0)";
    let unescoCombinedColor = "color: #7f8c8d;"; 

    
    if (UNESCO_TOP_15.includes(country.iso_code)) { 
        totalScore += 5;
        unescoCombinedStatus = "Top 15 Globally (+5)";
        unescoCombinedColor = "color: #27ae60;"
    } 
    // 2. Otherwise, check for the Penalty
    else if (!UNESCO_MIN_6.includes(country.iso_code)) {
        if (MICROSTATES.includes(country.iso_code)) {
            totalScore -= 10;
            unescoCombinedStatus = "Less than 6 Sites (Microstate, -10)";
            unescoCombinedColor = "color: #ef6f00;";
        } else {
            totalScore -= 15;
            unescoCombinedStatus = "Less than 6 Sites (-15)";
            unescoCombinedColor = "color: #c0392b;";
        }
    }

    let isNatureTop8 = "No";
    if (NATURE_TOP_8.includes(country.iso_code)) {
        totalScore += 8;
        isNatureTop8 = "Yes (+8 Score)";
    }

    let muslimFriendlyStatus = "Neutral (0)";
    let muslimFriendlyColor = "";

    if (MUSLIM_MAJORITY.includes(country.iso_code)) {
        totalScore += 1;
        muslimFriendlyStatus = "Muslim-Majority (+1)";
        muslimFriendlyColor = "color: #2980b9;";
    } else if (MUSLIM_FRIENDLY.includes(country.iso_code)) {
        totalScore += 5;
        muslimFriendlyStatus = "Muslim-Friendly (+5)";
        muslimFriendlyColor = "color: #27ae60;";
    } else if (MUSLIM_HOSTILE.includes(country.iso_code)) {
        totalScore -= 5;
        muslimFriendlyStatus = "Muslim-Hostile (-5)";
        muslimFriendlyColor = "color: #c0392b;";
    }

    let holySiteStatus = "None";
    
    if (HOLY_SITE_MUSLIM.includes(country.iso_code)) {
        totalScore += 10;
        holySiteStatus = "Muslim Pilgrimage Holy Site (+10)";
    } else if (HOLY_SITE_ABRAHAMIC.includes(country.iso_code)) {
        totalScore += 10;
        holySiteStatus = "Abrahamic Holy Site (Jerusalem) (+10)";
    } else if (HOLY_SITE_CATHOLIC.includes(country.iso_code)) {
        totalScore += 10;
        holySiteStatus = "Catholic Holy Site (+10)";
    } else if (HOLY_SITE_ORTHODOX.includes(country.iso_code)) {
        totalScore += 10;
        holySiteStatus = "Orthodox Holy Site (+10)";
    }
    

    let overtourismStatus = "No";
    let overtourismColor = "";

    if (OVERTOURISM_NATIONS.includes(country.iso_code)) {
        if (MICROSTATES.includes(country.iso_code)) {
            if (isSoloMode) {
                totalScore -= 20;
                overtourismStatus = "Yes (-20, but Microstate)";
                overtourismColor = "color: #e67e22;";
            } else {
                totalScore -= 10;
                overtourismStatus = "Yes (-10, but Microstate)";
                overtourismColor = "color: #e67e22;";
            }                
        } else {
            if (isSoloMode) {
                totalScore -= 30;
                overtourismStatus = "Yes (-30)";
                overtourismColor = "color: #c0392b;";
            } else {
                totalScore -= 20;
                overtourismStatus = "Yes (-20)";
                overtourismColor = "color: #c0392b;";
            }
        }
    }

    let censorshipStatus = "No";
    let censorshipColor = "";

    if (CENSORSHIP_ABSOLUTE.includes(country.iso_code)) {
        totalScore -= 30;
        censorshipStatus = "Yes, absolute (-30)";
        censorshipColor = "color: #c0392b; font-weight: bold;";
    } else if (CENSORSHIP_HIGH.includes(country.iso_code)) {
        totalScore -= 5;
        censorshipStatus = "Yes, high (-5)";
        censorshipColor = "color: #e67e22;";
    }

    let connectivityStatus = "";
    let connectivityColor = "";

    if (IATA_TOP_20.includes(country.iso_code)) {
        totalScore += 5;
        connectivityStatus = "Top 20 Globably (+5)";
        connectivityColor = "color: #27ae60;";
    } else if (IATA_21_80.includes(country.iso_code)) {
        connectivityStatus = "Ranked 21-80 (0)";
        connectivityColor = "color: #7f8c8d;";
    } else if (IATA_81_100.includes(country.iso_code)) {
        totalScore -= 5;
        connectivityStatus = "Ranked 81-100 (-5)";
        connectivityColor = "color: #e67e22;";
    } else {
        if (MICROSTATES.includes(country.iso_code)) {
            connectivityStatus = "Not Listed (Microstate Exemption, 0)";
            connectivityColor = "color: #7f8c8d;";
        } else {
            totalScore -= 10;
            connectivityStatus = "Not in Top 100 (-10)";
            connectivityColor = "color: #c0392b; font-weight: bold;";
        }
    }

    let michelinStatus = "No";
    let michelinColor = "";

    if (MICHELIN_TOP_10.includes(country.iso_code)) {
        totalScore += 2.5;
        michelinStatus = "Top 10 Globally (+2.5)";
        michelinColor = "color: #27ae60;";
    }

    if (isSoloMode) {
        totalScore = Math.max(0, totalScore*0.80);
    } else {
        totalScore = Math.max(0, totalScore);
    }

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
        displayCli: displayCli,
        cliScore: cliScore, 
        isNatureTop8: isNatureTop8,
        muslimFriendlyStatus: muslimFriendlyStatus,
        muslimFriendlyColor: muslimFriendlyColor,
        holySiteStatus: holySiteStatus,
        overtourismStatus: overtourismStatus,
        overtourismColor: overtourismColor,
        censorshipStatus: censorshipStatus,
        censorshipColor: censorshipColor,
        connectivityStatus: connectivityStatus,
        connectivityColor: connectivityColor,
        michelinStatus: michelinStatus,
        michelinColor: michelinColor,      
        unescoCombinedStatus: unescoCombinedStatus,
        unescoCombinedColor: unescoCombinedColor,
    };
}

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

function renderList(rankedCountries) {
    const container = document.getElementById('results-container');
    document.getElementById('loading').style.display = 'none';
    
    let html = '';
    
    rankedCountries.forEach((c) => {
        let overtourismBadge = '';
        if (OVERTOURISM_NATIONS.includes(c.iso_code)) {
            overtourismBadge = `<span style="background-color: #c0392b; color: white; font-size: 12px; padding: 3px 8px; border-radius: 12px; margin-left: 10px; font-weight: bold; vertical-align: middle; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">⚠️ Overtourism</span>`;
        }

        const femicideText = c.penaltyApplied ? `<br><span class="penalty-flag">*Femicide data missing, homicide penalty applied (1.7x)</span>` : '';
        const isolationText = c.isolationPenaltyText ? `<br><span class="penalty-flag">${c.isolationPenaltyText}</span>` : '';
        const microText = c.microstatePenaltyText ? `<br><span class="penalty-flag">${c.microstatePenaltyText}</span>` : '';
        const euroText = c.eurocentricPenaltyText ? `<br><span class="penalty-flag">${c.eurocentricPenaltyText}</span>` : '';
        
        let statusText = '';
        let statusClass = '';
        
        if (c.final_score >= 80) {
            statusText = '(Highly Recommended)';
            statusClass = 'status-highly-recommended';
        } else if (c.final_score >= 55) {
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

        const displayScore = c.final_score.toFixed(2);

        html += `
            <div class="country-card">
                <div class="card-header">
                    <h2 style="margin: 0;">
                        <span class="rank-number">#${c.original_rank}</span> 
                        <span class="country-name">${c.country}</span>${overtourismBadge}
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
                            <span class="stat-label">GDP Score (0-10, 10 is Highly Developed)</span>
                            <span class="stat-value">${c.displayGdp !== 'Data Missing' ? `${c.displayGdp} (+${c.gdpScore.toFixed(2)})` : 'Data Unavailable'}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Cost of Living (0-10, 10 is cheaper)</span>
                            <span class="stat-value">${c.displayCli !== 'Data Missing' ? `${c.displayCli} (+${c.cliScore.toFixed(2)})` : 'Data Unavailable'}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">UNESCO Heritage Sites</span>
                            <span class="stat-value" style="${c.unescoCombinedColor}">${c.unescoCombinedStatus}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Top 8 Most Beautiful Nature Landscapes? (Popular Vote)</span>
                            <span class="stat-value" style="${c.isNatureTop8.startsWith('Yes') ? 'color: #27ae60;' : ''}">${c.isNatureTop8}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Muslim-Friendly Travel?</span>
                            <span class="stat-value" style="${c.muslimFriendlyColor}">${c.muslimFriendlyStatus}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Major Religious Pilgrimage Site?</span>
                            <span class="stat-value" style="${c.holySiteStatus !== 'None' ? 'color: #8e44ad; font-weight: bold;' : ''}">${c.holySiteStatus}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Suffering from Overtourism?</span>
                            <span class="stat-value" style="${c.overtourismColor}">${c.overtourismStatus}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Strict Laws & Censorship?</span>
                            <span class="stat-value" style="${c.censorshipColor}">${c.censorshipStatus}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Flight Connectivity (IATA Rank)</span>
                            <span class="stat-value" style="${c.connectivityColor}">${c.connectivityStatus}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Top 10 Most Michelin Stars?</span>
                            <span class="stat-value" style="${c.michelinColor}">${c.michelinStatus}</span>
                        </div>
                    </div>
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

function processAndRenderData() {
    const isSoloMode = document.getElementById('soloToggle').checked;
    const processedData = [];

    for (const item of rawCountriesData) {
        const calc = calculateFinalScore(item.country, item.liveAqi, item.countryAdvisory, isSoloMode);
        
        processedData.push({
            ...item.country,
            final_score: calc.score,
            
            penaltyApplied: calc.penaltyApplied,
            isolationPenaltyText: calc.isolationPenaltyText,
            microstatePenaltyText: calc.microstatePenaltyText,
            eurocentricPenaltyText: calc.eurocentricPenaltyText,
            
            advisoryLevel: calc.advisoryLevel,
            advisoryWarning: calc.advisoryWarning,
            advisoryPageUrl: item.countryAdvisory ? item.countryAdvisory.pageUrl : null,
            
            displayGdp: calc.displayGdp,
            gdpScore: calc.gdpScore,
            displayCli: calc.displayCli,
            cliScore: calc.cliScore,
            
            isNatureTop8: calc.isNatureTop8,
            
            muslimFriendlyStatus: calc.muslimFriendlyStatus,
            muslimFriendlyColor: calc.muslimFriendlyColor,
            holySiteStatus: calc.holySiteStatus,
            
            overtourismStatus: calc.overtourismStatus,
            overtourismColor: calc.overtourismColor,
            censorshipStatus: calc.censorshipStatus,
            censorshipColor: calc.censorshipColor,
            
            connectivityStatus: calc.connectivityStatus,
            connectivityColor: calc.connectivityColor,
            michelinStatus: calc.michelinStatus,
            michelinColor: calc.michelinColor,
            unescoCombinedStatus: calc.unescoCombinedStatus,
            unescoCombinedColor: calc.unescoCombinedColor
        });
    }

    processedData.sort((a, b) => b.final_score - a.final_score);

    processedData.forEach((c, i) => {
        c.original_rank = i + 1;
    });

    allCountriesData = processedData;

    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    
    if (searchTerm) {
        const filteredData = allCountriesData.filter(c => c.country.toLowerCase().includes(searchTerm));
        renderList(filteredData);
    } else {
        renderList(allCountriesData);
    }
}

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

        for (const country of staticData) {
            const liveAqi = await fetchLiveAQI(country.iso_code);
            const countryAdvisory = advisories[country.iso_code]; 
            rawCountriesData.push({ country, liveAqi, countryAdvisory });
        }

        processAndRenderData();

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.style.display = 'block';
            searchInput.addEventListener('input', () => {
                processAndRenderData(); 
            });
        }

        const soloToggle = document.getElementById('soloToggle');
        if (soloToggle) {
            soloToggle.addEventListener('change', () => {
                processAndRenderData(); 
            });
        }

    } catch (error) {
        console.error("Failed to load data:", error);
        const loadingEl = document.getElementById('loading');
        if (loadingEl) loadingEl.innerText = "Error loading data.";
    }
}

init();