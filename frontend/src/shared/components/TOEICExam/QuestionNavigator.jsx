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
              // Tạo key duy nhất cho mỗi câu hỏi, bao gồm cả subQuestionIndex cho group questions
              const answerKey = q.subQuestionIndex !== undefined && q.subQuestionIndex !== null
                ? `${q.testQuestionId}_${q.subQuestionIndex}`
                : q.testQuestionId;
              // Kiểm tra answer có giá trị hợp lệ (không phải undefined, null, hoặc empty string)
              const answerValue = answers[answerKey];
              const isAnswered = answerValue !== undefined && answerValue !== null && answerValue !== "";
              const isActive = idx === currentIndex;

              return (
                <button
                  key={q.testQuestionId + (q.subQuestionIndex !== undefined ? `_${q.subQuestionIndex}` : '')}
                  onClick={() => goToQuestionByIndex(idx)}
                  className={`${styles.numBtn} ${isActive ? styles.activeNum : ""} ${isAnswered ? styles.answeredNum : ""}`}
                  style={{
                    backgroundColor: isAnswered ? "#52c41a" : isActive ? "#1677ff" : "#f0f0f0",
                    color: isAnswered || isActive ? "#fff" : "#000",
                    fontWeight: isAnswered ? 600 : 400,
                    border: isAnswered ? "2px solid #389e0d" : isActive ? "2px solid #0958d9" : "1px solid #d9d9d9",
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