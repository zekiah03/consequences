# 意識らしさ実験アプリ (consequences)

「観測者が対象に意識ありそうと感じる条件」を測定するための、
Next.js + Vercel 用の最小実験アプリ。

## できること（v0.1）

- 6 種類の対象（人間 / 犬 / AI / ロボット / 植物 / 石）から1つ選ぶ
- 4 種類の操作条件（テンポ / 周期 / 自己維持 / 意味付与）を切り替える
- Claude API でリアルタイムにストリーミング対話する
- 5 つの構成要素 + 3 つの帰属指標を 7 段階で評価して保存する

## 技術スタック

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Drizzle ORM + Postgres (Vercel Postgres / Neon / Supabase いずれも可)
- Anthropic Claude API (`claude-opus-4-7`、ストリーミング、プロンプトキャッシング)

## セットアップ

```bash
npm install
cp .env.example .env.local
# .env.local に DATABASE_URL と ANTHROPIC_API_KEY を入れる
npm run db:push   # スキーマをDBに反映
npm run dev
```

`.env.local`:

```
DATABASE_URL=postgres://...
ANTHROPIC_API_KEY=sk-ant-...
```

## デプロイ (Vercel)

1. Vercel にこのリポジトリを Import
2. Storage タブで Postgres を作成 → `DATABASE_URL` が自動で入る
3. Settings → Environment Variables で `ANTHROPIC_API_KEY` を追加
4. Deploy

## ディレクトリ

```
src/
  app/
    page.tsx                              トップ（同意 + スタート）
    experiment/page.tsx                   対象 × 条件の選択
    experiment/[sessionId]/page.tsx       対話画面（ストリーミング）
    experiment/[sessionId]/rate/page.tsx  評価画面
    experiment/[sessionId]/done/page.tsx  完了画面
    api/session/route.ts                  セッション作成
    api/session/[sessionId]/route.ts      セッション取得
    api/chat/route.ts                     Claude API ストリーミング
    api/rating/route.ts                   評価保存
  lib/
    db/schema.ts                          users / sessions / messages / ratings
    db/index.ts                           Drizzle クライアント
    stimuli.ts                            6種類の対象とペルソナ
    conditions.ts                         4種類の操作条件 + system prompt 構築
```

## データモデル

- `users`: 匿名ユーザー（セッションごとに1人作る最小実装）
- `sessions`: 対象 × 条件 × ユーザー
- `messages`: 対話ログ（user / assistant）
- `ratings`: 5 構成要素スコア + 3 帰属スコア + 自由記述

## 次のステップ

- ダッシュボード（重回帰 / クラスタ / 因子分析）
- ユーザー継続性（ローカルストレージで `user_id` を保持）
- 同意フォームの強化
- 対象の拡張（国家 / 企業 / キャラクター）
