/** NAMELESS 404 Premium v0.25 — authored, reproducible wall distress geometry.
 * Not random props or collision obstacles: shallow flush-mounted stains, broken
 * ceramic, oxidation and warning paint on the walkable side of existing walls.
 * The stable hash makes screenshots reproducible between WebGL2 and Three.js.
 */
import type {KibaProp,KibaColor} from './KibaVisuals.js';
export function buildKibaSurfaces(map:readonly string[]):KibaProp[]{
 const props:KibaProp[]=[];
 const oxidized:KibaColor=[.29,.27,.22];
 const grime:KibaColor=[.13,.19,.18];
 const plaster:KibaColor=[.43,.46,.38];
 const wet:KibaColor=[.18,.29,.29];
 const mark=(id:string,x:number,y:number,z:number,w:number,h:number,d:number,color:KibaColor)=>{
  props.push({id,x,y,z,width:w,height:h,depth:d,color,emissive:false});
 };
 for(let z=1;z<map.length-1;z++)for(let x=1;x<(map[z]?.length??0)-1;x++){
   if(map[z]?.[x]==='#')continue;
   const side=map[z]?.[x-1]==='#'?'W':map[z]?.[x+1]==='#'?'E':map[z-1]?.[x]==='#'?'N':map[z+1]?.[x]==='#'?'S':null;
   if(side===null)continue;
   const seed=(x*43+z*73+x*z*11)%17;
   if(seed>8)continue; // Only ~half the suitable tiles; not a noise carpet.
   const ns=side==='N'||side==='S';
   const cx=ns?x+.35+(seed%4)*.105:(side==='W'?x+.022:x+.978);
   const cz=ns?(side==='N'?z+.022:z+.978):z+.35+(seed%4)*.105;
   const thick=.009;
   const wide=.15+(seed%3)*.04;
   const w=ns?wide:thick,d=ns?thick:wide;
   const baseY=.42+(seed%4)*.16;
   mark(`surface-${x}-${z}-mold`,cx,baseY,cz,w,.31+(seed%3)*.075,d,grime);
   if(seed%2===0)mark(`surface-${x}-${z}-drip`,cx+(ns?.047:0),baseY-.19,cz+(ns?0:.04),ns?.014:thick,.30,ns?thick:.014,wet);
   if(seed%3===0)mark(`surface-${x}-${z}-plaster`,cx-(ns?.07:0),1.27,cz-(ns?0:.06),ns?.11:thick,.16,ns?thick:.11,plaster);
   if(seed%4===1)mark(`surface-${x}-${z}-rust`,cx,1.76,cz,w,.042,d,oxidized);
 }
 return props;
}
