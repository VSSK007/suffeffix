# Semantic layer

**Semantic atoms are an engineering interlingua, not a theory of human cognition.**

That sentence is normative and appears verbatim in the Atom Explorer UI.

## Atoms

30–50 atoms, each `{id, category, definition, epistemic_status, nsm_prime, exponents{en,te,hi}, related[]}`. Atoms that are Natural Semantic Metalanguage primes (Wierzbicka 1996; Goddard & Wierzbicka 2014) carry `nsm_prime: true` and `epistemic_status: "ESTABLISHED"` — established *as NSM primes*, i.e. as a well-known research program's inventory, not as proven cognitive universals. All other atoms are `ENGINEERING`.

Categories: FOUNDATIONAL, RELATIONAL, ACTION, STATE, EMOTIONAL, SOCIAL. Relations between atoms: `opposite`, `broader`, `narrower`, `co-occurs`.

## Atom structures

Concepts carry an `AtomStructure`: a small typed expression tree with operators
`STATE_OF, CAUSE, BECOME, NEG, HAVE, AGENT_OF, EVENT_OF, PLACE_OF, DEGREE`,
stored as nested JSON (`{"op": "STATE_OF", "args": [{"atom": "atom:GOOD"}]}`), never as a string. A pretty-printer renders `STATE_OF(GOOD)` etc.

Examples:
- GOODNESS = `STATE_OF(GOOD)`
- CHILDHOOD = `STATE_OF(CHILD)`
- HOPELESSNESS = `STATE_OF(NEG(HAVE(WANT(GOOD AFTER NOW))))` — coarse; tagged `HYPOTHESIS`
- TEACHER = `AGENT_OF(TEACH)`
- SIMPLIFY = `CAUSE(BECOME(SMALL(DEGREE)))` approximations are flagged `HYPOTHESIS` where coarse.

Decomposition granularity is honest: where a concept resists decomposition into ≤ 50 atoms, the structure is marked `HYPOTHESIS` and the explanation engine phrases it as an approximation ("can be approximated as…").

## Affix functions

20–30 cross-lingual functions (`fn:ST` abstract state, `fn:AG` agent, `fn:PRIV` privative, …). A function is a *functional* label: members of its equivalence class differ in distribution, register, and productivity — every equivalence-class note says so (`ENGINEERING`).
