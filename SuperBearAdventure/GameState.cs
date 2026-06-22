namespace SuperBearAdventure
{
    // -----------------------------------------------------------------------
    // Game state (which screen is active)
    // -----------------------------------------------------------------------
    public enum GameState
    {
        MainMenu,
        WorldMap,
        Playing,
        Paused,
        GameOver,
        Victory
    }

    // -----------------------------------------------------------------------
    // Power-up kinds available in the game
    // -----------------------------------------------------------------------
    public enum PowerUpType
    {
        None,
        DoubleJump,
        Speed,
        Invincibility
    }

    // -----------------------------------------------------------------------
    // Enemy behaviour patterns
    // -----------------------------------------------------------------------
    public enum EnemyType
    {
        Patrol,   // walks back-and-forth on a fixed range
        Chaser,   // rushes the player when nearby
        Boss      // large, multi-phase
    }

    // -----------------------------------------------------------------------
    // Collectible kinds
    // -----------------------------------------------------------------------
    public enum CollectibleType
    {
        Coin,
        Star
    }

    // -----------------------------------------------------------------------
    // Visual/physics theme for each world
    // -----------------------------------------------------------------------
    public enum WorldTheme
    {
        Forest,
        Cave,
        Snow
    }
}
