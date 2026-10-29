"""Prueba de controles inmediatos en Chromium sin red externa ni GPU física.
Reproduce eventos reales de teclado y DOM; el estado se comprueba inmediatamente.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
B=Path(__file__).resolve().parents[1]
html=(B/'dist/index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(B/'dist/style.css').read_text()+'</style>').replace('<script defer src="./bundle.js"></script>','<script>'+(B/'dist/bundle.js').read_text()+'</script>')
for name,options in [
    ('desktop',dict(viewport={'width':1440,'height':980})),
    ('mobile',dict(viewport={'width':390,'height':850},is_mobile=True,has_touch=True)),
]:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
  context=browser.new_context(**options)
  page=context.new_page(); errors=[]; checks=0
  page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.set_content(html);page.wait_for_function('window.__namelessDebug?.state')
  page.locator('#start').click()
  assert page.evaluate('window.__namelessDebug.state().dir')==1
  # Tecla inicial, sin espera de bucle de animación.
  page.keyboard.down('ArrowRight')
  assert page.evaluate('window.__namelessDebug.state().dir')==2,'keydown no actúa inmediatamente'
  checks+=1
  page.wait_for_timeout(260)
  assert page.evaluate('window.__namelessDebug.state().dir')!=2,'tecla sostenida no se repite'
  checks+=1
  page.keyboard.up('ArrowRight');page.wait_for_timeout(100)
  prior=page.evaluate('window.__namelessDebug.state().dir');page.wait_for_timeout(130)
  assert page.evaluate('window.__namelessDebug.state().dir')==prior,'tecla liberada siguió repitiendo'
  checks+=1
  # Forzar una referencia estable y comprobar pointerdown ANTES de pointerup.
  page.evaluate('window.__namelessDebug.state().dir=1')
  button=page.locator('[data-dir="ArrowRight"]')
  button.dispatch_event('pointerdown',{'button':0,'pointerType':'touch','pointerId':14})
  assert page.evaluate('window.__namelessDebug.state().dir')==2,'pointerdown ignorado'
  checks+=1
  button.dispatch_event('pointerup',{'button':0,'pointerType':'touch','pointerId':14})
  button.dispatch_event('click')
  assert page.evaluate('window.__namelessDebug.state().dir')==2,'click duplicó una pulsación táctil'
  checks+=1
  # Una pulsación larga (>900 ms) NO debe añadir un giro al levantar el dedo.
  page.evaluate('window.__namelessDebug.state().dir=1')
  button.dispatch_event('pointerdown',{'button':0,'pointerType':'touch','pointerId':16})
  page.wait_for_timeout(1050)
  before_click,after_click=page.evaluate('''()=>{
    const b=document.querySelector('[data-dir=\"ArrowRight\"]');
    b.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,button:0,pointerType:'touch',pointerId:16}));
    const before=window.__namelessDebug.state().dir;
    b.dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1}));
    return [before,window.__namelessDebug.state().dir];
  }''')
  assert before_click==after_click,'la pulsación larga produjo un clic adicional'
  checks+=1
  # Direcciones distintas consecutivas sin pérdida (antiguo bloqueo de 68 ms).
  page.evaluate('window.__namelessDebug.state().dir=1')
  for direction,pid in [('ArrowLeft',20),('ArrowRight',21)]:
   b=page.locator('[data-dir="'+direction+'"]')
   b.dispatch_event('pointerdown',{'button':0,'pointerType':'touch','pointerId':pid})
   b.dispatch_event('pointerup',{'button':0,'pointerType':'touch','pointerId':pid})
   b.dispatch_event('click')
  assert page.evaluate('window.__namelessDebug.state().dir')==1,'doble giro rápido no vuelve al origen'
  checks+=1
  # Botón acción: swap una vez cuando se presiona, no de nuevo al soltar.
  swap=page.locator('#swap'); assert page.evaluate('window.__namelessDebug.state().mode')=='real'
  swap.dispatch_event('pointerdown',{'button':0,'pointerType':'touch','pointerId':33})
  assert page.evaluate('window.__namelessDebug.state().mode')=='rpg','cambiar mundo retrasado'
  swap.dispatch_event('pointerup',{'button':0,'pointerType':'touch','pointerId':33})
  swap.dispatch_event('click')
  assert page.evaluate('window.__namelessDebug.state().mode')=='rpg','cambio de mundo duplicado'
  checks+=1
  # Compatibilidad de teclado/tecnología asistiva: click sin pointerdown.
  swap.click();assert page.evaluate('window.__namelessDebug.state().mode')=='real'
  checks+=1
  # Tap físico emulado: entrada táctil completa con pointerdown/up/click.
  if name=='mobile':
   was=page.evaluate('window.__namelessDebug.state().mode')
   swap.tap()
   assert page.evaluate('window.__namelessDebug.state().mode')!=was,'tap real de móvil no cambia el mundo'
   swap.tap()
   assert page.evaluate('window.__namelessDebug.state().mode')==was,'segundo tap no regresa al mundo real'
   checks+=2
  # Botón mapa no debe cambiar dos veces (se comprueba el texto en DOM).
  mapbtn=page.locator('#map');before=mapbtn.inner_text()
  mapbtn.dispatch_event('pointerdown',{'button':0,'pointerId':44,'pointerType':'touch'})
  mapbtn.dispatch_event('pointerup',{'button':0,'pointerId':44,'pointerType':'touch'})
  mapbtn.dispatch_event('click')
  assert mapbtn.inner_text()!=before,'mapa volvió al estado anterior por doble evento'
  checks+=1
  # Gamepad simulado: primer flanco despachado a la cadencia de refresco.
  page.evaluate('''() => {
    window.__padForTest={connected:true,buttons:Array.from({length:16},()=>({pressed:false})),axes:[0,0]};
    Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[window.__padForTest]});
    window.__namelessDebug.state().dir=1;
    window.__padForTest.buttons[15].pressed=true;
  }''')
  page.wait_for_function('window.__namelessDebug.state().dir===2',timeout=2000)
  checks+=1
  page.evaluate('window.__padForTest.buttons[15].pressed=false')
  page.wait_for_timeout(70)
  prior=page.evaluate('window.__namelessDebug.state().dir');page.wait_for_timeout(220)
  assert prior==page.evaluate('window.__namelessDebug.state().dir'),'el mando siguió tras soltar'
  checks+=1
  assert not errors,errors
  page.screenshot(path=str(B/f'assets/v026-controles-{name}.png'),full_page=True)
  print(f'PASS v0.26 {name}: {checks} verificaciones en Chromium, sin excepciones JavaScript')
  browser.close()
