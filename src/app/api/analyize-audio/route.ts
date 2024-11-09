import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { LangGraph } from 'langgraph'
import { Ollama } from 'ollama'

const prisma = new PrismaClient()
const ollama = new Ollama()
const langGraph = new LangGraph()

export async function POST(req: Request) {
  try {
    const { trackId } = await req.json()

    // Fetch the audio track
    const audioTrack = await prisma.audioTrack.findUnique({
      where: { id: trackId },
    })

    if (!audioTrack) {
      return NextResponse.json({ error: 'Audio track not found' }, { status: 404 })
    }

    // Fetch audio features using pgai vectorizer
    const audioFeaturesQuery = await prisma.$queryRaw`
      SELECT e.embedding
      FROM "Document" d
      JOIN ai.document_embeddings e ON d.id = e.id
      WHERE d.id = ${trackId}::uuid
    `

    const audioFeatures = audioFeaturesQuery[0]?.embedding || []

    // Use langgraph to create a processing pipeline for Ollama
    const analysisPipeline = langGraph
      .addNode('feature_analysis', (features) => {
        return ollama.generate({
          model: 'llama2',
          prompt: `Analyze the following audio features: ${JSON.stringify(features)}. Provide insights on genre, mood, tempo, key, and musical characteristics.`,
        })
      })

    const analysisResult = await analysisPipeline.execute(audioFeatures)

    // Store analysis results
    await prisma.audioAnalysis.upsert({
      where: { trackId },
      update: { analysis: analysisResult.feature_analysis },
      create: {
        trackId,
        analysis: analysisResult.feature_analysis,
      },
    })

    return NextResponse.json({ message: 'Audio analysis completed successfully', trackId, analysis: analysisResult.feature_analysis })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'An error occurred during audio analysis' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}