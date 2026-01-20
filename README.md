# 🌸 The Infinite Garden - Professional Edition

> **v1.2.0 | A Procedural Cyber-Zen Ecosystem Simulation**

<img width="1919" height="890" alt="Captura de pantalla 2026-01-20 102228" src="https://github.com/user-attachments/assets/dba92df6-b0d9-43f8-a473-a0f35a040d93" />
![Badge](https://img.shields.io/badge/Version-1.2.0-cyan?style=flat-square)
![Badge](https://img.shields.io/badge/Engine-Vanilla_JS-yellow?style=flat-square)
![Badge](https://img.shields.io/badge/Build-Electron-blue?style=flat-square)

**The Infinite Garden** is ![Uploading Captura de pantalla 2026-01-20 102228.png…]()
a sandbox experience where technology meets nature. It simulates a digital ecosystem where energy (packets) flows through logic gates, mutating flowers into unique "Tech" or "Alien" species based on signal properties.

---

## 💎 New in v1.2.0: The Economy & Identity Update

We have introduced a simulated economy and a persistent progression system. You are no longer just an observer; you are an **Infinite Gardener**.

### ⚡ TIG Economy (Simulated)
* **Mining:** Dead flowers decompose into **0.01 TIG** (The Infinite Garden Token).
* **Ranks:** Accumulate TIG to ascend from *Seedling* to *Infinite Gardener*.
* **Wallet:** Persistent storage using IndexedDB.
* **Import/Export:** Securely move your wealth between devices using keys.

### 🪪 Digital Identity System
* **ID Card Generator:** Generate a professional, game-styled identity card that proves your **Rank** and **Balance**.
* **Cryptographic Verification:** Every card includes a verification hash and a unique timestamp ID.

### 🧬 Logic Gates as Mutagens
Logic gates now influence the "genetic" makeup of your garden:
* **SYNC (AND):** Acts as a **Tech-Mutagen**. Forces growth into rigid, symmetrical, circuit-like flowers (Cyan/Green).
* **ONE (XOR):** Acts as an **Alien-Mutagen**. Forces growth into organic, tentacled, asymmetrical flowers (Violet/Magenta).
* **MERGE (OR):** Promotes wild, lush, and standard growth.

---

## 🌟 Key Features

* **Procedural Xenobiology:** Source Nodes provide raw energy (Hydro-Data). Output Nodes (Flowers) possess unique DNA that determines their fractal structure and color.
* **Bio-Data Inspector:** Toggle the Inspector to analyze growth progress, DNA traits, symmetry, and spikiness in real-time.
* **Living Connections:** Neural links that sway with the wind and pulse with energy.
* **Visual Choreography (Dance Modes):** Press `Ctrl+B` to switch between Organic, Tech, Sine, and Chaos rendering styles.

---

## 💻 Control Interface

| Action | Input / Command |
| :--- | :--- |
| **Open Build Menu** | `Right Click` (on empty background) |
| **Delete / Prune Object** | `Right Click` (directly on a Node/Object) |
| **Connect Nodes** | `Left Click + Drag` (from port to port) |
| **Move Object / Cluster** | `Shift + Left Click + Drag` (Hold Shift, Click Object & Move) |
| **Auto-Connect** | `Double-Click` on a Source Node |
| **Inspect DNA** | `Double-Click` on a Flower (Output Node) |
| **Cycle Visual Style** | `Ctrl + B` |
| **Wallet / ID Card** | Click the `💼 Wallet` icon in the HUD |
| **Toggle Inspector** | Click the `👁️ Eye` icon in the HUD |

---

## 🛠️ Installation (Portable)

No installation required. This is a portable application.

1.  Download the latest release for your OS (e.g., `TheInfiniteGarden-v1.2.0.exe` or `.AppImage`).
2.  Run the executable.
3.  *⚠️ **Performance Notice:** A dedicated GPU is recommended for optimal performance due to heavy particle, fluid dynamics, and fractal geometry calculations.*

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
