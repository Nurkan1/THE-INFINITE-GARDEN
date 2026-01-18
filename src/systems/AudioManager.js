export class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.15; // Much softer global volume
        this.masterGain.connect(this.ctx.destination);

        // Pentatonic scale frequencies (C Major Pentatonic: C, D, E, G, A)
        this.scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];

        // Throttling
        this.lastGrowSound = 0;
    }

    playTone(index, duration = 0.5, type = 'sine', vol = 1.0) {
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Add slight random detune for organic feel
        const detune = (Math.random() - 0.5) * 10;
        const freq = (this.scale[index % this.scale.length] * (Math.pow(2, Math.floor(index / this.scale.length)))) + detune;

        osc.frequency.value = freq;
        osc.type = type;

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();

        // Softer Envelope (Ambient)
        const now = this.ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.1); // Slower attack (was 0.05)
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.stop(now + duration);
    }

    playPlaceSound() {
        this.playTone(4, 0.4, 'sine', 0.8); // Changed triangle to sine
    }

    playConnectSound() {
        this.playTone(3, 0.5, 'sine', 0.8);
    }

    playPulseSound() {
        // Very low, subtle heartbeat
        this.playTone(0, 0.3, 'sine', 0.3);
    }

    playArriveSound() {
        // High sparkling chime
        this.playTone(7, 0.8, 'sine', 0.6);
    }

    playGrowSound() {
        // Throttle to avoid swarm noise
        const now = performance.now();
        if (now - this.lastGrowSound < 50) return; // Max 20 sounds per sec
        this.lastGrowSound = now;

        // Gentle bubbling
        // Removed the triangle wave entirely
        // Higher pitch but very quiet
        const note = Math.floor(Math.random() * 5) + 5;
        this.playTone(note, 0.3, 'sine', 0.2);
    }

    playDeleteSound() {
        this.playTone(0, 0.4, 'sine', 0.5);
    }
}

export const audioManager = new AudioManager();
