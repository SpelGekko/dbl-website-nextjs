import React from 'react';
import Link from 'next/link';

const HomePage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-300 to-blue-50 flex flex-col items-center justify-center p-8 font-serif">
      <h1 className="text-6xl font-bold text-gray-900 mb-2 text-center">OPTIONS</h1>
      <p className="text-xl text-cyan-900 mb-8 text-center">Choose an action below:</p>
      <nav className="flex flex-col gap-8 w-full max-w-xl">
        <Link
          href="/llm"
          className="block text-center bg-cyan-600 text-cyan-800 no-underline p-4 rounded-xl text-xl font-semibold transition-colors duration-300 hover:bg-gray-600"
        >
          Ask the LLM
        </Link>
        <Link
          href="/xitter"
          className="block text-center bg-cyan-600 text-cyan-800 no-underline p-4 rounded-xl text-xl font-semibold transition-colors duration-300 hover:bg-gray-600"
        >
          Write a Fake Tweet
        </Link>
      </nav>
    </main>
  );
};

export default HomePage;
