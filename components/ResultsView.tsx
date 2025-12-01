import React from 'react';
import { DrivingRangeResult, GolfLocation, Coordinates } from '../types';
import { NavigateIcon, MapPinIcon } from './Icons';
import { MapView } from './MapView';

interface ResultsViewProps {
  data: DrivingRangeResult;
  userLocation: Coordinates | null;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ data, userLocation }) => {
  const { locations, groundingMetadata } = data;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      
      {/* Map Section */}
      <MapView locations={locations} userLocation={userLocation} />

      {/* Ranking Explanation */}
      <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-xs text-green-800 flex items-center justify-center gap-2">
        <span className="font-bold uppercase tracking-wider">Sorting Formula:</span>
        <span>50% Distance + 30% Rating + 20% Price</span>
      </div>

      {/* Locations List */}
      <div className="space-y-4">
        {locations.map((loc, idx) => {
          // Construct a Google Maps search URL as a fallback or primary link
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loc.name} ${loc.address}`)}`;
          
          return (
            <a 
              key={idx}
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-green-400 hover:shadow-md transition-all duration-200 relative overflow-hidden"
            >
              {/* Rank Badge */}
              <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                #{idx + 1}
              </div>

              <div className="flex items-start justify-between pr-8">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-lg text-gray-900 group-hover:text-green-700 transition-colors">
                      {loc.name}
                    </h4>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1 text-yellow-600 font-medium">
                      <span>★</span> {loc.rating}
                    </div>
                    <div className="text-gray-400">•</div>
                    <div className="text-green-700 font-medium">
                      {loc.priceLevel || "$$"}
                    </div>
                    <div className="text-gray-400">•</div>
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
                      {loc.distance || "Unknown dist"}
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-2">
                    {loc.description}
                  </p>
                  
                  <p className="text-xs text-gray-400 mt-2 font-mono">
                    {loc.address}
                  </p>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Footer attribution */}
      {groundingMetadata && (
        <div className="text-center text-xs text-gray-400 py-4 border-t border-gray-100 mt-8">
          <p>Results ranked by Gemini. Location data grounded by Google Maps.</p>
          {groundingMetadata.searchEntryPoint?.renderedContent && (
             <div dangerouslySetInnerHTML={{ __html: groundingMetadata.searchEntryPoint.renderedContent }} />
          )}
        </div>
      )}
    </div>
  );
};