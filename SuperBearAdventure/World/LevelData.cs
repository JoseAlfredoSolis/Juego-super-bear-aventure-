using Microsoft.Xna.Framework;
using System.Collections.Generic;

namespace SuperBearAdventure.World
{
    // ── Data-only records ──────────────────────────────────────────────────

    public sealed record EnemyDef(Vector2 Position, EnemyType Type, float PatrolRange = 160f);
    public sealed record CollectibleDef(Vector2 Position, CollectibleType Type);
    public sealed record PowerUpDef(Vector2 Position, PowerUpType Type);

    /// <summary>
    /// All static data that describes one level: dimensions, platforms,
    /// enemies, collectibles, power-ups, goal position, and visual theme.
    /// </summary>
    public sealed class LevelData
    {
        public int           LevelWidth   { get; init; }
        public int           LevelHeight  { get; init; }
        public WorldTheme    Theme        { get; init; }
        public Vector2       PlayerStart  { get; init; }
        public Vector2       GoalPos      { get; init; }

        public List<PlatformDef>    Platforms    { get; init; } = new();
        public List<EnemyDef>       Enemies      { get; init; } = new();
        public List<CollectibleDef> Collectibles { get; init; } = new();
        public List<PowerUpDef>     PowerUps     { get; init; } = new();

        // ── Factory ───────────────────────────────────────────────────────

        /// <summary>Returns the level data for world (0-based) and level (0-based).</summary>
        public static LevelData Get(int world, int level)
        {
            return (world, level) switch
            {
                (0, 0) => Forest1(),
                (0, 1) => Forest2(),
                (0, 2) => Forest3(),
                (1, 0) => Cave1(),
                (1, 1) => Cave2(),
                (1, 2) => Cave3(),
                (2, 0) => Snow1(),
                (2, 1) => Snow2(),
                (2, 2) => Snow3(),
                _      => Forest1()
            };
        }

        // ====================================================================
        //  WORLD 1 – FOREST
        // ====================================================================

        private static LevelData Forest1() => new()
        {
            LevelWidth  = 3600,
            LevelHeight = 720,
            Theme       = WorldTheme.Forest,
            PlayerStart = new Vector2(80, 570),
            GoalPos     = new Vector2(3460, 555),
            Platforms = new List<PlatformDef>
            {
                // Ground segments (gaps create pits)
                P(0,   640, 900,  80),
                P(980, 640, 720,  80),
                P(1800,640, 700,  80),
                P(2600,640, 1000, 80),

                // Elevated platforms
                P(200, 530, 130, 18),
                P(420, 470, 110, 18),
                P(600, 530, 140, 18),
                P(850, 490, 100, 18),
                P(1050,520, 130, 18),
                P(1220,460, 110, 18),
                P(1400,510, 140, 18),
                P(1600,470, 120, 18),
                P(1850,530, 130, 18),
                P(2050,470, 110, 18),
                P(2250,510, 140, 18),
                P(2450,460, 100, 18),
                P(2650,520, 140, 18),
                P(2860,470, 130, 18),
                P(3100,510, 160, 18),
                P(3300,460, 140, 18),
            },
            Enemies = new List<EnemyDef>
            {
                new(new Vector2(320,  608), EnemyType.Patrol, 140),
                new(new Vector2(700,  608), EnemyType.Patrol, 120),
                new(new Vector2(1100, 608), EnemyType.Patrol, 150),
                new(new Vector2(1500, 608), EnemyType.Chaser,  180),
                new(new Vector2(1900, 608), EnemyType.Patrol, 130),
                new(new Vector2(2300, 608), EnemyType.Chaser,  200),
                new(new Vector2(2700, 608), EnemyType.Patrol, 140),
            },
            Collectibles = Coins(
                (180,502),(280,502),(380,502),
                (460,442),(540,442),(640,502),
                (900,460),(1000,490),
                (1260,432),(1450,480),
                (1860,500),(2060,440),(2260,480),
                (2680,490),(2880,440),(3120,480),(3320,430)
            ),
            PowerUps = new List<PowerUpDef>
            {
                new(new Vector2(620, 440), PowerUpType.DoubleJump),
                new(new Vector2(2260,440), PowerUpType.Speed),
            }
        };

