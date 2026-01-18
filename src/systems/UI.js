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
                <h1>THE INFINITE GARDEN</h1>
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
            </div>
            <button id="help-btn" class="help-btn">?</button>
            <div class="controls">
                <button id="clear-btn">Clear Grid</button>
            </div>
            <div class="tools-palette">
                <button id="palette-toggle" title="Toggle Menu">☰</button>
                <div class="tool-items">
                    <div class="tool-label">TOOLS</div>
                    <button class="tool-btn active" data-tool="source">SOURCE</button>
                    <button class="tool-btn" data-tool="or">MERGE</button>
                    <button class="tool-btn" data-tool="and">SYNC</button>
                    <button class="tool-btn" data-tool="xor">ONE</button>
                    <button class="tool-btn" data-tool="output">OUTPUT</button>
                </div>
            </div>
        `;
        this.uiLayer.appendChild(this.hud);

        this.attachListeners();
    }

    attachListeners() {
        document.getElementById('clear-btn').addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('clear-grid'));
        });

        document.getElementById('help-btn').addEventListener('click', () => {
            this.showHelpModal();
        });

        const palette = this.hud.querySelector('.tools-palette');
        const toggleBtn = document.getElementById('palette-toggle');
        toggleBtn.addEventListener('click', () => {
            palette.classList.toggle('collapsed');
            toggleBtn.textContent = palette.classList.contains('collapsed') ? '🛠️' : '☰';
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
            <div class="tutorial-card help-modal" style="width: 600px; max-width: 90vw;">
                <h2 style="border-bottom: 2px solid #0ff; padding-bottom: 10px; margin-bottom: 20px;">SYSTEM MANUAL v1.0.2</h2>
                
                <div class="guide-content" style="text-align: left; max-height: 50vh; overflow-y: auto; padding-right: 10px;">
                    
                    <h3 style="color: #0ff; margin-top: 10px;">🎮 Control Interface</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 8px;"><strong>Right Click</strong>: Instantiate Modules (Source, Logic, Output).</li>
                        <li style="margin-bottom: 8px;"><strong>Drag (L-Click)</strong>: Establish neural connections.</li>
                        <li style="margin-bottom: 8px;"><strong>Shift + Drag</strong>: Relocate node clusters (Group Move).</li>
                        <li style="margin-bottom: 8px;"><strong>Double Click Source</strong>: Auto-link to nearest idle seeds (Automated Gardener).</li>
                        <li style="margin-bottom: 8px;"><strong>Ctrl + B</strong>: Cycle Connection Visualization (Organic / Tech / Sine / Chaos).</li>
                        <li style="margin-bottom: 8px;"><strong>Right Click Object</strong>: Prune/Delete.</li>
                    </ul>

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

                <div class="modal-actions" style="margin-top: 20px;">
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

    runGhostDemo() {
        // Clear grid first
        window.dispatchEvent(new CustomEvent('clear-grid'));

        // Create a fake cursor
        const cursor = document.createElement('div');
        cursor.className = 'ghost-cursor';
        // Start position
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
            await click(200); // Visual click
            await simulateDrag(sourceX, centerY, outputX, centerY);

            // Finish
            await moveCursor(centerX, centerY + 200, 500);
            setTimeout(() => cursor.remove(), 2000);
        })();
    }
}
