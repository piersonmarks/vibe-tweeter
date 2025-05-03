import { NextRequest, NextResponse } from "next/server";
import { experimental_generateImage as generateImage, generateText } from "ai";
import { openai } from "@ai-sdk/openai";

/**
 * Intended to be slightly less than the maximum execution time allowed by the
 * runtime so that we can gracefully terminate our request.
 */
const TIMEOUT_MILLIS = 55 * 1000;

const MODELS = {
  DALL_E_3: "dall-e-3",
  GPT_IMAGE_1: "gpt-image-1",
}
const DEFAULT_IMAGE_SIZE = "1024x1024";

interface GenerateImageRequest {
  prompt: string;
}

const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMillis: number
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeoutMillis)
    ),
  ]);
};


export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const { prompt } = await req.json() as GenerateImageRequest;

  const modelId = MODELS.DALL_E_3;
  try {
    if (!prompt) {
      const error = "Invalid request parameters";
      console.error(`${error} [requestId=${requestId}]`);
      return NextResponse.json({ error }, { status: 400 });
    }

    console.log(`Generating image [requestId=${requestId}, prompt=${prompt}]`);

    const { text } = await generateText({
      model: openai.responses('gpt-4o-mini'),
      prompt: `
        Generate a detailed prompt for an image generation model to generate an image for the following text: ${prompt}.

        The prompt should be detailed and include all the information needed to generate the image with an LLM.
        The prompt should be short and max 100 words.
      `,
    });

    console.log(`Generated image prompt: ${text}`);
    const startstamp = performance.now();
    const generatePromise = generateImage({
      model: openai.image(modelId),
      prompt: text,
      size: DEFAULT_IMAGE_SIZE,
    }).then(({ image, warnings }) => {
      if (warnings?.length > 0) {
        console.warn(
          `Warnings [requestId=${requestId}, model=${modelId}]: `,
          warnings
        );
      }
      console.log(
        `Completed image request [requestId=${requestId}, model=${modelId}, elapsed=${(
          (performance.now() - startstamp) /
          1000
        ).toFixed(1)}s].`
      );

      return {
        image: image.base64,
      };
    });

    const result = await withTimeout(generatePromise, TIMEOUT_MILLIS);
    return NextResponse.json(result, {
      status: "image" in result ? 200 : 500,
    });
  } catch (error) {
    // Log full error detail on the server, but return a generic error message
    // to avoid leaking any sensitive information to the client.
    console.error(
      `Error generating image [requestId=${requestId}, model=${modelId}]: `,
      error
    );
    return NextResponse.json(
      {
        error: "Failed to generate image. Please try again later.",
      },
      { status: 500 }
    );
  }
}
