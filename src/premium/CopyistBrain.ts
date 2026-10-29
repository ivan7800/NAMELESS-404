/**
 * NAMELESS 404 Premium — percepción deliberadamente imperfecta de La Copista.
 * Elige un objetivo sin conocer mágicamente la posición del jugador.
 * Pura, reproducible y sin acceso a reloj, azar ni DOM.
 */
export type CopyistPhase = 'hunt'|'investigate'|'search';
export interface CopyistMemory { x:number; y:number; lastSeenStep:number; phase:CopyistPhase }
export interface CopyistInput {
  playerX:number;playerY:number;entityX:number;entityY:number;
  light:boolean;hidden:boolean;steps:number;visible:boolean;
  memory?:CopyistMemory|null;
  sneaking?:boolean; noiseLevel?:number;
  decoy?:{x:number;y:number;atStep:number}|null;
}
export interface CopyistDecision { memory:CopyistMemory; goalX:number; goalY:number; speed:number; threatDelta:number; phase:CopyistPhase }
export function decideCopyist(input:CopyistInput):CopyistDecision {
  const d=Math.hypot(input.playerX-input.entityX,input.playerY-input.entityY);
  const spotted=!input.hidden&&input.visible&&d<=(input.light?7:2.3);
  const prior=input.memory&&Number.isFinite(input.memory.x)&&Number.isFinite(input.memory.y)&&Number.isInteger(input.memory.lastSeenStep)?input.memory:null;
  let phase:CopyistPhase, x:number,y:number, lastSeenStep:number;
  if(spotted){phase='hunt';x=input.playerX;y=input.playerY;lastSeenStep=input.steps;}
  else if(input.decoy&&input.steps-input.decoy.atStep<=10 && input.steps>=input.decoy.atStep &&
       Math.hypot(input.entityX-input.decoy.x,input.entityY-input.decoy.y)<12){
    // Un señuelo acústico legítimo atrae a la Copista hasta una posición fija.
    // La visión directa tiene prioridad, así que lanzarlo delante de ella es arriesgado.
    phase='investigate';x=input.decoy.x;y=input.decoy.y;lastSeenStep=prior?.lastSeenStep??input.steps-6;
  }else if(!input.hidden&&!input.sneaking&&d<Math.min(8,3.3+(input.noiseLevel??1)*2.2)&&input.steps%3===0){
    // Un paso fuerte delata la zona, pero nunca la posición exacta.
    phase='investigate';x=Math.floor(input.playerX)+.5;y=Math.floor(input.playerY)+.5;lastSeenStep=prior?.lastSeenStep??input.steps-6;
  }else if(prior&&input.steps-prior.lastSeenStep<18){phase='search';x=prior.x;y=prior.y;lastSeenStep=prior.lastSeenStep;}
  else{phase='search';x=prior?.x??input.entityX;y=prior?.y??input.entityY;lastSeenStep=prior?.lastSeenStep??input.steps-20;}
  const speed=phase==='hunt'?.36:phase==='investigate'?.26:.18;
  return {phase,goalX:x,goalY:y,speed,threatDelta:phase==='hunt'?Math.max(5,12-d):phase==='investigate'?3:-5,
    memory:{x,y,lastSeenStep,phase}};
}
