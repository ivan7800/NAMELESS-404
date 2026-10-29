"""Verifica pipeline WebGL2 con API falsa: NO es una GPU real."""
from pathlib import Path
from playwright.sync_api import sync_playwright
B=Path(__file__).resolve().parents[1]
h=(B/'dist/index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(B/'dist/style.css').read_text()+'</style>').replace('<script defer src="./bundle.js"></script>','<script>'+(B/'dist/bundle.js').read_text()+'</script>')
legacy=(B/'tests/browser022.py').read_text()
mock=legacy.split('mock=r"""',1)[1].split('"""',1)[0]
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
 ctx=browser.new_context(viewport={'width':1280,'height':850});ctx.add_init_script(mock)
 p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 p.set_content(h);p.wait_for_function('window.__namelessDebug?.state')
 p.locator('#start').click();p.wait_for_timeout(160)
 data=p.evaluate('''()=>({
   backend:__namelessDebug.renderer(),
   draws:__gpuMockStats.draws.length,
   uniforms:__gpuMockStats.uniforms,
   shaderCount:__gpuMockStats.compiled,
   mode:document.querySelector('.device').className,
   leftSize:[document.querySelector('#top').width,document.querySelector('#top').height]
 })''')
 assert data['backend']=='webgl2-native',data
 assert data['shaderCount']==2,data
 assert data['draws']>0,data
 assert data['uniforms']['u_resolution']==[384,256],data
 assert data['leftSize']==[192,256],data
 assert 'book-mode' in data['mode'],data
 assert not errors,errors
 print('PASS WebGL2 simulado: escena completa 384x256 + dos pantallas 192x256; NO es prueba de GPU real')
 ctx.close();browser.close()
