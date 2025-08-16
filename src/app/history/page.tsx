"use client";

import { useEffect, useState } from "react";

const LS_HISTORY = "ai_notes_history_v1";

interface HistoryEntry {
  id: number;
  prompt: string;
  summary: string;
  date: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_HISTORY) || "[]");
      setHistory(saved);
    } catch {
      setHistory([]);
    }
  }, []);

  const clearHistory = () => {
    if (confirm("Clear all saved summaries?")) {
      localStorage.removeItem(LS_HISTORY);
      setHistory([]);
    }
  };

  return (
    <main className="container">
      <section className="card">
        <h1 className="title">Saved Summaries</h1>
        {history.length === 0 ? (
          <p className="muted">No saved summaries yet.</p>
        ) : (
          <div>
            {history.map((item) => (
              <div key={item.id} className="section">
                <p className="small muted">{item.date}</p>
                <p>
                  <strong>Prompt:</strong> {item.prompt}
                </p>
                <pre className="textarea">{item.summary}</pre>
              </div>
            ))}
          </div>
        )}
        <div className="actions">
          <a href="/" className="btn">
            Back
          </a>
          {history.length > 0 && (
            <button className="btn" onClick={clearHistory}>
              Clear History
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
