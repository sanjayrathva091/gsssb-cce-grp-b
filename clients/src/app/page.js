"use client";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import StatsDisplay from "./StatsDisplay";

export default function Home() {
  const [rollNo, setRollNo] = useState("");
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for mains marks update
  const [mainsRollNo, setMainsRollNo] = useState("");
  const [rightAnswers, setRightAnswers] = useState("");
  const [wrongAnswers, setWrongAnswers] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Add this state to your existing page component
  const [statsData, setStatsData] = useState(null);

  // Add this function to fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/fetchData`);
      const data = await response.json();
      if (data.success) {
        setStatsData(data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };
  // Call fetchStats when the component mounts or when needed
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchCandidateData = async () => {
    if (!rollNo.trim()) {
      setError("Please enter a roll number");
      return;
    }

    setLoading(true);
    setError(null);
    setUpdateSuccess(false);

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
        // Pre-fill mains roll number if available
        setMainsRollNo(data.candidate.mainsRollNo || "");
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

  const handleUpdateMarks = async (e) => {
    e.preventDefault();

    if (!mainsRollNo.trim() || !rightAnswers || !wrongAnswers) {
      setError("Please fill all fields");
      return;
    }

    if (isNaN(rightAnswers) || isNaN(wrongAnswers)) {
      setError("Right and wrong answers must be numbers");
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/updateMainsMarks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prelimRollNo: rollNo,
            mainsRollNo: mainsRollNo.trim(),
            rightAnswers: parseInt(rightAnswers),
            wrongAnswers: parseInt(wrongAnswers),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update marks");
      }

      const data = await response.json();
      if (data.success) {
        setUpdateSuccess(true);
        // Refresh candidate data
        fetchCandidateData();
      } else {
        throw new Error(data.message || "Update failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
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
        {updateSuccess && <p className={styles.success}>Marks updated successfully!</p>}

        {candidateData && (
          <div className={styles.candidateCard}>
            <div className={styles.cardHeader}>
              <h2>Candidate Details</h2>
              <span className={styles.rollNo}>Prelim Roll No: {candidateData.preRollNo}</span>
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
                  <p className={styles.marksValue}>
                    {(candidateData.mainsMarks && parseFloat(candidateData.mainsMarks).toFixed(5)) || "Not available"}
                  </p>
                </div>
                <div className={styles.marksCard}>
                  <h3>Provisional Merit No.</h3>
                  <p className={styles.marksValue}>{"COMING SOON" || candidateData.treatedAs}</p>
                </div>

                {/* Update Mains Marks Section */}
                {!candidateData.mainsMarks && (
                  <div className={styles.updateMarksCard}>
                    <h3>Update Mains Marks</h3>
                    <form onSubmit={handleUpdateMarks} className={styles.updateForm}>
                      <div className={styles.formGroup}>
                        <label htmlFor="mainsRollNo">Mains Roll No:</label>
                        <input
                          type="text"
                          maxLength="9"
                          id="mainsRollNo"
                          value={mainsRollNo}
                          onChange={(e) => setMainsRollNo(e.target.value)}
                          className={styles.formInput}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="rightAnswers">No. of Right Answers:</label>
                        <input
                          type="number"
                          id="rightAnswers"
                          value={rightAnswers}
                          onChange={(e) => setRightAnswers(e.target.value)}
                          className={styles.formInput}
                          min="0"
                          max="200"
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="wrongAnswers">No. of Wrong Answers:</label>
                        <input
                          type="number"
                          id="wrongAnswers"
                          value={wrongAnswers}
                          onChange={(e) => setWrongAnswers(e.target.value)}
                          className={styles.formInput}
                          min="0"
                          max="200"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={updating}
                        className={styles.updateButton}
                      >
                        {updating ? "Updating..." : "Update Marks"}
                      </button>
                    </form>
                  </div>
                )}
                {statsData && <StatsDisplay stats={statsData} />}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>UnOfficial GSSSB CCE Group B Results Portal</p>
      </footer>
    </div>
  );
}