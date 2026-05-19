"use client";

import { useCallback, useRef, useState } from "react";

type Message = { role: "user" | "bot"; text: string };

const STARTER: Message = {
  role: "bot",
  text: "Ask anything about Preferred Freelancer rules — e.g. employer wants Skype, PayPal payment, or turning off your badge.\n\nI'll explain what applies and what to do next.",
};

const QUICK = [
  "Employer wants PayPal",
  "Share contact details",
  "Upfront payment",
  "Turn off badge",
  "Timeout meaning",
  "External quote fees",
];

function BubbleText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([STARTER]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollDown = useCallback(() => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMessage: Message = { role: "user", text: trimmed };
      setMessages((m) => [...m, userMessage]);
      setInput("");
      setLoading(true);
      scrollDown();

      const history = [...messages, userMessage]
        .filter((m) => m.role === "user" || m.role === "bot")
        .slice(-12)
        .map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("assistant" as const),
          content: m.text,
        }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        const data = (await res.json()) as { reply?: string; error?: string };

        if (!res.ok) {
          throw new Error(data.error ?? "Request failed");
        }

        setMessages((m) => [...m, { role: "bot", text: data.reply ?? "No response." }]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Something went wrong.";
        setMessages((m) => [
          ...m,
          {
            role: "bot",
            text: `**Error:** ${msg}\n\nCheck that \`OPENAI_API_KEY\` is set in \`.env.local\` (local) or Vercel project settings.`,
          },
        ]);
      } finally {
        setLoading(false);
        scrollDown();
      }
    },
    [loading, messages, scrollDown],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>PFP Assistant</h1>
        <p>Powered by OpenAI — answers from your validated PFP rules</p>
      </header>

      <div className="chips">
        {QUICK.map((q) => (
          <button key={q} type="button" className="chip" onClick={() => send(q)} disabled={loading}>
            {q}
          </button>
        ))}
      </div>

      <div className="messages" role="log" aria-live="polite">
        {messages.map((msg, i) => (
          <div key={i} className={`bubble ${msg.role}`}>
            <BubbleText text={msg.text} />
          </div>
        ))}
        {loading && (
          <div className="bubble bot" aria-busy="true">
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="composer" onSubmit={onSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={loading ? "Waiting for reply…" : "Ask a question…"}
          autoComplete="off"
          aria-label="Your question"
          disabled={loading}
        />
        <button type="submit" disabled={!input.trim() || loading}>
          {loading ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
