import { CardGenerator } from './CardGenerator.js';

export class UIManager {
    constructor() {
        this.app = document.getElementById('app');
        this.uiLayer = document.getElementById('ui-layer');
        this.setupHUD();
        this.setupTutorial();
    }

    setupHUD() {
        this.hud = document.createElement('div');
        this.hud.className = 'hud';
        this.hud.innerHTML = `
            <div class="hud-header">
                <div class="header-top">
                    <h1>THE INFINITE GARDEN</h1>
                    <button id="hud-toggle-btn" class="icon-btn" title="Minimize/Pin">✖</button>
                </div>
                <div class="hud-content">
                    <div class="stats">
                        <span id="node-count">Nodes: 0</span>
                        <span id="connection-count">Links: 0</span>
                        <span id="objective">Plant seeds...</span>
                    </div>
                    <div class="env-monitor">
                        <div class="env-title">BIOSCAN</div>
                        <div class="monitor-row">
                            <span>TEMP</span>
                            <div class="bar-container">
                                <div id="temp-bar" class="bar-fill" style="width: 50%;"></div>
                            </div>
                        </div>
                        <div class="monitor-row">
                            <span>WIND</span>
                            <div class="wind-display">
                                <span id="wind-arrow" class="wind-arrow">➤</span>
                                <span id="wind-val">0</span>
                            </div>
                        </div>
                    </div>
                    <div id="system-iq" class="system-iq">System IQ: 0</div>
                    
                    <!-- TIG Wallet Display -->
                    <div class="wallet-display" style="margin: 10px 0; padding: 10px; border-top: 1px solid rgba(0,255,255,0.2); border-bottom: 1px solid rgba(0,255,255,0.2);">
                        <div class="tig-balance" style="font-size: 1.1em; color: #ffd700; font-weight: bold;">
                            ⚡ <span id="tig-balance">0.00</span> TIG
                        </div>
                        <div class="tig-rank" style="font-size: 0.9em; color: #0ff; margin-top: 5px;">
                            🏆 <span id="tig-rank">Seedling</span>
                        </div>
                        <button id="wallet-btn" class="tool-btn" style="margin-top: 8px; width: 100%; font-size: 0.85em;">
                            💼 Wallet
                        </button>
                    </div>
                    
                    <div class="hud-controls-row">
                        <button id="help-btn" class="help-btn" title="Help">?</button>
                        <button id="inspect-btn" class="help-btn" title="Bio-Data Inspector">👁️</button>
                        <button id="clear-btn">Clear Grid</button>
                    </div>

                    <div class="tools-palette">
                        <div class="tool-items">
                            <div class="tool-label">TOOLS</div>
                            <button class="tool-btn active" data-tool="source">SOURCE</button>
                            <button class="tool-btn" data-tool="or">MERGE</button>
                            <button class="tool-btn" data-tool="and">SYNC</button>
                            <button class="tool-btn" data-tool="xor">ONE</button>
                            <button class="tool-btn" data-tool="output">OUTPUT</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.uiLayer.appendChild(this.hud);
        this.setupInspector();

        this.pinned = true; // Default state
        this.inspectorMode = false;
        this.attachListeners();
    }

    setupInspector() {
        this.inspector = document.createElement('div');
        this.inspector.className = 'inspector-panel hidden';
        this.inspector.innerHTML = `
            <div class="inspector-header">
                <h3>BIO-DATA ANALYZER</h3>
                <div class="scanning-line"></div>
            </div>
            <div class="inspector-content">
                <div class="data-row">
                    <span class="label">SPECIES:</span>
                    <span id="insp-type" class="value">UNKNOWN</span>
                </div>
                <div class="data-row">
                    <span class="label">GROWTH:</span>
                    <div class="progress-bar">
                        <div id="insp-growth-bar" class="fill"></div>
                    </div>
                </div>
                <div class="dna-block">
                    <h4>GENETIC SEQUENCE</h4>
                    <pre id="insp-dna">No Signal...</pre>
                </div>
            </div>
        `;
        this.uiLayer.appendChild(this.inspector);
    }

    attachListeners() {
        // HUD Toggle Logic
        const toggleBtn = document.getElementById('hud-toggle-btn');
        const hudContent = this.hud.querySelector('.hud-content');

        // 1. Click Toggle (Pin/Unpin)
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubble
            this.pinned = !this.pinned;

            if (this.pinned) {
                this.hud.classList.remove('minimized');
                toggleBtn.textContent = '✖'; // Close icon
                toggleBtn.title = "Minimize Panel";
            } else {
                this.hud.classList.add('minimized');
                toggleBtn.textContent = '📌'; // Pin icon
                toggleBtn.title = "Pin Panel Open";
            }
        });

        // 2. Hover Logic (Only works if NOT pinned)
        this.hud.addEventListener('mouseenter', () => {
            if (!this.pinned) {
                this.hud.classList.remove('minimized');
            }
        });

        this.hud.addEventListener('mouseleave', () => {
            if (!this.pinned) {
                this.hud.classList.add('minimized');
            }
        });

        document.getElementById('clear-btn').addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('clear-grid'));
        });

        document.getElementById('help-btn').addEventListener('click', () => {
            this.showHelpModal();
        });

        const inspectBtn = document.getElementById('inspect-btn');
        inspectBtn.addEventListener('click', () => {
            this.inspectorMode = !this.inspectorMode;
            console.log('UI: Toggle Inspector Mode:', this.inspectorMode);
            inspectBtn.classList.toggle('active');

            // Notify active tool to clear
            if (this.inspectorMode) {
                window.dispatchEvent(new CustomEvent('tool-change', { detail: { tool: 'inspector' } }));
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));

                // Show immediately in "standby" mode
                this.inspector.classList.remove('hidden');
                document.getElementById('insp-type').textContent = "SCANNING...";
                document.getElementById('insp-type').style.color = "#0ff";
                document.getElementById('insp-dna').textContent = "Select a FLOWER to analyze...";
                document.getElementById('insp-growth-bar').style.width = '0%';
            } else {
                this.inspector.classList.add('hidden');
            }
        });

        const toolBtns = this.hud.querySelectorAll('.tool-btn');
        toolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toolBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                window.dispatchEvent(new CustomEvent('tool-change', {
                    detail: { tool: btn.dataset.tool }
                }));
            });
        });

        // EVENT DELEGATION for HUD clicks
        // Handles Wallet button and potentially generic tool buttons
        this.hud.addEventListener('click', (e) => {
            // Wallet Button Handler
            if (e.target.id === 'wallet-btn' || e.target.closest('#wallet-btn')) {
                console.log('💼 Wallet button clicked (via delegation)!');
                this.showWalletModal();
                e.stopPropagation(); // Prevent other clicks
            }
        });

        // Listen for TIG mining events
        window.addEventListener('tig-mined', (e) => {
            this.updateWalletDisplay(e.detail);
        });

        // Listen for rank up events
        window.addEventListener('rank-up', (e) => {
            this.showRankUpNotification(e.detail);
        });
    }

    updateEnvironment(env) {
        // Update Temp
        const tempBar = document.getElementById('temp-bar');
        const tempPct = Math.floor(env.temperature * 100);
        tempBar.style.width = `${tempPct}%`;

        // Color shifts from Blue (Cold) to Red (Hot)
        const r = Math.floor(env.temperature * 255);
        const b = Math.floor((1 - env.temperature) * 255);
        tempBar.style.backgroundColor = `rgb(${r}, 50, ${b})`;
        tempBar.style.boxShadow = `0 0 10px rgb(${r}, 50, ${b})`;

        // Update Wind
        const windArrow = document.getElementById('wind-arrow');
        const windVal = document.getElementById('wind-val');

        // Calculate angle
        const angle = Math.atan2(env.wind.y, env.wind.x) * (180 / Math.PI);
        windArrow.style.transform = `rotate(${angle}deg)`;

        let strength = Math.floor(Math.abs(env.windStrength) * 10);
        windVal.textContent = `${strength} km/h`;

        // Wind color intensity
        const windAlpha = Math.min(1, Math.abs(env.windStrength) / 2);
        windArrow.style.color = `rgba(0, 255, 255, ${0.5 + windAlpha * 0.5})`;
    }

    updateObjective(current, total) {
        document.getElementById('objective').textContent = `System Restoration: ${total > 0 ? Math.floor((current / total) * 100) : 0}%`;

        const objEl = document.getElementById('objective');
        if (total > 0 && current === total) {
            objEl.style.color = '#0f0';
            objEl.style.textShadow = '0 0 10px #0f0';
        } else {
            objEl.style.color = '#fff';
            objEl.style.textShadow = 'none';
        }
    }

    showWinScreen() {
        const winDiv = document.createElement('div');
        winDiv.className = 'tutorial-overlay';
        winDiv.innerHTML = `
            <div class="tutorial-card" style="border-color: #0f0; box-shadow: 0 0 50px rgba(0, 255, 0, 0.2);">
                <h2 style="color: #0f0;">SYSTEM RESTORED</h2>
                <p>All fractals have bloomed.</p>
                <p>The code flows freely.</p>
                <button id="reset-btn">Reboot System</button>
            </div>
        `;
        this.uiLayer.appendChild(winDiv);

        document.getElementById('reset-btn').addEventListener('click', () => {
            location.reload();
        });
    }

    setupTutorial() {
        this.tutorial = document.createElement('div');
        this.tutorial.className = 'tutorial-overlay';
        this.tutorial.innerHTML = `
            <div class="tutorial-card">
                <h2>Welcome to The Infinite Garden</h2>
                <p>Cultivate your digital garden.</p>
                <ul>
                    <li><strong>Click</strong> empty space to plant a Node.</li>
                    <li><strong>Drag</strong> between nodes to Connect them.</li>
                    <li><strong>Source (Cyan)</strong> emits pulses.</li>
                    <li><strong>Output (Amber)</strong> grows when fed.</li>
                </ul>
                <button id="start-btn">Begin Simulation</button>
            </div>
        `;
        this.uiLayer.appendChild(this.tutorial);

        document.getElementById('start-btn').addEventListener('click', () => {
            this.tutorial.style.opacity = '0';
            setTimeout(() => this.tutorial.remove(), 500);

            if (window.audioManager && window.audioManager.ctx.state === 'suspended') {
                window.audioManager.ctx.resume();
            }
        });
    }

    updateStats(nodes, connections) {
        document.getElementById('node-count').textContent = `Nodes: ${nodes}`;
        document.getElementById('connection-count').textContent = `Links: ${connections}`;
    }

    showHelpModal() {
        if (document.querySelector('.help-modal')) return;

        const modal = document.createElement('div');
        modal.className = 'tutorial-overlay';
        modal.innerHTML = `
            <div class="tutorial-card help-modal" style="width: 600px; max-width: 90vw; display: flex; flex-direction: column; max-height: 90vh;">
                <h2 style="border-bottom: 2px solid #0ff; padding-bottom: 10px; margin-bottom: 20px; flex-shrink: 0;">SYSTEM MANUAL v1.2.0</h2>
                
                <div class="guide-content" style="text-align: left; overflow-y: auto; padding-right: 15px; flex-grow: 1;">
                    
                    <h3 style="color: #ffd700; margin-top: 10px;">⚡ TIG ECONOMY (NEW)</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 8px;"><strong>Mining</strong>: Dead flowers decompose into <strong>0.01 TIG</strong>.</li>
                        <li style="margin-bottom: 8px;"><strong>Ranks</strong>: Accumulate TIG to ascend from <em>Seedling</em> to <em>Infinite Gardener</em>.</li>
                        <li style="margin-bottom: 8px;"><strong>Wallet</strong>: Persistent storage. Export/Import keys to move your wealth.</li>
                        <li style="margin-bottom: 8px;"><strong>Identity</strong>: Generate your unique <strong>TIG ID Card</strong> with cryptographic signature.</li>
                    </ul>

                    <h3 style="color: #0ff; margin-top: 20px;">🎮 Control Interface</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 8px;"><strong>Right Click</strong>: Instantiate Modules (Source, Logic, Output).</li>
                        <li style="margin-bottom: 8px;"><strong>Drag (L-Click)</strong>: Establish neural connections.</li>
                        <li style="margin-bottom: 8px;"><strong>Shift + Drag</strong>: Relocate node clusters (Group Move).</li>
                        <li style="margin-bottom: 8px;"><strong>Double Click Source</strong>: Auto-link to nearest idle seeds (Automated Gardener).</li>
                        <li style="margin-bottom: 8px;"><strong>Ctrl + B</strong>: Cycle Connection Visualization (Organic / Tech / Sine / Chaos).</li>
                        <li style="margin-bottom: 8px;"><strong>Right Click Object</strong>: Prune/Delete.</li>
                    </ul>

                    <h3 style="color: #fff; margin-top: 20px;">👁️ Bio-Data Inspector</h3>
                    <p style="font-size: 0.9em; opacity: 0.8;">
                        Activate the <strong>Inspector Mode</strong> (Eye Icon) to view real-time genetic data. 
                        Click on any <strong>Flower (Output Node)</strong> to analyze its DNA sequence, growth progress, and mutation traits.
                    </p>

                    <h3 style="color: #fa0; margin-top: 20px;">🧬 Xenobiology</h3>
                    <p style="font-size: 0.9em; opacity: 0.8;">
                        This system simulates simplified genetic evolution. 
                        <strong>Source Nodes</strong> provide raw energy (Hydro-Data). 
                        <strong>Output Nodes</strong> (Flowers) possess unique DNA that determines their fractal structure and color.
                        Energy packets inherit traits from the network, mutating the flora upon contact.
                    </p>

                    <h3 style="color: #f0f; margin-top: 20px;">⚠️ Performance Notice</h3>
                    <p style="font-size: 0.9em; opacity: 0.8; border-left: 3px solid #f0f; padding-left: 10px;">
                        The Infinite Garden utilizes real-time procedural generation for fluid dynamics, particle interaction, and fractal geometry.
                        A dedicated GPU is recommended for optimal performance. Large gardens may impact frame rates on lower-end systems.
                    </p>
                </div>

                <div class="modal-actions" style="margin-top: 20px; border-top: 1px solid #333; padding-top: 15px; flex-shrink: 0;">
                    <div style="font-size: 0.8em; color: #888; margin-bottom: 15px;">
                        <p><strong>Supported Platforms:</strong> Kali Linux (AppImage) • Windows 10/11 (Portable)</p>
                        <p>Developed with ❤️ by <strong>Nurcan Kerim</strong></p>
                    </div>
                    <button id="demo-btn">Run Diagnostics (Demo)</button>
                    <button id="close-help">System Ready</button>
                </div>
            </div>
        `;
        this.uiLayer.appendChild(modal);

        document.getElementById('close-help').addEventListener('click', () => {
            modal.remove();
        });

        document.getElementById('demo-btn').addEventListener('click', () => {
            modal.remove();
            this.runGhostDemo();
        });
    }

    showInspector(data) {
        console.log('UI: showInspector called', data);
        if (!this.inspectorMode) {
            console.log('UI: Inspector Mode OFF, aborting');
            return;
        }

        console.log('UI: Removing hidden class');
        this.inspector.classList.remove('hidden');
        console.log('UI: Classes:', this.inspector.className);
        document.getElementById('insp-type').style.color = `hsl(${data.dna.hue}, 100%, 70%)`;

        // Growth Bar
        const pct = Math.floor((data.growth / data.maxGrowth) * 100);
        document.getElementById('insp-growth-bar').style.width = `${pct}%`;

        // Matrix-style DNA dump
        let dnaText = '';
        dnaText += `HUE : ${data.dna.hue}°\n`;
        dnaText += `TECH: ${data.dna.tech}\n`;
        dnaText += `ALIN: ${data.dna.alien}\n`;
        dnaText += `CHOS: ${data.dna.chaos}\n`;
        dnaText += `SYM : ${data.dna.symmetry}\n`;
        dnaText += `SPKS: ${data.dna.spikes}\n`;

        document.getElementById('insp-dna').textContent = dnaText;
    }

    updateWalletDisplay(detail) {
        const balanceEl = document.getElementById('tig-balance');
        const rankEl = document.getElementById('tig-rank');

        if (balanceEl && detail.balance !== undefined) {
            balanceEl.textContent = detail.balance.toFixed(2);
        }

        if (window.walletManager && rankEl) {
            const stats = window.walletManager.getStats();
            rankEl.textContent = stats.rank.title;
        }
    }

    showRankUpNotification(detail) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0);
            background: linear-gradient(135deg, rgba(0,255,255,0.2), rgba(255,215,0,0.2));
            border: 2px solid #ffd700; padding: 30px; border-radius: 15px;
            backdrop-filter: blur(10px); z-index: 10000; text-align: center;
            animation: rankUpPop 0.5s ease-out forwards;
        `;

        notification.innerHTML = `
            <div style="font-size: 3em;">🏆</div>
            <div style="font-size: 1.5em; color: #ffd700; font-weight: bold;">RANK UP!</div>
            <div style="font-size: 1.2em; color: #0ff;">${detail.newRank.title}</div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    showWalletModal() {
        console.log('💼 showWalletModal called');
        if (!window.walletManager) return;

        const stats = window.walletManager.getStats();
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';

        // Username input value
        const currentName = stats.username || 'Anonymous Gardener';

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <h2 style="color: #ffd700; margin-bottom: 20px;">💼 TIG WALLET</h2>
                
                <!-- Username Section -->
                <div style="margin-bottom: 20px;">
                    <label style="color: #0ff; font-size: 0.8em; display: block; margin-bottom: 5px;">IDENTITY</label>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="wallet-username" value="${currentName}" 
                            style="flex: 1; background: rgba(0,0,0,0.5); border: 1px solid #0ff; color: #fff; padding: 8px; border-radius: 5px;"
                            placeholder="Enter your name">
                        <button id="save-name-btn" style="padding: 8px 15px; background: rgba(0,255,255,0.2); border: 1px solid #0ff; color: #0ff; border-radius: 5px; cursor: pointer;">
                            💾 Save
                        </button>
                    </div>
                </div>

                <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="font-size: 2em; color: #ffd700; font-weight: bold;">
                        ⚡ ${stats.balance.toFixed(2)} TIG
                    </div>
                    <div style="color: #888; font-size: 0.9em;">
                        Flowers: ${Math.floor(stats.totalFlowersMined).toLocaleString()}
                    </div>
                </div>

                <div style="background: rgba(0,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="font-size: 1.2em; color: #0ff;">
                        🏆 ${stats.rank.title} (Rank ${stats.rank.level})
                    </div>
                </div>

                <!-- ID Card Generator -->
                <button id="generate-card-btn" style="width: 100%; padding: 15px; background: linear-gradient(90deg, #0ff, #00f); border: none; color: #fff; font-weight: bold; border-radius: 5px; cursor: pointer; margin-bottom: 20px; box-shadow: 0 0 15px rgba(0,255,255,0.3);">
                    🪪 GENERATE ID CARD
                </button>

                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <button id="export-wallet-btn" style="flex: 1; padding: 12px; background: rgba(0,255,0,0.2); border: 1px solid #0f0; color: #0f0; border-radius: 5px; cursor: pointer;">
                        📤 Export
                    </button>
                    <button id="import-wallet-btn" style="flex: 1; padding: 12px; background: rgba(0,255,255,0.2); border: 1px solid #0ff; color: #0ff; border-radius: 5px; cursor: pointer;">
                        📥 Import
                    </button>
                </div>

                <input type="file" id="wallet-file-input" accept=".tig" style="display: none;">

                <button id="close-wallet-modal" style="width: 100%; padding: 12px; background: rgba(255,0,0,0.2); border: 1px solid #f00; color: #f00; border-radius: 5px; cursor: pointer;">
                    Close
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        // Event Listeners
        document.getElementById('close-wallet-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

        // Save Username
        document.getElementById('save-name-btn').addEventListener('click', async () => {
            const newName = document.getElementById('wallet-username').value;
            await window.walletManager.setUsername(newName);
            alert('✅ Name saved!');
        });

        // Generate Card
        document.getElementById('generate-card-btn').addEventListener('click', async () => {
            const btn = document.getElementById('generate-card-btn');
            btn.textContent = '⏳ Generating...';
            try {
                const generator = new CardGenerator();
                const currentStats = window.walletManager.getStats();
                const wallet = await window.walletManager.db.getWallet(); // Get raw data for hash

                const dataUrl = await generator.generate(currentStats, wallet);

                // Trigger download
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = `TIG_ID_${currentStats.username.replace(/\s+/g, '_')}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                btn.textContent = '✅ Card Downloaded!';
                setTimeout(() => btn.textContent = '🪪 GENERATE ID CARD', 2000);
            } catch (err) {
                console.error(err);
                btn.textContent = '❌ Error';
                alert('Generation failed');
            }
        });

        document.getElementById('export-wallet-btn').addEventListener('click', async () => {
            await window.walletManager.exportWallet();
            alert('✅ Wallet exported!');
        });

        const fileInput = document.getElementById('wallet-file-input');
        document.getElementById('import-wallet-btn').addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    await window.walletManager.importWallet(file);
                    alert('✅ Wallet imported!');
                    modal.remove();
                    this.updateWalletDisplay({ balance: window.walletManager.balance });
                } catch (error) {
                    alert('❌ Import failed: ' + error.message);
                }
            }
        });
    }



    runGhostDemo() {
        // Clear grid first
        window.dispatchEvent(new CustomEvent('clear-grid'));

        // Create a fake cursor
        const cursor = document.createElement('div');
        cursor.className = 'ghost-cursor';
        cursor.style.transform = `translate(${window.innerWidth / 2}px, ${window.innerHeight / 2}px)`;
        this.uiLayer.appendChild(cursor);

        const moveCursor = (x, y, delay) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    cursor.style.transform = `translate(${x}px, ${y}px)`;
                    resolve();
                }, delay);
            });
        };

        const click = (delay) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    cursor.classList.add('clicking');
                    setTimeout(() => {
                        cursor.classList.remove('clicking');
                        resolve();
                    }, 200);
                }, delay);
            });
        };

        const simulateTool = (tool) => {
            window.dispatchEvent(new CustomEvent('tool-change', { detail: { tool } }));
            const btns = this.hud.querySelectorAll('.tool-btn');
            btns.forEach(b => b.classList.remove('active'));
            const target = this.hud.querySelector(`[data-tool="${tool}"]`);
            if (target) target.classList.add('active');
        };

        // Simulated Click on Canvas
        const triggerCanvasClick = (x, y) => {
            const canvas = document.getElementById('gameCanvas');
            const evt = new MouseEvent('click', {
                clientX: x,
                clientY: y,
                bubbles: true
            });
            canvas.dispatchEvent(evt);
        };

        // Simulated Drag
        const simulateDrag = async (startX, startY, endX, endY) => {
            const canvas = document.getElementById('gameCanvas');
            // Down
            canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: startX, clientY: startY, bubbles: true }));
            await new Promise(r => setTimeout(r, 100));

            // Move
            const steps = 10;
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const curX = startX + (endX - startX) * t;
                const curY = startY + (endY - startY) * t;
                window.dispatchEvent(new MouseEvent('mousemove', { clientX: curX, clientY: curY, bubbles: true }));
                await new Promise(r => setTimeout(r, 50));
            }

            // Up
            window.dispatchEvent(new MouseEvent('mouseup', { clientX: endX, clientY: endY, bubbles: true }));
        };

        // Demo Sequence
        (async () => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const sourceX = centerX - 150;
            const outputX = centerX + 150;

            // 1. Select Source
            await moveCursor(window.innerWidth - 80, 80, 500);
            simulateTool('source');
            await click(200);

            // 2. Place Source
            await moveCursor(sourceX, centerY, 800);
            await click(200);
            triggerCanvasClick(sourceX, centerY);

            // 3. Select Output
            await moveCursor(window.innerWidth - 80, 280, 800);
            simulateTool('output');
            await click(200);

            // 4. Place Output
            await moveCursor(outputX, centerY, 800);
            await click(200);
            triggerCanvasClick(outputX, centerY);

            // 5. Connect
            await moveCursor(sourceX, centerY, 500); // Back to source
            await click(200);
            await simulateDrag(sourceX, centerY, outputX, centerY);

            // Finish
            await moveCursor(centerX, centerY + 200, 500);
            setTimeout(() => cursor.remove(), 2000);
        })();
    }
}
