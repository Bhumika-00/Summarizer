import { groq } from "@/lib/groqClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { transcript, prompt } = await req.json();

    if (!transcript || !prompt) {
      return NextResponse.json(
        { error: "Transcript and prompt are required" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192", // or "mixtral-8x7b-32768"
      messages: [
        { role: "system", content: "You are a helpful assistant for summarizing meeting notes." },
        { role: "user", content: `Transcript:\n${transcript}\n\nInstruction: ${prompt}` },
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const summary = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ summary });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
