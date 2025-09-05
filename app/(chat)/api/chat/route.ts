import { auth, type UserType } from '@/app/(auth)/auth';
import { getChatById, saveChat, saveMessages, getMessageCountByUserId } from '@/lib/db/queries';
import { generateUUID } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { ChatSDKError } from '@/lib/errors';
import type { ChatMessage } from '@/lib/types';
import type { ChatModel } from '@/lib/ai/models';
import type { VisibilityType } from '@/components/visibility-selector';
import { generateResponse } from '@/lib/ai/generator';

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  try {
    const { id, message, selectedChatModel, selectedVisibilityType }: {
      id: string;
      message: ChatMessage;
      selectedChatModel: ChatModel['id'];
      selectedVisibilityType: VisibilityType;
    } = requestBody;

    const session = await auth();
    if (!session?.user) return new ChatSDKError('unauthorized:chat').toResponse();

    const userType: UserType = session.user.type;
    const messageCount = await getMessageCountByUserId({ id: session.user.id, differenceInHours: 24 });
    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError('rate_limit:chat').toResponse();
    }

    let chat = await getChatById({ id });
    if (!chat) {
      const title = await generateTitleFromUserMessage({ message });
      await saveChat({ id, userId: session.user.id, title, visibility: selectedVisibilityType });
    } else if (chat.userId !== session.user.id) {
      return new ChatSDKError('forbidden:chat').toResponse();
    }

    // Guardar mensaje del usuario
    await saveMessages({
      messages: [{ chatId: id, id: message.id, role: 'user', parts: message.parts, attachments: [], createdAt: new Date() }],
    });

    // Generar respuesta
    const userText = message.parts.join(' ');
    const aiReply = await generateResponse(userText, selectedChatModel);

    const aiMessageId = generateUUID();
    await saveMessages({
      messages: [{ chatId: id, id: aiMessageId, role: 'ai', parts: [aiReply], attachments: [], createdAt: new Date() }],
    });

    return new Response(JSON.stringify({ reply: aiReply, aiMessageId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    if (error instanceof ChatSDKError) return error.toResponse();
    console.error('Unhandled error in chat API:', error);
    return new ChatSDKError('offline:chat').toResponse();
  }
}
