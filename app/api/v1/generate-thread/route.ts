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
      prompt: `
        You are a highly skilled marketing expert who crafts engaging twitter threads.

        You will be given a prompt and you will need to generate a thread of tweets about the prompt.

        The thread should be short and max 7 items.
        The tweets should be short and max 280 characters.
        The tweets should be engaging and interesting.
        The tweets should be related to the prompt.
        Don't include markdown formatting.

        # Prompt
        ${prompt}.
      `,
      schema: TweetSchema,
      output: "array",
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error(error);
  }
}