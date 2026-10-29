// @ts-nocheck
import {drawDayOneArt} from "./premium/DayOneArt.js";
import { NamelessEngine as E } from "./engine.js";
/* NAMELESS 404: doble pantalla 256x192, gráficos propios dibujados en Canvas. */
export const NamelessRender = (function () {
  'use strict';
  const W=256,H=192,PI=Math.PI;
  const PALETTE={ink:'#071017',stone:'#374447',leaf:'#45564d',cream:'#d8d7b7',red:'#b96470',sand:'#cba780'};
  const CHAR={
    'A':['01110','10001','10001','11111','10001','10001','10001'],
  };
  function box(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));}
  function txt(c,str,x,y,color='#d8e0d2',size=8){c.fillStyle=color;c.font=`${size}px monospace`;c.fillText(str,x,y);}
  function line(c,x,y,xx,yy,color='#ffffff'){c.strokeStyle=color;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();}
  function rand(x,y,seed=0){let n=Math.sin(x*127.1+y*311.7+seed*89.13)*43758.5453;return n-Math.floor(n);}
  function crack(c,x,y,wide,col){line(c,x,y,x+wide*.4,y+wide*.3,col);line(c,x+wide*.4,y+wide*.3,x+wide,y+wide*.2,col);}
  function noise(c,seconds,amount=20){for(let i=0;i<amount;i++){let x=(rand(i,seconds|0,10)*W)|0,y=(rand(i,seconds|0,20)*H)|0;box(c,x,y,1+(i%13===0?9:1),1,i%3===0?'#e2e5e316':'#02070866');}}
  function sky(c){
    box(c,0,0,W,94,'#111b20');box(c,0,93,W,99,'#172025');
    for(let i=0;i<97;i+=2){box(c,0,i,W,2,`rgba(39,54,58,${(i/180).toFixed(3)})`);}
    for(let y=96;y<192;y+=5)box(c,0,y,W,1,'#2b303327');
  }
  function sight(map,x,y,ang){
    const dx=Math.sin(ang),dy=-Math.cos(ang);
    let t=0,px=x,py=y;
    for(let i=0;i<300;i++){
      t+=.055;px=x+t*dx;py=y+t*dy;
      if(E.wall(map,px,py))return {d:t,x:px,y:py,side:Math.min((px%1+1)%1,1-(px%1+1)%1)<.045?1:0};
    }return {d:16,x:px,y:py,side:0};
  }
  function shadow(c,light){let v=c.createRadialGradient(128,92,8,128,92,light?159:76);v.addColorStop(0,'#00000000');v.addColorStop(1,light?'#000000bd':'#000000f3');box(c,0,0,W,H,v);}
  function sprite(c,screenX,distance,kind,t){
    if(distance<.12||distance>12)return;
    const h=Math.min(182,148/distance),w=h*(kind==='copist'?.43:.40),x=screenX-w/2,y=96-h/2+(kind==='copist'?Math.sin(t*.012)*Math.max(.3,3/distance):0);
    if(x>W+30||x+w< -30)return;
    if(kind==='copist'){
      box(c,x+w*.2,y+h*.2,w*.6,h*.68,'#080d11');
      box(c,x+w*.27,y+h*.04,w*.47,h*.26,'#b5baa9');
      box(c,x+w*.35,y+h*.10,w*.07,h*.035,'#0b1014');box(c,x+w*.58,y+h*.10,w*.07,h*.035,'#0b1014');
      const stride=Math.sin(t*.017)*h*.045;box(c,x+w*.36,y+h*.64+stride,w*.10,h*.35,'#0b0c0e');box(c,x+w*.57,y+h*.64-stride,w*.10,h*.35,'#0b0c0e');
      box(c,x-w*.04,y+h*.34,w*.29,h*.37,'#0d1115');box(c,x+w*.75,y+h*.35,w*.27,h*.39,'#0d1115');
      box(c,x+w*.32,y+h*.22,w*.4,h*.03,'#6d313d');
      // Paper-mask seams and slightly asynchronous edges. The face never blinks.
      box(c,x+w*.3,y+h*.06,w*.43,Math.max(1,h*.013),'#d4d2bf70');
      line(c,x+w*.55,y+h*.05,x+w*.52,y+h*.22,'#313b3d');
      box(c,x+w*.18,y+h*.20,w*.11,h*.19,'#060b0e');
      box(c,x+w*.71,y+h*.26,w*.08,h*.21,'#050b0c');
      const paperSway=Math.sin(t*.0014)*Math.min(4,w*.16);
      box(c,x+w*.10+paperSway,y+h*.57,w*.10,h*.35,'#c1c0ad36');
      box(c,x+w*.78-paperSway,y+h*.61,w*.09,h*.27,'#c1c0ad24');
      if(distance<2.3){
        // Hands extend unnaturally toward the ground as the entity closes in.
        box(c,x-w*.035,y+h*.61,w*.11,h*.19,'#9a9c8b');
        box(c,x+w*.91,y+h*.62,w*.10,h*.19,'#999c8c');
      }
    }else if(kind==='shadow'){
      box(c,x+w*.25,y+h*.12,w*.5,h*.6,'#030809');
      box(c,x+w*.34,y,w*.3,h*.26,'#1e2927');
      box(c,x+w*.22,y+h*.68,w*.2,h*.3,'#101717');box(c,x+w*.58,y+h*.68,w*.2,h*.3,'#101717');
    }
    if(t%3===0)box(c,x,y+h*.44,w,1,'#c8c8c821');
  }
  function paintObjects(c,s,zBuffer,now){
    const ang0=s.dir*PI/2;
    let things=E.realItems(s).map(o=>({...o,d:E.distance(s.rx,s.ry,o.x,o.y)}));
    if(s.chase)things.push({x:s.entityX,y:s.entityY,id:'copist',d:E.distance(s.rx,s.ry,s.entityX,s.entityY)});
    things.sort((a,b)=>b.d-a.d);
    for(const o of things){
      if(o.d>10||o.d<.2)continue;
      let angle=Math.atan2(o.x-s.rx,-(o.y-s.ry))-ang0;
      angle=Math.atan2(Math.sin(angle),Math.cos(angle));
      if(Math.abs(angle)>.78)continue;
      let sx=128+153*Math.tan(angle), col=Math.floor(sx/2);
      if(col<0||col>=zBuffer.length||o.d>zBuffer[col]+.28)continue;
      if(o.id==='copist'){sprite(c,sx,o.d,'copist',now|0);continue;}
      const h=Math.min(150,100/o.d),w=h*.52,x=sx-w/2,y=98-h/2;
      if(o.id==='kibaBreaker'){box(c,x,y+h*.31,w,h*.50,'#546a63');box(c,x+3,y+h*.36,w-6,h*.33,'#1f3437');box(c,x+w*.43,y+h*.43,w*.15,h*.13,s.flags?.kibaNorthOpen?'#afd3a3':'#a35e53');}
      if(o.id==='kibaWinch'){box(c,x+w*.30,y+h*.23,w*.37,h*.60,'#57635c');box(c,x+w*.15,y+h*.38,w*.72,h*.13,'#b1aaa0');box(c,x+w*.41,y+h*.36,w*.15,h*.33,s.flags?.kibaArchiveOpen?'#829d7c':'#743e48');}
      if(o.id==='kibaVent'){box(c,x-w*.08,y+h*.23,w*1.16,h*.47,'#4c6667');for(let n=0;n<5;n++)box(c,x+2,y+h*(.30+n*.06),w-4,2,'#1e3035');}
      if(o.id==='kibaHideArchive'||o.id==='kibaHideBasement'){box(c,x-w*.08,y+h*.16,w*1.16,h*.73,'#54534b');for(let n=0;n<4;n++){box(c,x,y+h*(.24+n*.16),w,h*.08,n%2?'#353b36':'#6a6758');}box(c,x+w*.12,y+h*.57,w*.27,h*.22,'#1b2526');}
      if(o.id==='tape'){box(c,x,y+h*.68,w,h*.28,'#343a3a');box(c,x+w*.13,y+h*.64,w*.74,h*.18,'#a8aca0');box(c,x+w*.28,y+h*.69,w*.16,h*.11,'#101619');box(c,x+w*.62,y+h*.69,w*.16,h*.11,'#101619');}
      if(o.id==='cabinet'){box(c,x,y+h*.06,w,h*.9,'#4d4e48');box(c,x+2,y+h*.1,w-4,h*.8,'#303b3a');box(c,x+w*.66,y+h*.48,2,3,'#a9a687');line(c,x+w*.48,y+h*.08,x+w*.48,y+h*.86,'#64706b');}
      if(o.id==='locker'){box(c,x,y,w,h,'#3e4947');box(c,x+3,y+3,w-6,h-6,'#293936');for(let j=0;j<3;j++)box(c,x+6,y+h*.15+j*3,w-12,1,'#74807c');box(c,x+w*.75,y+h*.43,2,3,'#b2af90');}
      if(o.id==='telephone'){box(c,x,y+h*.45,w,h*.4,'#303a3c');box(c,x+w*.13,y+h*.56,w*.72,h*.12,'#73867b');box(c,x+w*.14,y+h*.43,w*.72,h*.09,'#121f22');}
      if(o.id==='mirror'){box(c,x,y+h*.05,w,h*.83,'#655d52');box(c,x+3,y+h*.08,w-6,h*.74,'#273f42');box(c,x+w*.45,y+h*.12,w*.12,h*.58,'#b1baaf36');}
      if(o.id==='register'){box(c,x,y+h*.36,w,h*.45,'#746953');box(c,x+3,y+h*.35,w-6,h*.16,'#c1b69c');box(c,x+w*.22,y+h*.41,w*.56,2,'#5a4f48');box(c,x+w*.2,y+h*.49,w*.49,2,'#5a4f48');}
      if(o.id==='intercom'){box(c,x+w*.16,y+h*.10,w*.68,h*.70,'#3f5659');box(c,x+w*.24,y+h*.23,w*.50,h*.16,'#acb8ad');for(let k=0;k<4;k++)box(c,x+w*.23+k*3,y+h*.48,2,2,'#152629');box(c,x+w*.67,y+h*.64,3,3,'#a96572');}
      if(o.id==='room207'){box(c,x+w*.07,y+h*.02,w*.86,h*.94,'#4e393c');box(c,x+w*.17,y+h*.10,w*.65,h*.81,'#241e25');box(c,x+w*.27,y+h*.39,w*.31,h*.12,'#ad8580');box(c,x+w*.72,y+h*.48,2,2,'#c8ab87');}
      if(o.id==='locker2'){box(c,x,y+h*.06,w,h*.89,'#53615c');for(let k=0;k<3;k++)box(c,x+4,y+h*.16+k*h*.2,w-8,2,'#273b3b');}
      if(o.id==='ticket'){box(c,x+w*.13,y+h*.47,w*.75,h*.29,'#c7b793');box(c,x+w*.19,y+h*.50,w*.60,h*.06,'#7b7473');box(c,x+w*.19,y+h*.60,w*.29,2,'#5e5c55');}
      if(o.id==='schedule'){box(c,x-w*.18,y+h*.05,w*1.35,h*.70,'#111c24');box(c,x-w*.11,y+h*.12,w*1.18,h*.52,'#263f40');for(let a=0;a<3;a++){box(c,x-w*.03,y+h*(.19+a*.13),w*.78,2,'#bbbe99');box(c,x+w*.80,y+h*(.19+a*.13),w*.11,2,'#d49f71');}}
      if(o.id==='booth'){box(c,x-w*.16,y,w*1.32,h,'#344c4b');box(c,x,y+h*.16,w,h*.72,'#1b292d');box(c,x+w*.16,y+h*.28,w*.52,h*.20,'#768a88');box(c,x+w*.73,y+h*.55,3,3,'#c5a76b');}
      if(o.id==='bench'){box(c,x-w*.10,y+h*.51,w*1.2,h*.15,'#566c69');box(c,x-w*.05,y+h*.28,w*1.1,h*.22,'#344746');box(c,x,y+h*.62,2,h*.3,'#6d7e73');box(c,x+w*.86,y+h*.62,2,h*.3,'#6d7e73');}
      if(o.id==='patientFile'){box(c,x,y+h*.31,w,h*.48,'#c7c2a9');box(c,x+3,y+h*.34,w-6,h*.04,'#735b5c');for(let q=0;q<3;q++)box(c,x+4,y+h*(.43+q*.09),w*.64,1,'#656f68');box(c,x+w*.68,y+h*.59,w*.18,h*.18,'#a25b65');}
      if(o.id==='xray'){box(c,x-w*.09,y+h*.05,w*1.18,h*.84,'#5a6e6c');box(c,x+2,y+h*.12,w-4,h*.66,'#102e35');box(c,x+w*.37,y+h*.18,w*.25,h*.16,'#a0b8aa');box(c,x+w*.45,y+h*.35,w*.08,h*.34,'#a0b8aa');for(let q=0;q<4;q++)box(c,x+w*.21,y+h*(.41+q*.055),w*.59,1,'#a8bcb3');}
      if(o.id==='reel'){box(c,x-w*.15,y+h*.45,w*1.3,h*.32,'#4a4e51');for(let k of [0.26,0.74]){box(c,x+w*k-w*.16,y+h*.40,w*.31,h*.31,'#b4a88f');box(c,x+w*k-w*.07,y+h*.49,w*.13,h*.12,'#293538');}box(c,x+w*.34,y+h*.56,w*.33,2,'#111d23');}
      if(o.id==='curtain'){box(c,x-w*.18,y+h*.02,w*1.35,h*.92,'#8aaba3');for(let k=0;k<5;k++)box(c,x+w*(-.12+k*.25),y+h*.05,w*.11,h*.82,'#527671');box(c,x-w*.2,y+h*.04,w*1.4,2,'#b2b6a6');}
      if(o.id==='originTerminal'){box(c,x-w*.1,y+h*.1,w*1.2,h*.75,'#415359');box(c,x+2,y+h*.17,w-4,h*.43,'#101e2b');box(c,x+w*.25,y+h*.3,w*.45,2,'#a7b7a8');box(c,x+w*.39,y+h*.66,w*.24,h*.09,'#9a8874');}
      if(o.id==='voiceProof'){box(c,x,y+h*.18,w,h*.64,'#60565e');box(c,x+w*.22,y+h*.27,w*.53,h*.18,'#1e2f39');for(let i=0;i<5;i++)box(c,x+w*.23+i*w*.1,y+h*.52,w*.05,h*.12,'#b2ad9f');}
      if(o.id==='originalPhoto'){box(c,x-w*.05,y+h*.19,w*1.1,h*.65,'#b4ac90');box(c,x+w*.10,y+h*.27,w*.83,h*.49,'#253941');for(let i=0;i<2;i++){box(c,x+w*(.2+i*.45),y+h*.34,w*.20,h*.20,'#b9bda9');box(c,x+w*(.18+i*.45),y+h*.53,w*.25,h*.20,'#697e79');}}
      if(o.id==='safeCabinet'){box(c,x,y+h*.1,w,h*.8,'#586767');for(let i=0;i<4;i++)box(c,x+3,y+h*(.21+i*.16),w-6,2,'#26383c');}
      if(o.id==='ashLabel'){box(c,x+w*.13,y+h*.32,w*.75,h*.46,'#8b8c79');box(c,x+w*.21,y+h*.32,w*.58,h*.17,'#c1b9a1');box(c,x+w*.32,y+h*.51,w*.32,h*.16,'#4b4d4a');}
      if(o.id==='furnace'){box(c,x-w*.14,y+h*.05,w*1.3,h*.87,'#55514a');box(c,x-w*.02,y+h*.18,w*1.05,h*.60,'#202528');box(c,x+w*.10,y+h*.30,w*.76,h*.37,'#4a3933');}
      if(o.id==='negative'){box(c,x-w*.02,y+h*.22,w*1.05,h*.63,'#aea48e');box(c,x+w*.12,y+h*.29,w*.73,h*.47,'#253439');box(c,x+w*.36,y+h*.36,w*.23,h*.18,'#84978f');}
      if(o.id==='serviceVent'){box(c,x-w*.08,y+h*.18,w*1.16,h*.65,'#68665d');for(let k=0;k<5;k++)box(c,x,y+h*(.26+k*.1),w,2,'#252d30');}
      if(o.id==='streetSign'){box(c,x+w*.40,y+h*.12,w*.15,h*.82,'#58625d');box(c,x-w*.08,y+h*.06,w*1.16,h*.24,'#b3b8a0');box(c,x+2,y+h*.12,w*.75,2,'#3d4548');}
      if(o.id==='emptyPlot'){box(c,x-w*.13,y+h*.65,w*1.24,h*.12,'#515d55');for(let j=0;j<4;j++)box(c,x+w*(j*.22),y+h*.42+(j%2)*3,w*.04,h*.22,'#6a685e');}
      if(o.id==='missingHouse'){box(c,x-w*.15,y+h*.05,w*1.30,h*.92,'#5b5c51');box(c,x-w*.02,y+h*.12,w*1.04,h*.79,'#222b2c');box(c,x+w*.60,y+h*.47,w*.09,h*.13,s.d5Street?'#b8a786':'#5b3e42');}
      if(o.id==='busShelter'){box(c,x-w*.14,y+h*.14,w*1.29,h*.08,'#9a9a83');box(c,x-w*.09,y+h*.17,w*.10,h*.70,'#55665f');box(c,x+w*.94,y+h*.17,w*.10,h*.70,'#55665f');box(c,x+w*.12,y+h*.61,w*.75,h*.08,'#aaa38c');}
      if(o.id==='photo'){box(c,x,y+h*.12,w,h*.6,'#6f6857');box(c,x+3,y+h*.15,w-6,h*.53,'#b7b29c');box(c,x+w*.12,y+h*.41,w*.18,h*.22,'#343f42');box(c,x+w*.38,y+h*.30,w*.21,h*.32,'#59655d');box(c,x+w*.68,y+h*.36,w*.2,h*.26,'#20262b');box(c,x+w*.64,y+h*.25,w*.16,h*.18,'#090e13');}
      // Mancha de ocre, polvo y roturas estilizadas en los objetos interactivos.
      if(o.d<2.6&&((now/900)|0)%2===0)box(c,x+w*.43,y+h*.07,Math.max(2,w*.12),1,'#cfceae66');
    }
  }
  function real(c,s,now){
    sky(c);
    const room=E.roomAt(s.rx,s.ry,s.day),basement=room==='SOTANO TECNICO',archives=room==='ALA DE ARCHIVOS',east=room==='ALA ESTE',residence=s.day===2,station=s.day===3,hospital=s.day===4,neighborhood=s.day===5,ashes=s.day===6,origin=s.day===7;
    const tint=origin?(room==='CAMARA DEL ORIGINAL'?[.57,.73,.76]:room==='SALA DE VOCES'?[.73,.52,.64]:[.55,.69,.72]):ashes?(room==='ARCHIVO NEGATIVO'?[.62,.60,.56]:room==='HORNO CENTRAL'?[.74,.57,.50]:[.67,.65,.60]):neighborhood?(room==='CASA AUSENTE'?[.58,.53,.47]:room==='SOLAR VACIO'?[.67,.61,.51]:[.70,.67,.58]):hospital?(room==='QUIROFANO CERO'?[.59,.78,.71]:room==='RADIOLOGIA'?[.63,.81,.78]:[.72,.80,.72]):station?(room==='VIA CERO'?[.49,.63,.68]:room==='PANEL DE SALIDAS'?[.72,.72,.61]:[.58,.68,.66]):residence?(room==='HABITACION 207'?[.76,.56,.59]:room==='DORMITORIOS'?[.66,.71,.65]:[.64,.72,.70]):basement?[.60,.69,.73]:archives?[.71,.65,.59]:east?[.62,.74,.77]:[.78,.81,.75];
    // Suelo en falso 3D, baldosas irregulares y luminarias rotas.
    for(let y=98;y<H;y++){
      let k=(y-96)/(H-96),floorShade=(17+Math.floor(k*19));
      box(c,0,y,W,1,`rgb(${Math.round(floorShade*tint[0])},${Math.round(floorShade*tint[1])},${Math.round(floorShade*tint[2])})`);
      if(y%Math.max(3,Math.round(17/(k+.16)))===0)box(c,0,y,W,1,'#888e8760');
    }
    for(let n=-4;n<=4;n++){
      let a=128+n*43;
      line(c,128,96,a,191,'#101b1c45');
    }
    box(c,91,4,74,3,'#9caa9360');box(c,108,7,40,2,'#b5bea160');
    if(basement) {box(c,0,70,W,2,'#43505222');box(c,0,75,W,2,'#171b2233');}
    if(archives) {box(c,0,19,W,2,'#5c473a25');}
    if(residence){box(c,0,41,W,1,'#89948727');box(c,15,3,17,2,'#bbab9150');box(c,224,3,17,2,'#bbab9150');}
    if(ashes){box(c,36,4,184,13,'#242627');box(c,40,6,176,9,'#5d6259');txt(c,s.d6Vent?'ARCHIVO: ABIERTO':'ARCHIVO DE CENIZAS — 06',45,13,'#d8d0b1',7);for(let j=0;j<7;j++)box(c,j*37+(j%2)*11,130+(j%3)*8,2,2,'#b0ada353');}
    if(neighborhood){
      // Fachadas ausentes: marcas de suelo y letreros apenas legibles.
      for(let y=105;y<192;y+=18)box(c,0,y,W,1,'#b3a68a44');
      box(c,46,4,164,12,'#1a2827');box(c,48,6,160,8,'#58665c');
      txt(c,s.d5Street?'CALLE RESTAURADA / CASA 0':'CALLE DE LOS AUSENTES',56,12,'#e3d4b5',8);
      for(let i=0;i<3;i++){const k=20+i*87;box(c,k,55+i*7,19,55,'#131d1f33');}
    }
    if(hospital){
      // Baldosas azuladas, fluorescentes, cartel de admisión y una línea de monitor.
      for(let y=100;y<192;y+=15)box(c,0,y,W,1,'#b2d0c251');
      for(let x=0;x<256;x+=27)line(c,x,192,128+(x-128)*.09,96,'#788c8258');
      box(c,44,4,168,12,'#142b2c');box(c,46,6,164,8,'#466762');
      txt(c,s.d4Fold?'SALA 0  /  ACCESO ABIERTO':'SALA 0  /  SIN ACCESO',56,12,'#dce7c7',8);
      if(room==='QUIROFANO CERO'){box(c,9,155,238,2,'#8ec8b078');box(c,9,164,238,1,'#8ec8b03e');}
    }
    if(station){
      // Andén de azulejos, tubos fluorescentes, marcas de seguridad y rieles de fondo.
      for(let y=99;y<192;y+=13){box(c,0,y,W,1,'#a9aa7850');}
      for(let x=6;x<256;x+=20)line(c,x,192,128+(x-128)*.12,98,'#61747752');
      box(c,49,4,158,12,'#0b1418');box(c,51,6,154,8,'#45605b');
      txt(c,s.d3Signal?'PLATAFORMA 0  /  ABIERTA':'PLATAFORMA 0  /  CERRADA',61,12,'#d8c99a',8);
      if(room==='VIA CERO'){box(c,12,157,232,2,'#c7ad5f80');box(c,16,161,224,1,'#c7ad5f60');}
    }
    const zBuffer=[];
    for(let i=0;i<128;i++){
      let ang=s.dir*PI/2+Math.atan((i*2-128)/153),r=sight(E.realMap(s),s.rx,s.ry,ang),d=r.d*Math.cos(ang-s.dir*PI/2);
      zBuffer[i]=d;
      const ht=Math.min(290,167/Math.max(.1,d)),yy=96-ht/2;
      const tileX=Math.abs((r.x%1+1)%1),tileY=Math.abs((r.y%1+1)%1);
      const fx=Math.min(tileX,1-tileX,tileY,1-tileY),isSeam=fx<.08;
      const base=Math.max(17,Math.floor(138/(1+d*.22))),shade=s.light?1:.34;
      let rr=Math.round(base*tint[0]*shade),gg=Math.round(base*tint[1]*shade),bb=Math.round(base*tint[2]*shade);
      if(isSeam){rr*=.48;gg*=.48;bb*=.48;}
      if(r.side){rr*=.84;gg*=.84;bb*=.84;}
      box(c,i*2,yy,2,ht,`rgb(${rr|0},${gg|0},${bb|0})`);
      if(d<9){
        let stitch=ht*.19;
        for(let y=1;y<5;y++)box(c,i*2,yy+y*stitch,2,1,'#0c121540');
        let pattern=(Math.floor(r.x*7)+Math.floor(r.y*7))%7;
        if(pattern===1)box(c,i*2,yy+ht*.72,2,2,'#070c0f50');
        // Desconchones, zócalos y tuberias procedurales con variacion por estancia.
        if(pattern===3&&ht>28)box(c,i*2,yy+ht*.3,2,Math.min(6,ht*.07),'#181d213b');
        if(archives&&ht>28)box(c,i*2,yy+ht*.76,2,Math.max(1,ht*.09),'#352c2b77');
        if(basement&&ht>20)box(c,i*2,yy+ht*.24,2,2,'#77807640');
        if(residence&&ht>35){if(pattern===4)box(c,i*2,yy+ht*.31,2,3,'#9c9e8873');if(pattern===6)box(c,i*2,yy+ht*.72,2,Math.max(2,ht*.08),'#47333687');}
        if(hospital&&ht>25){if(pattern===2)box(c,i*2,yy+ht*.26,2,Math.max(2,ht*.05),'#b2c4ba70');if(pattern===6)box(c,i*2,yy+ht*.69,2,Math.max(2,ht*.06),'#344f4b99');}
        if(station&&ht>25){if(pattern===2)box(c,i*2,yy+ht*.32,2,Math.max(2,ht*.10),'#c3c0a07d');if(pattern===5)box(c,i*2,yy+ht*.70,2,Math.max(1,ht*.04),'#d4ac597c');}

        if(east&&pattern===5&&ht>35)box(c,i*2,yy+ht*.13,2,3,'#202e3c58');
      }
    }
    paintObjects(c,s,zBuffer,now);
    if(!s.light){box(c,0,0,W,H,'#00071148');}
    shadow(c,s.light);
    if(s.chase){
      const d=E.distance(s.rx,s.ry,s.entityX,s.entityY);
      if(d<5)box(c,0,0,W,H,`rgba(87,12,22,${(0.03+(5-d)*.013).toFixed(3)})`);
    }
    box(c,125,96,7,1,'#e2e3d3a6');box(c,128,93,1,7,'#e2e3d3a6');
    txt(c,s.day===7?'07 / ARCHIVO DE ORIGEN':s.day===6?'06 / DEPOSITO DE CENIZAS':s.day===5?'05 / CALLE DE LOS AUSENTES':s.day===4?'04 / SANATORIO DE PAPEL':s.day===3?'03 / ESTACION HATSUNE':s.day===2?'02 / RESIDENCIA KIBA':'01 / EDIFICIO KIBA',9,28,'#b6c6bd',8);
    txt(c,room,9,39,'#92afa6',8);
    txt(c,`POS ${Math.floor(s.rx)}:${Math.floor(s.ry)} ${['N','E','S','O'][s.dir]}  ${s.hidden?'OCULTO':''}`,9,181,'#b7c5bb',8);
    if(s.day===1&&s.flags?.kibaFinaleStage===1||s.day===1&&s.flags?.kibaFinaleStage===2){
      const second=s.flags.kibaFinaleStage===2;
      box(c,33,68,190,22,'#111b1bdc');box(c,33,68,190,1,'#b28b6b');
      txt(c,second?'HUYE AL VESTIBULO   2/2':'LLEGA A LOS ARCHIVOS 1/2',44,77,'#e2ceb0',8);
      txt(c,'LA CINTA SIGUE GRABANDO',54,86,'#a6b7ad',7);
    }
    if(s.day===1&&s.flags?.kibaFinaleStage===3){
      txt(c,'KIBA / HUIDA COMPLETA',57,160,'#d9c7a4',8);
    }
    if(s.chase&&s.threat>38){txt(c,'NO ES TU SOMBRA',78,160,'#e5a0a2',9);}
    if(room==='SOTANO TECNICO'&&s.tape&&!s.hidden&&s.threat>57){
      // Aparicion breve en zona de alto peligro, sin destellos necesarios.
      const shimmer=Math.floor(now/650)%7;
      if(shimmer===2||shimmer===3)sprite(c,172,3.2,'shadow',now);
    }
    const prox=E.realItems(s).filter(o=>E.distance(o.x,o.y,s.rx,s.ry)<o.r).sort((a,b)=>E.distance(a.x,a.y,s.rx,s.ry)-E.distance(b.x,b.y,s.rx,s.ry));
    if(prox.length){const label={kibaBreaker:'CUADRO NORTE',kibaWinch:'TORNO DE ARCHIVOS',kibaVent:'GOLPEAR CONDUCTO',kibaHideArchive:'ESCONDERSE (RIESGO)',kibaHideBasement:'ESCONDERSE (RIESGO)',tape:'CINTA 04',cabinet:'ARMARIO',locker:'ESCONDERSE',telephone:'TELEFONO',mirror:'ESPEJO',photo:'FOTOGRAFIA',register:'REGISTRO',intercom:'INTERFONO',room207:'PUERTA 207',locker2:'BIOMBO',ticket:'BILLETE',schedule:'PANEL DE SALIDAS',booth:'CABINA',bench:'BANCO',patientFile:'EXPEDIENTE',xray:'RADIOGRAFIA',reel:'BOBINA',curtain:'CORTINA',ashLabel:'URNA 06',furnace:'HORNO',negative:'NEGATIVO',serviceVent:'CONDUCTO',originTerminal:'TERMINAL',voiceProof:'PRUEBA DE VOZ',originalPhoto:'FOTO ORIGINAL',safeCabinet:'ARCHIVADOR'};
      box(c,49,145,158,15,'#071013bf');txt(c,'E: '+(label[prox[0].id]||'EXAMINAR'),61,155,'#cdd4ba',9);
    }
  }
  function drawTiles(c,s,now){
    box(c,0,0,W,H,'#0c1618');
    // marco y fondo del juego maldito: 16x13 casillas de 11px.
    txt(c,'ARCHIVO / VERSION ??.??',34,14,'#b4c8b0',9);
    const T=11,OX=40,OY=23, map=E.rpgMap(s);
    for(let y=0;y<map.length;y++)for(let x=0;x<map[0].length;x++){
      const xx=OX+x*T, yy=OY+y*T,wall=E.wall(map,x,y),rnd=rand(x,y,s.day*19);
      box(c,xx,yy,T,T,wall?(s.day===7?'#444e55':s.day===6?'#4a4a48':s.day===5?'#57544a':s.day===4?'#53625c':s.day===3?'#414750':s.day===2?'#4a4552':'#39474a'):(s.day===7?'#4d6670':s.day===6?'#686358':s.day===5?'#6b6a56':s.day===4?'#4f6560':s.day===3?'#4a5b61':s.day===2?'#505249':'#415347'));
      box(c,xx,yy,T,1,wall?'#657171':'#5d7260');
      if(wall){box(c,xx+2,yy+3,7,6,'#243236');box(c,xx+2,yy+3,2,2,'#5c6963');}
      else {
        if(rnd>.73)box(c,xx+3,yy+5,2,2,'#677b67');
        if(rnd<.10)box(c,xx+7,yy+7,1,3,'#2b4037');
      }
    }
    function icon(x,y,type){const xx=OX+x*T,yy=OY+y*T;
      if(['blankPortrait','writtenName','naoWitness','endingKeep','endingFree','endingReplace','finalArchive'].includes(type)){
        const color={blankPortrait:'#a9b4b8',writtenName:'#b0a38d',naoWitness:'#c7b6a4',endingKeep:'#6d9aa1',endingFree:'#c4b38e',endingReplace:'#a46e86',finalArchive:'#bfb7a2'}[type];
        box(c,xx+1,yy+1,9,9,color);box(c,xx+3,yy+3,5,6,'#1d2931');
        if(type.startsWith('ending')){box(c,xx+4,yy+2,3,3,s.d7Choice===type.slice(6).toLowerCase()?'#eef1d2':'#30464a');}
        if(type==='writtenName')box(c,xx+4,yy+4,4,1,s.d7Name?'#85f1b1':'#d79a9e');
        if(type==='finalArchive')box(c,xx+5,yy+3,1,6,'#e9cdb0');
      }
      if(type==='cinderIndex'){box(c,xx+1,yy+1,9,9,'#8f8877');box(c,xx+3,yy+2,6,7,s.d6Index?'#769080':'#22272a');box(c,xx+5,yy+3,1,5,'#d3c6a4');}
      if(type==='temperatureWheel'){box(c,xx+1,yy+1,9,9,'#69655e');box(c,xx+2,yy+2,7,7,s.d6Vent?'#789888':'#a46a5e');box(c,xx+4,yy+3,3,3,'#242b2d');}
      if(type==='ashKeeper'){box(c,xx+3,yy+1,5,4,'#a69f8c');box(c,xx+2,yy+5,7,5,'#454746');box(c,xx+4,yy+2,1,1,'#222728');}
      if(type==='originCore'){box(c,xx+1,yy+1,9,9,s.d6Negative?'#9db49e':'#875960');box(c,xx+3,yy+2,5,7,'#1b282c');box(c,xx+5,yy+4,1,3,'#c6b89c');}
      if(type==='addressBook'){box(c,xx+1,yy+1,9,9,'#aa9b79');box(c,xx+3,yy+2,6,7,s.d5Address?'#587465':'#242e37');box(c,xx+5,yy+3,1,6,'#ddcbae');}
      if(type==='streetMemory'){box(c,xx+1,yy+1,9,9,'#4c5e5a');box(c,xx+2,yy+4,8,2,s.d5Street?'#a7bb92':'#a45862');box(c,xx+5,yy+2,1,7,'#9faaa0');}
      if(type==='facelessNeighbor'){box(c,xx+3,yy+1,5,4,'#beb9a6');box(c,xx+3,yy+5,5,5,'#424d4b');}
      if(type==='houseThreshold'){box(c,xx+1,yy+1,9,10,s.d5House?'#8da887':'#865969');box(c,xx+3,yy+3,5,7,'#202c2d');box(c,xx+7,yy+5,1,2,'#b8ae8c');}
      if(type==='inkLedger'){box(c,xx+1,yy+1,9,9,'#a6a093');box(c,xx+2,yy+2,7,7,s.d4Ledger?'#577b72':'#222a36');box(c,xx+5,yy+2,1,7,'#b2c0aa');box(c,xx+3,yy+5,2,1,'#b47a7f');}
      if(type==='foldedMap'){box(c,xx+1,yy+2,9,8,'#cad3b6');box(c,xx+4,yy+2,1,8,'#5c7e78');box(c,xx+7,yy+2,1,8,'#5c7e78');box(c,xx+3,yy+6,5,1,s.d4Fold?'#3a9277':'#ae626b');}
      if(type==='paperNurse'){box(c,xx+3,yy+1,5,3,'#d1dfca');box(c,xx+2,yy+4,7,6,'#d7cdb6');box(c,xx+4,yy+1,3,1,'#a45a65');box(c,xx+4,yy+6,3,1,'#2d3c40');}
      if(type==='bedZero'){box(c,xx+1,yy+3,9,7,s.d4Reel?'#b7d7c9':'#866a71');box(c,xx+2,yy+5,7,3,'#24373c');box(c,xx+3,yy+1,5,2,'#d3e2cb');}
      if(type==='clock'){box(c,xx+1,yy+1,9,9,'#a7a18a');box(c,xx+2,yy+2,7,7,s.d3Clock?'#576970':'#142933');box(c,xx+5,yy+3,1,4,'#ddc89a');box(c,xx+5,yy+5,3,1,'#ddc89a');}
      if(type==='signal'){box(c,xx+4,yy+1,3,9,'#74817b');box(c,xx+2,yy+2,7,5,'#19272a');box(c,xx+3,yy+3,2,2,s.d3Signal?'#4fbf8f':'#c87572');box(c,xx+6,yy+3,2,2,'#d9c689');}
      if(type==='traveler'){box(c,xx+4,yy+1,3,3,'#a0aba5');box(c,xx+3,yy+4,5,6,'#253039');box(c,xx+2,yy+7,1,2,'#94a5a7');}
      if(type==='platform'){box(c,xx+1,yy+1,9,10,s.d3Booth?'#91aba5':'#6a4049');box(c,xx+3,yy+3,5,6,'#1d2c32');box(c,xx+5,yy+4,1,5,'#a8aa82');}
      if(type==='bell'){box(c,xx+3,yy+2,5,7,s.d2Bell?'#746e6b':'#d4bd81');box(c,xx+2,yy+8,7,2,'#846251');box(c,xx+4,yy+1,3,2,'#d5b992');}
      if(type==='reflection'){box(c,xx+1,yy+1,9,9,'#867e79');box(c,xx+2,yy+2,7,7,s.d2Reflection?'#4e7270':'#152b39');box(c,xx+3,yy+5,5,1,'#bcc8b8');}
      if(type==='exit2'){box(c,xx+1,yy+1,9,10,s.d2Door?'#7ba3a0':'#8a5260');box(c,xx+3,yy+3,5,5,'#182a35');box(c,xx+7,yy+5,1,2,'#d7b68a');}
      if(type==='note'){box(c,xx+2,yy+2,7,7,s.note?'#6d7970':'#d6bd86');box(c,xx+3,yy+4,4,1,'#635448');}
      if(type==='seal'){box(c,xx+2,yy+2,7,7,s.seal?'#46544a':'#b3515c');box(c,xx+3,yy+3,5,5,'#66323b');}
      if(type==='well'){box(c,xx+1,yy+1,9,9,'#6a6967');box(c,xx+2,yy+2,7,7,s.echo?'#203935':'#18292d');box(c,xx+3,yy+4,5,2,s.photo?'#9ca69c':'#2c383b');box(c,xx+3,yy+1,5,1,'#c2b9a3');}
      if(type==='child'){box(c,xx+3,yy+1,5,4,'#d1cbb2');box(c,xx+2,yy+5,7,5,'#668ca1');box(c,xx+3,yy+9,2,2,'#27384f');}
      if(type==='exit'){box(c,xx+1,yy+1,9,10,s.key?'#779d82':'#7d3a45');box(c,xx+4,yy+3,2,5,'#1d2f35');}
    }
    for(let o of E.rpgItems(s))icon(o.x,o.y,o.id);
    let xp=OX+s.px*T,yp=OY+s.py*T;
    box(c,xp+2,yp+2,7,8,'#d2d6c4');box(c,xp+3,yp+1,5,4,'#29353f');box(c,xp+3,yp+8,2,2,'#586d83');box(c,xp+7,yp+8,2,2,'#586d83');
    if(s.seal){for(let i=0;i<8;i++){let x=rand(i,now|0)*W|0;box(c,x,130+rand(i,18)*60,1,4,'#a34d585c');}}
    txt(c,s.day===7?'EL NOMBRE ES UNA DECISION':s.day===6?'EL TIEMPO TAMBIEN ARDE':s.day===5?'TU CASA YA NO FIGURA':s.day===4?'EL CUERPO ESTA ESCRITO':s.day===3?'EL TREN YA HA LLEGADO':s.day===2?'LA HABITACION NO EXISTE':'NO BORRES ESTA PARTIDA',38,181,'#b99a9b',8);
    const near=E.rpgItems(s).filter(o=>Math.abs(s.px-o.x)+Math.abs(s.py-o.y)<=1);
    if(near.length){const label={blankPortrait:'RETRATO VACIO',writtenName:'NOMBRE ORIGINAL',naoWitness:'NAO',endingKeep:'ALTAR CONSERVAR',endingFree:'ALTAR LIBERAR',endingReplace:'ALTAR RELEVO',finalArchive:'ULTIMA PUERTA',cinderIndex:'INDICE DE CENIZAS',temperatureWheel:'RUEDA TERMICA',ashKeeper:'GUARDIAN',originCore:'NUCLEO ORIGINAL',addressBook:'LIBRO DE DIRECCIONES',streetMemory:'CALLE BORRADA',facelessNeighbor:'VECINO',houseThreshold:'CASA SIN NUMERO',note:'NOTA',seal:'SELLO',child:'NINO DE TIZA',well:'POZO',exit:'UMBRAL',bell:'CAMPANA',reflection:'ESPEJO DE AGUA',exit2:'PUERTA',clock:'RELOJ',signal:'SENAL',traveler:'VIAJERO',platform:'ANDEN CERO',inkLedger:'LIBRO DE TINTA',foldedMap:'PLANO PLEGADO',paperNurse:'ENFERMERA',bedZero:'CAMA CERO'};
      box(c,68,155,142,14,'#091317e9');txt(c,'E: '+(label[near[0].id]||'HABLAR'),79,165,'#dde3cc',8);
    }
  }
  function endingFrame(c,s,now){
    box(c,0,0,W,H,'#050809');
    const stages=s.day===7?({keep:[['TODOS LOS NOMBRES','NINGUNO DESAPARECE','Las copias también están vivas.'],['ARCHIVO ABIERTO','LOS OLVIDADOS DECIDEN','Ya no son prisioneros.'],['NAO Y LA COPIA','DOS PERSONAS, DOS VIDAS','El amanecer no las confunde.'],['FINAL: CONSERVAR','RECORDAR SIN POSEER','Gracias por no borrar a nadie.']],free:[['LA PUERTA ABIERTA','LOS RECUERDOS REGRESAN','El archivo empieza a apagarse.'],['UN PRECIO EXACTO','TU MEMORIA SE DESHACE','Las calles recuperan sus nombres.'],['EL AMANECER','NAO PREGUNTA QUIEN ERES','No recuerdas la respuesta.'],['FINAL: LIBERAR','UN COMIENZO SIN PASADO','El silencio ya no amenaza.']],replace:[['EL PACTO','NAO ATRAVIESA EL UMBRAL','La Copista se inclina.'],['LOS NOMBRES','TOMAS SU LUGAR','La pantalla conoce tu letra.'],['NAO EN EL EXTERIOR','EL SOL NO LA RECONOCE','Pero por primera vez es libre.'],['FINAL: EL RELEVO','ALGUIEN DEBE RECORDAR','Tu silla seguirá ocupada.']]})[s.endingId]||[['DIA 7','ARCHIVO ORIGINAL','Fin de la historia.']]:s.day===6?[
      ['URNA NUMERO SEIS','TODAS GUARDAN LA MISMA HORA','Una fecha que no ha ocurrido.'],
      ['EL HORNO APAGADO','ALGUIEN QUEMO MINUTOS DE VIDA','No queda fuego, solo el eco.'],
      ['EL NEGATIVO ORIGINAL','NAO CONSERVO A LOS OLVIDADOS','La Copista es la suma de sus errores.'],
      ['FIN DEL DIA 6','TU NOMBRE NO APARECE','CONTINUARA · DIA 7']
    ]:s.day===5?[
      ['EL NUMERO QUE FALTA','TU CALLE NO EXISTE','Pero alguien ha vivido allí.'],
      ['VECINOS SIN ROSTRO','LOS RECUERDOS CAMBIAN DE DUEÑO','Una familia te reconoce desde su ventana.'],
      ['FOTOGRAFIA 05','HAY UN LUGAR PARA TI EN LA MESA','La quinta silla está tibia.'],
      ['FIN DEL DIA 5','TU CASA ES UN ARCHIVO','CONTINUARA · DIA 6']
    ]:s.day===4?[
      ['PACIENTE 000','EL HOSPITAL TIENE TU FORMA','No hay ningún médico al otro lado.'],
      ['HOJA DE ALTA','TODAS LAS CAMAS ESTAN VACIAS','Menos una que todavía respira.'],
      ['CIRUJANO INVISIBLE','TE HAN EXTRAIDO UN RECUERDO','El hueco tiene forma de una puerta.'],
      ['FIN DEL DIA 4','EL ARCHIVO SE HA CONVERTIDO EN CENIZA','CONTINUARA · DIA 5']
    ]:s.day===3?[
      ['LA HORA 00:13','LA ESTACION SE HA DOBLADO','El pasillo termina en tu dormitorio.'],
      ['VIA CERO','EL TREN NO SE DETIENE','Los asientos llevan tu nombre.'],
      ['VOZ DE MEGAFONIA','EL CONDUCTOR SE PARECE A TI','Y te saluda desde otra edad.'],
      ['FIN DEL DIA 3','PROXIMA PARADA: EL HOSPITAL','CONTINUARA · DIA 4']
    ]:s.day===2?[
      ['LA PUERTA 207','LA RESIDENCIA NO EXISTE','Y sin embargo estas dentro.'],
      ['NO ME OYES','LA VOZ VIENE DE LA PARED','Pide que le devuelvas una fecha.'],
      ['ARCHIVO INCOMPLETO','TU COPIA SE HA DESPERTADO','La cama tiene tu forma.'],
      ['FIN DEL DIA 2','EL PROXIMO DESTINO ES LA ESTACION','CONTINUARA · DIA 3']
    ]:[
      ['LA SILLA VACIA','EL ARCHIVO ENTRA EN TU CASA','Alguien pulsa CONTINUAR.'],
      ['FOTOGRAFIA 03','UN ROSTRO HA SIDO BORRADO','No consigues recordar de quien.'],
      ['NAO KISARAGI','NO ME BUSQUES AHI DENTRO','Yo nunca abandone la habitacion.'],
      ['FIN DEL DIA 1','EL JUEGO YA SABE QUIEN ERES','CONTINUARA · DIA 2']
    ];
    const z=stages[Math.min(3,s.endingStage)];
    // Tres marcos de foto, cuyos ocupantes desaparecen progresivamente.
    for(let i=0;i<3;i++){
      const x=31+i*71;
      box(c,x,34,53,73,'#6c6559');box(c,x+4,38,45,65,'#4c5754');
      if(i===0||s.endingStage===0){box(c,x+20,46,13,15,'#c1c0a9');box(c,x+17,60,19,32,'#262c32');}
      if(i===1&&s.endingStage>=1){for(let j=0;j<5;j++)box(c,x+6+j*7,44,3,52,'#0c171aa8');}
      if(i===2&&s.endingStage===2){box(c,x+18,47,16,15,'#a6b4a6');box(c,x+18,64,18,27,'#a0aaaa');}
    }
    txt(c,z[0],37,21,'#bb8a89',12);txt(c,z[1],17,129,'#c8d2c4',9);
    txt(c,z[2],17,147,'#8fa89d',8);
    txt(c,s.endingStage>=3?(s.day===7?'FIN · EXPORTA TU PARTIDA':s.day===6?'FIN DEL DIA 6':s.day===5?'E / A: COMENZAR DIA 6':s.day===4?'E / A: COMENZAR DIA 5':s.day===3?'E / A: COMENZAR DIA 4':s.day===2?'E / A: COMENZAR DIA 3':'E / A: COMENZAR DIA 2'):'PULSA E / A PARA SEGUIR',30,178,'#c9bb91',9);
    if(Math.floor(now/700)%2===0)box(c,225,174,6,5,'#ad5c62');
  }
  function topUI(c,s){
    if(s.scene==='intro'&&s.eventTick===0){return;}
    if(s.eventTick<=0)return;
    let id=s.eventId;
    if(id==='ending'||id==='ending2'||id==='ending3'||id==='ending4'||id==='ending5'||id==='ending6'||id==='ending7') {box(c,0,0,W,H,'#05090be9');txt(c,`DIA ${s.day} / TERMINADO`,48,69,'#d1d2be',12);txt(c,'AHORA EL JUEGO SABE TU NOMBRE',13,100,'#be8186',9);txt(c,(s.day===7?'FIN DE LA HISTORIA':'CONTINUARA'),87,133,'#9faaa5',10);return;}
    const danger=['tape','behind','mirror','phone','whisper'].includes(id)||id.startsWith('caught-');
    if(danger) {
      const power=Math.min(0.48,s.eventTick/200+.07);
      box(c,0,0,W,H,`rgba(2,2,5,${power})`);
      for(let i=0;i<8;i++){let y=rand(i,s.pulse|0)*H|0;box(c,0,y,W,1,'#b9c0bc33');}
      if(id==='mirror'||id==='behind')sprite(c,128,1.7,'shadow',s.pulse);
      if(id==='tape'||id==='phone'){box(c,90,51,76,86,'#0b0c0dc0');box(c,113,65,29,27,'#bec4b7');box(c,117,76,6,2,'#182225');box(c,133,76,5,2,'#182225');}
    } else box(c,8,72,240,48,'#08151dc7');
    if(id!=='intro')txt(c,id==='seal'?'UNA PUERTA CAMBIO DE LUGAR':id==='note'?'EL CARTUCHO TE RECUERDA':id==='key'?'LLAVE DE PAPEL':id==='day2'?'DIA 2: LA VOZ DETRAS DEL MURO':id==='d2register'?'EL LIBRO TE CONOCE':id==='d2bell'?'UNA SEGUNDA CAMPANA':id==='d2intercom'?'LA PARED CONTESTA':id==='d2water'?'EL REFLEJO ES UNA PUERTA':id==='d2room'?'LA HABITACION 207':id==='day7'?'DIA 7: EL NOMBRE ORIGINAL':id==='d7terminal'?'UN ERROR HUMANO':id==='d7portrait'?'UN ROSTRO DUPLICADO':id==='d7voice'?'DOS VOCES':id==='d7name'?'LA PUERTA SE ABRE':id==='d7original'?'LA FOTO NO MIENTE':id==='d7choice'?'TU DECISION':id==='d7double'?'ALGUIEN HABLA POR TI':id==='day6'?'DIA 6: DEPOSITO DE CENIZAS':id==='d6label'?'LA URNA ESTA VACIA':id==='d6index'?'TIEMPO INCINERADO':id==='d6furnace'?'EL HORNO SIN FUEGO':id==='d6wheel'?'LA RUEDA TERMICA':id==='d6negative'?'EL NEGATIVO ORIGINAL':id==='d6hiss'?'LAS CENIZAS RECUERDAN':id==='day5'?'DIA 5: LA CASA QUE FALTA':id==='d5sign'?'LA CALLE TIENE TU NOMBRE':id==='d5address'?'NO HAY VECINOS':id==='d5plot'?'UN SOLAR HABITADO':id==='d5street'?'RECUERDA LA CALLE':id==='d5house'?'LA CASA AUSENTE':id==='d5silence'?'LAS VENTANAS TE MIRAN':id==='day4'?'DIA 4: HOSPITAL DE PAPEL':id==='d4file'?'EXPEDIENTE 000':id==='d4ledger'?'EL LIBRO TE ESCRIBE':id==='d4xray'?'HUESOS DE LETRAS':id==='d4fold'?'EL PLANO SE ABRE':id==='d4reel'?'OPERACION SIN CIRUJANO':id==='d4seam'?'LA PARED RESPIRA':id==='day3'?'DIA 3: ESTACION HATSUNE':id==='d3ticket'?'BILLETE SIN DESTINO':id==='d3clock'?'LA HORA INVERTIDA':id==='d3board'?'EL PANEL TE ESPERA':id==='d3signal'?'CAMBIO DE VIAS':id==='d3booth'?'LA CABINA VACIA':id==='train'?'EL TREN DE NADIE':danger?'ALGUIEN TE HA VISTO':'NO HAY NADIE',16,101,'#e1bfbb',9);
  }
  function bottom(c,s,now,showMap){
    box(c,0,0,W,H,'#081217');box(c,8,8,240,176,'#26383c');box(c,11,11,234,170,'#0d1c21');
    txt(c,'SIN_NOMBRE.NDS',19,28,'#c6d5b5',12);box(c,19,35,216,1,'#52655e');
    txt(c,`DIA ${s.day}/7    ${s.mode==='real'?'MUNDO REAL':'ARCHIVO MALDITO'}`,19,49,'#d9ba8f',9);
    if(s.won){txt(c,`EXPEDIENTE 0${s.day} / CERRADO`,19,75,'#cbb8a1',10);txt(c,s.day===7?`FINAL: ${s.endingId.toUpperCase()}`:`ESCENA FINAL ${s.endingStage+1}/4`,19,95,'#afbfae',10);txt(c,'Las personas no desaparecen.',19,120,'#9eafac',8);txt(c,'Se convierten en partidas.',19,133,'#9eafac',8);txt(c,'E / A: SEGUIR',19,165,'#d2b78d',10);return;}
    if(showMap&&s.mode==='real'){
      // Mapa esquemático desbloqueado como ayuda opcional (no revela a la entidad).
      const scale=9,ox=52,oy=55;
      for(let y=0;y<E.realMap(s).length;y++)for(let x=0;x<E.realMap(s)[0].length;x++){
        box(c,ox+x*scale,oy+y*scale,scale-1,scale-1,E.wall(E.realMap(s),x,y)?'#2f4449':'#657a72');
      }
      box(c,ox+s.rx*scale-2,oy+s.ry*scale-2,5,5,'#e6cd90');
      txt(c,'MAPA / TU POSICION',80,178,'#a3b3a9',8);
    } else {
      if(s.day===7){
        txt(c,`CONSOLA ${s.d7Terminal?'[X]':'[ ]'}  RETRATO ${s.d7Portrait?'[X]':'[ ]'}`,19,68,'#b4c7b9',8);
        txt(c,`VOZ     ${s.d7Voice?'[X]':'[ ]'}  NOMBRE  ${s.d7Name?'[X]':'[ ]'}`,19,83,'#b4c7b9',8);
        txt(c,`FOTO    ${s.d7Original?'[X]':'[ ]'}  ELECCION ${s.d7Choice.toUpperCase()}`,19,98,'#b4c7b9',8);
      }else if(s.day===6){
        txt(c,`URNA   ${s.d6Label?'[X]':'[ ]'}  INDICE ${s.d6Index?'[X]':'[ ]'}`,19,68,'#b4c7b9',9);
        txt(c,`HORNO  ${s.d6Furnace?'[X]':'[ ]'}  RUEDA  ${s.d6Vent?'[X]':'[ ]'}`,19,83,'#b4c7b9',9);
        txt(c,`NEGAT. ${s.d6Negative?'[X]':'[ ]'}  NUCLEO [ ]`,19,98,'#b4c7b9',9);
      }else if(s.day===5){
        txt(c,`PLACA  ${s.d5Sign?'[X]':'[ ]'}  LIBRO   ${s.d5Address?'[X]':'[ ]'}`,19,68,'#b4c7b9',9);
        txt(c,`SOLAR  ${s.d5Plot?'[X]':'[ ]'}  CALLE   ${s.d5Street?'[X]':'[ ]'}`,19,83,'#b4c7b9',9);
        txt(c,`CASA   ${s.d5House?'[X]':'[ ]'}  PUERTA  [ ]`,19,98,'#b4c7b9',9);
      }else if(s.day===4){
        txt(c,`FICHA   ${s.d4File?'[X]':'[ ]'}  LIBRO   ${s.d4Ledger?'[X]':'[ ]'}`,19,68,'#b4c7b9',9);
        txt(c,`PLACAS  ${s.d4Xray?'[X]':'[ ]'}  PLANO   ${s.d4Fold?'[X]':'[ ]'}`,19,83,'#b4c7b9',9);
        txt(c,`BOBINA  ${s.d4Reel?'[X]':'[ ]'}  CAMA 0  [ ]`,19,98,'#b4c7b9',9);
      }else if(s.day===3){
        txt(c,`BILLETE ${s.d3Ticket?'[X]':'[ ]'}  RELOJ   ${s.d3Clock?'[X]':'[ ]'}`,19,68,'#b4c7b9',9);
        txt(c,`PANEL   ${s.d3Schedule?'[X]':'[ ]'}  SENAL   ${s.d3Signal?'[X]':'[ ]'}`,19,83,'#b4c7b9',9);
        txt(c,`CABINA  ${s.d3Booth?'[X]':'[ ]'}  ANDEN   [ ]`,19,98,'#b4c7b9',9);
      }else if(s.day===2){
        txt(c,`REGISTRO  ${s.d2Register?'[X]':'[ ]'}  CAMPANA ${s.d2Bell?'[X]':'[ ]'}`,19,68,'#b4c7b9',9);
        txt(c,`INTERFONO ${s.d2Frequency?'[X]':'[ ]'}  ESPEJO ${s.d2Reflection?'[X]':'[ ]'}`,19,83,'#b4c7b9',9);
        txt(c,`CUARTO 207 ${s.d2Door?'[X]':'[ ]'}  UMBRAL [ ]`,19,98,'#b4c7b9',9);
      }else{
      txt(c,`NOTA   ${s.note?'[X]':'[ ]'}     SELLO   ${s.seal?'[X]':'[ ]'}`,19,68,'#b4c7b9',9);
      txt(c,`FOTO   ${s.photo?'[X]':'[ ]'}     ECO     ${s.echo?'[X]':'[ ]'}`,19,83,'#b4c7b9',9);
      txt(c,`CINTA  ${s.tape?'[X]':'[ ]'}     LLAVE   ${s.key?'[X]':'[ ]'}`,19,98,'#b4c7b9',9);
      }
      box(c,19,107,216,1,'#35474a');
      let lines=s.journal.length?s.journal[s.journal.length-1]:'Una presencia ha abierto la partida. Los registros están incompletos.';
      txt(c,'REGISTRO / ULTIMA ENTRADA',19,119,'#c1ad91',8);
      const chunks=wrap(c,lines,208,8).slice(0,3);chunks.forEach((t,i)=>txt(c,t,19,132+i*10,'#b2c1bc',8));
      box(c,19,160,216,1,'#35474a');
      if(s.mode==='real'){
        txt(c,`PRESENCIA ${Math.floor(s.threat)}%   MARCAS: ${s.encounter}`,19,174,s.threat>60?'#d68d93':'#a9baad',9);
      }else txt(c,`PUERTA: ${(s.day===7?s.d7Original&&s.d7Choice!=='none':s.day===6?s.d6Negative:s.day===5?s.d5House:s.day===4?s.d4Reel:s.day===3?s.d3Booth:s.day===2?s.d2Door:s.key&&s.echo)?'ABIERTA':'CERRADA'} / MEMORIA: INESTABLE`,19,174,'#b9a1a3',8);
    }
    for(let y=0;y<H;y+=3)box(c,0,y,W,1,'#000a0d28');
  }
  function wrap(c,str,maxWidth,size){c.font=`${size}px monospace`;let parts=str.split(' '),line='',output=[];for(let w of parts){if(c.measureText(line+' '+w).width>maxWidth&&line){output.push(line);line=w;}else line+=(line?' ':'')+w;}if(line)output.push(line);return output;}
  function opticalAtmosphere(c,s,now,reduceEffects){
    // Uneven glass and a very subtle peripheral vignette. Never an intense
    // flash: the player must be able to interpret the scene at all times.
    const vignette=c.createRadialGradient(128,90,34,128,94,159);
    vignette.addColorStop(0,'rgba(0,0,0,0)');
    vignette.addColorStop(.68,'rgba(0,5,7,.07)');
    vignette.addColorStop(1,'rgba(0,3,8,.44)');
    c.fillStyle=vignette;c.fillRect(0,0,W,H);
    const tick=reduceEffects?0:Math.floor(now/170);
    for(let i=0;i<11;i++){
      const x=(19+i*71+(i*i*13))%246+4;
      const y=(27+i*43+(tick*(i%3+1)))%174+6;
      const a=i%3===0?'#c5c4ad35':'#a2b6ad25';
      box(c,x,y,i%4===0?2:1,1,a);
    }
    if(s.chase&&s.threat>=70){
      const alpha=Math.min(.19,(s.threat-70)/170);
      c.fillStyle=`rgba(73,14,26,${alpha})`;
      c.fillRect(0,0,5,H);c.fillRect(W-5,0,5,H);
    }
  }
  /** Quiet, diegetic hallucinations: rendered OVER any 3D backend, no engine mutation.
   * In reduced effects mode overlays stay static; no full-screen flashes or shake.
   */
  function presage(c,omen,now,reduced){
    if(!omen)return;
    const left=Math.max(0,Math.min(1,(omen.ends-now)/2600));
    if(!left)return;
    const alpha=Math.min(.47,(omen.intensity||.4)*left);
    const a=(v)=>Math.min(1,alpha*v).toFixed(3);
    c.save();
    if(omen.kind==='reflection'){
      // A second face printed on the glass appears only in peripheral vision.
      box(c,190,43,25,62,`rgba(7,16,20,${a(1)})`);
      box(c,196,42,13,18,`rgba(173,187,173,${a(.9)})`);
      box(c,196,49,3,2,`rgba(8,18,23,${a(1.6)})`);
      box(c,205,49,3,2,`rgba(8,18,23,${a(1.6)})`);
      box(c,194,62,17,41,`rgba(14,24,27,${a(1.4)})`);
      line(c,178,32,178,133,`rgba(196,207,187,${a(.4)})`);
    }else if(omen.kind==='hollow'||omen.kind==='absence'){
      // Doorway whose geometry is deliberately wrong: a negative, not an enemy.
      box(c,30,45,39,85,`rgba(0,5,9,${a(1.5)})`);
      box(c,30,45,39,3,`rgba(166,174,154,${a(.8)})`);
      box(c,30,45,3,85,`rgba(166,174,154,${a(.6)})`);
      box(c,67,45,3,85,`rgba(166,174,154,${a(.6)})`);
    }else if(omen.kind==='double'){
      // A trailing set of footsteps projects onto the corridor floor.
      for(let i=0;i<4;i++){
        let x=107+i*11,y=157+i*6;
        box(c,x,y,5,2,`rgba(171,159,149,${a(.8)})`);
        box(c,x+7,y-3,4,2,`rgba(171,159,149,${a(.7)})`);
      }
    }else if(omen.kind==='negative'||omen.kind==='film'){
      // An ephemeral thin-film inversion, never a stroboscopic change.
      for(let j=0;j<7;j++){
        const y=(17+j*23+omen.seed%11)%192;
        box(c,0,y,W,1,`rgba(188,193,184,${a(.43)})`);
      }
      box(c,8,13,26,16,`rgba(13,21,23,${a(.8)})`);
      txt(c,'00',12,23,`rgba(191,201,187,${a(.9)})`,8);
    }else if(omen.kind==='breath'){
      // Thin condensation on the glass, no camera shake.
      c.strokeStyle=`rgba(193,210,196,${a(.33)})`;
      c.lineWidth=5;
      c.beginPath();c.ellipse(199,86,19,38,-.2,0,Math.PI*2);c.stroke();
    }
    if(!reduced&&omen.kind==='film'){
      const y=23+Math.floor((now-omen.started)/220)%8*16;
      box(c,0,y,W,1,`rgba(201,184,173,${a(.35)})`);
    }
    // Very small optional subtitle; objectives remain untouched.
    if(alpha>.07){
      const w=Math.min(245,14+omen.text.length*4.6);
      box(c,Math.floor((W-w)/2),166,w,15,`rgba(4,12,15,${a(1.3)})`);
      txt(c,omen.text,Math.max(6,128-omen.text.length*2.3),176,`rgba(215,204,188,${a(1.9)})`,7);
    }
    c.restore();
  }
  function render(c1,c2,s,now,opts={}){
    c1.imageSmoothingEnabled=c2.imageSmoothingEnabled=false;
    c1.clearRect(0,0,W,H);c2.clearRect(0,0,W,H);
    if(s.won)endingFrame(c1,s,now);else if(s.mode==='real'){ if(opts.webglFrame) c1.drawImage(opts.webglFrame,0,0,W,H); else real(c1,s,now); }else drawTiles(c1,s,now);
    if(!s.won){drawDayOneArt(c1,s,now,E.realMap(s),opts.reduceEffects);if(s.mode==='real'){opticalAtmosphere(c1,s,now,opts.reduceEffects);presage(c1,opts.horror,now,opts.reduceEffects);}topUI(c1,s);}
    bottom(c2,s,now,opts.map);
    if(opts.brightness==='alto'){c1.save();c1.globalCompositeOperation='screen';c1.fillStyle='rgba(135,155,142,.16)';c1.fillRect(0,0,W,H);c1.restore();}
    if(opts.reduceEffects!==true){
      noise(c1,Math.floor(now*.017),s.threat>35?65:24);
      if(s.chase&&s.threat>65){let n=Math.min(6,(s.threat-65)/5);for(let i=0;i<n;i++)box(c1,rand(i,now|0)*W,rand(i,31+now|0)*H,25,1,'#d088914b');}
    }
  }
  return {render};
})();
