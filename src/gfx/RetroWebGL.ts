import {buildKibaAtrium} from '../premium/KibaAtrium.js';
import {buildKibaSetpieces,legacyRoomFixtureShadowed} from '../premium/KibaSetpieces.js';
import {buildSignatureRoom} from '../premium/KibaSignatureRoom.js';
import {buildKibaSurfaces} from '../premium/KibaSurfaces.js';
import {kibaDoorStates,buildKibaDoorPanels} from '../premium/KibaDoors.js';
import {buildCopyistModel} from '../premium/CopyistModel.js';
import {buildKibaVisuals} from '../premium/KibaVisuals.js';
import {buildKibaRooms} from '../premium/KibaRooms.js';
import {activeKibaLamps,kibaLampIntensity,nearestKibaLamps} from '../premium/KibaLighting.js';
/** NAMELESS 404 — renderer WebGL2 nativo. Sin red ni dependencias de ejecución.
 * Geometría 3D real a resolución 256×192. El RPG y la interfaz siguen en Canvas 2D.
 * Separa cuidadosamente la simulación: nunca modifica el estado del juego.
 */

export interface SceneState {
  day: number; rx: number; ry: number; dir: number; cameraYaw?: number; cameraPitch?: number; cameraHeight?: number; light: boolean;
  threat: number; chase: boolean; hidden: boolean; entityX: number; entityY: number;
  pulse: number; mode: string; won: boolean;
}
export interface SceneItem { id: string; x: number; y: number; r?: number }

type RGB = readonly [number, number, number];
interface Mesh { buffer: WebGLBuffer; vertices: number }

const VERTEX = `#version 300 es
precision highp float;
in vec3 a_position;
in vec3 a_normal;
in vec3 a_color;
uniform vec3 u_eye;
uniform vec2 u_heading;
uniform float u_pitch;
uniform float u_aspect;
uniform float u_tanfov;
uniform float u_light;
uniform float u_threat;
uniform float u_time;
out vec3 v_color;
out vec3 v_world;
out float v_depth;
out float v_shade;
out vec3 v_normal;
void main(){
  vec3 delta=a_position-u_eye;
  vec2 forward=vec2(u_heading.x,-u_heading.y);
  vec2 right=vec2(u_heading.y,u_heading.x);
  float depth=dot(delta.xz,forward);
  float horizontal=dot(delta.xz,right);
  float nearZ=0.075;
  float farZ=28.0;
  // The browser performs the homogeneous perspective divide.
  gl_Position=vec4(horizontal/(u_aspect*u_tanfov),(delta.y-depth*tan(u_pitch))/u_tanfov,
    depth*(farZ+nearZ)/(farZ-nearZ)-(2.0*farZ*nearZ)/(farZ-nearZ),depth);
  float directional=max(0.0,dot(normalize(a_normal),normalize(vec3(0.35,0.9,0.55))));
  float spot=pow(max(0.0,dot(normalize(delta.xz),forward)),4.0);
  float distanceFalloff=1.0/(1.0+max(0.0,depth)*0.17);
  v_shade=(0.21+0.34*directional+0.48*u_light*spot)*distanceFalloff;
  v_depth=max(depth,0.0);
  v_color=a_color;
  v_world=a_position;
  v_normal=a_normal;
}
`;
const FRAGMENT = `#version 300 es
precision highp float;
in vec3 v_color;
in vec3 v_world;
in vec3 v_normal;
in float v_depth;
in float v_shade;
uniform float u_time;
uniform float u_threat;
uniform float u_light;
uniform vec3 u_fog;
uniform vec2 u_resolution;
uniform vec3 u_kibaLamp0;
uniform vec3 u_kibaLamp1;
uniform vec3 u_kibaLamp2;
uniform vec3 u_kibaPower;
out vec4 outColor;
float hash(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,41.123)))*43758.5453);}
float nearLight(vec3 point,vec3 source,float power){
  vec3 delta=point-source;
  float d2=dot(delta,delta);
  return power/(1.0+d2*1.7);
}
void main(){
  // Material: joints, local oxidation, floor microdetail and stable grain.
  float panel=step(.87,fract(v_world.y*1.8));
  float cracks=step(.981,hash(floor(v_world*vec3(4.,2.,4.))));
  float surfaceGrain=(hash(floor(v_world*24.))-.5)*.12;
  // Kiba's material language: half-painted plaster, moisture blooms,
  // baseboard oxidation and fine cracks in world space.
  float painted=step(.46,fract(v_world.y*.49));
  float water=hash(floor(v_world.xzz*vec3(5.,3.,5.)+v_world.y*.65));
  float drip=step(.84,hash(floor(v_world.xz*19.)))*(1.-smoothstep(.15,2.05,v_world.y));
  float tileJoin=step(.973,fract(v_world.x*2.25))+step(.979,fract(v_world.y*2.25));
  float baseboard=1.-smoothstep(.15,.34,v_world.y);
  float age=clamp(water*.19+drip*.25+baseboard*.20,0.,.6);
  float material=1.0-panel*.09-cracks*.18+surfaceGrain-age-tileJoin*.065;
  vec3 albedo=v_color*material;
  float luminous=step(.71,max(v_color.r,max(v_color.g,v_color.b)))*.12;
  float flood=nearLight(v_world,u_kibaLamp0,u_kibaPower.x)
    +nearLight(v_world,u_kibaLamp1,u_kibaPower.y)
    +nearLight(v_world,u_kibaLamp2,u_kibaPower.z);
  float bounce=flood*(.42+.58*max(0.,v_normal.y));
  vec3 rgb=albedo*clamp(v_shade+bounce+luminous,.09,1.23);
  float fog=1.-exp(-max(v_depth-1.6,0.)*.095);
  rgb=mix(rgb,u_fog,clamp(fog,0.,.88));
  // Narrow, readable flashlight core with smooth peripheral falloff.
  vec2 screenUV=gl_FragCoord.xy/u_resolution;
  float radial=length((screenUV-.5)*vec2(1.24,1.03));
  float cone=1.0-smoothstep(.10,.68,radial);
  float flashlight=mix(.68,1.13,cone)*(u_light>.5?1.:.68);
  rgb*=flashlight;
  // Film noise is in screen coordinates, with a very subtle time component.
  float filmGrain=(hash(vec3(floor(gl_FragCoord.xy/2.),floor(u_time/150.)))-.5)*.028;
  rgb+=filmGrain;
  float dread=clamp(u_threat/100.,0.,1.);
  rgb.r+=dread*.012*(1.-cone);
  rgb=floor(clamp(rgb,vec3(0.),vec3(1.))*32.+.5)/32.;
  outColor=vec4(rgb,1.);
}
`;

