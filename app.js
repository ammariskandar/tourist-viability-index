let userBucketList = JSON.parse(localStorage.getItem("tvi-bucketlist")) || [];
let allCountriesData = [];
let rawCountriesData = [];
let scoreCache = null;
let lastSoloMode = null;

const WEIGHTS = { gpi: 0.13, gti: 0.22, diplomacy: 0.02, aqi: 0.01 };

const MICROSTATES = [
  "VA",
  "MC",
  "NR",
  "TV",
  "SM",
  "LI",
  "MH",
  "KN",
  "MV",
  "MT",
  "AD",
  "PW",
  "FM",
  "VC",
  "BB",
  "AG",
  "SC",
  "BN",
  "SG",
];
const EUROCENTRIC_NATIONS = [
  "AL",
  "BE",
  "BG",
  "CA",
  "HR",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IS",
  "IT",
  "LV",
  "LT",
  "LU",
  "ME",
  "MK",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "TR",
  "GB",
  "US",
  "AT",
  "CH",
  "IE",
  "VA",
  "MC",
  "SM",
  "LI",
  "MH",
  "KN",
  "MT",
  "AD",
  "VC",
  "BB",
  "AG",
];
const UNESCO_TOP_15 = [
  "IT",
  "CN",
  "DE",
  "ES",
  "FR",
  "IN",
  "MX",
  "GB",
  "RU",
  "IR",
  "US",
  "JP",
  "BR",
  "CA",
  "TR",
];
const UNESCO_MIN_6 = [
  "IT",
  "CN",
  "DE",
  "FR",
  "ES",
  "IN",
  "MX",
  "GB",
  "RU",
  "IR",
  "US",
  "JP",
  "BR",
  "CA",
  "TR",
  "AU",
  "GR",
  "PL",
  "CZ",
  "PT",
  "KR",
  "BE",
  "SE",
  "PE",
  "NL",
  "CH",
  "ET",
  "ZA",
  "AR",
  "AT",
  "RO",
  "DK",
  "ID",
  "BG",
  "HR",
  "CO",
  "MA",
  "TN",
  "CU",
  "IL",
  "VN",
  "TH",
  "KE",
  "UA",
  "SA",
  "LK",
  "HU",
  "SK",
  "EG",
  "TZ",
  "DZ",
  "UZ",
  "CL",
  "SN",
  "BO",
  "JO",
  "FI",
  "PK",
  "PH",
  "IQ",
  "SY",
  "KZ",
  "LB",
  "MN",
];
const NATURE_TOP_8 = ["GR", "IT", "CH", "ES", "NZ", "TH", "NO", "IS"];
const MUSLIM_MAJORITY = [
  "MV",
  "MR",
  "IR",
  "SO",
  "AF",
  "DJ",
  "EH",
  "DZ",
  "MA",
  "KM",
  "NE",
  "TJ",
  "TN",
  "PS",
  "AZ",
  "JO",
  "SN",
  "YE",
  "LY",
  "YT",
  "PK",
  "GM",
  "ML",
  "SA",
  "SD",
  "IQ",
  "TM",
  "XK",
  "TR",
  "BD",
  "EG",
  "GN",
  "UZ",
  "ID",
  "SY",
  "OM",
  "BN",
  "KG",
  "SL",
  "QA",
  "KW",
  "BH",
  "AE",
  "KZ",
  "LB",
  "BF",
  "MY",
  "TD",
  "ER",
  "AL",
  "BA",
];
const MUSLIM_FRIENDLY = [
  "NG",
  "ET",
  "TZ",
  "RU",
  "CN",
  "CD",
  "CI",
  "CM",
  "GH",
  "MZ",
  "TH",
  "DE",
  "AU",
  "NZ",
  "TW",
  "SG",
  "JP",
];
const MUSLIM_HOSTILE = ["FR", "IN", "US", "IL", "GB"];
const HOLY_SITE_MUSLIM = ["SA"];
const HOLY_SITE_ABRAHAMIC = ["IL", "PS"];
const HOLY_SITE_CATHOLIC = ["IT", "VA"];
const HOLY_SITE_ORTHODOX = ["RU", "GR"];
const OVERTOURISM_NATIONS = [
  "ES",
  "IT",
  "GR",
  "NL",
  "FR",
  "JP",
  "TH",
  "VA",
  "MA",
];
const CENSORSHIP_ABSOLUTE = ["KP", "TM"];
const CENSORSHIP_HIGH = ["ER", "CN", "IR", "CU", "BY"];
const IATA_TOP_20 = [
  "US",
  "GB",
  "CN",
  "DE",
  "JP",
  "ES",
  "IT",
  "AE",
  "FR",
  "IN",
  "TH",
  "KR",
  "TR",
  "CA",
  "SG",
  "MX",
  "HK",
  "SA",
  "TW",
  "MY",
];
const IATA_21_80 = [
  "VN",
  "AU",
  "ID",
  "NL",
  "CH",
  "QA",
  "PT",
  "GR",
  "PH",
  "EG",
  "IE",
  "PL",
  "RU",
  "AT",
  "DK",
  "BR",
  "PK",
  "BE",
  "MA",
  "SE",
  "DO",
  "NO",
  "CO",
  "KW",
  "FI",
  "RO",
  "IL",
  "CZ",
  "HU",
  "NZ",
  "PA",
  "BD",
  "AR",
  "ZA",
  "ET",
  "CY",
  "BH",
  "OM",
  "LK",
  "DZ",
  "IR",
  "JO",
  "HR",
  "PE",
  "RS",
  "KH",
  "CL",
  "CR",
  "UZ",
  "TN",
  "LB",
  "KZ",
  "MO",
  "IQ",
  "MV",
  "JM",
  "IS",
  "NP",
  "KE",
  "BG",
];
const IATA_81_100 = [
  "MT",
  "SV",
  "AZ",
  "GE",
  "AL",
  "BS",
  "NG",
  "EC",
  "CU",
  "GT",
  "LV",
  "MU",
  "LU",
  "MD",
  "TZ",
  "LT",
  "AW",
  "LA",
  "MM",
  "AM",
];
const MICHELIN_TOP_10 = [
  "FR",
  "AE",
  "IT",
  "JP",
  "DE",
  "ES",
  "US",
  "GB",
  "CH",
  "CN",
];
const LANG_TIER_5 = [
  // English Native
  "GB",
  "US",
  "AU",
  "NZ",
  "CA",
  "IE",
  // English Very High Proficiency
  "NL",
  "HR",
  "AT",
  "DE",
  "NO",
  "PT",
  "DK",
  "SE",
  "BE",
  "SK",
  "RO",
  "FI",
  "ZA",
  "ZW",
  "PL",
  // Chinese Native/Official
  "CN",
  "TW",
  "SG",
  // Spanish Native/Official
  "DO",
  "SV",
  "CR",
  "CO",
  "PR",
  "HN",
  "UY",
  "AR",
  "CU",
  "VE",
  "NI",
  "MX",
  "CL",
  "GT",
  "ES",
  "PA",
  "PE",
  "BO",
  "EC",
  "GQ",
  "PY",
  // Arabic Native/Official
  "DZ",
  "BH",
  "TD",
  "KM",
  "DJ",
  "EG",
  "IQ",
  "JO",
  "KW",
  "LB",
  "LY",
  "ML",
  "MR",
  "MA",
  "OM",
  "PS",
  "QA",
  "SA",
  "SO",
  "SD",
  "SY",
  "TN",
  "AE",
  "YE",
];

const LANG_TIER_4_5 = [
  // English Second/Common Third
  "LV",
  "MK",
  "BG",
  "KE",
  "GR",
  "BA",
  "HU",
  "CZ",
  "MY",
  "RS",
  "ZM",
  "PH",
  "NG",
  "CH",
  "EE",
  "HN",
  // Chinese Second/Common Third
  "TH",
  "VN",
  // Arabic Second/Common Third
  "CY",
  "ER",
  "IR",
  "NE",
  "SN",
];

const WATER_RISK_HIGH = [
  "TD",
  "CF",
  "LS",
  "NE",
  "MG",
  "NG",
  "BF",
  "ER",
  "BI",
  "MW",
  "TG",
  "SL",
  "HT",
  "SZ",
  "ML",
  "LR",
  "ET",
  "ZW",
  "NA",
  "GW",
  "GN",
  "BJ",
  "BW",
  "MZ",
  "TZ",
  "KE",
  "PG",
  "KI",
  "ZM",
  "AO",
  "CM",
  "UG",
  "ZA",
  "IN",
  "RW",
  "GM",
  "DJ",
  "KM",
  "MR",
  "GH",
  "PK",
  "SN",
];
const WATER_SAFE = [
  "DE",
  "GB",
  "IT",
  "GR",
  "CH",
  "FI",
  "IE",
  "NO",
  "LU",
  "CA",
  "IS",
  "AU",
  "AT",
  "SG",
  "PT",
  "SE",
  "MT",
  "ES",
  "ME",
];
const ROAD_DEATHS_HIGH = [
  "GN",
  "LY",
  "HT",
  "GW",
  "SY",
  "ZW",
  "YE",
  "KM",
  "KE",
  "NP",
  "BF",
  "DO",
  "TD",
  "GH",
  "CF",
  "TH",
];
const ROAD_DEATHS_LOW = [
  "MV",
  "NO",
  "SG",
  "MT",
  "SE",
  "DK",
  "GB",
  "CH",
  "IS",
  "AD",
  "JP",
  "IE",
  "DE",
  "NL",
  "ES",
  "BN",
  "CY",
  "LU",
  "IL",
  "FI",
  "EE",
  "AU",
  "BE",
  "AT",
  "FR",
  "CA",
  "PS",
  "VC",
  "IT",
  "TT",
  "CZ",
  "FJ",
  "CU",
  "MK",
  "SI",
  "AE",
  "SM",
  "KI",
  "LT",
  "SK",
  "GD",
  "TR",
  "PL",
  "NZ",
  "SC",
  "KR",
  "PT",
  "GR",
  "PA",
  "QA",
  "HU",
  "BY",
  "RS",
  "AG",
  "TM",
  "NR",
  "HR",
  "BH",
  "BG",
  "CG",
  "TO",
  "AR",
  "LC",
  "MD",
  "ME",
  "KW",
  "UZ",
  "EG",
  "MR",
  "RO",
  "WS",
  "PH",
  "LB",
  "MU",
  "LV",
  "BB",
];
const DIVERSITY_HIGH = [
  "LR",
  "UG",
  "TG",
  "NP",
  "ZA",
  "KE",
  "TD",
  "ML",
  "NG",
  "GW",
  "PH",
  "ID",
  "TL",
  "SL",
  "MW",
  "CF",
  "GA",
  "ET",
  "AO",
  "BF",
  "KW",
  "BJ",
  "AF",
  "GM",
  "NA",
  "PK",
  "SN",
  "SD",
  "IR",
  "GH",
  "CI",
  "CA",
  "GN",
  "MR",
  "QA",
  "ZM",
  "CG",
  "CD",
  "GY",
  "AE",
  "ES",
  "NE",
  "ER",
  "TT",
  "BT",
  "DJ",
  "CO",
  "BA",
  "LA",
  "PE",
  "PA",
  "OM",
  "BE",
  "TZ",
  "MM",
  "MX",
  "BH",
  "BO",
  "MY",
  "MA",
  "MK",
  "BR",
  "LV",
  "NI",
  "KZ",
  "EC",
  "FJ",
  "US",
  "TR",
  "VE",
  "CU",
  "GT",
];

