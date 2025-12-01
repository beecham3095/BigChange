import { GoogleGenAI } from "@google/genai";
import { Coordinates, DrivingRangeResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const findNearestDrivingRanges = async (coords: Coordinates): Promise<DrivingRangeResult> => {
  try {
    // We use gemini-2.5-flash as recommended for general tasks and efficiency.
    // We use the googleMaps tool to ground the response in real-world location data.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Find the nearest top-rated golf driving ranges to my location. List at least 3 if possible. For each, give me the name, a very brief description of facilities (like if they have Toptracer, heated bays, etc), and the rating.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: coords.latitude,
              longitude: coords.longitude
            }
          }
        }
      }
    });

    const text = response.text || "No details found.";
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as any; // Cast to any to map to our internal simplified type if needed, but the structure matches largely.

    return {
      text,
      groundingMetadata
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};