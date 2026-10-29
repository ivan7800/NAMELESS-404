"""NAMELESS 404 v0.12 browser QA using a real HTTP origin, no external requests.
Run: python tests/browser012.py
"""
from pathlib import Path
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright, Error as PlaywrightError

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'dist'
ASSETS=ROOT/'assets'
ASSETS.mkdir(exist_ok=True)
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(BASE)))
thread=Thread(target=server.serve_forever,daemon=True)
thread.start()
url=f'http://127.0.0.1:{server.server_port}/index.html'
try:
  with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--enable-webgl','--use-angle=swiftshader'])
    for profile,settings in [('desktop',{'viewport':{'width':1440,'height':900}}),('mobile',{'viewport':{'width':390,'height':844},'is_mobile':True,'has_touch':True})]:
      ctx=browser.new_context(accept_downloads=True,**settings)
      page=ctx.new_page()
      errors=[]
      page.on('pageerror',lambda e: errors.append(str(e)))
      hosted=True
      try:
        page.goto(url,wait_until='load',timeout=5000)
      except PlaywrightError as exc:
        if 'ERR_BLOCKED_BY_ADMINISTRATOR' not in str(exc):
          raise
        hosted=False
        page.close()
        page=ctx.new_page()
        page.on('pageerror',lambda e: errors.append(str(e)))
        html=(BASE/'index.html').read_text()
        html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+(BASE/'style.css').read_text()+'</style>')
        html=html.replace('<script defer src="./bundle.js"></script>','<script>'+(BASE/'bundle.js').read_text()+'</script>')
        page.set_content(html,wait_until='load')

      page.wait_for_function('window.__namelessDebug && window.__namelessDebug.state')
      page.locator('#start').click()
      assert page.locator('.version').inner_text()=='V 0.12.0'
      assert page.locator('#top').evaluate('(el)=>el.getContext("2d").getImageData(120,80,1,1).data[3]>0')
      assert page.locator('#objective').inner_text()
      # Exercise the real UI transition: a completed Day 5 epilogue -> Day 6.
      page.evaluate("""() => {
        const st=window.__namelessDebug.state();
        st.day=5;st.mode='real';st.rx=2.5;st.ry=2.5;st.won=true;st.endingStage=3;
        st.chase=false;st.room='CALLE DE LOS AUSENTES';
      }""")
      page.locator('#interact').click()
      assert page.evaluate('window.__namelessDebug.state().day')==6
      assert 'DÍA 6' in page.locator('#status').inner_text()
      assert 'ETIQUETA' in page.locator('#objective').inner_text()
      assert page.locator('#top').evaluate('(el)=>el.getContext("2d").getImageData(120,80,1,1).data[3]>0')
      page.screenshot(path=str(ASSETS/f'v012-day6-{profile}.png'),full_page=True)
      page.locator('#swap').click()
      assert page.evaluate('window.__namelessDebug.state().mode')=='rpg'
      page.screenshot(path=str(ASSETS/f'v012-day6-rpg-{profile}.png'),full_page=True)
      page.locator('#swap').click()
      page.locator('#audio').click()
      assert page.locator('#audio').inner_text()=='Audio: sí'
      page.locator('#audio').click()
      assert page.locator('#audio').inner_text()=='Audio: no'
      page.locator('#map').click()
      page.locator('#light').click()
      page.locator('#swap').click()
      assert page.evaluate('window.__namelessDebug.state().mode')=='rpg'
      page.locator('[data-dir="ArrowRight"]').click()
      page.locator('#save').click()
      with page.expect_download() as dl:
        page.locator('#exportSave').click()
      backup=Path(dl.value.path()).read_text()
      payload=json.loads(backup)
      assert payload['day']==6 and payload['version']==11
      assert payload['d6Vent']==False
      page.locator('#importFile').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{bad'})
      assert page.evaluate('window.__namelessDebug.state().day')==6
      page.locator('#importFile').set_input_files({'name':'good.json','mimeType':'application/json','buffer':backup.encode()})
      assert page.evaluate('window.__namelessDebug.state().day')==6

      if hosted:
        assert page.evaluate('localStorage.getItem("nameless404_save_v09") !== null')
        page.reload(wait_until='load')
        page.locator('#continue').click()
        assert page.evaluate('window.__namelessDebug.state().mode')=='rpg'
      else:
        print('SKIP: servidor local y persistencia entre recargas, bloqueados por política del entorno')
      assert not errors,errors
      backend=page.locator('#graphicsBackend').inner_text()
      assert backend
      print(f'PASS {profile}: render, audio, doble pantalla, controles; renderer={backend}, HTTP={hosted}')
      ctx.close()
    browser.close()
finally:
  server.shutdown()
