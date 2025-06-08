'use client';
import React, { useState } from 'react';

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

      if (!res.ok) {
        throw new Error('API error');
      }

      const data = await res.json();
      setBotReply(data.reply);
    } catch (error) {
      setBotReply('Error generating reply.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-8 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-xl box-border">
        <h1 className="text-center text-gray-800 mb-6 text-2xl font-semibold">
          Write a Fake Tweet
        </h1>
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Type your fake tweet here..."
            value={tweet}
            onChange={(e) => setTweet(e.target.value)}
            rows={4}
            required
            disabled={loading}
            className="w-full min-h-[120px] p-4 text-base rounded-lg border text-indigo-300 border-gray-300 resize-y font-inherit
                       focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-300 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className={`mt-4 w-full py-3 rounded-lg font-semibold text-white
                       ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-800 cursor-pointer'}
                       transition-colors`}
          >
            {loading ? 'Generating...' : 'Generate Response'}
          </button>
        </form>

        {botReply && (
          <div className="mt-6 bg-blue-100 border border-blue-400 rounded-lg p-4 text-blue-900 whitespace-pre-wrap text-base leading-relaxed">
            <h2 className="font-semibold mb-2">Bot's Response:</h2>
            <p>{botReply}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FakeTweetPage;
