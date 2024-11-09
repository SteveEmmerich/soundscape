CREATE EXTENSION IF NOT EXISTS ai CASCADE;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "analysis";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "audio";

-- CreateTable
CREATE TABLE "audio"."AudioTrack" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudioTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio"."AudioFeature" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "features" vector(1536) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudioFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis"."GenreAnalysis" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenreAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AudioFeature_trackId_key" ON "audio"."AudioFeature"("trackId");

-- AddForeignKey
ALTER TABLE "audio"."AudioFeature" ADD CONSTRAINT "AudioFeature_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "audio"."AudioTrack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
