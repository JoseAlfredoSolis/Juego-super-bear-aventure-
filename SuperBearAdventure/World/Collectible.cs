using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace SuperBearAdventure.World
{
    /// <summary>A coin or star the player can collect for points.</summary>
    public sealed class Collectible
    {
        public Vector2 Position { get; }
        public CollectibleType Type { get; }
        public bool IsCollected { get; private set; }

        public Rectangle Bounds => new Rectangle((int)Position.X, (int)Position.Y, 24, 24);

        public int ScoreValue => Type == CollectibleType.Star ? 200 : 50;

        public Collectible(Vector2 position, CollectibleType type)
        {
            Position = position;
            Type     = type;
        }

        public void Collect() => IsCollected = true;

        public void Draw(SpriteBatch sb)
        {
            if (IsCollected) return;
            Color c = Type == CollectibleType.Star ? Color.Yellow : Color.Gold;
            // Draw a simple diamond shape using two rects
            int x = (int)Position.X, y = (int)Position.Y;
            DrawHelper.DrawRect(sb, x + 6, y,      12, 24, c);
            DrawHelper.DrawRect(sb, x,     y + 6,  24, 12, c);
            // Sparkle centre
            DrawHelper.DrawRect(sb, x + 9, y + 9,  6,  6, Color.White);
        }
    }
}
