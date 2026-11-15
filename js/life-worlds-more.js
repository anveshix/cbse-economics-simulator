// ══════════════════════════════════════════════════════════════
// js/life-worlds-more.js — four more Living Worlds
//   ppf-island      Class XI  · Part B · Unit 4   (PPF, opportunity cost, what to produce)
//   value-chain     Class XII · Part A · Unit 1   (value added, double counting, GDP methods)
//   forex-counter   Class XII · Part A · Unit 5   (exchange rate, fixed vs flexible, reserves)
//   green-commons   Class XII · Part B · Unit 7   (sustainable use of a renewable resource)
// ══════════════════════════════════════════════════════════════
// Contract and honesty rules: top of js/life-engine.js. Worked models:
// docs/economics/models/living-worlds.md. Units 6 and 8 of Indian Economic
// Development, and Class XI Part A Unit 1, have no world on purpose: they are
// history and cross-country data, which a game model could only invent.

/* global LIFE_WORLDS, B2, rupee, lifeT, lifeSvg, LIFE_INK, LIFE_MUTE */

const f1 = v => String(Math.round(v * 10) / 10);
const usd = v => `$${f1(v)}`;
const pctStr = v => `${Math.round(v)}%`;

// ── 7. THE PPF ISLAND ─────────────────────────────────────────────
// Workers split their hours between rice and fishing. Each good has
// diminishing returns to hours (output = productivity × √hours), so the
// frontier is a quarter-ellipse  (R/a)² + (F/b)² = L  — bowed out, with an
// opportunity cost that rises as more of one good is made.
const PPF = {
    STEP: 10,
    params(season) {
        const base = { L: 100, a: 4, b: 4, alpha: 0.4 };
        if (season === 3) return Object.assign({}, base, { alpha: 0.7 });              // tastes swing to rice
        if (season === 4) return Object.assign({}, base, { b: 5 });                    // a better net
        if (season === 5) return Object.assign({}, base, { b: 5, L: 140 });            // more people
        if (season === 6) return Object.assign({}, base, { b: 5, L: 140, alpha: 0.5 });
        return base;
    },
    rice(x, p) { return p.a * Math.sqrt(x); },
    fish(y, p) { return p.b * Math.sqrt(y); },
    maxRice(p) { return p.a * Math.sqrt(p.L); },
    maxFish(p) { return p.b * Math.sqrt(p.L); },
    // The most fish that can be had alongside R rice, all hours employed.
    frontierFish(R, p) { const k = R / p.a; return p.b * Math.sqrt(Math.max(0, p.L - k * k)); },
    utility(R, F, p) { return Math.pow(R, p.alpha) * Math.pow(F, 1 - p.alpha); },
    key(p) { return `${p.L}/${p.a}/${p.b}`; },
    best(p) {
        let b = null;
        for (let x = 0; x <= p.L; x += PPF.STEP) for (let y = 0; x + y <= p.L; y += PPF.STEP) {
            const R = PPF.rice(x, p), F = PPF.fish(y, p), U = PPF.utility(R, F, p);
            if (!b || U > b.U) b = { x, y, R, F, U };
        }
        return b;
    },
    // Fish given up per unit of extra rice when the next STEP hours move from fishing to rice,
    // starting from a full-employment split with x hours on rice.
    oc(x, p) {
        const dR = PPF.rice(x + PPF.STEP, p) - PPF.rice(x, p);
        const dF = PPF.fish(p.L - x, p) - PPF.fish(p.L - x - PPF.STEP, p);
        return dF / dR;
    },
    change(p0, p1) {
        const r = PPF.maxRice(p1) > PPF.maxRice(p0) + 1e-9, f = PPF.maxFish(p1) > PPF.maxFish(p0) + 1e-9;
        return r && f ? 'both' : (f ? 'fish' : (r ? 'rice' : 'none'));
    }
};
const PPF_CHANGE_IDX = { fish: 0, rice: 1, both: 2, none: 3 };
const PPF_CHANGE_OPTIONS = [
    B2('Only the fish end moves out', 'केवल मछली वाला सिरा बाहर खिसकेगा'),
    B2('Only the rice end moves out', 'केवल चावल वाला सिरा बाहर खिसकेगा'),
    B2('Both ends move out', 'दोनों सिरे बाहर खिसकेंगे'),
    B2('The PPF does not move at all', 'PPF बिल्कुल नहीं खिसकेगा')
];

