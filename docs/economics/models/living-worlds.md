# The Living Economy — worked models

`js/life-engine.js` · `js/life-worlds-micro.js` · `js/life-worlds-macro.js` · tests: `tools/test-life.js`

A Living World puts the student in a role and lets a concept be **named after it has been
felt**. Each world is one small textbook model. This file states every model's rule in one
sentence, the assumptions it leans on, and the test that holds it to that rule — the same
form as the November 2026 audit (`docs/economics/validation/audit-2026-11.md`).

Three rules apply to all six:

1. **The reveal is not a second model.** The curve drawn in the debrief is the function
   that generated the student's data (`world.truth`). Where there is noise, the test checks
   that realised outcomes average to that curve.
2. **An insight is a claim about the student's own history.** `holds` is computed from the
   rounds they played. It is shown as *lived* only then; otherwise as *not yet lived*, with
   something to try. Every world has a test with a run that must **not** earn an insight.
3. **A gut call is graded by the model**, from the outcome or from a counterfactual fixed
   *before* `step()` runs (a closure that reads `state` lazily reads the state *after* the
   decision — `finance-minister` had exactly this bug until a test caught it).

---

## 1. Chai stall — `chai-stall` (XI · Part B · Units 5–6)

**Rule.** 100 passers-by each have a most-they-will-pay; with those limits spread evenly
from ₹0 to ₹25, expected demand is the straight line `Q = 4 × (25 + shift − P)`.

| | Ordinary day | Cold wave (days 6–7) | Costly milk (days 8–10) |
|---|---|---|---|
| Demand | `Q = 100 − 4P` | `Q = 124 − 4P` (shift +₹6) | `Q = 100 − 4P` |
| MC = AVC | ₹5 | ₹5 | ₹9 |
| MR | `25 − Q/2` | `31 − Q/2` | `25 − Q/2` |
| MR = MC at | Q = 40, **P = ₹15** | Q = 52, **P = ₹18** | Q = 32, **P = ₹17** |
| Unit-elastic price | ₹12.50 | ₹15.50 | ₹12.50 |

Fixed cost ₹150/day. Each person's limit moves by up to ±₹2 on the day (seeded), so a day's
sales scatter around the line by about ±1.6 cups.

**Assumptions.** One seller with a local monopoly (it is the only stall at the gate), so
choosing a price is choosing an output. Constant marginal cost: the second-order condition
"MC cuts MR from below" holds because MR is falling — the general condition recorded in
`producer-equilibrium.md`, not "MC is rising". The slider runs ₹8–₹22 so that the noise
never reaches the ends of the willingness-to-pay range, where the expected line would bend.

**What the debrief may claim, and when.** Law of demand (two different prices on the same
kind of day, fewer cups at the higher). Shift vs movement (a cold-wave day at the **same or
a higher** price than an ordinary day that still sold more — never a lower price, or part
of the gain would be a movement). Elasticity by total expenditure (a pair wholly on one
side of the unit-elastic price). Revenue ≠ profit. MR = MC. A cost shock moves MC, not
demand.

**Tests (`testLifeChai`).** Demand falls at every price; the reveal's line is the inverse of
the model's demand; `best()` is the slider's profit maximum and has MR = MC exactly, with
MR > MC before and < after; revenue rises below the unit-elastic price and falls above;
the cold wave raises demand at every price; dearer milk changes demand at none; cups
actually sold average to the line (400 draws × 15 price/regime points); charging the best
price earns the benchmark on average (so 100% is the true ceiling).

## 2. Tomato mandi — `mandi` (XI · Part B · Unit 7)

**Rule.** Market demand `Qd = a − 5P` and supply `Qs = c + 7P` cross at the price every
seller must take; one seller's 10 kg changes nothing.

| Days | Event | a | c | P\* | Q\* |
|---|---|---|---|---|---|
| 1–3 | ordinary | 300 | −60 | ₹30 | 150 |
| 4–5 | bumper crop (supply ↑) | 300 | 0 | ₹25 | 175 |
| 6–7 | wedding season (demand ↑) | 360 | −60 | ₹35 | 185 |
| 8–9 | ceiling ₹24 on ordinary curves | | | ₹24 | Qd 180, Qs 108 → shortage 72 |
| 10 | floor ₹36 on ordinary curves | | | ₹36 | Qd 120, Qs 192 → surplus 72 |

