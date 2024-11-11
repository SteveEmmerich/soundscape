import { ChatOllama } from '@langchain/ollama';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const ollamaModel = process.env.OLLAMA_MODEL || 'llama2';

export async function analyzeTimeSignature(metadata: any): Promise<string> {
  const ollama = new ChatOllama({
    baseUrl: ollamaBaseUrl,
    model: ollamaModel
  });

  try {
    const response = await ollama.invoke([
      new SystemMessage("You are an expert in music time signature analysis. Analyze the given audio metadata and suggest the time signature."),
      new HumanMessage(`Analyze this audio metadata and suggest the time signature: ${JSON.stringify(metadata)}`)
    ]);
    return response.content.trim();
  } catch (error) {
    console.error("Error in TimeSignatureAnalysisTool:", error);
    return "";
  }
}