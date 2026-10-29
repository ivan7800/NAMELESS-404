// @ts-nocheck
import {decideCopyist} from "./premium/CopyistBrain.js";
import {floorSurface,footstepNoise,decoyDestination,validNoiseMarker} from "./premium/KibaStealth.js";
import {nearestEvidence,nextChaseBeat,CHASE_BEATS} from "./premium/DayOneStory.js";
import {canStartFinale,atFinaleTarget,sanitizeFinale,FINALE_OBJECTIVES,tensionLevel} from "./premium/DayOneFinale.js";
import {kibaMap,KIBA_SWITCHES,KIBA_HIDEOUTS,nearestKibaFeature,hideRisk,hideMayBeFound,isValidHideSpot} from "./premium/KibaArchitecture.js";
/* NAMELESS 404 — motor original preservado en la migración v0.9 (tipado progresivo). */
export const NamelessEngine = (function () {
  'use strict';
  const VERSION = 15;
  const REAL = [
    '################',
    '#.....#........#',
    '#.....#..##....#',
    '#..............#',
    '#..##........#.#',
    '#.........#....#',
    '##.####.###....#',
    '#......#.......#',
    '#......#..##...#',
    '#..............#',
    '#..##...#......#',
    '#.......#......#',
    '#...#..........#',
    '################'
  ];
  const RPG = [
    '################',
    '#..............#',
    '#.##..###......#',
    '#......#....#..#',
    '#...#.......#..#',
    '###.###....##..#',
    '#..............#',
    '#.####.....#...#',
    '#......#.......#',
    '#..##.......#..#',
    '#......##......#',
    '#..............#',
    '################'
  ];
  // Un segundo edificio y una segunda version corrompida del RPG: mapas originales.
  const REAL_2 = [
    '################',
    '#.....#........#',
    '#.....#........#',
    '#..............#',
    '#..##......#...#',
    '#..............#',
    '##.###..##.....#',
    '#......#.......#',
    '#......#.......#',
    '#.........#....#',
    '#..##........#.#',
    '#..............#',
    '#...#..........#',
    '################'
  ];
  const RPG_2 = [
    '################',
    '#..............#',
    '#..#..###......#',
    '#......#.......#',
    '#...#..........#',
    '###.###....##..#',
    '#..............#',
    '#..###......#..#',
    '#......#.......#',
    '#..##..........#',
    '#......##......#',
    '#..............#',
    '################'
  ];
  // La estación del Día 3: dos recorridos de conexión propios.
  const REAL_3 = [
    '################',
    '#.....#........#',
    '#..............#',
    '#..##...#......#',
    '#..............#',
    '#.###....##....#',
    '#.......#......#',
    '#..............#',
    '#...##...#.....#',
    '#.........#....#',
    '#..............#',
    '#..##.....#....#',
    '#..............#',
    '################'
  ];
  const RPG_3 = [
    '################',
    '#..............#',
    '#...#..##......#',
    '#..............#',
    '#......#.......#',
    '#..#.....##....#',
    '#..............#',
    '#...##.........#',
    '#........#.....#',
    '#..#...........#',
    '#..............#',
    '#..............#',
    '################'
  ];
  // Los dos desvíos se abren en puntos distintos, sin encerrar al jugador.
  // El panel del andén cambia cuál está disponible; la ruta inferior siempre permite volver.
  function day3RealMap(s) {
    const rows = REAL_3.slice();
    const opened = s.d3Signal;
    const y = 6, x = 8;
    rows[y] = rows[y].slice(0,x) + (opened?'.':'#') + rows[y].slice(x+1);
    return rows;
  }
  // Día 4 — Sanatorio de Papel: una planta clínica que se pliega en dos dimensiones.
  // La sala 0 permanece cerrada en la realidad hasta reconstruir el plano del cartucho.
  const REAL_4 = [
    '################',
    '#.....#........#',
    '#.....#..##....#',
    '#..............#',
    '#..##..........#',
    '#.........#....#',
    '##.####.###....#',
    '#......#.......#',
    '#......#..##...#',
    '#..............#',
    '#..##...#......#',
    '#.......#......#',
    '#...#..........#',
    '################'
  ];
  const RPG_4 = [
    '################',
    '#..............#',
    '#..##..##......#',
    '#..............#',
    '#......#.......#',
    '#..#.....##....#',
    '#..............#',
    '#...##.........#',
    '#........#.....#',
    '#..#...........#',
    '#..............#',
    '#..............#',
    '################'
  ];
  function day4RealMap(s) {
    const rows=REAL_4.slice();
    // Pasaje de cirugía detrás del plano plegado: pasa de muro a suelo.
    const x=8,y=6;
    rows[y]=rows[y].slice(0,x)+(s.d4Fold?'.':'#')+rows[y].slice(x+1);
    return rows;
  }
  // Día 5: pasaje borrado hasta recuperar la calle del cartucho.
  const REAL_5 = [
    '################','#..............#','#.....#........#',
    '#..............#','#...##.........#','#.........#....#',
    '##.####.###....#','#......#.......#','#......#..##...#',
    '#..............#','#..##..........#','#.......#......#',
    '#..............#','################'
  ];
  const RPG_5 = [
    '################','#..............#','#...#..........#',
    '#..............#','#......##......#','#..............#',
    '#...##.........#','#..............#','#..##.....#....#',
    '#..............#','#..............#','#..............#',
    '################'
  ];
  function day5RealMap(s){
    const rows=REAL_5.slice(),x=8,y=6;
    rows[y]=rows[y].slice(0,x)+(s.d5Street?'.':'#')+rows[y].slice(x+1);
    return rows;
  }
  const DIRS = [[0,-1],[1,0],[0,1],[-1,0]];
  const RPG_ITEMS = [{x:4,y:3,id:'note'},{x:9,y:8,id:'seal'},{x:5,y:10,id:'child'},{x:10,y:4,id:'well'},{x:13,y:10,id:'exit'}];
  const REAL_ITEMS = [{x:10.5,y:9.5,id:'tape',r:1.35},{x:3.5,y:9.5,id:'cabinet',r:1.5},{x:12.5,y:4.5,id:'locker',r:1.4},{x:8.5,y:3.5,id:'telephone',r:1.4},{x:5.5,y:4.5,id:'mirror',r:1.3},{x:13.5,y:2.5,id:'photo',r:1.4}];
  const RPG_ITEMS_2 = [{x:4,y:3,id:'bell'},{x:11,y:4,id:'reflection'},{x:13,y:10,id:'exit2'}];
  const REAL_ITEMS_2 = [
    {x:3.5,y:3.5,id:'register',r:1.25},
    {x:12.5,y:3.5,id:'intercom',r:1.35},
    {x:11.5,y:9.5,id:'room207',r:1.3},
    {x:6.5,y:10.5,id:'locker2',r:1.3}
  ];
  const REAL_ITEMS_3 = [
    {x:4.5,y:2.5,id:'ticket',r:1.35},
    {x:12.5,y:4.5,id:'schedule',r:1.4},
    {x:10.5,y:10.5,id:'booth',r:1.4},
    {x:5.5,y:10.5,id:'bench',r:1.4}
  ];
  const RPG_ITEMS_3 = [
    {x:3,y:4,id:'clock'}, {x:10,y:6,id:'signal'},
    {x:5,y:9,id:'traveler'}, {x:13,y:10,id:'platform'}
  ];
  const REAL_ITEMS_4 = [
    {x:4.5,y:3.5,id:'patientFile',r:1.35},
    {x:12.5,y:3.5,id:'xray',r:1.4},
    {x:11.5,y:10.5,id:'reel',r:1.4},
    {x:5.5,y:10.5,id:'curtain',r:1.4}
  ];
  const RPG_ITEMS_4 = [
    {x:4,y:4,id:'inkLedger'},
    {x:11,y:5,id:'foldedMap'},
    {x:5,y:9,id:'paperNurse'},
    {x:13,y:10,id:'bedZero'}
  ];
  const REAL_ITEMS_5=[
    {x:4.5,y:3.5,id:'streetSign',r:1.35},{x:12.5,y:3.5,id:'emptyPlot',r:1.45},
    {x:11.5,y:10.5,id:'missingHouse',r:1.45},{x:5.5,y:10.5,id:'busShelter',r:1.35}
  ];
  const RPG_ITEMS_5=[
    {x:4,y:4,id:'addressBook'},{x:11,y:5,id:'streetMemory'},
    {x:5,y:9,id:'facelessNeighbor'},{x:13,y:10,id:'houseThreshold'}
  ];
  // Día 6. La rueda del RPG abre el pasaje físico del depósito.
  const REAL_6 = [
    '################','#..............#','#....#.........#',
    '#..............#','#...##.........#','#.........#....#',
    '########.#######','#......#.......#','#......#..##...#',
    '#..............#','#...#..........#','#.......#......#',
    '#..............#','################'
  ];
  const RPG_6 = [
    '################','#..............#','#..##..##......#',
    '#..............#','#....#.........#','#......#.......#',
    '#...##.........#','#..............#','#..#......#....#',
    '#..............#','#..............#','#..............#',
    '################'
  ];
  function day6RealMap(s){
    const rows=REAL_6.slice(),x=8,y=6;
    rows[y]=rows[y].slice(0,x)+(s.d6Vent?'.':'#')+rows[y].slice(x+1);
    return rows;
  }
  const REAL_ITEMS_6 = [
    {x:4.5,y:3.5,id:'ashLabel',r:1.35},
    {x:12.5,y:3.5,id:'furnace',r:1.4},
    {x:11.5,y:10.5,id:'negative',r:1.4},
    {x:2.5,y:4.5,id:'serviceVent',r:1.35}
  ];
  const RPG_ITEMS_6 = [
    {x:4,y:4,id:'cinderIndex'},{x:11,y:5,id:'temperatureWheel'},
    {x:5,y:9,id:'ashKeeper'},{x:13,y:10,id:'originCore'}
  ];
  // Día 7 — Cámara de origen: la copia y el original se encuentran.
  // El hueco (8,6) solo se abre al reconstruir el nombre en el cartucho.
  const REAL_7 = [
    '################','#..............#','#.....#........#',
    '#..............#','#...##.........#','#.........#....#',
    '########.#######','#......#.......#','#......#..##...#',
    '#..............#','#...#..........#','#.......#......#',
    '#..............#','################'
  ];
  const RPG_7 = [
    '################','#..............#','#..##..##......#',
    '#..............#','#....#.........#','#......#.......#',
    '#...##.........#','#..............#','#..#......#....#',
    '#..............#','#..............#','#..............#',
    '################'
  ];
  function day7RealMap(s){
    const rows=REAL_7.slice(),x=8,y=6;
    rows[y]=rows[y].slice(0,x)+(s.d7Name?'.':'#')+rows[y].slice(x+1);
    return rows;
  }
  const REAL_ITEMS_7 = [
    {x:4.5,y:3.5,id:'originTerminal',r:1.35},
    {x:12.5,y:3.5,id:'voiceProof',r:1.4},
    {x:11.5,y:10.5,id:'originalPhoto',r:1.4},
    {x:2.5,y:4.5,id:'safeCabinet',r:1.35}
  ];
  const RPG_ITEMS_7 = [
    {x:4,y:4,id:'blankPortrait'}, {x:11,y:5,id:'writtenName'},
    {x:5,y:9,id:'naoWitness'}, {x:2,y:10,id:'endingKeep'},
    {x:8,y:10,id:'endingFree'}, {x:12,y:7,id:'endingReplace'},
    {x:13,y:10,id:'finalArchive'}
  ];
  const realMap=s=>s.day===7?day7RealMap(s):s.day===6?day6RealMap(s):s.day===5?day5RealMap(s):s.day===4?day4RealMap(s):s.day===3?day3RealMap(s):s.day===2?REAL_2:kibaMap(REAL,s.flags);
  const rpgMap=s=>s.day===7?RPG_7:s.day===6?RPG_6:s.day===5?RPG_5:s.day===4?RPG_4:s.day===3?RPG_3:s.day===2?RPG_2:RPG;
  const realItems=s=>s.day===7?REAL_ITEMS_7:s.day===6?REAL_ITEMS_6:s.day===5?REAL_ITEMS_5:s.day===4?REAL_ITEMS_4:s.day===3?REAL_ITEMS_3:s.day===2?REAL_ITEMS_2:[...REAL_ITEMS,...KIBA_SWITCHES,...KIBA_HIDEOUTS];
  const rpgItems=s=>s.day===7?RPG_ITEMS_7:s.day===6?RPG_ITEMS_6:s.day===5?RPG_ITEMS_5:s.day===4?RPG_ITEMS_4:s.day===3?RPG_ITEMS_3:s.day===2?RPG_ITEMS_2:RPG_ITEMS;
  function initial() { return {
    version:VERSION, day:1, mode:'real', rx:2.5, ry:2.5, dir:1, px:1, py:1,
    note:false, seal:false, tape:false, key:false, mirror:false, call:false, photo:false, echo:false,
    light:true, hidden:false, crouched:false, entityX:13.5, entityY:11.5, threat:0, chase:false,
    encounter:0, steps:0, won:false, eventId:'intro', eventTick:0,
    scares:[], journal:[], scene:'intro', flags:{}, pulse:0, room:'VESTIBULO', endingStage:0,
    d2Register:false, d2Bell:false, d2Frequency:false, d2Reflection:false, d2Door:false,
    d3Ticket:false, d3Clock:false, d3Schedule:false, d3Signal:false, d3Booth:false,
    d4File:false,d4Ledger:false,d4Xray:false,d4Fold:false,d4Reel:false,
    d5Sign:false,d5Address:false,d5Plot:false,d5Street:false,d5House:false,
    d6Label:false,d6Index:false,d6Furnace:false,d6Vent:false,d6Negative:false,
    d7Terminal:false,d7Portrait:false,d7Voice:false,d7Name:false,d7Original:false,
    d7Choice:'none',endingId:'none'
  }; }
  function tile(map,x,y) { return map[Math.floor(y)]?.[Math.floor(x)] || '#'; }
  function wall(map,x,y) { return tile(map,x,y)==='#'; }
  function collision(map,x,y,r=.18) { return [[-r,-r],[-r,r],[r,-r],[r,r]].some(([dx,dy])=>wall(map,x+dx,y+dy)); }
  function distance(x1,y1,x2,y2) { return Math.hypot(x2-x1,y2-y1); }
  function roomAt(x,y,day=1) {
    if(day===7){if(y<6&&x<8)return 'ARCHIVO DE ORIGEN';if(y<7)return 'SALA DE VOCES';if(x<8)return 'GALERIA DE IDENTIDADES';return 'CAMARA DEL ORIGINAL';}
    if(day===6){if(y<6&&x<8)return 'RECEPCION DE CENIZAS';if(y<7)return 'HORNO CENTRAL';if(x<8)return 'GALERIA DE URNAS';return 'ARCHIVO NEGATIVO';}
    if(day===5){if(y<6&&x<8)return 'CALLE DE LOS AUSENTES';if(y<7)return 'SOLAR VACIO';if(x<8)return 'PARADA SIN AUTOBUSES';return 'CASA AUSENTE';}
    if(day===4){if(y<6&&x<8)return 'ADMISION';if(y<7)return 'RADIOLOGIA';if(x<8)return 'ARCHIVO DE PACIENTES';return 'QUIROFANO CERO';}
    if(day===3){if(y<6&&x<8)return 'VESTIBULO DE ESTACION';if(y<7)return 'PANEL DE SALIDAS';if(x<8)return 'ANDEN CERRADO';return 'VIA CERO';}
    if(day===2){if(y<6&&x<7)return 'RECEPCION';if(y<7)return 'PASILLO 200';if(x<8)return 'DORMITORIOS';return 'HABITACION 207';}
    if(y<6&&x<7)return 'VESTIBULO';
    if(y<7)return 'ALA ESTE';
    if(x<8)return 'ALA DE ARCHIVOS';
    return 'SOTANO TECNICO';
  }
  function objective(s) {
    if(s.won){
      if(s.day===1)return s.endingStage>=3?'PULSA E PARA ENTRAR EN EL DIA 2':'PULSA E PARA CONTINUAR EL EPILOGO';
      if(s.day===2)return s.endingStage>=3?'PULSA E PARA ENTRAR EN EL DIA 3':'PULSA E PARA CONTINUAR EL EPILOGO';
      if(s.day===3)return s.endingStage>=3?'PULSA E PARA ENTRAR EN EL DIA 4':'PULSA E PARA CONTINUAR EL EPILOGO';
      if(s.day===4)return s.endingStage>=3?'PULSA E PARA ENTRAR EN EL DIA 5':'PULSA E PARA CONTINUAR EL EPILOGO';
      if(s.day===5)return s.endingStage>=3?'PULSA E PARA ENTRAR EN EL DIA 6':'PULSA E PARA CONTINUAR EL EPILOGO';
      if(s.day===6)return s.endingStage>=3?'PULSA E PARA ENTRAR EN EL DIA 7':'PULSA E PARA CONTINUAR EL EPILOGO';
      return s.endingStage>=3?'FIN DE NAMELESS 404 · LA PARTIDA HA TERMINADO':'PULSA E PARA CONTINUAR TU FINAL';
    }
    if(s.day===7){
      if(!s.d7Terminal)return 'REALIDAD: EXAMINA LA TERMINAL DE ORIGEN (4,3)';
      if(!s.d7Portrait)return 'RPG: EXAMINA EL RETRATO EN BLANCO (4,4)';
      if(!s.d7Voice)return 'REALIDAD: ESCUCHA LA PRUEBA DE VOZ (12,3)';
      if(!s.d7Name)return 'RPG: ESCRIBE EL NOMBRE ORIGINAL (11,5)';
      if(!s.d7Original)return 'REALIDAD: RECUPERA LA FOTO ORIGINAL (11,10)';
      if(s.d7Choice==='none')return 'RPG: ELIGE EN UN ALTAR GUARDAR, LIBERAR O SUSTITUIR';
      return 'RPG: CRUZA EL ARCHIVO FINAL (13,10) · ELECCION '+s.d7Choice.toUpperCase();
    }
    if(s.day===6){
      if(!s.d6Label)return 'REALIDAD: LEE LA ETIQUETA DE CENIZAS (4,3)';
      if(!s.d6Index)return 'RPG: CONSULTA EL INDICE DE CENIZAS (4,4)';
      if(!s.d6Furnace)return 'REALIDAD: EXAMINA EL HORNO CENTRAL (12,3)';
      if(!s.d6Vent)return 'RPG: AJUSTA LA RUEDA TERMICA (11,5)';
      if(!s.d6Negative)return 'REALIDAD: RECUPERA EL NEGATIVO (11,10)';
      return 'RPG: ATRAVIESA EL NUCLEO DEL ARCHIVO (13,10)';
    }
    if(s.day===5){
      if(!s.d5Sign)return 'REALIDAD: LEE LA PLACA DE LA CALLE (4,3)';
      if(!s.d5Address)return 'RPG: CONSULTA EL LIBRO DE DIRECCIONES (4,4)';
      if(!s.d5Plot)return 'REALIDAD: INVESTIGA EL SOLAR VACIO (12,3)';
      if(!s.d5Street)return 'RPG: RECUERDA LA CALLE BORRADA (11,5)';
      if(!s.d5House)return 'REALIDAD: ENTRA EN LA CASA AUSENTE (11,10)';
      return 'RPG: CRUZA LA CASA SIN NUMERO (13,10)';
    }
    if(s.day===4){
      if(!s.d4File)return 'REALIDAD: LEE EL EXPEDIENTE EN ADMISION (4,3)';
      if(!s.d4Ledger)return 'RPG: ABRE EL LIBRO DE TINTA (4,4)';
      if(!s.d4Xray)return 'REALIDAD: EXAMINA LAS RADIOGRAFIAS (12,3)';
      if(!s.d4Fold)return 'RPG: DESPLIEGA EL PLANO DE SALAS (11,5)';
      if(!s.d4Reel)return 'REALIDAD: ESCUCHA LA BOBINA DEL QUIROFANO (11,10)';
      return 'RPG: ENTRA EN LA CAMA CERO (13,10)';
    }
    if(s.day===3){
      if(!s.d3Ticket)return 'REALIDAD: RECOGE EL BILLETE SIN DESTINO (4,2)';
      if(!s.d3Clock)return 'RPG: AJUSTA EL RELOJ INVERTIDO (3,4)';
      if(!s.d3Schedule)return 'REALIDAD: CONSULTA EL PANEL DE SALIDAS (12,4)';
      if(!s.d3Signal)return 'RPG: CAMBIA LA SENAL DE LAS VIAS (10,6)';
      if(!s.d3Booth)return 'REALIDAD: ENTRA EN LA CABINA DE CONTROL (10,10)';
      return 'RPG: ALCANZA EL ANDEN CERO (13,10)';
    }
    if(s.day===2){
      if(!s.d2Register)return 'REALIDAD: REVISA EL REGISTRO DE RECEPCION (3,3)';
      if(!s.d2Bell)return 'RPG: TOCA LA CAMPANA DEL PUEBLO (4,3)';
      if(!s.d2Frequency)return 'REALIDAD: ESCUCHA EL INTERFONO (12,3)';
      if(!s.d2Reflection)return 'RPG: CONSULTA EL ESPEJO DE AGUA (11,4)';
      if(!s.d2Door)return 'REALIDAD: ABRE LA HABITACION 207 (11,9)';
      return 'RPG: ENTRA EN LA PUERTA QUE NO EXISTIA (13,10)';
    }
    if(!s.note)return 'EN EL RPG: BUSCA LA NOTA CERCA DE 4,3';
    if(!s.seal)return 'EN EL RPG: ROMPE EL SELLO ROJO EN 9,8';
    if(!s.photo)return 'EN LA REALIDAD: BUSCA UNA FOTO EN EL ALA ESTE, 13,2';
    if(!s.echo)return 'EN EL RPG: EXAMINA EL POZO EN 10,4';
    if(!s.tape)return 'EN EL SOTANO: REPRODUCE LA CINTA EN 10,9';
    if(!s.key)return 'EN EL ALA DE ARCHIVOS: ABRE EL ARMARIO EN 3,9';
    const stage=s.flags?.kibaFinaleStage||0;
    if(stage===1||stage===2)return FINALE_OBJECTIVES[stage];
    if(stage===3)return 'HUIDA COMPLETADA · EN EL RPG: CRUZA EL UMBRAL EN 13,10';
    return 'EN EL RPG: CRUZA EL UMBRAL EN 13,10';
  }
  function bfs(map,sx,sy,gx,gy) {
    let start=[Math.floor(sx),Math.floor(sy)], goal=[Math.floor(gx),Math.floor(gy)];
    const q=[start], seen=new Set([start.join(',')]), parents=new Map();
    for(let i=0;i<q.length;i++) {
      let [x,y]=q[i], key=x+','+y;
      if(x===goal[0]&&y===goal[1]) {
        let path=[[x,y]]; while(parents.has(key)) { key=parents.get(key); path.push(key.split(',').map(Number)); }
        return path.reverse();
      }
      for(let [dx,dy] of DIRS) {
        let nx=x+dx,ny=y+dy,k=nx+','+ny;
        if(!seen.has(k)&&!wall(map,nx,ny)){seen.add(k);parents.set(k,key);q.push([nx,ny]);}
      }
    }
    return [];
  }
  function normalize(v) {
    if(!v||typeof v!=='object'||![4,5,6,7,8,9,10,11,12,13,14,VERSION].includes(v.version)) return null;
    const z=initial();
    for(let k of Object.keys(z)) if(k in v) z[k]=v[k];
    z.version=VERSION; // migracion validada desde v0.4; nuevos enigmas sin completar
    if(!['real','rpg'].includes(z.mode)||![z.rx,z.ry,z.entityX,z.entityY].every(Number.isFinite)||
      !Number.isInteger(z.px)||!Number.isInteger(z.py)||!Number.isInteger(z.dir)||z.dir<0||z.dir>3||
      ![1,2,3,4,5,6,7].includes(z.day)||collision(realMap(z),z.rx,z.ry)||wall(rpgMap(z),z.px,z.py)||collision(realMap(z),z.entityX,z.entityY)||
      typeof z.flags!=='object'||!z.flags||Array.isArray(z.flags)||!Array.isArray(z.journal)||!Array.isArray(z.scares))return null;
    for (let k of ['note','seal','tape','key','mirror','call','light','hidden','crouched','chase','won','photo','echo','d2Register','d2Bell','d2Frequency','d2Reflection','d2Door','d3Ticket','d3Clock','d3Schedule','d3Signal','d3Booth','d4File','d4Ledger','d4Xray','d4Fold','d4Reel','d5Sign','d5Address','d5Plot','d5Street','d5House','d6Label','d6Index','d6Furnace','d6Vent','d6Negative','d7Terminal','d7Portrait','d7Voice','d7Name','d7Original']) if(typeof z[k]!=='boolean')return null;
    if(!['none','keep','free','replace'].includes(z.d7Choice)||
      !['none','keep','free','replace'].includes(z.endingId))return null;
    if(z.day===7&&z.won&&(!z.d7Original||z.endingId==='none'))return null;
    z.threat=Math.min(100,Math.max(0,Number(z.threat)||0));
    z.encounter=Math.min(999,Math.max(0,Number(z.encounter)||0));
    z.steps=Math.min(999999,Math.max(0,Number(z.steps)||0));
    z.journal=z.journal.filter(x=>typeof x==='string').slice(-30).map(x=>x.slice(0,240));
    z.scares=z.scares.filter(x=>typeof x==='string').slice(-30);
    z.endingStage=Number.isInteger(z.endingStage)?Math.min(3,Math.max(0,z.endingStage)):0;
    if(z.flags.kibaWitness!==undefined&&typeof z.flags.kibaWitness!=='boolean')delete z.flags.kibaWitness;
    for(const key of ['kibaEvidence','kibaChaseBeats']){
      const allowed=key==='kibaEvidence'?['lobby','glass','archives','basement']:['first-step','crossing','escaped'];
      if(z.flags[key]!==undefined){
        z.flags[key]=Array.isArray(z.flags[key])?Array.from(new Set(z.flags[key].filter(v=>allowed.includes(v)))).slice(0,allowed.length):[];
      }
    }
    // El sigilo del Día 1 es opcional. Guardados v0.17 reciben valores por defecto.
    if(z.day!==1)z.crouched=false;
    if(z.flags.kibaDecoysUsed!==undefined){
      const n=z.flags.kibaDecoysUsed;
      z.flags.kibaDecoysUsed=Number.isInteger(n)?Math.max(0,Math.min(2,n)):0;
    }
    if(z.flags.kibaDecoyStep!==undefined && (!Number.isInteger(z.flags.kibaDecoyStep)||z.flags.kibaDecoyStep<0||z.flags.kibaDecoyStep>z.steps))delete z.flags.kibaDecoyStep;
    if(z.flags.kibaDecoy && !validNoiseMarker(z.flags.kibaDecoy,realMap(z),z.steps))delete z.flags.kibaDecoy;
    if(z.day!==1){delete z.flags.kibaDecoy;delete z.flags.kibaDecoyStep;delete z.flags.kibaDecoysUsed;}
    for(const key of ['kibaNorthOpen','kibaArchiveOpen','kibaVentUsed']){
      if(z.flags[key]!==undefined && typeof z.flags[key]!=='boolean')delete z.flags[key];
    }
    if(z.flags.kibaNorthOpen===true&&!z.seal)z.flags.kibaNorthOpen=false;
    if(z.flags.kibaArchiveOpen===true&&!z.tape)z.flags.kibaArchiveOpen=false;
    if(z.flags.kibaHideSpot!==undefined&&!isValidHideSpot(z.flags.kibaHideSpot))delete z.flags.kibaHideSpot;
    if(z.flags.kibaHideAlert!==undefined&&typeof z.flags.kibaHideAlert!=='boolean')delete z.flags.kibaHideAlert;
    if(!z.hidden||z.day!==1){delete z.flags.kibaHideSpot;delete z.flags.kibaHideAlert;}
    if(z.flags.kibaHideSpot && !KIBA_HIDEOUTS.some(f=>f.id===z.flags.kibaHideSpot&&distance(f.x,f.y,z.rx,z.ry)<=f.r)){delete z.flags.kibaHideSpot;delete z.flags.kibaHideAlert;z.hidden=false;}
    if(z.day!==1){for(const key of ['kibaNorthOpen','kibaArchiveOpen','kibaVentUsed'])delete z.flags[key];}
    if(z.flags.copyistMemory){const m=z.flags.copyistMemory;if(!m||!Number.isFinite(m.x)||!Number.isFinite(m.y)||!Number.isInteger(m.lastSeenStep)||!['hunt','investigate','search'].includes(m.phase)||wall(realMap(z),m.x,m.y))delete z.flags.copyistMemory;}
    sanitizeFinale(z.flags,z.day,z.key,z.tape,z.steps);
    z.room=roomAt(z.rx,z.ry,z.day);
    return z;
  }
  function newGame() {
    let s=initial(), queue=[];
    function signal(kind, message, title='') { queue.push({kind,message,title}); if(kind==='journal')s.journal.push(message); }
    function events() { return queue.splice(0); }
    function setScene(id,title,message,duration=85) { s.scene=id; s.eventId=id; s.eventTick=duration; signal('scene',message,title); }
    function mark(id,title,message) { if(s.scares.includes(id))return; s.scares.push(id); setScene(id,title,message); }
    function evidenceFound(){
      if(!Array.isArray(s.flags.kibaEvidence))s.flags.kibaEvidence=[];
      return s.flags.kibaEvidence;
    }
    function checkFinaleProgress(){
      if(s.day!==1||s.mode!=='real'||s.hidden||s.won)return;
      const stage=s.flags.kibaFinaleStage||0;
      if(!atFinaleTarget(stage,s.rx,s.ry))return;
      if(stage===1){
        s.flags.kibaFinaleStage=2;
        setScene('finale-crossing','LOS NOMBRES BAJO EL SUELO',
          'Al llegar al archivo, la cinta pronuncia tu nombre desde debajo de la rejilla. Hay una salida en el vestíbulo. No te detengas.',125);
        signal('journal','Huida: he alcanzado los archivos. La puerta de salida está en el vestíbulo.');
        signal('sound','finaleCrossing');
      }else if(stage===2){
        s.flags.kibaFinaleStage=3;
        s.flags.kibaFinaleDone=true;
        delete s.flags.kibaFinaleStartedAt;
        s.chase=false;s.threat=0;
        setScene('finale-escape','LA PUERTA TENÍA TU NOMBRE',
          'La entrada se abre antes de que la toques. Fuera no hay calle: solo la luz de la segunda pantalla. Vuelves al cartucho con el corazón todavía golpeando.',180);
        signal('journal','Sobreviví a la huida final de Kiba. Una puerta real me condujo hasta el RPG.');
        signal('sound','finaleEscape');
      }
    }
    function checkChaseBeat(){
      if(s.day!==1||s.mode!=='real'||s.won)return;
      const done=Array.isArray(s.flags.kibaChaseBeats)?s.flags.kibaChaseBeats:[];
      const beat=nextChaseBeat({chase:s.chase,tape:s.tape,steps:s.steps,room:s.room,
        hidden:s.hidden,threat:s.threat,phase:s.flags.copyistMemory?.phase,already:done});
      if(!beat)return;
      s.flags.kibaChaseBeats=[...done,beat];
      const story=CHASE_BEATS[beat];
      mark('kiba-chase-'+beat,story.title,story.message);
      signal('sound',story.cue);
    }
    function encounter() {
      if(s.day===1&&(s.flags.kibaFinaleStage===1||s.flags.kibaFinaleStage===2)){
        s.flags.kibaFinaleStage=0;
        delete s.flags.kibaFinaleStartedAt;
        s.flags.kibaFinaleFailures=Math.min(99,(s.flags.kibaFinaleFailures||0)+1);
        signal('journal','La huida se interrumpió: La Copista me encontró. Puedo volver a la cinta 04 para intentarlo otra vez.');
        signal('sound','finaleFail');
      }
      s.rx=2.5; s.ry=2.5; s.dir=1; s.hidden=false; s.room=roomAt(s.rx,s.ry,s.day);
      s.entityX=13.5; s.entityY=11.5; s.threat=23; s.encounter++;delete s.flags.copyistMemory;delete s.flags.kibaDecoy;delete s.flags.kibaHideSpot;delete s.flags.kibaHideAlert;s.crouched=false;
      mark('caught-'+s.encounter,'NO DEBERÍAS ESTAR AQUÍ','La Copista ha copiado tu último movimiento. Despiertas al principio del pasillo.');
      signal('sound','caught');
    }
    // Solo Día 1 usa percepción limitada; Días 2–7 preservan su IA anterior.
    function lineOfSight(x1,y1,x2,y2){
      const length=distance(x1,y1,x2,y2), count=Math.ceil(length/.12);
      for(let i=1;i<count;i++){const t=i/count;if(wall(realMap(s),x1+(x2-x1)*t,y1+(y2-y1)*t))return false;}
      return true;
    }
    function entityStep() {
      if(!s.chase||s.won||s.mode!=='real')return;
      if(s.day===1){
        const d=distance(s.rx,s.ry,s.entityX,s.entityY);
        if(d<.8&&!s.hidden){encounter();return;}
        const memory=s.flags.copyistMemory;
        if(s.hidden && isValidHideSpot(s.flags.kibaHideSpot) &&
           hideMayBeFound(d,Boolean(s.flags.kibaHideAlert),memory?.phase??'search')){
          delete s.flags.kibaHideSpot;delete s.flags.kibaHideAlert;
          encounter();mark('kiba-hide-breached','EL ESCONDITE NO ERA SEGURO','La Copista abre la puerta: aún escucha el eco de tu respiración.');return;
        }
        const decision=decideCopyist({playerX:s.rx,playerY:s.ry,entityX:s.entityX,entityY:s.entityY,
          light:s.light,hidden:s.hidden,steps:s.steps,
          sneaking:s.crouched,noiseLevel:footstepNoise(s.rx,s.ry,s.crouched),
          decoy:s.flags.kibaDecoy&&s.steps-s.flags.kibaDecoy.atStep<=10?s.flags.kibaDecoy:null,
          visible:lineOfSight(s.entityX,s.entityY,s.rx,s.ry),memory});
        s.flags.copyistMemory=decision.memory;
        s.threat=Math.max(0,Math.min(100,s.threat+(s.hidden?-14:decision.threatDelta)));
        const goalD=distance(s.entityX,s.entityY,decision.goalX,decision.goalY);
        if(goalD>.23){
          const path=bfs(realMap(s),s.entityX,s.entityY,decision.goalX,decision.goalY);
          if(path.length>1){
            const [gx,gy]=path[1],dx=gx+.5-s.entityX,dy=gy+.5-s.entityY,len=Math.hypot(dx,dy);
            if(len>.005){const finale=s.flags.kibaFinaleStage===2;
              const amount=Math.min(len,finale?Math.min(.40,decision.speed*1.10):decision.speed);
              const nx=s.entityX+dx/len*amount,ny=s.entityY+dy/len*amount;
              if(!collision(realMap(s),nx,ny)){s.entityX=nx;s.entityY=ny;}
            }
          }
        }
        if(distance(s.rx,s.ry,s.entityX,s.entityY)<.8&&!s.hidden)encounter();
        if(decision.phase==='search'&&s.steps%9===0&&s.threat>28)
          mark('copyist-lost','SE HA DETENIDO','La Copista gira hacia el lugar donde te vio por última vez. No sabe en qué habitación estás.');
        return;
      }
      if(s.hidden){s.threat=Math.max(0,s.threat-16);return;}
      const d=distance(s.rx,s.ry,s.entityX,s.entityY);
      if(d<.8){encounter();return;}
      if(d<11) {
        s.threat=Math.min(100,s.threat+Math.max(4,14-d));
        const path=bfs(realMap(s),s.entityX,s.entityY,s.rx,s.ry);
        if(path.length>1) {
          let target=path[1], xx=target[0]+.5,yy=target[1]+.5, dx=xx-s.entityX,dy=yy-s.entityY,l=Math.hypot(dx,dy);
          const speed=.31;
          if(l>.005) {
            let nx=s.entityX+dx/l*Math.min(l,speed),ny=s.entityY+dy/l*Math.min(l,speed);
            if(!collision(realMap(s),nx,ny)){s.entityX=nx;s.entityY=ny;}
          }
        }
      } else s.threat=Math.max(0,s.threat-3);
      if(s.threat>=66&&s.steps%5===0)mark('whisper','¿TE HAS FIJADO EN LA PARED?','La figura repite tus pasos un instante después. No todos tus recuerdos son tuyos.');
    }
    function move(k) {
      if(s.won)return false;
      if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(k))return false;
      if(s.mode==='rpg') {
        const moves={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
        const [dx,dy]=moves[k],nx=s.px+dx,ny=s.py+dy;
        if(wall(rpgMap(s),nx,ny)){signal('sound','bump');return false;}
        s.px=nx;s.py=ny;s.steps++;signal('sound','stepRpg');
        if(s.day===7&&s.px===13&&s.py===10&&s.d7Original){
          if(s.d7Choice==='none')signal('message','La última puerta no acepta el silencio. Escoge antes uno de los tres altares.');
          else{
            s.won=true;s.endingStage=0;s.chase=false;s.endingId=s.d7Choice;
            const finale={keep:['EL ARCHIVO PERMANECE','Los nombres de los olvidados recuperan sus dueños. Sus copias también recuerdan. Nadie puede volver a ser exactamente quien era.'],free:['LA ULTIMA COPIA','La memoria robada regresa a la realidad. Tú la liberas y pierdes todos los recuerdos que te trajeron hasta aquí.'],replace:['EL NUEVO ESCRIBA','Te conviertes en el guardián del archivo. Nao sale por primera vez al amanecer, pero una silla sigue ocupada en la pantalla.']}[s.endingId];
            setScene('ending7',finale[0],finale[1]+' Pulsa E para continuar.',99999);signal('sound','ending');
            signal('journal','FINAL: '+s.endingId.toUpperCase()+' — '+finale[1]);
          }
        }
        if(s.day===6&&s.px===13&&s.py===10&&s.d6Negative&&s.d6Vent){
          s.won=true;s.endingStage=0;s.chase=false;
          setScene('ending6','FIN DEL DIA 6','El depósito no contiene restos humanos. Contiene el tiempo que alguien ha borrado de sus vidas. Pulsa E para continuar.',99999);
          signal('sound','ending');
        }
        if(s.day===5&&s.px===13&&s.py===10&&s.d5House&&s.d5Street){
          s.won=true;s.endingStage=0;s.chase=false;
          setScene('ending5','FIN DEL DIA 5','La puerta conserva tu dirección. Dentro, alguien vive los recuerdos que has perdido. Pulsa E para continuar.',99999);
          signal('sound','ending');
        }
        if(s.day===4&&s.px===13&&s.py===10&&s.d4Reel&&s.d4Fold){
          s.won=true;s.endingStage=0;s.chase=false;
          setScene('ending4','FIN DEL DIA 4','En la cama 0 hay un cuerpo recortado a tu medida. El papel de la sábana empieza a respirar. Pulsa E para continuar.',99999);
          signal('sound','ending');
        }
        if(s.day===3&&s.px===13&&s.py===10&&s.d3Booth&&s.d3Signal){
          s.won=true;s.endingStage=0;s.chase=false;
          setScene('ending3','FIN DEL DIA 3','El último tren llega vacío. En cada asiento hay un billete con tu nombre. Pulsa E para continuar.',99999);
          signal('sound','ending');
        }
        if(s.day===2&&s.px===13&&s.py===10&&s.d2Door&&s.d2Reflection){
          s.won=true;s.endingStage=0;s.chase=false;
          setScene('ending2','FIN DEL DIA 2','La habitacion 207 se enciende en el cartucho. Donde deberia estar Nao, ahora esta tu cama.',99999);
          signal('sound','ending');
        }
        if(s.day===1&&s.px===13&&s.py===10&&s.key&&s.echo) {
          s.won=true;s.endingStage=0;
          setScene('ending','FIN DEL DIA 1','La pantalla escribe tu nombre sin que lo hayas tecleado. Pulsa E para continuar.',99999);
          signal('sound','ending');
        }
      } else {
        if(k==='ArrowLeft'){s.dir=(s.dir+3)%4; s.rx=Math.floor(s.rx)+.5;s.ry=Math.floor(s.ry)+.5;signal('sound','turn');}
        else if(k==='ArrowRight'){s.dir=(s.dir+1)%4;s.rx=Math.floor(s.rx)+.5;s.ry=Math.floor(s.ry)+.5;signal('sound','turn');}
        else {
          const [dx,dy]=DIRS[s.dir],m=k==='ArrowUp'?1:-1,nx=s.rx+dx*m*(s.day===1&&s.crouched?.27:.47),ny=s.ry+dy*m*(s.day===1&&s.crouched?.27:.47);
          if(collision(realMap(s),nx,ny)){signal('sound','bump');return false;}
          s.rx=nx;s.ry=ny;s.steps++;s.hidden=false;delete s.flags.kibaHideSpot;delete s.flags.kibaHideAlert;
          if(s.day===1){
            const surface=floorSurface(s.rx,s.ry);
            signal('sound',s.crouched?'stepQuiet':surface==='metal'?'stepMetal':'stepReal');
            if(s.chase&&surface==='metal'&&!s.crouched&&s.steps%5===0)mark('kiba-metal','EL SUELO TE DELATA','Las rejillas vibran bajo tus pies. El sonido recorre los conductos y algo cambia de dirección.');
          }else signal('sound','stepReal');
          const nextRoom=roomAt(s.rx,s.ry,s.day);
          if(s.room!==nextRoom){s.room=nextRoom;signal('message','Has entrado en '+nextRoom.toLowerCase()+'.');signal('sound','room');}
          if(s.day===1&&s.room==='SOTANO TECNICO'&&s.steps>9)mark('basement','EN EL CONDUCTO','Algo golpea las tuberias desde dentro. Suena como una voz pronunciando silabas al reves.');
          if(s.day===1&&s.room==='ALA ESTE'&&s.steps>4&&!s.photo)mark('window','EL OTRO LADO DEL CRISTAL','Una silueta observa desde el exterior. Estas en la cuarta planta. No hay balcon.');
          if(s.day===2&&s.d2Frequency&&s.steps%4===0)mark('breath','LA PARED RESPIRA','Al otro lado del tabique escuchas una respiracion. Cesa cuando dejas de caminar.');
          if(s.day===7&&s.d7Voice&&s.steps%6===0)mark('d7double','TU VOZ LLEGA ANTES','Escuchas tu respuesta antes de formular la pregunta. Dos respiraciones caben en una sola garganta.');
          if(s.day===6&&s.d6Furnace&&s.steps%5===0)mark('d6hiss','CENIZA DETRAS DEL VIDRIO','El polvo se adhiere a una ventana desde el lado donde no existe aire. Una figura repasa las palabras con un dedo.');
          if(s.day===5&&s.d5Plot&&s.steps%5===0)mark('d5silence','NO QUEDA NADIE EN ESTA CALLE','Las ventanas se encienden una a una. Ninguna casa tiene fachada.');
          if(s.day===4&&s.d4Xray&&s.steps%6===0)mark('d4seam','HAY UNA COSTURA EN LA PARED','La pared se dobla hacia dentro como una hoja de papel. Al otro lado, alguien pasa página.');
          if(s.day===3&&s.d3Schedule&&s.steps>8&&s.steps%6===0)mark('train','EL TREN DE LAS 00:00','Se abre una puerta sobre las vías. Del otro lado no hay vagón: hay un pasillo de tu casa.');
          entityStep();
          if(s.chase&&s.steps%3===0)entityStep();
          checkFinaleProgress();
          checkChaseBeat();
          if(s.day===1&&!s.mirror&&s.steps>6)mark('behind','ALGUIEN CAMINA CONTIGO','Una segunda hilera de pasos suena detrás de ti. Al girarte no hay nadie.');
          if(s.day===1&&s.steps>=5&&s.room==='VESTIBULO')mark('premium-lobby','EL EDIFICIO RESPONDE','La luz del vestíbulo se apaga detrás de ti, una lámpara tras otra. Al fondo, la puerta de entrada ya no tiene pomo.');
          if(s.day===1&&s.photo&&s.room==='ALA DE ARCHIVOS')mark('premium-archives','EL RETRATO EN LA PARED','Alguien ha clavado una fotografía nueva en el tablón. Apareces de espaldas, mirando exactamente este pasillo.');
          if(s.day===1&&s.tape&&s.room==='ALA ESTE'&&s.steps%7===0)mark('premium-east','UNA PERSONA EN LA VENTANA','A través del vidrio se ve el vestíbulo desde fuera. Dentro hay una mujer inmóvil. El lugar donde debería estar su cara es un recorte blanco.');
        }
      }
      return true;
    }
    function startDay2(){
      s.day=2;s.mode='real';s.rx=2.5;s.ry=2.5;s.dir=1;s.px=1;s.py=1;
      s.chase=false;s.hidden=false;s.crouched=false;s.threat=0;s.entityX=13.5;s.entityY=11.5;
      s.won=false;s.endingStage=0;s.room=roomAt(s.rx,s.ry,2);
      s.d2Register=false;s.d2Bell=false;s.d2Frequency=false;s.d2Reflection=false;s.d2Door=false;
      setScene('day2','DIA 2 — LA VOZ DETRAS DEL MURO','Nao dejo tu nombre en el registro de la residencia. Pero el edificio fue demolido hace trece anos.',145);
      signal('journal','Dia 2. Residencia Kiba: en los planos solo existe una planta. El ascensor marca dos.');
      signal('sound','swap');
    }
    function startDay3(){
      s.day=3;s.mode='real';s.rx=2.5;s.ry=2.5;s.dir=1;s.px=1;s.py=1;
      s.chase=false;s.hidden=false;s.crouched=false;s.threat=0;s.entityX=13.5;s.entityY=11.5;
      s.won=false;s.endingStage=0;s.room=roomAt(s.rx,s.ry,3);
      s.d3Ticket=false;s.d3Clock=false;s.d3Schedule=false;s.d3Signal=false;s.d3Booth=false;
      setScene('day3','DIA 3 — LA ESTACION SIN SALIDAS','La última línea del registro conduce a una estación cerrada. Los trenes siguen llegando, pero ningún plano recuerda sus vías.',155);
      signal('journal','Día 3. Estación Hatsune: todos los relojes marcan horas diferentes. El mío se ha detenido ayer.');
      signal('sound','train');
    }
    function startDay4(){
      s.day=4;s.mode='real';s.rx=2.5;s.ry=2.5;s.dir=1;s.px=1;s.py=1;
      s.chase=false;s.hidden=false;s.crouched=false;s.threat=0;s.entityX=13.5;s.entityY=11.5;
      s.won=false;s.endingStage=0;s.room=roomAt(s.rx,s.ry,4);
      s.d4File=false;s.d4Ledger=false;s.d4Xray=false;s.d4Fold=false;s.d4Reel=false;
      setScene('day4','DIA 4 — EL HOSPITAL DE PAPEL','El tren deja una hoja en tu bolsillo: un alta hospitalaria con la fecha de mañana. Nadie recuerda que el sanatorio haya existido.',160);
      signal('journal','Día 4. Sanatorio de Papel. El registro de pacientes está escrito por el reverso de las hojas.');
      signal('sound','hospital');
    }
    function startDay5(){
      s.day=5;s.mode='real';s.rx=2.5;s.ry=2.5;s.dir=1;s.px=1;s.py=1;
      s.chase=false;s.hidden=false;s.crouched=false;s.threat=0;s.entityX=13.5;s.entityY=11.5;
      s.won=false;s.endingStage=0;s.room=roomAt(s.rx,s.ry,5);
      s.d5Sign=false;s.d5Address=false;s.d5Plot=false;s.d5Street=false;s.d5House=false;
      setScene('day5','DIA 5 — LA CASA QUE FALTA','Al salir del hospital, el barrio termina donde debería empezar tu calle. El solar vacío tiene la dirección de tu infancia.',160);
      signal('journal','Día 5. Calle de los Ausentes. Hay números de portal, pero nadie recuerda las casas.');
      signal('sound','room');
    }
    function startDay6(){
      s.day=6;s.mode='real';s.rx=2.5;s.ry=2.5;s.dir=1;s.px=1;s.py=1;
      s.chase=false;s.hidden=false;s.crouched=false;s.threat=0;s.entityX=13.5;s.entityY=4.5;
      s.won=false;s.endingStage=0;s.room=roomAt(s.rx,s.ry,6);
      s.d6Label=false;s.d6Index=false;s.d6Furnace=false;s.d6Vent=false;s.d6Negative=false;
      setScene('day6','DIA 6 — EL DEPOSITO DE CENIZAS','La casa borrada tenía un sótano industrial. Allí se quemaban copias de vidas antes de que llegaran a existir.',170);
      signal('journal','Día 6. Depósito de cenizas. Las urnas no tienen nombres: cada una guarda una hora que alguien dejó de vivir.');
      signal('sound','furnace');
    }
    function startDay7(){
      s.day=7;s.mode='real';s.rx=2.5;s.ry=2.5;s.dir=1;s.px=1;s.py=1;
      s.chase=false;s.hidden=false;s.crouched=false;s.threat=0;s.entityX=13.5;s.entityY=4.5;
      s.won=false;s.endingStage=0;s.room=roomAt(s.rx,s.ry,7);
      s.d7Terminal=false;s.d7Portrait=false;s.d7Voice=false;s.d7Name=false;s.d7Original=false;
      s.d7Choice='none';s.endingId='none';
      setScene('day7','DIA 7 — EL NOMBRE ORIGINAL','En la cámara de origen hay dos registros con tu nombre. Nao dejó una advertencia: destruir el archivo también destruye algo que todavía vive.',175);
      signal('journal','Día 7. Cámara de origen. Los errores de la Copista tienen nombres y familias. No todos pueden volver sin consecuencias.');
      signal('sound','heartbeat');
    }
    function interactDay7(){
      if(s.mode==='rpg'){
        const near=(x,y)=>Math.abs(s.px-x)+Math.abs(s.py-y)<=1;
        if(near(4,4)){
          if(!s.d7Terminal)signal('message','El retrato aún no tiene marco. Consulta primero la terminal de origen.');
          else if(!s.d7Portrait){s.d7Portrait=true;signal('journal','El retrato en blanco tiene una sombra infantil: Nao registró la primera copia para salvar a alguien del olvido.');setScene('d7portrait','UN ROSTRO AL REVES','El retrato muestra una infancia que recuerdas, pero que no pudiste vivir. Alguien te escucha por un micrófono de la sala real.');signal('sound','paper');}
          else signal('message','Tu cara tarda un instante en aparecer cada vez que apartas la vista.');
        }else if(near(11,5)){
          if(!s.d7Voice)signal('message','El nombre está en silencio. Falta una prueba de voz del otro lado de la pantalla.');
          else if(!s.d7Name){s.d7Name=true;s.chase=false;s.threat=0;signal('journal','El nombre original no es una persona: es el derecho a conservar una vida sin convertirla en archivo. Se abrió la cámara real.');setScene('d7name','EL NOMBRE QUE NO SE ESCRIBE','Las letras desaparecen. En el edificio real, una puerta aparece donde no había nada. La Copista deja de perseguirte.');signal('sound','fold');}
          else signal('message','Lo que escribiste ya no tiene letras. Solo permanece una decisión.');
        }else if(near(2,10)){chooseEnding('keep','CONSERVAR EL ARCHIVO','Si guardas el archivo, los olvidados recuperarán sus recuerdos, pero las copias seguirán viviendo. Ninguna vida puede deshacerse sin dejar otra rota.');}
        else if(near(8,10)){chooseEnding('free','ABRIR LAS PUERTAS','Si liberas todos los recuerdos, los nombres regresarán. El precio es tu propia memoria: olvidarás incluso por qué entraste aquí.');}
        else if(near(12,7)){chooseEnding('replace','OCUPAR SU LUGAR','Si ocupas el puesto de La Copista, Nao podrá salir. Tendrás que vigilar los recuerdos de todos, sin que nadie vuelva a recordar tu nombre.');}
        else if(near(5,9))signal('message','NAO: «La Copista quería guardar a quienes habían sido borrados. Pero confundió recordar con poseer».');
        else if(near(13,10))signal('message',s.d7Choice==='none'?'La puerta exige que elijas uno de los tres altares.':`Tu elección es ${s.d7Choice.toUpperCase()}. Pisa la casilla final para terminar.`);
        else signal('message','En cada casilla hay un nombre distinto. Ninguno parece inventado.');
      }else{
        const close=(x,y,r)=>distance(s.rx,s.ry,x,y)<r;
        if(close(4.5,3.5,1.35)){
          if(!s.d7Terminal){s.d7Terminal=true;signal('journal','La terminal contiene la declaración de Nao: «Quise impedir que un recuerdo muriera. Empecé a copiar vidas enteras».');setScene('d7terminal','ARCHIVO DE PERSONAS','La pantalla muestra una carta de Nao dirigida a ti. Ella no creó la maldición para matar: la creó para recordar, y perdió el control de sus copias.');signal('sound','paper');}
          else signal('message','La terminal termina con una frase tachada: NINGUNA COPIA DEBERÍA SUFRIR POR SER COPIA.');
        }else if(close(12.5,3.5,1.4)){
          if(!s.d7Portrait)signal('message','La grabación está encriptada. Examina el retrato del RPG antes de reproducirla.');
          else if(!s.d7Voice){s.d7Voice=true;s.chase=true;s.threat=20;signal('journal','Tu voz y la de tu copia se solapan en la misma grabación. La entidad solo puede repetir movimientos: no puede elegir.');setScene('d7voice','DOS VOCES, UNA BOCA','La voz de Nao revela que la Copista no nació malvada. Fue la suma de recuerdos rechazados. Detrás de ti se oye tu propia voz contando hasta siete.');signal('sound','intercom');}
          else signal('message','En la cinta, alguien responde a preguntas que todavía no has formulado.');
        }else if(close(11.5,10.5,1.4)){
          if(!s.d7Name)signal('message','La cámara está al otro lado de un muro. Solo el nombre del cartucho puede abrirla.');
          else if(!s.d7Original){s.d7Original=true;s.chase=false;s.threat=0;signal('journal','Nao y La Copista existen como seres distintos. Romper el archivo destruiría también vidas nuevas. La elección no es inocente.');setScene('d7original','DOS PERSONAS EN UNA FOTO','La fotografía auténtica contiene a Nao y a su copia. Ambas miran a cámara. Detrás, con la mano sobre el obturador, estás tú.');signal('sound','photo');}
          else signal('message','La fotografía no cambia. Es la primera imagen de toda la semana que no intenta corregirte.');
        }else if(close(2.5,4.5,1.35)){
          s.hidden=!s.hidden;s.threat=Math.max(0,s.threat-45);signal('message',s.hidden?'Cierras el archivador y permaneces inmóvil. Una voz pronuncia tu nombre desde muy lejos.':'Sales del archivador. La Copista conoce el camino, pero no tu decisión.');signal('sound','hide');
        }else signal('message',s.chase?'Una voz repite cada palabra que todavía no has dicho.':'Los estantes contienen fotografías de personas que todavía viven.');
      }
    }
    function chooseEnding(kind,title,message){
      if(!s.d7Original){signal('message','Los tres altares permanecen apagados. Primero recupera la fotografía original.');return;}
      s.d7Choice=kind;
      signal('journal','Has seleccionado '+title+'. Todavía puedes cambiar de decisión antes de cruzar el archivo.');
      setScene('d7choice',title,message+' Puedes cambiar tu elección antes de atravesar la puerta final.');
      signal('sound','clue');
    }
    function interactDay6(){
      if(s.mode==='rpg'){
        const near=(x,y)=>Math.abs(s.px-x)+Math.abs(s.py-y)<=1;
        if(near(4,4)){
          if(!s.d6Label)signal('message','El índice está cubierto de hollín. Antes debes leer una etiqueta del depósito real.');
          else if(!s.d6Index){s.d6Index=true;signal('journal','El índice clasifica cenizas por minutos robados. Una urna lleva el número de mi última partida.');setScene('d6index','TIEMPO INCINERADO','La lista no contiene muertos. Contiene las horas que desaparecieron de sus biografías. En la realidad, el horno empieza a rugir.');signal('sound','paper');}
          else signal('message','La columna que llevaba tu nombre ahora dice ORIGINAL: NO ENCONTRADO.');
        }else if(near(11,5)){
          if(!s.d6Furnace)signal('message','La rueda está bloqueada. Primero debes descubrir qué quemaron realmente en el horno.');
          else if(!s.d6Vent){s.d6Vent=true;s.chase=false;s.threat=0;signal('journal','La rueda térmica dejó de girar. La compuerta del horno real se abrió hacia una galería de negativos.');setScene('d6wheel','CIEN GRADOS BAJO CERO','Giras la rueda hasta -00. El horno se apaga, pero las cenizas flotan hacia arriba. Una puerta antes tapiada aparece en el depósito.');signal('sound','fold');}
          else signal('message','La escala no mide calor. Mide cuánto tiempo le queda a cada recuerdo.');
        }else if(near(5,9))signal('message','GUARDIÁN DE CENIZA: «Nao no era una víctima. Era quien conservaba los recuerdos que nadie quiso».');
        else if(near(13,10))signal('message',s.d6Negative?'El núcleo reconoce el negativo recuperado. Entra en la casilla.':'El núcleo exige una imagen que no haya sido copiada.');
        else signal('message','En el suelo hay ceniza que forma letras mientras caminas.');
      }else{
        const close=(x,y,r)=>distance(s.rx,s.ry,x,y)<r;
        if(close(4.5,3.5,1.35)){
          if(!s.d6Label){s.d6Label=true;signal('journal','Etiqueta 06: Nao K., 00:13. No hay restos, solo una hora registrada en todas las urnas.');setScene('d6label','UNA URNA VACÍA','Abres el recipiente. En vez de polvo, un olor a lluvia de infancia. Al fondo hay una instrucción: CONSULTAR ÍNDICE.');signal('sound','paper');}
          else signal('message','La urna pesa exactamente lo mismo estando abierta o cerrada.');
        }else if(close(12.5,3.5,1.4)){
          if(!s.d6Index)signal('message','El horno no tiene combustible. Sus instrucciones están escritas en un índice que aún no has leído.');
          else if(!s.d6Furnace){s.d6Furnace=true;s.chase=true;s.threat=18;signal('journal','El horno quemaba los minutos de quienes habían sido reemplazados. La Copista guardaba las horas descartadas.');setScene('d6furnace','EL HORNO SIN FUEGO','El interior está frío. Oyes tu voz de niño contando hasta siete. Algo arrastra un saco de cenizas por el pasillo.');signal('sound','furnace');}
          else signal('message','Dentro del horno, una fotografía se revela y vuelve a ennegrecerse a cada segundo.');
        }else if(close(11.5,10.5,1.4)){
          if(!s.d6Vent)signal('message','El archivo de negativos está tras una compuerta sellada. La rueda del RPG puede abrirla.');
          else if(!s.d6Negative){s.d6Negative=true;s.chase=false;s.threat=0;signal('journal','Negativo sin copiar: Nao construyó el archivo para recordar a los sustituidos. La entidad nació de las copias incompletas.');setScene('d6negative','EL PRIMER ORIGINAL','La imagen muestra a Nao frente a una consola. A su lado hay alguien idéntico a ti, salvo por una cosa: está mirando fuera de la fotografía.');signal('sound','photo');}
          else signal('message','El negativo conserva una sombra que no aparece en la copia digital.');
        }else if(close(2.5,4.5,1.35)){
          s.hidden=!s.hidden;s.threat=Math.max(0,s.threat-45);signal('message',s.hidden?'Te ocultas tras el conducto de extracción. Las cenizas se elevan contra la gravedad.':'Sales del conducto. Ahora hay huellas debajo del polvo, no sobre él.');signal('sound','hide');
        }else signal('message',s.chase?'La Copista arrastra algo pesado. Una urna golpea cada escalón.':'El aire huele a carbón frío y a una habitación que aún no existe.');
      }
    }
    function interactDay5(){
      if(s.mode==='rpg'){
        const near=(x,y)=>Math.abs(s.px-x)+Math.abs(s.py-y)<=1;
        if(near(4,4)){
          if(!s.d5Sign)signal('message','Las calles no tienen nombre. Antes lee una placa en la realidad.');
          else if(!s.d5Address){s.d5Address=true;signal('journal','Libro de direcciones: una calle entera está escrita con la misma letra que mi diario.');setScene('d5address','EL LIBRO SIN VECINOS','Los buzones del pueblo muestran fechas, no apellidos. Tu calle aparece subrayada en negro.');signal('sound','paper');}
          else signal('message','El libro ahora incluye una dirección que todavía no has visitado.');
        }else if(near(11,5)){
          if(!s.d5Plot)signal('message','La calle borrada espera una prueba de que existió. Examina el solar real.');
          else if(!s.d5Street){s.d5Street=true;s.chase=false;s.threat=0;signal('journal','Has devuelto una calle a la memoria del cartucho. En la realidad se abre un pasaje tapiado.');setScene('d5street','LO QUE RECORDAMOS EXISTE','Dibujas una calle con el dedo. En el mundo real, un muro retrocede y deja una entrada iluminada.');signal('sound','fold');}
          else signal('message','La calle vuelve a tener nombre, pero ninguna casa conserva fotografías.');
        }else if(near(5,9))signal('message','VECINO SIN CARA: «Una casa no desaparece. Se la queda quien la recuerda».');
        else if(near(13,10))signal('message',s.d5House?'La puerta acepta tus recuerdos. Pisa la casilla de la casa.':'El umbral pregunta por un hogar que ya no está en los mapas.');
        else signal('message','Algunas ventanas se iluminan cuando dejas de mirarlas.');
      }else{
        const close=(x,y,r)=>distance(s.rx,s.ry,x,y)<r;
        if(close(4.5,3.5,1.35)){
          if(!s.d5Sign){s.d5Sign=true;signal('journal','La placa dice CALLE DE LOS AUSENTES. Debajo: DONDE TÚ VIVÍAS.');setScene('d5sign','LA DIRECCION IMPOSIBLE','El número de la calle cambia al pestañear. Bajo la placa: «Consulta el libro del otro barrio».');signal('sound','photo');}
          else signal('message','La placa señala un portal sin edificio.');
        }else if(close(12.5,3.5,1.45)){
          if(!s.d5Address)signal('message','Hay cimientos frescos y ningún rastro de demolición. Falta una dirección en el cartucho.');
          else if(!s.d5Plot){s.d5Plot=true;s.chase=true;s.threat=14;signal('journal','En el solar hay una puerta sin pared. Por debajo se mueve la sombra de una persona que se parece a mí.');setScene('d5plot','UN SOLAR HABITADO','Escuchas platos, una radio y voces familiares bajo un terreno vacío. Algo cruza delante de la linterna.');signal('sound','intercom');}
          else signal('message','El solar tiene ventanas. Solo se ven reflejadas en los charcos.');
        }else if(close(11.5,10.5,1.45)){
          if(!s.d5Street)signal('message','Donde debería estar la casa hay un muro. Su contorno está dibujado dentro del RPG.');
          else if(!s.d5House){s.d5House=true;s.chase=false;s.threat=0;signal('journal','La casa ausente está amueblada con objetos de distintos años. En la mesa hay una silla de más.');setScene('d5house','UN HOGAR DE PRESTADO','Al entrar, los relojes se detienen. Hay una fotografía tuya tomada antes de que nadie pudiera conocerte.');signal('sound','key');}
          else signal('message','La casa conserva tu respiración incluso cuando sales.');
        }else if(close(5.5,10.5,1.35)){
          s.hidden=!s.hidden;s.threat=Math.max(0,s.threat-42);signal('message',s.hidden?'Te escondes tras una marquesina cubierta de periódicos sin fecha.':'Sales de la marquesina. Tu silueta sigue en el cristal.');signal('sound','hide');
        }else signal('message',s.chase?'Se oyen pasos detrás de una pared que nunca existió.':'Los buzones están llenos de cartas dirigidas a casas vacías.');
      }
    }
    function interactDay4(){
      if(s.mode==='rpg'){
        const near=(x,y)=>Math.abs(s.px-x)+Math.abs(s.py-y)<=1;
        if(near(4,4)){
          if(!s.d4File)signal('message','Las páginas del libro están cosidas. Necesitas el expediente de admisión.');
          else if(!s.d4Ledger){s.d4Ledger=true;signal('journal','Libro de tinta: PACIENTE 000, SIN ROSTRO. Su imagen aparece en radiología.');setScene('d4ledger','DIAGNOSTICO INCOMPLETO','El libro escribe tu nombre con letras que brotan del papel. Se oye una impresora en la planta real.');signal('sound','paper');}
          else signal('message','Cada página del libro tiene la forma de una huella digital.');
        }else if(near(11,5)){
          if(!s.d4Xray)signal('message','El plano del hospital está plegado sobre sí mismo. Antes debes mirar a través de sus paredes.');
          else if(!s.d4Fold){s.d4Fold=true;s.chase=false;s.threat=0;signal('journal','Al desplegar el plano del RPG se ha abierto una puerta imposible en el pasillo real.');setScene('d4fold','LA PLANTA DOBLADA','Despliegas el papel. En la realidad, la pared de radiología se separa con un crujido seco.');signal('sound','fold');}
          else signal('message','En el plano ahora está dibujada tu posición exacta, incluso cuando no miras.');
        }else if(near(5,9))signal('message','ENFERMERA DE PAPEL: «Alguien archivó sus gritos como radiografías».');
        else if(near(13,10))signal('message',s.d4Reel?'La cama cero te espera. Pisa su casilla.':'Una pulsera de ingreso te impide acceder a la cama cero.');
        else signal('message','Los pasillos dibujados tienen manchas como de dedos húmedos.');
      }else{
        const close=(x,y,r)=>distance(s.rx,s.ry,x,y)<r;
        if(close(4.5,3.5,1.35)){
          if(!s.d4File){s.d4File=true;signal('journal','Admisión: PACIENTE 000. No figura su ingreso; únicamente consta que nunca fue dado de alta.');setScene('d4file','EL PACIENTE IMPOSIBLE','El papel está tibio. Debajo de tu nombre aparece una anotación: CONSULTAR EL LIBRO DE TINTA.');signal('sound','paper');}
          else signal('message','El expediente tiene una nueva página cada vez que lo cierras.');
        }else if(close(12.5,3.5,1.4)){
          if(!s.d4Ledger)signal('message','Las placas están vacías, salvo por una palabra escrita con tinta. La has visto dentro del cartucho.');
          else if(!s.d4Xray){s.d4Xray=true;s.chase=true;s.threat=14;signal('journal','Radiografía 000: huesos en forma de letras. El informe dice: EL PLANO ESTÁ PLEGADO.');setScene('d4xray','UN CUERPO ESCRITO','La placa muestra tu esqueleto compuesto por páginas. Algo arrastra una camilla por el pasillo.');signal('sound','xray');}
          else signal('message','Las placas muestran a la misma persona en distintas edades. Ninguna tiene rostro.');
        }else if(close(11.5,10.5,1.4)){
          if(!s.d4Fold)signal('message','El quirófano cero está detrás de una pared sin puerta. El plano del juego puede cambiarla.');
          else if(!s.d4Reel){s.d4Reel=true;s.chase=false;s.threat=0;signal('journal','Bobina 000: «El paciente conserva todos los recuerdos que sus copias olvidaron».');setScene('d4reel','LA CIRUGIA INVISIBLE','Oyes la grabación de una operación. El cirujano eres tú, y lo que estás extrayendo es un recuerdo.');signal('sound','heartbeat');}
          else signal('message','La bobina gira aunque la cinta ha terminado. Alguien susurra: CAMA CERO.');
        }else if(close(5.5,10.5,1.4)){
          s.hidden=!s.hidden;s.threat=Math.max(0,s.threat-45);signal('message',s.hidden?'Te escondes tras la cortina quirúrgica. Una sombra se detiene al otro lado.':'Sales de la cortina. Por un instante, el suelo parece una página arrugada.');signal('sound','hide');
        }else signal('message',s.chase?'Una camilla rechina detrás de ti. No se ven las ruedas.':'Huele a yodo y papel quemado. Las luces parpadean sin ruido.');
      }
    }
    function interactDay3(){
      if(s.mode==='rpg'){
        const near=(x,y)=>Math.abs(s.px-x)+Math.abs(s.py-y)<=1;
        if(near(3,4)){
          if(!s.d3Ticket)signal('message','Falta el billete que lleva impresa la hora imposible.');
          else if(!s.d3Clock){s.d3Clock=true;signal('journal','El reloj del RPG retrocede hasta las 00:13. La megafonía real repite esa hora.');setScene('d3clock','HORA DE NADIE','Al mover las agujas hacia atrás, todos los relojes de la estación se detienen. Solo escuchas el tic de tu corazón.');signal('sound','clock');}
          else signal('message','Las agujas giran con tu respiración.');
        }else if(near(10,6)){
          if(!s.d3Schedule)signal('message','El semáforo muestra dos vías. Primero tienes que averiguar cuál de ellas está borrada.');
          else if(!s.d3Signal){s.d3Signal=true;s.chase=false;s.threat=0;signal('journal','Al cambiar la señal del RPG se abrió un paso sellado en el andén real.');setScene('d3signal','LA VIA IMPOSIBLE','Las vías del cartucho se doblan como papel. Un muro de la estación real desaparece sin hacer ruido.');signal('sound','switch');}
          else signal('message','La señal no indica verde o rojo. Dice: DENTRO / FUERA.');
        }else if(near(5,9))signal('message','VIAJERO SIN OJOS: «No subas al tren que llega. Sube al que recuerdas».');
        else if(near(13,10))signal('message',s.d3Booth?'El andén está abierto. Avanza hasta su casilla.':'El andén cero pide una autorización escrita desde la cabina real.');
        else signal('message','Los anuncios de la estación solo muestran ciudades que han sido olvidadas.');
      }else{
        const close=(x,y,r)=>distance(s.rx,s.ry,x,y)<r;
        if(close(4.5,2.5,1.35)){
          if(!s.d3Ticket){s.d3Ticket=true;signal('journal','Billete para la línea 0. Salida 00:13. Destino: mi propio nombre.');setScene('d3ticket','BILLETE SIN DESTINO','El revisor estampó un sello con la fecha de mañana. Al darle la vuelta aparece el dibujo de un reloj del juego.');signal('sound','ticket');}
          else signal('message','En el billete se han borrado todas las estaciones salvo una.');
        }else if(close(12.5,4.5,1.4)){
          if(!s.d3Clock)signal('message','El panel está apagado. Una hora parpadea al ritmo de un reloj de cartucho.');
          else if(!s.d3Schedule){s.d3Schedule=true;s.chase=true;s.threat=12;signal('journal','Panel: VÍA 0 — ENTRADA SOLO DESDE EL OTRO MUNDO.');setScene('d3board','LLEGADA RETRASADA','En el panel aparece TU NOMBRE. De repente, alguien anuncia tu llegada por los altavoces.');signal('sound','train');}
          else signal('message','El panel señala hacia una pared donde debería haber una escalera.');
        }else if(close(10.5,10.5,1.4)){
          if(!s.d3Signal)signal('message','La cabina está tapiada. Los planos no incluyen la vía cero.');
          else if(!s.d3Booth){s.d3Booth=true;s.chase=false;s.threat=0;signal('journal','Dentro de la cabina hay una maqueta del RPG. La salida real está dentro de la pantalla.');setScene('d3booth','LA CABINA VACIA','La cabina contiene una mesa, dos monitores y un micrófono. Desde el altavoz oyes que alguien repite cada palabra que todavía no has dicho.');signal('sound','key');}
          else signal('message','El micrófono transmite una conversación que mantendrás mañana.');
        }else if(close(5.5,10.5,1.4)){
          s.hidden=!s.hidden;s.threat=Math.max(0,s.threat-42);signal('message',s.hidden?'Te agachas bajo el banco del andén. Unos zapatos se detienen frente a ti.':'Sales del banco. Una voz anuncia que el tren ha partido hace años.');signal('sound','hide');
        }else signal('message',s.chase?'El eco de tus zapatos llega antes que tus pasos.':'La estación huele a lluvia, aunque estás bajo tierra.');
      }
    }
    function interactDay2(){
      if(s.mode==='rpg'){
        const near=(x,y)=>Math.abs(s.px-x)+Math.abs(s.py-y)<=1;
        if(near(4,3)){
          if(!s.d2Register)signal('message','La campana vibra, pero antes debes saber que habitacion estas buscando.');
          else if(!s.d2Bell){s.d2Bell=true;signal('journal','La campana del cartucho ha sonado en un pasillo real sin altavoces.');setScene('d2bell','EL SONIDO DEL HUECO','Tocas la campana. En la residencia suena una segunda, mas lenta. Un piso entero responde.');signal('sound','bell');}
          else signal('message','La campana ya no tiene badajo. Su eco sigue creciendo.');
        } else if(near(11,4)){
          if(!s.d2Frequency)signal('message','La superficie del agua devuelve una frecuencia que aun no has escuchado.');
          else if(!s.d2Reflection){s.d2Reflection=true;s.chase=false;s.threat=0;signal('journal','El espejo de agua escribio: HABITACION 207. El numero no aparece en los planos.');setScene('d2water','EL REFLEJO EQUIVOCADO','El agua muestra la puerta 207 desde dentro. Hay una persona al otro lado del ojo de la cerradura.');signal('sound','mirror');}
          else signal('message','Tu reflejo permanece mirando la habitacion 207.');
        } else if(near(13,10))signal('message',s.d2Door&&s.d2Reflection?'La puerta esta abierta: pisa su casilla.':'La puerta no tiene numero. Falta recordar que habitacion existia aqui.');
        else signal('message','Las casas del pueblo parecen estar escuchando.');
      }else{
        const close=(x,y,r)=>distance(s.rx,s.ry,x,y)<r;
        if(close(3.5,3.5,1.25)){
          if(!s.d2Register){s.d2Register=true;signal('journal','Registro de la residencia: Aki Morita asignada a la habitacion 207. Fecha: manana.');setScene('d2register','NOMBRE PRESTADO','El libro de visitas tiene tu firma fechada para el dia siguiente. Junto a ella: «Haz sonar el pueblo».');signal('sound','photo');}
          else signal('message','Los nombres de todas las paginas terminan ahora con tus iniciales.');
        }else if(close(12.5,3.5,1.35)){
          if(!s.d2Bell)signal('message','El interfono solo emite una nota sostenida. Una campana parece responder desde el cartucho.');
          else if(!s.d2Frequency){s.d2Frequency=true;s.chase=true;s.threat=12;signal('journal','Interfono: «La habitacion sin numero aparece al otro lado del agua».');setScene('d2intercom','LA VOZ DETRAS DEL MURO','Una voz identica a la de Nao pronuncia tu nombre al reves. Del otro lado alguien empieza a caminar.');signal('sound','intercom');}
          else signal('message','El interfono transmite los pasos de otra persona que va un segundo por delante.');
        }else if(close(11.5,9.5,1.3)){
          if(!s.d2Reflection)signal('message','La habitacion carece de numero. Solo el cartucho puede decirte lo que falta.');
          else if(!s.d2Door){s.d2Door=true;s.chase=false;signal('journal','En el cuarto 207 hay un catre sin colchón y una consola con dos pantallas encendidas.');setScene('d2room','LA HABITACION IMPOSIBLE','Abres la puerta 207. Dentro del armario hay una fotografia tomada desde tu punto de vista, hace un minuto.');signal('sound','key');}
          else signal('message','Sobre la cama hay un hueco exacto con la forma de tu cuerpo.');
        }else if(close(6.5,10.5,1.3)){
          s.hidden=!s.hidden;s.threat=Math.max(0,s.threat-40);signal('message',s.hidden?'Te escondes tras un biombo. Los pasos se detienen al otro lado.':'Sales del biombo. La residencia esta demasiado silenciosa.');signal('sound','hide');
        }else signal('message',s.chase?'Alguien esta arrastrando muebles en una habitacion que no existe.':'Hay marcas de dedos por dentro del papel pintado.');
      }
    }
    function interact() {
      if(s.won){
        if(s.day===1&&s.endingStage>=3){startDay2();return;}
        if(s.day===2&&s.endingStage>=3){startDay3();return;}
        if(s.day===3&&s.endingStage>=3){startDay4();return;}
        if(s.day===4&&s.endingStage>=3){startDay5();return;}
        if(s.day===5&&s.endingStage>=3){startDay6();return;}
        if(s.day===6&&s.endingStage>=3){startDay7();return;}
        if(s.endingStage<3){s.endingStage++;signal('sound','ending');
          if(s.day===2){signal('message',['','La voz que te contesta es la tuya, envejecida.','El registro marca tu salida para una fecha que todavia no existe.','FIN DEL DIA 2. Pulsa E para bajar a la estación.'][s.endingStage]);return;}
          if(s.day===6){signal('message',['','Las urnas conservan segundos de vidas enteras. Ninguna guarda un cuerpo.','El negativo tiene tu rostro, pero la sombra de quien te acompaña no es humana.','FIN DEL DIA 6. Pulsa E otra vez para entrar en la cámara de origen.'][s.endingStage]);return;}
          if(s.day===7){
            const endings={keep:['','Los nombres regresan al archivo, pero esta vez pueden salir cuando quieran.','Nao descubre a su copia junto al amanecer. No son la misma persona, ni quieren serlo.','FIN: CONSERVAR. Los recuerdos pertenecen a quienes los vivieron.'],free:['','Los recuerdos vuelven a las personas y los edificios recuperan sus paredes.','Nao pregunta tu nombre. No sabes responder. Es la primera pregunta que nadie te obliga a contestar.','FIN: LIBERAR. El cartucho se apaga y tú empiezas de nuevo.'],replace:['','Nao cruza la puerta y respira el aire de la mañana.','En la pantalla, tus manos escriben nombres que nadie olvidará. Al otro lado del cristal, alguien toca una vez.','FIN: EL RELEVO. No todas las puertas llevan fuera.']}[s.endingId]||[];
            signal('message',endings[s.endingStage]||'FIN.');return;
          }
          if(s.day===5){signal('message',['','La puerta da a un comedor donde alguien acaba de levantarse.','En la mesa hay cinco fotografías. En todas falta la misma persona.','FIN DEL DIA 5. El siguiente archivo es el depósito de cenizas.'][s.endingStage]);return;}
          if(s.day===4){signal('message',['','El cirujano no tiene manos. Tiene dos hojas en blanco.','Encuentras una firma en tu informe médico: la escribiste antes de nacer.','FIN DEL DIA 4. La siguiente página está en el archivo de cenizas.'][s.endingStage]);return;}
          if(s.day===3){signal('message',['','En el andén vacío, todos los asientos llevan tu nombre.','El conductor te devuelve una fotografía donde aún no apareces.','FIN DEL DIA 3. La próxima parada es el hospital de papel.'][s.endingStage]);return;}
          signal('message',['','La fotografia ahora muestra una silla ocupada por tu sombra.','La voz de Nao llega desde el otro lado de la pantalla.','DIA 1 COMPLETADO. Las preguntas siguen abiertas.'][s.endingStage]);
        } else signal('message',s.day===7?'El final está cerrado. Puedes exportar la partida o iniciar una nueva.':'Pulsa E para continuar.');
        return;
      }
      if(s.day===7){interactDay7();return;}
      if(s.day===6){interactDay6();return;}
      if(s.day===5){interactDay5();return;}
      if(s.day===4){interactDay4();return;}
      if(s.day===3){interactDay3();return;}
      if(s.day===2){interactDay2();return;}
      if(s.mode==='rpg'){
        const near=(x,y)=>Math.abs(s.px-x)+Math.abs(s.py-y)<=1;
        if(near(4,3)){
          if(!s.note){s.note=true;signal('journal','La pared que respira no existe en los planos. Tiene dos manchas de humedad.');setScene('note','EL NIÑO DE TIZA','«No busques a la persona. Busca el hueco que dejó cuando la olvidaron».');signal('sound','clue');}
          else signal('message','La nota está en blanco. Ya has leído lo que había antes.');
        } else if(near(9,8)) {
          if(!s.note)signal('message','Un sello rojo. Debes encontrar la pista escrita en el pueblo.');
          else if(!s.seal){s.seal=true;signal('journal','El sello ha desaparecido del pueblo, y un armario real ha quedado sin cerrojo.');setScene('seal','EL SELLO SE ROMPE','La superficie de la pantalla se agrieta. Algo se ha abierto en el edificio real.');signal('sound','clue');}
          else signal('message','Solo queda un surco en el suelo.');
        } else if(near(10,4)) {
          if(!s.photo)signal('message','El pozo devuelve el rostro borroso de una mujer. Primero debes descubrir quien es.');
          else if(!s.echo){s.echo=true;signal('journal','El pozo escribe NAO en el agua. Esa palabra abre el umbral final del RPG.');setScene('well','EL NOMBRE BAJO EL AGUA','El pozo refleja una habitacion real. Una voz pronuncia: «Nao no desaparecio. La guardaron».');signal('sound','well');}
          else signal('message','No hay agua, pero tu reflejo sigue mirando hacia arriba.');
        } else if(near(5,10)){
          if(evidenceFound().length===4&&!s.flags.kibaWitness){
            s.flags.kibaWitness=true;
            signal('journal','Los cuatro testimonios de Kiba encajan: La Copista no nació allí. Fue encerrada para recordar lo que otros negaron.');
            setScene('kiba-witness','EL TESTIGO DE TIZA','«Los cuatro lo sabían. La Copista no quiere matarte: quiere que ocupes su lugar. Nao fue la primera en negarse».',150);
            signal('sound','paper');
          }else signal('message','NINO DE TIZA: «Si oyes tus pasos dos veces, el segundo no es tuyo».');
        }
        else if(near(13,10))signal('message',s.key&&s.echo?'El umbral está abierto. Entra en la casilla de la puerta.':'El umbral necesita una llave de papel y un nombre rescatado del pozo.');
        else signal('message','Una casa sin habitantes. Las ventanas reflejan el cielo equivocado.');
      } else {
        const close=(x,y,r)=>distance(s.rx,s.ry,x,y)<r;
        const feature=nearestKibaFeature(s.rx,s.ry,KIBA_SWITCHES);
        const hideout=nearestKibaFeature(s.rx,s.ry,KIBA_HIDEOUTS);
        if(feature?.id==='kibaBreaker'){
          if(!s.seal)signal('message','CUADRO NORTE: el diferencial tiene un sello rojo. El cartucho debe romperlo primero.');
          else if(!s.flags.kibaNorthOpen){s.flags.kibaNorthOpen=true;
            signal('journal','Abierto un paso eléctrico entre el vestíbulo y el ala este. Ahora puedo rodear la zona norte.');
            setScene('kiba-north','EL PASILLO ERA MAS LARGO','Al restablecer la corriente, un panel se desliza hacia la pared. Has abierto una ruta nueva por el norte.');signal('sound','gate');}
          else signal('message','El paso norte sigue abierto. Puedes evitar el corredor central.');
        } else if(feature?.id==='kibaWinch'){
          if(!s.tape)signal('message','TORNO DE ARCHIVOS: la rueda está bloqueada. Parece necesitar una vibración sostenida.');
          else if(!s.flags.kibaArchiveOpen){s.flags.kibaArchiveOpen=true;
            signal('journal','Abierto el atajo entre archivos y sótano. El torno hizo un ruido que escuchó todo el edificio.');
            setScene('kiba-winch','LA PARED SE DESPLAZA','Tiras del torno y la pared cede. El estruendo despierta algo al fondo del corredor. Ahora existe una segunda vía de escape.');signal('sound','gate');
            s.flags.kibaDecoy={x:6.5,y:7.5,atStep:s.steps};s.flags.kibaHideAlert=true;
          } else signal('message','El atajo de archivos permanece abierto, pero el torno aún vibra.');
        } else if(feature?.id==='kibaVent'){
          if(!s.chase)signal('message','CONDUCTO DE PRESION: una válvula oxidada. Al golpearla, el sonido recorrería toda el ala.');
          else if(s.flags.kibaVentUsed)signal('message','El conducto está roto. No podrás usarlo de nuevo.');
          else {s.flags.kibaVentUsed=true;s.flags.kibaDecoy={x:11.5,y:5.5,atStep:s.steps};
            signal('journal','Golpeé el conducto del ala este para atraer a La Copista. La válvula se partió y no puedo repetirlo.');
            mark('kiba-vent','GOLPE EN EL CONDUCTO','La chapa resuena hacia una habitación vacía. Ahora debes moverte antes de que descubra el engaño.');signal('sound','vent');}
        } else if(hideout){
          if(s.hidden&&s.flags.kibaHideSpot===hideout.id){
            s.hidden=false;delete s.flags.kibaHideSpot;delete s.flags.kibaHideAlert;
            signal('message','Sales del escondite improvisado. La madera cruje bajo tu peso.');signal('sound','hide');
          }else{
            s.hidden=true;s.crouched=false;s.flags.kibaHideSpot=hideout.id;
            s.flags.kibaHideAlert=hideRisk(s.threat,s.light,footstepNoise(s.rx,s.ry,false));
            signal('message',s.flags.kibaHideAlert?'Te ocultas, pero has hecho ruido. Si se acerca, podría abrir el escondite.':'Te ocultas entre cajas. No te muevas: la madera está podrida.');signal('sound','hide');
          }
        } else if(close(13.5,2.5,1.4)) {
          if(!s.seal)signal('message','Una fotografia velada. Hay una mancha roja con forma de sello en el marco.');
          else if(!s.photo){s.photo=true;signal('journal','Foto de 2003: Aki, Nao y una tercera silueta sin rostro. En el reverso: EL POZO NO ESTA VACIO.');setScene('photo','LA TERCERA PERSONA','En la fotografia la amiga desaparecida tiene la cara tachada. El reverso dice: «Busca su nombre donde no hay agua».');signal('sound','photo');}
          else signal('message','La fotografia muestra a tres personas. Cuando parpadeas, hay cuatro.');
        } else if(close(10.5,9.5,1.35)){
          if(!s.echo){signal('message','La cinta 04 no se mueve. En la etiqueta alguien escribio: «Primero recupera su nombre».');}
          else if(!s.tape){s.tape=true;s.chase=true;s.flags.copyistMemory={x:s.rx,y:s.ry,lastSeenStep:s.steps-5,phase:'investigate'};signal('journal','Cinta 04: alguien recita los nombres de personas que nunca han nacido.');setScene('tape','CINTA 04','«Cuando la oigas respirar, NO MIRES ATRÁS». La grabadora sigue encendida aunque le quites las pilas.');signal('sound','tape');}
          else if(canStartFinale(s)){
            s.flags.kibaFinaleStage=1;s.flags.kibaFinaleStartedAt=s.steps;
            s.chase=true;s.hidden=false;s.threat=Math.max(s.threat,26);
            s.flags.copyistMemory={x:s.rx,y:s.ry,lastSeenStep:s.steps-5,phase:'investigate'};
            setScene('finale-windup','LA CINTA SE REBOBINA SOLA',
              'La grabadora pronuncia tu nombre, luego el de Nao. Dos golpes responden desde el conducto. Debes cruzar el archivo y llegar al vestíbulo: no hay tiempo para escuchar el resto.',175);
            signal('journal','La cinta 04 ha empezado una segunda grabación. Huida de Kiba: primero archivos (6,7), después vestíbulo (2,2).');
            signal('sound','finaleStart');
          }else if(s.flags.kibaFinaleStage===1||s.flags.kibaFinaleStage===2)
            signal('message','La grabadora sigue rebobinando. No te quedes aquí; consulta el objetivo de huida.');
          else if(s.flags.kibaFinaleStage===3)signal('message','La cinta ya no tiene voz. He conseguido salir del edificio.');
          else signal('message','La cinta continúa girando. No hace ningún sonido.');
        } else if(close(3.5,9.5,1.5)){
          if(!s.seal)signal('message','Armario cerrado. El pestillo tiene un símbolo rojo pixelado.');
          else if(!s.tape)signal('message','El armario se abre unos centímetros. En su interior alguien susurra: «Escucha primero la cinta 04».');
          else if(!s.key){s.key=true;signal('journal','La llave de papel apareció en la realidad y abre un umbral del RPG.');setScene('key','LA LLAVE IMPOSIBLE','Dentro del armario hay una llave doblada en papel de periódico. El texto cambia cuando parpadeas. La cinta 04 acaba de rebobinarse: puedes volver a escucharla para intentar la huida final.');signal('sound','clue');}
          else signal('message','El armario está vacío. En el fondo hay arañazos desde dentro.');
        } else if(close(12.5,4.5,1.4)){
          s.hidden=!s.hidden;delete s.flags.kibaHideSpot;delete s.flags.kibaHideAlert;s.crouched=false;s.threat=Math.max(0,s.threat-35);signal('message',s.hidden?'Te escondes. La Copista pasa arrastrando los pies.':'Abres la puerta del escondite. Huele a tierra mojada.');signal('sound','hide');checkChaseBeat();
        } else if(close(8.5,3.5,1.4)){
          if(!s.call){s.call=true;signal('journal','Un teléfono sin cable recibió una llamada desde mi número de mañana.');mark('phone','LLAMADA ENTRANTE','Una voz idéntica a la tuya susurra: «No vuelvas a guardar la partida».');signal('sound','phone');}
          else signal('message','El auricular está caliente. La línea lleva horas cortada.');
        } else if(close(5.5,4.5,1.3)) {
          if(!s.mirror){s.mirror=true;signal('journal','Mi reflejo tarda en imitarme.');mark('mirror','EL RETRASO','Durante un instante, tu reflejo permanece inmóvil mientras tú te mueves.');signal('sound','mirror');}
          else signal('message','El espejo devuelve tu imagen con un segundo de retraso.');
        } else {
          const evidence=nearestEvidence(s.rx,s.ry,evidenceFound());
          if(evidence){
            evidenceFound().push(evidence.id);
            signal('journal',evidence.journal);
            setScene('kiba-evidence-'+evidence.id,evidence.title,evidence.message,115);
            signal('sound',evidence.cue);
          }else signal('message',s.chase?'Un arañazo nuevo acaba de aparecer en la pared.':'Un pasillo vacío. El edificio parece contener la respiración.');
        }
      }
    }
    function swap(){if(s.won)return;s.mode=s.mode==='real'?'rpg':'real';s.hidden=false;delete s.flags.kibaHideSpot;delete s.flags.kibaHideAlert;s.crouched=false;signal('message',s.mode==='real'?'La pantalla se apaga. Vuelves al edificio.':'El cartucho se inicia solo. Una partida que no recuerdas te espera.');signal('sound','swap');}
    /** Agacharse afecta al ruido y al avance, pero no vuelve invisible al jugador. */
    function toggleCrouch(){
      if(s.day!==1||s.mode!=='real'||s.won)return false;
      if(s.hidden){signal('message','Estás dentro del armario; sal antes de avanzar agachado.');return false;}
      s.crouched=!s.crouched;
      signal('message',s.crouched?'Te agachas. Los pasos apenas resuenan; avanzarás más despacio. La luz sigue delatándote.':'Te incorporas. Ahora avanzas más rápido, pero tus pasos se oyen.');
      signal('sound','sneak');return true;
    }
    /** Dos tuercas abandonadas junto a la cinta permiten desviar a la Copista. */
    function throwDecoy(){
      if(s.day!==1||s.mode!=='real'||s.won||!s.chase||!s.tape){signal('message','No llevas nada útil que lanzar.');return false;}
      const used=s.flags.kibaDecoysUsed||0;
      if(used>=2){signal('message','No quedan tuercas. Tendrás que usar la oscuridad o esconderte.');return false;}
      if(s.flags.kibaDecoyStep!==undefined&&s.steps-s.flags.kibaDecoyStep<7){signal('message','Aún oyes el eco de la última tuerca. Espera un poco.');return false;}
      const pos=decoyDestination(realMap(s),s.rx,s.ry,s.dir);
      if(!pos){signal('message','No hay espacio libre para lanzar la tuerca. Gira hacia el pasillo.');return false;}
      s.flags.kibaDecoy= {...pos,atStep:s.steps};s.flags.kibaDecoyStep=s.steps;s.flags.kibaDecoysUsed=used+1;
      s.hidden=false;signal('sound','decoy');
      signal('message',`Una tuerca rebota al fondo del pasillo. Te quedan ${2-s.flags.kibaDecoysUsed}. Si te ve, ignorará el ruido.`);
      return true;
    }
    function toggleLight(){s.light=!s.light;signal('message',s.light?'Linterna encendida.':'Linterna apagada.');signal('sound','light');}
    function tick(){
      if(s.eventTick>0)s.eventTick--;
      s.pulse++;
      // Mientras el jugador se esconde el mundo no se congela: a ritmo fijo,
      // independiente de FPS y sin convertir cada fotograma en un paso del monstruo.
      if(s.day===1&&s.mode==='real'&&s.chase&&!s.won&&s.pulse%9===0&&
         (s.hidden||s.flags.kibaFinaleStage===1||s.flags.kibaFinaleStage===2)){
        // El clímax no se congela al soltar el teclado; la IA respeta el mismo
        // modelo de percepción y colisión y avanza a una cadencia reproducible.
        entityStep();checkFinaleProgress();checkChaseBeat();return true;
      }
      return false;
    }
    function reset(){s=initial();events();signal('message','Comienza el Día 1. Busca una pista en el cartucho.');}
    function load(v){const x=normalize(v);if(!x)return false;s=x;events();signal('message','Partida restaurada.');return true;}
    function state(){return s;}
    return {state,move,interact,swap,toggleLight,toggleCrouch,throwDecoy,tick,reset,load,events,signal};
  }
  return {VERSION, REAL, RPG, REAL_2, RPG_2, REAL_3, RPG_3, REAL_4, RPG_4, REAL_5, RPG_5, REAL_6, RPG_6, REAL_7, RPG_7, DIRS, RPG_ITEMS, REAL_ITEMS, RPG_ITEMS_2, REAL_ITEMS_2, REAL_ITEMS_3, RPG_ITEMS_3, REAL_ITEMS_4, RPG_ITEMS_4, REAL_ITEMS_5, RPG_ITEMS_5, REAL_ITEMS_6, RPG_ITEMS_6, REAL_ITEMS_7, RPG_ITEMS_7, realMap, rpgMap, realItems, rpgItems, initial, normalize, bfs, wall, collision, distance, roomAt, objective, newGame};
})();
