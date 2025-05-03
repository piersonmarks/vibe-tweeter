import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { SuggestionSchema } from "../../schema";

export async function POST() {
  try {
    console.log("Generating suggestions");

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      output: 'array',
      schema: SuggestionSchema,
      prompt: `
      Generate 5 engaging content ideas for twitter threads about technology and productivity.

      The text should be short and max 3 words to describe the high level idea of the content.
      The prompt should be detailed and include all the information needed to generate the content with an LLM.
      `,
    });

    return Response.json({ suggestions: object });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}

