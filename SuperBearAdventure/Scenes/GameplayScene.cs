using System;
using System.Linq;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using SuperBearAdventure.Entities;
using SuperBearAdventure.World;

namespace SuperBearAdventure.Scenes
{
    /// <summary>
    /// Core gameplay scene.
    /// Orchestrates the player, level objects, camera, HUD, and win/lose transitions.
    /// </summary>
    public sealed class GameplayScene : IScene
    {
        // ── Events ─────────────────────────────────────────────────────────
        public event Action? OnPause;
        public event Action? OnLevelComplete;
        public event Action? OnGameOver;

        // ── Scene state ────────────────────────────────────────────────────
        private Level        _level;
        private Player       _player;
        private Camera2D     _camera;

        private readonly int _screenW;
        private readonly int _screenH;
        private readonly int _worldIndex;
        private readonly int _levelIndex;

        private KeyboardState _prevKeys;

        // Stomp detection constants
        private const float StompThreshold = 6f; // min downward velocity to stomp

        // Brief invulnerability after respawn
        private float _respawnTimer = 0f;

        public GameplayScene(int screenW, int screenH, int world, int level)
        {
            _screenW    = screenW;
            _screenH    = screenH;
            _worldIndex = world;
            _levelIndex = level;

            LoadLevel();
        }

        private void LoadLevel()
        {
            _level  = new Level(_worldIndex, _levelIndex);
            _player = new Player(_level.PlayerStart)
            {
                Lives = GameManager.Instance.Lives,
                Score = GameManager.Instance.Score,
                Coins = GameManager.Instance.Coins,
            };
            _camera = new Camera2D(_screenW, _screenH);
            _camera.Snap(_level.PlayerStart, _level.Width, _level.Height);
        }

        // ── Update ─────────────────────────────────────────────────────────

        public void Update(GameTime gameTime)
        {
            float dt = (float)gameTime.ElapsedGameTime.TotalSeconds;
            var   kb = Keyboard.GetState();
            var   gm = GameManager.Instance;

            // Pause
            if (IsPressed(kb, _prevKeys, Keys.Escape))
            {
                OnPause?.Invoke();
                _prevKeys = kb;
                return;
            }
            _prevKeys = kb;

            if (_respawnTimer > 0f) _respawnTimer -= dt;

            // Update player
            _player.Update(gameTime, _level.Platforms);

            // Fell into a pit?
            if (_player.Position.Y > _level.Height + 50 && !_player.IsDead)
            {
                _player.TakeDamage();
                if (!_player.IsDead)
                    RespawnPlayer();
            }

            // Death animation done → game over
            if (_player.IsDead && _player.DeathAnimationDone)
            {
                SyncToManager();
                OnGameOver?.Invoke();
                return;
            }

            // Update enemies (patrol, chasing)
            foreach (var enemy in _level.Enemies)
            {
                if (!enemy.IsActive) continue;
                enemy.ChasePlayer(_player.Position, gameTime);
                enemy.Update(gameTime, _level.Platforms);
            }

            // ── Collisions ─────────────────────────────────────────────────

            if (_respawnTimer <= 0f && !_player.IsDead)
            {
                CheckEnemyCollisions();
                CheckCollectibles();
                CheckPowerUps();
                CheckGoal();
            }

            // Camera
            _camera.Follow(
                _player.Position + new Vector2(_player.Bounds.Width / 2f, _player.Bounds.Height / 2f),
                _level.Width, _level.Height);
        }

        // ── Collision helpers ──────────────────────────────────────────────

        private void CheckEnemyCollisions()
        {
            var pb = _player.Bounds;
            foreach (var enemy in _level.Enemies)
            {
                if (!enemy.IsActive) continue;
                var eb = enemy.Bounds;
                if (!pb.Intersects(eb)) continue;

                // Stomp: player's bottom edge overlaps enemy's top portion
                bool stomp = _player.Velocity.Y >= StompThreshold &&
                             pb.Bottom <= eb.Top + eb.Height / 2 + 12;

                if (stomp)
                {
                    enemy.Defeat();
                    _player.Velocity = new Vector2(_player.Velocity.X, -420f); // bounce
                    _player.Score   += enemy.Type == EnemyType.Boss ? 1000 : 100;
                    GameManager.Instance.AddScore(enemy.Type == EnemyType.Boss ? 1000 : 100);
                }
                else
                {
                    _player.TakeDamage();
                    if (!_player.IsDead) RespawnPlayer();
                }
                break;
            }
        }

