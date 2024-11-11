import { ChatOllama } from '@langchain/ollama';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const ollamaModel = process.env.OLLAMA_MODEL || 'llama2';

export async function analyzeMood(metadata: any): Promise<string[]> {
  const ollama = new ChatOllama({
    baseUrl: ollamaBaseUrl,
    model: ollamaModel
  });

  try {
    const response = await ollama.invoke([
      new SystemMessage("You are an expert in music mood analysis. Analyze the given audio metadata and suggest possible moods."),
      new HumanMessage(`Analyze this audio metadata and suggest possible moods: ${JSON.stringify(metadata)}`)
    ]);
    return response.content.split(", ").map(mood => mood.trim());
  } catch (error) {
    console.error("Error in MoodAnalysisTool:", error);
    return [];
  }
}