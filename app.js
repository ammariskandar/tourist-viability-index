let userBucketList = JSON.parse(localStorage.getItem('tvi-bucketlist')) || [];
let allCountriesData = [];
let rawCountriesData = [];
let scoreCache      = null;
let lastSoloMode    = null;

const WEIGHTS = { gpi: 0.13, gti: 0.22, diplomacy: 0.02, aqi: 0.01 };

const MICROSTATES         = ['VA','MC','NR','TV','SM','LI','MH','KN','MV','MT','AD','PW','FM','VC','BB','AG','SC','BN','SG'];
const EUROCENTRIC_NATIONS = ['AL','BE','BG','CA','HR','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IT','LV','LT','LU','ME','MK','NL','NO','PL','PT','RO','SK','SI','ES','SE','TR','GB','US','AT','CH','IE','VA','MC','SM','LI','MH','KN','MT','AD','VC','BB','AG'];
const UNESCO_TOP_15       = ['IT','CN','DE','ES','FR','IN','MX','GB','RU','IR','US','JP','BR','CA','TR'];
const UNESCO_MIN_6        = ['IT','CN','DE','FR','ES','IN','MX','GB','RU','IR','US','JP','BR','CA','TR','AU','GR','PL','CZ','PT','KR','BE','SE','PE','NL','CH','ET','ZA','AR','AT','RO','DK','ID','BG','HR','CO','MA','TN','CU','IL','VN','TH','KE','UA','SA','LK','HU','SK','EG','TZ','DZ','UZ','CL','SN','BO','JO','FI','PK','PH','IQ','SY','KZ','LB','MN'];
const NATURE_TOP_8        = ['GR','IT','CH','ES','NZ','TH','NO','IS'];
const MUSLIM_MAJORITY     = ['MV','MR','IR','SO','AF','DJ','EH','DZ','MA','KM','NE','TJ','TN','PS','AZ','JO','SN','YE','LY','YT','PK','GM','ML','SA','SD','IQ','TM','XK','TR','BD','EG','GN','UZ','ID','SY','OM','BN','KG','SL','QA','KW','BH','AE','KZ','LB','BF','MY','TD','ER','AL','BA'];
const MUSLIM_FRIENDLY     = ['NG','ET','TZ','RU','CN','CD','CI','CM','GH','MZ','TH','DE','AU','NZ','TW','SG','JP'];
const MUSLIM_HOSTILE      = ['FR','IN','US','IL','GB'];
const HOLY_SITE_MUSLIM    = ['SA'];
const HOLY_SITE_ABRAHAMIC = ['IL','PS'];
const HOLY_SITE_CATHOLIC  = ['IT','VA'];
const HOLY_SITE_ORTHODOX  = ['RU','GR'];
const OVERTOURISM_NATIONS = ['ES','IT','GR','NL','FR','JP','TH','VA','MA'];
const CENSORSHIP_ABSOLUTE = ['KP','TM'];
const CENSORSHIP_HIGH     = ['ER','CN','IR','CU','BY'];
const IATA_TOP_20         = ['US','GB','CN','DE','JP','ES','IT','AE','FR','IN','TH','KR','TR','CA','SG','MX','HK','SA','TW','MY'];
const IATA_21_80          = ['VN','AU','ID','NL','CH','QA','PT','GR','PH','EG','IE','PL','RU','AT','DK','BR','PK','BE','MA','SE','DO','NO','CO','KW','FI','RO','IL','CZ','HU','NZ','PA','BD','AR','ZA','ET','CY','BH','OM','LK','DZ','IR','JO','HR','PE','RS','KH','CL','CR','UZ','TN','LB','KZ','MO','IQ','MV','JM','IS','NP','KE','BG'];
const IATA_81_100         = ['MT','SV','AZ','GE','AL','BS','NG','EC','CU','GT','LV','MU','LU','MD','TZ','LT','AW','LA','MM','AM'];
const MICHELIN_TOP_10     = ['FR','AE','IT','JP','DE','ES','US','GB','CH','CN'];

const SOLO_TIERS = {
    S: { points: 15,  codes: ['SG','JP','AU','NZ','AE'] },
    A: { points: 10,  codes: ['KR','TW','MY','DK','MT'] },
    B: { points: 5,   codes: ['TH','IS','LV','BE','GR','JO','MC','DE','NO'] },
    C: { points: 2.5, codes: ['VN','NP','KH','GB','FR','ES','FI','PT'] },
    D: { points: 1,   codes: ['BW','SA','BN'] },
};