const PAL: Record<number, {wall: RGB; floor: RGB; ceiling: RGB; fog: RGB; metal: RGB}> = {
  1: {wall:[.35,.42,.39],floor:[.19,.23,.22],ceiling:[.20,.26,.27],fog:[.055,.085,.095],metal:[.52,.48,.38]},
  2: {wall:[.38,.44,.40],floor:[.17,.24,.22],ceiling:[.20,.27,.26],fog:[.075,.085,.082],metal:[.59,.51,.44]},
  3: {wall:[.33,.45,.46],floor:[.19,.26,.27],ceiling:[.17,.23,.26],fog:[.055,.080,.10],metal:[.55,.62,.57]},
  4: {wall:[.47,.57,.52],floor:[.23,.33,.31],ceiling:[.29,.37,.34],fog:[.070,.110,.108],metal:[.62,.70,.61]},
  5: {wall:[.43,.43,.35],floor:[.29,.30,.24],ceiling:[.23,.25,.22],fog:[.075,.082,.070],metal:[.64,.61,.47]},
  6: {wall:[.43,.41,.39],floor:[.24,.25,.24],ceiling:[.26,.26,.24],fog:[.065,.064,.061],metal:[.59,.53,.47]},
  7: {wall:[.35,.48,.53],floor:[.19,.28,.32],ceiling:[.24,.30,.35],fog:[.046,.067,.094],metal:[.68,.60,.65]}
};

