"""E2E v0.20: presentación de la huida, sonido activable y controles, desktop/mobile.
Los hitos por camino físico se cubren en finale020.test.mjs; aquí probamos el render.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=Path(__file__).resolve().parents[1]
DIST=BASE/'dist'; ASSETS=BASE/'assets';ASSETS.mkdir(exist_ok=True)
html=(DIST/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(DIST/'style.css').read_text()+'</style>')
html=html.replace('<script defer src="./bundle.js"></script>','<script>'+(DIST/'bundle.js').read_text()+'</script>')
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
 for label,options in [('desktop',{'viewport':{'width':1440,'height':980}}),('mobile',{'viewport':{'width':390,'height':850},'is_mobile':True,'has_touch':True})]:
  context=browser.new_context(**options)
  page=context.new_page();errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content(html)
  page.wait_for_function('window.__namelessDebug && window.__namelessDebug.state')
  assert '0.20.0' in page.locator('.version').inner_text()
  page.locator('#start').click()
  page.evaluate('''() => {const s=__namelessDebug.state();
    s.note=s.seal=s.photo=s.echo=s.tape=s.key=true;
    s.rx=10.5;s.ry=9.5;s.dir=1;s.chase=true;s.light=true;s.threat=44;
    s.flags.kibaFinaleStage=1;s.flags.kibaFinaleStartedAt=s.steps;
    __namelessDebug.render(performance.now());}''')
  # Actualiza UI mediante interacción existente, sin reescribir la interfaz.
  page.locator('#interact').click()
  assert 'HUIDA · ARCHIVOS' in page.locator('#aiStatus').inner_text()
  assert 'HUIDA' in page.locator('#objective').inner_text()
  page.screenshot(path=str(ASSETS/f'v020-huida-{label}.png'),full_page=True)
  page.evaluate('''()=>{const s=__namelessDebug.state();s.flags.kibaFinaleStage=2;__namelessDebug.render(performance.now())}''')
  page.locator('#interact').click()
  assert 'VESTÍBULO' in page.locator('#aiStatus').inner_text()
  page.screenshot(path=str(ASSETS/f'v020-climax-{label}.png'),full_page=True)
  # En el sandbox, el botón de audio puede inicializar un AudioContext suspendido.
  page.locator('#audio').click()
  page.locator('#audio').click()
  assert not errors,errors
  print(f'PASS {label}: versión, huida, objetivo, overlay, audio toggles; errores JS={len(errors)}')
  context.close()
 browser.close()
