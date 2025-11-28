import React from "react";
import styles from "../../styles/Exam.module.css";

export default function QuestionNavigator({ questions, currentIndex, answers, goToQuestionByIndex }) {
  const groups = {};

  questions.forEach((q, idx) => {
    const partName = q.partName || `Part ${q.partId}`;
    const partKey = q.partDescription 
      ? `${partName} - ${q.partDescription}` 
      : partName;
    if (!groups[partKey]) {
      groups[partKey] = {
        partId: q.partId, // Lưu partId để sắp xếp
        items: []
      };
    }
    groups[partKey].items.push({ q, idx });
  });

  // Sắp xếp các groups theo partId tăng dần (bắt đầu từ part 1)
  const sortedGroups = Object.entries(groups).sort((a, b) => {
    return a[1].partId - b[1].partId;
  });

  return (
    <div className={styles.sideInner}>
      {sortedGroups.map(([partKey, groupData]) => (
        <div key={partKey} className={styles.partGroup}>
          <div className={styles.partGroupTitle}>{partKey}</div>
          <div className={styles.numbersGrid}>
            {groupData.items.map(({ q, idx }) => {
              // Tạo key duy nhất cho mỗi câu hỏi, bao gồm cả subQuestionIndex cho group questions
              // Chuẩn hóa: null/undefined = 0, nhưng nếu là 0 thì không thêm vào key
              const subIndex = q.subQuestionIndex !== undefined && q.subQuestionIndex !== null
                ? q.subQuestionIndex
                : 0;
              // Đảm bảo testQuestionId là string để tránh type mismatch
              const testQuestionIdStr = String(q.testQuestionId);
              const answerKey = subIndex !== 0
                ? `${testQuestionIdStr}_${subIndex}`
                : testQuestionIdStr;
              // Kiểm tra answer có giá trị hợp lệ (không phải undefined, null, hoặc empty string)
              const answerValue = answers[answerKey];
              const isAnswered = answerValue !== undefined && answerValue !== null && answerValue !== "";
              const isActive = idx === currentIndex;
              
              // Debug logging cho một số câu hỏi cụ thể
              if (q.globalIndex <= 6 || q.globalIndex === 13 || q.globalIndex === 14 || q.globalIndex === 34 || q.globalIndex === 40) {
              }

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