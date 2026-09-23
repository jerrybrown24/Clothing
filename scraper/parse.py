import json,re,glob,os,html
SP=os.path.dirname(os.path.abspath(__file__))
TR='/root/.claude/projects/-home-user-Clothing/bc5bf044-e1f7-5f0a-bd70-0237bac7b1b8/tool-results/'
OUT=SP+'/parsed.json'
def txt(s):
    s=re.sub(r'<(li|p|br)[^>]*>',' ',s); s=re.sub(r'<[^>]+>','',s)
    return re.sub(r'\s+',' ',html.unescape(s)).strip()
def parse(h,meta):
    r={'url':meta.get('url') or meta.get('sourceURL'),'status':meta.get('statusCode')}
    r['title']=html.unescape(meta.get('og:title') or meta.get('ogTitle') or '')
    m=re.search(r'"productDetailImpression".*?"products":\[(\{.*?\})\]',h,re.S)
    if m:
        try:
            dl=json.loads(m.group(1)); r['style']=dl.get('id'); r['price']=dl.get('price'); r['stock']=dl.get('dimension8'); r['dl_cat']=dl.get('category')
        except Exception: pass
    m=re.search(r'<div class="product attribute description">.*?<div class="value">(.*?)</div>\s*</div>',h,re.S)
    r['desc']=txt(m.group(1)) if m else ''
    m=re.search(r'<ul class="additional-attributes features-list">(.*?)</ul>',h,re.S)
    r['features']=[txt(x) for x in re.findall(r'<li[^>]*>(.*?)</li>',m.group(1),re.S)] if m else []
    r['features']=[f for f in r['features'] if f]
    r['imgs']=sorted(set(re.findall(r'/media/catalog/product/[^"\'\s)]*?/([a-z0-9_\-]+)\.(?:jpg|png|webp)',h)))[:40]
    r['unavailable']=('This product is currently unavailable' in h) or ('class="stock unavailable"' in h)
    return r
def run():
    done=json.load(open(OUT)) if os.path.exists(OUT) else {}
    seen=set(v.get('_file') for v in done.values())
    n=0
    for f in sorted(glob.glob(TR+'mcp-Firecrawl-firecrawl_scrape-*.txt')):
        b=os.path.basename(f)
        if b in seen: continue
        try: d=json.loads(open(f).read())
        except Exception: continue
        if 'rawHtml' not in d or '<urlset' in d['rawHtml'][:500] or '<sitemapindex' in d['rawHtml'][:500]: continue
        r=parse(d['rawHtml'],d.get('metadata',{})); r['_file']=b
        done[r["url"]]=r; n+=1
        os.remove(f) if (r.get("price") or r["unavailable"]) else None
    json.dump(done,open(OUT,'w'))
    return done,n
if __name__=='__main__':
    done,n=run()
    prods=json.load(open(SP+'/products.json'))
    import openpyxl
    try: old=set(json.load(open(SP+'/old_urls.json')))
    except Exception:
        wb=openpyxl.load_workbook('/root/.claude/uploads/bc5bf044-e1f7-5f0a-bd70-0237bac7b1b8/47dfa964-Trespass_Catalog.xlsx',read_only=True)
        old=[r[9] for r in wb['Trespass Catalog'].iter_rows(min_row=2,values_only=True)]; json.dump(old,open(SP+'/old_urls.json','w')); old=set(old)
    todo=[p['url'] for p in prods if p['url'] not in done and p['url'] not in old]+[p['url'] for p in prods if p['url'] not in done and p['url'] in old]
    print('new',n,'total',len(done),'remaining',len(todo))
    import sys
    if len(sys.argv)>1 and sys.argv[1]=='show':
        for v in list(done.values())[-3:]: print(json.dumps({k:(v[k][:200] if isinstance(v[k],str) else v[k]) for k in v},ensure_ascii=False)[:1500])
    if len(sys.argv)>2: print('\n'.join(todo[:int(sys.argv[2])]))
