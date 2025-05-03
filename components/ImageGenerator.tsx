import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageDisplay } from "./ImageDisplay";
import { ImageError, ImageResult, ProviderTiming } from "@/lib/image-types";

interface ImageGeneratorProps {
  image: ImageResult | null;
  error: ImageError | null;
  timing: ProviderTiming;
  toggleView: () => void;
}

export function ImageGenerator({
  image,
  error,
  timing,
  toggleView,
}: ImageGeneratorProps) {
  return (
    <div className="space-y-6">
      {/* If there is an error, render an alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-3">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="mt-1 text-sm">
              {error.message}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Generated Image</h3>
        <Button
          variant="outline"
          className=""
          onClick={() => toggleView()}
          size="icon"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Image display */}
      <div className="w-full max-w-2xl mx-auto">
        <ImageDisplay
          image={image?.image}
          timing={timing}
          failed={!!error}
        />
      </div>
    </div>
  );
}
