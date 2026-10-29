"""Local headless Chromium render-call benchmark, NOT real GPU FPS."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];d=ROOT/'dist'
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
 pg=b.new_page(viewport={'width':1480,'height':960})
 html=(d/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(d/'style.css').read_text()+'</style>').replace('<script defer src="./bundle.js"></script>','<script>'+(d/'bundle.js').read_text()+'</script>')
 pg.set_content(html,wait_until='load');pg.wait_for_function('!!window.__namelessDebug');pg.locator('#start').click()
 result=pg.evaluate('''() => {
  const dbg=window.__namelessDebug,s=dbg.state();
  s.day=1;s.mode='real';s.rx=2.5;s.ry=2.5;s.dir=0;s.chase=false;
  const bench=(moving)=>{
   let samples=[];
   for(let i=0;i<55;i++){
    if(moving){s.rx=(i%2)?2.5:3.5;s.dir=i%4;}
    const t=performance.now();dbg.render();samples.push(performance.now()-t);
   }
   samples=samples.slice(5).sort((a,b)=>a-b);
   return {median:+samples[25].toFixed(2),p95:+samples[47].toFixed(2)};
  };
  return {static:bench(false),moving:bench(true),backend:document.getElementById('graphicsBackend')?.textContent};
 }''')
 print('v0.30 Chromium headless (ms por llamada render, no FPS):',result)
 b.close()
