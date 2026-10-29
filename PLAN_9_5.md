# Hoja de ruta actualizada — NAMELESS 404 después de v0.26

**Objetivo:** calidad profesional 9,5/10, aún **no alcanzada ni medida con playtests independientes**. La v0.26 priorizó una incidencia P0 de controles; no altera la campaña.

| Prioridad | Trabajo pendiente | Criterio verificable |
|---|---|---|
| **P0** | Validación física Linux Mint / Windows | WebGL2 y Three.js renderizando en GPU real; FPS, tiempos de cuadro e input medidos; recuperación de contexto gráfico |
| **P0** | Guardados persistentes | Guardar, cerrar/reabrir navegador y conservar progreso (7 días, 3 finales y datos de versiones anteriores) |
| **P0** | Test físico de entrada | Teclado y mando real sin dobles pulsaciones, bloqueos ni retardo perceptible; sesiones completas y no solo eventos sintéticos |
| **P1** | Arte 3D de Kiba | Mallas y siluetas elaboradas, materiales propios, habitaciones bien diferenciadas, decoración orgánica y composición visible en hardware real |
| **P1** | La Copista | Animaciones corporales naturales, fases de investigación, búsqueda y caza, y una cámara con puesta en escena consistente |
| **P1** | Diseño de sonido | Paisajes acústicos por lugar, muestras/efectos originales, mezcla, espacialización y tests con auriculares |
| **P1** | Remaster de los Días 2–7 | Geometría, audio y puzles propios por capítulo, no solo recoloraciones o variaciones del Día 1 |
| **P1** | Dirección de terror y ritmo | Sesiones completas: anticipación, escasez de sobresaltos, clímax y curvas de tensión medidas |
| **P2** | Accesibilidad y UX | Remapeo de controles, opciones de sensibilidad y ritmo, calibración de brillo, interfaz de mando/táctil legible |
| **P2** | Certificación | Cero bloqueos P0/P1, QA adversarial, 3 finales jugados de inicio a fin en Linux y Windows, revisión editorial |

**Siguiente fase recomendada v0.27:** validar hardware y FPS, optimizar el trazado Canvas2D si es necesario y llevar una habitación del Día 1 a calidad artística final; usarla como estándar antes de remasterizar el resto. No contar pruebas de lógica como evidencia de calidad gráfica ni terror efectivo.

---

## Actualización v0.25 — fase de personajes y superficies

La Copista dispone de 85 piezas compartidas con animación propia; los atajos de Kiba tienen compuertas visuales y 103 marcas de superficie reproducibles. Es un paso comprobable, **no un certificado de nota 9,5/10**.

**Próxima fase recomendada:** validación del renderizado físico en Linux Mint, mejor diseño de geometría y materiales, animación de puertas en el fallback, escenas 3D con arquitectura distinta por habitación y primera remasterización artística completa del Día 2. Antes de atribuir una nota comercial, realizar sesiones humanas con métricas de rendimiento, dificultad y tensión.

# Plan actualizado hacia el 9,5/10 — v0.22

**Estado:** la campaña estructural de siete días y tres finales sigue intacta. La v0.22 corrige el shader nativo y mejora la iluminación del Día 1, pero su aspecto 3D aún necesita validación real, arte de mayor calidad y testeo humano.

| Fase | Meta profesional | Criterio de aceptación |
|---|---|---|
| 0.22 — Robustez gráfica | Corregir GLSL, definir luces y diagnóstico | 155 tests, sin errores JS offline, panel con framebuffer en hardware real por verificar |
| 0.23 — Validación real | WebGL2/Three.js en Linux Mint y Windows | Capturas hardware, shaders compilados, 30 FPS estables mínimos medidos, contexto GPU recuperable |
| 0.24 — Terror cinematográfico | Enemigo con animaciones, sombra y señales visuales | Caza legible, 3 soluciones de sigilo probadas, sin frustración injustificada |
| 0.25 — Audio premium | Ambientación espacial por habitación y dinámica | Escucha con auriculares, control de volumen y accesibilidad |
| 0.26–0.31 — Remaster Días 2–7 | Niveles con identidad, duración y variedad | Cada capítulo con ruta opcional, puesta en escena singular y QA de progreso |
| 0.32 — Campaña completa | Corrección estructural, guardados, narrativa | 3 finales completables en sesión real, 0 bloqueos críticos |
| 1.0 RC — Certificación | Rendimiento, accesibilidad, playtesting | Sin fallos P0/P1, feedback humano y objetivos de calidad medidos |

