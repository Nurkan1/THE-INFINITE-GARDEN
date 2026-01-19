// IndexedDB wrapper for TIG Wallet persistence
export class WalletDB {
    constructor() {
        this.dbName = 'TIG_Wallet';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create wallet object store if it doesn't exist
                if (!db.objectStoreNames.contains('wallet')) {
                    db.createObjectStore('wallet', { keyPath: 'id' });
                }
            };
        });
    }

    async getWallet() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['wallet'], 'readonly');
            const store = transaction.objectStore('wallet');
            const request = store.get('main');

            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result);
                } else {
                    // Return default wallet if none exists
                    resolve({
                        id: 'main',
                        balance: 0,
                        totalFlowersMined: 0,
                        createdAt: new Date().toISOString(),
                        lastUpdated: new Date().toISOString()
                    });
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async saveWallet(walletData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['wallet'], 'readwrite');
            const store = transaction.objectStore('wallet');

            walletData.lastUpdated = new Date().toISOString();
            const request = store.put(walletData);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async addTIG(amount) {
        const wallet = await this.getWallet();
        wallet.balance += amount;
        wallet.totalFlowersMined += (amount * 100); // Convert TIG back to flowers
        await this.saveWallet(wallet);
        return wallet;
    }

    async exportWallet() {
        const wallet = await this.getWallet();
        return {
            version: '1.0',
            balance: wallet.balance,
            totalFlowersMined: wallet.totalFlowersMined,
            createdAt: wallet.createdAt,
            lastUpdated: wallet.lastUpdated
        };
    }

    async importWallet(walletData) {
        // Merge imported wallet with current wallet
        const currentWallet = await this.getWallet();

        currentWallet.balance += walletData.balance;
        currentWallet.totalFlowersMined += walletData.totalFlowersMined;

        await this.saveWallet(currentWallet);
        return currentWallet;
    }

    async resetWallet() {
        const wallet = await this.getWallet();
        wallet.balance = 0;
        wallet.totalFlowersMined = 0;
        await this.saveWallet(wallet);
        return wallet;
    }
}
