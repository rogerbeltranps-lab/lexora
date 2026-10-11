#!/usr/bin/env python3
"""Stream Kaikki's full English JSONL into compact, lazy-loaded Lexora word shards.
Source: Wiktionary through Kaikki / Wiktextract (CC BY-SA / GFDL).
The original multiword phrase dictionary is retained untouched.
"""
import argparse, json, re, sqlite3, tempfile
from collections import defaultdict
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
DEST=ROOT/"dictionary"/"words"
POS={"noun","verb","adj","adv","prep","pron","det","conj","intj","article","num","particle","phrase","proverb","prep_phrase","contraction","name"}
MAX_SENSES=8
def key_for(w):
    w=w.lower()
    def letter(c): return c if "a"<=c<="z" else "_"
    return letter(w[0])+letter(w[1] if len(w)>1 else "_")
def normalize(raw):
    if raw.get("lang_code")!="en" or raw.get("pos") not in POS:return None
    word=str(raw.get("word","")).strip()
    if not 1<=len(word)<=90 or not re.fullmatch(r"[A-Za-z][A-Za-z '\-]*",word):return None
    # Include single words AND multiword idioms, phrasal verbs, proverbs, collocations.
    senses=[]
    for sense in raw.get("senses",[]):
        tags=set(sense.get("tags",[]))
        if {"form-of","alt-of","misspelling"}&tags:continue
        gloss=next((s for s in sense.get("glosses",[]) if isinstance(s,str) and s.strip()),"")
        if not gloss:continue
        example=next((str(x.get("text",""))[:180] for x in sense.get("examples",[]) if isinstance(x,dict) and x.get("text")),"")
        senses.append({"definition":gloss[:320],"catalan":"","example":example})
        if len(senses)==MAX_SENSES:break
    if not senses:return None
    ipa=""
    for sound in raw.get("sounds",[]):
        if not isinstance(sound,dict) or not sound.get("ipa"):continue
        tags=[str(t).lower() for t in sound.get("tags",[])]
        if not ipa:ipa=sound["ipa"]
        if any("us"==t or "general-american" in t for t in tags):ipa=sound["ipa"];break
    kind={"phrase":"Idiomatic expression","proverb":"Proverb","prep_phrase":"Expression"}.get(raw["pos"],raw["pos"])
    if raw["pos"]=="verb" and " " in word:kind="Phrasal verb"
    return {"term":word,"type":kind,"ipa":ipa,"senses":senses,"source":"Wiktionary via Kaikki"}
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("source",type=Path)
    args=parser.parse_args()
    if not args.source.is_file():parser.error("Missing English JSONL export")
    DEST.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory() as temp:
        db=sqlite3.connect(str(Path(temp)/"lexora.sqlite"))
        db.execute("CREATE TABLE terms (shard TEXT, term TEXT, payload TEXT, PRIMARY KEY(shard,term))")
        accepted=0
        with args.source.open(encoding="utf8") as fp:
            for line in fp:
                try: entry=normalize(json.loads(line))
                except (ValueError,TypeError):continue
                if entry is None:continue
                k=key_for(entry["term"]);term=entry["term"].lower()
                existing=db.execute("SELECT payload FROM terms WHERE shard=? AND term=?",(k,term)).fetchone()
                if existing:
                    older=json.loads(existing[0]);seen={x["definition"] for x in older["senses"]}
                    for sense in entry["senses"]:
                        if sense["definition"] not in seen and len(older["senses"])<MAX_SENSES:
                            older["senses"].append(sense);seen.add(sense["definition"])
                    if not older["ipa"]:older["ipa"]=entry["ipa"]
                    entry=older
                else:accepted+=1
                db.execute("INSERT OR REPLACE INTO terms VALUES (?,?,?)",(k,term,json.dumps(entry,ensure_ascii=False,separators=(",",":"))))
                if accepted%10000==0:db.commit()
        db.commit()
        manifest={"version":1,"source":"Wiktionary via Kaikki","license":"CC BY-SA / GFDL","entries":accepted,"shards":{}}
        shards=[r[0] for r in db.execute("SELECT DISTINCT shard FROM terms ORDER BY shard")]
        for k in shards:
            count=0
            with (DEST/(k+".json")).open("w",encoding="utf8") as out:
                out.write('{"version":1,"source":"Wiktionary via Kaikki","entries":[')
                for row in db.execute("SELECT payload FROM terms WHERE shard=? ORDER BY term",(k,)):
                    if count:out.write(",")
                    out.write(row[0]);count+=1
                out.write("]}")
            manifest["shards"][k]=count
        db.close()
    (DEST/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf8")
    print("Imported",accepted,"terms across",len(manifest["shards"]),"shards",flush=True)
if __name__=="__main__":main()
