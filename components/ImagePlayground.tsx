"use client";

import { PromptInput } from "@/components/PromptInput";
import { useImageGeneration } from "@/hooks/use-image-generation";
import { ImageDisplay } from "./ImageDisplay";

export function ImagePlayground() {
  const {
    image,
    error,
    timing,
    isLoading,
    startGeneration,
    activePrompt,
  } = useImageGeneration();

  const handlePromptSubmit = (newPrompt: string) => {
    startGeneration(newPrompt);
  };

  return (
    <div>
      <PromptInput
        onSubmit={handlePromptSubmit}
        isLoading={isLoading}
      />
      {
        image || error || timing.startTime ? (
          <div className="mt-8">
            <ImageDisplay
              image={image?.image}
              failed={!!error}
              timing={timing}
            />
            {activePrompt && (
              <div className="text-center mt-4 text-muted-foreground">
                {activePrompt}
              </div>
            )}
          </div>
        ) : null
      }
    </div>
  );
}
