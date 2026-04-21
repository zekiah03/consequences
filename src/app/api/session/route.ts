import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";
import { STIMULUS_MAP, type StimulusKind } from "@/lib/stimuli";
import type { Condition } from "@/lib/conditions";

export const runtime = "nodejs";

type Body = {
  stimulus: StimulusKind;
  condition: Condition;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!body?.stimulus || !STIMULUS_MAP[body.stimulus]) {
    return NextResponse.json({ error: "invalid stimulus" }, { status: 400 });
  }
  const { tempo, cycle, ego, meaning } = body.condition ?? {};
  if (!tempo || !cycle || !ego || !meaning) {
    return NextResponse.json({ error: "invalid condition" }, { status: 400 });
  }

  // 匿名ユーザーをセッションごとに作る（最小版）
  const [user] = await db.insert(users).values({}).returning();
  const [session] = await db
    .insert(sessions)
    .values({
      userId: user.id,
      stimulusId: body.stimulus,
      conditionTempo: tempo,
      conditionCycle: cycle,
      conditionEgo: ego,
      conditionMeaning: meaning,
    })
    .returning();

  return NextResponse.json({ sessionId: session.id });
}