LIFE_WORLDS.push({
    id: 'ppf-island', icon: '🏝️', accent: '#0369a1', minutes: 7,
    title: B2('The Island', 'द्वीप'),
    role: B2('the planner of a small island', 'एक छोटे द्वीप के योजनाकार'),
    tagline: B2('Rice or fish? Every hour has two uses. Find out what choosing one really costs.', 'चावल या मछली? हर घंटे के दो उपयोग हैं। जानिए एक चुनने की असली क़ीमत क्या है।'),
    class: 'XI', part: 'B', unit: 4, unitTitle: 'Introduction',
    syllabusIds: ['XI-B-U4-PPF-OC', 'XI-B-U4-CENTRAL-PROBLEMS'],
    labs: ['micro-ppf', 'gl-ppc-drag'],
    rounds: 6, roundWord: B2('Season', 'मौसम'),
    goLabel: B2('Start the season ▶', 'मौसम शुरू करें ▶'),
    brief: B2(
        `<p>Your island has <b>100 worker-hours</b> every season. Each hour goes to <b>rice</b> in the paddies or to <b>fishing</b> at sea — it cannot do both.</p>
         <p>The more hours a crop gets, the less each extra hour adds. The islanders enjoy rice and fish together, and what they want changes with the season.</p>
         <p>Each season, decide how many hours go to each. Leaving hours idle is allowed — but is it wise?</p>`,
        `<p>आपके द्वीप के पास हर मौसम <b>100 श्रम-घंटे</b> हैं। हर घंटा या तो खेतों में <b>चावल</b> के लिए जाता है या समुद्र में <b>मछली</b> के लिए — दोनों में नहीं।</p>
         <p>किसी फ़सल को जितने ज़्यादा घंटे मिलते हैं, हर अतिरिक्त घंटा उतना कम जोड़ता है। द्वीपवासियों को चावल और मछली दोनों पसंद हैं, और मौसम के साथ उनकी चाह बदलती है।</p>
         <p>हर मौसम तय कीजिए कि कितने घंटे किसे दें। घंटे ख़ाली छोड़ना भी संभव है — पर क्या यह समझदारी है?</p>`),
    truth: PPF,
    init() { return {}; },
    news(state, season) {
        if (season === 1) return B2('Rice: 4 × √(hours). Fish: 4 × √(hours). The islanders like the two in the ratio 2 : 3 — a little more fish than rice.', 'चावल: 4 × √(घंटे)। मछली: 4 × √(घंटे)। द्वीपवासी दोनों को 2 : 3 के अनुपात में चाहते हैं — मछली थोड़ी ज़्यादा।');
        if (season === 3) return B2('🎉 A festival: everyone suddenly wants far more rice than fish. The island itself is just as it was.', '🎉 उत्सव: सब अचानक मछली से कहीं ज़्यादा चावल चाहते हैं। द्वीप ख़ुद वैसा ही है जैसा था।');
        if (season === 4) return B2('🛶 Fishermen bring back a better net: fish now come as 5 × √(hours) instead of 4 × √(hours). Rice is unchanged. Tastes go back to normal.', '🛶 मछुआरे बेहतर जाल लाए हैं: मछली अब 4 × √(घंटे) की जगह 5 × √(घंटे) मिलती है। चावल वैसा ही। रुचि सामान्य हो गई।');
        if (season === 5) return B2('👶 Families arrive from the mainland. The island now has 140 worker-hours. Tastes are normal.', '👶 मुख्य भूमि से परिवार आए हैं। द्वीप के पास अब 140 श्रम-घंटे हैं। रुचि सामान्य है।');
        if (season === 6) return B2('The island settles. People now want rice and fish equally.', 'द्वीप स्थिर हो गया। अब लोग चावल और मछली बराबर चाहते हैं।');
        return B2('Another season, the same island.', 'एक और मौसम, वही द्वीप।');
    },
    decisions(state, season) {
        const p = PPF.params(season);
        return [
            { id: 'x', label: B2('Hours on rice', 'चावल को घंटे'), min: 0, max: p.L, step: PPF.STEP, value: 40, unit: B2('hrs', 'घंटे') },
            { id: 'y', label: B2('Hours on fishing', 'मछली को घंटे'), min: 0, max: p.L, step: PPF.STEP, value: 60, unit: B2('hrs', 'घंटे') }
        ];
    },
    live(state, d, season) {
        const p = PPF.params(season), idle = p.L - d.x - d.y;
        if (idle < 0) return { ok: false, text: B2(`That is ${-idle} hours more than the island has (${p.L}).`, `यह द्वीप के ${p.L} घंटों से ${-idle} घंटे ज़्यादा है।`) };
        return { ok: true, text: B2(`Rice ${f1(PPF.rice(d.x, p))} · Fish ${f1(PPF.fish(d.y, p))} · idle hours ${idle}`, `चावल ${f1(PPF.rice(d.x, p))} · मछली ${f1(PPF.fish(d.y, p))} · ख़ाली घंटे ${idle}`) };
    },
    predict(state, season) {
        const prev = PPF.params(season - 1), cur = PPF.params(season);
        const ask = (en, hi) => ({ prompt: B2(en, hi), options: PPF_CHANGE_OPTIONS, answer: () => PPF_CHANGE_IDX[PPF.change(prev, cur)] });
        if (season === 3) return ask('Tastes have swung to rice (the island is unchanged). The PPF will…', 'रुचि चावल की ओर मुड़ गई है (द्वीप वैसा ही है)। PPF…');
        if (season === 4) return ask('A better fishing net arrives. The PPF will…', 'एक बेहतर मछली-जाल आया है। PPF…');
        if (season === 5) return ask('Families arrive and add 40 worker-hours. The PPF will…', 'परिवार आए और 40 श्रम-घंटे जुड़ गए। PPF…');
        return null;
    },
    step(state, d, season) {
        const p = PPF.params(season), R = PPF.rice(d.x, p), F = PPF.fish(d.y, p), idle = p.L - d.x - d.y;
        const best = PPF.best(p), U = PPF.utility(R, F, p);
        return {
            season, p, key: PPF.key(p), x: d.x, y: d.y, idle, R, F, U, best, efficient: idle === 0,
            satisfaction: best.U > 0 ? 100 * U / best.U : 0,
            fishIfEmployed: idle > 0 ? PPF.fish(d.y + idle, p) : F
        };
    },
    scene(state, o, season, history) {
        const p = o ? o.p : PPF.params(season);
        if (!o) {
            return lifeSvg(lifeT(B2('The island and its worker-hours', 'द्वीप और उसके श्रम-घंटे')), `
                <rect x="0" y="0" width="520" height="240" rx="14" fill="#e0f2fe"></rect>
                <ellipse cx="260" cy="150" rx="200" ry="70" fill="#fde68a"></ellipse>
                <rect x="110" y="110" width="120" height="60" rx="8" fill="#86efac"></rect><text x="170" y="145" text-anchor="middle" font-size="26">🌾</text>
                <path d="M330 120 q40 -20 80 0 q-40 25 -80 0z" fill="#38bdf8"></path><text x="370" y="150" text-anchor="middle" font-size="26">🐟</text>
                <text x="22" y="30" font-size="13" font-weight="700" fill="${LIFE_INK}">🏝️ ${lifeT(B2(`${p.L} worker-hours this season`, `इस मौसम ${p.L} श्रम-घंटे`))}</text>
                <text x="22" y="50" font-size="10.5" fill="${LIFE_MUTE}">${lifeT(B2('Every hour goes to rice or to fish — or stays idle.', 'हर घंटा चावल या मछली को जाता है — या ख़ाली रहता है।'))}</text>`);
        }
        const sx = v => 62 + v / 50 * 410, sy = v => 206 - v / 60 * 172;
        const curve = pp => { let d = ''; for (let x = 0; x <= pp.L; x += 2) d += `${x === 0 ? 'M' : 'L'}${sx(PPF.rice(x, pp)).toFixed(1)} ${sy(PPF.fish(pp.L - x, pp)).toFixed(1)} `; return d; };
        const prev = history.length > 1 ? history[history.length - 2].outcome : null;
        const ghost = prev && prev.key !== o.key ? `<path d="${curve(prev.p)}" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 4"></path>
            <text x="${sx(PPF.maxRice(prev.p)) - 4}" y="${sy(0) - 6}" text-anchor="end" font-size="9.5" fill="#64748b">${lifeT(B2('last season', 'पिछला मौसम'))}</text>` : '';
        return lifeSvg(lifeT(B2('The frontier this season and where your choice landed', 'इस मौसम की सीमा रेखा और आपका चुनाव कहाँ पहुँचा')), `
            <rect x="0" y="0" width="520" height="240" rx="14" fill="#f0f9ff"></rect>
            <line x1="62" y1="206" x2="480" y2="206" stroke="#475569" stroke-width="1.6"></line><line x1="62" y1="206" x2="62" y2="26" stroke="#475569" stroke-width="1.6"></line>
            <text x="480" y="224" text-anchor="end" font-size="11" font-weight="700" fill="${LIFE_INK}">${lifeT(B2('Rice →', 'चावल →'))}</text>
            <text x="58" y="20" text-anchor="end" font-size="11" font-weight="700" fill="${LIFE_INK}">${lifeT(B2('Fish ↑', 'मछली ↑'))}</text>
            ${ghost}<path d="${curve(p)}" fill="none" stroke="#0369a1" stroke-width="3"></path>
            <text x="${sx(PPF.maxRice(p)) + 4}" y="${sy(0) - 8}" font-size="10.5" font-weight="700" fill="#0369a1">PPF</text>
            <circle cx="${sx(o.best.R)}" cy="${sy(o.best.F)}" r="7" fill="none" stroke="#16a34a" stroke-width="2.2" stroke-dasharray="3 2"></circle>
            <circle class="life-pop" cx="${sx(o.R)}" cy="${sy(o.F)}" r="6.5" fill="${o.efficient ? '#0369a1' : '#f97316'}"></circle>
            <text x="${sx(o.R) + 10}" y="${sy(o.F) - 8}" font-size="10.5" font-weight="700" fill="${LIFE_INK}">${lifeT(o.efficient ? B2('on the frontier', 'सीमा रेखा पर') : B2(`inside: ${o.idle} hours idle`, `भीतर: ${o.idle} घंटे ख़ाली`))}</text>
            <text x="480" y="44" text-anchor="end" font-size="10" fill="#16a34a">◌ ${lifeT(B2('what islanders like best', 'द्वीपवासियों की सबसे पसंदीदा'))}</text>`);
    },
    stats(o) {
        return [
            { label: B2('Rice', 'चावल'), value: f1(o.R) }, { label: B2('Fish', 'मछली'), value: f1(o.F) },
            { label: B2('Idle hours', 'ख़ाली घंटे'), value: String(o.idle), tone: o.idle > 0 ? 'bad' : undefined },
            { label: B2('Satisfaction', 'संतुष्टि'), value: pctStr(o.satisfaction), tone: o.satisfaction >= 99.5 ? 'good' : undefined }
        ];
    },
    ledger: [
        { key: 's', label: B2('Season', 'मौसम'), get: r => String(r.round) },
        { key: 'x', label: B2('Rice hrs', 'चावल घं.'), get: r => String(r.outcome.x) },
        { key: 'y', label: B2('Fish hrs', 'मछली घं.'), get: r => String(r.outcome.y) },
        { key: 'R', label: B2('Rice', 'चावल'), get: r => f1(r.outcome.R) },
        { key: 'F', label: B2('Fish', 'मछली'), get: r => f1(r.outcome.F) }
    ],
    narrate(o, state, history) {
        const used = B2(`You gave ${o.x} hours to rice and ${o.y} to fishing${o.idle ? ` and left ${o.idle} idle` : ''}: <b>${f1(o.R)}</b> rice and <b>${f1(o.F)}</b> fish. The islanders are ${pctStr(o.satisfaction)} as pleased as the best split would have made them.`,
            `आपने चावल को ${o.x} और मछली को ${o.y} घंटे दिए${o.idle ? ` और ${o.idle} घंटे ख़ाली छोड़े` : ''}: <b>${f1(o.R)}</b> चावल और <b>${f1(o.F)}</b> मछली। द्वीपवासी सबसे अच्छे बँटवारे से मिलने वाली संतुष्टि का ${pctStr(o.satisfaction)} पा सके।`);
        const same = history.slice(0, -1).filter(r => r.outcome.key === o.key && r.outcome.efficient && o.efficient && r.outcome.x !== o.x);
        if (same.length) {
            const q = same[same.length - 1].outcome, dR = o.R - q.R, dF = o.F - q.F;
            const more = dR > 0;
            return B2(`${used.en} Compared with season ${q.season} (same island): ${more ? 'rice up' : 'rice down'} by ${f1(Math.abs(dR))}, fish ${dF > 0 ? 'up' : 'down'} by ${f1(Math.abs(dF))}. Each extra unit of ${more ? 'rice' : 'fish'} cost about ${f1(Math.abs(more ? dF / dR : dR / dF))} ${more ? 'fish' : 'rice'}.`,
                `${used.hi} मौसम ${q.season} की तुलना में (वही द्वीप): चावल ${f1(Math.abs(dR))} ${dR > 0 ? 'बढ़ा' : 'घटा'}, मछली ${f1(Math.abs(dF))} ${dF > 0 ? 'बढ़ी' : 'घटी'}। हर अतिरिक्त ${more ? 'चावल' : 'मछली'} की इकाई लगभग ${f1(Math.abs(more ? dF / dR : dR / dF))} ${more ? 'मछली' : 'चावल'} की क़ीमत पर आई।`);
        }
        if (o.idle > 0) return B2(`${used.en} Those ${o.idle} idle hours, put on fishing, would have added ${f1(o.fishIfEmployed - o.F)} fish and cost nothing.`, `${used.hi} ये ${o.idle} ख़ाली घंटे मछली को देने से ${f1(o.fishIfEmployed - o.F)} मछली और मिलती, और कुछ नहीं गँवाना पड़ता।`);
        return used;
    },
    nudge(history) {
        if (!history.length) return null;
        const o = history[history.length - 1].outcome;
        if (o.idle > 0) return B2('Some hours stayed idle. Could the island have had more of one good without giving up any of the other?', 'कुछ घंटे ख़ाली रहे। क्या द्वीप किसी वस्तु को बिना दूसरी छोड़े ज़्यादा पा सकता था?');
        const eff = history.filter(r => r.outcome.efficient);
        if (eff.length >= 2 && new Set(eff.map(r => r.outcome.x)).size === 1) return B2('Every season you have split the hours the same way. What would a very different split cost — and gain?', 'हर मौसम आपने घंटे एक ही तरह बाँटे हैं। बहुत अलग बँटवारे में क्या गँवाना और क्या पाना पड़ेगा?');
        return null;
    },
    chart(history, reveal) {
        if (!history.length) return null;
        const traces = [{
            x: history.map(r => r.outcome.R), y: history.map(r => r.outcome.F), text: history.map(r => String(r.round)), mode: 'markers+text', textposition: 'top center', textfont: { size: 9 },
            marker: { size: 11, color: history.map(r => (r.outcome.efficient ? '#0369a1' : '#f97316')), line: { color: '#fff', width: 1.5 } },
            name: lifeT(B2('Your seasons (orange = idle hours)', 'आपके मौसम (नारंगी = ख़ाली घंटे)'))
        }];
        if (reveal) {
            [[PPF.params(1), B2('PPF — ordinary island', 'PPF — सामान्य द्वीप'), '#0369a1', 'solid'], [PPF.params(4), B2('PPF — better net', 'PPF — बेहतर जाल'), '#7c3aed', 'dash'], [PPF.params(5), B2('PPF — more people', 'PPF — अधिक लोग'), '#16a34a', 'dot']].forEach(([p, name, color, dash]) => {
                const xs = [], ys = []; for (let x = 0; x <= p.L; x += 2) { xs.push(PPF.rice(x, p)); ys.push(PPF.fish(p.L - x, p)); }
                traces.unshift({ x: xs, y: ys, mode: 'lines', line: { color, width: 2.5, dash }, name: lifeT(name) });
            });
        }
        return { traces, layout: { xaxis: { title: lifeT(B2('Rice', 'चावल')), range: [0, 50] }, yaxis: { title: lifeT(B2('Fish', 'मछली')), range: [0, 62] } } };
    },
    debrief(history) {
        const os = history.map(r => r.outcome), score = os.reduce((s, o) => s + o.satisfaction, 0) / os.length;
        const right = k => !!history[k - 1] && !!history[k - 1].predict && history[k - 1].predict.correct;
        // Two full-employment seasons on the SAME frontier, at different rice hours.
        let pair = null;
        os.forEach(a => os.forEach(b => { if (!pair && a.key === b.key && a.efficient && b.efficient && a.x < b.x && a.season < b.season + 99) pair = { lo: a, hi: b }; }));
        const idle = os.find(o => o.idle > 0);
        return {
            score,
            scoreLine: B2(`Across six seasons the islanders got ${pctStr(score)} of the satisfaction the best split could give each season.`, `छह मौसमों में द्वीपवासियों को हर मौसम के सर्वोत्तम बँटवारे से मिलने वाली संतुष्टि का ${pctStr(score)} मिला।`),
            insights: [
                {
                    icon: '📈', concept: B2('Increasing opportunity cost', 'बढ़ती अवसर लागत'), holds: !!pair,
                    evidence: pair ? B2(`On the same island, with ${pair.lo.x} hours on rice, the next 10 hours of rice cost ${f1(PPF.oc(pair.lo.x, pair.lo.p))} fish per unit of rice. With ${pair.hi.x} hours on rice they cost ${f1(PPF.oc(pair.hi.x, pair.hi.p))}. The more rice you already grow, the more fish each further unit of rice gives up — which is why the PPF bows outward.`,
                        `उसी द्वीप पर, चावल को ${pair.lo.x} घंटे होने पर अगले 10 घंटे चावल को देने से हर चावल-इकाई पर ${f1(PPF.oc(pair.lo.x, pair.lo.p))} मछली गई। चावल को ${pair.hi.x} घंटे होने पर ${f1(PPF.oc(pair.hi.x, pair.hi.p))}। जितना ज़्यादा चावल आप पहले से उगा रहे हैं, हर आगे की चावल-इकाई उतनी ज़्यादा मछली छुड़वाती है — इसीलिए PPF बाहर की ओर उभरी होती है।`) : null,
                    tryThis: B2('In two seasons on the same island, use every hour but give rice a clearly different number of hours.', 'एक ही द्वीप के दो मौसमों में, हर घंटा काम में लगाइए पर चावल को साफ़ अलग घंटे दीजिए।'),
                    exam: B2('Opportunity cost = the next-best alternative given up (MRT = fish given up ÷ extra rice). As more of one good is produced, resources less suited to it are moved in, so the opportunity cost rises: the PPF is concave to the origin.', 'अवसर लागत = छोड़ा गया अगला सर्वोत्तम विकल्प (MRT = छोड़ी गई मछली ÷ अतिरिक्त चावल)। एक वस्तु अधिक बनाने पर उसके लिए कम उपयुक्त साधन लगाए जाते हैं, इसलिए अवसर लागत बढ़ती है: PPF मूल बिंदु की ओर अवतल होती है।')
                },
                {
                    icon: '💤', concept: B2('Inside the PPF: resources left idle', 'PPF के भीतर: साधन ख़ाली छोड़े गए'), holds: !!idle,
                    evidence: idle ? B2(`In season ${idle.season} you left ${idle.idle} hours idle and landed inside the frontier: ${f1(idle.R)} rice and ${f1(idle.F)} fish. The same hours on fishing would have given ${f1(idle.fishIfEmployed)} fish with the same rice — more of one good, none of the other given up.`, `मौसम ${idle.season} में आपने ${idle.idle} घंटे ख़ाली छोड़े और सीमा रेखा के भीतर पहुँचे: ${f1(idle.R)} चावल और ${f1(idle.F)} मछली। वही घंटे मछली को देने पर उतने ही चावल के साथ ${f1(idle.fishIfEmployed)} मछली मिलती — एक वस्तु ज़्यादा, दूसरी की कोई क़ुर्बानी नहीं।`) : null,
                    tryThis: B2('In one season, leave some hours idle and compare with using them all.', 'किसी एक मौसम में कुछ घंटे ख़ाली छोड़िए और सारे घंटे लगाने से तुलना कीजिए।'),
                    exam: B2('A point inside the PPF means resources are unemployed or misused: output can rise without any opportunity cost. Only points ON the PPF are efficient; points outside are unattainable.', 'PPF के भीतर का बिंदु बताता है कि साधन बेरोज़गार या ग़लत उपयोग में हैं: बिना अवसर लागत के उत्पादन बढ़ सकता है। केवल PPF पर के बिंदु कुशल हैं; बाहर के बिंदु अप्राप्य हैं।')
                },
                {
                    icon: '🎉', concept: B2('A change in tastes moves you along the PPF', 'रुचि का बदलाव आपको PPF पर चलाता है'), holds: right(3),
                    evidence: B2(`You called it: in season 3 the PPF stayed exactly where it was (still ${f1(PPF.maxRice(PPF.params(3)))} rice or ${f1(PPF.maxFish(PPF.params(3)))} fish at the ends). Only the best point on it moved — from ${PPF.best(PPF.params(2)).x} hours on rice to ${PPF.best(PPF.params(3)).x}.`, `आपका अंदाज़ा सही था: मौसम 3 में PPF ठीक वहीं रही (सिरों पर अब भी ${f1(PPF.maxRice(PPF.params(3)))} चावल या ${f1(PPF.maxFish(PPF.params(3)))} मछली)। केवल उस पर का सर्वोत्तम बिंदु खिसका — चावल को ${PPF.best(PPF.params(2)).x} घंटे से ${PPF.best(PPF.params(3)).x} घंटे।`),
                    tryThis: B2('Before season 3, ask: did anything about what the island CAN make change — or only what people WANT?', 'मौसम 3 से पहले पूछिए: क्या द्वीप जो बना सकता है वह बदला — या केवल लोग जो चाहते हैं?'),
                    exam: B2('The PPF shows what is possible; tastes decide which point on it is chosen. A change in preferences moves the chosen point along the PPF — it does not shift the PPF.', 'PPF संभावना दिखाती है; रुचि तय करती है कि उस पर कौन-सा बिंदु चुना जाए। पसंद में बदलाव चुने हुए बिंदु को PPF पर चलाता है — PPF को खिसकाता नहीं।')
                },
                {
                    icon: '🛶', concept: B2('Better technology shifts the PPF — where it helps', 'बेहतर तकनीक PPF को खिसकाती है — जहाँ वह काम आती है'), holds: right(4),
                    evidence: B2(`The new net lifted the fish end from ${f1(PPF.maxFish(PPF.params(3)))} to ${f1(PPF.maxFish(PPF.params(4)))}. The rice end stayed at ${f1(PPF.maxRice(PPF.params(4)))}: a net cannot make rice.`, `नए जाल ने मछली वाला सिरा ${f1(PPF.maxFish(PPF.params(3)))} से ${f1(PPF.maxFish(PPF.params(4)))} कर दिया। चावल वाला सिरा ${f1(PPF.maxRice(PPF.params(4)))} पर ही रहा: जाल चावल नहीं बना सकता।`),
                    tryThis: B2('When a technology improves only one good, ask which end of the PPF it can reach.', 'जब कोई तकनीक केवल एक वस्तु सुधारे, तो पूछिए कि वह PPF के कौन-से सिरे तक पहुँच सकती है।'),
                    exam: B2('Technological progress in one good shifts the PPF outward along that good’s axis only (a pivot). Growth in all resources shifts it outward in both directions.', 'किसी एक वस्तु में तकनीकी प्रगति PPF को केवल उसी वस्तु की धुरी पर बाहर की ओर खिसकाती है (घुमाव)। सभी साधनों में वृद्धि उसे दोनों दिशाओं में बाहर खिसकाती है।')
                },
                {
                    icon: '👶', concept: B2('More resources shift the PPF outward — economic growth', 'अधिक साधन PPF को बाहर खिसकाते हैं — आर्थिक वृद्धि'), holds: right(5),
                    evidence: B2(`With 140 worker-hours the island's ends rose to ${f1(PPF.maxRice(PPF.params(5)))} rice and ${f1(PPF.maxFish(PPF.params(5)))} fish. Points that were out of reach in season 4 can now be produced.`, `140 श्रम-घंटों के साथ द्वीप के सिरे ${f1(PPF.maxRice(PPF.params(5)))} चावल और ${f1(PPF.maxFish(PPF.params(5)))} मछली तक पहुँचे। मौसम 4 में जो बिंदु पहुँच से बाहर थे, अब बन सकते हैं।`),
                    tryThis: B2('When the number of workers changes, ask whether both goods can reach further.', 'जब श्रमिकों की संख्या बदले, तो पूछिए कि क्या दोनों वस्तुएँ आगे तक पहुँच सकती हैं।'),
                    exam: B2('Economic growth = a rightward/outward shift of the PPF, caused by more resources or better technology. Unemployment of resources is a point inside it.', 'आर्थिक वृद्धि = PPF का बाहर की ओर खिसकना, जो अधिक साधनों या बेहतर तकनीक से होता है। साधनों की बेरोज़गारी उसके भीतर का बिंदु है।')
                }
            ]
        };
    }
});

