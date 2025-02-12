window.AudioManager = (function () {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playTone(frequency, duration) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    }
    function paddleHitSound() {
        playTone(400, 0.1);
    }
    function wallBounceSound() {
        playTone(600, 0.1);
    }
    function scoreSound() {
        playTone(250, 0.2);
    }
    function clapSound() {
        playTone(800, 0.1);
    }
    return {
        playTone,
        paddleHitSound,
        wallBounceSound,
        scoreSound,
        clapSound,
    };
})();
