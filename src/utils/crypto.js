// Crypto utilities for TIG wallet
const SECRET_SALT = 'TIG_INFINITE_GARDEN_2026';

export async function generateWalletHash(walletData) {
    const data = `${walletData.balance}|${walletData.totalFlowersMined}|${walletData.createdAt}|${SECRET_SALT}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export async function verifyWalletHash(walletData, providedHash) {
    const calculatedHash = await generateWalletHash(walletData);
    return calculatedHash === providedHash;
}

export function downloadWalletFile(walletData, hash) {
    const exportData = {
        ...walletData,
        hash: hash
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TIG_Wallet_${Date.now()}.tig`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function readWalletFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                resolve(data);
            } catch (error) {
                reject(new Error('Invalid wallet file format'));
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}
