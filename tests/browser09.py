"""Pruebas Chrome con inyección en memoria: no requieren servidor HTTP.
NO validan GPU WebGL2 ni la ruta Three.js; ver QA.md.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'dist'
HTML=(BASE/'index.html').read_text()
HTML=HTML.replace('<link rel="stylesheet" href="style.css">','<style>'+(BASE/'style.css').read_text()+'</style>')
HTML=HTML.replace('<script defer src="./bundle.js"></script>','<script>'+(BASE/'bundle.js').read_text()+'</script>')

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,
        args=['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--disable-web-security'])
    all_errors=[]
    for profile,settings in [
        ('pc',{'viewport':{'width':1460,'height':900},'device_scale_factor':1}),
        ('movil',{'viewport':{'width':390,'height':844},'device_scale_factor':1,'is_mobile':True,'has_touch':True})
    ]:
        page=browser.new_page(**settings)
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('console',lambda m:errors.append('consola: '+m.text) if m.type=='error' else None)
        page.set_content(HTML,wait_until='load')
        page.wait_for_timeout(300)
        assert page.evaluate('!!window.__namelessDebug'),'No se inicializó el juego'
        assert page.evaluate('window.__namelessDebug.state().day')==1
        backend=page.locator('#graphicsBackend').inner_text()
        assert backend in ['WEBGL2 NATIVO','CANVAS 2D (COMPATIBILIDAD)'],backend
        page.locator('#start').click()
        page.wait_for_timeout(250)
        assert not page.locator('#introDialog').evaluate('(el)=>el.open')
        assert page.locator('#top').evaluate('(el)=>{const d=el.getContext("2d").getImageData(128,90,1,1).data;return d[3]>0}')
        page.screenshot(path=str(ROOT/'assets'/f'09-real-{profile}.png'),full_page=True)
        page.locator('#swap').click()
        page.wait_for_timeout(200)
        assert page.evaluate('window.__namelessDebug.state().mode')=='rpg'
        page.screenshot(path=str(ROOT/'assets'/f'09-rpg-{profile}.png'),full_page=True)
        pos=page.evaluate('({x:window.__namelessDebug.state().px,y:window.__namelessDebug.state().py})')
        page.locator('[data-dir="ArrowRight"]').click()
        newpos=page.evaluate('({x:window.__namelessDebug.state().px,y:window.__namelessDebug.state().py})')
        assert pos!=newpos,'Cruceta no responde en '+profile
        page.locator('#map').click()
        page.locator('#light').click()
        page.locator('#swap').click()
        assert page.evaluate('window.__namelessDebug.state().mode')=='real'
        assert not errors,errors
        print(profile.upper(),'PASS',backend,'controles, intercambio, Canvas, sin errores JS')
        all_errors.extend(errors)
        page.close()
    browser.close()
assert not all_errors
print('PASS Chromium escritorio + móvil (emulación; fallback Canvas).')
