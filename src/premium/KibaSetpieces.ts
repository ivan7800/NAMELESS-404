/** NAMELESS 404 v0.29 — cuatro espacios autorales, arte y geometría originales.
 * No se cambia el mapa del juego ni la lógica de colisiones.
 * Las piezas se adhieren a muros existentes; Canvas2D recibe atlas ilustrados.
 */
import type {KibaProp,KibaColor} from './KibaVisuals.js';
export type SetpieceKind='lobby'|'east'|'archive'|'basement';
export interface KibaSetpiece {
  readonly id:SetpieceKind; readonly cellX:number;readonly cellZ:number;
  readonly side:'N'|'E'|'W'|'S'; readonly name:string;
}
export const KIBA_SETPIECES:readonly KibaSetpiece[]=[
  {id:'lobby',cellX:4,cellZ:1,side:'N',name:'Vestíbulo — recepción de la ausencia'},
  {id:'east',cellX:14,cellZ:3,side:'E',name:'Ala este — galería de correspondencia'},
  {id:'archive',cellX:1,cellZ:8,side:'W',name:'Archivo — nombres cancelados'},
  {id:'basement',cellX:14,cellZ:11,side:'E',name:'Sótano — contador de horas'}
];
export function validKibaSetpiece(map:readonly string[],p:KibaSetpiece):boolean {
 const {cellX:x,cellZ:z,side}=p;
 const dx=side==='W'?-1:side==='E'?1:0;
 const dz=side==='N'?-1:side==='S'?1:0;
 return map[z]?.[x]!==undefined && map[z][x]!=='#' && map[z+dz]?.[x+dx]==='#';
}
export function visibleKibaSetpieces(map:readonly string[]):KibaSetpiece[]{
 return KIBA_SETPIECES.filter(p=>validKibaSetpiece(map,p));
}
const SETPIECE_COLORS={
 iron:[.24,.31,.30],ironLight:[.44,.49,.43],aged:[.45,.42,.34],paper:[.70,.66,.52],
 dark:[.055,.090,.095],fog:[.24,.41,.37],wood:[.28,.20,.15],red:[.54,.20,.18],
 brass:[.55,.44,.23],glass:[.16,.32,.34],green:[.39,.57,.45],bulb:[.71,.79,.58]
} as const satisfies Record<string,KibaColor>;
export function buildKibaSetpieces(map:readonly string[]):KibaProp[]{
 const result:KibaProp[]=[];
 for(const p of visibleKibaSetpieces(map)){
  const ns=p.side==='N'||p.side==='S';
  const ax=p.cellX+.5,az=p.cellZ+.5;
  // u across the wall; v is distance from the wall INTO the walkable cell.
  const put=(name:string,u:number,y:number,v:number,w:number,h:number,d:number,color:KibaColor,emissive=false)=>{
   const x=ns?ax+u:(p.side==='W'?p.cellX+v:p.cellX+1-v);
   const z=ns?(p.side==='N'?p.cellZ+v:p.cellZ+1-v):az+u;
   result.push({id:`set-${p.id}-${name}`,x,y,z,width:ns?w:d,height:h,depth:ns?d:w,color,emissive});
  };
  // Wall trim and architecture: the same silhouette for both real 3D backends.
  put('foundation',0,.13,.06,.97,.26,.085,SETPIECE_COLORS.dark);
  put('cornice',0,2.12,.052,.96,.12,.075,SETPIECE_COLORS.aged);
  for(const u of [-.47,.47]){
   put('pillar'+u,u,1.10,.045,.055,2.04,.07,SETPIECE_COLORS.iron);
   put('pillar-inlay'+u,u,1.34,.090,.025,.79,.015,SETPIECE_COLORS.ironLight);
  }
  put('backing',0,1.20,.072,.86,1.76,.05,SETPIECE_COLORS.dark);
  put('upper-sconce',0,2.06,.115,.65,.09,.07,SETPIECE_COLORS.iron);
  put('fluorescent',0,2.07,.157,.53,.035,.025,SETPIECE_COLORS.bulb,true);
  if(p.id==='lobby'){
   put('noticeboard',0,1.56,.116,.78,.73,.035,SETPIECE_COLORS.wood);
   put('paper-1',-.23,1.56,.14,.23,.53,.012,SETPIECE_COLORS.paper);
   put('paper-2',.10,1.50,.14,.35,.40,.012,SETPIECE_COLORS.aged);
   put('reception-counter',0,.78,.29,.86,.12,.28,SETPIECE_COLORS.wood);
   put('counter-trim',0,.84,.30,.91,.02,.29,SETPIECE_COLORS.brass);
   put('speaker',.32,1.07,.18,.16,.21,.10,SETPIECE_COLORS.iron);
   for(let i=0;i<4;i++)put('speaker-grille-'+i,.30,1.02+i*.045,.24,.10,.012,.01,SETPIECE_COLORS.dark);
   put('bell',-.29,.92,.33,.10,.11,.12,SETPIECE_COLORS.brass);
   put('bell-button',-.29,.98,.33,.047,.02,.04,SETPIECE_COLORS.red);
  }else if(p.id==='east'){
   for(let i=0;i<3;i++){
    const u=-.27+i*.27;
    put('mailbox-'+i,u,1.28,.15,.24,.69,.15,SETPIECE_COLORS.iron);
    put('slot-'+i,u,1.48,.24,.17,.045,.012,SETPIECE_COLORS.dark);
    put('label-'+i,u,1.32,.241,.16,.08,.012,SETPIECE_COLORS.paper);
    put('handle-'+i,u,1.04,.25,.08,.022,.018,SETPIECE_COLORS.brass);
   }
   put('broken-clock',.04,1.92,.16,.33,.32,.04,SETPIECE_COLORS.aged);
   put('clock-hand',.06,1.91,.19,.017,.18,.015,SETPIECE_COLORS.red);
  }else if(p.id==='archive'){
   for(let i=0;i<4;i++){
    const y=.42+i*.38;
    put('drawer-'+i,0,y,.20,.76,.35,.23,i%2?SETPIECE_COLORS.iron:SETPIECE_COLORS.ironLight);
    put('drawer-face-'+i,0,y,.327,.68,.29,.02,SETPIECE_COLORS.iron);
    put('drawer-slip-'+i,-.17,y,.345,.22,.075,.012,SETPIECE_COLORS.paper);
    put('drawer-handle-'+i,.18,y-.04,.349,.16,.025,.016,SETPIECE_COLORS.brass);
   }
   put('ragged-archives',.32,1.93,.17,.15,.25,.20,SETPIECE_COLORS.paper);
  }else{
   put('meter-back',0,1.42,.18,.69,1.16,.22,SETPIECE_COLORS.iron);
   for(let i=0;i<3;i++){
    const u=-.22+i*.22;
    put('meter-frame-'+i,u,1.60,.312,.19,.24,.025,SETPIECE_COLORS.aged);
    put('meter-glass-'+i,u,1.61,.331,.13,.13,.014,SETPIECE_COLORS.glass,true);
    put('meter-needle-'+i,u+.03,1.60,.341,.011,.095,.012,SETPIECE_COLORS.red);
   }
   for(let i=0;i<4;i++)put('pipe-'+i,-.36+i*.24,.74,.20,.045,.52,.043,i%2?SETPIECE_COLORS.brass:SETPIECE_COLORS.ironLight);
   put('alarm',.32,1.13,.342,.09,.08,.024,SETPIECE_COLORS.red,true);
   put('sticker',0,.93,.34,.47,.08,.015,SETPIECE_COLORS.paper);
  }
 }
 return result;
}
const setpieceAtlas=new Map<SetpieceKind,HTMLCanvasElement>();
/** Hand-authored bitmap at DS scale, for the Canvas2D compatibility renderer. */
export function kibaSetpieceTexture(kind:SetpieceKind):HTMLCanvasElement {
 const existing=setpieceAtlas.get(kind);if(existing)return existing;
 const canvas=document.createElement('canvas');canvas.width=240;canvas.height=320;
 const g=canvas.getContext('2d')!;g.imageSmoothingEnabled=false;
 const fill=(x:number,y:number,w:number,h:number,color:string)=>{g.fillStyle=color;g.fillRect(x,y,w,h);};
 const stroke=(x:number,y:number,w:number,h:number,color:string)=>{g.strokeStyle=color;g.lineWidth=2;g.strokeRect(x,y,w,h);};
 const ink=(t:string,x:number,y:number,size=10,c='#c5c4ad')=>{g.fillStyle=c;g.font=`bold ${size}px monospace`;g.fillText(t,x,y);};
 fill(0,0,240,320,kind==='basement'?'#252827':'#29332f');
 for(let y=0;y<320;y+=5)fill(0,y,240,1,`rgba(13,19,17,${.18+(y%25)*.006})`);
 for(let i=0;i<130;i++){
  const x=(i*137+53)%239,y=(i*i*19+i*41)%318;
  fill(x,y,2+i%4,1,i%3?'#111a1938':'#a1a18b24');
 }
 fill(5,5,230,39,'#101a1a');stroke(5,5,230,39,'#8b9280');
 fill(7,48,8,255,'#59675e');fill(225,48,8,255,'#58675e');
 fill(12,303,216,12,'#121c1b');
 const heading={lobby:'KIBA / REGISTRO',east:'CORREO / ALA E',archive:'ARCHIVO / 1988',basement:'HORAS / 04:04'}[kind];
 ink(heading,17,25,16,'#d6d0b2');ink('ESTA PLANTA NO FIGURA',17,37,8,'#a49e88');
 if(kind==='lobby'){
  fill(17,58,206,145,'#594c3e');stroke(19,60,202,141,'#ad9a74');
  for(let i=0;i<4;i++){
   const x=25+i*48;fill(x,69,43,109,i%2?'#b3af95':'#ccc2a2');
   stroke(x,69,43,109,'#4c5145');fill(x+7,81,29,4,'#555548');
   for(let q=0;q<6;q++)fill(x+7,94+q*11,26-(q%3)*3,2,'#696a57');
   fill(x+6,153,31,15,i%3?'#716d5d':'#513435');
  }
  fill(20,214,198,64,'#3b312b');fill(20,214,198,7,'#aa9977');
  ink('REGISTRO DE ENTRADAS',31,240,12,'#d4c6a2');
  ink('04:04   /  SIN NOMBRE',31,262,11,'#b78c79');
  fill(192,241,13,9,'#9c4c49');
 }else if(kind==='east'){
  for(let i=0;i<3;i++){
   const x=19+i*72;fill(x,65,65,155,'#51625c');stroke(x,65,65,155,'#87938a');
   fill(x+6,75,53,39,'#253935');fill(x+11,87,40,7,'#b1a48a');
   fill(x+9,126,47,75,'#34423e');stroke(x+9,126,47,75,'#6c796d');
   fill(x+15,140,32,18,'#b3ad92');ink('SIN',x+20,151,10,'#343b35');
   fill(x+17,179,27,4,'#b1a17b');
  }
  fill(15,233,210,42,'#131f1f');ink('BUZONES CLAUSURADOS',20,250,13);
  ink('DEVOLVER AL REMITENTE',20,266,9,'#b89186');
 }else if(kind==='archive'){
  for(let i=0;i<5;i++){
   const y=59+i*43;fill(20,y,200,38,'#4e625b');stroke(20,y,200,38,'#82948a');
   fill(28,y+5,184,25,'#273932');fill(39,y+12,67,10,'#c8bda0');
   fill(152,y+14,42,5,'#c5aa7d');ink(('0'+(i+1)+' / XXXX'),42,y+21,8,'#47483e');
  }
  fill(17,287,207,17,'#3d211f');ink('NO EXISTE EL EXPEDIENTE',25,299,9,'#cfb29c');
 }else{
  fill(19,61,202,199,'#3f514c');stroke(19,61,202,199,'#8f9888');
  for(let i=0;i<3;i++){
   const x=30+i*66;fill(x,83,57,71,'#181f21');stroke(x,83,57,71,'#9c9b85');
   fill(x+7,94,43,47,'#2c514b');
   g.strokeStyle='#b0bc9e';g.lineWidth=3;g.beginPath();g.arc(x+28,115,16,Math.PI,0);g.stroke();
   fill(x+27,99,2,18,'#ba5145');ink('00'+(i+1),x+12,147,9,'#b5bd9f');
  }
  for(let i=0;i<4;i++){fill(37+i*47,177,21,50,'#758278');fill(42+i*47,181,11,41,'#2f4644');}
  fill(31,236,177,13,'#a9a38c');ink('NO REBOBINAR',61,246,11,'#4a3932');
  fill(20,272,199,22,'#221d1e');ink('EL TIEMPO NO SE DEVUELVE',28,286,10,'#c59d8e');
 }
 setpieceAtlas.set(kind,canvas);return canvas;
}

/** Prevent the old generic room fixture from occupying the same wall as a
 * new authored setpiece. Explicit IDs keep every other room fixture intact. */
export function legacyRoomFixtureShadowed(id:string):boolean {
 return /^(?:room-)?(?:evacuation|vending|archive-left|generator)(?:-|$)/.test(id);
}
