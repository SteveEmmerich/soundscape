-- DropForeignKey
ALTER TABLE "DocumentEmbeddings" DROP CONSTRAINT "DocumentEmbeddings_document_id_fkey";

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "DocumentEmbeddings" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AudioAnalysis" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudioAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioFeature" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "features" vector(1536) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudioFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioTrack" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "artist" TEXT,
    "album" TEXT,
    "year" INTEGER,

    CONSTRAINT "AudioTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenreAnalysis" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenreAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyAnalysis" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeyAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodAnalysis" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoodAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TempoAnalysis" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "tempo" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TempoAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSignatureAnalysis" (
    "id" TEXT NOT NULL,
    "timeSignature" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeSignatureAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AudioAnalysis_trackId_key" ON "AudioAnalysis"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "AudioFeature_trackId_key" ON "AudioFeature"("trackId");

-- AddForeignKey
ALTER TABLE "AudioAnalysis" ADD CONSTRAINT "AudioAnalysis_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "AudioTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioFeature" ADD CONSTRAINT "AudioFeature_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "AudioTrack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentEmbeddings" ADD CONSTRAINT "DocumentEmbeddings_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenreAnalysis" ADD CONSTRAINT "GenreAnalysis_id_fkey" FOREIGN KEY ("id") REFERENCES "AudioAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyAnalysis" ADD CONSTRAINT "KeyAnalysis_id_fkey" FOREIGN KEY ("id") REFERENCES "AudioAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodAnalysis" ADD CONSTRAINT "MoodAnalysis_id_fkey" FOREIGN KEY ("id") REFERENCES "AudioAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TempoAnalysis" ADD CONSTRAINT "TempoAnalysis_id_fkey" FOREIGN KEY ("id") REFERENCES "AudioAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSignatureAnalysis" ADD CONSTRAINT "TimeSignatureAnalysis_id_fkey" FOREIGN KEY ("id") REFERENCES "AudioAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

