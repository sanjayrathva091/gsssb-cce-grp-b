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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/getCandidate/${rollNo.trim()}`
      );
      
      if (!response.ok) {
        throw new Error("Candidate not found");
      }
      
      const data = await response.json();
      if (data.success && data.candidate) {
        setCandidateData(data.candidate);
      } else {
        throw new Error("Invalid data format");
      }
    } catch (err) {
      setError(err.message);
      setCandidateData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchCandidateData();
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          GSSSB CCE Group B Result Checker
        </h1>

        <form onSubmit={handleSubmit} className={styles.searchContainer}>
          <input
            type="text"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            placeholder="Enter Prelim Roll No"
            className={styles.searchInput}
          />
          <button
            type="submit"
            disabled={loading}
            className={styles.searchButton}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}

        {candidateData && (
          <div className={styles.candidateCard}>
            <div className={styles.cardHeader}>
              <h2>Candidate Details</h2>
              <span className={styles.rollNo}>Roll No: {candidateData.rollNo}</span>
            </div>
            
            <div className={styles.cardBody}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Full Name:</span>
                <span className={styles.detailValue}>{candidateData.fullName}</span>
              </div>
              
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Gender:</span>
                  <span className={styles.detailValue}>{candidateData.gender}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Category:</span>
                  <span className={styles.detailValue}>{candidateData.category}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>PH Status:</span>
                  <span className={styles.detailValue}>{candidateData.ph || "No"}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Ex-Serviceman:</span>
                  <span className={styles.detailValue}>{candidateData.exServiceman || "No"}</span>
                </div>
              </div>
              
              <div className={styles.marksContainer}>
                <div className={styles.marksCard}>
                  <h3>Preliminary Marks</h3>
                  <p className={styles.marksValue}>{candidateData.preMarks}</p>
                </div>
                <div className={styles.marksCard}>
                  <h3>Mains Marks</h3>
                  <p className={styles.marksValue}>{candidateData.mainsMarks}</p>
                </div>
                <div className={styles.marksCard}>
                  <h3>Treated As</h3>
                  <p className={styles.marksValue}>{candidateData.treatedAs}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>Official GSSSB CCE Group B Results Portal</p>
      </footer>
    </div>
  );
}