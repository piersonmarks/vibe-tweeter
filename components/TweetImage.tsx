import { TweetSchema } from "@/app/api/schema";
import { z } from "zod";
import Image from "next/image";
import { useState } from "react";
import { useThread } from "@/provider/thread-provider";

type Tweet = z.infer<typeof TweetSchema>;

type TweetWithImage = Partial<Tweet> & {
  image?: string;
  id?: string;
}

export function TweetImage({ tweet }: { tweet: TweetWithImage }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { updateTweetImage } = useThread();

  const handleGenerateImage = async () => {
    if (!tweet.text || !tweet.id) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/v1/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: tweet.text }),
      });

      const data = await response.json();
      if (data.image) {
        // Convert base64 to data URL for images
        const imageUrl = `data:image/png;base64,${data.image}`;
        updateTweetImage(tweet.id, imageUrl);
      }
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-xl border border-stone-200 w-[500px] h-[300px]">
      {!tweet.image ? (
        <div className="w-full h-full flex items-center justify-center flex-col gap-3">
          {isGenerating ? (
            <p className="text-stone-500">Generating image...</p>
          ) : (
            <>
              <p className="text-stone-500">No image</p>
              <button
                onClick={handleGenerateImage}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                disabled={!tweet.text || isGenerating}
              >
                Generate Image
              </button>
            </>
          )}
        </div>
      ) : (
        <Image
          src={tweet.image}
          alt="Tweet image"
          width={500}
          height={300}
          className="w-full h-full object-cover rounded-xl"
        />
      )}
    </div>
  );
}