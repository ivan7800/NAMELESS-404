import assert from 'node:assert/strict';
import { ResponsiveInput, INPUT_FIRST_REPEAT_MS, INPUT_REPEAT_MS } from '../dist/src/premium/ResponsiveInput.js';
let count=0;
function test(name,fn){fn();count++;console.log('v0.26 PASS:',name);}
test('Primera pulsación inmediata',()=>{
 const c=new ResponsiveInput();assert.equal(c.press('kbd:ArrowRight','ArrowRight',1000),'ArrowRight');
 assert.equal(c.repeat(1000).length,0);
});
test('No se descartan teclas diferentes en menos de 68 ms',()=>{
 const c=new ResponsiveInput();assert.equal(c.press('kbd:ArrowLeft','ArrowLeft',1000),'ArrowLeft');
 assert.equal(c.press('kbd:ArrowUp','ArrowUp',1001),'ArrowUp');
});
test('Repetición del sistema no provoca movimientos extra',()=>{
 const c=new ResponsiveInput();c.press('kbd:ArrowRight','ArrowRight',0);
 assert.equal(c.press('kbd:ArrowRight','ArrowRight',55),null);
 assert.deepEqual(c.repeat(INPUT_FIRST_REPEAT_MS-1),[]);
});
test('Repetición inicial a los 185 ms',()=>{
 const c=new ResponsiveInput();c.press('pointer:right','ArrowRight',0);
 assert.deepEqual(c.repeat(INPUT_FIRST_REPEAT_MS),['ArrowRight']);
 assert.deepEqual(c.repeat(INPUT_FIRST_REPEAT_MS+INPUT_REPEAT_MS-1),[]);
 assert.deepEqual(c.repeat(INPUT_FIRST_REPEAT_MS+INPUT_REPEAT_MS),['ArrowRight']);
});
test('Las acciones de una sola pulsación nunca se repiten',()=>{
 const c=new ResponsiveInput();c.press('gamepad','interact',0);
 assert.deepEqual(c.repeat(9999),[]);
});
test('Liberar una dirección detiene inmediatamente las repeticiones',()=>{
 const c=new ResponsiveInput();c.press('pointer:right','ArrowRight',0);c.release('pointer:right');
 assert.deepEqual(c.repeat(10000),[]);
});
test('Cambiar de dirección mientras se mantiene el botón responde sin espera',()=>{
 const c=new ResponsiveInput();c.press('gamepad','ArrowUp',0);
 assert.equal(c.press('gamepad','ArrowLeft',25),'ArrowLeft');
 assert.deepEqual(c.repeat(185),[]);
 assert.deepEqual(c.repeat(210),['ArrowLeft']);
});
test('La tecla y el mando no comparten un bloqueo de 68 ms',()=>{
 const c=new ResponsiveInput();assert.equal(c.press('gamepad','ArrowRight',0),'ArrowRight');
 assert.equal(c.press('kbd:ArrowUp','ArrowUp',2),'ArrowUp');
});
test('Al perder foco se borran pulsaciones mantenidas',()=>{
 const c=new ResponsiveInput();c.press('kbd:ArrowUp','ArrowUp',0);c.clear();
 assert.equal(c.activeCount,0);assert.deepEqual(c.repeat(10000),[]);
});
test('Los FPS bajos no provocan ráfagas de movimientos acumulados',()=>{
 const c=new ResponsiveInput();c.press('gamepad','ArrowRight',0);
 assert.deepEqual(c.repeat(2000),['ArrowRight']);assert.deepEqual(c.repeat(2000),[]);
});
console.log(`v0.26: ${count} pruebas de planificador de entrada completadas.`);