A seller asking above the going price sells nothing; at or below it, everything (so asking
less only gives money away). Under the floor each seller sells the share `Qd/Qs` of stock.

**Assumptions.** Homogeneous good, perfect knowledge, very many sellers. Stock is
perishable, so unsold tomatoes are a pure loss. Proportional rationing under a surplus is an
illustration of "more is offered than is bought", not a claim about how real mandis ration.

**Tests (`testLifeMandi`).** Qd = Qs at P\* in every regime; excess supply above it, excess
demand below; no asking price beats the market price; supply ↑ ⇒ P↓ Q↑; demand ↑ ⇒ P↑ Q↑;
a binding ceiling gives shortage = Qd − Qs, a binding floor gives surplus = Qs − Qd; with no
control neither exists. A seller who always matched the rate is **not** told they discovered
price-taking.

## 3. Pocket money — `pocket-money` (XI · Part B · Unit 5)

**Rule.** With ₹120 and two goods whose marginal utility falls, joy is greatest where the
last rupee spent on each buys the same joy and nothing is left over.

`MU samosa = 100, 80, 60, 20, 18, 15, 12, 10, 5, 2` · `MU lassi = 120, 90, 60, 40, 25, 10` ·
lassi ₹20.

| Samosa price | Best tray | MUx/Px | MUy/Py | Spent |
|---|---|---|---|---|
| ₹5 | 8 samosas, 4 lassi | 10/5 = 2 | 40/20 = 2 | ₹120 |
| ₹10 | 4 samosas, 4 lassi | 20/10 = 2 | 40/20 = 2 | ₹120 |
| ₹20 | 3 samosas, 3 lassi | 60/20 = 3 | 60/20 = 3 | ₹120 |

The schedules were chosen so the equi-marginal condition holds **exactly** with whole units
at all three prices. With arbitrary schedules it holds only "as nearly as whole units
allow", which would make the textbook statement approximately true on screen.

**Tests (`testLifePocket`).** Both schedules strictly diminishing; at each price the best
tray is unique by brute force over every affordable tray, spends the whole budget, and has
MUx/Px = MUy/Py; the samosas in the best tray fall as the price rises (8 → 4 → 3), which is
the demand curve the debrief draws.

## 4. Town survey — `town-survey` (XI · Part A · Units 2–3)

**Rule.** A random sample estimates the population mean without bias and more closely as it
grows; a sample taken where it is convenient estimates something else.

200 households: Market Road (40, ₹60–200k), Colony (90, ₹25–60k), Basti (70, ₹8–25k), each
skewed toward the bottom of its range. "Nearest doors" visits only Market Road.

**Tests (`testLifeSurvey`).** Over 60 towns: the census equals the true mean and median
exactly; lottery samples have mean signed error under 2%; the Market Road sample
over-estimates in every town; n = 40 has a smaller average error than n = 10; the mean lies
above the median in every town. The "bigger sample lands closer" insight is credited only
when the student's own larger draw really was closer, and its text says it is a tendency.

## 5. Town bank — `town-bank` (XII · Part A · Unit 2)

**Rule.** Each loan is redeposited, so with a legal reserve ratio `r` total deposits
approach `Initial × 1/r` and never pass it.

₹10,000, `r` = 20% → new deposits 10,000, 8,000, 6,400 … → limit ₹50,000 (multiplier 5).
Rounds 7–8 put the student in the RBI's chair: raising `r` to 25% cuts the multiplier to 4;
cutting it to 10% raises it to 10. Repo-rate moves are graded for **direction only** — the
syllabus asks which way each instrument works, and the model computes no number for it.

