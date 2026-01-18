export class Packet {
    constructor(connection) {
        this.connection = connection;
        this.progress = 0; // 0 to 1
        this.speed = 2.0; // Units per second (1 unit = full connection length)
        this.active = true;
    }

    update(deltaTime) {
        this.progress += this.speed * deltaTime;
        if (this.progress >= 1) {
            this.progress = 1;
            this.active = false;
            // Trigger target node
            this.connection.toNode.receivePacket(this);
        }
    }

    draw(ctx, startPos, endPos, params) {
        // params: { mode, time, seed, cp }
        const t = this.progress;
        let x, y;

        const mode = params.mode || 0;

        if (mode === 0) {
            // ORGANIC (Cubic Bezier)
            // Expects params.cp1 and params.cp2
            if (params.cp1 && params.cp2) {
                const invT = 1 - t;
                const invT2 = invT * invT;
                const invT3 = invT2 * invT;
                const t2 = t * t;
                const t3 = t2 * t;

                x = invT3 * startPos.x +
                    3 * invT2 * t * params.cp1.x +
                    3 * invT * t2 * params.cp2.x +
                    t3 * endPos.x;

                y = invT3 * startPos.y +
                    3 * invT2 * t * params.cp1.y +
                    3 * invT * t2 * params.cp2.y +
                    t3 * endPos.y;
            } else {
                // Fallback Linear
                x = startPos.x + (endPos.x - startPos.x) * t;
                y = startPos.y + (endPos.y - startPos.y) * t;
            }
        } else if (mode === 1) {
            // TECH (Squared / L-Shape)
            // Move horizontally first (until mid), then vertically? Or full L?
            // Connection Tech mode draws: start -> (endX, startY) -> end
            // Corner is at (endX, startY).
            if (t < 0.5) {
                // First leg: start -> corner
                const progressLC = t * 2; // 0 to 1
                x = startPos.x + (endPos.x - startPos.x) * progressLC;
                y = startPos.y;
            } else {
                // Second leg: corner -> end
                const progressLC = (t - 0.5) * 2;
                x = endPos.x;
                y = startPos.y + (endPos.y - startPos.y) * progressLC;
            }
        } else if (mode === 2) {
            // SINE (Wavy)
            // Linear base + Sine offset
            const dx = endPos.x - startPos.x;
            const dy = endPos.y - startPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            // Base Linear pos
            let px = startPos.x + dx * t;
            let py = startPos.y + dy * t;

            // Sine Offset
            const wave = Math.sin(t * 10 + params.time * 5) * 10;
            const perpX = -Math.sin(angle);
            const perpY = Math.cos(angle);

            x = px + perpX * wave;
            y = py + perpY * wave;

        } else if (mode === 3) {
            // CHAOS (Jitter)
            // Linear + Random Jitter
            const dx = endPos.x - startPos.x;
            const dy = endPos.y - startPos.y;

            x = startPos.x + dx * t;
            y = startPos.y + dy * t;

            // Jitter
            const jitX = (Math.sin(params.time * 20 + t * 50) * 5);
            const jitY = (Math.cos(params.time * 25 + t * 40) * 5);
            x += jitX;
            y += jitY;
        }

        // Draw Energy Spirit
        // Color depends on mode? Defaulting to white/amber
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fff';

        // Head
        ctx.fillStyle = '#fff';
        if (mode === 3) ctx.fillStyle = `hsl(${params.time * 300}, 100%, 70%)`;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}
