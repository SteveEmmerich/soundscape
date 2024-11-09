import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)
const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { trackIds } = await req.json()

    // Fetch audio tracks
    const tracks = await prisma.audioTrack.findMany({
      where: {
        id: {
          in: trackIds,
        },
      },
    })

    if (tracks.length < 2) {
      return NextResponse.json({ error: 'At least two tracks are required for a mashup' }, { status: 400 })
    }

    // Create a temporary directory for processing
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir)
    }

    // Download audio files to temp directory
    for (const track of tracks) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploads/${track.filename}`)
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const filePath = path.join(tempDir, track.filename)
      await fs.promises.writeFile(filePath, buffer)
    }

    // Generate mashup using FFmpeg
    const inputFiles = tracks.map(track => path.join(tempDir, track.filename)).join(' ')
    const outputFile = path.join(tempDir, 'mashup.mp3')
    const ffmpegCommand = `ffmpeg -i "concat:${inputFiles}" -acodec libmp3lame -b:a 128k ${outputFile}`
    
    await execPromise(ffmpegCommand)

    // Read the generated mashup file
    const mashupBuffer = await fs.promises.readFile(outputFile)

    // Create a new AudioTrack entry for the mashup
    const mashupTrack = await prisma.audioTrack.create({
      data: {
        filename: 'ai_generated_mashup.mp3',
        duration: 0, // We'll need to update this with the actual duration
        title: 'AI Generated Mashup',
        artist: 'Widdle AI',
      },
    })

    // Save the mashup file
    const mashupPath = path.join(process.cwd(), 'public', 'uploads', mashupTrack.filename)
    await fs.promises.writeFile(mashupPath, mashupBuffer)

    // Clean up temp files
    for (const track of tracks) {
      await fs.promises.unlink(path.join(tempDir, track.filename))
    }
    await fs.promises.unlink(outputFile)

    return NextResponse.json({
      message: 'Mashup audio file generated successfully',
      trackId: mashupTrack.id,
      filename: mashupTrack.filename,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'An error occurred while generating the mashup audio file' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}