using System;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace SuperBearAdventure
{
    /// <summary>
    /// Centralised drawing helper. Initialise once, then use DrawRect / DrawOutline
    /// throughout the project.
    /// </summary>
    public static class DrawHelper
    {
        private static Texture2D? _pixel;

        /// <summary>Call this once in Game1.LoadContent.</summary>
        public static void Initialize(GraphicsDevice gd)
        {
            _pixel = new Texture2D(gd, 1, 1);
            _pixel.SetData(new[] { Color.White });
        }

        public static Texture2D Pixel
        {
            get
            {
                if (_pixel is null)
                    throw new InvalidOperationException("DrawHelper.Initialize() has not been called.");
                return _pixel;
            }
        }

        public static void DrawRect(SpriteBatch sb, Rectangle rect, Color color)
            => sb.Draw(Pixel, rect, color);

        public static void DrawRect(SpriteBatch sb, int x, int y, int w, int h, Color color)
            => DrawRect(sb, new Rectangle(x, y, w, h), color);

        /// <summary>Returns a brightened version of a color by adding the given amount to each channel.</summary>
        public static Color Brighten(Color c, int amount) =>
            new Color(
                Math.Min(c.R + amount, 255),
                Math.Min(c.G + amount, 255),
                Math.Min(c.B + amount, 255),
                c.A);

        public static void DrawOutline(SpriteBatch sb, Rectangle rect, Color color, int thickness = 2)
        {
            DrawRect(sb, new Rectangle(rect.X,                        rect.Y,                        rect.Width, thickness), color);
            DrawRect(sb, new Rectangle(rect.X,                        rect.Bottom - thickness,        rect.Width, thickness), color);
            DrawRect(sb, new Rectangle(rect.X,                        rect.Y,                        thickness,  rect.Height), color);
            DrawRect(sb, new Rectangle(rect.Right - thickness,        rect.Y,                        thickness,  rect.Height), color);
        }
    }
}
