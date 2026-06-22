using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using SuperBearAdventure.Scenes;

namespace SuperBearAdventure
{
    /// <summary>
    /// Root MonoGame class.  Owns the SpriteBatch, font, and the active scene.
    /// Scene transitions are handled here so scenes only raise events.
    /// </summary>
    public sealed class Game1 : Game
    {
        // ── MonoGame infrastructure ────────────────────────────────────────
        private readonly GraphicsDeviceManager _graphics;
        private SpriteBatch?  _sb;
        private SpriteFont?   _font;

        private const int ScreenW = 1280;
        private const int ScreenH = 720;

        // ── Scene management ───────────────────────────────────────────────
        private IScene?        _activeScene;
        private IScene?        _pausedGameplay;  // kept alive while paused
        private GameState      _state = GameState.MainMenu;

        public Game1()
        {
            _graphics = new GraphicsDeviceManager(this)
            {
                PreferredBackBufferWidth  = ScreenW,
                PreferredBackBufferHeight = ScreenH,
                IsFullScreen             = false
            };
            Content.RootDirectory = "Content";
            IsMouseVisible         = false;
            Window.Title           = "Super Bear Adventure";
        }

        // ── MonoGame overrides ─────────────────────────────────────────────

        protected override void LoadContent()
        {
            _sb   = new SpriteBatch(GraphicsDevice);
            _font = Content.Load<SpriteFont>("Fonts/DefaultFont");
            DrawHelper.Initialize(GraphicsDevice);

            GoToMainMenu();
        }

        protected override void Update(GameTime gameTime)
        {
            // Global emergency exit
            if (Keyboard.GetState().IsKeyDown(Keys.F4))
                Exit();

            _activeScene?.Update(gameTime);

            base.Update(gameTime);
        }

        protected override void Draw(GameTime gameTime)
        {
            GraphicsDevice.Clear(Color.Black);
            _sb!.Begin(samplerState: SamplerState.PointClamp);
            _activeScene?.Draw(_sb, _font!);
            _sb.End();
            base.Draw(gameTime);
        }

        // ── Scene transitions ──────────────────────────────────────────────

        private void GoToMainMenu()
        {
            var scene = new MainMenuScene(ScreenW, ScreenH);
            scene.OnPlay  += GoToWorldMap;
            scene.OnQuit  += Exit;
            _activeScene   = scene;
            _state         = GameState.MainMenu;
            _pausedGameplay = null;
        }

        private void GoToWorldMap()
        {
            var scene = new WorldMapScene(ScreenW, ScreenH);
            scene.OnLevelSelected += (world, level) =>
            {
                GameManager.Instance.CurrentWorld = world;
                GameManager.Instance.CurrentLevel = level;
                StartGameplay(world, level);
            };
            _activeScene = scene;
            _state       = GameState.WorldMap;
        }

        private void StartGameplay(int world, int level)
        {
            var scene = new GameplayScene(ScreenW, ScreenH, world, level);
            scene.OnPause        += PauseGame;
            scene.OnLevelComplete += LevelComplete;
            scene.OnGameOver     += TriggerGameOver;
            _activeScene         = scene;
            _pausedGameplay      = null;
            _state               = GameState.Playing;
        }

        private void PauseGame()
        {
            _pausedGameplay = _activeScene;   // keep gameplay alive

            var pause = new PauseScene(ScreenW, ScreenH);
            pause.OnResume   += ResumeGame;
            pause.OnRestart  += () =>
            {
                GameManager.Instance.NewGame();
                StartGameplay(GameManager.Instance.CurrentWorld,
                              GameManager.Instance.CurrentLevel);
            };
            pause.OnMainMenu += GoToMainMenu;
            _activeScene     = pause;
            _state           = GameState.Paused;
        }

        private void ResumeGame()
        {
            _activeScene    = _pausedGameplay;
            _pausedGameplay = null;
            _state          = GameState.Playing;
        }

        private void LevelComplete()
        {
            var gm = GameManager.Instance;
            // Advance to next level / world
            if (gm.CurrentLevel < 2)
            {
                gm.CurrentLevel++;
                StartGameplay(gm.CurrentWorld, gm.CurrentLevel);
            }
            else if (gm.CurrentWorld < 2)
            {
                gm.CurrentWorld++;
                gm.CurrentLevel = 0;
                GoToWorldMap();
            }
            else
            {
                // All worlds complete
                GoToMainMenu();
            }
        }

        private void TriggerGameOver()
        {
            var scene = new GameOverScene(ScreenW, ScreenH);
            scene.OnRetry    += () =>
            {
                GameManager.Instance.NewGame();
                StartGameplay(0, 0);
            };
            scene.OnMainMenu += GoToMainMenu;
            _activeScene = scene;
            _state       = GameState.GameOver;
        }
    }
}
