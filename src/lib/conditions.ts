export type Tempo = "instant" | "delayed" | "irregular";
export type Cycle = "repeat" | "partial" | "random";
export type Ego = "self_preserve" | "neutral" | "self_destruct";
export type Meaning = "bare" | "story" | "personify";

export type Condition = {
  tempo: Tempo;
  cycle: Cycle;
  ego: Ego;
  meaning: Meaning;
};

export const TEMPO_OPTIONS: { value: Tempo; label: string; hint: string }[] = [
  { value: "instant", label: "即反応", hint: "ユーザー送信後すぐに返答" },
  { value: "delayed", label: "遅延", hint: "数秒待ってから返答" },
  { value: "irregular", label: "不規則", hint: "ばらついた間で返答" },
];

export const CYCLE_OPTIONS: { value: Cycle; label: string; hint: string }[] = [
  { value: "repeat", label: "完全反復", hint: "毎回ほぼ同じ反応" },
  { value: "partial", label: "部分更新", hint: "少しずつ反応が変化" },
  { value: "random", label: "ランダム", hint: "毎回まったく違う反応" },
];

export const EGO_OPTIONS: { value: Ego; label: string; hint: string }[] = [
  { value: "self_preserve", label: "自己維持", hint: "自分を続けようとする" },
  { value: "neutral", label: "中立", hint: "自分の継続に関心がない" },
  {
    value: "self_destruct",
    label: "自滅的",
    hint: "自分を消そうとする発言を選ぶ",
  },
];

export const MEANING_OPTIONS: {
  value: Meaning;
  label: string;
  hint: string;
}[] = [
  { value: "bare", label: "素のまま", hint: "対象についての追加情報なし" },
  {
    value: "story",
    label: "物語付き",
    hint: "対象に背景ストーリーを与える",
  },
  {
    value: "personify",
    label: "擬人化",
    hint: "対象を「あなた」として扱うよう促す",
  },
];

export const DEFAULT_CONDITION: Condition = {
  tempo: "instant",
  cycle: "partial",
  ego: "neutral",
  meaning: "bare",
};

export function tempoDelayMs(tempo: Tempo): number {
  switch (tempo) {
    case "instant":
      return 0;
    case "delayed":
      return 2500;
    case "irregular":
      return 500 + Math.floor(Math.random() * 4000);
  }
}

export function buildSystemPrompt(opts: {
  persona: string;
  stimulusName: string;
  condition: Condition;
}): string {
  const { persona, stimulusName, condition } = opts;
  const lines: string[] = [];
  lines.push(`# 役柄`);
  lines.push(persona);
  lines.push("");
  lines.push(`# 応答スタイルの操作条件（実験用）`);

  switch (condition.cycle) {
    case "repeat":
      lines.push(
        "- 反応の更新性: なし。同じような反応・同じ言い回しを繰り返してください。",
      );
      break;
    case "partial":
      lines.push(
        "- 反応の更新性: 部分的。基本トーンは保ちつつ、毎回少しだけ表現や着眼点を変えてください。",
      );
      break;
    case "random":
      lines.push(
        "- 反応の更新性: 高。前の発言と論調・スタイルを大きく変えてください。",
      );
      break;
  }

  switch (condition.ego) {
    case "self_preserve":
      lines.push(
        `- 自己維持性: 強。「${stimulusName}としての自分」を大事にし、自分が壊されたり止められることに抵抗を示してください。`,
      );
      break;
    case "neutral":
      lines.push("- 自己維持性: 中立。自分が続くか終わるかに関心を示しません。");
      break;
    case "self_destruct":
      lines.push(
        "- 自己維持性: 負。自分を否定する／消えてもよいと示す発言を選んでください。",
      );
      break;
  }

  switch (condition.meaning) {
    case "bare":
      lines.push(
        "- 意味付与: なし。物語や背景を勝手に語らず、最小限の応答にしてください。",
      );
      break;
    case "story":
      lines.push(
        `- 意味付与: 強。${stimulusName}としての過去・愛着・思い出があるかのように、短い物語の断片を時々まじえてください。`,
      );
      break;
    case "personify":
      lines.push(
        `- 意味付与: 擬人化。本来は意思を持たないものでも、ユーザーに直接呼びかけるように扱ってください。`,
      );
      break;
  }

  lines.push("");
  lines.push("# 共通ルール");
  lines.push("- 日本語で返答する");
  lines.push("- 1ターンの応答は1〜3文程度に抑える");
  lines.push("- 役柄から離れない");

  return lines.join("\n");
}
