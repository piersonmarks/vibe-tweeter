import { z } from "zod";

export const SuggestionSchema = z.object({
  text: z.string().describe('Short title for the suggestion'),
  prompt: z.string().describe('Detailed prompt for content creation'),
});

export const TweetSchema = z.object({
  text: z.string().describe('Tweet core content'),
  imageDescription: z.string().describe('Descriptive prompt for image generation'),
});

