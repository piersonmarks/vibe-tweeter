import { TweetSchema } from "@/app/api/schema";
import { z } from "zod";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useThread } from "@/provider/thread-provider";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Tweet = z.infer<typeof TweetSchema>;

type TweetWithImage = Partial<Tweet> & {
  image?: string;
  id?: string;
  isGeneratingImage?: boolean;
}

export function TweetImage({ tweet }: { tweet: TweetWithImage }) {
  const [localIsGenerating, setLocalIsGenerating] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { regenerateImage, setTweetImageGenerating } = useThread();

  // Use either local state or tweet's isGeneratingImage property
  const isGenerating = localIsGenerating || tweet.isGeneratingImage;

  // If tweet has an ID but no image and is not already generating, set it to generate
  useEffect(() => {
    if (tweet.id && !tweet.image && !isGenerating && tweet.text) {
      console.log(`TweetImage: Triggering image generation for tweet ${tweet.id}`);
      handleGenerateImage();
    }
  }, [tweet.id, tweet.image, tweet.text, isGenerating]);

  // For debugging - log when generating state changes
  useEffect(() => {
    if (tweet.id && isGenerating) {
      console.log(`TweetImage: Tweet ${tweet.id} is generating image`);
    }
  }, [isGenerating, tweet.id]);

  const handleGenerateImage = async () => {
    if (!tweet.text || !tweet.id) {
      console.error("Cannot generate image: missing tweet text or ID");
      return;
    }

    // Set local state
    setLocalIsGenerating(true);

    if (!tweet.image) {
      toast.loading("Generating image...");
    } else {
      toast.loading("Regenerating image...");
    }

    try {
      await regenerateImage(tweet.id, tweet.text);
      toast.success("Image generated successfully");
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast.error("Error generating image");
    } finally {
      toast.dismiss();
      // Reset local state
      setLocalIsGenerating(false);
    }
  };

  return (
    <div className="rounded-xl border border-stone-200 w-[500px] h-[300px] overflow-hidden">
      {!tweet.image ? (
        <div className="w-full h-full flex bg-stone-200 items-center justify-center flex-col gap-3">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-stone-500" />
            <p className="text-stone-600 font-medium">Generating image...</p>
          </div>
        </div>
      ) : (
        <div
          className="relative w-full h-full"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Image
            src={tweet.image}
            alt="Tweet image"
            width={500}
            height={300}
            className="w-full h-full object-cover rounded-xl"
          />

          {/* Regenerate button - only shows on hover */}
          {isHovering && !isGenerating && (
            <button
              onClick={handleGenerateImage}
              className="absolute bottom-3 right-3 bg-stone-800/50 hover:bg-stone-800/70 rounded-full p-2 transition-all"
              aria-label="Regenerate image"
            >
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
          )}

          {/* Loading indicator if regenerating */}
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-900/30 rounded-xl">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}