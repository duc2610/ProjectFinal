import React, { useRef, useState } from "react";
import { Card, Typography, Radio, Button } from "antd";
import styles from "../../styles/Exam.module.css";

const { Title, Text } = Typography;

export default function QuestionCard({ question, currentIndex, totalCount, answers, onAnswer, goToQuestionByIndex, handleSubmit }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); } else { audioRef.current.play(); setIsPlaying(true); }
  };

  if (!question) return <Card>No questions</Card>;

  return (
    <Card>
      <div className={styles.questionHeader}>
        <Title level={4}>Question {question.globalIndex}</Title>
        <div className={styles.partBadge}>Part {question.partId}</div>
      </div>

      <div className={styles.qContentRow}>
        <div className={styles.qBox}>
          <Text strong>Question</Text>

          {question.type === "photo" && question.imageUrl && (
            <div style={{ marginTop: 10 }}>
              <img src={question.imageUrl} alt="photo" style={{ maxWidth: "100%", borderRadius: 6 }} />
            </div>
          )}

          {question.passage && (
            <div style={{ marginTop: 8, padding: 8, background: "#fafafa", borderRadius: 6 }}>{question.passage}</div>
          )}

          {question.audioUrl && (
            <div className={styles.audioBox}>
              <audio ref={audioRef} src={question.audioUrl} preload="none" />
              <Button size="small" onClick={toggleAudio}>{isPlaying ? "Pause" : "Play Audio"}</Button>
            </div>
          )}

          <div className={styles.qText} style={{ marginTop: 12 }}>{question.question}</div>
        </div>

        <div className={styles.aBox}>
          <Text strong>Choose the correct answer</Text>
          <div className={styles.optionsBox} style={{ marginTop: 8 }}>
            <Radio.Group value={answers[question.id]} onChange={(e) => onAnswer(question.id, e.target.value)}>
              {question.options.map((o) => (
                <div key={o.key} className={styles.optionRow}><Radio value={o.key}>{o.text}</Radio></div>
              ))}
            </Radio.Group>
          </div>
        </div>
      </div>

      <div className={styles.qFooter}>
        <div>
          <Button onClick={() => goToQuestionByIndex(currentIndex - 1)} disabled={currentIndex === 0}>Previous</Button>
          <Button style={{ marginLeft: 8 }} onClick={() => goToQuestionByIndex(currentIndex + 1)} disabled={currentIndex === totalCount - 1}>Next</Button>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 160 }}></div>
          <Button style={{ marginLeft: 12 }} type="primary" onClick={handleSubmit}>Submit</Button>
        </div>
      </div>
    </Card>
  );
}
