import { generateWalletHash } from '../utils/crypto.js';

export class CardGenerator {
    constructor() {
        // Social media optimized size (Open Graph)
        this.width = 1200;
        this.height = 630;
    }

    async generate(stats, walletData) {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');

        // 1. Background (Dark Gradient)
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#051015');
        gradient.addColorStop(1, '#002025');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // 2. Grid Pattern (BitBloom aesthetic)
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
        ctx.lineWidth = 2;
        const gridSize = 60;

        ctx.beginPath();
        for (let x = 0; x <= this.width; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
        }
        for (let y = 0; y <= this.height; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
        }
        ctx.stroke();

        // 3. Header
        ctx.fillStyle = '#0ff';
        ctx.font = 'bold 40px monospace';
        ctx.fillText('THE INFINITE GARDEN', 50, 80);

        ctx.fillStyle = '#ffd700';
        ctx.font = '30px monospace';
        ctx.fillText('IDENTITY CARD', 50, 120);

        // 4. Content Box (Glassmorphism style)
        ctx.fillStyle = 'rgba(0, 20, 30, 0.6)';
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(50, 180, this.width - 100, 350, 20);
        ctx.fill();
        ctx.stroke();

        // 5. User Data
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#0ff';

        // Username
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 80px sans-serif';
        ctx.fillText(stats.username || 'Gardener', 100, 280);

        // Rank
        ctx.shadowColor = '#ffd700';
        ctx.fillStyle = '#ffd700';
        ctx.font = '50px monospace';
        ctx.fillText(`🏆 ${stats.rank.title}`, 100, 380);

        // Balance
        ctx.fillStyle = '#fff';
        ctx.font = '40px monospace';
        ctx.fillText(`⚡ ${stats.balance.toFixed(2)} TIG`, 100, 450);
        ctx.fillText(`✿ ${Math.floor(stats.totalFlowersMined).toLocaleString()} Flowers Mined`, 600, 450);

        // 6. Signature / Hash (Bottom)
        ctx.shadowBlur = 0;
        const hash = await generateWalletHash(walletData);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.font = '20px monospace';
        ctx.fillText(`SIGNATURE: ${hash.substring(0, 40)}...`, 100, 480);
        ctx.fillText(`ID: ${Date.now().toString(16).toUpperCase()}`, 800, 120);

        // 7. Decorative Elements (Corners)
        this.drawCorner(ctx, 50, 180);
        this.drawCorner(ctx, this.width - 50, 530, true);

        return canvas.toDataURL('image/png');
    }

    drawCorner(ctx, x, y, rotate = false) {
        ctx.save();
        ctx.translate(x, y);
        if (rotate) ctx.rotate(Math.PI);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-10, 50);
        ctx.lineTo(-10, -10);
        ctx.lineTo(50, -10);
        ctx.stroke();
        ctx.restore();
    }
}