const SOLO_TIERS = {
  S: { points: 15, codes: ["SG", "JP", "AU", "NZ", "AE"] },
  A: { points: 10, codes: ["KR", "TW", "MY", "DK", "MT"] },
  B: {
    points: 5,
    codes: ["TH", "IS", "LV", "BE", "GR", "JO", "MC", "DE", "NO"],
  },
  C: { points: 2.5, codes: ["VN", "NP", "KH", "GB", "FR", "ES", "FI", "PT"] },
  D: { points: 1, codes: ["BW", "SA", "BN"] },
};

const SEARCH_ALIASES = [
  {
    target: "china",
    keywords: [
      "hong kong",
      "macao",
      "macau",
      "hk",
      "prc",
      "people's republic of china",
    ],
  },
  { target: "palestine", keywords: ["gaza", "west bank"] },
  {
    target: "united kingdom",
    keywords: [
      "northern ireland",
      "scotland",
      "wales",
      "england",
      "uk",
      "gb",
      "great britain",
      "gibraltar",
    ],
  },
  {
    target: "united states",
    keywords: [
      "hawaii",
      "puerto rico",
      "guam",
      "american samoa",
      "u.s.",
      "us",
      "usa",
      "u.s.a",
      "united states of america",
      "america",
    ],
  },
  {
    target: "taiwan",
    keywords: ["taipei", "chinese taipei", "republic of china", "roc"],
  },
  { target: "central african republic", keywords: ["c.a.r.", "car"] },
  { target: "democratic republic of the congo", keywords: ["drc", "dr congo"] },
  { target: "timor-leste", keywords: ["timor leste", "east timor"] },
  {
    target: "north korea",
    keywords: ["dprk", "democratic people's republic of korea"],
  },
  { target: "new zealand", keywords: ["nz"] },
  {
    target: "united arab emirates",
    keywords: ["uae", "u.a.e", "dubai", "abu dhabi"],
  },
  { target: "vatican city", keywords: ["pope", "pontifice", "bishop of rome"] },
  {
    target: "saudi arabia",
    keywords: ["kingdom of saudi arabia", "mecca", "medina"],
  },
  { target: "south korea", keywords: ["republic of korea", "sk"] },
];

const PIXABAY_KEYS = {
  primary: "NTU2NDcwMDctZWM4NjNmZTY0NzIwY2ZhN2UxODQ1MDFiMg==",
  backup: "NTU2NDc0NjMtYmU2N2UwYzFhNDkyNGY0OTc1NGY3MWUxMg==",
};

let activePixabayKey = "primary";
const getPixabayKey = () => atob(PIXABAY_KEYS[activePixabayKey]);

function sessionGet(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > 30 * 60 * 1000) return null;
    return data;
  } catch {
    return null;
  }
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
  const res = await fetch("./countries_safety_data.json");
  return res.json();
}

async function fetchAdvisories() {
  const cached = sessionGet("tvi_advisory_v1");
  if (cached) return cached;
  try {
    const res = await fetch("https://smartraveller.kevle.xyz/api/advisories");
    if (!res.ok) return {};
    const json = await res.json();
    const map = {};
    if (json?.advisories) {
      json.advisories.forEach((item) => {
        if (item.country?.alpha2) map[item.country.alpha2] = item;
      });
    }
    sessionSet("tvi_advisory_v1", map);
    return map;
  } catch {
    return {};
  }
}

async function fetchHantaData() {
  const cached = sessionGet("tvi_hanta_v2");
  if (cached) return cached;
  try {
    const res = await fetch("https://hantaflow.com/api/countries.json");
    if (!res.ok) return {};
    const json = await res.json();
    const map = {};

    if (json?.countries) {
      json.countries.forEach((c) => {
        if (c.iso2) {
          map[c.iso2.toUpperCase()] = c;
        }
      });
    }
    sessionSet("tvi_hanta_v2", map);
    return map;
  } catch {
    return {};
  }
}

function calculateFinalScore(
  country,
  liveAqi,
  advisoryData,
  isSoloMode = false,
) {
  const raw = country.scores_raw;

  const gpiScore = ((5 - raw.gpi) / 4) * 100;
  const gtiScore = ((10 - raw.gti) / 10) * 100;
  const diplomacyScore = (raw.passport_vfs / 195) * 100;
  const aqiScore = Math.max(0, ((500 - liveAqi) / 500) * 100);

  let homicideScore,
    femicideScore,
    finalHomicideWeight,
    finalFemicideWeight,
    penaltyApplied;

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
    penaltyApplied = false;
  }

  let gdpScore = 5.0,
    displayGdp = "Data Missing";
  if (raw.gdp != null) {
    const logGdp = Math.log10(raw.gdp);
    gdpScore = Math.max(0, Math.min(10, ((logGdp - 7.5) / (13.5 - 7.5)) * 10));
    displayGdp = `$${(raw.gdp / 1_000_000_000).toFixed(2)} Billion`;
  }

  let cliScore = 4.5,
    displayCli = "Data Missing";
  if (raw.cli != null) {
    cliScore = Math.max(0, Math.min(10, ((80 - raw.cli) / (80 - 10)) * 10));
    displayCli = raw.cli;
  }

  let totalScore;

  if (isSoloMode) {
    totalScore =
      (gpiScore * WEIGHTS.gpi * 0.25 +
        gtiScore * WEIGHTS.gti * 1.25 +
        diplomacyScore * WEIGHTS.diplomacy +
        aqiScore * WEIGHTS.aqi +
        homicideScore * finalHomicideWeight * 1.25 +
        femicideScore * finalFemicideWeight * 1.25) *
        0.95 +
      gdpScore * 0.35 +
      cliScore * 0.15 -
      (raw.rape_rate / 35) * 5 * 1.15;
  } else {
    totalScore =
      (gpiScore * WEIGHTS.gpi +
        gtiScore * WEIGHTS.gti +
        diplomacyScore * WEIGHTS.diplomacy +
        aqiScore * WEIGHTS.aqi +
        homicideScore * finalHomicideWeight +
        femicideScore * finalFemicideWeight) *
        0.8 +
      gdpScore +
      cliScore -
      (raw.rape_rate / 35) * 2.5;
  }

  let isolationPenaltyText = "";
  if (raw.passport_vfs < 33) {
    totalScore -= 60;
    isolationPenaltyText = "*Extreme inaccessibility penalty applied (-60)";
  } else if (raw.passport_vfs < 50) {
    totalScore -= 10;
    isolationPenaltyText = "*High inaccessibility penalty applied (-10)";
  } else if (raw.passport_vfs < 55) {
    totalScore -= 5;
    isolationPenaltyText = "*Moderate inaccessibility penalty applied (-5)";
  }

  let advisoryLevel = null,
    advisoryWarning = null;
  if (advisoryData) {
    if (advisoryData.level >= 4) {
      totalScore -= isSoloMode ? 100 : 50;
      advisoryLevel = advisoryData.level;
      advisoryWarning = advisoryData.advice;
    } else if (advisoryData.level === 3) {
      totalScore -= isSoloMode ? 50 : 10;
      advisoryLevel = advisoryData.level;
      advisoryWarning = advisoryData.advice;
    }
  }

  let unescoCombinedStatus = "Standard (6+ Sites, 0)",
    unescoCombinedColor = "color: #7f8c8d;";
  if (UNESCO_TOP_15.includes(country.iso_code)) {
    totalScore += 5;
    unescoCombinedStatus = "Top 15 Globally (+5)";
    unescoCombinedColor = "color: #27ae60;";
  } else if (!UNESCO_MIN_6.includes(country.iso_code)) {
    if (MICROSTATES.includes(country.iso_code)) {
      totalScore -= 5;
      unescoCombinedStatus = "Less than 6 Sites (Microstate, -5)";
      unescoCombinedColor = "color: #ef6f00;";
    } else {
      totalScore -= 10;
      unescoCombinedStatus = "Less than 6 Sites (-10)";
      unescoCombinedColor = "color: #c0392b;";
    }
  }

  let isNatureTop8 = "No";
  if (NATURE_TOP_8.includes(country.iso_code)) {
    totalScore += 8;
    isNatureTop8 = "Yes (+8 Score)";
  }

  let muslimFriendlyStatus = "Neutral (0)",
    muslimFriendlyColor = "";
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

  let overtourismStatus = "No",
    overtourismColor = "";
  if (OVERTOURISM_NATIONS.includes(country.iso_code)) {
    const isMicro = MICROSTATES.includes(country.iso_code);
    if (isSoloMode) {
      totalScore -= isMicro ? 15 : 25;
      overtourismStatus = isMicro ? "Yes (-15, but Microstate)" : "Yes (-25)";
    } else {
      totalScore -= isMicro ? 5 : 10;
      overtourismStatus = isMicro ? "Yes (-5, but Microstate)" : "Yes (-10)";
    }
    overtourismColor = isMicro ? "color: #e67e22;" : "color: #c0392b;";
  }

  let censorshipStatus = "No",
    censorshipColor = "";
  if (CENSORSHIP_ABSOLUTE.includes(country.iso_code)) {
    totalScore -= 30;
    censorshipStatus = "Yes, absolute (-30)";
    censorshipColor = "color: #c0392b; font-weight: bold;";
  } else if (CENSORSHIP_HIGH.includes(country.iso_code)) {
    totalScore -= 5;
    censorshipStatus = "Yes, high (-5)";
    censorshipColor = "color: #e67e22;";
  }

  let hantaStatus = "No active outbreak",
    hantaColor = "",
    hantaBadge = "";
  if (country.hantaInfo) {
    const sigs = country.hantaInfo.signals30d || 0;

    if (sigs >= 35) {
      totalScore -= 100;
      hantaStatus = "Life-Threatening Outbreak (-100)";
      hantaColor = "color: #900c3f; font-weight: bold;";
      hantaBadge = `<a href="https://hantaflow.com/" target="_blank" style="text-decoration:none;"><span style="background-color:#900c3f;color:white;font-size:12px;padding:3px 8px;border-radius:12px;margin-left:10px;font-weight:bold;vertical-align:middle;box-shadow:0 2px 4px rgba(0,0,0,0.1);">☣️ Hantavirus: Life-Threatening</span></a>`;
    } else if (sigs >= 20) {
      totalScore -= 60;
      hantaStatus = "High Risk Outbreak (-60)";
      hantaColor = "color: #c0392b; font-weight: bold;";
      hantaBadge = `<a href="https://hantaflow.com/" target="_blank" style="text-decoration:none;"><span style="background-color:#c0392b;color:white;font-size:12px;padding:3px 8px;border-radius:12px;margin-left:10px;font-weight:bold;vertical-align:middle;box-shadow:0 2px 4px rgba(0,0,0,0.1);">☣️ Hantavirus: High Risk</span></a>`;
    } else if (sigs >= 10) {
      totalScore -= 15;
      hantaStatus = "Moderate Outbreak (-15)";
      hantaColor = "color: #e67e22; font-weight: bold;";
      hantaBadge = `<a href="https://hantaflow.com/" target="_blank" style="text-decoration:none;"><span style="background-color:#e67e22;color:white;font-size:12px;padding:3px 8px;border-radius:12px;margin-left:10px;font-weight:bold;vertical-align:middle;box-shadow:0 2px 4px rgba(0,0,0,0.1);">☣️ Hantavirus: Moderate</span></a>`;
    } else if (sigs >= 5) {
      totalScore -= 5;
      hantaStatus = "Mild Outbreak (-5)";
      hantaColor = "color: #f39c12;";
      hantaBadge = `<a href="https://hantaflow.com/" target="_blank" style="text-decoration:none;"><span style="background-color:#f39c12;color:white;font-size:12px;padding:3px 8px;border-radius:12px;margin-left:10px;font-weight:bold;vertical-align:middle;box-shadow:0 2px 4px rgba(0,0,0,0.1);">☣️ Hantavirus: Mild</span></a>`;
    }
  }

  let connectivityStatus = "",
    connectivityColor = "";
  if (IATA_TOP_20.includes(country.iso_code)) {
    totalScore += 5;
    connectivityStatus = "Top 20 Globally (+5)";
    connectivityColor = "color: #27ae60;";
  } else if (IATA_21_80.includes(country.iso_code)) {
    connectivityStatus = "Ranked 21-80 (0)";
    connectivityColor = "color: #7f8c8d;";
  } else if (IATA_81_100.includes(country.iso_code)) {
    totalScore -= 5;
    connectivityStatus = "Ranked 81-100 (-5)";
    connectivityColor = "color: #e67e22;";
  } else if (MICROSTATES.includes(country.iso_code)) {
    connectivityStatus = "Not Listed (Microstate Exemption, 0)";
    connectivityColor = "color: #7f8c8d;";
  } else {
    totalScore -= 10;
    connectivityStatus = "Not in Top 100 (-10)";
    connectivityColor = "color: #c0392b; font-weight: bold;";
  }

  let michelinStatus = "No",
    michelinColor = "";
  if (MICHELIN_TOP_10.includes(country.iso_code)) {
    totalScore += 2.5;
    michelinStatus = "Top 10 Globally (+2.5)";
    michelinColor = "color: #27ae60;";
  }

  let soloBonusText = "";
  if (isSoloMode) {
    for (const [tier, { points, codes }] of Object.entries(SOLO_TIERS)) {
      if (codes.includes(country.iso_code)) {
        totalScore += points;
        soloBonusText = `*Solo Travel ${tier}-Tier consensus bonus applied (+${points})`;
        break;
      }
    }
  }

  let langBonusStatus = "Standard (+0)";
  let langBonusColor = "";

  if (LANG_TIER_5.includes(country.iso_code)) {
    totalScore += 2.5;
    langBonusStatus = "Very High (+2.5)";
    langBonusColor = "color: var(--green);";
  } else if (LANG_TIER_4_5.includes(country.iso_code)) {
    totalScore += 1.5;
    langBonusStatus = "High (+1.5)";
    langBonusColor = "color: var(--green);";
  }

  let waterStatus = "Safe (0)";
  let waterColor = "";

  if (WATER_SAFE.includes(country.iso_code)) {
    totalScore += 1.5;
    waterStatus = "Very Safe (+1.5)";
    waterColor = "color: var(--green);";
  } else if (WATER_RISK_HIGH.includes(country.iso_code)) {
    totalScore -= 15;
    waterStatus = "Unsafe / High Risk (-15)";
    waterColor = "color: #c0392b; font-weight: bold;";
  }

  let roadStatus = "Average (0)";
  let roadColor = "";

  if (ROAD_DEATHS_LOW.includes(country.iso_code)) {
    totalScore += 1.5;
    roadStatus = "Very Safe (+1.5)";
    roadColor = "color: var(--green);";
  } else if (ROAD_DEATHS_HIGH.includes(country.iso_code)) {
    totalScore -= 2.5;
    roadStatus = "Very Unsafe (-2.5)";
    roadColor = "color: #e67e22;";
  }

  let diversityStatus = "Standard (0)";
  let diversityColor = "";

  if (DIVERSITY_HIGH.includes(country.iso_code)) {
    totalScore += 5;
    diversityStatus = "Highly Diverse (+5)";
    diversityColor = "color: var(--green);";
  }

  let microstatePenaltyText = "";
  if (MICROSTATES.includes(country.iso_code)) {
    totalScore -= 7.77;
    microstatePenaltyText = "*Microstate score penalty applied (-7.77)";
  }

  let eurocentricPenaltyText = "";
  if (EUROCENTRIC_NATIONS.includes(country.iso_code)) {
    totalScore -= totalScore * 0.05;
    eurocentricPenaltyText = "*Eurocentric reporting adjustment applied (-5%)";
  }

  totalScore = isSoloMode
    ? Math.max(0, totalScore * 0.8)
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
    langBonusStatus,
    langBonusColor,
    waterStatus,
    waterColor,
    roadStatus,
    roadColor,
    diversityStatus,
    diversityColor,
  };
}