**Assumptions (NCERT's own).** All transactions pass through banks; no cash leaks out;
the banking system is treated as one bank. Lending above the legal maximum is stopped and
counted, not executed.

**Tests (`testLifeBank`).** On the legal-maximum path each deposit is (1 − r) of the last,
reserves are exactly r × deposits, loans + reserves = deposits; the cumulative path stays
below the limit for every n and converges to it; no policy exceeds that path; a bank that
lends nothing is **not** credited with credit creation; a player who never under-lent is
told they have not yet seen what idle reserves do.

## 6. Finance minister — `finance-minister` (XII · Part A · Units 3–4)

**Rule.** With `C = 100 + 0.8(Y − T)`, income settles where `Y = C + I + G`, i.e.
`Y* = (100 − 0.8T + I + G) / 0.2`; output cannot exceed full-employment income 2,000.

- Spending/investment multiplier `1/(1 − 0.8) = 5`; lump-sum tax multiplier `−0.8/0.2 = −4`.
- Gap = `|AD(Yf) − Yf|`, measured **at full employment**: deflationary below, inflationary
  above (vertical, as the 2026-11 audit required of `macro-inflation-gap`).
- Fiscal deficit = `G + interest − T`; primary deficit = fiscal deficit − interest; debt
  grows by the fiscal deficit and next year's interest is 5% of it.
- Investment by year: 160, 150, 200, 250, 230 (normal 200).

**What is illustration, and says so on screen.** Idle workers are drawn in proportion to
the output shortfall. The syllabus teaches that deficient demand causes involuntary
unemployment; it gives no formula for how much.

**Enrichment.** The tax-multiplier insight goes beyond the named 2026–27 topic (the
syllabus asks students to *name* tax and spending changes as fiscal measures). It is
labelled ✨ in the debrief, as `macro-multiplier`'s `enrichmentNote` already does.

**Tests (`testLifeFM`).** Y = AD at equilibrium across the whole G × T × I grid; output never
above Yf; the gap is the vertical one and is named correctly; the three budget identities;
ΔY/ΔG = ΔY/ΔI = 5 and ΔY/ΔT = −4; the opening budget sits exactly at Yf; every year has a
slider setting that closes the gap exactly. A minister who never moves a lever, or moves
them the wrong way, is not credited with correcting either gap.

---

## 7. The Island — `ppf-island` (XI · Part B · Unit 4)

**Rule.** Rice `R = a·√x` and fish `F = b·√y` from `x`, `y` worker-hours (`x + y ≤ L`). With every hour
used, `(R/a)² + (F/b)² = L`: a quarter-ellipse, concave to the origin, so the opportunity cost of one
good (fish given up per extra rice) **rises** along it. Satisfaction `U = R^α · F^(1−α)`.

| Season | Event | L | a | b | α | Best split (rice/fish hrs) |
|---|---|---|---|---|---|---|
| 1–2 | ordinary | 100 | 4 | 4 | 0.4 | 40 / 60 |
| 3 | tastes swing to rice | 100 | 4 | 4 | 0.7 | 70 / 30 |
| 4 | better net | 100 | 4 | **5** | 0.4 | 40 / 60 |
| 5 | more people | **140** | 4 | 5 | 0.4 | best on the 10-hour grid |
| 6 | equal tastes | 140 | 4 | 5 | 0.5 | 70 / 70 |

Tastes change the best *point*, never the frontier (season 3). A net moves only the fish end
(season 4). More workers move both ends (season 5). Hours left idle land the plan inside the
frontier. With these utility weights the best split is `x = α·L` whatever `a` and `b` are — a net
makes more fish but does not change how the hours are best shared; that is a property of the
Cobb–Douglas taste used here, said plainly rather than hidden.

**Tests (`testLifePpf`).** Every split lies on the quarter-ellipse; the opportunity cost rises at every
step in every season; `best()` is the satisfaction maximum over the whole grid; the three frontier
changes are classified from the end-points and graded as gut calls; idle hours always forgo output
(the evidence is the model's own counterfactual); the increasing-cost insight needs two full-employment
seasons on the *same* frontier at different rice hours.

## 8. Count the Nation's Output — `value-chain` (XII · Part A · Unit 1)

**Rule.** GDP at market price = Σ (output − intermediate inputs) over domestic producers = output of
final goods − imported inputs. Wages + profits paid out equal that same total (here 60/40 of each
producer's value added; no depreciation or indirect taxes, so factor income = value added).

| Year | Twist | True GDP | Every sale | Households only |
|---|---|---|---|---|
| 1 | plain chain | 100 | 210 | 100 (right) |
| 2 | 10 of bread unsold | 100 | 200 | 90 — misses the change in stocks |
| 3 | 20 of the wheat imported | 80 | 190 | 100 — counts foreign output |
| 4 | higher prices | 120 | 260 | 120 (right) |
| 5 | a 30 oven bought by the baker | 130 | 240 | 100 — misses investment |
| 6 | all three at once | 120 | 230 | 100 |

The four counting options are honest implementations: "every sale" and "households only" are the two
tempting shortcuts; "value added" and "wages + profits" are the correct methods. A student who always
picks value added is **not** told they met double counting or the expenditure traps.

**Tests (`testLifeValueChain`).** The value-added identity every year; factor income = value added;
each shortcut's direction of error is asserted per year; the four gut calls are graded from the
estimates; trying all four methods lives all four ideas; always adding every sale scores almost nothing.

## 9. The Rupee Desk — `forex-counter` (XII · Part A · Unit 5)

**Rule.** Demand for dollars `Qd = a − 2e`, supply `Qs = c + 1.5e` ($ bn; `e` = ₹ per $), so the market
rate is `(a − c)/3.5`. Floating: the rate is that. Fixed at `p`: the desk sells `Qd − Qs` from reserves
when positive and buys `Qs − Qd` into reserves when negative; if the reserves cannot cover it the peg
collapses and the rate jumps to the market rate. Reserves start at $30 bn.

| Year | Shock | a | c | Market rate |
|---|---|---|---|---|
| 1 | ordinary | 300 | 20 | ₹80 |
| 2 | investment inflow (supply ↑) | 300 | 60 | ₹68.57 |
| 3 | oil (demand ↑) | 360 | 20 | ₹97.14 |
| 4 | ordinary | 300 | 20 | ₹80 |
| 5 | slowdown (demand ↓) | 240 | 20 | ₹62.86 |
| 6 | severe oil | 380 | 20 | ₹102.86 |

Holding ₹80 all six years leaves reserves 30 → 70 → 10 → 10 → 70 → *needs 80, has 70*: the peg breaks
in year 6. A peg a little above year 1's equilibrium (₹85) never breaks. Scoring is stability only
(`100 − 1.5 × %change in the rate`, 0 in a year the peg collapses): a fixed rate has no modelled cost
beyond needing reserves, which is why the debrief reports both regimes' costs side by side instead of
declaring a winner. **Assumption:** linear demand/supply and no capital-flight feedback; real peg
collapses are faster and larger than this.

**Tests (`testLifeForex`).** Qd = Qs at every year's market rate; excess demand below it, excess supply
above; the supply/demand slopes; floats never touch reserves; a held peg moves reserves by exactly the
gap; ₹80 breaks in year 6 and reserves never go negative; the explorer path lives all five ideas.

## 10. The Village Lake — `green-commons` (XII · Part B · Unit 7)

**Rule.** Fish left after the catch, `E = S − H`, regrow by `r·E·(1 − E/K)` (`K = 1000`, `r = 0.4`).
Growth is greatest at `E = K/2`, where it equals the **maximum sustainable yield** `r·K/4 = 100`
tonnes a year. A steady catch of 100 from a stock of 600 leaves it at 600.

**A fixed catch is not enough.** Below a critical stock even a catch under the MSY empties the lake:
a constant 90 tonnes settles near 748 from a stock of 600 but collapses from 300 (the critical stock
for 90 is about 435; 60 still recovers it). The model does not hide this — it is exactly why quotas
must fall as stocks fall — and the tests assert it. Over ten years a greedy village can out-earn a
sustainable one (it spends the breeding stock); the debrief says so and points at what the lake
yields from year 11 on, rather than claiming the greedy village earned less.

**Tests (`testLifeCommons`).** Regrowth is zero when empty and when full and peaks at `K/2` at exactly
`r·K/4`; steady state at the MSY; 110 a year empties the lake, 90 from a healthy lake does not and
from a depleted one does; catch + escapement = stock; extinct stays extinct; the gut call is graded
from the stock the lake actually ends the year with; a village that never over-fished is **not**
told it saw a collapse.

## What is deliberately not a world

Class XI Part A Unit 1 (what economics is), Class XII Part B Unit 6 (the 1947–90 development
experience and the 1991 reforms) and Unit 8 (India against Pakistan and China) are history and
cross-country comparison. A game model could only invent them; the Explorers and the
`ied-comparison-neighbours` / `ied-five-year-plans` labs already carry them from stated facts.
