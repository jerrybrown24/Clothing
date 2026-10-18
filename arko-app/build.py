"""Build public/index.html from src/. Usage: python3 build.py"""
import glob
sh = open('src/shell.html').read(); css = open('src/style.css').read()
js = "\n".join(open(f).read() for f in sorted(glob.glob('src/js/*.js')))
page = sh.replace('/*CSS*/', css).replace('/*JS*/', js.replace('</script', '<\\/script'))
open('public/index.html', 'w').write(page)
print(len(page), 'bytes')
