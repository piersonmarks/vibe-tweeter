'use client';

import { TweetSchema } from "@/app/api/schema";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { experimental_useObject as useObject } from '@ai-sdk/react';

type Tweet = z.infer<typeof TweetSchema>;

type TweetWithImage = Partial<Tweet> & {
  id?: string;
  image?: string;
  avatar?: string;
  name?: string;
  username?: string;
  verified?: boolean;
  date?: string;
  isGeneratingImage?: boolean;
}

type Thread = TweetWithImage[] | null;

// Define an array schema for the tweets
const ThreadSchema = z.array(TweetSchema);

interface ThreadContextType {
  thread: Thread;
  isGenerating: boolean;
  generateThread: (prompt: string) => void;
  stopGeneration: () => void;
  updateTweetImage: (tweetId: string, imageUrl: string) => void;
  updateTweetText: (tweetId: string, text: string) => void;
  setTweetImageGenerating: (tweetId: string, generating: boolean) => void;
  regenerateImage: (tweetId: string, tweetText: string) => Promise<void>;
}

export const ThreadContext = createContext<ThreadContextType>({
  thread: null,
  isGenerating: false,
  generateThread: () => { },
  stopGeneration: () => { },
  updateTweetImage: () => { },
  updateTweetText: () => { },
  setTweetImageGenerating: () => { },
  regenerateImage: async () => { },
});

export function useThread() {
  return useContext(ThreadContext);
}

export function ThreadProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [thread, setThread] = useState<Thread>(null);

  // Update tweet text - memoized to avoid recreation
  const updateTweetText = useCallback((tweetId: string, text: string) => {
    if (!tweetId) return;

    console.log(`Updating tweet ${tweetId} with new text`);

    setThread(currentThread => {
      if (!currentThread) return currentThread;

      return currentThread.map(tweet => {
        if (tweet.id === tweetId) {
          return { ...tweet, text };
        }
        return tweet;
      });
    });
  }, []);

  // Update tweet image - memoized to avoid recreation
  const updateTweetImage = useCallback((tweetId: string, imageUrl: string) => {
    if (!tweetId) return;

    console.log(`Updating tweet ${tweetId} with image URL`);

    setThread(currentThread => {
      if (!currentThread) return currentThread;

      return currentThread.map(tweet => {
        if (tweet.id === tweetId) {
          return { ...tweet, image: imageUrl, isGeneratingImage: false };
        }
        return tweet;
      });
    });
  }, []);

  // Set tweet image generating state - memoized to avoid recreation
  const setTweetImageGenerating = useCallback((tweetId: string, generating: boolean) => {
    if (!tweetId) return;

    console.log(`Setting tweet ${tweetId} isGeneratingImage to ${generating}`);

    setThread(currentThread => {
      if (!currentThread) return currentThread;

      return currentThread.map(tweet => {
        if (tweet.id === tweetId) {
          return { ...tweet, isGeneratingImage: generating };
        }
        return tweet;
      });
    });
  }, []);

  // Generate image for a single tweet
  const generateImageForTweet = useCallback(async (tweetId: string, tweetText: string) => {
    if (!tweetId || !tweetText) {
      console.error("Missing tweetId or text for image generation");
      return;
    }

    console.log(`Starting image generation for tweet ${tweetId} with text: ${tweetText.substring(0, 30)}...`);

    // Ensure tweet is marked as generating
    setTweetImageGenerating(tweetId, true);

    try {
      const response = await fetch("/api/v1/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: tweetText }),
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Image API response for tweet ${tweetId}:`, data ? "Data received" : "No data");

      if (data && data.image) {
        console.log(`Successfully generated image for tweet ${tweetId}`);
        // Convert base64 to data URL for images
        const imageUrl = `data:image/png;base64,${data.image}`;
        updateTweetImage(tweetId, imageUrl);
      } else {
        console.error(`No image data returned for tweet ${tweetId}`, data);
        setTweetImageGenerating(tweetId, false);
      }
    } catch (error) {
      console.error(`Error generating image for tweet ${tweetId}:`, error);
      setTweetImageGenerating(tweetId, false);
    }
  }, [setTweetImageGenerating, updateTweetImage]);

  // Function to start generating all images
  const generateAllImages = useCallback(async (tweetsWithIds: TweetWithImage[]) => {
    console.log(`Starting to generate images for ${tweetsWithIds.length} tweets`);

    // Filter for tweets with IDs and text
    const tweetsToGenerate = tweetsWithIds.filter(tweet => tweet.id && tweet.text);
    console.log(`Found ${tweetsToGenerate.length} tweets with text to generate images for`);

    if (tweetsToGenerate.length === 0) {
      console.warn("No tweets with text to generate images for");
      return;
    }

    // Generate all images in parallel
    await Promise.all(
      tweetsToGenerate.map(async (tweet) => {
        if (tweet.id && tweet.text) {
          try {
            await generateImageForTweet(tweet.id, tweet.text);
          } catch (error) {
            console.error(`Failed image generation for tweet ${tweet.id}:`, error);
          }
        }
      })
    );

    console.log("Finished generating all images");
  }, [generateImageForTweet]);

  // Expose a function to regenerate an image
  const regenerateImage = useCallback(async (tweetId: string, tweetText: string) => {
    if (!tweetId || !tweetText) return;
    await generateImageForTweet(tweetId, tweetText);
  }, [generateImageForTweet]);

  const { object, submit, isLoading, stop } = useObject({
    api: '/api/v1/generate-thread',
    schema: ThreadSchema,
    onFinish: async (result) => {
      if (result.object) {
        // Convert to array if it's not already
        const tweets = Array.isArray(result.object)
          ? result.object
          : [result.object as TweetWithImage];

        // Generate IDs for all tweets only on finish
        const tweetsWithIds = tweets.map((tweet, index) => {
          const tweetObj = tweet as TweetWithImage;
          return {
            ...tweetObj,
            id: `tweet_${index}_${Date.now().toString().slice(-4)}`,
            isGeneratingImage: Boolean(tweetObj.text)
          };
        });

        // Update thread with finalized tweets
        setThread(tweetsWithIds);

        console.log(`Thread generation finished with ${tweetsWithIds.length} tweets`);

        // Immediately start generating images for all tweets
        await generateAllImages(tweetsWithIds);
      }
    }
  });

  // Update thread during streaming without IDs
  useEffect(() => {
    if (object && !isLoading) return; // Skip if we're done loading

    if (object) {
      const tweets = Array.isArray(object)
        ? object
        : [object as TweetWithImage];

      // During streaming, display tweets without IDs
      setThread(tweets as TweetWithImage[]);
    }
  }, [object, isLoading]);

  // Reset state when starting a new generation
  useEffect(() => {
    if (isLoading) {
      setThread(null);
    }
  }, [isLoading]);

  const generateThread = (prompt: string) => {
    submit({ prompt });
  };

  return (
    <ThreadContext.Provider
      value={{
        thread,
        isGenerating: isLoading,
        generateThread,
        stopGeneration: stop,
        updateTweetImage,
        updateTweetText,
        setTweetImageGenerating,
        regenerateImage
      }}
    >
      {children}
    </ThreadContext.Provider>
  );
}
