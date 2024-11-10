import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const tracks = await prisma.audioTrack.findMany({
      select: {
        id: true,
        title: true,
        filename: true,
      },
    });

    if (tracks.length === 0) {
      return NextResponse.json({ message: 'No tracks found' }, { status: 404 });
    }

    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}