"""V0.22: Chromium real Canvas2D + validated mock pipeline WebGL2 (no GPU claim).
The mock checks module assembly and WebGL2 draw commands; only Canvas2D is
visually rendered by Chromium in this environment.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=Path(__file__).resolve().parents[1]
D=BASE/'dist'; A=BASE/'assets'; A.mkdir(exist_ok=True)
html=(D/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+(D/'style.css').read_text()+'</style>')
html=html.replace('<script defer src="./bundle.js"></script>','<script>'+(D/'bundle.js').read_text()+'</script>')
assert 'src/main-three' not in html
mock=r"""
window.__gpuMockStats={draws:[],maxFloats:0,shaders:[],uniforms:{},bufferCalls:0,compiled:0};
const getContextOrig=HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext=function(kind,options){
 if(kind!=='webgl2')return getContextOrig.call(this,kind,options);
 const stats=window.__gpuMockStats;
 const gl={
   VERTEX_SHADER:1,FRAGMENT_SHADER:2,COMPILE_STATUS:3,LINK_STATUS:4,
   ARRAY_BUFFER:5,STATIC_DRAW:6,DYNAMIC_DRAW:7,TRIANGLES:8,FLOAT:9,
   DEPTH_TEST:10,LEQUAL:11,CULL_FACE:12,COLOR_BUFFER_BIT:0x4000,DEPTH_BUFFER_BIT:0x0100,
   createShader:()=>({}),shaderSource:(sh,src)=>{sh.source=src;stats.shaders.push(src);},
   compileShader:(sh)=>{const src=sh.source||'';sh.ok=src.includes('gl_Position')||(
     src.includes('uniform vec2 u_resolution;') && src.includes('float filmGrain=') &&
     !src.includes('float grain=') && src.includes('u_kibaLamp0') && src.includes('u_kibaPower'));
     if(sh.ok)stats.compiled++;
   },getShaderParameter:(sh)=>sh.ok,getShaderInfoLog:()=>'GLSL contract invalid', 
   createProgram:()=>({}),attachShader:()=>{},bindAttribLocation:()=>{},
   linkProgram:()=>{},getProgramParameter:()=>true,getProgramInfoLog:()=>'',
   createVertexArray:()=>({}),createBuffer:()=>({}),
   getUniformLocation:(p,name)=>name,
   enable:()=>{},disable:()=>{},depthFunc:()=>{},bindVertexArray:()=>{},
   bindBuffer:()=>{},bufferData:(t,arr,usage)=>{stats.bufferCalls++;stats.maxFloats=Math.max(stats.maxFloats,arr.length)},
   viewport:()=>{},clearColor:()=>{},clear:()=>{},useProgram:()=>{},
   FRAMEBUFFER:0x8D40,NO_ERROR:0,RGBA:0x1908,UNSIGNED_BYTE:0x1401,
   bindFramebuffer:()=>{},getError:()=>0,
   readPixels:(x,y,w,h,fmt,typ,pixels)=>{pixels.set([75,91,83,255]);},
   uniform1f:(name,a)=>stats.uniforms[name]=a,
   uniform2f:(name,a,b)=>stats.uniforms[name]=[a,b],
   uniform3f:(name,a,b,c)=>stats.uniforms[name]=[a,b,c],
   enableVertexAttribArray:()=>{},vertexAttribPointer:()=>{},
   drawArrays:(mode,first,count)=>stats.draws.push(count),deleteBuffer:()=>{}
 };
 return gl;
};
"""
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
 for label,ctx_opts in [('desktop',{'viewport':{'width':1440,'height':970}}),('mobile',{'viewport':{'width':390,'height':840},'is_mobile':True,'has_touch':True})]:
  context=browser.new_context(**ctx_opts)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html)
  page.wait_for_function('window.__namelessDebug && window.__namelessDebug.state')
  assert '0.22.0' in page.locator('.version').inner_text()
  assert 'CANVAS 2D' in page.locator('#graphicsBackend').inner_text()
  page.locator('#start').click()
  assert page.locator('#objective').is_visible()
  page.locator('#diagnostics').click()
  diag=page.locator('#diagnosticsText').inner_text()
  assert 'Renderer: CANVAS 2D' in diag
  assert 'Prueba GPU local: NO DISPONIBLE' in diag,diag
  page.locator('#diagnostics').click()
  page.locator('#focusMode').click()
  assert page.locator('body').evaluate('(e)=>e.classList.contains("focus-mode")')
  page.locator('#focusMode').click()
  page.screenshot(path=str(A/f'v022-kiba-{label}.png'),full_page=True)
  page.locator('#swap').click();assert 'RPG' in page.locator('#status').inner_text()
  page.locator('#swap').click();assert 'REALIDAD' in page.locator('#status').inner_text()
  assert not errors,errors
  print(f'PASS {label}: Canvas2D, versión, día1, alternancia real/RPG, diagnóstico, foco, sin errores JS')
  context.close()
 # Mock verifies the native renderer code executes from the genuine offline bundle.
 context=browser.new_context(viewport={'width':1280,'height':900})
 context.add_init_script(mock)
 page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html)
 page.wait_for_function('window.__namelessDebug && window.__namelessDebug.state')
 page.locator('#start').click()
 page.locator('#diagnostics').click()
 diag=page.locator('#diagnosticsText').inner_text()
 assert 'Lectura framebuffer WebGL2: PASS' in diag,diag
 page.locator('#diagnostics').click()
 stats=page.evaluate('''()=>({
  status:__namelessDebug.renderer(),
  draws:__gpuMockStats.draws.length,
  maxFloats:__gpuMockStats.maxFloats,
  shaders:__gpuMockStats.shaders,
  uniforms:__gpuMockStats.uniforms,
  bufferCalls:__gpuMockStats.bufferCalls,
  compiled:__gpuMockStats.compiled
 })''')
 assert stats['status']=='webgl2-native',stats['status']
 assert stats['draws']>1,stats
 assert stats['maxFloats']>5000,stats['maxFloats']
 assert stats['bufferCalls']>=2
 assert stats['compiled']==2,stats
 assert stats['uniforms'].get('u_resolution')==[256,192]
 assert any('float cone=' in src and 'uniform vec2 u_resolution;' in src for src in stats['shaders'])
 assert any('gl_Position' in src for src in stats['shaders'])
 assert stats['uniforms'].get('u_kibaPower') and max(stats['uniforms']['u_kibaPower'])>0
 assert not errors,errors
 print('PASS native WebGL2 MOCK: shader lexical contract validated, geometry and lights passed, drawing/readPixels simulated; NO real GPU validation')
 context.close();browser.close()
