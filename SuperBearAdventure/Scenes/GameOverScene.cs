using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace SuperBearAdventure.Scenes
{
    /// <summary>Shown when the player runs out of lives.</summary>
    public sealed class GameOverScene : IScene
    {
        public event Action? OnRetry;
        public event Action? OnMainMenu;

        private int           _selected = 0;
        private KeyboardState _prevKeys;
        private float         _timer    = 0f;

        private readonly string[] _options = { "TRY AGAIN", "MAIN MENU" };
        private readonly int _screenW;
        private readonly int _screenH;

        public GameOverScene(int screenW, int screenH)
        {
            _screenW = screenW;
            _screenH = screenH;
        }

        public void Update(GameTime gameTime)
        {
            _timer += (float)gameTime.ElapsedGameTime.TotalSeconds;
            var kb = Keyboard.GetState();

            if (IsPressed(kb, _prevKeys, Keys.Left)  || IsPressed(kb, _prevKeys, Keys.A))
                _selected = 0;
            if (IsPressed(kb, _prevKeys, Keys.Right) || IsPressed(kb, _prevKeys, Keys.D))
                _selected = 1;

            if (IsPressed(kb, _prevKeys, Keys.Enter) || IsPressed(kb, _prevKeys, Keys.Space))
            {
                if (_selected == 0) OnRetry?.Invoke();
                else                OnMainMenu?.Invoke();
            }
            _prevKeys = kb;
        }

        public void Draw(SpriteBatch sb, SpriteFont font)
        {
            var gm = GameManager.Instance;

            // Dark red vignette
            DrawHelper.DrawRect(sb, 0, 0, _screenW, _screenH, new Color(40, 0, 0));

            // Pulse for "GAME OVER"
            float pulse = 1.2f + MathF.Sin(_timer * 3f) * 0.08f;

            // Shadow
            CenterText(sb, font, "GAME OVER", _screenW / 2 + 4, 156, Color.Black, pulse * 1.8f);
            // Text
            CenterText(sb, font, "GAME OVER", _screenW / 2, 152, Color.OrangeRed, pulse * 1.8f);

            // Stats
            int sy = 310;
            CenterText(sb, font, $"Score:     {gm.Score}",    _screenW / 2, sy,       Color.White,  1f);
            CenterText(sb, font, $"Coins:     {gm.Coins}",    _screenW / 2, sy + 40,  Color.Yellow, 1f);
            CenterText(sb, font, $"High Score: {gm.HighScore}", _screenW / 2, sy + 80, Color.Cyan,   1f);

            // Buttons
            int bx = _screenW / 2 - 200;
            for (int i = 0; i < _options.Length; i++)
            {
                int cx  = bx + i * 260;
                bool sel = i == _selected;
                Color bc = sel ? Color.OrangeRed : new Color(80, 40, 40);
                DrawHelper.DrawRect(sb, cx - 90, 460, 180, 50, bc);
                DrawHelper.DrawOutline(sb, new Rectangle(cx - 90, 460, 180, 50),
                    sel ? Color.Yellow : Color.Gray, sel ? 3 : 1);
                CenterText(sb, font, _options[i], cx, 470, sel ? Color.Yellow : Color.White, 0.95f);
            }

            CenterText(sb, font, "← → to select   Enter to confirm",
                _screenW / 2, _screenH - 40, new Color(150, 150, 150), 0.72f);
        }

        // ── Helpers ───────────────────────────────────────────────────────

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