function matchesSearch(country, term) {
  if (country.country.toLowerCase().includes(term)) return true;
  const rule = SEARCH_ALIASES.find((r) =>
    country.country.toLowerCase().includes(r.target),
  );
  return rule ? rule.keywords.some((k) => k.includes(term)) : false;
}

function scoreColor(s) {
  if (s >= 80) return "var(--green)";
  if (s >= 50) return "var(--amber)";
  if (s >= 40) return "var(--red)";
  return "#9b1c1c";
}

function processAndRenderData() {
  const isSoloMode = document.getElementById("soloToggle").checked;

  if (scoreCache === null || isSoloMode !== lastSoloMode) {
    const processed = rawCountriesData.map(
      ({ country, liveAqi, countryAdvisory }) => {
        const calc = calculateFinalScore(
          country,
          liveAqi,
          countryAdvisory,
          isSoloMode,
        );
        return { ...country, ...calc, final_score: calc.score };
      },
    );
    processed.sort((a, b) => b.final_score - a.final_score);
    processed.forEach((c, i) => {
      c.original_rank = i + 1;
    });
    scoreCache = processed;
    lastSoloMode = isSoloMode;
    allCountriesData = scoreCache;
  }

  const searchTerm =
    document.getElementById("searchInput")?.value.toLowerCase().trim() ?? "";
  const filtered = searchTerm
    ? scoreCache.filter((c) => matchesSearch(c, searchTerm))
    : scoreCache;
  renderList(filtered);
}

function renderList(rankedCountries) {
  const container = document.getElementById("results-container");
  document.getElementById("loading").style.display = "none";

  const openIsos = new Set(
    [...document.querySelectorAll(".details.show")]
      .map(
        (d) =>
          d.closest(".country-card")?.querySelector(".country-name")?.dataset
            ?.iso,
      )
      .filter(Boolean),
  );

  let html = "";

  rankedCountries.forEach((c) => {
    let overtourismBadge = "";
    if (OVERTOURISM_NATIONS.includes(c.iso_code)) {
      overtourismBadge = `<span style="background-color:#c0392b;color:white;font-size:12px;padding:3px 8px;border-radius:12px;margin-left:6px;font-weight:bold;vertical-align:middle;box-shadow:0 2px 4px rgba(0,0,0,0.1);">⚠️ Overtourism</span>`;
    }

    const femicideText = c.penaltyApplied
      ? `<span class="penalty-flag">*Femicide data missing — homicide penalty applied (1.7×)</span>`
      : "";
    const isolationText = c.isolationPenaltyText
      ? `<span class="penalty-flag">${c.isolationPenaltyText}</span>`
      : "";
    const microText = c.microstatePenaltyText
      ? `<span class="penalty-flag">${c.microstatePenaltyText}</span>`
      : "";
    const euroText = c.eurocentricPenaltyText
      ? `<span class="penalty-flag">${c.eurocentricPenaltyText}</span>`
      : "";
    const soloText = c.soloBonusText
      ? `<span class="penalty-flag" style="color:#27ae60;">${c.soloBonusText}</span>`
      : "";

    let statusText = "",
      statusClass = "";
    if (c.final_score >= 80) {
      statusText = "✦ Highly Recommended";
      statusClass = "status-highly-recommended";
    } else if (c.final_score >= 50) {
      statusText = "◎ Okay to Visit";
      statusClass = "status-okay";
    } else if (c.final_score >= 40) {
      statusText = "⚠ Avoid Visiting";
      statusClass = "status-avoid";
    } else {
      statusText = "✕ Do Not Visit";
      statusClass = "status-danger";
    }

    if (c.country === "Palestine") statusText += " · #FreePalestine";

    let advisoryToast = "";
    if (c.advisoryLevel && c.advisoryLevel >= 3) {
      const toastClass =
        c.advisoryLevel >= 4 ? "advisory-level-4" : "advisory-level-3";
      const inner = `<span class="advisory-toast ${toastClass}">⚠️ Level ${c.advisoryLevel}: ${c.advisoryWarning}</span>`;
      advisoryToast = c.advisoryPageUrl
        ? `<a href="${c.advisoryPageUrl}" target="_blank" style="text-decoration:none;" onclick="event.stopPropagation();">${inner}</a>`
        : inner;
    }

    const displayScore = c.final_score.toFixed(2);
    const isInBucket = userBucketList.includes(c.country);
    const bucketBtnText = isInBucket
      ? "✓ Added to Bucket List"
      : "➕ Add to Bucket List";
    const bucketBtnClass = isInBucket
      ? "bucket-add-btn added"
      : "bucket-add-btn";

    html += `
<div class="country-card">
    <div class="card-header">
        <h2 style="margin:0;">
            <span class="rank-number">#${c.original_rank}</span>
            <span class="country-name" data-name="${c.country}" data-iso="${c.iso_code}">${c.country}</span>${overtourismBadge}${c.hantaBadge || ""}
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
            <div class="stat-box"><span class="stat-label">GDP Score (0–10, 10 is Highly Developed)</span><span class="stat-value">${c.displayGdp !== "Data Missing" ? `${c.displayGdp} (+${c.gdpScore.toFixed(2)})` : "Data Unavailable"}</span></div>
            <div class="stat-box"><span class="stat-label">Cost of Living (0–10, 10 is Cheaper)</span><span class="stat-value">${c.displayCli !== "Data Missing" ? `${c.displayCli} (+${c.cliScore.toFixed(2)})` : "Data Unavailable"}</span></div>
            <div class="stat-box"><span class="stat-label">UNESCO Heritage Sites</span><span class="stat-value" style="${c.unescoCombinedColor}">${c.unescoCombinedStatus}</span></div>
            <div class="stat-box"><span class="stat-label">Top 8 Most Beautiful Nature Landscapes?</span><span class="stat-value" style="${c.isNatureTop8.startsWith("Yes") ? "color:#27ae60;" : ""}">${c.isNatureTop8}</span></div>
            <div class="stat-box"><span class="stat-label">Muslim-Friendly Travel?</span><span class="stat-value" style="${c.muslimFriendlyColor}">${c.muslimFriendlyStatus}</span></div>
            <div class="stat-box"><span class="stat-label">Major Religious Pilgrimage Site?</span><span class="stat-value" style="${c.holySiteStatus !== "None" ? "color:#8e44ad;font-weight:bold;" : ""}">${c.holySiteStatus}</span></div>
            <div class="stat-box"><span class="stat-label">Suffering from Overtourism?</span><span class="stat-value" style="${c.overtourismColor}">${c.overtourismStatus}</span></div>
            <div class="stat-box"><span class="stat-label">Strict Laws & Censorship?</span><span class="stat-value" style="${c.censorshipColor}">${c.censorshipStatus}</span></div>
            <div class="stat-box"><span class="stat-label">Flight Connectivity (IATA Rank)</span><span class="stat-value" style="${c.connectivityColor}">${c.connectivityStatus}</span></div>
            <div class="stat-box"><span class="stat-label">Top 10 Most Michelin Stars?</span><span class="stat-value" style="${c.michelinColor}">${c.michelinStatus}</span></div>
            <div class="stat-box"><span class="stat-label">Hantavirus Risk (Live)</span><span class="stat-value" style="${c.hantaColor || "color:#27ae60;"}">${c.hantaStatus || "No active outbreak"}</span></div>
            <div class="stat-box"><span class="stat-label">Language Accessibility (EN/FR/CN/MSA)</span><span class="stat-value" style="${c.langBonusColor}">${c.langBonusStatus}</span></div>
            <div class="stat-box"><span class="stat-label">Tap Water Safety (EPI)</span><span class="stat-value" style="${c.waterColor}">${c.waterStatus}</span></div>
            <div class="stat-box"><span class="stat-label">Road Traffic Safety</span><span class="stat-value" style="${c.roadColor}">${c.roadStatus}</span></div>
            <div class="stat-box"><span class="stat-label">Cultural Diversity</span><span class="stat-value" style="${c.diversityColor}">${c.diversityStatus}</span></div>
        </div>
        <div style="padding:0.5rem 0 0.25rem;display:flex;flex-direction:column;gap:3px;">
            ${femicideText}${isolationText}${microText}${euroText}${soloText}
        </div>
    </div>
</div>`;
  });

  container.innerHTML = html;

  openIsos.forEach((iso) => {
    const nameEl = container.querySelector(`[data-iso="${iso}"]`);
    if (!nameEl) return;
    const card = nameEl.closest(".country-card");
    const details = card?.querySelector(".details");
    if (!details) return;
    details.classList.add("show");
    const imgContainer = details.querySelector(".country-images");
    if (imgContainer && !imgContainer.dataset.loaded) {
      imgContainer.dataset.loaded = "true";
      imgContainer.innerHTML =
        '<div class="shimmer-box"></div><div class="shimmer-box"></div>';
      fetchCountryImages(nameEl.dataset.name, nameEl.dataset.iso).then(
        (images) => {
          if (images.length > 0) {
            imgContainer.innerHTML = images
              .map(
                (url) =>
                  `<img src="${url}" alt="" loading="lazy" style="flex:1;height:190px;object-fit:cover;border-radius:8px;">`,
              )
              .join("");
          } else {
            imgContainer.style.display = "none";
          }
        },
      );
    }
  });

  container.querySelectorAll(".card-header").forEach((header) => {
    header.addEventListener("click", async function () {
      const details = this.nextElementSibling;
      details.classList.toggle("show");

      if (!details.classList.contains("show")) return;

      const imgContainer = details.querySelector(".country-images");
      if (!imgContainer || imgContainer.dataset.loaded) return;

      imgContainer.dataset.loaded = "true";
      imgContainer.innerHTML =
        '<div class="shimmer-box"></div><div class="shimmer-box"></div>';

      const nameEl = this.querySelector(".country-name");
      const images = await fetchCountryImages(
        nameEl.dataset.name,
        nameEl.dataset.iso,
      );

      if (images.length > 0) {
        imgContainer.innerHTML = images
          .map(
            (url) =>
              `<img src="${url}" alt="" loading="lazy" style="flex:1;height:190px;object-fit:cover;border-radius:8px;">`,
          )
          .join("");
      } else {
        imgContainer.style.display = "none";
      }
    });
  });
}

