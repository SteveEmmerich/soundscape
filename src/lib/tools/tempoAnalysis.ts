import { ChatOllama } from '@langchain/ollama';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const ollamaModel = process.env.OLLAMA_MODEL || 'llama2';


export async function analyzeTempo(metadata: any): Promise<number> {
  const ollama = new ChatOllama({
    baseUrl: ollamaBaseUrl,
    model: ollamaModel
  });

  try {
    const response = await ollama.invoke([
      new SystemMessage("You are an expert in music tempo analysis. Analyze the given audio metadata and suggest the tempo in BPM."),
      new HumanMessage(`Analyze this audio metadata and suggest the tempo in BPM: ${JSON.stringify(metadata)}`)
    ]);
    const tempo = parseInt(response.content);
    return isNaN(tempo) ? 0 : tempo;
  } catch (error) {
    console.error("Error in TempoAnalysisTool:", error);
    return 0;
  }
}