window.GameEngine = (function () {
    function drawFlame(ctx, x, y, angle, ballRadius, opacity) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        const offset = ballRadius * 1.5;
        ctx.translate(-offset, 0);
        const flameWidth = ballRadius * 2.5;
        const flameHeight = ballRadius * 1.5;
        const grad = ctx.createLinearGradient(0, 0, -flameWidth, 0);
        grad.addColorStop(0, 'rgba(255,255,0,' + opacity + ')');
        grad.addColorStop(0.5, 'rgba(255,165,0,' + opacity * 0.8 + ')');
        grad.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, flameWidth, flameHeight, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function resetBall() {
        window.GameState.balls.length = 0;
        const directionX = Math.random() > 0.5 ? 1 : -1;
        let dx = window.GameState.ballCurrentSpeed * directionX;
        let dy = window.GameState.ballCurrentSpeed * (Math.random() * 2 - 1);
        if (Math.abs(dx) < window.GameState.ballCurrentSpeed * 0.3) {
            dx = (dx < 0 ? -1 : 1) * window.GameState.ballCurrentSpeed * 0.3;
            dy = Math.sqrt(window.GameState.ballCurrentSpeed ** 2 - dx ** 2) * (Math.random() < 0.5 ? 1 : -1);
        }
        const newBall = {
            x: window.CanvasManager.canvas.width / 2,
            y: window.CanvasManager.canvas.height / 2,
            radius: 10,
            dx: dx,
            dy: dy,
        };
        window.GameState.balls.push(newBall);
    }

    function createDuplicatedBall(collidedBall) {
        const speed = Math.sqrt(collidedBall.dx ** 2 + collidedBall.dy ** 2);
        let angle =
            Math.atan2(collidedBall.dy, collidedBall.dx) + ((Math.random() - 0.5) * 0.5);
        angle = window.Utility.adjustAngle(angle);
        return {
            x: collidedBall.x + 10,
            y: collidedBall.y + 10,
            radius: collidedBall.radius,
            dx: speed * Math.cos(angle),
            dy: speed * Math.sin(angle),
        };
    }

    function update(deltaTime) {
        const dt = deltaTime / (1000 / 60);
        if (window.GameState.gamePaused) return;

        // Update player movement.
        const input = window.InputManager.getState();
        if (input.up && window.GameState.player.y > 0)
            window.GameState.player.y -= window.GameState.player.speed * dt;
        if (
            input.down &&
            window.GameState.player.y <
            window.CanvasManager.canvas.height - window.GameState.player.height
        )
            window.GameState.player.y += window.GameState.player.speed * dt;

        // Update AI movement.
        if (window.GameState.balls.length > 0) {
            window.AIManager.update(dt);
        }
        if (window.GameState.ai.y < 0)
            window.GameState.ai.y = 0;
        if (
            window.GameState.ai.y >
            window.CanvasManager.canvas.height - window.GameState.ai.height
        )
            window.GameState.ai.y = window.CanvasManager.canvas.height - window.GameState.ai.height;

        let lastBallSide = null;

        // Update balls.
        for (let i = window.GameState.balls.length - 1; i >= 0; i--) {
            const b = window.GameState.balls[i];
            b.x += b.dx * dt * window.GameState.parrySpeedMultiplier;
            b.y += b.dy * dt * window.GameState.parrySpeedMultiplier;
            if (b.radius >= 100) {
                lastBallSide = 'left';
                window.GameState.balls.splice(i, 1);
                continue;
            }
            if (b.y + b.radius > window.CanvasManager.canvas.height) {
                b.y = window.CanvasManager.canvas.height - b.radius;
                b.dy = -Math.abs(b.dy) - ((Math.random() * 0.5 + 0.5) * dt);
                window.AudioManager.wallBounceSound();
                if (b.radius > 15) {
                    window.GameState.setShakeTime(window.GameState.shakeDuration);
                }
            } else if (b.y - b.radius < 0) {
                b.y = b.radius;
                b.dy = Math.abs(b.dy) + ((Math.random() * 0.5 + 0.5) * dt);
                window.AudioManager.wallBounceSound();
                if (b.radius > 15) {
                    window.GameState.setShakeTime(window.GameState.shakeDuration);
                }
            }
            if (window.Utility.collision(b, window.GameState.player)) {
                if (window.GameState.parryAttempt) {
                    window.GameState.parryActive = true;
                    window.GameState.parryTextDisplayTime = 1000;
                    window.GameState.parrySpeedMultiplier *= 2.0;
                    window.GameState.chargeCount = Math.min(
                        window.GameState.maxCharge,
                        window.GameState.chargeCount + 1
                    );
                    window.GameState.parryDisplayX = b.x;
                    window.GameState.parryDisplayY = b.y;
                    window.AudioManager.clapSound();
                    window.GameState.parryAttempt = false;
                    b.flameTimer = 1000;
                }
                b.x = window.GameState.player.x + window.GameState.player.width + b.radius;
                b.dx = -b.dx;
                b.dy =
                    (b.y - window.GameState.player.y - window.GameState.player.height / 2) *
                    0.2 *
                    dt;
                window.AudioManager.paddleHitSound();
                if (b.radius > 15) {
                    window.GameState.setShakeTime(window.GameState.shakeDuration);
                }
            } else if (window.Utility.collision(b, window.GameState.ai)) {
                b.x = window.GameState.ai.x - b.radius;
                b.dx = -b.dx;
                b.dy =
                    (b.y - window.GameState.ai.y - window.GameState.ai.height / 2) *
                    0.2 *
                    dt;
                if (window.GameState.parrySpeedMultiplier > 1) {
                    window.GameState.parrySpeedMultiplier = 1;
                    window.GameState.parryActive = false;
                }
                window.AudioManager.paddleHitSound();
                if (b.radius > 15) {
                    window.GameState.setShakeTime(window.GameState.shakeDuration);
                }
            }
            if (b.x - b.radius < 0) {
                lastBallSide = 'left';
                window.GameState.balls.splice(i, 1);
                continue;
            }
            if (b.x + b.radius > window.CanvasManager.canvas.width) {
                lastBallSide = 'right';
                window.GameState.balls.splice(i, 1);
                continue;
            }
            if (b.flameTimer && b.flameTimer > 0) {
                b.flameTimer -= deltaTime;
                if (b.flameTimer < 0) b.flameTimer = 0;
            }
        }

        // Check scoring.
        if (window.GameState.balls.length === 0 && lastBallSide !== null) {
            if (lastBallSide === 'left') {
                window.GameState.ai.score++;
                window.GameState.updateAIscore();
                window.AudioManager.scoreSound();
                pauseGame('Game Over', function () {
                    window.MenuManager.showMenu();
                }, false);
                return;
            } else if (lastBallSide === 'right') {
                window.AudioManager.scoreSound();
                window.GameState.level++;
                window.GameState.updateDifficulty();
                pauseGame('Level ' + window.GameState.level, function () {
                    resetBall();
                    window.GameState.powerUps.length = 0;
                    window.GameState.chargeCount = 0;
                    window.GameState.parrySpeedMultiplier = 1;
                }, true);
                return;
            }
        }

        // Update power-ups.
        for (let j = window.GameState.powerUps.length - 1; j >= 0; j--) {
            const p = window.GameState.powerUps[j];
            p.y += p.speed * dt;
            if (p.y > window.CanvasManager.canvas.height) {
                window.GameState.powerUps.splice(j, 1);
                continue;
            }
            for (let i = 0; i < window.GameState.balls.length; i++) {
                if (window.Utility.collidesWithPowerUp(window.GameState.balls[i], p)) {
                    const collidedBall = window.GameState.balls[i];
                    if (p.type === 'multiplyBall') {
                        window.GameState.balls.push(createDuplicatedBall(collidedBall));
                    } else if (p.type === 'hugeMultiplier') {
                        if (window.GameState.balls.length <= 2) {
                            for (let k = 0; k < 100; k++) {
                                window.GameState.balls.push(createDuplicatedBall(collidedBall));
                            }
                        }
                    } else if (p.type === 'bigBall') {
                        collidedBall.radius *= 2;
                        window.GameState.setShakeTime(window.GameState.shakeDuration);
                    } else if (p.type === 'revertBall') {
                        collidedBall.dx = -collidedBall.dx;
                    }
                    window.GameState.powerUps.splice(j, 1);
                    break;
                }
            }
        }

        // Spawn new power-ups.
        if (window.GameState.level >= 1) {
            if (Math.random() < 0.0005) {
                const size = 25;
                const x = Math.random() * (window.CanvasManager.canvas.width - size);
                window.GameState.powerUps.push({
                    x: x,
                    y: 0,
                    size: size,
                    speed: 3,
                    type: 'multiplyBall',
                });
            }
        }
        if (window.GameState.level >= 1 && window.GameState.balls.length <= 2) {
            if (Math.random() < 0.0001) {
                const size = 25;
                const x = Math.random() * (window.CanvasManager.canvas.width - size);
                window.GameState.powerUps.push({
                    x: x,
                    y: 0,
                    size: size,
                    speed: 3,
                    type: 'hugeMultiplier',
                });
            }
        }
        if (window.GameState.level >= 1) {
            if (Math.random() < 0.0005) {
                const size = 25;
                const x = Math.random() * (window.CanvasManager.canvas.width - size);
                window.GameState.powerUps.push({
                    x: x,
                    y: 0,
                    size: size,
                    speed: 3,
                    type: 'bigBall',
                });
            }
        }
        if (window.GameState.level >= 2) {
            if (Math.random() < 0.0002) {
                const width = 25,
                    height = 65;
                const x = Math.random() * (window.CanvasManager.canvas.width - width);
                window.GameState.powerUps.push({
                    x: x,
                    y: 0,
                    width: width,
                    height: height,
                    speed: 3,
                    type: 'revertBall',
                });
            }
        }

        if (window.GameState.getShakeTime() > 0) {
            let newTime = window.GameState.getShakeTime() - deltaTime;
            if (newTime < 0) newTime = 0;
            window.GameState.setShakeTime(newTime);
        }

        if (window.GameState.parryTextDisplayTime > 0) {
            window.GameState.parryTextDisplayTime -= deltaTime;
            if (window.GameState.parryTextDisplayTime <= 0) {
                window.GameState.parryActive = false;
            }
        }
    }

    function draw() {
        const ctx = window.CanvasManager.ctx;
        if (window.GameState.getShakeTime() > 0) {
            const dx = (Math.random() - 0.5) * 2 * window.GameState.shakeMagnitude;
            const dy = (Math.random() - 0.5) * 2 * window.GameState.shakeMagnitude;
            ctx.save();
            ctx.translate(dx, dy);
        }

        // Draw arena background.
        ctx.fillStyle = '#000';
        ctx.fillRect(
            0,
            0,
            window.CanvasManager.canvas.width,
            window.CanvasManager.canvas.height
        );

        // Draw paddles.
        ctx.fillStyle = '#fff';
        ctx.fillRect(
            window.GameState.player.x,
            window.GameState.player.y,
            window.GameState.player.width,
            window.GameState.player.height
        );
        ctx.fillRect(
            window.GameState.ai.x,
            window.GameState.ai.y,
            window.GameState.ai.width,
            window.GameState.ai.height
        );

        // Draw balls.
        window.GameState.balls.forEach(function (b) {
            if (b.flameTimer && b.flameTimer > 0) {
                const angle = Math.atan2(b.dy, b.dx);
                const opacity = b.flameTimer / 1000;
                drawFlame(ctx, b.x, b.y, angle, b.radius, opacity);
            }
            ctx.fillStyle = '#fff';
            ctx.fillRect(b.x - b.radius, b.y - b.radius, b.radius * 2, b.radius * 2);
        });

        // Draw power-ups.
        window.GameState.powerUps.forEach(function (p) {
            if (p.type === 'multiplyBall') {
                ctx.fillStyle = 'green';
                ctx.fillRect(p.x, p.y, p.size, p.size);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 12px "Press Start 2P", cursive';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText("2X", p.x + p.size / 2, p.y + p.size / 2);
            } else if (p.type === 'hugeMultiplier') {
                ctx.fillStyle = 'yellow';
                ctx.fillRect(p.x, p.y, p.size, p.size);
                ctx.fillStyle = 'black';
                ctx.font = 'bold 12px "Press Start 2P", cursive';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText("100X", p.x + p.size / 2, p.y + p.size / 2);
            } else if (p.type === 'bigBall') {
                ctx.fillStyle = 'orange';
                ctx.fillRect(p.x, p.y, p.size, p.size);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 12px "Press Start 2P", cursive';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText("BIG", p.x + p.size / 2, p.y + p.size / 2);
            } else if (p.type === 'revertBall') {
                ctx.fillStyle = 'red';
                ctx.fillRect(p.x, p.y, p.width, p.height);
                ctx.fillStyle = 'white';
                ctx.font = 'bold 12px "Press Start 2P", cursive';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText("REV", p.x + p.width / 2, p.y + p.height / 2);
            }
        });

        // Draw center dashed line.
        ctx.setLineDash([5, 15]);
        ctx.beginPath();
        ctx.moveTo(window.CanvasManager.canvas.width / 2, 0);
        ctx.lineTo(window.CanvasManager.canvas.width / 2, window.CanvasManager.canvas.height);
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        // Draw level text and charge bar.
        ctx.font = '16px "Press Start 2P", cursive';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText("Level " + window.GameState.level, 10, 30);
        const barX = window.CanvasManager.canvas.width - 120;
        const barY = 20;
        const barWidth = 100;
        const barHeight = 20;
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        const fillWidth = (window.GameState.chargeCount / window.GameState.maxCharge) * barWidth;
        ctx.fillStyle = 'cyan';
        ctx.fillRect(barX, barY, fillWidth, barHeight);
        ctx.font = '10px "Press Start 2P", cursive';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("Charge", barX + barWidth / 2, barY + barHeight / 2);

        // Draw "PARRY" text if active.
        if (window.GameState.parryActive) {
            const margin = 30;
            const offsetX = 70;
            const textX = Math.min(
                window.CanvasManager.canvas.width - margin,
                Math.max(margin, window.GameState.parryDisplayX + offsetX)
            );
            const textY = Math.min(
                window.CanvasManager.canvas.height - margin,
                Math.max(margin, window.GameState.parryDisplayY - 20)
            );
            ctx.fillStyle = '#ff0';
            ctx.font = '24px "Press Start 2P", cursive';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("PARRY", textX, textY);
        }

        // Overlay pause message if game is paused.
        if (window.GameState.gamePaused) {
            if (window.GameState.inCountdown) {
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.font = '36px "Press Start 2P", cursive';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(
                    window.GameState.pauseMessage,
                    window.CanvasManager.canvas.width / 2,
                    window.CanvasManager.canvas.height / 2 - 50
                );
            } else {
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(
                    0,
                    0,
                    window.CanvasManager.canvas.width,
                    window.CanvasManager.canvas.height
                );
                ctx.fillStyle = '#fff';
                ctx.font = '36px "Press Start 2P", cursive';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(
                    window.GameState.pauseMessage,
                    window.CanvasManager.canvas.width / 2,
                    window.CanvasManager.canvas.height / 2
                );
            }
        }

        if (window.GameState.getShakeTime() > 0) {
            ctx.restore();
        }
    }

    function pauseGame(message, callback, resumeAfter = true) {
        window.GameState.gamePaused = true;
        window.GameState.pauseMessage = message;
        setTimeout(function () {
            if (callback) callback();
            if (resumeAfter) window.GameState.gamePaused = false;
        }, 2000);
    }

    let lastTime = 0;
    function gameLoop(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        if (deltaTime > 0) update(deltaTime);
        draw();
        requestAnimationFrame(gameLoop);
    }

    return {
        resetBall: resetBall,
        start: function () {
            requestAnimationFrame(gameLoop);
        },
        pauseGame: pauseGame,
        update: update,
        draw: draw,
    };
})();