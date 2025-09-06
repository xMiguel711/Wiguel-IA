import type { ChatMessage } from '@/lib/types';

// Este stub evita errores de compilación
export function getStreamContext() {
  return {
    // Contexto de streaming simulado
    streamId: 'stub-stream',
    messages: [] as ChatMessage[],
    addMessage: (msg: ChatMessage) => {
      // Aquí podrías agregar lógica real
      console.log('Mensaje agregado al stream (stub):', msg);
    },
  };
}

// Opcional: si quieres exponer un endpoint GET para pruebas
export async function GET(request: Request) {
  return new Response(JSON.stringify({ status: 'ok', context: getStreamContext() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Opcional: si quieres exponer un endpoint POST para pruebas
export async function POST(request: Request) {
  const body = await request.json();
  const stream = getStreamContext();
  stream.addMessage(body.message as ChatMessage);
  return new Response(JSON.stringify({ status: 'ok', streamId: stream.streamId }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
