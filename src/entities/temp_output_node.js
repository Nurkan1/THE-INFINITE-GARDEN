export class OutputNode extends Node {
    constructor(gridX, gridY) {
        super(gridX, gridY, 'output');
        this.growthLevel = 0;
        this.maxGrowth = 100; 

        // DNA - Genetic Code
        this.dna = {
            symmetry: Math.floor(Math.random() * 3) + 3, // 3 to 6
            spikiness: Math.random(), // 0.0 to 1.0
            hue: Math.random() * 360, // 0 to 360
            chaos: Math.random() * 0.5, // 0.0 to 0.5
            branches: [] // Procedural structure
        };
        
        this.regenerateStructure();
    }

    regenerateStructure() {
        this.dna.branches = [];
        const count = 10 + Math.floor(this.dna.chaos * 20);
        for(let i=0; i<count; i++) {
            this.dna.branches.push({
                angleOff: (Math.random()-0.5) * (1 + this.dna.chaos),
                len: 10 + Math.random() * 20,
                curve: (Math.random()-0.5) * 10
            });
        }
    }

    receivePacket(packet) {
        if (this.growthLevel < this.maxGrowth) {
            this.growthLevel++;
            if(this.growthLevel % 5 === 0) audioManager.playGrowSound();
            
            // MUTATION based on Source
            const sourceInfo = packet.connection.fromNode;
            
            if (sourceInfo) {
                this.mutate(sourceInfo);
            }

            this.pulse = 1.0;
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
        this.dna.hue += (Math.random()-0.5)*30;
        this.dna.symmetry = Math.max(3, Math.min(12, this.dna.symmetry + (Math.random()>0.5?1:-1)));
        this.regenerateStructure();
        
        window.dispatchEvent(new CustomEvent('spawn-node', {
            detail: { x: this.gridX, y: this.gridY, parentDNA: {...this.dna} }
        }));
    }

    draw(ctx, screenX, screenY, size) {
        const time = performance.now() / 1000;
        const breath = 1 + Math.sin(time * 3 + this.gridX) * 0.08;

        // Environment Influence
        // Temp affects color shift?
        const envTemp = window.environment ? window.environment.temperature : 0.5;
        const tempHueShift = (envTemp - 0.5) * 60; // +/- 30deg
        
        const finalHue = (this.dna.hue + tempHueShift) % 360;
        const color = `hsl(${finalHue}, ${60 + envTemp*40}%, 60%)`;

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
            const seedSize = size * 0.2 + (this.growthLevel/10)*0.1;
            
            // Shape hints at DNA
            if (this.dna.spikiness > 0.6) {
                // Crystal Seed
                ctx.moveTo(screenX, screenY-seedSize);
                ctx.lineTo(screenX+seedSize, screenY);
                ctx.lineTo(screenX, screenY+seedSize);
                ctx.lineTo(screenX-seedSize, screenY);
            } else {
                // Round Seed
                ctx.arc(screenX, screenY, seedSize, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.restore();
            return;
        }

        // Bloom State
        const progress = this.growthLevel / this.maxGrowth;
        const scale = 1 + progress * 2.0;
        
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
        const envWind = window.environment ? window.environment.getWindAt(this.gridX, this.gridY) : {x:0,y:0};
        const sway = Math.sin(time + this.gridX) * 0.1 * (1-spike) + (envWind.x * 0.1); 

        ctx.lineWidth = 2;
        ctx.lineCap = spike > 0.5 ? 'butt' : 'round';
        ctx.strokeStyle = `hsl(${hue}, 80%, 60%)`;

        for(let i=0; i<spokes; i++) {
            ctx.save();
            const angle = (Math.PI * 2 / spokes) * i + sway;
            ctx.rotate(angle);
            
            // Draw Petal/Spike
            ctx.beginPath();
            ctx.moveTo(0,0);
            
            const len = 20 * progress;
            const width = 5 + (1-spike)*10;
            
            // Bezier Petal vs Line Spike
            if (spike > 0.7) {
                // Sharp Crystal
                ctx.lineTo(0, -len);
                ctx.lineTo(width/2, -len*0.8);
                ctx.lineTo(0, 0);
            } else {
                // Organic Petal
                ctx.quadraticCurveTo(width, -len/2, 0, -len);
                ctx.quadraticCurveTo(-width, -len/2, 0, 0);
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
                 ctx.moveTo(0,0);
                 ctx.lineTo(0, -len*0.5);
                 ctx.stroke();
            }

            ctx.restore();
        }

        // Center Core
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.arc(0, 0, 3 + progress*2, 0, Math.PI*2);
        ctx.fill();
    }
}
