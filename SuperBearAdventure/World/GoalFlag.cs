using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace SuperBearAdventure.World
{
    /// <summary>The end-of-level flag. Reaching it completes the level.</summary>
    public sealed class GoalFlag
    {
        public Vector2 Position { get; }

        // The actual trigger area (base of the pole)
        public Rectangle Bounds => new Rectangle((int)Position.X, (int)Position.Y, 40, 80);

        public GoalFlag(Vector2 position) => Position = position;

        public void Draw(SpriteBatch sb)
        {
            int x = (int)Position.X, y = (int)Position.Y;
            // Pole
            DrawHelper.DrawRect(sb, x + 18, y - 80, 4, 160, Color.Silver);
            // Flag waving
            DrawHelper.DrawRect(sb, x + 22, y - 76, 28, 20, Color.LimeGreen);
            DrawHelper.DrawRect(sb, x + 22, y - 56, 24, 4,  Color.DarkGreen);
            // Base
            DrawHelper.DrawRect(sb, x,      y + 60, 40, 20, Color.Gray);
        }
    }
}
