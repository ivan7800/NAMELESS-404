/** Diagnóstico local manual para GPU: comprueba WebGL2, shaders y lectura de píxel.
 * Nunca transmite datos, no se ejecuta durante la partida, ni asegura compatibilidad
 * con Three.js. El test de escena completa debe realizarse por separado.
 */
export interface GpuResult {available:boolean;shader:boolean;pixel:boolean;version:string;message:string}
export function probeWebGL2():GpuResult {
  const no=(message:string):GpuResult=>({available:false,shader:false,pixel:false,version:'—',message});
  if(typeof document==='undefined')return no('Sin DOM');
  const canvas=document.createElement('canvas');canvas.width=16;canvas.height=16;
  let gl:WebGL2RenderingContext|null=null;
  try{gl=canvas.getContext('webgl2',{alpha:false,preserveDrawingBuffer:true});}
  catch{return no('El navegador bloquea el contexto WebGL2');}
  if(!gl)return no('WebGL2 no está disponible en este navegador');
  let vert:WebGLShader|null=null,frag:WebGLShader|null=null,program:WebGLProgram|null=null,buffer:WebGLBuffer|null=null;
  let shader=false,pixel=false,version='WebGL2';
  try{
    version=String(gl.getParameter(gl.VERSION)||'WebGL2');
    function compile(type:number,source:string){
      const s=gl!.createShader(type);if(!s)throw Error('No se puede crear un shader');
      gl!.shaderSource(s,source);gl!.compileShader(s);
      if(!gl!.getShaderParameter(s,gl!.COMPILE_STATUS))throw Error(String(gl!.getShaderInfoLog(s)||'Shader rechazado'));
      return s;
    }
    vert=compile(gl.VERTEX_SHADER,`#version 300 es\nlayout(location=0) in vec2 a_xy;\nvoid main(){gl_Position=vec4(a_xy,0.,1.);}`);
    frag=compile(gl.FRAGMENT_SHADER,`#version 300 es\nprecision mediump float;\nout vec4 o_color;\nvoid main(){o_color=vec4(0.25,0.75,0.50,1.);}`);
    program=gl.createProgram();if(!program)throw Error('No se puede crear un programa');
    gl.attachShader(program,vert);gl.attachShader(program,frag);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(String(gl.getProgramInfoLog(program)||'Enlace fallido'));
    shader=true;
    buffer=gl.createBuffer();if(!buffer)throw Error('Buffer no disponible');
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),gl.STATIC_DRAW);
    gl.useProgram(program);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    gl.viewport(0,0,16,16);gl.drawArrays(gl.TRIANGLES,0,6);
    const rgba=new Uint8Array(4);gl.readPixels(8,8,1,1,gl.RGBA,gl.UNSIGNED_BYTE,rgba);
    pixel=Math.abs(rgba[0]-64)<12&&Math.abs(rgba[1]-191)<12&&Math.abs(rgba[2]-128)<12&&rgba[3]>200;
    return {available:true,shader,pixel,version,message:pixel?'Shader y píxel RGB verificados':'El dibujo no devuelve el píxel esperado'};
  }catch(e){return {available:true,shader,pixel,version,message:e instanceof Error?e.message:String(e)};}
  finally{
    if(buffer)gl.deleteBuffer(buffer);
    if(program)gl.deleteProgram(program);
    if(vert)gl.deleteShader(vert);
    if(frag)gl.deleteShader(frag);
  }
}
