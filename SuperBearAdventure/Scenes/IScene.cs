using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace SuperBearAdventure.Scenes
{
    /// <summary>Contract every game scene must implement.</summary>
    public interface IScene
    {
        void Update(GameTime gameTime);
        void Draw(SpriteBatch spriteBatch, SpriteFont font);
    }
}
