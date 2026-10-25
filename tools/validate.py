"""Validate lessons/*.json against SCHEMA.md.  usage: python validate.py [ID ...]"""
import json, re, sys, pathlib

HERE = pathlib.Path(__file__).parent
CATS = {"lookup", "dynamic", "shape", "text", "math", "logic", "date"}
TYPES = {"title", "concept", "syntax", "sheet", "flow", "compare", "tips", "quiz", "recap"}


def wlen(s):
    """width in full-width chars: ascii counts 0.5"""
    return sum(0.5 if ord(c) < 128 else 1 for c in s)


def col2n(c):
    n = 0
    for ch in c:
        n = n * 26 + ord(ch) - 64
    return n


def ref(r):
    m = re.fullmatch(r"([A-Z]+)(\d+)", r)
    if not m:
        raise ValueError(r)
    return col2n(m.group(1)) - 1, int(m.group(2)) - 1


def rng(s):
    a, _, b = s.partition(":")
    c0, r0 = ref(a)
    c1, r1 = ref(b) if b else (c0, r0)
    return min(c0, c1), min(r0, r1), max(c0, c1), max(r0, r1)


def check(path):
    errs, warn = [], []
    d = json.loads(path.read_text(encoding="utf-8"))
    E = errs.append
    for k in ["id", "cat", "emoji", "zh", "en", "desc", "descEn", "syntax", "keywords", "level", "version", "slides"]:
        if k not in d:
            E(f"missing {k}")
    if d.get("id") != path.stem:
        E("id != filename")
    if d.get("cat") not in CATS:
        E(f"bad cat {d.get('cat')}")
    sl = d.get("slides", [])
    if not 6 <= len(sl) <= 10:
        warn.append(f"{len(sl)} slides")
    if sl and sl[0].get("type") != "title":
        E("first slide not title")
    total = 0
    for i, s in enumerate(sl):
        t = s.get("type")
        P = f"slide{i+1}({t})"
        if t not in TYPES:
            E(f"{P} bad type")
            continue
        say = s.get("say") or []
        if not 2 <= len(say) <= 8:
            E(f"{P} say count {len(say)}")
        for x in say:
            total += wlen(x)
            if wlen(x) > 27:
                E(f"{P} caption too long ({wlen(x)}): {x}")
            if re.search(r"[A-Z]+\d+:[A-Z]+\d+", x):
                warn.append(f"{P} colon range in say: {x}")
        n = len(say)
        if t == "sheet":
            data = s.get("data") or []
            W = len(data[0]) if data else 0
            if any(len(r) != W for r in data):
                E(f"{P} ragged data")
            if W > 9 or len(data) > 11:
                E(f"{P} grid too big {W}x{len(data)}")
            try:
                c, r = ref(s["cell"])
                res = s["result"]
                for dr, row in enumerate(res):
                    for dc, v in enumerate(row):
                        rr, cc = r + dr, c + dc
                        if rr >= len(data) or cc >= W:
                            E(f"{P} result spills outside grid at r{rr+1}c{cc+1}")
                        elif data[rr][cc] != "":
                            E(f"{P} result spill blocked at r{rr+1}c{cc+1} ({data[rr][cc]})")
                for st in s.get("steps", []):
                    c0, r0, c1, r1 = rng(st["range"])
                    if c1 >= W or r1 >= len(data):
                        E(f"{P} step range outside grid {st['range']}")
                    if st.get("at", 0) >= n:
                        E(f"{P} step at {st.get('at')} >= {n}")
                if s.get("resultAt", 0) >= n:
                    E(f"{P} resultAt >= {n}")
            except Exception as e:
                E(f"{P} {e!r}")
        if t == "quiz":
            if len(s.get("options", [])) != 4 or s.get("answer") not in range(4):
                E(f"{P} quiz options/answer")
    if not 300 <= total <= 950:
        warn.append(f"total narration {total:.0f} chars")
    return errs, warn


if __name__ == "__main__":
    ids = sys.argv[1:]
    files = [HERE / "lessons" / f"{i}.json" for i in ids] if ids else sorted((HERE / "lessons").glob("*.json"))
    bad = 0
    for f in files:
        try:
            e, w = check(f)
        except Exception as ex:
            e, w = [f"JSON error {ex}"], []
        if e or w:
            print(f"== {f.stem}")
            for x in e:
                print("  ERR ", x)
            for x in w:
                print("  warn", x)
        bad += bool(e)
    print(f"{len(files)} files, {bad} with errors")
