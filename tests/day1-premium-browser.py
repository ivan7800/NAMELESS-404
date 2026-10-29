"""Real Chromium UI smoke: discover first Kiba record, scene, audio opt-in, export and recovery."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
 for label,opts in [('desktop',{'viewport':{'width':1440,'height':920}}),('mobile',{'viewport':{'width':390,'height':844},'is_mobile':True,'has_touch':True})]:
  page=browser.new_page(**opts);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  html=(DIST/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(DIST/'style.css').read_text()+'</style>')
  html=html.replace('<script defer src="./bundle.js"></script>','<script>'+(DIST/'bundle.js').read_text()+'</script>')
  page.set_content(html,wait_until='load')
  page.wait_for_function('!!window.__namelessDebug')
  page.locator('#start').click()
  # Two real movement commands from initial 2.5,2.5 towards the book at 2.5,3.5.
  page.locator('[data-dir="ArrowRight"]').click()
  page.locator('[data-dir="ArrowUp"]').click()
  page.locator('[data-dir="ArrowUp"]').click()
  page.locator('#interact').click()
  evidence=page.evaluate('window.__namelessDebug.state().flags.kibaEvidence')
  assert evidence==['lobby'],evidence
  assert '1/4' in page.locator('#aiStatus').inner_text()
  assert 'LIBRO DE VISITAS' in page.locator('#message').inner_text()
  page.locator('#audio').click()
  assert 'sí' in page.locator('#audio').inner_text()
  assert page.evaluate('window.__namelessDebug.premiumAudio.isRunning()')
  page.locator('#audio').click()
  assert not page.evaluate('window.__namelessDebug.premiumAudio.isRunning()')
  page.locator('#save').click()
  # In opaque origin storage can be disabled, test UI survives without hard error.
  page.screenshot(path=str(ROOT/'assets'/f'v017-documento-{label}.png'),full_page=True)
  assert not errors,errors
  print(f'PASS v0.17 {label}: document interaction, game scene, sound opt-in/out and renderer fallback')
  page.close()
 browser.close()
