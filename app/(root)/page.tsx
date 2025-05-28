import React from 'react';
import Link from 'next/link';
import './home.css';

const HomePage = () => {
  return (
    <main className="home-container">
      <h1 className="home-title">OPTIONS</h1>
      <p className="home-subtitle">Choose an action below:</p>
      <nav className="home-nav">
        <Link href="/llm" className="home-link">Ask the LLM</Link>
        <Link href="/xitter" className="home-link">Write a Fake Tweet</Link>
      </nav>
    </main>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '2rem',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '2rem',
    color: '#111827',
  },
  nav: {
    display: 'flex',
    gap: '2rem',
  },
  link: {
    padding: '1rem 2rem',
    backgroundColor: '#2563eb',
    color: 'white',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1.25rem',
    transition: 'background-color 0.3s ease',
  },
};

export default HomePage;
