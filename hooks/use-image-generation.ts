import { useState } from "react";
import { ImageError, ImageResult, ProviderTiming } from "@/lib/image-types";


interface UseImageGenerationReturn {
  image: ImageResult | null;
  error: ImageError | null;
  timing: ProviderTiming;
  isLoading: boolean;
  startGeneration: (
    prompt: string,
  ) => Promise<void>;
  resetState: () => void;
  activePrompt: string;
}

export function useImageGeneration(): UseImageGenerationReturn {
  const [image, setImage] = useState<ImageResult | null>(null);
  const [error, setError] = useState<ImageError | null>(null);
  const [timing, setTiming] = useState<ProviderTiming>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activePrompt, setActivePrompt] = useState("");

  const resetState = () => {
    setImage(null);
    setError(null);
    setTiming({});
    setIsLoading(false);
  };

  const startGeneration = async (prompt: string) => {
    setActivePrompt(prompt);
    try {
      setIsLoading(true);
      // Initialize with null value
      setImage(null);
      setError(null);

      // Initialize timing with start time
      const startTime = Date.now();
      setTiming({ startTime });

      console.log(`Generate image request`);

      try {
        const request = {
          prompt,
        };

        const response = await fetch("/api/v1/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `Server error: ${response.status}`);
        }

        const completionTime = Date.now();
        const elapsed = completionTime - startTime;
        setTiming({
          startTime,
          completionTime,
          elapsed,
        });

        console.log(
          `Successful image response [elapsed=${elapsed}ms]`,
        );

        // Update image in state
        setImage({
          image: data.image ?? null,
        });
      } catch (err) {
        console.error(`Error:`, err);
        setError({
          message: err instanceof Error ? err.message : "An unexpected error occurred",
        });
        setImage(null);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    image,
    error,
    timing,
    isLoading,
    startGeneration,
    resetState,
    activePrompt,
  };
}
