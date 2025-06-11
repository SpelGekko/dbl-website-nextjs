'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Interface for tweet history entries
interface TweetExchange {
  userTweet: string;
  botReply: string;
  timestamp: string;
  responseTime?: number; // Time taken to generate response in ms
}

const FakeTweetPage = () => {
  const [tweet, setTweet] = useState('');
  const [botReply, setBotReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [tweetHistory, setTweetHistory] = useState<TweetExchange[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showUserTweet, setShowUserTweet] = useState(false);
  const [currentUserTweet, setCurrentUserTweet] = useState('');

  // Load tweet history from localStorage on initial render
  useEffect(() => {
    const savedHistory = localStorage.getItem('tweetHistory');
    if (savedHistory) {
      try {
        setTweetHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse saved tweet history:', e);
      }
    }
  }, []);

  // Save tweet history to localStorage whenever it changes
  useEffect(() => {
    if (tweetHistory.length > 0) {
      localStorage.setItem('tweetHistory', JSON.stringify(tweetHistory));
    }
  }, [tweetHistory]);

  // Live timer update
  useEffect(() => {
    if (loading && startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedTime(0);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loading, startTime]);

  // Reset tweet display if needed
  useEffect(() => {
    if (!loading && !botReply && !currentUserTweet) {
      setShowUserTweet(false);
    }
  }, [loading, botReply, currentUserTweet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweet.trim()) return;
    
    const currentTweet = tweet;
    // Clear the tweet input immediately
    setTweet('');
    
    // Show the user tweet immediately
    setCurrentUserTweet(currentTweet);
    setShowUserTweet(true);
    
    setLoading(true);
    setBotReply('');
    
    // Start timing
    const timeStart = Date.now();
    setStartTime(timeStart);

    try {
      const res = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweet: currentTweet }),
      });

      const data = await res.json();
      setBotReply(data.reply);
      
      // Calculate response time
      const responseTime = Date.now() - timeStart;
      
      // Add to history
      const now = new Date();
      const timestamp = now.toLocaleString();
      
      setTweetHistory(prev => [
        { userTweet: currentTweet, botReply: data.reply, timestamp, responseTime },
        ...prev
      ]);
    } catch (err) {
      setBotReply('Error generating reply.');
      console.error(err);
    } finally {
      setLoading(false);
      setStartTime(null);
    }
  };
  
  const clearHistory = () => {
    setTweetHistory([]);
    localStorage.removeItem('tweetHistory');
  };

  // Format milliseconds to a readable format
  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
  <>
    {/* Top Header - Fixed */}
    <header className="bg-blue-500 text-white py-3 px-6 shadow-md w-full flex items-center justify-between fixed top-0 left-0 z-20">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition shadow-sm"
        >
          ← Home
        </Link>
        <h1 className="text-2xl font-bold">FakeTweet</h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm opacity-80">by American Aviators</span>
        <img
          src="/tweetbird3.svg"
          alt="Twitter Bird"
          className="w-8 h-8"
        />
      </div>
    </header>

    {/* Main Layout with Sidebar - Add top padding to account for fixed header */}
    <main className="min-h-screen bg-gray-100 flex font-sans pt-14">

      {/* Sidebar - Fixed */}
      <aside className="w-64 p-6 space-y-4 border-r border-gray-200 bg-white shadow-sm fixed top-14 left-0 h-[calc(100vh-3.5rem)] overflow-y-auto z-10">
        {[
          'Explore',
          'Notifications',
          'Messages',
          'Bookmarks',
          'Lists',
          'Profile',
          'More',
        ].map((item) => (
          <button
            key={item}
            className="w-full text-left text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition"
          >
            {item}
          </button>
        ))}
        
        {/* Clear History option */}
        {tweetHistory.length > 0 && (
          <button
            onClick={clearHistory}
            className="w-full text-left text-red-600 hover:text-red-800 font-medium px-4 py-2 rounded-md hover:bg-red-50 transition mt-4"
          >
            Clear History
          </button>
        )}
      </aside>

      {/* Main Content - Add left margin to account for fixed sidebar */}
      <section className="flex-1 flex flex-col items-center p-6 ml-64">
        <div className="relative w-full max-w-2xl">

          <div className="bg-white rounded-xl shadow-md p-6 space-y-6 border border-blue-200">

            {/* Page Title & Description */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-black drop-shadow-md">
                The Tweet Response Generator
              </h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto">
                The AI generates the response tweets from American Airlines to other users' tweets that mention them.
              </p>
            </div>

            {/* Subheader */}
            <h1 className="text-xl font-bold text-gray-800 drop-shadow-md">Post your Fake Tweet</h1>

            {/* Tweet Form */}
            <form onSubmit={handleSubmit} className="flex gap-4">
              {/* Avatar */}
              <div>
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  U
                </div>
              </div>

              {/* Textarea and Submit */}
              <div className="flex-1">
                <textarea
                  placeholder="What's happening?"
                  value={tweet}
                  onChange={(e) => setTweet(e.target.value)}
                  rows={4}
                  required
                  disabled={loading}
                  className="w-full text-gray-800 p-3 text-base border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-400">{tweet.length}/280</span>
                    {loading && (
                      <span className="ml-4 text-sm bg-blue-100 text-blue-600 py-1 px-2 rounded-full animate-pulse">
                        Generating... {formatResponseTime(elapsedTime)}
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !tweet.trim()}
                    className={`px-5 py-2 rounded-full font-semibold text-white transition ${
                      loading || !tweet.trim()
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-400 hover:bg-blue-500'
                    }`}
                  >
                    Generate Tweet
                  </button>
                </div>
              </div>
            </form>

            {/* User's Tweet - Shown immediately after submitting */}
            {showUserTweet && (
              <div className="border border-gray-200 rounded-xl mt-6">
                {/* User Tweet */}
                <div className="border-b border-gray-200 p-4">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                      U
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">You</span>
                        <span className="text-gray-500">@user · just now</span>
                      </div>
                      <p className="mt-2 text-gray-900 text-base">{currentUserTweet}</p>
                    </div>
                  </div>
                </div>
                
                {/* Loading or Response */}
                {loading ? (
                  <div className="p-4 bg-gray-50">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                        <img 
                          src="/aa-logo.png" 
                          alt="American Airlines" 
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            // Fallback if image doesn't exist
                            (e.target as HTMLImageElement).src = "https://logo.clearbit.com/aa.com";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">American Airlines</span>
                          <span className="text-gray-500">@AmericanAir</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                          <span className="text-sm text-gray-500 ml-2">
                            Generating response... {formatResponseTime(elapsedTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : botReply ? (
                  <div className="p-4 bg-gray-50">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                        <img 
                          src="/aa-logo.png" 
                          alt="American Airlines" 
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            // Fallback if image doesn't exist
                            (e.target as HTMLImageElement).src = "https://logo.clearbit.com/aa.com";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">American Airlines</span>
                          <span className="text-gray-500">@AmericanAir · just now</span>
                          <span className="text-blue-500 ml-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 2.793V2.5a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5v1.293L8.707 1.5Z"/>
                              <path d="m8 3.293 4.712 4.712A4.5 4.5 0 0 0 8.758 15H3.5A1.5 1.5 0 0 1 2 13.5V9.293l6-6Z"/>
                            </svg>
                          </span>
                        </div>
                        <p className="mt-2 text-gray-900 text-base whitespace-pre-wrap">{botReply}</p>
                        
                        {/* Response Time */}
                        {tweetHistory[0]?.responseTime && (
                          <p className="text-sm text-gray-500 mt-2 font-medium">
                            Response time: {formatResponseTime(tweetHistory[0].responseTime)}
                          </p>
                        )}
                        
                        {/* Tweet Actions */}
                        <div className="flex justify-between mt-4 text-gray-500 max-w-xs">
                          <button className="hover:text-blue-500 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z"/>
                            </svg>
                            <span>12</span>
                          </button>
                          <button className="hover:text-green-500 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z"/>
                            </svg>
                            <span>3</span>
                          </button>
                          <button className="hover:text-red-500 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                              <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                            </svg>
                            <span>21</span>
                          </button>
                          <button className="hover:text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          
          {/* Tweet History */}
          {tweetHistory.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-blue-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Tweet History</h2>
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-600 hover:text-red-800 px-3 py-1 rounded-md hover:bg-red-50 transition flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                  </svg>
                  Clear History
                </button>
              </div>
              
              <div className="space-y-6">
                {tweetHistory.map((exchange, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl hover:shadow-sm transition">
                    {/* User Tweet */}
                    <div className="border-b border-gray-200 p-4">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                          U
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800">You</span>
                            <span className="text-gray-500">@user · {exchange.timestamp}</span>
                          </div>
                          <p className="mt-2 text-gray-900 text-base">{exchange.userTweet}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* AA Response */}
                    <div className="p-4 bg-gray-50">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                          <img 
                            src="/aa-logo.png" 
                            alt="American Airlines"
                            className="w-10 h-10 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://logo.clearbit.com/aa.com";
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800">American Airlines</span>
                            <span className="text-gray-500">@AmericanAir</span>
                          </div>
                          <p className="mt-2 text-gray-900 text-base whitespace-pre-wrap">{exchange.botReply}</p>
                          
                          {/* Response Time */}
                          {exchange.responseTime && (
                            <p className="text-sm text-gray-500 mt-2 font-medium">
                              Response time: {formatResponseTime(exchange.responseTime)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  </>
  );
};

export default FakeTweetPage;