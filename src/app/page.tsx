"use client";

import { useEffect, useRef, useState } from "react";

const LS_KEYS = {
  transcript: "ai_notes_transcript_v1",
  prompt: "ai_notes_prompt_v1",
  summary: "ai_notes_summary_v1",
  history: "ai_notes_history_v1", // new key
};

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [transcript, setTranscript] = useState("");
  const [prompt, setPrompt] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      setTranscript(localStorage.getItem(LS_KEYS.transcript) || "");
      setPrompt(localStorage.getItem(LS_KEYS.prompt) || "");
      setSummary(localStorage.getItem(LS_KEYS.summary) || "");
    } catch {}
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.transcript, transcript);
    } catch {}
  }, [transcript]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.prompt, prompt);
    } catch {}
  }, [prompt]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.summary, summary);
    } catch {}
  }, [summary]);

  const onFilePicked = async (file: File) => {
    if (!file) return;
    const text = await file.text();
    setTranscript(text);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await onFilePicked(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "text/plain") {
      await onFilePicked(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const clearAll = () => {
    setTranscript("");
    setPrompt("");
    setSummary("");
    try {
      Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(k));
    } catch {}
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Call API
  const generateSummary = async () => {
    if (!transcript || !prompt) {
      alert("Please enter transcript and prompt first.");
      return;
    }
    setLoading(true);
    setSummary("");

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, prompt }),
      });
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
      } else {
        alert("No summary generated. " + (data.error || ""));
      }
    } catch (err) {
      alert("Error generating summary");
      console.error(err);
    }
    setLoading(false);
  };

  // Save summary to history
  const saveToHistory = () => {
    if (!summary.trim()) {
      alert("No summary to save.");
      return;
    }
    const newEntry = {
      id: Date.now(),
      prompt,
      summary,
      date: new Date().toLocaleString(),
    };
    try {
      const prev = JSON.parse(localStorage.getItem(LS_KEYS.history) || "[]");
      const updated = [newEntry, ...prev];
      localStorage.setItem(LS_KEYS.history, JSON.stringify(updated));
      alert("Saved to history!");
    } catch (err) {
      console.error(err);
    }
  };

  // Share via email
  const shareViaEmail = () => {
    if (!summary.trim()) {
      alert("No summary to share.");
      return;
    }
    const subject = encodeURIComponent("Meeting Summary");
    const body = encodeURIComponent(summary);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <main className="container">
      <section className="card">
        <h1 className="title">AI Meeting Notes – Day 3</h1>
        <p className="muted">
          Upload transcript → Enter prompt → Generate AI summary → Edit, Save,
          Share.
        </p>

        {/* Upload */}
        <div className="section">
          <label className="label">Upload Transcript (.txt)</label>
          <div
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,text/plain"
              onChange={handleFileChange}
            />
            <p className="muted small">
              Drag & drop a .txt file here or choose one.
            </p>
          </div>
        </div>

        {/* Transcript */}
        <div className="section">
          <label className="label">Transcript</label>
          <textarea
            className="textarea"
            placeholder="Paste or load your meeting transcript..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={10}
          />
        </div>

        {/* Prompt */}
        <div className="section">
          <label className="label">Custom Instruction / Prompt</label>
          <input
            className="input"
            placeholder='e.g., "Summarize in bullet points for executives"'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="actions">
          <button
            className="btn primary"
            onClick={generateSummary}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Summary"}
          </button>
          <button className="btn" onClick={clearAll}>
            Clear
          </button>
        </div>

        {/* Summary */}
        <div className="section">
          <label className="label">Generated Summary (Editable)</label>
          <textarea
            className="textarea"
            placeholder="Your AI summary will appear here..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={10}
          />
        </div>

        {/* Extra actions */}
        <div className="actions">
          <button className="btn" onClick={saveToHistory}>
            Save to History
          </button>
          <button className="btn" onClick={shareViaEmail}>
            Share via Email
          </button>
        </div>

        <div className="note">
          View saved summaries in{" "}
          <a href="/history" style={{ color: "#4f46e5" }}>
            /history
          </a>
        </div>
      </section>
    </main>
  );
}
