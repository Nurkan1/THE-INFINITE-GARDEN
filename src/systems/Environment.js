export class EnvironmentSystem {
    constructor() {
        this.time = 0;
        // Wind Vector
        this.wind = { x: 1, y: 0 };
        this.windStrength = 0;

        // Temperature (0.0 = Freezing, 1.0 = Burning)
        this.temperature = 0.5;
    }

    update(deltaTime) {
        this.time += deltaTime;

        // Procedural Wind (Perlin-ish)
        // Combine multiple sine waves for unpredictability
        const noise1 = Math.sin(this.time * 0.2);
        const noise2 = Math.sin(this.time * 0.5 + 42);
        const noise3 = Math.sin(this.time * 1.3 - 15);

        this.windStrength = (noise1 + noise2 * 0.5 + noise3 * 0.2);
        this.wind.x = Math.cos(this.time * 0.1) * this.windStrength;
        this.wind.y = Math.sin(this.time * 0.15) * this.windStrength * 0.3; // Less vertical wind

        // Temperature Cycle
        // Slow oscillation
        this.temperature = 0.5 + Math.sin(this.time * 0.05) * 0.4; // 0.1 to 0.9 range
    }

    getWindAt(x, y) {
        // Can add local variance based on position
        return {
            x: this.wind.x + Math.sin(x * 0.01 + this.time) * 0.2,
            y: this.wind.y + Math.cos(y * 0.01 + this.time) * 0.1
        };
    }
}

export const environment = new EnvironmentSystem();
