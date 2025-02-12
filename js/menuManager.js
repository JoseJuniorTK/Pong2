window.MenuManager = (function () {
    const menuEl = document.getElementById('menu');
    const bossMenuEl = document.getElementById('boss-menu');
    const startButton = document.getElementById('start-button');
    const bossStartButton = document.getElementById('boss-start-button');

    function init() {
        startButton.addEventListener('click', function () {
            hideMenu();
            showBossMenu();
        });
        updateAIMenu();
        bossStartButton.addEventListener('click', function () {
            if (!window.AIManager.selectedBossAIName) {
                window.AIManager.selectedBossAIName = 'ChatGPT-O3-Chan';
            }
            window.GameState.resetGameState();
            bossMenuEl.style.display = 'none';
            window.startCountdown();
        });
    }

    function updateAIMenu() {
        const bossOptionsContainer = bossMenuEl.querySelector('.boss-options-container');
        bossOptionsContainer.innerHTML = '';
        const ais = window.AIManager.getAIs();
        Object.keys(ais).forEach(function (aiName) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('boss-option-wrapper');
            const option = document.createElement('div');
            option.classList.add('boss-option');
            option.setAttribute('data-ai', aiName);
            const options = ais[aiName].options;
            if (options && options.backgroundImage) {
                option.style.background = 'url(' + options.backgroundImage + ')';
                option.style.backgroundSize = 'cover';
                option.style.backgroundPosition = 'center';
            }
            const title = document.createElement('div');
            title.classList.add('boss-title');
            title.textContent = aiName;
            wrapper.appendChild(option);
            wrapper.appendChild(title);
            bossOptionsContainer.appendChild(wrapper);

            option.addEventListener('click', function () {
                const allOptions = bossMenuEl.querySelectorAll('.boss-option');
                allOptions.forEach(function (opt) {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                window.AIManager.selectedBossAIName = aiName;
                bossStartButton.style.display = 'block';
            });
        });
    }

    function showMenu() {
        menuEl.style.display = 'flex';
        window.GameState.gamePaused = true;
    }
    function hideMenu() {
        menuEl.style.display = 'none';
    }
    function showBossMenu() {
        bossMenuEl.style.display = 'flex';
    }

    // Expose updateAIMenu globally so that AI files can trigger updates.
    window.updateAIMenu = updateAIMenu;

    return { init: init, showMenu: showMenu, hideMenu: hideMenu, showBossMenu: showBossMenu };
})();