const SEARCH_ALIASES = [
    { target: 'china',                            keywords: ['hong kong','macao','macau','hk','prc',"people's republic of china"] },
    { target: 'palestine',                        keywords: ['gaza','west bank'] },
    { target: 'united kingdom',                   keywords: ['northern ireland','scotland','wales','england','uk','gb','great britain','gibraltar'] },
    { target: 'united states',                    keywords: ['hawaii','puerto rico','guam','american samoa','u.s.','us','usa','u.s.a','united states of america','america'] },
    { target: 'taiwan',                           keywords: ['taipei','chinese taipei','republic of china','roc'] },
    { target: 'central african republic',         keywords: ['c.a.r.','car'] },
    { target: 'democratic republic of the congo', keywords: ['drc','dr congo'] },
    { target: 'timor-leste',                      keywords: ['timor leste','east timor'] },
    { target: 'north korea',                      keywords: ['dprk',"democratic people's republic of korea"] },
    { target: 'new zealand',                      keywords: ['nz'] },
    { target: 'united arab emirates',             keywords: ['uae','u.a.e','dubai','abu dhabi'] },
    { target: 'vatican city',                     keywords: ['pope','pontifice','bishop of rome'] },
    { target: 'saudi arabia',                     keywords: ['kingdom of saudi arabia','mecca','medina'] },
    { target: 'south korea',                      keywords: ['republic of korea','sk'] },
];

const PIXABAY_KEYS = {
    primary: 'NTU2NDcwMDctZWM4NjNmZTY0NzIwY2ZhN2UxODQ1MDFiMg==',
    backup:  'NTU2NDc0NjMtYmU2N2UwYzFhNDkyNGY0OTc1NGY3MWUxMg=='
};

let activePixabayKey = 'primary';
const getPixabayKey  = () => atob(PIXABAY_KEYS[activePixabayKey]);

function sessionGet(key) {
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        const { ts, data } = JSON.parse(raw);
        if (Date.now() - ts > 30 * 60 * 1000) return null;
        return data;
    } catch { return null; }
}

function sessionSet(key, data) {
    try {
        sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
    } catch {}
}

function computeAqi(isoCode) {
    let hash = 0;
    for (let i = 0; i < isoCode.length; i++) {
        hash = isoCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 80) + 15;
}

async function fetchStaticData() {
    const res = await fetch('./countries_safety_data.json');
    return res.json();
}

async function fetchAdvisories() {
    const cached = sessionGet('tvi_advisory_v1');
    if (cached) return cached;
    try {
        const res = await fetch('https://smartraveller.kevle.xyz/api/advisories');
        if (!res.ok) return {};
        const json = await res.json();
        const map  = {};
        if (json?.advisories) {
            json.advisories.forEach(item => {
                if (item.country?.alpha2) map[item.country.alpha2] = item;
            });
        }
        sessionSet('tvi_advisory_v1', map);
        return map;
    } catch { return {}; }
}

async function fetchHantaData() {
    const cached = sessionGet('tvi_hanta_v2'); 
    if (cached) return cached;
    try {
        const res = await fetch('https://hantaflow.com/api/countries.json');
        if (!res.ok) return {};
        const json = await res.json();
        const map  = {};
        
        if (json?.countries) {
            json.countries.forEach(c => { 
                if (c.iso2) {
                    map[c.iso2.toUpperCase()] = c; 
                }
            });
        }
        sessionSet('tvi_hanta_v2', map);
        return map;
    } catch { return {}; }
}

