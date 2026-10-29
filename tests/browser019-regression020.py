"""NAMELESS 404 v0.19: Chromium E2E de arquitectura y render Canvas 2D.
El sandbox puede bloquear HTTP local: se documenta y utiliza HTML inline como fallback.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright, Error as PWError
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'dist';ASSETS=ROOT/'assets';ASSETS.mkdir(exist_ok=True)
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(BASE)))
Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
  for mode,opts in [('desktop',{'viewport':{'width':1440,'height':940}}),('mobile',{'viewport':{'width':390,'height':844},'is_mobile':True,'has_touch':True})]:
   context=browser.new_context(**opts);page=context.new_page();errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
   hosted=True
   try:page.goto(f'http://127.0.0.1:{server.server_port}/index.html',timeout=6000)
   except PWError as exc:
    if 'ERR_BLOCKED_BY_ADMINISTRATOR' not in str(exc):raise
    hosted=False;page.close();page=context.new_page();page.on('pageerror',lambda err:errors.append(str(err)))
    html=BASE.joinpath('index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+BASE.joinpath('style.css').read_text()+'</style>')
    html=html.replace('<script defer src="./bundle.js"></script>','<script>'+BASE.joinpath('bundle.js').read_text()+'</script>')
    page.set_content(html)
   page.wait_for_function('window.__namelessDebug && window.__namelessDebug.state')
   assert '0.20.0' in page.locator('.version').inner_text()
   page.locator('#start').click()
   page.evaluate('''()=>{const s=__namelessDebug.state();s.seal=true;s.rx=5.5;s.ry=2.5;s.dir=1;}''')
   page.locator('#interact').click()
   assert page.evaluate('window.__namelessDebug.state().flags.kibaNorthOpen') is True
   assert page.evaluate('window.__namelessDebug.game.state().flags.kibaNorthOpen') is True
   assert page.evaluate('window.__namelessDebug.game.state().day')==1
   assert 'ATAJOS 1/2' in page.locator('#aiStatus').inner_text()
   page.evaluate('''()=>{const s=__namelessDebug.state();s.tape=true;s.rx=6.5;s.ry=7.5;s.dir=1;}''')
   page.locator('#interact').click()
   assert page.evaluate('window.__namelessDebug.state().flags.kibaArchiveOpen') is True
   assert 'ATAJOS 2/2' in page.locator('#aiStatus').inner_text()
   page.locator('#map').click();page.screenshot(path=str(ASSETS/f'v019-rutas-{mode}.png'),full_page=True)
   page.locator('#map').click()
   page.evaluate('''()=>{const s=__namelessDebug.state();s.chase=true;s.rx=11.5;s.ry=5.5;s.dir=2;}''')
   page.locator('#interact').click()
   assert page.evaluate('window.__namelessDebug.state().flags.kibaVentUsed') is True
   assert page.evaluate('window.__namelessDebug.state().flags.kibaDecoy.x')==11.5
   page.screenshot(path=str(ASSETS/f'v019-conducto-{mode}.png'),full_page=True)
   page.evaluate('''()=>{const s=__namelessDebug.state();s.chase=false;s.rx=3.5;s.ry=11.5;s.hidden=false;s.threat=70;s.dir=1;}''')
   page.locator('#interact').click()
   assert page.evaluate('window.__namelessDebug.state().flags.kibaHideSpot')=='kibaHideArchive'
   assert page.evaluate('window.__namelessDebug.state().flags.kibaHideAlert') is True
   page.screenshot(path=str(ASSETS/f'v019-escondite-{mode}.png'),full_page=True)
   assert not errors,errors
   print(f'PASS {mode}: dos atajos, distracción, escondite con riesgo, UI y Canvas2D; HTTP={hosted}; errores={len(errors)}')
   context.close()
  browser.close()
finally:server.shutdown()
