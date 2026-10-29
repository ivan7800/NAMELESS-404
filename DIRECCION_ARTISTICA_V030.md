# Dirección artística v0.30 — Vestíbulo Kiba

## Tesis

Un espacio cotidiano debe revelar su historia antes de que aparezca un enemigo. La nueva arquitectura distingue el vestíbulo del laberinto genérico mediante suelo de baldosa húmeda, techo con casetones, paneles de bronce desgastado y documentación administrativa inquietante.

## Escena materializada

- **15 casillas continuas (x=1…5, z=1…3)**, sujetas a la geometría real del mapa. No son un menú, un skybox ni un plano estático.
- **237 cuboides con dimensiones 3D**: pavimento, juntas, reparaciones, falso techo, luminarias, rodapiés, molduras y cuatro instalaciones de pared.
- **Directorio del edificio**: lugares prohibidos y una planta inexistente.
- **Reloj de la sala**: hora 04:04 congelada.
- **Centralita**: doce conectores y llamada sin origen.
- **Memorial**: registros anónimos y un nombre ausente.
- **Canvas 2D**: atlas de bitmaps originales, proyectados con ángulo, distancia y oclusión; diferencia de suelo en las casillas reales del atrio.
- **WebGL2 y Three.js**: reutilizan `buildKibaAtrium(map)` para generar las mismas posiciones y siluetas.

No se han extraído recursos ni texturas de Nanashi no Game. La inspiración es la presentación de terror japonés de Nintendo DS, no una reproducción de activos comerciales.

## Límites admitidos

La cámara sigue limitada a cuatro orientaciones, el nivel permanece dividido en casillas y muchos materiales son estilizados. Los objetos 3D no tienen texturas pintadas a mano ni animaciones esqueléticas; la compatibilidad GPU real está pendiente. La siguiente revisión debe validar el renderizado real y mejorar el arte antes de extenderlo a los Días 2–7.
