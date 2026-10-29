"""Benchmark del render Canvas 2D sin GPU para dos builds reproducibles.
Uso: python3 tests/benchmark027.py [directorio de v0.27]
Compara condiciones de navegador, estado, resolución y número de fotogramas.
No mide latencia de pantalla ni FPS del equipo del jugador.
"""
import json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
previous=Path(sys.argv[1]) if len(sys.argv)>1 else None
versions=[('v0.28',root)]
if previous:versions.insert(0,('v0.27',previous))
with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
  for label,path in versions:
    html=(path/'dist/index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(path/'dist/style.css').read_text()+'</style>').replace('<script defer src="./bundle.js"></script>','<script>'+(path/'dist/bundle.js').read_text()+'</script>')
    page=browser.new_page(viewport={'width':1500,'height':1000})
    page.set_content(html);page.wait_for_function('window.__namelessDebug?.state');page.locator('#start').click()
    data=page.evaluate('''()=>{
      const debug=window.__namelessDebug, s=debug.state();
      s.dir=0;s.rx=2.5;s.ry=2.5;s.day=1;s.mode='real';s.chase=false;s.light=true;
      debug.render();
      const times=[];
      for(let i=0;i<40;i++){const t=performance.now();debug.render();times.push(performance.now()-t);}
      const still=times.reduce((a,b)=>a+b,0)/times.length;
      const moved=[];
      for(let i=0;i<20;i++){
        s.ry=2.5+(i%4)*.17;
        const t=performance.now();debug.render();moved.push(performance.now()-t);
      }
      return {still_ms:still,moving_ms:moved.reduce((a,b)=>a+b,0)/moved.length};
    }''')
    print(json.dumps({label: {k:round(v,2) for k,v in data.items()}},ensure_ascii=False))
    page.close()
  browser.close()
