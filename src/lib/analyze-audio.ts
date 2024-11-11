import { AudioAnalysis } from '@prisma/client';
import * as mm from 'music-metadata';
import * as fs from 'fs/promises';
import path from 'path';
import { ChatOllama } from '@langchain/ollama';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StateGraph, END, START } from '@langchain/langgraph';

interface ExtendedAudioAnalysis extends AudioAnalysis {
  genreAnalysis?: { genres: string[] };
  moodAnalysis?: { moods: string[] };
  tempoAnalysis?: { tempo: number };
  keyAnalysis?: { key: string };
  timeSignatureAnalysis?: { timeSignature: string };
}

export async function analyzeAudio(filename: string): Promise<Partial<ExtendedAudioAnalysis>> {
  try {
    const audioFile = await fetchAudioFileByFilename(filename);
    const metadata = await mm.parseBuffer(audioFile);

    const analysisResult = await runAnalysisGraph(metadata);

    return {
      genreAnalysis: { genres: analysisResult.genres },
      moodAnalysis: { moods: analysisResult.moods },
      tempoAnalysis: { tempo: analysisResult.tempo },
      keyAnalysis: { key: analysisResult.key },
      timeSignatureAnalysis: { timeSignature: analysisResult.timeSignature }
    };
  } catch (error) {
    console.error('Error analyzing audio:', error);
    throw new Error('Failed to analyze audio');
  }
}

async function fetchAudioFileByFilename(filename: string): Promise<Buffer> {
  const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error);
    throw new Error('Audio file not found');
  }
}

async function runAnalysisGraph(metadata: mm.IAudioMetadata) {
  const ollama = new ChatOllama({
    baseUrl: "http://localhost:11434",
    model: "llama2"
  });

  const graph = new StateGraph({
    channels: {
      genre: "genre",
      mood: "mood",
      tempo: "tempo",
      key: "key",
      time_signature: "time_signature"
    }
  });

  const genreNode = graph.addNode("genre", async () => {
    try {
      const response = await ollama.invoke([
        new SystemMessage("You are an expert music genre classifier. Analyze the given audio metadata and suggest possible genres."),
        new HumanMessage(`Analyze this audio metadata and suggest possible genres: ${JSON.stringify(metadata)}`)
      ]);
      return { genres: response.content.split(", ").map(genre => genre.trim()) };
    } catch (error) {
      console.error("Error in genreNode:", error);
      return { genres: [] };
    }
  });

  const moodNode = graph.addNode("mood", async () => {
    try {
      const response = await ollama.invoke([
        new SystemMessage("You are an expert in music mood analysis. Analyze the given audio metadata and suggest possible moods."),
        new HumanMessage(`Analyze this audio metadata and suggest possible moods: ${JSON.stringify(metadata)}`)
      ]);
      return { moods: response.content.split(", ").map(mood => mood.trim()) };
    } catch (error) {
      console.error("Error in moodNode:", error);
      return { moods: [] };
    }
  });

  const tempoNode = graph.addNode("tempo", async () => {
    try {
      const response = await ollama.invoke([
        new SystemMessage("You are an expert in music tempo analysis. Analyze the given audio metadata and suggest the tempo in BPM."),
        new HumanMessage(`Analyze this audio metadata and suggest the tempo in BPM: ${JSON.stringify(metadata)}`)
      ]);
      const tempo = parseInt(response.content);
      return { tempo: isNaN(tempo) ? 0 : tempo };
    } catch (error) {
      console.error("Error in tempoNode:", error);
      return { tempo: 0 };
    }
  });

  const keyNode = graph.addNode("key", async () => {
    try {
      const response = await ollama.invoke([
        new SystemMessage("You are an expert in music key analysis. Analyze the given audio metadata and suggest the musical key."),
        new HumanMessage(`Analyze this audio metadata and suggest the musical key: ${JSON.stringify(metadata)}`)
      ]);
      return { key: response.content.trim() };
    } catch (error) {
      console.error("Error in keyNode:", error);
      return { key: "" };
    }
  });

  const timeSignatureNode = graph.addNode("time_signature", async () => {
    try {
      const response = await ollama.invoke([
        new SystemMessage("You are an expert in music time signature analysis. Analyze the given audio metadata and suggest the time signature."),
        new HumanMessage(`Analyze this audio metadata and suggest the time signature: ${JSON.stringify(metadata)}`)
      ]);
      return { timeSignature: response.content.trim() };
    } catch (error) {
      console.error("Error in timeSignatureNode:", error);
      return { timeSignature: "" };
    }
  });

  // Define the flow of the graph
  graph.addEdge(START, genreNode);
  graph.addEdge(genreNode, moodNode);
  graph.addEdge(moodNode, tempoNode);
  graph.addEdge(tempoNode, keyNode);
  graph.addEdge(keyNode, timeSignatureNode);
  graph.addEdge(timeSignatureNode, END);

  // Execute the graph
  const result = await graph.compile();

  return {
    genres: result.genre.genres,
    moods: result.mood.moods,
    tempo: result.tempo.tempo,
    key: result.key.key,
    timeSignature: result.timeSignature.timeSignature
  };
}