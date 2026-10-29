"""Visual e integración v0.28: Chromium sin GPU ni Internet.
Se ejecuta con: python3 tests/browser027.py
El HTML se carga en memoria por restricciones del entorno; no es prueba HTTP real.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

B=Path(__file__).resolve().parents[1]
html=(B/'dist/index.html').read_text(encoding='utf8').replace(
    '<link rel="stylesheet" href="style.css">',
    '<style>'+(B/'dist/style.css').read_text(encoding='utf8')+'</style>').replace(
    '<script defer src="./bundle.js"></script>',
    '<script>'+(B/'dist/bundle.js').read_text(encoding='utf8')+'</script>')

with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
  for name,opts in [('desktop',dict(viewport={'width':1450,'height':1000})),
                    ('mobile',dict(viewport={'width':390,'height':840},is_mobile=True,has_touch=True))]:
    page=browser.new_page(**opts)
    errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
    page.set_content(html)
    page.wait_for_function('window.__namelessDebug?.state')
    page.locator('#start').click()
    # Ver la escena de vigilancia al girarse hacia el norte.
    page.evaluate('''()=>{const s=window.__namelessDebug.state();
       s.rx=2.5;s.ry=2.5;s.dir=0;s.day=1;s.mode='real';s.chase=false;s.light=true;
       window.__namelessDebug.render();}''')
    visible=page.evaluate('''()=>{
      const c=document.createElement('canvas');c.width=384;c.height=256;
      const ctx=c.getContext('2d');
      ctx.drawImage(document.getElementById('top'),0,0);
      ctx.drawImage(document.getElementById('bottom'),192,0);
      const a=ctx.getImageData(0,0,384,256).data;
      // Área central del módulo, frente a fondo oscuro.
      let lit=0;for(let y=70;y<174;y+=5)for(let x=145;x<245;x+=5){
        const k=(y*384+x)*4;if(a[k+1]>a[k]*1.08&&a[k+1]>a[k+2]*.9&&a[k+1]>40)lit++;
      }
      return lit;
    }''')
    assert visible>12,(name,'textura del puesto de vigilancia ausente',visible)
    # Dos fotogramas sin movimiento = fondo sin artefactos.
    pix_before=page.evaluate('''()=>document.getElementById('top').getContext('2d').getImageData(50,70,1,1).data.join(',')''')
    page.evaluate('window.__namelessDebug.render()')
    pix_after=page.evaluate('''()=>document.getElementById('top').getContext('2d').getImageData(50,70,1,1).data.join(',')''')
    assert pix_before==pix_after,(name,'fondo inmóvil inestable')
    # Cambiar pose, luz o mundo produce un nuevo fotograma sin errores.
    page.keyboard.press('ArrowRight')
    assert page.evaluate('window.__namelessDebug.state().dir')==1
    page.keyboard.press('l')
    assert not page.evaluate('window.__namelessDebug.state().light')
    page.locator('#swap').click()
    assert page.evaluate('window.__namelessDebug.state().mode')=='rpg'
    page.locator('#swap').click()
    assert page.evaluate('window.__namelessDebug.state().mode')=='real'
    page.evaluate('window.__namelessDebug.state().dir=0;window.__namelessDebug.state().light=true;window.__namelessDebug.render()')
    page.screenshot(path=str(B/f'assets/v028-vigilancia-{name}.png'),full_page=True)
    assert not errors,(name,errors)
    print(f'PASS v0.28 {name}: textura localizada, caché, teclado, luz, RPG y sin errores JS')
    page.close()
  browser.close()
