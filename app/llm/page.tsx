'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const LLMPage = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setResponse(data.answer);
    } catch (err) {
      console.error(err);
      setResponse('Error contacting the LLM API.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetPrompt = async (preset: string) => {
    setQuestion(preset);
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: preset }),
      });
      const data = await res.json();
      setResponse(data.answer);
    } catch (err) {
      console.error(err);
      setResponse('Error contacting the LLM API.');
    } finally {
      setLoading(false);
    }
  };

 return (
  <>
    {/* Header */}
    <header className="bg-[#3E68A3] text-white py-3 px-6 shadow-md w-full flex items-center justify-between font-serif">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="bg-white text-[#3E68A3] px-4 py-2 rounded-lg font-medium hover:bg-[#E0E9F6] transition shadow-sm"
        >
          ← Home
        </Link>
        <h1 className="text-2xl font-bold">LLM Dashboard</h1>
      </div>
      <span className="text-sm text-[#E0E9F6]">by American Aviators</span>
    </header>

    {/* Main */}
    <main className="min-h-screen bg-[#E0E9F6] flex flex-col items-center justify-center font-serif py-12 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-3xl space-y-6 text-[#04080F] border border-[#A1C6EA]">

        {/* Title with Icon */}
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-3xl font-bold drop-shadow">Ask the LLM</h1>
          <img src="/globe.svg" alt="Globe icon" className="w-7 h-7" />
        </div>

        {/* Description */}
        <p className="text-center text-[#606060] text-sm max-w-xl mx-auto">
          This is a large language model that is using tweet data to analyze and identify weak areas of the Twitter team. Just write your question below.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            className="w-full p-4 rounded-xl text-base text-[#04080F] border border-[#A1C6EA] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3E68A3]"
            placeholder="Type your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full bg-[#A1C6EA] text-white py-3 rounded-xl font-semibold hover:bg-[#3E68A3] transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </form>

        {/* Preset Prompts */}
        <div className="flex gap-3 mt-4 justify-center flex-wrap">
          {[
            'What is the average sentiment grade of a tweet mentioning American Air; compare it to Air France?',
            'What is the main concern of American Air customers?',
            'Does American Air respond in a more passive manner or offer helpful recommendations for the customers issues.',
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handlePresetPrompt(prompt)}
              disabled={loading}
              className="bg-[#E0E9F6] text-[#3E68A3] px-4 py-2 rounded-lg hover:bg-[#A1C6EA] transition disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Response Output */}
        {response && (
          <div className="mt-6 bg-[#FFFFFF] border border-[#A1C6EA] p-4 rounded-md text-[#04080F] shadow-inner">
            {response}
          </div>
        )}
      </div>
    </main>
  </>
  );
};

export default LLMPage;