class Geometry {
  readonly data: number[]=[];
  vertex(p: readonly number[], normal: readonly number[], color: RGB):void {
    this.data.push(p[0],p[1],p[2],normal[0],normal[1],normal[2],color[0],color[1],color[2]);
  }
  quad(a: readonly number[],b: readonly number[],c: readonly number[],d: readonly number[],normal: readonly number[],color:RGB):void {
    this.vertex(a,normal,color);this.vertex(b,normal,color);this.vertex(c,normal,color);
    this.vertex(a,normal,color);this.vertex(c,normal,color);this.vertex(d,normal,color);
  }
  box(x:number,y:number,z:number,sx:number,sy:number,sz:number,color:RGB):void {
    const xa=x-sx/2, xb=x+sx/2, ya=y-sy/2, yb=y+sy/2, za=z-sz/2, zb=z+sz/2;
    this.quad([xa,ya,zb],[xb,ya,zb],[xb,yb,zb],[xa,yb,zb],[0,0,1],color);
    this.quad([xb,ya,za],[xa,ya,za],[xa,yb,za],[xb,yb,za],[0,0,-1],color);
    this.quad([xa,ya,za],[xa,ya,zb],[xa,yb,zb],[xa,yb,za],[-1,0,0],color);
    this.quad([xb,ya,zb],[xb,ya,za],[xb,yb,za],[xb,yb,zb],[1,0,0],color);
    this.quad([xa,yb,zb],[xb,yb,zb],[xb,yb,za],[xa,yb,za],[0,1,0],color);
    this.quad([xa,ya,za],[xb,ya,za],[xb,ya,zb],[xa,ya,zb],[0,-1,0],color);
  }
}

function shader(gl:WebGL2RenderingContext,type:number,src:string):WebGLShader {
  const sh=gl.createShader(type);
  if(!sh)throw new Error('No se ha podido crear shader');
  gl.shaderSource(sh,src);gl.compileShader(sh);
  if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error('Shader: '+gl.getShaderInfoLog(sh));
  return sh;
}
function program(gl:WebGL2RenderingContext):WebGLProgram {
  const p=gl.createProgram();if(!p)throw new Error('No se ha podido crear el programa WebGL');
  gl.attachShader(p,shader(gl,gl.VERTEX_SHADER,VERTEX));
  gl.attachShader(p,shader(gl,gl.FRAGMENT_SHADER,FRAGMENT));
  gl.bindAttribLocation(p,0,'a_position');gl.bindAttribLocation(p,1,'a_normal');gl.bindAttribLocation(p,2,'a_color');
  gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error('Enlace WebGL: '+gl.getProgramInfoLog(p));
  return p;
}
function itemColor(id:string,day:number):RGB {
  if(/xray|mirror|photo|fold|paper|file|ledger|map|clock/i.test(id)) return [.65,.71,.63];
  if(/tape|reel|intercom|booth|telephone|schedule/i.test(id))return [.52,.61,.64];
  if(/curtain|locker|cabinet|room/i.test(id))return [.50,.54,.49];
  if(/ticket|bell/i.test(id))return [.74,.62,.42];
  return day===4?[.66,.74,.65]:[.63,.55,.51];
}

export class RetroWebGL {
  readonly canvas:HTMLCanvasElement;
  private readonly gl:WebGL2RenderingContext;
  private readonly shader:WebGLProgram;
  private readonly vao:WebGLVertexArrayObject;
  private staticMesh:Mesh|null=null;
  private readonly dynamicBuffer:WebGLBuffer;
  private mapKey='';
  private readonly gateOpenedAt:Record<string,number>={};
  private mapLamps:ReturnType<typeof activeKibaLamps>=[];
  private rendered=false;
  private readonly uniforms:Record<string,WebGLUniformLocation|null>;
  private lost=false;

  private constructor(canvas:HTMLCanvasElement,gl:WebGL2RenderingContext){
    this.canvas=canvas;this.gl=gl;this.shader=program(gl);
    const vao=gl.createVertexArray();const dyn=gl.createBuffer();
    if(!vao||!dyn)throw new Error('No se pudieron crear los buffers');
    this.vao=vao;this.dynamicBuffer=dyn;
    this.uniforms={};
    for(const n of ['u_eye','u_heading','u_pitch','u_aspect','u_tanfov','u_light','u_threat','u_time','u_fog','u_resolution','u_kibaLamp0','u_kibaLamp1','u_kibaLamp2','u_kibaPower']){
      this.uniforms[n]=gl.getUniformLocation(this.shader,n);
    }
    canvas.addEventListener('webglcontextlost',ev=>{ev.preventDefault();this.lost=true;});
    canvas.addEventListener('webglcontextrestored',()=>{this.lost=true;});
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
  }

  static create(width=256,height=192):RetroWebGL|null {
    try{
      const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
      const gl=canvas.getContext('webgl2',{alpha:false,antialias:false,depth:true,preserveDrawingBuffer:true,powerPreference:'low-power'});
      if(!gl)return null;
      return new RetroWebGL(canvas,gl);
    }catch(e){console.warn('WebGL2 no disponible; se usará Canvas 2D',e);return null;}
  }