La puntuación **9,5/10 es un objetivo**, no una nota acreditada. Priorizar una sesión completa con jugadores y dispositivos reales sobre aumentar artificialmente el número de pruebas.

---

# NAMELESS 404 — Hoja de ruta de producción hacia 9,5/10 (actualizada a v0.21)

Un 9,5/10 es **objetivo de calidad**, no puntuación alcanzada ni certificada. La campaña de siete días existe; la mejora premium se está concentrando en el Día 1, que será referencia de los seis capítulos siguientes.

## Criterios de aceptación

| Prioridad | Sistema | Criterio comprobable | Estado |
|---|---|---|---|
| P0 | Arranque Linux | HTML, JS y CSS sirven HTTP 200 | Cumplido en entorno de pruebas; falta equipo físico |
| P0 | Campaña y finales | 7 días + 3 finales sin regresiones | 52 pruebas de campaña, PASS |
| P0 | Guardados | Guardar, reiniciar navegador, reabrir partida sin pérdida | Pendiente de navegador físico |
| P0 | Three.js/WebGL2 | `npm install`, compilación y capturas GPU en Windows y Linux | Pendiente; falta `three` aquí |
| P1 | Día 1 / diseño | Cada pista influye exploración o estrategia de sigilo | Parcial: documentos, rutas, señuelos, escena final |
| P1 | Clímax del Día 1 | Dos rutas reales, fallo recuperable, sin teletransportes, IA activa | v0.20 implementado y probado |
| P1 | Terror | Escenas dirigidas con anticipación, no solo sustos aleatorios | Parcial, pendiente de playtesting |
| P1 | Sonido | Mezcla por capítulos, nivel de volumen verificable, opciones de accesibilidad | Parcial, falta test auditivo |
| P1 | IA | No saber posición a través de paredes; investigar ruido; cobertura ante esperas | Día 1 parcial con tests; pendientes playtests |
| P1 | Arte | Escenarios variados, señales claras, estética portátil consistente | Parcial, requiere producción gráfica real |
| P2 | UX | Indicadores accesibles y textos sin solaparse en PC/móvil | Verificado v0.20 Canvas 2D |
| P2 | Rendimiento | FPS sostenidos, carga/latencia, sin errores en hardware de destino | Pendiente de benchmark físico |
| P2 | Retención | Duración, misterio, progresión, revisitas, frustración | Pendiente de sesiones humanas |

## Fases siguientes

1. **v0.21 — Arquitectura de render (entregada parcialmente):** escena 3D compartida, shaders y diagnóstico local implementados. **GPU real y Three.js todavía pendientes**, requieren una máquina con dependencias y WebGL2 accesible.
2. **v0.22 — Prueba física GPU + arte y sonido Día 1:** materiales, animación, composición, efectos binaurales/espaciales moderados y opciones de mezcla; medir niveles reales.
3. **v0.23 — Playtest completo Día 1:** observar tiempo por puzle, errores de navegación, frustración, equilibrio de la Copista y tasa de finalización. Corregir con métricas y sesiones.
4. **v0.24–0.29 — Remasterización Días 2–7:** mapas, puzles, IA, arte y audio específicos de cada capítulo, evitando repetir patrones del Día 1.
5. **Candidata 1.0 — QA adversarial:** guardar/cargar, CPU/GPU, teclado, mando, móvil, accesibilidad, Linux y Windows; corregir regresiones con evidencia.

## Decisión editorial

No inflar notas por la cantidad de pruebas automatizadas. El terror depende de composición, sonido, ritmo y sorpresa; hay que medirlo en sesiones de juego reales. La v0.21 incorpora un sistema de decoración 3D y permite diagnosticar WebGL2; sin embargo, sigue siendo una vertical slice, no un juego 9,5/10 ya terminado.
