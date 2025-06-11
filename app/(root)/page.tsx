'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const HomePage = () => {
  const [apiStatus, setApiStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [lastChecked, setLastChecked] = useState<string>('');

  const checkApiStatus = async () => {
    setApiStatus('loading');
    try {
      const response = await fetch('/api/status', { 
        method: 'GET',
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok' && data.available) {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      console.error('Error checking API status:', error);
      setApiStatus('offline');
    }
    
    // Update last checked time
    const now = new Date();
    setLastChecked(now.toLocaleTimeString());
  };

  useEffect(() => {
    // Check API status on initial load
    checkApiStatus();
    
    // Set up interval to check status every minute
    const intervalId = setInterval(checkApiStatus, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <main className="min-h-screen bg-[#E0E9F6] flex flex-col items-center justify-center font-serif space-y-10 py-12 px-4">
      
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-[#3E68A3] drop-shadow-md text-center">
        Support Twitter Team of American Airlines
      </h1>

      {/* Card */}
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-xl w-full text-center space-y-6 border border-[#A1C6EA]">
        <h2 className="text-sm text-[#606060] uppercase tracking-widest">Welcome to</h2>
        <h3 className="text-3xl md:text-4xl font-bold text-[#04080F]">Tweet Support Bot</h3>
        <p className="text-base text-[#606060]">Choose an action below:</p>

        {/* API Status Indicator - Redesigned */}
        <div className="flex justify-center items-center my-4">
          <div className="flex items-center">
            <div 
              className={`w-4 h-4 rounded-full ${
                apiStatus === 'loading' ? 'bg-yellow-400 animate-pulse' : 
                apiStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="ml-2 text-sm font-medium text-[#04080F]">
              API Status: {apiStatus === 'loading' ? 'Checking...' : apiStatus === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
          <button 
            onClick={checkApiStatus}
            className="ml-2 text-blue-500 hover:text-blue-700"
            title="Refresh status"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {lastChecked && (
          <p className="text-xs text-gray-500 -mt-2">
            Last checked: {lastChecked}
          </p>
        )}

        <nav className="flex flex-col space-y-4 mt-4">
          <Link
            href="/languagemodel"
            className={`block w-full bg-[#A1C6EA] text-white py-3 rounded-xl text-lg font-semibold transition ${
              apiStatus === 'offline' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#3E68A3]'
            }`}
            onClick={(e) => apiStatus === 'offline' && e.preventDefault()}
          >
            Ask the LLM
          </Link>

          <Link
            href="/faketwitter"
            className={`block w-full bg-[#A1C6EA] text-white py-3 rounded-xl text-lg font-semibold transition ${
              apiStatus === 'offline' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#3E68A3]'
            }`}
            onClick={(e) => apiStatus === 'offline' && e.preventDefault()}
          >
            Write a Fake Tweet
          </Link>
        </nav>
      </div>

      {/* Footer Text */}
      <p className="text-[#606060] text-sm italic">by American Aviators</p>
    </main>
  );
};

export default HomePage;