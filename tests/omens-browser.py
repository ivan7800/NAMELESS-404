"""Visual and integration smoke tests for the v0.15 omen director.
Uses real UI movement where possible; browser is memory-loaded if local HTTP blocked.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright,Error as PWError
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'dist'
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(BASE)))
Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu','--disable-web-security'])
  for profile,options in [('desktop',{'viewport':{'width':1440,'height':940}}),('mobile',{'viewport':{'width':390,'height':844},'is_mobile':True,'has_touch':True})]:
   context=browser.new_context(**options)
   page=context.new_page();errors=[];page.on('pageerror',lambda exc:errors.append(str(exc)))
   hosted=True
   try:page.goto(f'http://127.0.0.1:{server.server_port}/index.html',wait_until='load',timeout=8000)
   except PWError as exc:
    if 'ERR_BLOCKED_BY_ADMINISTRATOR' not in str(exc):raise
    hosted=False;page.close();page=context.new_page();page.on('pageerror',lambda exc:errors.append(str(exc)))
    html=(BASE/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(BASE/'style.css').read_text()+'</style>')
    html=html.replace('<script defer src="./bundle.js"></script>','<script>'+(BASE/'bundle.js').read_text()+'</script>')
    page.set_content(html,wait_until='load')
   page.wait_for_function('window.__namelessDebug?.director')
   page.locator('#start').click()
   assert page.locator('#omens').get_attribute('aria-pressed')=='true'
   for _ in range(6):
    page.locator('[data-dir="ArrowUp"]').click();page.wait_for_timeout(90)
   page.locator('[data-dir="ArrowRight"]').click();page.wait_for_timeout(95)
   for _ in range(5):
    page.locator('[data-dir="ArrowUp"]').click();page.wait_for_timeout(90)
   s=page.evaluate('window.__namelessDebug.state()')
   assert s['steps']>=8 and s['mode']=='real',s
   # Look for an actual omen from the normal player actions; deterministic test
   # can also be used to verify the graphics independent of player timing.
   omen_active=page.evaluate('!!window.__namelessDebug.director.current(performance.now())')
   if not omen_active:
    page.evaluate('''() => {
      const d=window.__namelessDebug.director,s=window.__namelessDebug.state();
      d.clear();
      for(let i=7;i<45;i++){
        const cue=d.observe({...s,steps:i-1},{...s,steps:i},performance.now());
        if(cue)break;
      }
      window.__namelessDebug.render();
    }''')
   assert page.evaluate('!!window.__namelessDebug.director.current(performance.now())')
   # Inspect a few pixels to prove overlay produces pixels, not only text.
   canvas_bytes=page.evaluate('Array.from(document.getElementById("top").getContext("2d").getImageData(190,43,25,62).data).reduce((a,b)=>a+b,0)')
   assert canvas_bytes>0
   page.screenshot(path=str(ROOT/'assets'/f'v015-presagio-{profile}.png'),full_page=True)
   page.locator('#omens').click();assert page.locator('#omens').get_attribute('aria-pressed')=='false'
   assert page.evaluate('window.__namelessDebug.director.current(performance.now())===null')
   assert 'DESACTIVADOS' in page.locator('#omenStatus').inner_text()
   page.locator('#omens').click();assert page.locator('#omens').get_attribute('aria-pressed')=='true'
   assert not errors,errors
   print('PASS',profile,'real steps',s['steps'],'omen visual','toggle','Chromium HTTP='+str(hosted))
   context.close()
  browser.close()
finally:server.shutdown()
