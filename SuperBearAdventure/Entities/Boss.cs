using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using System.Collections.Generic;
using SuperBearAdventure.World;

namespace SuperBearAdventure.Entities
{
    /// <summary>
    /// End-of-world boss enemy.
    /// – 3 HP, larger than normal enemies.
    /// – Alternates between patrol and a fast charge toward the player.
    /// </summary>
    public sealed class Boss : Enemy
    {
        private enum BossPhase { Patrol, ChargeWindup, Charge, Rest }

        private BossPhase _phase       = BossPhase.Patrol;
        private float     _phaseTimer  = 0f;
        private Vector2   _chargeDir;
        private int       _maxHealth;
        private float     _flashTimer  = 0f;

        // Health bar
        public int MaxHealth => _maxHealth;
        public int CurrentHealth => Health;

        public Boss(Vector2 position, Color bodyColor) 
            : base(position, EnemyType.Boss, 220f, bodyColor)
        {
            Health      = 3;
            _maxHealth  = 3;
            Size        = new Vector2(58, 66);
            _chaseRange = 800f; // always "see" the player
        }

        public override void Update(GameTime gameTime, List<Platform> platforms)
        {
            if (!IsActive) return;

            float dt = (float)gameTime.ElapsedGameTime.TotalSeconds;
            _phaseTimer  -= dt;
            _flashTimer  -= dt;

            switch (_phase)
            {
                case BossPhase.Patrol:
                    // Slow patrol
                    Velocity = new Vector2(_movingRight ? 80f : -80f, Velocity.Y);
                    if (_startX + _patrolRange   < Position.X) _movingRight = false;
                    if (_startX - _patrolRange   > Position.X) _movingRight = true;
                    if (_phaseTimer <= 0f)
                    {
                        _phase      = BossPhase.ChargeWindup;
                        _phaseTimer = 0.6f;
                    }
                    break;

                case BossPhase.ChargeWindup:
                    // Stand still briefly before charging
                    Velocity = new Vector2(0, Velocity.Y);
                    if (_phaseTimer <= 0f)
                    {
                        _phase      = BossPhase.Charge;
                        _phaseTimer = 0.7f;
                    }
                    break;

                case BossPhase.Charge:
                    // Fast charge
                    float chargeSpd = 380f;
                    Velocity = new Vector2(_movingRight ? chargeSpd : -chargeSpd, Velocity.Y);
                    if (_phaseTimer <= 0f)
                    {
                        _phase      = BossPhase.Rest;
                        _phaseTimer = 1.2f;
                    }
                    break;

                case BossPhase.Rest:
                    Velocity = new Vector2(0, Velocity.Y);
                    if (_phaseTimer <= 0f)
                    {
                        _phase      = BossPhase.Patrol;
                        _phaseTimer = 3.0f;
                        _movingRight = !_movingRight;
                    }
                    break;
            }

            StepPhysics(gameTime, platforms);
            if (Velocity.X == 0f && _phase == BossPhase.Patrol) _movingRight = !_movingRight;
        }

        public override void Defeat()
        {
            Health--;
            _flashTimer = 0.25f;
            if (Health <= 0)
            {
                IsActive = false;
            }
            else
            {
                // Speed up when damaged
                _patrolRange *= 1.15f;
            }
        }

        public override void Draw(SpriteBatch sb, Vector2 camPos)
        {
            if (!IsActive) return;

            // Hit flash
            bool flash = _flashTimer > 0f && (int)(_flashTimer * 20) % 2 == 0;

            int x = (int)(Position.X - camPos.X);
            int y = (int)(Position.Y - camPos.Y);

            Color bodyCol  = flash ? Color.White : Color.DarkRed;
            Color accentCol = flash ? Color.White : new Color(120, 20, 20);

            // Body
            DrawHelper.DrawRect(sb, x + 4,  y + 20, 50, 46, bodyCol);
            // Head
            DrawHelper.DrawRect(sb, x + 6,  y,      46, 28, bodyCol);
            // Crown/spikes
            DrawHelper.DrawRect(sb, x + 10, y - 14, 10, 16, accentCol);
            DrawHelper.DrawRect(sb, x + 24, y - 18, 10, 20, accentCol);
            DrawHelper.DrawRect(sb, x + 38, y - 14, 10, 16, accentCol);
            // Eyes (glowing)
            DrawHelper.DrawRect(sb, x + 12, y + 8,  10, 8, Color.OrangeRed);
            DrawHelper.DrawRect(sb, x + 36, y + 8,  10, 8, Color.OrangeRed);
            // Fangs
            DrawHelper.DrawRect(sb, x + 16, y + 22, 6, 10, Color.White);
            DrawHelper.DrawRect(sb, x + 36, y + 22, 6, 10, Color.White);
            // Outline
            DrawHelper.DrawOutline(sb, new Rectangle(x + 4, y, 50, 66), Color.Black, 3);
            // Legs
            DrawHelper.DrawRect(sb, x + 6,  y + 56, 16, 12, bodyCol);
            DrawHelper.DrawRect(sb, x + 36, y + 56, 16, 12, bodyCol);

            // Health bar
            int barW = 80;
            int barX = x + (int)(Size.X / 2) - barW / 2;
            int barY = y - 22;
            DrawHelper.DrawRect(sb, barX, barY, barW, 10, Color.DarkRed);
            int fill = (int)(barW * ((float)Health / MaxHealth));
            DrawHelper.DrawRect(sb, barX, barY, fill, 10, Color.LimeGreen);
            DrawHelper.DrawOutline(sb, new Rectangle(barX, barY, barW, 10), Color.Black, 1);
        }
    }
}
