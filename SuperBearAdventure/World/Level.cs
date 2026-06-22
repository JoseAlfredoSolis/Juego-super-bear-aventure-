using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using System.Collections.Generic;
using SuperBearAdventure.World;
using SuperBearAdventure.Entities;

namespace SuperBearAdventure.World
{
    /// <summary>
    /// A live level instance: builds platforms, enemies, collectibles, and power-ups
    /// from a <see cref="LevelData"/> snapshot.  Contains no game-logic – only state.
    /// </summary>
    public sealed class Level
    {
        // ── Geometry / theme ───────────────────────────────────────────────
        public int         Width  { get; }
        public int         Height { get; }
        public WorldTheme  Theme  { get; }
        public Vector2     PlayerStart { get; }
        public GoalFlag    Goal        { get; }

        // ── Objects ────────────────────────────────────────────────────────
        public List<Platform>    Platforms    { get; } = new();
        public List<Enemy>       Enemies      { get; } = new();
        public List<Collectible> Collectibles { get; } = new();
        public List<PowerUpItem> PowerUps     { get; } = new();

        // ── Background ─────────────────────────────────────────────────────
        public Color BackgroundColor { get; }
        public Color PlatformColor   { get; }

        private static readonly Dictionary<WorldTheme,(Color bg,Color plat,Color enemy)> _themeColors = new()
        {
            [WorldTheme.Forest] = (new Color(34,  85,  34),  new Color(101, 67,  33),  new Color(190,100, 20)),
            [WorldTheme.Cave]   = (new Color(18,  18,  40),  new Color(70,  70,  80),  new Color(120, 20, 160)),
            [WorldTheme.Snow]   = (new Color(160, 210, 235), new Color(200, 230, 255), new Color(70, 130, 180)),
        };

        public Level(int worldIndex, int levelIndex)
        {
            var data    = LevelData.Get(worldIndex, levelIndex);
            Width       = data.LevelWidth;
            Height      = data.LevelHeight;
            Theme       = data.Theme;
            PlayerStart = data.PlayerStart;
            Goal        = new GoalFlag(data.GoalPos);

            var (bg, plat, enemyCol) = _themeColors[Theme];
            BackgroundColor = bg;
            PlatformColor   = plat;

            // Platforms
            foreach (var pd in data.Platforms)
                Platforms.Add(new Platform(pd.X, pd.Y, pd.W, pd.H, plat));

            // Enemies
            foreach (var ed in data.Enemies)
            {
                Entity entity = ed.Type == EnemyType.Boss
                    ? new Boss(ed.Position, enemyCol)
                    : new Enemy(ed.Position, ed.Type, ed.PatrolRange, enemyCol);

                Enemies.Add((Enemy)entity);
            }

            // Collectibles
            foreach (var cd in data.Collectibles)
                Collectibles.Add(new Collectible(cd.Position, cd.Type));

            // Power-ups
            foreach (var pu in data.PowerUps)
                PowerUps.Add(new PowerUpItem(pu.Position, pu.Type));
        }

        // ── Draw background ────────────────────────────────────────────────

        public void DrawBackground(SpriteBatch sb, Vector2 camPos, int screenW, int screenH)
        {
            // Sky fill (one big rect; camera offset not applied – always covers screen)
            DrawHelper.DrawRect(sb, 0, 0, screenW, screenH, BackgroundColor);

            // World-specific decorations drawn in world-space (will scroll)
            switch (Theme)
            {
                case WorldTheme.Forest:
                    DrawForestBg(sb, camPos);
                    break;
                case WorldTheme.Cave:
                    DrawCaveBg(sb, camPos);
                    break;
                case WorldTheme.Snow:
                    DrawSnowBg(sb, camPos);
                    break;
            }
        }

        private void DrawForestBg(SpriteBatch sb, Vector2 cam)
        {
            // Simple trees every 200px
            for (int tx = 0; tx < Width; tx += 200)
            {
                int sx = tx - (int)cam.X;
                if (sx < -60 || sx > 1340) continue;
                // Trunk
                DrawHelper.DrawRect(sb, sx + 20, 480, 20, 160, new Color(80, 50, 20));
                // Canopy
                DrawHelper.DrawRect(sb, sx,      390,  60,  90, new Color(20, 100, 20));
                DrawHelper.DrawRect(sb, sx + 10, 350,  40,  60, new Color(10, 120, 10));
            }
        }

        private void DrawCaveBg(SpriteBatch sb, Vector2 cam)
        {
            // Stalactites hanging from ceiling every 160px
            for (int tx = 80; tx < Width; tx += 160)
            {
                int sx = tx - (int)cam.X;
                if (sx < -40 || sx > 1320) continue;
                int h = 30 + (tx % 3) * 20;
                DrawHelper.DrawRect(sb, sx, 0, 20, h, new Color(50, 50, 70));
            }
        }

        private void DrawSnowBg(SpriteBatch sb, Vector2 cam)
        {
            // Mountains in background every 300px
            for (int tx = 0; tx < Width; tx += 300)
            {
                int sx = tx - (int)cam.X;
                if (sx < -100 || sx > 1380) continue;
                // Mountain triangle approximated with rectangles
                for (int i = 0; i < 8; i++)
                    DrawHelper.DrawRect(sb, sx + i * 10, 400 + i * 30, 200 - i * 20, 30, new Color(220, 230, 240));
                // Snow cap
                DrawHelper.DrawRect(sb, sx + 40, 390, 80, 40, Color.White);
            }
        }
    }
}
