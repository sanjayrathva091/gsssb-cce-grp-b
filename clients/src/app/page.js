"use client";
import styles from "./page.module.css";
import { useState } from "react";

export default function Home() {
  const [rollNo, setRollNo] = useState("");
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCandidateData = async () => {
    if (!rollNo.trim()) {
      setError("Please enter a roll number");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${process.env.BACKEND_URL}/getCandidate`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rollNo }),
        }
      );
      
      if (!response.ok) {
        throw new Error("Candidate not found");
      }
      
      const data = await response.json();
      console.log("Candidate Data:", data);
      setCandidateData(data);
    } catch (err) {
      setError(err.message);
      setCandidateData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to GSSSB CCE Group B!
        </h1>

        <div className={styles.searchContainer}>
          <input
            type="text"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            placeholder="Enter Prelim Roll No"
            className={styles.searchInput}
          />
          <button
            onClick={fetchCandidateData}
            disabled={loading}
            className={styles.searchButton}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {candidateData && (
          <div className={styles.candidateInfo}>
            <h2>Candidate Details</h2>
            <pre>{JSON.stringify(candidateData, null, 2)}</pre>
            {/* You can format this data better based on your actual API response */}
          </div>
        )}
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
}