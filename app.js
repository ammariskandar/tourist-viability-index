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



// Store both your encoded keys here
const PIXABAY_KEYS = {
    primary: 'NTU2NDcwMDctZWM4NjNmZTY0NzIwY2ZhN2UxODQ1MDFiMg==', 
    backup: 'NTU2NDc0NjMtYmU2N2UwYzFhNDkyNGY0OTc1NGY3MWUxMg==' 
};

let activeKey = 'primary';
const getPixabayKey = () => atob(PIXABAY_KEYS[activeKey]);

// --- HELPER 1: Fetch with forced timeout ---
async function fetchWithTimeout(url, timeoutMs = 4000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
}

// --- HELPER 2: The Wikipedia Fallback Engine ---
async function fetchWikipediaFallback(isoCode, countryName) {
    let searchTerm = countryName;
    
    // Step 1: Get the Capital
    try {
        const rcRes = await fetchWithTimeout(`https://restcountries.com/v3.1/alpha/${isoCode}`, 3000);
        if (rcRes.ok) {
            const rcData = await rcRes.json();
            if (rcData[0] && rcData[0].capital && rcData[0].capital[0]) {
                searchTerm = rcData[0].capital[0]; 
            }
        }
    } catch (e) {
        console.warn("RestCountries failed, defaulting to country name for Wikipedia.");
    }

    // Step 2: Query Wikipedia
    async function fetchWikipediaFallback(isoCode, countryName) {
    let capitalName = null;

    // Step 1: Get the Capital
    try {
        const rcRes = await fetchWithTimeout(`https://restcountries.com/v3.1/alpha/${isoCode}`, 3000);
        if (rcRes.ok) {
            const rcData = await rcRes.json();
            if (rcData[0] && rcData[0].capital && rcData[0].capital[0]) {
                capitalName = rcData[0].capital[0]; 
            }
        }
    } catch (e) {
        console.warn("RestCountries failed, will only use Country Name for Wikipedia.");
    }

    // Step 2: The Ruthless Search & Filter Engine
    async function executeStrictWikiSearch(searchTerm) {
        const searchQuery = encodeURIComponent(searchTerm);
        const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchQuery}&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url&format=json&origin=*`;
        
        try {
            const res = await fetchWithTimeout(url, 5000);
            const data = await res.json();
            const pages = data.query?.pages;
            
            if (!pages) return [];
            
            let validImages = [];
            
            for (const key in pages) {
                const imgInfo = pages[key].imageinfo?.[0];
                const title = pages[key].title || "";
                const imgUrl = imgInfo?.url;
                
                if (!imgUrl) continue;
                
                const lowerUrl = imgUrl.toLowerCase();
                
                // FATAL FILTER 1: Must be an actual photograph format
                if (!lowerUrl.endsWith('.jpg') && !lowerUrl.endsWith('.jpeg') && !lowerUrl.endsWith('.png')) {
                    continue;
                }

                // FATAL FILTER 2: No maps, flags, or logos
                if (lowerUrl.includes('map') || lowerUrl.includes('flag') || lowerUrl.includes('logo') || lowerUrl.includes('icon')) {
                    continue;
                }

                // Clean the title for comparison
                let cleanTitle = title.replace(/^File:/i, '').replace(/\.[a-zA-Z0-9]+$/i, '').trim();
                let lowerCleanTitle = cleanTitle.toLowerCase();
                let lowerSearch = searchTerm.toLowerCase();
                let wordCount = cleanTitle.split(/\s+/).length;

                // FATAL FILTER 3: The title MUST contain the search term. (No more "Rank 3" catch-all)
                if (lowerCleanTitle === lowerSearch) {
                    validImages.push({ url: imgUrl, rank: 1, wordCount: wordCount }); // Exact match
                } else if (lowerCleanTitle.includes(lowerSearch)) {
                    validImages.push({ url: imgUrl, rank: 2, wordCount: wordCount }); // Contains name
                }
            }

            // Sort what survived by Rank, then by shortest title
            validImages.sort((a, b) => {
                if (a.rank !== b.rank) return a.rank - b.rank; 
                return a.wordCount - b.wordCount;              
            });

            return validImages.map(img => img.url);
        } catch (e) {
            return [];
        }
    }

    // Step 3: Try searching by Capital City first
    let urls = [];
    if (capitalName) {
        urls = await executeStrictWikiSearch(capitalName);
    }

    // Step 4: If Capital City search failed or returned NO strict matches, fallback to Country Name
    if (urls.length === 0) {
        console.log(`Strict search for capital failed. Trying country name: ${countryName}`);
        urls = await executeStrictWikiSearch(countryName);
    }

    // Return the top 2 surviving URLs
    return urls.slice(0, 2);
    }
}

// --- MAIN FETCH FUNCTION ---
async function fetchCountryImages(countryName, isoCode) {
    const cacheKey = `pixabay_cache_${isoCode}`;
    const cachedData = localStorage.getItem(cacheKey);

    // 1. Check 24-hour cache
    if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const ageInMilliseconds = Date.now() - parsedData.timestamp;
        if (ageInMilliseconds < 24 * 60 * 60 * 1000) {
            return parsedData.urls;
        }
    }

    const searchQuery = encodeURIComponent(countryName);
    let url = `https://pixabay.com/api/?key=${getPixabayKey()}&q=${searchQuery}&image_type=photo&orientation=horizontal&category=places&per_page=3`;
    
    let urls = [];
    let pixabaySuccess = false;

    // 2. Try Pixabay
    try {
        let res = await fetchWithTimeout(url);
        
        // Handle Rate Limit Swapping
        if (res.status === 429 && activeKey === 'primary') {
            console.warn("Primary Pixabay key limited. Switching to backup...");
            activeKey = 'backup'; 
            url = `https://pixabay.com/api/?key=${getPixabayKey()}&q=${searchQuery}&image_type=photo&orientation=horizontal&category=places&per_page=3`;
            res = await fetchWithTimeout(url); // Try again with backup
        }

        if (res.ok) {
            const data = await res.json();
            // Make sure Pixabay actually found images (Fixes the Somalia blank/wrong image issue)
            if (data.hits && data.hits.length > 0) {
                for (let i = 0; i < Math.min(2, data.hits.length); i++) {
                    urls.push(data.hits[i].webformatURL); 
                }
                pixabaySuccess = true;
            }
        }
    } catch (e) {
        console.warn("Pixabay timed out or failed completely.");
    }

    // 3. The Wikipedia Fallback
    // Triggers if Pixabay timed out, threw a 429 on BOTH keys, or found 0 images
    if (!pixabaySuccess || urls.length === 0) {
        console.log(`Pixabay failed for ${countryName}. Triggering Wikipedia Fallback...`);
        urls = await fetchWikipediaFallback(isoCode, countryName);
    }

    // 4. Cache the results (Only cache if we actually got images)
    if (urls.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify({
            urls: urls,
            timestamp: Date.now()
        }));
    }
    
    return urls;
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
                        <span class="country-name" data-name="${c.country}" data-iso="${c.iso_code}">${c.country}</span>${overtourismBadge}
                        <span class="status-indicator ${statusClass}">${statusText}</span>
                        ${advisoryToast}
                    </h2>
                    <div class="score">${displayScore}</div>
                </div>
                <div class="details">
                    <div class="country-images" style="display: flex; gap: 10px; margin-bottom: 15px; width: 100%;"></div>
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
        header.addEventListener('click', async function() {
            const detailsDiv = this.nextElementSibling;
            detailsDiv.classList.toggle('show');

            if (detailsDiv.classList.contains('show')) {
                const imgContainer = detailsDiv.querySelector('.country-images');
                
                if (imgContainer && !imgContainer.dataset.loaded) {
                    imgContainer.dataset.loaded = "true";
                    
                    imgContainer.innerHTML = `
                        <div class="shimmer-box"></div>
                        <div class="shimmer-box"></div>
                    `;
                    
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    const nameEl = this.querySelector('.country-name');
                    const countryName = nameEl.getAttribute('data-name');
                    const isoCode = nameEl.getAttribute('data-iso');
                    
                    const images = await fetchCountryImages(countryName, isoCode);
                    
                    if (images.length > 0) {
                        const imgElements = images.map(url => `<img src="${url}" style="width: calc(50% - 5px); height: 300px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">`).join('');
                        imgContainer.innerHTML = imgElements;
                    } else {
                        imgContainer.style.display = 'none';
                    }
                }
            }
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