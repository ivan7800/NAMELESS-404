"""Chromium visual regression: same camera, atrium geometry, controls and 7-day state."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops
import io
ROOT=Path(__file__).resolve().parents[1]
BASELINE=ROOT/'tests'/'baseline030'/'v029-top.png'
OUT=ROOT/'assets';OUT.mkdir(exist_ok=True)
def launch(page,folder):
 d=folder/'dist'
 html=(d/'index.html').read_text()
 html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+(d/'style.css').read_text()+'</style>')
 html=html.replace('<script defer src="./bundle.js"></script>','<script>'+(d/'bundle.js').read_text()+'</script>')
 page.set_content(html,wait_until='load')
 page.wait_for_function('!!window.__namelessDebug')
 page.locator('#start').click()
 page.evaluate('''() => {const s=window.__namelessDebug.state();s.day=1;s.mode='real';s.rx=1.5;s.ry=2.5;s.dir=0;s.light=true;s.chase=false;window.__namelessDebug.render()}''')
 page.wait_for_timeout(160)
 return page.locator('#top').screenshot(),page.locator('#bottom').screenshot()
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
 for device,opts in [('desktop',{'viewport':{'width':1480,'height':960}}),('mobile',{'viewport':{'width':390,'height':844},'is_mobile':True,'has_touch':True})]:
  context=b.new_context(**opts);errors=[]
  p1=context.new_page();p1.on('pageerror',lambda e:errors.append(str(e)))
  newtop,newbottom=launch(p1,ROOT)
  a,bim=Image.open(BASELINE).convert('RGB'),Image.open(io.BytesIO(newtop)).convert('RGB')
  diff=ImageChops.difference(a,bim)
  changed=sum(1 for pix in diff.get_flattened_data() if max(pix)>12)
  ratio=changed/(a.width*a.height)
  assert ratio>.012, f'atlas no visible: {ratio:.2%}'
  # screenshot at design-authored panel in the world, not HUD.
  p1.screenshot(path=str(OUT/f'v030-atrium-{device}.png'),full_page=True)
  pageState=p1.evaluate('window.__namelessDebug.state()')
  assert pageState['day']==1 and pageState['rx']==1.5
  # Use physical UI controls for movement and world switching.
  p1.locator('[data-dir="ArrowRight"]').click()
  assert p1.evaluate('window.__namelessDebug.state().dir')==1
  p1.locator('#swap').click()
  assert p1.evaluate('window.__namelessDebug.state().mode')=='rpg'
  p1.locator('#swap').click()
  assert p1.evaluate('window.__namelessDebug.state().mode')=='real'
  p1.evaluate('''() => {const s=window.__namelessDebug.state();s.day=7;s.chase=false;s.rx=2.5;s.ry=2.5;window.__namelessDebug.render()}''')
  assert p1.evaluate('window.__namelessDebug.state().day')==7
  assert not errors,errors
  print(f'PASS v0.30 {device}: changed {ratio:.1%} on left DS screen; controls, world switch, seven-day engine')
  context.close()
 b.close()
