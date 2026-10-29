"""Visual inspection, keyboard and collision-free panels in Chromium Canvas2D."""
from pathlib import Path
from playwright.sync_api import sync_playwright
B=Path(__file__).resolve().parents[1]
html=(B/'dist/index.html').read_text(encoding='utf8')
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+(B/'dist/style.css').read_text(encoding='utf8')+'</style>')
html=html.replace('<script defer src="./bundle.js"></script>','<script>'+(B/'dist/bundle.js').read_text(encoding='utf8')+'</script>')
scenes=[('lobby',4.5,2.5,0),('east',13.5,3.5,1),('archive',2.5,8.5,3),('basement',13.5,11.5,1)]
with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
  for device,opts in [('desktop',dict(viewport={'width':1440,'height':950})),('mobile',dict(viewport={'width':390,'height':840},is_mobile=True,has_touch=True))]:
    page=browser.new_page(**opts)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html)
    page.wait_for_function('window.__namelessDebug?.state')
    page.locator('#start').click()
    for name,x,y,dir in scenes:
      page.evaluate('''({x,y,dir})=>{const s=window.__namelessDebug.state();
       s.day=1;s.rx=x;s.ry=y;s.dir=dir;s.mode='real';s.chase=false;s.light=true;
       window.__namelessDebug.render();}''',dict(x=x,y=y,dir=dir))
      page.screenshot(path=str(B/f'assets/v029-{name}-{device}.png'),full_page=True)
      val=page.evaluate('''()=>{
        const c=document.createElement('canvas');c.width=384;c.height=256;
        const a=c.getContext('2d');
        a.drawImage(document.getElementById('top'),0,0);
        a.drawImage(document.getElementById('bottom'),192,0);
        const d=a.getImageData(0,0,384,256).data;
        let bright=0;for(let j=66;j<210;j+=4)for(let i=118;i<270;i+=4){
           const k=(j*384+i)*4;if(d[k]>65 && d[k+1]>65 && d[k+2]>55)bright++;
        }
        return bright;
       }''')
      print('SCENE',device,name,'lit-pixels',val)
      assert val>20,(device,name,val)
    # Press & release without duplicate actions (previous input-system regression)
    page.evaluate('''()=>{const s=window.__namelessDebug.state();s.rx=4.5;s.ry=2.5;s.dir=0;s.mode='real';s.light=true;}''')
    page.keyboard.press('ArrowRight')
    assert page.evaluate('window.__namelessDebug.state().dir')==1
    page.keyboard.press('l')
    assert not page.evaluate('window.__namelessDebug.state().light')
    page.locator('#swap').click()
    assert page.evaluate('window.__namelessDebug.state().mode')=='rpg'
    page.locator('#swap').click()
    assert page.evaluate('window.__namelessDebug.state().mode')=='real'
    assert not errors,errors
    print('PASS v0.29',device,'4 scenes, keyboard, swap, no JS errors')
    page.close()
  browser.close()
