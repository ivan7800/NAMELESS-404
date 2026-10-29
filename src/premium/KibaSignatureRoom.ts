/** NAMELESS 404 v0.27: Sala de Vigilancia de Kiba, diseño 100% original.
 * Una escena de referencia premium: consola de vídeo, 3 CRT, archivadores,
 * casetes, anotaciones, señales, lámparas. La pared es real y el mueble no
 * modifica colisiones ni puede aparecer sobre un hueco abierto.
 */
import type {KibaProp,KibaColor} from './KibaVisuals.js';
export const KIBA_SIGNATURE={x:2.5,z:1.07,cellX:2,cellZ:1} as const;
const SIGNATURE_COLORS={
 metal:[.25,.31,.30],dark:[.055,.085,.09],wood:[.28,.22,.17],paper:[.73,.69,.54],
 glow:[.34,.72,.60],rubber:[.12,.16,.17],red:[.65,.22,.16],brass:[.51,.43,.25],
 dust:[.43,.43,.37],blue:[.19,.39,.44]
} as const satisfies Record<string,KibaColor>;
export function isSignatureRoomValid(map:readonly string[]):boolean{
 return map[1]?.[2]!==undefined&&map[1][2]!=='#'&&map[0]?.[2]==='#';
}
export function buildSignatureRoom(map:readonly string[]):KibaProp[]{
 if(!isSignatureRoomValid(map))return [];
 const parts:KibaProp[]=[];
 const put=(id:string,x:number,y:number,depth:number,w:number,h:number,d:number,color:KibaColor,emissive=false)=>{
  parts.push({id:'signature-'+id,x:KIBA_SIGNATURE.x+x,y,z:1+depth,width:w,height:h,depth:d,color,emissive});
 };
 // The depth of every component stays within 0.44 m of the north wall.
 put('backplate',0,1.28,.017,.89,1.66,.035,SIGNATURE_COLORS.metal);
 put('backboard',0,1.43,.039,.83,1.25,.03,SIGNATURE_COLORS.dark);
 put('header',0,2.02,.059,.86,.14,.035,SIGNATURE_COLORS.paper);
 put('undersign',0,1.89,.068,.79,.033,.018,SIGNATURE_COLORS.red);
 for(let i=0;i<3;i++){
  const x=-.29+i*.29;
  put('screen-case-'+i,x,1.57,.111,.26,.34,.115,SIGNATURE_COLORS.metal);
  put('screen-glass-'+i,x,1.57,.176,.215,.258,.016,i===1?SIGNATURE_COLORS.blue:SIGNATURE_COLORS.glow,true);
  put('screen-sweep-'+i,x,1.59,.186,.17,.02,.009,SIGNATURE_COLORS.paper,true);
  for(let j=0;j<3;j++)put(`screen-signal-${i}-${j}`,x-.06+j*.048,1.50+j*.025,.189,.033,.009,.008,SIGNATURE_COLORS.dark);
  put('screen-led-'+i,x+.10,1.39,.186,.027,.023,.012,i===2?SIGNATURE_COLORS.red:SIGNATURE_COLORS.brass,true);
 }
 put('desk',0,.82,.268,.92,.09,.34,SIGNATURE_COLORS.wood);
 put('desk-edging',0,.87,.276,.92,.018,.36,SIGNATURE_COLORS.brass);
 for(const x of [-.38,.38]){
  put('desk-leg-'+x,x,.42,.30,.064,.78,.11,SIGNATURE_COLORS.metal);
  for(let j=0;j<2;j++)put('drawer-'+x+'-'+j,x,.48+j*.23,.405,.17,.20,.016,SIGNATURE_COLORS.metal);
 }
 put('cassette-deck',-.10,1.02,.29,.40,.18,.20,SIGNATURE_COLORS.dark);
 put('cassette-window',-.10,1.05,.395,.26,.075,.011,SIGNATURE_COLORS.blue);
 for(let i=0;i<2;i++){
  const x=-.20+i*.20;
  put('cassette-hub-'+i,x,1.07,.402,.048,.045,.013,SIGNATURE_COLORS.paper);
 }
 put('deck-led',-.27,1.00,.405,.027,.022,.01,SIGNATURE_COLORS.red,true);
 put('log-book',.28,.93,.29,.24,.018,.15,SIGNATURE_COLORS.paper);
 put('pen',.30,.946,.29,.013,.02,.19,SIGNATURE_COLORS.brass);
 put('cable-trunk',-.43,1.18,.20,.026,.75,.025,SIGNATURE_COLORS.rubber);
 put('cable-hub',.41,1.19,.21,.031,.70,.035,SIGNATURE_COLORS.rubber);
 for(let j=0;j<5;j++){
  const x=-.4+j*.19;
  put('vent-'+j,x,.21,.035,.13,.036,.02,SIGNATURE_COLORS.dark);
 }
 return parts;
}
/** One prerendered canvas texture for the fallback: detailed paintwork is
 * authored once, then projected and depth-checked each visible frame. */
