using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using System.Collections.Generic;
using SuperBearAdventure.World;

namespace SuperBearAdventure.Entities
{
    /// <summary>
    /// Regular enemy: either patrols a fixed range or chases the player when close.
    /// Defeated by the player stomping from above; harms the player on side contact.
    /// </summary>
    public class Enemy : Entity
    {
        public EnemyType  Type         { get; }
        public int        Health        { get; protected set; } = 1;
        public bool       IsDefeated    => !IsActive;

        protected float   _patrolRange;
        protected float   _startX;
        protected bool    _movingRight  = true;
        protected float   _chaseRange   = 260f;

        private Color   _color;

        // Appearance depends on theme world colour, set at construction
        public Enemy(Vector2 position, EnemyType type, float patrolRange, Color bodyColor)
        {
            Type         = type;
            _patrolRange = patrolRange;
            _startX      = position.X;
            _color       = bodyColor;
            Position     = position;
            Size         = new Vector2(34, 38);
        }

        // ── Update ─────────────────────────────────────────────────────────

        public override void Update(GameTime gameTime, List<Platform> platforms)
        {
            if (!IsActive) return;

            float dt = (float)gameTime.ElapsedGameTime.TotalSeconds;

            float speed = Type == EnemyType.Chaser ? 140f : 100f;

            float vx = _movingRight ? speed : -speed;
            Velocity = new Vector2(vx, Velocity.Y);

            StepPhysics(gameTime, platforms);

            // Patrol: reverse at range edges or on wall hit
            if (Type == EnemyType.Patrol)
            {
                if (Position.X >= _startX + _patrolRange) { _movingRight = false; }
                if (Position.X <= _startX - _patrolRange) { _movingRight = true;  }
            }

            // If we hit a wall (velocity cancelled by physics) flip direction
            if (Velocity.X == 0f) _movingRight = !_movingRight;
        }

        /// <summary>Called by GameplayScene when player is nearby. Enables chasing.</summary>
        public void ChasePlayer(Vector2 playerPos, GameTime gameTime)
        {
            if (Type != EnemyType.Chaser) return;
            float dist = Math.Abs(playerPos.X - Position.X);
            if (dist < _chaseRange)
                _movingRight = playerPos.X > Position.X;
        }

        public virtual void Defeat()
        {
            Health--;
            if (Health <= 0)
                IsActive = false;
        }

        // ── Draw ──────────────────────────────────────────────────────────

        public override void Draw(SpriteBatch sb, Vector2 camPos)
        {
            if (!IsActive) return;
            int x = (int)(Position.X - camPos.X);
            int y = (int)(Position.Y - camPos.Y);

            // Body
            DrawHelper.DrawRect(sb, x + 2, y + 10, 30, 28, _color);
            // Head
            DrawHelper.DrawRect(sb, x + 4, y,      26, 18, _color);
            // Eyes (mean slant)
            DrawHelper.DrawRect(sb, x + 7,  y + 4, 6, 5, Color.Red);
            DrawHelper.DrawRect(sb, x + 21, y + 4, 6, 5, Color.Red);
            // Outline
            DrawHelper.DrawOutline(sb, new Rectangle(x + 2, y, 30, 38), Color.Black, 2);
            // Legs
            DrawHelper.DrawRect(sb, x + 4,  y + 34, 10, 8, _color);
            DrawHelper.DrawRect(sb, x + 20, y + 34, 10, 8, _color);

            if (Type == EnemyType.Chaser)
            {
                // Chaser has teeth
                DrawHelper.DrawRect(sb, x + 8,  y + 14, 4, 5, Color.White);
                DrawHelper.DrawRect(sb, x + 14, y + 14, 4, 5, Color.White);
                DrawHelper.DrawRect(sb, x + 20, y + 14, 4, 5, Color.White);
            }
        }
    }
}
