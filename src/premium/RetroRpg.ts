/* NAMELESS 404 — juego maldito de 8 bits. Paletas e iconos dibujados desde
   cero. Apariencia aparentemente amable que se corrompe con el progreso. */
import { NamelessEngine as E } from '../engine.js';
const RW=256,RH=192,TILE=12,OFFSET_X=32,OFFSET_Y=18;
const C={sea:'#347c9b',sea2:'#64acb7',grass:'#57984d',grassLight:'#84bd68',grassDark:'#356e4d',soil:'#a99a67',stone:'#b4b0a0',stoneDark:'#6c786d',wood:'#987455',red:'#b54853',cream:'#f3e5b8',sky:'#142c35',shadow:'#233638',roof:'#ab756b'};
function pixel(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string){c.fillStyle=fill;c.fillRect(x|0,y|0,Math.max(1,w|0),Math.max(1,h|0));}
function rr(x:number,y:number,seed:number){let v=Math.sin(x*73.127+y*197.31+seed*32.73)*41728.148;return v-Math.floor(v);}
function write(c:CanvasRenderingContext2D,s:string,x:number,y:number,col='#dcd1a9',size=8){c.font=`${size}px monospace`;c.fillStyle=col;c.fillText(s,x,y);}
function wallTile(c:CanvasRenderingContext2D,x:number,y:number,gx:number,gy:number,day:number){
  const kind=(gx*11+gy*17+day*5)%6;
  if(kind===0||kind===3){
    // Piedra tallada, junta sombreada, musgo.
    pixel(c,x,y,TILE,TILE,'#77796a');pixel(c,x+1,y+1,10,10,C.stone);pixel(c,x+1,y+6,10,1,'#6d7972');
    pixel(c,x+6,y+1,1,5,C.stoneDark);pixel(c,x+3,y+7,1,3,'#5b7361');
  }else if(kind===1){
    pixel(c,x,y,TILE,TILE,'#5b755f');pixel(c,x+1,y+1,10,10,'#6d9067');
    pixel(c,x+3,y+3,4,4,'#4e6e54');pixel(c,x+8,y+2,2,7,'#89a77c');
  }else if(kind===2){
    pixel(c,x,y,TILE,TILE,'#a47a66');pixel(c,x+1,y+1,10,10,C.roof);
    for(let j=0;j<3;j++)pixel(c,x+1,y+2+j*3,10,1,'#5e5c4d');
  }else if(kind===4){
    pixel(c,x,y,TILE,TILE,'#506850');pixel(c,x+1,y+1,10,10,'#4e7b55');
    pixel(c,x+3,y+2,7,2,'#8aa970');pixel(c,x+5,y+7,5,3,'#315a48');
  }else{
    pixel(c,x,y,TILE,TILE,'#6b675d');pixel(c,x+1,y+1,10,10,'#8a826e');
    pixel(c,x+2,y+2,3,3,'#c2b597');pixel(c,x+7,y+6,3,3,'#514f4d');
  }
}
function groundTile(c:CanvasRenderingContext2D,x:number,y:number,gx:number,gy:number,day:number,corruption:boolean){
  let k=rr(gx,gy,day),desat=corruption&&rr(gx+4,gy,day)>.68;
  const base=day===1?C.grassLight:day===4?'#73998e':day===6?'#aaa28b':C.grass;
  pixel(c,x,y,TILE,TILE,desat?'#56686a':base);
  pixel(c,x+1,y+1,10,10,desat?'#53676a':(k>.66?C.grass:day===1?'#8ec16c':'#709f70'));
  if(k>.76){pixel(c,x+3,y+3,2,1,'#286951');pixel(c,x+5,y+2,1,4,'#347c52');pixel(c,x+8,y+5,2,2,'#d2be8a');}
  else if(k<.14){pixel(c,x+1,y+5,9,2,C.soil);pixel(c,x+5,y+1,2,10,'#bfaa77');}
  else{pixel(c,x+6,y+5,2,2,'#609c56');pixel(c,x+2,y+8,2,1,'#3c854f');}
  if(day===1&&(gx+gy)%9===0){pixel(c,x+2,y+2,4,1,'#d8ba85');pixel(c,x+4,y+6,2,1,'#ecdb9f');}
}
function portrait(c:CanvasRenderingContext2D,x:number,y:number,kind:string,corrupt:boolean){
  // 10×12: cabeza, cabello, torso y pies. Los personajes no son clones externos.
  const skin=corrupt?'#c7c8bc':'#e4c8a1';
  pixel(c,x+3,y+1,6,5,skin);
  pixel(c,x+2,y,8,2,kind==='child'?'#38556b':'#344451');
  pixel(c,x+3,y+4,1,1,'#27383e');pixel(c,x+8,y+4,1,1,'#27383e');
  const shirt=kind==='child'?'#507eaf':kind==='naoWitness'?'#99616e':'#a34d58';
  pixel(c,x+2,y+6,8,4,shirt);pixel(c,x+1,y+7,2,3,'#b3ab92');pixel(c,x+9,y+7,2,3,'#b3ab92');
  pixel(c,x+3,y+10,2,2,'#33405e');pixel(c,x+7,y+10,2,2,'#33405e');
}
function special(c:CanvasRenderingContext2D,px:number,py:number,type:string,corrupt:boolean,s:any){
  // Sprite de objeto basado en su tipo, con indicadores visuales sin números de depuración.
  const x=OFFSET_X+px*TILE,y=OFFSET_Y+py*TILE;
  if(type==='child'||type==='naoWitness'||type==='traveler'||type==='paperNurse'||type==='facelessNeighbor'||type==='ashKeeper'){
    portrait(c,x,y,type,corrupt);return;
  }
  if(/well|originCore|cinderIndex|clock|reflection|finalArchive/i.test(type)){
    pixel(c,x,y+3,12,9,'#536c6e');pixel(c,x+1,y+4,10,7,'#b7b1a0');
    pixel(c,x+3,y+5,6,5,'#203d46');pixel(c,x+5,y+4,2,1,'#d4c5ad');return;
  }
  if(/seal|ending|exit|threshold|platform|bedZero/i.test(type)){
    pixel(c,x+1,y+1,10,11,'#513e50');pixel(c,x+2,y+2,8,10,corrupt?'#8a495d':'#b07c5f');
    pixel(c,x+4,y+4,4,6,'#1d2638');pixel(c,x+7,y+6,1,2,'#f1db9c');return;
  }
  if(/note|book|ledger|address|portrait|file|map|name|signal|photo|letter/i.test(type)){
    pixel(c,x+1,y+2,10,9,'#413d46');pixel(c,x+2,y+1,8,9,'#f0d7a0');
    for(let j=0;j<3;j++)pixel(c,x+3,y+3+j*2,5,1,'#866956');return;
  }
  pixel(c,x+1,y+2,10,10,C.stoneDark);pixel(c,x+3,y+3,6,7,'#b9ad82');
  pixel(c,x+5,y+4,2,4,'#9c554d');
}
function corruptScan(c:CanvasRenderingContext2D,s:any,now:number){
  if(!s.seal&&s.day===1)return;
  const ticks=Math.floor(now/800);
  for(let j=0;j<6;j++){
    const y=20+Math.floor(rr(j,ticks,s.day)*140);
    const x=34+Math.floor(rr(j+9,ticks,s.day)*185);
    pixel(c,x,y,4+(j%3)*7,1,j%2?'#ad536c':'#2f6e79');
  }
}
export const RetroRpg={
 render(c:CanvasRenderingContext2D,s:any,now:number){
  c.imageSmoothingEnabled=false;
  pixel(c,0,0,RW,RH,C.sky);
  pixel(c,5,5,246,182,'#131e27');pixel(c,8,8,240,175,'#2c3b35');
  pixel(c,10,10,236,172,'#172b2b');
  write(c,'T S / 0 4     UNA PARTIDA VACÍA',28,15,'#dfd9b1',8);
  const map=E.rpgMap(s);const corrupt=s.day>1||!!s.seal;
  for(let y=0;y<map.length;y++)for(let x=0;x<map[y].length;x++){
    const px=OFFSET_X+x*TILE,py=OFFSET_Y+y*TILE;
    if(E.wall(map,x,y))wallTile(c,px,py,x,y,s.day);
    else groundTile(c,px,py,x,y,s.day,corrupt);
  }
  // Un marco de RPG portátil de 2006 y referencias a un pueblo que ya no existe.
  c.strokeStyle='#667c6b';c.strokeRect(OFFSET_X-.5,OFFSET_Y-.5,192+1,156+1);
  for(const item of E.rpgItems(s))special(c,item.x,item.y,item.id,corrupt,s);
  const px=OFFSET_X+s.px*TILE,py=OFFSET_Y+s.py*TILE;
  portrait(c,px,py,'protagonist',corrupt);
  pixel(c,px+3,py+12,7,1,'#172b2a');
  corruptScan(c,s,now);
  pixel(c,14,177,228,12,'#142125');
  write(c,s.day===1?'NO BORRES LA PARTIDA':`ARCHIVO MALDITO   DÍA ${s.day}`,53,186,corrupt?'#d597a0':'#dfd1a2',8);
  const found=E.rpgItems(s).filter(o=>Math.abs(o.x-s.px)+Math.abs(o.y-s.py)<=1);
  if(found.length){pixel(c,49,147,157,17,'#17222be0');write(c,'E · HABLAR / EXAMINAR',62,159,'#f0e1b3',8);}
 }
};
