# QA comprobable — NAMELESS 404 Premium Integral v0.17

**Fecha:** 29 de octubre de 2026. **Alcance:** build offline, lógica de siete días, IA, nueva exploración opcional del Día 1, interfaz Canvas 2D y servidor Linux.

## Resultados ejecutados

| Verificación | Comando / método | Resultado |
|---|---|---|
| Motor TypeScript autónomo | `npm run typecheck` | PASS |
| Compilado offline | `npm run build:offline`; `node --check dist/bundle.js` | PASS |
| Días 1–7 y tres finales, regresión original | `npm run test` | 52/52 PASS |
| Director de presagios | incluido en `npm run test` | 6/6 PASS |
| Día 1 premium, IA, arte y sonido, cuatro pistas, recorridos, testimonio | `npm run test:premium` | 22/22 PASS |
| Interfaz y guardado simulado en Chromium | `python3 tests/browser017.py` | PC y móvil emulado PASS |
| Escena de documento y activación/desactivación de audio en Chromium | `python3 tests/day1-premium-browser.py` | PC y móvil emulado PASS |
| Comprobador Linux | `./INICIAR-LINUX.sh --check` | PASS |
| Servidor HTTP real de Linux | GET `/`, `/bundle.js` y `/style.css` en puerto local alternativo | 200/200/200 PASS |
| Material Three.js | error de sintaxis corregido; `npm run typecheck:three` | INCOMPLETO: módulo `three` ausente |

**Total automatizado de lógica: 80/80** (52 + 6 + 22). El número de tests no equivale a calidad artística ni a validación de Three.js.

## Limitaciones y deuda técnica

1. `engine.ts`, `render.ts` y `bootstrap.ts` siguen usando `// @ts-nocheck`. La verificación TypeScript es parcial y no debe presentarse como prueba estricta del motor completo.
2. Chromium de este entorno bloquea el origen HTTP local; las pruebas visuales se hacen con HTML/CSS/JS insertados en memoria. La prueba de servidor HTTP se ejecutó separadamente con Python. Las pruebas de guardado de navegador se basan en almacenamiento **simulado**; no prueban la supervivencia tras cerrar/reabrir un navegador real.
3. La prueba de Three.js solo alcanzó la ausencia de la dependencia `three`; el error sintáctico encontrado en la v0.16 se ha corregido, pero **no se puede certificar** su compilación, GPU, reflejos o FPS.
4. Los efectos Web Audio se han verificado funcionalmente (activación y parada, sin errores JS) en Chromium, pero no existe evaluación auditiva en auriculares ni mezcla profesional certificada.
5. Sin medición reproducible del rendimiento real de GPU, sin test de Linux Mint/Windows físicos, sin lectores de pantalla y sin playtests ciegos. La dificultad, duración y tensión real siguen sin poder calificarse 9,5/10.
6. Las pistas son descubrimientos narrativos y el testimonio secreto es una pequeña recompensa, no una ampliación completa del diseño de puzles. Días 2–7 no se han remasterizado en esta entrega.

## Pruebas manuales recomendadas

- Linux Mint: ejecutar lanzador, entrar en Día 1, guardar, cerrar terminal, reiniciar en el **mismo puerto**, comprobar recuperación y exportar JSON.
- Explorar cada documento sin seguir el objetivo principal, alternar con RPG y encontrar los cuatro; hablar con el Niño de Tiza y verificar escena opcional.
- Activar cinta 04, vigilar si la IA pierde visión detrás de un muro y comprobar que esconderse da tiempo para escapar. Jugar con linterna apagada y con presagios desactivados.
- Terminar el Día 1 siguiendo sus seis objetivos y entrar en Día 2; repetir guardado/importación. Completar Días 2–7 y verificar los tres finales.
- Si se instalan dependencias: `npm run typecheck:three` y `npm run dev`. Anotar consola, FPS y capturas de WebGL2/Three.js antes de considerarlo aprobado.

**Conclusión técnica:** la v0.17 amplía y prueba la experiencia del Día 1 sin romper la lógica de la campaña conocida. No alcanza todavía estándar de videojuego terminado 1.0.
