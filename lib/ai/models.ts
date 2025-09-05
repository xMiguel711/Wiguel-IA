import { pipeline } from "@xenova/transformers";

// Modelos disponibles
export const DEFAULT_CHAT_MODEL: string = "chat-model";

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: "chat-model",
    name: "Grok Vision",
    description: "Advanced multimodal model with vision and text capabilities",
  },
  {
    id: "chat-model-reasoning",
    name: "Grok Reasoning",
    description: "Uses advanced chain-of-thought reasoning for complex problems",
  },
];

// === Lógica de IA ===
let generator: any;

async function initGenerator(modelId: string = DEFAULT_CHAT_MODEL) {
  if (!generator) {
    // Por ahora usamos GPT-2 como ejemplo, luego puedes reemplazarlo por otro modelo
    generator = await pipeline("text-generation", "gpt2");
  }
}

export async function generateResponse(message: string, modelId?: string): Promise<string> {
  await initGenerator(modelId);
  const output = await generator(message, { max_new_tokens: 100 });
  return output[0].generated_text;
}
