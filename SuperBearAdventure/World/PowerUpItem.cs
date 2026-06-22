using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace SuperBearAdventure.World
{
    /// <summary>A power-up box the player steps on to gain a temporary ability.</summary>
    public sealed class PowerUpItem
    {
        public Vector2 Position { get; }
        public PowerUpType Type { get; }
        public bool IsCollected { get; private set; }

        public Rectangle Bounds => new Rectangle((int)Position.X, (int)Position.Y, 30, 30);

        public PowerUpItem(Vector2 position, PowerUpType type)
        {
            Position = position;
            Type     = type;
        }

        public void Collect() => IsCollected = true;

        private static Color ColorOf(PowerUpType t) => t switch
        {
            PowerUpType.DoubleJump   => Color.Cyan,
            PowerUpType.Speed        => Color.LimeGreen,
            PowerUpType.Invincibility => Color.Gold,
            _                         => Color.White
        };

        public void Draw(SpriteBatch sb)
        {
            if (IsCollected) return;
            int x = (int)Position.X, y = (int)Position.Y;
            Color c = ColorOf(Type);
            // Outer box
            DrawHelper.DrawRect(sb, x, y, 30, 30, c);
            // Dark border
            DrawHelper.DrawOutline(sb, Bounds, Color.Black, 2);
            // Inner symbol
            switch (Type)
            {
                case PowerUpType.DoubleJump:
                    // Two arrows up
                    DrawHelper.DrawRect(sb, x + 12, y + 4,  6, 12, Color.White);
                    DrawHelper.DrawRect(sb, x + 12, y + 14, 6, 10, Color.White);
                    DrawHelper.DrawRect(sb, x + 9,  y + 10, 12, 4, Color.White);
                    break;
                case PowerUpType.Speed:
                    // Lightning bolt
                    DrawHelper.DrawRect(sb, x + 16, y + 4,  6, 10, Color.White);
                    DrawHelper.DrawRect(sb, x + 8,  y + 12, 14, 4,  Color.White);
                    DrawHelper.DrawRect(sb, x + 8,  y + 16, 6,  10, Color.White);
                    break;
                case PowerUpType.Invincibility:
                    // Star shape
                    DrawHelper.DrawRect(sb, x + 12, y + 4,  6, 22, Color.White);
                    DrawHelper.DrawRect(sb, x + 4,  y + 12, 22, 6,  Color.White);
                    break;
            }
        }
    }
}
