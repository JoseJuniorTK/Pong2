window.BackgroundMusicManager = (function() {
    let currentAudio = null;

    function playMusic(url) {
        if (currentAudio) {
            currentAudio.pause();
        }
        currentAudio = new Audio(url);
        currentAudio.loop = true;
        currentAudio.play().catch(e => {
            console.error("Error playing background music:", e);
        });
    }

    function stopMusic() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
    }

    return {
        playMusic: playMusic,
        stopMusic: stopMusic
    };
})();
