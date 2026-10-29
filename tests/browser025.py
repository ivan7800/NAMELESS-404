"""v0.25 visual smoke test (Canvas2D fallback, not a hardware GPU validation)."""
from pathlib import Path
from playwright.sync_api import sync_playwright
B=Path(__file__).resolve().parents[1]
html=(B/'dist/index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(B/'dist/style.css').read_text()+'</style>').replace('<script defer src="./bundle.js"></script>','<script>'+(B/'dist/bundle.js').read_text()+'</script>')
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
    for name,opts in [('desktop',dict(viewport={'width':1440,'height':1024})),('mobile',dict(viewport={'width':393,'height':852},is_mobile=True,has_touch=True))]:
        ctx=browser.new_context(**opts)
        page=ctx.new_page(); errors=[]
        page.on('pageerror',lambda e: errors.append(str(e)))
        page.set_content(html)
        page.wait_for_function('window.__namelessDebug?.state')
        page.locator('#start').click()
        page.wait_for_timeout(200)
        assert page.locator('.device').evaluate('(el)=>el.classList.contains("book-mode")')
        assert page.evaluate('window.__namelessDebug.renderer()')=='canvas-fallback'
        baseline=page.evaluate('''()=>{const a=document.querySelector('#top').getContext('2d').getImageData(0,0,192,256).data;return Array.from(a).reduce((v,x,i)=>v+(i%19===0?x:0),0)}''')
        page.screenshot(path=str(B/f'assets/v025-kiba-{name}.png'),full_page=True)
        page.evaluate('''()=>{const s=window.__namelessDebug.state();s.rx=2.5;s.ry=2.5;s.dir=1;s.mode='real';s.chase=true;s.hidden=false;s.entityX=4.25;s.entityY=2.5;s.threat=72;s.light=true;}''')
        page.wait_for_timeout(90)
        page.evaluate('window.__namelessDebug.render(performance.now())')
        character=page.evaluate('''()=>{const a=document.querySelector('#top').getContext('2d').getImageData(0,0,192,256).data;return Array.from(a).reduce((v,x,i)=>v+(i%19===0?x:0),0)}''')
        assert character != baseline,'No cambia la imagen al aparecer la Copista'
        page.screenshot(path=str(B/f'assets/v025-copista-{name}.png'),full_page=True)
        # Gameplay display remains switchable; tests do not bypass the normal interface controls.
        page.locator('#swap').click();page.wait_for_timeout(100)
        assert page.locator('.device').evaluate('(el)=>el.classList.contains("rpg-mode")')
        page.locator('#swap').click();page.wait_for_timeout(100)
        assert page.locator('.device').evaluate('(el)=>el.classList.contains("book-mode")')
        assert not errors,errors
        print(f'PASS v0.25 {name}: 3D-book mode in Canvas fallback, character visible, RPG switch, no JS errors, image checksums {baseline}->{character}')
        ctx.close()
    browser.close()
