import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
 try {
    const query = await req.json();
    const { trackId } = query

    if (!trackId || typeof trackId !== 'string') {
      return NextResponse.json({ error: 'Invalid trackId' }, { status: 400 })
    }

    try {
      const track = await prisma.audioTrack.findUnique({
        where: { id: trackId },
        include: { features: true },
      })

      if (!track) {
        return NextResponse.json({ error: 'Track not found' }, { status: 404 })
      }

      // Here we would use the Ollama model to predict the genre
      // For now, we'll just return a placeholder prediction
      const genrePrediction = {
        genre: 'Pop',
        confidence: 0.8,
      }

      await prisma.genreAnalysis.create({
        data: {
          trackId: track.id,
          genre: genrePrediction.genre,
          confidence: genrePrediction.confidence,
        },
      })

      return NextResponse.json({ track, genrePrediction }, { status: 200 })
    } catch (error) {
      console.error(error)
      return NextResponse.json({ error: 'Error analyzing track' }, { status: 500 })
    }
  }
  catch {
    return NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 })
  }
}