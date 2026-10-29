import {buildKibaAtrium} from '../premium/KibaAtrium.js';
import {buildKibaSetpieces,legacyRoomFixtureShadowed} from '../premium/KibaSetpieces.js';
import {buildSignatureRoom} from '../premium/KibaSignatureRoom.js';
import {buildKibaSurfaces} from '../premium/KibaSurfaces.js';
import {kibaDoorStates,buildKibaDoorPanels} from '../premium/KibaDoors.js';
import {buildCopyistModel} from '../premium/CopyistModel.js';
import {buildKibaVisuals} from '../premium/KibaVisuals.js';
import {buildKibaRooms} from '../premium/KibaRooms.js';
import {activeKibaLamps,kibaLampIntensity} from '../premium/KibaLighting.js';
/** Three.js renderer for Vite. Requires `npm install` on a machine with registry access.
 * It shares the same TypeScript gameplay engine as the offline WebGL2 renderer.
 */
import {
  AmbientLight, BoxGeometry, Color, DoubleSide, FogExp2, Group,
  InstancedMesh, Matrix4, Mesh, MeshLambertMaterial, PerspectiveCamera,
  PointLight, Scene, Vector3, WebGLRenderer, DataTexture, RGBAFormat, NearestFilter, RepeatWrapping
} from 'three';
import type {SceneItem,SceneState} from '../gfx/RetroWebGL.js';

const COLORS = [
  {walls:0x63766c,floor:0x303d3a,ceiling:0x323f42,fog:0x111d22},
  {walls:0x69766e,floor:0x303c3a,ceiling:0x334240,fog:0x151e1d},
  {walls:0x536c6d,floor:0x293c40,ceiling:0x28363d,fog:0x101c24},
  {walls:0x779088,floor:0x395450,ceiling:0x475b54,fog:0x152527},
  {walls:0x6c6b55,floor:0x373f39,ceiling:0x363d38,fog:0x1b2220},
  {walls:0x706a61,floor:0x383c3a,ceiling:0x464440,fog:0x1a1c1b},
  {walls:0x607b86,floor:0x334951,ceiling:0x3b535e,fog:0x0b1925}
];

export class ThreeRetro {
  readonly canvas:HTMLCanvasElement;
  private readonly renderer:WebGLRenderer;
  private readonly camera:PerspectiveCamera;
  private readonly scene:Scene;
  private readonly lights:PointLight;
  private readonly practicalLights:PointLight[]=[];
  private readonly world:Group;
  private readonly objects:Group;
  private readonly monster:Group;
  private readonly copyistMeshes:Mesh[]=[];
  private readonly doorGroup:Group;
  private readonly doorMeshes=new Map<string,Mesh>();
  private readonly doorClock:Record<string,number>={};
  private mapKey='';
  private objectKey='';
  private lost=false;
  private textures:DataTexture[]=[];

