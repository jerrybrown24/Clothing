"""Build the customer page from src/.
python3 build.py            -> public/index.html (hosted app; three.js served from /vendor)
python3 build.py artifact   -> artifact.html (preview page; three.js from cdnjs, DLD data baked in)"""
import glob, json, sys
sh = open('src/shell.html').read(); css = open('src/style.css').read()
js = "\n".join(open(f).read() for f in sorted(glob.glob('src/js/*.js'))).replace('</script', '<\\/script')
art = len(sys.argv) > 1 and sys.argv[1] == 'artifact'
three = ('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>' if art else '<script src="/vendor/three.min.js"></script>')
page = sh.replace('/*CSS*/', css).replace('/*JS*/', js).replace('<!--THREE-->', three)
if art:
    d = json.dumps(json.load(open('data/dld-area-stats.json')), separators=(',', ':')).replace('<', '\\u003c')
    page = page.replace('id="dld">null<', 'id="dld">' + d + '<')
    head = page[page.index('<title>'):page.index('</head>')]
    body = page[page.index('<body data-view="start">') + len('<body data-view="start">'):page.index('</body>')]
    page = head + '\n<script>document.body.dataset.view="start"</script>' + body
    open('artifact.html', 'w').write(page)
else:
    open('public/index.html', 'w').write(page)
print(len(page), 'bytes')
