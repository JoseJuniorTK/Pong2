window.InputManager = (function () {
    const inputState = { up: false, down: false };

    function keyDownHandler(e) {
        if (e.key === 'ArrowUp') inputState.up = true;
        if (e.key === 'ArrowDown') inputState.down = true;
    }
    function keyUpHandler(e) {
        if (e.key === 'ArrowUp') inputState.up = false;
        if (e.key === 'ArrowDown') inputState.down = false;
    }
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    // Use the already-loaded CanvasManager and GameState.
    window.CanvasManager.canvas.addEventListener('mousemove', function (e) {
        const rect = window.CanvasManager.canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        window.GameState.player.y = mouseY - window.GameState.player.height / 2;
        if (window.GameState.player.y < 0) window.GameState.player.y = 0;
        if (
            window.GameState.player.y >
            window.CanvasManager.canvas.height - window.GameState.player.height
        )
            window.GameState.player.y =
                window.CanvasManager.canvas.height - window.GameState.player.height;
    });
    window.CanvasManager.canvas.addEventListener('mousedown', function (e) {
        if (e.button === 0) {
            window.GameState.parryAttempt = true;
        }
    });
    return { getState: () => inputState };
})();
