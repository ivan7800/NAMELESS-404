import {DAY_ONE_EVIDENCE,evidenceCount} from "./DayOneStory.js";
/**
 * Dirección artística original del Día 1. Canvas2D a 256×192, también se
 * superpone a WebGL2/Three.js. No contiene activos externos ni altera estado.
 */
export interface DayOneVisualState {
 day:number;mode:string;won:boolean;rx:number;ry:number;dir:number;
 light:boolean;threat:number;steps:number;room:string;tape:boolean;photo:boolean;crouched?:boolean;
 chase:boolean;entityX:number;entityY:number;
 flags:Record<string,unknown>;
}
type Decor={x:number;y:number;kind:'placard'|'warning'|'window'|'portrait'|'pipes'|'exit'|'fluorescent'|'moth';text?:string};
const DECORS:readonly Decor[]=[
 {x:4.5,y:2.5,kind:'placard',text:'KIBA / 04'},
 {x:3.5,y:4.5,kind:'fluorescent'},
 {x:5.5,y:3.5,kind:'portrait'},
 {x:8.5,y:2.5,kind:'warning',text:'NO SALIR'},
 {x:10.5,y:3.5,kind:'window'},
 {x:12.5,y:5.5,kind:'window'},
 {x:6.5,y:9.5,kind:'placard',text:'A / 017'},
 {x:4.5,y:10.5,kind:'pipes'},
 {x:10.5,y:10.5,kind:'warning',text:'CINTA 04'},
 {x:12.5,y:10.5,kind:'moth'},
 {x:3.5,y:11.5,kind:'portrait'},
 {x:9.5,y:5.5,kind:'exit',text:'SALIDA'},
 {x:5.5,y:2.5,kind:'warning',text:'BREAKER'},
 {x:6.5,y:7.5,kind:'pipes'},
 {x:11.5,y:5.5,kind:'pipes'},
 {x:3.5,y:11.5,kind:'portrait'},
 {x:9.5,y:11.5,kind:'warning',text:'ARCHIVO'}
];
function hash(n:number):number {const v=Math.sin(n*127.171)*43758.5453;return v-Math.floor(v);}
function rect(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,col:string|CanvasGradient):void{
 c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));
}
function label(c:CanvasRenderingContext2D,t:string,x:number,y:number,size:number,col:string|CanvasGradient):void{
 c.fillStyle=col;c.font=`bold ${size}px monospace`;c.fillText(t,x,y);
}
export function projectedDecoration(s:DayOneVisualState, decor:Decor, map:readonly string[]):{x:number;size:number;distance:number}|null {
 const dx=decor.x-s.rx,dy=decor.y-s.ry,dist=Math.hypot(dx,dy);
 if(dist<.45||dist>9)return null;
 const facing=s.dir*Math.PI/2,angle=Math.atan2(dx,-dy)-facing;
 const delta=Math.atan2(Math.sin(angle),Math.cos(angle));
 if(Math.abs(delta)>.72)return null;
 // Visibility trace: no decoration may be drawn through a wall.
 for(let t=.15;t<dist-.12;t+=.10){const x=s.rx+dx*t/dist,y=s.ry+dy*t/dist;
  if(map[Math.floor(y)]?.[Math.floor(x)]==='#')return null;
 }
 const depth=dist*Math.cos(delta),x=128+153*Math.tan(delta);
 if(x< -24||x>280)return null;
 return {x,size:Math.min(90,115/Math.max(.6,depth)),distance:dist};
}
function decoration(c:CanvasRenderingContext2D,s:DayOneVisualState,o:Decor,p:{x:number;size:number;distance:number},now:number):void {
 const h=p.size,w=Math.max(5,h*.54),x=p.x-w/2,y=94-h*.52;
 switch(o.kind){
 case 'placard':
  rect(c,x-2,y+h*.20,w+4,h*.26,'#101c1d');rect(c,x,y+h*.23,w,h*.20,'#647a6d');
  label(c,o.text??'KIBA',x+2,y+h*.35,Math.max(5,Math.min(8,h*.09)),'#dce5c9');break;
 case 'warning':
  rect(c,x-2,y+h*.22,w+4,h*.30,'#2d2b2b');rect(c,x,y+h*.25,w,h*.23,'#ab8d75');
  rect(c,x+2,y+h*.27,Math.max(2,w*.16),h*.17,'#783945');
  label(c,o.text??'04',x+3,y+h*.42,Math.max(5,Math.min(8,h*.08)),'#202b2b');break;
 case 'window':{
  rect(c,x,y,w,h*.87,'#192a2d');rect(c,x+2,y+2,w-4,h*.83,'#5a706e');
  rect(c,x+4,y+4,w-8,h*.77,'#18272e');rect(c,x+w*.47,y+3,2,h*.8,'#87938b');
  rect(c,x+4,y+h*.51,w-8,2,'#687f7e');
  const show=s.photo||((Math.floor(now/2900)+Math.floor(o.x))%9===0);
  if(show){rect(c,x+w*.58,y+h*.40,w*.14,h*.18,'#b0b7a657');rect(c,x+w*.54,y+h*.55,w*.23,h*.26,'#0b1418');}
  break;}
 case 'portrait':{
  rect(c,x,y+h*.19,w,h*.58,'#463d36');rect(c,x+2,y+h*.22,w-4,h*.51,'#abb1a1');
  rect(c,x+4,y+h*.26,w-8,h*.43,'#25383b');
  rect(c,x+w*.37,y+h*.31,w*.28,h*.22,'#bcc1ac');
  rect(c,x+w*.27,y+h*.53,w*.47,h*.14,'#485952');
  if(s.photo)rect(c,x+w*.40,y+h*.34,w*.14,h*.14,'#7a353f');
  break;}
 case 'pipes':
  for(let k=0;k<3;k++){rect(c,x+k*w*.28,y,w*.11,h*.95,k===1?'#6b746a':'#485b58');rect(c,x+k*w*.28-2,y+h*.43,w*.17,2,'#a0a797');}
  break;
 case 'exit':
  rect(c,x,y+h*.12,w,h*.25,'#304941');label(c,o.text??'SALIR',x+2,y+h*.28,Math.max(5,h*.09),'#a9c4a4');
  if(s.tape)rect(c,x+w*.41,y+h*.55,w*.18,h*.34,'#040d0f');
  break;
 case 'fluorescent':
  rect(c,x,y+h*.12,w,h*.12,'#b1c3ad');rect(c,x+2,y+h*.14,w-4,2,'#e7efdc');
  rect(c,x+w*.28,y+h*.23,2,h*.65,'#566964');break;
 case 'moth':
  for(let k=0;k<5;k++){const t=now*.001+k*1.73;
   rect(c,x+Math.sin(t)*w*.3+w*.5,y+h*.22+k*h*.12,2,2,'#b9a9a05a');}
  break;
 }
}
export function drawDayOneArt(c:CanvasRenderingContext2D,s:DayOneVisualState,now:number,map:readonly string[],reduceEffects:boolean):void {
 if(s.day!==1||s.won)return;
 if(s.mode==='real'){
  // Projected environmental fixtures are aligned with world cells and occluded.
  const visible=DECORS.map(o=>({o,p:projectedDecoration(s,o,map)})).filter((v):v is {o:Decor,p:{x:number;size:number;distance:number}}=>v.p!==null);
  visible.sort((a,b)=>b.p.distance-a.p.distance);
  for(const {o,p} of visible)decoration(c,s,o,p,now);
  // Four discoverable traces have a restrained, physical presence in the world;
  // their markers disappear after inspection. No floating quest beacons.
  const found=Array.isArray(s.flags?.kibaEvidence)?s.flags.kibaEvidence as string[]:[];
  for(const clue of DAY_ONE_EVIDENCE){
   if(found.includes(clue.id))continue;
   const p=projectedDecoration(s,{x:clue.x,y:clue.y,kind:'placard'},map);
   if(!p)continue;
   const h=Math.min(15,Math.max(3,p.size*.21));
   rect(c,p.x-h*.5,99-p.size*.18,h,Math.max(2,h*.65),clue.id==='glass'?'#779d9d':'#a49a82');
   rect(c,p.x-h*.3,100-p.size*.16,h*.55,1,'#dde0bd');
  }
  // Las nuevas conexiones también se anuncian en el escenario (señales de pintura).
  const gates=[{active:s.flags?.kibaNorthOpen,x:6.5,y:2.5},{active:s.flags?.kibaArchiveOpen,x:7.5,y:7.5}];
  for(const gate of gates){if(!gate.active)continue;
   const p=projectedDecoration(s,{x:gate.x,y:gate.y,kind:'warning'},map);
   if(p){rect(c,p.x-6,101-p.size*.21,12,4,'#a9b8a0');rect(c,p.x-2,102-p.size*.20,4,2,'#273d3a');}
  }
  // Investigation changes the texture of the building: its history is visible.
  if(found.length>=2){
   c.save();c.globalAlpha=.12;
   for(let x=9;x<247;x+=31){rect(c,x,100+(x%17),2,35,'#6b3939');}
   c.restore();
  }
  // Ceiling contamination and gentle illumination, never a full-screen flash.
  c.save();c.globalAlpha=s.light?.24:.10;
  const pool=c.createRadialGradient(128,72,3,128,78,115);
  pool.addColorStop(0,'#b4d9b82b');pool.addColorStop(1,'#14242d00');
  rect(c,0,0,256,192,pool);c.restore();
  // Presence at the far end only on dramatic beats, not every fixed number of frames.
  const phase=s.flags?.copyistMemory as {phase?:string}|undefined;
  if(s.chase&&phase?.phase==='search'&&s.threat>=26&&s.threat<52){
   const breath=.5+.5*Math.sin(now*.0012);
   rect(c,237,69,6,43,`rgba(7,12,16,${(.10+breath*.11).toFixed(3)})`);
  }
  if(s.tape){label(c,'REC 04  //  SEÑAL INESTABLE',9,60,7,'#b79889');}
  // Feedback legible y discreto: acústica del suelo y decisiones tácticas.
  if(s.chase){
   const tileX=Math.floor(s.rx),tileY=Math.floor(s.ry);
   const metal=(tileY===9&&tileX>=8&&tileX<=13)||(tileX===7&&tileY>=3&&tileY<=5);
   rect(c,4,166,118,17,'#071011c9');
   label(c,s.crouched?'SIGILO · SILENCIOSO':metal?'REJILLA · RUIDO ALTO':'PASOS · AUDIBLES',8,176,7,
     s.crouched?'#acc3ad':metal?'#df9b90':'#b7ad9e');
   label(c,'TUERCAS '+Math.max(0,2-(Number(s.flags?.kibaDecoysUsed)||0))+'/2',169,176,7,'#c2b89e');
   const decoy=s.flags?.kibaDecoy as {atStep?:number}|undefined;
   if(decoy&&typeof decoy.atStep==='number'&&s.steps-decoy.atStep<11){
     rect(c,6,158,4,4,'#b7a580');label(c,'ECO',13,162,7,'#b7a580');
   }
  }
  // Tension is communicated by stable environmental cues, not a full-screen flash.
  const beats=Array.isArray(s.flags?.kibaChaseBeats)?s.flags.kibaChaseBeats as string[]:[];
  if(s.chase&&beats.includes('first-step')){
   const pulse=(Math.sin(now*.003)+1)*.5;
   c.save();c.globalAlpha=reduceEffects?.06:.10+pulse*.07;
   rect(c,4,72,248,2,'#c1aca0');rect(c,4,76,248,1,'#70484b');
   c.restore();
  }
  const count=evidenceCount(found);
  label(c,`DOCS ${count}/4`,197,12,7,'#b6b5a0');
 }else{
  // The cursed cartridge receives its own limited palette and environmental lore.
  for(let j=0;j<6;j++){
   const x=12+((j*41+13)%214),y=119+((j*23)%26);
   rect(c,x,y,9,2,j%2?'#91756b68':'#324b506a');
  }
  label(c,'KIBA OS / MEMORY COPY',10,154,7,'#9fa89b');
 }
 // Film emulation: spatially stable grain rather than random flashes.
 if(!reduceEffects){
  for(let i=0;i<26;i++){
   const x=Math.floor(hash(i*19+Math.floor(now/160))*255),y=Math.floor(hash(i*41+Math.floor(now/180))*190);
   rect(c,x,y,1,1,i%3===0?'#d0c6b538':'#04090850');
  }
 }
}
