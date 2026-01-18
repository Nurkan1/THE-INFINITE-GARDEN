// No change needed in code if I move the file.
import { CanvasManager } from './src/core/CanvasManager.js'
import { GameLoop } from './src/core/GameLoop.js'
import { Grid } from './src/systems/Grid.js'
import { InputHandler } from './src/core/InputHandler.js'
import { SourceNode, LogicNode, OutputNode } from './src/entities/Node.js'
import './styles.css'
import { Connection } from './src/entities/Connection.js'
import { audioManager } from './src/systems/AudioManager.js'
import { UIManager } from './src/systems/UI.js'
import { particleSystem } from './src/systems/ParticleSystem.js'
import { DigitalRainSystem } from './src/systems/DigitalRain.js'
import { FXManager } from './src/systems/FX.js'
import { environment } from './src/systems/Environment.js'

console.log('BitBloom Initialized');

const canvasManager = new CanvasManager('gameCanvas');
const fxManager = new FXManager(canvasManager);
const uiManager = new UIManager();
const digitalRain = new DigitalRainSystem(canvasManager.width, canvasManager.height);

window.addEventListener('resize', () => {
    canvasManager.resize();
    digitalRain.resize(canvasManager.width, canvasManager.height);
});

// Expose globally
window.audioManager = audioManager;
window.environment = environment;

const grid = new Grid(50); // 50px cell size
window.grid = grid; // Expose for Effects
const inputHandler = new InputHandler(canvasManager.canvas, canvasManager);

// Handle UI events
window.addEventListener('clear-grid', () => {
    grid.nodes.clear();
    grid.connections = [];
    audioManager.playPlaceSound();
});

// Interaction State
let dragStartNode = null;
let dragCurrentPos = null;
let dragCluster = null;
let dragLastGridPos = null;

// Hotkeys
window.addEventListener('keydown', (e) => {
    // Ctrl + B = Baile (Dance) / Switch Styles
    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        Connection.renderMode = (Connection.renderMode + 1) % 4;

        const modes = ['ORGANIC', 'TECH', 'SINE', 'CHAOS'];
        console.log(`Connection Style: ${modes[Connection.renderMode]}`);

        // Visual Cue
        audioManager.playArriveSound();
        fxManager.triggerShake(5, 0.2);
    }
});

// Game State
let gameState = {
    won: false
};

// Handle Auto-Planting
window.addEventListener('create-node-request', (e) => {
    const { x, y, type, dna } = e.detail;
    if (type === 'output') {
        const newNode = new OutputNode(x, y, dna);

        if (grid.addNode(newNode)) {
            const screen = grid.gridToScreen(x, y);
            particleSystem.emit(screen.x + 20, screen.y + 20, '#0f0', 10);
            console.log('Life finds a way at', x, y);
        }
    }
});

function update(deltaTime) {
    digitalRain.update(deltaTime);
    fxManager.update(deltaTime);
    environment.update(deltaTime);

    // Update all nodes
    let totalOutputs = 0;
    let fullyGrownOutputs = 0;

    for (const node of grid.nodes.values()) {
        node.update(deltaTime);
        if (node.type === 'output') {
            totalOutputs++;
            if (node.growthLevel >= node.maxGrowth) {
                fullyGrownOutputs++;
            }
        }
    }

    // Check Win Condition
    // Infinite Mode: No win condition. 
    // Just feedback when a flower blooms.
    // if (totalOutputs > 0 && fullyGrownOutputs === totalOutputs && !gameState.won) {
    //    gameState.won = true;
    //    console.log('WINNER');
    //    uiManager.showWinScreen();
    //    audioManager.playArriveSound(); // Celebrate
    //    // Make rain faster?
    //    digitalRain.columns.forEach(c => c.speed *= 5);
    //    fxManager.triggerShake(50, 2.0); // Massive shake on win
    // }

    // Update connections
    for (const connection of grid.connections) {
        connection.update(deltaTime);
    }

    particleSystem.update(deltaTime);
    handleInput();

    // Update UI Objective
    uiManager.updateObjective(fullyGrownOutputs, totalOutputs);
    uiManager.updateEnvironment(environment);
}

