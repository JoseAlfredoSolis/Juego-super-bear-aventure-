using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using System.Collections.Generic;
using SuperBearAdventure.World;

namespace SuperBearAdventure.Entities
{
    /// <summary>The player-controlled bear.</summary>
    public sealed class Player : Entity
    {
        // ── Constants ──────────────────────────────────────────────────────
        private const float BaseSpeed          = 290f;
        private const float SpeedMultiplier    = 1.65f;
        private const float JumpForce          = -700f;
        private const float DoubleJumpForce    = -600f;
        private const float PowerUpDuration    = 10f;
        private const float HitInvincibleTime  = 2f;

        // ── Stats ──────────────────────────────────────────────────────────
        public int         Lives          { get; set; } = 3;
        public int         Score          { get; set; } = 0;
        public int         Coins          { get; set; } = 0;
        public PowerUpType CurrentPowerUp { get; private set; } = PowerUpType.None;
        public float       PowerUpTimer   { get; private set; } = 0f;
        public bool        IsInvincible   => _invincibleTimer > 0f;

        // ── Internal state ─────────────────────────────────────────────────
        private bool  _canDoubleJump   = false;
        private bool  _hasDoubleJumped = false;
        private float _invincibleTimer = 0f;
        private bool  _facingRight     = true;
        private float _animTimer       = 0f;
        private int   _animFrame       = 0;
        private bool  _isDead          = false;
        private float _deathTimer      = 0f;

        private KeyboardState _prevKeys;

        // ── Public info ────────────────────────────────────────────────────
        public bool IsDead               => _isDead;
        public bool DeathAnimationDone   => _isDead && _deathTimer >= 1.4f;

        public Player(Vector2 start)
        {
            Position = start;
            Size     = new Vector2(36, 48);
        }

        // ── Update ─────────────────────────────────────────────────────────

        public override void Update(GameTime gameTime, List<Platform> platforms)
        {
            if (_isDead)
            {
                _deathTimer += (float)gameTime.ElapsedGameTime.TotalSeconds;
                return;
            }

            float dt  = (float)gameTime.ElapsedGameTime.TotalSeconds;
            var   kb  = Keyboard.GetState();

            // Timers
            if (_invincibleTimer > 0f) _invincibleTimer -= dt;
            if (PowerUpTimer > 0f)
            {
                PowerUpTimer -= dt;
                if (PowerUpTimer <= 0f) DeactivatePowerUp();
            }

            // Horizontal movement
            float speed = BaseSpeed * (CurrentPowerUp == PowerUpType.Speed ? SpeedMultiplier : 1f);
            float vx    = 0f;

            if (kb.IsKeyDown(Keys.Left)  || kb.IsKeyDown(Keys.A)) { vx = -speed; _facingRight = false; }
            if (kb.IsKeyDown(Keys.Right) || kb.IsKeyDown(Keys.D)) { vx =  speed; _facingRight = true;  }

            // Jump (detect key-press edge)
            bool jumpJustPressed =
                (kb.IsKeyDown(Keys.Space) || kb.IsKeyDown(Keys.Up) || kb.IsKeyDown(Keys.W)) &&
                !(_prevKeys.IsKeyDown(Keys.Space) || _prevKeys.IsKeyDown(Keys.Up) || _prevKeys.IsKeyDown(Keys.W));

            float vy = Velocity.Y;
            if (jumpJustPressed)
            {
                if (IsGrounded)
                {
                    vy             = JumpForce;
                    IsGrounded     = false;
                    _hasDoubleJumped = false;
                }
                else if (_canDoubleJump && !_hasDoubleJumped)
                {
                    vy               = DoubleJumpForce;
                    _hasDoubleJumped = true;
                }
            }

            Velocity = new Vector2(vx, vy);
            StepPhysics(gameTime, platforms);

            if (IsGrounded) _hasDoubleJumped = false;

            // Clamp to left world edge
            if (Position.X < 0f) Position = new Vector2(0f, Position.Y);

            // Animation
            if (Math.Abs(vx) > 0.1f)
            {
                _animTimer += dt * 9f;
                _animFrame  = (int)_animTimer % 4;
            }
            else
            {
                _animTimer = 0f; _animFrame = 0;
            }

            _prevKeys = kb;
        }

