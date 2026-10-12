#!/usr/bin/env python3
"""Build lazy-loaded multiword phrase shards from the existing word shards.

The full Kaikki import in dictionary/words already contains ~165k multiword
entries (idioms, phrasal verbs, collocations), but those shards are keyed for
single-word lookups. This script copies every multiword entry into
dictionary/phrases/<key>.json, keyed by the first two letters of the phrase's
first word, so the phrase matcher only fetches shards for words in a selection.

Usage:
  python3 scripts/build_phrase_index.py

Source: Wiktionary through Kaikki / Wiktextract (CC BY-SA / GFDL);
read dictionary/LICENSE-THIRD-PARTY.md. No network access.
"""
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "dictionary" / "words"
DEST = ROOT / "dictionary" / "phrases"
MAX_SENSES = 6

def key_for(word):
    w = word.lower().replace("’", "'")
    letter = lambda c: c if "a" <= c <= "z" else "_"
    return letter(w[0]) + letter(w[1] if len(w) > 1 else "_")

def main():
    shards = defaultdict(list)
    for path in sorted(SOURCE.glob("*.json")):
        if path.name == "manifest.json":
            continue
        for entry in json.loads(path.read_text(encoding="utf-8")).get("entries", []):
            term = entry.get("term", "").strip()
            if " " not in term:
                continue
            shards[key_for(term.split()[0])].append({
                "term": term,
                "type": entry.get("type", ""),
                "ipa": entry.get("ipa", ""),
                "senses": entry.get("senses", [])[:MAX_SENSES],
            })
    DEST.mkdir(parents=True, exist_ok=True)
    for old in DEST.glob("*.json"):
        old.unlink()
    manifest = {"version": 1, "source": "Wiktionary via Kaikki", "license": "CC BY-SA / GFDL", "entries": 0, "shards": {}}
    for key in sorted(shards):
        entries = sorted(shards[key], key=lambda e: e["term"].casefold())
        (DEST / f"{key}.json").write_text(json.dumps({"version": 1, "source": "Wiktionary via Kaikki", "entries": entries}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        manifest["shards"][key] = len(entries)
        manifest["entries"] += len(entries)
    (DEST / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print("Phrases:", manifest["entries"], "in", len(manifest["shards"]), "shards")

if __name__ == "__main__":
    main()