function handleInput() {
    const mousePos = inputHandler.getMousePos();
    const gridPos = grid.screenToGrid(mousePos.x, mousePos.y);
    const nodeUnderMouse = grid.getNode(gridPos.x, gridPos.y);

    // Pollen Trail
    // mousePos is already defined at top of function
    if (Math.random() < 0.3) {
        // Random cyan/magenta dust
        const color = Math.random() > 0.5 ? '#0ff' : '#f0f';
        // Tiny particle, short life
        particleSystem.emit(mousePos.x, mousePos.y, color, 1);
    }

    if (inputHandler.isMouseDown) {
        if (!dragStartNode && !dragCluster) {
            // Mouse just pressed
            if (nodeUnderMouse) {
                if (inputHandler.isShiftDown) {
                    // START GROUP DRAG
                    dragCluster = grid.getCluster(nodeUnderMouse);
                    dragLastGridPos = gridPos;
                    // Visual cue?
                    console.log('Dragging cluster of size:', dragCluster.length);
                } else {
                    // Start dragging from this node (Connect mode)
                    dragStartNode = nodeUnderMouse;
                    dragCurrentPos = mousePos;
                }
            }
        } else {
            // Currently dragging
            if (dragCluster) {
                // MOVE MODE
                const dx = gridPos.x - dragLastGridPos.x;
                const dy = gridPos.y - dragLastGridPos.y;

                if (dx !== 0 || dy !== 0) {
                    if (grid.moveCluster(dragCluster, dx, dy)) {
                        dragLastGridPos = gridPos;
                    }
                }
            } else {
                // CONNECT MODE
                dragCurrentPos = mousePos;
            }
        }
    } else {
        // Mouse Released
        if (dragCluster) {
            dragCluster = null;
            dragLastGridPos = null;
        }

        if (dragStartNode) {
            console.log('Drag released. From:', dragStartNode.type, 'To:', nodeUnderMouse ? nodeUnderMouse.type : 'None');

            if (nodeUnderMouse && nodeUnderMouse !== dragStartNode) {
                // Release on different node -> Connect!
                const newConnection = new Connection(dragStartNode, nodeUnderMouse);
                // Try to add to grid
                if (grid.addConnection(newConnection)) {
                    dragStartNode.connections.push(newConnection);
                    audioManager.playConnectSound();
                    fxManager.triggerShake(5, 0.5); // Small shake on connection

                    // Juice: Spark Burst at connection point
                    const endPos = grid.gridToScreen(nodeUnderMouse.gridX, nodeUnderMouse.gridY);
                    particleSystem.emit(endPos.x + 25, endPos.y + 25, '#0ff', 20);
                    fxManager.triggerShake(5, 0.2); // Subtle shake on connect

                    console.log('Connected!');
                } else {
                    console.log('Connection failed (duplicate or invalid)');
                }
            }
            // Reset drag
            dragStartNode = null;
            dragCurrentPos = null;
        }
    }
}

// Tool State
let currentTool = 'source'; // Default

window.addEventListener('tool-change', (e) => {
    currentTool = e.detail.tool;
    console.log('Tool selected:', currentTool);
});

// Separate click handler for placement
canvasManager.canvas.addEventListener('click', (e) => {
    // If we were dragging, click is part of drag release, so ignore.
    if (dragStartNode) return;

    const mousePos = inputHandler.getMousePos();
    const gridPos = grid.screenToGrid(mousePos.x, mousePos.y);
    const existingNode = grid.getNode(gridPos.x, gridPos.y);

    if (!existingNode) {
        let newNode;

        switch (currentTool) {
            case 'source':
                newNode = new SourceNode(gridPos.x, gridPos.y);
                break;
            case 'output':
                console.log('Creating OutputNode...');
                newNode = new OutputNode(gridPos.x, gridPos.y);
                console.log('Created:', newNode);
                break;
            case 'or':
                newNode = new LogicNode(gridPos.x, gridPos.y, 'OR');
                break;
            case 'and':
                newNode = new LogicNode(gridPos.x, gridPos.y, 'AND');
                break;
            case 'xor':
                newNode = new LogicNode(gridPos.x, gridPos.y, 'XOR');
                break;
        }

        if (newNode && grid.addNode(newNode)) {
            audioManager.playPlaceSound();
            particleSystem.emit(mousePos.x, mousePos.y, '#fff', 5);
        }
    } else {
        // Left click on existing node does nothing for now (maybe select?)
    }
});

