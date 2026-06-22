using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace SuperBearAdventure.Scenes
{
    /// <summary>Title screen with Play, Instructions, and Quit options.</summary>
    public sealed class MainMenuScene : IScene
    {
        public event Action? OnPlay;
        public event Action? OnQuit;

        private int           _selected   = 0;
        private KeyboardState _prevKeys;
        private float         _titleBob   = 0f;   // oscillation for title text
        private float         _timer      = 0f;

        private readonly string[] _options = { "PLAY", "INSTRUCTIONS", "QUIT" };
        private readonly int _screenW;
        private readonly int _screenH;

        public MainMenuScene(int screenW, int screenH)
        {
            _screenW = screenW;
            _screenH = screenH;
        }

        public void Update(GameTime gameTime)
        {
            _timer   += (float)gameTime.ElapsedGameTime.TotalSeconds;
            _titleBob = MathF.Sin(_timer * 2f) * 6f;

            var kb = Keyboard.GetState();

            if (IsPressed(kb, _prevKeys, Keys.Down) || IsPressed(kb, _prevKeys, Keys.S))
                _selected = (_selected + 1) % _options.Length;

            if (IsPressed(kb, _prevKeys, Keys.Up) || IsPressed(kb, _prevKeys, Keys.W))
                _selected = (_selected - 1 + _options.Length) % _options.Length;

            if (IsPressed(kb, _prevKeys, Keys.Enter) || IsPressed(kb, _prevKeys, Keys.Space))
            {
                switch (_selected)
                {
                    case 0: OnPlay?.Invoke();  break;
                    case 1: /* show instructions inline */ break;
                    case 2: OnQuit?.Invoke();  break;
                }
            }

            _prevKeys = kb;
        }

        public void Draw(SpriteBatch sb, SpriteFont font)
        {
            // Background gradient (approximated with layers)
            DrawHelper.DrawRect(sb, 0, 0, _screenW, _screenH / 2, new Color(10, 40, 80));
            DrawHelper.DrawRect(sb, 0, _screenH / 2, _screenW, _screenH / 2, new Color(30, 100, 50));

            // Decorative bear silhouettes
            DrawBear(sb, 80,  400, 80);
            DrawBear(sb, 1140, 390, 90);

            // Title shadow
            DrawText(sb, font, "SUPER BEAR ADVENTURE",
                _screenW / 2 - 6, 100 + (int)_titleBob + 4, Color.Black, 1.6f);
            // Title
            DrawText(sb, font, "SUPER BEAR ADVENTURE",
                _screenW / 2,     100 + (int)_titleBob,     Color.Gold,  1.6f);

            // Sub-title
            DrawText(sb, font, "A MonoGame C# Platformer",
                _screenW / 2, 175, new Color(200, 230, 200), 0.85f);

            // Instructions hint
            DrawText(sb, font, "WASD / Arrows: Move   Space/W: Jump   Esc: Pause",
                _screenW / 2, _screenH - 50, new Color(180, 180, 180), 0.7f);

            // Menu options
            int menuY = 310;
            for (int i = 0; i < _options.Length; i++)
            {
                bool   sel   = i == _selected;
                Color  col   = sel ? Color.Yellow : Color.White;
                float  scale = sel ? 1.15f : 0.95f;
                if (sel)
                {
                    // Selection box
                    var ms = font.MeasureString(_options[i]) * scale;
                    DrawHelper.DrawRect(sb,
                        (int)(_screenW / 2 - ms.X / 2 - 16),
                        menuY - 6,
                        (int)(ms.X + 32), (int)(ms.Y + 12),
                        new Color(0, 0, 0, 140));
                    DrawText(sb, font, "> " + _options[i] + " <", _screenW / 2, menuY, col, scale);
                }
                else
                {
                    DrawText(sb, font, _options[i], _screenW / 2, menuY, col, scale);
                }
                menuY += 60;
            }

            // High score
            DrawText(sb, font, $"Best: {GameManager.Instance.HighScore}",
                _screenW - 120, 20, Color.Cyan, 0.8f);
        }

        // ── Helpers ────────────────────────────────────────────────────────

        private static void DrawText(SpriteBatch sb, SpriteFont font, string text,
            int cx, int y, Color color, float scale = 1f)
        {
            var sz     = font.MeasureString(text) * scale;
            var origin = new Vector2(font.MeasureString(text).X / 2f, 0);
            sb.DrawString(font, text,
                new Vector2(cx, y), color, 0f,
                new Vector2(font.MeasureString(text).X / 2f, 0),
                scale, SpriteEffects.None, 0f);
        }

        private static void DrawBear(SpriteBatch sb, int x, int y, int size)
        {
            Color c = new Color(80, 50, 20);
            DrawHelper.DrawRect(sb, x,            y,            size, (int)(size * 0.8), c);
            DrawHelper.DrawRect(sb, x + size / 4, y - size / 3, size / 2, size / 3,     c);
        }

        private static bool IsPressed(KeyboardState curr, KeyboardState prev, Keys key)
            => curr.IsKeyDown(key) && !prev.IsKeyDown(key);
    }
}
