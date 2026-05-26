const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 44100;
const BITS_PER_SAMPLE = 16;
const NUM_CHANNELS = 1;

function generateWav(frequency, duration, outputPath, vibrato = false) {
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const dataSize = numSamples * NUM_CHANNELS * (BITS_PER_SAMPLE / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // AudioFormat (PCM)
  buffer.writeUInt16LE(NUM_CHANNELS, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * NUM_CHANNELS * (BITS_PER_SAMPLE / 8), 28);
  buffer.writeUInt16LE(NUM_CHANNELS * (BITS_PER_SAMPLE / 8), 32);
  buffer.writeUInt16LE(BITS_PER_SAMPLE, 34);

  // data chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate sine wave with envelope (fade in/out)
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Envelope: fade in first 5%, fade out last 10%
    let envelope = 1.0;
    const fadeIn = duration * 0.05;
    const fadeOut = duration * 0.1;
    if (t < fadeIn) envelope = t / fadeIn;
    if (t > duration - fadeOut) envelope = (duration - t) / fadeOut;

    let freq = frequency;
    if (vibrato) {
      freq += Math.sin(t * Math.PI * 8) * 15; // 8Hz vibrato, ±15Hz
    }

    const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.5; // 50% volume
    const int16 = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    buffer.writeInt16LE(int16, 44 + i * 2);
  }

  // Add a second tone for alarm-like sounds
  if (vibrato) {
    for (let i = Math.floor(numSamples * 0.4); i < Math.floor(numSamples * 0.7); i++) {
      const t = i / SAMPLE_RATE;
      const envelope = 0.6;
      const sample = Math.sin(2 * Math.PI * frequency * 1.5 * t) * envelope * 0.4;
      const existing = buffer.readInt16LE(44 + i * 2);
      const mixed = Math.max(-32768, Math.min(32767, existing + Math.floor(sample * 32767)));
      buffer.writeInt16LE(mixed, 44 + i * 2);
    }
  }

  fs.writeFileSync(outputPath, buffer);
  console.log(`Created: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

const soundsDir = path.join(__dirname, "..", "assets", "sounds");
fs.mkdirSync(soundsDir, { recursive: true });

generateWav(440, 0.3, path.join(soundsDir, "med_notification.wav"));
generateWav(880, 0.5, path.join(soundsDir, "med_alarm.wav"), true);
generateWav(330, 0.2, path.join(soundsDir, "med_reminder.wav"));
generateWav(660, 0.4, path.join(soundsDir, "med_urgent.wav"), true);

console.log("\nAll sounds generated!");
