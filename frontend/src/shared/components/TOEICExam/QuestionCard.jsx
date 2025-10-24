import React, { useRef, useState, useEffect } from "react";
import { Card, Typography, Radio, Button, Input } from "antd";
import styles from "../../styles/Exam.module.css";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function QuestionCard({ question, currentIndex, totalCount, answers, onAnswer, goToQuestionByIndex, handleSubmit }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [writeText, setWriteText] = useState("");

  useEffect(() => {
    // if there is a saved answer (writing) load it
    if (question && typeof answers[question.id] === "string") {
      setWriteText(answers[question.id]);
    } else {
      setWriteText("");
    }
  }, [question, answers]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); } else { audioRef.current.play(); setIsPlaying(true); }
  };

  if (!question) return <Card>No questions</Card>;

  const handleTextSave = () => {
    onAnswer(question.id, writeText || "");
  };

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
          <Text strong>Answer</Text>

          {/* For writing type allow textarea */}
          {question.type === "photo" || question.type === "audio" || question.type === "mcq" || question.type === "passage" ? (
            <div className={styles.optionsBox} style={{ marginTop: 8 }}>
              <Radio.Group value={answers[question.id]} onChange={(e) => onAnswer(question.id, e.target.value)}>
                {question.options.map((o) => (
                  <div key={o.key} className={styles.optionRow}><Radio value={o.key}>{o.text}</Radio></div>
                ))}
              </Radio.Group>
            </div>
          ) : null}

          {/* Provide a writing box for explicit Writing tasks:
              We'll treat Part 7 (passage) as reading only; for Writing we will define a question type 'writing' if needed.
              For convenience, allow a TextArea whenever question has property allowWrite === true (we'll mark some in mock if needed) */}
          {question.allowWrite && (
            <div style={{ marginTop: 12 }}>
              <TextArea rows={8} value={writeText} onChange={(e) => setWriteText(e.target.value)} placeholder="Write your response here..." />
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <Button onClick={handleTextSave}>Save</Button>
                <Button type="primary" onClick={() => { handleTextSave(); handleSubmit(); }}>Save & Submit</Button>
              </div>
            </div>
          )}

          {/* As enhancement: allow writing for Part 1 question if user clicks 'Write answer' */}
          {question.type === "photo" && (
            <div style={{ marginTop: 12 }}>
              <Button onClick={() => onAnswer(question.id, answers[question.id] || "")}>Mark (keep choice)</Button>
            </div>
          )}
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