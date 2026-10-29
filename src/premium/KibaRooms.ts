/** NAMELESS 404 Premium 0.24 — eleven authored, original room-dressing families.
 * Everything is modeled as a small number of boxes. Rooms remain 100% traversable:
 * fixtures stay against existing walls or above head level. Both 3D backends
 * consume the exact same geometry. No proprietary game data or textures.
 */
import type {KibaColor,KibaProp} from './KibaVisuals.js';

export type WallSide='N'|'S'|'W'|'E';
export type FixtureKind='reception'|'notice'|'electrical'|'portrait'|'vending'|'archive'|'machine'|'generator'|'locker'|'exit'|'medicine';
export interface RoomFixture {
  readonly id:string; readonly kind:FixtureKind;
  readonly x:number;readonly z:number;readonly side:WallSide;
  readonly title:string;
}

export const KIBA_ROOM_FIXTURES:readonly RoomFixture[]=[
  {id:'reception',kind:'reception',x:2,z:1,side:'N',title:'Recepción cerrada'},
  {id:'evacuation',kind:'notice',x:4,z:1,side:'N',title:'Plano de evacuación adulterado'},
  {id:'fuse-box',kind:'electrical',x:5,z:2,side:'E',title:'Cuadro eléctrico'},
  {id:'missing-family',kind:'portrait',x:1,z:3,side:'W',title:'Retrato familiar borrado'},
  {id:'vending',kind:'vending',x:14,z:3,side:'E',title:'Máquina expendedora desconectada'},
  {id:'security',kind:'reception',x:12,z:1,side:'N',title:'Puesto de vigilancia'},
  {id:'archive-left',kind:'archive',x:1,z:8,side:'W',title:'Archivo 1988'},
  {id:'archive-right',kind:'archive',x:6,z:8,side:'E',title:'Archivadores de desaparecidos'},
  {id:'archive-torn',kind:'notice',x:3,z:9,side:'S',title:'Aviso de desaparición'},
  {id:'supply',kind:'locker',x:14,z:8,side:'E',title:'Armario de mantenimiento'},
  {id:'reel-station',kind:'machine',x:11,z:9,side:'N',title:'Equipo de cinta magnética'},
  {id:'generator',kind:'generator',x:14,z:11,side:'E',title:'Generador de sótano'},
  {id:'exit-sign',kind:'exit',x:8,z:12,side:'S',title:'Salida de emergencia anulada'},
  {id:'medicine',kind:'medicine',x:5,z:4,side:'W',title:'Botiquín abandonado'}
];

const KIBA_ROOM_COLORS={
  chassis:[.21,.27,.27], steel:[.35,.41,.39], black:[.065,.095,.105],
  dirtyWhite:[.66,.67,.56], brown:[.36,.27,.20], paper:[.75,.69,.54],
  green:[.31,.48,.39], caution:[.69,.47,.20], red:[.61,.18,.17],
  phosphor:[.57,.82,.66], glass:[.23,.39,.43], rust:[.49,.27,.18]
} as const satisfies Record<string,KibaColor>;

