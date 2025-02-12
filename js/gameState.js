window.GameState = (function () {
    let level = 1;
    let gamePaused = true;
    let pauseMessage = '';
    const ballBaseSpeedConst = 9;
    let ballCurrentSpeed = ballBaseSpeedConst;
    const player = {
        x: 10,
        y: window.CanvasManager.canvas.height / 2 - 50,
        width: 10,
        height: 100,
        speed: 8,
    };
    const ai = {
        x: window.CanvasManager.canvas.width - 20,
        y: window.CanvasManager.canvas.height / 2 - 50,
        width: 10,
        height: 100,
        score: 0,
        speed: 5,
    };
    let balls = [];
    let powerUps = [];
    let shakeTime = 0;
    const shakeDuration = 200;
    const shakeMagnitude = 10;
    let chargeCount = 0;
    const maxCharge = 5;
    let parryAttempt = false;
    let parryActive = false;
    let parryTextDisplayTime = 0;
    let parrySpeedMultiplier = 1;
    let parryDisplayX = 0;
    let parryDisplayY = 0;
    let inCountdown = false;

    // Load persistent death counter.
    ai.score = parseInt(localStorage.getItem('deathCounter')) || 0;
    document.getElementById('ai-score').textContent = ai.score;

    return {
        get level() {
            return level;
        },
        set level(val) {
            level = val;
        },
        get gamePaused() {
            return gamePaused;
        },
        set gamePaused(val) {
            gamePaused = val;
        },
        get pauseMessage() {
            return pauseMessage;
        },
        set pauseMessage(val) {
            pauseMessage = val;
        },
        get ballCurrentSpeed() {
            return ballCurrentSpeed;
        },
        set ballCurrentSpeed(val) {
            ballCurrentSpeed = val;
        },
        ballBaseSpeedConst: ballBaseSpeedConst,
        player: player,
        ai: ai,
        balls: balls,
        powerUps: powerUps,
        getShakeTime: function () {
            return shakeTime;
        },
        setShakeTime: function (val) {
            shakeTime = val;
        },
        get shakeDuration() {
            return shakeDuration;
        },
        get shakeMagnitude() {
            return shakeMagnitude;
        },
        get chargeCount() {
            return chargeCount;
        },
        set chargeCount(val) {
            chargeCount = val;
        },
        get maxCharge() {
            return maxCharge;
        },
        get parryAttempt() {
            return parryAttempt;
        },
        set parryAttempt(val) {
            parryAttempt = val;
        },
        get parryActive() {
            return parryActive;
        },
        set parryActive(val) {
            parryActive = val;
        },
        get parryTextDisplayTime() {
            return parryTextDisplayTime;
        },
        set parryTextDisplayTime(val) {
            parryTextDisplayTime = val;
        },
        get parrySpeedMultiplier() {
            return parrySpeedMultiplier;
        },
        set parrySpeedMultiplier(val) {
            parrySpeedMultiplier = val;
        },
        get parryDisplayX() {
            return parryDisplayX;
        },
        set parryDisplayX(val) {
            parryDisplayX = val;
        },
        get parryDisplayY() {
            return parryDisplayY;
        },
        set parryDisplayY(val) {
            parryDisplayY = val;
        },
        get inCountdown() {
            return inCountdown;
        },
        set inCountdown(val) {
            inCountdown = val;
        },
        updateAIscore: function () {
            localStorage.setItem('deathCounter', ai.score);
            document.getElementById('ai-score').textContent = ai.score;
        },
        updateDifficulty: function () {
            const multiplier = 1.0 + (level - 1) * 0.3;
            ballCurrentSpeed = ballBaseSpeedConst * multiplier;
            ai.speed = 5 + (level - 1) * 2;
        },
        resetGameState: function () {
            level = 1;
            this.updateDifficulty();
            if (window.GameEngine) {
                window.GameEngine.resetBall();
            }
            powerUps.length = 0;
            chargeCount = 0;
            parrySpeedMultiplier = 1;
        },
    };
})();
