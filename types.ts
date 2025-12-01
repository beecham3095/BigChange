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

export interface GolfLocation {
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount?: number;
  priceLevel: string; // e.g. "$", "$$", "$$$"
  address: string;
  description: string;
  distance: string; // e.g. "2.5 miles"
}

export interface DrivingRangeResult {
  locations: GolfLocation[];
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