import { Header } from "@/components/Header";
import { ImagePlayground } from "@/components/ImagePlayground";


export default function Page() {
  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Header />
        <ImagePlayground />
      </div>
    </div>
  );
}