        private void CheckCollectibles()
        {
            var pb = _player.Bounds;
            foreach (var c in _level.Collectibles)
            {
                if (c.IsCollected) continue;
                if (!pb.Intersects(c.Bounds)) continue;
                c.Collect();
                int pts = c.ScoreValue;
                _player.Score += pts;
                _player.Coins += c.Type == CollectibleType.Coin ? 1 : 0;
                GameManager.Instance.AddScore(pts);
                GameManager.Instance.Coins = _player.Coins;
            }
        }

        private void CheckPowerUps()
        {
            var pb = _player.Bounds;
            foreach (var pu in _level.PowerUps)
            {
                if (pu.IsCollected) continue;
                if (!pb.Intersects(pu.Bounds)) continue;
                pu.Collect();
                _player.ApplyPowerUp(pu.Type);
            }
        }

        private void CheckGoal()
        {
            if (!_player.Bounds.Intersects(_level.Goal.Bounds)) return;

            // Level complete!
            int bonus = 500;
            _player.Score += bonus;
            GameManager.Instance.AddScore(bonus);
            SyncToManager();
            GameManager.Instance.MarkLevelCompleted(_worldIndex, _levelIndex);
            OnLevelComplete?.Invoke();
        }

        private void RespawnPlayer()
        {
            _player.Reset(_level.PlayerStart);
            _camera.Snap(_level.PlayerStart, _level.Width, _level.Height);
            _respawnTimer = 1.5f;
            SyncToManager();
        }

        private void SyncToManager()
        {
            var gm = GameManager.Instance;
            gm.Lives = _player.Lives;
            gm.Score = _player.Score;
            gm.Coins = _player.Coins;
        }

        // ── Draw ──────────────────────────────────────────────────────────

        public void Draw(SpriteBatch sb, SpriteFont font)
        {
            var camPos = _camera.Position;

            // --- World-space pass (with camera transform) ---
            // Background (drawn in screen space before camera transform,
            // then world elements with camera transform applied via Game1)
            _level.DrawBackground(sb, camPos, _screenW, _screenH);

            // Platforms
            foreach (var p in _level.Platforms)
            {
                var sr = new Rectangle(
                    p.Bounds.X - (int)camPos.X,
                    p.Bounds.Y - (int)camPos.Y,
                    p.Bounds.Width, p.Bounds.Height);
                if (sr.Right < 0 || sr.X > _screenW) continue; // cull off-screen
                DrawHelper.DrawRect(sb, sr, p.Color);
                // Lighter top edge
                DrawHelper.DrawRect(sb, sr.X, sr.Y, sr.Width, 4, DrawHelper.Brighten(p.Color, 50));
            }

            // Goal flag
            _level.Goal.Draw(sb); // drawn in world space; Game1 passes camera transform

            // Collectibles
            foreach (var c in _level.Collectibles)
            {
                if (c.IsCollected) continue;
                var screenPos = c.Position - camPos;
                if (screenPos.X < -30 || screenPos.X > _screenW + 30) continue;
                // Draw at screen position
                DrawCollectibleAt(sb, (int)screenPos.X, (int)screenPos.Y, c.Type);
            }

            // Power-ups
            foreach (var pu in _level.PowerUps)
            {
                if (pu.IsCollected) continue;
                var screenPos = pu.Position - camPos;
                if (screenPos.X < -50 || screenPos.X > _screenW + 50) continue;
                DrawPowerUpAt(sb, (int)screenPos.X, (int)screenPos.Y, pu.Type);
            }

            // Enemies
            foreach (var e in _level.Enemies)
            {
                if (!e.IsActive) continue;
                e.Draw(sb, camPos);
            }

            // Player
            _player.Draw(sb, camPos);

            // --- HUD (screen space, no camera) ---
            DrawHUD(sb, font);

            // Respawn overlay
            if (_respawnTimer > 0.8f)
            {
                int alpha = (int)((_respawnTimer - 0.8f) / 0.7f * 200);
                DrawHelper.DrawRect(sb, 0, 0, _screenW, _screenH, new Color(0, 0, 0, alpha));
                CenterText(sb, font, "RESPAWNING...", _screenW / 2, _screenH / 2 - 20, Color.White, 1f);
            }
        }

