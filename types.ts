export enum JobStatus {
  IDLE = 'IDLE',
  QUEUED = 'QUEUED',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface ImageJob {
  id: string;
  prompt: string;
  status: JobStatus;
  imageUrl?: string;
  error?: string;
  createdAt: number;
}

export interface GenerationSettings {
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  // Although Flash Image is fast, we process sequentially to avoid rate limits
  concurrency: number; 
}
