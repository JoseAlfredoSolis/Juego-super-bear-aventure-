namespace SuperBearAdventure
{
    /// <summary>
    /// Singleton that persists across scenes and levels.
    /// Stores lives, score, coins, progress, and high score.
    /// </summary>
    public sealed class GameManager
    {
        // ── Singleton ──────────────────────────────────────────────────────
        public static GameManager Instance { get; } = new GameManager();
        private GameManager() { }

        // ── Player global stats ────────────────────────────────────────────
        public int Lives      { get; set; } = 3;
        public int Score      { get; set; } = 0;
        public int Coins      { get; set; } = 0;
        public int HighScore  { get; set; } = 0;

        // ── Progress ───────────────────────────────────────────────────────
        /// <summary>0-based world index (0=Forest, 1=Cave, 2=Snow).</summary>
        public int CurrentWorld { get; set; } = 0;
        /// <summary>0-based level index within the current world.</summary>
        public int CurrentLevel { get; set; } = 0;

        // worlds[world][level] = completed?
        private readonly bool[][] _completed = { new bool[3], new bool[3], new bool[3] };
        // worlds[world] = unlocked?
        private readonly bool[] _worldUnlocked = { true, false, false };

        public bool IsLevelCompleted(int world, int level) => _completed[world][level];
        public bool IsWorldUnlocked(int world) => _worldUnlocked[world];

        public void MarkLevelCompleted(int world, int level)
        {
            _completed[world][level] = true;
            // Unlock next world when all 3 levels of this world are done
            if (level == 2 && world + 1 < 3)
                _worldUnlocked[world + 1] = true;
        }

        // ── Score helpers ──────────────────────────────────────────────────
        public void AddScore(int amount)
        {
            Score += amount;
            if (Score > HighScore) HighScore = Score;
        }

        // ── Reset for new game ─────────────────────────────────────────────
        public void NewGame()
        {
            Lives = 3;
            Score = 0;
            Coins = 0;
            CurrentWorld = 0;
            CurrentLevel = 0;
            for (int w = 0; w < 3; w++)
                for (int l = 0; l < 3; l++)
                    _completed[w][l] = false;
            _worldUnlocked[0] = true;
            _worldUnlocked[1] = false;
            _worldUnlocked[2] = false;
        }
    }
}
