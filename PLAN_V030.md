# Plan de producción — NAMELESS 404 hacia 9,5/10

## Fase inmediata — Verificar hardware y control

1. Probar `Diagnóstico gráfico` en Linux Mint, recoger motor activo, shader/píxel, información del controlador (si está disponible localmente) y capturas reales. Comprobar el servidor en `127.0.0.1:8765`.
2. Ejecutar `npm install && npm run typecheck:three && npm run build` y corregir errores reales de Three.js; comparar ambos renderizadores y Canvas 2D con el mismo estado de juego.
3. Medir percentiles de frametime en movimiento, persecución y cambios de mundo. Meta inicial: presentación estable a 30 FPS en hardware de referencia, sin picos perceptibles; definir presupuesto de draw calls y materiales.
4. Probar control de teclado, pantalla táctil y mando físico, así como guardado/recuperación tras recargar.

## Escenarios y arte

5. Pasar del nuevo vestíbulo a recepción, archivos, ala este y sótano con arquitectura autoral diferente; evitar paredes idénticas y duplicar objetos decorativos.
6. Texturas originales con UV, variedad de materiales, carteles y desgaste, optimizadas para resolución Nintendo DS.
7. Modelado/rig y animaciones de La Copista en persecución, búsqueda, respiración y transiciones; corregir silueta y clipping en ambas orientaciones.

## Campaña

8. Aplicar estándares visuales a Días 2–7, uno a uno, sin alterar las historias y los tres finales salvo revisión narrativa justificada.
9. Mezcla y sonido espacial original, tensión dirigida y silencios; prueba con auriculares y accesibilidad.
10. Pruebas humanas de sesión completa, telemetría únicamente local y voluntaria; evaluación por apartado sin inflar notas.

**Objetivo 9,5/10 = criterio de aceptación aspiracional, no calificación actual.**
