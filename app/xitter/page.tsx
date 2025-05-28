'use client';
import React, { useState } from 'react';
import botStyles from './bot.module.css';

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
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Write a Fake Tweet</h1>
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Type your fake tweet here..."
            value={tweet}
            onChange={(e) => setTweet(e.target.value)}
            rows={4}
            style={styles.textarea}
            required
            disabled={loading}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Response'}
          </button>
        </form>

        {botReply && (
          <div style={styles.responseBox}>
            <h2>Bot's Response:</h2>
            <p>{botReply}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: 600,
  },
  title: {
    marginBottom: '1rem',
    textAlign: 'center',
    color: '#333',
  },
  textarea: {
    width: '100%',
    fontSize: '1rem',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #ccc',
    resize: 'vertical',
    marginBottom: '1rem',
    fontFamily: 'inherit',
  },
  button: {
    width: '100%',
    backgroundColor: '#0070f3',
    color: 'white',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  responseBox: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#e6f0ff',
    borderRadius: '0.5rem',
    border: '1px solid #99bbff',
    color: '#003366',
  },
};

export default FakeTweetPage;
