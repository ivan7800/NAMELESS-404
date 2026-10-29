/** Día 1 — secuencia opcional de huida. Funciones puras y deterministas.
 * Sin teletransportes, cronómetros arbitrarios ni alteración del mapa. */
export type FinaleStage = 0|1|2|3;
export type FinaleState={stage:FinaleStage;done:boolean;failures:number;startedAt:number};
export const FINALE_OBJECTIVES={
 1:'HUIDA · 1/2: REGRESA AL TORNO DE ARCHIVOS (6,7)',
 2:'HUIDA · 2/2: ALCANZA LA ENTRADA DE KIBA (2,2) SIN SER DESCUBIERTO'
} as const;
export function canStartFinale(s:{day:number;mode:string;key:boolean;tape:boolean;won:boolean;flags:Record<string,unknown>}):boolean {
 return s.day===1&&s.mode==='real'&&s.key&&s.tape&&!s.won&&s.flags.kibaFinaleStage!==3&&!(Number(s.flags.kibaFinaleStage)>0);
}
export function finaleTarget(stage:number):{x:number;y:number}|null{
 return stage===1?{x:6.5,y:7.5}:stage===2?{x:2.5,y:2.5}:null;
}
export function atFinaleTarget(stage:number,x:number,y:number):boolean {
 const target=finaleTarget(stage);return !!target&&Math.hypot(x-target.x,y-target.y)<1.05;
}
export function sanitizeFinale(flags:Record<string,unknown>,day:number,key:boolean,tape:boolean,steps:number):void {
 let stage=Number(flags.kibaFinaleStage);
 if(!Number.isInteger(stage)||stage<0||stage>3||day!==1||!key||!tape)stage=0;
 flags.kibaFinaleStage=stage;
 flags.kibaFinaleFailures=Number.isInteger(flags.kibaFinaleFailures)?Math.max(0,Math.min(99,Number(flags.kibaFinaleFailures))):0;
 const at=Number(flags.kibaFinaleStartedAt);
 if(!Number.isInteger(at)||at<0||at>steps)delete flags.kibaFinaleStartedAt;
 if(stage===0||stage===3)delete flags.kibaFinaleStartedAt;
 if(flags.kibaFinaleDone!==true||stage!==3)flags.kibaFinaleDone=false;
 if(stage===3)flags.kibaFinaleDone=true;
}
export function tensionLevel(stage:number,threat:number):number {
 if(stage!==1&&stage!==2)return 0;
 return Math.min(1,Math.max(0,.32+(Number.isFinite(threat)?threat:0)/170+(stage===2?.16:0)));
}
