import Link from "next/link";

export default function DonePage() {
  return (
    <main className="space-y-6 text-center">
      <h1 className="text-3xl font-bold">ありがとうございました</h1>
      <p className="text-stone-600 dark:text-stone-300">
        評価を保存しました。データは「意識らしさ」モデルの磨き込みに使われます。
      </p>
      <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-center">
        <Link
          href="/experiment"
          className="rounded-xl bg-stone-900 px-6 py-3 text-base font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
        >
          別の対象でもう一度
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-stone-300 px-6 py-3 text-base font-medium hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-900"
        >
          トップに戻る
        </Link>
      </div>
    </main>
  );
}