        private void DrawHUD(SpriteBatch sb, SpriteFont font)
        {
            var gm = GameManager.Instance;
            // Semi-transparent bar at top
            DrawHelper.DrawRect(sb, 0, 0, _screenW, 50, new Color(0, 0, 0, 160));

            // Lives
            string livesStr = "❤ " + string.Concat(Enumerable.Repeat("♥ ", _player.Lives));
            sb.DrawString(font, $"Lives: {_player.Lives}", new Vector2(20, 12), Color.LightCoral, 0f,
                Vector2.Zero, 0.9f, SpriteEffects.None, 0f);

            // Score
            CenterText(sb, font, $"Score: {_player.Score}", _screenW / 2, 12, Color.Gold, 0.9f);

            // Coins
            sb.DrawString(font, $"Coins: {_player.Coins}", new Vector2(_screenW - 200, 12),
                Color.Yellow, 0f, Vector2.Zero, 0.9f, SpriteEffects.None, 0f);

            // World/Level
            sb.DrawString(font, $"W{_worldIndex + 1}-{_levelIndex + 1}", new Vector2(20, _screenH - 35),
                Color.White, 0f, Vector2.Zero, 0.8f, SpriteEffects.None, 0f);

            // Power-up timer bar
            if (_player.CurrentPowerUp != PowerUpType.None)
            {
                string puName = _player.CurrentPowerUp.ToString().ToUpper();
                Color  puCol  = _player.CurrentPowerUp switch
                {
                    PowerUpType.DoubleJump    => Color.Cyan,
                    PowerUpType.Speed         => Color.LimeGreen,
                    PowerUpType.Invincibility => Color.Gold,
                    _                          => Color.White
                };
                sb.DrawString(font, puName, new Vector2(_screenW - 200, _screenH - 50),
                    puCol, 0f, Vector2.Zero, 0.8f, SpriteEffects.None, 0f);
                int barW = 180;
                float frac = MathHelper.Clamp(_player.PowerUpTimer / 10f, 0f, 1f);
                DrawHelper.DrawRect(sb, _screenW - 200, _screenH - 26, barW, 12, Color.DarkGray);
                DrawHelper.DrawRect(sb, _screenW - 200, _screenH - 26, (int)(barW * frac), 12, puCol);
                DrawHelper.DrawOutline(sb, new Rectangle(_screenW - 200, _screenH - 26, barW, 12), Color.Black, 1);
            }
        }

        // ── Mini draw helpers ──────────────────────────────────────────────

        private static void DrawCollectibleAt(SpriteBatch sb, int x, int y, CollectibleType type)
        {
            Color c = type == CollectibleType.Star ? Color.Yellow : Color.Gold;
            DrawHelper.DrawRect(sb, x + 6, y,      12, 24, c);
            DrawHelper.DrawRect(sb, x,     y + 6,  24, 12, c);
            DrawHelper.DrawRect(sb, x + 9, y + 9,  6,   6, Color.White);
        }

        private static void DrawPowerUpAt(SpriteBatch sb, int x, int y, PowerUpType type)
        {
            Color c = type switch
            {
                PowerUpType.DoubleJump    => Color.Cyan,
                PowerUpType.Speed         => Color.LimeGreen,
                PowerUpType.Invincibility => Color.Gold,
                _                          => Color.White
            };
            DrawHelper.DrawRect(sb, x, y, 30, 30, c);
            DrawHelper.DrawOutline(sb, new Rectangle(x, y, 30, 30), Color.Black, 2);
        }

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
