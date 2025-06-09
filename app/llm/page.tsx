'use client';
import React, { useState } from 'react';

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
  <main className="min-h-screen bg-gradient-to-r from-blue-400 to-red-400 flex flex-col items-center justify-center font-sans space-y-10 py-10">
    <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-3xl space-y-6">
      <div className="flex items-center justify-center gap-3">
        <h1 className="text-4xl font-bold text-gray-800">Ask the LLM</h1>
        <img src="/globe.svg" alt="Globe icon" className="w-8 h-8" />
      </div>

      <p className="text-center text-gray-600 text-sm max-w-xl mx-auto">
        This is a large language model that is using the tweet data to analyse it and identify weak areas of the Twitter team. You can just write your question in the box below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          className="w-full p-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="w-full bg-blue-400 text-white py-3 rounded-xl font-semibold hover:bg-blue-500 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </form>

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
            className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {response && (
        <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-md text-blue-900 shadow-inner">
          {response}
        </div>
      )}
    </div>
  </main>
  );
};

export default LLMPage;
