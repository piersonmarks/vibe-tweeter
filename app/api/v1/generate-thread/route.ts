import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { TweetSchema } from "../../schema";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt) {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    const result = await streamObject({
      model: openai("gpt-4o-mini"),
      prompt,
      schema: TweetSchema,
      output: "array",
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error(error);
  }
}