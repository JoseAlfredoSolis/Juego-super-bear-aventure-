# 🐻 Super Bear Adventure

Un juego de plataformas 2D estilo retro, creado en **C#** con **MonoGame**.

---

## 🎮 Características del juego

| Característica | Descripción |
|---|---|
| 🐻 **Jugador oso** | Movimiento izquierda/derecha y salto con física real |
| 🌍 **3 Mundos** | Bosque, Cueva y Nieve — cada uno con tema visual propio |
| 🗺️ **9 Niveles** | 3 niveles por mundo, el último con jefe final |
| 👾 **Enemigos** | Tipo Patrulla (va y viene) y Tipo Perseguidor (te sigue) |
| 👹 **Jefes finales** | Enemigo grande de 3 HP con fases de ataque (patrulla → cargar → descansar) |
| ⭐ **Coleccionables** | Monedas (50 pts) y Estrellas (200 pts) dispersas en los niveles |
| 🔮 **Power-ups** | Doble salto (cian), Velocidad (verde), Invencibilidad (dorado) |
| ❤️ **Vidas** | Sistema de 3 vidas; reapareces al morir |
| 🏆 **Puntuación** | Score, high score, contador de monedas |
| 📷 **Cámara** | Sigue al jugador suavemente (smooth follow) |
| ⏸️ **Pausa** | Menú de pausa con reanudar / reiniciar / salir |
| 💀 **Game Over** | Pantalla de fin con estadísticas y opción de reintentar |
| 🗺️ **Mapa de mundos** | Selección visual de nivel con progreso marcado |

---

## 🕹️ Controles

| Tecla | Acción |
|---|---|
| `←` / `A` | Mover izquierda |
| `→` / `D` | Mover derecha |
| `Space` / `↑` / `W` | Saltar (doble salto con power-up) |
| `Esc` | Pausar |
| `F4` | Salir del juego |
| `Enter` | Confirmar en menús |
| `↑↓` | Navegar menús |

### Combate
- **Pisotón**: Salta encima del enemigo para derrotarlo (+100 pts, +1000 pts jefe)
- **Contacto lateral**: Pierdes una vida

---

## 🛠️ Cómo compilar y ejecutar

### Requisitos
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [MonoGame templates](https://docs.monogame.net/articles/getting_started/1_setting_up_your_os.html) (para que el Content Pipeline compile la fuente)

### Pasos

```bash
# 1. Clona el repositorio
git clone https://github.com/JoseAlfredoSolis/Juego-super-bear-aventure-

# 2. Entra al proyecto
cd Juego-super-bear-aventure-/SuperBearAdventure

# 3. Instala las herramientas de MonoGame (solo la primera vez)
dotnet tool install -g dotnet-mgcb
dotnet tool install -g dotnet-mgcb-editor

# 4. Compila y ejecuta
dotnet run
```

---

## 📂 Estructura del proyecto

```
SuperBearAdventure/
├── Content/
│   └── Fonts/DefaultFont.spritefont   # Fuente del juego
├── Entities/
│   ├── Entity.cs      # Clase base con física AABB
│   ├── Player.cs      # Jugador: movimiento, salto, power-ups
│   ├── Enemy.cs       # Enemigo: patrulla / perseguidor
│   └── Boss.cs        # Jefe final: fases de ataque, barra de vida
├── World/
│   ├── Platform.cs    # Plataforma sólida
│   ├── Collectible.cs # Monedas y estrellas
│   ├── PowerUpItem.cs # Cajas de power-up
│   ├── GoalFlag.cs    # Bandera de fin de nivel
│   ├── LevelData.cs   # Datos de los 9 niveles (3 mundos × 3)
│   └── Level.cs       # Instancia activa del nivel + fondos
├── Scenes/
│   ├── MainMenuScene.cs   # Menú principal
│   ├── WorldMapScene.cs   # Selección de nivel
│   ├── GameplayScene.cs   # Juego principal + HUD
│   ├── PauseScene.cs      # Menú de pausa
│   └── GameOverScene.cs   # Pantalla de fin
├── Camera2D.cs        # Cámara con seguimiento suave
├── DrawHelper.cs      # Helpers de dibujo con rectángulos
├── GameManager.cs     # Estado global (vidas, score, progreso)
├── GameState.cs       # Enums del juego
├── Game1.cs           # Clase principal MonoGame
└── Program.cs         # Punto de entrada
```

---

## 🌍 Mundos

| # | Nombre | Colores | Enemigos | Jefe |
|---|---|---|---|---|
| 1 | 🌳 Bosque | Verde/Marrón | Naranja | Rojo oscuro |
| 2 | 🦇 Cueva | Gris oscuro/Azul | Violeta | Rojo oscuro |
| 3 | 🐧 Nieve | Blanco/Celeste | Azul acero | Rojo oscuro |

---

## 💡 Tecnología

- **Lenguaje**: C# 12 / .NET 8
- **Framework**: [MonoGame 3.8](https://monogame.net/) (DesktopGL)
- **Gráficos**: Renderizado procedural con rectángulos (sin sprites externos)
- **Física**: AABB en dos pasadas (X primero, luego Y)
