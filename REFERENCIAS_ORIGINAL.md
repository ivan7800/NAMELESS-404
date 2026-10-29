# NAMELESS 404 — investigación visual basada en Nanashi no Game (2008)

Investigación de páginas públicas y materiales de referencia para crear **gráficos propios**. No se han incluido ROM, sprites, modelos, texturas, música, voces ni fotogramas descargados del juego comercial. La comparación `assets/v028-comparativa-misma-camara.png` usa exclusivamente nuestras versiones 0.27 y 0.28.

## Fuentes públicas consultadas (29 octubre 2026)

1. **MobyGames — Nanashi no Game**, https://www.mobygames.com/game/174634/nanashi-no-game/ : confirma mundo real 3D en formato libro (dos pantallas) y RPG clásico 8 bits horizontal; puzles, amenazas y siete días.
2. **Siliconera — Surviving Nanashi no Game**, https://www.siliconera.com/surviving-nanashi-no-games-cursed-game/ : narrativa entre mundo real y RPG y falsos fallos de píxeles incorporados a la experiencia.
3. **Engadget — A closer, creepier look**, https://www.engadget.com/2008-04-25-a-closer-creepier-look-at-nanashi-no-game.html : pantalla 3D en modo libro, primera persona y uso de sonido espacial.
4. **GAME Watch Japón — Nanashi no Game: Me**, https://game.watch.impress.co.jp/docs/review/319702.html : ambientes de baja resolución con texturas, efectos de distorsión, daño progresivo de escenarios y audio direccional.
5. **3DJuegos — Impresiones jugables (2008)**, https://www.3djuegos.com/juegos/nanashi-no-game/noticias/nanashi-no-game-impresiones-jugables-080804-857 : pasillos con muchas puertas, terror ambiental y encuentros marcados por efectos sonoros.
6. **Longplays.org — Longplay**, https://longplays.org/infusions/longplays/longplays.php?cat_id=17&longplay_id=13325 : segmentación de duración aproximada de 4 h 50 m, utilizada como referencia de ritmo y progresión, no como un archivo de recursos.

## Matriz de comparación

| Rasgo observado en las referencias | Estado antes, v0.27 | Intervención v0.28 | Pendiente |
| --- | --- | --- | --- |
| Dos pantallas con perspectiva continua | Sí | Conservado | Camara libre con apuntado vertical |
| RPG 8 bits con glitches intencionados | Sí, original | Conservado | Animaciones más numerosas y escenas propias |
| Muros viejos con materiales distintivos | Principalmente ruido y rectángulos | **5 materiales bitmap originales 128×192**, proyectados por rayos | Artistas: atlas hechos a mano, PBR y normal maps |
| Puertas y elementos arquitectónicos reconocibles | Básico | Puerta metálica con visor, placa y herrajes originales | Aperturas de todas las puertas visibles |
| Luz y niebla volumétrica convincente | Simulación simple | Shader nativo mejorado, luz y distancia combinadas en Canvas | Validar en GPU física; iluminación en tiempo real |
| Soundstage con objetos fuera de campo | Sistema de sonido básico | Sin cambios | Foley original y mezcla espacial con auriculares |
| Personajes | Modelo geométrico de La Copista | Conservado | Rig esquelético, animaciones dirigidas |
| Exploración con vistas diegéticas | 7 capítulos | Conservados | Niveles propios enriquecidos en días 2–7 |

## Pauta artística propia

*Construir una obra original visualmente fiel al género y a la técnica, no una copia de recursos*. El color dominante de Kiba es verde oxidado, grafito y marfil manchado; detalles cálidos en papel y madera; encuadres con perspectiva fuerte y oscuridad fuera del haz de luz. Cada escenario posterior debe contar con atlas, objetos, sonidos y composición específicos.
