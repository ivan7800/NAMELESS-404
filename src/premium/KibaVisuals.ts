/**
 * NAMELESS 404 v0.21 — dirección artística espacial del edificio Kiba.
 * Geometría ligera y determinista compartida por el renderer WebGL2 nativo
 * y la variante opcional Three.js. No participa en colisiones ni modifica
 * estado narrativo. Unidades: una casilla = 1 m; eje Y vertical.
 */
export type KibaColor = readonly [number,number,number];
export interface KibaProp {
  readonly id:string;
  readonly x:number;readonly y:number;readonly z:number;
  readonly width:number;readonly height:number;readonly depth:number;
  readonly color:KibaColor;
  readonly emissive:boolean;
}
const PALETTE={
  oxided:[.26,.34,.32] as KibaColor,
  dark:[.085,.14,.15] as KibaColor,
  pale:[.58,.65,.59] as KibaColor,
  paper:[.64,.58,.48] as KibaColor,
  warning:[.59,.29,.27] as KibaColor,
  light:[.75,.88,.70] as KibaColor,
  water:[.16,.29,.31] as KibaColor,
  tarnished:[.39,.41,.35] as KibaColor,
  tape:[.64,.49,.27] as KibaColor
} as const;
export const KIBA_VISUAL_PALETTE=PALETTE;
const isOpen=(map:readonly string[],x:number,z:number)=>!!map[z]?.[x]&&map[z][x]!=='#';
const kibaVisualHash=(x:number,z:number,seed=0):number=>(((x*73856093)^(z*19349663)^(seed*83492791))>>>0)%101;

export function buildKibaVisuals(map:readonly string[]):KibaProp[]{
  const p:KibaProp[]=[];
  const push=(id:string,x:number,y:number,z:number,width:number,height:number,depth:number,color:KibaColor,emissive=false)=>{
    p.push({id,x,y,z,width,height,depth,color,emissive});
  };
  // Los muros guían la decoración. Nunca hay elementos flotando en un muro cerrado.
  for(let z=0;z<map.length;z++)for(let x=0;x<(map[z]?.length??0);x++){
    if(!isOpen(map,x,z))continue;
    const midX=x+.5,midZ=z+.5;
    const h=kibaVisualHash(x,z);
    // Suelo: azulejos agrietados y humedad, pegados al pavimento.
    if(h%5===0){
      push(`water-${x}-${z}`,midX+.08,.035,midZ-.06,.43,.008,.36,PALETTE.water);
      push(`water-glint-${x}-${z}`,midX+.10,.044,midZ-.09,.21,.007,.02,PALETTE.oxided);
    }
    if((x+z)%7===1)push(`joint-${x}-${z}`,midX,.033,midZ,.84,.006,.018,PALETTE.tarnished);
    // Bajo los fluorescentes hay una rejilla de retorno sin volumen de colisión.
    if((x*3+z)%11===1){
      push(`ceiling-${x}-${z}`,midX,2.304,midZ,.42,.016,.16,PALETTE.dark);
      push(`tube-${x}-${z}`,midX,2.283,midZ,.29,.014,.055,PALETTE.light,true);
      push(`tube-broken-${x}-${z}`,midX+.12,2.277,midZ+.03,.035,.012,.03,PALETTE.warning);
    }
    // Señalética, heridas de pintura y cableado asentados sobre la cara interior del muro.
    const sides=[
      {dx:0,dz:-1,px:midX,pz:z+.055,vertical:false},
      {dx:0,dz:1,px:midX,pz:z+.945,vertical:false},
      {dx:-1,dz:0,px:x+.055,pz:midZ,vertical:true},
      {dx:1,dz:0,px:x+.945,pz:midZ,vertical:true}
    ];
    for(const side of sides){
      if(isOpen(map,x+side.dx,z+side.dz))continue;
      const r=kibaVisualHash(x,z,side.dx*7+side.dz*13);
      const sx=side.vertical?.018:.60,sz=side.vertical?.60:.018;
      if(r%6===0){
        push(`sconce-${x}-${z}-${side.dx}-${side.dz}`,side.px,1.95,side.pz,sx,.17,sz,PALETTE.dark);
        push(`sconce-bulb-${x}-${z}-${side.dx}-${side.dz}`,side.px,1.96,side.pz,side.vertical?.024:.43,.042,side.vertical?.43:.024,PALETTE.light,true);
      }
      if(r%4===0){
        push(`paint-${x}-${z}-${side.dx}-${side.dz}`,side.px,1.15,side.pz,side.vertical?.020:.34,.29,side.vertical?.34:.020,PALETTE.oxided);
        push(`paint-flake-${x}-${z}-${side.dx}-${side.dz}`,side.px,.97,side.pz,side.vertical?.023:.16,.10,side.vertical?.16:.023,PALETTE.tarnished);
      }
      if(r%7===0){
        push(`cable-${x}-${z}-${side.dx}-${side.dz}`,side.px,1.26,side.pz,side.vertical?.027:.018,.77,side.vertical?.018:.027,PALETTE.dark);
        push(`cable-clamp-${x}-${z}-${side.dx}-${side.dz}`,side.px,1.62,side.pz,side.vertical?.030:.065,.035,side.vertical?.065:.030,PALETTE.tarnished);
      }
    }
  }
  // Marcadores físicos diseñados a mano para los lugares esenciales del Día 1.
  // Todos reposan cerca del perímetro de casillas transitables; los objetos
  // interactivos originales siguen dibujándose por separado.
  const markers=[
    {id:'lobby',x:2.5,z:2.5,c:PALETTE.light},
    {id:'archive',x:3.5,z:9.5,c:PALETTE.paper},
    {id:'tape04',x:10.5,z:9.5,c:PALETTE.warning},
    {id:'locker',x:12.5,z:4.5,c:PALETTE.tarnished},
    {id:'mirror',x:5.5,z:4.5,c:PALETTE.pale},
    {id:'phone',x:8.5,z:3.5,c:PALETTE.tape},
    {id:'photo',x:13.5,z:2.5,c:PALETTE.warning}
  ];
  for(const mark of markers){
    const x=Math.floor(mark.x),z=Math.floor(mark.z);
    if(!isOpen(map,x,z))continue;
    // Superficie de navegación pintada, no un pedestal que impida caminar.
    push(`mark-${mark.id}`,mark.x,.040,mark.z,.39,.008,.055,mark.c);
    push(`mark-edge-${mark.id}`,mark.x,.044,mark.z+.09,.19,.006,.018,PALETTE.dark);
  }
  return p;
}
