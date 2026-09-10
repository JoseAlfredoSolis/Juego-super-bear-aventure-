# 🐻 Super Bear Adventure — Correr

Un juego de correr sin fin (endless runner) hecho con HTML5 Canvas y JavaScript puro,
sin dependencias. Controla a un oso que corre, salta y se agacha para esquivar
obstáculos. ¡Cuanto más lejos llegues, más rápido se vuelve!

## Jugar en la web

El juego **ya está publicado** en GitHub Pages:

**▶ https://josealfredosolis.github.io/Juego-super-bear-aventure-/runner/**

Se publica en el subdirectorio `/runner/` de la rama `gh-pages` para convivir con
el sitio ya existente en la raíz, sin sobrescribirlo. El workflow
`.github/workflows/deploy.yml` vuelve a publicar automáticamente ese subdirectorio
cada vez que se actualiza la rama `main` (usando `keep_files`, así el resto de la
rama `gh-pages` queda intacto). No hace falta cambiar ningún ajuste del repositorio.

## Alternativa: desplegar en Netlify

El repositorio incluye `netlify.toml` listo para usar (publica los archivos
estáticos y ejecuta los tests como *gate* del build). Netlify añade además
**previews automáticas por cada Pull Request**.

Para activarlo (una sola vez):

1. Crea una cuenta en [Netlify](https://www.netlify.com/) e inicia sesión.
2. **Add new site → Import an existing project → GitHub** y selecciona este repositorio.
3. Netlify detecta `netlify.toml` automáticamente (no hace falta configurar nada más).
4. Pulsa **Deploy**. Obtendrás una URL pública y una preview por cada PR.

## Jugar en local

Abre `index.html` en tu navegador, o sirve la carpeta con un servidor estático:

```bash
python3 -m http.server 8000
# luego abre http://localhost:8000
```

## Controles

| Acción       | Teclas                      |
| ------------ | --------------------------- |
| Saltar       | `Espacio` / `↑` / `W` / Clic |
| Doble salto  | Pulsa saltar de nuevo en el aire |
| Agacharse    | `↓` / `S` (mantener)        |

- Esquiva las rocas saltando.
- Esquiva los pájaros agachándote o saltando.
- Tu mejor distancia se guarda automáticamente en el navegador.

## Estructura

- `index.html` — estructura y menús del juego.
- `style.css` — estilos del lienzo, HUD y pantallas.
- `engine.js` — lógica pura del juego (física, colisiones, dificultad), reutilizable y testeable.
- `game.js` — capa del navegador (entrada, render en canvas, bucle de juego).
- `test/engine.test.js` — tests automatizados de la lógica del juego.

## Tests

La lógica pura del juego vive en `engine.js` y se prueba con el runner integrado de
Node (sin dependencias externas):

```bash
npm test
# o directamente:
node --test
```
