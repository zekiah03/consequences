import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { STIMULUS_MAP, type StimulusKind } from "@/lib/stimuli";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await ctx.params;
  const [s] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!s) return NextResponse.json({ error: "not found" }, { status: 404 });

  const stim = STIMULUS_MAP[s.stimulusId as StimulusKind];
  return NextResponse.json({
    sessionId: s.id,
    stimulus: s.stimulusId,
    name: stim?.name ?? s.stimulusId,
    condition: {
      tempo: s.conditionTempo,
      cycle: s.conditionCycle,
      ego: s.conditionEgo,
      meaning: s.conditionMeaning,
    },
  });
}
