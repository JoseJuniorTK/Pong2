window.startCountdown = function (callback) {
    let count = 3;
    window.GameState.gamePaused = true;
    window.GameState.inCountdown = true;
    function countdownTick() {
        if (count > 0) {
            window.GameState.pauseMessage = count;
            count--;
            setTimeout(countdownTick, 1000);
        } else {
            window.GameState.pauseMessage = 'GO';
            setTimeout(function () {
                window.GameState.pauseMessage = '';
                window.GameState.gamePaused = false;
                window.GameState.inCountdown = false;
                if (callback) callback();
            }, 1000);
        }
    }
    countdownTick();
};
