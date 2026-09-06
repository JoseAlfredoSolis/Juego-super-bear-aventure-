# Super Bear Adventure — versión HTML5

Juego completo en HTML5, **sin dependencias externas**: ni librerías, ni CDN, ni
servidor, ni conexión. Se abre con doble clic en cualquier navegador.

## Cómo jugarlo

Descarga el repositorio entero (botón verde **Code → Download ZIP**), descomprime
y haz doble clic en `index.html`. Los archivos `.js` tienen que estar junto al
`index.html`, en la carpeta `js/`.

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html` | Envoltorio HTML, estilos y las etiquetas `<script>` |
| `js/core.js` | Constantes, entrada, utilidades, datos de nivel, estado y cámara |
| `js/draw.js` | Primitivas de dibujo, partículas, clima, fondos y plataformas |
| `js/entities.js` | Física, roster jugable, enemigos, objetos y bandera de meta |
| `js/game.js` | Bucle de juego, progresión, renderizador 3D y HUD |
| `js/screens.js` | Todos los menús y pantallas completas |
| `js/main.js` | Arranque del canvas y bucle `requestAnimationFrame` |

Se cargan como scripts clásicos en ese orden y comparten ámbito global, así que
no hay sistema de módulos ni `import`: por eso funciona directamente desde
`file://` sin servidor.

## Contenido

- 5 personajes jugables con estadísticas propias
- 3 mundos × 3 niveles (el tercero de cada mundo es un jefe)
- Dos vistas intercambiables en caliente: **2D lateral** y **3D en perspectiva**
- 8 pantallas: menú, selección de personaje, instrucciones, opciones, mapa de
  mundos, juego, pausa, nivel superado y game over

## Personajes

| Personaje | Tipo | Velocidad | Salto | Planeo | Rasgo |
|---|---|---|---|---|---|
| BRUNO | Oso pardo | 100% | 100% | 100% | Equilibrado, sin puntos débiles |
| RARA | Zorra veloz | 120% | 96% | 100% | Corre un 20% más rápido |
| PANG | Panda fuerte | 88% | 118% | 100% | Salta un 18% más alto |
| KIRO | Gato ligero | 110% | 108% | 143% | Cae mucho más despacio |
| NIX | Pingüino | 94% | 102% | 100% | Doble salto sin power-up |

Los cinco se dibujan con la misma rutina (`drawChar`); cada entrada del roster
aporta paleta, forma de orejas, tipo de cola, accesorio y multiplicadores. Eso
mantiene la coherencia visual y hace trivial añadir uno nuevo.

## Las dos vistas

La simulación es **siempre 2D**: física, colisiones y datos de nivel no cambian.
El 3D es una segunda *vista* del mismo mundo.

- **2D** — vista lateral clásica con parallax multicapa.
- **3D** — proyección en perspectiva escrita a mano sobre Canvas 2D, sin
  librerías. Cada plataforma se extruye a caja y se dibujan solo sus caras
  visibles (superior, laterales y frontal, en ese orden); los personajes y
  objetos se dibujan como *billboards* con exactamente el mismo arte del 2D,
  escalado por su factor de perspectiva.

Se cambia con la tecla **V** en cualquier momento, o desde Opciones.

## Pantallas

| Pantalla | Qué trae |
|---|---|
| Menú | Título animado, personaje activo, insignia de vista, mejor puntuación |
| Selección de personaje | Cinco tarjetas con retrato animado y barras de estadísticas |
| Instrucciones | Controles, tabla de puntos, power-ups y enemigos reales en vivo |
| Opciones | Vista 2D/3D, partículas, sacudida, clima y contador de FPS |
| Mapa de mundos | Tarjetas con vista previa ilustrada de cada mundo y progreso |
| Juego | HUD con corazones, cronómetro, insignia de vista y ficha de personaje |
| Nivel superado | Tiempo, monedas, puntos, récord personal y confeti |
| Pausa / Game over | Menús con el mundo congelado detrás |

## Jugabilidad

Además de lo visual, el control tiene las comodidades estándar del género:

- **Coyote time** (0,11 s): saltar justo después de salirse de una repisa sigue
  contando como salto desde el suelo.
- **Buffer de salto** (0,12 s): pulsar salto un instante antes de aterrizar no
  se pierde, se ejecuta al tocar suelo.
- **Salto de altura variable**: soltar la tecla pronto corta la subida al 42%.
- **Puntos de control**: al morir reapareces en el último suelo firme que
  pisaste, no al principio del nivel.

## Gráficos

### Fondos con parallax por mundo

| Mundo | Capas |
|---|---|
| Bosque | Cielo degradado, sol con halo, nubes, dos crestas de colinas, dos líneas de pinos, arbustos |
| Cueva | Arcos de pared, cristales luminosos anclados al suelo, estalactitas, haces de luz |
| Nieve | Auroras animadas, montañas con cumbres nevadas, pinos nevados, ventisqueros |

Cada mundo tiene su clima: hojas que caen, motas de polvo o nevada.

### Velo atmosférico
Entre el fondo y la zona jugable se dibuja un velo translúcido del color del
cielo: es lo que hace que plataformas, enemigos y personaje se lean siempre
como primer plano en vez de competir con los árboles.

### Plataformas
- **Bosque**: tierra con piedrecillas, césped y briznas que se mecen.
- **Cueva**: roca agrietada, borde iluminado y musgo luminiscente que pulsa.
- **Nieve**: roca helada, cresta de nieve ondulada y carámbanos.

### Enemigos
Ojos que **siguen al jugador**, cejas de enfado y dientes. El jefe tiene corona,
cuernos, capa que ondea, ojos que resplandecen y barra de vida segmentada.

### Efectos
Partículas y texto de puntuación flotante para saltos, aterrizajes, polvo al
correr, recogidas, pisotones y daño; sacudida de pantalla y destello de daño.
Partículas, sacudida y clima se pueden desactivar en Opciones.

## Controles

| Acción | Teclas |
|---|---|
| Mover | `←` `→` o `A` `D` |
| Saltar | `Espacio`, `W` o `↑` |
| Doble salto | `Espacio` en el aire (NIX siempre; el resto con el power-up `2x`) |
| Derrotar enemigos | Caer encima |
| Cambiar vista 2D / 3D | `V` |
| Pausa | `Esc` o `P` |

## Lo que no cambia entre versiones

La lógica del juego es la misma que la del proyecto original en C# / MonoGame:
física, colisiones, datos de los 9 niveles, comportamiento de enemigos y jefe,
puntuación y progresión entre mundos.
