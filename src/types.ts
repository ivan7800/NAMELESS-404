/** Stable public contracts for the new TypeScript rendering and game layers.
 * The v0.8 procedural engine is being incrementally typed during migration.
 */
export type WorldMode='real'|'rpg';
export interface PuzzleState {
  note:boolean;seal:boolean;tape:boolean;key:boolean;mirror:boolean;call:boolean;photo:boolean;echo:boolean;
  d2Register:boolean;d2Bell:boolean;d2Frequency:boolean;d2Reflection:boolean;d2Door:boolean;
  d3Ticket:boolean;d3Clock:boolean;d3Schedule:boolean;d3Signal:boolean;d3Booth:boolean;
  d4File:boolean;d4Ledger:boolean;d4Xray:boolean;d4Fold:boolean;d4Reel:boolean;
  d5Sign:boolean;d5Address:boolean;d5Plot:boolean;d5Street:boolean;d5House:boolean;
  d6Label:boolean;d6Index:boolean;d6Furnace:boolean;d6Vent:boolean;d6Negative:boolean;
  d7Terminal:boolean;d7Portrait:boolean;d7Voice:boolean;d7Name:boolean;d7Original:boolean;
}
export interface GameState extends PuzzleState {
  version:number;day:1|2|3|4|5|6|7;mode:WorldMode;
  rx:number;ry:number;dir:0|1|2|3;px:number;py:number;
  light:boolean;hidden:boolean;entityX:number;entityY:number;threat:number;chase:boolean;
  encounter:number;steps:number;won:boolean;eventId:string;eventTick:number;
  scares:string[];journal:string[];scene:string;flags:Record<string,unknown>;
  pulse:number;room:string;endingStage:number;d7Choice:"none"|"keep"|"free"|"replace";endingId:"none"|"keep"|"free"|"replace";
}
export type GameEventKind='sound'|'message'|'journal'|'scene';
export interface GameEvent {kind:GameEventKind;message:string;title:string}
export interface GameInstance {
  state():GameState;
  move(key:string):boolean;
  interact():void;
  swap():void;
  toggleLight():void;
  toggleCrouch():boolean;
  throwDecoy():boolean;
  tick():boolean;
  reset():void;
  load(state:unknown):boolean;
  events():GameEvent[];
}
export interface SceneObject {id:string;x:number;y:number;r?:number}
export interface EngineAPI {
  VERSION:number;
  newGame():GameInstance;
  initial():GameState;
  normalize(v:unknown):GameState|null;
  realMap(s:GameState):string[];
  rpgMap(s:GameState):string[];
  realItems(s:GameState):SceneObject[];
  rpgItems(s:GameState):SceneObject[];
  wall(map:string[],x:number,y:number):boolean;
  objective(s:GameState):string;
  distance(x:number,y:number,x2:number,y2:number):number;
}
