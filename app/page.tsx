import { Header } from "@/components/Header";
import { ImagePlayground } from "@/components/ImagePlayground";
import { ThreadProvider } from "@/provider/thread-provider";
import { generateSuggestions } from "./actions/generate-suggestions";

export default async function Page() {

  const suggestions = await generateSuggestions()

  console.log(suggestions)

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Header />
        <ThreadProvider>
          <ImagePlayground suggestions={suggestions} />
        </ThreadProvider>
      </div>
    </div>
  );
}
