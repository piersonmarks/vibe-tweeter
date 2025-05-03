import { TweetSchema } from "@/app/api/schema";
import { z } from "zod";
import { TweetImage } from "./TweetImage";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useThread } from "@/provider/thread-provider";

type Tweet = z.infer<typeof TweetSchema>;

type TweetWithImage = Partial<Tweet> & {
  image?: string;
  avatar?: string;
  name?: string;
  username?: string;
  verified?: boolean;
  date?: string;
  id?: string;
}

type TweetThreadProps = {
  thread?: TweetWithImage[] | null;
  isLoading: boolean;
}

export function TweetThread({ thread = null, isLoading }: TweetThreadProps) {
  // Convert to array if it's not already
  const tweets = thread ? Array.isArray(thread) ? thread : [thread as TweetWithImage] : [];
  const [editedTexts, setEditedTexts] = useState<{ [key: string]: string }>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const { updateTweetText } = useThread();

  const handleTextChange = (index: number, text: string) => {
    setEditedTexts(prev => ({
      ...prev,
      [index]: text
    }));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    // Initialize the edited text with current text when starting to edit
    if (!editedTexts[index]) {
      const currentText = tweets[index]?.text || '';
      handleTextChange(index, currentText);
    }
  };

  const stopEditing = () => {
    if (editingIndex !== null) {
      const tweet = tweets[editingIndex];
      const editedText = editedTexts[editingIndex];

      // Only update if there's a change and the tweet has an ID
      if (tweet?.id && editedText && editedText !== tweet.text) {
        updateTweetText(tweet.id, editedText);
      }
    }
    setEditingIndex(null);
  };

  return (
    <div>
      {tweets.map((tweet, index) => (
        <div key={tweet.id || index} className="p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-stone-200 rounded-full min-w-6 min-h-6 w-auto h-auto aspect-square flex items-center justify-center text-stone-600 font-bold text-sm px-2">
              {index + 1}
            </div>
            <div className="flex-1 border-l-2 border-stone-200 pl-4">
              <div className="flex items-center">
                <span className="font-bold mr-1">User</span>
                <span className="text-stone-500 ml-1 text-sm">@username</span>
              </div>

              <div
                className="relative"
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                {editingIndex === index ? (
                  <div className="space-y-2">
                    <Textarea
                      className="w-full text-sm"
                      value={editedTexts[index] ?? tweet.text}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                      autoFocus
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={stopEditing}
                        variant="outline"
                        size="sm"
                        className="bg-stone-600 text-white hover:bg-stone-700"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[24px] group relative">
                    <p className="text-sm">{tweet.text || editedTexts[index]}</p>
                    {hoverIndex === index && (
                      <Button
                        className="absolute top-0 right-0 text-xs bg-stone-100 hover:bg-stone-200 text-stone-800"
                        onClick={() => startEditing(index)}
                        variant="ghost"
                        size="sm"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-3 relative">
                <TweetImage tweet={tweet} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}