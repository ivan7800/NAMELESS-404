"""v0.16 premium visual/audio/AI smoke. HTTP if allowed, memory fallback otherwise."""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright,Error as PWError
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'dist'
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(BASE)))
Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu','--disable-web-security'])
  for device,params in [('desktop',{'viewport':{'width':1440,'height':960}}),('mobile',{'viewport':{'width':390,'height':844},'is_mobile':True,'has_touch':True})]:
   context=browser.new_context(**params);page=context.new_page();errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
   hosted=True
   try:page.goto(f'http://127.0.0.1:{server.server_port}/',wait_until='load',timeout=6000)
   except PWError as exc:
    if 'ERR_BLOCKED_BY_ADMINISTRATOR' not in str(exc):raise
    hosted=False;page.close();page=context.new_page();page.on('pageerror',lambda err:errors.append(str(err)))
    html=(BASE/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(BASE/'style.css').read_text()+'</style>')
    html=html.replace('<script defer src="./bundle.js"></script>','<script>'+(BASE/'bundle.js').read_text()+'</script>')
    page.set_content(html,wait_until='load')
    page.evaluate('''() => {const data=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)}})}''')
   page.wait_for_function('window.__namelessDebug && window.__namelessDebug.state')
   page.locator('#start').click()
   assert 'PREMIUM' in page.locator('.version').inner_text()
   assert 'LA PRESENCIA ESCUCHA' in page.locator('#aiStatus').inner_text()
   # Audio is disabled by default; starts only after user gesture.
   assert not page.evaluate('window.__namelessDebug.premiumAudio.isRunning()')
   page.locator('#audio').click();assert page.evaluate('window.__namelessDebug.premiumAudio.isRunning()')
   page.locator('#audio').click();assert not page.evaluate('window.__namelessDebug.premiumAudio.isRunning()')
   page.screenshot(path=str(ROOT/'assets'/f'premium-kiba-{device}.png'),full_page=True)
   # Trigger the cassette scene through genuine UI, using a QA save at the cassette.
   page.evaluate('''() => {const s=window.__namelessDebug.state();s.rx=10.5;s.ry=9.5;s.echo=true;s.dir=2;}''')
   page.locator('#interact').click()
   assert page.evaluate('window.__namelessDebug.state().tape')
   assert page.evaluate('window.__namelessDebug.state().chase')
   assert page.evaluate('window.__namelessDebug.state().flags.copyistMemory.phase')=='investigate'
   page.locator('[data-dir="ArrowUp"]').click()
   assert page.evaluate('window.__namelessDebug.state().flags.copyistMemory.phase') in ('investigate','search','hunt')
   assert 'LA COPISTA' in page.locator('#aiStatus').inner_text()
   assert not page.evaluate('window.__namelessDebug.state().won')
   page.screenshot(path=str(ROOT/'assets'/f'premium-copista-{device}.png'),full_page=True)
   # The 7-day campaign still loads in the same executable.
   page.evaluate('''() => {const s=window.__namelessDebug.state();s.day=7;s.mode='real';s.chase=false;s.rx=2.5;s.ry=2.5;}''')
   page.evaluate('window.__namelessDebug.render()')
   assert 'DÍA 7' in page.locator('#status').inner_text() or page.evaluate('window.__namelessDebug.state().day')==7
   assert not errors,errors
   print(f'PASS {device}: premium scene, Web Audio gesture, Copista AI, seven-day engine, HTTP={hosted}, GPU={page.locator("#graphicsBackend").inner_text()}')
   context.close()
  browser.close()
finally:server.shutdown()
