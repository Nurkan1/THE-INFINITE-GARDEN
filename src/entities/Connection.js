import { Packet } from './Packet.js'

export class Connection {
    constructor(fromNode, toNode) {
        this.fromNode = fromNode;
        this.toNode = toNode;
        this.packets = []; // Packets traveling on this connection
    }

    addPacket() {
        this.packets.push(new Packet(this));
    }

    update(deltaTime) {
        // Update packets
        for (let i = this.packets.length - 1; i >= 0; i--) {
            const p = this.packets[i];
            p.update(deltaTime);
            if (!p.active) {
                this.packets.splice(i, 1);
            }
        }
    }

    static renderMode = 0; // 0: Organic, 1: Tech, 2: Sine, 3: Chaos

    draw(ctx, grid, cellSize) {
        const startPos = grid.gridToScreen(this.fromNode.gridX, this.fromNode.gridY);
        const endPos = grid.gridToScreen(this.toNode.gridX, this.toNode.gridY);

        const cx1 = startPos.x + cellSize / 2;
        const cy1 = startPos.y + cellSize / 2;
        const cx2 = endPos.x + cellSize / 2;
        const cy2 = endPos.y + cellSize / 2;

        const time = performance.now() / 1000;

        // Dynamic Color Palettes
        let baseColor = '#444';
        let activeColor = '#fff';

        switch (Connection.renderMode) {
            case 1: // TECH (Cyberpunk Neon)
                const hue = (time * 50) % 360;
                activeColor = `hsl(${hue}, 100%, 60%)`;
                baseColor = `hsl(${hue}, 50%, 20%)`;
                break;
            case 2: // SINE (Electric Pulse)
                const pulse = Math.sin(time * 5) * 0.5 + 0.5;
                activeColor = `rgb(${100 + pulse * 155}, 100, 255)`;
                baseColor = '#220044';
                break;
            case 3: // CHAOS (Rainbow Storm)
                activeColor = `hsl(${time * 500}, 100%, 50%)`;
                baseColor = `hsl(${time * 200}, 80%, 30%)`;
                break;
            case 0: // ORGANIC (Nature)
            default:
                activeColor = '#0f0'; // Bright Green
                baseColor = '#1a331a'; // Dark Green
                break;
        }

        ctx.strokeStyle = this.packets.length > 0 ? activeColor : baseColor;

        // Add Glow
        if (this.packets.length > 0) {
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 10;
        } else {
            ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.moveTo(cx1, cy1);

        switch (Connection.renderMode) {
            case 1: // TECH (Squared)
                ctx.lineTo(cx2, cy1);
                ctx.lineTo(cx2, cy2);
                break;

            case 2: // SINE (Wavy)
                const dx = cx2 - cx1;
                const dy = cy2 - cy1;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                for (let i = 0; i <= dist; i += 5) {
                    const t = i / dist;
                    const px = cx1 + dx * t;
                    const py = cy1 + dy * t;

                    const perpX = -Math.sin(angle);
                    const perpY = Math.cos(angle);

                    const wave = Math.sin(t * 10 + time * 5) * 10;
                    ctx.lineTo(px + perpX * wave, py + perpY * wave);
                }
                break;

            case 3: // CHAOS (The Dance)
                const segments = 10;
                for (let i = 1; i <= segments; i++) {
                    const t = i / segments;
                    const tx = cx1 + (cx2 - cx1) * t;
                    const ty = cy1 + (cy2 - cy1) * t;

                    const jitX = (Math.sin(time * 10 + i * 132) * 20);
                    const jitY = (Math.cos(time * 12 + i * 423) * 20);

                    if (i === segments) {
                        ctx.lineTo(cx2, cy2);
                    } else {
                        ctx.lineTo(tx + jitX, ty + jitY);
                    }
                }
                break;

            case 0: // ORGANIC (Default)
            default:
                const midX = (cx1 + cx2) / 2;
                const sway = Math.sin(time + this.fromNode.gridX) * 20;
                const cp1x = midX + sway;
                const cp1y = cy1;
                const cp2x = midX - sway;
                const cp2y = cy2;
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, cx2, cy2);
                break;
        }

        ctx.stroke();

        // Draw Packets (synced to path)
        const params = {
            mode: Connection.renderMode,
            time: time,
        };

        // Inject specific curve data based on mode
        if (Connection.renderMode === 0) {
            const midX = (cx1 + cx2) / 2;
            const sway = Math.sin(time + this.fromNode.gridX) * 20;
            params.cp1 = { x: midX + sway, y: cy1 };
            params.cp2 = { x: midX - sway, y: cy2 };
        }

        for (const p of this.packets) {
            p.draw(ctx, { x: cx1, y: cy1 }, { x: cx2, y: cy2 }, params);
        }
    }
}