function calculateFinalScore(country, liveAqi, advisoryData, isSoloMode = false) {
    const raw = country.scores_raw;

    const gpiScore      = ((5  - raw.gpi) / 4)   * 100;
    const gtiScore      = ((10 - raw.gti) / 10)  * 100;
    const diplomacyScore = (raw.passport_vfs / 195) * 100;
    const aqiScore      = Math.max(0, ((500 - liveAqi) / 500) * 100);

    let homicideScore, femicideScore, finalHomicideWeight, finalFemicideWeight, penaltyApplied;

    if (raw.femicide_rate === null) {
        const penalizedHom  = raw.homicide_rate * 1.7;
        homicideScore       = Math.max(0, ((50 - penalizedHom) / 50) * 100);
        femicideScore       = 0;
        finalHomicideWeight = 0.62;
        finalFemicideWeight = 0;
        penaltyApplied      = true;
    } else {
        homicideScore       = Math.max(0, ((50 - raw.homicide_rate) / 50) * 100);
        femicideScore       = Math.max(0, ((20 - raw.femicide_rate) / 20) * 100);
        finalHomicideWeight = 0.25;
        finalFemicideWeight = 0.37;
        penaltyApplied      = false;
    }

    let gdpScore = 5.00, displayGdp = 'Data Missing';
    if (raw.gdp != null) {
        const logGdp = Math.log10(raw.gdp);
        gdpScore     = Math.max(0, Math.min(10, ((logGdp - 7.5) / (13.5 - 7.5)) * 10));
        displayGdp   = `$${(raw.gdp / 1_000_000_000).toFixed(2)} Billion`;
    }

    let cliScore = 4.50, displayCli = 'Data Missing';
    if (raw.cli != null) {
        cliScore   = Math.max(0, Math.min(10, ((80 - raw.cli) / (80 - 10)) * 10));
        displayCli = raw.cli;
    }

    let totalScore;

    if (isSoloMode) {
        totalScore =
            (((gpiScore      * WEIGHTS.gpi      * 0.25) +
              (gtiScore      * WEIGHTS.gti      * 1.25) +
              (diplomacyScore * WEIGHTS.diplomacy) +
              (aqiScore      * WEIGHTS.aqi) +
              (homicideScore  * finalHomicideWeight * 1.25) +
              (femicideScore  * finalFemicideWeight * 1.25)) * 0.95) +
            (gdpScore * 0.35) + (cliScore * 0.15) -
            ((raw.rape_rate / 35) * 5 * 1.15);
    } else {
        totalScore =
            ((gpiScore      * WEIGHTS.gpi) +
             (gtiScore      * WEIGHTS.gti) +
             (diplomacyScore * WEIGHTS.diplomacy) +
             (aqiScore      * WEIGHTS.aqi) +
             (homicideScore  * finalHomicideWeight) +
             (femicideScore  * finalFemicideWeight)) * 0.80 +
            gdpScore + cliScore -
            ((raw.rape_rate / 35) * 2.5);
    }

    let isolationPenaltyText = '';
    if      (raw.passport_vfs < 33) { totalScore -= 60; isolationPenaltyText = '*Extreme inaccessibility penalty applied (-60)'; }
    else if (raw.passport_vfs < 50) { totalScore -= 10; isolationPenaltyText = '*High inaccessibility penalty applied (-10)'; }
    else if (raw.passport_vfs < 55) { totalScore -= 5;  isolationPenaltyText = '*Moderate inaccessibility penalty applied (-5)'; }

    let microstatePenaltyText = '';
    if (MICROSTATES.includes(country.iso_code)) {
        totalScore -= 7.77;
        microstatePenaltyText = '*Microstate score penalty applied (-7.77)';
    }

    let eurocentricPenaltyText = '';
    if (EUROCENTRIC_NATIONS.includes(country.iso_code)) {
        totalScore -= totalScore * 0.03;
        eurocentricPenaltyText = '*Eurocentric reporting adjustment applied (-3%)';
    }

    let advisoryLevel = null, advisoryWarning = null;
    if (advisoryData) {
        if (advisoryData.level >= 4) {
            totalScore    -= isSoloMode ? 100 : 50;
            advisoryLevel  = advisoryData.level;
            advisoryWarning = advisoryData.advice;
        } else if (advisoryData.level === 3) {
            totalScore    -= isSoloMode ? 50 : 10;
            advisoryLevel  = advisoryData.level;
            advisoryWarning = advisoryData.advice;
        }
    }

    let unescoCombinedStatus = 'Standard (6+ Sites, 0)', unescoCombinedColor = 'color: #7f8c8d;';
    if (UNESCO_TOP_15.includes(country.iso_code)) {
        totalScore += 5;
        unescoCombinedStatus = 'Top 15 Globally (+5)';
        unescoCombinedColor  = 'color: #27ae60;';
    } else if (!UNESCO_MIN_6.includes(country.iso_code)) {
        if (MICROSTATES.includes(country.iso_code)) {
            totalScore -= 10;
            unescoCombinedStatus = 'Less than 6 Sites (Microstate, -10)';
            unescoCombinedColor  = 'color: #ef6f00;';
        } else {
            totalScore -= 15;
            unescoCombinedStatus = 'Less than 6 Sites (-15)';
            unescoCombinedColor  = 'color: #c0392b;';
        }
    }

    let isNatureTop8 = 'No';
    if (NATURE_TOP_8.includes(country.iso_code)) {
        totalScore += 8;
        isNatureTop8 = 'Yes (+8 Score)';
    }

    let muslimFriendlyStatus = 'Neutral (0)', muslimFriendlyColor = '';
    if (MUSLIM_MAJORITY.includes(country.iso_code)) {
        totalScore += 1;
        muslimFriendlyStatus = 'Muslim-Majority (+1)';
        muslimFriendlyColor  = 'color: #2980b9;';
    } else if (MUSLIM_FRIENDLY.includes(country.iso_code)) {
        totalScore += 5;
        muslimFriendlyStatus = 'Muslim-Friendly (+5)';
        muslimFriendlyColor  = 'color: #27ae60;';
    } else if (MUSLIM_HOSTILE.includes(country.iso_code)) {
        totalScore -= 5;
        muslimFriendlyStatus = 'Muslim-Hostile (-5)';
        muslimFriendlyColor  = 'color: #c0392b;';
    }

    let holySiteStatus = 'None';
    if      (HOLY_SITE_MUSLIM.includes(country.iso_code))    { totalScore += 10; holySiteStatus = 'Muslim Pilgrimage Holy Site (+10)'; }
    else if (HOLY_SITE_ABRAHAMIC.includes(country.iso_code)) { totalScore += 10; holySiteStatus = 'Abrahamic Holy Site (Jerusalem) (+10)'; }
    else if (HOLY_SITE_CATHOLIC.includes(country.iso_code))  { totalScore += 10; holySiteStatus = 'Catholic Holy Site (+10)'; }
    else if (HOLY_SITE_ORTHODOX.includes(country.iso_code))  { totalScore += 10; holySiteStatus = 'Orthodox Holy Site (+10)'; }

    let overtourismStatus = 'No', overtourismColor = '';
    if (OVERTOURISM_NATIONS.includes(country.iso_code)) {
        const isMicro = MICROSTATES.includes(country.iso_code);
        if (isSoloMode) {
            totalScore      -= isMicro ? 20 : 30;
            overtourismStatus = isMicro ? 'Yes (-20, but Microstate)' : 'Yes (-30)';
        } else {
            totalScore      -= isMicro ? 10 : 20;
            overtourismStatus = isMicro ? 'Yes (-10, but Microstate)' : 'Yes (-20)';
        }
        overtourismColor = isMicro ? 'color: #e67e22;' : 'color: #c0392b;';
    }

    let censorshipStatus = 'No', censorshipColor = '';
    if (CENSORSHIP_ABSOLUTE.includes(country.iso_code)) {
        totalScore -= 30;
        censorshipStatus = 'Yes, absolute (-30)';
        censorshipColor  = 'color: #c0392b; font-weight: bold;';
    } else if (CENSORSHIP_HIGH.includes(country.iso_code)) {
        totalScore -= 5;
        censorshipStatus = 'Yes, high (-5)';
        censorshipColor  = 'color: #e67e22;';
    }

let hantaStatus = 'No active outbreak', hantaColor = '', hantaBadge = '';
    if (country.hantaInfo) {
        const sigs = country.hantaInfo.signals30d || 0;
        
        if (sigs >= 35) {
            totalScore  -= 100;
            hantaStatus  = 'Life-Threatening Outbreak (-100)';
            hantaColor   = 'color: #900c3f; font-weight: bold;';
            hantaBadge   = `<a href="https://hantaflow.com/" target="_blank" style="text-decoration:none;"><span style="background-color:#900c3f;color:white;font-size:12px;padding:3px 8px;border-radius:12px;margin-left:10px;font-weight:bold;vertical-align:middle;box-shadow:0 2px 4px rgba(0,0,0,0.1);">☣️ Hantavirus: Life-Threatening</span></a>`;
        } else if (sigs >= 20) {
            totalScore  -= 60;
            hantaStatus  = 'High Risk Outbreak (-60)';
            hantaColor   = 'color: #c0392b; font-weight: bold;';
            hantaBadge   = `<a href="https://hantaflow.com/" target="_blank" style="text-decoration:none;"><span style="background-color:#c0392b;color:white;font-size:12px;padding:3px 8px;border-radius:12px;margin-left:10px;font-weight:bold;vertical-align:middle;box-shadow:0 2px 4px rgba(0,0,0,0.1);">☣️ Hantavirus: High Risk</span></a>`;
        } else if (sigs >= 10) {
            totalScore  -= 15;
            hantaStatus  = 'Moderate Outbreak (-15)';
            hantaColor   = 'color: #e67e22; font-weight: bold;';
            hantaBadge   = `<a href="https://hantaflow.com/" target="_blank" style="text-decoration:none;"><span style="background-color:#e67e22;color:white;font-size:12px;padding:3px 8px;border-radius:12px;margin-left:10px;font-weight:bold;vertical-align:middle;box-shadow:0 2px 4px rgba(0,0,0,0.1);">☣️ Hantavirus: Moderate</span></a>`;
        } else if (sigs >= 5) {
            totalScore  -= 5;
            hantaStatus  = 'Mild Outbreak (-5)';
            hantaColor   = 'color: #f39c12;';
            hantaBadge   = `<a href="https://hantaflow.com/" target="_blank" style="text-decoration:none;"><span style="background-color:#f39c12;color:white;font-size:12px;padding:3px 8px;border-radius:12px;margin-left:10px;font-weight:bold;vertical-align:middle;box-shadow:0 2px 4px rgba(0,0,0,0.1);">☣️ Hantavirus: Mild</span></a>`;
        }
    }

    let connectivityStatus = '', connectivityColor = '';
    if (IATA_TOP_20.includes(country.iso_code)) {
        totalScore += 5;
        connectivityStatus = 'Top 20 Globally (+5)';
        connectivityColor  = 'color: #27ae60;';
    } else if (IATA_21_80.includes(country.iso_code)) {
        connectivityStatus = 'Ranked 21-80 (0)';
        connectivityColor  = 'color: #7f8c8d;';
    } else if (IATA_81_100.includes(country.iso_code)) {
        totalScore -= 5;
        connectivityStatus = 'Ranked 81-100 (-5)';
        connectivityColor  = 'color: #e67e22;';
    } else if (MICROSTATES.includes(country.iso_code)) {
        connectivityStatus = 'Not Listed (Microstate Exemption, 0)';
        connectivityColor  = 'color: #7f8c8d;';
    } else {
        totalScore -= 10;
        connectivityStatus = 'Not in Top 100 (-10)';
        connectivityColor  = 'color: #c0392b; font-weight: bold;';
    }

    let michelinStatus = 'No', michelinColor = '';
    if (MICHELIN_TOP_10.includes(country.iso_code)) {
        totalScore += 2.5;
        michelinStatus = 'Top 10 Globally (+2.5)';
        michelinColor  = 'color: #27ae60;';
    }

    let soloBonusText = '';
    if (isSoloMode) {
        for (const [tier, { points, codes }] of Object.entries(SOLO_TIERS)) {
            if (codes.includes(country.iso_code)) {
                totalScore   += points;
                soloBonusText = `*Solo Travel ${tier}-Tier consensus bonus applied (+${points})`;
                break;
            }
        }
    }

    totalScore = isSoloMode
        ? Math.max(0, totalScore * 0.80)
        : Math.max(0, totalScore);

    return {
        score: totalScore,
        penaltyApplied,
        isolationPenaltyText,
        microstatePenaltyText,
        eurocentricPenaltyText,
        advisoryLevel,
        advisoryWarning,
        displayGdp,
        gdpScore,
        displayCli,
        cliScore,
        isNatureTop8,
        muslimFriendlyStatus,
        muslimFriendlyColor,
        holySiteStatus,
        overtourismStatus,
        overtourismColor,
        censorshipStatus,
        censorshipColor,
        hantaStatus,
        hantaColor,
        hantaBadge,
        connectivityStatus,
        connectivityColor,
        michelinStatus,
        michelinColor,
        unescoCombinedStatus,
        unescoCombinedColor,
        soloBonusText,
    };
}

