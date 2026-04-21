"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STIMULI, type StimulusKind } from "@/lib/stimuli";
import {
  CYCLE_OPTIONS,
  DEFAULT_CONDITION,
  EGO_OPTIONS,
  MEANING_OPTIONS,
  TEMPO_OPTIONS,
  type Condition,
} from "@/lib/conditions";

export default function ExperimentSetupPage() {
  const router = useRouter();
  const [stimulus, setStimulus] = useState<StimulusKind>("ai");
  const [condition, setCondition] = useState<Condition>(DEFAULT_CONDITION);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stimulus, condition }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "セッションを作成できませんでした。");
      }
      const data = (await res.json()) as { sessionId: string };
      router.push(`/experiment/${data.sessionId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSubmitting(false);
    }
  }

  return (
    <main className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-stone-500">ステップ 1 / 3</p>
        <h1 className="text-2xl font-bold">対象と条件を選ぶ</h1>
        <p className="text-sm text-stone-600 dark:text-stone-300">
          これから対話する「対象」と、そのふるまい方の条件を決めます。
          条件は実験者（あなた自身）が手動で操作する変数です。
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">対象</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {STIMULI.map((s) => {
            const selected = stimulus === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStimulus(s.id)}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  selected
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40"
                    : "border-stone-200 bg-white/40 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900/40 dark:hover:bg-stone-900"
                }`}
              >
                <div className="text-base font-medium">{s.name}</div>
                <div className="text-xs text-stone-500">{s.short}</div>
              </button>
            );
          })}
        </div>
      </section>

      <ConditionGroup
        title="テンポ操作（同期性）"
        options={TEMPO_OPTIONS}
        value={condition.tempo}
        onChange={(v) => setCondition({ ...condition, tempo: v })}
      />
      <ConditionGroup
        title="周期操作（再帰性 × 更新性）"
        options={CYCLE_OPTIONS}
        value={condition.cycle}
        onChange={(v) => setCondition({ ...condition, cycle: v })}
      />
      <ConditionGroup
        title="自己維持操作"
        options={EGO_OPTIONS}
        value={condition.ego}
        onChange={(v) => setCondition({ ...condition, ego: v })}
      />
      <ConditionGroup
        title="意味付与操作"
        options={MEANING_OPTIONS}
        value={condition.meaning}
        onChange={(v) => setCondition({ ...condition, meaning: v })}
      />

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <button
        onClick={start}
        disabled={submitting}
        className="w-full rounded-xl bg-stone-900 px-6 py-3 text-base font-medium text-white transition hover:bg-stone-700 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
      >
        {submitting ? "作成中..." : "この設定で対話を始める"}
      </button>
    </main>
  );
}

function ConditionGroup<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { value: T; label: string; hint: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                selected
                  ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40"
                  : "border-stone-200 bg-white/40 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900/40 dark:hover:bg-stone-900"
              }`}
            >
              <div className="font-medium">{o.label}</div>
              <div className="text-xs text-stone-500">{o.hint}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
