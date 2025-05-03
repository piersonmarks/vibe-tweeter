"use client";

import { PromptInput } from "@/components/PromptInput";
import { useThread } from "@/provider/thread-provider";
import { useState } from "react";
import { TweetThread } from "./TweetThread";

type Suggestion = {
  text: string;
  prompt: string;
}

export function ImagePlayground({ suggestions }: { suggestions: Suggestion[] }) {
  const [currentPrompt, setCurrentPrompt] = useState<string>("");

  const { thread, isGenerating, generateThread } = useThread();

  const handlePromptSubmit = (newPrompt: string) => {
    setCurrentPrompt(newPrompt);
    // startGeneration(newPrompt);
    generateThread(newPrompt);
    // Reset the input in the PromptInput component
    return true; // This will signal PromptInput to reset
  }

  return (
    <div>
      <PromptInput
        suggestions={suggestions}
        onSubmit={handlePromptSubmit}
        isLoading={isGenerating}
      />
      <div className="w-full max-w-xl mx-auto space-y-2">
        {currentPrompt && (
          <div>
            <p className="font-medium">Prompt</p>
            <p className="text-sm text-stone-500">{currentPrompt}</p>
          </div>
        )}
        <TweetThread thread={thread} isLoading={isGenerating} />
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
