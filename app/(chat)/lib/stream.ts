import type { ChatMessage } from '@/lib/types';

export function getStreamContext() {
  return {
    streamId: 'stub-stream',
    messages: [] as ChatMessage[],
    resumableStream: async (id: string, fallback: () => any) => {
      // Devuelve un stream vacío para pruebas
      return fallback();
    },
    addMessage: (msg: ChatMessage) => {
      console.log('Mensaje agregado al stream (stub):', msg);
    },
  };
}
