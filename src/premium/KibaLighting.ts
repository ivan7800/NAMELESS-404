/**
 * NAMELESS 404 Premium v0.22 — iluminación narrativa y determinista.
 * Fuentes físicamente situadas en las casillas transitables de Kiba. No afectan
 * a la colisión ni a la progresión. La intensidad varía de forma suave; no
 * hay flashes completos de pantalla.
 */
export interface KibaLamp {
  readonly id:string;
  readonly x:number;
  readonly y:number;
  readonly z:number;
  readonly color:number;
  readonly strength:number;
  readonly flicker:number;
}
export const KIBA_LAMPS:readonly KibaLamp[]=[
  {id:'vestibulo',x:2.5,y:2.14,z:2.5,color:0xc3d2bf,strength:1.7,flicker:.04},
  {id:'ala-este',x:8.5,y:2.14,z:3.5,color:0xa4c6bf,strength:1.35,flicker:.13},
  {id:'archivos',x:3.5,y:2.14,z:9.5,color:0xe0bd92,strength:1.55,flicker:.07},
  {id:'cinta-04',x:10.5,y:2.14,z:9.5,color:0xb0d2c8,strength:1.25,flicker:.18}
];
/** Sin aleatoriedad ni temporizadores propios: reproducible y estable. */
export function kibaLampIntensity(lamp:KibaLamp,now:number,threat:number):number {
  const seconds=now*.001;
  const slow=Math.sin(seconds*(1.05+lamp.flicker*2)+lamp.x*.71);
  const quick=Math.sin(seconds*7.17+lamp.z*1.93);
  const danger=Math.min(1,Math.max(0,threat/100));
  return lamp.strength*(1-lamp.flicker*.45+lamp.flicker*(slow*.34+quick*.10)-danger*.10);
}
export function activeKibaLamps(day:number,map:readonly string[]):readonly KibaLamp[]{
  if(day!==1)return [];
  return KIBA_LAMPS.filter(l=>map[Math.floor(l.z)]?.[Math.floor(l.x)]!== '#'
    && map[Math.floor(l.z)]?.[Math.floor(l.x)]!==undefined);
}
/** Selección de las 3 fuentes más cercanas; la cuarta queda en reserva. */
export function nearestKibaLamps(x:number,z:number,lamps:readonly KibaLamp[],limit=3):readonly KibaLamp[]{
  return lamps.slice().sort((a,b)=>{
    const da=(a.x-x)**2+(a.z-z)**2,db=(b.x-x)**2+(b.z-z)**2;
    return da-db || a.id.localeCompare(b.id);
  }).slice(0,limit);
}
