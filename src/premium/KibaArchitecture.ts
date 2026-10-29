/**
 * KIBA 0.19: puertas persistentes, rutas y escondites, sin DOM ni azar.
 * Los atajos abren paredes preexistentes, no teletransportan al jugador.
 */
export type KibaGate='north'|'archive';
export type KibaLocation={x:number;y:number;id:string;r:number};
export const KIBA_SWITCHES:readonly KibaLocation[]=[
 {x:5.5,y:2.5,id:'kibaBreaker',r:1.05},
 {x:6.5,y:7.5,id:'kibaWinch',r:1.05},
 {x:11.5,y:5.5,id:'kibaVent',r:1.05}
];
export const KIBA_HIDEOUTS:readonly KibaLocation[]=[
 {x:3.5,y:11.5,id:'kibaHideArchive',r:.82},
 {x:9.5,y:11.5,id:'kibaHideBasement',r:.82}
];
export const KIBA_GATES:Record<KibaGate,{x:number;y:number;flag:string;label:string}>={
 north:{x:6,y:2,flag:'kibaNorthOpen',label:'PASO NORTE'},
 archive:{x:7,y:7,flag:'kibaArchiveOpen',label:'ARCHIVO / TALLER'}
};
export function kibaMap(base:readonly string[], flags:Record<string,unknown>):string[]{
 const rows=base.map(row=>row);
 for(const gate of Object.values(KIBA_GATES)){
  if(flags?.[gate.flag]===true){
   if(rows[gate.y]?.[gate.x]!=='#')throw Error('La compuerta no pertenece al mapa Kiba');
   const r=rows[gate.y];rows[gate.y]=r.slice(0,gate.x)+'.'+r.slice(gate.x+1);
  }
 }
 return rows;
}
export function nearestKibaFeature(x:number,y:number,features:readonly KibaLocation[]):KibaLocation|null{
 let best:null|KibaLocation=null,dist=Infinity;
 for(const f of features){const d=Math.hypot(f.x-x,f.y-y);if(d<=f.r&&d<dist){best=f;dist=d;}}
 return best;
}
export function hideRisk(threat:number,light:boolean,noise:number):boolean{
 return (Number.isFinite(threat)&&threat>=65) || (light&&threat>=48&&noise>1.1);
}
export function hideMayBeFound(entityDistance:number,alert:boolean,phase:string):boolean{
 return alert&&Number.isFinite(entityDistance)&&entityDistance<1.22&&(phase==='hunt'||phase==='investigate'||phase==='search');
}
export function isValidHideSpot(v:unknown):v is string{
 return v==='kibaHideArchive'||v==='kibaHideBasement';
}
