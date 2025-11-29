import React, { useRef, useState, useEffect } from "react";
import { Card, Typography, Radio, Button, Image, Progress, Input, message, Modal, Select, Tooltip, Radio as AntRadio } from "antd";
import { AudioOutlined, StopOutlined, PlayCircleOutlined, FlagOutlined } from "@ant-design/icons";
import styles from "../../styles/Exam.module.css";
import { uploadFile } from "../../../services/filesService";
import { reportQuestion } from "../../../services/questionReportService";
import { translateErrorMessage } from "@shared/utils/translateError";
import { getUserFlashcardSets, createFlashcardSet, addFlashcardFromTest } from "../../../services/flashcardService";
import { useAuth } from "@shared/hooks/useAuth";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Bảng màu highlight
const HIGHLIGHT_COLORS = ["#fef08a", "#bfdbfe", "#bbf7d0", "#fed7aa"];

// Hàm chuyển đổi WebM Blob sang WAV File
const convertWebmToWav = async (webmBlob) => {
  return new Promise(async (resolve, reject) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await webmBlob.arrayBuffer();

      // Thử decode audio data
      let audioBuffer;
      try {
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
      } catch (decodeError) {
        // Nếu không decode được trực tiếp, thử dùng audio element
        console.warn("Direct decode failed, trying with audio element:", decodeError);
        const audio = new Audio();
        const audioUrl = URL.createObjectURL(webmBlob);

        await new Promise((resolveLoad, rejectLoad) => {
          audio.onloadedmetadata = resolveLoad;
          audio.onerror = () => rejectLoad(new Error("Failed to load audio"));
          audio.src = audioUrl;
        });

        // Tạo OfflineAudioContext để render
        const offlineContext = new OfflineAudioContext(
          1, // mono
          Math.ceil(audio.duration * 44100), // frames
          44100 // sample rate
        );

        const source = offlineContext.createBufferSource();
        const response = await fetch(audioUrl);
        const arrayBuffer2 = await response.arrayBuffer();
        audioBuffer = await offlineContext.decodeAudioData(arrayBuffer2);
        source.buffer = audioBuffer;
        source.connect(offlineContext.destination);
        source.start(0);

        audioBuffer = await offlineContext.startRendering();
        URL.revokeObjectURL(audioUrl);
      }

      // Lấy thông số audio
      const numberOfChannels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      const length = audioBuffer.length;

      // Tạo WAV buffer
      const wavBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
      const view = new DataView(wavBuffer);

      // WAV header
      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + length * numberOfChannels * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numberOfChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numberOfChannels * 2, true);
      view.setUint16(32, numberOfChannels * 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, length * numberOfChannels * 2, true);

      // Convert to 16-bit PCM
      let offset = 44;
      for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
          view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
          offset += 2;
        }
      }

      // Cleanup
      if (audioContext.state !== 'closed') {
        await audioContext.close();
      }

      const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
      resolve(wavBlob);
    } catch (error) {
      console.error("Error converting WebM to WAV:", error);
      reject(error);
    }
  });
};

const formatQuestionText = (text) => {
  if (typeof text !== "string") return text || "";
  return text.replace(/\r\n/g, "\n");
};

