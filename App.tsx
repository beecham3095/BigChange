import React, { useState, useEffect, useCallback } from 'react';
import { AppStatus, Coordinates, DrivingRangeResult } from './types';
import { findNearestDrivingRanges } from './services/geminiService';
import { LoaderIcon, GolfIcon, MapPinIcon, AlertIcon, NavigateIcon } from './components/Icons';
import { ResultsView } from './components/ResultsView';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [data, setData] = useState<DrivingRangeResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const getLocation = useCallback(() => {
    setStatus(AppStatus.REQUESTING_LOCATION);
    setErrorMsg('');

    if (!navigator.geolocation) {
      setStatus(AppStatus.ERROR);
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        fetchData({ latitude, longitude });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setStatus(AppStatus.PERMISSION_DENIED);
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMsg("Location permission is required to find nearby ranges.");
        } else {
          setErrorMsg("Unable to retrieve your location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const fetchData = async (coordinates: Coordinates) => {
    setStatus(AppStatus.LOADING_DATA);
    try {
      const result = await findNearestDrivingRanges(coordinates);
      setData(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      setErrorMsg("Failed to fetch driving range data from Gemini.");
    }
  };

  // Initial trigger
  useEffect(() => {
    // We don't auto-trigger to let user read the landing text.
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-1.5 rounded-lg text-white">
              <GolfIcon className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">Fairway Finder</span>
          </div>
          {status === AppStatus.SUCCESS && (
            <button 
              onClick={getLocation}
              className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors"
            >
              Refresh
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-6">
        <div className="max-w-4xl mx-auto h-full flex flex-col items-center justify-center">
          
          {/* IDLE STATE */}
          {status === AppStatus.IDLE && (
            <div className="text-center max-w-md mt-12 md:mt-24 space-y-6">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPinIcon className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Find Your Perfect <span className="text-green-600">Practice Spot</span>
              </h1>
              <p className="text-gray-600 text-lg">
                Use AI to locate the best driving ranges nearby. We analyze ratings, facilities, and reviews instantly.
              </p>
              <button
                onClick={getLocation}
                className="mt-8 px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-green-700 hover:shadow-green-200/50 hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <NavigateIcon className="w-5 h-5" />
                Find Ranges Near Me
              </button>
            </div>
          )}

          {/* REQUESTING LOCATION / LOADING DATA STATE */}
          {(status === AppStatus.REQUESTING_LOCATION || status === AppStatus.LOADING_DATA) && (
            <div className="text-center mt-24 space-y-4 animate-in fade-in duration-500">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                {status === AppStatus.REQUESTING_LOCATION ? "Acquiring Location..." : "Ranked Search in progress..."}
              </h2>
              <p className="text-gray-500 text-sm">
                {status === AppStatus.REQUESTING_LOCATION ? "Please allow location access." : "Applying formula: 50% Distance • 30% Rating • 20% Price"}
              </p>
            </div>
          )}

          {/* ERROR / PERMISSION DENIED STATE */}
          {(status === AppStatus.ERROR || status === AppStatus.PERMISSION_DENIED) && (
            <div className="text-center mt-24 max-w-sm mx-auto space-y-4">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Oops! Something went wrong</h3>
              <p className="text-gray-600">{errorMsg}</p>
              <button
                onClick={getLocation}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* SUCCESS STATE */}
          {status === AppStatus.SUCCESS && data && (
            <div className="w-full animate-in slide-in-from-bottom-4 duration-500">
              <ResultsView data={data} userLocation={coords} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;