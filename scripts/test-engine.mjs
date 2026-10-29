import {spawnSync} from 'node:child_process';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
const base=join(dirname(fileURLToPath(import.meta.url)),'..');
const t=spawnSync(process.env.TSC||'tsc',['-p','tsconfig.tests.json'],{cwd:base,stdio:'inherit'});
if(t.status!==0)process.exit(t.status||1);
// package.json is module; Node will interpret .testbuild as CJS via its local package.
writeFileSync(join(base,'.testbuild','package.json'),'{"type":"commonjs"}');
for(const file of ['tests/engine.test.cjs','tests/v09.test.cjs','tests/day5.test.cjs','tests/day6.test.cjs','tests/day7.test.cjs']){
  const test=spawnSync('node',[file],{cwd:base,stdio:'inherit'});
  if(test.status!==0)process.exit(test.status||1);
}
const omens=spawnSync('node',['tests/omens.test.mjs'],{cwd:base,stdio:'inherit'});
if(omens.status!==0)process.exit(omens.status||1);
console.log('RESULTADO: 52 pruebas de lógica + 6 pruebas de presagios.');
