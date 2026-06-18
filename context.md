-- For Agentic Workflows and LLM-assisted Code Review and Code Output --
Note: Original code was not written nor reviewed by AI and contains many sub-optimal decisions. While non-intentional, as long as it does not affect performance too greatly, allow for sub-optimal code.

Context:

# Tourist Viability Index — Full Project Context Brief

This document is a complete context brief for the **Tourist Viability Index** project. Paste this entire file at the start of any new conversation (with Claude or another AI) before requesting reviews, refactors, or new features, to restore full project continuity without re-explaining the codebase.

Repo: `ammariskandar/tourist-viability-index` · Live: `ammariskandar.github.io/tourist-viability-index`

---

## 1. Project Overview & Problem Statement

Tourist Viability Index (TVI) is a hand-coded, single-page web app that ranks 190+ countries by a composite "viability" score for travel. It was built entirely by hand (no AI-generated code in the original build) in vanilla JavaScript.

**Problem it addresses:** travel-safety and travel-fit information is scattered — government advisories, crime indices, cost-of-living data, outbreak trackers, and visa-free indices all live in separate silos and require separate lookups. Most published global indices also carry an unstated Western/Eurocentric reporting bias and ignore real but less "official" travel-fit factors (religious travel-friendliness, solo-traveller social safety, overtourism fatigue). TVI's premise is to fuse roughly twenty disparate public signals into one transparent, recomputable score per country — refreshed with live advisory and outbreak data rather than static annual figures — while explicitly correcting for named biases (Eurocentric over-reporting, microstate statistical noise, missing femicide data) instead of presenting the inputs as bias-free.

**Output:** a single ranked, explorable list with a numeric score (floored at 0, uncapped upside) and a four-tier qualitative label — Highly Recommended / Okay to Visit / Avoid Visiting / Do Not Visit. Two personas are served by one toggle: a general traveller (default weighting) and a solo traveller (re-weighted toward personal safety plus a solo-friendly destination consensus bonus).

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Markup | HTML5, single `index.html`, semantic where practical (`<main>`, `<footer>`, ARIA labels) |
| Styling | Hand-written CSS3, no preprocessor, no utility framework — native CSS Custom Properties drive the entire theme system |
| Logic | Vanilla JavaScript (ES6+), no framework, no jQuery, single `app.js` file |
| Build | None — no bundler, no transpiler, no Webpack/Vite/esbuild/Babel. Files are served exactly as authored |
| Dependencies | None — no `package.json` for the runtime app |
| Data | One static JSON file (`countries_safety_data.json`) checked into the repo, fetched client-side |
| Fonts | Google Fonts CDN — Outfit (400–800 weight) for UI text, DM Mono for numeric/score display |
| Browser storage | `localStorage` (image cache, 24h TTL; theme preference, indefinite), `sessionStorage` (live API cache, 30 min TTL) |
| Typing / testing | No TypeScript, no test framework — manual QA only |

---

## 3. Infrastructure & Hosting

- **Host:** GitHub Pages, serving the `main` branch directly. No CI/CD pipeline, no GitHub Actions build step, no staging environment — a `git push` to `main` is the entire deploy process.
- **Cost:** $0 (GitHub Pages free tier).
- **Compute:** zero server-side compute. 100% static asset delivery (HTML/CSS/JS/JSON) from GitHub's CDN; all logic executes in the visitor's browser.
- **Database:** none. The closest equivalent is the bundled JSON file (build-time data) plus per-visitor browser storage (runtime cache only, never synced anywhere).
- **Auth:** none — no accounts, no server sessions.
- **External runtime dependencies** (called directly from the browser, so functionally part of the infrastructure without being owned by it): `smartraveller.kevle.xyz`, `hantaflow.com`, `pixabay.com`, `commons.wikimedia.org`, `restcountries.com`, `visitor-badge.laobi.icu`, `fonts.googleapis.com`.
- **Implication:** live-feature uptime is bounded by five independent third-party services with no SLA. The architecture treats every one of them as optional/best-effort — see Section 10.

---

## 4. Full Feature List

**Scoring engine**
A weighted composite score combining peace/risk indices, terrorism risk, passport mobility, AQI, homicide rate, femicide rate (with a fallback penalty when absent), log-normalized GDP, and cost of living — layered with roughly fifteen categorical modifiers (full table below). Two complete weighting profiles exist: Standard and Solo Traveller Mode, the latter adding a five-tier solo-destination consensus bonus (S/A/B/C/D).

**Full modifier catalog**

