export class DecorationSystem {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.wisps = [];
        this.gridOffset = 0;

        // Initialize some wisps
        for (let i = 0; i < 20; i++) {
            this.wisps.push(this.createWisp());
        }
    }

    createWisp() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            phase: Math.random() * Math.PI * 2,
            chars: '01<>{}*&^%$#@'.split(''),
            charIndex: 0,
            textChangeTimer: 0
        };
    }

    update(deltaTime) {
        // Animate Grid
        this.gridOffset = (this.gridOffset + deltaTime * 10) % 50;

        // Update Wisps
        this.wisps.forEach(wisp => {
            wisp.x += wisp.vx;
            wisp.y += wisp.vy;
            wisp.phase += deltaTime * 2;

            // Bounce
            if (wisp.x < 0 || wisp.x > this.width) wisp.vx *= -1;
            if (wisp.y < 0 || wisp.y > this.height) wisp.vy *= -1;

            // Change char
            wisp.textChangeTimer += deltaTime;
            if (wisp.textChangeTimer > 0.2) {
                wisp.charIndex = (wisp.charIndex + 1) % wisp.chars.length;
                wisp.textChangeTimer = 0;
            }
        });
    }

    draw(ctx) {
        this.drawHoloFloor(ctx);
        this.drawWisps(ctx);
    }

    drawHoloFloor(ctx) {
        // Subtle Hexagonal Overlay
        ctx.save();
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.03; // Very faint

        const hexSize = 60;
        const width = this.width;
        const height = this.height;

        // Draw static large hexagons for "Cyber-Floor" feel
        // Simple tiled approach
        for (let y = 0; y < height + hexSize; y += hexSize * 1.5) {
            for (let x = 0; x < width + hexSize; x += hexSize * 1.732) { // sqrt(3)
                this.drawHex(ctx, x + (y % (hexSize * 3) === 0 ? 0 : hexSize * 0.866), y, hexSize);
            }
        }
        ctx.restore();
    }

    drawHex(ctx, x, y, r) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 3 * i;
            ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
        }
        ctx.closePath();
        ctx.stroke();
    }

    drawWisps(ctx) {
        ctx.save();
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';

        this.wisps.forEach(wisp => {
            const alpha = 0.3 + Math.sin(wisp.phase) * 0.2;
            ctx.fillStyle = `rgba(100, 255, 200, ${alpha})`;
            ctx.fillText(wisp.chars[wisp.charIndex], wisp.x, wisp.y);

            // Glow
            ctx.shadowColor = '#0f0';
            ctx.shadowBlur = 5;
        });

        ctx.restore();
    }
}
