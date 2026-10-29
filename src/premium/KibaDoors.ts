/** NAMELESS 404 Premium 0.25 — presentation-only sliding fire shutters.
 * The original level geometry and collision are controlled by kibaMap().
 * Once a puzzle removes a wall tile, this visual animation briefly retracts
 * the shutter into its housing. No door ever changes the player's collision.
 */
import {KIBA_GATES} from './KibaArchitecture.js';
import type {KibaColor,KibaProp} from './KibaVisuals.js';
export interface KibaDoorPose {readonly gate:string;readonly open:boolean;readonly x:number;readonly z:number;}
export function kibaDoorStates(map:readonly string[]):KibaDoorPose[]{
 return Object.entries(KIBA_GATES).map(([gate,p])=>({gate,
  open:map[p.y]?.[p.x]!== '#',x:p.x+.5,z:p.y+.5}));
}
export function buildKibaDoorPanels(map:readonly string[],elapsed:Readonly<Record<string,number>>):KibaProp[]{
 const parts:KibaProp[]=[];
 const place=(id:string,x:number,y:number,z:number,width:number,height:number,depth:number,color:KibaColor,emissive=false)=>{
  parts.push({id,x,y,z,width,height,depth,color,emissive});
 };
 const steel:KibaColor=[.27,.33,.32],rust:KibaColor=[.43,.28,.20],ink:KibaColor=[.075,.11,.13],warning:KibaColor=[.72,.50,.25];
 for(const gate of kibaDoorStates(map)){
  if(!gate.open)continue;
  const {x,z}=gate;
  // Frame remains behind after the wall has genuinely been removed by the engine.
  for(const side of [-1,1]){
   place(`door-${gate.gate}-pillar-${side}`,x,1.03,z+side*.49,.10,2.05,.075,steel);
   place(`door-${gate.gate}-weld-${side}`,x,1.25,z+side*.50,.112,.025,.08,rust);
  }
  place(`door-${gate.gate}-lintel`,x,2.19,z,.13,.16,1.04,steel);
  place(`door-${gate.gate}-lamp`,x,2.13,z,.15,.035,.23,warning,true);
  const t=elapsed[gate.gate];
  if(!Number.isFinite(t)||t>=1300)continue;
  const k=Math.max(0,Math.min(1,t/1150));
  const ease=1-(1-k)*(1-k)*(1-k);
  for(const side of [-1,1]){
   // The two leaves split and lift away without occupying the passage after 1.3s.
   const dz=side*(.235+.38*ease),height=(1-ease)*1.87;
   if(height<.018)continue;
   const y=.10+height/2 +1.20*ease;
   place(`door-${gate.gate}-leaf-${side}`,x,y,z+dz,.085,height,.42,ink);
   place(`door-${gate.gate}-stripe-${side}`,x+.049,y,z+dz,.015,Math.max(.015,height*.07),.39,warning);
  }
 }
 return parts;
}
