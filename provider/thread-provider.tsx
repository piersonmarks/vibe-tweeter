'use client';

import { TweetSchema } from "@/app/api/schema";
import React, { createContext, useContext, useState, useEffect } from "react";
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
  setTweetImageGenerating: (tweetId: string, generating: boolean) => void;
}

export const ThreadContext = createContext<ThreadContextType>({
  thread: null,
  isGenerating: false,
  generateThread: () => { },
  stopGeneration: () => { },
  updateTweetImage: () => { },
  setTweetImageGenerating: () => { },
});

export function useThread() {
  return useContext(ThreadContext);
}

export function ThreadProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [thread, setThread] = useState<Thread>(null);
  // Store IDs for consistent mapping
  const [tweetIdMap, setTweetIdMap] = useState<Map<string, string>>(new Map());
  // Track pending image generations
  const [pendingImageGenerations, setPendingImageGenerations] = useState<Set<string>>(new Set());

  const { object, submit, isLoading, stop } = useObject({
    api: '/api/v1/generate-thread',
    schema: ThreadSchema,
    onFinish: (result) => {
      if (result.object) {
        // Convert to array if it's not already
        const tweets = Array.isArray(result.object)
          ? result.object
          : [result.object as TweetWithImage];

        // Final tweets should use the same IDs as during streaming
        const tweetsWithIds = tweets.map((tweet, index) => {
          const tweetObj = tweet as TweetWithImage;
          // Use existing ID if available
          if (tweetObj.id) {
            return tweetObj;
          }
          return {
            ...tweetObj,
            id: tweetObj.id || getOrCreateTweetId(tweetObj, index)
          };
        });

        // Set all tweets to generating image state
        const tweetsWithGeneratingState = tweetsWithIds.map(tweet => {
          if (tweet.id && tweet.text) {
            return { ...tweet, isGeneratingImage: true };
          }
          return tweet;
        });

        // Update thread with initial generating states
        setThread(tweetsWithGeneratingState);

        // Track which tweets need image generation
        const newPendingIds = new Set<string>();
        tweetsWithIds.forEach(tweet => {
          if (tweet.id && tweet.text) {
            newPendingIds.add(tweet.id);
          }
        });

        // Update pending generations state
        setPendingImageGenerations(newPendingIds);

        // Log the start of image generation
        console.log(`Starting image generation for ${newPendingIds.size} tweets`);
      }
    }
  });

  // Effect to handle image generation when pending state changes
  useEffect(() => {
    const generateImages = async () => {
      if (pendingImageGenerations.size === 0 || !thread) return;

      console.log(`Processing ${pendingImageGenerations.size} pending image generations`);

      // Create an array of tweetIds that need generation
      const pendingIds = Array.from(pendingImageGenerations);

      // Generate images in parallel
      await Promise.all(
        pendingIds.map(async (tweetId) => {
          // Find the tweet text
          const tweetToProcess = thread.find(t => t.id === tweetId);
          if (!tweetToProcess?.text) {
            console.error(`Cannot generate image for tweet ${tweetId}: missing text`);
            // Remove from pending list
            setPendingImageGenerations(prev => {
              const updated = new Set(prev);
              updated.delete(tweetId);
              return updated;
            });
            return;
          }

          try {
            await generateImageForTweet(tweetId, tweetToProcess.text);
          } catch (error) {
            console.error(`Failed image generation for tweet ${tweetId}:`, error);
          } finally {
            // Remove from pending list
            setPendingImageGenerations(prev => {
              const updated = new Set(prev);
              updated.delete(tweetId);
              return updated;
            });
          }
        })
      );
    };

    generateImages();
  }, [pendingImageGenerations, thread]);

  // Generate a stable ID for each tweet based on content and position
  const getOrCreateTweetId = (tweet: TweetWithImage, index: number) => {
    // Create a content hash for the tweet (using text as the key)
    const contentKey = `${tweet.text || ''}:${index}`;

    // Check if we already have an ID for this content
    if (tweetIdMap.has(contentKey)) {
      return tweetIdMap.get(contentKey)!;
    }

    // Create a new ID if none exists
    const newId = `tweet_${index}_${Date.now().toString().slice(-4)}`;

    // Store for future reference
    setTweetIdMap(prevMap => {
      const newMap = new Map(prevMap);
      newMap.set(contentKey, newId);
      return newMap;
    });

    return newId;
  };

  // Update thread during streaming
  useEffect(() => {
    if (object && !isLoading) return; // Skip if we're done loading

    if (object) {
      const tweets = Array.isArray(object)
        ? object
        : [object as TweetWithImage];

      // Add stable IDs to tweets during streaming
      const tweetsWithIds = tweets.map((tweet, index) => {
        const tweetObj = tweet as TweetWithImage;
        // Use existing ID if available, otherwise generate a stable one
        return {
          ...tweetObj,
          id: tweetObj.id || getOrCreateTweetId(tweetObj, index),
          // During streaming, don't set isGeneratingImage yet
          isGeneratingImage: false
        };
      });

      setThread(tweetsWithIds as TweetWithImage[]);
    }
  }, [object]);

  // Reset ID map when starting a new generation
  useEffect(() => {
    if (isLoading) {
      setTweetIdMap(new Map());
      setPendingImageGenerations(new Set());
      // Clear the thread when starting a new generation
      setThread(null);
    }
  }, [isLoading]);

  const generateThread = (prompt: string) => {
    submit({ prompt });
  };

  const updateTweetImage = (tweetId: string, imageUrl: string) => {
    if (!thread) return;

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
  };

  const setTweetImageGenerating = (tweetId: string, generating: boolean) => {
    if (!thread) return;

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
  };

  const generateImageForTweet = async (tweetId: string, tweetText: string) => {
    console.log(`Starting image generation for tweet ${tweetId}`);

    try {
      const response = await fetch("/api/v1/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: tweetText }),
      });

      const data = await response.json();

      if (data.image) {
        console.log(`Successfully generated image for tweet ${tweetId}`);
        // Convert base64 to data URL for images
        const imageUrl = `data:image/png;base64,${data.image}`;
        updateTweetImage(tweetId, imageUrl);
      } else {
        console.log(`No image data returned for tweet ${tweetId}`);
        // If no image was returned, clear the generating state
        setTweetImageGenerating(tweetId, false);
      }
    } catch (error) {
      console.error(`Error generating image for tweet ${tweetId}:`, error);
      // Clear the generating state on error
      setTweetImageGenerating(tweetId, false);
    }
  };

  return (
    <ThreadContext.Provider
      value={{
        thread,
        isGenerating: isLoading,
        generateThread,
        stopGeneration: stop,
        updateTweetImage,
        setTweetImageGenerating
      }}
    >
      {children}
    </ThreadContext.Provider>
  );
}
