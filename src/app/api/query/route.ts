import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Ollama } from '@ollama/ollama';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    // Initialize Ollama
    const ollama = new Ollama();

    // Create the vectorizer using ai.create_vectorizer
    await prisma.$executeRawUnsafe(`
      SELECT ai.create_vectorizer(   
        'Document'::regclass,
        destination => 'document_embeddings',
        embedding => ai.embedding_openai('text-embedding-3-small', 768),
        chunking => ai.chunking_recursive_character_text_splitter('content'),
        formatting => ai.formatting_python_template('$title: $chunk')
      );
    `);

    // Vectorize the query
    const vectorizedQueryResult: any = await prisma.$queryRawUnsafe(`
      SELECT ai.vectorize($1) AS vectorized_query;
    `, query);

    const vectorizedQuery = vectorizedQueryResult[0].vectorized_query;

    // Perform similarity search in the vector database
    const similarDocs: any = await prisma.$queryRawUnsafe(`
      SELECT content, 1 - (embedding <=> $1::vector) AS similarity
      FROM document_embeddings
      ORDER BY similarity DESC
      LIMIT 5;
    `, vectorizedQuery);

    // Prepare context from similar documents
    const context = similarDocs.map((doc: any) => doc.content).join('\n');

    // Generate response using Ollama
    const response = await ollama.generate({
      model: 'llama2',
      prompt: `Context: ${context}\n\nQuestion: ${query}\n\nAnswer:`,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}