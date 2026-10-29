/**
 * Reglas de sigilo del Día 1. Puras y deterministas; sin dependencias de DOM.
 * La ruta del señuelo se traza desde la casilla del jugador hasta un punto libre.
 */
export type NoiseMarker={x:number;y:number;atStep:number};
export type Surface='metal'|'carpet'|'concrete';
export function floorSurface(x:number,y:number):Surface {
 const tx=Math.floor(x),ty=Math.floor(y);
 // Corredores metálicos y un ala alfombrada: información acústica que se aprende al explorar.
 if((ty===9&&tx>=8&&tx<=13)||(tx===7&&ty>=3&&ty<=5))return 'metal';
 if(ty>=7&&tx<=6)return 'carpet';
 return 'concrete';
}
export function footstepNoise(x:number,y:number,sneaking:boolean):number {
 if(sneaking)return .12;
 const surface=floorSurface(x,y);
 return surface==='metal'?2.2:surface==='carpet'?.45:1;
}
export function decoyDestination(map:readonly string[],x:number,y:number,dir:number):{x:number;y:number}|null {
 const dirs:[[number,number],[number,number],[number,number],[number,number]]=[[0,-1],[1,0],[0,1],[-1,0]];
 if(!Number.isInteger(dir)||dir<0||dir>3)return null;
 const [dx,dy]=dirs[dir];let found:null|{x:number;y:number}=null;
 for(let i=1;i<=4;i++){
  const xx=Math.floor(x)+dx*i,yy=Math.floor(y)+dy*i;
  if(map[yy]?.[xx]!=='.')break;
  found={x:xx+.5,y:yy+.5};
 }
 return found;
}
export function validNoiseMarker(v:unknown,map:readonly string[],currentStep:number):v is NoiseMarker {
 if(!v||typeof v!=='object')return false;
 const q=v as Record<string,unknown>;
 return typeof q.x==='number'&&typeof q.y==='number'&&Number.isFinite(q.x)&&Number.isFinite(q.y)&&
 typeof q.atStep==='number'&&Number.isInteger(q.atStep)&&q.atStep>=0&&q.atStep<=currentStep&&
 map[Math.floor(q.y)]?.[Math.floor(q.x)]==='.';
}
