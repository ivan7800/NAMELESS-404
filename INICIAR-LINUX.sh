#!/usr/bin/env sh
# NAMELESS 404 - lanzador Linux sin npm ni dependencias externas.
# Arranca dist/ en http://127.0.0.1:8765 para mantener estables los guardados.
set -eu
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

if ! command -v python3 >/dev/null 2>&1; then
  printf '%s\n' 'ERROR: Python 3 no está instalado.' 'En Linux Mint: sudo apt update && sudo apt install python3' >&2
  exit 1
fi

exec python3 -u - "$DIR" "$@" <<'PY'
import functools
import http.server
import os
import pathlib
import shutil
import socket
import subprocess
import sys

root = pathlib.Path(sys.argv[1]).resolve()
args = set(sys.argv[2:])
if '--help' in args or '-h' in args:
    print('Uso: ./INICIAR-LINUX.sh [--check] [--no-browser]')
    print('Opcional: NAMELESS_PORT=8765 (puerto local estable).')
    sys.exit(0)
unknown = args - {'--check', '--no-browser'}
if unknown:
    print('ERROR: Argumento desconocido:', ', '.join(sorted(unknown)), file=sys.stderr)
    sys.exit(2)

site = root / 'dist'
necessary = ('index.html', 'bundle.js', 'style.css')
missing = [name for name in necessary if not (site / name).is_file()]
if missing:
    print('ERROR: Faltan archivos del juego: ' + ', '.join('dist/' + x for x in missing), file=sys.stderr)
    print('Extrae TODO el ZIP de NAMELESS 404, conserva la carpeta dist y sitúa', file=sys.stderr)
    print('INICIAR-LINUX.sh en la carpeta principal del juego.', file=sys.stderr)
    sys.exit(1)

try:
    port = int(os.environ.get('NAMELESS_PORT', '8765'))
    if not 1024 <= port <= 65535:
        raise ValueError()
except ValueError:
    print('ERROR: NAMELESS_PORT debe ser un número entre 1024 y 65535.', file=sys.stderr)
    sys.exit(2)

if '--check' in args:
    print('OK: Python 3, dist/index.html, dist/bundle.js y dist/style.css disponibles.')
    print('Ruta:', site)
    print('Puerto configurado:', port)
    sys.exit(0)

class GameHandler(http.server.SimpleHTTPRequestHandler):
    # Al actualizar el juego, impedir que Chromium/Firefox reutilicen el JS anterior.
    # No borra los datos del usuario (partidas en localStorage).
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        self.send_header('X-Nameless-Version', '0.31.0')
        super().end_headers()

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(site), **kw)

    def log_message(self, fmt, *a):
        # Mensajes HTTP de fallo solamente, para evitar ruido en la terminal.
        if a and str(a[1]).startswith(('4', '5')):
            super().log_message(fmt, *a)

class LocalServer(http.server.ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True

try:
    server = LocalServer(('127.0.0.1', port), GameHandler)
except OSError as e:
    print(f'ERROR: No puedo iniciar el servidor en 127.0.0.1:{port}: {e}', file=sys.stderr)
    print('Puede que el puerto esté ocupado. Cierra la instancia anterior o usa:', file=sys.stderr)
    print('  NAMELESS_PORT=8766 ./INICIAR-LINUX.sh', file=sys.stderr)
    print('AVISO: cambiar de puerto cambia el origen del navegador y los guardados locales.', file=sys.stderr)
    sys.exit(1)

url = f'http://127.0.0.1:{port}/'
print('NAMELESS 404 v0.31 — servidor de juego iniciado')
print('Carpeta:', site)
print('Dirección:', url)
print('Deja esta terminal abierta mientras juegas; pulsa Ctrl+C para salir.')
print('Los datos no salen de tu equipo: el servidor solo escucha en 127.0.0.1.')

if '--no-browser' not in args and os.environ.get('NAMELESS_NO_BROWSER') != '1':
    browsers = []
    if shutil.which('xdg-open'):
        browsers.append(['xdg-open', url])
    for browser in ('firefox', 'chromium', 'chromium-browser', 'google-chrome', 'brave-browser'):
        if shutil.which(browser):
            browsers.append([browser, url])
    opened = False
    for command in browsers:
        try:
            child = subprocess.Popen(command, stdin=subprocess.DEVNULL,
                                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                                     start_new_session=True)
            try:
                result = child.wait(timeout=2)
                if result == 0:
                    opened = True
                    break
            except subprocess.TimeoutExpired:
                opened = True
                break
        except OSError:
            pass
    if not opened:
        print('No se pudo abrir el navegador automáticamente.', file=sys.stderr)
        print('Abre esta dirección en Firefox, Chrome o Chromium: ' + url, file=sys.stderr)

try:
    server.serve_forever(poll_interval=0.2)
except KeyboardInterrupt:
    print('\nNAMELESS 404 — servidor detenido.')
finally:
    server.server_close()
PY
