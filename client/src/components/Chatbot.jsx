import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const send = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setLoading(true);

    // Open an EventSource to receive streaming chunks
    const encoded = encodeURIComponent(text);
    const url = `http://localhost:3001/chat/stream?message=${encoded}&agent=eleven`;

    const es = new EventSource(url);

    let acc = "";
    // Insert a placeholder bot message that we'll update as chunks arrive
    setMessages((m) => [...m, { from: "bot", text: "" }]);

    es.onmessage = (e) => {
      try {
        // Many upstreams send raw text chunks; try parse as JSON first
        let chunk = e.data;
        // Some implementations send JSON payloads
        try {
          const parsed = JSON.parse(chunk);
          if (parsed.reply) chunk = parsed.reply;
          else if (parsed.output) chunk = parsed.output;
          else chunk = Object.values(parsed).join(" ") || chunk;
        } catch {}

        acc += chunk;
        // update the last message
        setMessages((m) => {
          const copy = [...m];
          const lastIdx = copy.map((x) => x.from).lastIndexOf("bot");
          if (lastIdx >= 0) copy[lastIdx] = { from: "bot", text: acc };
          return copy;
        });
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    es.addEventListener("done", async () => {
      es.close();
      setLoading(false);

      // Play TTS if available
      try {
        const ttsRes = await fetch("http://localhost:3001/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: acc })
        });

        if (ttsRes.ok) {
          const blob = await ttsRes.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.play().catch(() => {});
        }
      } catch (err) {
        // ignore audio errors
      }
    });

    es.onerror = (err) => {
      setLoading(false);
      es.close();
      setMessages((m) => [...m, { from: "bot", text: "Failed to reach server." }]);
    };
  };

  const onKey = (e) => {
    if (e.key === "Enter") send();
  };

  return (
    <div className={`chatbot-root ${open ? "open" : ""}`}>
      <div className="chat-toggle" onClick={() => setOpen((s) => !s)} title="Open chat">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
          <path d="M12 3C7 3 3 6 3 10c0 1.9.9 3.6 2.4 4.8L5 21l6.3-2.8C12.6 18.3 13.3 18 14 18c5 0 8-3 8-8s-4-7-10-7z" />
        </svg>
      </div>

      <div className="chat-window">
        <div className="chat-header">Scam Assistant</div>

        <div className="chat-list" ref={listRef}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.from}`}>
              {m.text}
            </div>
          ))}
          {loading && <div className="chat-msg bot">...</div>}
        </div>

        <div className="chat-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask about a suspicious message..."
          />
          <button onClick={send} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
