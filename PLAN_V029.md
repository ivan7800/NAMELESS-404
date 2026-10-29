# Camino hacia una calidad 9,5/10 — después de v0.29

**La nota es una aspiración, no un resultado certificado.** Los tests automatizados avalan aspectos del funcionamiento, no el terror ni el acabado comercial.

| Fase | Entregable | Criterio de aceptación |
|---|---|---|
| P0 — Hardware | WebGL2 nativo y Three.js ejecutados en Linux Mint y Windows | FPS, errores de shaders, capturas reales por GPU y guardados después de reinicio |
| P1 — Arquitectura Kiba | Rediseño de los restantes espacios del Día 1 y navegación natural | Ningún muro visualmente falso, ningún prop que bloquee colisiones, recorrido completo |
| P2 — Cámara e interacción | Movimiento libre opcional, inspección y accesibilidad | Latencia medible, controles sin dobles acciones, cámara suave sin mareo |
| P3 — Enemigos y audio | Copista animada y audio con materiales grabados originales | Prueba de tensión con participantes; sin sustos repetitivos |
| P4 — Campaña | Arte, sonido y secuencias por día para Días 2–7 | Duración y variedad verificadas capítulo a capítulo |
| P5 — RC/1.0 | Perfil de rendimiento, guardados, accesibilidad y QA de publicación | Sin bloqueos P0/P1, sesiones completas y feedback de jugadores |

**Bloqueo principal actual:** falta verificación real de los renderizadores 3D, que condiciona la dirección artística. No interpretar la v0.29 como un remake visual del edificio entero.
