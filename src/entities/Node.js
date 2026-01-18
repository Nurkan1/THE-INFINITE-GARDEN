import { audioManager } from '../systems/AudioManager.js';
import { particleSystem } from '../systems/ParticleSystem.js';

const spriteSheet = new Image();
spriteSheet.src = '/nodes.png'; // Root relative

export class Node {
    constructor(gridX, gridY, type) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.type = type; // 'source', 'logic', 'output'
        this.connections = []; // Outgoing connections
    }

    update(deltaTime) {
        // Base update method
    }

    receivePacket(packet) {
        // Base receive handler
        // console.log(`Node ${this.type} received packet`);
    }

    draw(ctx, screenX, screenY, size) {
        // Base draw - fallback if subclass doesn't override
        // Living Node Breath
        const time = performance.now() / 1000;
        const breath = 1 + Math.sin(time * 2 + this.gridX) * 0.05; // Random phase

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.scale(breath, breath);
        ctx.translate(-screenX, -screenY);

        if (spriteSheet.complete && spriteSheet.naturalWidth !== 0) {
            const w = spriteSheet.naturalWidth / 3; // 3 icons
            const h = spriteSheet.naturalHeight;
            let sx = 0;
            switch (this.type) {
                case 'source': sx = 0; break;
                case 'logic': sx = w; break;
                case 'output': sx = w * 2; break;
            }

            // Draw centered
            ctx.drawImage(spriteSheet, sx, 0, w, h, screenX - size / 2, screenY - size / 2, size, size);
        } else {
            // Fallback Text instead of ugly square
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(screenX, screenY, size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.type.substring(0, 3).toUpperCase(), screenX, screenY);
        }

        ctx.restore();
    }
}

export class SourceNode extends Node {
    constructor(gridX, gridY) {
        super(gridX, gridY, 'source');
        this.timer = 0;
        this.interval = 2.0; // Seconds between pulses
    }

    update(deltaTime) {
        this.timer += deltaTime;
        if (this.timer >= this.interval) {
            this.timer = 0;
            this.emitPulse();
        }
    }

    emitPulse() {
        if (this.connections.length > 0) {
            audioManager.playPulseSound();
        }
        for (const conn of this.connections) {
            conn.addPacket();
        }
    }

    draw(ctx, screenX, screenY, size) {
        // Neon Source Node
        const color = '#0ff';
        const timer = performance.now() / 1000;

        ctx.shadowBlur = 20;
        ctx.shadowColor = color;

        // Outer Ring
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 0.4, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Pulse Ring
        const pulse = (Math.sin(timer * 2) + 1) / 2;
        ctx.fillStyle = `rgba(0, 255, 255, ${0.2 + pulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Center Core
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Progress ring
        ctx.shadowBlur = 0; // Reset for sharp line
        ctx.strokeStyle = `rgba(0, 255, 255, 0.8)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 0.5, -Math.PI / 2, -Math.PI / 2 + (this.timer / this.interval) * Math.PI * 2);
        ctx.stroke();
    }
}

export class LogicNode extends Node {
    constructor(gridX, gridY, gateType = 'OR') {
        super(gridX, gridY, 'logic');
        this.gateType = gateType; // OR, AND, XOR
        this.packetBuffer = 0;
        this.processingFrame = 0;
        this.PROCESS_DELAY = 15; // 15 frames (~250ms) window for simultaneous signals
    }

    receivePacket(packet) {
        // Collect signals within a time window
        this.packetBuffer++;

        // Start window if not active
        if (this.processingFrame <= 0) {
            this.processingFrame = this.PROCESS_DELAY;
        }

        // Pulse visual
        this.pulse = 1.0;
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Process Logic Window
        if (this.processingFrame > 0) {
            this.processingFrame--;

            // Window closed, evaluate!
            if (this.processingFrame <= 0) {
                this.evaluateLogic();
                this.packetBuffer = 0; // Reset buffer
            }
        }
    }

    evaluateLogic() {
        let shouldEmit = false;

        switch (this.gateType) {
            case 'OR':
                shouldEmit = this.packetBuffer >= 1;
                break;
            case 'AND':
                shouldEmit = this.packetBuffer >= 2;
                break;
            case 'XOR':
                shouldEmit = this.packetBuffer === 1;
                break;
        }

        if (shouldEmit) {
            // Success! Emit packets on all outgoing connections
            for (const conn of this.connections) {
                conn.addPacket();
            }
            // Visual feedback
            this.pulse = 1.0;
        }
    }

