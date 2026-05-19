import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/lib/prompt";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY is not set. Add it to .env.local or Vercel environment variables." },
      { status: 500 },
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = body.messages;
  if (!messages?.length) {
    return Response.json({ error: "No messages provided." }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.3,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return Response.json({ error: "Empty response from OpenAI." }, { status: 502 });
    }

    return Response.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "OpenAI request failed.";
    return Response.json({ error: message }, { status: 502 });
  }
}
