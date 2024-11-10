-- Ensure the necessary extensions are installed
CREATE EXTENSION IF NOT EXISTS vectorscale CASCADE;
CREATE EXTENSION IF NOT EXISTS ai CASCADE;

-- Create the Document table
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- Create the DocumentEmbeddings table
CREATE TABLE "DocumentEmbeddings" (
    "id" SERIAL NOT NULL,
    "document_id" INTEGER NOT NULL,
    "chunk" TEXT NOT NULL,
    "embedding" vector(768) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "DocumentEmbeddings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "DocumentEmbeddings_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document" ("id") ON DELETE CASCADE
);


-- Create the vectorizer for the Document model
SELECT ai.create_vectorizer(   
  'Document'::regclass,
  destination => 'document_embeddings',
  embedding => ai.embedding_ollama('text-embedding-3-small', 768),
  chunking => ai.chunking_recursive_character_text_splitter('content'),
  formatting => ai.formatting_python_template('$title: $chunk')
);

-- Create the vectorizer for the AudioTrack model
SELECT ai.create_vectorizer(   
  'AudioTrack'::regclass,
  destination => 'audio_track_embeddings',
  embedding => ai.embedding_ollama('text-embedding-3-small', 768),
  chunking => ai.chunking_recursive_character_text_splitter('title'),
  formatting => ai.formatting_python_template('$title: $chunk')
);

-- Create the vectorizer for the AudioFeature model
SELECT ai.create_vectorizer(   
  'AudioFeature'::regclass,
  destination => 'audio_feature_embeddings',
  embedding => ai.embedding_ollama('text-embedding-3-small', 768),
  chunking => ai.chunking_recursive_character_text_splitter('features'),
  formatting => ai.formatting_python_template('$trackId: $chunk')
);

-- Create the vectorizer for the AudioAnalysis model
SELECT ai.create_vectorizer(   
  'AudioAnalysis'::regclass,
  destination => 'audio_analysis_embeddings',
  embedding => ai.embedding_ollama('text-embedding-3-small', 768),
  chunking => ai.chunking_recursive_character_text_splitter('trackId'),
  formatting => ai.formatting_python_template('$trackId: $chunk')
);

-- Create functions to update embeddings

-- Document Embedding Function
CREATE OR REPLACE FUNCTION update_document_embedding()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM ai.vectorize_record('Document', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- AudioTrack Embedding Function
CREATE OR REPLACE FUNCTION update_audio_track_embedding()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM ai.vectorize_record('AudioTrack', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- AudioFeature Embedding Function
CREATE OR REPLACE FUNCTION update_audio_feature_embedding()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM ai.vectorize_record('AudioFeature', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a function to update AudioAnalysis embeddings
CREATE OR REPLACE FUNCTION update_audio_analysis_embedding()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM ai.vectorize_record('AudioAnalysis', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to invoke embedding functions

-- Trigger for Document
CREATE TRIGGER update_document_embedding_trigger
AFTER INSERT OR UPDATE ON "Document"
FOR EACH ROW
EXECUTE FUNCTION update_document_embedding();

-- Trigger for AudioTrack
CREATE TRIGGER update_audio_track_embedding_trigger
AFTER INSERT OR UPDATE ON "AudioTrack"
FOR EACH ROW
EXECUTE FUNCTION update_audio_track_embedding();

-- Trigger for AudioFeature
CREATE TRIGGER update_audio_feature_embedding_trigger
AFTER INSERT OR UPDATE ON "AudioFeature"
FOR EACH ROW
EXECUTE FUNCTION update_audio_feature_embedding();

-- Trigger for AudioAnalysis
CREATE TRIGGER update_audio_analysis_embedding_trigger
AFTER INSERT OR UPDATE ON "AudioAnalysis"
FOR EACH ROW
EXECUTE FUNCTION update_audio_analysis_embedding();

-- (Optional) Create indexes for efficient similarity searches

-- Index for Document embeddings
CREATE INDEX IF NOT EXISTS idx_document_embeddings_embedding
ON "DocumentEmbeddings"
USING ivfflat (embedding vector_l2_ops)
WITH (lists = 100);

-- Index for AudioTrack embeddings
CREATE INDEX IF NOT EXISTS idx_audio_track_embeddings_embedding
ON "audio_track_embeddings"
USING ivfflat (embedding vector_l2_ops)
WITH (lists = 100);

-- Index for AudioFeature embeddings
CREATE INDEX IF NOT EXISTS idx_audio_feature_embeddings_embedding
ON "audio_feature_embeddings"
USING ivfflat (embedding vector_l2_ops)
WITH (lists = 100);

-- Create index for AudioAnalysis embeddings
CREATE INDEX IF NOT EXISTS idx_audio_analysis_embeddings_embedding
ON "audio_analysis_embeddings"
USING ivfflat (embedding vector_l2_ops)
WITH (lists = 100);
