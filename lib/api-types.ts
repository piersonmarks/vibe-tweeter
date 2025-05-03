export interface GenerateImageRequest {
  prompt: string;
  modelId: string;
}

export interface GenerateImageResponse {
  image?: string;
  error?: string;
}
