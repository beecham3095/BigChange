import { GoogleGenAI } from "@google/genai";
import { Coordinates, DrivingRangeResult, GolfLocation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const findNearestDrivingRanges = async (coords: Coordinates): Promise<DrivingRangeResult> => {
  try {
    // We use gemini-2.5-flash for speed and tool capability.
    // NOTE: When using googleMaps tool, we CANNOT use responseMimeType: "application/json".
    // We must ask for JSON in the prompt and parse the text response.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find the 5 nearest and best golf driving ranges to my current location.
      
      CRITICAL: You must RANK these results using the following weighted formula:
      1. Proximity (Distance) - Highest Priority
      2. Rating (Quality) - Medium Priority
      3. Price (Affordability) - Low Priority
      
      You must Output the result as a raw JSON array of objects. Do not use Markdown code blocks.
      Each object must match this structure exactly:
      {
        "name": "string",
        "latitude": number,
        "longitude": number,
        "rating": number,
        "priceLevel": "string ($ to $$$)",
        "address": "string",
        "description": "string",
        "distance": "string"
      }`,
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

    let jsonString = response.text || "[]";
    
    // Clean up potential markdown formatting if the model ignores the "raw JSON" instruction
    if (jsonString.includes("```")) {
      jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "");
    }
    
    // Extract the array part if there is conversational text around it
    const firstBracket = jsonString.indexOf('[');
    const lastBracket = jsonString.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      jsonString = jsonString.substring(firstBracket, lastBracket + 1);
    }

    let locations: GolfLocation[] = [];
    try {
      locations = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini response:", jsonString);
      locations = [];
    }

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as any;

    return {
      locations,
      groundingMetadata
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};