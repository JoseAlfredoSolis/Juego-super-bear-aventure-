using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace SuperBearAdventure.Scenes
{
    /// <summary>
    /// World-selection screen.  Shows 3 worlds with their levels as dots.
    /// Arrow keys navigate; Enter selects.
    /// </summary>
    public sealed class WorldMapScene : IScene
    {
        public event Action<int, int>? OnLevelSelected; // (world, level)

        private int           _worldSel  = 0;
        private int           _levelSel  = 0;
        private KeyboardState _prevKeys;
        private float         _timer     = 0f;

        private readonly int _screenW;
        private readonly int _screenH;

        private static readonly string[] WorldNames = { "World 1: FOREST", "World 2: CAVE", "World 3: SNOW" };
        private static readonly Color[]  WorldColors =
        {
            new Color(34, 120, 34),
            new Color(30, 30, 80),
            new Color(140, 190, 220)
        };

        public WorldMapScene(int screenW, int screenH)
        {
            _screenW = screenW;
            _screenH = screenH;
            // Start on the current world/level
            _worldSel = GameManager.Instance.CurrentWorld;
            _levelSel = GameManager.Instance.CurrentLevel;
        }

        public void Update(GameTime gameTime)
        {
            _timer += (float)gameTime.ElapsedGameTime.TotalSeconds;

            var gm = GameManager.Instance;
            var kb = Keyboard.GetState();

            if (IsPressed(kb, _prevKeys, Keys.Left)  || IsPressed(kb, _prevKeys, Keys.A))
                _levelSel = Math.Max(0, _levelSel - 1);

            if (IsPressed(kb, _prevKeys, Keys.Right) || IsPressed(kb, _prevKeys, Keys.D))
                _levelSel = Math.Min(2, _levelSel + 1);

            if (IsPressed(kb, _prevKeys, Keys.Up)    || IsPressed(kb, _prevKeys, Keys.W))
                if (_worldSel > 0 && gm.IsWorldUnlocked(_worldSel - 1))
                { _worldSel--; _levelSel = 0; }

            if (IsPressed(kb, _prevKeys, Keys.Down)  || IsPressed(kb, _prevKeys, Keys.S))
                if (_worldSel < 2 && gm.IsWorldUnlocked(_worldSel + 1))
                { _worldSel++; _levelSel = 0; }

            if (IsPressed(kb, _prevKeys, Keys.Enter) || IsPressed(kb, _prevKeys, Keys.Space))
            {
                if (gm.IsWorldUnlocked(_worldSel))
                    OnLevelSelected?.Invoke(_worldSel, _levelSel);
            }

            _prevKeys = kb;
        }

        public void Draw(SpriteBatch sb, SpriteFont font)
        {
            var gm = GameManager.Instance;

            // Background
            DrawHelper.DrawRect(sb, 0, 0, _screenW, _screenH, new Color(10, 20, 60));

            // Title
            CenterText(sb, font, "SELECT LEVEL", _screenW / 2, 40, Color.Gold, 1.3f);
            CenterText(sb, font, "Arrows: Navigate    Enter: Play", _screenW / 2, _screenH - 40, new Color(160,160,160), 0.72f);

            int worldCardW = 340;
            int worldCardH = 300;
            int spacing    = 40;
            int totalW     = 3 * worldCardW + 2 * spacing;
            int startX     = (_screenW - totalW) / 2;
            int cardY      = (_screenH - worldCardH) / 2 - 10;

            for (int w = 0; w < 3; w++)
            {
                int cx = startX + w * (worldCardW + spacing);
                bool locked   = !gm.IsWorldUnlocked(w);
                bool selected = w == _worldSel;

                // Card background
                Color cardCol = locked ? new Color(40, 40, 40) : WorldColors[w];
                DrawHelper.DrawRect(sb, cx, cardY, worldCardW, worldCardH, cardCol);

                // Selection border
                if (selected)
                    DrawHelper.DrawOutline(sb,
                        new Rectangle(cx - 3, cardY - 3, worldCardW + 6, worldCardH + 6),
                        Color.Yellow, 4);

                // World name
                Color nameCol = locked ? Color.Gray : Color.White;
                CenterText(sb, font, locked ? "LOCKED" : WorldNames[w],
                    cx + worldCardW / 2, cardY + 20, nameCol, 0.85f);

                if (!locked)
                {
                    // Level dots
                    int dotSpacing = 80;
                    int dotsX = cx + (worldCardW - 2 * dotSpacing) / 2;
                    for (int l = 0; l < 3; l++)
                    {
                        int dx = dotsX + l * dotSpacing;
                        int dy = cardY + 120;
                        bool completed = gm.IsLevelCompleted(w, l);
                        bool levSel    = selected && l == _levelSel;

                        float bob = levSel ? MathF.Sin(_timer * 4f) * 5f : 0f;
                        int   dotR = levSel ? 28 : 22;
                        Color dotC = completed ? Color.Gold
                                   : levSel   ? Color.LimeGreen
                                               : Color.White;

                        DrawHelper.DrawRect(sb, dx - dotR / 2, (int)(dy - dotR / 2 + bob), dotR, dotR, dotC);
                        DrawHelper.DrawOutline(sb, new Rectangle(dx - dotR / 2, (int)(dy - dotR / 2 + bob), dotR, dotR), Color.Black, 2);

                        string lbl = $"{w + 1}-{l + 1}";
                        CenterText(sb, font, lbl, dx, (int)(dy + 30 + bob), Color.White, 0.7f);

                        if (completed)
                            CenterText(sb, font, "★", dx, (int)(dy - dotR / 2 - 20 + bob), Color.Yellow, 0.8f);

                        // Connect dots with lines
                        if (l < 2)
                            DrawHelper.DrawRect(sb, dx + dotR / 2, dy - 2, dotSpacing - dotR, 4, Color.Gray);
                    }

                    // Score hint
                    CenterText(sb, font, $"Score: {gm.Score}", cx + worldCardW / 2, cardY + worldCardH - 50, Color.Cyan, 0.72f);
                }
            }

            // Controls reminder
            CenterText(sb, font, $"Lives: {gm.Lives}  Coins: {gm.Coins}  Score: {gm.Score}",
                _screenW / 2, _screenH - 70, Color.LightYellow, 0.78f);
        }

        // ── Helpers ────────────────────────────────────────────────────────

        private static void CenterText(SpriteBatch sb, SpriteFont font,
            string text, int cx, int y, Color color, float scale)
        {
            sb.DrawString(font, text, new Vector2(cx, y), color, 0f,
                new Vector2(font.MeasureString(text).X / 2f, 0f),
                scale, SpriteEffects.None, 0f);
        }

        private static bool IsPressed(KeyboardState c, KeyboardState p, Keys k)
            => c.IsKeyDown(k) && !p.IsKeyDown(k);
    }
}
