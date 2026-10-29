import { spawnSync } from 'node:child_process';
import { mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const base=join(dirname(fileURLToPath(import.meta.url)),'..');
const tsc=process.env.TSC||'tsc';
const result=spawnSync(tsc,['-p','tsconfig.json'],{cwd:base,stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
const dist=join(base,'dist');
for(const f of ['index.html','style.css'])copyFileSync(join(base,f),join(dist,f));
let source='/* NAMELESS 404: compilado desde TypeScript — WebGL2 nativo + fallback Canvas2D */\n(()=>{\n"use strict";\n';
const pieces=['premium/CopyistModel.js','premium/KibaDoors.js','premium/KibaSurfaces.js','premium/KibaVisuals.js','premium/KibaRooms.js','premium/KibaLighting.js','premium/GPUDiagnostics.js','premium/KibaArchitecture.js','premium/DayOneFinale.js','engine.js','premium/CopyistBrain.js','premium/KibaStealth.js','premium/DayOneStory.js','premium/DayOneArt.js','premium/DayOneAudio.js','premium/FastRaycaster.js','premium/AnalogMaterials.js','premium/KibaSetpieces.js','premium/KibaSignatureRoom.js','premium/KibaAtrium.js','premium/BookMode.js','premium/RetroRpg.js','premium/ResponsiveInput.js','premium/CinematicCamera.js','render.js','gfx/RetroWebGL.js','horror/HorrorDirector.js','bootstrap.js','main.js'];
for (const path of pieces){
  if(path==='render.js')source+='\nconst E=NamelessEngine;\n';
  if(path==='main.js')source+='\nconst R=NamelessRender;\n';
  let code=readFileSync(join(dist,'src',path),'utf8');
  code=code.replace(/^import\s+.*?;\s*$/gm,'')
    .replace(/^export const (\w+)/gm,'const $1')
    .replace(/^export class (\w+)/gm,'class $1')
    .replace(/^export function (\w+)/gm,'function $1')
    .replace(/^export \{.*?\};?\s*$/gm,'')
    .replace(/\n\/\/# sourceMappingURL=.*$/gm,'');
  if (/^\s*(?:import|export)\s/m.test(code))throw new Error('Módulo no combinado: '+path);
  source+='\n// '+path+'\n'+code+'\n';
}
source+='\n})();\n';
writeFileSync(join(dist,'bundle.js'),source);
const html=readFileSync(join(dist,'index.html'),'utf8').replace(/<script type="module" src="\.\/src\/main(?:-three)?(?:\.ts|\.js)"><\/script>/,'<script defer src="./bundle.js"></script>');
writeFileSync(join(dist,'index.html'),html);
mkdirSync(join(dist,'assets'),{recursive:true});
console.log('Compilación autónoma terminada en dist/ (también compatible con file://).');
