export class DigitalRainSystem {
    constructor(width, height) {
        this.columns = [];
        this.fontSize = 14;
        this.resize(width, height);
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        const colCount = Math.floor(width / this.fontSize);
        this.columns = [];
        for (let i = 0; i < colCount; i++) {
            this.columns.push({
                x: i * this.fontSize,
                y: Math.random() * height,
                speed: Math.random() * 2 + 1,
                chars: [],
                changeTimer: 0
            });
        }
    }

    update(deltaTime) {
        for (const col of this.columns) {
            col.y += col.speed;

            // Randomly reset to top
            if (col.y > this.height && Math.random() > 0.98) {
                col.y = -Math.random() * 100; // Stagger re-entry
            }

            // Update characters (simulating changing code)
            col.changeTimer += deltaTime;
            if (col.changeTimer > 0.1) {
                // Generate a char
                const char = String.fromCharCode(0x30A0 + Math.random() * 96); // Katakana or something techy
                col.chars.unshift(char);
                if (col.chars.length > 20) col.chars.pop();
                col.changeTimer = 0;
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Fade effect
        // Actually, we want to draw specifically, but since we clear the canvas every frame in main render,
        // we need to draw fresh every time.
        // A traditional matrix rain implementation relies on not clearing the canvas fully to leave trails.
        // But our game clears the canvas.
        // So we will render columns explicitly.

        ctx.font = `${this.fontSize}px monospace`;

        for (const col of this.columns) {
            let y = col.y;
            col.chars.forEach((char, index) => {
                // Fade out towards the tail
                const alpha = 1 - (index / col.chars.length);
                if (index === 0) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; // Very faint white lead
                } else {
                    ctx.fillStyle = `rgba(0, 255, 65, ${alpha * 0.1})`; // Ghostly green
                }
                ctx.fillText(char, col.x, y - (index * this.fontSize));
            });
        }
    }
}
