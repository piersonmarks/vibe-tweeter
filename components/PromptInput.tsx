import { useState } from "react";
import { ArrowUpRight, ArrowUp, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { SuggestionSchema } from "@/app/api/schema";
import { z } from "zod";
import { mutate } from "swr";
import { Button } from "./ui/button";

type Suggestion = z.infer<typeof SuggestionSchema>;

interface PromptInputProps {
  suggestions: Suggestion[];
  onSubmit: (prompt: string) => boolean | void;
  isLoading?: boolean;
}

export function PromptInput({
  suggestions,
  isLoading,
  onSubmit,
}: PromptInputProps) {
  const [input, setInput] = useState("");

  const handleSuggestionSelect = (prompt: string) => {
    const shouldReset = onSubmit(prompt.trim());
    if (shouldReset) {
      setInput("");
    }
  };

  const handleSubmit = () => {
    if (!isLoading && input.trim()) {
      const shouldReset = onSubmit(input.trim());
      if (shouldReset) {
        setInput("");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        const shouldReset = onSubmit(input.trim());
        if (shouldReset) {
          setInput("");
        }
      }
    }
  };

  return (
    <div className="w-full mb-8">
      <div className="bg-stone-50 rounded-2xl p-4 shadow-sm border border-stone-200">
        <div className="flex flex-col gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your prompt here"
            rows={3}
            className="text-base bg-transparent border-none p-0 resize-none placeholder:text-zinc-500 text-[#111111] focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <div className="flex items-center justify-between pt-1">
            <div className="flex-1 overflow-x-auto pr-2 no-scrollbar">
              <div className="flex items-center space-x-2">
                {suggestions.map((suggestion: Suggestion, index: number) => (
                  <Button
                    key={index}
                    onClick={() => handleSuggestionSelect(suggestion.prompt)}
                    className={cn(
                      "flex shadow-none items-center justify-center rounded-full py-1 bg-stone-300 text-sm hover:bg-stone-400 group transition-colors duration-200 text-center",
                    )}
                  >
                    <span className="max-w-[150px] overflow-hidden flex items-center">
                      <span className="text-stone-800 text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis inline-block truncate">
                        {suggestion.text.toLowerCase()}
                      </span>
                    </span>
                    <ArrowUpRight className="ml-1 h-2 w-2 sm:h-3 sm:w-3 text-stone-800 group-hover:text-stone-800" />
                  </Button>
                ))}
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="h-8 w-8 rounded-full bg-stone-800 flex items-center justify-center disabled:opacity-50 flex-shrink-0 ml-2"
            >
              {isLoading ? (
                <Spinner className="w-3 h-3 text-white" />
              ) : (
                <ArrowUp className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
