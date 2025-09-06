"use client";
import { useState, useRef, useEffect, KeyboardEvent } from "react";

type Message = { from: "ai" | "user"; text: string };
const suggestions = ["Next.js", "Dijkstra", "Ensayo sobre Silicon Valley", "Clima"];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { from: "ai", text: "Hello there! How can I help you today?" },
  ]);
  const [input, setInput] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll al final automáticamente
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (msg: string) => {
    if (!msg.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: msg }]);
    setInput("");

    try {
      const res = await fetch("/api/chat/stream", { // tu endpoint de streaming
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = "";
      setMessages((prev) => [...prev, { from: "ai", text: "" }]); // mensaje inicial vacío
      let index = messages.length; // índice del mensaje AI que estamos llenando

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        aiMessage += decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const copy = [...prev];
          copy[index] = { from: "ai", text: aiMessage };
          return copy;
        });
      }
    } catch (e) {
      setMessages((prev) => [...prev, { from: "ai", text: "Error al conectar con tu modelo." }]);
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
            key={i}
            className={`my-2 p-2 rounded ${
              m.from === "ai" ? "bg-gray-700" : "bg-blue-600 self-end"
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex space-x-2 mb-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => sendMessage(s)}
            className="bg-gray-800 px-3 py-1 rounded hover:bg-gray-600"
          >
            {s}
          </button>
        ))}
      </div>

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
    </div>
  );
}
