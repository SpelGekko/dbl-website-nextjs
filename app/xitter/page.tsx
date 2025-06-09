'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const FakeTweetPage = () => {
  const [tweet, setTweet] = useState('');
  const [botReply, setBotReply] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBotReply('');

    try {
      const res = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweet }),
      });

      const data = await res.json();
      setBotReply(data.reply);
    } catch (err) {
      setBotReply('Error generating reply.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

 return (
  <>
    {/* Top Header */}
    <header className="bg-blue-500 text-white py-3 px-6 shadow-md w-full flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition shadow-sm"
        >
          ← Home
        </Link>
        <h1 className="text-2xl font-bold">FakeTweet</h1>
      </div>
      <span className="text-sm opacity-80">by American Aviators</span>
    </header>

    {/* Main Layout with Sidebar */}
    <main className="min-h-screen bg-gray-100 flex font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 p-6 space-y-4 border-r border-gray-200 bg-white shadow-sm">
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
      </aside>

      {/* Main Content */}
      <section className="flex-1 flex justify-center items-center p-6">
        <div className="bg-white w-full max-w-2xl rounded-xl shadow-md p-6 space-y-6">

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
                <span className="text-sm text-gray-400">{tweet.length}/280</span>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2 rounded-full font-semibold text-white transition ${
                    loading
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-400 hover:bg-blue-500'
                  }`}
                >
                  {loading ? 'Generating...' : 'Generate Tweet'}
                </button>
              </div>
            </div>
          </form>

          {/* Bot Reply */}
          {botReply && (
            <div className="bg-gray-50 border border-gray-300 p-4 rounded-xl mt-4 text-gray-800">
              <h2 className="font-semibold mb-2">Bot's Response:</h2>
              <p className="whitespace-pre-wrap">{botReply}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  </>
  );

};

export default FakeTweetPage;
