import {bootGame} from "./bootstrap.js";
import {ThreeRetro} from "./three/ThreeRenderer.js";
import {RetroWebGL} from "./gfx/RetroWebGL.js";
const Preferred={create:(w:number,h:number)=>ThreeRetro.create(w,h)??RetroWebGL.create(w,h)};
bootGame(Preferred);
