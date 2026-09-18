"""In-memory graph index over the dataset. Dict adjacency; no graph library —
the traversals needed (id lookup, one-hop expansion, etymology BFS) are trivial."""

from __future__ import annotations

from collections import defaultdict

from .schema import (
    Affix, AffixFunction, Concept, Dataset, EquivalenceClass,
    EtymologyEdge, LexicalEntry, Root, SemanticAtom, Source,
)


class GraphIndex:
    def __init__(self, ds: Dataset) -> None:
        self.ds = ds
        self.atoms: dict[str, SemanticAtom] = {a.id: a for a in ds.atoms}
        self.functions: dict[str, AffixFunction] = {f.id: f for f in ds.affix_functions}
        self.eq_classes: dict[str, EquivalenceClass] = {e.id: e for e in ds.equivalence_classes}
        self.affixes: dict[str, Affix] = {a.id: a for a in ds.affixes}
        self.concepts: dict[str, Concept] = {c.id: c for c in ds.concepts}
        self.entries: dict[str, LexicalEntry] = {e.id: e for e in ds.entries}
        self.roots: dict[str, Root] = {r.id: r for r in ds.roots}
        self.edges: dict[str, EtymologyEdge] = {e.id: e for e in ds.etymology_edges}
        self.sources: dict[str, Source] = {s.id: s for s in ds.sources}

        # adjacency
        self.entries_by_concept: dict[str, list[str]] = defaultdict(list)
        self.entries_by_affix: dict[str, list[str]] = defaultdict(list)
        self.entries_by_atom: dict[str, list[str]] = defaultdict(list)
        self.edges_by_node_ref: dict[str, list[str]] = defaultdict(list)
        self.affixes_by_function: dict[str, list[str]] = defaultdict(list)

        for e in ds.entries:
            self.entries_by_concept[e.concept_id].append(e.id)
            for use in e.morphology.affixes:
                self.entries_by_affix[use.affix_id].append(e.id)
            concept = self.concepts.get(e.concept_id)
            if concept:
                for atom_id in concept.atoms:
                    self.entries_by_atom[atom_id].append(e.id)
        for edge in ds.etymology_edges:
            for node in (edge.from_, edge.to):
                if node.node_ref:
                    self.edges_by_node_ref[node.node_ref].append(edge.id)
        for a in ds.affixes:
            for fn in a.functions:
                self.affixes_by_function[fn].append(a.id)

    # --- etymology subgraph -------------------------------------------------
    def etymology_subgraph(self, entry_id: str) -> tuple[list[dict], list[EtymologyEdge]]:
        """BFS over etymology edges connected to the entry (by edge id list and
        by node_ref), following shared forms so full chains are returned."""
        entry = self.entries[entry_id]
        seed_edges = set(entry.etymology) | set(self.edges_by_node_ref.get(entry_id, []))
        seen_edges: set[str] = set()
        seen_nodes: dict[str, dict] = {}
        frontier = list(seed_edges)

        def node_key(n) -> str:
            return n.node_ref or f"{n.lang_or_family}:{n.form}"

        while frontier:
            edge_id = frontier.pop()
            if edge_id in seen_edges or edge_id not in self.edges:
                continue
            seen_edges.add(edge_id)
            edge = self.edges[edge_id]
            for n in (edge.from_, edge.to):
                key = node_key(n)
                if key not in seen_nodes:
                    seen_nodes[key] = {
                        "key": key, "node_ref": n.node_ref, "form": n.form,
                        "lang_or_family": n.lang_or_family, "family": n.family,
                        "gloss": n.gloss,
                    }
                    # expand: edges that touch the same node_ref or same form+family
                    if n.node_ref:
                        frontier.extend(self.edges_by_node_ref.get(n.node_ref, []))
                    for other in self.edges.values():
                        if other.id in seen_edges:
                            continue
                        for m in (other.from_, other.to):
                            if node_key(m) == key:
                                frontier.append(other.id)
        return list(seen_nodes.values()), [self.edges[i] for i in sorted(seen_edges)]
