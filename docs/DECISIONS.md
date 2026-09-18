# Decision log

Objections to the build prompt, corrections to seed data, and dependency justifications. Each entry states the reasoning.

## Objections to the prompt / spec

1. **"-th" as a productive English state suffix.** The prompt's seed list includes `-th` (warmth, truth). It is **dead** (`productivity: "dead"`); we include it but mark it dead and exclude it from productive-affix explanations. `[ESTABLISHED]`
2. **Telugu -ఐన listed as an affix.** అయిన/-ఐన is the adjectival participle of అగు "become" used as a copular linker, arguably syntax rather than derivational morphology. We keep it as `kind: "suffix"`, function `ADJ`, but tag it `ENGINEERING` with a note; treating it as a suffix is an implementation convenience for alignment with English -ic/-al and Hindi -ईय.
3. **Hindi -ई polysemy.** -ई forms abstract nouns (गरम → गरमी), feminines, and adjectives (देस → देसी). One affix row per function would fragment the atlas; instead one affix carries multiple `functions` and the entry names which function applies. This is why `LexicalEntry.morphology.affixes[]` pairs `affix_id` **with** `function_id`.
4. **eq:ADV including Hindi "से".** से is a postposition, not an affix. We list only -पूर्वक as the Hindi member and note in the class that the commonest adverbial strategy in Hindi is the phrase `X से`, which is outside affix morphology. `[ESTABLISHED]`
5. **Hindi -आना as causative.** The productive Hindi causative is stem-internal -आ-/-वा- (verbal inflection-like derivation: बनना → बनाना → बनवाना). We model -आ- as the causative affix (register N), noting that pairing it with English -ize/-ify is functional, not distributional. The prompt's "-आना" spelling conflates the causative increment with the infinitive -ना; we store the affix as `-आ-` with allomorph `-वा-`.
6. **Telugu -వాడు/-ది, -గాడు as derivational affixes.** These are pronominalized formatives (human masc/non-masc). Kept, tagged `ENGINEERING`, because they do the *functional* work of agentive/possessor nominalization that the Atlas aligns; a syntactician would call them bound pronouns.
7. **"dog" contested chain.** Hindi कुत्ता / Telugu కుక్క resemblance: CDIAL treats the Indo-Aryan word as of uncertain, possibly expressive or non-Aryan origin; DEDR lists a Dravidian kukka set. We cite both works **without** entry numbers (per the no-invented-numbers rule; numbers to be added at review time from the physical works), store the Telugu–Hindi relation as `status: "contested"`, confidence 0.4, resolving nothing. `[ESTABLISHED that it is contested]`
8. **English "king" and Sanskrit "rājan".** Unrelated (kuningaz vs. h₃rḗǵs); note that English *royal/regal* (via Latin/French) IS cognate with rājan — we include that as a bonus COGNATE edge, properly sourced.
9. **"name" PIE form.** *h₁nómn̥ (also cited *h₁néh₃mn̥) — reconstruction details are debated; we cite the mainstream form with confidence 0.8, `RECONSTRUCTED`.
10. **Atom cap tension.** 120–160 concepts strain 50 atoms. Resolved by allowing concepts to reuse coarse structures (e.g. LONELINESS = STATE_OF(FEEL(BAD, because NOT NEAR PEOPLE)) approximated as STATE_OF + FEEL + BAD + ALONE-via-NEG(NEAR)); some concepts carry `HYPOTHESIS` structures where decomposition is genuinely coarse.
11. **French/Tamil enum values.** The `Lang` literal contains only en/te/hi; adding unused enum members invites accidental data. Growth is a one-line code change (documented in ROADMAP).

## Corrections to seed lists

- Telugu **-త్వం** and **-వంతుడు** marked register `S` (Sanskritic -tva, -vant); **-తనం, -రికం, -డం/-ట, -గా, -గల, -లేని, -వాడు** marked `N`. **-కారుడు** is Sanskritic base (kāra) with native inflection → `mixed`.
- Hindi **-ख़ाना, -दार, -गर, बे-** marked `P` (Persian); **-ता, -त्व, निर्-, -पूर्ण, -मय, -वान, -नीय, -ईय, -इक, -शाला, -पूर्वक** marked `S`; **-पन, -ई, -आई, -आहट, -आवट, -आपा, -वाला, -सा** marked `N`.
- English **-hood, -ship, -dom, -th, -er, -ful, -less, un-, -ly, -ish, -en, -ing, -let, -ling** native (`N`-analog: Germanic); **-ity, -tion, -ment, -ic, -al, -ous, -able, -ess, -ism, -ist, -ize, -ify, -ology** borrowed (Latin/Greek/French → register `E` is meaningless for English itself, so English entries use `N` for Germanic strata and `mixed`/`S`-analog is not used; we use `N` vs `E` where `E` marks the learned Latinate/Greek stratum — an `ENGINEERING` reuse of the register enum, documented in DATASET.md).

## Dependency justifications

Python (core): **pydantic** (schema + validation, the backbone). API: **fastapi**, **uvicorn**. Dev: **pytest**. Nothing else — no networkx (traversals are trivial), no ORM (no DB), no requests (no outbound calls).

Web: **next**, **react**, **react-dom**, **typescript**, **tailwindcss** (+postcss/autoprefixer), **openapi-typescript** (dev, generates API types), **d3-hierarchy** (tiny, layout math only for the etymology tree). No component library, no state manager, no graph library.