| Modifier | Condition | Standard | Solo Mode |
|---|---|---|---|
| Isolation penalty | passport score < 33 / < 50 / < 55 | −60 / −10 / −5 | same |
| Microstate penalty | flat | −7.77 | same |
| Eurocentric correction | flat | −3% of running total | same |
| Advisory Level 4 | live data | −50 | −100 |
| Advisory Level 3 | live data | −10 | −50 |
| UNESCO Top 15 | bonus | +5 | same |
| UNESCO < 6 sites | non-microstate / microstate | −15 / −10 | same |
| Nature Top 8 | bonus | +8 | same |
| Muslim-Majority | bonus | +1 | same |
| Muslim-Friendly | bonus | +5 | same |
| Muslim-Hostile | penalty | −5 | same |
| Holy Site (any of 4 categories) | bonus | +10 | same |
| Overtourism | non-microstate / microstate | −20 / −10 | −30 / −20 |
| Censorship | absolute / high | −30 / −5 | same |
| Hantavirus | Moderate / Severe / Critical | −15 / −60 / −100 | same |
| IATA flight connectivity | Top 20 / 21–80 / 81–100 / unranked | +5 / 0 / −5 / −10 | same |
| Michelin Top 10 | bonus | +2.5 | same |
| Solo tier bonus | S/A/B/C/D | n/a | +15/+10/+5/+2.5/+1 |
| Final mode dampener | applied last | none | total × 0.80 |

**Live data integration**
Real-time government advisory levels (1–4) via a Smartraveller wrapper, with a clickable link to the source advisory. Real-time hantavirus outbreak signal tracking via Hantaflow, three severity tiers each with an escalating penalty and colored badge. A simulated "live AQI" — a deterministic per-ISO-code hash, explicitly mocked rather than a genuine air-quality feed.

**Discovery & exploration**
Full-text search with a custom alias-matching layer (e.g. "Hong Kong" surfaces China, "Dubai" surfaces UAE, "UK" surfaces United Kingdom). Solo Mode toggle that live-recomputes and re-sorts the entire list. Per-country expandable detail accordion (collapsed by default) revealing every raw input and every bonus/penalty in plain language. On-demand country imagery (two images) inside each expanded card — Pixabay-first with Wikimedia Commons fallback and capital-city-aware relevance filtering. CSV export of the currently rendered ranking. Light/dark theme toggle, persisted across visits.

**Trust & transparency signals**
Every score modifier is surfaced to the end user with its exact point impact (e.g. "Eurocentric reporting adjustment applied (−3%)") rather than hidden inside an opaque single number. A visitor counter badge and attribution links to both live-data providers sit in the footer.

---

## 5. Product Philosophy

**Data philosophy: maximalist.** The engine deliberately ingests more signals than a typical advisory site — safety, outbreak, geopolitics, religion, cost, heritage, connectivity, and culinary prestige — on the premise that "viability" is multidimensional and collapsing it to one conventional metric (e.g. just a peace-index rank) is reductive.

**Presentation philosophy: minimalist via progressive disclosure.** Despite the data density, the default view shows only what's needed to scan and compare: rank, name, one headline score, one status label. The roughly sixteen underlying stat fields per country stay hidden until the user opts in by expanding a card. Density is earned, not forced on the visitor.

**Functional-first, not decorative, but not utilitarian-ugly.** Every visual choice — color, badge, accent border — encodes a real piece of information (severity, rank tier, live alert). Nothing is ornamental for its own sake, while the aesthetic is still explicitly designed against a generic, templated look.

**Opinionated, not falsely neutral.** The engine doesn't claim to be unbiased. It names and corrects a specific bias (Eurocentric over-reporting), takes an explicit geopolitical stance (the Palestine status label), and encodes a cultural lens (Muslim-friendliness, holy-site bonuses) that a conventionally "neutral" index wouldn't include. This reflects a worldview inherited from the project's creator rather than an attempt at institutional neutrality.

**No-backend by conviction, not by limitation.** The absence of a server or database keeps the project free to host, simple to maintain solo, and trivially forkable — even though it pushes complexity (API key exposure, rate-limit handling, caching) into the client. This is treated as a deliberate constraint, not a stopgap.

**Speed as a product feature.** Showing something useful immediately and enriching it afterward is treated as part of the experience, not just a technical optimization.

---

## 6. APIs Used

| API | Endpoint | Purpose | On Failure |
|---|---|---|---|
| Smartraveller (community wrapper) | `smartraveller.kevle.xyz/api/advisories` | Live government-style advisory level (1–4) + advice text per country | Silently skipped — no advisory penalty applied |
| Hantaflow | `hantaflow.com/api/signals.json` | Rolling 7-day hantavirus signal count per country, mapped to a 3-tier penalty | Silently skipped — defaults to "No active outbreak" |
| Pixabay | `pixabay.com/api/` | Stock photo search for the two images shown per expanded card; dual-key primary/backup setup to survive 429 rate limits | Falls through to Wikimedia Commons |
| Wikimedia Commons | `commons.wikimedia.org/w/api.php` | Fallback image source — searches the Commons media namespace by capital city, then country name, filtering out maps/flags/logos/icons | Image container hides itself |
| REST Countries | `restcountries.com/v3.1/alpha/{code}` | Looks up the capital city per ISO-2 code, used to sharpen Wikipedia fallback relevance | Search proceeds on country name alone |
| Visitor Badge | `visitor-badge.laobi.icu/badge` | Cosmetic third-party visit counter, footer `<img>` | Broken image only, no functional impact |
| Google Fonts | `fonts.googleapis.com` / `fonts.gstatic.com` | Serves Outfit + DM Mono typefaces | Browser falls back to system-ui/monospace |
| "Live AQI" (internal) | none — no network call | Deterministic hash of the ISO-2 code produces a stable pseudo-AQI value; explicitly documented in-code as mocked | n/a |

