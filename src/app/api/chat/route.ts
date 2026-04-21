import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages as messagesTable, sessions } from "@/lib/db/schema";
import { STIMULUS_MAP, type StimulusKind } from "@/lib/stimuli";
import {
  buildSystemPrompt,
  tempoDelayMs,
  type Condition,
  type Tempo,
  type Cycle,
  type Ego,
  type Meaning,
} from "@/lib/conditions";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  sessionId: string;
  messages: { role: "user" | "assistant"; content: string }[];
};

function isCondition(v: unknown): v is Condition {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.tempo === "string" &&
    typeof o.cycle === "string" &&
    typeof o.ego === "string" &&
    typeof o.meaning === "string"
  );
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response("ANTHROPIC_API_KEY is not set", { status: 500 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  if (!body.sessionId || !Array.isArray(body.messages)) {
    return new Response("invalid body", { status: 400 });
  }

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, body.sessionId))
    .limit(1);

  if (!session) return new Response("session not found", { status: 404 });

  const stim = STIMULUS_MAP[session.stimulusId as StimulusKind];
  if (!stim) return new Response("invalid stimulus", { status: 400 });

  const condition: Condition = {
    tempo: session.conditionTempo as Tempo,
    cycle: session.conditionCycle as Cycle,
    ego: session.conditionEgo as Ego,
    meaning: session.conditionMeaning as Meaning,
  };
  if (!isCondition(condition)) {
    return new Response("invalid condition", { status: 500 });
  }

  const system = buildSystemPrompt({
    persona: stim.persona,
    stimulusName: stim.name,
    condition,
  });

  // ユーザーの直近メッセージをDBに保存
  const lastUser = body.messages[body.messages.length - 1];
  if (lastUser?.role === "user") {
    await db.insert(messagesTable).values({
      sessionId: session.id,
      role: "user",
      content: lastUser.content,
    });
  }

  const client = new Anthropic();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const delay = tempoDelayMs(condition.tempo);
      if (delay > 0) await new Promise((r) => setTimeout(r, delay));

      let accumulated = "";
      try {
        const apiStream = client.messages.stream({
          model: "claude-opus-4-7",
          max_tokens: 1024,
          system: [
            {
              type: "text",
              text: system,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: body.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        });

        for await (const event of apiStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const chunk = event.delta.text;
            accumulated += chunk;
            controller.enqueue(encoder.encode(chunk));
          }
        }

        await apiStream.finalMessage();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        controller.enqueue(encoder.encode(`\n\n[エラー: ${msg}]`));
      } finally {
        if (accumulated) {
          await db
            .insert(messagesTable)
            .values({
              sessionId: session.id,
              role: "assistant",
              content: accumulated,
            })
            .catch(() => {});
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
