window.AIManager = (function () {
    const bossAIs = {};
    let selectedBossAIName = null;

    // Call this from any AI file to register a new boss AI.
    function registerAI(name, aiFunction, options = {}) {
        bossAIs[name] = { aiFunction, options };
        if (typeof window.updateAIMenu === 'function') {
            window.updateAIMenu();
        }
    }

    function update(dt) {
        if (selectedBossAIName && bossAIs[selectedBossAIName]) {
            bossAIs[selectedBossAIName].aiFunction(dt);
        } else if (bossAIs['ChatGPT-O3-Chan']) {
            selectedBossAIName = 'ChatGPT-O3-Chan';
            bossAIs[selectedBossAIName].aiFunction(dt);
        }
    }

    function getAIs() {
        return bossAIs;
    }

    return {
        registerAI: registerAI,
        update: update,
        get selectedBossAIName() {
            return selectedBossAIName;
        },
        set selectedBossAIName(val) {
            selectedBossAIName = val;
        },
        getAIs: getAIs,
    };
})();