        // ── Power-ups ──────────────────────────────────────────────────────

        public void ApplyPowerUp(PowerUpType type)
        {
            CurrentPowerUp = type;
            PowerUpTimer   = PowerUpDuration;
            if (type == PowerUpType.DoubleJump)     _canDoubleJump = true;
            if (type == PowerUpType.Invincibility)  _invincibleTimer = PowerUpDuration;
        }

        private void DeactivatePowerUp()
        {
            if (CurrentPowerUp == PowerUpType.DoubleJump) _canDoubleJump = false;
            CurrentPowerUp = PowerUpType.None;
            PowerUpTimer   = 0f;
        }

        // ── Damage ────────────────────────────────────────────────────────

        public void TakeDamage()
        {
            if (IsInvincible) return;
            Lives--;
            if (Lives <= 0) { _isDead = true; return; }
            // Brief invincibility after hit
            _invincibleTimer = HitInvincibleTime;
        }

        public void Reset(Vector2 startPos)
        {
            Position         = startPos;
            Velocity         = Vector2.Zero;
            IsGrounded       = false;
            _isDead          = false;
            _deathTimer      = 0f;
            _invincibleTimer = 0f;
            CurrentPowerUp   = PowerUpType.None;
            PowerUpTimer     = 0f;
            _canDoubleJump   = false;
            _hasDoubleJumped = false;
        }

        // ── Draw ──────────────────────────────────────────────────────────

        public override void Draw(SpriteBatch sb, Vector2 camPos)
        {
            if (_isDead) return;
            // Flash during invincibility
            if (IsInvincible && (int)(_invincibleTimer * 8) % 2 == 1) return;

            int x = (int)(Position.X - camPos.X);
            int y = (int)(Position.Y - camPos.Y);

            Color body    = Color.SaddleBrown;
            Color snout   = new Color(210, 150, 110);
            Color belly   = new Color(210, 160, 110);
            Color black   = Color.Black;
            Color noseCol = new Color(160, 60, 60);

            // Ears
            DrawHelper.DrawRect(sb, x + 2,  y - 8, 11, 11, body);
            DrawHelper.DrawRect(sb, x + 23, y - 8, 11, 11, body);

            // Head
            DrawHelper.DrawRect(sb, x + 1, y,     34, 24, body);

            // Snout
            DrawHelper.DrawRect(sb, x + 8,  y + 10, 20, 12, snout);
            // Nose
            DrawHelper.DrawRect(sb, x + 13, y + 10, 10,  6, noseCol);
            // Eye (changes side based on facing)
            int eyeX = _facingRight ? x + 22 : x + 6;
            DrawHelper.DrawRect(sb, eyeX, y + 5, 6, 6, black);
            // Eye shine
            DrawHelper.DrawRect(sb, eyeX + 1, y + 5, 2, 2, Color.White);

            // Body
            DrawHelper.DrawRect(sb, x + 5, y + 22, 26, 26, body);
            // Belly
            DrawHelper.DrawRect(sb, x + 9, y + 26, 18, 18, belly);

            // Legs – alternate up/down for walk animation
            int lOff = (_animFrame % 2 == 0 && IsGrounded) ? 2 : 0;
            // Left leg
            DrawHelper.DrawRect(sb, x + 5,  y + 44 + lOff,  11, 10, body);
            // Right leg
            DrawHelper.DrawRect(sb, x + 20, y + 44 - lOff,  11, 10, body);

            // Power-up glow above head
            if (CurrentPowerUp != PowerUpType.None)
            {
                Color glowColor = CurrentPowerUp switch
                {
                    PowerUpType.DoubleJump    => Color.Cyan,
                    PowerUpType.Speed         => Color.LimeGreen,
                    PowerUpType.Invincibility => Color.Gold,
                    _                          => Color.White
                };
                DrawHelper.DrawRect(sb, x + 11, y - 18, 14, 10, glowColor);
                DrawHelper.DrawOutline(sb, new Rectangle(x + 11, y - 18, 14, 10), Color.White, 1);
            }
        }
    }
}
