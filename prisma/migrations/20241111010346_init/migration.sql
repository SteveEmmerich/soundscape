CREATE EXTENSION IF NOT EXISTS vectorscale CASCADE;
CREATE EXTENSION IF NOT EXISTS ai CASCADE;

-- CreateTable
CREATE TABLE "audio_analysis" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audio_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio_feature" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "features" vector(1536) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audio_feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio_track" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "artist" TEXT,
    "album" TEXT,
    "year" INTEGER,

    CONSTRAINT "audio_track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);



-- CreateTable
CREATE TABLE "genre_analysis" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "genre_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "key_analysis" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "key_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_analysis" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mood_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tempo_analysis" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "tempo" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tempo_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_signature_analysis" (
    "id" TEXT NOT NULL,
    "timeSignature" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_signature_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "audio_analysis_trackId_key" ON "audio_analysis"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "audio_feature_trackId_key" ON "audio_feature"("trackId");

-- AddForeignKey
ALTER TABLE "audio_analysis" ADD CONSTRAINT "audio_analysis_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "audio_track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audio_feature" ADD CONSTRAINT "audio_feature_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "audio_track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "genre_analysis" ADD CONSTRAINT "genre_analysis_id_fkey" FOREIGN KEY ("id") REFERENCES "audio_analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "key_analysis" ADD CONSTRAINT "key_analysis_id_fkey" FOREIGN KEY ("id") REFERENCES "audio_analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_analysis" ADD CONSTRAINT "mood_analysis_id_fkey" FOREIGN KEY ("id") REFERENCES "audio_analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tempo_analysis" ADD CONSTRAINT "tempo_analysis_id_fkey" FOREIGN KEY ("id") REFERENCES "audio_analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_signature_analysis" ADD CONSTRAINT "time_signature_analysis_id_fkey" FOREIGN KEY ("id") REFERENCES "audio_analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
