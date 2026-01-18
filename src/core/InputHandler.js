export class InputHandler {
    constructor(canvas, canvasManager) {
        this.canvas = canvas;
        this.canvasManager = canvasManager;
        this.mouse = { x: 0, y: 0 };
        this.isMouseDown = false;
        this.isShiftDown = false;

        // Event listeners
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Touch events could be added similarly
    }

    onMouseMove(e) {
        // We need to account for canvas scaling if any, but since we are full screen 1:1:
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    onMouseDown(e) {
        this.isMouseDown = true;
    }

    onMouseUp(e) {
        this.isMouseDown = false;
    }

    onKeyDown(e) {
        if (e.key === 'Shift') this.isShiftDown = true;
    }

    onKeyUp(e) {
        if (e.key === 'Shift') this.isShiftDown = false;
    }

    getMousePos() {
        return { ...this.mouse };
    }
}