let signatureArtCache:HTMLCanvasElement|null=null;
export function signatureTexture():HTMLCanvasElement{
 if(signatureArtCache)return signatureArtCache;
 signatureArtCache=document.createElement('canvas');signatureArtCache.width=256;signatureArtCache.height=336;
 const c=signatureArtCache.getContext('2d')!; c.imageSmoothingEnabled=false;
 const box=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 const stroke=(x:number,y:number,w:number,h:number,color:string)=>{c.strokeStyle=color;c.lineWidth=2;c.strokeRect(x,y,w,h);};
 const txt=(s:string,x:number,y:number,size=10,col='#c6c9aa')=>{c.fillStyle=col;c.font=`bold ${size}px monospace`;c.fillText(s,x,y);};
 // Scuffed steel behind the monitors, weathering is fixed—not frame-noise.
 box(0,0,256,336,'#202a27');
 for(let y=0;y<336;y+=3){const v=((y*17+79)%31);box(0,y,256,1,`rgba(107,120,101,${.025+v/900})`);}
 for(let i=0;i<170;i++){
  const x=(i*139+37)%256,y=(i*71+i*i*13)%336;
  box(x,y,2+i%5,1,i%4===0?'#8e917324':'#060e112c');
 }
 box(8,8,240,47,'#0c1718');stroke(8,8,240,47,'#73847b');
 box(13,13,230,4,'#70857a');txt('KIBA  /  SEGURIDAD',18,34,17,'#d5d2ad');
 txt('ESTACION 01     04:04',18,48,10,'#9eaf9b');
 for(let i=0;i<3;i++){
  const x=12+i*79;
  box(x,67,75,123,'#0d1315');stroke(x,67,75,123,'#87938a');
  box(x+5,73,65,101,i===1?'#102b31':'#0a2924');
  // CCTV-like geometric corridors, decreasing trapezoid lines and doors.
  for(let k=0;k<6;k++){
   const inset=k*4;
   stroke(x+9+inset,82+inset,57-inset*2,68-inset*2,`rgba(103,190,157,${.21+k*.042})`);
  }
  box(x+9,133,55,2,i===1?'#69898b':'#65a58a');
  box(x+9,145+(i%2)*11,30,1,'#c0b39a');
  box(x+7,177,61,10,'#172321');txt('CAM '+(i+1),x+13,185,9,'#a5a98c');
  box(x+68,177,3,3,i===2?'#ba453d':'#96b678');
 }
 // Deck, twin reels, moving-image illusion from fixed layers.
 box(6,200,244,120,'#3c3027');box(6,200,244,5,'#9d8a65');
 box(10,210,158,98,'#0c191b');stroke(10,210,158,98,'#6a766d');
 box(18,219,142,53,'#284247');
 for(const [cx,cy] of [[60,244],[119,244]]){
  c.strokeStyle='#ccc9a7';c.lineWidth=4;c.beginPath();c.arc(cx,cy,19,0,Math.PI*2);c.stroke();
  c.fillStyle='#181d1f';c.beginPath();c.arc(cx,cy,6,0,Math.PI*2);c.fill();
  for(let a=0;a<6;a++){const t=a*Math.PI/3;c.strokeStyle='#6b7971';c.lineWidth=2;c.beginPath();c.moveTo(cx+Math.cos(t)*9,cy+Math.sin(t)*9);c.lineTo(cx+Math.cos(t)*17,cy+Math.sin(t)*17);c.stroke();}
 }
 txt('PLAY >  REC 04',19,290,11,'#c6d2ba');box(140,280,8,7,'#ba4d46');
 // Handwritten evidence sheet and smeared pencil strokes.
 box(176,209,69,98,'#b4b09a');box(178,214,65,4,'#d4d0b6');
 txt('NOMBRE:',181,233,9,'#333e3b');txt('________',181,245,10,'#404945');
 txt('04/04',183,263,10,'#604843');
 for(let j=0;j<5;j++)box(182,272+j*5,36+j%2*11,1,'#5f6560');
 box(0,323,256,13,'#141c1b');txt('NO REBOBINAR',67,333,10,'#9b6b5b');
 return signatureArtCache;
}
