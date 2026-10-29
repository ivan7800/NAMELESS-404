// @ts-nocheck
import {probeWebGL2} from './premium/GPUDiagnostics.js';
import {BookMode} from './premium/BookMode.js';
import {ResponsiveInput} from './premium/ResponsiveInput.js';
import {CinematicCamera} from './premium/CinematicCamera.js';
import {RetroRpg} from './premium/RetroRpg.js';
import { NamelessEngine as E } from "./engine.js";
import { NamelessRender as R } from "./render.js";
import { HorrorDirector } from "./horror/HorrorDirector.js";
import { DayOneSoundscape } from "./premium/DayOneAudio.js";
/* NAMELESS 404 — UI, controles, guardados y audio original generado por osciladores. */
export function bootGame(GraphicsBackend) {
 'use strict';
 const $=x=>document.getElementById(x), top=$('top').getContext('2d'), bottom=$('bottom').getContext('2d');
 const KEY='nameless404_save_v09', AUTO_KEY='nameless404_autosave_v014', MANUAL_TIME_KEY='nameless404_manual_saved_at_v014', PREVIOUS_KEYS=['nameless404_save_v08','nameless404_save_v07','nameless404_save_v06','nameless404_save_v05','nameless404_save_v04'];
 const game=E.newGame();
 const director=new HorrorDirector();
 const premiumAudio=new DayOneSoundscape();
 let brightness='normal', map=false, audio=false,ctx=null,osc=null,hum=null,master=null, hiss=null,filter=null, noise=null, reduceEffects=true, lastMsg='';
 const inputs=new ResponsiveInput();
 const camera=new CinematicCamera();
 let lastCameraView=null;
 const prefersLessMotion=!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 let pointerHandled=new WeakMap();
 let t0=performance.now(), lastFrame=0, counterStart=performance.now(), frames=0, measuredFps=0, lastHeartbeat=0;
 let autoTimer=null, lastAutoSignature='', immersive=false, gamepadActive=false, padPollAt=0;
 const gfx = GraphicsBackend.create(384,256);
 const gfxTag=$('graphicsBackend');
 if(gfxTag)gfxTag.textContent=gfx?(gfx.status().includes('three')?'THREE.JS / WEBGL2':'WEBGL2 NATIVO'):'CANVAS 2D (COMPATIBILIDAD)';
 function notify(message) {lastMsg=message;$('message').textContent=message;}
 function tone(f=130,d=.12,type='triangle',vol=.035,pan=0){
   if(!audio)return;
   try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();ctx.resume();const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(vol,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+d);if(typeof ctx.createStereoPanner==='function'){const stereo=ctx.createStereoPanner();stereo.pan.value=Math.max(-.8,Math.min(.8,pan));o.connect(g).connect(stereo).connect(ctx.destination);}else o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+d);}catch(err){console.warn('Web Audio no disponible',err);}
 }
 function sound(type){
  const sounds={finalChoice:[180,.8,'sine'],furnace:[49,1.2,'sawtooth'],room:[95,.24,'sine'],photo:[460,.5,'triangle'],bell:[327,.66,'sine'],intercom:[212,.7,'triangle'],well:[61,.76,'sawtooth'],stepReal:[76,.07,'triangle'],stepQuiet:[51,.035,'sine'],stepMetal:[188,.085,'square'],decoy:[430,.31,'triangle'],sneak:[120,.045,'sine'],stepRpg:[214,.06,'square'],turn:[106,.025,'triangle'],bump:[55,.08,'triangle'],clue:[380,.27,'sine'],swap:[205,.35,'triangle'],tape:[73,.6,'sawtooth'],hide:[90,.15,'sine'],caught:[40,.9,'sawtooth'],ending:[490,.6,'sine'],phone:[670,.15,'sine'],mirror:[85,.5,'sawtooth'],light:[235,.09,'triangle'],ticket:[590,.28,'triangle'],clock:[155,.65,'triangle'],train:[55,1.2,'sawtooth'],switch:[305,.48,'square'],paper:[390,.32,'triangle'],glass:[510,.4,'sine'],breath:[75,.5,'sine'],xray:[87,.7,'sawtooth'],fold:[250,.56,'square'],heartbeat:[53,1.0,'triangle'],hospital:[140,.65,'sine'],gate:[127,.76,'sawtooth'],vent:[330,.42,'square'],finaleStart:[82,1.35,'triangle'],finaleCrossing:[137,.9,'sine'],finaleEscape:[415,1.2,'sine'],finaleFail:[67,.5,'sine']};
  if(sounds[type]){
    const st=game.state();const angle=st.dir*Math.PI/2;
    const dx=st.entityX-st.rx,dz=st.entityY-st.ry;
    const decoyPosition=type==='decoy'?st.flags?.kibaDecoy:null;
    const pan=decoyPosition?Math.max(-.8,Math.min(.8,((decoyPosition.x-st.rx)*Math.cos(angle)+(decoyPosition.y-st.ry)*Math.sin(angle))/Math.max(1,Math.hypot(decoyPosition.x-st.rx,decoyPosition.y-st.ry)))):st.chase&&(type==='caught'||type==='stepReal'||type==='heartbeat')
      ?(dx*Math.cos(angle)+dz*Math.sin(angle))/Math.max(1,Math.hypot(dx,dz)):0;
    if(premiumAudio.cue(type,st))return;
    tone(...sounds[type],type==='heartbeat'?.020:.035,pan);
  }
 }
 function playOmen(cue){
   // Never a loud stinger. Omen voices are short, low-volume procedural sounds.
   const types={reflection:[77,.52,'sine',.013],hollow:[43,.76,'triangle',.012],double:[97,.23,'triangle',.011],film:[171,.33,'square',.006],negative:[64,.61,'sine',.014],breath:[88,.83,'sine',.008],absence:[50,.58,'triangle',.012]};
   const [freq,duration,wave,gain]=types[cue.kind]||types.hollow;
   tone(freq,duration,wave,gain,(cue.seed%200)/100-1);
 }
 function flush(){
  for(const event of game.events()){
   if(event.kind==='sound'){sound(event.message);continue;}
   if(event.kind==='journal'){notify(event.message);continue;}
   if(event.kind==='scene'){notify(event.title+' — '+event.message);tone(63,.25,'sawtooth',.015);continue;}
   if(event.kind==='message')notify(event.message);
  }
  const s=game.state();
  $('status').textContent=s.day===7
    ?`DÍA 7 · ${s.mode==='real'?'REALIDAD':'RPG'} · TERMINAL ${s.d7Terminal?'✓':'–'} · RETRATO ${s.d7Portrait?'✓':'–'} · VOZ ${s.d7Voice?'✓':'–'} · NOMBRE ${s.d7Name?'✓':'–'} · FOTO ${s.d7Original?'✓':'–'} · DECISIÓN ${s.d7Choice.toUpperCase()}`
    :s.day===6
    ?`DÍA 6 · ${s.mode==='real'?'REALIDAD':'RPG'} · URNA ${s.d6Label?'✓':'–'} · ÍNDICE ${s.d6Index?'✓':'–'} · HORNO ${s.d6Furnace?'✓':'–'} · RUEDA ${s.d6Vent?'✓':'–'} · NEGATIVO ${s.d6Negative?'✓':'–'}`
    :s.day===5
    ?`DÍA 5 · ${s.mode==='real'?'REALIDAD':'RPG'} · PLACA ${s.d5Sign?'✓':'–'} · LIBRO ${s.d5Address?'✓':'–'} · SOLAR ${s.d5Plot?'✓':'–'} · CALLE ${s.d5Street?'✓':'–'} · CASA ${s.d5House?'✓':'–'}`
    :s.day===4
    ?`DÍA 4 · ${s.mode==='real'?'REALIDAD':'RPG'} · FICHA ${s.d4File?'✓':'–'} · LIBRO ${s.d4Ledger?'✓':'–'} · PLACA ${s.d4Xray?'✓':'–'} · PLANO ${s.d4Fold?'✓':'–'} · BOBINA ${s.d4Reel?'✓':'–'}`
    :s.day===3
    ?`DÍA 3 · ${s.mode==='real'?'REALIDAD':'RPG'} · BILLETE ${s.d3Ticket?'✓':'–'} · RELOJ ${s.d3Clock?'✓':'–'} · PANEL ${s.d3Schedule?'✓':'–'} · SEÑAL ${s.d3Signal?'✓':'–'} · CABINA ${s.d3Booth?'✓':'–'}`
    :s.day===2
    ?`DÍA 2 · ${s.mode==='real'?'REALIDAD':'RPG'} · REGISTRO ${s.d2Register?'✓':'–'} · CAMPANA ${s.d2Bell?'✓':'–'} · INTERFONO ${s.d2Frequency?'✓':'–'} · ESPEJO ${s.d2Reflection?'✓':'–'} · 207 ${s.d2Door?'✓':'–'}`
    :`DÍA 1 · ${s.mode==='real'?'REALIDAD':'RPG'} · NOTA ${s.note?'✓':'–'} · SELLO ${s.seal?'✓':'–'} · FOTO ${s.photo?'✓':'–'} · NOMBRE ${s.echo?'✓':'–'} · CINTA ${s.tape?'✓':'–'} · LLAVE ${s.key?'✓':'–'}`;
  const ai=s.day===1&&s.chase&&s.mode==='real'?s.flags.copyistMemory?.phase:null;
  $('aiStatus').textContent=ai==='hunt'?'LA COPISTA · TE HA VISTO':ai==='investigate'?'LA COPISTA · INVESTIGA UN RUIDO':ai==='search'?'LA COPISTA · BUSCA TU ÚLTIMO RASTRO':s.day===1?'EDIFICIO KIBA · LA PRESENCIA ESCUCHA':'ARCHIVO · LA PRESENCIA PERMANECE';
  $('objective').textContent=E.objective(s);
  const evidence=Array.isArray(s.flags?.kibaEvidence)?s.flags.kibaEvidence:[];
  if(s.day===1){
    $('aiStatus').textContent+=' · ARCHIVOS '+evidence.length+'/4'+' · ATAJOS '+(Number(!!s.flags.kibaNorthOpen)+Number(!!s.flags.kibaArchiveOpen))+'/2';
    const sneak=$('sneak'),decoy=$('decoy'),remaining=2-(s.flags.kibaDecoysUsed||0);
    sneak.textContent='C · Sigilo '+(s.crouched?'ACTIVO':'INACTIVO');sneak.setAttribute('aria-pressed',String(!!s.crouched));
    decoy.textContent='V · Tuercas '+remaining+'/2';
    sneak.disabled=s.mode!=='real'||s.won;
    decoy.disabled=s.mode!=='real'||s.won||!s.tape||!s.chase||remaining<=0;
    $('aiStatus').textContent+=' · '+(s.flags.kibaFinaleStage===1?'HUIDA · ARCHIVOS':s.flags.kibaFinaleStage===2?'HUIDA · VESTÍBULO':s.flags.kibaFinaleStage===3?'HUIDA COMPLETADA':'RUTAS ABIERTAS')+' · '+(s.crouched?'SIGILO':'PASO NORMAL')+
      (s.chase?' · SUELO '+(s.room==='SOTANO TECNICO'?'RESONANTE':'VARIABLE'):'');
  }else{$('sneak').disabled=true;$('decoy').disabled=true;}

  $('light').textContent=s.light?'L · Linterna ON':'L · Linterna OFF';
  const entries=s.journal;$('journal').replaceChildren(...(entries.length?entries:['Todavía no has encontrado ninguna pista.']).map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));
 }
 function autoWrite(force=false){
   try {
     const state=game.state();
     const signature=[state.day,state.mode,state.rx,state.ry,state.px,state.py,state.steps,state.endingStage,state.endingId,state.journal.length,state.d7Choice,state.crouched,state.flags.kibaDecoysUsed,state.flags.kibaDecoyStep,state.flags.kibaNorthOpen,state.flags.kibaArchiveOpen,state.flags.kibaVentUsed,state.flags.kibaHideSpot,state.flags.kibaHideAlert,state.flags.kibaFinaleStage,state.flags.kibaFinaleFailures,state.flags.kibaFinaleDone,state.hidden,state.encounter].join('|');
     if(force||signature!==lastAutoSignature){
       localStorage.setItem(AUTO_KEY,JSON.stringify({savedAt:Date.now(),state}));
       lastAutoSignature=signature;
       $('autoStatus').textContent='AUTOGUARDADO · Día '+state.day+' · Guardado';
     }
   }catch(e){$('autoStatus').textContent='AUTOGUARDADO · No disponible';}
 }
 function requestAuto(){
   if(autoTimer!==null)clearTimeout(autoTimer);
   $('autoStatus').textContent='AUTOGUARDADO · Pendiente';
   autoTimer=setTimeout(()=>{autoTimer=null;autoWrite();},550);
 }
 function recoverAuto(){
   try{
     const item=JSON.parse(localStorage.getItem(AUTO_KEY)||'null');
     if(!item||typeof item.savedAt!=='number'||!item.state||!game.load(item.state)){
       notify('No hay un autoguardado válido. El progreso actual no ha cambiado.');return false;
     }
     lastAutoSignature='';director.clear();flush();render();notify('Autoguardado restaurado (Día '+game.state().day+').');return true;
   }catch(e){notify('El autoguardado no se puede leer. La partida actual permanece intacta.');return false;}
 }
 function act(fn){
   const before={...game.state()};
   fn();
   const cue=director.observe(before,game.state(),performance.now());
   if(cue){
     $('omenStatus').textContent='PRESAGIO · '+cue.text;
     if(audio)playOmen(cue);
   }else if(game.state().mode!=='real'||game.state().won){
     $('omenStatus').textContent='PRESAGIO · EN ESPERA';
   }
   flush();render();requestAuto();
 }
 function render(t=performance.now()) {
   const state=game.state();
   const cameraView=camera.sample(state,t,prefersLessMotion);
   lastCameraView=cameraView;
   const visual=state.mode==='real'&&!state.won?{...state,...cameraView}:state;
   // El mundo real es una escena continua entre dos pantallas verticales (modo libro).
   // El RPG maldito vuelve a la orientación horizontal y se presenta aparte.
   const isBook=state.mode==='real'&&!state.won;
   const device=document.querySelector('.device');
   device?.classList.toggle('book-mode',isBook);
   device?.classList.toggle('rpg-mode',!isBook);
   const width=isBook?192:256,height=isBook?256:192;
   if(top.canvas.width!==width||top.canvas.height!==height){top.canvas.width=width;top.canvas.height=height;}
   if(bottom.canvas.width!==width||bottom.canvas.height!==height){bottom.canvas.width=width;bottom.canvas.height=height;}
   const webglFrame = gfx&&isBook?gfx.render(visual,t,E.realMap(state),E.realItems(state)):null;
   if(isBook){ BookMode.render(top,bottom,visual,t,webglFrame); }
   else {R.render(top,bottom,state,t,{map,reduceEffects,brightness,horror:director.current(t)});if(state.mode==='rpg'&&!state.won)RetroRpg.render(top,state,t);}
   if(gfxTag&&gfxTag.textContent!=='CANVAS 2D (COMPATIBILIDAD)'&&!webglFrame&&isBook)gfxTag.textContent='CANVAS 2D (RESPALDO 3D)';
 }
 function doKey(key){act(()=>game.move(key));} // no descartar pulsaciones por reloj global
 const ARROWS=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
 const DIRECTION_KEYS={w:'ArrowUp',a:'ArrowLeft',s:'ArrowDown',d:'ArrowRight'};
 const CONTROL_KEYS={e:'interact',x:'swap',l:'light',c:'sneak',v:'decoy',m:'map'};
 function isInputBlocked(ev){
   return !!document.querySelector('dialog[open]')||ev?.target instanceof HTMLInputElement||ev?.target instanceof HTMLTextAreaElement;
 }
 function dispatchInput(action){
   if(ARROWS.has(action)){doKey(action);return;}
   if(action==='interact')act(()=>game.interact());
   else if(action==='swap')act(()=>game.swap());
   else if(action==='light')act(()=>game.toggleLight());
   else if(action==='sneak')act(()=>game.toggleCrouch());
   else if(action==='decoy')act(()=>game.throwDecoy());
   else if(action==='map'){map=!map;$('map').textContent=map?'M · Ocultar mapa':'M · Mapa';render();}
 }
 function keyAction(key){
   if(key==='Enter'||key===' ')return 'interact';
   if(ARROWS.has(key))return key;
   const normalized=key.toLowerCase();
   return DIRECTION_KEYS[normalized]||CONTROL_KEYS[normalized]||null;
 }
 document.addEventListener('keydown',ev=>{
   if(isInputBlocked(ev))return;
   if(ev.target instanceof HTMLButtonElement && ['Enter',' '].includes(ev.key))return;
   const action=keyAction(ev.key);
   if(action){ev.preventDefault();const first=inputs.press('kbd:'+ev.code,action,performance.now());if(first)dispatchInput(first);}
   else if(ev.key.toLowerCase()==='g'&&!ev.repeat){save();}
 });
 document.addEventListener('keyup',ev=>inputs.release('kbd:'+ev.code));
 window.addEventListener('blur',()=>inputs.clear());
 function bindInstantButton(btn,action,repeat){
   // pointerdown = respuesta inmediata (ratón y táctil), sin esperar al clic de liberación.
   // El click posterior no repite una acción ya enviada; click de teclado sí funciona.
   btn.addEventListener('pointerdown',ev=>{
     if(ev.button!==0||btn.disabled||isInputBlocked(ev))return;
     pointerHandled.set(btn,true);
     if(repeat){
       const source='pointer:'+(btn.id||btn.dataset.dir);
       const first=inputs.press(source,action,performance.now());
       if(first)dispatchInput(first);
       try{btn.setPointerCapture(ev.pointerId);}catch{}
     }else dispatchInput(action);
   });
   if(repeat){
     const end=()=>inputs.release('pointer:'+(btn.id||btn.dataset.dir));
     btn.addEventListener('pointerup',end);
     btn.addEventListener('pointercancel',()=>{end();pointerHandled.delete(btn);});
     btn.addEventListener('lostpointercapture',end);
   }
   btn.addEventListener('click',ev=>{
     if(pointerHandled.get(btn)){pointerHandled.delete(btn);return;}
     if(!btn.disabled&&!isInputBlocked(ev))dispatchInput(action);
   });
 }
 document.querySelectorAll('[data-dir]').forEach(btn=>bindInstantButton(btn,btn.dataset.dir,true));
 for(const [id,action] of [['interact','interact'],['swap','swap'],['light','light'],['sneak','sneak'],['decoy','decoy'],['map','map']]){
   bindInstantButton($(id),action,false);
 }
 $('cameraMode').addEventListener('click',()=>{camera.setEnabled(!camera.isEnabled);$('cameraMode').textContent='Cámara: '+(camera.isEnabled?'fluida':'clásica');$('cameraMode').setAttribute('aria-pressed',String(camera.isEnabled));render();});
 for(const [id,delta] of [['lookLeft',-.21],['lookRight',.21]])$(''+id).addEventListener('click',()=>{if(game.state().mode==='real'&&!game.state().won){camera.look(delta,0);render();}});
 $('lookCenter').addEventListener('click',()=>{camera.center();render();});
 // Arrastrar dentro de las pantallas modifica SOLO el ángulo visual.
 // Nunca mueve la partida ni captura los botones de la interfaz.
 let drag=null;
 for(const screen of [top.canvas,bottom.canvas]){
   screen.style.touchAction='none';
   screen.addEventListener('pointerdown',ev=>{if(ev.button!==0||game.state().mode!=='real'||game.state().won)return;drag={id:ev.pointerId,x:ev.clientX,y:ev.clientY};try{screen.setPointerCapture(ev.pointerId);}catch{}});
   screen.addEventListener('pointermove',ev=>{if(!drag||drag.id!==ev.pointerId)return;camera.look((ev.clientX-drag.x)*.0055,-(ev.clientY-drag.y)*.0035);drag.x=ev.clientX;drag.y=ev.clientY;render();});
   const end=ev=>{if(drag?.id===ev.pointerId)drag=null;};
   screen.addEventListener('pointerup',end);screen.addEventListener('pointercancel',end);screen.addEventListener('lostpointercapture',end);
 }
 function save(){try{localStorage.setItem(KEY,JSON.stringify(game.state()));localStorage.setItem(MANUAL_TIME_KEY,String(Date.now()));notify('Partida guardada manualmente.')}catch(e){notify('No se pudo guardar: almacenamiento no disponible.')}render();}
 function load(){try{
    const current=localStorage.getItem(KEY), old=!current&&PREVIOUS_KEYS.map(k=>localStorage.getItem(k)).find(Boolean), raw=current||old;
    if(!raw){notify('No hay partida guardada.');return false;}
    if(game.load(JSON.parse(raw))){director.clear();
      if(old) {localStorage.setItem(KEY,JSON.stringify(game.state()));notify('Partida anterior importada a v0.9. El Día 4 está disponible tras completar el Día 3.');}
      else notify('Partida restaurada.');
      flush();render();return true;
    }
    notify('El guardado es incompatible o esta danado.');return false;
  }catch(e){notify('No se pudo abrir la partida guardada.');return false;}}
 $('save').addEventListener('click',save);$('load').addEventListener('click',load);
 $('recoverAuto').addEventListener('click',recoverAuto);
 // Copias portables. Nunca se envían datos a un servidor.
 function exportSave(){
   try {
     const data=JSON.stringify(game.state(),null,2);
     const blob=new Blob([data],{type:'application/json'});
     const url=URL.createObjectURL(blob);
     const link=document.createElement('a');
     link.href=url;link.download='NAMELESS-404-dia-'+game.state().day+'-partida.json';
     document.body.appendChild(link);link.click();link.remove();
     setTimeout(()=>URL.revokeObjectURL(url),1000);
     notify('Copia JSON descargada. Guárdala en un lugar seguro.');
   } catch(e){notify('No se pudo exportar la partida.');}
 }
 async function importSaveFile(file){
   if(!file){return false;}
   if(file.size>131072){notify('Archivo rechazado: supera 128 KiB.');return false;}
   try{
     const data=JSON.parse(await file.text());
     if(!game.load(data)){notify('Partida inválida o incompatible. No se ha modificado el progreso.');return false;}
     director.clear();$('omenStatus').textContent='PRESAGIO · EN ESPERA';
     flush();render();
     requestAuto();notify('Partida importada. Pulsa Guardar para conservarla manualmente.');
     return true;
   }catch(e){notify('No se pudo leer el JSON. El progreso actual permanece intacto.');return false;}
 }
 $('exportSave').addEventListener('click',exportSave);
 $('importSave').addEventListener('click',()=>$('importFile').click());
 $('importFile').addEventListener('change',async ev=>{
   const input=ev.currentTarget;
   await importSaveFile(input.files?.[0]);
   input.value='';
 });
 $('restart').addEventListener('click',()=>{if(window.confirm('¿Empezar una partida nueva? El guardado anterior se conservará hasta que vuelvas a guardar.')){director.clear();act(()=>game.reset());}});
 $('audio').addEventListener('click',()=>{
  audio=!audio;$('audio').textContent='Audio: '+(audio?'sí':'no');
  if(audio){try{
     ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();ctx.resume();
     osc=ctx.createOscillator();hum=ctx.createOscillator();master=ctx.createGain();
     filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=450;
     osc.type='sine';hum.type='triangle';osc.frequency.value=44;hum.frequency.value=59;
     master.gain.value=.007;osc.connect(filter);hum.connect(filter);filter.connect(master);master.connect(ctx.destination);
     // Ruido de cinta de baja intensidad, sintetizado localmente y sin archivos de terceros.
     const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);
     let seed=8844;for(let i=0;i<data.length;i++){seed=(1664525*seed+1013904223)>>>0;data[i]=(seed/2147483648-1)*.17;}
     noise=ctx.createBufferSource();noise.buffer=buffer;noise.loop=true;
     hiss=ctx.createGain();hiss.gain.value=.003;noise.connect(hiss).connect(master);
     osc.start();hum.start();noise.start();premiumAudio.start(ctx);tone(400,.14);
  }catch{notify('Este dispositivo no admite audio Web Audio.');audio=false;$('audio').textContent='Audio: no';}}
  else{premiumAudio.stop();try{osc?.stop();hum?.stop();noise?.stop();osc?.disconnect();hum?.disconnect();noise?.disconnect();hiss?.disconnect();filter?.disconnect();master?.disconnect();}catch{}osc=null;hum=null;noise=null;hiss=null;filter=null;master=null;}
 });
 let gpuProbeResult=null;
 $('diagnostics').addEventListener('click',()=>{const box=$('diagnosticsPanel');box.hidden=!box.hidden;if(!box.hidden)gpuProbeResult=probeWebGL2();updateDiagnostics();});
 function updateDiagnostics(){
   const d=$('diagnosticsText');
   if(!d||$('diagnosticsPanel').hidden)return;
   let webgl2=false;
   try {const sample=document.createElement('canvas');webgl2=!!sample.getContext('webgl2');}catch(e){}
   d.textContent='Versión: 0.31.0 · Cinematic Camera · Entrada: inmediata\n'+'Renderer: '+(gfxTag?.textContent||'DESCONOCIDO')+'\n'
     +'WebGL2 disponible: '+(webgl2?'SÍ':'NO')+'\n'
     +'Resolución interna: '+(game.state().mode==='real'&&!game.state().won?'384 × 256 (192 × 256 por pantalla)':'256 × 192')+'\n'
     +'FPS presentación: '+(measuredFps||'calculando…')+' (objetivo 30)\n'
     +'Modo: '+game.state().mode+' · Día: '+game.state().day+'\nPresagios: '+(director.getEnabled()?'ACTIVOS':'DESACTIVADOS')
     +(gfx?.checkFrame && game.state().mode==='real' && !game.state().won?(()=>{const frame=gfx.checkFrame();return '\nLectura framebuffer WebGL2: '+(frame.ok?'PASS':'NO')+' · '+frame.message+(frame.rgba.length?' · RGB '+frame.rgba.slice(0,3).join(','):'');})():'')
     +(gpuProbeResult?'\nPrueba GPU local: '+(gpuProbeResult.available?'WebGL2':'NO DISPONIBLE')+' · shader '+(gpuProbeResult.shader?'PASS':'NO')+' · píxel '+(gpuProbeResult.pixel?'PASS':'NO')+'\n'+gpuProbeResult.message:'');
 }
 $('focusMode').addEventListener('click',()=>{immersive=!immersive;document.body.classList.toggle('focus-mode',immersive);$('focusMode').textContent='Modo inmersivo: '+(immersive?'sí':'no');$('focusMode').setAttribute('aria-pressed',String(immersive));});
 $('omens').addEventListener('click',()=>{director.setEnabled(!director.getEnabled());$('omens').textContent='Presagios: '+(director.getEnabled()?'sí':'no');$('omens').setAttribute('aria-pressed',String(director.getEnabled()));$('omenStatus').textContent='PRESAGIO · '+(director.getEnabled()?'EN ESPERA':'DESACTIVADOS');render();});
 $('effects').addEventListener('click',()=>{reduceEffects=!reduceEffects;$('effects').textContent='Destellos: '+(reduceEffects?'no':'sí');render();});
 $('brightness').addEventListener('click',()=>{brightness=brightness==='normal'?'alto':'normal';$('brightness').textContent='Brillo: '+brightness;$('brightness').setAttribute('aria-pressed',String(brightness==='alto'));render();});
 $('help').addEventListener('click',()=>{$('helpDialog').showModal();});$('helpClose').addEventListener('click',()=>$('helpDialog').close());
 $('start').addEventListener('click',()=>{$('introDialog').close();director.clear();act(()=>game.reset());});
 $('continue').addEventListener('click',()=>{
   $('introDialog').close();
   let savedAt=0, manualAt=0;
   try {savedAt=JSON.parse(localStorage.getItem(AUTO_KEY)||'null')?.savedAt||0;manualAt=Number(localStorage.getItem(MANUAL_TIME_KEY)||0);}catch(e){}
   if(savedAt>manualAt && recoverAuto())return;
   if(!load() && !recoverAuto())act(()=>game.reset());
 });
 const canModal=typeof HTMLDialogElement!=='undefined'&&typeof $('introDialog').showModal==='function';
 if(canModal)$('introDialog').showModal();else notify('DÍA 1: explora el cartucho con X.');
 const motionReduce=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 if(!motionReduce){reduceEffects=true;}
 // Controles de mando: cruceta o stick, botones estándar y prevención de repetición involuntaria.
 function pollGamepad(now){
   // El estado se comprueba a 30-60 Hz; no se espera 85 ms para responder.
   if(now-padPollAt<22)return;
   padPollAt=now;
   let pad;
   try{pad=Array.from(navigator.getGamepads?.()||[]).find(p=>p&&p.connected!==false);}catch(e){pad=null;}
   if(!pad){
     if(gamepadActive){gamepadActive=false;$('gamepadStatus').textContent='MANDO · Desconectado';}
     inputs.release('gamepad');return;
   }
   if(!gamepadActive){gamepadActive=true;$('gamepadStatus').textContent='MANDO · Conectado';}
   const pressed=i=>!!pad.buttons?.[i]?.pressed;
   let action='';
   if(pressed(12)||pad.axes?.[1]<-.55)action='ArrowUp';
   else if(pressed(13)||pad.axes?.[1]>.55)action='ArrowDown';
   else if(pressed(14)||pad.axes?.[0]<-.55)action='ArrowLeft';
   else if(pressed(15)||pad.axes?.[0]>.55)action='ArrowRight';
   else if(pressed(0))action='interact';
   else if(pressed(2))action='swap';
   else if(pressed(3))action='light';
   else if(pressed(9))action='map';
   else if(pressed(4))action='sneak';
   else if(pressed(5))action='decoy';
   if(action){const first=inputs.press('gamepad',action,now);if(first)dispatchInput(first);}
   else inputs.release('gamepad');
 }
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){inputs.clear();if(autoTimer!==null){clearTimeout(autoTimer);autoTimer=null;}autoWrite(true);}});
 window.addEventListener('pagehide',()=>autoWrite(true));
 function animate(now){
   // Estética y efectos visuales independientes del avance de la simulación.
   if(document.visibilityState==='visible'){
     if(document.querySelector('dialog[open]'))inputs.clear();
     else {pollGamepad(now);for(const action of inputs.repeat(now))dispatchInput(action);}
     if(now-t0>100){
       t0=now;if(game.tick()){flush();requestAuto();}
       if(audio&&ctx&&master&&hum&&osc){
         const st=game.state();const k=st.mode==='real'?(st.room==='SOTANO TECNICO'||st.day>=2?1.3:1):.42;
         const o=director.current(now);
         const silence=o&&(o.kind==='hollow'||o.kind==='absence')?.27:1;
         master.gain.setTargetAtTime((.004+st.threat/18000)*k*silence,ctx.currentTime,.19);
         hum.frequency.setTargetAtTime((st.day===5?39:st.day===4?43:st.day===3?47:st.day===2?52:59)+(st.threat/8)+(st.room==='ALA ESTE'?2:0),ctx.currentTime,.24);
         filter?.frequency.setTargetAtTime(st.mode==='rpg'?290:(240+st.threat*5),ctx.currentTime,.3);
         hiss?.gain.setTargetAtTime(st.day===5?.016:st.day===4?.015:st.day===3?.013:st.day===2?.010:.004,ctx.currentTime,.4);
         osc.frequency.setTargetAtTime(st.mode==='rpg'?49:42,ctx.currentTime,.3);
         // A slow heartbeat is perceived as a warning instead of a jump scare;
         // its cadence follows the danger level, never the render FPS.
         premiumAudio.update(st,now);
         if(st.mode==='real'&&st.chase&&st.threat>55&&now-lastHeartbeat>Math.max(460,980-st.threat*4)){
           sound('heartbeat');lastHeartbeat=now;
         }
       }
     }
     // Render independiente de la simulación (10 Hz); limitador a ~30 FPS.
     if(now-lastFrame>=33){lastFrame=now;render(now);frames++;}
     if(now-counterStart>=1000){
       measuredFps=Math.round(frames*1000/(now-counterStart));
       counterStart=now;frames=0;updateDiagnostics();
     }
   }
   requestAnimationFrame(animate);
 }
 flush();render();requestAnimationFrame(animate);
 globalThis.__namelessDebug={state:()=>game.state(), game, render,save,load,autoWrite,recoverAuto,exportSave,importSaveFile,renderer:()=>gfx?.status()??'canvas-fallback', director,premiumAudio,inputs,camera,view:()=>lastCameraView}; // pruebas automatizadas locales
}
