import {KIBA_ATRIUM_PANELS,validAtriumPanel,kibaAtriumTexture,isAtriumCell} from './KibaAtrium.js';
import {analogMaterial} from './AnalogMaterials.js';
import {visibleKibaSetpieces,kibaSetpieceTexture,legacyRoomFixtureShadowed} from './KibaSetpieces.js';
import {KIBA_SIGNATURE,isSignatureRoomValid,signatureTexture} from './KibaSignatureRoom.js';
import {castGridRay,sceneGeometryKey} from './FastRaycaster.js';
import {buildCopyistModel} from './CopyistModel.js';
import {getKibaRoomFixtures} from './KibaRooms.js';
/* NAMELESS 404 — modo libro original. Dos pantallas 192x256 componen un
   único paisaje 384x256. Gráficos generados de cero; sin recursos externos. */
import { NamelessEngine as E } from '../engine.js';

type CanvasCtx = CanvasRenderingContext2D;
type GameState = any;
const BW=384, BH=256;
const cache=document.createElement('canvas'); cache.width=BW;cache.height=BH;
const scene=cache.getContext('2d')!;
const PALETTES:Record<number,{wall:[number,number,number],floor:[number,number,number],fog:[number,number,number]}>={
  1:{wall:[91,102,83],floor:[49,58,49],fog:[16,21,21]},
  2:{wall:[110,104,92],floor:[64,61,53],fog:[24,23,24]},
  3:{wall:[79,98,101],floor:[52,63,70],fog:[13,23,30]},
  4:{wall:[111,126,115],floor:[75,87,82],fog:[19,32,32]},
  5:{wall:[102,97,82],floor:[74,69,57],fog:[25,25,22]},
  6:{wall:[93,88,77],floor:[65,63,57],fog:[22,21,22]},
  7:{wall:[76,99,108],floor:[49,65,70],fog:[11,23,31]}
};
function noise(x:number,y:number,seed=0):number{
  let n=Math.sin(x*127.13+y*311.7+seed*79.21)*43758.5453;
  return n-Math.floor(n);
}
function clamp(n:number,min:number,max:number){return Math.max(min,Math.min(max,n));}
function rgb(r:number,g:number,b:number){return `rgb(${clamp(r|0,0,255)},${clamp(g|0,0,255)},${clamp(b|0,0,255)})`;}
function cast(map:string[],px:number,py:number,angle:number){
  return castGridRay(map,px,py,angle);
}
// Projection vectors depend only on the four cardinal directions, not on the
// frame timestamp. This removes thousands of trigonometric operations/frame.
// La cámara puede mirar entre los cuatro rumbos discretos del motor.
// Solo se calculan los rayos una vez por fotograma; antes se precalculaban 4 rumbos.
const cameraAngle=(s:GameState)=>Number.isFinite(s.cameraYaw)?s.cameraYaw:s.dir*Math.PI/2;
const cameraPitch=(s:GameState)=>clamp(Number(s.cameraPitch)||0,-.25,.25);
const cameraHorizon=(s:GameState)=>122+cameraPitch(s)*108;
function put(x:number,y:number,w:number,h:number,color:string|CanvasGradient){scene.fillStyle=color;scene.fillRect(x,y,w,h);}
function rect(x:number,y:number,w:number,h:number,fill:string,stroke?:string){
  put(x,y,w,h,fill);
  if(stroke){scene.strokeStyle=stroke;scene.lineWidth=1;scene.strokeRect(x+.5,y+.5,w-1,h-1);}
}
function text(str:string,x:number,y:number,color:string,size=9){scene.fillStyle=color;scene.font=`${size}px monospace`;scene.fillText(str,x,y);}
function roomMaterial(day:number,x:number,y:number):number{
  return (Math.floor(x)*17+Math.floor(y)*13+day*7)%5;
}
function drawFloor(state:GameState,time:number,map:string[],p:(typeof PALETTES)[number]){
  const cx=state.rx,cy=state.ry,rotation=cameraAngle(state);
  const gradient=scene.createLinearGradient(0,0,0,BH);
  gradient.addColorStop(0,'#0b1114');gradient.addColorStop(.48,'#1b2423');gradient.addColorStop(.51,'#171d1d');gradient.addColorStop(1,rgb(...p.floor));
  put(0,0,BW,BH,gradient);
  const horizon=cameraHorizon(state);
  const rays=Array.from({length:Math.ceil(BW/3)},(_,i)=>{const a=rotation+Math.atan((i*3+1.5-BW/2)/(BW*.76));return {dx:Math.sin(a),dy:-Math.cos(a)};});
  for(let y=Math.ceil(horizon)+2;y<BH;y+=3){
    const depth=BH*.57/Math.max(1,y-horizon);
    for(let x=0;x<BW;x+=3){
      const v=rays[Math.floor(x/3)];
      const wx=cx+v.dx*depth,wy=cy+v.dy*depth;
      const tx=wx-Math.floor(wx),ty=wy-Math.floor(wy);
      const grout=Math.min(tx,ty,1-tx,1-ty)<.035;
      const texture=noise(Math.floor(wx*7),Math.floor(wy*7),state.day);
      const rust=noise(Math.floor(wx*2),Math.floor(wy*3),5)>.79;
      const bright=(1-1/(1+depth*.25))*.47 + .24 + (state.light?.18:-.01);
      const lightCone=.55+(.45*clamp(1-Math.abs(x-BW/2)/(BW*.55),0,1));
      const atrium=state.day===1&&isAtriumCell(map,Math.floor(wx),Math.floor(wy));
      const seam=atrium&&(Math.min(tx,ty,1-tx,1-ty)<.045 || Math.abs(tx-.5)<.015);
      const shade=(grout?.45:1)*(rust?.67:1)*bright*lightCone*(.84+texture*.25)*(atrium?1.25:1);
      const c=atrium?(seam?[31,40,38]:((Math.floor(wx)+Math.floor(wy))%4===0?[103,109,88]:[57,83,72])):p.floor;
      put(x,y,3,3,rgb(c[0]*shade,c[1]*shade,c[2]*shade));
    }
  }
  // Fugas del techo, tuberías y cables en perspectiva.
  scene.strokeStyle='rgba(161,168,138,.14)';scene.lineWidth=2;
  for(const scale of [1,2,4,7]){
    const yy=horizon-100/scale;
    scene.beginPath();scene.moveTo(0,yy);scene.lineTo(BW,yy);scene.stroke();
  }
  scene.strokeStyle='rgba(114,132,111,.22)';scene.lineWidth=1;
  scene.beginPath();scene.moveTo(0,9);scene.lineTo(BW*.25,115);scene.moveTo(BW,9);scene.lineTo(BW*.75,115);scene.stroke();
  if(state.day===1){
    // Pérdida del fluorescente: las lámparas existen en la profundidad, no en una HUD.
    for(let i=0;i<3;i++){
      const y=35+i*30,w=85/(i+1);
      put(BW/2-w/2,y,w,1,`rgba(192,194,153,${(.26/(i+1)).toFixed(2)})`);
    }
  }
}
function castWalls(state:GameState,map:string[],p:(typeof PALETTES)[number],time:number){
  const pixels=new Float32Array(BW);
  const rotation=cameraAngle(state);
  const horizonShift=cameraPitch(state)*108;
  for(let x=0;x<BW;x+=2){
    const diff=Math.atan((x-BW/2)/(BW*.76));
    const hit=cast(map,state.rx,state.ry,rotation+diff);
    const d=hit.dist*Math.cos(diff),height=Math.min(640,BH*.87/Math.max(.16,d));
    const top=Math.round((BH-height)/2+horizonShift);
    const bottom=Math.min(BH,Math.ceil(top+height));
    pixels[x]=pixels[x+1]=d;
    const u=hit.u;
    const mat=roomMaterial(state.day,hit.x,hit.y);
    const layer=hit.vertical?.82:1;
    const bx=Math.floor(hit.x),by=Math.floor(hit.y);
    const speck=noise(bx*9+Math.floor(u*24),by*7,17);
    // Portones visibles solo donde existen puertas físicas en el mapa.
    // No presentar como "puerta" un muro decorativo sin interacción.
    const gateDoor=state.day===1 && (
      Math.hypot(hit.x-6.5,hit.y-2.5)<.8 || Math.hypot(hit.x-7.5,hit.y-7.5)<.8
    );
    const door=(state.day===1?gateDoor:mat===3) && Math.abs(u-.5)<.42;
    const visualMat=state.day===1&&!gateDoor&&mat===3?0:(gateDoor?3:mat);
    const beam=(u<.065||u>.935);
    const cone=Math.pow(Math.max(0,1-Math.abs(x-BW/2)/(BW*.72)),2);
    const flicker=(state.day===1 && state.chase)? .96 + Math.sin(time*.003+bx*2+by)*.04:1;
    const depthLight=clamp(.83/(1+d*.15),.12,.86);
    const light=(state.light?.47+.45*cone:.32)*(depthLight+.10)*layer*flicker;
    const fog=clamp((d-4)/14,0,.77);
    const material=door?.55:(mat===4?.79:mat===2?1.12:mat===1?.90:1);
    const c=p.wall;
    if(state.day===1){
      // Original bitmap materials projected onto the ray-hit UV. Each column
      // samples a real texture, not flat procedural rectangles.
      const tex=analogMaterial(visualMat,state.day);
      const texX=Math.max(0,Math.min(126,Math.floor(u*126)));
      scene.drawImage(tex,texX,0,2,192,x,top,2,height);
      const darkness=clamp(1-(light*(1-fog)*1.27),.08,.86);
      put(x,Math.max(0,top),2,Math.min(BH,bottom)-Math.max(0,top),`rgba(3,13,14,${darkness.toFixed(3)})`);
      if(fog>.025)put(x,Math.max(0,top),2,Math.min(BH,bottom)-Math.max(0,top),`rgba(${p.fog.map(v=>Math.round(v)).join(',')},${(fog*.30).toFixed(3)})`);
      if(beam)put(x,Math.max(0,top),2,Math.min(BH,bottom)-Math.max(0,top),'rgba(3,9,8,.21)');
    }else{
    for(let y=Math.max(0,top);y<bottom;y+=3){
      const v=(y-top)/height;
      const groove=(Math.abs((v*3.4)%1)<.018 || Math.abs((u*2.5)%1)<.017);
      const panel=door && (u<.29||u>.71||v<.11||v>.92);
      const lower=v>.83;
      const mold=v>.68&&speck>.51;
      const edge=beam? .58:1;
      const filth=mold?.55:lower?.78:groove?.62:1;
      const tex=noise(Math.floor(u*67)+bx*9,Math.floor(v*71)+by*7,state.day);
      const fissure=tex>.957?.43:1;
      const shade=light*material*edge*filth*fissure*(.88+tex*.22)*(panel?.74:1);
      const col=[c[0]*shade,c[1]*shade,c[2]*shade];
      if(door && !panel){col[0]*=.7;col[1]*=.71;col[2]*=.68;}
      if(mat===1&&v>.39&&v<.45){col[0]*=.48;col[1]*=.48;col[2]*=.48;}
      for(let i=0;i<3;i++)col[i]=col[i]*(1-fog)+p.fog[i]*fog;
      put(x,y,2,3,rgb(col[0],col[1],col[2]));
      if(door&&v>.48&&v<.53&&Math.abs(u-.63)<.03&&d<4){put(x,y,2,2,'#8c8160');}
    }
    }
    if(d<6){
      const moldAnchor=Math.abs(u-.34)<.014 && (bx*13+by)%4===1;
      if(moldAnchor){put(x,top+height*.15,2,Math.max(2,height*.27),'rgba(17,25,22,.35)');}
    }
  }
  return pixels;
}
function lineOfSight(map:string[],x:number,y:number,ox:number,oy:number){
  const dx=ox-x,dy=oy-y,dist=Math.hypot(dx,dy),st=Math.max(1,Math.ceil(dist*13));
  for(let i=1;i<st;i++)if(E.wall(map,x+dx*i/st,y+dy*i/st))return false;
  return true;
}
function drawItem(o:any,s:GameState,dist:number,sx:number,now:number){
  const scale=Math.min(2.6,1.35/Math.max(.4,dist));
  const w=Math.max(10,Math.floor(40*scale)),h=Math.max(17,Math.floor(73*scale));
  const x=sx-w/2,y=BH/2+cameraPitch(s)*108-h*.41;
  const cabinet=/locker|cabinet|safe|archive|winch|breaker/i.test(o.id);
  const document=/tape|register|file|label|photo|negative|ticket|proof/i.test(o.id);
  if(cabinet){
    rect(x,y,w,h,'#252a27','#707c6d');rect(x+3,y+4,w-6,h-8,'#3d453d','#1a2220');
    rect(x+w*.55,y+h*.37,Math.max(2,w*.08),Math.max(2,h*.1),'#958c70');
    if(w>28)for(let k=1;k<4;k++)put(x+5,y+k*h*.2,w-10,1,'#7e817143');
  }else if(document){
    rect(x+w*.21,y+h*.43,w*.58,h*.42,'#b6ad8d','#5d5a4a');
    for(let n=0;n<4;n++)put(x+w*.28,y+h*(.5+n*.064),w*.37,1,'#4b4c40');
    put(x+w*.71,y+h*.52,w*.05,h*.18,'#873e43');
  }else{
    rect(x+w*.1,y+h*.14,w*.8,h*.7,'#384542','#a1a18a');
    rect(x+w*.2,y+h*.27,w*.6,h*.37,'#121c1b');
    put(x+w*.25,y+h*.36,w*.1,Math.max(1,h*.025),'#b8a88b');
  }
  if(dist<2.3&&s.day===1 && o.id==='tape'){
    scene.fillStyle='rgba(213,200,154,.14)';scene.fillRect(x-3,y-3,w+6,h+6);
  }
}
function drawCopist(s:GameState,map:string[],pixels:Float32Array,time:number){
  if(!s.chase||s.hidden)return;
  const dx=s.entityX-s.rx,dy=s.entityY-s.ry;
  const distance=Math.hypot(dx,dy);
  if(distance>.2&&distance<9&&lineOfSight(map,s.rx,s.ry,s.entityX,s.entityY)){
    const worldAngle=Math.atan2(dx,-dy);
    let diff=worldAngle-cameraAngle(s);
    while(diff>Math.PI)diff-=Math.PI*2;
    while(diff< -Math.PI)diff+=Math.PI*2;
    if(Math.abs(diff)>.65)return;
    const cx=BW/2+Math.tan(diff)*BW*.76;
    if(cx<10||cx>BW-10||distance>pixels[clamp(Math.floor(cx),0,BW-1)] + .16)return;
    const h=Math.min(230,BH*1.42/Math.max(.55,distance));
    const scale=h/2.08,bottom=BH/2+cameraPitch(s)*108+h*.50;
    const fog=clamp(1-distance/15,.46,.96);
    const rig=buildCopyistModel(time,s.threat).slice().sort((a,b)=>b.z-a.z);
    // Original model projected as a billboard in the CPU fallback, while WebGL2
    // and Three.js retain real-world geometry. Shared pose + facial construction.
    scene.save();scene.globalAlpha=fog;
    // Contact shadow grounds the character without an overlay jumpscare.
    scene.fillStyle='rgba(1,4,8,.38)';scene.beginPath();
    scene.ellipse(cx,bottom,Math.max(3,h*.25),Math.max(1,h*.028),0,0,Math.PI*2);scene.fill();
    const v=(n:number)=>Math.max(1,Math.round(n*scale));
    for(const part of rig){
      const px=cx+part.x*scale-v(part.width)/2;
      const py=bottom-(part.y+part.height/2)*scale;
      const rgb=part.color.map(x=>Math.round(255*Math.min(1,x*(1.05+Math.max(0,2.5-distance)*.08))));
      scene.fillStyle=`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      scene.fillRect(Math.round(px),Math.round(py),v(part.width),v(part.height));
    }
    scene.restore();
    if(distance<2.15&&s.threat>50){
      // Thin analog separation, never a full-screen flash.
      put(cx-h*.19,bottom-h*.82,h*.38,1,'rgba(191,203,184,.17)');
    }
  }
}
/** Perspective billboard fallback for authored 3D room props. Important: this
 * is a distinct sprite representation, not a claim that Canvas2D draws meshes. */
function drawKibaRoomDressing(s:GameState,map:string[],depth:Float32Array){
  if(s.day!==1)return;
  const elements=getKibaRoomFixtures(map).filter(f=>!legacyRoomFixtureShadowed(f.id)).map(f=>({...f,dist:Math.hypot(f.x+.5-s.rx,f.z+.5-s.ry)}))
    .sort((a,b)=>b.dist-a.dist);
  for(const f of elements){
    const wx=f.x+.5,wy=f.z+.5,dx=wx-s.rx,dy=wy-s.ry;
    if(f.dist<.3||f.dist>8.0||!lineOfSight(map,s.rx,s.ry,wx,wy))continue;
    let theta=Math.atan2(dx,-dy)-cameraAngle(s);
    while(theta>Math.PI)theta-=2*Math.PI;
    while(theta< -Math.PI)theta+=2*Math.PI;
    if(Math.abs(theta)>.65)continue;
    const center=BW/2+Math.tan(theta)*BW*.76;
    if(center<0||center>=BW||f.dist>depth[clamp(center|0,0,BW-1)]+.23)continue;
    // Fixture is flush with the wall: use a smaller projected footprint.
    const h=Math.min(216,BH*1.0/Math.max(.7,f.dist));
    const w=h*.55,x=center-w/2,y=BH*.51+cameraPitch(s)*108-h*.52;
    const r=(nx:number,ny:number,nw:number,nh:number,col:string)=>{
      rect(Math.round(x+nx*w),Math.round(y+ny*h),Math.max(1,Math.ceil(nw*w)),Math.max(1,Math.ceil(nh*h)),col);
    };
    scene.save();scene.globalAlpha=clamp((s.light?.93:.63)*(1-f.dist/16),.34,.95);
    if(f.kind==='reception'){
      r(.05,.46,.9,.47,'#302e29');r(.0,.47,1,.09,'#888779');
      r(.09,.22,.42,.28,'#101f1d');r(.14,.27,.32,.17,'#3b5a55');
      r(.19,.34,.22,.025,'#a0c3a0');r(.62,.45,.24,.1,'#141e1a');
      r(.13,.66,.72,.035,'#747469');r(.13,.81,.72,.025,'#747469');
      r(.73,.50,.04,.02,'#aa4841');
    }else if(f.kind==='archive'){
      r(.03,.05,.94,.94,'#4b5b56');
      for(let i=0;i<4;i++){
        r(.07,.09+i*.225,.86,.19,'#273534');
        r(.18,.15+i*.225,.25,.055,'#beb7a0');
        r(.66,.18+i*.225,.15,.02,'#b3ae8c');
      }
    }else if(f.kind==='electrical'){
      r(.14,.10,.72,.82,'#405552');r(.20,.16,.60,.70,'#273735');
      for(let i=0;i<4;i++)r(.26+i*.13,.48,.055,.16,i===2?'#9e3e3d':'#121b1d');
      r(.39,.25,.24,.10,'#bd995d');r(.72,.80,.045,.04,'#e65345');
    }else if(f.kind==='vending'){
      r(.03,.03,.94,.96,'#4b605d');r(.09,.12,.61,.58,'#102629');
      for(let i=0;i<3;i++)r(.14+i*.17,.20,.10,.30,i===1?'#9f4e41':'#a0a393');
      r(.76,.41,.09,.25,'#d3b070');r(.10,.79,.65,.08,'#152727');
      r(.12,.05,.68,.065,'#b4cb9b');
    }else if(f.kind==='portrait'){
      r(.10,.10,.80,.84,'#523d32');r(.18,.18,.64,.68,'#a1a28d');
      r(.31,.22,.25,.43,'#282e30');r(.55,.35,.20,.36,'#626b64');
      r(.16,.60,.70,.06,'#1c2023');r(.63,.23,.06,.60,'#a74942');
    }else if(f.kind==='machine'){
      r(.01,.42,.98,.12,'#786654');r(.13,.12,.74,.44,'#34433f');
      for(let i=0;i<2;i++){
        const xx=.19+i*.38;
        r(xx,.16,.26,.27,'#aaa78d');r(xx+.08,.21,.11,.16,'#172326');
      }
      r(.18,.62,.05,.33,'#444b44');r(.77,.62,.05,.33,'#444b44');
      r(.76,.46,.055,.04,'#d45449');
    }else if(f.kind==='generator'){
      r(.02,.17,.96,.72,'#334340');r(.10,.25,.80,.48,'#121e20');
      for(let i=0;i<5;i++)r(.15,.29+i*.078,.70,.025,'#65736d');
      r(.57,.19,.25,.10,'#c7bc98');r(.78,.21,.045,.038,'#cc8e3e');
    }else if(f.kind==='locker'){
      r(.07,.04,.86,.93,'#556763');r(.11,.07,.37,.85,'#2b3d3c');
      r(.52,.07,.37,.85,'#314241');
      for(let i=0;i<3;i++){r(.18,.22+i*.05,.22,.017,'#171f20');r(.59,.22+i*.05,.22,.017,'#171f20');}
      r(.48,.54,.05,.09,'#b7a37d');
    }else if(f.kind==='notice'){
      r(.04,.08,.92,.85,'#654e39');r(.10,.13,.40,.55,'#bdb4a0');
      r(.54,.22,.33,.55,'#a8ac9c');r(.58,.39,.26,.045,'#292f30');
      r(.22,.22,.24,.03,'#303a36');r(.21,.32,.24,.02,'#46514a');
    }else if(f.kind==='medicine'){
      r(.08,.09,.84,.81,'#acb2a5');r(.14,.15,.72,.70,'#4e675f');
      r(.46,.31,.10,.37,'#a85145');r(.32,.44,.36,.10,'#a85145');
    }else if(f.kind==='exit'){
      r(.05,.34,.90,.36,'#263e35');r(.10,.40,.80,.24,'#5d9270');
      r(.25,.49,.49,.055,'#c5d1a9');r(.63,.43,.15,.19,'#c5d1a9');
    }
    // Perspective distress, not a full-screen filter.
    r(.06,.94,.88,.013,'rgba(9,17,16,.66)');
    scene.restore();
  }
}

/** Original, physically situated story panels in four different wings of Kiba.
 * Walls, angle and the raycast depth buffer determine whether they are visible.
 * Their pixels are part of the world, not HUD/UI decorations. */
/** Four author-designed architectural installations, projected into the world.
 * Every bitmap has a genuine wall behind it; the raycast z-buffer rejects
 * objects occluded by geometry. This is not a UI overlay. */
function drawKibaAtrium(s:GameState,map:string[],depth:Float32Array){
 if(s.day!==1)return;
 for(const p of KIBA_ATRIUM_PANELS){
  if(!validAtriumPanel(map,p))continue;
  const wx=p.x+.5,wy=p.z+.5,dx=wx-s.rx,dy=wy-s.ry;
  const dist=Math.hypot(dx,dy);
  if(dist<.28||dist>7.8||!lineOfSight(map,s.rx,s.ry,wx,wy))continue;
  let angle=Math.atan2(dx,-dy)-cameraAngle(s);
  angle=Math.atan2(Math.sin(angle),Math.cos(angle));
  if(Math.abs(angle)>.67)continue;
  const sx=BW*.5+Math.tan(angle)*BW*.76;
  if(sx<0||sx>=BW||dist>depth[clamp(sx|0,0,BW-1)]+.2)continue;
  const h=Math.min(235,170/Math.max(.88,dist)),w=h*.78;
  scene.save();scene.globalAlpha=clamp((s.light?.96:.60)*(1-dist/19),.38,.96);
  scene.drawImage(kibaAtriumTexture(p.id),sx-w*.5,BH*.51+cameraPitch(s)*108-h*.58,w,h);
  scene.restore();
 }
}
function drawKibaSetpieces(s:GameState,map:string[],depth:Float32Array){
 if(s.day!==1)return;
 const fixtures=visibleKibaSetpieces(map);
 for(const p of fixtures){
  const wx=p.cellX+.5,wy=p.cellZ+.5;
  const dx=wx-s.rx,dy=wy-s.ry,dist=Math.hypot(dx,dy);
  if(dist<.3||dist>8||!lineOfSight(map,s.rx,s.ry,wx,wy))continue;
  let angle=Math.atan2(dx,-dy)-cameraAngle(s);
  angle=Math.atan2(Math.sin(angle),Math.cos(angle));
  if(Math.abs(angle)>.69)continue;
  const sx=BW*.5+Math.tan(angle)*BW*.76;
  if(sx<0||sx>=BW||dist>depth[clamp(Math.floor(sx),0,BW-1)]+.26)continue;
  const h=Math.min(336,230/Math.max(.60,dist));
  const w=h*.77;
  scene.save();
  scene.globalAlpha=clamp((s.light?.98:.66)*(1-dist/19),.35,.96);
  scene.drawImage(kibaSetpieceTexture(p.id),sx-w*.5,BH*.51+cameraPitch(s)*108-h*.59,w,h);
  scene.restore();
 }
}
/** Physical surveillance station, placed at the northern wall (2,1).
 * Occluded by the same ray-depth buffer as gameplay objects. No HUD overlay. */
function drawSignatureRoom(s:GameState,map:string[],depth:Float32Array){
 if(s.day!==1||!isSignatureRoomValid(map))return;
 const dx=KIBA_SIGNATURE.x-s.rx,dy=KIBA_SIGNATURE.z-s.ry;
 const d=Math.hypot(dx,dy);
 if(d<.28||d>7.5||!lineOfSight(map,s.rx,s.ry,KIBA_SIGNATURE.x,KIBA_SIGNATURE.z))return;
 let angle=Math.atan2(dx,-dy)-cameraAngle(s);
 angle=Math.atan2(Math.sin(angle),Math.cos(angle));
 if(Math.abs(angle)>.68)return;
 const sx=BW*.5+Math.tan(angle)*BW*.76;
 const column=clamp(Math.round(sx),0,BW-1);
 if(d>depth[column]+.15)return;
 const h=Math.min(335,232/Math.max(.62,d));
 const w=h*.77;
 scene.save();
 scene.globalAlpha=clamp((s.light?.97:.68)*(1-d/19),.36,.96);
 scene.drawImage(signatureTexture(),sx-w*.5,BH*.51+cameraPitch(s)*108-h*.59,w,h);
 // A physically situated monitor glow; no photosensitivity hazard.
 if(d<4.5){
  const glow=scene.createRadialGradient(sx,BH*.47,4,sx,BH*.47,w*.85);
  glow.addColorStop(0,'rgba(53,139,113,.14)');glow.addColorStop(1,'rgba(53,139,113,0)');
  scene.fillStyle=glow;scene.fillRect(sx-w,BH*.47+cameraPitch(s)*108-h*.5,w*2,h);
 }
 scene.restore();
}
function drawObjects(s:GameState,map:string[],depth:Float32Array,now:number){
  const items=E.realItems(s).map(o=>({...o,dist:Math.hypot(o.x-s.rx,o.y-s.ry)})).sort((a,b)=>b.dist-a.dist);
  for(const o of items){
    const dx=o.x-s.rx,dy=o.y-s.ry;
    if(o.dist<.25||o.dist>9||!lineOfSight(map,s.rx,s.ry,o.x,o.y))continue;
    let diff=Math.atan2(dx,-dy)-cameraAngle(s);
    while(diff>Math.PI)diff-=2*Math.PI;
    while(diff< -Math.PI)diff+=2*Math.PI;
    if(Math.abs(diff)>.64)continue;
    const sx=BW/2+Math.tan(diff)*BW*.76;
    if(sx<0||sx>=BW||o.dist>depth[clamp(sx|0,0,BW-1)]+.35)continue;
    drawItem(o,s,o.dist,sx,now);
  }
  drawKibaSetpieces(s,map,depth);
  drawKibaAtrium(s,map,depth);
  drawKibaRoomDressing(s,map,depth);
  drawSignatureRoom(s,map,depth);
  drawCopist(s,map,depth,now);
}
function atmosphere(s:GameState,now:number,reduced=true){
  const g=scene.createRadialGradient(BW*.5,BH*.51,BH*.09,BW*.5,BH*.51,BH*.83);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.57,'rgba(4,6,10,.16)');g.addColorStop(1,s.light?'rgba(0,2,5,.55)':'rgba(0,1,5,.85)');
  scene.fillStyle=g;scene.fillRect(0,0,BW,BH);
  // Ruido cinematográfico estable, reproducible y sin flashes.
  for(let n=0;n<210;n++){
    const x=(noise(n,29,41)*BW)|0,y=(noise(n,71,17)*BH)|0;
    put(x,y,1,1,n%3?'#03060821':'#d8dfc01a');
  }
  if(s.day===1&&s.chase){
    scene.fillStyle=`rgba(64,9,17,${clamp(s.threat/900,0,.12)})`;
    scene.fillRect(0,0,BW,BH);
  }
  // Una interfaz mínima y diegética, sin información de depuración dentro de la escena.
  if(s.day===1){
    const prox=E.realItems(s).filter(o=>Math.hypot(o.x-s.rx,o.y-s.ry)<(o.r||1.3));
    if(prox.length){
      rect(BW/2-79,BH-27,158,17,'rgba(5,12,11,.84)','rgba(135,154,128,.50)');
      text('E  EXAMINAR',BW/2-39,BH-15,'#d2d8c0',9);
    }
  }
  put(BW/2-2,BH/2,5,1,'#c9cfad7d');put(BW/2,BH/2-2,1,5,'#c9cfad7d');
  if(s.day===1&&s.flags?.kibaFinaleStage>=1&&s.flags?.kibaFinaleStage<=2){
    rect(BW/2-91,11,182,22,'rgba(7,13,13,.82)','rgba(175,151,117,.58)');
    text(s.flags.kibaFinaleStage===1?'HUYE A LOS ARCHIVOS':'REGRESA AL VESTÍBULO',BW/2-78,25,'#d2c2a3',10);
  }
}
const background=document.createElement('canvas');background.width=BW;background.height=BH;
const backdrop=background.getContext('2d')!;
let backgroundKey='';
let backgroundMap:string[]=[];
let backgroundDepth=new Float32Array(BW);
export const BookPerformance={
  get key(){return backgroundKey;},
  invalidate(){backgroundKey='';}
};
function drawFull(s:GameState,now:number,frame?:HTMLCanvasElement|null){
  scene.imageSmoothingEnabled=false;
  scene.clearRect(0,0,BW,BH);
  const map=E.realMap(s);
  if(frame){scene.drawImage(frame,0,0,BW,BH);}
  else {
    const p=PALETTES[s.day]||PALETTES[1];
    const key=sceneGeometryKey(s); 
    if(key!==backgroundKey || s.chase){
      drawFloor(s,now,map,p);
      backgroundDepth=castWalls(s,map,p,now);
      backdrop.clearRect(0,0,BW,BH);
      backdrop.drawImage(cache,0,0);
      backgroundKey=s.chase?'':key; // persecuciones mantienen parpadeo
    }else scene.drawImage(background,0,0);
    drawObjects(s,map,backgroundDepth,now);
  }
  atmosphere(s,now,true);
}
export const BookMode={
  width:BW,height:BH,
  render(left:CanvasCtx,right:CanvasCtx,s:GameState,time:number,frame?:HTMLCanvasElement|null){
    drawFull(s,time,frame);
    left.clearRect(0,0,192,256);right.clearRect(0,0,192,256);
    left.imageSmoothingEnabled=false;right.imageSmoothingEnabled=false;
    left.drawImage(cache,0,0,192,256,0,0,192,256);
    right.drawImage(cache,192,0,192,256,0,0,192,256);
  }
};
