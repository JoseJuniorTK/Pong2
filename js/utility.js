window.Utility = {
    adjustAngle: function (angle) {
        const minCos = 0.3;
        if (Math.abs(Math.cos(angle)) < minCos) {
            angle = angle < 0 ? -Math.acos(minCos) : Math.acos(minCos);
        }
        return angle;
    },
    collision: function (ball, paddle) {
        return (
            ball.x + ball.radius > paddle.x &&
            ball.x - ball.radius < paddle.x + paddle.width &&
            ball.y + ball.radius > paddle.y &&
            ball.y - ball.radius < paddle.y + paddle.height
        );
    },
    collidesWithPowerUp: function (ball, p) {
        if (
            p.type === 'multiplyBall' ||
            p.type === 'hugeMultiplier' ||
            p.type === 'bigBall'
        ) {
            return (
                ball.x + ball.radius > p.x &&
                ball.x - ball.radius < p.x + p.size &&
                ball.y + ball.radius > p.y &&
                ball.y - ball.radius < p.y + p.size
            );
        } else if (p.type === 'revertBall') {
            return (
                ball.x + ball.radius > p.x &&
                ball.x - ball.radius < p.x + p.width &&
                ball.y + ball.radius > p.y &&
                ball.y - ball.radius < p.y + p.height
            );
        }
        return false;
    },
};
