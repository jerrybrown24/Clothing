"""Assemble the report from template.html + results.json (run forecast.py and pnl.py first).
index.html                           -> artifact body (published page)
Circle_Mall_Lease_Feasibility.html   -> standalone file that opens in any browser"""
import json
R = json.load(open("results.json"))
body = open("template.html").read().replace("/*DATA*/null", json.dumps(R, separators=(",", ":")))
open("index.html", "w").write(body)
open("Circle_Mall_Lease_Feasibility.html", "w").write(
    '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    '<style>body{margin:0}[hidden]{display:none!important}img{max-width:100%}</style>\n'
    '</head>\n<body>\n' + body + '\n</body>\n</html>\n')
