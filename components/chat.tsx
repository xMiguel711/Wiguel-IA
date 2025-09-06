"use client"; // <--- Esto indica que es un componente cliente

import { useState } from "react";
import type { ChatMessage, UIMessagePart } from "@/lib/types";

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const handleSend = (msg: string) => {
    if (!msg.trim()) return;

    // Convertimos el string en un UIMessagePart válido
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", content: msg }], // <- estructura correcta
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Aquí podrías enviar el mensaje al backend o stream
  };

  return (
    <div>
      <div>
        {messages.map((m) => (
          <div key={m.id}>
            {m.parts.map((p, i) => (
              <span key={i}>{p.content}</span>
            ))}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Escribe un mensaje..."
      />
      <button onClick={() => handleSend(input)}>Enviar</button>
    </div>
  );
}
