using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;

namespace SuperBearAdventure.Scenes
{
    /// <summary>Semi-transparent pause overlay shown over the gameplay scene.</summary>
    public sealed class PauseScene : IScene
    {
        public event Action? OnResume;
        public event Action? OnRestart;
        public event Action? OnMainMenu;

        private int           _selected = 0;
        private KeyboardState _prevKeys;

        private readonly string[] _options = { "RESUME", "RESTART LEVEL", "MAIN MENU" };
        private readonly int _screenW;
        private readonly int _screenH;

        public PauseScene(int screenW, int screenH)
        {
            _screenW = screenW;
            _screenH = screenH;
        }

        public void Update(GameTime gameTime)
        {
            var kb = Keyboard.GetState();

            if (IsPressed(kb, _prevKeys, Keys.Escape) || IsPressed(kb, _prevKeys, Keys.P))
            {
                OnResume?.Invoke();
                _prevKeys = kb;
                return;
            }

            if (IsPressed(kb, _prevKeys, Keys.Down) || IsPressed(kb, _prevKeys, Keys.S))
                _selected = (_selected + 1) % _options.Length;

            if (IsPressed(kb, _prevKeys, Keys.Up) || IsPressed(kb, _prevKeys, Keys.W))
                _selected = (_selected - 1 + _options.Length) % _options.Length;

            if (IsPressed(kb, _prevKeys, Keys.Enter) || IsPressed(kb, _prevKeys, Keys.Space))
            {
                switch (_selected)
                {
                    case 0: OnResume?.Invoke();   break;
                    case 1: OnRestart?.Invoke();  break;
                    case 2: OnMainMenu?.Invoke(); break;
                }
            }

            _prevKeys = kb;
        }

        public void Draw(SpriteBatch sb, SpriteFont font)
        {
            // Dark overlay
            DrawHelper.DrawRect(sb, 0, 0, _screenW, _screenH, new Color(0, 0, 0, 170));

            // Panel
            int pw = 420, ph = 300;
            int px = (_screenW - pw) / 2, py = (_screenH - ph) / 2;
            DrawHelper.DrawRect(sb, px, py, pw, ph, new Color(20, 20, 60, 230));
            DrawHelper.DrawOutline(sb, new Rectangle(px, py, pw, ph), Color.Gold, 3);

            CenterText(sb, font, "PAUSED", _screenW / 2, py + 30, Color.Gold, 1.3f);

            int optY = py + 110;
            for (int i = 0; i < _options.Length; i++)
            {
                bool sel  = i == _selected;
                Color col = sel ? Color.Yellow : Color.White;
                float sc  = sel ? 1.1f : 0.95f;
                CenterText(sb, font, sel ? $"> {_options[i]} <" : _options[i],
                    _screenW / 2, optY, col, sc);
                optY += 58;
            }
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
