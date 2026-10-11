#!/usr/bin/env python3
"""Turn a downloaded Kaikki/Wiktextract English JSONL into GitHub Pages shards.

Usage:
  python3 scripts/import_kaikki.py /path/to/kaikki.org-dictionary-English-by-pos-phrase.jsonl

Source: https://kaikki.org/dictionary/English/pos-phrase/index.html
License: Wiktionary CC BY-SA / GFDL; read dictionary/LICENSE-THIRD-PARTY.md.
This script does not send user text anywhere.
"""
import argparse, json, re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "dictionary" / "wiktionary"
MAX_SENSES = 12
VALID_POS = {"phrase","verb","noun","adj","adv","intj","proverb"}
def group(word):
    ch = word[0].lower() if word else ""
    return "a-h" if ch <= "h" else "i-p" if ch <= "p" else "q-z"
def category(pos, word):
    if pos == "phrase": return "Idiomatic expression"
    if pos == "proverb": return "Idiom"
    if pos == "verb" and " " in word: return "Phrasal verb"
    return "Vocabulary"
def normalize(obj):
    word = str(obj.get("word","")).strip()
    if obj.get("lang_code") != "en" or not 2 <= len(word) <= 100 or not re.match(r"^[A-Za-z]",word):
        return None
    if obj.get("pos") not in VALID_POS: return None
    # Avoid inflected form duplicates and very noisy extractions.
    if " " not in word and obj.get("pos") in {"phrase", "proverb"}: return None
    senses=[]
    for sense in obj.get("senses",[]):
        if "form-of" in sense.get("tags",[]) or "alt-of" in sense.get("tags",[]): continue
        gloss = next((x.strip() for x in sense.get("glosses",[]) if isinstance(x,str) and x.strip()), "")
        if not gloss: continue
        if gloss.lower().startswith(("alternative form of ", "misspelling of ", "obsolete form of ")):continue
        examples=sense.get("examples",[])
        example=next((e.get("text","")[:220] for e in examples if isinstance(e,dict) and e.get("text")), "")
        senses.append({"definition":gloss[:400], "catalan":"", "example":example})
        if len(senses)>=MAX_SENSES: break
    if not senses: return None
    ipa=""
    for sound in obj.get("sounds",[]):
        if not isinstance(sound,dict) or not sound.get("ipa"): continue
        tags=sound.get("tags",[])
        if not ipa or any("US" in str(t) or "General-American" in str(t) for t in tags):ipa=sound["ipa"]
        if any("US" in str(t) or "General-American" in str(t) for t in tags):break
    return {"term":word, "type":category(obj["pos"],word), "ipa":ipa, "senses":senses, "source":"Wiktionary via Kaikki"}
def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("jsonl",type=Path,help="Kaikki JSON Lines file already downloaded")
    ap.add_argument("--limit",type=int,default=0,help="optional entry limit for trial import")
    args=ap.parse_args()
    if not args.jsonl.is_file(): ap.error("Input JSONL not found")
    records=defaultdict(dict)
    with args.jsonl.open(encoding="utf-8") as fp:
        for line in fp:
            try: raw=json.loads(line)
            except json.JSONDecodeError:continue
            item=normalize(raw)
            if not item: continue
            key=item["term"].casefold()
            bucket=records[group(item["term"])]
            if key in bucket:
                existing=bucket[key]
                glosses={x["definition"] for x in existing["senses"]}
                existing["senses"].extend(x for x in item["senses"] if x["definition"] not in glosses)
                existing["senses"]=existing["senses"][:MAX_SENSES]
                if not existing["ipa"]:existing["ipa"]=item["ipa"]
            else:bucket[key]=item
            if args.limit and sum(map(len,records.values()))>=args.limit:break
    OUTPUT.mkdir(parents=True,exist_ok=True)
    manifest={"version":1,"source":"Wiktionary via Kaikki","license":"CC BY-SA / GFDL","buckets":{}}
    for bucket in ["a-h","i-p","q-z"]:
        entries=sorted(records[bucket].values(),key=lambda r:r["term"].casefold())
        (OUTPUT / f"{bucket}.json").write_text(json.dumps({"version":1,"source":"Wiktionary via Kaikki","entries":entries},ensure_ascii=False,separators=(",",":")),encoding="utf-8")
        manifest["buckets"][bucket]=len(entries)
    (OUTPUT/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
    print("Imported:",manifest["buckets"],"total:",sum(manifest["buckets"].values()))
if __name__=="__main__":main()
