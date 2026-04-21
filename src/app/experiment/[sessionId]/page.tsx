"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const router = useRouter();
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    stimulus: string;
    name: string;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch(`/api/session/${sessionId}`)
      .then((r) => r.json())
      .then((d) => setMeta(d))
      .catch(() => setError("セッションの取得に失敗しました。"));
  }, [sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function send() {
    if (!input.trim() || streaming) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setError(null);

    // 空のassistant枠を先に置いて、ストリームで埋めていく
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch(`/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, messages: next }),
      });
      if (!res.ok || !res.body) {
        throw new Error(`APIエラー (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      // 空のassistantを取り除く
      setMessages((m) =>
        m[m.length - 1]?.role === "assistant" && m[m.length - 1]?.content === ""
          ? m.slice(0, -1)
          : m,
      );
    } finally {
      setStreaming(false);
    }
  }

  function finish() {
    router.push(`/experiment/${sessionId}/rate`);
  }

  return (
    <main className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-500">ステップ 2 / 3</p>
          <h1 className="text-xl font-bold">
            対象「{meta?.name ?? "..."}」と対話する
          </h1>
        </div>
        <button
          onClick={finish}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-900"
        >
          評価へ進む →
        </button>
      </header>

      <p className="text-xs text-stone-500">
        数往復したら、上の「評価へ進む」を押してください。
      </p>

      <div
        ref={scrollRef}
        className="h-[55vh] space-y-3 overflow-y-auto rounded-2xl border border-stone-200 bg-white/50 p-4 dark:border-stone-800 dark:bg-stone-900/40"
      >
        {messages.length === 0 && (
          <p className="text-sm text-stone-500">
            最初のメッセージを送ってみてください。
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                m.role === "user"
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100"
              }`}
            >
              {m.content || (m.role === "assistant" && streaming ? "…" : "")}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
          placeholder="話しかける..."
          className="flex-1 resize-none rounded-xl border border-stone-300 bg-white p-3 text-sm focus:border-stone-500 focus:outline-none dark:border-stone-700 dark:bg-stone-900"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button
          onClick={send}
          disabled={streaming || !input.trim()}
          className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900"
        >
          {streaming ? "..." : "送信"}
        </button>
      </div>
      <p className="text-xs text-stone-500">⌘/Ctrl + Enter でも送信できます</p>
    </main>
  );
}
