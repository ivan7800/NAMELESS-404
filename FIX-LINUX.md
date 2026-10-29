# NAMELESS 404 v0.15 — Corrección del lanzador Linux

**Problema:** el lanzador original abría el HTML mediante `xdg-open` sobre `file://`, sin validar si el navegador arrancaba o si el juego podía cargar los recursos. No se ha recibido el mensaje exacto de error de la sesión Linux Mint.

**Corrección:** servidor local Python 3 sobre `127.0.0.1:8765` y apertura automática del navegador cuando sea posible.

```bash
cd /ruta/a/NAMELESS-404-v0.15
chmod +x INICIAR-LINUX.sh
./INICIAR-LINUX.sh
```

Si el navegador no se abre automáticamente: `http://127.0.0.1:8765/`.

Verificación: `./INICIAR-LINUX.sh --check`. Depuración: `./INICIAR-LINUX.sh --no-browser`.

**Importante:** Mantén la terminal abierta. Ejecuta el script desde la carpeta del juego descomprimida, no desde el ZIP. Para detener el servidor: `Ctrl+C`. El puerto 8765 se mantiene estable para que el guardado del navegador sea consistente entre sesiones.

**Probado:** acceso HTTP real al HTML, JS y CSS desde el servidor; suite del motor 52/52 + 6/6. **No probado todavía:** doble clic en Linux Mint ni GPU física.
