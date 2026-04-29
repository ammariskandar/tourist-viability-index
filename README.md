The Holistic Global Livability & Safety Index
A comprehensive, real-time, data-driven ranking engine evaluating global safety, livability, and accessibility.

While traditional indices often rely on single-axis metrics (e.g., only economics or only crime rates), this application aggregates overlapping realities—ranging from physical safety and geopolitical stability to diplomatic mobility, economic viability, and inclusivity. Furthermore, the engine automatically corrects for institutional reporting biases and statistical anomalies to present a truly balanced, globally representative model.

📊 Live Application
(Insert Link to GitHub Pages / Live Demo Here)

⚙️ The Core Methodology
The index calculates a baseline score using four primary datasets, normalized and weighted to create a mathematically sound baseline of physical and geopolitical security.

1. General Safety (Weight: 13%)
Source: The Global Peace Index (GPI) by the Institute for Economics & Peace.

Logic: The GPI provides an excellent macroscopic view of a nation's internal harmony. However, its weight is capped at 13% because the GPI historically penalizes countries for heavy military spending (e.g., the United States or South Korea) even if the physical streets are exceptionally safe for civilians.

2. Geopolitical Stability (Weight: 22%)
Source: The Global Terrorism Index (GTI).

Logic: Weighted heavily to account for unpredictable, systemic violence. A nation may have low street crime, but high risk of domestic insurgency or border conflict drastically reduces overall safety and livability. Active warzones naturally trigger severe penalties within this metric.

3. Diplomatic Mobility (Weight: 2%)
Source: The Henley Passport Index.

Logic: A measure of how easily a citizen or traveler can enter a country without heavy visa restrictions. While not a direct measure of physical safety, high diplomatic mobility heavily correlates with international trust and open economies.

4. Environmental Safety (Weight: 1%)
Source: Mocked Live AQI (Air Quality Index).

Logic: A small modifier to reflect daily environmental livability. Breathing toxic air is a physical safety risk, even in politically stable nations.

⚖️ Severe Crime Metrics & Gender Parity
General indices often fail to capture the reality of life for marginalized groups or women. This index explicitly breaks out violent crime to ensure extreme dangers are not hidden behind "good economies."

1. Homicide Rate (Dynamic Weight: 25% - 62%)
Source: UNODC (United Nations Office on Drugs and Crime).

Logic: The ultimate, un-fudgeable metric of violent crime.

2. Femicide Rate & Accountability Penalty (Weight: 37%)
Source: UNODC & Global Observatories.

Logic: General homicide rates often mask extreme gender-based violence.

The Accountability Penalty: If a country fails or refuses to report femicide data to global observatories, the engine assumes bad faith or systemic failure. The weight of the missing data is shifted entirely to the homicide rate, and a 1.7x punitive multiplier is applied to their violent crime score. Countries cannot cheat the algorithm by hiding data.

3. Sexual Crime Risk (Flat Subtraction)
Logic: A flat point deduction based on reported sexual violence rates. Because global reporting standards for sexual assault vary wildly (often due to cultural stigmas surrounding reporting), this is applied as a direct deduction rather than a normalized weight, ensuring countries with skyrocketing rates are mathematically anchored to the bottom.

📈 Economic Realities
Physical safety means little if the country is economically unviable or suffering from hyperinflation.

1. GDP (Logarithmic Scale)
Source: The World Bank.

Logic: Gross Domestic Product is scored from 0-10. Because global wealth inequality is extreme (ranging from Tuvalu's $60M to the US's $27T), a linear scale would grant the top two nations a perfect score while mathematically flatlining the rest of the planet. We utilize a Logarithmic Base-10 Scale to fairly distribute points across developing, emerging, and developed markets.

2. Cost of Living Index (CLI)
Source: Numbeo / Global CLI databases.

Logic: Scored from 0-5. Points are awarded for affordability. High CLI (expensive living) yields 0 points, while highly affordable nations gain the full +5.

