import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { analyzeAudio } from '@/lib/analyze-audio';

export async function POST(req: NextRequest) {
  try {
    const { trackId, filename } = await req.json();

    if (!trackId || !filename) {
      return NextResponse.json({ error: 'Track ID is required' }, { status: 400 });
    }

    // Perform audio analysis (this is a placeholder function)
    const analysisResult = await analyzeAudio(filename);

    // Create or update the AudioAnalysis record
    const audioAnalysis = await prisma.audioAnalysis.upsert({
      where: { trackId },
      update: {
        genreAnalysis: {
          upsert: {
            create: { genres: analysisResult.genres },
            update: { genres: analysisResult.genres },
          },
        },
        moodAnalysis: {
          upsert: {
            create: { moods: analysisResult.moods },
            update: { moods: analysisResult.moods },
          },
        },
        tempoAnalysis: {
          upsert: {
            create: { tempo: analysisResult.tempo },
            update: { tempo: analysisResult.tempo },
          },
        },
        keyAnalysis: {
          upsert: {
            create: { key: analysisResult.key },
            update: { key: analysisResult.key },
          },
        },
        timeSignatureAnalysis: {
          upsert: {
            create: { timeSignature: analysisResult.timeSignature },
            update: { timeSignature: analysisResult.timeSignature },
          },
        },
      },
      create: {
        trackId,
        genreAnalysis: { create: { genres: analysisResult.genres } },
        moodAnalysis: { create: { moods: analysisResult.moods } },
        tempoAnalysis: { create: { tempo: analysisResult.tempo } },
        keyAnalysis: { create: { key: analysisResult.key } },
        timeSignatureAnalysis: { create: { timeSignature: analysisResult.timeSignature } },
      },
    });

    return NextResponse.json(audioAnalysis);
  } catch (error) {
    console.error('Error analyzing audio:', error);
    return NextResponse.json({ error: 'Failed to analyze audio' }, { status: 500 });
  }
}