import React from 'react';
import Link from 'next/link';

const HomePage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 to-red-500 flex flex-col items-center justify-center font-sans space-y-10 py-10">
      
      {/* External Title */}
      <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
      Support Twitter team of American Airlines
      </h1>

      {/* Card Block */}
      <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-xl w-full text-center space-y-6">
        <h2 className="text-sm text-gray-500 uppercase tracking-widest">Welcome to</h2>
        <h3 className="text-4xl font-bold text-gray-800">Tweet Support Bot</h3>
        <p className="text-lg text-gray-600">Choose an action below:</p>

        <nav className="flex flex-col space-y-4">
          <Link
            href="/llm"
            className="block w-full bg-blue-400 text-white py-4 rounded-xl text-lg font-semibold hover:bg-blue-500 transition"
          >
            Ask the LLM
          </Link>

          <Link
            href="/xitter"
            className="block w-full bg-blue-400 text-white py-4 rounded-xl text-lg font-semibold hover:bg-blue-500 transition"
          >
            Write a Fake Tweet
          </Link>
        </nav>
      </div>

    {/* Subtitle below the card */}
    <p className="text-white text-sm italic mt-4">by American Aviators</p>
    </main>
  );
};

export default HomePage;
