# Camino hacia la calidad excepcional — próximos hitos

**No se ha alcanzado todavía el 9,5/10.** La v0.31 resuelve un síntoma importante —saltos bruscos de cámara— pero no sustituye una reconstrucción gráfica de la campaña.

## P0 — Verificación en hardware

1. Ejecutar `npm install`, `npm run typecheck:three` y `npm run build` en entorno con dependencia `three` disponible.
2. Ejecutar WebGL2/Three.js en Firefox y Chromium sobre Linux Mint y Windows; comparar imágenes del mismo punto con Canvas 2D, compilar shaders y medir FPS, p95 y consumo de memoria.
3. Realizar sesiones de 20 minutos para comprobar inputs, streaming de audio, guardados persistentes y controladores físicos. Corregir bloqueos antes de más contenido.

## P1 — Dirección gráfica real

4. Sustituir los muros procedurales por habitaciones diseñadas completas con geometría, módulos arquitectónicos, PBR o pixel-texturas coherentes, iluminación y señales narrativas.
5. Introducir cámara con desplazamiento y colisión continuos por etapas (sin romper los puzles por casillas) y animaciones de La Copista con transiciones y poses de búsqueda/persecución.
6. Rediseñar el Día 1 con contraste dramático verificable, objeto interactivo reconocible, audio espacial, secuencias de terror dirigidas y el mismo nivel de detalle desde todos los ángulos.

## P2 — Campaña y acabado comercial

7. Remasterizar Días 2–7 para que tengan espacios, puzles y apariciones diferentes, evitando reutilizar el mismo corredor de Kiba.
8. Sustituir los ambientes procedurales por capas de sonido originales, mezcladas para altavoces y auriculares.
9. Hacer playtests con jugadores nuevos, medir errores y ritmo, corregir accesibilidad y entregar una matriz reproducible de aceptación; solo entonces calificar la calidad.

**Regla:** las capturas y pruebas estructurales no cuentan como validación de GPU ni como percepción subjetiva de terror.
