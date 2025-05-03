export interface GeneratedImage {
  image: string | null;
  startTime: number;
  endTime: number;
  elapsed: number;
  modelId?: string;
}

export interface ImageResult {
  image: string | null;
  modelId?: string;
}

export interface ImageError {
  message: string;
}

export interface ProviderTiming {
  startTime?: number;
  completionTime?: number;
  elapsed?: number;
}
