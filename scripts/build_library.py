"""Write library/books.json from the EPUB files in library/, for Lexora's class library.

Each book's id changes when its file changes, so laptops that already downloaded
an older copy fetch the new one. The title comes from the EPUB's metadata.
Usage: python3 scripts/build_library.py
"""
import hashlib
import json
import re
import zipfile
from pathlib import Path

LIBRARY = Path(__file__).resolve().parent.parent / "library"


def title_of(path):
    try:
        with zipfile.ZipFile(path) as book:
            container = book.read("META-INF/container.xml").decode("utf-8", "replace")
            opf = re.search(r'full-path="([^"]+)"', container).group(1)
            meta = book.read(opf).decode("utf-8", "replace")
            match = re.search(r"<dc:title[^>]*>(.*?)</dc:title>", meta, re.S)
            if match:
                title = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", match.group(1))).strip()
                if title:
                    return title
    except (KeyError, AttributeError, zipfile.BadZipFile):
        pass
    return re.sub(r"[_-]+", " ", path.stem).strip()


def main():
    books = []
    for path in sorted(LIBRARY.glob("*.epub"), key=lambda p: p.name.lower()):
        digest = hashlib.sha1(path.read_bytes()).hexdigest()[:10]
        slug = re.sub(r"[^a-z0-9]+", "-", path.stem.lower()).strip("-") or "book"
        books.append({"id": f"{slug}-{digest}", "title": title_of(path), "file": path.name})
    books.sort(key=lambda b: b["title"].lower())
    (LIBRARY / "books.json").write_text(json.dumps(books, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(books)} books in the class library")


if __name__ == "__main__":
    main()
