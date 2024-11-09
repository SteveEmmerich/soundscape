import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { LangGraph } from 'langgraph'
import { Ollama } from 'ollama'

const prisma = new PrismaClient()
const ollama = new Ollama()
const langGraph = new LangGraph()

export async function POST(req: Request) {
  try {
    const { trackIds, processedAudioData } = await req.json()

    // Generate the audio file
    const audioGenerationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate-audio-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackIds }),
    })

    if (!audioGenerationResponse.ok) {
      throw new Error('Failed to generate audio file')
    }

    const { trackId: mashupTrackId, filename: mashupFilename } = await audioGenerationResponse.json()

    // Fetch audio features for selected tracks using pgai vectorizer
    const audioFeaturesQuery = await prisma.$queryRaw`
      SELECT d.id, d.title, e.embedding
      FROM "Document" d
      JOIN ai.document_embeddings e ON d.id = e.id
      WHERE d.id = ANY(${trackIds}::uuid[])
    `

    // Combine audio features (using the processed audio data from the client)
    const combinedFeatures = processedAudioData.combinedFeatures

    // Use langgraph to create a processing pipeline for Ollama
    const mashupPipeline = langGraph
      .addNode('feature_analysis', (features) => {
        return ollama.generate({
          model: 'llama2',
          prompt: `Analyze the following audio features: ${JSON.stringify(features)}. Provide insights on genre, mood, and musical characteristics.`,
        })
      })
      .addNode('description_generation', (analysis) => {
        return ollama.generate({
          model: 'llama2',
          prompt: `Based on the analysis: ${analysis}, create a description for an AI-generated audio mashup. Include details about the potential genre, mood, tempo, and overall feel of the mashup.`,
        })
      })

    const mashupAnalysis = await mashupPipeline.execute(combinedFeatures)
    const mashupDescription = mashupAnalysis.description_generation

    // Update the AudioTrack entry for the mashup
    await prisma.audioTrack.update({
      where: { id: mashupTrackId },
      data: {
        duration: processedAudioData.duration,
      },
    })

    // Store the combined audio features using pgai vectorizer
    await prisma.$executeRaw`
      INSERT INTO "Document" (id, title, content)
      VALUES (${mashupTrackId}, 'AI Generated Mashup', ${JSON.stringify(combinedFeatures)})
    `

    // Store detailed analysis results
    await prisma.audioAnalysis.create({
      data: {
        trackId: mashupTrackId,
        analysis: mashupAnalysis.feature_analysis,
      },
    })

    return NextResponse.json({
      message: 'Mashup created successfully',
      trackId: mashupTrackId,
      filename: mashupFilename,
      description: mashupDescription,
      analysis: mashupAnalysis.feature_analysis,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'An error occurred while creating the mashup' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}