(function () {
    const defaultAIFunction = function (dt) {
        if (window.GameState.balls.length > 0) {
            const targetY =
                window.GameState.balls[0].y - window.GameState.ai.height / 2;
            window.GameState.ai.y += (targetY - window.GameState.ai.y) * 0.1 * dt;
        }
    };

    window.AIManager.registerAI('ChatGPT-O3-Chan', defaultAIFunction, {
        backgroundImage: 'https://i.imgur.com/gPqUxOU.jpeg',
        paddleStyle: { color: '#fff' },
    });
})();
