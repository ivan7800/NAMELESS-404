# Auditoría técnica — NAMELESS 404 v0.15 → Premium v0.16

**Fecha:** 29 de octubre de 2026. **Base real:** contenido de `NAMELESS-404-v0.15-LINUX-FIX.zip` (v0.15, incluidos servidor local Python y siete días). Revisión por lectura del código, compilación, pruebas reproducibles y Chromium headless. Una prueba verde no es evidencia de terror, satisfacción o de calidad comercial.

## Hallazgos comprobables

| ID | Severidad | Evidencia en el código original | Estado al entregar v0.16 |
|---|---|---|---|
| T-01 | P0 técnico | `src/engine.ts`, `src/render.ts`, `src/bootstrap.ts` empiezan con `// @ts-nocheck`; `tsc` no comprueba internamente esos módulos. | **Abierto.** Se añaden módulos estrictos, no se ha migrado el legado. |
| T-02 | P1 juego | `entityStep()` de v0.15 calcula BFS hasta `s.rx,s.ry` cada vez; la entidad conoce posición sin visión o ruido. | **Mejorado Día 1:** nueva percepción `CopyistBrain.ts`, fases hunt/investigate/search, memoria de última posición y trazado de visión. Días 2–7 conservados. |
| T-03 | P1 arte | `real()` y `createMap()` generan paredes y suelos mayormente repetitivos a partir de patrones de tile. | **Mejorado Día 1:** capas de decoración, señalética, retratos, ventanas, conductos, manchas y luminarias en Canvas 2D, WebGL2 y geometría Three.js preparada. Validación visual solo Canvas 2D. |
| T-04 | P1 audio | `bootstrap.ts` reproducía zumbidos, ruido continuo y tonos procedurales sin ambientación específica de Kiba. | **Mejorado Día 1:** `DayOneAudio.ts`, drones multicapas, ruido de ventilación, posición estéreo de amenaza, filtros y transiciones por estancia; inicialización solo tras pulsar Audio. Audición en auriculares físicos pendiente. |
| T-05 | P1 narrativa | `HorrorDirector.ts` usa presagios deterministas separados de las zonas y escenas escritas por el motor. | **Mejorado Día 1:** tres secuencias contextuales en vestíbulo, archivos y ala este, con diálogos únicos; se mantiene intacta la progresión. |
| T-06 | P1 contenido | Días 2–7 tienen el mismo sistema de turnos/alternancia y objetivos de objetos; capítulos compactos. | **Abierto.** No se han inflado capítulos ni convertido en niveles grandes. Será el núcleo de fases posteriores. |
| T-07 | P0 despliegue | La apertura `file://` puede restringir almacenamiento; v0.15-LINUX-FIX implementó servidor HTTP de bucle local. | **Conservado.** `INICIAR-LINUX.sh --check` y ensayo de HTTP en localhost. Persistencia de navegador sobre HTTP real sigue pendiente en este entorno. |
| T-08 | P0 gráfico | `three` y `vite` no están instalados; Three.js/WebGL2 GPU no se comprobaron en v0.15. | **Abierto.** Se compila el respaldo WebGL2 nativo, pero no se ha ejecutado `vite build` ni `typecheck:three`. Los nuevos adornos Three.js quedan sin prueba en GPU. |
| T-09 | P1 QA | Ausencia de playtests completos con usuarios ajenos al desarrollo, análisis real de FPS y accesibilidad asistida. | **Abierto.** Añadido protocolo de producción y criterios medibles en `PLAN_9_5.md`. |

## Cambios exactos de la vertical slice v0.16

**Lo modificado, no prometido:**

1. `src/premium/CopyistBrain.ts`: máquina de decisión pura, deterministicidad, visión, detección por ruido, rastro persistente; conectado únicamente a la IA de Día 1.
2. `src/engine.ts`: raycast simple de visibilidad sin atravesar paredes, pathfinding hacia objetivo percibido; escena del vestíbulo, escena del retrato de archivo y escena de la ventana; semilla del rastro al escuchar la cinta; saneamiento de memoria al importar partida.
3. `src/premium/DayOneArt.ts`: adornos con proyección de cámara y oclusión por mapa, señalética distintiva Kiba, retratos, ventanas, cañerías, polvo y cinta visual; renderizado tanto sobre Canvas 2D como sobre fotograma GPU.
4. `src/gfx/RetroWebGL.ts` y `src/three/ThreeRenderer.ts`: geometrías nuevas de Día 1 (conductos, charcos, luminarias, archivadores) sin tocar mapas ni colisiones. Código Three.js no ejecutado por falta de dependencias.
5. `src/premium/DayOneAudio.ts`: cuatro fuentes originales (tres osciladores y ruido) con master, filtros y estéreo; no se conecta a audio hasta clic explícito y se desconecta al apagar.
6. `src/bootstrap.ts`, `index.html`, `style.css`: integración de audio, telemetría visible del estado de La Copista, indicador Director's Cut y refinamiento visual de la consola.
7. `scripts/build-offline.mjs`: empaquetado autónomo de los tres módulos premium, sin dependencias de ejecución ni recursos externos.
8. `tests/premium-day1.test.mjs` y `tests/premium-browser.py`: pruebas específicas de IA, audio, oclusión, compatibilidad y navegador.

**Qué deliberadamente no se ha hecho:** rehacer todos los puzles, ampliar a horas la duración del Día 1, comprar/grabar sonido profesional, introducir modelos de personaje animados con esqueleto, rediseñar los días 2–7, declarar calidad 9,5/10.

## Reproducción

Desde la carpeta del proyecto, con Node.js, npm y `tsc` disponibles:

```sh
npm run typecheck
npm run test
npm run test:premium
npm run build:offline
node --check dist/bundle.js
./INICIAR-LINUX.sh --check
```

Para el navegador (requiere Python 3, Playwright y Chromium instalados):

```sh
python3 tests/browser016.py
python3 tests/premium-browser.py
```

El navegador del entorno de pruebas bloquea conexiones HTTP locales y WebGL; los tests Chromium usan memoria HTML y almacenamiento local simulado. No confundir con verificación de persistencia después de reiniciar Firefox/Chromium en Linux Mint.

## Riesgos importantes que aún impiden una puntuación alta

- IA está basada en percepción discreta de casillas/pasos; todavía no incluye animaciones de registrar armarios, escuchar tras puertas ni navegación con anticipación compleja.
- La decoración se basa en geometría estilizada original y elementos Canvas 2D; sigue lejos de una producción artística final con assets esculpidos.
- El audio multicapas es sintetizado, no equivalente a una biblioteca de Foley grabado y mezclado para auriculares.
- No hemos validado velocidad, accesibilidad, audio real, GPU o diez jugadores independientes.
- La lógica de los días 2–7 permanece exactamente como en v0.15; es deliberado para proteger la campaña mientras se define un estándar artístico.

**Veredicto:** vertical slice v0.16 funcional en los entornos probados y un paso real de calidad, no versión comercial ni certificado de 9,5/10.