function validPlacement(map:readonly string[],f:RoomFixture):boolean{
  if(map[f.z]?.[f.x]==='#'||!map[f.z]?.[f.x])return false;
  const dx=f.side==='W'?-1:f.side==='E'?1:0;
  const dz=f.side==='N'?-1:f.side==='S'?1:0;
  return map[f.z+dz]?.[f.x+dx]==='#';
}
export function buildKibaRooms(map:readonly string[]):KibaProp[]{
  const props:KibaProp[]=[];
  for(const f of KIBA_ROOM_FIXTURES){
    if(!validPlacement(map,f))continue;
    // Local u: across wall, local v: depth into room, positive away from wall.
    // All ground fixtures stop before the tile centre, leaving walking room.
    const ns=f.side==='N'||f.side==='S';
    const baseX=f.x+.5,baseZ=f.z+.5;
    const put=(part:string,u:number,y:number,v:number,w:number,h:number,d:number,color:KibaColor,emissive=false)=>{
      const x=ns?baseX+u:(f.side==='W'?f.x+v:f.x+1-v);
      const z=ns?(f.side==='N'?f.z+v:f.z+1-v):baseZ+u;
      props.push({id:`room-${f.id}-${part}`,x,y,z,width:ns?w:d,height:h,depth:ns?d:w,color,emissive});
    };
    if(f.kind==='reception'){
      put('base',0,.43,.20,.84,.80,.28,KIBA_ROOM_COLORS.brown);
      put('front',0,.51,.37,.77,.52,.025,KIBA_ROOM_COLORS.steel);
      put('counter',0,.85,.25,.94,.08,.35,KIBA_ROOM_COLORS.dirtyWhite);
      put('screen',-.19,1.12,.15,.34,.39,.055,KIBA_ROOM_COLORS.black);
      put('crt-bezel',-.19,1.13,.115,.26,.27,.02,KIBA_ROOM_COLORS.chassis);
      put('crt-text',-.19,1.14,.098,.17,.035,.012,KIBA_ROOM_COLORS.phosphor,true);
      put('telephone',.26,.95,.26,.18,.13,.14,KIBA_ROOM_COLORS.black);
      put('telephone-light',.26,1.02,.19,.06,.025,.012,KIBA_ROOM_COLORS.red,true);
    }else if(f.kind==='notice'){
      put('cork',0,1.51,.048,.76,.64,.04,KIBA_ROOM_COLORS.brown);
      put('frame',0,1.83,.040,.82,.055,.058,KIBA_ROOM_COLORS.steel);
      put('paper-a',-.17,1.60,.085,.26,.36,.012,KIBA_ROOM_COLORS.paper);
      put('paper-b',.18,1.46,.089,.24,.40,.012,KIBA_ROOM_COLORS.dirtyWhite);
      put('redact',.17,1.53,.099,.15,.027,.012,KIBA_ROOM_COLORS.black);
      put('pin-a',-.16,1.76,.098,.027,.026,.013,KIBA_ROOM_COLORS.red);
      put('pin-b',.22,1.64,.101,.025,.022,.013,KIBA_ROOM_COLORS.red);
    }else if(f.kind==='electrical'){
      put('shell',0,1.36,.13,.62,1.03,.20,KIBA_ROOM_COLORS.chassis);
      put('door',0,1.36,.242,.54,.92,.02,KIBA_ROOM_COLORS.steel);
      for(let j=0;j<4;j++)put(`switch-${j}`,-.20+j*.13,1.32,.256,.055,.16,.025,j===2?KIBA_ROOM_COLORS.red:KIBA_ROOM_COLORS.black);
      put('warning',0,1.72,.257,.23,.10,.012,KIBA_ROOM_COLORS.caution);
      put('led',.18,1.06,.264,.045,.046,.012,KIBA_ROOM_COLORS.red,true);
    }else if(f.kind==='portrait'){
      put('frame',0,1.57,.065,.58,.71,.075,KIBA_ROOM_COLORS.brown);
      put('paper',0,1.58,.112,.46,.58,.016,KIBA_ROOM_COLORS.paper);
      put('smear',-.07,1.57,.124,.21,.47,.012,KIBA_ROOM_COLORS.black);
      put('figure',.17,1.41,.125,.10,.26,.011,KIBA_ROOM_COLORS.steel);
      put('cross',.16,1.70,.130,.10,.012,.014,KIBA_ROOM_COLORS.red);
    }else if(f.kind==='vending'){
      put('cabinet',0,.91,.18,.70,1.77,.31,KIBA_ROOM_COLORS.steel);
      put('panel',-.085,1.20,.352,.46,.95,.017,KIBA_ROOM_COLORS.black);
      for(let j=0;j<3;j++)put(`product-${j}`,-.24+j*.15,1.32,.368,.085,.27,.015,j===1?KIBA_ROOM_COLORS.red:KIBA_ROOM_COLORS.dirtyWhite);
      put('button',.265,.93,.363,.075,.25,.024,KIBA_ROOM_COLORS.caution);
      put('slot',0,.38,.358,.44,.11,.021,KIBA_ROOM_COLORS.black);
      put('toplight',0,1.75,.362,.49,.08,.018,KIBA_ROOM_COLORS.phosphor,true);
    }else if(f.kind==='archive'){
      put('cabinet',0,.95,.17,.71,1.88,.30,KIBA_ROOM_COLORS.steel);
      for(let j=0;j<4;j++){
        const y=.40+j*.35;
        put(`drawer-${j}`,0,y,.338,.62,.30,.018,KIBA_ROOM_COLORS.chassis);
        put(`label-${j}`,-.13,y+.035,.354,.20,.08,.012,KIBA_ROOM_COLORS.paper);
        put(`handle-${j}`,.20,y-.04,.355,.12,.026,.015,KIBA_ROOM_COLORS.black);
      }
      put('dust',0,1.91,.15,.70,.012,.30,KIBA_ROOM_COLORS.rust);
    }else if(f.kind==='machine'){
      put('table',0,.60,.24,.79,.12,.38,KIBA_ROOM_COLORS.brown);
      put('leg-a',-.30,.31,.12,.06,.55,.06,KIBA_ROOM_COLORS.steel);
      put('leg-b',.30,.31,.12,.06,.55,.06,KIBA_ROOM_COLORS.steel);
      put('deck',0,.81,.21,.63,.30,.28,KIBA_ROOM_COLORS.chassis);
      put('reel-left',-.18,.98,.12,.23,.20,.042,KIBA_ROOM_COLORS.paper);
      put('reel-right',.17,.98,.12,.23,.20,.042,KIBA_ROOM_COLORS.paper);
      put('reel-hub-left',-.18,.985,.094,.06,.065,.015,KIBA_ROOM_COLORS.black);
      put('reel-hub-right',.17,.985,.094,.06,.065,.015,KIBA_ROOM_COLORS.black);
      put('record-led',.30,.78,.373,.035,.035,.015,KIBA_ROOM_COLORS.red,true);
    }else if(f.kind==='generator'){
      put('housing',0,.71,.17,.79,1.38,.29,KIBA_ROOM_COLORS.chassis);
      put('grille',0,.83,.328,.65,.73,.025,KIBA_ROOM_COLORS.black);
      for(let j=0;j<5;j++)put(`rib-${j}`,0,.56+j*.12,.351,.65,.023,.015,KIBA_ROOM_COLORS.steel);
      put('control',.17,1.32,.336,.22,.14,.026,KIBA_ROOM_COLORS.dirtyWhite);
      put('alarm',.22,1.35,.354,.035,.045,.015,KIBA_ROOM_COLORS.caution,true);
      put('foot',0,.08,.18,.80,.13,.32,KIBA_ROOM_COLORS.rust);
    }else if(f.kind==='locker'){
      put('shell',0,.96,.15,.70,1.90,.29,KIBA_ROOM_COLORS.steel);
      put('door-a',-.175,.95,.309,.34,1.81,.017,KIBA_ROOM_COLORS.chassis);
      put('door-b',.175,.95,.309,.34,1.81,.017,KIBA_ROOM_COLORS.chassis);
      for(let j=0;j<3;j++){
        put(`louvre-a-${j}`,-.16,1.54-j*.075,.328,.16,.016,.012,KIBA_ROOM_COLORS.black);
        put(`louvre-b-${j}`,.18,1.54-j*.075,.328,.16,.016,.012,KIBA_ROOM_COLORS.black);
      }
      put('lock',.035,.91,.334,.045,.12,.015,KIBA_ROOM_COLORS.caution);
    }else if(f.kind==='exit'){
      put('housing',0,2.05,.055,.70,.20,.07,KIBA_ROOM_COLORS.chassis);
      put('screen',0,2.05,.10,.63,.14,.013,KIBA_ROOM_COLORS.green,true);
      put('arrow',.21,2.05,.113,.19,.035,.012,KIBA_ROOM_COLORS.dirtyWhite,true);
      put('fracture',-.18,2.06,.115,.03,.13,.014,KIBA_ROOM_COLORS.black);
    }else if(f.kind==='medicine'){
      put('shell',0,1.40,.10,.57,.71,.16,KIBA_ROOM_COLORS.dirtyWhite);
      put('door',0,1.40,.191,.50,.63,.017,KIBA_ROOM_COLORS.steel);
      put('cross-v',0,1.40,.210,.10,.35,.012,KIBA_ROOM_COLORS.red);
      put('cross-h',0,1.40,.213,.32,.11,.012,KIBA_ROOM_COLORS.red);
      put('lock',.20,1.28,.213,.035,.09,.015,KIBA_ROOM_COLORS.black);
    }
  }
  return props;
}

/** Low-cost room anchors for the Canvas 2D fallback. Avoids pretending that a
 * textured wall is a modelled 3D scene when WebGL2 is unavailable. */
export function getKibaRoomFixtures(map:readonly string[]):RoomFixture[]{
  return KIBA_ROOM_FIXTURES.filter(f=>validPlacement(map,f));
}
