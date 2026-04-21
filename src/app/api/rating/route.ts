import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ratings } from "@/lib/db/schema";

export const runtime = "nodejs";

type Body = {
  sessionId: string;
  syncScore: number;
  recurScore: number;
  updateScore: number;
  egoScore: number;
  meaningScore: number;
  consciousnessScore: number;
  dialogueScore: number;
  friendScore: number;
  freeText?: string;
};

const SCORE_KEYS = [
  "syncScore",
  "recurScore",
  "updateScore",
  "egoScore",
  "meaningScore",
  "consciousnessScore",
  "dialogueScore",
  "friendScore",
] as const;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!body.sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }
  for (const k of SCORE_KEYS) {
    const v = body[k];
    if (typeof v !== "number" || v < 1 || v > 7) {
      return NextResponse.json({ error: `invalid ${k}` }, { status: 400 });
    }
  }

  await db
    .insert(ratings)
    .values({
      sessionId: body.sessionId,
      syncScore: body.syncScore,
      recurScore: body.recurScore,
      updateScore: body.updateScore,
      egoScore: body.egoScore,
      meaningScore: body.meaningScore,
      consciousnessScore: body.consciousnessScore,
      dialogueScore: body.dialogueScore,
      friendScore: body.friendScore,
      freeText: body.freeText ?? null,
    })
    .onConflictDoUpdate({
      target: ratings.sessionId,
      set: {
        syncScore: body.syncScore,
        recurScore: body.recurScore,
        updateScore: body.updateScore,
        egoScore: body.egoScore,
        meaningScore: body.meaningScore,
        consciousnessScore: body.consciousnessScore,
        dialogueScore: body.dialogueScore,
        friendScore: body.friendScore,
        freeText: body.freeText ?? null,
      },
    });

  return NextResponse.json({ ok: true });
}