    draw(ctx, screenX, screenY, size) {
        // Neon Logic Node
        const color = '#f0f';
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;

        // Shape based on Type
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        if (this.gateType === 'AND') {
            // Rectangle
            ctx.rect(screenX - size * 0.4, screenY - size * 0.3, size * 0.8, size * 0.6);
        } else if (this.gateType === 'XOR') {
            // Triangle
            ctx.moveTo(screenX - size * 0.4, screenY - size * 0.4);
            ctx.lineTo(screenX + size * 0.4, screenY - size * 0.4);
            ctx.lineTo(screenX, screenY + size * 0.4);
            ctx.closePath();
        } else {
            // OR - Diamond (Default)
            ctx.moveTo(screenX, screenY - size * 0.4);
            ctx.lineTo(screenX + size * 0.4, screenY);
            ctx.lineTo(screenX, screenY + size * 0.4);
            ctx.lineTo(screenX - size * 0.4, screenY);
            ctx.closePath();
        }

        ctx.stroke();

        // Label
        ctx.fillStyle = color;
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Label mapping
        let label = '';
        if (this.gateType === 'OR') label = 'MERGE';
        else if (this.gateType === 'AND') label = 'SYNC';
        else if (this.gateType === 'XOR') label = 'ONE';

        ctx.fillText(label, screenX, screenY);

        // Processing Indicator
        if (this.processingFrame > 0) {
            ctx.beginPath();
            ctx.arc(screenX, screenY, size * 0.6, 0, (this.processingFrame / this.PROCESS_DELAY) * Math.PI * 2);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.shadowBlur = 0;
    }
}

export class OutputNode extends Node {
    constructor(gridX, gridY, dna = null) {
        super(gridX, gridY, 'output');
        this.growthLevel = 0;
        this.maxGrowth = 100;

        // DNA - Genetic Code
        if (dna) {
            this.dna = { ...dna }; // Clone parent DNA
            // Mutate slightly on birth?
            this.dna.hue += (Math.random() - 0.5) * 10;
        } else {
            this.dna = {
                symmetry: Math.floor(Math.random() * 3) + 3, // 3 to 6
                spikiness: Math.random(), // 0.0 to 1.0
                hue: Math.random() * 360, // 0 to 360
                chaos: Math.random() * 0.5, // 0.0 to 0.5
                branches: [] // Procedural structure
            };
        }

        this.regenerateStructure();
    }

    regenerateStructure() {
        this.dna.branches = [];
        const count = 10 + Math.floor(this.dna.chaos * 20);
        for (let i = 0; i < count; i++) {
            this.dna.branches.push({
                angleOff: (Math.random() - 0.5) * (1 + this.dna.chaos),
                len: 10 + Math.random() * 20,
                curve: (Math.random() - 0.5) * 10
            });
        }
    }

    receivePacket(packet) {
        if (this.growthLevel < this.maxGrowth) {
            this.growthLevel++;
            if (this.growthLevel % 5 === 0) audioManager.playGrowSound();

            // MUTATION based on Source
            const sourceInfo = packet.connection ? packet.connection.fromNode : null;

            if (sourceInfo) {
                this.mutate(sourceInfo);
            }

            this.pulse = 1.0;

            // Water Splash Effect 💦
            if (window.grid) {
                // We need screen coordinates. 
                // If window.grid is available. If not, we might need another way.
                // Let's rely on global grid for now or calculate manually if cellSize is known (50).
                const cellSize = 50;
                const screenX = this.gridX * cellSize + cellSize / 2;
                const screenY = this.gridY * cellSize + cellSize / 2;

                // Cyan/Blue Dust
                particleSystem.emit(screenX, screenY, '#0ff', 5); // 5 particles
                particleSystem.emit(screenX, screenY, '#8ff', 3); // 3 lighter mist
            }
        } else {
            if (Math.random() < 0.3) this.releaseSeeds();
        }
    }

    mutate(sourceNode) {
        // Genetic Mutation Logic
        if (sourceNode.type === 'source') {
            // Pure Energy - random growth
            this.dna.hue += 1;
        } else if (sourceNode.type === 'logic') {
            if (sourceNode.gateType === 'AND') { // SYNC -> Structure/Symmetry
                if (Math.random() < 0.1) {
                    this.dna.symmetry = Math.min(12, this.dna.symmetry + 1);
                    this.dna.chaos = Math.max(0, this.dna.chaos - 0.05);
                }
            } else if (sourceNode.gateType === 'XOR') { // ONE -> Spikiness/Precision
                this.dna.spikiness = Math.min(1, this.dna.spikiness + 0.01);
                this.dna.hue += 5; // Shift color rapidly
            } else if (sourceNode.gateType === 'OR') { // MERGE -> Chaos/Lushness
                this.dna.chaos = Math.min(1, this.dna.chaos + 0.01);
            }
        }
    }

