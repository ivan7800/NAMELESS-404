> **Nota v0.17:** para la QA de la versión actual consulte `QA_V017.md`. Lo siguiente es información histórica de la fase anterior.

# Auditoría técnica — NAMELESS 404 v0.15

**Criterio:** separar funciones implementadas, comprobaciones ejecutadas y limitaciones. Un test de código no certifica que el videojuego dé miedo ni que esté listo para publicarse.

## Comprobaciones ejecutadas

| Caso | Resultado | Reproducción |
|---|---|---|
| Compilación autónoma con `tsc` | PASS | `npm run typecheck` |
| Compilación offline y sintaxis | PASS | `npm run build:offline && node --check dist/bundle.js` |
| Regresión narrativa, colisiones, puzles y finales de los Días 1–7 | **52/52 PASS** | `npm test` |
| Director de presagios (no modifica juego, solo movimiento real, cooldown, perseguido/oculto/final, toggle y expiración, variedad de siete días) | **6/6 PASS** | `node tests/omens.test.mjs` tras compilar |
| Chromium escritorio y móvil emulado (regresión de controles, guardados, mando simulado, modo inmersivo) | PASS ambos | `python3 tests/browser015.py` |
| Chromium escritorio y móvil emulado (movimiento real, presagios, overlay, desactivación) | PASS ambos | `python3 tests/omens-browser.py` |
| Integridad del ZIP | PASS | `unzip -t NAMELESS-404-v0.15.zip` |

## Cambios reales verificados

- `HorrorDirector.ts` es un módulo TypeScript estricto con selección determinista dependiente de pasos/posición/capítulo, separación mínima de ocho pasos entre activaciones y limitación durante persecuciones intensas.
- Funciona como **capa de presentación**: no añade claves al estado ni cambia banderas narrativas, colisiones, amenazas o resultados de los tres finales.
- Efectos sutiles de reflejo, puerta imposible, pisadas, respiración y película dañada en `render.ts`. Compatibles con los dos motores gráficos porque se dibujan en Canvas tras obtener el fotograma 3D.
- La Copista dispone de detalles adicionales de máscara, costuras y movimientos asimétricos en los tres renderizadores (código incorporado). Los renderizadores GPU **no están visualmente verificados**.
- Sonidos ambientales opcionales por presagio, sintetizados con Web Audio; no contienen archivos externos y no reproducen audio si el jugador no lo activa.
- Botón de control «Presagios: sí/no» y estado visible para desactivarlos sin bloquear la campaña.

## Límites y riesgos todavía abiertos

- La política de Chromium bloquea `localhost` y los orígenes de archivos. Las pruebas de navegador se hicieron cargando los archivos en memoria; se simuló `localStorage` cuando fue necesario. **La persistencia real de guardados tras recarga HTTP queda pendiente.**
- Chromium no ofreció un contexto WebGL2 en este entorno. Solo se vio el respaldo Canvas 2D. **La ejecución real de Three.js/WebGL2, sus nuevos detalles geométricos, FPS y gestión de contextos siguen pendientes de prueba en Windows/Linux con GPU.**
- No se instalaron dependencias de npm externas: `typecheck:three` y `vite build` no se ejecutaron aquí. La integración Three.js es código preparado, no una compilación verificada en esta sesión.
- Audio en auriculares reales, mandos físicos, Safari/iPhone y lectores de pantalla: sin validar.
- No se realizó un playtest humano integral ni una auditoría de duración/ritmo. La campaña tiene siete capítulos compactos y precisa desarrollo artístico adicional antes de una versión comercial.
- El código legado `engine.ts`, `render.ts` y `bootstrap.ts` sigue con `@ts-nocheck` (migración TS incompleta).

## Prioridades antes de 1.0

**P0:** ejecutar en servidor HTTP real y guardar/recargar/importar; validar `npm install`, `npm run typecheck:three`, `npm run build` con GPU real. **P1:** grabar test de rendimiento, identificar repeticiones entre capítulos, rediseñar encuentros y grabar audio original de alta calidad. **P2:** accesibilidad, controles físicos y migración gradual del código sin tipo.

**Conclusión:** v0.15 pasa las pruebas ejecutadas, pero aún no justifica calificación de 9,5/10 ni lanzamiento 1.0.

## Revisión del lanzador Linux (29-10-2026)

- Se sustituyó `xdg-open dist/index.html` por un servidor HTTP local basado en Python 3 y enlace `http://127.0.0.1:8765/`.
- `sh` pasa la validación sintáctica (`bash -n`).
- `./INICIAR-LINUX.sh --check` verifica la presencia de `dist/index.html`, `dist/bundle.js` y `dist/style.css`: **PASS**.
- Prueba automatizada de un proceso real `./INICIAR-LINUX.sh --no-browser` con puerto de prueba aislado: `GET /`, `GET /bundle.js`, `GET /style.css`: **HTTP 200** y contenido comprobado.
- `node scripts/test-engine.mjs`: **52/52 de lógica y 6/6 de presagios**.
- Pendientes de verificación: apertura automática del navegador en sesión gráfica Linux Mint, interacción manual y rendimiento del renderer WebGL2 en GPU física.
