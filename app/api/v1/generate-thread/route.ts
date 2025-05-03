import { openai } from "@ai-sdk/openai";
import { streamObject, generateText } from "ai";
import { TweetSchema } from "../../schema";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt) {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    // First, search the web for relevant information about the prompt
    const { text: searchResults } = await generateText({
      model: openai.responses('gpt-4o-mini'),
      prompt: `Search for recent and relevant information about: ${prompt}. Focus on facts, statistics, trends, and recent developments.`,
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
      toolChoice: { type: 'tool', toolName: 'web_search_preview' },
    });

    // Then, use the search results to inform the thread generation
    const result = await streamObject({
      model: openai("gpt-4o-mini"),
      prompt: `
        You are a highly skilled marketing expert who crafts engaging twitter threads.

        You will be given a prompt and you will need to generate a thread of tweets about the prompt.

        Here's recent information related to the prompt that you should incorporate:
        ${searchResults}

        The thread should be short and max 7 items.
        The tweets should be short and max 280 characters.
        The tweets should be engaging and interesting.
        The tweets should incorporate relevant facts from the search results.
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
    return Response.json({ error: "Failed to generate thread" }, { status: 500 });
  }
}