async function init() {
  try {
    const staticData = await fetchStaticData();

    const aqiMap = {};
    for (const c of staticData) aqiMap[c.iso_code] = computeAqi(c.iso_code);

    rawCountriesData = staticData.map((country) => ({
      country: { ...country, hantaInfo: null },
      liveAqi: aqiMap[country.iso_code],
      countryAdvisory: null,
    }));

    processAndRenderData();

    updateBucketUI();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.style.display = "block";
      searchInput.addEventListener("input", processAndRenderData);
    }

    document.getElementById("soloToggle")?.addEventListener("change", () => {
      scoreCache = null;
      processAndRenderData();
    });

    const [advResult, hantaResult] = await Promise.allSettled([
      fetchAdvisories(),
      fetchHantaData(),
    ]);

    const advisories = advResult.status === "fulfilled" ? advResult.value : {};
    const hantaMap =
      hantaResult.status === "fulfilled" ? hantaResult.value : {};

    rawCountriesData = staticData.map((country) => ({
      country: { ...country, hantaInfo: hantaMap[country.iso_code] ?? null },
      liveAqi: aqiMap[country.iso_code],
      countryAdvisory: advisories[country.iso_code] ?? null,
    }));

    scoreCache = null;
    processAndRenderData();
  } catch (err) {
    console.error("Failed to load data:", err);
    const el = document.getElementById("loading");
    if (el) el.innerText = "Error loading data. Please refresh.";
  }

  document.getElementById("downloadBtn")?.addEventListener("click", () => {
    const isSolo = document.getElementById("soloToggle")?.checked ?? false;
    const rows = [
      ...document.querySelectorAll("#results-container .country-card"),
    ].map((card, i) => ({
      rank: i + 1,
      country: card.querySelector(".country-name")?.dataset.name ?? "",
      score: card.querySelector(".score")?.textContent?.trim() ?? "",
    }));
    downloadCSV(rows, isSolo);
  });
}

function downloadCSV(rows, isSoloMode) {
  let csv = "Rank,Country,Score\n";
  rows.forEach((r) => {
    csv += `${r.rank},"${r.country}",${r.score}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = isSoloMode
    ? "solo_travel_rankings.csv"
    : "travel_rankings.csv";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

async function fetchWithTimeout(url, ms = 4000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  const res = await fetch(url, { signal: ctrl.signal });
  clearTimeout(id);
  return res;
}

async function getCapitalCity(isoCode) {
  try {
    const res = await fetchWithTimeout(
      `https://restcountries.com/v3.1/alpha/${isoCode}`,
      3000,
    );
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
      const res = await fetchWithTimeout(url, 5000);
      const data = await res.json();
      const pages = data.query?.pages;
      if (!pages) return [];

      const valid = [];
      for (const key in pages) {
        const imgUrl = pages[key].imageinfo?.[0]?.url;
        const title = pages[key].title ?? "";
        if (!imgUrl) continue;

        const lower = imgUrl.toLowerCase();
        if (
          !lower.endsWith(".jpg") &&
          !lower.endsWith(".jpeg") &&
          !lower.endsWith(".png")
        )
          continue;
        if (
          lower.includes("map") ||
          lower.includes("flag") ||
          lower.includes("logo") ||
          lower.includes("icon")
        )
          continue;

        const clean = title
          .replace(/^File:/i, "")
          .replace(/\.[a-zA-Z0-9]+$/i, "")
          .trim();
        const lowerClean = clean.toLowerCase();
        const lowerTerm = term.toLowerCase();
        const wordCount = clean.split(/\s+/).length;

        if (lowerClean === lowerTerm)
          valid.push({ url: imgUrl, rank: 1, wordCount });
        else if (lowerClean.includes(lowerTerm))
          valid.push({ url: imgUrl, rank: 2, wordCount });
      }

      valid.sort((a, b) =>
        a.rank !== b.rank ? a.rank - b.rank : a.wordCount - b.wordCount,
      );
      return valid.map((v) => v.url);
    } catch {
      return [];
    }
  }

  let urls = capitalName ? await wikiSearch(capitalName) : [];
  if (!urls.length) urls = await wikiSearch(countryName);
  return urls.slice(0, 2);
}

async function fetchCountryImages(countryName, isoCode) {
  const cacheKey = `pixabay_cache_${isoCode}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    const parsed = JSON.parse(cachedData);
    if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) return parsed.urls;
  }

  const capitalName = await getCapitalCity(isoCode);

  const stopWords = [
    "of",
    "the",
    "and",
    "republic",
    "democratic",
    "united",
    "states",
    "kingdom",
    "islands",
    "island",
    "central",
    "federation",
    "people",
    "virgin",
  ];
  const required = countryName
    .toLowerCase()
    .split(/[\s-]+/)
    .filter((w) => !stopWords.includes(w) && w.length > 2);
  if (capitalName) required.push(capitalName.toLowerCase());

  let urls = [],
    pixabaySuccess = false;

  try {
    const query = encodeURIComponent(countryName);
    let fetchUrl = `https://pixabay.com/api/?key=${getPixabayKey()}&q=${query}&image_type=photo&orientation=horizontal&category=places&per_page=5`;
    let res = await fetchWithTimeout(fetchUrl);

    if (res.status === 429 && activePixabayKey === "primary") {
      activePixabayKey = "backup";
      fetchUrl = `https://pixabay.com/api/?key=${getPixabayKey()}&q=${query}&image_type=photo&orientation=horizontal&category=places&per_page=5`;
      res = await fetchWithTimeout(fetchUrl);
    }

    if (res.ok) {
      const data = await res.json();
      if (data.hits?.length) {
        const valid = [];
        for (const hit of data.hits) {
          const meta = `${hit.tags || ""} ${hit.pageURL || ""}`.toLowerCase();
          if (required.some((kw) => meta.includes(kw))) {
            valid.push(hit.webformatURL);
            if (valid.length === 2) break;
          }
        }
        if (valid.length) {
          urls = valid;
          pixabaySuccess = true;
        }
      }
    }
  } catch {}

  if (!pixabaySuccess || !urls.length) {
    urls = await fetchWikipediaFallback(countryName, capitalName);
  }

  if (urls.length) {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ urls, timestamp: Date.now() }),
    );
  }

  return urls;
}

init();

function updateBucketUI() {
  const icon = document.getElementById("bucketIcon");
  const count = document.getElementById("bucketCount");
  if (userBucketList.length === 0) {
    icon.classList.add("empty");
  } else {
    icon.classList.remove("empty");
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
  localStorage.setItem("tvi-bucketlist", JSON.stringify(userBucketList));
  updateBucketUI();
  processAndRenderData();
}

document.getElementById("bucketIcon").addEventListener("click", () => {
  const modal = document.getElementById("bucketModal");
  const listContainer = document.getElementById("bucketListContainer");
  listContainer.innerHTML = "";

  userBucketList.forEach((c) => {
    const li = document.createElement("li");
    li.textContent = c;
    listContainer.appendChild(li);
  });

  modal.classList.add("show");
});

document.getElementById("closeModalBtn").addEventListener("click", () => {
  document.getElementById("bucketModal").classList.remove("show");
});

document.getElementById("bucketCsvBtn").addEventListener("click", () => {
  if (userBucketList.length === 0) return;
  let csv = "Bucket List\n";
  userBucketList.forEach((c) => {
    csv += `"${c}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "my_bucket_list.csv";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
});

document.getElementById("bucketPrintBtn").addEventListener("click", () => {
  window.print();
});

function getShareText() {
  const list = "My Travel Bucket List:\n" + userBucketList.join("\n");
  return encodeURIComponent(list);
}

document.getElementById("shareXBtn").addEventListener("click", () => {
  window.open(
    `https://twitter.com/intent/tweet?text=${getShareText()}`,
    "_blank",
  );
});

document.getElementById("shareThreadsBtn").addEventListener("click", () => {
  window.open(
    `https://threads.net/intent/post?text=${getShareText()}`,
    "_blank",
  );
});

document.getElementById("bucketAiBtn").addEventListener("click", () => {
  if (userBucketList.length === 0) return alert("Your bucket list is empty!");

  const promptText =
    `I have a travel bucket list, based on rankings on https://ammariskandar.github.io/tourist-viability-index/ and I need some help planning my trip(s). Here is/are my list of countries:\n\n` +
    userBucketList.map((c) => `- ${c}`).join("\n") +
    `\n\nCan you help me create an itinerary, identify the best time to visit, and/or suggest hidden gems for these countries?`;

  navigator.clipboard.writeText(promptText).then(() => {
    alert("Prompt copied to clipboard! Now Claude...");
    window.open("https://claude.ai/", "_blank");
  });
});

document.getElementById("results-container").addEventListener("click", (e) => {
  if (e.target.classList.contains("bucket-add-btn")) {
    const country = e.target.getAttribute("data-country");
    toggleBucketItem(country);
    e.stopPropagation();
  }
});

document.getElementById("clearBucketBtn").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear your entire bucket list?")) {
    userBucketList = [];
    localStorage.setItem("tvi-bucketlist", JSON.stringify(userBucketList));
    updateBucketUI();
    document.getElementById("bucketListContainer").innerHTML = "";
    processAndRenderData();
  }
});

