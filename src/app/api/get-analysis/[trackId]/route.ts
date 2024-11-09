import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { trackId: string } }
) {
  try {
    const trackId = params.trackId

    const analysis = await prisma.audioAnalysis.findUnique({
      where: { trackId },
    })

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    // Parse the analysis JSON and extract relevant information
    const parsedAnalysis = JSON.parse(analysis.analysis)

    return NextResponse.json({
      genre: parsedAnalysis.genre || 'Unknown',
      mood: parsedAnalysis.mood || 'Unknown',
      tempo: parsedAnalysis.tempo || 0,
      key: parsedAnalysis.key || 'Unknown',
      timeSignature: parsedAnalysis.timeSignature || 4,
      energy: parsedAnalysis.energy || 0,
      danceability: parsedAnalysis.danceability || 0,
      valence: parsedAnalysis.valence || 0,
      acousticness: parsedAnalysis.acousticness || 0,
      instrumentalness: parsedAnalysis.instrumentalness || 0,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'An error occurred while fetching analysis' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}