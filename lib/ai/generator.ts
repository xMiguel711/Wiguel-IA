// lib/ai/generator.ts
import { pipeline } from "@xenova/transformers";

let generator: any;

export async function generateResponse(
  message: string,
  modelId: string = "chat-model"
): Promise<string> {
  if (!generator) {
    // Inicializa tu modelo. Cambia "gpt2" por el que uses.
    generator = await pipeline("text-generation", "gpt2");
  }

  const output = await generator(message, { max_new_tokens: 150 });
  return output[0].generated_text;
}