        private static LevelData Forest2() => new()
        {
            LevelWidth  = 3600,
            LevelHeight = 720,
            Theme       = WorldTheme.Forest,
            PlayerStart = new Vector2(80, 570),
            GoalPos     = new Vector2(3460, 555),
            Platforms = new List<PlatformDef>
            {
                P(0,   640, 700,  80),
                P(800, 640, 500,  80),
                P(1400,640, 400,  80),
                P(1900,640, 500,  80),
                P(2500,640, 600,  80),
                P(3200,640, 400,  80),

                P(150, 520, 120, 18),
                P(340, 460, 110, 18),
                P(520, 510, 140, 18),
                P(760, 480, 100, 18),
                P(950, 530, 130, 18),
                P(1100,460, 140, 18),
                P(1310,500, 110, 18),
                P(1480,450, 140, 18),
                P(1680,510, 130, 18),
                P(1950,470, 120, 18),
                P(2150,420, 140, 18),
                P(2360,470, 110, 18),
                P(2560,510, 150, 18),
                P(2780,460, 130, 18),
                P(2980,500, 150, 18),
                P(3220,450, 140, 18),
            },
            Enemies = new List<EnemyDef>
            {
                new(new Vector2(250,  608), EnemyType.Patrol, 120),
                new(new Vector2(500,  608), EnemyType.Chaser,  160),
                new(new Vector2(850,  608), EnemyType.Patrol, 120),
                new(new Vector2(1100, 608), EnemyType.Chaser,  180),
                new(new Vector2(1450, 608), EnemyType.Patrol, 140),
                new(new Vector2(1600, 608), EnemyType.Chaser,  200),
                new(new Vector2(2000, 608), EnemyType.Patrol, 160),
                new(new Vector2(2400, 608), EnemyType.Chaser,  180),
                new(new Vector2(2700, 608), EnemyType.Patrol, 140),
                new(new Vector2(3050, 608), EnemyType.Chaser,  160),
            },
            Collectibles = Coins(
                (170,492),(260,492),(440,432),(560,482),
                (800,450),(1000,500),(1150,432),(1380,470),
                (1520,420),(1700,480),(1980,440),(2180,390),
                (2400,440),(2600,480),(2820,430),(3020,470),(3260,420)
            ),
            PowerUps = new List<PowerUpDef>
            {
                new(new Vector2(530, 472), PowerUpType.Invincibility),
                new(new Vector2(2160,386), PowerUpType.Speed),
            }
        };

        private static LevelData Forest3() => new()
        {
            LevelWidth  = 3800,
            LevelHeight = 720,
            Theme       = WorldTheme.Forest,
            PlayerStart = new Vector2(80, 570),
            GoalPos     = new Vector2(3660, 555),
            Platforms = new List<PlatformDef>
            {
                P(0,   640, 600, 80),
                P(700, 640, 400, 80),
                P(1200,640, 300, 80),
                P(1600,640, 500, 80),
                P(2200,640, 300, 80),
                P(2600,640, 500, 80),
                P(3200,640, 600, 80),

                P(100, 520, 110, 18),
                P(280, 460, 130, 18),
                P(460, 510, 120, 18),
                P(660, 475, 100, 18),
                P(830, 510, 130, 18),
                P(1010,455, 110, 18),
                P(1180,505, 140, 18),
                P(1360,455, 120, 18),
                P(1560,510, 110, 18),
                P(1740,460, 140, 18),
                P(1950,505, 130, 18),
                P(2160,455, 120, 18),
                P(2340,505, 140, 18),
                P(2560,455, 130, 18),
                P(2760,510, 130, 18),
                P(2980,455, 120, 18),
                P(3180,505, 150, 18),
                P(3380,455, 140, 18),
                P(3560,505, 100, 18),
                // Boss arena platform
                P(3150,630, 600, 10),
            },
            Enemies = new List<EnemyDef>
            {
                new(new Vector2(200,  608), EnemyType.Patrol, 120),
                new(new Vector2(450,  608), EnemyType.Chaser,  180),
                new(new Vector2(780,  608), EnemyType.Patrol, 140),
                new(new Vector2(1100, 608), EnemyType.Chaser,  200),
                new(new Vector2(1400, 608), EnemyType.Patrol, 160),
                new(new Vector2(1700, 608), EnemyType.Chaser,  200),
                new(new Vector2(2000, 608), EnemyType.Patrol, 150),
                new(new Vector2(2300, 608), EnemyType.Chaser,  200),
                // Boss
                new(new Vector2(3420, 560), EnemyType.Boss,    300),
            },
            Collectibles = Coins(
                (120,492),(300,432),(480,482),(700,445),
                (860,480),(1050,425),(1220,475),(1400,425),
                (1600,480),(1770,430),(1980,475),(2200,425),
                (2380,475),(2590,425),(2800,480),(3020,425),
                (3220,475),(3400,425)
            ),
            PowerUps = new List<PowerUpDef>
            {
                new(new Vector2(460, 472), PowerUpType.DoubleJump),
                new(new Vector2(2160,418), PowerUpType.Invincibility),
                new(new Vector2(3000,416), PowerUpType.Speed),
            }
        };