// ── 8. THE VALUE CHAIN ────────────────────────────────────────────
// Wheat → flour → bread in one small economy. National income can be counted
// by value added, by expenditure or by income — and three tempting shortcuts
// give the wrong answer in exactly the situations the syllabus names:
// intermediate goods (double counting), stocks, imports and capital goods.
const VC = {
    METHODS: ['sales', 'households', 'valueadded', 'income'],
    econ(season) {
        const e = { wd: 40, wi: 0, flour: 70, prod: 100, sold: 100, oven: 0 };
        if (season === 2) return Object.assign(e, { sold: 90 });
        if (season === 3) return Object.assign(e, { wd: 20, wi: 20 });
        if (season === 4) return Object.assign(e, { wd: 50, flour: 90, prod: 120, sold: 120 });
        if (season === 5) return Object.assign(e, { oven: 30 });
        if (season === 6) return Object.assign(e, { wd: 30, wi: 10, flour: 80, prod: 110, sold: 100, oven: 20 });
        return e;
    },
    // Value added by each producer = its output − what it bought from others.
    added(e) {
        const farmer = e.wd, miller = e.flour - (e.wd + e.wi), baker = e.prod - e.flour, maker = e.oven;
        return { farmer, miller, baker, maker, total: farmer + miller + baker + maker };
    },
    truth(e) { return VC.added(e).total; },
    estimate(method, e) {
        if (method === 'sales') return e.wd + e.flour + e.sold + e.oven;      // every domestic sale in the chain
        if (method === 'households') return e.sold;                           // only what households bought
        return VC.truth(e);                                                    // value added; and income = value added
    },
    stock(e) { return e.prod - e.sold; },
    wage(v) { return Math.round(v * 0.6); }
};
const VC_SHORT = {
    sales: B2('Every sale', 'हर बिक्री'), households: B2('Households only', 'केवल परिवार'),
    valueadded: B2('Value added', 'जोड़ा मूल्य'), income: B2('Wages + profits', 'वेतन + लाभ')
};
const VC_OPTIONS = [
    { value: 'sales', label: B2('Add up every sale in the chain', 'श्रृंखला की हर बिक्री जोड़ दें') },
    { value: 'households', label: B2('Add up only what households bought', 'केवल वह जोड़ें जो परिवारों ने ख़रीदा') },
    { value: 'valueadded', label: B2('Add up what each producer adds (its sales minus what it bought from others)', 'हर उत्पादक का जोड़ा मूल्य जोड़ें (उसकी बिक्री − दूसरों से ख़रीद)') },
    { value: 'income', label: B2('Add up all wages and profits earned', 'कमाए गए सारे वेतन और लाभ जोड़ें') }
];

