window.CanvasManager = (function () {
    const canvas = document.getElementById('pong');
    const ctx = canvas.getContext('2d');
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // You can dispatch a resize event or update dependent positions here if needed.
    }
    window.addEventListener('resize', resize);
    resize();
    return { canvas, ctx, resize };
})();
