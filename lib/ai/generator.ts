// lib/ai/generator.ts
import { HfInference } from "@huggingface/inference";

const hf = new HfInference("<TU_TOKEN_HUGGINGFACE>");

export async function generateResponse(
  message: string
): Promise<string> {
  const prompt = `
Eres Wiguel-AI, un asistente amable y claro que siempre responde en español.
Tienes conocimientos de Fórmula 1, coches, aerolíneas y moda.
Cuando no sabes algo, respondes de manera natural y divertida.
Siempre das respuestas completas y fáciles de entender.
Usuario: ${message}
Wiguel-AI:
`;

  const response = await hf.textGeneration({
    model: "EleutherAI/gpt-neo-1.3B",
    inputs: prompt,
    parameters: {
      max_new_tokens: 150,
      temperature: 0.7,
    },
  });

  return response.generated_text;
}
