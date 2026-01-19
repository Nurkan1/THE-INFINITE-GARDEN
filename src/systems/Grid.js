export class Grid {
    constructor(cellSize = 40) {
        this.cellSize = cellSize;
        this.nodes = new Map(); // key: "x,y", value: Node
        this.connections = []; // List of Connection objects

        // Listen for seed dispersal
        window.addEventListener('spawn-node', (e) => {
            this.handleSpawn(e.detail);
        });
    }

    handleSpawn(data) {
        const { x, y } = data;
        // Check 8 neighbors
        const neighbors = [
            { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
            { dx: -1, dy: 1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }
        ];

        // Shuffle neighbors
        for (let i = neighbors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
        }

        for (const n of neighbors) {
            const nx = x + n.dx;
            const ny = y + n.dy;

            // Bounds check (roughly 0-50)
            if (nx < 0 || ny < 0 || nx > 50 || ny > 30) continue;

            if (!this.nodes.has(`${nx},${ny}`)) {
                // Determine node type. Mostly Output, rarely Logic?
                // User wants "Planting flowers".
                // We need to import OutputNode dynamically or better, pass factory.
                // Since this is ES check if we can import here or rely on global class registry.
                // Grid doesn't know about OutputNode class usually... 
                // We'll dispatch 'create-node' back to Main or handle it if we can access classes.
                // Wait, Grid.js is a module. We can't circulate dependency with OutputNode easily if Node imports Grid or vice versa?
                // Actually Node doesn't import Grid.

                // Let's dispatch 'request-node-creation' to GameLoop/Main which knows all classes? 
                // OR just modify UI/InputHandler to listen?
                // InputHandler creates nodes.
                // Let's forward this to window 'create-node' event that InputHandler or Main picks up.

                window.dispatchEvent(new CustomEvent('create-node-request', {
                    detail: { x: nx, y: ny, type: 'output', dna: data.parentDNA }
                }));
                return; // Plant one seed only
            }
        }
    }

    addConnection(connection) {
        // Prevent duplicate connections (directional)
        const exists = this.connections.some(c =>
            c.fromNode === connection.fromNode && c.toNode === connection.toNode
        );
        if (exists) return false;
        this.connections.push(connection);
        return true;
    }

    addNode(node) {
        const key = `${node.gridX},${node.gridY}`;
        if (this.nodes.has(key)) return false;
        this.nodes.set(key, node);
        return true;
    }

    removeNode(gridX, gridY) {
        const key = `${gridX},${gridY}`;
        const node = this.nodes.get(key);
        if (!node) return false;

        // Remove associated connections
        this.connections = this.connections.filter(conn =>
            conn.fromNode !== node && conn.toNode !== node
        );

        // Remove from other nodes' connection lists?
        // Connections are stored in the grid list AND in the 'fromNode.connections' array.
        // We need to clean up potential references if other nodes point to this one?
        // Actually, 'fromNode.connections' stores outgoing connections.
        // If we delete 'node', we must ensure any OTHER node having a connection TO this node 
        // also has that connection removed from its list.
        // But 'Connection' object has reference. 
        // 'Node.connections' is only outgoing.

        // Loop through all nodes to remove outgoing connections pointing to this deleted node
        for (const otherNode of this.nodes.values()) {
            otherNode.connections = otherNode.connections.filter(conn => conn.toNode !== node);
        }

        return this.nodes.delete(key);
    }

    getNode(gridX, gridY) {
        return this.nodes.get(`${gridX},${gridY}`);
    }

    // Convert screen coordinates to grid coordinates
    screenToGrid(x, y) {
        return {
            x: Math.floor(x / this.cellSize),
            y: Math.floor(y / this.cellSize)
        };
    }

    // Convert grid coordinates to top-left screen coordinates of the cell
    gridToScreen(gx, gy) {
        return {
            x: gx * this.cellSize,
            y: gy * this.cellSize
        };
    }

    // Snap screen coordinates to the center of the nearest grid cell
    snapToGrid(x, y) {
        const gridPos = this.screenToGrid(x, y);
        const screenPos = this.gridToScreen(gridPos.x, gridPos.y);
        return {
            x: screenPos.x + this.cellSize / 2,
            y: screenPos.y + this.cellSize / 2
        };
    }

    // Automated Gardener: Connect source to all disconnected seeds
    autoConnect(sourceNode) {
        let connectedCount = 0;
        const targets = [];

        for (const node of this.nodes.values()) {
            if (node === sourceNode) continue;
            // Only targets that accept inputs (Logic or Output)
            if (node.type !== 'output' && node.type !== 'logic') continue;

            // Check if already connected from THIS source
            const alreadyConnected = this.connections.some(c => c.fromNode === sourceNode && c.toNode === node);
            if (alreadyConnected) continue;

            // Optional: Prioritize nodes with NO connections at all?
            // "Connect seeds" implies young/new nodes.
            // Let's target any OutputNode with growth < 10 (Seeds)
            if (node.type === 'output' && node.growthLevel > 10) continue;

            targets.push(node);
        }

        // Connect/Animate
        targets.forEach((target, index) => {
            setTimeout(() => {
                const conn = new Connection(sourceNode, target);
                // We need to import Connection class? 
                // Grid doesn't import Connection. 
                // We should probably pass the Connection factory or class, or handle this in main.
                // But Grid has 'addConnection'.
                // Ideally this logic belongs in a System that knows both. 
                // Let's return the list of targets and let Main handle creation to avoid circular deps if any.
            }, index * 50); // Staggered effect
        });

        return targets;
    }

    // Group Drag Logic
    getCluster(startNode) {
        const cluster = new Set();
        const queue = [startNode];
        cluster.add(startNode);

        while (queue.length > 0) {
            const current = queue.shift();
            // Find all outgoing connections from current
            const outgoing = this.connections
                .filter(c => c.fromNode === current)
                .map(c => c.toNode);

            for (const node of outgoing) {
                if (!cluster.has(node)) {
                    cluster.add(node);
                    queue.push(node);
                }
            }
        }
        return Array.from(cluster);
    }

    moveCluster(cluster, dx, dy) {
        if (dx === 0 && dy === 0) return true;

        // 1. Check for collisions
        // Calculate all desired new positions
        const moves = new Map(); // node -> {newX, newY, oldX, oldY}

        for (const node of cluster) {
            const nx = node.gridX + dx;
            const ny = node.gridY + dy;

            // Bounds Check
            if (nx < 0 || ny < 0 || nx > 100 || ny > 50) return false;

            // Collision Check with NON-CLUSTER nodes
            const key = `${nx},${ny}`;
            const occupant = this.nodes.get(key);
            if (occupant && !cluster.includes(occupant)) {
                return false; // Blocked by something else
            }
            moves.set(node, { nx, ny, oldX: node.gridX, oldY: node.gridY });
        }

        // 2. Perform Move
        // Must remove all old keys first to avoid self-collision during partial updates
        for (const [node, pos] of moves) {
            this.nodes.delete(`${pos.oldX},${pos.oldY}`);
        }

        for (const [node, pos] of moves) {
            node.gridX = pos.nx;
            node.gridY = pos.ny;
            this.nodes.set(`${pos.nx},${pos.ny}`, node);
        }

        return true;
    }

    draw(ctx, width, height) {
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x <= width; x += this.cellSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= height; y += this.cellSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw dots at intersections for a more "tech" feel
        const time = performance.now() / 1000;

        for (let x = 0; x <= width; x += this.cellSize) {
            for (let y = 0; y <= height; y += this.cellSize) {
                // Shimmer Effect
                const wave = Math.sin(x * 0.05 + y * 0.05 + time) * 0.5 + 0.5;
                const alpha = 0.1 + wave * 0.2; // Base 0.1, up to 0.3

                ctx.fillStyle = `rgba(34, 34, 34, ${alpha * 2})`; // Simulating brightness

                // Occasional bright glint
                if (Math.random() < 0.0005) {
                    ctx.fillStyle = '#fff';
                    ctx.globalAlpha = 0.5;
                    ctx.fillRect(x - 1, y - 1, 3, 3);
                    ctx.globalAlpha = 1.0;
                } else {
                    ctx.fillRect(x - 1, y - 1, 2, 2);
                }
            }
        }

        // Draw Connections (Background Layer)
        for (const connection of this.connections) {
            connection.draw(ctx, this, this.cellSize);
        }

        // Draw Nodes (Foreground Layer)
        for (const node of this.nodes.values()) {
            const screenPos = this.gridToScreen(node.gridX, node.gridY);
            // Center the node
            const cx = screenPos.x + this.cellSize / 2;
            const cy = screenPos.y + this.cellSize / 2;
            node.draw(ctx, cx, cy, this.cellSize);
        }
    }
}
