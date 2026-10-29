# NAMELESS 404 — Referencia artística y comparación (v0.23)

## Problema encontrado

En las versiones 0.1–0.22 se presentaban dos pantallas apiladas, con la escena 3D arriba y el menú de progreso debajo. Eso se aleja de la disposición de **Nanashi no Game** (Square Enix, 2008), que utiliza dos pantallas **en modo libro para una escena continua en primera persona**, mientras que el RPG maldito cambia a la disposición horizontal. El cambio no es puramente cosmético: afecta a la composición de planos, dirección de mirada, encuadres y tensión.

Fuentes de consulta públicas (sin reutilizar sus imágenes/recursos en el juego):
- https://www.mobygames.com/game/174634/nanashi-no-game/
- https://www.engadget.com/2008-04-25-a-closer-creepier-look-at-nanashi-no-game.html
- https://www.siliconera.com/surviving-nanashi-no-games-cursed-game/

## Cambios implementados en 0.23

1. **Modo libro real:** dos superficies de 192×256 forman un lienzo 384×256; se presenta en perspectiva horizontal continua dividida por una bisagra virtual. La escena usa los mismos mapas y coordenadas que el motor original NAMELESS.
2. **Modo RPG normal:** retorna a dos pantallas horizontales 256×192. El nuevo renderer `RetroRpg.ts` muestra un JRPG de 8 bits con hierba, piedras, tejados, caminos, personajes, objetos y corrupción visual gradual. Es arte procedural **original**, no sprites extraídos.
3. **Fallback enriquecido:** `BookMode.ts` hace raycasting 2D con materiales procedurales, juntas, variación de superficies, perspectiva, objetos del mundo, silueta de La Copista, sombras y ruido de película. Funciona sin GPU.
4. **WebGL2 nativo:** su framebuffer pasa a 384×256 y se divide entre las dos pantallas del modo libro; con GPU real usa la geometría 3D existente. El soporte Three.js no se declara verificado.
5. **Estado preservado:** `src/engine.ts` no ha cambiado respecto a v0.22. No se reescriben coordenadas, decisiones, puzles, datos de guardado ni IA.

## Qué NO está resuelto (importante)

- La iluminación 3D real, la calidad de modelos, materiales y siluetas **todavía son inferiores** a los fotogramas del juego de referencia.
- El movimiento de cámara sigue siendo por giros de 90°; falta mirada libre y desplazamiento orgánico, además de animaciones contextuales.
- Las habitaciones se basan en una cuadrícula: faltan modelos de arquitectura hechos a mano, objetos reconocibles a escala y decorados diferentes.
- El RPG ahora es más legible y vibrante, pero los mapas son todavía abstracciones de 16×13 celdas; falta pueblo con personalidad y NPC animados.
- El audio sigue siendo mayoritariamente sintetizado y no tiene todavía mezcla espacial de nivel comercial.
- El modo libro ha pasado pruebas en Chromium Canvas2D y con un contexto WebGL2 **simulado**, NO con GPU real ni con la variante Three.js.

## Prioridades visuales 0.24–0.27

- **0.24:** habitaciones reales diseñadas a mano, puertas modeladas, mobiliario, superficies y texturas originales de mayor resolución.
- **0.25:** animaciones y cámara 3D con giro continuo, mirada libre y movimiento natural.
- **0.26:** La Copista como personaje tridimensional animado (sin sprite plano), con animaciones de acecho, búsqueda y captura; sustos planificados por encuadre.
- **0.27:** reconstruir mundo RPG como ciudad viva de 8 bits, con personajes distintos, diálogo, zonas y corrupción narrativa; mezcla sonora por localización.

## Criterios de aceptación para un 9,5/10

- 30 FPS sostenidos mínimo en hardware objetivo verificado; pruebas en Windows y Linux con GPU real.
- Identificación a primera vista de cada habitación sin texto de HUD.
- Dos pantallas componen una escena continua sin discontinuidad espacial; la orientación cambia correctamente en móvil y escritorio.
- Controles de cámara, sigilo y persecución verificados mediante sesiones completas de juego humanas.
- Sin artefactos de clipping, texturas ilegibles ni luces sin fuente física.
- Juego independiente: no usa ROM, scripts, música, modelos, diálogos, imágenes ni texturas de Square Enix.

**Conclusión:** la v0.23 corrige el error estructural de presentación, no supone todavía una reconstrucción gráfica completa.
