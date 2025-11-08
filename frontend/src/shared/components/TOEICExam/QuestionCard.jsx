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
    <Card 
      style={{ 
        margin: 0,
        borderRadius: "16px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        border: "none",
        overflow: "hidden"
      }}
      bodyStyle={{ padding: "32px" }}
    >
      <div className={styles.questionHeader}>
        <Title level={4} style={{ margin: 0, color: "#2d3748", fontSize: "24px" }}>
          Câu {question.globalIndex}
        </Title>
        <div className={styles.partBadge}>
          {question.partName}
          {question.partDescription && ` - ${question.partDescription}`}
        </div>
      </div>

      <div className={styles.qContentRow}>
        {question.passage && (
          <div style={{ 
            margin: "0 0 20px 0", 
            padding: "20px", 
            background: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)", 
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)"
          }}>
            <Text italic style={{ fontSize: "15px", lineHeight: "1.8", color: "#4a5568" }}>
              {question.passage}
            </Text>
          </div>
        )}

        {isListeningPart && hasGlobalAudio && (
          <div className={styles.audioBox} style={{ margin: "0 0 20px 0" }}>
            {!audioError ? (
              <>
                <audio ref={audioRef} src={globalAudioUrl} />
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <Button 
                    size="large" 
                    onClick={toggleAudio} 
                    type={isPlaying ? "primary" : "default"}
                    style={{
                      borderRadius: "8px",
                      height: "40px",
                      padding: "0 24px",
                      fontWeight: 600,
                      boxShadow: isPlaying ? "0 4px 12px rgba(102, 126, 234, 0.3)" : "none"
                    }}
                  >
                    {isPlaying ? "⏸ Tạm dừng" : "▶ Nghe"}
                  </Button>
                  <div style={{ flex: 1 }}>
                    <Progress
                      percent={(currentTime / duration) * 100 || 0}
                      showInfo={false}
                      strokeColor="#667eea"
                      size="small"
                      style={{ marginBottom: "4px" }}
                    />
                    <Text type="secondary" style={{ fontSize: "13px", fontWeight: 500 }}>
                      {formatTime(currentTime)} / {formatTime(duration || 0)}
                    </Text>
                  </div>
                </div>
              </>
            ) : (
              <div style={{
                padding: "16px",
                background: "#fed7d7",
                borderRadius: "12px",
                border: "1px solid #fc8181",
                textAlign: "center"
              }}>
                <Text type="danger" style={{ fontWeight: 600 }}>
                  Không phát được âm thanh
                </Text>
              </div>
            )}
          </div>
        )}

        {hasImage && !imageError ? (
          <div style={{ 
            margin: "0 0 20px 0", 
            textAlign: "center",
            padding: "16px",
            background: "#f7fafc",
            borderRadius: "12px",
            border: "1px solid #e2e8f0"
          }}>
            <Image
              src={question.imageUrl}
              alt="Câu hỏi"
              style={{ 
                maxHeight: 400, 
                borderRadius: "12px", 
                objectFit: "contain",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
              }}
              onError={() => setImageError(true)}
              preview={false}
            />
          </div>
        ) : hasImage && imageError ? (
          <div style={{ 
            color: "#e53e3e", 
            textAlign: "center", 
            margin: "0 0 20px 0",
            padding: "16px",
            background: "#fed7d7",
            borderRadius: "12px",
            border: "1px solid #fc8181"
          }}>
            Không tải được ảnh
          </div>
        ) : null}

        <div style={{ 
          marginTop: "0",
          padding: "20px",
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          fontSize: "16px", 
          lineHeight: "1.8",
          color: "#2d3748"
        }}>
          <Text strong style={{ fontSize: "16px", color: "#2d3748" }}>
            {question.question}
          </Text>
        </div>
      </div>

      {/* PHẦN TRẢ LỜI */}
      {isWritingPart ? (
        <div className={styles.aBox} style={{ marginTop: 24 }}>
          <Text strong style={{ fontSize: "16px", color: "#2d3748", display: "block", marginBottom: "16px" }}>
            Viết câu trả lời
          </Text>
          <div>
            <TextArea
              rows={8}
              placeholder="Nhập câu trả lời của bạn..."
              value={
                typeof answers[question.testQuestionId] === "string"
                  ? answers[question.testQuestionId]
                  : ""
              }
              onChange={(e) => onAnswer(question.testQuestionId, e.target.value)}
              style={{ 
                fontSize: 14,
                borderRadius: "8px",
                border: "2px solid #e2e8f0"
              }}
            />
          </div>
        </div>
      ) : isSpeakingPart ? (
        <div className={styles.aBox} style={{ marginTop: 24 }}>
          <Text strong style={{ fontSize: "16px", color: "#2d3748", display: "block", marginBottom: "16px" }}>
            Ghi âm câu trả lời
          </Text>
          <div>
            {!isRecording && !recordedAudioUrl && (
              <Button
                type="primary"
                icon={<AudioOutlined />}
                onClick={handleStartRecording}
                size="large"
                style={{
                  borderRadius: "8px",
                  height: "48px",
                  padding: "0 32px",
                  fontSize: "16px",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
                }}
              >
                Bắt đầu ghi âm
              </Button>
            )}
            {isRecording && (
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 16,
                padding: "16px",
                background: "#fed7d7",
                borderRadius: "12px",
                border: "2px solid #fc8181"
              }}>
                <Button
                  type="primary"
                  danger
                  icon={<StopOutlined />}
                  onClick={handleStopRecording}
                  size="large"
                  style={{
                    borderRadius: "8px",
                    height: "40px",
                    padding: "0 24px",
                    fontWeight: 600
                  }}
                >
                  ⏹ Dừng ghi âm
                </Button>
                <div style={{ flex: 1 }}>
                  <Text type="danger" strong style={{ fontSize: "16px", display: "block" }}>
                    🔴 Đang ghi âm...
                  </Text>
                  <Text type="danger" style={{ fontSize: "14px", fontWeight: 600 }}>
                    {formatTime(recordingTime)}
                  </Text>
                </div>
              </div>
            )}
            {recordedAudioUrl && !isRecording && (
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: 16,
                padding: "20px",
                background: "#f0fdf4",
                borderRadius: "12px",
                border: "2px solid #86efac"
              }}>
                <div style={{ display: "flex", gap: "12px" }}>
                  <Button
                    icon={<PlayCircleOutlined />}
                    onClick={handlePlayRecording}
                    disabled={isPlaying}
                    size="large"
                    style={{
                      borderRadius: "8px",
                      height: "40px",
                      padding: "0 24px",
                      fontWeight: 600
                    }}
                  >
                    ▶ Phát lại
                  </Button>
                  <Button 
                    onClick={handleStartRecording}
                    size="large"
                    style={{
                      borderRadius: "8px",
                      height: "40px",
                      padding: "0 24px",
                      fontWeight: 600
                    }}
                  >
                    🔄 Ghi âm lại
                  </Button>
                </div>
                <audio
                  ref={audioRef}
                  src={recordedAudioUrl}
                  onEnded={() => setIsPlaying(false)}
                  style={{ display: "none" }}
                />
                <Text type="success" style={{ 
                  fontSize: "14px", 
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  ✅ Đã ghi âm thành công
                </Text>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.aBox} style={{ marginTop: 24 }}>
          <Text strong style={{ fontSize: "16px", color: "#2d3748", display: "block", marginBottom: "16px" }}>
            Chọn đáp án
          </Text>
          <div>
            <Radio.Group
              value={answers[question.testQuestionId]}
              onChange={(e) => onAnswer(question.testQuestionId, e.target.value)}
              style={{ width: "100%" }}
            >
              {question.options?.map((opt) => (
                <div 
                  key={opt.key} 
                  className={styles.optionRow}
                  style={{ 
                    margin: "12px 0",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "2px solid #e2e8f0",
                    transition: "all 0.2s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f7fafc";
                    e.currentTarget.style.borderColor = "#667eea";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                >
                  <Radio value={opt.key} style={{ width: "100%" }}>
                    <Text strong style={{ color: "#667eea", marginRight: "8px" }}>
                      {opt.key}.
                    </Text>
                    <Text style={{ fontSize: "15px", color: "#4a5568" }}>
                      {opt.text}
                    </Text>
                  </Radio>
                </div>
              ))}
            </Radio.Group>
          </div>
        </div>
      )}

      <div className={styles.qFooter}>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button 
            onClick={() => goToQuestionByIndex(currentIndex - 1)} 
            disabled={currentIndex === 0}
            size="large"
            style={{
              borderRadius: "8px",
              height: "40px",
              padding: "0 24px"
            }}
          >
            Câu trước
          </Button>
          <Button
            onClick={() => goToQuestionByIndex(currentIndex + 1)}
            disabled={currentIndex === totalCount - 1}
            size="large"
            style={{
              borderRadius: "8px",
              height: "40px",
              padding: "0 24px"
            }}
          >
            Câu sau
          </Button>
        </div>
        <Button 
          type="primary" 
          onClick={handleSubmit}
          size="large"
          style={{
            borderRadius: "8px",
            height: "40px",
            padding: "0 32px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
          }}
        >
          Nộp bài
        </Button>
      </div>
    </Card>
  );
}