import { z } from "zod";

export const SuggestionSchema = z.object({
  text: z.string().describe('Short title for the suggestion'),
  prompt: z.string().describe('Detailed prompt for content creation'),
});