function matchesSearch(country, term) {
    if (country.country.toLowerCase().includes(term)) return true;
    const rule = SEARCH_ALIASES.find(r => country.country.toLowerCase().includes(r.target));
    return rule ? rule.keywords.some(k => k.includes(term)) : false;
}

function scoreColor(s) {
    if (s >= 80) return 'var(--green)';
    if (s >= 50) return 'var(--amber)';
    if (s >= 40) return 'var(--red)';
    return '#9b1c1c';
}

function processAndRenderData() {
    const isSoloMode = document.getElementById('soloToggle').checked;

    if (scoreCache === null || isSoloMode !== lastSoloMode) {
        const processed = rawCountriesData.map(({ country, liveAqi, countryAdvisory }) => {
            const calc = calculateFinalScore(country, liveAqi, countryAdvisory, isSoloMode);
            return { ...country, ...calc, final_score: calc.score };
        });
        processed.sort((a, b) => b.final_score - a.final_score);
        processed.forEach((c, i) => { c.original_rank = i + 1; });
        scoreCache   = processed;
        lastSoloMode = isSoloMode;
        allCountriesData = scoreCache;
    }

    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim() ?? '';
    const filtered   = searchTerm ? scoreCache.filter(c => matchesSearch(c, searchTerm)) : scoreCache;
    renderList(filtered);
}

