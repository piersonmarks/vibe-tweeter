import { TweetSchema } from "@/app/api/schema";
import { z } from "zod";
import { TweetImage } from "./TweetImage";

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

  return (
    <div>
      {tweets.map((tweet, index) => (
        <div key={tweet.id || index} className="p-4 ">
          <div className="flex items-start space-x-3">
            <div className="bg-stone-200 rounded-full min-w-6 min-h-6 w-auto h-auto aspect-square flex items-center justify-center text-white font-bold text-sm px-2">
              {index + 1}
            </div>
            <div className="flex-1 border-l-2 border-stone-200 pl-4">
              <div className="flex items-center">
                <span className="font-bold mr-1">User</span>
                <span className="text-stone-500 ml-1 text-sm">@username</span>
              </div>
              <p className="text-sm">{tweet.text}</p>
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