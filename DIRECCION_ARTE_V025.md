# Dirección artística — v0.25: La Copista renace

## Intención

El objetivo de esta fase es mejorar la identidad visual del antagonista con un diseño **original**, respetando la referencia formal de un juego japonés de terror para Nintendo DS, **sin extraer modelos, texturas, audio ni mapas de una obra comercial**.

## El personaje

- **Silueta:** vestido roto, mangas con diferencias de longitud, extremidades artificiales de aspecto desarticulado. La imagen debe leerse a 192×256 píxeles por pantalla.
- **Máscara:** mitad de papel sucio y mitad blanqueada, ojos desalineados, costura vertical, grietas y una línea roja mínima donde debería estar la boca. La cara se mueve mucho menos que las manos.
- **Animación:** oscilación lenta de la ropa, paso irregular y asincronía de brazos. Nada de parpadeos agresivos ni sustos basados únicamente en un fogonazo.
- **Rastro:** nueve tiras de papel y marcas de tinta detrás de la espalda. La criatura es una copia incompleta de personas olvidadas.

## Entorno

Los dos accesos desbloqueables del edificio Kiba ahora disponen de marcos físicos y hojas visualmente retráctiles. La decoración incorpora manchas y desperfectos consistentes, no parches aleatorios que cambien durante el juego.

## Estado de los renderizadores

- Canvas2D: presentación y lectura del nuevo personaje verificadas en navegador.
- WebGL2: geometría integrada y llamadas probadas bajo mock; sin prueba de shader real con GPU.
- Three.js: geometría compartida integrada; requiere instalar dependencias y validación gráfica externa.

## Objetivo pendiente

En las siguientes versiones, reemplazar más del mobiliario cúbico por geometría con contornos propios, reforzar el modelado de rostros y manos, integrar animaciones con estados claros y elevar el arte de los Días 2–7. No confundir aumento de piezas con calidad profesional garantizada.
