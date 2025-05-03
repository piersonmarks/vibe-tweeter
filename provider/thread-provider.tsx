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

  const { object, submit, isLoading, stop } = useObject({
    api: '/api/v1/generate-thread',
    schema: ThreadSchema,
    onFinish: (result) => {
      if (result.object) {
        // Convert to array if it's not already
        const tweets = Array.isArray(result.object)
          ? result.object
          : [result.object as TweetWithImage];

        // Add a unique ID to each tweet only when generation is complete
        const tweetsWithIds = tweets.map((tweet, index) => ({
          ...tweet,
          id: `tweet_${Date.now()}_${index}`
        }));

        setThread(tweetsWithIds);
      }
    }
  });

  // Update thread during streaming without adding IDs
  useEffect(() => {
    if (object) {
      const tweets = Array.isArray(object)
        ? object
        : [object as TweetWithImage];

      // Just update with the current streaming result, without adding IDs
      setThread(tweets as TweetWithImage[]);
    }
  }, [object]);

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
