/** NAMELESS 404 v0.28: materiales analógicos originales, sin assets extraídos.
 * Pintura dañada, papel húmedo, azulejo, hormigón y compuertas.
 * Las texturas se hornean una sola vez en 128×192 y después se proyectan en
 * el raycaster. No hay ruido aleatorio dependiente del tiempo.
 */
export const MATERIAL_WIDTH=128;
export const MATERIAL_HEIGHT=192;
export const MATERIAL_NAMES=['yeso descascarillado','azulejo verdoso','hormigón húmedo','puerta industrial','papel floral desvaído'] as const;
const atlas=new Map<string,HTMLCanvasElement>();
function rand(x:number,y:number,s:number){
  let n=(Math.imul(x+13,73856093)^Math.imul(y+71,19349663)^Math.imul(s+17,83492791))|0;
  n=Math.imul(n^(n>>>13),1274126177); return ((n^(n>>>16))>>>0)/4294967295;
}
function clampByte(n:number){return Math.max(0,Math.min(255,n|0));}
function shadePixel(kind:number,x:number,y:number,seed:number):[number,number,number]{
 const grain=(rand(x,y,seed)-.5)*26,cell=rand(x>>3,y>>3,seed+2),drip=rand(x>>2,0,seed+19);
 const stain=rand(x>>4,y>>4,seed+44)>.74&&y>45 ? .65 : 1;
 const high=kind===0? (y<115?[128,140,121]:[60,83,73]) :
            kind===1?[120,139,124]:kind===2?[101,107,100]:kind===3?[74,91,88]:[155,142,117];
 let scale=(.87+cell*.21)*stain;
 if(kind===0){
   if(y>111&&y<118)scale=.34;
   if(y>171)scale=.43;
   if(y<110&&drip>.83&&y>65+(1-drip)*110)scale*=.53;
   if(rand(x>>4,y>>4,seed+3)>.9 && y<110) scale*=.66;
 }
 if(kind===1){
   if((x%32<=1)||(y%32<=1))scale*=.37;
   if(y>175)scale*=.64;
   if(x%32>3&&x%32<7&&y%32>2&&y%32<8)scale*=.83;
 }
 if(kind===2){
   if(y>172)scale*=.61;
   if(rand(x>>2,y>>2,seed+4)>.92)scale*=.47;
   if(drip>.90&&y>25+(1-drip)*300)scale*=.49;
 }
 if(kind===3){
   if(x<7||x>120||y<7||y>183)scale*=.48;
   if(x>12&&x<116&&y>12&&y<181)scale*=.89;
   if(x%11===0 && y>18&&y<172)scale*=.85;
   if(drip>.9&&y>70)scale*=.54;
 }
 if(kind===4){
   if(y>150)scale*=.55;
   const motif=Math.abs(((x+y*2)%29)-14);
   if(motif<2&&y>15&&y<152)scale*=.67;
   if(((x>>3)+(y>>4))%9===0)scale*=.71;
 }
 return [clampByte(high[0]*scale+grain+3),clampByte(high[1]*scale+grain),clampByte(high[2]*scale+grain-2)];
}
export function analogMaterial(kind:number,day=1):HTMLCanvasElement{
 const k=((kind%5)+5)%5,cacheKey=`${day}/${k}`;
 const cached=atlas.get(cacheKey);if(cached)return cached;
 const c=document.createElement('canvas');c.width=MATERIAL_WIDTH;c.height=MATERIAL_HEIGHT;
 const ctx=c.getContext('2d')!;
 const id=ctx.createImageData(MATERIAL_WIDTH,MATERIAL_HEIGHT);
 for(let y=0;y<MATERIAL_HEIGHT;y++)for(let x=0;x<MATERIAL_WIDTH;x++){
  const [r,g,b]=shadePixel(k,x,y,day*37+k*103);
  const i=(y*MATERIAL_WIDTH+x)*4;id.data[i]=r;id.data[i+1]=g;id.data[i+2]=b;id.data[i+3]=255;
 }
 ctx.putImageData(id,0,0);
 const band=(x:number,y:number,w:number,h:number,c:string)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
 // Hendiduras y grietas pintadas a mano sobre el bitmap, NO recursos de terceros.
 ctx.lineWidth=1;
 for(let i=0;i<(k===3?9:24);i++){
  const x=5+Math.floor(rand(i,3,day*21+k)*116);
  const y=8+Math.floor(rand(i,7,day*3+k)*155);
  ctx.strokeStyle=i%3===0?'rgba(9,26,23,.48)':'rgba(18,35,33,.28)';
  ctx.beginPath();ctx.moveTo(x,y);
  ctx.lineTo(x+(i%3-1)*3,y+7);ctx.lineTo(x+((i+2)%5-2)*4,y+12+i%8);ctx.stroke();
 }
 if(k===0){
  // Desprendimientos de pintura que dejan ver la capa de yeso y ladrillo.
  for(let i=0;i<16;i++){
   const x=3+((i*47+21)%111),y=12+((i*71+13)%125);
   const w=4+i%5*3,h=2+(i*3)%7;
   band(x,y,w,h,'rgba(40,65,56,.48)');band(x+2,y+1,Math.max(1,w-5),Math.max(1,h-2),'rgba(170,159,127,.37)');
  }
  band(0,112,128,3,'#324a40');band(0,173,128,7,'#273d38');band(0,181,128,11,'#162822');
 } else if(k===1){
  for(let y=0;y<192;y+=32){band(0,y,128,2,'rgba(28,53,49,.7)');for(let x=0;x<128;x+=32)band(x,y,2,32,'rgba(24,48,44,.65)');}
  band(0,174,128,5,'#2e5652');
 } else if(k===3){
  // Puerta con visor, placa, bisagras y pomo a la altura natural.
  band(10,15,108,161,'rgba(13,27,27,.18)');band(17,28,94,36,'#1c3434');
  band(23,34,82,24,'#2b5050');band(23,52,82,2,'#557575');
  band(19,72,88,3,'#293f3f');band(19,161,88,4,'#223f3a');
  band(92,105,7,23,'#b4aa7b');band(85,112,19,5,'#dac9a1');
  for(const y of [28,156]){band(11,y,6,15,'#8d947e');band(12,y+3,4,5,'#293b39');}
  band(43,78,38,14,'#d6c7a4');band(47,83,31,2,'#403d33');band(47,87,24,1,'#655345');
 } else if(k===4){
  band(0,153,128,6,'#465e52');band(0,174,128,18,'#2c433d');
 }
 atlas.set(cacheKey,c);return c;
}
export function materialAtlasStats(){return {kinds:MATERIAL_NAMES.length,width:MATERIAL_WIDTH,height:MATERIAL_HEIGHT,generated:atlas.size};}
