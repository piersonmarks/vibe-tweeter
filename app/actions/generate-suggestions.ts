'use server'

import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { SuggestionSchema } from "../api/schema";

export async function generateSuggestions() {
  try {
    // First, search the web for recent events
    const { text: recentNews } = await generateText({
      model: openai.responses('gpt-4o-mini'),
      prompt: 'What are the most interesting or significant events that happened in the last 24 hours globally? Focus on diverse topics like technology, sports, politics, entertainment, and business. Provide a concise summary of 3-5 major events.',
      temperature: 0.9,
      tools: {
        web_search_preview: openai.tools.webSearchPreview({
          searchContextSize: 'high',
          userLocation: {
            type: 'approximate',
            city: 'San Francisco',
            region: 'California',
          },
        }),
      },
    });

    // Then, use the recent news to generate content suggestions
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      output: 'array',
      schema: SuggestionSchema,
      temperature: 0.9,
      prompt: `
      Generate 3 engaging content ideas for a twitter thread based on recent events and news.

      Here's information about recent events to inspire your suggestions:
      ${recentNews}

      Each suggestion should include:
      - A text field with a short (max 3 words) high-level description of the content idea
      - A prompt field with detailed information needed to generate the content with an LLM

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

