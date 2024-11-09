import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { parseBuffer } from 'music-metadata';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { promisify } from 'util';

const prisma = new PrismaClient();
const readFile = promisify(fs.readFile);

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const form = new IncomingForm();
  const body = await req.json();
  return new Promise((resolve, reject) => {
    form.parse(body, async (err, fields, files) => {
      if (err) {
        resolve(NextResponse.json({ error: 'Error parsing form data' }, { status: 500 }));
        return;
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) {
        resolve(NextResponse.json({ error: 'No file uploaded' }, { status: 400 }));
        return;
      }

      try {
        const buffer = await readFile(file.filepath);
        const metadata = await parseBuffer(buffer);

        const audioTrack = await prisma.audioTrack.create({
          data: {
            title: metadata.common.title || 'Unknown Title',
            artist: metadata.common.artist || 'Unknown Artist',
            album: metadata.common.album || 'Unknown Album',
            duration: metadata.format.duration || 0,
          },
        });

        resolve(NextResponse.json(audioTrack));
      } catch (error) {
        console.error(error);
        resolve(NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }));
      }
    });
  });
}