        // ====================================================================
        //  WORLD 2 – CAVE
        // ====================================================================

        private static LevelData Cave1() => new()
        {
            LevelWidth  = 3600,
            LevelHeight = 720,
            Theme       = WorldTheme.Cave,
            PlayerStart = new Vector2(80, 570),
            GoalPos     = new Vector2(3460, 555),
            Platforms = new List<PlatformDef>
            {
                P(0,   640, 800, 80),
                P(900, 640, 600, 80),
                P(1600,640, 700, 80),
                P(2400,640, 1200,80),

                // Stalactite-style platforms (hanging from ceiling concept)
                P(150, 520, 130, 18),
                P(350, 440, 110, 18),
                P(550, 500, 140, 18),
                P(780, 460, 100, 18),
                P(980, 510, 130, 18),
                P(1170,450, 120, 18),
                P(1380,500, 140, 18),
                P(1580,460, 120, 18),
                P(1800,510, 130, 18),
                P(2020,450, 110, 18),
                P(2220,500, 140, 18),
                P(2440,455, 120, 18),
                P(2650,500, 130, 18),
                P(2880,450, 140, 18),
                P(3100,500, 150, 18),
                P(3320,450, 140, 18),

                // Ceiling decorations (not collidable in gameplay, just visual — 
                // but we make them collidable as obstacles)
                P(300, 100, 120, 30),
                P(700, 80,  100, 30),
                P(1200,110, 130, 30),
                P(1900,90,  110, 30),
                P(2600,100, 120, 30),
                P(3100,85,  140, 30),
            },
            Enemies = new List<EnemyDef>
            {
                // Bat-style chasers (fast, use Chaser type)
                new(new Vector2(300,  608), EnemyType.Chaser, 200),
                new(new Vector2(600,  608), EnemyType.Patrol, 130),
                new(new Vector2(1000, 608), EnemyType.Chaser, 220),
                new(new Vector2(1300, 608), EnemyType.Patrol, 140),
                new(new Vector2(1650, 608), EnemyType.Chaser, 200),
                new(new Vector2(1950, 608), EnemyType.Patrol, 160),
                new(new Vector2(2500, 608), EnemyType.Chaser, 220),
                new(new Vector2(2800, 608), EnemyType.Patrol, 150),
                new(new Vector2(3200, 608), EnemyType.Chaser, 200),
            },
            Collectibles = Coins(
                (170,492),(280,492),(380,412),(570,472),
                (810,432),(1010,480),(1190,420),(1420,470),
                (1610,430),(1830,480),(2050,420),(2260,470),
                (2470,425),(2680,470),(2900,420),(3130,470),(3340,420)
            ),
            PowerUps = new List<PowerUpDef>
            {
                new(new Vector2(560, 462), PowerUpType.Speed),
                new(new Vector2(2250,462), PowerUpType.DoubleJump),
            }
        };

