
-- Create the vectorizer for the Document model
SELECT ai.create_vectorizer(   
  'document'::regclass,
  destination => 'document_embeddings',
  embedding => ai.embedding_openai('text-embedding-3-small', 768),
  chunking => ai.chunking_recursive_character_text_splitter('content'),
  formatting => ai.formatting_python_template('$title: $chunk')
);

-- Create the vectorizer for the AudioTrack model
SELECT ai.create_vectorizer(   
  'audio_track'::regclass,
  destination => 'audio_track_embeddings',
  embedding => ai.embedding_openai('text-embedding-3-small', 768),
  chunking => ai.chunking_recursive_character_text_splitter('title'),
  formatting => ai.formatting_python_template('$title: $chunk')
);

-- Create the vectorizer for the AudioFeature model
SELECT ai.create_vectorizer(   
  'audio_feature'::regclass,
  destination => 'audio_feature_embeddings',
  embedding => ai.embedding_openai('text-embedding-3-small', 768),
 chunking => ai.chunking_recursive_character_text_splitter('trackId'),
  formatting => ai.formatting_python_template('$trackId: $chunk')
);

-- Create the vectorizer for the AudioAnalysis model
SELECT ai.create_vectorizer(   
  'audio_analysis'::regclass,
  destination => 'audio_analysis_embeddings',
  embedding => ai.embedding_openai('text-embedding-3-small', 768),
  chunking => ai.chunking_recursive_character_text_splitter('trackId'),
  formatting => ai.formatting_python_template('$trackId: $chunk')
);

-- Create functions to update embeddings

-- Document Embedding Function
CREATE OR REPLACE FUNCTION update_document_embedding()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM ai.vectorize_record('document', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- AudioTrack Embedding Function
CREATE OR REPLACE FUNCTION update_audio_track_embedding()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM ai.vectorize_record('audio_track', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- AudioFeature Embedding Function
CREATE OR REPLACE FUNCTION update_audio_feature_embedding()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM ai.vectorize_record('audio_feature', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a function to update AudioAnalysis embeddings
CREATE OR REPLACE FUNCTION update_audio_analysis_embedding()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM ai.vectorize_record('audio_analysis', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to invoke embedding functions

-- Trigger for Document
CREATE TRIGGER update_document_embedding_trigger
AFTER INSERT OR UPDATE ON "document"
FOR EACH ROW
EXECUTE FUNCTION update_document_embedding();

-- Trigger for AudioTrack
CREATE TRIGGER update_audio_track_embedding_trigger
AFTER INSERT OR UPDATE ON "audio_track"
FOR EACH ROW
EXECUTE FUNCTION update_audio_track_embedding();

-- Trigger for AudioFeature
CREATE TRIGGER update_audio_feature_embedding_trigger
AFTER INSERT OR UPDATE ON "audio_feature"
FOR EACH ROW
EXECUTE FUNCTION update_audio_feature_embedding();

-- Trigger for AudioAnalysis
CREATE TRIGGER update_audio_analysis_embedding_trigger
AFTER INSERT OR UPDATE ON "audio_analysis"
FOR EACH ROW
EXECUTE FUNCTION update_audio_analysis_embedding();

-- (Optional) Create indexes for efficient similarity search