import { TweetSchema } from "@/app/api/schema";
import { z } from "zod";
import Image from "next/image";

type Tweet = z.infer<typeof TweetSchema>;

type TweetWithImage = Partial<Tweet> & {
  image?: string;
}

export function TweetImage({ tweet }: { tweet: TweetWithImage }) {
  return (
    <div className="rounded-xl border border-stone-200 w-[500px] h-[300px]">
      {!tweet.image ? (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-stone-500">No image</p>
        </div>
      ) : (
        <Image
          src={tweet.image}
          alt="Tweet image"
          width={500}
          height={300}
          className="w-full h-full object-cover rounded-xl"
        />
      )}
    </div>
  );
}