function renderList(rankedCountries) {
    const container = document.getElementById('results-container');
    document.getElementById('loading').style.display = 'none';

    const openIsos = new Set(
        [...document.querySelectorAll('.details.show')]
            .map(d => d.closest('.country-card')?.querySelector('.country-name')?.dataset?.iso)
            .filter(Boolean)
    );

    let html = '';

    rankedCountries.forEach(c => {
        let overtourismBadge = '';
        if (OVERTOURISM_NATIONS.includes(c.iso_code)) {
            overtourismBadge = `<span style="background-color:#c0392b;color:white;font-size:12px;padding:3px 8px;border-radius:12px;margin-left:6px;font-weight:bold;vertical-align:middle;box-shadow:0 2px 4px rgba(0,0,0,0.1);">⚠️ Overtourism</span>`;
        }

        const femicideText   = c.penaltyApplied        ? `<span class="penalty-flag">*Femicide data missing — homicide penalty applied (1.7×)</span>` : '';
        const isolationText  = c.isolationPenaltyText   ? `<span class="penalty-flag">${c.isolationPenaltyText}</span>` : '';
        const microText      = c.microstatePenaltyText  ? `<span class="penalty-flag">${c.microstatePenaltyText}</span>` : '';
        const euroText       = c.eurocentricPenaltyText ? `<span class="penalty-flag">${c.eurocentricPenaltyText}</span>` : '';
        const soloText       = c.soloBonusText          ? `<span class="penalty-flag" style="color:#27ae60;">${c.soloBonusText}</span>` : '';

        let statusText = '', statusClass = '';
        if      (c.final_score >= 80) { statusText = '✦ Highly Recommended'; statusClass = 'status-highly-recommended'; }
        else if (c.final_score >= 50) { statusText = '◎ Okay to Visit';      statusClass = 'status-okay'; }
        else if (c.final_score >= 40) { statusText = '⚠ Avoid Visiting';    statusClass = 'status-avoid'; }
        else                          { statusText = '✕ Do Not Visit';       statusClass = 'status-danger'; }

        if (c.country === 'Palestine') statusText += ' · #FreePalestine';

        let advisoryToast = '';
        if (c.advisoryLevel && c.advisoryLevel >= 3) {
            const toastClass = c.advisoryLevel >= 4 ? 'advisory-level-4' : 'advisory-level-3';
            const inner      = `<span class="advisory-toast ${toastClass}">⚠️ Level ${c.advisoryLevel}: ${c.advisoryWarning}</span>`;
            advisoryToast = c.advisoryPageUrl
                ? `<a href="${c.advisoryPageUrl}" target="_blank" style="text-decoration:none;" onclick="event.stopPropagation();">${inner}</a>`
                : inner;
        }

        const displayScore = c.final_score.toFixed(2);
        const isInBucket = userBucketList.includes(c.country);
        const bucketBtnText = isInBucket ? '✓ Added to Bucket List' : '➕ Add to Bucket List';
        const bucketBtnClass = isInBucket ? 'bucket-add-btn added' : 'bucket-add-btn';

        html += `
<div class="country-card">
    <div class="card-header">
        <h2 style="margin:0;">
            <span class="rank-number">#${c.original_rank}</span>
            <span class="country-name" data-name="${c.country}" data-iso="${c.iso_code}">${c.country}</span>${overtourismBadge}${c.hantaBadge || ''}
            <span class="status-indicator ${statusClass}">${statusText}</span>
            ${advisoryToast}
        </h2>
        <div class="score" style="color:${scoreColor(c.final_score)}">${displayScore}</div>
    </div>
    <div class="details">
        <div class="country-images" style="display:flex;gap:10px;margin-bottom:0;width:100%;"></div>
        <button class="${bucketBtnClass}" data-country="${c.country}">${bucketBtnText}</button>
        <div class="stats-grid">
            <div class="stat-box"><span class="stat-label">General Risk (Higher is Worse)</span><span class="stat-value">${c.scores_raw.gpi}</span></div>
            <div class="stat-box"><span class="stat-label">Geopolitical Situation Risk (Higher is Worse)</span><span class="stat-value">${c.scores_raw.gti}</span></div>
            <div class="stat-box"><span class="stat-label">Diplomacy Score (Higher is Better)</span><span class="stat-value">${c.scores_raw.passport_vfs}</span></div>
            <div class="stat-box"><span class="stat-label">Homicides per 100K (Higher is Worse)</span><span class="stat-value">${c.scores_raw.homicide_rate}</span></div>
            <div class="stat-box"><span class="stat-label">Sexual Crime Risk · Global Avg 40 (Higher is Worse)</span><span class="stat-value">${c.scores_raw.rape_rate}</span></div>
            <div class="stat-box"><span class="stat-label">GDP Score (0–10, 10 is Highly Developed)</span><span class="stat-value">${c.displayGdp !== 'Data Missing' ? `${c.displayGdp} (+${c.gdpScore.toFixed(2)})` : 'Data Unavailable'}</span></div>
            <div class="stat-box"><span class="stat-label">Cost of Living (0–10, 10 is Cheaper)</span><span class="stat-value">${c.displayCli !== 'Data Missing' ? `${c.displayCli} (+${c.cliScore.toFixed(2)})` : 'Data Unavailable'}</span></div>
            <div class="stat-box"><span class="stat-label">UNESCO Heritage Sites</span><span class="stat-value" style="${c.unescoCombinedColor}">${c.unescoCombinedStatus}</span></div>
            <div class="stat-box"><span class="stat-label">Top 8 Most Beautiful Nature Landscapes?</span><span class="stat-value" style="${c.isNatureTop8.startsWith('Yes') ? 'color:#27ae60;' : ''}">${c.isNatureTop8}</span></div>
            <div class="stat-box"><span class="stat-label">Muslim-Friendly Travel?</span><span class="stat-value" style="${c.muslimFriendlyColor}">${c.muslimFriendlyStatus}</span></div>
            <div class="stat-box"><span class="stat-label">Major Religious Pilgrimage Site?</span><span class="stat-value" style="${c.holySiteStatus !== 'None' ? 'color:#8e44ad;font-weight:bold;' : ''}">${c.holySiteStatus}</span></div>
            <div class="stat-box"><span class="stat-label">Suffering from Overtourism?</span><span class="stat-value" style="${c.overtourismColor}">${c.overtourismStatus}</span></div>
            <div class="stat-box"><span class="stat-label">Strict Laws & Censorship?</span><span class="stat-value" style="${c.censorshipColor}">${c.censorshipStatus}</span></div>
            <div class="stat-box"><span class="stat-label">Flight Connectivity (IATA Rank)</span><span class="stat-value" style="${c.connectivityColor}">${c.connectivityStatus}</span></div>
            <div class="stat-box"><span class="stat-label">Top 10 Most Michelin Stars?</span><span class="stat-value" style="${c.michelinColor}">${c.michelinStatus}</span></div>
            <div class="stat-box"><span class="stat-label">Hantavirus Risk (Live)</span><span class="stat-value" style="${c.hantaColor || 'color:#27ae60;'}">${c.hantaStatus || 'No active outbreak'}</span></div>
        </div>
        <div style="padding:0.5rem 0 0.25rem;display:flex;flex-direction:column;gap:3px;">
            ${femicideText}${isolationText}${microText}${euroText}${soloText}
        </div>
    </div>
</div>`;
    });

    container.innerHTML = html;

    openIsos.forEach(iso => {
        const nameEl  = container.querySelector(`[data-iso="${iso}"]`);
        if (!nameEl) return;
        const card    = nameEl.closest('.country-card');
        const details = card?.querySelector('.details');
        if (!details) return;
        details.classList.add('show');
        const imgContainer = details.querySelector('.country-images');
        if (imgContainer && !imgContainer.dataset.loaded) {
            imgContainer.dataset.loaded = 'true';
            imgContainer.innerHTML = '<div class="shimmer-box"></div><div class="shimmer-box"></div>';
            fetchCountryImages(nameEl.dataset.name, nameEl.dataset.iso).then(images => {
                if (images.length > 0) {
                    imgContainer.innerHTML = images.map(url => `<img src="${url}" alt="" loading="lazy" style="flex:1;height:190px;object-fit:cover;border-radius:8px;">`).join('');
                } else {
                    imgContainer.style.display = 'none';
                }
            });
        }
    });

    container.querySelectorAll('.card-header').forEach(header => {
        header.addEventListener('click', async function () {
            const details = this.nextElementSibling;
            details.classList.toggle('show');

            if (!details.classList.contains('show')) return;

            const imgContainer = details.querySelector('.country-images');
            if (!imgContainer || imgContainer.dataset.loaded) return;

            imgContainer.dataset.loaded = 'true';
            imgContainer.innerHTML = '<div class="shimmer-box"></div><div class="shimmer-box"></div>';

            const nameEl = this.querySelector('.country-name');
            const images = await fetchCountryImages(nameEl.dataset.name, nameEl.dataset.iso);

            if (images.length > 0) {
                imgContainer.innerHTML = images.map(url =>
                    `<img src="${url}" alt="" loading="lazy" style="flex:1;height:190px;object-fit:cover;border-radius:8px;">`
                ).join('');
            } else {
                imgContainer.style.display = 'none';
            }
        });
    });
}

