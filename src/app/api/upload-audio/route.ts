import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save the file
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filename = `${Date.now()}-${file.name}`
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Save file info to database
    const track = await prisma.audioTrack.create({
      data: {
        title: file.name,
        filename: filename,
        duration: 0,
        artist: 'Unknown',
        
        //filepath: filepath,
      },
    })

    console.log('File uploaded successfully:', filename)

    return NextResponse.json({ message: 'File uploaded successfully', track })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}