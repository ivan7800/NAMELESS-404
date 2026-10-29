# Publicación de NAMELESS 404 en GitHub Pages

- Repositorio: https://github.com/ivan7800/NAMELESS-404
- Compilado estático: `docs/index.html`, `docs/bundle.js`, `docs/style.css` (copia de `dist/`).
- Abre **Settings → Pages → Build and deployment → Source: GitHub Actions** para activar la publicación automática mediante `.github/workflows/publish.yml`.
- En caso de no poder usar Actions, selecciona **Deploy from a branch → main → /docs** y guarda.
- La URL esperada una vez que GitHub confirme el despliegue es https://ivan7800.github.io/NAMELESS-404/ . Esta dirección no se considera activa hasta verificarla.
- Para desarrollar localmente: `npm install && npm run dev`. Para generar la versión estática: `npm run build:offline`.
- Para probar: `npm run test:all`. El directorio `docs/` se actualiza copiando los tres ficheros compilados de `dist/`.
- No publicar partidas personales ni credenciales.
