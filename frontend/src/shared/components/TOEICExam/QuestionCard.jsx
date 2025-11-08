import React, { useRef, useState, useEffect } from "react";
import { Card, Typography, Radio, Button, Image, Progress, Input, message } from "antd";
import { AudioOutlined, StopOutlined, PlayCircleOutlined } from "@ant-design/icons";
import styles from "../../styles/Exam.module.css";

const { Title, Text } = Typography;
const { TextArea } = Input;

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
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const isListeningPart = question.partId >= 1 && question.partId <= 4;
  const isWritingPart = question.partId >= 8 && question.partId <= 10;
  const isSpeakingPart = question.partId >= 11 && question.partId <= 15;
  const isLrPart = question.partId >= 1 && question.partId <= 7;
  const hasGlobalAudio = globalAudioUrl && globalAudioUrl.trim() !== "";
  const hasImage = question.imageUrl && question.imageUrl.trim() !== "";

  useEffect(() => {
    let previousUrl = recordedAudioUrl;

    setIsPlaying(false);
    setCurrentTime(0);
    setImageError(false);
    setIsRecording(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    // Load lại answer đã lưu nếu có
    const savedAnswer = answers[question.testQuestionId];
    if (isSpeakingPart && savedAnswer) {
      if (savedAnswer instanceof Blob) {
        // Nếu là Blob, tạo URL để hiển thị
        const url = URL.createObjectURL(savedAnswer);
        setRecordedAudioUrl(url);
      } else if (typeof savedAnswer === "string" && savedAnswer.startsWith("http")) {
        // Nếu là URL (đã upload), dùng trực tiếp
        setRecordedAudioUrl(savedAnswer);
      }
    } else {
      setRecordedAudioUrl(null);
    }

    // Cleanup URL cũ khi chuyển câu hỏi hoặc unmount
    return () => {
      if (previousUrl && previousUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previousUrl);
      }
    };
  }, [question.testQuestionId, answers, isSpeakingPart]);

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

  // === GHI ÂM CHO SPEAKING ===
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      let recordingTimer = null;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (recordingTimer) {
          clearInterval(recordingTimer);
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        // Lưu audio vào answers
        onAnswer(question.testQuestionId, audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      message.error("Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePlayRecording = () => {
    if (recordedAudioUrl && audioRef.current) {
      audioRef.current.src = recordedAudioUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
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

      {/* PHẦN TRẢ LỜI */}
      {isWritingPart ? (
        <div className={styles.aBox} style={{ marginTop: 20 }}>
          <Text strong>Viết câu trả lời</Text>
          <div style={{ marginTop: 12 }}>
            <TextArea
              rows={6}
              placeholder="Nhập câu trả lời của bạn..."
              value={
                typeof answers[question.testQuestionId] === "string"
                  ? answers[question.testQuestionId]
                  : ""
              }
              onChange={(e) => onAnswer(question.testQuestionId, e.target.value)}
              style={{ fontSize: 14 }}
            />
          </div>
        </div>
      ) : isSpeakingPart ? (
        <div className={styles.aBox} style={{ marginTop: 20 }}>
          <Text strong>Ghi âm câu trả lời</Text>
          <div style={{ marginTop: 12 }}>
            {!isRecording && !recordedAudioUrl && (
              <Button
                type="primary"
                icon={<AudioOutlined />}
                onClick={handleStartRecording}
                size="large"
              >
                Bắt đầu ghi âm
              </Button>
            )}
            {isRecording && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Button
                  type="primary"
                  danger
                  icon={<StopOutlined />}
                  onClick={handleStopRecording}
                  size="large"
                >
                  Dừng ghi âm
                </Button>
                <Text type="danger" strong>
                  Đang ghi âm... {formatTime(recordingTime)}
                </Text>
              </div>
            )}
            {recordedAudioUrl && !isRecording && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    icon={<PlayCircleOutlined />}
                    onClick={handlePlayRecording}
                    disabled={isPlaying}
                  >
                    Phát lại
                  </Button>
                  <Button onClick={handleStartRecording}>Ghi âm lại</Button>
                </div>
                <audio
                  ref={audioRef}
                  src={recordedAudioUrl}
                  onEnded={() => setIsPlaying(false)}
                  style={{ display: "none" }}
                />
                <Text type="success">Đã ghi âm thành công</Text>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.aBox} style={{ marginTop: 20 }}>
          <Text strong>Chọn đáp án</Text>
          <div style={{ marginTop: 12 }}>
            <Radio.Group
              value={answers[question.testQuestionId]}
              onChange={(e) => onAnswer(question.testQuestionId, e.target.value)}
            >
              {question.options?.map((opt) => (
                <div key={opt.key} style={{ margin: "10px 0" }}>
                  <Radio value={opt.key}>
                    <Text strong>{opt.key}.</Text> {opt.text}
                  </Radio>
                </div>
              ))}
            </Radio.Group>
          </div>
        </div>
      )}

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