        private static LevelData Cave2() => new()
        {
            LevelWidth  = 3600,
            LevelHeight = 720,
            Theme       = WorldTheme.Cave,
            PlayerStart = new Vector2(80, 570),
            GoalPos     = new Vector2(3460, 555),
            Platforms = new List<PlatformDef>
            {
                P(0,   640, 600, 80),
                P(700, 640, 400, 80),
                P(1200,640, 500, 80),
                P(1800,640, 300, 80),
                P(2200,640, 600, 80),
                P(2900,640, 700, 80),

                P(120, 510, 130, 18),
                P(300, 440, 110, 18),
                P(490, 500, 140, 18),
                P(700, 460, 110, 18),
                P(880, 510, 130, 18),
                P(1070,450, 120, 18),
                P(1260,500, 140, 18),
                P(1450,450, 120, 18),
                P(1640,500, 130, 18),
                P(1830,450, 120, 18),
                P(2010,390, 140, 18),
                P(2210,450, 130, 18),
                P(2420,500, 130, 18),
                P(2630,450, 120, 18),
                P(2840,500, 130, 18),
                P(3060,440, 140, 18),
                P(3270,500, 140, 18),
            },
            Enemies = new List<EnemyDef>
            {
                new(new Vector2(200,  608), EnemyType.Chaser, 200),
                new(new Vector2(500,  608), EnemyType.Patrol, 140),
                new(new Vector2(760,  608), EnemyType.Chaser, 220),
                new(new Vector2(1100, 608), EnemyType.Patrol, 160),
                new(new Vector2(1350, 608), EnemyType.Chaser, 200),
                new(new Vector2(1640, 608), EnemyType.Patrol, 150),
                new(new Vector2(1860, 608), EnemyType.Chaser, 220),
                new(new Vector2(2250, 608), EnemyType.Patrol, 160),
                new(new Vector2(2500, 608), EnemyType.Chaser, 200),
                new(new Vector2(2900, 608), EnemyType.Patrol, 150),
                new(new Vector2(3150, 608), EnemyType.Chaser, 200),
            },
            Collectibles = Coins(
                (140,482),(220,482),(320,412),(510,472),
                (720,432),(900,480),(1090,420),(1280,470),
                (1470,420),(1660,470),(1850,420),(2030,362),
                (2230,420),(2440,470),(2650,420),(2860,470),
                (3080,410),(3290,470)
            ),
            PowerUps = new List<PowerUpDef>
            {
                new(new Vector2(490, 462), PowerUpType.Invincibility),
                new(new Vector2(2010,352), PowerUpType.Speed),
            }
        };

        private static LevelData Cave3() => new()
        {
            LevelWidth  = 3800,
            LevelHeight = 720,
            Theme       = WorldTheme.Cave,
            PlayerStart = new Vector2(80, 570),
            GoalPos     = new Vector2(3660, 555),
            Platforms = new List<PlatformDef>
            {
                P(0,   640, 500, 80),
                P(600, 640, 400, 80),
                P(1100,640, 300, 80),
                P(1500,640, 400, 80),
                P(2000,640, 300, 80),
                P(2400,640, 400, 80),
                P(2900,640, 900, 80),

                P(100, 510, 120, 18),
                P(280, 450, 110, 18),
                P(460, 510, 130, 18),
                P(640, 465, 110, 18),
                P(820, 510, 130, 18),
                P(1000,450, 120, 18),
                P(1180,505, 140, 18),
                P(1370,455, 120, 18),
                P(1560,505, 130, 18),
                P(1750,455, 120, 18),
                P(1940,505, 140, 18),
                P(2130,455, 120, 18),
                P(2320,505, 130, 18),
                P(2510,455, 120, 18),
                P(2700,505, 130, 18),
                P(2950,455, 140, 18),
                P(3170,505, 150, 18),
                P(3380,455, 140, 18),
                P(3580,505, 100, 18),
                // Boss arena
                P(3100,630, 700, 10),
            },
            Enemies = new List<EnemyDef>
            {
                new(new Vector2(200,  608), EnemyType.Patrol, 130),
                new(new Vector2(400,  608), EnemyType.Chaser, 200),
                new(new Vector2(680,  608), EnemyType.Patrol, 140),
                new(new Vector2(900,  608), EnemyType.Chaser, 220),
                new(new Vector2(1180, 608), EnemyType.Patrol, 130),
                new(new Vector2(1400, 608), EnemyType.Chaser, 200),
                new(new Vector2(1680, 608), EnemyType.Patrol, 140),
                new(new Vector2(1900, 608), EnemyType.Chaser, 220),
                new(new Vector2(2180, 608), EnemyType.Patrol, 130),
                new(new Vector2(2400, 608), EnemyType.Chaser, 200),
                new(new Vector2(2700, 608), EnemyType.Patrol, 150),
                // Boss
                new(new Vector2(3420, 560), EnemyType.Boss,   350),
            },
            Collectibles = Coins(
                (120,482),(300,422),(480,482),(660,435),
                (840,480),(1020,420),(1200,475),(1390,425),
                (1580,475),(1770,425),(1960,475),(2150,425),
                (2340,475),(2530,425),(2720,475),(2970,425),
                (3190,475),(3400,425)
            ),
            PowerUps = new List<PowerUpDef>
            {
                new(new Vector2(460, 472), PowerUpType.DoubleJump),
                new(new Vector2(1940,468), PowerUpType.Speed),
                new(new Vector2(2950,416), PowerUpType.Invincibility),
            }
        };

