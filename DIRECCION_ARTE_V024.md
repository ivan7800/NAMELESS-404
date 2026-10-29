# Dirección de arte 0.24 — Edificio Kiba

## Objetivo

La v0.23 corrigió la orientación de doble pantalla, pero mostraba pasillos genéricos. En v0.24 cada zona principal tiene **objetos reconocibles** y motivos materiales propios. Este lenguaje visual se inspira en el terror japonés portátil de la década de 2000, sin copiar los recursos del juego comercial original.

## Lugares y piezas

| Punto | Diseño propio | Ubicación en mapa |
|---|---|---|
| Recepción | Mostrador, monitor CRT verdoso, teléfono y cajones | (2,1) |
| Evacuación | Corcho, dos documentos y tachaduras | (4,1) |
| Electricidad | Panel, interruptores y testigo rojo | (5,2) |
| Memoria | Retrato borrado y marco de madera | (1,3) |
| Servicios | Máquina expendedora desconectada | (14,3) |
| Vigilancia | Segundo mostrador con CRT | (12,1) |
| Archivos | Dos archivadores, fichas, tiradores y polvo | (1,8), (6,8) |
| Anuncio | Aviso alterado | (3,9) |
| Suministros | Armario metálico con lamas | (14,8) |
| Cinta | Mesa, magnetófono de bobina, testigo rojo | (11,9) |
| Sótano | Generador, ventilación y alarma | (14,11) |
| Evacuación final | Letrero de salida fracturado | (8,12) |
| Botiquín | Cruz pintada y cerradura | (5,4) |

## Implementación

`src/premium/KibaRooms.ts` valida que cada objeto esté en una casilla transitable adyacente a un muro; al retirar el muro, el objeto se omite. Las piezas ocupan una banda periférica de la casilla para evitar obstáculos visuales en el centro. La representación WebGL2/Three.js utiliza cajas originales combinadas; Canvas 2D dibuja un sprite de perspectiva por objeto y comprueba el rayo hasta la cámara para no mostrar objetos tras muros.

## Qué no se ha conseguido todavía

Son modelos de **baja complejidad (117 cajas)**, sin UV únicas, texturas pintadas a mano ni animación de objetos. Son mejores referencias espaciales, pero no constituyen un remake visual completo. La prueba Canvas 2D confirma la composición; la vía GPU real sigue pendiente.
