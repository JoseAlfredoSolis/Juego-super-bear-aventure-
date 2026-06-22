using System;
using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using SuperBearAdventure.World;

namespace SuperBearAdventure.Entities
{
    /// <summary>
    /// Base class for all moving game objects (Player, Enemy, Boss).
    /// Handles AABB physics: gravity, platform collision resolved in two passes.
    /// </summary>
    public abstract class Entity
    {
        // ── Core state ─────────────────────────────────────────────────────
        public  Vector2 Position  { get; set; }
        public  Vector2 Velocity  { get; set; }
        public  bool    IsActive  { get; set; } = true;
        public  bool    IsGrounded { get; protected set; }

        protected Vector2 Size { get; set; }

        public Rectangle Bounds =>
            new Rectangle((int)Position.X, (int)Position.Y, (int)Size.X, (int)Size.Y);

        // ── Physics constants ──────────────────────────────────────────────
        protected const float GravityAccel  = 1800f;
        protected const float MaxFallSpeed  = 900f;

        // ── Abstract interface ─────────────────────────────────────────────
        public abstract void Update(GameTime gameTime, List<Platform> platforms);
        public abstract void Draw(SpriteBatch sb, Vector2 cameraPos);

        // ── Physics helpers ────────────────────────────────────────────────

        protected void StepPhysics(GameTime gameTime, List<Platform> platforms)
        {
            float dt = (float)gameTime.ElapsedGameTime.TotalSeconds;

            // Gravity
            if (!IsGrounded)
            {
                float vy = Velocity.Y + GravityAccel * dt;
                Velocity = new Vector2(Velocity.X, MathF.Min(vy, MaxFallSpeed));
            }

            // --- X pass ---
            Position = new Vector2(Position.X + Velocity.X * dt, Position.Y);
            SolveX(platforms);

            // --- Y pass ---
            Position = new Vector2(Position.X, Position.Y + Velocity.Y * dt);
            IsGrounded = SolveY(platforms);
        }

        private void SolveX(List<Platform> platforms)
        {
            foreach (var p in platforms)
            {
                if (!Bounds.Intersects(p.Bounds)) continue;
                var r = Rectangle.Intersect(Bounds, p.Bounds);
                // Only handle if overlap is primarily horizontal
                if (r.Width >= r.Height) continue;
                if (Velocity.X > 0)
                    Position = new Vector2(p.Bounds.Left - Size.X, Position.Y);
                else if (Velocity.X < 0)
                    Position = new Vector2(p.Bounds.Right, Position.Y);
                Velocity = new Vector2(0f, Velocity.Y);
            }
        }

        private bool SolveY(List<Platform> platforms)
        {
            bool grounded = false;
            foreach (var p in platforms)
            {
                if (!Bounds.Intersects(p.Bounds)) continue;
                var r = Rectangle.Intersect(Bounds, p.Bounds);
                if (r.Height < r.Width) // primarily vertical overlap
                {
                    if (Velocity.Y >= 0f)
                    {
                        // Landing on top
                        Position  = new Vector2(Position.X, p.Bounds.Top - Size.Y);
                        Velocity  = new Vector2(Velocity.X, 0f);
                        grounded  = true;
                    }
                    else
                    {
                        // Hitting ceiling
                        Position = new Vector2(Position.X, p.Bounds.Bottom);
                        Velocity = new Vector2(Velocity.X, 0f);
                    }
                }
            }
            return grounded;
        }
    }
}
