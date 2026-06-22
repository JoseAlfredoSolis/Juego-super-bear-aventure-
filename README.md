# 🐻 Super Bear Adventure — Correr

Un juego de correr sin fin (endless runner) hecho con HTML5 Canvas y JavaScript puro,
sin dependencias. Controla a un oso que corre, salta y se agacha para esquivar
obstáculos. ¡Cuanto más lejos llegues, más rápido se vuelve!

## Cómo jugar

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
