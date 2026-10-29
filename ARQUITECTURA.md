# Arquitectura — NAMELESS 404 Premium v0.18

- **Motor y campaña:** `src/engine.ts` conserva el estado de los siete días y los tres finales; VERSION=13 para migrar guardados previos.
- **IA pura:** `src/premium/CopyistBrain.ts`, con detección visual prioritaria, investigación de pasos/superficies, investigación de señuelo y último recuerdo.
- **Sigilo puro:** `src/premium/KibaStealth.ts`, clasificación acústica, ruido de pisadas, destino de tuerca hasta cuatro casillas libres y saneamiento de marcadores.
- **Audio Día 1:** `src/premium/DayOneAudio.ts`; mezcla ambiental y sonidos procedurales activados únicamente por el usuario.
- **Arte Día 1:** `src/premium/DayOneArt.ts`, decoración 2.5D con oclusión y estado táctico dentro de la pantalla.
- **Gráficos:** `src/render.ts` Canvas2D, `src/gfx/RetroWebGL.ts` nativo, `src/three/ThreeRenderer.ts` opcional tras instalación npm.
- **UI y guardados:** `src/bootstrap.ts`; estado de controles, mando, autoguardado, importación/exportación JSON; `index.html` y `style.css`.
- **Entrega offline:** `scripts/build-offline.mjs` combina módulos ES compilados en `dist/bundle.js` para ejecutar sin dependencia externa.
- **Linux:** `INICIAR-LINUX.sh` inicia HTTP `127.0.0.1:8765` con Python 3; comandos `--check` y `--no-browser`.

Las reglas nuevas no se aplican a los Días 2–7. `engine.ts` continúa con `@ts-nocheck`: el motor requiere migración posterior a tipado TypeScript real. Documentar una compilación PASS no significa que ese archivo tenga comprobación de tipos completa.
