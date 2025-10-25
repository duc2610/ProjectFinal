import React from "react";
import styles from "../../styles/Exam.module.css";

export default function QuestionNavigator({
  filteredQuestions,
  currentIndex,
  answers,
  goToQuestionByIndex,
}) {
  const groups = {};

  filteredQuestions.forEach((q, idx) => {
    if (!groups[q.partId]) groups[q.partId] = [];
    groups[q.partId].push({ q, idx });
  });

  return (
    <div className={styles.sideInner}>
      {Object.keys(groups).map((pid) => (
        <div key={pid} className={styles.partGroup}>
          <div className={styles.partGroupTitle}>Part {pid}</div>
          <div className={styles.numbersGrid}>
            {groups[pid].map((item) => {
              const isAnswered = !!answers[item.q.id];
              const isActive = item.idx === currentIndex;

              return (
                <button
                  key={item.q.id}
                  onClick={() => goToQuestionByIndex(item.idx)}
                  className={`${styles.numBtn} ${isActive ? styles.activeNum : ""}`}
                  style={{
                    backgroundColor: isAnswered
                      ? "#52c41a"
                      : isActive
                      ? "#1677ff"
                      : "#ddd",
                    color: isAnswered || isActive ? "#fff" : "#000",
                    border: isActive ? "2px solid #1677ff" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {item.q.globalIndex}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
