(function () {
    window.MenuManager.init();
    window.GameState.updateDifficulty();
    window.GameEngine.resetBall();
    window.GameEngine.start();
})();