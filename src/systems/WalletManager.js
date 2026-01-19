import { WalletDB } from '../database/WalletDB.js';
import { generateWalletHash, verifyWalletHash, downloadWalletFile, readWalletFile } from '../utils/crypto.js';

export class WalletManager {
    constructor() {
        this.db = new WalletDB();
        this.balance = 0;
        this.totalFlowersMined = 0;
        this.username = 'Anonymous Gardener';
        this.rank = { level: 1, title: 'Seedling' };

        // Rank thresholds
        this.ranks = [
            { level: 1, title: 'Seedling', minTIG: 0 },
            { level: 2, title: 'Gardener', minTIG: 1 },
            { level: 3, title: 'Cultivator', minTIG: 5 },
            { level: 4, title: 'Botanist', minTIG: 10 },
            { level: 5, title: 'Horticulturist', minTIG: 25 },
            { level: 6, title: 'Master Gardener', minTIG: 50 },
            { level: 7, title: 'Infinite Gardener', minTIG: 100 }
        ];
    }

    async init() {
        await this.db.init();
        const wallet = await this.db.getWallet();
        this.balance = wallet.balance;
        this.totalFlowersMined = wallet.totalFlowersMined;
        this.username = wallet.username || 'Anonymous Gardener';
        this.updateRank();
        console.log('💰 TIG Wallet initialized:', this.balance.toFixed(2), 'TIG');
    }

    updateRank() {
        // Find the highest rank the player qualifies for
        for (let i = this.ranks.length - 1; i >= 0; i--) {
            if (this.balance >= this.ranks[i].minTIG) {
                this.rank = this.ranks[i];
                break;
            }
        }
    }

    getNextRank() {
        const currentIndex = this.ranks.findIndex(r => r.level === this.rank.level);
        if (currentIndex < this.ranks.length - 1) {
            return this.ranks[currentIndex + 1];
        }
        return null; // Already at max rank
    }

    getProgressToNextRank() {
        const nextRank = this.getNextRank();
        if (!nextRank) return 1.0; // Max rank

        const current = this.balance;
        const min = this.rank.minTIG;
        const max = nextRank.minTIG;

        return (current - min) / (max - min);
    }

    async onFlowerMined() {
        const TIG_PER_FLOWER = 0.01;
        const previousRank = this.rank.level;

        // Add TIG
        const wallet = await this.db.addTIG(TIG_PER_FLOWER);
        this.balance = wallet.balance;
        this.totalFlowersMined = wallet.totalFlowersMined;

        // Update rank
        this.updateRank();

        // Emit events
        window.dispatchEvent(new CustomEvent('tig-mined', {
            detail: {
                amount: TIG_PER_FLOWER,
                balance: this.balance,
                totalFlowers: this.totalFlowersMined
            }
        }));

        // Check for rank up
        if (this.rank.level > previousRank) {
            window.dispatchEvent(new CustomEvent('rank-up', {
                detail: {
                    newRank: this.rank,
                    balance: this.balance
                }
            }));
            console.log('🏆 RANK UP!', this.rank.title);
        }

        return this.balance;
    }

    async setUsername(name) {
        this.username = name;
        const wallet = await this.db.getWallet();
        wallet.username = name;
        await this.db.saveWallet(wallet);
    }

    async exportWallet() {
        const walletData = await this.db.exportWallet();
        const exportData = {
            ...walletData,
            username: this.username
        };
        const hash = await generateWalletHash(exportData);
        downloadWalletFile(exportData, hash);
    }

    async importWallet(file) {
        try {
            const walletData = await readWalletFile(file);

            // Verify hash
            const isValid = await verifyWalletHash(walletData, walletData.hash);
            if (!isValid) {
                throw new Error('Invalid wallet hash - file may be corrupted');
            }

            // Import wallet (merges with current)
            const updatedWallet = await this.db.importWallet(walletData);
            this.balance = updatedWallet.balance;
            this.totalFlowersMined = updatedWallet.totalFlowersMined;
            this.username = updatedWallet.username || 'Anonymous Gardener';
            this.updateRank();

            window.dispatchEvent(new CustomEvent('wallet-imported', {
                detail: {
                    balance: this.balance,
                    imported: walletData.balance
                }
            }));

            console.log('✅ Wallet imported successfully');
            return true;
        } catch (error) {
            console.error('❌ Wallet import failed:', error);
            throw error;
        }
    }

    getStats() {
        return {
            balance: this.balance,
            totalFlowersMined: this.totalFlowersMined,
            rank: this.rank,
            nextRank: this.getNextRank(),
            progress: this.getProgressToNextRank(),
            username: this.username
        };
    }
}
