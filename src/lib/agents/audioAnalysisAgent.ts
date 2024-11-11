import { analyzeGenre } from '../tools/genreAnalysis';
import { analyzeMood } from '../tools/moodAnalysis';
import { analyzeTempo } from '../tools/tempoAnalysis';
import { analyzeKey } from '../tools/keyAnalysis';
import { analyzeTimeSignature } from '../tools/timeSignatureAnalysis';

interface AnalysisResult {
  genres: string[];
  moods: string[];
  tempo: number;
  key: string;
  timeSignature: string;
}

export async function performAudioAnalysis(metadata: any): Promise<AnalysisResult> {
  const genres = await analyzeGenre(metadata);
  const moods = await analyzeMood(metadata);
  const tempo = await analyzeTempo(metadata);
  const key = await analyzeKey(metadata);
  const timeSignature = await analyzeTimeSignature(metadata);

  return {
    genres,
    moods,
    tempo,
    key,
    timeSignature
  };
}