async function init() {
    try {
        const staticData = await fetchStaticData();

        const aqiMap = {};
        for (const c of staticData) aqiMap[c.iso_code] = computeAqi(c.iso_code);

        rawCountriesData = staticData.map(country => ({
            country:        { ...country, hantaInfo: null },
            liveAqi:        aqiMap[country.iso_code],
            countryAdvisory: null,
        }));

        processAndRenderData();

        updateBucketUI();

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.style.display = 'block';
            searchInput.addEventListener('input', processAndRenderData);
        }

        document.getElementById('soloToggle')?.addEventListener('change', () => {
            scoreCache = null;
            processAndRenderData();
        });

        const [advResult, hantaResult] = await Promise.allSettled([
            fetchAdvisories(),
            fetchHantaData(),
        ]);

        const advisories = advResult.status   === 'fulfilled' ? advResult.value   : {};
        const hantaMap   = hantaResult.status === 'fulfilled' ? hantaResult.value : {};

        rawCountriesData = staticData.map(country => ({
            country:        { ...country, hantaInfo: hantaMap[country.iso_code] ?? null },
            liveAqi:        aqiMap[country.iso_code],
            countryAdvisory: advisories[country.iso_code] ?? null,
        }));

        scoreCache = null;
        processAndRenderData();

    } catch (err) {
        console.error('Failed to load data:', err);
        const el = document.getElementById('loading');
        if (el) el.innerText = 'Error loading data. Please refresh.';
    }

    document.getElementById('downloadBtn')?.addEventListener('click', () => {
        const isSolo = document.getElementById('soloToggle')?.checked ?? false;
        const rows   = [...document.querySelectorAll('#results-container .country-card')].map((card, i) => ({
            rank:    i + 1,
            country: card.querySelector('.country-name')?.dataset.name ?? '',
            score:   card.querySelector('.score')?.textContent?.trim()  ?? '',
        }));
        downloadCSV(rows, isSolo);
    });
}

