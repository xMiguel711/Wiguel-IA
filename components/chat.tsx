"use client";
import { useState, KeyboardEvent } from "react";

type Message = { from: "ai" | "user"; text: string };
const suggestions = ["Next.js", "Dijkstra", "Ensayo sobre Silicon Valley", "Clima"];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { from: "ai", text: "Hello there! How can I help you today?" },
  ]);
  const [input, setInput] = useState<string>("");

  const sendMessage = async (msg: string) => {
    if (!msg.trim()) return;
    setMessages([...messages, { from: "user", text: msg }]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { from: "ai", text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { from: "ai", text: "Error al conectar con tu modelo." }]);
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
