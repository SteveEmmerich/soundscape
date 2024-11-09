import { NextResponse } from 'next/server';



export async function POST() {
  try {
    // Generate a simple sine wave
    const sampleRate = 44100;
    const duration = 5; // 5 seconds
    const frequency = 440; // A4 note

    const audioBuffer = new Float32Array(sampleRate * duration);
    for (let i = 0; i < audioBuffer.length; i++) {
      audioBuffer[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
    }

    // Convert to 16-bit PCM
    const pcmBuffer = Buffer.alloc(audioBuffer.length * 2);
    for (let i = 0; i < audioBuffer.length; i++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer[i]));
      pcmBuffer.writeInt16LE(Math.floor(sample * 32767), i * 2);
    }

    // Create WAV file
    const wavBuffer = Buffer.alloc(44 + pcmBuffer.length);

    // WAV Header
    // ChunkID "RIFF"
    wavBuffer.write('RIFF', 0);
    // ChunkSize
    wavBuffer.writeUInt32LE(36 + pcmBuffer.length, 4);
    // Format "WAVE"
    wavBuffer.write('WAVE', 8);
    // Subchunk1ID "fmt "
    wavBuffer.write('fmt ', 12);
    // Subchunk1Size
    wavBuffer.writeUInt32LE(16, 16);
    // AudioFormat
    wavBuffer.writeUInt16LE(1, 20);
    // NumChannels
    wavBuffer.writeUInt16LE(1, 22);
    // SampleRate
    wavBuffer.writeUInt32LE(sampleRate, 24);
    // ByteRate
    wavBuffer.writeUInt32LE(sampleRate * 2, 28);
    // BlockAlign
    wavBuffer.writeUInt16LE(2, 32);
    // BitsPerSample
    wavBuffer.writeUInt16LE(16, 34);
    // Subchunk2ID "data"
    wavBuffer.write('data', 36);
    // Subchunk2Size
    wavBuffer.writeUInt32LE(pcmBuffer.length, 40);
    // PCM Data
    pcmBuffer.copy(wavBuffer, 44);

    // Create a readable stream from the WAV buffer
    const readableStream = new ReadableStream({
      start(controller) {
        controller.enqueue(wavBuffer);
        controller.close();
      }
    });

    const res = new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'audio/wav',
      },
    });

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}