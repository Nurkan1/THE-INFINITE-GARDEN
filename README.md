# 🌸 The Infinite Garden - Professional Edition

> **v1.2.0 | A Procedural Cyber-Zen Ecosystem Simulation**

![Badge](https://img.shields.io/badge/Version-1.2.0-cyan?style=flat-square)
![Badge](https://img.shields.io/badge/Engine-Vanilla_JS-yellow?style=flat-square)
![Badge](https://img.shields.io/badge/Build-Electron-blue?style=flat-square)

**The Infinite Garden** is a sandbox experience where technology meets nature. It simulates a digital ecosystem where energy (packets) flows through logic gates, mutating flowers into unique "Tech" or "Alien" species based on signal properties.

---

## 💎 New in v1.2.0: The Economy & Identity Update

We have introduced a simulated economy and a persistent progression system. You are no longer just an observer; you are an **Infinite Gardener**.

### ⚡ TIG Cryptocurrency Integration (Simulated)
* **Passive Mining:** Every flower that completes its life cycle successfully generates **0.01 TIG** (The Infinite Garden Token).
* **Persistent Wallet:** Your balance and rank are saved locally using **IndexedDB**.
* **Secure Import/Export:** Transfer your wallet between devices using a JSON file + SHA-256 Hash verification system.

### 🪪 Digital Identity System
* **ID Card Generator:** Generate a professional, game-styled identity card that proves your **Rank** and **Balance**.
* **Cryptographic Verification:** Every card includes a verification hash and a unique timestamp ID.
* **Rank System:** Ascend through **7 tiers**, from *Seedling* to *Infinite Gardener*.

### 🧬 Logic Gates as Mutagens
Logic gates now influence the "genetic" makeup of your garden:
* **SYNC (AND):** Acts as a **Tech-Mutagen**. Forces growth into rigid, symmetrical, circuit-like flowers (Cyan/Green).
* **ONE (XOR):** Acts as an **Alien-Mutagen**. Forces growth into organic, tentacled, asymmetrical flowers (Violet/Magenta).
* **MERGE (OR):** Promotes wild, lush, and standard growth.
* **Hybridization:** Chain different gates to create complex "Alien-Circuit" hybrids.

---

## 🌟 Key Features

* **Procedural Xenobiology:** Every flower is unique, generated via fractal algorithms based on "genetic" data passed through the network.
* **Bio-Data Inspector:** Toggle the Inspector to analyze growth progress, DNA traits (Tech, Alien, Chaos, Hue), symmetry, and spikiness in real-time.
* **Living Connections:** Neural links that sway with the wind and pulse with energy.
* **Digital Flux:** Dynamic cursor trails and a living grid background that reacts to the ecosystem.
* **Automated Gardener:** Double-click Source nodes to auto-connect to nearby seeds instantly.

### 🎨 Visual Choreography (Dance Modes)
Press `Ctrl+B` to switch between rendering algorithms:
1.  **Organic:** Natural, bezier vines.
2.  **Tech:** Cyberpunk, rectilinear circuitry ("Manhattan" style).
3.  **Sine:** Oscillating waveforms.
4.  **Chaos:** High-entropy rainbow storms.

---

## 🛠️ Installation (Portable)

No installation required. This is a portable application.

1.  Download the latest release for your OS (e.g., `TheInfiniteGarden-v1.2.0.exe` or `.AppImage`).
2.  Run the executable.
3.  *Note: A dedicated GPU is recommended for optimal performance due to heavy particle and fluid calculations.*

---

## 💻 Controls

| Action | Command |
| :--- | :--- |
| **Open Build Menu** | `Right Click` (Select Source / Merge / Sync / One / Output) |
| **Connect Nodes** | `Left Drag` |
| **Move Clusters** | `Shift + Drag` (Group Drag) |
| **Auto-Connect** | `Double-Click` on a Source Node |
| **Inspect DNA** | `Double-Click` on a Flower (Output Node) |
| **Cycle Visual Style** | `Ctrl + B` |
| **Wallet / ID Card** | Click the `💼 Wallet` icon in the HUD |
| **Toggle Inspector** | Click the `👁️ Eye` icon in the HUD |

---

## 🔧 Development & Build Setup

This project is built with **Vanilla JavaScript (ES6+)** for the core simulation engine and **HTML5 Canvas** for rendering, encapsulated in **Electron** with **Vite**.

```bash
# Install dependencies
npm install

# Run development server (Hot Reload)
npm run dev

# Build for Windows
npm run build

# Build for Linux (AppImage)
npm run build:linux
