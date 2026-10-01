# Dataset design

> Suffeffix is an explainable lexical knowledge graph that jointly represents morphology, semantic decomposition, etymology, and affix alignment.

## Files

| File | Content | Limits (validated in CI) |
|---|---|---|
| `data/atoms.json` | semantic atoms | 30–50 |
| `data/affix_functions.json` | cross-lingual affix functions | 20–30 |
| `data/equivalence_classes.json` | affix equivalence classes | one per function used cross-lingually |
| `data/affixes/{en,fr,hi,te,ta}.json` | affix inventories | ~25–40 per language |
| `data/concepts.json` | concept-aligned senses | ~120–160 |
| `data/entries/{en,fr,hi,te,ta}.json` | lexical entries | 300–850 total |
| `data/roots.json` | reconstructed/ancient roots | as needed |
| `data/etymology_edges.json` | typed, sourced etymology edges | every edge has `source_ref` |
| `data/sources.json` | full bibliography for every `source_ref` key | complete |

## Hard research-integrity rules

1. **Two families (T.H.E.F.T.).** Telugu (South-Central) and Tamil (South) are Dravidian; English (IE: Germanic), French (IE: Romance) and Hindi (IE: Indo-Aryan) are Indo-European. **No COGNATE or INHERITED edge may cross a top-level family boundary** — the validator rejects it. Cross-family links are BORROWED, SHARED_LOAN alignment, or CALQUE only. Genuine cognates within a family (mother/mère/माता, name/nom/नाम; Telugu మూడు/Tamil மூன்று, నీరు/நீர்) are allowed and sourced. `[ESTABLISHED]`
2. **Register.** `N` native/inherited (tadbhava; French *mots populaires*; English Germanic stratum), `S` Sanskritic/tatsama, `P` Perso-Arabic, `L` learned Latin/Greek stratum (English and French *mots savants*), `E` English loan, `mixed`. Treating `L` as the European counterpart of `S` is an `ENGINEERING` convention (DECISIONS 13). Equivalence display prefers register-matched pairs.
3. **Confidence & sources.** Every etymology edge: `source_ref` + `confidence` ∈ [0,1]. Wiktionary-only ⇒ ≤ 0.6. No invented DEDR/CDIAL numbers; a work cited without a number caps confidence at 0.7. Contested edges: `status: "contested"`, badge in UI, never silently resolved.
4. **Atoms are an engineering interlingua, not a theory of human cognition.** NSM-prime atoms are `ESTABLISHED` (as NSM primes, per Wierzbicka/Goddard); added atoms are `ENGINEERING`.
5. Everything ships `review_status: "draft"` unless anchored to a cited reference work; the landing page shows honest counts.

## Concept selection (115, concept-aligned across en/fr/hi/te/ta)

Showcase categories: abstract states (goodness, childhood, loneliness, madness, old age, truth, freedom, humanity, friendship, kingship…), agents (teacher, worker, artist, farmer, merchant, singer…), privatives (hopeless, fearless, shameless, useless, homeless…), possessives (hopeful, useful, powerful, beautiful…), ability (readable, drinkable…), adverbs (quickly, slowly…), causatives (simplify, strengthen…), doctrines (socialism, nationalism…), places/fields (library, school, linguistics…), and an etymology-demo basic-vocabulary set (mother, father, name, tooth, three, water, fire, dog, house, book, sugar, king, sleep, memory, joy, anger…).

Not every concept has a *derived* form in every language (English "hunger" is simplex where Hindi भुखमरी is derived); entries record `morphology.schema: "SIMPLEX"` in that case, and concepts with uneven coverage set `partial_coverage: true`.

## Flagship etymology chains (fully sourced)

- **sugar**: Skt. शर्करा śarkarā → Prakrit sakkarā → Hindi शक्कर (INHERITED chain); śarkarā → Persian shakar → Arabic sukkar → Med. Latin succarum → Old French sucre → English sugar (BORROWED chain); Telugu చక్కెర ← Indo-Aryan loan; Hindi चीनी ← चीन "China" by metonymy (separate edge, drift METONYMY).
- **book**: OE bōc ~ "beech" metonymy (contested-adjacent; cited OED); Hindi किताब ← Persian kitāb ← Arabic k-t-b; Hindi पुस्तक & Telugu పుస్తకం ← Skt. pustaka (itself possibly ← Iranian, noted, confidence-capped).
- **mother**: PIE *méh₂tēr → OE mōdor → mother; → Skt. mātṛ → माता/माँ. Proto-Dravidian nursery *amma → Telugu అమ్మ. **No cross-family edge.**
- **name**: PIE *h₁nómn̥ → name / Skt. nāman → नाम; PDr *peyar → పేరు.
- **king**: Skt. rājan → राजा (tatsama), Telugu రాజు (loan); English king ← Proto-Germanic *kuningaz — unrelated; bonus: royal/regal cognate with rājan via PIE *h₃rḗǵs.
- **nice**: Latin nescius "ignorant" → OF nice → ME nice "foolish" → ModE "pleasant" — drift chain PEJORATION-source → AMELIORATION.
- **dog (hi/te)**: कुत्ता / కుక్క stored `contested` (CDIAL 3275 vs DEDR 1658; possibly expressive/areal), confidence 0.4.

## Atom inventory (≤ 50)

NSM-prime seed (ESTABLISHED as NSM primes): I, YOU, SOMEONE, SOMETHING, PEOPLE, BODY, PART, ONE, TWO, MANY, ALL, GOOD, BAD, BIG, SMALL, DO, HAPPEN, MOVE, SAY, THINK, KNOW, WANT, FEEL, SEE, HEAR, LIVE, DIE, TRUE, NOT, BEFORE, AFTER, NOW, WHERE, ABOVE, BELOW, NEAR, FAR, BECAUSE, LIKE, HAVE.
Engineering additions (only what the concepts require): CHILD, OLD, FEAR, JOY, ANGER, SHAME, LEAD, RULE, WORK, TEACH, TEXT, NAME, KIN, FEMALE, MALE (≤ 50 total). Every atom has exponents in all three languages.

## Authoring pipeline

Data is authored as JSON directly in `data/`. `scripts/validate.py` (a thin wrapper over `suffeffix_core.validate`) fails the build on any rule above. `scripts/build_stats.py` prints the honest counts shown on `/`.
