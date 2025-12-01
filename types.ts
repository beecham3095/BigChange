export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Minimal types for the Grounding Metadata we expect from Gemini
export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: {
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content?: string;
      }[];
    };
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  searchEntryPoint?: {
    renderedContent?: string;
  };
}

export interface DrivingRangeResult {
  text: string;
  groundingMetadata?: GroundingMetadata;
}

export enum AppStatus {
  IDLE = 'IDLE',
  REQUESTING_LOCATION = 'REQUESTING_LOCATION',
  LOADING_DATA = 'LOADING_DATA',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}