LIFE_WORLDS.push({
    id: 'value-chain', icon: '🌾', accent: '#a16207', minutes: 6,
    title: B2('Count the Nation’s Output', 'देश का उत्पादन गिनिए'),
    role: B2('a national-income statistician', 'राष्ट्रीय आय के सांख्यिकीविद्'),
    tagline: B2('Wheat becomes flour becomes bread. How much did this economy really produce?', 'गेहूँ आटा बनता है, आटा रोटी। इस अर्थव्यवस्था ने सच में कितना उत्पादन किया?'),
    class: 'XII', part: 'A', unit: 1, unitTitle: 'National Income and Related Aggregates',
    syllabusIds: ['XII-A-U1-METHODS', 'XII-A-U1-BASIC-CONCEPTS', 'XII-A-U1-AGGREGATES'],
    labs: ['macro-national-income-methods', 'macro-basic-concepts', 'macro-gdp'],
    rounds: 6, roundWord: B2('Year', 'वर्ष'),
    goLabel: B2('Report this figure ▶', 'यह आँकड़ा दर्ज करें ▶'),
    brief: B2(
        `<p>You count the value of everything a small economy produced in a year — its <b>GDP at market price</b>.</p>
         <p>A farmer grows wheat, a miller turns it into flour, a baker turns flour into bread, and households buy the bread. Each year the chain looks a little different.</p>
         <p>Each year, choose <b>one way</b> of counting and report the figure. The true value comes out afterwards.</p>`,
        `<p>आप एक छोटी अर्थव्यवस्था के साल भर में उत्पादित हर चीज़ का मूल्य गिनते हैं — उसका <b>बाज़ार कीमत पर GDP</b>।</p>
         <p>एक किसान गेहूँ उगाता है, चक्की-वाला उसे आटा बनाता है, बेकर आटे से रोटी, और परिवार रोटी ख़रीदते हैं। हर साल श्रृंखला थोड़ी अलग दिखती है।</p>
         <p>हर साल गिनने का <b>एक तरीक़ा</b> चुनिए और आँकड़ा दर्ज कीजिए। सच्चा मूल्य बाद में सामने आएगा।</p>`),
    truth: VC,
    init() { return {}; },
    news(state, year) {
        return ({
            1: B2('A plain chain: the farmer sells wheat to the miller, who sells flour to the baker, who sells bread to households.', 'सीधी श्रृंखला: किसान चक्की-वाले को गेहूँ बेचता है, वह बेकर को आटा, और बेकर परिवारों को रोटी।'),
            2: B2('This year the baker baked more than households bought. The unsold bread stayed in the shop.', 'इस साल बेकर ने परिवारों की ख़रीद से ज़्यादा रोटी बनाई। बिना बिकी रोटी दुकान में रही।'),
            3: B2('Half the wheat the miller used was imported from abroad this year.', 'इस साल चक्की-वाले के इस्तेमाल किए आधे गेहूँ का आयात हुआ।'),
            4: B2('Prices are higher this year. Everyone’s payroll is shown below each firm.', 'इस साल कीमतें ऊँची हैं। हर फ़र्म के नीचे उसका वेतन-बही दिखाया गया है।'),
            5: B2('The baker bought a new oven from a machine-maker. The oven will serve for many years.', 'बेकर ने मशीन-निर्माता से नया ओवन ख़रीदा। यह ओवन कई साल चलेगा।'),
            6: B2('A year with everything at once: imported wheat, unsold bread and a new oven.', 'सब कुछ एक साथ वाला साल: आयातित गेहूँ, बिना बिकी रोटी और एक नया ओवन।')
        })[year];
    },
    decisions() {
        return [{ id: 'method', type: 'choice', label: B2('How will you count this year’s output?', 'इस साल का उत्पादन आप कैसे गिनेंगे?'), value: 'sales', options: VC_OPTIONS }];
    },
    predict(state, year) {
        const e = VC.econ(year), tr = VC.truth(e);
        const rel = v => (v > tr ? 0 : (v === tr ? 1 : 2));
        const opts = [B2('Too high', 'ज़्यादा'), B2('Exactly right', 'बिल्कुल सही'), B2('Too low', 'कम')];
        if (year === 1) return { prompt: B2('If you simply add up every sale in the chain, your figure will be…', 'यदि आप श्रृंखला की हर बिक्री जोड़ दें, तो आपका आँकड़ा होगा…'), options: opts, answer: () => rel(VC.estimate('sales', e)) };
        if (year === 2) return { prompt: B2('If you count only what households bought, your figure will be…', 'यदि आप केवल वह गिनें जो परिवारों ने ख़रीदा, तो आपका आँकड़ा होगा…'), options: opts, answer: () => rel(VC.estimate('households', e)) };
        if (year === 3) return { prompt: B2('Counting only what households bought, with imported wheat in the chain, your figure will be…', 'आयातित गेहूँ वाली श्रृंखला में केवल परिवारों की ख़रीद गिनने पर आपका आँकड़ा होगा…'), options: opts, answer: () => rel(VC.estimate('households', e)) };
        if (year === 5) return { prompt: B2('Counting only what households bought, with a new oven in the picture, your figure will be…', 'नए ओवन वाली तस्वीर में केवल परिवारों की ख़रीद गिनने पर आपका आँकड़ा होगा…'), options: opts, answer: () => rel(VC.estimate('households', e)) };
        return null;
    },
    step(state, d, year) {
        const e = VC.econ(year), est = VC.estimate(d.method, e), tr = VC.truth(e), va = VC.added(e);
        return {
            year, e, method: d.method, est, truth: tr, va, stock: VC.stock(e), exact: est === tr,
            errPct: 100 * Math.abs(est - tr) / tr, direction: est > tr ? 'high' : (est < tr ? 'low' : 'exact'),
            points: Math.max(0, 100 - 100 * Math.abs(est - tr) / tr)
        };
    },
    scene(state, o, year) {
        const e = o ? o.e : VC.econ(year), va = VC.added(e);
        const box = (x, y, icon, name, v) => `<g><rect x="${x}" y="${y}" width="92" height="52" rx="9" fill="#fffbeb" stroke="#a16207" stroke-width="1.6"></rect>
            <text x="${x + 46}" y="${y + 20}" text-anchor="middle" font-size="17">${icon}</text><text x="${x + 46}" y="${y + 35}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${LIFE_INK}">${lifeT(name)}</text>
            ${v === null ? '' : `<text x="${x + 46}" y="${y + 47}" text-anchor="middle" font-size="8" fill="${LIFE_MUTE}">${lifeT(B2('wages', 'वेतन'))} ${rupee(VC.wage(v))} · ${lifeT(B2('profit', 'लाभ'))} ${rupee(v - VC.wage(v))}</text>`}</g>`;
        const arrow = (x1, y1, x2, y2, label, dashed) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${dashed ? '#dc2626' : '#a16207'}" stroke-width="2" ${dashed ? 'stroke-dasharray="4 3"' : ''} marker-end="url(#vcA)"></line>
            <text x="${x1 === x2 ? x1 + 9 : (x1 + x2) / 2}" y="${x1 === x2 ? (y1 + y2) / 2 + 4 : (y1 + y2) / 2 - 6}" text-anchor="${x1 === x2 ? 'start' : 'middle'}" font-size="10.5" font-weight="800" fill="${dashed ? '#dc2626' : LIFE_INK}">${label}</text>`;
        let g = `<defs><marker id="vcA" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8z" fill="#a16207"></path></marker></defs>
            <rect x="0" y="0" width="520" height="250" rx="14" fill="#fefce8"></rect>
            <text x="22" y="28" font-size="13" font-weight="700" fill="${LIFE_INK}">🌾 ${lifeT(B2('Every sale this year, in ₹', 'इस साल की हर बिक्री, ₹ में'))}</text>`;
        g += box(16, 110, '🧑‍🌾', B2('Farmer', 'किसान'), va.farmer) + box(140, 110, '⚙️', B2('Miller', 'चक्की'), va.miller) + box(264, 110, '🍞', B2('Baker', 'बेकर'), va.baker) + box(396, 110, '🏠', B2('Households', 'परिवार'), null);
        g += arrow(108, 136, 140, 136, rupee(e.wd)) + arrow(232, 136, 264, 136, rupee(e.flour)) + arrow(356, 136, 396, 136, rupee(e.sold));
        if (e.wi > 0) g += `<text x="186" y="64" text-anchor="middle" font-size="16">🚢</text>` + arrow(186, 70, 186, 108, `${lifeT(B2('imported wheat', 'आयातित गेहूँ'))} ${rupee(e.wi)}`, true);
        if (e.oven > 0) g += box(264, 22, '🏭', B2('Machine-maker', 'मशीन-निर्माता'), va.maker) + arrow(310, 76, 310, 108, `${lifeT(B2('oven', 'ओवन'))} ${rupee(e.oven)}`);
        if (VC.stock(e) > 0) g += `<text x="310" y="196" text-anchor="middle" font-size="11" font-weight="700" fill="#b45309">📦 ${lifeT(B2(`unsold bread kept in the shop: ${rupee(VC.stock(e))}`, `दुकान में रखी बिना बिकी रोटी: ${rupee(VC.stock(e))}`))}</text>`;
        if (o) g += `<text x="260" y="232" text-anchor="middle" font-size="12.5" font-weight="800" fill="${o.exact ? '#15803d' : '#b91c1c'}">${lifeT(B2(`You reported ${rupee(o.est)} · the true GDP is ${rupee(o.truth)}`, `आपने ${rupee(o.est)} दर्ज किया · सच्चा GDP ${rupee(o.truth)} है`))}</text>`;
        return lifeSvg(lifeT(B2('The wheat-flour-bread chain and every sale in it', 'गेहूँ-आटा-रोटी की श्रृंखला और उसकी हर बिक्री')), g, 250);
    },
    stats(o) {
        return [
            { label: B2('You reported', 'आपने दर्ज किया'), value: rupee(o.est) }, { label: B2('True GDP', 'सच्चा GDP'), value: rupee(o.truth) },
            { label: B2('Off by', 'चूक'), value: pctStr(o.errPct), tone: o.exact ? 'good' : 'bad' },
            { label: B2('Method', 'तरीक़ा'), value: lifeT(VC_SHORT[o.method]) }
        ];
    },
    ledger: [
        { key: 'y', label: B2('Year', 'वर्ष'), get: r => String(r.round) },
        { key: 'm', label: B2('Method', 'तरीक़ा'), get: r => lifeT(VC_SHORT[r.outcome.method]) },
        { key: 'e', label: B2('Reported', 'दर्ज'), get: r => rupee(r.outcome.est) },
        { key: 't', label: B2('True', 'सच्चा'), get: r => rupee(r.outcome.truth) }
    ],
    narrate(o) {
        const head = B2(`You reported <b>${rupee(o.est)}</b>; the true GDP is <b>${rupee(o.truth)}</b>.`, `आपने <b>${rupee(o.est)}</b> दर्ज किया; सच्चा GDP <b>${rupee(o.truth)}</b> है।`);
        const e = o.e;
        let why;
        if (o.exact) why = o.method === 'income'
            ? B2(`Wages and profits paid by the producers add up to ${rupee(o.truth)} — income earned equals output produced.`, `उत्पादकों के दिए वेतन और लाभ मिलकर ${rupee(o.truth)} होते हैं — अर्जित आय उत्पादित उत्पादन के बराबर है।`)
            : (o.method === 'valueadded' ? B2(`Farmer ${rupee(o.va.farmer)} + miller ${rupee(o.va.miller)} + baker ${rupee(o.va.baker)}${e.oven ? ` + machine-maker ${rupee(o.va.maker)}` : ''} = ${rupee(o.truth)}. Each producer's value added counts only what it created.`, `किसान ${rupee(o.va.farmer)} + चक्की ${rupee(o.va.miller)} + बेकर ${rupee(o.va.baker)}${e.oven ? ` + मशीन-निर्माता ${rupee(o.va.maker)}` : ''} = ${rupee(o.truth)}। हर उत्पादक का जोड़ा मूल्य केवल वही गिनता है जो उसने रचा।`)
                : B2('Counting only the households’ purchases happened to be right this year — nothing else was going on in the chain.', 'केवल परिवारों की ख़रीद गिनना इस साल संयोग से सही रहा — श्रृंखला में और कुछ चल नहीं रहा था।'));
        else if (o.method === 'sales') why = B2(`Wheat (${rupee(e.wd)}) was counted again inside the flour, and flour (${rupee(e.flour)}) again inside the bread: <b>double counting</b> of intermediate goods. You overstated by ${rupee(o.est - o.truth)}.`, `गेहूँ (${rupee(e.wd)}) आटे के भीतर फिर गिना गया, और आटा (${rupee(e.flour)}) रोटी के भीतर फिर: मध्यवर्ती वस्तुओं की <b>दोहरी गणना</b>। आपने ${rupee(o.est - o.truth)} बढ़ाकर बताया।`);
        else if (e.oven > 0 && e.wi === 0) why = B2(`The ${rupee(e.oven)} oven is a final capital good — it is investment — but no household bought it, so you missed it.`, `${rupee(e.oven)} का ओवन अंतिम पूँजीगत वस्तु है — यह निवेश है — पर किसी परिवार ने इसे नहीं ख़रीदा, इसलिए आप इसे चूक गए।`);
        else if (e.wi > 0) why = B2(`Part of the wheat was imported: ${rupee(e.wi)} of what households paid for bread was made abroad. It is not produced by this economy, so it must not count${o.stock ? ' — and unsold bread, which is production too, must' : ''}.`, `कुछ गेहूँ आयातित था: रोटी पर परिवारों के दिए पैसों में ${rupee(e.wi)} विदेश में बना था। यह इस अर्थव्यवस्था का उत्पादन नहीं है, इसलिए गिना नहीं जाना चाहिए${o.stock ? ' — और बिना बिकी रोटी, जो भी उत्पादन है, गिनी जानी चाहिए' : ''}।`);
        else why = B2(`${rupee(o.stock)} of bread was baked but not sold. Unsold output is added to stocks — it is investment in inventories — and is part of this year's production.`, `${rupee(o.stock)} की रोटी बनी पर बिकी नहीं। बिना बिका उत्पादन भंडार में जुड़ता है — यह माल-भंडार में निवेश है — और इस साल के उत्पादन का हिस्सा है।`);
        return B2(`${head.en} ${why.en}`, `${head.hi} ${why.hi}`);
    },
    nudge(history) {
        if (!history.length) return null;
        const o = history[history.length - 1].outcome;
        if (!o.exact) return B2('Was anything in last year’s chain bought by a business and not a household, imported, or left unsold?', 'क्या पिछले साल की श्रृंखला में कुछ किसी व्यवसाय ने ख़रीदा, आयात हुआ या बिना बिका रहा — परिवारों ने नहीं?');
        const used = new Set(history.map(r => r.outcome.method));
        if (used.size === 1) return B2('The same method worked every time so far. Does it work if something unusual happens in the chain?', 'अब तक हर बार एक ही तरीक़ा चला। क्या यह तब भी चलेगा जब श्रृंखला में कुछ असामान्य हो?');
        return null;
    },
    chart(history, reveal) {
        if (!history.length) return null;
        const x = history.map(r => r.round);
        const traces = [{ x, y: history.map(r => r.outcome.est), mode: 'markers', marker: { size: 12, color: history.map(r => (r.outcome.exact ? '#16a34a' : '#dc2626')), line: { color: '#fff', width: 1.5 } }, name: lifeT(B2('Your reported figure', 'आपका दर्ज आँकड़ा')) }];
        if (reveal) traces.unshift({ x: [1, 2, 3, 4, 5, 6], y: [1, 2, 3, 4, 5, 6].map(y => VC.truth(VC.econ(y))), mode: 'lines+markers', line: { color: '#1e1b3a', width: 2.5 }, name: lifeT(B2('True GDP (sum of value added)', 'सच्चा GDP (जोड़े मूल्य का योग)')) });
        return { traces, layout: { xaxis: { title: lifeT(B2('Year', 'वर्ष')), range: [0.5, 6.5], dtick: 1 }, yaxis: { title: lifeT(B2('GDP (₹)', 'GDP (₹)')), rangemode: 'tozero' } } };
    },
    debrief(history) {
        const os = history.map(r => r.outcome), score = os.reduce((s, o) => s + o.points, 0) / os.length;
        const dc = os.find(o => o.method === 'sales'), va = os.find(o => o.method === 'valueadded' && o.exact), inc = os.find(o => o.method === 'income' && o.exact);
        const trap = os.find(o => o.method === 'households' && !o.exact);
        let trapEv = null;
        if (trap) {
            const e = trap.e;
            trapEv = e.oven > 0 && e.wi === 0 ? B2(`Year ${trap.year}: counting only households’ purchases gave ${rupee(trap.est)}; the truth is ${rupee(trap.truth)}. The ${rupee(e.oven)} oven is a final good bought by a firm — investment — and was missed.`, `वर्ष ${trap.year}: केवल परिवारों की ख़रीद गिनने पर ${rupee(trap.est)} आया; सच ${rupee(trap.truth)} है। ${rupee(e.oven)} का ओवन एक फ़र्म द्वारा ख़रीदी गई अंतिम वस्तु — निवेश — है, जो छूट गई।`)
                : (e.wi > 0 ? B2(`Year ${trap.year}: counting only households’ purchases gave ${rupee(trap.est)}; the truth is ${rupee(trap.truth)}. ${rupee(e.wi)} of the wheat was imported — GDP counts production inside the country, so imports must be netted out.`, `वर्ष ${trap.year}: केवल परिवारों की ख़रीद गिनने पर ${rupee(trap.est)} आया; सच ${rupee(trap.truth)} है। ${rupee(e.wi)} का गेहूँ आयातित था — GDP देश के भीतर के उत्पादन को गिनता है, इसलिए आयात घटाना पड़ता है।`)
                    : B2(`Year ${trap.year}: counting only households’ purchases gave ${rupee(trap.est)}; the truth is ${rupee(trap.truth)}. ${rupee(trap.stock)} of bread was baked and left unsold — a change in stocks, which is investment.`, `वर्ष ${trap.year}: केवल परिवारों की ख़रीद गिनने पर ${rupee(trap.est)} आया; सच ${rupee(trap.truth)} है। ${rupee(trap.stock)} की रोटी बनी और बिना बिकी रही — यह भंडार में परिवर्तन है, जो निवेश है।`));
        }
        return {
            score,
            scoreLine: B2(`Across six years your figures were on average ${pctStr(100 - score)} away from the true GDP.`, `छह वर्षों में आपके आँकड़े सच्चे GDP से औसतन ${pctStr(100 - score)} दूर रहे।`),
            insights: [
                {
                    icon: '🔁', concept: B2('Double counting of intermediate goods', 'मध्यवर्ती वस्तुओं की दोहरी गणना'), holds: !!dc,
                    evidence: dc ? B2(`Year ${dc.year}: adding every sale gave ${rupee(dc.est)} against a true ${rupee(dc.truth)}. The wheat and the flour were each counted once as a sale and again inside the price of the bread.`, `वर्ष ${dc.year}: हर बिक्री जोड़ने पर ${rupee(dc.est)} आया, जबकि सच ${rupee(dc.truth)} है। गेहूँ और आटा, दोनों एक बार बिक्री के रूप में गिने गए और फिर रोटी की कीमत के भीतर दोबारा।`) : null,
                    tryThis: B2('In one year, add up every sale and compare it with the true figure.', 'किसी एक साल हर बिक्री जोड़िए और सच्चे आँकड़े से तुलना कीजिए।'),
                    exam: B2('Intermediate goods (used up in further production within the year) are not counted in GDP; only final goods are. Counting both causes double counting.', 'मध्यवर्ती वस्तुएँ (साल के भीतर आगे के उत्पादन में खप जाने वाली) GDP में नहीं गिनी जातीं; केवल अंतिम वस्तुएँ गिनी जाती हैं। दोनों गिनने से दोहरी गणना होती है।')
                },
                {
                    icon: '➕', concept: B2('Value added: GDP = sum of value added', 'जोड़ा गया मूल्य: GDP = जोड़े गए मूल्यों का योग'), holds: !!va,
                    evidence: va ? B2(`Year ${va.year}: farmer ${rupee(va.va.farmer)} + miller ${rupee(va.va.miller)} + baker ${rupee(va.va.baker)}${va.e.oven ? ` + machine-maker ${rupee(va.va.maker)}` : ''} = ${rupee(va.truth)} — exactly the true GDP, whatever happened in the chain.`, `वर्ष ${va.year}: किसान ${rupee(va.va.farmer)} + चक्की ${rupee(va.va.miller)} + बेकर ${rupee(va.va.baker)}${va.e.oven ? ` + मशीन-निर्माता ${rupee(va.va.maker)}` : ''} = ${rupee(va.truth)} — ठीक सच्चा GDP, श्रृंखला में जो भी हुआ हो।`) : null,
                    tryThis: B2('Count each producer’s sales minus what it bought from others, and add.', 'हर उत्पादक की बिक्री में से दूसरों से ख़रीद घटाइए और जोड़िए।'),
                    exam: B2('Value added = value of output − value of intermediate consumption. GDP at market price = sum of gross value added of all producers. Unsold output counts (change in stocks); imports of intermediates are subtracted.', 'जोड़ा गया मूल्य = उत्पादन का मूल्य − मध्यवर्ती उपभोग का मूल्य। बाज़ार कीमत पर GDP = सभी उत्पादकों के सकल जोड़े मूल्य का योग। बिना बिका उत्पादन गिना जाता है (भंडार में परिवर्तन); मध्यवर्ती वस्तुओं का आयात घटाया जाता है।')
                },
                {
                    icon: '🛒', concept: B2('Expenditure method: stocks, investment and imports', 'व्यय विधि: भंडार, निवेश और आयात'), holds: !!trap, evidence: trapEv,
                    tryThis: B2('In a year with an oven, imported wheat or unsold bread, count only what households bought.', 'ओवन, आयातित गेहूँ या बिना बिकी रोटी वाले साल में केवल परिवारों की ख़रीद गिनिए।'),
                    exam: B2('GDP (expenditure) = C + I + G + (X − M), where I includes fixed capital formation AND the change in stocks. Final consumption alone misses investment; imports must be subtracted.', 'GDP (व्यय) = C + I + G + (X − M), जहाँ I में स्थायी पूँजी निर्माण और भंडार में परिवर्तन दोनों हैं। अकेला अंतिम उपभोग निवेश छोड़ देता है; आयात घटाना होता है।')
                },
                {
                    icon: '💼', concept: B2('Income method: output = income', 'आय विधि: उत्पादन = आय'), holds: !!inc,
                    evidence: inc ? B2(`Year ${inc.year}: the wages and profits the producers paid out added up to ${rupee(inc.truth)} — the same number the value-added method gives. What is produced is earned by someone.`, `वर्ष ${inc.year}: उत्पादकों के दिए वेतन और लाभ का योग ${rupee(inc.truth)} रहा — वही संख्या जो जोड़ा-मूल्य विधि देती है। जो उत्पादित होता है, वह किसी न किसी की आय बनता है।`) : null,
                    tryThis: B2('Use the wages and profits shown under each firm.', 'हर फ़र्म के नीचे दिखाए वेतन और लाभ का उपयोग कीजिए।'),
                    exam: B2('Income method: GDP at factor cost = compensation of employees + operating surplus + mixed income; add depreciation and net indirect taxes to reach GDP at market price. All three methods give the same total.', 'आय विधि: कारक लागत पर GDP = कर्मचारियों का पारिश्रमिक + संचालन अधिशेष + मिश्रित आय; बाज़ार कीमत पर GDP के लिए मूल्यह्रास और शुद्ध अप्रत्यक्ष कर जोड़ें। तीनों विधियाँ एक ही योग देती हैं।')
                }
            ]
        };
    }
});

