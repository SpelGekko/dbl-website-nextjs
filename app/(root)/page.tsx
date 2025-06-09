import React from 'react';
import Link from 'next/link';

const HomePage = () => {
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

        <nav className="flex flex-col space-y-4">
          <Link
            href="/llm"
            className="block w-full bg-[#A1C6EA] text-white py-3 rounded-xl text-lg font-semibold hover:bg-[#3E68A3] transition"
          >
            Ask the LLM
          </Link>

          <Link
            href="/xitter"
            className="block w-full bg-[#A1C6EA] text-white py-3 rounded-xl text-lg font-semibold hover:bg-[#3E68A3] transition"
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
