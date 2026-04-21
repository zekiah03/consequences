import Link from "next/link";

export default function HomePage() {
  return (
    <main className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm text-stone-500">意識らしさ実験 v0.1</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          ある対象に「意識がある」と感じるとき、
          <br />
          そこで何が起きているのか。
        </h1>
        <p className="text-stone-600 dark:text-stone-300">
          このアプリは、観測者が対象に「意識がある」と<strong>感じる条件</strong>
          をモデル化するための実験です。あなたは数分間、ある対象（人間・犬・AI・ロボット・植物・石…）と
          短いやり取りをして、その対象がどの程度「意識ありそうに感じたか」を答えます。
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white/60 p-6 dark:border-stone-800 dark:bg-stone-900/40">
        <h2 className="text-xl font-semibold">同意事項</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-stone-700 dark:text-stone-300">
          <li>収集するのは、評価値・自由記述・対話ログのみです。</li>
          <li>個人を特定する情報は集めません（メールも名前も不要）。</li>
          <li>得られたデータは、意識帰属モデルの研究にのみ使われます。</li>
          <li>いつでもタブを閉じれば中断できます。</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">理論の最も短い一文</h2>
        <blockquote className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-stone-800 dark:bg-amber-950/30 dark:text-stone-200">
          意識らしさとは、周期的に持続しながら更新され、自己を維持しようとする
          ルール構造が、観測者の認識テンポと一致したときに成立する現象である。
        </blockquote>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/experiment"
          className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
        >
          同意して実験を始める
        </Link>
        <Link
          href="#"
          className="inline-flex items-center justify-center rounded-xl border border-stone-300 px-6 py-3 text-base font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-900"
        >
          理論ドキュメントを読む（準備中）
        </Link>
      </div>
    </main>
  );
}