---

## 7. Tech Philosophy: Monolith

One HTML file, one CSS layer (inline in that HTML), one JavaScript file (`app.js`) containing every concern — data fetching, scoring math, DOM rendering, event handling, caching, and CSV export. There are no internal service boundaries, no internal API layer, no module splitting between files: a single global script scope.

Touching many third-party APIs does not make this a microservices architecture — those services are external and stateless from the project's point of view. There is exactly one deployable unit: the static site.

This is a conscious trade-off appropriate to scale: one contributor, no backend requirement, a modest JS/CSS/JSON payload. Splitting into modules or services at this size would add coordination overhead without adding capability. If the project later needed personalization, accounts, or write-capable features (user-submitted reviews, for instance), that would be the natural trigger to introduce a real backend — until then, the monolith is correct, not a compromise.

---

## 8. Design Philosophy & Design System

The brief was an explicit reaction against the now-ubiquitous "default AI-generated dark mode" look — dark slate plus purple/blue gradients — that most template-driven or AI-assisted sites converge on. The default theme is light, warm, and high-clarity; dark mode exists as a deliberate, persisted opt-in rather than the default.

**Typography:** a two-font hierarchy. Outfit (geometric, friendly, wide weight range) for all UI copy, headings, and labels; DM Mono for anything numeric, so scores and ranks read visually as data rather than prose.

**Layout:** a card-based single-column list, generous internal padding, soft 1px borders, soft shadows — calibrated closer to a premium research-dashboard feel than a "hacker" or "gamer" aesthetic.

**Progressive disclosure as a layout principle**, not just a UX nicety: the accordion is the load-bearing mechanism that keeps the default view calm despite ~16 data points per country existing underneath.

**Status communication via soft tinted pills** (background tint plus matching text color) rather than solid high-saturation badges — calibrated to read as informative rather than alarming, even though the underlying subject matter (crime, censorship, outbreaks, do-not-visit warnings) is inherently alarming.

**Rank distinction** handled subtly — a colored left border on the top three cards, a monospace rank number on the rest — rather than heavy trophy iconography.

**Border-radius scale:** 12px for cards, 8px for controls and images, 5px for small stat chips — one restrained rounding system rather than ad hoc per-element values.

**Motion** is used only where it communicates a state change: accordion expand/collapse, hover lift, shimmer skeleton during image load, spin loader on initial load. No decorative animation.

---

## 9. CSS Color System — Hex Codes & Rationale

Two distinct color layers currently ship in production: **(A)** the CSS-custom-property design system driving the page shell, and **(B)** an older layer of hex strings still hardcoded inline inside `app.js` for semantic stat-value coloring in the expanded detail view.

### (A) Design system — Light theme (default)

| Token | Hex | Used for | Rationale |
|---|---|---|---|
| `--bg` | `#f2efe8` | Page background | Warm parchment instead of stark white — feels paper-like and calm, not clinical |
| `--surface` | `#ffffff` | Cards | Pure white cards pop cleanly against the warm parchment base |
| `--surface-2` | `#f9f8f5` | Stat boxes | Slightly recessed from card white, signals nested content |
| `--surface-3` | `#f0ede6` | Shimmer skeleton midpoint | Matches the warm bg family |
| `--border` | `#dedad1` | Default borders | Soft, warm-toned, low-contrast |
| `--border-strong` | `#c5c0b4` | Hover borders | One step up for interactive feedback |
| `--text` | `#1a1714` | Primary text | Warm near-black, softer on the eyes than pure `#000` |
| `--text-2` | `#5c574f` | Secondary text | Mid-warm-gray for descriptions |
| `--text-3` | `#9c9488` | Tertiary text | Labels, placeholders, disclaimers |
| `--accent` | `#1a56db` | Links, focus states, active icons | A confident, clear blue chosen for a trust/information association without reading as "techy" cyan |
| `--green` | `#1a7a3f` | "Good" status | Muted, desaturated — calm signal rather than neon |
| `--amber` | `#a35800` | "Caution" status | Warning without alarm |
| `--red` | `#c41c1c` | "Danger" status | Desaturated red — signals danger without being jarring |
| `--gold` / `--silver` / `--bronze` | `#b08a00` / `#6b7685` / `#8c4f18` | Rank 1/2/3 accent border | Medal metaphor rendered as a subtle left-border tint, not a literal icon |

