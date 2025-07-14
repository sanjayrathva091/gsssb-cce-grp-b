"use client";
import React from 'react';
import styles from './StatsDisplay.module.css';

const StatsDisplay = ({ stats }) => {
  if (!stats) return null;

  const categories = [
    "general", "general(ews)", "sebc", "sc", "st", 
    "exs", "ph-a", "ph-b", "ph-c", "ph-d"
  ];

  const renderCategoryStats = (genderStats) => {
    return categories.map((category) => {
      const categoryData = genderStats[category] || {
        count: 0,
        oneFiftyPlus: 0,
        oneThirtyPlus: 0,
        oneTenPlus: 0,
        ninetyPlus: 0
      };

      return (
        <div key={category} className={styles.categoryCard}>
          <h3 className={styles.categoryTitle}>{category.toUpperCase()}</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total:</span>
              <span className={styles.statValue}>{categoryData.count}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>150+:</span>
              <span className={styles.statValue}>{categoryData.oneFiftyPlus}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>130+:</span>
              <span className={styles.statValue}>{categoryData.oneThirtyPlus}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>110+:</span>
              <span className={styles.statValue}>{categoryData.oneTenPlus}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>90+:</span>
              <span className={styles.statValue}>{categoryData.ninetyPlus}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Below 90:</span>
              <span className={styles.statValue}>{categoryData.count - categoryData.ninetyPlus}</span>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className={styles.statsContainer}>
      <h2 className={styles.sectionTitle}>Statistics Summary</h2>
      <p className={styles.totalCandidates}>Total Candidates: {stats.total}</p>
      
      <div className={styles.genderSection}>
        <h3 className={styles.genderTitle}>Male Candidates</h3>
        <div className={styles.categoryGrid}>
          {renderCategoryStats(stats.male)}
        </div>
      </div>
      
      <div className={styles.genderSection}>
        <h3 className={styles.genderTitle}>Female Candidates</h3>
        <div className={styles.categoryGrid}>
          {renderCategoryStats(stats.female)}
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;