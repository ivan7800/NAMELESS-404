"""Chromium real: low-latency controls, visual-only camera, drag, fallback and RPG."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image,ImageChops
import io
R=Path(__file__).resolve().parents[1]
html=(R/'dist/index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(R/'dist/style.css').read_text()+'</style>').replace('<script defer src="./bundle.js"></script>','<script>'+(R/'dist/bundle.js').read_text()+'</script>')
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
 for name,options in [('desktop',{'viewport':{'width':1460,'height':1040}}),('mobile',{'viewport':{'width':393,'height':852},'is_mobile':True,'has_touch':True})]:
  context=b.new_context(**options)
  page=context.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load');page.wait_for_function('window.__namelessDebug?.camera')
  page.locator('#start').click();page.wait_for_timeout(190)
  debug='window.__namelessDebug'
  assert page.locator('.device').evaluate('(node)=>node.classList.contains("book-mode")')
  initial=page.evaluate(f"JSON.stringify((({{day,mode,rx,ry,dir,steps,flags}})=>({{day,mode,rx,ry,dir,steps,flags}}))({debug}.state()))")
  initialDir=page.evaluate(f'{debug}.state().dir')
  initialYaw=page.evaluate(f'{debug}.view().cameraYaw')
  first=Image.open(io.BytesIO(page.locator('#top').screenshot())).convert('RGB')
  page.locator('#lookRight').click();page.wait_for_timeout(350)
  view=page.evaluate(f'{debug}.view()')
  assert view['cameraYaw']>initialYaw+.10,view
  page.screenshot(path=str(R/'assets'/f'v031-mirar-{name}.png'),full_page=True)
  second=Image.open(io.BytesIO(page.locator('#top').screenshot())).convert('RGB')
  changed=ImageChops.difference(first,second).getbbox()
  assert changed is not None,'look controls did not change world image'
  assert page.evaluate(f"JSON.stringify((({{day,mode,rx,ry,dir,steps,flags}})=>({{day,mode,rx,ry,dir,steps,flags}}))({debug}.state()))")==initial,'look altered saved gameplay state'
  page.locator('#lookCenter').click();page.wait_for_timeout(460)
  assert abs(page.evaluate(f'{debug}.view().cameraYaw')-initialDir*3.14159265359/2)<.08
  page.locator('#cameraMode').click()
  assert page.locator('#cameraMode').inner_text()=='Cámara: clásica'
  page.locator('[data-dir="ArrowRight"]').click();page.wait_for_timeout(90)
  assert page.evaluate(f'{debug}.state().dir')==(initialDir+1)%4
  assert abs(((page.evaluate(f'{debug}.view().cameraYaw')-(initialDir+1)%4*1.57079632679+3.14159265359)%(2*3.14159265359))-3.14159265359)<.01
  page.locator('#cameraMode').click()
  page.locator('[data-dir="ArrowLeft"]').click();page.wait_for_timeout(80)
  assert page.evaluate(f'{debug}.state().dir')==initialDir
  # Gestures on a genuine DOM canvas: mouse or touch.
  page.locator('#top').scroll_into_view_if_needed()
  page.wait_for_timeout(140)
  pos=page.locator('#top').bounding_box()
  if name=='desktop':
   page.mouse.move(pos['x']+pos['width']*.5,pos['y']+pos['height']*.5)
   page.mouse.down()
   page.mouse.move(pos['x']+pos['width']*.79,pos['y']+pos['height']*.35,steps=5)
   page.mouse.up()
  else:
   page.dispatch_event('#top','pointerdown',{'pointerId':6,'pointerType':'touch','button':0,'clientX':pos['x']+45,'clientY':pos['y']+70})
   page.dispatch_event('#top','pointermove',{'pointerId':6,'pointerType':'touch','clientX':pos['x']+100,'clientY':pos['y']+40})
   page.dispatch_event('#top','pointerup',{'pointerId':6,'pointerType':'touch','clientX':pos['x']+100,'clientY':pos['y']+40})
  page.wait_for_timeout(270)
  assert abs(page.evaluate(f'{debug}.camera.offsets.yaw'))>.05
  assert page.evaluate(f'{debug}.state().dir')==initialDir,'camera touch gesture turned the player'
  page.locator('#lookCenter').click();page.wait_for_timeout(330)
  page.screenshot(path=str(R/'assets'/f'v031-camara-{name}.png'),full_page=True)
  page.locator('#swap').click();page.wait_for_timeout(150)
  assert page.evaluate(f'{debug}.state().mode')=='rpg'
  page.locator('#swap').click();page.wait_for_timeout(200)
  assert page.evaluate(f'{debug}.state().mode')=='real'
  assert not errors,errors
  print(f'PASS camera031 {name}: visual camera, view-only invariants, smooth+classic, gesture, 2 screens, RPG, no JS errors')
  context.close()
 b.close()
