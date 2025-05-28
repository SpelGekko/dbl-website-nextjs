'use client';
import React, { useState } from 'react';
import styles from './LLMPage.module.css';

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

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Ask the LLM</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className={styles.input}
            placeholder="Type your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </form>
        {response && <div className={styles.response}>{response}</div>}
      </div>
    </div>
  );
};

export default LLMPage;
