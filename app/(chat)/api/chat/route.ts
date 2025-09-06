import type { ChatMessage } from '@/lib/types';

// Contexto de streaming interno (no exportado)
function createStreamContext() {
  return {
    streamId: 'stub-stream',
    messages: [] as ChatMessage[],
    addMessage: (msg: ChatMessage) => {
      console.log('Mensaje agregado al stream (stub):', msg);
    },
  };
}

const streamContext = createStreamContext();

// Endpoint GET para pruebas
export async function GET(request: Request) {
  return new Response(
    JSON.stringify({ status: 'ok', context: { streamId: streamContext.streamId } }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// Endpoint POST para enviar mensajes
export async function POST(request: Request) {
  const body = await request.json();
  if (!body.message) {
    return new Response(
      JSON.stringify({ status: 'error', message: 'Falta campo message' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const msg: ChatMessage = body.message;
  streamContext.addMessage(msg);

  return new Response(
    JSON.stringify({ status: 'ok', streamId: streamContext.streamId }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
