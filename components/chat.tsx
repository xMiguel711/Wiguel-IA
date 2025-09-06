"use client"; // Muy importante para que funcione con hooks y sea un Client Component

import { useState } from "react";
import type { ChatMessage, UIMessagePart } from "@/lib/types";

interface ChatProps {
  id: string;
  initialMessages?: ChatMessage[];
  initialChatModel?: string;
  initialVisibilityType?: string;
  isReadonly?: boolean;
  session?: any;
  autoResume?: boolean;
}

export default function Chat({
  id,
  initialMessages = [],
  initialChatModel,
  initialVisibilityType,
  isReadonly = false,
  session,
  autoResume = false,
}: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = (msg: string) => {
    if (!msg.trim()) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", content: msg } as UIMessagePart],
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Aquí podrías enviar el mensaje al backend o stream
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((m) => (
          <div key={m.id} className={`message ${m.role}`}>
            {m.parts.map((p, i) => (
              <span key={i}>{p.content}</span>
            ))}
          </div>
        ))}
      </div>

      {!isReadonly && (
        <div className="input-area">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje..."
          />
          <button onClick={() => handleSend(input)}>Enviar</button>
        </div>
      )}
    </div>
  );
}
