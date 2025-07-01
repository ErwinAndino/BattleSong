import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';

class AudioManager {
  constructor() {
    this.instruments = [];
    this.samplersLoaded = [false, false, false, false];
    this.parts = [];
    this.transport = Tone.getTransport();
    this.isReady = false;
    this.midiQueue = [];
    this.callbacksQueue = [];
    this.currentSetIndex = 0;
    this.cancelQueue = false;
    this.setDurations = []; // <-- Reinicia las duraciones
  }

  async start() {
    await Tone.start();
    await Promise.all([
      this.loadSynth(0, "synth"),
      this.loadSynth(1, "poly"),
      this.loadSampler(2, {
        "C2": "samples/kick_01.wav",
        "C#2": "samples/snare.wav",
        "F#2": "samples/hihat.wav",
        "F#3": "samples/kick_02.wav",
      }),
      this.loadSynth(3, "synth")
    ]);
    this.isReady = true;
    console.log("Todos los instrumentos listos");
  }

  async loadSampler(index, samples) {
    return new Promise((resolve, reject) => {
      const sampler = new Tone.Sampler(samples, {
        onload: () => {
          this.instruments[index] = sampler.toDestination();
          this.samplersLoaded[index] = true;
          console.log(`Sampler ${index} cargado`);
          resolve();
        },
        onerror: (err) => {
          console.error(`Error al cargar sampler ${index}`, err);
          reject(err);
        }
      });
    });
  }

  async loadSynth(index, type = "synth") {
    let synth;
    switch (type) {
      case "fm": synth = new Tone.FMSynth(); break;
      case "duo": synth = new Tone.DuoSynth(); break;
      case "poly": synth = new Tone.PolySynth(); break;
      case "metal": synth = new Tone.MetalSynth(); break;
      case "membrane": synth = new Tone.MembraneSynth(); break;
      case "pluck": synth = new Tone.PluckSynth(); break;
      default: synth = new Tone.Synth(); break;
    }
    this.instruments[index] = synth.toDestination();
  }

  setVolume(index, volume) {
    if (this.instruments[index]) {
      this.instruments[index].volume.value = Tone.gainToDb(volume);
    }
    console.log(`Volumen del instrumento ${index} ajustado a ${volume}`);
  }

  async loadAndCreatePart(index, midiPath, callback) {
    if (!this.instruments[index] || !midiPath) return null;

    try {
      const response = await fetch(midiPath);
      const arrayBuffer = await response.arrayBuffer();
      const midi = new Midi(arrayBuffer);

      if (!midi.tracks.length || !midi.tracks[0]?.notes?.length) {
        console.warn("El MIDI no tiene tracks válidos.");
        return null;
      }

      const inst = this.instruments[index];
      const notes = midi.tracks[0].notes
        .sort((a, b) => a.time - b.time)
        .map(note => ({
          time: note.time,
          name: note.name,
          duration: note.duration,
          velocity: note.velocity
        }));

      const bpm = midi.header.tempos[0]?.bpm || 120;

      const part = new Tone.Part((time, note) => {
        if (inst.triggerAttackRelease) {
          inst.triggerAttackRelease(note.name, note.duration, time, note.velocity);
        }
        if (callback) {
          callback(index, note, bpm);
        }
      }, notes);

      part.start(0);
      return { part, notes };

    } catch (error) {
      console.error("Error parseando MIDI:", error);
      return null;
    }
  }

  async playMultipleMIDIs(midiPaths, callbacks = []) {
    this.transport.stop();
    this.transport.cancel();
    this.transport.position = 0;

    this.parts.forEach(part => part?.dispose());
    this.parts = [];

    const results = await Promise.all(
      midiPaths.map(async (path, i) => {
        if (!path) return null;
        const cb = callbacks[i];
        return await this.loadAndCreatePart(i, path, cb);
      })
    );

    for (const res of results) {
      if (res?.part) {
        this.parts.push(res.part);
      }
    }

    this.transport.start();
    console.log(`Reproduciendo ${this.parts.length} MIDIs simultáneamente.`);

    // Calcular duración real del conjunto de notas
    const maxTime = results.reduce((max, res) => {
      if (!res?.notes) return max;
      const lastNoteEnd = res.notes.reduce((m, n) => Math.max(m, n.time + n.duration), 0);
      return Math.max(max, lastNoteEnd);
    }, 0);

    return maxTime; // margen de seguridad
  }

  async playMultipleMIDIsWithQueue(midiQueue, callbacksQueue) {
    this.cancelQueue = false; // Reset al iniciar
    this.midiQueue = midiQueue;
    this.callbacksQueue = callbacksQueue;
    this.currentSetIndex = 0;
    await this._playCurrentSet();
  }

  async _playCurrentSet() {
    if (this.currentSetIndex >= this.midiQueue.length) {
      console.log("✅ Fin de la cola de MIDIs.");
      return;
    }

    const currentMIDIs = this.midiQueue[this.currentSetIndex];
    const currentCallbacks = this.callbacksQueue[this.currentSetIndex] || [];

    const duration = await this.playMultipleMIDIs(currentMIDIs, currentCallbacks);

    this.setDurations[this.currentSetIndex] = duration; // <-- Guarda la duración

    setTimeout(async () => {
      if (this.cancelQueue) {
        console.log("⏹️ Cola de MIDIs cancelada.");
        return;
      }
      this.currentSetIndex++;
      await this._playCurrentSet();
    }, duration * 1000);
  }

  stopAll() {
    if (this.transport.state !== "stopped") {
      this.transport.stop();
      this.transport.cancel();
    }
    // Si tienes partes guardadas:
    if (this.parts) {
      this.parts.forEach(part => part?.dispose());
      this.parts = [];
    }
    this.cancelQueue = true; // <--- Detiene la cola
  }

  async getMIDIDuration(midiPaths) {
    const midiDurations = await Promise.all(
      midiPaths.map(async (path) => {
        const response = await fetch(path);
        const buffer = await response.arrayBuffer();
        const midi = new Midi(buffer);

        let maxTime = 0;
        midi.tracks.forEach(track => {
          track.notes.forEach(note => {
            const endTime = note.time + note.duration;
            if (endTime > maxTime) {
              maxTime = endTime;
            }
          });
        });



        return maxTime;
      })
    );

    const totalDuration = Math.max(...midiDurations); // en segundos relativos al tempo
    return totalDuration;
  }

  currentTime() {
    let elapsed = 0;
    for (let i = 0; i < this.currentSetIndex; i++) {
      elapsed += this.setDurations[i] || 0;
    }
    // Solo suma el tiempo actual del set si la cola no terminó
    if (this.currentSetIndex < this.midiQueue.length) {
      elapsed += this.transport.seconds;
    }
    return elapsed;
  }
}

const audioManager = new AudioManager();
export default audioManager;
