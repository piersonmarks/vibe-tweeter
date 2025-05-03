'use server'

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { SuggestionSchema } from "../api/schema";

export async function generateSuggestions() {
  try {

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      output: 'array',
      schema: SuggestionSchema,
      prompt: `
      Generate 5 engaging content ideas for a twitter thread about technology and productivity.

      The text should be short and max 3 words to describe the high level idea of the content.
      The prompt should be detailed and include all the information needed to generate the content with an LLM.
      `,
    });

    return object;
  } catch (error) {
    console.error(error);
    return [];
  }
}

