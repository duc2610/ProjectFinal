import React from "react";
import styles from "@shared/styles/Exam.module.css";

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
              // Kiểm tra xem có phải speaking_group không
              const isSpeakingGroup = q.type === "speaking_group" && q.subQuestions && q.subQuestions.length > 0;
              if (process.env.NODE_ENV === 'development' && q.partId >= 11 && q.partId <= 15) {
              }
              
              if (isSpeakingGroup) {
                // Với speaking_group: hiển thị một nút với format "13-15"
                const globalIndexStart = q.globalIndex;
                const globalIndexEnd = q.globalIndexEnd || q.globalIndex;
                const displayText = globalIndexStart === globalIndexEnd 
                  ? `${globalIndexStart}` 
                  : `${globalIndexStart}-${globalIndexEnd}`;
                
                // Kiểm tra xem có câu nào trong group đã được trả lời không
                // Với speaking_group, audio được lưu với key là testQuestionId của câu đầu (subQuestionIndex = 0)
                const testQuestionIdStr = String(q.testQuestionId);
                const answerKey = testQuestionIdStr; // subQuestionIndex = 0
                const answerValue = answers[answerKey];
                const isAnswered = answerValue !== undefined && answerValue !== null && answerValue !== "";
                const isActive = idx === currentIndex;
                
                return (
                  <button
                    key={`${testQuestionIdStr}_group`}
                    onClick={() => goToQuestionByIndex(idx)}
                    className={`${styles.numBtn} ${isActive ? styles.activeNum : ""} ${isAnswered ? styles.answeredNum : ""}`}
                    style={{
                      backgroundColor: isAnswered ? "#52c41a" : isActive ? "#1677ff" : "#f0f0f0",
                      color: isAnswered || isActive ? "#fff" : "#000",
                      fontWeight: isAnswered ? 600 : 400,
                      border: isAnswered ? "2px solid #389e0d" : isActive ? "2px solid #0958d9" : "1px solid #d9d9d9",
                      minWidth: "auto",
                      width: "auto",
                    }}
                  >
                    {displayText}
                  </button>
                );
              } else {
                // Câu hỏi thường: xử lý như bình thường
                const subIndex = q.subQuestionIndex !== undefined && q.subQuestionIndex !== null
                  ? q.subQuestionIndex
                  : 0;
                const testQuestionIdStr = String(q.testQuestionId);
                const answerKey = subIndex !== 0
                  ? `${testQuestionIdStr}_${subIndex}`
                  : testQuestionIdStr;
                const answerValue = answers[answerKey];
                const isAnswered = answerValue !== undefined && answerValue !== null && answerValue !== "";
                const isActive = idx === currentIndex;
                
                const elementKey = subIndex !== 0
                  ? `${testQuestionIdStr}_${subIndex}`
                  : testQuestionIdStr;

                return (
                  <button
                    key={elementKey}
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
              }
            })}
          </div>
        </div>
      ))}
    </div>
  );
}