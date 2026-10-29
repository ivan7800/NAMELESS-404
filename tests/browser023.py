"""Prueba de integración visual v0.23: consola modo libro y RPG independiente.
Chromium usa Canvas2D porque el sandbox no ofrece GPU real. No valida WebGL2.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
B=Path(__file__).resolve().parents[1]
html=(B/'dist/index.html').read_text()
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+(B/'dist/style.css').read_text()+'</style>')
html=html.replace('<script defer src="./bundle.js"></script>','<script>'+(B/'dist/bundle.js').read_text()+'</script>')
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
 for name,context_options in [('desktop',dict(viewport={'width':1440,'height':1024})),('mobile',dict(viewport={'width':393,'height':852},is_mobile=True,has_touch=True))]:
  ctx=browser.new_context(**context_options);p=ctx.new_page();errors=[]
  p.on('pageerror',lambda e:errors.append(str(e)))
  p.set_content(html)
  p.wait_for_function('window.__namelessDebug && window.__namelessDebug.state')
  p.locator('#start').click()
  p.wait_for_timeout(150)
  assert p.locator('.device').evaluate('(x)=>x.classList.contains("book-mode")'), 'real world must be book-mode'
  assert p.locator('#top').evaluate('(x)=>[x.width,x.height]')==[192,256]
  assert p.locator('#bottom').evaluate('(x)=>[x.width,x.height]')==[192,256]
  assert p.locator('.device').evaluate('(x)=>getComputedStyle(x).display')=='grid'
  pixels=p.evaluate('''()=>{
   const a=document.getElementById('top'),b=document.getElementById('bottom');
   const ca=a.getContext('2d').getImageData(80,120,1,1).data, cb=b.getContext('2d').getImageData(80,120,1,1).data;
   return [Array.from(ca),Array.from(cb)];
  }''')
  assert pixels[0][3]>0 and pixels[1][3]>0,pixels
  assert pixels[0]!=pixels[1],'both screens should show different halves of one scene'
  (B/'assets').mkdir(exist_ok=True)
  p.screenshot(path=str(B/f'assets/v023-book-{name}.png'),full_page=True)
  p.locator('#swap').click()
  assert p.locator('.device').evaluate('(x)=>x.classList.contains("rpg-mode")')
  assert p.locator('#top').evaluate('(x)=>[x.width,x.height]')==[256,192]
  assert p.locator('#bottom').evaluate('(x)=>[x.width,x.height]')==[256,192]
  p.screenshot(path=str(B/f'assets/v023-rpg-{name}.png'),full_page=True)
  p.locator('#swap').click()
  assert p.locator('.device').evaluate('(x)=>x.classList.contains("book-mode")')
  p.keyboard.press('ArrowUp');p.wait_for_timeout(70)
  assert not errors,errors
  print(f'PASS {name}: book mode 192×256 x2, RPG horizontal, textured renderer, keyboard, no JS errors')
  ctx.close()
 browser.close()
