using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace SuperBearAdventure.World
{
    /// <summary>A solid rectangular obstacle or ground segment.</summary>
    public sealed class Platform
    {
        public Rectangle Bounds { get; }

        // Tint colour lets each world theme look different
        public Color Color { get; }

        public Platform(int x, int y, int width, int height, Color color)
        {
            Bounds = new Rectangle(x, y, width, height);
            Color  = color;
        }

        public void Draw(SpriteBatch sb)
        {
            DrawHelper.DrawRect(sb, Bounds, Color);
            // Slightly lighter top edge for a fake-depth look
            DrawHelper.DrawRect(sb, new Rectangle(Bounds.X, Bounds.Y, Bounds.Width, 4),
                DrawHelper.Brighten(Color, 40));
        }
    }
}
