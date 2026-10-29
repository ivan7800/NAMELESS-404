"""Canvas 2D presentation smoke test with authored Kiba rooms; not real GPU verification."""
from pathlib import Path
from playwright.sync_api import sync_playwright
B=Path(__file__).resolve().parents[1]
h=(B/'dist/index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(B/'dist/style.css').read_text()+'</style>').replace('<script defer src="./bundle.js"></script>','<script>'+(B/'dist/bundle.js').read_text()+'</script>')
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
 for name,opts in [('desktop',dict(viewport={'width':1440,'height':1024})),('mobile',dict(viewport={'width':393,'height':852},is_mobile=True,has_touch=True))]:
  ctx=browser.new_context(**opts);p=ctx.new_page();errors=[]
  p.on('pageerror',lambda e:errors.append(str(e)))
  p.set_content(h);p.wait_for_function('window.__namelessDebug?.state')
  p.locator('#start').click();p.wait_for_timeout(250)
  assert p.locator('.device').evaluate('(el)=>el.classList.contains("book-mode")')
  assert p.evaluate('window.__namelessDebug.renderer()')=='canvas-fallback'
  initial=p.evaluate('''()=>{const c=document.querySelector('#top'),d=c.getContext('2d').getImageData(0,0,192,256).data;return Array.from(d.slice((80*192+120)*4,(80*192+120)*4+4));}''')
  p.screenshot(path=str(B/f'assets/v024-kiba-{name}.png'),full_page=True)
  p.keyboard.press('ArrowLeft');p.wait_for_timeout(120)
  p.screenshot(path=str(B/f'assets/v024-reception-{name}.png'),full_page=True)
  p.locator('#swap').click();p.wait_for_timeout(100)
  assert p.locator('.device').evaluate('(el)=>el.classList.contains("rpg-mode")')
  p.locator('#swap').click();p.wait_for_timeout(100)
  assert p.locator('.device').evaluate('(el)=>el.classList.contains("book-mode")')
  assert not errors,errors
  print(f'PASS {name}: escena doble, vista recibidor, RPG reversible, 0 excepciones; pixel: {initial}')
  ctx.close()
 browser.close()
