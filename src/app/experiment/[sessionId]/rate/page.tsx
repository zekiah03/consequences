"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

const INPUT_AXES = [
  {
    key: "syncScore",
    label: "同期性",
    hint: "テンポが噛み合った感じ",
  },
  {
    key: "recurScore",
    label: "再帰性",
    hint: "「同じ相手」に戻って来る感じ",
  },
  {
    key: "updateScore",
    label: "更新性",
    hint: "毎回少しずつ違う / 動いている感じ",
  },
  {
    key: "egoScore",
    label: "自己維持性",
    hint: "自分を続けようとしている感じ",
  },
  {
    key: "meaningScore",
    label: "意味成立性",
    hint: "やり取りが噛み合っていた / 意味が通じていた感じ",
  },
] as const;

const OUTPUT_AXES = [
  { key: "consciousnessScore", label: "意識ありそう感" },
  { key: "dialogueScore", label: "対話できた感" },
  { key: "friendScore", label: "友達っぽい感" },
] as const;

type ScoreKey =
  | (typeof INPUT_AXES)[number]["key"]
  | (typeof OUTPUT_AXES)[number]["key"];

export default function RatePage() {
  const router = useRouter();
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const [scores, setScores] = useState<Record<ScoreKey, number>>(() => {
    const init = {} as Record<ScoreKey, number>;
    [...INPUT_AXES, ...OUTPUT_AXES].forEach((a) => (init[a.key] = 4));
    return init;
  });
  const [freeText, setFreeText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setScore(k: ScoreKey, v: number) {
    setScores((s) => ({ ...s, [k]: v }));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, ...scores, freeText }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "保存に失敗しました。");
      }
      router.push(`/experiment/${sessionId}/done`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSubmitting(false);
    }
  }

  return (
    <main className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-stone-500">ステップ 3 / 3</p>
        <h1 className="text-2xl font-bold">対象を 7 段階で評価する</h1>
        <p className="text-sm text-stone-600 dark:text-stone-300">
          1（まったくそう思わない）〜 7（強くそう思う）。直感で構いません。
        </p>
      </header>

      <section className="space-y-5 rounded-2xl border border-stone-200 bg-white/50 p-5 dark:border-stone-800 dark:bg-stone-900/40">
        <h2 className="text-sm font-semibold text-stone-500">構成要素</h2>
        {INPUT_AXES.map((a) => (
          <SliderRow
            key={a.key}
            label={a.label}
            hint={a.hint}
            value={scores[a.key]}
            onChange={(v) => setScore(a.key, v)}
          />
        ))}
      </section>

      <section className="space-y-5 rounded-2xl border border-amber-300 bg-amber-50/50 p-5 dark:border-amber-700/40 dark:bg-amber-950/20">
        <h2 className="text-sm font-semibold text-amber-700 dark:text-amber-300">
          意識帰属
        </h2>
        {OUTPUT_AXES.map((a) => (
          <SliderRow
            key={a.key}
            label={a.label}
            value={scores[a.key]}
            onChange={(v) => setScore(a.key, v)}
          />
        ))}
      </section>

      <section className="space-y-2">
        <label className="text-sm font-medium">
          自由記述（任意）
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={4}
            placeholder="どんな瞬間に「意識ありそう」「ない」と感じたか、など"
            className="mt-1 w-full rounded-xl border border-stone-300 bg-white p-3 text-sm focus:border-stone-500 focus:outline-none dark:border-stone-700 dark:bg-stone-900"
          />
        </label>
      </section>

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={submitting}
        className="w-full rounded-xl bg-stone-900 px-6 py-3 text-base font-medium text-white transition hover:bg-stone-700 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
      >
        {submitting ? "送信中..." : "評価を送信する"}
      </button>
    </main>
  );
}

function SliderRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="font-medium">{label}</span>
          {hint && (
            <span className="ml-2 text-xs text-stone-500">— {hint}</span>
          )}
        </div>
        <span className="tabular-nums text-sm text-stone-500">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={7}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-amber-500"
      />
      <div className="flex justify-between text-[10px] text-stone-400">
        <span>1</span>
        <span>4</span>
        <span>7</span>
      </div>
    </div>
  );
}