// Right click to remove
canvasManager.canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // Stop browser menu

    const mousePos = inputHandler.getMousePos();
    const gridPos = grid.screenToGrid(mousePos.x, mousePos.y);
    const existingNode = grid.getNode(gridPos.x, gridPos.y);

    if (existingNode) {
        // Remove it!
        grid.removeNode(gridPos.x, gridPos.y);
        audioManager.playDeleteSound();
        particleSystem.emit(mousePos.x, mousePos.y, '#f00', 15); // Red explosion
        fxManager.triggerShake(5, 0.2);
    }
});

// Double Click: Automated Gardener
canvasManager.canvas.addEventListener('dblclick', (e) => {
    e.preventDefault();
    const mousePos = inputHandler.getMousePos();
    const gridPos = grid.screenToGrid(mousePos.x, mousePos.y);
    const node = grid.getNode(gridPos.x, gridPos.y);

    if (node && node.type === 'source') {
        const targets = grid.autoConnect(node);

        if (targets && targets.length > 0) {
            console.log(`Auto-Gardener: Connecting to ${targets.length} seeds.`);
            audioManager.playArriveSound();

            targets.forEach((target, i) => {
                setTimeout(() => {
                    const conn = new Connection(node, target);
                    if (grid.addConnection(conn)) {
                        node.connections.push(conn);
                        audioManager.playConnectSound();

                        // FX Beam
                        const start = grid.gridToScreen(node.gridX, node.gridY);
                        const end = grid.gridToScreen(target.gridX, target.gridY);
                        const dx = end.x - start.x;
                        const dy = end.y - start.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const steps = Math.floor(dist / 20);
                        for (let s = 0; s < steps; s++) {
                            const px = start.x + (dx * (s / steps)) + 20;
                            const py = start.y + (dy * (s / steps)) + 20;
                            particleSystem.emit(px, py, '#0ff', 1);
                        }
                    }
                }, i * 50);
            });
        }
    }
});

function render() {
    canvasManager.clear();

    fxManager.applyTransform(); // Start Shake

    // Draw Background Effects (Rain)
    digitalRain.draw(canvasManager.ctx);

    // Draw Grid (handles nodes and connections)
    grid.draw(canvasManager.ctx, canvasManager.width, canvasManager.height);

    // Draw Particles (on top)
    particleSystem.draw(canvasManager.ctx);

    // Draw Drag Line
    if (dragStartNode && dragCurrentPos) {
        const startPos = grid.gridToScreen(dragStartNode.gridX, dragStartNode.gridY);
        const centerStart = { x: startPos.x + grid.cellSize / 2, y: startPos.y + grid.cellSize / 2 };

        const ctx = canvasManager.ctx;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerStart.x, centerStart.y);
        ctx.lineTo(dragCurrentPos.x, dragCurrentPos.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Highlight cell under mouse
    const mousePos = inputHandler.getMousePos();
    const gridPos = grid.snapToGrid(mousePos.x, mousePos.y);

    canvasManager.ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
    canvasManager.ctx.beginPath();
    canvasManager.ctx.arc(gridPos.x, gridPos.y, 10, 0, Math.PI * 2);
    canvasManager.ctx.fill();

    fxManager.restoreTransform(); // End Shake

    // Update Stats
    // Calculate System IQ
    let systemIQ = 0;
    for (const node of grid.nodes.values()) {
        if (node.type === 'logic') {
            if (node.gateType === 'AND') systemIQ += 5;
            else if (node.gateType === 'XOR') systemIQ += 10;
            else systemIQ += 2; // OR
        }
        if (node.type === 'output' && node.growthLevel >= node.maxGrowth) {
            systemIQ += 50;
        }
    }
    systemIQ += grid.connections.length;

    // Update Stats
    uiManager.updateStats(grid.nodes.size, grid.connections.length);
    document.getElementById('system-iq').textContent = `System IQ: ${systemIQ}`;
}

const gameLoop = new GameLoop(update, render);
gameLoop.start();
