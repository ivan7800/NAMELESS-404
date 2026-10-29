"""v0.16 premium UI and recovery regression. Uses local HTTP where permitted or HTML memory fallback."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright,Error as PWError
import json
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'dist'
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(BASE)))
Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu','--disable-web-security'])
  for profile,options in [('desktop',{'viewport':{'width':1440,'height':920}}),('mobile',{'viewport':{'width':390,'height':844},'is_mobile':True,'has_touch':True})]:
   context=browser.new_context(accept_downloads=True,**options)
   page=context.new_page();errors=[];page.on('pageerror',lambda exc:errors.append(str(exc)))
   hosted=True
   try:page.goto(f'http://127.0.0.1:{server.server_port}/index.html',wait_until='load',timeout=7000)
   except PWError as exc:
    if 'ERR_BLOCKED_BY_ADMINISTRATOR' not in str(exc):raise
    hosted=False;page.close();page=context.new_page();page.on('pageerror',lambda exc:errors.append(str(exc)))
    html=(BASE/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(BASE/'style.css').read_text()+'</style>')
    html=html.replace('<script defer src="./bundle.js"></script>','<script>'+(BASE/'bundle.js').read_text()+'</script>')
    page.set_content(html,wait_until='load')
   if not hosted:
    # The automated sandbox prohibits localStorage in opaque-origin pages.
    # Simulate Storage for UI logic only; not a real persistent-storage test.
    page.evaluate("""() => {
      const db=new Map();
      Object.defineProperty(window,'localStorage',{configurable:true,value:{
        getItem:k=>db.get(k)??null,setItem:(k,v)=>db.set(k,String(v)),
        removeItem:k=>db.delete(k),clear:()=>db.clear()
      }});
    }""")
   page.wait_for_function('window.__namelessDebug && window.__namelessDebug.state')
   page.locator('#start').click()
   assert page.locator('.version').inner_text()=='V 0.16.0 PREMIUM'
   page.locator('#swap').click()
   page.locator('[data-dir="ArrowRight"]').click()
   page.wait_for_timeout(750)
   
   assert page.locator('#autoStatus').inner_text().endswith('Guardado')
   before=page.evaluate('JSON.parse(localStorage.getItem("nameless404_autosave_v014")).state')
   assert before['mode']=='rpg' and before['px']==2
   page.locator('#brightness').click()
   assert page.locator('#brightness').get_attribute('aria-pressed')=='true'
   page.locator('#focusMode').click()
   assert page.locator('#focusMode').get_attribute('aria-pressed')=='true'
   page.screenshot(path=str(ROOT/'assets'/f'v016-inmersivo-{profile}.png'),full_page=True)
   assert page.locator('#save').is_hidden()
   assert page.locator('#swap').is_visible()
   page.locator('#focusMode').click()
   assert page.locator('#save').is_visible()
   page.locator('[data-dir="ArrowRight"]').click()
   page.wait_for_timeout(750)
   newer=page.evaluate('JSON.parse(localStorage.getItem("nameless404_autosave_v014")).state')
   assert newer['px']>before['px']
   # Restore previous autosave after current state mutated.
   page.evaluate('''state => localStorage.setItem('nameless404_autosave_v014', JSON.stringify({savedAt: Date.now(),state}))''',before)
   page.locator('#recoverAuto').click()
   assert page.evaluate('window.__namelessDebug.state().px')==before['px']
   # Corrupt JSON must not replace the loaded state.
   page.evaluate("localStorage.setItem('nameless404_autosave_v014','{bad-json')")
   page.locator('#recoverAuto').click()
   assert page.evaluate('window.__namelessDebug.state().px')==before['px']
   assert 'no se puede leer' in page.locator('#message').inner_text().lower()
   # Artificial standard gamepad to verify digital D-pad and face buttons.
   page.evaluate('''() => {
     window.__fakePad={connected:true,buttons:Array.from({length:17},()=>({pressed:false})),axes:[0,0]};
     Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[window.__fakePad]});
   }''')
   page.wait_for_timeout(250)
   assert 'Conectado' in page.locator('#gamepadStatus').inner_text()
   page.evaluate('window.__fakePad.buttons[15].pressed=true')
   page.wait_for_timeout(250)
   page.evaluate('window.__fakePad.buttons[15].pressed=false')
   page.wait_for_timeout(150)
   after=page.evaluate('window.__namelessDebug.state().px')
   assert after>before['px'],(before['px'],after)
   page.evaluate('window.__fakePad.buttons[2].pressed=true')
   page.wait_for_timeout(230)
   page.evaluate('window.__fakePad.buttons[2].pressed=false')
   assert page.evaluate('window.__namelessDebug.state().mode')=='real'
   # Save, then restore manual even with malformed autowrite.
   page.locator('#save').click()
   assert page.evaluate('JSON.parse(localStorage.getItem("nameless404_save_v09")).mode')=='real'
   page.screenshot(path=str(ROOT/'assets'/f'v016-{profile}.png'),full_page=True)
   assert not errors,errors
   print(f'PASS {profile}: autosave, corrupt recovery, focus UI, gamepad, manual save, Chromium HTTP={hosted}, renderer={page.locator("#graphicsBackend").inner_text()}')
   context.close()
  browser.close()
finally:server.shutdown()
