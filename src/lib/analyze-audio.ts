import { AudioAnalysis } from '@prisma/client';
import * as mm from 'music-metadata';
import * as fs from 'fs/promises';
import path from 'path';
import { performAudioAnalysis } from '@/lib/agents/audioAnalysisAgent';

interface ExtendedAudioAnalysis extends AudioAnalysis {
  genreAnalysis?: { genres: string[] };
  moodAnalysis?: { moods: string[] };
  tempoAnalysis?: { tempo: number };
  keyAnalysis?: { key: string };
  timeSignatureAnalysis?: { timeSignature: string };
}

export async function analyzeAudio(filename: string): Promise<Partial<ExtendedAudioAnalysis>> {
  try {
    const audioFile = await fetchAudioFileByFilename(filename);
    const metadata = await mm.parseBuffer(audioFile);

    const analysisResult = await performAudioAnalysis(metadata);

    return {
      genreAnalysis: { genres: analysisResult.genres },
      moodAnalysis: { moods: analysisResult.moods },
      tempoAnalysis: { tempo: analysisResult.tempo },
      keyAnalysis: { key: analysisResult.key },
      timeSignatureAnalysis: { timeSignature: analysisResult.timeSignature }
    };
  } catch (error) {
    console.error('Error analyzing audio:', error);
    throw new Error('Failed to analyze audio');
  }
}

async function fetchAudioFileByFilename(filename: string): Promise<Buffer> {
  const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error);
    throw new Error('Audio file not found');
  }
}