  /** Probe the actual in-game scene and framebuffer, not a toy shader. */
  checkFrame():{ok:boolean;message:string;rgba:number[]}{
    if(this.lost||!this.rendered)return {ok:false,message:'No existe un fotograma WebGL2 válido',rgba:[]};
    try {
      const gl=this.gl,rgba=new Uint8Array(4);
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);
      gl.readPixels(Math.floor(this.canvas.width/2),Math.floor(this.canvas.height/2),1,1,gl.RGBA,gl.UNSIGNED_BYTE,rgba);
      const error=gl.getError();
      return {ok:error===gl.NO_ERROR,message:error===gl.NO_ERROR?'Framebuffer de la escena leído sin error GL':'Error GL '+error,rgba:Array.from(rgba)};
    }catch(e){return {ok:false,message:String(e),rgba:[]};}
  }
  status():string {return this.lost?'webgl-context-lost':'webgl2-native';}
  private bindMesh(mesh:Mesh):void {
    const gl=this.gl;gl.bindVertexArray(this.vao);gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);
    for(let i=0;i<3;i++){
      gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,3,gl.FLOAT,false,36,i*12);
    }
  }
  private upload(geo:Geometry,existing?:WebGLBuffer):Mesh {
    const gl=this.gl;const buf=existing??gl.createBuffer();if(!buf)throw new Error('Buffer no disponible');
    gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(geo.data),existing?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);
    return {buffer:buf,vertices:geo.data.length/9};
  }
  private createMap(map:readonly string[],day:number):Mesh {
    const g=new Geometry(),pal=PAL[day]??PAL[1];
    const solid=(x:number,z:number)=>map[z]?.[x]==='#';
    const trim:RGB=day===7?[.31,.46,.53]:day===6?[.47,.42,.39]:day===5?[.48,.42,.33]:day===4?[.31,.52,.47]:day===3?[.48,.46,.28]:day===2?[.40,.28,.31]:[.33,.37,.34];
    const luminous:RGB=day===7?[.62,.77,.82]:day===6?[.72,.58,.49]:day===5?[.67,.61,.44]:day===4?[.60,.79,.67]:day===3?[.72,.68,.47]:[.53,.61,.55];
    const wallPlate=(x:number,z:number,normalX:number,normalZ:number):void=>{
      // Each exposed wall gets a physical skirting board and a restrained
      // mid-wall panel, rather than a single flat-colored rectangle.
      const px=x+.5+normalX*.505,pz=z+.5+normalZ*.505;
      const sx=normalX!==0?.025:.94,sz=normalZ!==0?.025:.94;
      g.box(px,.21,pz,sx,.24,sz,trim);
      if((x*3+z*7+day)%4===0){
        g.box(px,1.65,pz,sx,.035,sz,luminous);
        g.box(px,.95,pz,sx,.015,sz,[.15,.20,.21]);
      }
      if((x*11+z*17+day)%13===0){
        g.box(px,1.13,pz,normalX!==0?.035:.36,.44,normalZ!==0?.035:.36,[.23,.29,.28]);
      }
    };
    for(let z=0;z<map.length;z++)for(let x=0;x<map[z].length;x++){
      const xa=x,xb=x+1,za=z,zb=z+1;
      if(!solid(x,z)){
        g.quad([xa,.015,za],[xa,.015,zb],[xb,.015,zb],[xb,.015,za],[0,1,0],pal.floor);
        g.quad([xa,2.35,zb],[xa,2.35,za],[xb,2.35,za],[xb,2.35,zb],[0,-1,0],pal.ceiling);
        // Corridor join lines, rails and ceiling fixtures, every fourth tile.
        if((x+z)%4===1){
          g.box(x+.5,2.29,z+.5,.40,.055,.20,luminous);
          g.box(x+.5,2.25,z+.5,.28,.010,.13,[.82,.85,.69]);
        }
        if((x*17+z*13)%13===0){g.box(x+.5,.021,z+.5,.66,.01,.04,[.29,.37,.36]);}
        if(day===7 && (x+z)%3===0)g.box(x+.5,.022,z+.5,.36,.01,.12,[.35,.48,.54]);
        if(day===6 && (x+z)%3===0)g.box(x+.5,.032,z+.5,.40,.012,.24,[.42,.40,.38]);
        if(day===5 && (x+z)%4===0)g.box(x+.5,.027,z+.5,.60,.012,.04,[.42,.39,.28]);
        if(day===3 && z%4===2)g.box(x+.5,.026,z+.48,.93,.01,.05,[.66,.53,.28]);
        if(day===4 && (x+z)%3===0)g.box(x+.5,.023,z+.5,.88,.008,.026,[.37,.52,.47]);
        if(day===2 && (x+z)%9===2)g.box(x+.19,.026,z+.20,.15,.012,.10,[.26,.20,.23]);
        if(day===1){
          // Modelado ambiental real del edificio Kiba: conductos, luminarias,
          // charcos, cables y archivadores de pared sin alterar colisiones.
          if((x*11+z*5)%7===0){
            g.box(x+.07,1.46,z+.5,.10,1.54,.09,[.26,.39,.37]);
            g.box(x+.07,1.94,z+.5,.13,.035,.13,[.63,.66,.57]);
          }
          if((x+z)%6===0){
            g.box(x+.5,.024,z+.5,.37,.013,.46,[.12,.23,.26]);
            g.box(x+.51,.028,z+.43,.24,.006,.17,[.24,.35,.34]);
          }
          if((x*3+z)%8===2){
            g.box(x+.52,2.24,z+.51,.11,.12,.42,[.43,.47,.39]);
            g.box(x+.52,2.16,z+.51,.09,.009,.38,[.83,.86,.69]);
          }
          if(x<7&&z>7&&(x+z)%5===1){
            g.box(x+.08,.76,z+.51,.14,1.43,.48,[.22,.30,.29]);
            for(let i=0;i<3;i++)g.box(x+.16,.47+i*.32,z+.51,.018,.015,.34,[.53,.55,.50]);
          }
        }
      }else{
        // Only visible faces of wall blocks are generated.
        if(!solid(x-1,z)){g.quad([xa,0,zb],[xa,0,za],[xa,2.35,za],[xa,2.35,zb],[-1,0,0],pal.wall);wallPlate(x,z,-1,0);}
        if(!solid(x+1,z)){g.quad([xb,0,za],[xb,0,zb],[xb,2.35,zb],[xb,2.35,za],[1,0,0],pal.wall);wallPlate(x,z,1,0);}
        if(!solid(x,z-1)){g.quad([xa,0,za],[xb,0,za],[xb,2.35,za],[xa,2.35,za],[0,0,-1],pal.wall);wallPlate(x,z,0,-1);}
        if(!solid(x,z+1)){g.quad([xb,0,zb],[xa,0,zb],[xa,2.35,zb],[xb,2.35,zb],[0,0,1],pal.wall);wallPlate(x,z,0,1);}
      }
    }
    if(day===1){
      for(const prop of buildKibaVisuals(map)){
        g.box(prop.x,prop.y,prop.z,prop.width,prop.height,prop.depth,prop.color);
      }
      for(const prop of buildKibaSurfaces(map)){
        g.box(prop.x,prop.y,prop.z,prop.width,prop.height,prop.depth,prop.color);
      }
      for(const prop of [...buildKibaRooms(map).filter(v=>!legacyRoomFixtureShadowed(v.id)),...buildSignatureRoom(map),...buildKibaSetpieces(map),...buildKibaAtrium(map)]){
        g.box(prop.x,prop.y,prop.z,prop.width,prop.height,prop.depth,prop.color);
      }
    }
    return this.upload(g);
  }
  private createObjects(s:SceneState,items:readonly SceneItem[],now:number,map:readonly string[]):Mesh{
    const g=new Geometry(),pal=PAL[s.day]??PAL[1];
    for(const item of items){
      const c=itemColor(item.id,s.day);
      const x=item.x,z=item.y;
      if(/curtain|locker|cabinet|room207|booth|schedule|mirror|xray/i.test(item.id)){
        g.box(x,1.03,z,.58,1.82,.23,[.16,.22,.23]);
        g.box(x,1.10,z-.132,.46,1.48,.018,c);
        if(/mirror|xray/i.test(item.id)){
          g.box(x,1.13,z-.148,.37,1.25,.014,[.45,.60,.58]);
          g.box(x,.77,z-.169,.28,.035,.016,[.71,.74,.60]);
        }else if(/locker|cabinet|room207/i.test(item.id)){
          g.box(x+.18,1.05,z-.152,.026,.12,.026,pal.metal);
          for(let k=0;k<3;k++)g.box(x-.08,1.37+k*.09,z-.155,.19,.014,.014,[.20,.27,.28]);
        }else if(/curtain/i.test(item.id)){
          for(let k=-2;k<=2;k++)g.box(x+k*.09,1.04,z-.15,.031,1.38,.028,[.31,.49,.46]);
        }
      }else if(/reel|tape|phone|telephone|intercom|ticket|bell/i.test(item.id)){
        g.box(x,.29,z,.69,.58,.48,[.22,.26,.27]);
        g.box(x,.60,z,.48,.10,.38,c);
        const pulse=.025*Math.sin(now*.002+x);
        g.box(x,.73+pulse,z,.26,.12,.27,[.75,.61,.41]);
        g.box(x,.88,z,.045,.22,.04,[.13,.17,.19]);
      }else{
        g.box(x,.35,z,.55,.70,.43,[.25,.31,.30]);
        g.box(x,.74,z,.43,.11,.32,c);
        g.box(x,.87+Math.sin(now*.0012+x)*.025,z,.13,.08,.13,[.71,.45,.40]);
      }
    }
    if(s.day===1){
      const elapsed:Record<string,number>={};
      for(const g of kibaDoorStates(map)){
        if(!g.open)delete this.gateOpenedAt[g.gate];
        else{
          if(this.gateOpenedAt[g.gate]===undefined)this.gateOpenedAt[g.gate]=now;
          elapsed[g.gate]=Math.max(0,now-this.gateOpenedAt[g.gate]);
        }
      }
      for(const part of buildKibaDoorPanels(map,elapsed))
        g.box(part.x,part.y,part.z,part.width,part.height,part.depth,part.color);
    }
    if(s.chase&&!s.won){
      // The same animated character geometry is consumed by WebGL2 and Three.js.
      for(const part of buildCopyistModel(now,s.threat)){
        g.box(s.entityX+part.x,part.y,s.entityY+part.z,
          part.width,part.height,part.depth,part.color);
      }
    }
    return this.upload(g,this.dynamicBuffer);
  }

  render(s:SceneState,now:number,map:readonly string[],items:readonly SceneItem[]):HTMLCanvasElement|null {
    if(this.lost)return null;
    const gl=this.gl;
    try{
      const key=s.day+'|'+map.join('|');
      if(this.mapKey!==key){
        if(this.staticMesh)gl.deleteBuffer(this.staticMesh.buffer);
        this.staticMesh=this.createMap(map,s.day);this.mapLamps=activeKibaLamps(s.day,map);this.mapKey=key;
      }
      const pal=PAL[s.day]??PAL[1];
      gl.viewport(0,0,this.canvas.width,this.canvas.height);
      gl.clearColor(pal.fog[0],pal.fog[1],pal.fog[2],1);
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.useProgram(this.shader);
      const angle=Number.isFinite(s.cameraYaw)?s.cameraYaw!:s.dir*Math.PI/2;
      gl.uniform3f(this.uniforms.u_eye,s.rx,s.cameraHeight??1.35,s.ry);
      gl.uniform1f(this.uniforms.u_pitch,s.cameraPitch??0);
      gl.uniform2f(this.uniforms.u_heading,Math.sin(angle),Math.cos(angle));
      gl.uniform1f(this.uniforms.u_aspect,this.canvas.width/this.canvas.height);
      gl.uniform1f(this.uniforms.u_tanfov,Math.tan(69*Math.PI/360));
      gl.uniform1f(this.uniforms.u_light,s.light?1:.19);
      gl.uniform1f(this.uniforms.u_threat,s.threat);
      gl.uniform1f(this.uniforms.u_time,now);
      gl.uniform2f(this.uniforms.u_resolution,this.canvas.width,this.canvas.height);
      gl.uniform3f(this.uniforms.u_fog,...pal.fog);
      const chosen=nearestKibaLamps(s.rx,s.ry,this.mapLamps);
      const gains=[0,0,0];
      for(let i=0;i<3;i++){
        const lamp=chosen[i];
        gl.uniform3f(this.uniforms['u_kibaLamp'+i],lamp?.x??-99,lamp?.y??-99,lamp?.z??-99);
        gains[i]=lamp?kibaLampIntensity(lamp,now,s.threat)*.72:0;
      }
      gl.uniform3f(this.uniforms.u_kibaPower,gains[0],gains[1],gains[2]);
      if(this.staticMesh){this.bindMesh(this.staticMesh);gl.drawArrays(gl.TRIANGLES,0,this.staticMesh.vertices);}
      const dynamic=this.createObjects(s,items,now,map);
      this.bindMesh(dynamic);gl.drawArrays(gl.TRIANGLES,0,dynamic.vertices);
      gl.bindVertexArray(null);
      this.rendered=true;
      return this.canvas;
    }catch(e){console.warn('Se activa el renderer Canvas 2D de emergencia',e);return null;}
  }
}
