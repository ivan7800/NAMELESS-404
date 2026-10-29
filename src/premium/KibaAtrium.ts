/** NAMELESS 404 v0.30 — Vestíbulo como conjunto espacial autoral.
 * El suelo y el techo ocupan 15 casillas transitables; los muebles quedan
 * junto a paredes sólidas y la banda central sigue libre para los controles.
 * Geometría compartida por WebGL2 nativo y Three.js; atriumTextureCache propio para Canvas2D.
 * Ni la campaña ni el mapa de colisiones se modifican.
 */
import type {KibaProp,KibaColor} from './KibaVisuals.js';
export type AtriumPanelKind='directory'|'clock'|'switchboard'|'memorial';
export interface AtriumPanel {
  readonly id:AtriumPanelKind;readonly x:number;readonly z:number;
  readonly side:'N'|'S'|'E'|'W';readonly title:string;
}
export const KIBA_ATRIUM_PANELS:readonly AtriumPanel[]=[
 {id:'directory',x:1,z:1,side:'N',title:'PLANO DEL EDIFICIO / 1996'},
 {id:'clock',x:5,z:1,side:'N',title:'RELOJ DETENIDO'},
 {id:'switchboard',x:1,z:2,side:'W',title:'CUADRO DE LLAMADAS'},
 {id:'memorial',x:4,z:3,side:'S',title:'LISTA DE AUSENTES'}
];
export const KIBA_ATRIUM_CELLS:readonly (readonly [number,number])[] = [
 [1,1],[2,1],[3,1],[4,1],[5,1],
 [1,2],[2,2],[3,2],[4,2],[5,2],
 [1,3],[2,3],[3,3],[4,3],[5,3]
];
const ATRIUM_COLORS={
 floor:[.20,.29,.26],seam:[.10,.15,.15],ceramic:[.43,.49,.39],dark:[.065,.105,.11],
 concrete:[.30,.37,.34],marble:[.48,.47,.37],rust:[.38,.24,.18],brass:[.66,.54,.29],
 green:[.27,.46,.38],glass:[.17,.30,.30],paper:[.73,.68,.52],light:[.84,.85,.61],
 paint:[.48,.52,.42],wood:[.27,.20,.15],red:[.58,.23,.18]
} as const satisfies Record<string,KibaColor>;
const atriumIsOpen=(map:readonly string[],x:number,z:number)=>map[z]?.[x]!==undefined&&map[z][x]!=='#';
export function isAtriumCell(map:readonly string[],x:number,z:number):boolean{
 return x>=1&&x<=5&&z>=1&&z<=3&&atriumIsOpen(map,x,z);
}
export function validAtriumPanel(map:readonly string[],p:AtriumPanel):boolean{
 const dx=p.side==='E'?1:p.side==='W'?-1:0;
 const dz=p.side==='S'?1:p.side==='N'?-1:0;
 return isAtriumCell(map,p.x,p.z)&&map[p.z+dz]?.[p.x+dx]==='#';
}
export function buildKibaAtrium(map:readonly string[]):KibaProp[]{
 const a:KibaProp[]=[];
 const box=(id:string,x:number,y:number,z:number,width:number,height:number,depth:number,color:KibaColor,emissive=false)=>{
  if(![x,y,z,width,height,depth].every(Number.isFinite)||width<=0||height<=0||depth<=0)throw Error('Atrium geometry invalid: '+id);
  a.push({id:'atrium-'+id,x,y,z,width,height,depth,color,emissive});
 };
 for(const [x,z] of KIBA_ATRIUM_CELLS){
  if(!isAtriumCell(map,x,z))continue;
  const cx=x+.5,cz=z+.5;
  // Conjuntos completos de suelo, techo y borde de baldosas; las ranuras
  // se recortan dentro de la casilla, no crean física ni paredes invisibles.
  box(`tile-${x}-${z}`,cx,.023,cz,.973,.014,.973,((x+z)%4===0)?ATRIUM_COLORS.ceramic:ATRIUM_COLORS.floor);
  box(`joint-long-${x}-${z}`,cx,.034,z+.965,.971,.004,.018,ATRIUM_COLORS.seam);
  box(`joint-cross-${x}-${z}`,x+.965,.035,cz,.018,.004,.970,ATRIUM_COLORS.seam);
  if((x*5+z*7)%4===0){
   box(`repair-${x}-${z}`,cx+.21,.037,cz-.14,.22,.004,.16,ATRIUM_COLORS.rust);
   box(`repair-border-${x}-${z}`,cx+.21,.041,cz-.14,.18,.003,.018,ATRIUM_COLORS.marble);
  }
  box(`ceiling-${x}-${z}`,cx,2.345,cz,.975,.028,.975,ATRIUM_COLORS.concrete);
  box(`coffer-${x}-${z}`,cx,2.315,cz,.82,.026,.82,ATRIUM_COLORS.dark);
  box(`inner-ceiling-${x}-${z}`,cx,2.305,cz,.74,.018,.74,ATRIUM_COLORS.concrete);
  if((x+z)%3===0){
   box(`luminance-${x}-${z}`,cx,2.290,cz,.44,.018,.11,ATRIUM_COLORS.light,true);
   box(`light-case-${x}-${z}`,cx,2.300,cz,.50,.038,.18,ATRIUM_COLORS.brass);
  }
  // Rodapiés y molduras solo en caras interiores de muros reales.
  for(const [side,dx,dz] of [['N',0,-1],['S',0,1],['W',-1,0],['E',1,0]] as const){
   if(atriumIsOpen(map,x+dx,z+dz))continue;
   const ns=side==='N'||side==='S';
   const wx=ns?cx:(side==='W'?x+.045:x+.955);
   const wz=ns?(side==='N'?z+.045:z+.955):cz;
   box(`base-${x}-${z}-${side}`,wx,.15,wz,ns?.90:.042,.28,ns?.042:.90,ATRIUM_COLORS.marble);
   box(`upper-${x}-${z}-${side}`,wx,2.16,wz,ns?.90:.04,.12,ns?.04:.90,ATRIUM_COLORS.brass);
   box(`wall-wainscot-${x}-${z}-${side}`,wx,.79,wz,ns?.87:.025,1.03,ns?.025:.87,ATRIUM_COLORS.paint);
   box(`wainscot-line-${x}-${z}-${side}`,wx,1.33,wz,ns?.87:.034,.028,ns?.034:.87,ATRIUM_COLORS.dark);
   if((x+z)%2===0){
    box(`rust-stain-${x}-${z}-${side}`,wx,.70,wz+(ns?.012:0),ns?.22:.028,.24,ns?.028:.22,ATRIUM_COLORS.rust);
   }
  }
 }
 for(const p of KIBA_ATRIUM_PANELS){
  if(!validAtriumPanel(map,p))continue;
  const ns=p.side==='N'||p.side==='S';
  const px=p.x+.5,pz=p.z+.5;
  const wall=(v:number)=>({x:ns?px:(p.side==='W'?p.x+v:p.x+1-v),z:ns?(p.side==='N'?p.z+v:p.z+1-v):pz});
  const b=(name:string,u:number,y:number,v:number,w:number,h:number,d:number,color:KibaColor,emissive=false)=>{
   const q=wall(v);box(`panel-${p.id}-${name}`,ns?q.x+u:q.x,y,ns?q.z:q.z+u,ns?w:d,h,ns?d:w,color,emissive);
  };
  b('surround',0,1.35,.075,.88,1.48,.09,ATRIUM_COLORS.dark);
  b('frame',0,1.39,.126,.82,1.35,.05,ATRIUM_COLORS.brass);
  b('face',0,1.39,.157,.73,1.22,.019,ATRIUM_COLORS.concrete);
  b('header',0,2.03,.175,.71,.12,.02,ATRIUM_COLORS.paper);
  b('sconce',0,2.15,.183,.40,.035,.045,ATRIUM_COLORS.light,true);
  if(p.id==='directory'){
   for(let i=0;i<5;i++){
    b('list-'+i,-.04,1.76-i*.17,.18,.52,.035,.014,i===4?ATRIUM_COLORS.red:ATRIUM_COLORS.paper);
    b('node-'+i,-.31,1.76-i*.17,.182,.038,.045,.014,ATRIUM_COLORS.brass);
   }
   b('floorplan',.22,.91,.19,.23,.25,.016,ATRIUM_COLORS.green);
   b('floorplan-route',.24,.92,.205,.038,.18,.01,ATRIUM_COLORS.paper);
  } else if(p.id==='clock'){
   b('blackclock',0,1.56,.20,.53,.53,.05,ATRIUM_COLORS.dark);
   b('dial',0,1.56,.24,.43,.43,.02,ATRIUM_COLORS.paper);
   b('clockhand',-.045,1.61,.26,.022,.19,.012,ATRIUM_COLORS.red);
   b('clockminute',.06,1.54,.268,.16,.020,.012,ATRIUM_COLORS.rust);
   b('certificate',0,.94,.20,.60,.17,.014,ATRIUM_COLORS.paper);
   b('bloodmark',.21,.94,.212,.12,.042,.014,ATRIUM_COLORS.red);
  } else if(p.id==='switchboard'){
   for(let i=0;i<4;i++)for(let j=0;j<3;j++){
    b(`jack-${i}-${j}`,-.24+j*.23,1.86-i*.21,.194,.12,.11,.025,(i===3&&j===1)?ATRIUM_COLORS.red:ATRIUM_COLORS.green);
    b(`jack-center-${i}-${j}`,-.24+j*.23,1.86-i*.21,.210,.043,.046,.012,ATRIUM_COLORS.dark);
   }
   b('handset',.22,.86,.23,.37,.12,.11,ATRIUM_COLORS.wood);
  } else {
   for(let i=0;i<5;i++){
    b('name-slip-'+i,0,1.82-i*.20,.187,.61,.12,.015,i%2?ATRIUM_COLORS.marble:ATRIUM_COLORS.paper);
    b('redact-'+i,(i%2?-.05:.12),1.82-i*.20,.203,.20,.03,.012,ATRIUM_COLORS.dark);
   }
   b('unlisted',0,.76,.20,.50,.12,.018,ATRIUM_COLORS.red);
  }
 }
 return a;
}
const atriumTextureCache=new Map<AtriumPanelKind,HTMLCanvasElement>();
export function kibaAtriumTexture(kind:AtriumPanelKind):HTMLCanvasElement{
 const cached=atriumTextureCache.get(kind);if(cached)return cached;
 const c=document.createElement('canvas');c.width=224;c.height=288;
 const g=c.getContext('2d')!;g.imageSmoothingEnabled=false;
 const box=(x:number,y:number,w:number,h:number,col:string)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
 const ink=(s:string,x:number,y:number,size=11,col='#d6d0ac')=>{g.fillStyle=col;g.font=`bold ${size}px monospace`;g.fillText(s,x,y);};
 box(0,0,224,288,'#26302a');
 for(let i=0;i<160;i++){const x=(i*47+i*i*13)%224,y=(i*97+i*i*3)%288;box(x,y,1+i%3,1,i%4?'#73806b35':'#121d1c49');}
 box(4,4,216,280,'#1c2525');box(7,7,210,274,'#617061');box(12,12,200,264,'#27332f');
 box(12,12,200,40,'#121b1c');ink('KIBA / ACCESO 01',19,28,17,'#d4c89f');ink('NO MIRE A LA CAMARA',19,44,9,'#b58678');
 if(kind==='directory'){
  ink('DIRECTORIO',24,74,18);box(24,84,177,3,'#8b926c');
  for(let i=0;i<6;i++){const y=103+i*23;box(28,y,168,17,i%2?'#354c43':'#485b4e');ink('0'+i+'   '+['VESTIBULO','ARCHIVO','DESPACHOS','VIGILANCIA','SOTANO','SIN REGISTRO'][i],34,y+12,10,i===5?'#d7a19a':'#d0d0b7');}
  box(40,249,144,16,'#492a29');ink('PLANTA INEXISTENTE',45,260,10,'#e1b4aa');
 }else if(kind==='clock'){
  ink('HORA OFICIAL',28,74,16);g.strokeStyle='#a3a78a';g.lineWidth=7;g.beginPath();g.arc(112,151,67,0,Math.PI*2);g.stroke();
  g.strokeStyle='#e3d3ae';g.lineWidth=2;g.beginPath();g.arc(112,151,54,0,Math.PI*2);g.stroke();
  for(let i=0;i<12;i++){const a=i*Math.PI/6;box(108+Math.sin(a)*47,147-Math.cos(a)*47,5,6,'#bbbba0');}
  g.strokeStyle='#a84e43';g.lineWidth=5;g.beginPath();g.moveTo(112,151);g.lineTo(112,113);g.moveTo(112,151);g.lineTo(140,154);g.stroke();
  ink('04 : 04',73,253,18,'#d7b5a6');
 }else if(kind==='switchboard'){
  ink('CENTRALITA / 0',23,75,16);for(let i=0;i<4;i++)for(let j=0;j<3;j++){
   const x=30+j*61,y=96+i*35;box(x,y,49,27,'#46584f');box(x+6,y+5,36,17,'#102123');box(x+15,y+10,12,8,i===3&&j===1?'#a95547':'#6ca083');}
  box(34,247,151,22,'#1a1b1d');ink('LLAMADA: 04:04',41,263,12,'#d0b997');
 }else{
  ink('NO CONSTA / 2006',20,75,16);for(let i=0;i<5;i++){
   const y=96+i*32;box(23,y,180,24,'#b7b29c');ink('K-'+String(40+i)+' / '+(i===3?'________':'NOMBRE BORRADO'),30,y+16,10,'#343a35');box(72,y+10,110,6,'#24302c');}
  box(28,260,168,15,'#673633');ink('FALTAN DOS PERSONAS',34,271,10,'#e0baab');
 }
 atriumTextureCache.set(kind,c);return c;
}
