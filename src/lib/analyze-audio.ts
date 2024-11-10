import { AudioAnalysis } from '@prisma/client'
import * as mm from 'music-metadata'
import * as fs from 'fs/promises'
import path from 'path'
import { ChatOllama } from '@langchain/ollama'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { StateGraph, END } from '@langchain/langgraph'

export async function analyzeAudio(filename: string): Promise<Partial<AudioAnalysis>> {
  try {
    const audioFile = await fetchAudioFileByFilename(filename)
    const metadata = await mm.parseBuffer(audioFile)

    const analysisResult = await runAnalysisGraph(metadata)

    return {
      genreAnalysis: { genres: analysisResult.genres },
      moodAnalysis: { moods: analysisResult.moods },
      tempoAnalysis: { tempo: analysisResult.tempo },
      keyAnalysis: { key: analysisResult.key },
      timeSignatureAnalysis: { timeSignature: analysisResult.timeSignature }
    }
  } catch (error) {
    console.error('Error analyzing audio:', error)
    throw new Error('Failed to analyze audio')
  }
}

async function fetchAudioFileByFilename(filename: string): Promise<Buffer> {
  const filePath = path.join(process.cwd(), 'public', 'uploads', filename)
  try {
    return await fs.readFile(filePath)
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error)
    throw new Error('Audio file not found')
  }
}

async function runAnalysisGraph(metadata: mm.IAudioMetadata) {
  const ollama = new ChatOllama({
    baseUrl: "http://localhost:11434",
    model: "llama2"
  })

  const graph = new StateGraph({
    channels: ["genre", "mood", "tempo", "key", "time_signature"]
  })

  const genreNode = graph.addNode("genre", async () => {
    const response = await ollama.invoke([
      new SystemMessage("You are an expert music genre classifier. Analyze the given audio metadata and suggest possible genres."),
      new HumanMessage(`Analyze this audio metadata and suggest possible genres: ${JSON.stringify(metadata)}`)
    ])
    return { genres: response.content.split(", ").map(genre => genre.trim()) }
  })

  const moodNode = graph.addNode("mood", async () => {
    const response = await ollama.invoke([
      new SystemMessage("You are an expert in music mood analysis. Analyze the given audio metadata and suggest possible moods."),
      new HumanMessage(`Analyze this audio metadata and suggest possible moods: ${JSON.stringify(metadata)}`)
    ])
    return { moods: response.content.split(", ").map(mood => mood.trim()) }
  })

  const tempoNode = graph.addNode("tempo", async () => {
    const response = await ollama.invoke([
      new SystemMessage("You are an expert in music tempo analysis. Analyze the given audio metadata and suggest the tempo in BPM."),
      new HumanMessage(`Analyze this audio metadata and suggest the tempo in BPM: ${JSON.stringify(metadata)}`)
    ])
    return { tempo: parseInt(response.content) || 0 }
  })

  const keyNode = graph.addNode("key", async () => {
    const response = await ollama.invoke([
      new SystemMessage("You are an expert in music key analysis. Analyze the given audio metadata and suggest the musical key."),
      new HumanMessage(`Analyze this audio metadata and suggest the musical key: ${JSON.stringify(metadata)}`)
    ])
    return { key: response.content.trim() }
  })

  const timeSignatureNode = graph.addNode("time_signature", async () => {
    const response = await ollama.invoke([
      new SystemMessage("You are an expert in music time signature analysis. Analyze the given audio metadata and suggest the time signature."),
      new HumanMessage(`Analyze this audio metadata and suggest the time signature: ${JSON.stringify(metadata)}`)
    ])
    return { timeSignature: response.content.trim() }
  })

  graph.addEdge(genreNode, moodNode)
  graph.addEdge(moodNode, tempoNode)
  graph.addEdge(tempoNode, keyNode)
  graph.addEdge(keyNode, timeSignatureNode)
  graph.addEdge(timeSignatureNode, END)

  graph.setEntryPoint(genreNode)

  const result = await graph.run()

  return {
    genres: result.genre.genres,
    moods: result.mood.moods,
    tempo: result.tempo.tempo,
    key: result.key.key,
    timeSignature: result.timeSignature.timeSignature
  }
}