// ── 9. THE FOREX COUNTER ──────────────────────────────────────────
// Dollars are demanded (imports, travel, debt service) and supplied (exports,
// remittances, foreign investment). e = rupees per dollar. Demand falls and
// supply rises as e rises, so the market clears where they cross. A central
// bank can instead FIX e — and then has to make up the gap from reserves.
const FX = {
    RESERVES0: 30, E0: 80, PEG_MIN: 60, PEG_MAX: 110,
    regime(year) { return ({ 1: { a: 300, c: 20 }, 2: { a: 300, c: 60 }, 3: { a: 360, c: 20 }, 4: { a: 300, c: 20 }, 5: { a: 240, c: 20 }, 6: { a: 380, c: 20 } })[year]; },
    qd(e, r) { return Math.max(0, r.a - 2 * e); },     // $ bn demanded
    qs(e, r) { return Math.max(0, r.c + 1.5 * e); },   // $ bn supplied
    eq(r) { const e = (r.a - r.c) / 3.5; return { e, q: r.a - 2 * e }; },
    gap(e, r) { return FX.qd(e, r) - FX.qs(e, r); }    // > 0: more dollars wanted than offered
};

LIFE_WORLDS.push({
    id: 'forex-counter', icon: '💱', accent: '#0f766e', minutes: 7,
    title: B2('The Rupee Desk', 'रुपया डेस्क'),
    role: B2('the head of a central bank’s foreign-exchange desk', 'केंद्रीय बैंक के विदेशी-मुद्रा डेस्क के प्रमुख'),
    tagline: B2('Let the rupee float, or hold it where you want it — until the reserves run out.', 'रुपये को तैरने दें, या जहाँ चाहें वहाँ थामें — जब तक भंडार चुक न जाए।'),
    class: 'XII', part: 'A', unit: 5, unitTitle: 'Balance of Payments',
    syllabusIds: ['XII-A-U5-EXRATE', 'XII-A-U5-DETERMINATION', 'XII-A-U5-EVALUATION'],
    labs: ['macro-forex', 'gl-forex-determination'],
    rounds: 6, roundWord: B2('Year', 'वर्ष'),
    goLabel: B2('Open the desk ▶', 'डेस्क खोलें ▶'),
    brief: B2(
        `<p>You run the foreign-exchange desk. Each year the country's importers, exporters, travellers and investors bring dollars to buy and to sell. The price is the <b>exchange rate: ₹ per $1</b>.</p>
         <p>Each year you either <b>let it float</b> to wherever buyers and sellers meet, or <b>fix it</b> at a rate you choose. A fixed rate means you make up the difference from your reserves — you start with <b>$30 billion</b>.</p>
         <p>Keep the rate steady, and keep the reserves from running out.</p>`,
        `<p>आप विदेशी-मुद्रा डेस्क चलाते हैं। हर साल देश के आयातक, निर्यातक, यात्री और निवेशक डॉलर ख़रीदने और बेचने आते हैं। कीमत है <b>विनिमय दर: $1 के लिए ₹</b>।</p>
         <p>हर साल आप या तो इसे <b>तैरने देते हैं</b> — जहाँ ख़रीदार और विक्रेता मिलें — या अपनी चुनी दर पर <b>स्थिर कर देते हैं</b>। स्थिर दर का मतलब है कि अंतर आपको अपने भंडार से पूरा करना होगा — आपके पास शुरू में <b>$30 अरब</b> हैं।</p>
         <p>दर को स्थिर रखिए, और भंडार को चुकने मत दीजिए।</p>`),
    truth: FX,
    init() { return { reserves: FX.RESERVES0, prevRate: FX.E0 }; },
    news(state, year) {
        const intro = ({
            1: B2('An ordinary year. Last year the rate was ₹80 per $1.', 'एक सामान्य साल। पिछले साल दर ₹80 प्रति $1 थी।'),
            2: B2('📈 Foreign investors are pouring money in: far more dollars on offer.', '📈 विदेशी निवेशक पैसा उड़ेल रहे हैं: डॉलर की आपूर्ति कहीं ज़्यादा।'),
            3: B2('🛢️ Oil prices have jumped: the import bill is much higher.', '🛢️ तेल की कीमतें उछल गईं: आयात का बिल बहुत ऊँचा है।'),
            4: B2('Oil is back to normal and the investors have gone home.', 'तेल सामान्य हो गया और निवेशक लौट गए।'),
            5: B2('📉 A slowdown: households and firms are importing much less.', '📉 मंदी: परिवार और फ़र्में बहुत कम आयात कर रही हैं।'),
            6: B2('🛢️🛢️ A severe oil shock: the import bill is the highest yet.', '🛢️🛢️ तेल का भारी झटका: आयात का बिल अब तक का सबसे ऊँचा है।')
        })[year];
        return B2(`${intro.en} Reserves: ${usd(state.reserves)} billion.`, `${intro.hi} भंडार: ${usd(state.reserves)} अरब।`);
    },
    decisions() {
        return [
            { id: 'regime', type: 'choice', label: B2('This year the rate will…', 'इस साल दर…'), value: 'float', options: [{ value: 'float', label: B2('Float — the market decides', 'तैरेगी — बाज़ार तय करेगा') }, { value: 'peg', label: B2('Be fixed by you', 'आप स्थिर करेंगे') }] },
            { id: 'peg', label: B2('Rate to fix (used only if you fix it)', 'स्थिर करने की दर (केवल स्थिर करने पर)'), min: FX.PEG_MIN, max: FX.PEG_MAX, step: 5, value: 80, unit: B2('₹ per $', '₹ प्रति $') }
        ];
    },
    live(state, d, year) {
        const r = FX.regime(year);
        if (d.regime === 'float') return { ok: true, text: B2('Floating: the rate settles where the dollars wanted equal the dollars offered.', 'तैरती दर: दर वहाँ ठहरेगी जहाँ माँगे गए डॉलर और प्रस्तुत डॉलर बराबर हों।') };
        const peg = Number(d.peg), gap = FX.gap(peg, r);
        const en = gap > 0 ? `At ₹${peg}: ${usd(FX.qd(peg, r))} billion wanted, ${usd(FX.qs(peg, r))} billion offered — you must sell ${usd(gap)} billion from reserves.`
            : (gap < 0 ? `At ₹${peg}: ${usd(FX.qd(peg, r))} billion wanted, ${usd(FX.qs(peg, r))} billion offered — you buy ${usd(-gap)} billion into reserves.` : `At ₹${peg}: ${usd(FX.qd(peg, r))} billion wanted and offered — nothing to make up.`);
        const hi = gap > 0 ? `₹${peg} पर: ${usd(FX.qd(peg, r))} अरब माँगे, ${usd(FX.qs(peg, r))} अरब प्रस्तुत — आपको भंडार से ${usd(gap)} अरब बेचने होंगे।`
            : (gap < 0 ? `₹${peg} पर: ${usd(FX.qd(peg, r))} अरब माँगे, ${usd(FX.qs(peg, r))} अरब प्रस्तुत — आप ${usd(-gap)} अरब भंडार में ख़रीदेंगे।` : `₹${peg} पर: ${usd(FX.qd(peg, r))} अरब माँगे और प्रस्तुत — पूरा करने को कुछ नहीं।`);
        return { ok: true, text: B2(en, hi) };
    },
    predict(state, year) {
        if (year !== 2 && year !== 3 && year !== 5) return null;
        const r0 = FX.regime(year - 1), r1 = FX.regime(year), up = FX.eq(r1).e - FX.eq(r0).e;
        return {
            prompt: B2('If the rupee were left to float this year, compared with last year’s market rate it would…', 'यदि रुपये को इस साल तैरने दिया जाए, तो पिछले साल की बाज़ार दर की तुलना में वह…'),
            options: [B2('Appreciate (fewer ₹ per $)', 'मज़बूत होगा (प्रति $ कम ₹)'), B2('Stay the same', 'वही रहेगा'), B2('Depreciate (more ₹ per $)', 'कमज़ोर होगा (प्रति $ ज़्यादा ₹)')],
            answer: () => (up < -1e-9 ? 0 : (up > 1e-9 ? 2 : 1))
        };
    },
    step(state, d, year) {
        const r = FX.regime(year), eq = FX.eq(r), before = state.reserves, prev = state.prevRate;
        let rate, broke = false, change = 0;
        const floated = d.regime === 'float', asked = Number(d.peg);
        if (floated) rate = eq.e;
        else {
            const need = FX.gap(asked, r);
            if (need > before + 1e-9) { broke = true; rate = eq.e; change = -before; state.reserves = 0; }
            else { rate = asked; change = -need; state.reserves = before + change; }
        }
        state.prevRate = rate;
        const qd = FX.qd(rate, r), qs = FX.qs(rate, r), move = 100 * Math.abs(rate - prev) / prev;
        return {
            year, floated, asked, broke, rate, eq: eq.e, eqQ: eq.q, qd, qs, gap: qd - qs, change, reservesBefore: before, reserves: state.reserves, prev, move,
            held: !floated && !broke, points: broke ? 0 : Math.max(0, 100 - 1.5 * move)
        };
    },
    scene(state, o, year) {
        const W = 120;
        const bar = (y, v, color, label) => `<rect x="150" y="${y}" width="${Math.min(W, v / 260 * W)}" height="22" rx="5" fill="${color}"></rect>
            <text x="144" y="${y + 15}" text-anchor="end" font-size="10.5" font-weight="700" fill="${LIFE_INK}">${label}</text>
            <text x="${156 + Math.min(W, v / 260 * W)}" y="${y + 15}" font-size="10.5" font-weight="800" fill="${LIFE_INK}">${usd(v)}</text>`;
        let g = `<rect x="0" y="0" width="520" height="240" rx="14" fill="#f0fdfa"></rect>
            <text x="22" y="28" font-size="13" font-weight="700" fill="${LIFE_INK}">💱 ${lifeT(B2('The dollar market this year', 'इस साल का डॉलर बाज़ार'))}</text>
            <g transform="translate(360,50)"><rect width="140" height="70" rx="10" fill="#134e4a"></rect><text x="70" y="24" text-anchor="middle" font-size="10" fill="#99f6e4">${lifeT(B2('rate board', 'दर-पट'))}</text>
            <text x="70" y="55" text-anchor="middle" font-size="24" font-weight="800" fill="#ccfbf1">${o ? '₹' + f1(o.rate) : '₹ ?'}</text></g>`;
        if (o) {
            g += bar(70, o.qd, '#dc2626', lifeT(B2('dollars wanted', 'माँगे गए डॉलर'))) + bar(104, o.qs, '#16a34a', lifeT(B2('dollars offered', 'प्रस्तुत डॉलर')));
            const mid = o.floated ? lifeT(B2('Floating: wanted = offered', 'तैरती दर: माँग = प्रस्तुति'))
                : (o.broke ? lifeT(B2('🚨 Reserves ran out — the fixed rate collapsed', '🚨 भंडार चुक गया — स्थिर दर ढह गई'))
                    : (o.gap > 0 ? lifeT(B2(`You sold ${usd(o.gap)} billion from reserves`, `आपने भंडार से ${usd(o.gap)} अरब बेचे`)) : (o.gap < 0 ? lifeT(B2(`You added ${usd(-o.gap)} billion to reserves`, `आपने भंडार में ${usd(-o.gap)} अरब जोड़े`)) : lifeT(B2('Nothing to make up', 'पूरा करने को कुछ नहीं')))));
            g += `<text x="22" y="170" font-size="12.5" font-weight="800" fill="${o.broke ? '#b91c1c' : '#0f766e'}">${mid}</text>
                <rect x="22" y="184" width="${Math.min(300, o.reserves / 150 * 300)}" height="16" rx="8" fill="#0f766e"></rect>
                <text x="22" y="218" font-size="11" fill="${LIFE_INK}">${lifeT(B2(`Reserves now ${usd(o.reserves)} billion`, `अब भंडार ${usd(o.reserves)} अरब`))}</text>`;
        } else g += `<text x="22" y="110" font-size="12" fill="${LIFE_MUTE}">${lifeT(B2('Demand and supply will be shown after you decide.', 'आपके निर्णय के बाद माँग और आपूर्ति दिखेगी।'))}</text>
            <text x="22" y="140" font-size="12" font-weight="700" fill="${LIFE_INK}">${lifeT(B2(`Reserves: ${usd(state.reserves)} billion`, `भंडार: ${usd(state.reserves)} अरब`))}</text>`;
        return lifeSvg(lifeT(B2('Dollars wanted and offered at the rate that held this year', 'इस साल जिस दर पर बाज़ार रहा, उस पर माँगे और प्रस्तुत डॉलर')), g);
    },
    stats(o) {
        return [
            { label: B2('Rate (₹ per $)', 'दर (₹ प्रति $)'), value: f1(o.rate) }, { label: B2('Market-clearing rate', 'बाज़ार-संतुलन दर'), value: f1(o.eq) },
            { label: B2('Change in reserves', 'भंडार में परिवर्तन'), value: `${o.change >= 0 ? '+' : '−'}${usd(Math.abs(o.change))}`, tone: o.change < 0 ? 'bad' : (o.change > 0 ? 'good' : undefined) },
            { label: B2('Reserves', 'भंडार'), value: usd(o.reserves), tone: o.broke ? 'bad' : undefined }
        ];
    },
    ledger: [
        { key: 'y', label: B2('Year', 'वर्ष'), get: r => String(r.round) },
        { key: 'reg', label: B2('Regime', 'व्यवस्था'), get: r => (r.outcome.floated ? lifeT(B2('float', 'तैरती')) : (r.outcome.broke ? lifeT(B2('broke', 'ढही')) : lifeT(B2('fixed', 'स्थिर')))) },
        { key: 'rate', label: '₹/$', get: r => f1(r.outcome.rate) },
        { key: 'res', label: B2('Reserves', 'भंडार'), get: r => usd(r.outcome.reserves) }
    ],
    narrate(o) {
        if (o.floated) return B2(`You let the rate float. Buyers and sellers met at <b>₹${f1(o.rate)}</b> per dollar, where ${usd(o.qd)} billion wanted equalled ${usd(o.qs)} billion offered. Last year it was ₹${f1(o.prev)}: the rupee ${o.rate > o.prev + 1e-9 ? 'depreciated' : (o.rate < o.prev - 1e-9 ? 'appreciated' : 'did not move')}. Reserves untouched: ${usd(o.reserves)} billion.`,
            `आपने दर को तैरने दिया। ख़रीदार और विक्रेता प्रति डॉलर <b>₹${f1(o.rate)}</b> पर मिले, जहाँ माँगे ${usd(o.qd)} अरब प्रस्तुत ${usd(o.qs)} अरब के बराबर थे। पिछले साल यह ₹${f1(o.prev)} थी: रुपया ${o.rate > o.prev + 1e-9 ? 'कमज़ोर हुआ' : (o.rate < o.prev - 1e-9 ? 'मज़बूत हुआ' : 'नहीं हिला')}। भंडार अछूता: ${usd(o.reserves)} अरब।`);
        if (o.broke) return B2(`You fixed the rate at ₹${o.asked}, but at that rate ${usd(FX.qd(o.asked, FX.regime(o.year)))} billion were wanted and only ${usd(FX.qs(o.asked, FX.regime(o.year)))} billion offered. You sold all ${usd(o.reservesBefore)} billion of reserves and it was not enough. <b>The peg collapsed</b>: the rate jumped to ₹${f1(o.rate)}, where the market clears. Reserves: ${usd(0)}.`,
            `आपने दर ₹${o.asked} पर स्थिर की, पर उस दर पर ${usd(FX.qd(o.asked, FX.regime(o.year)))} अरब माँगे गए और केवल ${usd(FX.qs(o.asked, FX.regime(o.year)))} अरब प्रस्तुत हुए। आपने भंडार के पूरे ${usd(o.reservesBefore)} अरब बेचे और वे काफ़ी नहीं थे। <b>स्थिर दर ढह गई</b>: दर उछलकर ₹${f1(o.rate)} हो गई, जहाँ बाज़ार संतुलित होता है। भंडार: ${usd(0)}।`);
        const side = o.asked < o.eq - 1e-9 ? B2(`₹${o.asked} is below the market-clearing ₹${f1(o.eq)}: the rupee is held stronger than the market wants, so dollars are cheap, demand outruns supply, and reserves pay for it.`, `₹${o.asked} बाज़ार-संतुलन ₹${f1(o.eq)} से नीचे है: रुपया बाज़ार की चाह से ज़्यादा मज़बूत थामा गया है, इसलिए डॉलर सस्ता है, माँग आपूर्ति से आगे निकलती है, और भंडार उसकी क़ीमत चुकाता है।`)
            : (o.asked > o.eq + 1e-9 ? B2(`₹${o.asked} is above the market-clearing ₹${f1(o.eq)}: the rupee is held weaker than the market wants, so dollars are dear, supply outruns demand, and you take the surplus into reserves.`, `₹${o.asked} बाज़ार-संतुलन ₹${f1(o.eq)} से ऊपर है: रुपया बाज़ार की चाह से ज़्यादा कमज़ोर थामा गया है, इसलिए डॉलर महँगा है, आपूर्ति माँग से आगे निकलती है, और अधिशेष आप भंडार में ले लेते हैं।`)
                : B2(`₹${o.asked} is exactly the market-clearing rate: nothing to make up.`, `₹${o.asked} ठीक बाज़ार-संतुलन दर है: पूरा करने को कुछ नहीं।`));
        return B2(`You held the rate at <b>₹${f1(o.rate)}</b>. ${side.en} Reserves went from ${usd(o.reservesBefore)} to <b>${usd(o.reserves)}</b> billion.`, `आपने दर <b>₹${f1(o.rate)}</b> पर थामी। ${side.hi} भंडार ${usd(o.reservesBefore)} से <b>${usd(o.reserves)}</b> अरब हो गया।`);
    },
    nudge(history, state) {
        if (!history.length) return null;
        const last = history[history.length - 1].outcome;
        if (last.broke) return B2('A fixed rate collapsed because the reserves ran out. What would have made the gap smaller?', 'एक स्थिर दर इसलिए ढही कि भंडार चुक गया। अंतर छोटा क्या करता?');
        if (history.every(r => r.outcome.floated) && history.length >= 2) return B2('You have only floated so far. What would holding the rate for a year cost — or gain?', 'आपने अब तक केवल दर तैरने दी है। एक साल दर थामने की क़ीमत — या लाभ — क्या होगा?');
        if (state.reserves < 25) return B2('Reserves are thin. Could a different rate this year ask less of them?', 'भंडार पतले हैं। क्या इस साल की कोई अलग दर उनसे कम माँगेगी?');
        return null;
    },
    chart(history, reveal) {
        if (!history.length) return null;
        const traces = [{ x: history.map(r => r.round), y: history.map(r => r.outcome.rate), mode: 'lines+markers', line: { color: '#0f766e', width: 3 }, marker: { size: 10, symbol: history.map(r => (r.outcome.floated ? 'circle' : (r.outcome.broke ? 'x' : 'square'))) }, name: lifeT(B2('Rate you ended with (₹ per $)', 'अंत में रही दर (₹ प्रति $)')) }];
        if (reveal) traces.unshift({ x: [1, 2, 3, 4, 5, 6], y: [1, 2, 3, 4, 5, 6].map(y => FX.eq(FX.regime(y)).e), mode: 'lines', line: { color: '#6366f1', width: 2, dash: 'dash' }, name: lifeT(B2('Rate the market would have chosen', 'जो दर बाज़ार चुनता')) });
        return { traces, layout: { xaxis: { title: lifeT(B2('Year', 'वर्ष')), range: [0.5, 6.5], dtick: 1 }, yaxis: { title: lifeT(B2('₹ per $', '₹ प्रति $')), range: [55, 112] } } };
    },
    debrief(history) {
        const os = history.map(r => r.outcome), score = os.reduce((s, o) => s + o.points, 0) / os.length;
        const right = y => !!history[y - 1] && !!history[y - 1].predict && history[y - 1].predict.correct;
        const fl = os.find(o => o.floated), floated = os.filter(o => o.floated), pegged = os.filter(o => o.held || o.broke);
        const under = os.find(o => (o.held || o.broke) && o.asked < o.eq - 1e-9), broke = os.find(o => o.broke);
        const calls = [2, 3, 5].filter(right).length;
        const range = floated.length ? [Math.min(...floated.map(o => o.rate)), Math.max(...floated.map(o => o.rate))] : null;
        return {
            score,
            scoreLine: B2(`You kept the rate steady for ${pctStr(score)} of what a perfectly stable year would earn; ${broke ? 'a peg collapsed on the way' : 'no peg collapsed'}. You ended with ${usd(os[os.length - 1].reserves)} billion in reserves.`, `आपने दर को पूरी तरह स्थिर साल से मिलने वाले अंकों का ${pctStr(score)} स्थिर रखा; ${broke ? 'रास्ते में एक स्थिर दर ढह गई' : 'कोई स्थिर दर नहीं ढही'}। अंत में भंडार ${usd(os[os.length - 1].reserves)} अरब रहा।`),
            insights: [
                {
                    icon: '⚖️', concept: B2('A free rate settles where demand equals supply', 'मुक्त दर वहाँ ठहरती है जहाँ माँग = आपूर्ति'), holds: !!fl,
                    evidence: fl ? B2(`Year ${fl.year}: floating, the rate settled at ₹${f1(fl.rate)}, where ${usd(fl.qd)} billion wanted equalled ${usd(fl.qs)} billion offered. Above it dollars would be in surplus, below it in shortage.`, `वर्ष ${fl.year}: तैरती दर ₹${f1(fl.rate)} पर ठहरी, जहाँ माँगे ${usd(fl.qd)} अरब प्रस्तुत ${usd(fl.qs)} अरब के बराबर थे। इससे ऊपर डॉलर अधिशेष में होते, नीचे कमी में।`) : null,
                    tryThis: B2('Let the rate float for at least one year.', 'कम से कम एक साल दर को तैरने दीजिए।'),
                    exam: B2('In a flexible (floating) system the exchange rate is determined by the demand for and supply of foreign exchange; the equilibrium rate clears the market.', 'लचीली (तैरती) व्यवस्था में विनिमय दर विदेशी मुद्रा की माँग और आपूर्ति से तय होती है; संतुलन दर बाज़ार को संतुलित करती है।')
                },
                {
                    icon: '↔️', concept: B2('Depreciation and appreciation', 'मूल्यह्रास और मूल्यवृद्धि'), holds: calls >= 2,
                    evidence: B2(`You read the shifts correctly (${calls} of 3). More dollars on offer (investment inflow, year 2): the market rate falls from ₹80 to ₹${f1(FX.eq(FX.regime(2)).e)} — the rupee appreciates. More dollars wanted (oil, year 3): it rises to ₹${f1(FX.eq(FX.regime(3)).e)} — the rupee depreciates.`, `आपने बदलावों को सही पढ़ा (3 में से ${calls})। डॉलर की आपूर्ति ज़्यादा (निवेश-प्रवाह, वर्ष 2): बाज़ार दर ₹80 से घटकर ₹${f1(FX.eq(FX.regime(2)).e)} — रुपया मज़बूत होता है। डॉलर की माँग ज़्यादा (तेल, वर्ष 3): दर बढ़कर ₹${f1(FX.eq(FX.regime(3)).e)} — रुपया कमज़ोर होता है।`),
                    tryThis: B2('Before each shock, decide whether it adds to the demand for dollars or to their supply.', 'हर झटके से पहले तय कीजिए कि वह डॉलर की माँग बढ़ाता है या उनकी आपूर्ति।'),
                    exam: B2('More ₹ per $ = the rupee depreciates (market-determined). Fewer ₹ per $ = it appreciates. A government-set change is called devaluation or revaluation, not depreciation or appreciation.', 'प्रति $ अधिक ₹ = रुपया कमज़ोर होता है (बाज़ार द्वारा तय)। प्रति $ कम ₹ = मज़बूत होता है। सरकार द्वारा तय बदलाव अवमूल्यन या पुनर्मूल्यन कहलाता है, मूल्यह्रास या मूल्यवृद्धि नहीं।')
                },
                {
                    icon: '🛟', concept: B2('Holding the rupee too strong drains reserves', 'रुपये को बहुत मज़बूत थामने से भंडार घटता है'), holds: !!under,
                    evidence: under ? B2(`Year ${under.year}: you held ₹${under.asked} against a market-clearing ₹${f1(under.eq)}. At that cheap dollar, ${usd(under.qd)} billion were wanted and only ${usd(under.qs)} billion offered; the gap came out of reserves (${usd(under.reservesBefore)} → ${usd(under.reserves)} billion).`, `वर्ष ${under.year}: आपने बाज़ार-संतुलन ₹${f1(under.eq)} के मुक़ाबले ₹${under.asked} थामा। उस सस्ते डॉलर पर ${usd(under.qd)} अरब माँगे गए और केवल ${usd(under.qs)} अरब प्रस्तुत हुए; अंतर भंडार से गया (${usd(under.reservesBefore)} → ${usd(under.reserves)} अरब)।`) : null,
                    tryThis: B2('In a year when more dollars are wanted, fix the rate below the market rate.', 'जिस साल डॉलर की माँग ज़्यादा हो, दर को बाज़ार दर से नीचे स्थिर कीजिए।'),
                    exam: B2('A fixed rate below the equilibrium rate creates excess demand for foreign exchange (a BOP deficit); the central bank must sell foreign exchange from its reserves to defend it.', 'संतुलन दर से नीचे की स्थिर दर विदेशी मुद्रा की अधिमांग (भुगतान-संतुलन घाटा) पैदा करती है; केंद्रीय बैंक को उसे बचाने के लिए अपने भंडार से विदेशी मुद्रा बेचनी पड़ती है।')
                },
                {
                    icon: '💥', concept: B2('Reserves are finite: a peg can break', 'भंडार सीमित हैं: स्थिर दर टूट सकती है'), holds: !!broke,
                    evidence: broke ? B2(`Year ${broke.year}: you fixed ₹${broke.asked}, needed ${usd(FX.gap(broke.asked, FX.regime(broke.year)))} billion and had ${usd(broke.reservesBefore)}. The peg collapsed and the rate jumped to ₹${f1(broke.rate)} in one step. A float would have moved gradually to the same place.`, `वर्ष ${broke.year}: आपने ₹${broke.asked} स्थिर किया, ${usd(FX.gap(broke.asked, FX.regime(broke.year)))} अरब चाहिए थे और ${usd(broke.reservesBefore)} थे। स्थिर दर ढह गई और दर एक ही झटके में ₹${f1(broke.rate)} हो गई। तैरती दर उसी जगह धीरे-धीरे पहुँचती।`) : null,
                    tryThis: B2('Fix the rate at one level through a shock that raises the demand for dollars.', 'डॉलर की माँग बढ़ाने वाले झटके के दौरान दर को एक ही स्तर पर स्थिर रखिए।'),
                    exam: B2('A fixed system needs adequate foreign-exchange reserves. If the reserves run out the central bank must devalue or float — a sudden, disruptive change (as in India in 1991).', 'स्थिर व्यवस्था को पर्याप्त विदेशी मुद्रा भंडार चाहिए। भंडार चुक जाए तो केंद्रीय बैंक को अवमूल्यन करना या दर तैरने देनी पड़ती है — एक अचानक, उथल-पुथल वाला बदलाव (जैसे 1991 में भारत में)।')
                },
                {
                    icon: '🔭', concept: B2('Fixed or flexible? Each has a price', 'स्थिर या लचीली? दोनों की अपनी क़ीमत है'), holds: floated.length > 0 && pegged.length > 0,
                    evidence: (floated.length > 0 && pegged.length > 0) ? B2(`In your floating years the rate wandered between ₹${f1(range[0])} and ₹${f1(range[1])}, and reserves never moved. In your fixed years the rate stayed where you put it — but reserves swung by as much as ${usd(Math.max(...pegged.map(o => Math.abs(o.change))))} billion in a single year.`, `आपके तैरते वर्षों में दर ₹${f1(range[0])} और ₹${f1(range[1])} के बीच घूमती रही, और भंडार कभी नहीं हिला। आपके स्थिर वर्षों में दर वहीं रही जहाँ आपने रखी — पर भंडार एक ही साल में ${usd(Math.max(...pegged.map(o => Math.abs(o.change))))} अरब तक डोला।`) : null,
                    tryThis: B2('Use both regimes in your six years and compare the rate and the reserves.', 'अपने छह वर्षों में दोनों व्यवस्थाएँ आज़माइए और दर और भंडार की तुलना कीजिए।'),
                    exam: B2('Flexible: automatic adjustment, no need for large reserves, but volatile rates hurt trade planning. Fixed: stability and certainty, but needs reserves and may hide a misaligned currency.', 'लचीली: स्वतः समायोजन, बड़े भंडार की ज़रूरत नहीं, पर अस्थिर दरें व्यापार-योजना को नुक़सान पहुँचाती हैं। स्थिर: स्थिरता और निश्चितता, पर भंडार चाहिए और मुद्रा का ग़लत मूल्य छिपा रह सकता है।')
                }
            ]
        };
    }
});

