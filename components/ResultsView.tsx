import React from 'react';
import ReactMarkdown from 'react-markdown';
import { DrivingRangeResult, GroundingChunk } from '../types';
import { NavigateIcon, MapPinIcon } from './Icons';

interface ResultsViewProps {
  data: DrivingRangeResult;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ data }) => {
  const { text, groundingMetadata } = data;
  const chunks = groundingMetadata?.groundingChunks || [];

  // Filter out chunks that are map locations to display as cards/buttons
  const mapLocations = chunks.filter(c => c.maps?.uri);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      
      {/* AI Summary Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-4">Gemini Analysis</h2>
        <div className="prose prose-green prose-p:text-gray-600 prose-headings:text-gray-800 max-w-none">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      </div>

      {/* Locations Cards Section */}
      {mapLocations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 px-1 flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-green-600" />
            Detected Locations
          </h3>
          <div className="grid gap-4 sm:grid-cols-1">
            {mapLocations.map((chunk: GroundingChunk, idx) => {
              if (!chunk.maps) return null;
              
              const title = chunk.maps.title || "Unknown Location";
              const uri = chunk.maps.uri;
              const reviewSnippet = chunk.maps.placeAnswerSources?.reviewSnippets?.[0]?.content;

              return (
                <a 
                  key={idx}
                  href={uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-green-400 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                        {title}
                      </h4>
                      {reviewSnippet && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2 italic">
                          "{reviewSnippet}"
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0 bg-green-50 p-2 rounded-full group-hover:bg-green-100 text-green-600 transition-colors">
                      <NavigateIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-medium text-green-600">
                    Open in Google Maps &rarr;
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer attribution */}
      <div className="text-center text-xs text-gray-400 py-4">
        Results provided by Gemini with Google Maps Grounding
      </div>
    </div>
  );
};