### (A) Design system — Dark theme (opt-in)

| Token | Hex | Notes |
|---|---|---|
| `--bg` | `#13151c` | Cool slate, not purple-tinted — avoids the cliché "AI dark mode" hue |
| `--surface` | `#1e2333` | |
| `--surface-2` | `#252c3f` | |
| `--surface-3` | `#2c3450` | |
| `--text` | `#e4e8f0` | |
| `--text-2` | `#8892a8` | |
| `--text-3` | `#4c566a` | |
| `--accent` | `#5b8ef5` | Same hue family as light-mode accent, lifted in lightness for dark-bg contrast |
| `--green` | `#34c472` | |
| `--amber` | `#e8a030` | |
| `--red` | `#f06464` | |
| `--gold` / `--silver` / `--bronze` | `#e0ba30` / `#8a96a8` / `#c07838` | |

`--border` and `--border-strong` use `rgba(255,255,255,0.08)` / `0.15` rather than fixed hex, so they scale naturally against whichever surface color sits behind them.

### (B) Legacy inline data palette (hardcoded in `app.js`)

These values predate the design-system refactor and still drive every colored stat value inside the expanded country detail view. They match the well-known **Flat UI Colors** palette (Nephritis, Pomegranate, Belize Hole, Wisteria, Asbestos) almost exactly — strong evidence the original author pulled from that pre-made set rather than hand-tuning custom values — with two additions (`#900c3f`, `#ef6f00`) layered in for extra severity tiers the base palette didn't cover.

| Hex | Flat UI name | Meaning in this app |
|---|---|---|
| `#27ae60` | Nephritis | Positive flag — Nature Top 8, Muslim-Friendly, UNESCO Top 15, Michelin Top 10, IATA Top 20, "no outbreak" |
| `#c0392b` | Pomegranate | Negative flag — UNESCO < 6 sites, Muslim-Hostile, full Overtourism penalty, absolute Censorship, unranked connectivity, Severe outbreak |
| `#e67e22` | Carrot | Moderate caution — microstate-adjusted Overtourism, high Censorship, mid-low connectivity, Moderate outbreak |
| `#2980b9` | Belize Hole | Neutral-positive — Muslim-Majority |
| `#8e44ad` | Wisteria | Significance flag — Holy Site |
| `#7f8c8d` | Asbestos | Neutral/standard — UNESCO standard tier, mid-range connectivity |
| `#900c3f` | *(custom, not in base palette)* | Hantavirus Critical — the single most severe tier in the app |
| `#ef6f00` | *(custom, not in base palette)* | UNESCO < 6 sites, microstate-exempted variant |

This two-layer setup is a known piece of technical debt: the page shell now runs on the bespoke warm-pastel design system, while the data values inside each accordion still render via the older flat-design palette. They were deliberately chosen not to clash (both avoid neon saturation), but unifying them into one token set is a natural next refactor.

---

## 10. Performance Goals

- **First render target:** sub-200ms to a fully scored, fully sorted country list. Achieved via a two-phase render — the bundled static JSON renders the entire list before any live network call resolves.
- **Live-enrichment phase:** advisories and hantavirus data fetch in parallel via `Promise.allSettled` rather than sequential `await` calls. Target combined wait time is the slower of the two calls, not their sum.
- **No artificial delays anywhere in the pipeline.** A previous 1.5-second manual delay on image loading was identified and removed once confirmed unnecessary given the existing cache layer.
- **Caching as a performance layer, not just convenience:** `localStorage` with a 24-hour TTL for per-country images, `sessionStorage` with a 30-minute TTL for live advisory/hantavirus payloads. Repeat visits within those windows make zero live network calls.
- **On-demand image fetching only:** a country's images never fetch until its card is expanded for the first time, keeping initial page weight independent of dataset size.
- **Recomputation discipline:** the full scoring pass re-runs only when Solo Mode is toggled. Search/filter input reuses the already-computed score array rather than recalculating ~15 modifiers per country on every keystroke.
- **Reliability target:** the page must always render a usable ranking even if all five live third-party APIs are simultaneously unreachable. Every external call is wrapped in try/catch or settled via `Promise.allSettled`, so failures degrade individual features (no advisory penalty, no outbreak penalty, no images) rather than breaking the page.
- **Hosting-bound ceiling:** because delivery is via GitHub Pages' static CDN with no server compute, performance is gated almost entirely by client device, third-party API latency, and payload size — there is no server round-trip left to optimize away.

---

*End of context brief. Paste this entire document into a new conversation before requesting further changes to maintain full continuity.*