// ===== I AM FEELING SPICY — 50 Random Places Modal =====

const SPICY_PLACES = [
  {
    id: 1,
    name: "Tokelau",
    country: "New Zealand",
    difficulty: 10,
    file: "tokelau",
    why: "Tokelau is one of the world's most remote atoll nations, consisting of three coral atolls in the South Pacific. Entirely solar-powered, this self-sufficient territory has no airport — only a weekly boat from Samoa brings visitors. The crystal-clear lagoons, coconut-crab-filled forests, and traditional Polynesian village life offer a glimpse into a vanishing way of life. With only 1,500 residents and strict visitor permits, Tokelau remains unspoiled by mass tourism.",
    getThere:
      "Rent a boat from Apia, Samoa (one sailing per week). Obtain prior permission from the Tokelau Council of Elders. New Zealand immigration approval required.",
  },
  {
    id: 2,
    name: "Mangystau",
    country: "Kazakhstan",
    difficulty: 5,
    file: "mangystau",
    why: "Mangystau is a geological wonderland on the Caspian Sea. Its otherworldly landscapes include the chalk cliffs of Torysh (Valley of Balls), the sprawling white karst of the Ustyurt Plateau, and the ghostly necropolises of the Silk Road. The region's dramatic canyons, underground mosques, and the turquoise Caspian coastline create an alien atmosphere that feels more like another planet than Central Asia. Home to the sacred Beket-Ata underground mosque, it blends nature with deep spiritual history.",
    getThere:
      "Fly to Aktau (direct flights from major Kazakh cities). Hire a 4x4 with driver — roads are rough. Best explored with a local guide over 3-5 days.",
  },
  {
    id: 3,
    name: "Oecusse Enclave",
    country: "Timor-Leste",
    difficulty: 6,
    file: "oecusse",
    why: "Oecusse is East Timor's detached exclave, completely surrounded by Indonesian West Timor. This Portuguese-colonial pocket features pristine white-sand beaches, traditional Uma Lulik (sacred houses), and the vibrant market town of Pante Makassar. The enclave's isolation has preserved unique Timorese-Mix traditions, and its untouched reefs rival those of better-known Indonesian diving spots. The mountainous interior offers lush coffee plantations and hot springs.",
    getThere:
      "Fly from Dili to Oecusse (30 min, weekly). Or take a ferry from Dili (12 hours). Overland entry requires crossing the Indonesia-Timor-Leste border at Wini.",
  },
  {
    id: 4,
    name: "Gilf Kebir Plateau",
    country: "Egypt",
    difficulty: 9,
    file: "gilf",
    why: "The Gilf Kebir is a massive sandstone plateau deep in the Egyptian Sahara, home to the legendary Cave of Swimmers — prehistoric rock art depicting swimming figures in what is now hyper-arid desert. This lost-world wilderness features dramatic wadis, the remote Abu Ras Plateau, and remnants of WWII history (the site of the Long Range Desert Group's operations). Access requires multiple days of desert driving, navigating featureless terrain. The silence and isolation are overwhelming.",
    getThere:
      "Join an expedition from Cairo or Luxor (7-10 days). Requires 4x4 convoy, satellite communication, and a licensed desert guide. Permits from the Egyptian military required.",
  },
  {
    id: 5,
    name: "Puducherry",
    country: "India",
    difficulty: 2,
    file: "puducherry",
    why: "Puducherry (formerly Pondicherry) is a former French colony on India's Coromandel Coast, where wide French-style boulevards lined with yellow colonial villas stand alongside Tamil temples. The French Quarter (White Town) feels like a piece of Provence transplanted to the Bay of Bengal. The Sri Aurobindo Ashram and nearby experimental township of Auroville add a spiritual dimension. Its sea-view promenade, boutiques, and Franco-Tamil cuisine make it a uniquely charming fusion destination.",
    getThere:
      "Fly to Chennai, then drive 3 hours south. Direct trains from Chennai to Puducherry (4 hours). Auto-rickshaws are the best way to explore the compact town.",
  },
  {
    id: 6,
    name: "Wrangel Island",
    country: "Russia",
    difficulty: 10,
    file: "wrangel",
    why: 'Wrangel Island is a UNESCO World Heritage site in the Arctic Ocean, known as the "polar bear maternity ward" for its highest density of polar bear dens on Earth. This remote island is also home to the world\'s largest population of Pacific walrus, migratory snow geese, and Arctic foxes. The stark tundra landscapes, towering cliffs, and shifting sea ice create an environment of extreme beauty. Summer brings 24-hour daylight and carpets of wildflowers, while winter offers total darkness and temperatures below -30°C.',
    getThere:
      "Join an Arctic expedition cruise from Anadyr, Russia (once yearly, July-August). Requires special Russian government permit. Book 12+ months in advance. Extremely expensive ($15,000+).",
  },
  {
    id: 7,
    name: "Lake Natron",
    country: "Tanzania",
    difficulty: 5,
    file: "lake",
    why: "Lake Natron is one of the most caustic bodies of water on Earth, with alkalinity levels approaching straight ammonia. Its blood-red waters (turned crimson by salt-loving microorganisms) and temperatures up to 60°C create a surreal Martian landscape. Despite the hostile chemistry, it hosts 75% of the world's lesser flamingo population, which nests on evaporation islands. The nearby Ol Doinyo Lengai volcano (the only active carbonatite volcano on Earth) completes one of the planet's most extreme ecosystems.",
    getThere:
      "Drive from Arusha, Tanzania (4-5 hours, 4x4 required). Best visited June-October. Camp at Lake Natron Camp. Hire a Maasai guide for the waterfall hike and volcano trek.",
  },
  {
    id: 8,
    name: "Peron Peninsula",
    country: "Australia",
    difficulty: 5,
    file: "peron",
    why: "The Peron Peninsula juts into Shark Bay, a UNESCO World Heritage site on Western Australia's coast. It's one of the few places on Earth where you can see wild dolphins feeding at Monkey Mia beach every morning. The peninsula's red cliffs, turquoise waters, and white silica sands create stunning coastal scenery. The Francois Peron National Park covers most of the peninsula, offering 4WD tracks through diverse landscapes from spinifex plains to limestone ridges. It's also a sanctuary for the rufous hare-wallaby and the western barred bandicoot, both once thought extinct.",
    getThere:
      "Fly to Perth, then drive 8 hours north. Or fly direct to Monkey Mia airport (from Perth). 4WD recommended for the national park. Entry fees apply.",
  },
  {
    id: 9,
    name: "Fergana Valley",
    country: "Uzbekistan",
    difficulty: 4,
    file: "fergana",
    why: "The Fergana Valley is Central Asia's cultural heart, a fertile basin divided between Uzbekistan, Kyrgyzstan, and Tajikistan. This Silk Road crossroads is famous for its intricate silk weaving (the legendary Khan Atlas), Rishtan's blue ceramics, and the vibrant bazaars of Kokand and Margilan. The valley's geopolitical complexity — with dozens of exclaves, disputed borders, and ethnic enclaves — adds a fascinating dimension. The towering Alay and Tian Shan mountains frame the valley, offering some of the region's best trekking and yurt stays.",
    getThere:
      "Fly to Fergana or Namangan from Tashkent. Shared taxis connect the valley's cities. A visa-free travel for many nationalities makes it one of the easiest \"stans to explore.",
  },
  {
    id: 10,
    name: "Tsingy de Bemaraha",
    country: "Madagascar",
    difficulty: 6,
    file: "tsingy",
    why: 'The Tsingy de Bemaraha is a razor-sharp limestone labyrinth that looks like a petrified forest. The word "tsingy" means "where one cannot walk barefoot" in Malagasy — and the knife-like karst pinnacles, formed by millions of years of acid rain dissolving the limestone, live up to the name. Suspended walkways and zip lines allow visitors to cross this otherworldly landscape. The reserve is also home to 11 species of lemur, including the rare decken\'s sifaka, as well as endemic birds and chameleons.',
    getThere:
      "Fly to Morondava from Antananarivo, then 4x4 for 5-6 hours (extremely rough road). Best visited May-October. Hire a guide at the park entrance.",
  },
  {
    id: 11,
    name: "Danakil Depression",
    country: "Ethiopia",
    difficulty: 6,
    file: "danakil",
    why: "The Danakil Depression is the hottest inhabited place on Earth (averaging 34°C) and one of the most extreme landscapes on the planet. Here you'll find the Dallol hydrothermal field — a kaleidoscope of yellow sulfur deposits, green copper salts, and red iron oxide formations. The vast salt flats, mined by Afar caravans for centuries, stretch endlessly toward the horizon. Nearby Erta Ale volcano hosts a permanent lava lake. It's a geological fever dream where the Earth's crust is actively pulling apart at the triple junction of three tectonic plates.",
    getThere:
      'Join a tour from Mekele, Ethiopia (3-4 days). Armed escort required for security. Best visited November-February when temperatures are merely "extreme" rather than lethal.',
  },
  {
    id: 12,
    name: "South Ossetia",
    country: "Georgia",
    difficulty: 8,
    file: "ossetia",
    why: "South Ossetia is a breakaway state in the Caucasus, recognized by only a handful of countries. Its stunning alpine scenery — deep valleys, snow-capped peaks, and medieval towers — rivals Switzerland's. The region has a unique Iranic cultural heritage: the Ossetian language is descended from Scytho-Sarmatian, and the epic Nart sagas are central to local identity. The capital, Tskhinvali, mixes Soviet-era architecture with traditional stone houses. The Roki Tunnel, the only road link to Russia, cuts through the Greater Caucasus at 3,000m.",
    getThere:
      "Enter from Russia through the Roki Tunnel (requires double-entry Russian visa). Or from Georgia — the de facto border is monitored, and entry from Georgia is considered illegal by the de facto authorities. Independent travel requires negotiation.",
  },
  {
    id: 13,
    name: "Raja Ampat",
    country: "Indonesia",
    difficulty: 5,
    file: "rajaampat",
    why: 'Raja Ampat ("Four Kings") is an archipelago of over 1,500 islands off the coast of West Papua, Indonesia. It holds the world\'s highest recorded marine biodiversity — over 600 species of hard coral, 1,500 species of fish, and countless molluscs. The underwater landscapes are mind-blowing: sheer coral walls, manta ray cleaning stations, and schools of barracuda numbering in the thousands. Above water, the karst islands rise like emerald mushrooms from cobalt waters, with hidden lagoons and white-sand beaches.',
    getThere:
      "Fly to Sorong from Jakarta or Makassar. From Sorong, take a liveaboard or public ferry to Waisai (2 hours). Liveaboards are the best way to explore the outer islands.",
  },
  {
    id: 14,
    name: "Hotan River Highway",
    country: "China",
    difficulty: 8,
    file: "hotan",
    why: 'The Hotan River Highway spans 500km across the Taklamakan Desert, the second-largest shifting sand desert in the world. Known as the "Desert Highway," it runs along the dried Hotan River bed, connecting the oasis city of Hotan to the northern Silk Road route. The landscape is merciless: endless dunes, dust devils, and mirages. Anti-desertification strips of vegetation flank the road, creating a narrow green ribbon through the beige void. The journey passes ancient Buddhist cave complexes and the ruins of lost Silk Road cities buried by sand.',
    getThere:
      "Fly to Hotan from Urumqi or Kashgar. Hire a car + driver for the 2-day drive north to Aksu. A China Western Tibet travel permit may be required for foreign tourists.",
  },
  {
    id: 15,
    name: "Tristan da Cunha",
    country: "United Kingdom",
    difficulty: 10,
    file: "tristan",
    why: "Tristan da Cunha is the most remote inhabited archipelago on Earth — 2,800km from the nearest continent and accessible only by a week-long boat journey. The main island's 250 residents all live in Edinburgh of the Seven Seas, a village of colorful cottages clinging to the only flat land beneath a 2,000m volcano. The community famously runs a collective potato plantation on a separate island. The surrounding seas teem with seals, penguins, and albatrosses. The isolation has created a unique culture of self-reliance and tight-knit community governance.",
    getThere:
      "Join the annual supply ship MFV Edinburgh from Cape Town, South Africa (once or twice a year). The voyage takes 6-7 days. Apply for permission years in advance. No airstrip exists.",
  },
  {
    id: 16,
    name: "Meteora",
    country: "Greece",
    difficulty: 2,
    file: "meteora",
    why: "Meteora is one of the most extraordinary monastic communities on Earth, where Eastern Orthodox monasteries perch atop giant sandstone pillars that rise 300 meters straight out of the Thessalian plain. Built from the 14th century, these monasteries were originally accessible only by rope ladders and windlasses — a testament to faith and determination. Today, six of the original 24 survive, housing living monastic communities. The geological spectacle of the rock pillars themselves, formed by ancient river erosion and shaped by wind, creates a landscape of almost surreal drama.",
    getThere:
      "Train from Athens to Kalambaka (5 hours). The monasteries are connected by paved roads and steep staircases. Dress modestly — long skirts and covered shoulders required for entry.",
  },
  {
    id: 17,
    name: "Ennedi Plateau",
    country: "Chad",
    difficulty: 8,
    file: "ennedi",
    why: "The Ennedi Plateau in northeastern Chad is a hidden Sahara masterpiece — a sandstone labyrinth carved by ancient rains into a landscape of natural arches, rock bridges, and hidden gueltas (desert pools) that sustain crocodiles left over from a wetter age. The Guelta d'Archei is the most famous, a blue-green pool deep in a canyon where camels and goats still water. Prehistoric rock art covers the canyon walls, depicting giraffes, elephants, and ritual scenes from 6,000 years ago. The silence is profound, broken only by the wind and the occasional desert fox.",
    getThere:
      "Fly to N'Djamena, then charter a flight+4x4 expedition to Ennedi (requires military escort). Best visited November-February. Arrange through a specialized tour operator.",
  },
  {
    id: 18,
    name: "Jiuzhaigou Valley",
    country: "China",
    difficulty: 3,
    file: "jiuzhaigou",
    why: 'Jiuzhaigou ("Nine Village Valley") is a UNESCO World Heritage site in Sichuan province, renowned for its dreamlike turquoise, emerald, and sapphire lakes. The colors — caused by dissolved calcium carbonate and unique algae — are so intense they look digitally enhanced. Tiered waterfalls cascade between the lakes through virgin forests of bamboo and fir. Tibetan and Qiang villages dot the valley, offering a glimpse into ancient cultures. The valley\'s name comes from nine ancient Tibetan villages scattered throughout the reserve, though only seven remain inhabited.',
    getThere:
      "Fly to Jiuzhai Huanglong Airport from Chengdu (1 hour). Shuttle buses run from the airport to the park entrance (closed December-March due to snow).",
  },
  {
    id: 19,
    name: "Kamchatka Peninsula",
    country: "Russia",
    difficulty: 8,
    file: "kamchatka",
    why: "Kamchatka is a volcanic wilderness where 29 active volcanoes, geyser fields, and hot springs shape a landscape of raw geological power. The Valley of the Geysers — one of the largest geyser fields on Earth — is a hidden canyon where dozens of boiling springs and steam jets erupt from the tundra. Brown bears roam freely, fishing for Pacific salmon in rivers so clear you can count the pebbles. The winter landscape of snow-covered volcanoes under the aurora borealis is equally magical. Avachinsky and Koryaksky volcanoes loom over the capital, Petropavlovsk, as constant reminders of the Earth's restless power.",
    getThere:
      "Fly to Petropavlovsk-Kamchatsky from Moscow (9 hours). Helicopter tours to the Valley of the Geysers from $600. Book through a licensed tour operator. Best July-September.",
  },
  {
    id: 20,
    name: "Sudd Wetlands",
    country: "South Sudan",
    difficulty: 9,
    file: "sudd",
    why: "The Sudd is one of Africa's largest wetlands and one of the most inaccessible places on Earth. This vast maze of papyrus swamps, channels, and floating islands covers up to 130,000 square kilometers — larger than England. The Sudd supports extraordinary wildlife including the last major populations of the Nile lechwe, shoebill storks, and elephant migrations, though decades of civil war have taken their toll. The Dinka and Nuer peoples navigate the waterways with their cattle, living a semi-aquatic pastoralist lifestyle unchanged for millennia. The Sudd is simultaneously awe-inspiring and unforgiving.",
    getThere:
      "Fly to Juba, South Sudan. Join an organized tour to the Sudd (extremely limited options). Requires armed escort. Only attempt with a specialized African wildlife tour operator.",
  },
  {
    id: 21,
    name: "Socotra",
    country: "Yemen",
    difficulty: 6,
    file: "socotra",
    why: "Socotra is the Galápagos of the Indian Ocean, a biological treasure chest where a third of its plant life exists nowhere else on Earth. The dragon's blood tree (Dracaena cinnabari), with its umbrella-shaped crown and red sap, dominates the landscape like something from a fantasy novel. The bottle tree (Adenium obesum socotranum) and cucumber trees add to the alien aesthetic. The island's beaches, lagoons, and limestone caves complement its surreal botany. The Socotri people speak a unique Semitic language and maintain traditions that have changed little over centuries.",
    getThere:
      "The security situation in Yemen makes tourism extremely difficult. Historically, fly from Cairo or Abu Dhabi to Socotra. Check current travel advisories carefully. A specialized tour operator is essential.",
  },
  {
    id: 22,
    name: "Bisti Badlands",
    country: "United States",
    difficulty: 3,
    file: "bisti",
    why: 'The Bisti/De-Na-Zin Wilderness in northwestern New Mexico is a fossil-rich badlands of otherworldly hoodoos, petrified wood, and strange rock formations. The "Alien Throne" and "Stone Wings" are just two of the surreal formations that appear as you hike through this desolate landscape. The area is also a paleontological goldmine, with dinosaur fossils and ancient crocodile bones embedded in the multi-colored sedimentary layers. There are no trails, no facilities, and virtually no signs — just raw, silent desert beauty stretching to the horizon under a vast New Mexico sky.',
    getThere:
      "Drive from Farmington, New Mexico (45 minutes) or from Albuquerque (3.5 hours). Dirt road access, high-clearance vehicle recommended. No entrance fee, but carry all water supplies.",
  },
  {
    id: 23,
    name: "Kerguelen Islands",
    country: "France",
    difficulty: 10,
    file: "kerguelen",
    why: "The Kerguelen Islands (also known as the Desolation Islands) are a French subantarctic archipelago in the southern Indian Ocean, battered by constant winds and surrounded by some of the roughest seas on Earth. This volcanic landscape, covered in glaciers and barren tundra, supports massive colonies of elephant seals, sea lions, king penguins, and albatrosses. The research station at Port-aux-Français houses a rotating crew of scientists studying everything from cosmic rays to the island's unique flora. The stark beauty of the black lava, white glaciers, turquoise meltwater lakes, and pink granite peaks is haunting.",
    getThere:
      "The Marion Dufresne supply ship departs from Réunion 4 times per year. Book a berth years in advance. Alternatively, join a polar expedition cruise that includes the Kerguelens.",
  },
  {
    id: 24,
    name: "Auroville",
    country: "India",
    difficulty: 2,
    file: "auroville",
    why: "Auroville is an experimental international township founded in 1968 with the aim of realizing human unity. Its iconic centerpiece, the Matrimandir — a giant golden sphere covered in gold-plated discs — rises from the dry coastal plains of Tamil Nadu like a vision from the future. This city of 3,500+ residents from 60+ countries has no political parties, no currency of its own, and is organized around the principle of continuous progress. The surrounding botanical gardens, experimental farms, and organic restaurants make it a fascinating lens into alternative living.",
    getThere:
      "Fly to Chennai, then drive 2.5 hours south. Or take a train to Pondicherry and an auto-rickshaw to Auroville (20 min). The Visitor's Centre is open to all.",
  },
  {
    id: 25,
    name: "Pamir Highway",
    country: "Tajikistan",
    difficulty: 5,
    file: "pamir",
    why: 'The Pamir Highway (M41) is the world\'s second-highest international road, crossing the Pamir Mountains — the "Roof of the World" — at altitudes exceeding 4,600m. This legendary route follows ancient Silk Road paths through Afghanistan, Uzbekistan, Tajikistan, and Kyrgyzstan. The Tajik section is the most dramatic: barren moonscapes punctuated by turquoise lakes (like Karakul), yurt camps of Wakhi and Kyrgyz shepherds, and crumbling Soviet outposts. The road itself — unpaved for much of the way, washed out by landslides, and snowed-in for half the year — is as much a challenge as a journey.',
    getThere:
      'Start in Dushanbe or Osh. Public shared jeeps ("marshrutkas") run during summer (June-September). A 4x4 rental with driver is safer. Bring warm gear — even summer nights are sub-zero at altitude.',
  },
  {
    id: 26,
    name: "Deception Island",
    country: "Antarctica",
    difficulty: 10,
    file: "deception",
    why: "Deception Island is one of the safest natural harbors in Antarctica — which is ironic because it's a live volcano. This horseshoe-shaped caldera, formed by a massive eruption 10,000 years ago, offers shelter inside its flooded crater. The black sand beaches are warmed by geothermal heat, making it one of the few places where you can theoretically swim in Antarctic waters. Abandoned whaling stations and British scientific bases, destroyed by 1960s eruptions, rust along the shoreline. Chinstrap penguins nest on the slopes, and the air smells of sulfur and sea ice.",
    getThere:
      "Join an Antarctic cruise that includes the South Shetland Islands (most do during November-March). Zodiac landings bring you ashore. The polar plunge at Pendulum Cove is optional but memorable.",
  },
  {
    id: 27,
    name: "Huacachina",
    country: "Peru",
    difficulty: 2,
    file: "huacachina",
    why: "Huacachina is a natural desert oasis surrounding a small lake in southwestern Peru — one of only a handful of true oases in the Americas. Surrounded by towering sand dunes that rise 300m above the emerald lagoon, the village feels like a mirage. The oasis has been a resort destination since the 1940s, and today visitors come to sandboard down the dunes and ride dune buggies. Local legend says the lagoon was formed by the tears of a princess mourning her lost love. Despite the tourist infrastructure, the sight of these golden dunes silhouetted against the sunset remains genuinely spectacular.",
    getThere:
      "Fly to Lima, then bus to Ica (4 hours). Taxi from Ica to Huacachina (15 min). Dune buggy and sandboarding tours from $15-30.",
  },
  {
    id: 28,
    name: "Ittoqqortoormiit",
    country: "Denmark",
    difficulty: 8,
    file: "ittoqqortoormiit",
    why: "Ittoqqortoormiit (also known as Scoresbysund) is one of the world's most remote settlements, located on the shores of the Scoresby Sound — the largest fjord system on Earth. This Greenlandic village of 350 people is home to the northernmost population of Inuit in the world, where traditional kayak hunting, dog sledding, and seal processing remain part of daily life. The surrounding fjords are a spectacle of icebergs the size of city blocks, calving glaciers, and razor-sharp peaks. In summer, midnight sun illuminates the landscape; in winter, the aurora borealis dances over the frozen sea.",
    getThere:
      "Fly from Reykjavik or Copenhagen to Nerlerit Inaat Airport (1 hour from Ittoqqortoormiit by helicopter). Dog sled tours available April-June. Cruise ships occasionally visit in summer.",
  },
  {
    id: 29,
    name: "Wadi Rum",
    country: "Jordan",
    difficulty: 2,
    file: "wadirum",
    why: 'Wadi Rum is a valley of dramatic red sandstone mountains and vast open desert in southern Jordan, famously known as the Valley of the Moon. Its Martian landscape has served as the backdrop for films like The Martian, Dune, and Lawrence of Arabia (Lawrence himself called it "vast, echoing and God-like"). The desert is scored with canyons, natural bridges, and 4,000-year-old inscriptions. Bedouin camps offer overnight stays under the stars, with traditional zarb (underground-cooked meat) dinners and tea brewed over fire. The sunrise over Jebel Um Ad Dami, Jordan\'s highest peak, is unforgettable.',
    getThere:
      "Fly to Amman, then drive 4 hours south to Wadi Rum Village. Overnight desert tours with Bedouin guides are the best experience (from $50-100). Reserve through a camp ahead of time.",
  },
  {
    id: 30,
    name: "Pitcairn Island",
    country: "United Kingdom",
    difficulty: 10,
    file: "pitcairn",
    why: "Pitcairn Island is the final refuge of the HMS Bounty mutineers, who settled here in 1790 with their Tahitian companions. Today, just 40-50 descendants live in Adamstown, the world's smallest capital. The island is a British Overseas Territory reachable only by a 32-hour boat journey from Mangareva, French Polynesia — and not all days of the year. Life on Pitcairn runs at its own pace: longboats transport people and goods between the island and visiting ships, honey and fruit are the main exports, and the entire community gathers for church services, birthday parties, and fishing expeditions.",
    getThere:
      "The Pitcairn Islands Office in Auckland, New Zealand handles all visitor applications. Fly to Mangareva (Gambier Islands), then board the Pitcairn supply ship for 32 hours. Apply months in advance.",
  },
  {
    id: 31,
    name: "Faroe Islands",
    country: "Denmark",
    difficulty: 3,
    file: "faroe",
    why: "The Faroe Islands are an archipelago of 18 volcanic islands in the North Atlantic, defined by dramatic cliffs, sea stacks, and waterfalls dropping directly into the ocean. The capital Tórshavn is one of the world's smallest capitals, with turf-roofed houses and a bustling harbor. The islands are a paradise for hikers — the trail to the Kallur lighthouse on Kalsoy island, the cliff viewpoint at Trælanípa overlooking the Leitisvatn lake-above-the-ocean, and the dramatic Drangarnir sea arch are all world-class. The Faroese chain dance tradition and the unique cuisine of fermented lamb (skerpikjøt) add cultural depth.",
    getThere:
      "Fly to Vágar Airport from Copenhagen, Edinburgh, or Reykjavik. Ferries connect the islands. Rent a car to explore the string of sub-sea tunnels connecting the islands.",
  },
  {
    id: 32,
    name: "Lençóis Maranhenses",
    country: "Brazil",
    difficulty: 4,
    file: "lencois",
    why: "Lençóis Maranhenses is one of the most surreal landscapes in South America — a 1,500-square-kilometer desert of white sand dunes dotted with crystal-clear freshwater lagoons that appear during the rainy season. The contrast between the pure white sand and the emerald- and cobalt-colored water creates a scene that looks like a watercolor painting come to life. The lagoons, fed by rainwater trapped between dunes, are warm and inviting. The journey to reach them, a bone-rattling 4x4 ride followed by a hike over dunes, only adds to the sense of discovery.",
    getThere:
      "Fly to São Luís, then drive 4 hours to Barreirinhas. 4x4 tours depart daily (June-September for full lagoons). Stand-up paddleboards can be rented on the lagoons.",
  },
  {
    id: 33,
    name: "Abkhazia",
    country: "Georgia",
    difficulty: 7,
    file: "abkhazia",
    why: "Abkhazia is a breakaway republic on the Black Sea with a subtropical climate, stunning mountain scenery, and a complex political status. The abandoned resort town of Gagra, the Stalin's dacha in the hills above, and the haunting New Athos Monastery create a landscape of beauty layered with history. The Voronya Cave (the world's deepest at 2,197m) and the Ritsa Lake surrounded by snow-capped peaks offer natural wonders that rival anything in the Caucasus. The Abkhaz people maintain a distinct culture with their own language, cuisine featuring adjika spice, and a laid-back attitude to governance.",
    getThere:
      "Enter through the Psou Bridge (from Russia at Adler/Sochi). Foreigners need authorization from the de facto Abkhazian foreign ministry. Independent travel is possible but requires flexibility.",
  },
  {
    id: 34,
    name: "Salar de Tara",
    country: "Chile",
    difficulty: 5,
    file: "salartara",
    why: 'Salar de Tara is a high-altitude salt flat in the Chilean Andes, part of the Los Flamencos National Reserve. At 4,200m above sea level, this pristine salt basin is surrounded by dramatic volcanic peaks and rock formations, including the iconic "Three Marias" monoliths. Flocks of James\'s flamingos, Andean geese, and viscachas roam the salt flats and lagoons. The nearby Salar de Atacama is better known, but Salar de Tara offers a more raw, less visited experience. The altitude makes hiking strenuous, but the views of the Licancabur volcano reflected in the salt crust are worth every breathless step.',
    getThere:
      "Fly to Calama, then drive to San Pedro de Atacama. Join a tour to Salar de Tara from San Pedro (2 hours via rough road). Acclimatize to altitude in San Pedro first (2,400m).",
  },
  {
    id: 35,
    name: "Sultan Haji Omar Ali Saifuddien Bridge",
    country: "Brunei",
    difficulty: 1,
    file: "omarbridge",
    why: "The Sultan Haji Omar Ali Saifuddien Bridge — also known as the Temburong Bridge — is a 30km marvel of engineering that connects the two halves of Brunei across the Brunei Bay. Completed in 2020, it was Southeast Asia's longest bridge until 2024. The bridge's graceful curves and massive pylons create a striking silhouette against Borneo's rainforest-covered hills. It replaced a 45-minute ferry with a 15-minute drive, transforming access to the isolated Temburong District. The bridge's scale and elegance make it Brunei's most impressive modern infrastructure.",
    getThere:
      "Fly to Bandar Seri Begawan, Brunei. Rent a car and drive the full bridge crossing (about 20km over water). The bridge connects to the Temburong rainforest region.",
  },
  {
    id: 36,
    name: "Erta Ale",
    country: "Ethiopia",
    difficulty: 6,
    file: "ertaale",
    why: "Erta Ale is one of the few permanently active lava lakes on Earth, located in the Danakil Depression of Ethiopia. The shield volcano has been erupting continuously since 1967, its 600-meter-wide summit pit containing a churning lake of black basalt cracked with rivers of fiery orange. Standing at the rim at night, watching the molten rock bubble and surge below, is one of the most primal experiences available on the planet. The trek across the desert to reach it — past camels, salt caravans, and Afar settlements — lasts two days each way under relentless sun.",
    getThere:
      "Join a 3-4 day tour from Mekele, Ethiopia (with armed Afar escort). Best visited November-February. The walk from the village of Afrera to the summit is about 3 hours by camel or foot.",
  },
  {
    id: 37,
    name: "Cordillera Huayhuash",
    country: "Peru",
    difficulty: 5,
    file: "huayhuash",
    why: "The Cordillera Huayhuash is one of the world's most spectacular mountain ranges, a compact 30km stretch of the Peruvian Andes that packs in six peaks over 6,000m, including Yerupajá (6,635m), the second-highest in Peru. The circular Huayhuash trek is considered one of the most beautiful in the world, crossing four high passes above 4,700m, passing turquoise glacial lakes, and traversing remote Quechua and Ruco villages. The vertical relief is staggering — from 3,000m valleys to 6,000m peaks in just a few kilometers. The jagged Siula Grande, made famous by Touching the Void, dominates the skyline.",
    getThere:
      "Fly to Lima, bus to Huaraz (8 hours), then organize a guided trek to the Huayhuash circuit (10-14 days). Independent trekking is possible but requires full camping gear and altitude sickness preparation.",
  },
  {
    id: 38,
    name: "Putorana Plateau",
    country: "Russia",
    difficulty: 10,
    file: "putorana",
    why: "The Putorana Plateau is a vast basalt mesa in northern Siberia, a UNESCO World Heritage site of extraordinary volcanic geology. This flat-topped mountain range was carved by glaciers into a labyrinth of 20,000 rivers and streams, countless waterfalls (including the 108m Talnikovy Waterfall, one of Russia's highest), and 25,000 deep canyon lakes. The plateau is home to the largest wild reindeer herd in Eurasia, musk oxen, and snowy owls. The isolation is total — there are no permanent settlements, no roads, and helicopter access provides the only way in. The autumn tundra, turning crimson and gold, is breathtaking.",
    getThere:
      "This is one of the hardest places to reach. Fly to Norilsk (special permit required), then arrange a helicopter tour (extremely expensive). Independent travel is not possible. Join an organized expedition.",
  },
  {
    id: 39,
    name: "Svalbard",
    country: "Norway",
    difficulty: 4,
    file: "svalbard",
    why: "Svalbard is the Arctic archipelago where polar bears outnumber humans. The main settlement, Longyearbyen, is the world's northernmost town with a population over 1,000, and it's a frontier outpost with more snowmobiles than cars. The landscape is a stark beauty of glaciers calving into fjords, snow-covered mountains rising from sea ice, and the midnight sun (or polar night, depending on the season). Svalbard is one of the best places to see polar bears, walrus colonies, Arctic foxes, and reindeer in their natural habitat. The Global Seed Vault, buried in the permafrost, adds a layer of modern significance.",
    getThere:
      "Fly to Longyearbyen from Oslo or Tromsø (3-4 hours). Boat trips around the archipelago operate in summer. Snowmobile tours in spring. A firearm guide is required outside town for polar bear protection.",
  },
  {
    id: 40,
    name: "Aleutian Islands",
    country: "United States",
    difficulty: 7,
    file: "aleutian",
    why: "The Aleutian Islands stretch 1,900km across the Pacific, a volcanic archipelago that separates the Bering Sea from the Pacific Ocean. This active volcanic chain — part of the Pacific Ring of Fire — hosts dozens of volcanoes, many still steaming. The islands are home to the Unangax (Aleut) people, whose maritime traditions of kayak hunting and bentwood hats date back 9,000 years. During WWII, Dutch Harbor was bombed by the Japanese, and the remnants of military installations dot the islands. The bird life is extraordinary: millions of seabirds nest on the cliffs, and the waters shelter sea otters, Steller sea lions, and gray whales.",
    getThere:
      "Fly to Unalaska/Dutch Harbor from Anchorage (small plane, subject to weather). The Alaska Marine Highway ferry occasionally visits. Weather is notoriously harsh — expect wind and fog year-round.",
  },
  {
    id: 41,
    name: "Cappadocia",
    country: "Turkey",
    difficulty: 2,
    file: "cappadocia",
    why: "Cappadocia is a geological and historical wonderland in central Anatolia, where soft volcanic tuff has been eroded into fairy chimneys, rock cones, and deep valleys. The Hittites, Persians, and early Christians carved entire underground cities — Derinkuyu descends eight levels, housing up to 20,000 people. Cave churches at Göreme Open Air Museum preserve stunning 10th-century Byzantine frescoes. A hot air balloon ride at dawn, floating over the honeycomb landscape as the sunrise paints the rocks in pastels, is one of the world's great travel experiences. The pottery town of Avanos and the wine cellars of Uçhisar add to the region's charm.",
    getThere:
      "Fly to Nevşehir or Kayseri from Istanbul (1.5 hours). Hot air balloon flights cost $150-300. Cappadocia is best explored on foot, by rental car, or on a guided tour over 3-4 days.",
  },
  {
    id: 42,
    name: "Gorno-Badakhshan",
    country: "Tajikistan",
    difficulty: 5,
    file: "badakhshan",
    why: 'Gorno-Badakhshan is the remote autonomous region of Tajikistan that occupies the Pamir Mountains — the "Roof of the World." This high-altitude region is home to the Pamiri people, who speak Eastern Iranian languages and practice Ismaili Islam under the spiritual guidance of the Aga Khan. The landscape is one of extreme beauty: the Wakhan Corridor, the Panj River gorges, 7,000m peaks, and the turquoise turquoise turquoise Bartang and Gunt valleys. The Pamiri houses ("chid") are architecturally unique, with 5-tiered roofs representing the five elements. The hospitality of the Pamiri people is legendary.',
    getThere:
      "Fly to Dushanbe, then drive the Pamir Highway to Khorog (2 days). A GBAO permit is required (obtained in Dushanbe). Homestays ($15-30/night) are the best way to experience Pamiri culture.",
  },
  {
    id: 43,
    name: "Temburong Region",
    country: "Brunei",
    difficulty: 2,
    file: "temburong",
    why: "The Temburong District is Brunei's eastern exclave, separated from the rest of the country by the Malaysian state of Sarawak and the Brunei Bay. This sparsely populated region is covered in pristine Bornean rainforest, with the Ulu Temburong National Park offering a canopy walkway 60m above the forest floor. The park is accessible only by longboat, adding to its sense of remoteness. The region is home to proboscis monkeys, hornbills, and the massive Rafflesia flowers. The 2020 completion of the Temburong Bridge transformed access to this once-difficult-to-reach region, making it a day trip from Bandar Seri Begawan.",
    getThere:
      "Fly to Brunei, then cross the Temburong Bridge from Bandar Seri Begawan (30 min by car). Or take the public ferry from Bandar to Bangar. Longboat tours up the Temburong River are the highlight.",
  },
  {
    id: 44,
    name: "Salar de Uyuni",
    country: "Bolivia",
    difficulty: 3,
    file: "uyuni",
    why: "Salar de Uyuni is the world's largest salt flat, covering 10,582 square kilometers of the Bolivian Altiplano. During the rainy season (December-March), a thin layer of water turns the salt flat into the world's largest mirror, creating a perfect reflection of the sky that makes it look like you're walking on clouds. The salt crust, up to 10m thick, is dotted with giant hexagonal patterns and ostentatious hotels built entirely of salt blocks. Isla Incahuasi, a cactus-covered former coral reef in the middle of the salt flat, offers 360-degree views of the blinding white expanse. The nearby train cemetery adds a surreal, post-apocalyptic touch.",
    getThere:
      "Fly to La Paz, then bus or tour to Uyuni (10 hours). 3-day 4x4 tours to the salt flats and the lagoons of Eduardo Avaroa National Park are standard. The salt flat itself is free to enter.",
  },
  {
    id: 45,
    name: "Vorukh Enclave Area",
    country: "Tajikistan",
    difficulty: 6,
    file: "vorukh",
    why: "The Vorukh enclave is one of the world's most complex geopolitical oddities — a piece of Tajikistan entirely surrounded by Kyrgyzstan, located in the Fergana Valley. The enclave system of the Fergana Valley, with its intertwining borders, disputed roads, and ethnic patchwork, represents one of the most convoluted border situations on the planet. Vorukh itself is a fertile valley of fruit orchards, vegetable fields, and traditional Tajik villages. The surrounding mountains are dotted with walnut forests and shepherds' yurts. Crossing the border can involve waiting for Kyrgyz guards, navigating alternative roads, and negotiating friendly-but-insistent checkpoints.",
    getThere:
      "This is NOT a formal tourist destination. Enter from the Tajik side of the Fergana Valley. A flexible attitude, Tajik visa, and local guide are essential. Ask in Isfara about access.",
  },
  {
    id: 46,
    name: "Kalta Minor & Khiva Region",
    country: "Uzbekistan",
    difficulty: 3,
    file: "khiva",
    why: "Khiva is the best-preserved Silk Road city in Central Asia, with its inner city (Ichan-Kala) containing over 50 historic monuments and 250 houses dating from the 10th to the 19th centuries. The Kalta Minor minaret is the city's most striking feature — a massive, turquoise-tiled tower that was intended to be the tallest in the Islamic world but was left unfinished at 29m. The Tash Khauli Palace, the Juma Mosque with its 218 wooden columns, and the watchtowers of the city walls create a complete medieval Islamic city frozen in time. The Khiva sunsets, seen from the city walls, bathe the blue tiles in golden light.",
    getThere:
      "Fly to Urgench from Tashkent, then taxi to Khiva (30 min). High-speed train also connects Tashkent to Urgench (overnight). Two days is enough to see the main sites.",
  },
  {
    id: 47,
    name: "Aral Sea Region",
    country: "Uzbekistan",
    difficulty: 5,
    file: "aralsea",
    why: "The Aral Sea region represents one of the most dramatic anthropogenic environmental changes in history. Once the world's fourth-largest lake, it has shrunk to barely 10% of its original size due to Soviet irrigation projects. The rusting ship graveyard at Moynaq — fishing vessels stranded in a desert of salt-crusted sand — is a haunting monument to ecological disaster. The exposed seabed is now the Aralkum Desert, laced with agricultural chemicals and salt. Yet the region is slowly finding new life: the small northern Aral Sea is being restored by the Kokaral Dam, and a new tourist route (by motorcycle or 4x4) crosses the dried seabed.",
    getThere:
      "Fly to Nukus from Tashkent. Drive to Moynaq (2 hours) to see the ship graveyard. 4x4 tours across the dried seabed to the surviving Aral Sea shoreline can be arranged in Nukus.",
  },
  {
    id: 48,
    name: "Norilsk",
    country: "Russia",
    difficulty: 9,
    file: "norilsk",
    why: "Norilsk is one of the world's most isolated cities, a Soviet-era mining metropolis of 175,000 people built above the Arctic Circle to extract nickel, copper, and palladium. The city is closed to foreign visitors without special permits, and its pollution is so severe that Norilsk regularly tops lists of the world's most polluted places. Yet the landscape around Norilsk — the Putorana Plateau — is one of extreme beauty: volcanic canyons, frozen waterfalls, and crystalline lakes. The city itself is a fascinating time capsule: brutalist Soviet apartment blocks, the world's northernmost mosque, and a community living in temperatures as low as -58°C.",
    getThere:
      "A special permit from the FSB (Russian Federal Security Service) is required for all foreign visitors. Fly from Krasnoyarsk or Moscow. The permit application takes months. Only visit with a licensed tour operator.",
  },
  {
    id: 49,
    name: "Tsingy Rouge",
    country: "Madagascar",
    difficulty: 5,
    file: "tsingyrouge",
    why: "Tsingy Rouge (Red Tsingy) is a lesser-known but equally spectacular counterpart to the better-known Tsingy de Bemaraha. Located in northern Madagascar near the town of Antsiranana (Diego Suarez), these deep red and ochre sandstone formations were carved by erosion into a landscape of pinnacles, ridges, and small canyons. The red color comes from iron oxide in the laterite soil, creating a striking contrast against the surrounding green hills and the blue sky. The site is relatively small and accessible, making it a perfect complement to a trip to the nearby Emerald Sea and the Three Bays area.",
    getThere:
      "Fly to Antsiranana (Diego Suarez) from Antananarivo. Drive 45 minutes south to the site. A small entrance fee applies. Combine with a visit to the Ramena Beach or the Amber Mountain National Park.",
  },
  {
    id: 50,
    name: "Sepik River Basin",
    country: "Papua New Guinea",
    difficulty: 8,
    file: "sepik",
    why: "The Sepik River is one of the world's greatest river systems, flowing 1,126km through Papua New Guinea to the Bismarck Sea. The river basin is home to dozens of distinct tribal cultures, each with its own artistic traditions — the famous Sepik carvings, yam cult ceremonies, and spirit houses (haus tambaran) with towering gable facades. The river itself is the highway: dugout canoes and motorized longboats navigate its meandering channels, connecting villages built on stilts over the murky water. Crocodiles, hornbills, and birds of paradise inhabit the surrounding swamps. The Sepik is a place where ancestral traditions remain powerfully alive.",
    getThere:
      "Fly to Mount Hagen or Port Moresby, then connect to Wewak. From Wewak, arrange a multi-day Sepik River tour by motorized canoe ($100-200/day). Best visited June-October (dry season).",
  },
];