export default function QuestionCard({
  question,
  currentIndex,
  totalCount,
  answers,
  onAnswer,
  goToQuestionByIndex,
  handleSubmit,
  isSubmitting = false,
  globalAudioUrl,
  testType = "Simulator", // Thêm prop testType để xác định loại bài thi
  testResultId, // testResultId để lưu trạng thái đã phát audio
  isIncorrect = undefined, // Prop để xác định câu hỏi làm sai (undefined = trong quá trình làm bài, true = làm sai ở result, false = làm đúng ở result)
  isReported = false, // Prop để xác định câu hỏi đã được report
  onReportSuccess, // Callback khi report thành công
}) {
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const previousGlobalAudioUrlRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportType, setReportType] = useState("IncorrectAnswer");
  const [reportDescription, setReportDescription] = useState("");
  const [reporting, setReporting] = useState(false);

  // Flashcard from exam
  const { isAuthenticated } = useAuth();
  const [flashcardModalVisible, setFlashcardModalVisible] = useState(false);
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [flashcardLoading, setFlashcardLoading] = useState(false);
  const [flashcardMode, setFlashcardMode] = useState("existing"); // 'existing' | 'new'
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [newSetTitle, setNewSetTitle] = useState("");
  const [newSetDescription, setNewSetDescription] = useState("");
  const [flashcardTerm, setFlashcardTerm] = useState("");
  const [flashcardDefinition, setFlashcardDefinition] = useState("");
  const [flashcardPronunciation, setFlashcardPronunciation] = useState("");
  const [flashcardWordType, setFlashcardWordType] = useState("");
  const [flashcardExamplesInput, setFlashcardExamplesInput] = useState("");
  const [flashcardNotes, setFlashcardNotes] = useState("");

  // Highlight text
  const [highlights, setHighlights] = useState([]);
  const [highlightColor, setHighlightColor] = useState(HIGHLIGHT_COLORS[0]);
  const [highlightToolbarVisible, setHighlightToolbarVisible] = useState(false);
  const [highlightToolbarPos, setHighlightToolbarPos] = useState({ top: 0, left: 0 });
  const [pendingSelection, setPendingSelection] = useState({ start: 0, end: 0, text: "" });
  const questionTextContainerRef = useRef(null);

  const isListeningPart = question.partId >= 1 && question.partId <= 4;
  const isWritingPart = question.partId >= 8 && question.partId <= 10;
  const isSpeakingPart = question.partId >= 11 && question.partId <= 15;
  const isLrPart = question.partId >= 1 && question.partId <= 7;
  const isPart1Or2 = question.partId === 1 || question.partId === 2;
  const hasGlobalAudio = globalAudioUrl && globalAudioUrl.trim() !== "";
  const hasImage = question.imageUrl && question.imageUrl.trim() !== "";
  const isPractice = testType && testType.toLowerCase() === "practice";
  const isSimulator = testType && testType.toLowerCase() === "simulator";
  // Xác định audio URL: Practice dùng audioUrl riêng của từng câu, Simulator dùng globalAudioUrl
  const questionAudioUrl = question.audioUrl && question.audioUrl.trim() !== "" ? question.audioUrl : null;
  // Logic: Practice dùng audioUrl riêng của từng câu (nếu có), Simulator dùng globalAudioUrl (nếu có)
  let effectiveAudioUrl = null;
  if (isPractice && questionAudioUrl) {
    effectiveAudioUrl = questionAudioUrl;
  } else if (isSimulator && hasGlobalAudio) {
    effectiveAudioUrl = globalAudioUrl;
  } else if (questionAudioUrl) {
    // Fallback: nếu có questionAudioUrl thì dùng
    effectiveAudioUrl = questionAudioUrl;
  } else if (hasGlobalAudio) {
    // Fallback: nếu có globalAudioUrl thì dùng
    effectiveAudioUrl = globalAudioUrl;
  }

  // Hàm lấy key để lưu trạng thái đã phát audio vào sessionStorage
  const getAudioPlayedKey = () => {
    if (!testResultId || !isSimulator || !effectiveAudioUrl) return null;
    // Với simulator, 1 file audio dùng cho tất cả các part listening (1, 2, 3, 4)
    // Mỗi test result chỉ có 1 globalAudioUrl duy nhất, nên chỉ cần lưu theo testResultId
    return `toeic_audio_played_${testResultId}`;
  };
  
  // Hàm kiểm tra xem đã phát audio chưa từ sessionStorage
  const checkAudioPlayedFromStorage = () => {
    const key = getAudioPlayedKey();
    if (!key) return false;
    try {
      const played = sessionStorage.getItem(key);
      return played === "true";
    } catch (error) {
      console.error("Error reading audio played state from sessionStorage:", error);
      return false;
    }
  };
  
  // Hàm lưu trạng thái đã phát audio vào sessionStorage
  const saveAudioPlayedToStorage = () => {
    const key = getAudioPlayedKey();
    if (!key) return;
    try {
      sessionStorage.setItem(key, "true");
    } catch (error) {
      console.error("Error saving audio played state to sessionStorage:", error);
    }
  };
  
  const [hasPlayedAudio, setHasPlayedAudio] = useState(() => checkAudioPlayedFromStorage()); // Track xem đã phát audio chưa (cho simulator)

  // Chuyển node + offset thành offset toàn cục trong text
  const getGlobalOffset = (root, node, localOffset) => {
    if (!root || !node) return 0;
    let total = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    while (walker.nextNode()) {
      const current = walker.currentNode;
      if (current === node) {
        return total + localOffset;
      }
      total += current.textContent.length;
    }
    return total;
  };

  // Render câu hỏi với highlight
  const renderQuestionWithHighlights = () => {
    const raw = formatQuestionText(question.question || "");
    if (!highlights || highlights.length === 0) {
      return raw;
    }

    const sorted = [...highlights].sort((a, b) => a.start - b.start);
    const segments = [];
    let cursor = 0;

    sorted.forEach((h, idx) => {
      const start = Math.max(0, Math.min(raw.length, h.start));
      const end = Math.max(start, Math.min(raw.length, h.end));

      if (start > cursor) {
        segments.push({
          text: raw.slice(cursor, start),
          highlight: null,
          key: `n-${idx}-${cursor}`,
        });
      }

      if (end > start) {
        segments.push({
          text: raw.slice(start, end),
          highlight: h.color,
          key: `h-${idx}-${start}`,
        });
      }

      cursor = end;
    });

    if (cursor < raw.length) {
      segments.push({
        text: raw.slice(cursor),
        highlight: null,
        key: `n-end-${cursor}`,
      });
    }

    return segments.map((seg) =>
      seg.highlight ? (
        <span
          key={seg.key}
          style={{
            backgroundColor: seg.highlight,
            borderRadius: 2,
            padding: "0 1px",
          }}
        >
          {seg.text}
        </span>
      ) : (
        seg.text
      )
    );
  };

  useEffect(() => {
    let previousUrl = recordedAudioUrl;

    // Kiểm tra xem có phải chuyển câu trong cùng phần nghe không (chỉ áp dụng cho Simulator với globalAudioUrl)
    // Nếu previousGlobalAudioUrlRef.current là null, đó là lần đầu tiên, nên không phải cùng audio
    const isSameAudio = previousGlobalAudioUrlRef.current !== null && previousGlobalAudioUrlRef.current === effectiveAudioUrl && isSimulator;
    const isAudioCurrentlyPlaying = audioRef.current && !audioRef.current.paused && !audioRef.current.ended;
    const shouldKeepAudioPlaying = isListeningPart && isSimulator && hasGlobalAudio && isAudioCurrentlyPlaying && isSameAudio;

    // Chỉ reset trạng thái playing nếu không phải giữ audio phát
    // Với Practice mode, mỗi câu có audio riêng nên luôn reset khi chuyển câu
    if (!shouldKeepAudioPlaying) {
      setIsPlaying(false);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }

    // Với simulator, kiểm tra trạng thái đã phát audio từ sessionStorage
    // Nếu đã phát audio trong part này rồi (từ sessionStorage), set hasPlayedAudio = true
    // Với Practice mode, mỗi câu có audio riêng nên không cần kiểm tra
    if (isSimulator && !shouldKeepAudioPlaying) {
      const playedFromStorage = checkAudioPlayedFromStorage();
      setHasPlayedAudio(playedFromStorage);
    }

    setImageError(false);
    setIsRecording(false);
    setRecordingTime(0);
    setIsUploading(false);
    audioChunksRef.current = [];

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    // Lưu audio URL hiện tại để so sánh lần sau
    previousGlobalAudioUrlRef.current = effectiveAudioUrl;

    // Load lại answer đã lưu nếu có
    // Tạo key duy nhất cho mỗi câu hỏi, bao gồm cả subQuestionIndex cho group questions
    // Chuẩn hóa: null/undefined = 0, nhưng nếu là 0 thì không thêm vào key
    const subIndex = question.subQuestionIndex !== undefined && question.subQuestionIndex !== null
      ? question.subQuestionIndex
      : 0;
    // Đảm bảo testQuestionId là string để tránh type mismatch
    const testQuestionIdStr = String(question.testQuestionId);
    const answerKey = subIndex !== 0
      ? `${testQuestionIdStr}_${subIndex}`
      : testQuestionIdStr;
    const savedAnswer = answers[answerKey];
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
  }, [question.testQuestionId, answers, isSpeakingPart, globalAudioUrl, isListeningPart, hasGlobalAudio, isPractice, isSimulator, questionAudioUrl]);

  // Reset highlight khi chuyển câu hỏi
  useEffect(() => {
    setHighlights([]);
    setHighlightToolbarVisible(false);
    setPendingSelection({ start: 0, end: 0, text: "" });
  }, [question.testQuestionId, question.subQuestionIndex]);

  useEffect(() => {
    if (!audioRef.current || !effectiveAudioUrl) return;
    const audio = audioRef.current;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnd = () => {
      setIsPlaying(false);
      // Khi audio kết thúc, đánh dấu đã phát (chỉ với simulator) và lưu vào sessionStorage
      if (isSimulator) {
        setHasPlayedAudio(true);
        saveAudioPlayedToStorage();
      }
    };
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
  }, [effectiveAudioUrl, question]);

  const toggleAudio = () => {
    if (!audioRef.current || audioError) return;
    
    // Kiểm tra loại bài thi
    const isPractice = testType && testType.toLowerCase() === "practice";
    
    if (isPlaying) {
      // Nếu là Practice thì cho phép pause
      if (isPractice) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      // Nếu là Simulator thì không cho pause (không làm gì)
    } else {
      // Kiểm tra xem đã phát audio chưa (chỉ với simulator)
      if (isSimulator && hasPlayedAudio) {
        // Đã phát rồi, không cho phép phát lại
        return;
      }
      
      // Phát audio
      audioRef.current.play().catch(() => setAudioError(true));
      setIsPlaying(true);
      
      // Đánh dấu đã phát audio (chỉ với simulator) và lưu vào sessionStorage
      if (isSimulator) {
        setHasPlayedAudio(true);
        saveAudioPlayedToStorage();
      }
    }
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

      mediaRecorder.onstop = async () => {
        if (recordingTimer) {
          clearInterval(recordingTimer);
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const tempUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(tempUrl);

        // Tạo key duy nhất cho mỗi câu hỏi
        const subIndex = question.subQuestionIndex !== undefined && question.subQuestionIndex !== null
          ? question.subQuestionIndex
          : 0;
        // Đảm bảo testQuestionId là string để tránh type mismatch
        const testQuestionIdStr = String(question.testQuestionId);
        const answerKey = subIndex !== 0
          ? `${testQuestionIdStr}_${subIndex}`
          : testQuestionIdStr;

        // Upload audio ngay sau khi ghi âm xong
        setIsUploading(true);
        try {
          let audioFile;

          // Thử chuyển đổi WebM sang WAV format
          try {
            const wavBlob = await convertWebmToWav(audioBlob);
            audioFile = new File([wavBlob], `speaking_${question.testQuestionId}_${question.subQuestionIndex || 0}.wav`, {
              type: "audio/wav",
            });
          } catch (convertError) {
            console.warn("Failed to convert to WAV, trying with original format:", convertError);
            // Fallback: thử upload webm với extension .wav
            audioFile = new File([audioBlob], `speaking_${question.testQuestionId}_${question.subQuestionIndex || 0}.wav`, {
              type: "audio/webm",
            });
          }

          const uploadedUrl = await uploadFile(audioFile, "audio");

          // Lưu URL vào answers thay vì Blob
          onAnswer(answerKey, uploadedUrl);

          // Cập nhật URL hiển thị thành URL từ server
          setRecordedAudioUrl(uploadedUrl);

          // Revoke temp blob URL
          URL.revokeObjectURL(tempUrl);

          message.success("Đã upload audio thành công");
        } catch (error) {
          console.error("Error uploading audio:", error);
          const errorMessage = translateErrorMessage(error.response?.data?.message || error.message) || "Không thể upload audio";
          message.error(`Lỗi upload audio: ${errorMessage}. Vui lòng thử lại.`);
          // Nếu upload thất bại, vẫn lưu Blob để có thể upload lại khi submit
          onAnswer(answerKey, audioBlob);
        } finally {
          setIsUploading(false);
        }

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

  // === REPORT QUESTION ===
  const handleOpenReportModal = () => {
    // Kiểm tra xem đã report chưa
    if (isReported) {
      message.info("Bạn đã báo cáo câu hỏi này rồi");
      return;
    }
    setReportModalVisible(true);
    setReportType("IncorrectAnswer");
    setReportDescription("");
  };

  const handleCloseReportModal = () => {
    setReportModalVisible(false);
    setReportType("IncorrectAnswer");
    setReportDescription("");
  };

  const handleSubmitReport = async () => {
    if (!reportDescription.trim()) {
      message.warning("Vui lòng nhập mô tả chi tiết");
      return;
    }

    try {
      setReporting(true);
      await reportQuestion(question.testQuestionId, reportType, reportDescription);
      message.success("Đã gửi báo cáo thành công");
      handleCloseReportModal();
      if (onReportSuccess) {
        onReportSuccess(question.testQuestionId);
      }
    } catch (error) {
      console.error("Error reporting question:", error);
      let errorMsg = translateErrorMessage(error?.response?.data?.message || error?.message) || "Không thể gửi báo cáo";
      
      // Chuyển đổi thông báo lỗi tiếng Anh sang tiếng Việt
      if (errorMsg.toLowerCase().includes("already reported") || 
          errorMsg.toLowerCase().includes("đã báo cáo")) {
        errorMsg = "Bạn đã báo cáo câu hỏi này rồi";
        // Cập nhật trạng thái isReported nếu có callback
        if (onReportSuccess) {
          onReportSuccess(question.testQuestionId);
        }
      }
      
      message.error(errorMsg);
    } finally {
      setReporting(false);
    }
  };

  const handleSaveFlashcard = async () => {
    if (!flashcardTerm || !flashcardTerm.trim()) {
      message.warning("Vui lòng nhập từ / cụm từ để lưu vào flashcard.");
      return;
    }
    if (flashcardMode === "existing" && !selectedSetId) {
      message.warning("Vui lòng chọn bộ flashcard.");
      return;
    }
    if (flashcardMode === "new" && !newSetTitle.trim()) {
      message.warning("Vui lòng nhập tên bộ flashcard mới.");
      return;
    }

    try {
      setFlashcardLoading(true);
      let targetSetId = selectedSetId;

      if (flashcardMode === "new") {
        const payload = {
          title: newSetTitle.trim(),
          description: newSetDescription?.trim() || null,
          language: "en-US",
          isPublic: false,
        };
        const created = await createFlashcardSet(payload);
        targetSetId = created?.setId || created?.id;
        if (!targetSetId) {
          message.error("Không lấy được ID bộ flashcard vừa tạo.");
          return;
        }
        const sets = await getUserFlashcardSets();
        setFlashcardSets(Array.isArray(sets) ? sets : []);
        setSelectedSetId(targetSetId);
      }

      const examples =
        flashcardExamplesInput
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);

      const cardPayload = {
        setId: targetSetId,
        term: flashcardTerm.trim(),
        definition: flashcardDefinition?.trim() || flashcardTerm.trim(),
        pronunciation: flashcardPronunciation?.trim() || null,
        wordType: flashcardWordType?.trim() || null,
        examples,
        notes:
          flashcardNotes?.trim() ||
          `Found in TOEIC ${testType} test, question ${
            question.globalIndex ?? question.index ?? ""
          }`,
      };

      await addFlashcardFromTest(cardPayload);
      message.success("Đã thêm thẻ flashcard từ bài thi!");
      setFlashcardModalVisible(false);
    } catch (error) {
      console.error("Lỗi khi lưu flashcard từ bài thi:", error);
      const errorMsg =
        error?.response?.data?.message || "Không thể lưu flashcard từ bài thi.";
      message.error(errorMsg);
    } finally {
      setFlashcardLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 24,
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
    <Card
      style={{
        margin: 0,
        borderRadius: "16px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        border: "none",
          overflow: "hidden",
          flex: "1 1 520px",
      }}
      bodyStyle={{ padding: "32px" }}
    >
      <div className={styles.questionHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Title level={4} style={{ margin: 0, color: "#2d3748", fontSize: "24px" }}>
            Câu {question.globalIndex}
          </Title>
          {/* Nút Report - gọn gàng, chỉ icon với tooltip, ở sau text "Câu..." */}
          <Tooltip title={isReported ? "Đã báo cáo câu hỏi này" : "Báo cáo câu hỏi"}>
            {isReported ? (
              <FlagOutlined 
                style={{ 
                  color: "#52c41a", 
                  fontSize: "18px", 
                  cursor: "default" 
                }} 
              />
            ) : (
              <Button
                type="text"
                icon={<FlagOutlined />}
                size="small"
                onClick={handleOpenReportModal}
                style={{ 
                  padding: "0 4px",
                  height: "auto",
                  minWidth: "auto",
                  color: "#666",
                  fontSize: "18px"
                }}
              />
            )}
          </Tooltip>
        </div>
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
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
            whiteSpace: "pre-line" // Giữ nguyên xuống dòng từ \r\n và \n
          }}>
            <Text italic style={{ fontSize: "15px", lineHeight: "1.8", color: "#4a5568" }}>
              {question.passage}
            </Text>
          </div>
        )}

        {isListeningPart && effectiveAudioUrl && (
          <div className={styles.audioBox} style={{ margin: "0 0 20px 0" }}>
            {!audioError ? (
              <>
                <audio ref={audioRef} src={effectiveAudioUrl} />
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <Button
                    size="large"
                    onClick={toggleAudio}
                    type={isPlaying ? "primary" : "default"}
                    disabled={(isPlaying && !isPractice) || (isSimulator && hasPlayedAudio && !isPlaying)}
                    style={{
                      borderRadius: "8px",
                      height: "40px",
                      padding: "0 24px",
                      fontWeight: 600,
                      boxShadow: isPlaying ? "0 4px 12px rgba(102, 126, 234, 0.3)" : "none"
                    }}
                  >
                      {isPlaying 
                        ? (isPractice ? "Tạm dừng" : "Đang phát...") 
                        : (isSimulator && hasPlayedAudio ? "Đã nghe" : "Nghe")}
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

          {/* Thanh công cụ highlight + flashcard */}
          {highlightToolbarVisible && (
            <div
              style={{
                position: "fixed",
                top: highlightToolbarPos.top,
                left: highlightToolbarPos.left,
                background: "#111827",
                color: "#fff",
                padding: "6px 8px",
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 10px rgba(15,23,42,0.35)",
                zIndex: 20,
              }}
            >
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    if (pendingSelection.end > pendingSelection.start) {
                      const start = pendingSelection.start;
                      const end = pendingSelection.end;
                      setHighlights((prev) => {
                        // Loại bỏ mọi highlight cũ bị chồng lấn với vùng mới
                        const cleaned = prev.filter(
                          (h) => h.end <= start || h.start >= end
                        );
                        return [...cleaned, { start, end, color: c }];
                      });
                      setHighlightColor(c);
                    }
                  }}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: c === highlightColor ? "2px solid #fff" : "1px solid #e5e7eb",
                    backgroundColor: c,
                    cursor: "pointer",
                  }}
                />
              ))}
              <span
                style={{
                  width: 1,
                  height: 18,
                  background: "rgba(148,163,184,0.7)",
                  margin: "0 4px",
                }}
              />
              <Button
                size="small"
                type="primary"
                style={{ borderRadius: 16, padding: "0 10px" }}
                onClick={async () => {
                  if (!pendingSelection.text) return;
                  if (!isAuthenticated) {
                    message.warning("Vui lòng đăng nhập để lưu flashcard.");
                    return;
                  }
                  try {
                    setFlashcardTerm(pendingSelection.text);
                    setFlashcardDefinition("");
                    setFlashcardMode("existing");
                    setNewSetTitle("");
                    setNewSetDescription("");
                    setSelectedSetId(null);
                    setFlashcardPronunciation("");
                    setFlashcardWordType("");
                    setFlashcardExamplesInput("");
                    setFlashcardNotes(
                      `Found in TOEIC ${testType} test, question ${
                        question.globalIndex ?? question.index ?? ""
                      }`
                    );
                    setFlashcardModalVisible(true);
                    setFlashcardLoading(true);
                    const sets = await getUserFlashcardSets();
                    setFlashcardSets(Array.isArray(sets) ? sets : []);
                    if (Array.isArray(sets) && sets.length > 0) {
                      setSelectedSetId(sets[0].setId);
                    }
                  } catch (error) {
                    console.error("Không thể tải danh sách flashcard:", error);
                    const errorMsg =
                      error?.response?.data?.message || "Không thể tải danh sách flashcard";
                    message.error(errorMsg);
                  } finally {
                    setFlashcardLoading(false);
                    setHighlightToolbarVisible(false);
                  }
                }}
              >
                + Thẻ
              </Button>
              <button
                type="button"
                onClick={() => setHighlightToolbarVisible(false)}
                style={{
                  marginLeft: 4,
                  background: "transparent",
                  border: "none",
                  color: "#e5e7eb",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                ×
              </button>
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

          {/* Chỉ hiển thị nội dung câu hỏi nếu không phải Part 1 hoặc Part 2 */}
          {!isPart1Or2 && (
            <div
              ref={questionTextContainerRef}
              style={{
            marginTop: "0",
            padding: "20px",
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            fontSize: "16px",
            lineHeight: "1.8",
            color: "#2d3748",
                whiteSpace: "pre-line", // Giữ nguyên xuống dòng từ \r\n và \n
                cursor: "text",
              }}
              onMouseUp={() => {
                if (typeof window === "undefined" || !window.getSelection) return;
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;

                const range = selection.getRangeAt(0);
                const text = selection.toString().trim();
                if (!text) {
                  setHighlightToolbarVisible(false);
                  return;
                }

                const rootEl = questionTextContainerRef.current;
                // Tính offset toàn cục trong toàn bộ câu hỏi, không chỉ trong text node hiện tại
                const start = getGlobalOffset(
                  rootEl,
                  range.startContainer,
                  range.startOffset
                );
                const end = getGlobalOffset(rootEl, range.endContainer, range.endOffset);
                setPendingSelection({ start, end, text });

                // Tính vị trí toolbar theo viewport (hiển thị ngay trên vùng bôi đen)
                const rect = range.getBoundingClientRect();
                setHighlightToolbarPos({
                  top: rect.top + window.scrollY - 40,
                  left: rect.left + window.scrollX,
                });
                setHighlightToolbarVisible(true);
              }}
            >
            <Text strong style={{ fontSize: "16px", color: "#2d3748" }}>
                {renderQuestionWithHighlights()}
            </Text>
          </div>
          )}
      </div>
      </Card>

      <Card
        style={{
          margin: 0,
          borderRadius: "16px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          border: "none",
          overflow: "hidden",
          flex: "1 1 420px",
        }}
        bodyStyle={{ padding: "32px" }}
      >
      {/* PHẦN TRẢ LỜI */}
      {isWritingPart ? (
          <div className={styles.aBox} style={{ marginTop: 0 }}>
          <Text strong style={{ fontSize: "16px", color: "#2d3748", display: "block", marginBottom: "16px" }}>
            Viết câu trả lời
          </Text>
          <div style={{ position: "relative" }}>
            <TextArea
              rows={8}
              placeholder="Nhập câu trả lời của bạn..."
              value={(() => {
                // Tạo key duy nhất cho mỗi câu hỏi, bao gồm cả subQuestionIndex cho group questions
                // Chuẩn hóa: null/undefined = 0, nhưng nếu là 0 thì không thêm vào key
                const subIndex = question.subQuestionIndex !== undefined && question.subQuestionIndex !== null
                  ? question.subQuestionIndex
                  : 0;
                // Đảm bảo testQuestionId là string để tránh type mismatch
                const testQuestionIdStr = String(question.testQuestionId);
                const answerKey = subIndex !== 0
                  ? `${testQuestionIdStr}_${subIndex}`
                  : testQuestionIdStr;
                const answerValue = typeof answers[answerKey] === "string" ? answers[answerKey] : "";
                return answerValue;
              })()}
              onChange={(e) => {
                // Tạo key duy nhất cho mỗi câu hỏi, bao gồm cả subQuestionIndex cho group questions
                // Chuẩn hóa: null/undefined = 0, nhưng nếu là 0 thì không thêm vào key
                const subIndex = question.subQuestionIndex !== undefined && question.subQuestionIndex !== null
                  ? question.subQuestionIndex
                  : 0;
                // Đảm bảo testQuestionId là string để tránh type mismatch
                const testQuestionIdStr = String(question.testQuestionId);
                const answerKey = subIndex !== 0
                  ? `${testQuestionIdStr}_${subIndex}`
                  : testQuestionIdStr;
                onAnswer(answerKey, e.target.value);
              }}
              style={{
                fontSize: 14,
                borderRadius: "8px",
                border: "2px solid #e2e8f0",
                paddingBottom: 40
              }}
            />
            {/* Đếm từ và ký tự */}
            <div
              style={{
                position: "absolute",
                bottom: 8,
                right: 12,
                fontSize: 12,
                color: "#999",
                display: "flex",
                gap: 16,
                background: "rgba(255, 255, 255, 0.9)",
                padding: "4px 8px",
                borderRadius: "4px"
              }}
            >
              <span>
                Từ: {(() => {
                  const subIndex = question.subQuestionIndex !== undefined && question.subQuestionIndex !== null
                    ? question.subQuestionIndex
                    : 0;
                  const testQuestionIdStr = String(question.testQuestionId);
                  const answerKey = subIndex !== 0
                    ? `${testQuestionIdStr}_${subIndex}`
                    : testQuestionIdStr;
                  const answerValue = typeof answers[answerKey] === "string" ? answers[answerKey] : "";
                  // Đếm từ: split bằng khoảng trắng và filter các từ không rỗng
                  const wordCount = answerValue.trim() === "" ? 0 : answerValue.trim().split(/\s+/).length;
                  return wordCount;
                })()}
              </span>
              <span>
                Ký tự: {(() => {
                  const subIndex = question.subQuestionIndex !== undefined && question.subQuestionIndex !== null
                    ? question.subQuestionIndex
                    : 0;
                  const testQuestionIdStr = String(question.testQuestionId);
                  const answerKey = subIndex !== 0
                    ? `${testQuestionIdStr}_${subIndex}`
                    : testQuestionIdStr;
                  const answerValue = typeof answers[answerKey] === "string" ? answers[answerKey] : "";
                  return answerValue.length;
                })()}
              </span>
            </div>
          </div>
        </div>
      ) : isSpeakingPart ? (
        <div className={styles.aBox} style={{ marginTop: 0 }}>
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
                  Dừng ghi âm
                </Button>
                <div style={{ flex: 1 }}>
                  <Text type="danger" strong style={{ fontSize: "16px", display: "block" }}>
                    Đang ghi âm...
                  </Text>
                  <Text type="danger" style={{ fontSize: "14px", fontWeight: 600 }}>
                    {formatTime(recordingTime)}
                  </Text>
                </div>
              </div>
            )}
            {isUploading && (
              <div style={{
                padding: "20px",
                background: "#fef3c7",
                borderRadius: "12px",
                border: "2px solid #fbbf24",
                textAlign: "center"
              }}>
                <Text style={{ fontSize: "14px", fontWeight: 600, color: "#92400e" }}>
                  Đang upload audio...
                </Text>
              </div>
            )}
            {recordedAudioUrl && !isRecording && !isUploading && (
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
                    Phát lại
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
                    Ghi âm lại
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
                  {recordedAudioUrl.startsWith("http") ? "Đã upload và lưu thành công" : "Đã ghi âm thành công"}
                </Text>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.aBox} style={{ marginTop: 0 }}>
          <Text strong style={{ fontSize: "16px", color: "#2d3748", display: "block", marginBottom: "16px" }}>
            Chọn đáp án
          </Text>
          <div>
            <Radio.Group
              value={(() => {
                // Tạo key duy nhất cho mỗi câu hỏi, bao gồm cả subQuestionIndex cho group questions
                // Chuẩn hóa: null/undefined = 0, nhưng nếu là 0 thì không thêm vào key
                const subIndex = question.subQuestionIndex !== undefined && question.subQuestionIndex !== null
                  ? question.subQuestionIndex
                  : 0;
                // Đảm bảo testQuestionId là string để tránh type mismatch
                const testQuestionIdStr = String(question.testQuestionId);
                const answerKey = subIndex !== 0
                  ? `${testQuestionIdStr}_${subIndex}`
                  : testQuestionIdStr;
                const answerValue = answers[answerKey];
                return answerValue;
              })()}
              onChange={(e) => {
                // Tạo key duy nhất cho mỗi câu hỏi, bao gồm cả subQuestionIndex cho group questions
                // Chuẩn hóa: null/undefined = 0, nhưng nếu là 0 thì không thêm vào key
                const subIndex = question.subQuestionIndex !== undefined && question.subQuestionIndex !== null
                  ? question.subQuestionIndex
                  : 0;
                // Đảm bảo testQuestionId là string để tránh type mismatch
                const testQuestionIdStr = String(question.testQuestionId);
                const answerKey = subIndex !== 0
                  ? `${testQuestionIdStr}_${subIndex}`
                  : testQuestionIdStr;
                const currentValue = answers[answerKey];
                // Nếu click vào radio đã chọn, bỏ chọn (set về null)
                if (currentValue === e.target.value) {
                  onAnswer(answerKey, null);
                } else {
                  onAnswer(answerKey, e.target.value);
                }
              }}
              style={{ width: "100%" }}
            >
              {question.options?.map((opt) => {
                // Tạo key duy nhất cho mỗi câu hỏi
                // Chuẩn hóa: null/undefined = 0, nhưng nếu là 0 thì không thêm vào key
                const subIndex = question.subQuestionIndex !== undefined && question.subQuestionIndex !== null
                  ? question.subQuestionIndex
                  : 0;
                // Đảm bảo testQuestionId là string để tránh type mismatch
                const testQuestionIdStr = String(question.testQuestionId);
                const answerKey = subIndex !== 0
                  ? `${testQuestionIdStr}_${subIndex}`
                  : testQuestionIdStr;
                const currentValue = answers[answerKey];
                const isSelected = currentValue === opt.key;
                
                return (
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
                    onClick={(e) => {
                      // Nếu click vào radio đã chọn, bỏ chọn
                      if (isSelected) {
                        e.preventDefault();
                        e.stopPropagation();
                        // Đảm bảo answerKey được tạo đúng
                        const subIdx = question.subQuestionIndex !== undefined && question.subQuestionIndex !== null
                          ? question.subQuestionIndex
                          : 0;
                        const testQuestionIdStr = String(question.testQuestionId);
                        const correctAnswerKey = subIdx !== 0
                          ? `${testQuestionIdStr}_${subIdx}`
                          : testQuestionIdStr;
                        onAnswer(correctAnswerKey, null);
                      }
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
                      {/* Chỉ hiển thị nội dung đáp án nếu không phải Part 1 hoặc Part 2 */}
                      {!isPart1Or2 && (
                        <Text style={{ fontSize: "15px", color: "#4a5568" }}>
                          {opt.text}
                        </Text>
                      )}
                    </Radio>
                  </div>
                );
              })}
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
          disabled={isSubmitting}
          loading={isSubmitting}
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

      {/* Modal Report Question */}
      <Modal
        title="Báo cáo câu hỏi"
        open={reportModalVisible}
        onOk={handleSubmitReport}
        onCancel={handleCloseReportModal}
        okText="Gửi báo cáo"
        cancelText="Hủy"
        confirmLoading={reporting}
        width={600}
        style={{ paddingBottom: 0 }}
        bodyStyle={{ paddingBottom: 24 }}
      >
        {question?.question && (
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Câu hỏi:
            </Text>
            <div
              style={{
                padding: 12,
                background: "#fafafa",
                borderRadius: 8,
                border: "1px solid #f0f0f0",
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
              }}
            >
              {formatQuestionText(question.question)}
            </div>
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            Loại báo cáo:
          </Text>
          <Select
            value={reportType}
            onChange={setReportType}
            style={{ width: "100%" }}
            size="large"
          >
            <Select.Option value="IncorrectAnswer">Đáp án sai</Select.Option>
            <Select.Option value="Typo">Lỗi chính tả</Select.Option>
            <Select.Option value="AudioIssue">Vấn đề về âm thanh</Select.Option>
            <Select.Option value="ImageIssue">Vấn đề về hình ảnh</Select.Option>
            <Select.Option value="Unclear">Câu hỏi không rõ ràng</Select.Option>
            <Select.Option value="Other">Khác</Select.Option>
          </Select>
        </div>
        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            Mô tả chi tiết:
          </Text>
          <div style={{ position: "relative" }}>
            <TextArea
              rows={4}
              placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              maxLength={500}
              style={{ paddingBottom: 28 }}
            />
            <span
              style={{
                position: "absolute",
                right: 8,
                bottom: 6,
                fontSize: 12,
                color: "#999",
              }}
            >
              {(reportDescription || "").length}/500
            </span>
          </div>
        </div>
      </Modal>
      
      {/* Modal thêm vào Flashcard */}
      <Modal
        title="Thêm vào flashcard"
        open={flashcardModalVisible}
        onOk={handleSaveFlashcard}
        onCancel={() => setFlashcardModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={flashcardLoading}
        width={640}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            Nội dung đã chọn
          </Text>
          <div
            style={{
              padding: 12,
              background: "#f7fafc",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              whiteSpace: "pre-wrap",
            }}
          >
            {flashcardTerm}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            Bộ flashcard
          </Text>
          <AntRadio.Group
            value={flashcardMode}
            onChange={(e) => setFlashcardMode(e.target.value)}
            style={{ marginBottom: 8 }}
          >
            <AntRadio value="existing">Thêm vào bộ có sẵn</AntRadio>
            <AntRadio value="new">Tạo bộ mới</AntRadio>
          </AntRadio.Group>

          {flashcardMode === "existing" ? (
            <Select
              style={{ width: "100%", marginTop: 8 }}
              placeholder="Chọn bộ flashcard"
              value={selectedSetId}
              onChange={setSelectedSetId}
              loading={flashcardLoading && flashcardSets.length === 0}
              allowClear
            >
              {flashcardSets.map((set) => (
                <Select.Option key={set.setId} value={set.setId}>
                  {set.title}
                </Select.Option>
              ))}
            </Select>
          ) : (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              <Input
                placeholder="Nhập tên bộ flashcard mới"
                value={newSetTitle}
                onChange={(e) => setNewSetTitle(e.target.value)}
                maxLength={255}
              />
              <TextArea
                rows={2}
                placeholder="Mô tả (tùy chọn) cho bộ flashcard"
                value={newSetDescription}
                onChange={(e) => setNewSetDescription(e.target.value)}
                maxLength={500}
              />
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Text strong style={{ display: "block", marginBottom: 4 }}>
                Từ vựng / Thuật ngữ
              </Text>
              <Input
                value={flashcardTerm}
                onChange={(e) => setFlashcardTerm(e.target.value)}
                maxLength={500}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Text strong style={{ display: "block", marginBottom: 4 }}>
                Định nghĩa
              </Text>
              <TextArea
                rows={3}
                value={flashcardDefinition}
                onChange={(e) => setFlashcardDefinition(e.target.value)}
                maxLength={1000}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Text strong style={{ display: "block", marginBottom: 4 }}>
                Phiên âm (tùy chọn)
              </Text>
              <Input
                placeholder="/ˈkwɔː.tə.li/"
                value={flashcardPronunciation}
                onChange={(e) => setFlashcardPronunciation(e.target.value)}
                maxLength={255}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Text strong style={{ display: "block", marginBottom: 4 }}>
                Loại từ (tùy chọn)
              </Text>
              <Input
                placeholder="ADJ, N, V..."
                value={flashcardWordType}
                onChange={(e) => setFlashcardWordType(e.target.value)}
                maxLength={50}
              />
            </div>
          </div>

          <div>
            <Text strong style={{ display: "block", marginBottom: 4 }}>
              Ví dụ (mỗi dòng một câu, tùy chọn)
            </Text>
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
              Gợi ý: nhập 1–2 câu hoàn chỉnh thể hiện cách dùng của từ ở trên. Mỗi câu một dòng.
            </Text>
            <TextArea
              rows={3}
              placeholder={
                "Ví dụ:\nThe company holds quarterly meetings.\nQuarterly sales increased by 10%."
              }
              value={flashcardExamplesInput}
              onChange={(e) => setFlashcardExamplesInput(e.target.value)}
              maxLength={1000}
            />
          </div>

          <div>
            <Text strong style={{ display: "block", marginBottom: 4 }}>
              Ghi chú (notes, tùy chọn)
            </Text>
            <TextArea
              rows={2}
              value={flashcardNotes}
              onChange={(e) => setFlashcardNotes(e.target.value)}
              maxLength={500}
            />
          </div>
        </div>
      </Modal>
    </Card>
  </div>
  );
}