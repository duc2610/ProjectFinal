import React, { useRef, useState, useEffect } from "react";
import { Card, Typography, Radio, Button, Image, Progress } from "antd";
import styles from "../../styles/Exam.module.css";

const { Title, Text } = Typography;

export default function QuestionCard({
  question,
  currentIndex,
  totalCount,
  answers,
  onAnswer,
  goToQuestionByIndex,
  handleSubmit,
  globalAudioUrl,
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isListeningPart = question.partId >= 1 && question.partId <= 4;
  const hasGlobalAudio = globalAudioUrl && globalAudioUrl.trim() !== "";
  const hasImage = question.imageUrl && question.imageUrl.trim() !== "";

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setImageError(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [question]);

  useEffect(() => {
    if (!audioRef.current || !hasGlobalAudio) return;
    const audio = audioRef.current;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnd = () => setIsPlaying(false);
    const handleError = () => setAudioError(true);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnd);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnd);
      audio.removeEventListener("error", handleError);
    };
  }, [globalAudioUrl, question]);

  const toggleAudio = () => {
    if (!audioRef.current || audioError) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setAudioError(true));
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Card style={{ margin: 16 }}>
      <div className={styles.questionHeader}>
        <Title level={4}>Câu {question.globalIndex}</Title>
        <div className={styles.partBadge}>{question.partName}</div>
      </div>

      <div className={styles.qContentRow}>
        {question.passage && (
          <div style={{ margin: "12px 0", padding: 12, background: "#f5f5f5", borderRadius: 6 }}>
            <Text italic>{question.passage}</Text>
          </div>
        )}

        {isListeningPart && hasGlobalAudio && (
          <div className={styles.audioBox} style={{ margin: "16px 0" }}>
            {!audioError ? (
              <>
                <audio ref={audioRef} src={globalAudioUrl} />
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Button size="small" onClick={toggleAudio} type={isPlaying ? "primary" : "default"}>
                    {isPlaying ? "Tạm dừng" : "Nghe"}
                  </Button>
                  <div style={{ flex: 1 }}>
                    <Progress
                      percent={(currentTime / duration) * 100 || 0}
                      showInfo={false}
                      strokeColor="#1890ff"
                      size="small"
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatTime(currentTime)} / {formatTime(duration || 0)}
                    </Text>
                  </div>
                </div>
              </>
            ) : (
              <Text type="danger">Không phát được âm thanh</Text>
            )}
          </div>
        )}

        {hasImage && !imageError ? (
          <div style={{ margin: "16px 0", textAlign: "center" }}>
            <Image
              src={question.imageUrl}
              alt="Câu hỏi"
              style={{ maxHeight: 300, borderRadius: 6, objectFit: "contain" }}
              onError={() => setImageError(true)}
              preview={false}
            />
          </div>
        ) : hasImage && imageError ? (
          <div style={{ color: "red", textAlign: "center", margin: "16px 0" }}>
            Không tải được ảnh
          </div>
        ) : null}

        <div style={{ marginTop: 12, fontSize: 16, lineHeight: 1.6 }}>
          <Text strong>{question.question}</Text>
        </div>
      </div>

      <div className={styles.aBox} style={{ marginTop: 20 }}>
        <Text strong>Chọn đáp án</Text>
        <div style={{ marginTop: 12 }}>
          <Radio.Group
            value={answers[question.testQuestionId]}
            onChange={(e) => onAnswer(question.testQuestionId, e.target.value)}
          >
            {question.options.map((opt) => (
              <div key={opt.key} style={{ margin: "10px 0" }}>
                <Radio value={opt.key}>
                  <Text strong>{opt.key}.</Text> {opt.text}
                </Radio>
              </div>
            ))}
          </Radio.Group>
        </div>
      </div>

      <div className={styles.qFooter} style={{ marginTop: 24 }}>
        <div>
          <Button onClick={() => goToQuestionByIndex(currentIndex - 1)} disabled={currentIndex === 0}>
            Câu trước
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => goToQuestionByIndex(currentIndex + 1)}
            disabled={currentIndex === totalCount - 1}
          >
            Câu sau
          </Button>
        </div>
        <Button type="primary" onClick={handleSubmit}>
          Nộp bài
        </Button>
      </div>
    </Card>
  );
}