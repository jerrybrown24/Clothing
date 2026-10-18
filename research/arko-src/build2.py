import glob
sh=open('shell.html').read(); css=open('style.css').read()
js="\n".join(open(f).read() for f in sorted(glob.glob("js/*.js")))
import sys,os
DLDJSON=sys.argv[1] if len(sys.argv)>1 else None
if DLDJSON: sh=sh.replace('id="dld">null<','id="dld">'+open(DLDJSON).read().replace("</","<\\/")+'<')
page=sh.replace("/*CSS*/",css).replace("/*JS*/",js.replace("</script","<\\/script"))
open("page.html","w").write(page)
s=page.replace('<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n','')
s=s.replace('</style></head>\n<body data-view="home">','</style>\n').replace('</script></body></html>','</script>')
s=s.replace('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n','')
assert '<html' not in s and '<body' not in s
open('artifact.html','w').write(s); print(len(s))
