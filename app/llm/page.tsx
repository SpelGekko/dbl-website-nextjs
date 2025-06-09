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
    <div className="min-h-screen bg-blue-400 flex items-center justify-center p-8 font-sans">
      <div className="bg-white p-12 rounded-2xl shadow-lg w-full max-w-3xl">
        <h1 className="text-3xl font-semibold text-indigo-300 mb-6 text-center">Ask the LLM</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-full p-3 border text-black-300 border-gray-100 rounded-md text-base mb-4 focus:outline-indigo-300"
            placeholder="Type your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full bg-indigo-300 text-white p-3 rounded-md font-semibold text-base cursor-pointer transition-colors duration-300 hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </form>

        <div className="flex gap-4 mt-4 justify-center flex-wrap">
          {['What is the average sentiment grade of a tweet mentioning American Air; compare it to Air France?', 'What is the main concern of American Air customers?', 'Does American Air respond in a more passive manner or offer helpful recommendations for the customers issues.'].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handlePresetPrompt(prompt)}
              disabled={loading}
              className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-md hover:bg-indigo-200 transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {response && (
          <div className="mt-6 bg-indigo-100 border border-indigo-200 p-4 rounded-md text-indigo-900">
            {response}
          </div>
        )}
      </div>
    </div>
  );
};

export default LLMPage;
