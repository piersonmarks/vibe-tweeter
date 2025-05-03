"use client";

import { PromptInput } from "@/components/PromptInput";
import { useImageGeneration } from "@/hooks/use-image-generation";
import { ImageDisplay } from "./ImageDisplay";
import { TweetSchema } from "@/app/api/schema";
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { TweetThread } from "./TweetThread";
import { useState } from "react";

export function ImagePlayground() {
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const {
    image,
    error,
    timing,
    isLoading,
    startGeneration,
    activePrompt,
    resetState,
  } = useImageGeneration();

  const { object, submit, isLoading: isGeneratingThread, stop } = useObject({
    api: '/api/v1/generate-thread',
    schema: TweetSchema,
  });

  const handlePromptSubmit = (newPrompt: string) => {
    setCurrentPrompt(newPrompt);
    // startGeneration(newPrompt);
    submit({ prompt: newPrompt });
    // Reset the input in the PromptInput component
    return true; // This will signal PromptInput to reset
  }

  return (
    <div>
      <PromptInput
        onSubmit={handlePromptSubmit}
        isLoading={isLoading || isGeneratingThread}
      />
      <div className="w-full max-w-xl mx-auto space-y-2">
        {currentPrompt && (
          <div>
            <p className="font-medium">Prompt</p>
            <p className="text-sm text-stone-500">{currentPrompt}</p>
          </div>
        )}
        <TweetThread object={object} isLoading={isGeneratingThread} />
      </div>
      {/* {
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
      } */}
    </div>
  );
}
