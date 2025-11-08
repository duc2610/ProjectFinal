import React from "react";
import styles from "../../styles/Exam.module.css";

export default function QuestionNavigator({ questions, currentIndex, answers, goToQuestionByIndex }) {
  const groups = {};

  questions.forEach((q, idx) => {
    const partName = q.partName || `Part ${q.partId}`;
    const partKey = q.partDescription 
      ? `${partName} - ${q.partDescription}` 
      : partName;
    if (!groups[partKey]) groups[partKey] = [];
    groups[partKey].push({ q, idx });
  });

  return (
    <div className={styles.sideInner}>
      {Object.entries(groups).map(([partKey, items]) => (
        <div key={partKey} className={styles.partGroup}>
          <div className={styles.partGroupTitle}>{partKey}</div>
          <div className={styles.numbersGrid}>
            {items.map(({ q, idx }) => {
              const isAnswered = answers[q.testQuestionId] !== undefined;
              const isActive = idx === currentIndex;

              return (
                <button
                  key={q.testQuestionId}
                  onClick={() => goToQuestionByIndex(idx)}
                  className={`${styles.numBtn} ${isActive ? styles.activeNum : ""}`}
                  style={{
                    backgroundColor: isAnswered ? "#52c41a" : isActive ? "#1677ff" : "#f0f0f0",
                    color: isAnswered || isActive ? "#fff" : "#000",
                  }}
                >
                  {q.globalIndex}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}