    releaseSeeds() {
        this.pulse = 2.0;
        audioManager.playGrowSound();
        this.growthLevel = 0;
        // Mutate slightly on rebirth
        this.dna.hue += (Math.random() - 0.5) * 30;
        this.dna.symmetry = Math.max(3, Math.min(12, this.dna.symmetry + (Math.random() > 0.5 ? 1 : -1)));
        this.regenerateStructure();

        window.dispatchEvent(new CustomEvent('spawn-node', {
            detail: { x: this.gridX, y: this.gridY, parentDNA: { ...this.dna } }
        }));
    }

    draw(ctx, screenX, screenY, size) {
        const time = performance.now() / 1000;
        const breath = 1 + Math.sin(time * 3 + this.gridX) * 0.08;

        // Environment Influence
        const envTemp = window.environment ? window.environment.temperature : 0.5;
        const tempHueShift = (envTemp - 0.5) * 60; // +/- 30deg

        const finalHue = (this.dna.hue + tempHueShift) % 360;
        const color = `hsl(${finalHue}, ${60 + envTemp * 40}%, 60%)`;

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.scale(breath, breath);
        ctx.translate(-screenX, -screenY);

        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        // SEED STATE
        if (this.growthLevel < 10) {
            ctx.beginPath();
            const seedSize = size * 0.2 + (this.growthLevel / 10) * 0.1;

            // Shape hints at DNA
            if (this.dna.spikiness > 0.6) {
                // Crystal Seed
                ctx.moveTo(screenX, screenY - seedSize);
                ctx.lineTo(screenX + seedSize, screenY);
                ctx.lineTo(screenX, screenY + seedSize);
                ctx.lineTo(screenX - seedSize, screenY);
            } else {
                // Round Seed
                ctx.arc(screenX, screenY, seedSize, 0, Math.PI * 2);
            }
            // Processing Indicator
            if (this.pulse > 1.0) { // Using pulse as temporary flash
                ctx.fillStyle = '#fff';
            }
            this.pulse = Math.max(1.0, this.pulse - 0.1);

            ctx.fill();
            ctx.restore();
            return;
        }

        // Bloom State
        const progress = this.growthLevel / this.maxGrowth;
        const scale = 1 + progress * 2.0; // Dynamic scale

        ctx.translate(screenX, screenY);
        ctx.scale(scale, scale);

        // Procedural Draw
        this.drawProcedural(ctx, progress, finalHue);

        ctx.restore();
    }

    drawProcedural(ctx, progress, hue) {
        const time = performance.now() / 1000;
        const spokes = this.dna.symmetry;
        const spike = this.dna.spikiness;

        // Wind Effect
        const envWind = window.environment ? window.environment.getWindAt(this.gridX, this.gridY) : { x: 0, y: 0 };
        const sway = Math.sin(time + this.gridX) * 0.1 * (1 - spike) + (envWind.x * 0.1);

        ctx.lineWidth = 2;
        ctx.lineCap = spike > 0.5 ? 'butt' : 'round';
        ctx.strokeStyle = `hsl(${hue}, 80%, 60%)`;

        for (let i = 0; i < spokes; i++) {
            ctx.save();
            const angle = (Math.PI * 2 / spokes) * i + sway;
            ctx.rotate(angle);

            // Draw Petal/Spike
            ctx.beginPath();
            ctx.moveTo(0, 0);

            const len = 20 * progress;
            const width = 5 + (1 - spike) * 10;

            // Bezier Petal vs Line Spike
            if (spike > 0.7) {
                // Sharp Crystal
                ctx.lineTo(0, -len);
                ctx.lineTo(width / 2, -len * 0.8);
                ctx.lineTo(0, 0);
            } else {
                // Organic Petal
                ctx.quadraticCurveTo(width, -len / 2, 0, -len);
                ctx.quadraticCurveTo(-width, -len / 2, 0, 0);
            }

            // Fill if advanced
            if (progress > 0.5) {
                ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.5)`;
                ctx.fill();
            }
            ctx.stroke();

            // Recursion / Compexity based on Chaos
            if (this.dna.chaos > 0.2 && progress > 0.3) {
                ctx.translate(0, -len);
                ctx.rotate(0.5);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -len * 0.5);
                ctx.stroke();
            }

            ctx.restore();
        }

        // Center Core
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.arc(0, 0, 3 + progress * 2, 0, Math.PI * 2);
        ctx.fill();
    }
}
