"""Prueba de NAMELESS 404 v0.13 en Chromium (servidor HTTP y respaldo en memoria)."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import json
from playwright.sync_api import sync_playwright, Error as PlaywrightError
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'dist'
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(BASE)))
thread=Thread(target=server.serve_forever,daemon=True)
thread.start()
url=f'http://127.0.0.1:{server.server_port}/index.html'
try:
  with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--enable-webgl','--use-angle=swiftshader'])
    for profile,settings in [('desktop',{'viewport':{'width':1440,'height':950}}),('mobile',{'viewport':{'width':390,'height':844},'is_mobile':True,'has_touch':True})]:
      ctx=browser.new_context(accept_downloads=True,**settings)
      page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
      hosted=True
      try:page.goto(url,wait_until='load',timeout=6000)
      except PlaywrightError as exc:
        if 'ERR_BLOCKED_BY_ADMINISTRATOR' not in str(exc):raise
        hosted=False;page.close();page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
        html=(BASE/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(BASE/'style.css').read_text()+'</style>')
        html=html.replace('<script defer src="./bundle.js"></script>','<script>'+(BASE/'bundle.js').read_text()+'</script>')
        page.set_content(html,wait_until='load')
      page.wait_for_function('window.__namelessDebug && window.__namelessDebug.state')
      page.locator('#start').click()
      assert page.locator('.version').inner_text()=='V 0.13.0'
      assert page.locator('#top').evaluate('(el)=>el.getContext("2d").getImageData(120,80,1,1).data[3]>0')
      page.evaluate('''() => {const s=window.__namelessDebug.state();s.day=6;s.mode='real';s.rx=2.5;s.ry=2.5;s.won=true;s.endingStage=3;s.chase=false;}''')
      page.locator('#interact').click()
      assert page.evaluate('window.__namelessDebug.state().day')==7
      assert 'DÍA 7' in page.locator('#status').inner_text()
      assert 'TERMINAL' in page.locator('#objective').inner_text()
      page.screenshot(path=str(ROOT/'assets'/f'v013-day7-{profile}.png'),full_page=True)
      page.locator('#swap').click()
      assert page.evaluate('window.__namelessDebug.state().mode')=='rpg'
      page.screenshot(path=str(ROOT/'assets'/f'v013-rpg-{profile}.png'),full_page=True)
      page.locator('#swap').click()
      page.locator('#audio').click();assert page.locator('#audio').inner_text()=='Audio: sí'
      page.locator('#audio').click();assert page.locator('#audio').inner_text()=='Audio: no'
      page.locator('#map').click();page.locator('#light').click()
      page.locator('#swap').click();page.locator('[data-dir="ArrowRight"]').click()
      page.locator('#save').click()
      with page.expect_download() as dl:page.locator('#exportSave').click()
      backup=Path(dl.value.path()).read_text();payload=json.loads(backup)
      assert payload['day']==7 and payload['version']==12
      page.locator('#importFile').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':b'{bad'})
      assert page.evaluate('window.__namelessDebug.state().day')==7
      page.locator('#importFile').set_input_files({'name':'valid.json','mimeType':'application/json','buffer':backup.encode()})
      assert page.evaluate('window.__namelessDebug.state().day')==7
      # Prueba de presentación de finales; los recorridos completos se prueban en day7.test.cjs.
      for ending in ['keep','free','replace']:
        page.evaluate('''ending => {const s=window.__namelessDebug.state();s.day=7;s.mode='rpg';s.won=true;s.endingStage=3;s.d7Original=true;s.d7Choice=ending;s.endingId=ending;}''',ending)
        page.locator('#interact').click();page.locator('#save').click();page.screenshot(path=str(ROOT/'assets'/f'v013-final-{ending}-{profile}.png'),full_page=True)
        assert page.evaluate('window.__namelessDebug.state().endingId')==ending
        assert 'FIN' in page.locator('#objective').inner_text()
      if hosted:
        assert page.evaluate('localStorage.getItem("nameless404_save_v09") !== null')
        page.reload(wait_until='load');page.locator('#continue').click()
        assert page.evaluate('window.__namelessDebug.state().endingId')=='replace'
      assert not errors,errors
      print(f'PASS {profile}: render, UI, audio, guardados, 3 finales, backend={page.locator("#graphicsBackend").inner_text()}, HTTP={hosted}')
      ctx.close()
    browser.close()
finally:server.shutdown()
