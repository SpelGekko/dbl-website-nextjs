'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { pollAnalysisRequest } from '../utils/pollingUtils';

const LLMPage = () => {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'assistant', content: string, responseTime?: number}[]>([]);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [streamedResponse, setStreamedResponse] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cancelPollingRef = useRef<(() => void) | null>(null);

  // Load chat history from localStorage on initial render
  useEffect(() => {
    const savedHistory = localStorage.getItem('americanAirChatHistory');
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse saved chat history:', e);
      }
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('americanAirChatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Auto-scroll to the bottom of chat when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);
  
  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (cancelPollingRef.current) {
        cancelPollingRef.current();
      }
    };
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    if (loading && startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100); // Update every 100ms for smoother display
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', content: question }]);
    
    // Clear the input immediately
    setQuestion('');
    
    setLoading(true);
    setStreamedResponse(null);
    const currentQuestion = question;

    // Start timing
    const timeStart = Date.now();
    setStartTime(timeStart);

    // Clean up any existing polling
    if (cancelPollingRef.current) {
      cancelPollingRef.current();
      cancelPollingRef.current = null;
    }    // Use the polling utility
    cancelPollingRef.current = pollAnalysisRequest(
      currentQuestion,
      { 
        top_k: 5,
        maxPollingTime: 2 * 60 * 1000 // 2 minutes max waiting time
      },
      {
        onPoll: (attempt, elapsedTime) => {
          console.log(`Polling attempt ${attempt}, elapsed: ${Math.round(elapsedTime/1000)}s`);
          // Update the elapsed time in the UI
          setElapsedTime(elapsedTime);
        },
        
        onFinal: (data) => {
          // Got the final response
          const responseTime = Date.now() - timeStart;
          
          // Add assistant response to chat with timing info
          setChatHistory(prev => [...prev, { 
            role: 'assistant', 
            content: data.response || "No response received",
            responseTime 
          }]);
          
          setLoading(false);
          setStartTime(null);
          setStreamedResponse(null);
          cancelPollingRef.current = null;
        },
        
        onError: (error) => {
          console.error("Error:", error);
          setChatHistory(prev => [...prev, { 
            role: 'assistant', 
            content: 'Error receiving the response.',
            responseTime: Date.now() - timeStart
          }]);
          
          setLoading(false);
          setStartTime(null);
          setStreamedResponse(null);
          cancelPollingRef.current = null;
        },
        
        onTimeout: () => {
          console.error("Request timed out");
          setChatHistory(prev => [...prev, { 
            role: 'assistant', 
            content: 'Sorry, the request timed out. Please try again with a shorter query.',
            responseTime: Date.now() - timeStart
          }]);
          
          setLoading(false);
          setStartTime(null);
          setStreamedResponse(null);
          cancelPollingRef.current = null;
        }
      }
    );
  };

  const handlePresetPrompt = async (preset: string) => {
    // Add preset to chat
    setChatHistory(prev => [...prev, { role: 'user', content: preset }]);
    
    setLoading(true);
    setStreamedResponse(null);
    
    // Start timing
    const timeStart = Date.now();
    setStartTime(timeStart);

    // Clean up any existing polling
    if (cancelPollingRef.current) {
      cancelPollingRef.current();
      cancelPollingRef.current = null;
    }    // Use the polling utility
    cancelPollingRef.current = pollAnalysisRequest(
      preset,
      { 
        top_k: 5,
        maxPollingTime: 2 * 60 * 1000 // 2 minutes max waiting time
      },
      {
        onPoll: (attempt, elapsedTime) => {
          console.log(`Polling attempt ${attempt}, elapsed: ${Math.round(elapsedTime/1000)}s`);
          // Update the elapsed time in the UI
          setElapsedTime(elapsedTime);
        },
        
        onFinal: (data) => {
          // Got the final response
          const responseTime = Date.now() - timeStart;
          
          // Add assistant response to chat with timing info
          setChatHistory(prev => [...prev, { 
            role: 'assistant', 
            content: data.response || "No response received",
            responseTime 
          }]);
          
          setLoading(false);
          setStartTime(null);
          setStreamedResponse(null);
          cancelPollingRef.current = null;
        },
        
        onError: (error) => {
          console.error("Error:", error);
          setChatHistory(prev => [...prev, { 
            role: 'assistant', 
            content: 'Error receiving the response.',
            responseTime: Date.now() - timeStart
          }]);
          
          setLoading(false);
          setStartTime(null);
          setStreamedResponse(null);
          cancelPollingRef.current = null;
        },
        
        onTimeout: () => {
          console.error("Request timed out");
          setChatHistory(prev => [...prev, { 
            role: 'assistant', 
            content: 'Sorry, the request timed out. Please try again with a shorter query.',
            responseTime: Date.now() - timeStart
          }]);
          
          setLoading(false);
          setStartTime(null);
          setStreamedResponse(null);
          cancelPollingRef.current = null;
        }
      }
    );
  };

  // Clear chat history
  const clearChatHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('americanAirChatHistory');
  };

  // Format milliseconds to a readable format
  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
  <>
    {/* Header */}
    <header className="bg-[#3E68A3] text-white py-3 px-6 shadow-md w-full flex items-center justify-between font-serif fixed top-0 left-0 z-10">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="bg-white text-[#3E68A3] px-4 py-2 rounded-lg font-medium hover:bg-[#E0E9F6] transition shadow-sm"
        >
          ← Home
        </Link>
        <h1 className="text-2xl font-bold">Chat Dashboard</h1>
      </div>
      <span className="text-sm text-[#E0E9F6]">by American Aviators</span>
    </header>

    <main className="min-h-screen bg-[#E0E9F6] flex flex-col items-center justify-center font-serif py-12 px-4 pt-24">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-5xl space-y-4 text-[#04080F] border border-[#A1C6EA] flex flex-col h-[80vh]">
        
        {/* Title with Icon and Clear Button */}
        <div className="flex items-center justify-between pb-2 border-b border-[#A1C6EA]">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold drop-shadow">American Air Assistant</h1>
            <img src="/globe.svg" alt="Globe icon" className="w-6 h-6" />
          </div>
          
          {/* Clear chat history button */}
          {chatHistory.length > 0 && (
            <button
              onClick={clearChatHistory}
              className="text-sm bg-[#E0E9F6] text-[#3E68A3] px-3 py-1 rounded-lg hover:bg-[#A1C6EA] hover:text-white transition flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
              Clear chat
            </button>
          )}
        </div>

        {/* Chat messages container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto space-y-4 p-2"
        >
          {/* Welcome message */}
          {chatHistory.length === 0 && (
            <div className="bg-[#E0E9F6] p-4 rounded-lg text-[#3E68A3] max-w-[80%]">
              <p>Hello! I'm American Air's customer service assistant. I can help analyze tweet data and identify areas for improvement. What would you like to know?</p>
            </div>
          )}
          
          {/* Chat messages */}
          {chatHistory.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} flex-col`}
            >
              <div 
                className={`p-4 rounded-lg max-w-[80%] ${
                  message.role === 'user' 
                    ? 'bg-[#A1C6EA] text-white ml-auto' 
                    : 'bg-[#E0E9F6] text-[#3E68A3]'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none prose-headings:my-2 prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  message.content
                )}
              </div>
              
              {/* Response time indicator for assistant messages */}
              {message.role === 'assistant' && message.responseTime && (
                <span className="text-xs text-gray-500 mt-1 ml-1">
                  Response time: {formatResponseTime(message.responseTime)}
                </span>
              )}
            </div>
          ))}          {/* Loading indicator with live timer */}
          {loading && (
            <div className="flex justify-start flex-col">
              <div className="bg-[#E0E9F6] p-4 rounded-lg text-[#3E68A3] max-w-[80%]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-[#3E68A3] rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-[#3E68A3] rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-[#3E68A3] rounded-full animate-pulse delay-200"></div>
                  <span className="text-sm ml-2">Thinking...</span>
                </div>
                
                {/* Show a timer */}
                <p className="text-sm text-gray-500">
                  Time elapsed: {formatResponseTime(elapsedTime)}
                </p>
                
                {/* Show streamed response if available */}
                {streamedResponse && (
                  <div className="mt-3 prose prose-sm max-w-none prose-headings:my-2 prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                    <ReactMarkdown>
                      {streamedResponse}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Preset Prompts */}
        <div className="flex gap-2 justify-center flex-wrap pt-2 border-t border-[#A1C6EA]">
          {[
            'Compare American Air vs Air France sentiment',
            'Main customer concerns',
            'How we respond to issues',
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handlePresetPrompt(prompt)}
              disabled={loading}
              className="bg-[#E0E9F6] text-[#3E68A3] px-3 py-1 rounded-lg text-sm hover:bg-[#A1C6EA] hover:text-white transition disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex gap-2 mt-2 pt-2 border-t border-[#A1C6EA]">
          <input
            type="text"
            className="flex-1 p-3 rounded-xl text-base text-[#04080F] border border-[#A1C6EA] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3E68A3]"
            placeholder="Type your message..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-[#A1C6EA] text-white p-3 rounded-xl font-semibold hover:bg-[#3E68A3] transition disabled:opacity-50 w-[100px]"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </main>
  </>
  );
};

export default LLMPage;