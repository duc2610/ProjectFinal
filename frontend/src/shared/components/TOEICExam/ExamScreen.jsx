import React, { useEffect, useRef, useState, useMemo } from "react";
import { Layout, Button, Modal, Typography, message, Spin, Alert } from "antd";
import { MenuOutlined, LoadingOutlined } from "@ant-design/icons";
import styles from "../../styles/Exam.module.css";
import QuestionNavigator from "./QuestionNavigator";
import QuestionCard from "./QuestionCard";
import { submitTest, submitAssessmentBulk, saveProgress } from "../../../services/testExamService";
import { uploadFile } from "../../../services/filesService";
import { useNavigate } from "react-router-dom";
import { SaveOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;
const { Text } = Typography;

export default function ExamScreen() {
  const navigate = useNavigate();
  const rawTestData = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
  const [questions] = useState(rawTestData.questions || []);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const normalizedDurationMinutes = Number(rawTestData.duration) || 0;
  const totalDurationSeconds = Math.max(0, Math.floor(normalizedDurationMinutes * 60));
  const isSelectTime =
    rawTestData.isSelectTime !== undefined ? !!rawTestData.isSelectTime : true;
  const startTimestampValue = rawTestData.startedAt ? Number(rawTestData.startedAt) : Date.now();
  const safeStartTimestamp = Number.isFinite(startTimestampValue) ? startTimestampValue : Date.now();
  const initialElapsedSeconds =
    !isSelectTime
      ? Math.max(0, Math.floor((Date.now() - safeStartTimestamp) / 1000))
      : 0;
  const [timeLeft, setTimeLeft] = useState(isSelectTime ? totalDurationSeconds : totalDurationSeconds);
  const [timeElapsed, setTimeElapsed] = useState(initialElapsedSeconds);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineAnswers, setOfflineAnswers] = useState(null);
  const [offlineTimestamp, setOfflineTimestamp] = useState(null);
  const [showSaveInfoAlert, setShowSaveInfoAlert] = useState(true);
  const timerRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const startTimestampRef = useRef(safeStartTimestamp);
  const warningTimeoutRef = useRef(null);
  const originalPushStateRef = useRef(null);
  const originalReplaceStateRef = useRef(null);
  const autoSaveIntervalRef = useRef(null);

  // Kiểm tra xem bài thi có Speaking/Writing không
  const hasSpeakingOrWriting = useMemo(() => {
    return questions.some(q => {
      const partId = q.partId;
      return (partId >= 8 && partId <= 10) || (partId >= 11 && partId <= 15);
    });
  }, [questions]);

  // Sync ref với state
  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  useEffect(() => {
    const handlePopState = () => {
      history.go(1);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    if (!rawTestData.testResultId || questions.length === 0) {
      message.error("Không có dữ liệu bài thi");
      navigate("/test-list");
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }

    // === CHẶN TẮT TAB/TRÌNH DUYỆT ===
    const handleBeforeUnload = (e) => {
      if (isSubmittingRef.current) return; // Nếu đang submit thì cho phép
      
      // Hiển thị alert mặc định của browser với nội dung tiếng Việt
      e.preventDefault();
      e.returnValue = "Bạn đang làm bài thi. Nếu bạn rời khỏi trang này, bài thi sẽ được nộp tự động. Bạn có chắc chắn muốn rời khỏi trang không?";
      
      return e.returnValue; // Chrome, Safari
    };

    // === CHẶN THAY ĐỔI URL ===
    originalPushStateRef.current = window.history.pushState;
    originalReplaceStateRef.current = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      if (!isSubmittingRef.current && args[2] && window.location.pathname !== args[2].split('?')[0]) {
        // Hiển thị alert khi cố thay đổi URL
        const confirmMessage = "Bạn đang làm bài thi. Nếu bạn thay đổi URL, bài thi sẽ được nộp tự động. Bạn có chắc chắn muốn tiếp tục không?";
        if (window.confirm(confirmMessage)) {
          // Nếu đồng ý, nộp bài
          handleSubmit(false);
          return;
        }
        // Nếu không đồng ý, giữ nguyên URL
        return;
      }
      return originalPushStateRef.current.apply(window.history, args);
    };
    
    window.history.replaceState = function(...args) {
      if (!isSubmittingRef.current && args[2] && window.location.pathname !== args[2].split('?')[0]) {
        // Hiển thị alert khi cố thay đổi URL
        const confirmMessage = "Bạn đang làm bài thi. Nếu bạn thay đổi URL, bài thi sẽ được nộp tự động. Bạn có chắc chắn muốn tiếp tục không?";
        if (window.confirm(confirmMessage)) {
          // Nếu đồng ý, nộp bài
          handleSubmit(false);
          return;
        }
        // Nếu không đồng ý, giữ nguyên URL
        return;
      }
      return originalReplaceStateRef.current.apply(window.history, args);
    };

    const handleHashChange = () => {
      if (isSubmittingRef.current) return;
      const confirmMessage = "Bạn đang làm bài thi. Nếu bạn thay đổi URL, bài thi sẽ được nộp tự động. Bạn có chắc chắn muốn tiếp tục không?";
      if (window.confirm(confirmMessage)) {
        // Nếu đồng ý, nộp bài
        handleSubmit(false);
      } else {
        // Nếu không đồng ý, giữ nguyên URL
        window.history.pushState(null, "", window.location.href);
      }
    };

    // Đăng ký event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("hashchange", handleHashChange);

    // Chặn các phím tắt nguy hiểm
    const handleKeyDown = (e) => {
      // Chặn Ctrl+W, Ctrl+T, Alt+F4, F5, Ctrl+R
      if (
        (e.ctrlKey && (e.key === "w" || e.key === "W" || e.key === "t" || e.key === "T" || e.key === "r" || e.key === "R")) ||
        (e.altKey && e.key === "F4") ||
        e.key === "F5"
      ) {
        if (isSubmittingRef.current) return;
        e.preventDefault();
        
        // Hiển thị alert khi nhấn phím tắt nguy hiểm
        const confirmMessage = "Bạn đang làm bài thi. Hành động này sẽ khiến bài thi được nộp tự động. Bạn có chắc chắn muốn tiếp tục không?";
        if (window.confirm(confirmMessage)) {
          // Nếu đồng ý, nộp bài
          handleSubmit(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Chặn right-click menu (tùy chọn, có thể bỏ nếu không cần)
    const handleContextMenu = (e) => {
      // Không chặn hoàn toàn, chỉ cảnh báo
      // e.preventDefault(); // Bỏ comment nếu muốn chặn hoàn toàn
    };
    document.addEventListener("contextmenu", handleContextMenu);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (isSelectTime) {
      const elapsedSinceStart = Math.max(
        0,
        Math.floor((Date.now() - startTimestampRef.current) / 1000)
      );
      const startingLeft =
        totalDurationSeconds > 0
          ? Math.max(0, totalDurationSeconds - elapsedSinceStart)
          : 0;
      setTimeLeft(startingLeft);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      const elapsedSinceStart = Math.max(
        0,
        Math.floor((Date.now() - startTimestampRef.current) / 1000)
      );
      setTimeElapsed(elapsedSinceStart);

      timerRef.current = setInterval(() => {
        const elapsedSeconds = Math.max(
          0,
          Math.floor((Date.now() - startTimestampRef.current) / 1000)
        );
        setTimeElapsed(elapsedSeconds);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      
      // Khôi phục lại history methods
      if (originalPushStateRef.current) {
        window.history.pushState = originalPushStateRef.current;
      }
      if (originalReplaceStateRef.current) {
        window.history.replaceState = originalReplaceStateRef.current;
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [
    rawTestData.testResultId,
    questions.length,
    navigate,
    isSelectTime,
    totalDurationSeconds,
  ]);

  const onAnswer = (testQuestionId, value) => {
    setAnswers((prev) => {
      // Nếu value là null, undefined, hoặc empty string, xóa key khỏi answers
      if (value === null || value === undefined || value === "") {
        const newAnswers = { ...prev };
        delete newAnswers[testQuestionId];
        return newAnswers;
      }
      return { ...prev, [testQuestionId]: value };
    });
  };

  const goToQuestionByIndex = (i) => {
    if (i >= 0 && i < questions.length) setCurrentIndex(i);
  };

  // Hàm format answers cho tất cả loại bài thi (L&R, Writing, Speaking)
  const formatAllAnswers = (answersToFormat) => {
    const formattedAnswers = [];
    for (const [answerKey, answerValue] of Object.entries(answersToFormat)) {
      // Parse answerKey: có thể là "testQuestionId" hoặc "testQuestionId_subQuestionIndex"
      let testQuestionId, subQuestionIndex;
      if (answerKey.includes('_')) {
        const parts = answerKey.split('_');
        testQuestionId = parseInt(parts[0]);
        subQuestionIndex = parseInt(parts[1]);
      } else {
        testQuestionId = parseInt(answerKey);
        subQuestionIndex = null;
      }

      // Tìm question tương ứng
      const q = questions.find((q) => 
        q.testQuestionId === testQuestionId && 
        (q.subQuestionIndex === subQuestionIndex || (subQuestionIndex === null && !q.subQuestionIndex))
      );
      if (!q) continue;

      const isLrPart = q.partId >= 1 && q.partId <= 7;
      const isWritingPart = q.partId >= 8 && q.partId <= 10;
      const isSpeakingPart = q.partId >= 11 && q.partId <= 15;

      // Format theo loại câu hỏi
      if (isLrPart && answerValue) {
        // L&R: chosenOptionLabel
        formattedAnswers.push({
          testQuestionId: testQuestionId,
          chosenOptionLabel: answerValue || null,
          answerText: null,
          answerAudioUrl: null,
          subQuestionIndex: subQuestionIndex,
        });
      } else if (isWritingPart && answerValue) {
        // Writing: answerText
        formattedAnswers.push({
          testQuestionId: testQuestionId,
          chosenOptionLabel: null,
          answerText: typeof answerValue === "string" ? answerValue : null,
          answerAudioUrl: null,
          subQuestionIndex: subQuestionIndex,
        });
      } else if (isSpeakingPart && answerValue) {
        // Speaking: answerAudioUrl (nếu là URL) hoặc null nếu là Blob
        const audioUrl = typeof answerValue === "string" && answerValue.startsWith("http") 
          ? answerValue 
          : null;
        // Chỉ lưu nếu đã upload (có URL)
        if (audioUrl) {
          formattedAnswers.push({
            testQuestionId: testQuestionId,
            chosenOptionLabel: null,
            answerText: null,
            answerAudioUrl: audioUrl,
            subQuestionIndex: subQuestionIndex,
          });
        }
      }
    }
    return formattedAnswers;
  };

  // Hàm lưu tiến độ làm bài (cho tất cả loại bài thi)
  const handleSaveProgress = async () => {
    const testResultId = rawTestData.testResultId;
    if (!testResultId) {
      message.warning("Không tìm thấy testResultId");
      return;
    }

    // Kiểm tra mạng
    if (!navigator.onLine) {
      message.warning("Không có kết nối mạng. Vui lòng kiểm tra lại kết nối.");
      return;
    }

    const formattedAnswers = formatAllAnswers(answers);

    // Nếu không có câu nào để lưu
    if (formattedAnswers.length === 0) {
      message.info("Chưa có câu trả lời nào để lưu");
      return;
    }

    setIsSaving(true);
    try {
      await saveProgress(testResultId, formattedAnswers);
      setLastSaveTime(new Date());
      message.success(`Đã lưu tiến độ ${formattedAnswers.length} câu trả lời`);
    } catch (error) {
      console.error("Error saving progress:", error);
      // Nếu lỗi do mất mạng, lưu answers vào offlineAnswers
      if (!navigator.onLine || error.code === 'ERR_NETWORK' || error.message.includes('Network')) {
        setOfflineAnswers({ ...answers });
        setOfflineTimestamp(new Date());
        setIsOnline(false);
        setShowOfflineModal(true);
      } else if (error.response?.status === 405) {
        // Endpoint chưa được implement trên backend
        message.warning("Tính năng lưu tiến độ chưa được kích hoạt. Vui lòng liên hệ quản trị viên.");
        console.warn("Save progress endpoint may not be implemented on backend");
      } else {
        message.error("Không thể lưu tiến độ: " + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Map partId sang partType cho S&W
  const getPartType = (partId) => {
    const partTypeMap = {
      8: "writing_sentence",      // W-Part 1
      9: "writing_email",          // W-Part 2
      10: "writing_essay",         // W-Part 3
      11: "read_aloud",            // S-Part 1
      12: "describe_picture",      // S-Part 2
      13: "respond_questions",     // S-Part 3
      14: "respond_with_info",     // S-Part 4
      15: "express_opinion",       // S-Part 5
    };
    return partTypeMap[partId] || null;
  };

  // ExamScreen.jsx
  const handleSubmit = async (auto = false, answersToSubmit = null) => {
    // Nếu có answersToSubmit (khi mất mạng), dùng nó, nếu không dùng answers hiện tại
    const finalAnswers = answersToSubmit || answers;
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log("Submit already in progress, ignoring duplicate call");
      return;
    }

    setIsSubmitting(true);
    clearInterval(timerRef.current);
    setShowSubmitModal(true);

    try {
      const testResultId = rawTestData.testResultId;
      if (!testResultId) throw new Error("Không tìm thấy testResultId");

      const now = Date.now();
      let elapsedSeconds = Math.max(
        0,
        Math.floor((now - startTimestampRef.current) / 1000)
      );
      if (isSelectTime && totalDurationSeconds > 0) {
        elapsedSeconds = Math.min(elapsedSeconds, totalDurationSeconds);
      }
      const durationMinutes = Math.max(1, Math.ceil(elapsedSeconds / 60));
      const testType = rawTestData.testType || "Simulator";
      const testTypeLower = testType.toLowerCase() === "simulator" ? "simulator" : "practice";

      // Tách answers thành L&R và S&W
      const lrAnswers = [];
      const swAnswers = [];

      // Xử lý từng answer
      for (const [answerKey, answerValue] of Object.entries(finalAnswers)) {
        // Parse answerKey: có thể là "testQuestionId" hoặc "testQuestionId_subQuestionIndex"
        let testQuestionId, subQuestionIndex;
        if (answerKey.includes('_')) {
          // Group question: key format là "testQuestionId_subQuestionIndex"
          const parts = answerKey.split('_');
          testQuestionId = parseInt(parts[0]);
          subQuestionIndex = parseInt(parts[1]);
        } else {
          // Single question: key là testQuestionId
          testQuestionId = parseInt(answerKey);
          subQuestionIndex = 0;
        }

        // Tìm question tương ứng
        const q = questions.find((q) => 
          q.testQuestionId === testQuestionId && 
          (q.subQuestionIndex === subQuestionIndex || (subQuestionIndex === 0 && !q.subQuestionIndex))
        );
        if (!q) continue;

        const isWritingPart = q.partId >= 8 && q.partId <= 10;
        const isSpeakingPart = q.partId >= 11 && q.partId <= 15;
        const isLrPart = q.partId >= 1 && q.partId <= 7;

        if (isLrPart) {
          // L&R: gửi với testQuestionId và subQuestionIndex
          lrAnswers.push({
            testQuestionId: testQuestionId,
            subQuestionIndex: subQuestionIndex,
            chosenOptionLabel: answerValue || "",
          });
        } else if (isWritingPart) {
          // Writing: gửi text
          const partType = getPartType(q.partId);
          if (partType && typeof answerValue === "string" && answerValue.trim() !== "") {
            swAnswers.push({
              testQuestionId: testQuestionId,
              partType: partType,
              answerText: answerValue,
              audioFileUrl: null,
            });
          }
        } else if (isSpeakingPart) {
          // Speaking: kiểm tra nếu đã có URL thì dùng trực tiếp, nếu là Blob thì upload
          const partType = getPartType(q.partId);
          if (partType) {
            let audioFileUrl = null;
            
            // Nếu answerValue là URL (string) thì dùng trực tiếp
            if (typeof answerValue === "string" && answerValue.startsWith("http")) {
              audioFileUrl = answerValue;
            } 
            // Nếu answerValue là Blob thì upload lên
            else if (answerValue instanceof Blob) {
              try {
                // Upload audio file
                const audioFile = new File([answerValue], `speaking_${testQuestionId}_${subQuestionIndex}.webm`, {
                  type: "audio/webm",
                });
                audioFileUrl = await uploadFile(audioFile, "audio");
              } catch (error) {
                console.error(`Error uploading audio for question ${testQuestionId}:`, error);
                message.warning(`Không thể upload audio cho câu ${q.globalIndex || testQuestionId}`);
                audioFileUrl = null;
              }
            }
            
            // Chỉ thêm vào swAnswers nếu có audioFileUrl hoặc đã cố gắng upload
            if (audioFileUrl !== null || answerValue instanceof Blob || (typeof answerValue === "string" && answerValue.startsWith("http"))) {
              swAnswers.push({
                testQuestionId: testQuestionId,
                partType: partType,
                answerText: null,
                audioFileUrl: audioFileUrl,
              });
            }
          }
        }
      }

      // Submit L&R nếu có
      let lrResult = null;
      // Luôn ưu tiên testResultId do server trả về sau submit (trong trường hợp backend tạo bản ghi mới)
      let finalTestResultId = testResultId;
      
      if (lrAnswers.length > 0) {
        const lrPayload = {
          userId: "33333333-3333-3333-3333-333333333333",
          testId: rawTestData.testId,
          testResultId: finalTestResultId, // Dùng testResultId ban đầu
          duration: durationMinutes,
          testType: testType,
          answers: lrAnswers,
        };
        console.log("Submitting L&R with testResultId:", finalTestResultId);
        lrResult = await submitTest(lrPayload);
        console.log("L&R submit response:", lrResult);

        // Nếu backend trả về testResultId mới (ví dụ: 1202), dùng ID đó cho bước lấy chi tiết
        if (lrResult && lrResult.testResultId) {
          finalTestResultId = lrResult.testResultId;
          try {
            // Đồng bộ lại testResultId trong toeic_testData để các màn sau dùng đúng ID
            const saved = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
            saved.testResultId = finalTestResultId;
            sessionStorage.setItem("toeic_testData", JSON.stringify(saved));
          } catch (e) {
            console.error("Error syncing testResultId to sessionStorage:", e);
          }
        }
      }

      // Submit S&W nếu có (dùng CÙNG testResultId ban đầu)
      let swResult = null;
      if (swAnswers.length > 0) {
        const swPayload = {
          testResultId: finalTestResultId, // Dùng CÙNG testResultId ban đầu
          testType: testTypeLower,
          duration: durationMinutes,
          parts: swAnswers,
        };
        console.log("Submitting S&W with testResultId:", finalTestResultId);
        swResult = await submitAssessmentBulk(swPayload);
        // KHÔNG cập nhật testResultId từ response - luôn dùng testResultId ban đầu
        console.log("S&W submit response:", swResult);
      }

      // Kiểm tra nếu không có câu nào được trả lời
      if (lrAnswers.length === 0 && swAnswers.length === 0) {
        message.warning("Bạn chưa trả lời câu nào!");
        setShowSubmitModal(false);
        return;
      }

      // Merge kết quả: ưu tiên L&R result vì nó có đầy đủ thông tin
      const fullResult = {
        ...(lrResult || {}),
        ...(swResult || {}),
        testResultId: finalTestResultId, // DÙNG ID do server trả để lấy chi tiết
        testId: rawTestData.testId, // Lưu testId để có thể làm lại bài thi
        questions: questions,
        answers: finalAnswers, // Lưu answers để hiển thị câu trả lời gốc trong result
        duration: durationMinutes,
        testType,
        isSelectTime,
      };

      setTimeout(() => {
        setShowSubmitModal(false);
        navigate("/result", { state: { resultData: fullResult, autoSubmit: auto } });
      }, 900);
    } catch (error) {
      message.error("Nộp bài thất bại: " + (error.response?.data?.message || error.message));
      setShowSubmitModal(false);
      setIsSubmitting(false); // Reset flag on error
    }
  };

  useEffect(() => {
    if (isSelectTime && timeLeft === 0 && !isSubmittingRef.current) {
      // Nếu mất mạng khi hết thời gian, hiển thị thông báo và submit với offlineAnswers
      if (!navigator.onLine && offlineAnswers) {
        setShowOfflineModal(true);
        message.warning("Hết thời gian làm bài. Nếu không kết nối lại mạng, bài làm sẽ được lưu với đáp án trước khi mất mạng.");
        // Đợi 3 giây, nếu vẫn mất mạng thì submit với offlineAnswers
        setTimeout(() => {
          if (!navigator.onLine && offlineAnswers) {
            handleSubmit(true, offlineAnswers);
          }
        }, 3000);
      } else {
        handleSubmit(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelectTime, timeLeft]);

  // Phát hiện mất mạng/kết nối lại
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineModal(false);
      // Nếu có offlineAnswers, thử lưu lại
      if (offlineAnswers) {
        message.info("Đã kết nối lại mạng. Đang lưu lại tiến độ...");
        // Cập nhật answers với offlineAnswers và thử lưu
        setAnswers(offlineAnswers);
        setTimeout(() => {
          handleSaveProgress();
        }, 1000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      // Lưu answers hiện tại vào offlineAnswers
      setOfflineAnswers({ ...answers });
      setOfflineTimestamp(new Date());
      setShowOfflineModal(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [answers]);

  // Auto-save tiến độ mỗi 5 phút (cho tất cả loại bài thi)
  useEffect(() => {
    if (!rawTestData.testResultId) return;

    // Chỉ auto-save nếu có ít nhất 1 câu trả lời và có mạng
    const hasAnswers = questions.some(q => {
      const answerKey = q.subQuestionIndex !== undefined && q.subQuestionIndex !== null
        ? `${q.testQuestionId}_${q.subQuestionIndex}`
        : q.testQuestionId;
      const answerValue = answers[answerKey];
      
      // Kiểm tra có answer hợp lệ
      if (!answerValue) return false;
      
      // L&R: có chosenOptionLabel
      if (q.partId >= 1 && q.partId <= 7) return true;
      
      // Writing: có answerText (string)
      if (q.partId >= 8 && q.partId <= 10 && typeof answerValue === "string") return true;
      
      // Speaking: có answerAudioUrl (URL string)
      if (q.partId >= 11 && q.partId <= 15 && typeof answerValue === "string" && answerValue.startsWith("http")) return true;
      
      return false;
    });

    if (!hasAnswers || !navigator.onLine) return;

    // Auto-save mỗi 5 phút (300000 ms)
    autoSaveIntervalRef.current = setInterval(() => {
      if (!isSubmittingRef.current && navigator.onLine) {
        handleSaveProgress();
      }
    }, 5 * 60 * 1000); // 5 phút

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawTestData.testResultId]);

  const formatTime = (value) => {
    const safeSeconds = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };
  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;

  const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (questions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin indicator={loadingIcon} size="large" tip="Đang tải câu hỏi..." />
      </div>
    );
  }

  return (
    <Layout className={styles.examLayout}>
      <Header className={styles.header}>
        <div className={styles.headerInner}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              icon={<MenuOutlined style={{ color: "#fff", fontSize: 20 }} />}
              onClick={() => setIsNavVisible(!isNavVisible)}
            />
            <Text style={{ color: "#fff", marginLeft: 12 }}>
              TOEIC - {rawTestData.title || "Bài thi"}
            </Text>
          </div>
          <div className={styles.headerRight}>
            <Button 
              icon={<SaveOutlined />}
              onClick={handleSaveProgress}
              disabled={isSaving || isSubmitting}
              loading={isSaving}
              style={{
                borderRadius: "8px",
                height: "36px",
                fontWeight: 600,
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#fff"
              }}
            >
              Lưu
            </Button>
            <Button 
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              loading={isSubmitting}
              style={{
                borderRadius: "8px",
                height: "36px",
                fontWeight: 600,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                marginLeft: 8
              }}
            >
              Nộp bài
            </Button>
            <Button 
              style={{ 
                marginLeft: 8,
                borderRadius: "8px",
                height: "36px",
                fontWeight: 600,
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#fff"
              }} 
              type="dashed"
            >
              {formatTime(isSelectTime ? timeLeft : timeElapsed)}
            </Button>
            <Text style={{ 
              color: "#fff", 
              marginLeft: 12,
              fontSize: "14px",
              fontWeight: 600,
              background: "rgba(255, 255, 255, 0.2)",
              padding: "6px 12px",
              borderRadius: "8px"
            }}>
              {answeredCount}/{totalCount} câu
            </Text>
          </div>
        </div>
      </Header>

      <Content className={styles.contentArea}>
        <div className={styles.examBody}>
          {isNavVisible && (
            <div className={styles.sideNav}>
              <QuestionNavigator
                questions={questions}
                currentIndex={currentIndex}
                answers={answers}
                goToQuestionByIndex={goToQuestionByIndex}
              />
            </div>
          )}
          <div className={styles.questionArea} style={{ flex: isNavVisible ? 1 : "auto" }}>
            {/* Thông tin về nút Save */}
            {showSaveInfoAlert && (
              <Alert
                type="info"
                showIcon
                message="Tính năng lưu tiến độ"
                description={
                  <div style={{ fontSize: 13 }}>
                    Hệ thống tự động lưu tiến độ mỗi 5 phút. Bạn có thể nhấn nút <strong>"Lưu"</strong> trên thanh công cụ để lưu thủ công bất cứ lúc nào.
                    {lastSaveTime && (
                      <span style={{ marginLeft: 8, color: "#52c41a" }}>
                        (Đã lưu lần cuối: {lastSaveTime.toLocaleTimeString("vi-VN")})
                      </span>
                    )}
                  </div>
                }
                closable
                onClose={() => setShowSaveInfoAlert(false)}
                style={{ marginBottom: 16, borderRadius: "8px" }}
              />
            )}
            <QuestionCard
              question={questions[currentIndex]}
              currentIndex={currentIndex}
              totalCount={totalCount}
              answers={answers}
              onAnswer={onAnswer}
              goToQuestionByIndex={goToQuestionByIndex}
              handleSubmit={() => handleSubmit(false)}
              isSubmitting={isSubmitting}
              globalAudioUrl={rawTestData.globalAudioUrl}
            />
          </div>
        </div>
      </Content>

      <Modal open={showSubmitModal} footer={null} closable={false}>
        <div style={{ textAlign: "center", padding: 20 }}>
          <Spin indicator={loadingIcon} size="large" />
          <div style={{ marginTop: 16 }}>
            <Text strong style={{ fontSize: 16, display: "block", marginBottom: 8 }}>
              Đang nộp bài...
            </Text>
            {hasSpeakingOrWriting && (
              <Text type="secondary" style={{ display: "block", fontSize: 14 }}>
                Vui lòng đợi 5 đến 10 phút để AI chấm bài của bạn.
              </Text>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal thông báo mất mạng */}
      <Modal
        open={showOfflineModal}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <span>Mất kết nối mạng</span>
          </div>
        }
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => {
              setShowOfflineModal(false);
              // Nếu đã kết nối lại mạng, không cần hiển thị modal nữa
              if (navigator.onLine) {
                setIsOnline(true);
              }
            }}
          >
            Đã hiểu
          </Button>,
        ]}
        closable={navigator.onLine}
        maskClosable={false}
        width={600}
      >
        <div style={{ padding: "10px 0" }}>
          <Text style={{ fontSize: 15, lineHeight: 1.8 }}>
            {isSelectTime && timeLeft === 0 ? (
              <>
                <strong>Hết thời gian làm bài!</strong>
                <br />
                <br />
                Bạn đang mất kết nối mạng. Nếu bạn không kết nối lại mạng, bài làm của bạn sẽ được lưu với đáp án bạn đã trả lời trước thời gian mất mạng.
                <br />
                <br />
                {offlineTimestamp && (
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Thời điểm mất mạng: {offlineTimestamp.toLocaleString("vi-VN")}
                  </Text>
                )}
              </>
            ) : (
              <>
                <strong>Bạn đã mất kết nối mạng.</strong>
                <br />
                <br />
                Hệ thống đã lưu tạm thời các câu trả lời của bạn. Vui lòng kiểm tra kết nối mạng và kết nối lại để tiếp tục làm bài.
                <br />
                <br />
                {offlineTimestamp && (
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Thời điểm mất mạng: {offlineTimestamp.toLocaleString("vi-VN")}
                  </Text>
                )}
                <br />
                <br />
                <Text type="warning" style={{ fontSize: 13 }}>
                  ⚠️ Lưu ý: Các câu trả lời sau thời điểm mất mạng sẽ không được lưu tự động. Vui lòng kết nối lại mạng để đảm bảo tiến độ được lưu đầy đủ.
                </Text>
              </>
            )}
          </Text>
        </div>
      </Modal>
    </Layout>
  );
}