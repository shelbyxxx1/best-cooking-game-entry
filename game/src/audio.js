export function createAudio() {
  let context = null;
  let muted = false;
  let sizzleTimer = 0;

  function getContext() {
    if (!context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) context = new AudioContextClass();
    }
    if (context?.state === 'suspended') context.resume();
    return context;
  }

  function tone(frequency, duration, type = 'sine', volume = 0.055, endFrequency = frequency) {
    const audio = getContext();
    if (!audio || muted) return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const now = audio.currentTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(35, endFrequency), now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.01);
  }

  function noise(duration = 0.09, volume = 0.026, cutoff = 2200) {
    const audio = getContext();
    if (!audio || muted) return;
    const frameCount = Math.max(1, Math.floor(audio.sampleRate * duration));
    const buffer = audio.createBuffer(1, frameCount, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < frameCount; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / frameCount);
    const source = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const gain = audio.createGain();
    filter.type = 'lowpass'; filter.frequency.value = cutoff;
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(filter); filter.connect(gain); gain.connect(audio.destination);
    source.start();
  }

  function play(name) {
    if (name === 'chop') { tone(185, 0.055, 'triangle', 0.07, 78); noise(0.045, 0.025, 1300); }
    else if (name === 'grab') tone(590, 0.11, 'sine', 0.035, 760);
    else if (name === 'plate') { tone(820, 0.12, 'sine', 0.045, 1080); tone(1240, 0.085, 'sine', 0.018, 980); }
    else if (name === 'ready') { tone(515, 0.18, 'triangle', 0.045, 680); tone(770, 0.2, 'sine', 0.023, 980); }
    else if (name === 'sizzle' && sizzleTimer < performance.now()) { noise(0.36, 0.024, 3600); sizzleTimer = performance.now() + 520; }
    else if (name === 'serve') {
      tone(660, 0.35, 'sine', 0.07, 990);
      setTimeout(() => tone(990, 0.46, 'sine', 0.055, 1320), 80);
      setTimeout(() => tone(1320, 0.55, 'sine', 0.035, 1580), 170);
      noise(0.12, 0.025, 2800);
    } else if (name === 'error') { tone(200, 0.24, 'sawtooth', 0.035, 82); tone(130, 0.29, 'square', 0.013, 74); }
  }

  return {
    play,
    unlock() { getContext(); },
    toggle() { muted = !muted; return muted; },
    get muted() { return muted; },
  };
}