🧠 Bias Corrections & Algorithmic Adjustments
Raw data is rarely neutral. To prevent the index from simply echoing institutional privilege, the engine runs a series of hardcoded algorithmic adjustments.

1. The Eurocentric Reporting Adjustment (-5% Penalty)
Target: NATO Member States, Austria, Switzerland, Ireland.

Logic: It is a well-documented statistical phenomenon that Western-headquartered institutions (which produce the GPI, Henley Index, etc.) naturally score nations with Western-style geopolitical structures higher, while penalizing alternative governance models. This 5% algorithmic reduction acts as a counterbalance to institutional "Reporting Bias."

Further Reading:

The Bias of the Global Peace Index (Various sociological critiques regarding the weighting of military capability vs. domestic safety).

Western-Centrism in Global Rankings by scholars like Dr. Juan Pablo Luna.

2. The Microstate Statistical Anomaly Penalty (-2.77 Points)
Target: Nations under 1,000 sq km or populations under 100k (e.g., Vatican City, Monaco, San Marino).

Logic: In statistics, tiny sample sizes create wild distortions. A microstate with 800 citizens naturally reports 0 homicides and 0 terror attacks, launching them to the absolute top of the index. This minor deduction prevents city-states from mathematically overwhelming complex, multi-million-population nations in the top 10.

3. The Isolation Penalty (-5 to -60 Points)
Target: Countries with extremely poor diplomatic scores (VFS < 55).

Logic: If a country is physically safe but functionally impossible to enter or leave (extreme visa restrictions, closed borders), it is not "livable" for the global citizen. Severe diplomatic isolation triggers escalating point deductions.

🌟 Cultural, Environmental, and Inclusive Bonuses
Livability is not just the absence of danger; it is the presence of culture, beauty, and hospitality.

1. The UNESCO Heritage Bonus (+5 Points)
Target: The Top 10 countries with the most UNESCO World Heritage Sites (Italy, China, Germany, Spain, France, India, Mexico, UK, Russia, Iran).

Logic: A direct mathematical reward for nations that preserve and offer exceptional historical, architectural, and cultural richness.

2. The Natural Landscape Bonus (+10 Points)
Target: China, Australia, Brazil.

Logic: Based on global surveys (e.g., CEOWORLD), these nations hold unparalleled natural beauty, biodiversity, and varied ecosystems, adding immense holistic value to livability.

3. Muslim-Friendly Travel Metric (-5 to +5 Points)
Target: Muslim-Majority, Muslim-Friendly, and Muslim-Hostile nations.

Logic: A crucial accessibility metric for over 1.9 billion global citizens.

Muslim-Hostile (-5): Applied to nations with documented spikes in Islamophobic hate crimes, institutional hostility, or geo-located hate speech (e.g., France, India, US, UK).

Muslim-Friendly (+5): Applied to non-majority nations that rank high for Halal accessibility, mosque infrastructure, and welcoming policies (e.g., Thailand, Germany, Tanzania).

Muslim-Majority (+1): A minor bump. While perfectly accessible, it does not warrant a massive bonus as it is the baseline expectation for these regions.

🚨 Real-Time API Integration: Smartraveller
The static mathematical model is cross-referenced with real-time geopolitical intelligence.

Integration: The app calls a live API tracking DFAT (Australian Department of Foreign Affairs and Trade) advisories.

Logic: If a country is suddenly designated "Level 3: Reconsider Your Need to Travel" or "Level 4: Do Not Travel" (due to a sudden coup, natural disaster, or outbreak), the engine immediately intercepts the final score, deducts between 10 and 50 points, and permanently affixes a live warning toast to the country's UI card, complete with a direct link to the official government briefing.

💻 Tech Stack
Frontend: Pure HTML5, CSS3, Vanilla ES6 JavaScript. No framework bloat.

Data Handling: Asynchronous JSON parsing, DOM manipulation, responsive CSS Grid.

APIs: RESTful integration with real-time government advisory endpoints.
