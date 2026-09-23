import json,re,os,sys,openpyxl
from openpyxl.styles import Font,PatternFill,Alignment
SP=os.path.dirname(os.path.abspath(__file__))
prods=json.load(open(SP+'/products.json')); done=json.load(open(SP+'/parsed.json'))
wb0=openpyxl.load_workbook('/root/.claude/uploads/bc5bf044-e1f7-5f0a-bd70-0237bac7b1b8/47dfa964-Trespass_Catalog.xlsx')
old={r[9]:r for r in wb0['Trespass Catalog'].iter_rows(min_row=2,values_only=True)}
RATE=4
def dept(t,u):
    s=(t+' '+u).lower()
    for k,v in [('trespaws','Pets'),(' dog ','Pets'),('dog ','Pets'),('baby','Kids'),('babies','Kids'),('toddler','Kids'),('girls','Girls'),('boys','Boys'),('kids','Kids'),('junior','Kids'),('womens','Women'),("women's",'Women'),('ladies','Women'),('mens','Men'),("men's",'Men'),('unisex','Unisex'),('adults','Unisex'),('adult','Unisex')]:
        if re.search(r'\b'+re.escape(k.strip())+r'\b',s): return v
    return 'Accessories'
CATS=[('Ski Jackets',r'ski jacket|snowboard jacket'),('Ski Trousers',r'ski (trousers|pants)|salopettes|ski bib|snow (trousers|pants)'),('Ski Suits',r'ski suit|snowsuit|all in one|onesie'),
('Waterproof Jackets',r'waterproof jacket|rain jacket|packaway jacket|shell jacket'),('Padded Jackets',r'padded|puffer|down jacket|insulated jacket|quilted'),('Softshell Jackets',r'softshell jacket'),('Fleece',r'fleece'),('Parkas',r'parka'),('Gilets',r'gilet|bodywarmer|vest\b'),('Jackets',r'jacket|coat\b|anorak|cagoule'),
('Base Layers',r'base ?layer|thermal'),('Hoodies & Sweatshirts',r'hoodie|sweatshirt|sweater|jumper|pullover'),('T-Shirts & Tops',r't-shirt|tshirt|\btop\b|polo|vest top|tank'),('Shirts',r'shirt'),('Dresses & Skirts',r'dress|skirt|skort'),
('Shorts',r'shorts'),('Leggings',r'legging|tights'),('Trousers',r'trousers|pants|joggers|jeans'),('Swimwear',r'swim|bikini|board ?shorts|rash vest|wetsuit|tankini'),
('Footwear',r'boots?\b|shoes?|trainers|sandals|wellies|wellington|slippers|flip ?flops|clogs'),('Socks',r'socks?'),('Hats',r'hat\b|beanie|cap\b|balaclava|snood|headband'),('Gloves',r'gloves?|mitts|mittens'),('Scarves & Neckwear',r'scarf|neck'),
('Rucksacks & Bags',r'rucksack|backpack|daypack|bag\b|bumbag|holdall|duffle|case\b|pouch|wallet'),('Sleeping Bags',r'sleeping bag|liner'),('Tents',r'tent'),('Camping',r'chair|mat\b|pillow|stove|lantern|torch|cutlery|cooking|table|airbed|camping'),
('Bottles & Flasks',r'flask|bottle|mug|cup'),('Umbrellas & Ponchos',r'umbrella|poncho'),('Helmets',r'helmet'),('Goggles & Eyewear',r'goggle|sunglasses|glasses'),('Towels',r'towel'),('Pet Accessories',r'dog|pet|lead\b|collar|harness'),('Toys & Beach',r'surfboard|bodyboard|toy|ball|kite|bucket|spade|float|ring')]
def cat(t):
    s=t.lower()
    for c,p in CATS:
        if re.search(p,s): return c
    return 'Other Accessories'
SUB=[('Waterproof',r'waterproof'),('Water Resistant',r'water resistant|water repellent'),('Softshell',r'softshell'),('Insulated',r'padded|insulated|down\b|thermal'),('Quick Dry',r'quick dry'),('Packaway',r'packaway'),('Walking',r'walking|hiking|trekking'),('Ski',r'\bski\b|snow'),('Casual',r'casual'),('Active',r'active|sports?|running')]
def sub(t):
    s=t.lower(); return next((c for c,p in SUB if re.search(p,s)),None)
def sku(v):
    st=(v.get('style') or '').lower()
    if st:
        for i in v.get('imgs',[]):
            m=re.search(re.escape(st)+r'-([a-z0-9]{3})',i)
            if m: return (st+'-'+m.group(1)).upper()
        return st.upper()
    return None
rows=[];src={'live':0,'sample':0,'missing':0}
for p in prods:
    u=p['url']; v=done.get(u)
    if v and v.get('status')==200 and v.get('title'):
        t=v['title']; pr=v.get('price') or None
        desc=v['desc']
        rows.append([t,dept(t,u),cat(t),sub(t),sku(v),desc,' | '.join(v['features']) or None,pr,(pr*RATE if pr else None),u]); src['live']+=1
    elif u in old:
        r=list(old[u]); rows.append(r); src['sample']+=1
    else: src['missing']+=1
wb=openpyxl.Workbook(); ns=wb.active; ns.title='0. Notes'
live=src['live']; nop=sum(1 for r in rows if not r[7])
notes=['Trespass Catalog - trespass.com/row/',None,
f"Product list: all {len(prods)} product URLs in the site's ROW sitemap (trespass.com/sitemap/row/sitemap.xml).",
f"Rows in this file: {len(rows)} ({src['live']} scraped live from product pages; {src['sample']} carried over from the earlier partial sample; {src['missing']} not yet scraped).",
None,'Scraped via Firecrawl (rate-limited to ~10 pages/minute). Fields taken from each product page:',
'  Product Title = page title; Description = Description tab; Feature = Features tab (items joined with " | ");',
'  SKU = Trespass style code from the page (e.g. MABTRAD20002) plus the colour code from the main image filename where present (e.g. -BLK).',
'  Price (EUR) = the product price in the page data layer (ROW store is priced in EUR).',
'Department / Category / Sub-Category are inferred from keywords in the product title, not Trespass\'s own taxonomy.',
None,'Price (AED, approx) uses an approximate EUR->AED rate of 4 - not a live/verified rate.',
None,f'{nop} of {len(rows)} products had no live price (out of stock / currently unavailable) - price columns are blank for those, not zero.']
for n in notes: ns.append([n])
ns['A1'].font=Font(bold=True,size=13); ns.column_dimensions['A'].width=120
ws=wb.create_sheet('Trespass Catalog')
ws.append(['Product Title','Department','Category','Sub-Category','SKU','Description','Feature','Price (EUR)','Price (AED, approx)','Product URL'])
for r in rows: ws.append(r)
for c in ws[1]: c.font=Font(bold=True,color='FFFFFF'); c.fill=PatternFill('solid',fgColor='1C2B4A')
for col,w in zip('ABCDEFGHIJ',[45,13,20,16,18,80,60,11,14,55]): ws.column_dimensions[col].width=w
ws.freeze_panes='A2'; ws.auto_filter.ref=ws.dimensions
out=sys.argv[1] if len(sys.argv)>1 else '/home/user/Clothing/Trespass_Catalog.xlsx'
wb.save(out); print(src, 'no price',nop, out)
