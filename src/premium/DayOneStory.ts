/**
 * Day 1: optional environmental evidence and authored tension beats.
 * Data remains separate from the main seven-day puzzle progression.
 */
export type EvidenceId='lobby'|'glass'|'archives'|'basement';
export interface Evidence {
 id:EvidenceId;x:number;y:number;title:string;message:string;journal:string;cue:string;
}
export const DAY_ONE_EVIDENCE:readonly Evidence[] = [
 {id:'lobby',x:2.5,y:3.5,title:'EL LIBRO DE VISITAS',
  message:'Hay treinta y siete firmas. La ultima es tuya, fechada mañana. En la pagina anterior todos escribieron la misma frase: «HE VENIDO A BUSCARME».',
  journal:'Kiba, libro de visitas: mi firma figura con fecha de mañana. Los anteriores visitantes vinieron a buscarse a sí mismos.',cue:'paper'},
 {id:'glass',x:14.5,y:5.5,title:'EL CRISTAL DOBLE',
  message:'Una ventana mira hacia un edificio idéntico. Al otro lado, alguien apaga una linterna al mismo tiempo que tu mano se acerca al cristal.',
  journal:'Ventana del ala este: existe un segundo Kiba reflejado donde debería haber aire. Allí alguien lleva mi misma linterna.',cue:'glass'},
 {id:'archives',x:6.5,y:8.5,title:'REGISTRO DE AUSENCIAS',
  message:'Una ficha dice: NAO KISARAGI — DEVUELTA. Debajo se lee: «LA COPIA SOLO SABE BUSCAR LO QUE ESCUCHA».',
  journal:'Archivo de ausencias: Nao figura como DEVUELTA. La Copista investiga sonidos, no puede adivinar dónde me escondo.',cue:'paper'},
 {id:'basement',x:12.5,y:11.5,title:'LA PUERTA SIN MANILLA',
  message:'Detrás de una puerta soldada oyes una grabación de tu voz: «No corras hacia la luz. Apágala cuando empiece a buscarte».',
  journal:'Sótano: mi propia voz advierte que apagar la linterna rompe la persecución visual de La Copista.',cue:'breath'}
];
export function nearestEvidence(x:number,y:number,found:readonly string[]):Evidence|null {
 let nearest:Evidence|null=null, best=1.3;
 for(const item of DAY_ONE_EVIDENCE){
  const d=Math.hypot(x-item.x,y-item.y);
  if(!found.includes(item.id)&&d<best){nearest=item;best=d;}
 }
 return nearest;
}
export function evidenceCount(found:readonly string[]):number {
 return DAY_ONE_EVIDENCE.filter(item=>found.includes(item.id)).length;
}
export type ChaseBeat='first-step'|'crossing'|'escaped';
export interface ChaseContext {chase:boolean;tape:boolean;steps:number;room:string;threat:number;hidden:boolean;phase?:string;already:readonly string[]}
/** Order matters; each authored event may trigger once, without teleporting the monster. */
export function nextChaseBeat(s:ChaseContext):ChaseBeat|null {
 if(!s.chase||!s.tape)return null;
 if(!s.already.includes('first-step')&&s.steps>0)return 'first-step';
 if(!s.already.includes('crossing')&&s.already.includes('first-step')&&s.room==='ALA DE ARCHIVOS')return 'crossing';
 if(!s.already.includes('escaped')&&s.already.includes('first-step')&&s.hidden&&s.phase==='search')return 'escaped';
 return null;
}
export const CHASE_BEATS:Record<ChaseBeat,{title:string;message:string;cue:string}>={
 'first-step':{title:'LA CINTA SIGUE GRABANDO',message:'La grabadora reproduce el ruido de tus siguientes pasos un instante antes de que los des. La luz ya no revela todo lo que tienes delante.',cue:'tape'},
 crossing:{title:'ESTA AL OTRO LADO',message:'Los fluorescentes se apagan uno por uno hacia el sótano. La Copista toca la pared desde el otro lado; sus nudillos marcan el ritmo de tu respiración.',cue:'heartbeat'},
 escaped:{title:'NO HA ENTRADO',message:'La presencia se detiene frente al escondite. Cuenta hasta cuatro con una voz que reconoces. Después se aleja hacia el último lugar donde te oyó.',cue:'breath'}
};