function downloadCSV(rows, isSoloMode) {
    let csv = 'Rank,Country,Score\n';
    rows.forEach(r => { csv += `${r.rank},"${r.country}",${r.score}\n`; });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href     = URL.createObjectURL(blob);
    link.download = isSoloMode ? 'solo_travel_rankings.csv' : 'travel_rankings.csv';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

async function fetchWithTimeout(url, ms = 4000) {
    const ctrl = new AbortController();
    const id   = setTimeout(() => ctrl.abort(), ms);
    const res  = await fetch(url, { signal: ctrl.signal });
    clearTimeout(id);
    return res;
}

async function getCapitalCity(isoCode) {
    try {
        const res = await fetchWithTimeout(`https://restcountries.com/v3.1/alpha/${isoCode}`, 3000);
        if (res.ok) {
            const data = await res.json();
            return data[0]?.capital?.[0] ?? null;
        }
    } catch {}
    return null;
}

async function fetchWikipediaFallback(countryName, capitalName) {
    async function wikiSearch(term) {
        const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(term)}&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url&format=json&origin=*`;
        try {
            const res   = await fetchWithTimeout(url, 5000);
            const data  = await res.json();
            const pages = data.query?.pages;
            if (!pages) return [];

            const valid = [];
            for (const key in pages) {
                const imgUrl = pages[key].imageinfo?.[0]?.url;
                const title  = pages[key].title ?? '';
                if (!imgUrl) continue;

                const lower = imgUrl.toLowerCase();
                if (!lower.endsWith('.jpg') && !lower.endsWith('.jpeg') && !lower.endsWith('.png')) continue;
                if (lower.includes('map') || lower.includes('flag') || lower.includes('logo') || lower.includes('icon')) continue;

                const clean     = title.replace(/^File:/i, '').replace(/\.[a-zA-Z0-9]+$/i, '').trim();
                const lowerClean = clean.toLowerCase();
                const lowerTerm  = term.toLowerCase();
                const wordCount  = clean.split(/\s+/).length;

                if      (lowerClean === lowerTerm)          valid.push({ url: imgUrl, rank: 1, wordCount });
                else if (lowerClean.includes(lowerTerm))    valid.push({ url: imgUrl, rank: 2, wordCount });
            }

            valid.sort((a, b) => a.rank !== b.rank ? a.rank - b.rank : a.wordCount - b.wordCount);
            return valid.map(v => v.url);
        } catch { return []; }
    }

    let urls = capitalName ? await wikiSearch(capitalName) : [];
    if (!urls.length)       urls = await wikiSearch(countryName);
    return urls.slice(0, 2);
}

async function fetchCountryImages(countryName, isoCode) {
    const cacheKey   = `pixabay_cache_${isoCode}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) return parsed.urls;
    }

    const capitalName = await getCapitalCity(isoCode);

    const stopWords = ['of','the','and','republic','democratic','united','states','kingdom','islands','island','central','federation','people','virgin'];
    const required  = countryName.toLowerCase().split(/[\s-]+/).filter(w => !stopWords.includes(w) && w.length > 2);
    if (capitalName) required.push(capitalName.toLowerCase());

    let urls = [], pixabaySuccess = false;

    try {
        const query  = encodeURIComponent(countryName);
        let fetchUrl = `https://pixabay.com/api/?key=${getPixabayKey()}&q=${query}&image_type=photo&orientation=horizontal&category=places&per_page=5`;
        let res      = await fetchWithTimeout(fetchUrl);

        if (res.status === 429 && activePixabayKey === 'primary') {
            activePixabayKey = 'backup';
            fetchUrl         = `https://pixabay.com/api/?key=${getPixabayKey()}&q=${query}&image_type=photo&orientation=horizontal&category=places&per_page=5`;
            res              = await fetchWithTimeout(fetchUrl);
        }

        if (res.ok) {
            const data = await res.json();
            if (data.hits?.length) {
                const valid = [];
                for (const hit of data.hits) {
                    const meta = `${hit.tags || ''} ${hit.pageURL || ''}`.toLowerCase();
                    if (required.some(kw => meta.includes(kw))) {
                        valid.push(hit.webformatURL);
                        if (valid.length === 2) break;
                    }
                }
                if (valid.length) { urls = valid; pixabaySuccess = true; }
            }
        }
    } catch {}

    if (!pixabaySuccess || !urls.length) {
        urls = await fetchWikipediaFallback(countryName, capitalName);
    }

    if (urls.length) {
        localStorage.setItem(cacheKey, JSON.stringify({ urls, timestamp: Date.now() }));
    }

    return urls;
}