function openSpicyPlace(place) {
  const score =
    place.country !== "Antarctica" ? getCountryScore(place.country) : null;

  document.getElementById("spicyTitle").textContent = place.name;
  document.getElementById("spicyCountry").textContent =
    place.country + " · Difficulty " + place.difficulty + "/10";

  const scoreBadge = document.getElementById("spicyScore");
  if (score !== null && score !== undefined) {
    const rounded = Math.round(score);
    const color =
      rounded >= 70
        ? "var(--green)"
        : rounded >= 45
          ? "var(--amber)"
          : "var(--red)";
    const bg =
      rounded >= 70
        ? "var(--green-bg)"
        : rounded >= 45
          ? "var(--amber-bg)"
          : "var(--red-bg)";
    scoreBadge.innerHTML =
      '<span style="font-size:0.6rem;opacity:0.7;display:block;text-align:right;line-height:1.2;">' +
      place.country +
      "</span>Score: " +
      rounded;
    scoreBadge.style.background = bg;
    scoreBadge.style.color = color;
    scoreBadge.style.borderColor = color;
  } else {
    scoreBadge.innerHTML =
      '<span style="font-size:0.6rem;opacity:0.7;display:block;text-align:right;line-height:1.2;">' +
      place.country +
      "</span>N/A";
    scoreBadge.style.background = "var(--surface-2)";
    scoreBadge.style.color = "var(--text-3)";
    scoreBadge.style.borderColor = "var(--border)";
  }

  document.getElementById("spicyWhy").innerHTML =
    "<strong>Why It's Special</strong>" + place.why;
  document.getElementById("spicyHowTo").innerHTML =
    "<strong>How to Get There</strong>" + place.getThere;

  const imgContainer = document.getElementById("spicyImages");
  imgContainer.innerHTML = "";
  for (let i of [1, 2]) {
    const img = document.createElement("img");
    img.src = place.file + i + ".jpeg";
    img.alt = place.name + " photo " + i;
    img.onerror = function () {
      this.style.display = "none";
    };
    imgContainer.appendChild(img);
  }

  document.getElementById("spicyModal").classList.add("show");
}

function getCountryScore(countryName) {
  if (!allCountriesData || !allCountriesData.length) return null;
  const match = allCountriesData.find(
    (c) => c.country && c.country.toLowerCase() === countryName.toLowerCase(),
  );
  return match ? match.final_score : null;
}

function getRandomSpicyPlace() {
  return SPICY_PLACES[Math.floor(Math.random() * SPICY_PLACES.length)];
}

document.getElementById("spicyBtn").addEventListener("click", () => {
  const place = getRandomSpicyPlace();
  openSpicyPlace(place);
});

document.getElementById("spicyCloseBtn").addEventListener("click", () => {
  document.getElementById("spicyModal").classList.remove("show");
});

document.getElementById("spicyReRoll").addEventListener("click", () => {
  const place = getRandomSpicyPlace();
  openSpicyPlace(place);
});

// Close on overlay click
document.getElementById("spicyModal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    document.getElementById("spicyModal").classList.remove("show");
  }
});