  private constructor(width:number,height:number){
    const renderer=new WebGLRenderer({antialias:false,alpha:false,powerPreference:'low-power',preserveDrawingBuffer:true});
    // Three.js reciente trabaja en WebGL2; la comprobación evita reportar un backend erróneo.
    if(!(renderer.getContext() instanceof WebGL2RenderingContext)){renderer.dispose();throw new Error('WebGL2 no disponible');}
    renderer.setSize(width,height,false);
    renderer.setPixelRatio(1);
    this.renderer=renderer;this.canvas=renderer.domElement;
    this.scene=new Scene();this.camera=new PerspectiveCamera(69,width/height,.06,30);
    this.world=new Group();this.objects=new Group();this.monster=new Group();this.doorGroup=new Group();
    this.scene.add(this.world,this.objects,this.monster,this.doorGroup);
    this.scene.add(new AmbientLight(0x899a97,.68));
    this.lights=new PointLight(0xe4e5c4,3.0,9,1.6);this.scene.add(this.lights);
    this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.lost=true;});
    this.canvas.addEventListener('webglcontextrestored',()=>{this.lost=true;});
    // Premium v0.25: one authored procedural character rig shared with native WebGL2.
    // Materials and unit geometry are allocated once; parts move, not rebuild, per frame.
    const unit=new BoxGeometry(1,1,1);
    const copyistMaterials=new Map<string,MeshLambertMaterial>();
    for(const part of buildCopyistModel(0)){
      const key=part.color.join(',')+String(part.glow);
      if(!copyistMaterials.has(key)){
        const color=new Color(part.color[0],part.color[1],part.color[2]);
        copyistMaterials.set(key,new MeshLambertMaterial({color,side:DoubleSide,
          emissive:part.glow?color:new Color(0,0,0),emissiveIntensity:part.glow?.18:0}));
      }
      const mesh=new Mesh(unit,copyistMaterials.get(key)!);
      mesh.name=part.id;
      mesh.position.set(part.x,part.y,part.z);
      mesh.scale.set(part.width,part.height,part.depth);
      this.monster.add(mesh);
      this.copyistMeshes.push(mesh);
    }
  }
  static create(width=256,height=192):ThreeRetro|null{
    try{return new ThreeRetro(width,height);}catch(e){console.warn('Three.js no pudo iniciarse',e);return null;}
  }
  status():string{return this.lost?'three-context-lost':'threejs-webgl2';}
  private addCuboid(group:Group,x:number,y:number,z:number,w:number,h:number,d:number,mat:MeshLambertMaterial):void{
    const obj=new Mesh(new BoxGeometry(w,h,d),mat);obj.position.set(x,y,z);group.add(obj);
  }
  private clear(group:Group):void{
    for(const child of [...group.children]){
      group.remove(child);
      if(child instanceof Mesh || child instanceof InstancedMesh){
        child.geometry.dispose();
        const materials=Array.isArray(child.material)?child.material:[child.material];
        for(const mat of materials)mat.dispose();
      }
    }
  }
  private tileTexture(base:number,day:number,kind:'wall'|'floor'|'ceiling'):DataTexture{
    // 64×64 original worn-surface texture: chipped paint, grout, mildew.
    const SZ=64;
    const data=new Uint8Array(SZ*SZ*4);
    const r=(base>>16)&255,g=(base>>8)&255,b=base&255;
    for(let y=0;y<SZ;y++)for(let x=0;x<SZ;x++){
      const n=((x*157+y*263+day*113+(x*y*17))^((x*7+y*11)<<3))&255;
      const stain=((x*17+y*31+day*47)%109)>86 && y>18;
      const seam=kind==='wall'&&(y===37||y===39||y>58||x===0||x===63);
      const grid=kind==='floor'&&(x%16===0||y%16===0);
      const crack=(n>245&&x>3&&y>3);
      const flake=kind==='wall'&&(n>227&&x%5<3&&y<37);
      const k=seam?.67:grid?.57:crack?.43:flake?.61:stain?.73:.84+n/1250;
      const idx=(y*SZ+x)*4;
      data[idx]=Math.round(r*k);data[idx+1]=Math.round(g*k);data[idx+2]=Math.round(b*k);data[idx+3]=255;
    }
    const t=new DataTexture(data,SZ,SZ,RGBAFormat);
    t.magFilter=NearestFilter;t.minFilter=NearestFilter;
    t.wrapS=RepeatWrapping;t.wrapT=RepeatWrapping;t.generateMipmaps=false;
    t.needsUpdate=true;this.textures.push(t);
    return t;
  }
  private buildMap(rows:readonly string[],day:number):void{
    this.clear(this.world);
    for(const light of this.practicalLights)this.scene.remove(light);
    this.practicalLights.length=0;
    for(const lamp of activeKibaLamps(day,rows)){
      const fixture=new PointLight(lamp.color,lamp.strength,5.8,1.5);
      fixture.position.set(lamp.x,lamp.y,lamp.z);
      fixture.userData.lamp=lamp;
      this.scene.add(fixture);
      this.practicalLights.push(fixture);
    }
    for(const texture of this.textures)texture.dispose();
    this.textures=[];
    const p=COLORS[Math.max(0,Math.min(COLORS.length-1,day-1))];
    const stone=new MeshLambertMaterial({map:this.tileTexture(p.walls,day,'wall')});
    const ground=new MeshLambertMaterial({map:this.tileTexture(p.floor,day,'floor')});
    const upper=new MeshLambertMaterial({map:this.tileTexture(p.ceiling,day,'ceiling')});
    const w=rows[0]?.length||0,h=rows.length;
    const walls:number[][]=[],floors:number[][]=[],lightFixtures:number[][]=[];
    const trimsNS:number[][]=[],trimsEW:number[][]=[];
    for(let z=0;z<h;z++)for(let x=0;x<w;x++){
      if(rows[z]?.[x]==='#'){
        const openNeighbor=[[0,1],[0,-1],[-1,0],[1,0]].some(([dx,dz])=>rows[z+dz]?.[x+dx]!==undefined&&rows[z+dz]?.[x+dx]!=='#');
        if(openNeighbor){
          walls.push([x+.5,1.17,z+.5]);
          if(rows[z]?.[x-1]!==undefined&&rows[z]?.[x-1]!=='#')trimsEW.push([x+.015,.22,z+.5]);
          if(rows[z]?.[x+1]!==undefined&&rows[z]?.[x+1]!=='#')trimsEW.push([x+.985,.22,z+.5]);
          if(rows[z-1]?.[x]!==undefined&&rows[z-1]?.[x]!=='#')trimsNS.push([x+.5,.22,z+.015]);
          if(rows[z+1]?.[x]!==undefined&&rows[z+1]?.[x]!=='#')trimsNS.push([x+.5,.22,z+.985]);
        }
      } else {
        floors.push([x+.5,0,z+.5]);
        if((x+z)%4===1)lightFixtures.push([x+.5,2.29,z+.5]);
      }
    }
    const mtx=new Matrix4();
    const addBatch=(positions:number[][],geom:BoxGeometry,mat:MeshLambertMaterial)=>{
      if(!positions.length)return;
      const mesh=new InstancedMesh(geom,mat,positions.length);
      positions.forEach(([x,y,z],i)=>{
        mtx.makeTranslation(x,y,z);mesh.setMatrixAt(i,mtx);
        const variant=.82+((i*23)%13)/64;
        mesh.setColorAt(i,new Color().setRGB(variant,variant,variant));
      });
      mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor!.needsUpdate=true;
      this.world.add(mesh);
    };
    addBatch(walls,new BoxGeometry(1,2.34,1),stone);
    addBatch(floors,new BoxGeometry(1,.055,1),ground);
    addBatch(floors.map(([x,,z])=>[x,2.35,z]),new BoxGeometry(1,.035,1),upper);
    const trim=new MeshLambertMaterial({color:day===7?0x607e8f:day===6?0x756d64:day===5?0x847052:day===4?0x628f82:day===3?0x99844f:0x53645a});
    addBatch(trimsNS,new BoxGeometry(.94,.25,.025),trim);
    addBatch(trimsEW,new BoxGeometry(.025,.25,.94),new MeshLambertMaterial({color:day===2?0x654950:0x53645a}));
    addBatch(lightFixtures,new BoxGeometry(.40,.04,.18),new MeshLambertMaterial({color:day===3?0xc6b88a:0xa8c8b3}));
    if(day===1){
      // Vitrinas, conductos y reflejos en suelo. Geometría permanente solo
      // reconstruida cuando cambia el mapa (nunca en cada fotograma).
      const pipes:number[][]=[],puddles:number[][]=[],lamps:number[][]=[],files:number[][]=[];
      for(const [x,,z] of floors){
        const xi=Math.floor(x),zi=Math.floor(z);
        if((xi*11+zi*5)%7===0)pipes.push([xi+.07,1.43,zi+.5]);
        if((xi+zi)%6===0)puddles.push([x,.036,z]);
        if((xi*3+zi)%8===2)lamps.push([x,2.22,z]);
        if(xi<7&&zi>7&&(xi+zi)%5===1)files.push([xi+.08,.75,zi+.5]);
      }
      addBatch(pipes,new BoxGeometry(.085,1.54,.09),new MeshLambertMaterial({color:0x526c64}));
      addBatch(puddles,new BoxGeometry(.37,.011,.46),new MeshLambertMaterial({color:0x293f40}));
      addBatch(lamps,new BoxGeometry(.14,.055,.42),new MeshLambertMaterial({color:0xbfcab0}));
      addBatch(files,new BoxGeometry(.14,1.42,.46),new MeshLambertMaterial({color:0x394b49}));
    }
    if(day===1){
      // Identical spatial landmarks in native WebGL2 and optional Three.js.
      // Batched per color rather than allocating a material/draw call per prop.
      const groups=new Map<string,{positions:Array<{x:number;y:number;z:number;width:number;height:number;depth:number}>;color:number;glow:boolean}>();
      for(const v of [...buildKibaVisuals(rows),...buildKibaRooms(rows).filter(v=>!legacyRoomFixtureShadowed(v.id)),...buildSignatureRoom(rows),...buildKibaSurfaces(rows),...buildKibaSetpieces(rows),...buildKibaAtrium(rows)]){
        const rgb=v.color.map(n=>Math.max(0,Math.min(255,Math.round(n*255))));
        const c=(rgb[0]<<16)|(rgb[1]<<8)|rgb[2];
        const key=String(c)+':'+(v.emissive?'1':'0');
        if(!groups.has(key))groups.set(key,{positions:[],color:c,glow:v.emissive});
        groups.get(key)!.positions.push(v);
      }
      for(const group of groups.values()){
        const material=new MeshLambertMaterial({color:group.color,emissive:group.glow?group.color:0x000000,emissiveIntensity:group.glow ? 0.22 : 0});
        const mesh=new InstancedMesh(new BoxGeometry(1,1,1),material,group.positions.length);
        const matrix=new Matrix4();
        group.positions.forEach((v,i)=>{
          matrix.makeScale(v.width,v.height,v.depth);
          matrix.setPosition(v.x,v.y,v.z);
          mesh.setMatrixAt(i,matrix);
        });
        mesh.instanceMatrix.needsUpdate=true;
        this.world.add(mesh);
      }
    }
    this.scene.background=new Color(p.fog);
    this.scene.fog=new FogExp2(p.fog,.09);
  }
  private buildObjects(items:readonly SceneItem[]):void{
    this.clear(this.objects);
    for(const i of items){
      const color=/xray|file|mirror|fold|photo|streetSign|addressBook/i.test(i.id)?0xb7b9a7:/bell|ticket/i.test(i.id)?0xbb945f:0x607c78;
      const material=new MeshLambertMaterial({color});
      if(/curtain|locker|cabinet|room|booth|schedule|mirror|xray/i.test(i.id)){
        this.addCuboid(this.objects,i.x,1.0,i.y,.58,1.72,.25,material);
        const face=new MeshLambertMaterial({color:/mirror|xray/.test(i.id)?0x7aa4a3:0x293a3b});
        this.addCuboid(this.objects,i.x,1.14,i.y-.136,.43,1.22,.018,face);
        if(/locker|cabinet|room/.test(i.id)){
          this.addCuboid(this.objects,i.x+.18,.99,i.y-.151,.032,.11,.023,new MeshLambertMaterial({color:0xb9a27b}));
        }
      }else{
        this.addCuboid(this.objects,i.x,.35,i.y,.51,.70,.45,new MeshLambertMaterial({color:0x394b4a}));
        this.addCuboid(this.objects,i.x,.74,i.y,.35,.12,.30,material);
      }
    }
  }
  render(s:SceneState,now:number,rows:readonly string[],items:readonly SceneItem[]):HTMLCanvasElement|null{
    if(this.lost)return null;
    try{
      const key=s.day+':'+rows.join('|');
      if(this.mapKey!==key){this.buildMap(rows,s.day);this.mapKey=key;}
      const objectKey=s.day+':'+items.map(o=>o.id+','+o.x+','+o.y).join(';');
      if(objectKey!==this.objectKey){this.buildObjects(items);this.objectKey=objectKey;}
      const angle=Number.isFinite(s.cameraYaw)?s.cameraYaw!:s.dir*Math.PI/2;
      const height=s.cameraHeight??1.36;
      this.camera.position.set(s.rx,height,s.ry);
      this.camera.lookAt(new Vector3(s.rx+Math.sin(angle),height+Math.tan(s.cameraPitch??0),s.ry-Math.cos(angle)));
      this.lights.position.set(s.rx,1.53,s.ry);
      for(const fixture of this.practicalLights){
        const lamp=fixture.userData.lamp;
        fixture.intensity=kibaLampIntensity(lamp,now,s.threat);
      }
      this.lights.intensity=s.light?(s.day===1?2.65+.22*Math.sin(now*.0019+s.rx):3.2+.15*Math.sin(now*.003)):.55;
      // Dynamic shutters follow the same gate-state animation as native WebGL2.
      if(s.day===1){
        const elapsed:Record<string,number>={};
        for(const gate of kibaDoorStates(rows)){
          if(!gate.open)delete this.doorClock[gate.gate];
          else{
            if(this.doorClock[gate.gate]===undefined)this.doorClock[gate.gate]=now;
            elapsed[gate.gate]=Math.max(0,now-this.doorClock[gate.gate]);
          }
        }
        for(const mesh of this.doorMeshes.values())mesh.visible=false;
        for(const part of buildKibaDoorPanels(rows,elapsed)){
          let mesh=this.doorMeshes.get(part.id);
          if(!mesh){
            const color=new Color(part.color[0],part.color[1],part.color[2]);
            const material=new MeshLambertMaterial({color,emissive:part.emissive?color:new Color(0,0,0),emissiveIntensity:part.emissive?.28:0});
            mesh=new Mesh(new BoxGeometry(1,1,1),material);
            this.doorGroup.add(mesh);this.doorMeshes.set(part.id,mesh);
          }
          mesh.visible=true;mesh.position.set(part.x,part.y,part.z);
          mesh.scale.set(part.width,part.height,part.depth);
        }
      }else for(const mesh of this.doorMeshes.values())mesh.visible=false;
      this.monster.visible=s.chase&&!s.won;
      if(this.monster.visible){
        this.monster.position.set(s.entityX,Math.sin(now*.0017)*.013,s.entityY);
        const theta=Math.atan2(s.entityX-s.rx,s.entityY-s.ry);
        this.monster.rotation.y=-theta;
        const parts=buildCopyistModel(now,s.threat);
        for(let i=0;i<this.copyistMeshes.length;i++){
          const part=parts[i],mesh=this.copyistMeshes[i];
          if(!part)continue;
          mesh.position.set(part.x,part.y,part.z);
        }
      }
      this.renderer.render(this.scene,this.camera);
      return this.canvas;
    }catch(e){console.warn('Renderer Three.js: fallback Canvas 2D',e);return null;}
  }
}
