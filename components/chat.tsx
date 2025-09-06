"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import type { ChatModel } from "@/lib/ai/models";
import type { ChatMessage } from "@/lib/types";

type Props = {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: ChatModel["id"];
  initialVisibilityType: "private" | "public";
  isReadonly: boolean;
  session: any;
  autoResume: boolean;
};

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
}: Props) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático al final
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (msg: string) => {
    if (!msg.trim() || isReadonly) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", parts: [msg] }]);
    setInput("");

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          message: { id: crypto.randomUUID(), parts: [msg], role: "user" },
          selectedChatModel: initialChatModel,
          selectedVisibilityType: initialVisibilityType,
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = "";
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "ai", parts: [""] }]);
      let index = messages.length;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        aiMessage += decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const copy = [...prev];
          copy[index] = { id: copy[index].id, role: "ai", parts: [aiMessage] };
          return copy;
        });
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "ai", parts: ["Error al conectar con tu modelo."] },
      ]);
      console.error(e);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage(input);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <div className="flex-1 overflow-auto mb-4">
        {messages.map((m, i) => (
          <div
            key={m.id}
            className={`my-2 p-2 rounded ${
              m.role === "ai" ? "bg-gray-700" : "bg-blue-600 self-end"
            }`}
          >
            {m.parts.join(" ")}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!isReadonly && (
        <div className="flex space-x-2">
          <input
            className="flex-1 p-2 rounded bg-gray-800 text-white"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
          />
          <button
            onClick={() => sendMessage(input)}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
          >
            Enviar
          </button>
        </div>
      )}
    </div>
  );
}
