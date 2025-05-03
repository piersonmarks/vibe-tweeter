import { TweetSchema } from "@/app/api/schema";
import { z } from "zod";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useThread } from "@/provider/thread-provider";
import { Button } from "./ui/button";
import { ImagePlus } from "lucide-react";
import { Loader2 } from "lucide-react";

type Tweet = z.infer<typeof TweetSchema>;

type TweetWithImage = Partial<Tweet> & {
  image?: string;
  id?: string;
  isGeneratingImage?: boolean;
}

export function TweetImage({ tweet }: { tweet: TweetWithImage }) {
  const [localIsGenerating, setLocalIsGenerating] = useState(false);
  const { updateTweetImage, setTweetImageGenerating } = useThread();

  // Use either local state or tweet's isGeneratingImage property
  const isGenerating = localIsGenerating || tweet.isGeneratingImage;

  // For debugging - log when generating state changes
  useEffect(() => {
    if (tweet.id && isGenerating) {
      console.log(`TweetImage: Tweet ${tweet.id} is generating image`);
    }
  }, [isGenerating, tweet.id]);

  const handleGenerateImage = async () => {
    if (!tweet.text || !tweet.id) return;

    setLocalIsGenerating(true);
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
      setLocalIsGenerating(false);
    }
  };

  return (
    <div className="rounded-xl border border-stone-200 w-[500px] h-[300px] overflow-hidden">
      {!tweet.image ? (
        <div className="w-full h-full flex bg-stone-200 items-center justify-center flex-col gap-3">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-stone-500" />
              <p className="text-stone-600 font-medium">Generating image...</p>
            </div>
          ) : (
            <Button
              onClick={handleGenerateImage}
              className="shadow-none px-4 py-2 bg-stone-500 text-white rounded-md hover:bg-stone-600 transition-colors"
              disabled={!tweet.text}
            >
              <div className="flex items-center gap-2">
                <ImagePlus className="w-4 h-4" />
                Generate Image
              </div>
            </Button>
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