init();

function updateBucketUI() {
    const icon = document.getElementById('bucketIcon');
    const count = document.getElementById('bucketCount');
    if (userBucketList.length === 0) {
        icon.classList.add('empty');
    } else {
        icon.classList.remove('empty');
    }
    count.textContent = userBucketList.length;
}

function toggleBucketItem(countryName) {
    const index = userBucketList.indexOf(countryName);
    if (index > -1) {
        userBucketList.splice(index, 1);
    } else {
        userBucketList.push(countryName);
    }
    localStorage.setItem('tvi-bucketlist', JSON.stringify(userBucketList));
    updateBucketUI();
    processAndRenderData();
}

document.getElementById('bucketIcon').addEventListener('click', () => {
    const modal = document.getElementById('bucketModal');
    const listContainer = document.getElementById('bucketListContainer');
    listContainer.innerHTML = '';
    
    userBucketList.forEach(c => {
        const li = document.createElement('li');
        li.textContent = c;
        listContainer.appendChild(li);
    });
    
    modal.classList.add('show');
});

document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('bucketModal').classList.remove('show');
});

document.getElementById('bucketCsvBtn').addEventListener('click', () => {
    if (userBucketList.length === 0) return;
    let csv = 'Bucket List\n';
    userBucketList.forEach(c => { csv += `"${c}"\n`; });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'my_bucket_list.csv';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
});

document.getElementById('bucketPrintBtn').addEventListener('click', () => {
    window.print();
});

function getShareText() {
    const list = "My Travel Bucket List:\n" + userBucketList.join('\n');
    return encodeURIComponent(list);
}

document.getElementById('shareXBtn').addEventListener('click', () => {
    window.open(`https://twitter.com/intent/tweet?text=${getShareText()}`, '_blank');
});

document.getElementById('shareThreadsBtn').addEventListener('click', () => {
    window.open(`https://threads.net/intent/post?text=${getShareText()}`, '_blank');
});

document.getElementById('bucketAiBtn').addEventListener('click', () => {
    if (userBucketList.length === 0) return alert("Your bucket list is empty!");

    const promptText = `I have a travel bucket list, based on rankings on https://ammariskandar.github.io/tourist-viability-index/ and I need some help planning my trip(s). Here is/are my list of countries:\n\n` + 
                       userBucketList.map(c => `- ${c}`).join('\n') + 
                       `\n\nCan you help me create an itinerary, identify the best time to visit, and/or suggest hidden gems for these countries?`;

    navigator.clipboard.writeText(promptText).then(() => {
        alert("Prompt copied to clipboard! Now Claude...");
        window.open('https://claude.ai/', '_blank');
    });
});

document.getElementById('results-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('bucket-add-btn')) {
            const country = e.target.getAttribute('data-country');
            toggleBucketItem(country);
            e.stopPropagation();
        }
    });