using System;
using Microsoft.Xna.Framework;

namespace SuperBearAdventure
{
    /// <summary>
    /// Smooth-follow 2D camera clamped to world boundaries.
    /// </summary>
    public sealed class Camera2D
    {
        public Vector2 Position { get; private set; }

        private readonly int _screenW;
        private readonly int _screenH;
        private const float Smoothing = 0.18f;

        public Camera2D(int screenWidth, int screenHeight)
        {
            _screenW = screenWidth;
            _screenH = screenHeight;
        }

        /// <summary>Smoothly move toward the target entity position.</summary>
        public void Follow(Vector2 target, int worldWidth, int worldHeight)
        {
            float tx = MathHelper.Clamp(target.X - _screenW / 2f, 0, Math.Max(0, worldWidth  - _screenW));
            float ty = MathHelper.Clamp(target.Y - _screenH / 2f, 0, Math.Max(0, worldHeight - _screenH));
            Position = new Vector2(
                MathHelper.Lerp(Position.X, tx, Smoothing),
                MathHelper.Lerp(Position.Y, ty, Smoothing));
        }

        /// <summary>Teleport (no interpolation).</summary>
        public void Snap(Vector2 target, int worldWidth, int worldHeight)
        {
            float tx = MathHelper.Clamp(target.X - _screenW / 2f, 0, Math.Max(0, worldWidth  - _screenW));
            float ty = MathHelper.Clamp(target.Y - _screenH / 2f, 0, Math.Max(0, worldHeight - _screenH));
            Position = new Vector2(tx, ty);
        }

        /// <summary>Returns the SpriteBatch matrix for world-space rendering.</summary>
        public Matrix GetTransform() =>
            Matrix.CreateTranslation(-Position.X, -Position.Y, 0f);

        public Vector2 ScreenToWorld(Vector2 screen) => screen + Position;
    }
}
