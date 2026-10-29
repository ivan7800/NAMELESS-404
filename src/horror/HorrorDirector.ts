/**
 * NAMELESS 404 — Director de presagios (v0.15).
 * No modifica el motor, las banderas de trama ni los archivos de guardado.
 * Cada presagio depende de las acciones del jugador (no de los FPS ni del azar global).
 * Ningún presagio bloquea controles ni comunica información indispensable para resolver puzles.
 */
export type OmenKind='reflection'|'hollow'|'double'|'film'|'negative'|'breath'|'absence';
export interface OmenState {
  day:number; mode:string; steps:number; rx:number; ry:number;
  room:string; chase:boolean; threat:number; hidden:boolean; won:boolean;
}
export interface Omen {
  kind:OmenKind; day:number; text:string; seed:number;
  intensity:number; started:number; ends:number;
}
const LINES:Readonly<Record<number,readonly [OmenKind,string][]>>={
  1:[['double','LOS PASOS NO SON TUYOS'],['reflection','LA FIGURA SIGUE EN EL CRISTAL'],['hollow','ALGUIEN HA APAGADO EL PASILLO']],
  2:[['breath','RESPIRA AL OTRO LADO'],['double','DOS PISADAS. UNA SOLA PERSONA'],['hollow','LA HABITACIÓN SE HA DESPLAZADO']],
  3:[['absence','EL ANDÉN NO FIGURA EN EL PLANO'],['film','PRÓXIMA PARADA: NINGUNA'],['double','LOS PASOS VIENEN DE LAS VÍAS']],
  4:[['negative','LA SOMBRA TIENE RADIOGRAFÍA'],['breath','UN PACIENTE ESTÁ DESPIERTO'],['reflection','EL CRISTAL GUARDA TU CARA']],
  5:[['absence','ALGUIEN VIVE DONDE NO HAY CASA'],['hollow','UNA VENTANA HA CAMBIADO DE SITIO'],['double','PISADAS SOBRE UN SUELO VACÍO']],
  6:[['film','LA CINTA SE ESTÁ REBOBINANDO'],['negative','UNA SILUETA ENTRE LAS CENIZAS'],['breath','LA URNA TIENE PULSO']],
  7:[['reflection','TU REFLEJO TARDA EN GIRARSE'],['negative','LA COPIA ES MÁS ANTIGUA'],['hollow','EL ARCHIVO ESTÁ RESPIRANDO']]
};
function hash(...values:number[]):number{
 let v=2166136261;
 for (const n of values){v=Math.imul(v^(n|0),16777619)>>>0;}
 return v>>>0;
}
export class HorrorDirector {
 private enabled=true;
 private active:Omen|null=null;
 private lastStep=-100;
 private lastDay=0;
 private lastKind:OmenKind|null=null;
 setEnabled(value:boolean):void {this.enabled=value;if(!value)this.active=null;}
 getEnabled():boolean{return this.enabled;}
 clear():void {this.active=null;this.lastStep=-100;this.lastDay=0;this.lastKind=null;}
 /** Receives the previous and next snapshots after player input, never during the render loop. */
 observe(before:OmenState,after:OmenState,now:number):Omen|null {
  if(before.day!==after.day){this.active=null;this.lastStep=-100;this.lastDay=after.day;this.lastKind=null;}
  if(!this.enabled||after.mode!=='real'||after.won||after.hidden||after.steps===before.steps){
   if(after.mode!=='real'||after.won)this.active=null;
   return null;
  }
  if(after.chase&&after.threat>=52)return null; // the actual pursuer takes precedence
  if(after.steps<7||after.steps-this.lastStep<8)return null;
  const a=hash(after.day,after.steps,Math.floor(after.rx),Math.floor(after.ry),0);
  if(a%5===0)return null; // deliberate irregularity and long quiet intervals
  const choices=LINES[after.day]??LINES[1];
  let idx=a%choices.length;
  if(choices[idx][0]===this.lastKind)idx=(idx+1)%choices.length;
  const [kind,text]=choices[idx];
  this.lastKind=kind;
  this.lastStep=after.steps;
  this.lastDay=after.day;
  const intensity=Math.min(.85, .38+(after.chase?.14:0)+after.threat/350);
  this.active={kind,day:after.day,text,seed:a,intensity,started:now,ends:now+2600};
  return this.active;
 }
 current(now:number):Omen|null {
  if(!this.enabled||!this.active)return null;
  if(now>=this.active.ends){this.active=null;return null;}
  return this.active;
 }
}
