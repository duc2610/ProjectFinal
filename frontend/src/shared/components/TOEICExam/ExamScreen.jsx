import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Layout, Button, Modal, Typography, message, Spin, Alert } from "antd";
import { MenuOutlined, LoadingOutlined } from "@ant-design/icons";
import styles from "../../styles/Exam.module.css";
import QuestionNavigator from "./QuestionNavigator";
import QuestionCard from "./QuestionCard";
import { submitTest, submitAssessmentBulk, saveProgress, startTest } from "../../../services/testExamService";
import { uploadFile } from "../../../services/filesService";
import { getMyQuestionReports } from "../../../services/questionReportService";
import { translateErrorMessage } from "@shared/utils/translateError";
import { useNavigate } from "react-router-dom";
import { SaveOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;
const { Text } = Typography;

export default function ExamScreen() {
  const navigate = useNavigate();
  const rawTestData = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
  const [questions] = useState(rawTestData.questions || []);
  // Lần đầu vào: dùng answers từ sessionStorage (đã được load từ ExamSelection/Profile)
  // Khi reload: sẽ load lại từ API startTest
  const [answers, setAnswers] = useState(rawTestData.answers || {});
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);
  const hasLoadedFromBackendRef = useRef(false);
  // Load currentIndex từ sessionStorage nếu có (để khôi phục vị trí câu hỏi khi reload)
  const initialCurrentIndex = rawTestData.currentIndex !== undefined ? Number(rawTestData.currentIndex) : 0;
  const [currentIndex, setCurrentIndex] = useState(initialCurrentIndex);
  const normalizedDurationMinutes = Number(rawTestData.duration) || 0;
  const totalDurationSeconds = Math.max(0, Math.floor(normalizedDurationMinutes * 60));
  const isSelectTime =
    rawTestData.isSelectTime !== undefined ? !!rawTestData.isSelectTime : true;
  
  // Kiểm tra xem có phải tiếp tục test từ history không (có originalTestResultId và createdAt)
  const isContinueFromHistory = rawTestData.originalTestResultId !== undefined && rawTestData.createdAt;
  
  // Tính thời gian đã làm bài từ createdAt đến hiện tại
  let safeStartTimestamp, initialElapsedSeconds, initialTimeLeft;
  
  if (isContinueFromHistory && rawTestData.createdAt) {
    // Tiếp tục từ history: tính thời gian từ createdAt đến hiện tại
    const createdAtTimestamp = new Date(rawTestData.createdAt).getTime();
    const currentElapsedSeconds = Math.max(0, Math.floor((Date.now() - createdAtTimestamp) / 1000));
    
    safeStartTimestamp = createdAtTimestamp;
    initialElapsedSeconds = isSelectTime ? 0 : currentElapsedSeconds;
    initialTimeLeft = isSelectTime 
      ? Math.max(0, totalDurationSeconds - currentElapsedSeconds)
      : totalDurationSeconds;
    
    console.log("ExamScreen - Continue from history:");
    console.log("  - createdAt:", rawTestData.createdAt);
    console.log("  - createdAtTimestamp:", new Date(createdAtTimestamp).toISOString());
    console.log("  - currentElapsedSeconds:", currentElapsedSeconds, "seconds");
    console.log("  - isSelectTime:", isSelectTime);
    console.log("  - initialTimeLeft:", initialTimeLeft, "seconds");
    console.log("  - initialElapsedSeconds:", initialElapsedSeconds, "seconds");
  } else {
    // Làm test mới: dùng logic cũ
    const startTimestampValue = rawTestData.startedAt ? Number(rawTestData.startedAt) : Date.now();
    safeStartTimestamp = Number.isFinite(startTimestampValue) ? startTimestampValue : Date.now();
    initialElapsedSeconds =
      !isSelectTime
        ? Math.max(0, Math.floor((Date.now() - safeStartTimestamp) / 1000))
        : 0;
    initialTimeLeft = isSelectTime ? totalDurationSeconds : totalDurationSeconds;
  }
  
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
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
  const [reportedQuestionIds, setReportedQuestionIds] = useState(new Set()); // Set các testQuestionId đã report
  const timerRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const startTimestampRef = useRef(safeStartTimestamp);
  
  // Cập nhật startTimestampRef khi safeStartTimestamp thay đổi (ví dụ: khi tiếp tục từ history)
  useEffect(() => {
    startTimestampRef.current = safeStartTimestamp;
    console.log("ExamScreen - Updated startTimestampRef.current to:", new Date(safeStartTimestamp).toISOString());
  }, [safeStartTimestamp]);
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

  // Load answers từ backend khi reload (chỉ load đáp án đã được lưu từ API startTest)
  useEffect(() => {
    const loadAnswersFromBackend = async () => {
      // Chỉ load một lần khi component mount
      if (hasLoadedFromBackendRef.current) return;
      
      const testId = rawTestData.testId;
      const testResultId = rawTestData.testResultId;
      if (!testId || !testResultId) {
        hasLoadedFromBackendRef.current = true;
        return;
      }
      
      // Kiểm tra xem có phải reload không (dựa vào performance.navigation.type hoặc kiểm tra page visibility)
      // Nếu đã có lastBackendLoadTime và đây là lần đầu vào, không cần load lại
      // Nếu không có lastBackendLoadTime hoặc đây là reload, load từ API
      const isReload = !rawTestData.lastBackendLoadTime || 
        (typeof window !== 'undefined' && window.performance && 
         window.performance.navigation && 
         window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD);
      
      // Luôn load từ backend khi reload để đảm bảo chỉ có answers đã được lưu
      // Nếu là lần đầu vào và đã có lastBackendLoadTime, có thể bỏ qua (đã load từ ExamSelection/Profile)
      if (isReload || !rawTestData.lastBackendLoadTime) {
        setIsLoadingAnswers(true);
        try {
          const isSelectTime = rawTestData.isSelectTime !== undefined ? !!rawTestData.isSelectTime : true;
          const data = await startTest(testId, isSelectTime);
          
          if (data && data.savedAnswers) {
            // Xử lý savedAnswers để fill vào answers (chỉ đáp án đã được lưu lên backend)
            const savedAnswers = data.savedAnswers || [];
            const answersMap = new Map();
            
            savedAnswers.forEach((saved) => {
              const subIndex = saved.subQuestionIndex !== undefined && saved.subQuestionIndex !== null 
                ? saved.subQuestionIndex 
                : 0;
              
              const testQuestionIdStr = String(saved.testQuestionId);
              const answerKey = subIndex !== 0
                ? `${testQuestionIdStr}_${subIndex}`
                : testQuestionIdStr;
              
              // Xử lý theo loại answer
              let answerValue = null;
              if (saved.chosenOptionLabel) {
                answerValue = saved.chosenOptionLabel;
              } else if (saved.answerText) {
                answerValue = saved.answerText;
              } else if (saved.answerAudioUrl) {
                answerValue = saved.answerAudioUrl;
              }
              
              if (answerValue !== null) {
                answersMap.set(answerKey, answerValue);
              }
            });
            
            // Chuyển Map thành object và chỉ dùng answers đã được lưu từ backend
            const savedAnswersObj = {};
            answersMap.forEach((value, key) => {
              savedAnswersObj[key] = value;
            });
            
            // Chỉ dùng answers từ API, không merge với sessionStorage
            setAnswers(savedAnswersObj);
            
            // Cập nhật sessionStorage với answers từ backend
            const savedData = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
            savedData.answers = savedAnswersObj;
            savedData.lastBackendLoadTime = Date.now();
            sessionStorage.setItem("toeic_testData", JSON.stringify(savedData));
            
            console.log("ExamScreen - Reload: Loaded answers from API startTest only:", savedAnswersObj);
          } else {
            // Nếu không có savedAnswers từ API, set answers rỗng
            setAnswers({});
            const savedData = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
            savedData.answers = {};
            savedData.lastBackendLoadTime = Date.now();
            sessionStorage.setItem("toeic_testData", JSON.stringify(savedData));
            console.log("ExamScreen - Reload: No savedAnswers from API, cleared answers");
          }
        } catch (error) {
          console.error("Error loading answers from backend on reload:", error);
          // Nếu lỗi, vẫn dùng answers từ sessionStorage (fallback)
          console.log("ExamScreen - Reload: Error loading from API, using sessionStorage as fallback");
        } finally {
          setIsLoadingAnswers(false);
          hasLoadedFromBackendRef.current = true;
        }
      } else {
        // Lần đầu vào và đã có lastBackendLoadTime, đánh dấu đã load
        hasLoadedFromBackendRef.current = true;
      }
    };
    
    loadAnswersFromBackend();
  }, []); // Chỉ chạy một lần khi component mount

  // Load danh sách reports để biết câu hỏi nào đã được report
  useEffect(() => {
    const loadReports = async () => {
      try {
        // Load tất cả reports (có thể cần pagination nếu có nhiều)
        const response = await getMyQuestionReports(1, 1000); // Load nhiều để lấy hết
        const reportsData = response?.data || [];
        
        // Tạo Set các testQuestionId đã report
        const reportedIds = new Set();
        reportsData.forEach(report => {
          if (report.testQuestionId) {
            reportedIds.add(report.testQuestionId);
          }
        });
        
        setReportedQuestionIds(reportedIds);
        console.log("ExamScreen - Loaded reports:", reportedIds.size, "questions reported");
      } catch (error) {
        console.error("Error loading reports:", error);
        // Không hiển thị error vì đây là tính năng phụ
      }
    };
    
    loadReports();
  }, []);

  // Function để check xem câu hỏi đã report chưa
  const isQuestionReported = (testQuestionId) => {
    return reportedQuestionIds.has(testQuestionId);
  };

  // Callback khi report thành công
  const handleReportSuccess = (testQuestionId) => {
    setReportedQuestionIds(prev => new Set([...prev, testQuestionId]));
  };

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

    // === CHẶN ĐÓNG TAB/TRÌNH DUYỆT (nhưng cho phép reload) ===
    const handleBeforeUnload = (e) => {
      if (isSubmittingRef.current) return; // Nếu đang submit thì cho phép
      
      // Hiển thị cảnh báo khi cố đóng tab/trình duyệt
      // Lưu ý: Modern browsers có thể bỏ qua message tùy chỉnh và hiển thị message mặc định
      // Nhưng vẫn nên set để một số browser/phiên bản có thể hiển thị
      e.preventDefault();
      const message = "Bạn đang làm bài thi. Các thay đổi bạn đã thực hiện có thể không được lưu. Bạn có chắc chắn muốn rời khỏi trang này không?";
      e.returnValue = message;
      
      return message; // Chrome, Safari
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
    // beforeunload: chặn đóng tab/trình duyệt (nhưng vẫn cho phép reload bằng F5/Ctrl+R)
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("hashchange", handleHashChange);

    // Chặn các phím tắt nguy hiểm (nhưng cho phép F5 và Ctrl+R để reload)
    const handleKeyDown = (e) => {
      // Chặn Ctrl+W, Ctrl+T, Alt+F4 (nhưng KHÔNG chặn F5 và Ctrl+R để cho phép reload)
      if (
        (e.ctrlKey && (e.key === "w" || e.key === "W" || e.key === "t" || e.key === "T")) ||
        (e.altKey && e.key === "F4")
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
      // F5 và Ctrl+R được phép để reload trang (answers sẽ được load lại từ sessionStorage)
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
      let newAnswers;
      if (value === null || value === undefined || value === "") {
        newAnswers = { ...prev };
        delete newAnswers[testQuestionId];
      } else {
        newAnswers = { ...prev, [testQuestionId]: value };
      }
      
      // Lưu answers vào sessionStorage để có thể load lại khi reload trang
      try {
        const savedData = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
        savedData.answers = newAnswers;
        sessionStorage.setItem("toeic_testData", JSON.stringify(savedData));
      } catch (error) {
        console.error("Error saving answers to sessionStorage:", error);
      }
      
      return newAnswers;
    });
  };

  const goToQuestionByIndex = (i) => {
    if (i >= 0 && i < questions.length) {
      setCurrentIndex(i);
      // Lưu currentIndex vào sessionStorage để khôi phục khi reload
      try {
        const savedData = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
        savedData.currentIndex = i;
        sessionStorage.setItem("toeic_testData", JSON.stringify(savedData));
      } catch (error) {
        console.error("Error saving currentIndex to sessionStorage:", error);
      }
    }
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
  const handleSaveProgress = useCallback(async () => {
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
      
      // Đánh dấu đã lưu lên backend để khi reload sẽ load từ backend
      const savedData = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
      savedData.lastBackendLoadTime = Date.now();
      sessionStorage.setItem("toeic_testData", JSON.stringify(savedData));
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
        message.error("Không thể lưu tiến độ: " + translateErrorMessage(error.response?.data?.message || error.message));
      }
    } finally {
      setIsSaving(false);
    }
  }, [answers, rawTestData.testResultId]);

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

    // Kiểm tra sớm nếu không có câu nào được trả lời (trước khi set isSubmitting)
    const hasAnyAnswer = Object.keys(finalAnswers).length > 0;
    if (!hasAnyAnswer && !auto) {
      message.warning("Bạn chưa trả lời câu nào!");
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
      // Kiểm tra xem có phải tiếp tục test từ history không (có originalTestResultId)
      const isContinueFromHistory = rawTestData.originalTestResultId !== undefined;
      // Nếu tiếp tục từ history, luôn dùng testResultId từ history, không cập nhật từ response
      // Nếu không, ưu tiên testResultId do server trả về sau submit (trong trường hợp backend tạo bản ghi mới)
      let finalTestResultId = testResultId;
      
      console.log("ExamScreen - Submit: testResultId from sessionStorage:", testResultId);
      console.log("ExamScreen - Submit: isContinueFromHistory:", isContinueFromHistory);
      if (isContinueFromHistory) {
        console.log("ExamScreen - Submit: originalTestResultId from history:", rawTestData.originalTestResultId);
      }
      
      if (lrAnswers.length > 0) {
        const lrPayload = {
          userId: "33333333-3333-3333-3333-333333333333",
          testId: rawTestData.testId,
          testResultId: finalTestResultId, // Dùng testResultId ban đầu (từ history nếu tiếp tục test)
          duration: durationMinutes,
          testType: testType,
          answers: lrAnswers,
        };
        console.log("Submitting L&R with testResultId:", finalTestResultId);
        lrResult = await submitTest(lrPayload);
        console.log("L&R submit response:", lrResult);

        // CHỈ cập nhật testResultId từ response nếu KHÔNG phải tiếp tục từ history
        // Nếu tiếp tục từ history, luôn giữ nguyên testResultId từ history
        if (!isContinueFromHistory && lrResult && lrResult.testResultId) {
          finalTestResultId = lrResult.testResultId;
          try {
            // Đồng bộ lại testResultId trong toeic_testData để các màn sau dùng đúng ID
            const saved = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
            saved.testResultId = finalTestResultId;
            sessionStorage.setItem("toeic_testData", JSON.stringify(saved));
          } catch (e) {
            console.error("Error syncing testResultId to sessionStorage:", e);
          }
        } else if (isContinueFromHistory) {
          console.log("ExamScreen - Continue from history: Keeping original testResultId:", finalTestResultId);
        }
      }

      // Submit S&W nếu có (dùng CÙNG testResultId ban đầu, hoặc từ history nếu tiếp tục test)
      let swResult = null;
      if (swAnswers.length > 0) {
        const swPayload = {
          testResultId: finalTestResultId, // Dùng CÙNG testResultId ban đầu (từ history nếu tiếp tục test)
          testType: testTypeLower,
          duration: durationMinutes,
          parts: swAnswers,
        };
        console.log("Submitting S&W with testResultId:", finalTestResultId);
        if (isContinueFromHistory) {
          console.log("ExamScreen - S&W Submit: Using testResultId from history (continue test)");
        }
        swResult = await submitAssessmentBulk(swPayload);
        // KHÔNG cập nhật testResultId từ response - luôn dùng testResultId ban đầu hoặc từ history
        console.log("S&W submit response:", swResult);
      }

      // Kiểm tra lại nếu không có câu nào được trả lời (sau khi format)
      // Lưu ý: Kiểm tra này có thể xảy ra nếu tất cả answers không hợp lệ (ví dụ: Speaking chưa upload)
      if (lrAnswers.length === 0 && swAnswers.length === 0) {
        message.warning("Bạn chưa trả lời câu nào hoặc các câu trả lời chưa hợp lệ!");
        setShowSubmitModal(false);
        setIsSubmitting(false); // Reset flag để nút không bị disable
        return;
      }

      // Merge kết quả: ưu tiên L&R result vì nó có đầy đủ thông tin
      // Nếu tiếp tục từ history, dùng testResultId từ history, không phải từ response
      const fullResult = {
        ...(lrResult || {}),
        ...(swResult || {}),
        testResultId: finalTestResultId, // Dùng testResultId từ history nếu tiếp tục test, nếu không thì dùng từ response
        testId: rawTestData.testId, // Lưu testId để có thể làm lại bài thi
        questions: questions,
        answers: finalAnswers, // Lưu answers để hiển thị câu trả lời gốc trong result
        duration: durationMinutes,
        testType,
        isSelectTime,
      };
      
      console.log("ExamScreen - Final result testResultId:", fullResult.testResultId);
      if (isContinueFromHistory) {
        console.log("ExamScreen - Final result: Using testResultId from history for continue test");
      }

      setTimeout(() => {
        setShowSubmitModal(false);
        navigate("/result", { state: { resultData: fullResult, autoSubmit: auto } });
      }, 900);
    } catch (error) {
      message.error("Nộp bài thất bại: " + translateErrorMessage(error.response?.data?.message || error.message));
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
    if (!rawTestData.testResultId) {
      console.log("ExamScreen - Auto-save: No testResultId, skipping");
      return;
    }

    // Clear interval cũ nếu có
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }

    // Hàm kiểm tra có câu trả lời hợp lệ không
    const checkHasAnswers = () => {
      if (!answers || Object.keys(answers).length === 0) {
        return false;
      }

      // Kiểm tra xem có ít nhất 1 câu trả lời hợp lệ
      for (const [answerKey, answerValue] of Object.entries(answers)) {
        if (!answerValue) continue;

        // Parse answerKey để tìm question
        let testQuestionId, subQuestionIndex;
        if (answerKey.includes('_')) {
          const parts = answerKey.split('_');
          testQuestionId = parseInt(parts[0]);
          subQuestionIndex = parseInt(parts[1]);
        } else {
          testQuestionId = parseInt(answerKey);
          subQuestionIndex = 0;
        }

        // Tìm question tương ứng
        const q = questions.find((q) => 
          q.testQuestionId === testQuestionId && 
          (q.subQuestionIndex === subQuestionIndex || (subQuestionIndex === 0 && !q.subQuestionIndex))
        );
        
        if (!q) continue;

        // L&R: có chosenOptionLabel (bất kỳ giá trị nào)
        if (q.partId >= 1 && q.partId <= 7) {
          return true;
        }
        
        // Writing: có answerText (string không rỗng)
        if (q.partId >= 8 && q.partId <= 10 && typeof answerValue === "string" && answerValue.trim() !== "") {
          return true;
        }
        
        // Speaking: có answerAudioUrl (URL string) hoặc Blob
        if (q.partId >= 11 && q.partId <= 15) {
          if (typeof answerValue === "string" && answerValue.startsWith("http")) {
            return true;
          }
          if (answerValue instanceof Blob) {
            return true;
          }
        }
      }
      
      return false;
    };

    // Kiểm tra lần đầu
    const hasAnswers = checkHasAnswers();
    if (!hasAnswers) {
      console.log("ExamScreen - Auto-save: No valid answers yet, will check again when answers change");
      return;
    }

    if (!navigator.onLine) {
      console.log("ExamScreen - Auto-save: Offline, will start when online");
      return;
    }

    console.log("ExamScreen - Auto-save: Starting auto-save interval (every 5 minutes)");

    // Auto-save mỗi 5 phút (300000 ms)
    autoSaveIntervalRef.current = setInterval(() => {
      // Kiểm tra lại trước mỗi lần save
      const stillHasAnswers = checkHasAnswers();
      if (!stillHasAnswers) {
        console.log("ExamScreen - Auto-save: No valid answers, skipping this save");
        return;
      }

      if (!navigator.onLine) {
        console.log("ExamScreen - Auto-save: Offline, skipping this save");
        return;
      }

      if (isSubmittingRef.current) {
        console.log("ExamScreen - Auto-save: Currently submitting, skipping this save");
        return;
      }

      console.log("ExamScreen - Auto-save: Triggering auto-save...");
      handleSaveProgress();
    }, 5 * 60 * 1000); // 5 phút

    return () => {
      if (autoSaveIntervalRef.current) {
        console.log("ExamScreen - Auto-save: Cleaning up interval");
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    };
  }, [rawTestData.testResultId, answers, questions, handleSaveProgress]);

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
              isReported={questions[currentIndex] ? isQuestionReported(questions[currentIndex].testQuestionId) : false}
              onReportSuccess={handleReportSuccess}
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