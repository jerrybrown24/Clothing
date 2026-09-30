"""Assemble index.html from template.html + results.json (run forecast.py and pnl.py first)."""
import json
R = json.load(open("results.json"))
open("index.html", "w").write(open("template.html").read().replace("/*DATA*/null", json.dumps(R, separators=(",", ":"))))