        // ====================================================================
        //  WORLD 3 – SNOW
        // ====================================================================

        private static LevelData Snow1() => new()
        {
            LevelWidth  = 3600,
            LevelHeight = 720,
            Theme       = WorldTheme.Snow,
            PlayerStart = new Vector2(80, 570),
            GoalPos     = new Vector2(3460, 555),
            Platforms = new List<PlatformDef>
            {
                P(0,   640, 850, 80),
                P(950, 640, 600, 80),
                P(1650,640, 700, 80),
                P(2450,640, 1150,80),

                P(170, 520, 130, 18),
                P(360, 460, 110, 18),
                P(560, 510, 140, 18),
                P(800, 470, 100, 18),
                P(1000,510, 130, 18),
                P(1180,455, 120, 18),
                P(1380,500, 140, 18),
                P(1600,460, 120, 18),
                P(1820,510, 130, 18),
                P(2040,455, 110, 18),
                P(2240,505, 140, 18),
                P(2460,460, 120, 18),
                P(2660,510, 130, 18),
                P(2890,460, 140, 18),
                P(3110,505, 150, 18),
                P(3330,460, 140, 18),
            },
            Enemies = new List<EnemyDef>
            {
                // Penguin-style patrols (slow but sturdy)
                new(new Vector2(280,  608), EnemyType.Patrol, 150),
                new(new Vector2(600,  608), EnemyType.Patrol, 130),
                new(new Vector2(1050, 608), EnemyType.Chaser, 180),
                new(new Vector2(1400, 608), EnemyType.Patrol, 150),
                new(new Vector2(1700, 608), EnemyType.Patrol, 160),
                new(new Vector2(2000, 608), EnemyType.Chaser, 200),
                new(new Vector2(2500, 608), EnemyType.Patrol, 150),
                new(new Vector2(2780, 608), EnemyType.Chaser, 180),
                new(new Vector2(3120, 608), EnemyType.Patrol, 140),
            },
            Collectibles = Coins(
                (190,492),(310,432),(580,482),(820,442),
                (1020,480),(1200,425),(1400,470),(1620,430),
                (1840,480),(2060,425),(2260,475),(2480,430),
                (2680,480),(2910,430),(3130,475),(3350,430)
            ),
            PowerUps = new List<PowerUpDef>
            {
                new(new Vector2(560, 472), PowerUpType.Speed),
                new(new Vector2(2240,468), PowerUpType.DoubleJump),
            }
        };

        private static LevelData Snow2() => new()
        {
            LevelWidth  = 3600,
            LevelHeight = 720,
            Theme       = WorldTheme.Snow,
            PlayerStart = new Vector2(80, 570),
            GoalPos     = new Vector2(3460, 555),
            Platforms = new List<PlatformDef>
            {
                P(0,   640, 600, 80),
                P(700, 640, 400, 80),
                P(1200,640, 500, 80),
                P(1800,640, 300, 80),
                P(2200,640, 600, 80),
                P(2900,640, 700, 80),

                P(130, 510, 130, 18),
                P(320, 450, 110, 18),
                P(510, 505, 140, 18),
                P(730, 465, 110, 18),
                P(910, 510, 130, 18),
                P(1100,450, 120, 18),
                P(1290,500, 140, 18),
                P(1480,450, 120, 18),
                P(1670,505, 130, 18),
                P(1860,455, 120, 18),
                P(2050,395, 140, 18),
                P(2250,455, 130, 18),
                P(2460,505, 130, 18),
                P(2670,455, 120, 18),
                P(2880,505, 130, 18),
                P(3100,445, 140, 18),
                P(3310,505, 140, 18),
            },
            Enemies = new List<EnemyDef>
            {
                new(new Vector2(200,  608), EnemyType.Patrol, 140),
                new(new Vector2(480,  608), EnemyType.Chaser, 180),
                new(new Vector2(780,  608), EnemyType.Patrol, 150),
                new(new Vector2(1060, 608), EnemyType.Chaser, 200),
                new(new Vector2(1360, 608), EnemyType.Patrol, 160),
                new(new Vector2(1640, 608), EnemyType.Chaser, 180),
                new(new Vector2(1900, 608), EnemyType.Patrol, 150),
                new(new Vector2(2200, 608), EnemyType.Chaser, 200),
                new(new Vector2(2500, 608), EnemyType.Patrol, 160),
                new(new Vector2(2800, 608), EnemyType.Chaser, 180),
                new(new Vector2(3100, 608), EnemyType.Patrol, 150),
                new(new Vector2(3350, 608), EnemyType.Chaser, 200),
            },
            Collectibles = Coins(
                (150,482),(240,482),(340,422),(530,475),
                (750,435),(930,480),(1120,420),(1310,470),
                (1500,420),(1690,475),(1880,425),(2070,365),
                (2270,425),(2480,475),(2690,425),(2900,475),
                (3120,415),(3330,475)
            ),
            PowerUps = new List<PowerUpDef>
            {
                new(new Vector2(510, 468), PowerUpType.Invincibility),
                new(new Vector2(2050,358), PowerUpType.Speed),
            }
        };

