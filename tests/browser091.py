"""QA browser: visual smoke, keyboard/touch, portable save roundtrip.
Requires `pip install playwright` and a Chromium browser accessible to Playwright.
This test injects JS/CSS into memory; it does not prove file:// or WebGL hardware support.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'dist'
HTML=(BASE/'index.html').read_text()
HTML=HTML.replace('<link rel="stylesheet" href="style.css">','<style>'+(BASE/'style.css').read_text()+'</style>')
HTML=HTML.replace('<script defer src="./bundle.js"></script>','<script>'+(BASE/'bundle.js').read_text()+'</script>')
(ROOT/'assets').mkdir(exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'])
    for profile,settings in [('desktop',{'viewport':{'width':1460,'height':960}}),('mobile',{'viewport':{'width':390,'height':844},'is_mobile':True,'has_touch':True})]:
        page=browser.new_page(**settings,accept_downloads=True)
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(HTML,wait_until='load')
        page.wait_for_function('window.__namelessDebug !== undefined')
        backend=page.locator('#graphicsBackend').inner_text()
        print(profile,'backend',backend)
        page.locator('#start').click()
        page.screenshot(path=str(ROOT/'assets'/f'v091-{profile}.png'),full_page=True)
        assert page.locator('#top').evaluate('(el)=>el.getContext("2d").getImageData(120,80,1,1).data[3]>0')
        # export a real game state, assert downloadable JSON schema
        with page.expect_download() as dl:
            page.locator('#exportSave').click()
        download=dl.value
        assert download.suggested_filename.startswith('NAMELESS-404-dia-1')
        downloaded=Path(download.path()).read_text()
        assert json.loads(downloaded)['day']==1
        page.locator('#swap').click();assert page.evaluate('window.__namelessDebug.state().mode')=='rpg'
        # malformed import must not reset progress
        before=page.evaluate('window.__namelessDebug.state().mode')
        page.locator('#importFile').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{bad'})
        assert page.evaluate('window.__namelessDebug.state().mode')==before
        # valid import returns to exported (real world) state
        page.locator('#importFile').set_input_files({'name':'save.json','mimeType':'application/json','buffer':downloaded.encode()})
        page.wait_for_function('window.__namelessDebug.state().mode === "real"')
        assert 'importada' in page.locator('#message').inner_text().lower()
        # keypress, onscreen controls, map & light
        page.locator('#map').click()
        page.locator('#light').click()
        page.locator('#swap').click()
        assert page.evaluate('window.__namelessDebug.state().mode')=='rpg'
        page.locator('[data-dir="ArrowRight"]').click()
        assert not errors,errors
        print('PASS',profile,'import/export, control, screenshot, Canvas fallback')
        page.close()
    browser.close()
print('PASS browser QA (2 perfiles)')
