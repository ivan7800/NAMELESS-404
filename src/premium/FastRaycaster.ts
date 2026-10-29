/** v0.27: raycaster DDA exacto. Una intersección por frontera de celda,
 * frente a cientos de pasos de 0,041 m por columna. Sin DOM, sin azar.
 * Coordenadas del motor: x hacia E, y/z hacia S, ángulo 0 hacia N.
 */
export interface RayHit { dist:number; x:number; y:number; u:number; vertical:boolean }
export function castGridRay(map:readonly string[], px:number,py:number,angle:number,maxDist=16.81):RayHit{
  const dx=Math.sin(angle),dy=-Math.cos(angle);
  let tileX=Math.floor(px),tileY=Math.floor(py);
  const sx=dx>=0?1:-1,sy=dy>=0?1:-1;
  const invX=Math.abs(dx)>1e-12?1/Math.abs(dx):Infinity;
  const invY=Math.abs(dy)>1e-12?1/Math.abs(dy):Infinity;
  let tx=(dx>=0?tileX+1-px:px-tileX)*invX;
  let ty=(dy>=0?tileY+1-py:py-tileY)*invY;
  for(let i=0;i<128;i++){
    const vertical=tx<ty;
    const dist=vertical?tx:ty;
    if(!Number.isFinite(dist)||dist>maxDist)break;
    if(vertical){tileX+=sx;tx+=invX;}else{tileY+=sy;ty+=invY;}
    const row=map[tileY];
    if(!row||row[tileX]!=='#'&&row[tileX]!==undefined)continue;
    const x=px+dx*dist,y=py+dy*dist;
    const t=vertical?y:x;
    return {dist,x,y,u:t-Math.floor(t),vertical};
  }
  return {dist:maxDist,x:px+dx*maxDist,y:py+dy*maxDist,u:0,vertical:false};
}
/** Permite reutilizar geometría estacionaria sin cachear personajes o UI. */
export function sceneGeometryKey(s:{day:number;rx:number;ry:number;dir:number;cameraYaw?:number;cameraPitch?:number;cameraHeight?:number;light:boolean;flags?:Record<string,unknown>;chase?:boolean}):string{
 const f=s.flags||{};
 return [s.day,s.rx,s.ry,s.dir,Number.isFinite(s.cameraYaw)?s.cameraYaw!.toFixed(3):'',Number.isFinite(s.cameraPitch)?s.cameraPitch!.toFixed(3):'',s.light?1:0,f.kibaNorthOpen?1:0,f.kibaArchiveOpen?1:0].join('/');
}
