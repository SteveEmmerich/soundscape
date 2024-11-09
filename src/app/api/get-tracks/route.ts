import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const tracks = await prisma.audioTrack.findMany({
      select: {
        id: true,
        title: true,
        filename: true,
      },
    })

    return NextResponse.json(tracks)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'An error occurred while fetching tracks' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}