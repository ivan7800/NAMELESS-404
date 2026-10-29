/** NAMELESS 404 v0.31 — cámara cinemática puramente visual.
 * La lógica del juego, las colisiones y el contenido de los guardados siguen
 * usando las coordenadas discretas originales. Ningún acceso al DOM.
 */
export interface CameraSource {
  day:number; mode:string; dir:number; rx:number; ry:number;
  won:boolean; crouched?:boolean; steps?:number;
}
export interface CameraView {
  cameraYaw:number; cameraPitch:number; cameraHeight:number;
  rx:number; ry:number;
}
const limit=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
const PI2=Math.PI*2;
export const CAMERA_LIMITS={yaw:.68,pitch:.25} as const;
export const CAMERA_EASE_MS=90;
export class CinematicCamera {
  private current:CameraView={cameraYaw:0,cameraPitch:0,cameraHeight:1.35,rx:0,ry:0};
  private active=false;
  private targetYaw=0;
  private targetPitch=0;
  private lastTime=0;
  private lastDir=0;
  private lastDay=0;
  private lastMode='';
  private lastSteps=0;
  private walkingUntil=0;
  private enabled=true;
  get isEnabled(){return this.enabled;}
  setEnabled(value:boolean){this.enabled=!!value;this.active=false;this.targetYaw=0;this.targetPitch=0;}
  reset(){this.active=false;this.targetYaw=0;this.targetPitch=0;this.walkingUntil=0;}
  look(dx:number,dy:number){
    if(!this.enabled)return;
    this.targetYaw=limit(this.targetYaw+limit(dx,-2,2),-CAMERA_LIMITS.yaw,CAMERA_LIMITS.yaw);
    this.targetPitch=limit(this.targetPitch+limit(dy,-2,2),-CAMERA_LIMITS.pitch,CAMERA_LIMITS.pitch);
  }
  center(){this.targetYaw=0;this.targetPitch=0;}
  get offsets(){return {yaw:this.targetYaw,pitch:this.targetPitch};}
  sample(source:CameraSource,now:number,reducedMotion=false):CameraView {
    const yaw=source.dir*Math.PI/2;
    const worldChanged=!this.active||source.day!==this.lastDay||source.mode!==this.lastMode;
    if(worldChanged){
      this.current={cameraYaw:yaw,cameraPitch:0,cameraHeight:1.35,rx:source.rx,ry:source.ry};
      this.targetYaw=0;this.targetPitch=0;this.walkingUntil=0;
      this.active=true;this.lastSteps=source.steps??0;
    }
    if(!worldChanged && source.dir!==this.lastDir){this.targetYaw=0;}
    if(source.steps!==undefined && source.steps!==this.lastSteps){
      this.walkingUntil=now+165;this.lastSteps=source.steps;
    }
    const elapsed=this.lastTime?limit(now-this.lastTime,0,80):16;
    const amount=!this.enabled||reducedMotion?1:1-Math.exp(-elapsed/CAMERA_EASE_MS);
    const desired=yaw+(this.enabled?this.targetYaw:0);
    let delta=((desired-this.current.cameraYaw+Math.PI)%PI2+PI2)%PI2-Math.PI;
    this.current.cameraYaw+=delta*amount;
    const pitchGoal=this.enabled?this.targetPitch:0;
    this.current.cameraPitch+=(pitchGoal-this.current.cameraPitch)*amount;
    this.current.rx+=(source.rx-this.current.rx)*amount;
    this.current.ry+=(source.ry-this.current.ry)*amount;
    const walking=now<this.walkingUntil && !source.won && source.mode==='real';
    const bob=walking&&this.enabled&&!reducedMotion ? Math.sin(now*.028)*.014 : 0;
    const height=1.35+(source.crouched?-.14:0)+bob;
    this.current.cameraHeight+=(height-this.current.cameraHeight)*amount;
    this.lastTime=now;this.lastDir=source.dir;this.lastDay=source.day;this.lastMode=source.mode;
    return {...this.current};
  }
}