// ── 10. THE GREEN COMMONS ─────────────────────────────────────────
// A village lake. Fish regrow logistically from what is left after the catch:
// next = E + r·E·(1 − E/K), with E = stock − catch. Growth is fastest at the
// middle of the carrying capacity, so the largest catch that can be repeated
// for ever is the maximum sustainable yield r·K/4 — at E = K/2.
const LAKE = {
    K: 1000, R: 0.4, S0: 800, PRICE: 10000, MAXH: 300, // PRICE: ₹ per tonne
    regrow(E) { return LAKE.R * E * (1 - E / LAKE.K); },
    msy() { return LAKE.R * LAKE.K / 4; },
    next(S, H) { const take = Math.min(H, S), E = S - take; return { take, E, g: LAKE.regrow(E), next: E + LAKE.regrow(E) }; }
};

LIFE_WORLDS.push({
    id: 'green-commons', icon: '🐟', accent: '#15803d', minutes: 7,
    title: B2('The Village Lake', 'गाँव की झील'),
    role: B2('the head of a fishing village', 'एक मछुआरा-गाँव के प्रमुख'),
    tagline: B2('The lake feeds the village — as long as the village leaves enough fish to breed.', 'झील गाँव का पेट भरती है — जब तक गाँव प्रजनन के लिए पर्याप्त मछली छोड़ता है।'),
    class: 'XII', part: 'B', unit: 7, unitTitle: 'Current Challenges facing Indian Economy',
    syllabusIds: ['XII-B-U7-SUSTAINABLE'],
    labs: ['ied-sustainable-development'],
    rounds: 10, roundWord: B2('Year', 'वर्ष'),
    goLabel: B2('Cast the nets ▶', 'जाल डालें ▶'),
    brief: B2(
        `<p>Your village lives off one lake, which holds <b>800 tonnes</b> of fish. Each year you decide how many tonnes the village will catch; each tonne sells for <b>₹10,000</b>.</p>
         <p>Whatever is left breeds. A lake that is nearly empty grows slowly, and one that is crowded grows slowly too — but a lake in between grows quickly.</p>
         <p>Ten years. Earn as much as you can — and hand the next generation a lake worth having.</p>`,
        `<p>आपका गाँव एक झील पर जीता है, जिसमें <b>800 टन</b> मछली है। हर साल आप तय करते हैं कि गाँव कितने टन पकड़ेगा; हर टन <b>₹10,000</b> में बिकता है।</p>
         <p>जो बचता है, वही प्रजनन करता है। लगभग ख़ाली झील धीरे बढ़ती है, और ठसाठस भरी झील भी धीरे बढ़ती है — पर बीच की झील तेज़ी से बढ़ती है।</p>
         <p>दस साल। जितना कमा सकें कमाइए — और अगली पीढ़ी को ऐसी झील सौंपिए जो रखने लायक़ हो।</p>`),
    truth: LAKE,
    init() { return { stock: LAKE.S0 }; },
    news(state, year, history) {
        const prev = history.length ? history[history.length - 1].outcome : null;
        if (!prev) return B2(`The lake holds ${f1(state.stock)} tonnes.`, `झील में ${f1(state.stock)} टन मछली है।`);
        if (state.stock <= 0) return B2('The lake is empty. Nothing is left to breed.', 'झील ख़ाली है। प्रजनन के लिए कुछ नहीं बचा।');
        const d = state.stock - prev.stock;
        return B2(`The lake holds ${f1(state.stock)} tonnes — ${d > 0.5 ? `${f1(d)} more` : (d < -0.5 ? `${f1(-d)} fewer` : 'about the same')} than at the start of last year.`, `झील में ${f1(state.stock)} टन मछली है — पिछले साल की शुरुआत से ${d > 0.5 ? `${f1(d)} ज़्यादा` : (d < -0.5 ? `${f1(-d)} कम` : 'लगभग उतनी ही')}।`);
    },
    decisions() { return [{ id: 'h', label: B2('Tonnes the village will catch', 'गाँव कितने टन पकड़ेगा'), min: 0, max: LAKE.MAXH, step: 10, value: 150, unit: B2('t', 'टन') }]; },
    live(state, d) {
        const r = LAKE.next(state.stock, d.h);
        return { ok: true, text: B2(`You would take ${f1(r.take)} tonnes (${rupee(r.take * LAKE.PRICE, 0)}) and leave ${f1(r.E)} tonnes to breed.`, `आप ${f1(r.take)} टन पकड़ेंगे (${rupee(r.take * LAKE.PRICE, 0)}) और प्रजनन के लिए ${f1(r.E)} टन छोड़ेंगे।`) };
    },
    predict(state, year) {
        if (year !== 1 && year !== 4 && year !== 7) return null;
        return {
            prompt: B2('With the catch you have set below, will next year’s stock be higher, the same or lower than today’s?', 'नीचे तय किए गए पकड़ के साथ, अगले साल का भंडार आज के भंडार से अधिक, उतना ही या कम होगा?'),
            options: [B2('Higher', 'अधिक'), B2('About the same (within 10 tonnes)', 'लगभग उतना ही (10 टन के भीतर)'), B2('Lower', 'कम')],
            answer: o => { const d = o.after - o.stock; return d > 10 ? 0 : (d < -10 ? 2 : 1); }
        };
    },
    step(state, d, year) {
        const S = state.stock, r = LAKE.next(S, d.h);
        state.stock = r.next;
        return { year, stock: S, asked: d.h, take: r.take, E: r.E, g: r.g, after: r.next, income: r.take * LAKE.PRICE, collapsed: r.next < 100, extinct: r.next <= 0 };
    },
    scene(state, o, year) {
        const S = o ? o.stock : state.stock, n = Math.min(60, Math.round(S / 16));
        let fish = ''; for (let i = 0; i < n; i++) { const x = 60 + (i * 53) % 330, y = 80 + ((i * 37) % 100); fish += `<text x="${x}" y="${y}" font-size="${12 + (i % 3) * 2}" opacity="0.85">🐟</text>`; }
        const after = o ? o.after : null;
        return lifeSvg(lifeT(B2('The lake, its fish, and what is left to breed', 'झील, उसकी मछली, और प्रजनन के लिए जो बचा')), `
            <rect x="0" y="0" width="520" height="240" rx="14" fill="#ecfccb"></rect>
            <ellipse cx="225" cy="130" rx="190" ry="85" fill="#7dd3fc"></ellipse>${fish}
            <text x="22" y="28" font-size="13" font-weight="700" fill="${LIFE_INK}">🏞️ ${lifeT(B2(`Year ${year}: ${f1(S)} tonnes in the lake`, `वर्ष ${year}: झील में ${f1(S)} टन`))}</text>
            <g transform="translate(430,60)"><text x="0" y="0" font-size="10.5" font-weight="700" fill="${LIFE_INK}">${lifeT(B2('stock', 'भंडार'))}</text>
              <rect x="10" y="10" width="26" height="130" rx="6" fill="#d9f99d" stroke="#65a30d"></rect>
              <rect x="10" y="${140 - Math.min(130, S / LAKE.K * 130)}" width="26" height="${Math.min(130, S / LAKE.K * 130)}" rx="6" fill="#16a34a"></rect>
              <line x1="4" y1="${140 - 130 / 2}" x2="42" y2="${140 - 130 / 2}" stroke="#b45309" stroke-width="1.6" stroke-dasharray="3 2"></line>
              <text x="46" y="${140 - 130 / 2 + 4}" font-size="9" fill="#b45309">K/2</text></g>
            ${o ? `<text x="22" y="222" font-size="12" font-weight="800" fill="${o.after < o.stock - 10 ? '#b91c1c' : '#15803d'}">${lifeT(B2(`Caught ${f1(o.take)} · left ${f1(o.E)} · regrew ${f1(o.g)} → ${f1(after)} next year`, `पकड़ा ${f1(o.take)} · छोड़ा ${f1(o.E)} · बढ़ा ${f1(o.g)} → अगले साल ${f1(after)}`))}</text>` : ''}`);
    },
    stats(o) {
        return [
            { label: B2('Caught', 'पकड़ा'), value: `${f1(o.take)} ${lifeT(B2('t', 'टन'))}` }, { label: B2('Income', 'आय'), value: rupee(o.income, 0) },
            { label: B2('Regrew', 'बढ़ा'), value: `${f1(o.g)} ${lifeT(B2('t', 'टन'))}` },
            { label: B2('Next year’s stock', 'अगले साल का भंडार'), value: `${f1(o.after)} ${lifeT(B2('t', 'टन'))}`, tone: o.after < o.stock - 10 ? 'bad' : (o.after > o.stock + 10 ? 'good' : undefined) }
        ];
    },
    ledger: [
        { key: 'y', label: B2('Year', 'वर्ष'), get: r => String(r.round) },
        { key: 's', label: B2('Stock', 'भंडार'), get: r => f1(r.outcome.stock) },
        { key: 'c', label: B2('Caught', 'पकड़ा'), get: r => f1(r.outcome.take) },
        { key: 'n', label: B2('Next', 'अगला'), get: r => f1(r.outcome.after) }
    ],
    narrate(o) {
        const cap = o.asked > o.take + 1e-9 ? B2(` You tried for ${f1(o.asked)}, but only ${f1(o.take)} tonnes were there.`, ` आपने ${f1(o.asked)} की कोशिश की, पर वहाँ केवल ${f1(o.take)} टन थे।`) : B2('', '');
        if (o.extinct) return B2(`You took everything.${cap.en} With no fish left to breed, <b>the lake is empty for good</b>. Income this year ${rupee(o.income, 0)}; every year after, nothing.`, `आपने सब कुछ निकाल लिया।${cap.hi} प्रजनन के लिए कोई मछली नहीं बची, <b>झील हमेशा के लिए ख़ाली है</b>। इस साल की आय ${rupee(o.income, 0)}; उसके बाद हर साल, कुछ नहीं।`);
        const trend = o.after > o.stock + 10 ? B2('The lake is recovering.', 'झील सँभल रही है।') : (o.after < o.stock - 10 ? B2('The lake is shrinking.', 'झील सिकुड़ रही है।') : B2('The lake is holding steady.', 'झील स्थिर है।'));
        return B2(`You caught <b>${f1(o.take)}</b> tonnes (${rupee(o.income, 0)}) and left ${f1(o.E)} to breed. They grew by ${f1(o.g)} tonnes, so next year the lake holds <b>${f1(o.after)}</b>.${cap.en} ${trend.en}`, `आपने <b>${f1(o.take)}</b> टन पकड़ा (${rupee(o.income, 0)}) और ${f1(o.E)} प्रजनन के लिए छोड़ा। वे ${f1(o.g)} टन बढ़े, इसलिए अगले साल झील में <b>${f1(o.after)}</b> होगा।${cap.hi} ${trend.hi}`);
    },
    nudge(history, state) {
        if (!history.length) return null;
        const o = history[history.length - 1].outcome;
        if (state.stock <= 0) return null;
        if (o.after < o.stock - 10 && o.after < 400) return B2('The lake is below half its capacity and still shrinking. What does a lake with few fish gain back in a year?', 'झील अपनी क्षमता के आधे से नीचे है और अब भी सिकुड़ रही है। कम मछली वाली झील साल भर में कितना पा लेती है?');
        if (o.after > o.stock + 10 && o.take < LAKE.msy() * 0.6) return B2('The lake is growing and you are catching little. Is there a catch that the lake could replace every year?', 'झील बढ़ रही है और आप कम पकड़ रहे हैं। क्या कोई ऐसी पकड़ है जिसे झील हर साल पूरा कर दे?');
        return null;
    },
    chart(history, reveal) {
        if (!history.length) return null;
        const traces = [{ x: history.map(r => r.outcome.E), y: history.map(r => r.outcome.g), text: history.map(r => String(r.round)), mode: 'markers+text', textposition: 'top center', textfont: { size: 9 }, marker: { size: 11, color: history.map(r => (r.outcome.after < r.outcome.stock - 10 ? '#dc2626' : '#16a34a')), line: { color: '#fff', width: 1.5 } }, name: lifeT(B2('Your years (red = lake shrank)', 'आपके वर्ष (लाल = झील सिकुड़ी)')) }];
        if (reveal) {
            const xs = [], ys = []; for (let E = 0; E <= LAKE.K; E += 20) { xs.push(E); ys.push(LAKE.regrow(E)); }
            traces.unshift({ x: xs, y: ys, mode: 'lines', line: { color: '#15803d', width: 2.5 }, name: lifeT(B2('How much the lake regrows', 'झील कितना बढ़ती है')) },
                { x: [LAKE.K / 2], y: [LAKE.msy()], mode: 'markers', marker: { size: 13, symbol: 'star', color: '#b45309' }, name: lifeT(B2('Maximum sustainable yield', 'अधिकतम सतत उपज')) });
        }
        return { traces, layout: { xaxis: { title: lifeT(B2('Fish left to breed (tonnes)', 'प्रजनन के लिए छोड़ी मछली (टन)')), range: [0, 1000] }, yaxis: { title: lifeT(B2('Tonnes grown back in a year', 'साल भर में वापस बढ़े टन')), range: [0, 120] } } };
    },
    debrief(history, state) {
        const os = history.map(r => r.outcome);
        const total = os.reduce((s, o) => s + o.take, 0), msyTotal = os.length * LAKE.msy();
        const health = Math.min(1, state.stock / (LAKE.K / 2));
        const score = Math.min(100, 100 * Math.min(1, total / msyTotal) * health);
        const steady = os.reduce((acc, o, i) => { const run = []; for (let k = i; k < os.length && Math.abs(os[k].after - os[k].stock) <= 25 && os[k].take >= 70 && os[k].take <= 130; k++) run.push(os[k]); return run.length > acc.length ? run : acc; }, []);
        const low = os.find(o => o.after < 150), peak = os.reduce((a, b) => (b.take > a.take ? b : a));
        const grew = os.find(o => o.take > 0 && o.g >= 20); // fished, and saw the lake visibly replace fish
        const left = os.length ? os[os.length - 1] : null;
        return {
            score,
            scoreLine: B2(`In ten years the village caught ${f1(total)} tonnes and left a lake of ${f1(state.stock)} tonnes (a lake of ${LAKE.K / 2} or more counts as healthy). The most it could sustainably have caught is ${f1(msyTotal)}.`, `दस वर्षों में गाँव ने ${f1(total)} टन पकड़ा और ${f1(state.stock)} टन की झील छोड़ी (${LAKE.K / 2} या अधिक की झील स्वस्थ मानी जाती है)। जितना टिकाऊ ढंग से पकड़ा जा सकता था वह ${f1(msyTotal)} है।`),
            insights: [
                {
                    icon: '🌱', concept: B2('Renewable resources regrow — at a rate that depends on the stock', 'नवीकरणीय संसाधन फिर उगते हैं — भंडार के अनुसार दर से'), holds: !!grew,
                    evidence: grew ? B2(`Year ${grew.year}: you left ${f1(grew.E)} tonnes and the lake grew them by ${f1(grew.g)} tonnes. At ${LAKE.K / 2} tonnes left it would grow the most (${f1(LAKE.msy())}); nearly empty or nearly full, it grows little.`, `वर्ष ${grew.year}: आपने ${f1(grew.E)} टन छोड़ा और झील ने उसे ${f1(grew.g)} टन बढ़ाया। ${LAKE.K / 2} टन बचाने पर वह सबसे ज़्यादा बढ़ती (${f1(LAKE.msy())}); लगभग ख़ाली या लगभग भरी होने पर वह कम बढ़ती है।`) : null,
                    tryThis: B2('Catch some fish, then see how much of what you left grows back.', 'कुछ मछली पकड़िए, फिर देखिए जो आपने छोड़ी उसका कितना वापस उगता है।'),
                    exam: B2('Renewable resources (fish, forests) regenerate; the regeneration rate depends on the stock. If the rate of use exceeds the rate of regeneration the resource is depleted.', 'नवीकरणीय संसाधन (मछली, वन) पुनः उत्पन्न होते हैं; पुनर्जनन दर भंडार पर निर्भर है। उपयोग की दर पुनर्जनन दर से अधिक हो तो संसाधन चुक जाता है।')
                },
                {
                    icon: '♻️', concept: B2('Sustainable yield: take what regrows', 'सतत उपज: जो फिर उगे वही लें'), holds: steady.length >= 3,
                    evidence: steady.length >= 3 ? B2(`In years ${steady[0].year}–${steady[steady.length - 1].year} you caught about ${f1(steady.reduce((s, o) => s + o.take, 0) / steady.length)} tonnes every year and the lake stayed level. The most the lake can give year after year is ${f1(LAKE.msy())} tonnes (r·K/4), with ${LAKE.K / 2} tonnes left to breed.`, `वर्ष ${steady[0].year}–${steady[steady.length - 1].year} में आपने हर साल लगभग ${f1(steady.reduce((s, o) => s + o.take, 0) / steady.length)} टन पकड़ा और झील का स्तर बना रहा। झील साल-दर-साल अधिकतम ${f1(LAKE.msy())} टन दे सकती है (r·K/4), जिसमें प्रजनन के लिए ${LAKE.K / 2} टन बचते हैं।`) : null,
                    tryThis: B2('Find a catch that leaves the stock almost unchanged for three years running.', 'ऐसी पकड़ खोजिए जो लगातार तीन साल भंडार को लगभग वैसा ही छोड़े।'),
                    exam: B2('Sustainable development meets the needs of the present without compromising the ability of future generations to meet theirs: use renewable resources no faster than they regenerate.', 'सतत विकास वर्तमान की ज़रूरतें पूरी करता है, भावी पीढ़ियों की अपनी ज़रूरतें पूरी करने की क्षमता को घटाए बिना: नवीकरणीय संसाधनों का उपयोग उनके पुनर्जनन से तेज़ न हो।')
                },
                {
                    icon: '📉', concept: B2('Over-use collapses the resource', 'अति-उपयोग संसाधन को ढहा देता है'), holds: !!low,
                    evidence: low ? B2(`Your biggest catch was ${f1(peak.take)} tonnes in year ${peak.year}. By year ${low.year + 1} the lake was down to ${f1(low.after)} tonnes. A lake that small regrows only ${f1(LAKE.regrow(low.after))} tonnes a year — the village had spent the breeding stock.`, `आपकी सबसे बड़ी पकड़ वर्ष ${peak.year} में ${f1(peak.take)} टन रही। वर्ष ${low.year + 1} तक झील घटकर ${f1(low.after)} टन रह गई। इतनी छोटी झील साल में केवल ${f1(LAKE.regrow(low.after))} टन बढ़ती है — गाँव ने प्रजनन का भंडार ही ख़र्च कर दिया।`) : null,
                    tryThis: B2('Take far more than the lake regrows for a few years and see what is left.', 'कुछ साल झील के उगाने से कहीं ज़्यादा पकड़कर देखिए कि क्या बचता है।'),
                    exam: B2('Environmental impact: over-exploitation of natural resources reduces their future availability — the present gain is bought at the cost of the future.', 'पर्यावरणीय प्रभाव: प्राकृतिक संसाधनों का अति-दोहन उनकी भावी उपलब्धता घटाता है — आज का लाभ भविष्य की क़ीमत पर ख़रीदा जाता है।')
                },
                {
                    icon: '⏳', concept: B2('Today’s gain, tomorrow’s loss', 'आज का लाभ, कल की हानि'), holds: !!(low && left && peak.year < os.length && os.slice(peak.year).some(o => o.take < peak.take * 0.5)),
                    evidence: (low && left) ? B2(`After your big catch in year ${peak.year} (${rupee(peak.income, 0)}), later years brought as little as ${rupee(Math.min(...os.slice(peak.year).map(o => o.income)), 0)}. In these ten years you earned ${rupee(total * LAKE.PRICE, 0)}${total > msyTotal ? `, more than the ${rupee(msyTotal * LAKE.PRICE, 0)} a steady ${f1(LAKE.msy())} tonnes a year would have paid — by using up the lake` : ` against ${rupee(msyTotal * LAKE.PRICE, 0)} for a steady ${f1(LAKE.msy())} tonnes a year`}. But the lake you hand on now regrows only ${f1(LAKE.regrow(state.stock))} tonnes a year; a healthy one gives ${f1(LAKE.msy())} every year, for ever.`,
                        `वर्ष ${peak.year} की बड़ी पकड़ (${rupee(peak.income, 0)}) के बाद आगे के वर्षों में आय घटकर ${rupee(Math.min(...os.slice(peak.year).map(o => o.income)), 0)} तक रह गई। इन दस वर्षों में आपने ${rupee(total * LAKE.PRICE, 0)} कमाए${total > msyTotal ? `, जो हर साल ${f1(LAKE.msy())} टन की टिकाऊ पकड़ के ${rupee(msyTotal * LAKE.PRICE, 0)} से ज़्यादा है — झील को चुकाकर` : `, जबकि हर साल ${f1(LAKE.msy())} टन की टिकाऊ पकड़ ${rupee(msyTotal * LAKE.PRICE, 0)} देती`}। पर जो झील आप आगे सौंप रहे हैं वह साल में केवल ${f1(LAKE.regrow(state.stock))} टन बढ़ती है; स्वस्थ झील हर साल, हमेशा ${f1(LAKE.msy())} देती है।`) : null,
                    tryThis: B2('Compare a year of very heavy fishing with the years that follow it.', 'बहुत भारी पकड़ वाले एक साल की तुलना उसके बाद के वर्षों से कीजिए।'),
                    exam: B2('Resource use involves a trade-off between present consumption and the future: depleting a resource raises income now and lowers it later, and the cost falls on future generations.', 'संसाधन-उपयोग में वर्तमान उपभोग और भविष्य के बीच समझौता होता है: संसाधन चुकाने से आय अभी बढ़ती है और बाद में घटती है, और क़ीमत भावी पीढ़ियों पर पड़ती है।')
                }
            ]
        };
    }
});