        private static LevelData Snow3() => new()
        {
            LevelWidth  = 3800,
            LevelHeight = 720,
            Theme       = WorldTheme.Snow,
            PlayerStart = new Vector2(80, 570),
            GoalPos     = new Vector2(3660, 555),
            Platforms = new List<PlatformDef>
            {
                P(0,   640, 500, 80),
                P(600, 640, 400, 80),
                P(1100,640, 300, 80),
                P(1500,640, 400, 80),
                P(2000,640, 300, 80),
                P(2400,640, 400, 80),
                P(2900,640, 900, 80),

                P(100, 510, 120, 18),
                P(280, 450, 110, 18),
                P(460, 510, 130, 18),
                P(640, 465, 110, 18),
                P(820, 510, 130, 18),
                P(1000,450, 120, 18),
                P(1180,505, 140, 18),
                P(1370,455, 120, 18),
                P(1560,505, 130, 18),
                P(1750,455, 120, 18),
                P(1940,505, 140, 18),
                P(2130,455, 120, 18),
                P(2320,505, 130, 18),
                P(2510,455, 120, 18),
                P(2700,505, 130, 18),
                P(2950,455, 140, 18),
                P(3170,505, 150, 18),
                P(3380,455, 140, 18),
                P(3580,505, 100, 18),
                // Final boss arena
                P(3100,630, 700, 10),
            },
            Enemies = new List<EnemyDef>
            {
                new(new Vector2(200,  608), EnemyType.Patrol, 130),
                new(new Vector2(400,  608), EnemyType.Chaser, 200),
                new(new Vector2(680,  608), EnemyType.Patrol, 140),
                new(new Vector2(900,  608), EnemyType.Chaser, 220),
                new(new Vector2(1180, 608), EnemyType.Patrol, 130),
                new(new Vector2(1400, 608), EnemyType.Chaser, 200),
                new(new Vector2(1680, 608), EnemyType.Patrol, 140),
                new(new Vector2(1900, 608), EnemyType.Chaser, 220),
                new(new Vector2(2180, 608), EnemyType.Patrol, 130),
                new(new Vector2(2400, 608), EnemyType.Chaser, 200),
                new(new Vector2(2700, 608), EnemyType.Patrol, 150),
                // Final Boss
                new(new Vector2(3420, 560), EnemyType.Boss,   400),
            },
            Collectibles = Coins(
                (120,482),(300,422),(480,482),(660,435),
                (840,480),(1020,420),(1200,475),(1390,425),
                (1580,475),(1770,425),(1960,475),(2150,425),
                (2340,475),(2530,425),(2720,475),(2970,425),
                (3190,475),(3400,425)
            ),
            PowerUps = new List<PowerUpDef>
            {
                new(new Vector2(460, 472), PowerUpType.DoubleJump),
                new(new Vector2(1940,468), PowerUpType.Speed),
                new(new Vector2(2950,416), PowerUpType.Invincibility),
            }
        };

        // ====================================================================
        //  Helpers
        // ====================================================================

        private static PlatformDef P(int x, int y, int w, int h)
            => new PlatformDef(x, y, w, h);

        private static List<CollectibleDef> Coins(params (float x, float y)[] pts)
        {
            var list = new List<CollectibleDef>();
            foreach (var (x, y) in pts)
                list.Add(new CollectibleDef(new Vector2(x, y), CollectibleType.Coin));
            return list;
        }
    }

    /// <summary>Plain-data record for a platform (colour is assigned by Level at runtime).</summary>
    public sealed record PlatformDef(int X, int Y, int W, int H);
}
