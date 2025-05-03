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
}

export const ThreadContext = createContext<ThreadContextType>({
  thread: null,
  isGenerating: false,
  generateThread: () => { },
  stopGeneration: () => { },
  updateTweetImage: () => { },
});

export function useThread() {
  return useContext(ThreadContext);
}

export function ThreadProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [thread, setThread] = useState<Thread>(null);
  // Store IDs for consistent mapping
  const [tweetIdMap, setTweetIdMap] = useState<Map<string, string>>(new Map());

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

        setThread(tweetsWithIds);
      }
    }
  });

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
          id: tweetObj.id || getOrCreateTweetId(tweetObj, index)
        };
      });

      setThread(tweetsWithIds as TweetWithImage[]);
    }
  }, [object]);

  // Reset ID map when starting a new generation
  useEffect(() => {
    if (isLoading) {
      setTweetIdMap(new Map());
    }
  }, [isLoading]);

  const generateThread = (prompt: string) => {
    submit({ prompt });
  };

  const updateTweetImage = (tweetId: string, imageUrl: string) => {
    if (!thread) return;

    setThread(currentThread => {
      if (!currentThread) return currentThread;

      return currentThread.map(tweet => {
        if (tweet.id === tweetId) {
          return { ...tweet, image: imageUrl };
        }
        return tweet;
      });
    });
  };

  return (
    <ThreadContext.Provider
      value={{
        thread,
        isGenerating: isLoading,
        generateThread,
        stopGeneration: stop,
        updateTweetImage
      }}
    >
      {children}
    </ThreadContext.Provider>
  );
}
