# Mejoras gráficas — Super Bear Adventure (HTML5)

Este documento resume el trabajo de renderizado del archivo `index.html`.
El juego sigue siendo **un solo archivo sin dependencias**: se abre con doble
clic en cualquier navegador.

## Qué cambió

### Fondos con parallax por mundo
Cada mundo tiene varias capas que se desplazan a distinta velocidad:

| Mundo | Capas |
|---|---|
| Bosque | Cielo degradado, sol con halo, nubes lejanas y cercanas, dos crestas de colinas, dos líneas de pinos, arbustos en primer plano |
| Cueva | Degradado oscuro, arcos de pared profundos, racimos de cristales luminosos anclados al suelo, estalactitas, haces de luz, rocas en primer plano |
| Nieve | Cielo frío, cintas de aurora animadas, montañas con cumbres nevadas, dos líneas de pinos con nieve, ventisqueros |

Cada mundo tiene además su propio clima ambiental: hojas que caen (bosque),
partículas de polvo que flotan hacia arriba (cueva) y nevada (nieve).

### Velo atmosférico
Entre el fondo y la zona jugable se dibuja un velo translúcido del color del
cielo. Es lo que hace que las plataformas, los enemigos y el oso se lean
siempre como primer plano en vez de competir con los árboles.

### El oso
Redibujado por completo: cuerpo sombreado con degradado, panza clara, hocico,
nariz, boca, orejas con interior, bufanda roja que ondea, ojos con pupila y
brillo que parpadean solos, patas y brazos que se balancean con el ciclo de
caminata, estiramiento al saltar y aplastamiento al caer, sombra proyectada
en el suelo y aura de color según el power-up activo.

### Plataformas con textura
- **Bosque**: tierra con degradado y piedrecillas, capa de césped y briznas
  de hierba que se mecen.
- **Cueva**: roca agrietada, borde superior iluminado y musgo luminiscente
  que pulsa.
- **Nieve**: roca helada, capa de nieve con cresta ondulada y carámbanos
  colgando de las repisas finas.

### Enemigos
Cuerpos redondeados con cresta de púas, cejas de enfado, boca con dientes y
ojos que **siguen al jugador**. El perseguidor tiene su propio brillo rojo.
El jefe tiene corona, cuernos, capa que ondea, ojos que resplandecen, placa
pectoral con estrella y una barra de vida segmentada.

### Objetos
Monedas que giran en 3D (elipse que se estrecha), estrellas que rotan con
destello, y power-ups como orbes con degradado radial, anillo giratorio e
icono propio. La bandera de meta ondea a cuadros sobre una columna de luz
con chispas que suben.

### Efectos
Sistema de partículas y texto de puntuación flotante para saltos, aterrizajes,
polvo al correr, recogidas, pisotones y daño. Además hay sacudida de pantalla
y destello rojo al recibir un golpe.

### Interfaz
HUD nuevo con corazones dibujados, paneles redondeados, icono de moneda y
medidor de power-up. Todas las pantallas se rediseñaron: título animado con
brillo que barre, tarjetas de mundo con vista previa ilustrada, instrucciones
con los enemigos reales en vivo, pausa y game over.

## Lo que NO cambió

La lógica del juego es idéntica: física, colisiones, datos de los 9 niveles,
comportamiento de enemigos y jefe, puntuación y progresión entre mundos.

## Controles

| Acción | Teclas |
|---|---|
| Mover | `←` `→` o `A` `D` |
| Saltar | `Espacio`, `W` o `↑` |
| Doble salto | `Espacio` en el aire (con el power-up) |
| Derrotar enemigos | Caer encima |
| Pausa | `Esc` o `P` |
