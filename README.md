# NAMELESS 404 Premium v0.31 — Cinematic Camera

Juego web original de terror psicológico inspirado en la presentación de Nintendo DS. Conserva los **siete días, tres finales**, RPG maldito de 8 bits, modo libro de dos pantallas, escena del edificio Kiba, sigilo y persecuciones. Incluye código TypeScript y pruebas reproducibles.

## Iniciar en Linux Mint

Descomprime el ZIP completo. Abre una terminal en `NAMELESS-404-PREMIUM-v0.31` y ejecuta:

```sh
chmod +x INICIAR-LINUX.sh
./INICIAR-LINUX.sh
```

Si el navegador no se abre automáticamente, visita `http://127.0.0.1:8765/`. Mantén la terminal abierta. Puedes verificar el paquete con `./INICIAR-LINUX.sh --check` y cerrar el juego con `Ctrl+C`. No necesitas instalar Node ni npm para jugar. El servidor escucha solo en tu ordenador y desactiva cachés de JavaScript; no borra las partidas.

## Novedades de cámara

- Al girar o caminar, la vista **se mueve suavemente**; el personaje sigue utilizando las casillas y la lógica originales.
- **Arrastra el ratón o el dedo sobre una pantalla del modo libro** para mirar alrededor (±39° horizontal, ±14° vertical). Mirar no cambia las coordenadas, no modifica las interacciones y no altera el guardado.
- Nuevos botones **Mirar ◀ / Mirar ▶ / Centrar vista**. La opción **Cámara: clásica** vuelve al giro visual instantáneo. La preferencia del sistema de movimiento reducido elimina el suavizado.
- Una cámara visual común alimenta Canvas 2D, WebGL2 nativo y el código Three.js. El aspecto de los dos últimos **no se ha validado en hardware físico**.
- Se mantiene el control inmediato de la v0.26, el sigilo con `C`, las tuercas con `V`, la interacción con `E`, el cambio de mundo con `X` y el guardado con `G`.

## Probar código y navegador

Con Node/TypeScript disponibles:

```sh
npm run test:all
npm run build:offline
node --check dist/bundle.js
python3 tests/camera-browser031.py
```

La prueba de Chromium requiere Playwright y Chromium. Para la edición con Three.js se necesita descargar las dependencias npm y ejecutar `npm run typecheck:three` y `npm run dev`. `dist/index.html` está compilado y funciona sin esos pasos.

Consulta `QA_V031.md` y `PLAN_V031.md` para resultados, limitaciones y próximos hitos hacia el 9,5/10. Este paquete no incluye recursos copiados de juegos comerciales.