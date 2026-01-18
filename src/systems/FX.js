export class FXManager {
    constructor(canvasManager) {
        this.shakeTime = 0;
        this.shakeMagnitude = 0;
        this.ctx = canvasManager.ctx;
        this.offset = { x: 0, y: 0 };
    }

    triggerShake(magnitude = 10, duration = 0.5) {
        this.shakeMagnitude = magnitude;
        this.shakeTime = duration;
    }

    update(deltaTime) {
        if (this.shakeTime > 0) {
            this.shakeTime -= deltaTime;
            const dampening = this.shakeTime / 0.5; // Linear falloff (assuming 0.5 duration roughly)
            this.offset.x = (Math.random() - 0.5) * this.shakeMagnitude * dampening;
            this.offset.y = (Math.random() - 0.5) * this.shakeMagnitude * dampening;
        } else {
            this.offset.x = 0;
            this.offset.y = 0;
        }
    }

    applyTransform() {
        this.ctx.save();
        this.ctx.translate(this.offset.x, this.offset.y);
    }

    restoreTransform() {
        this.ctx.restore();
    }
}
