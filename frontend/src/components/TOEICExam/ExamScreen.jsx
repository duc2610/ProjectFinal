import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Layout, Button, Modal, Typography, message, Spin, Alert } from "antd";
import { MenuOutlined, LoadingOutlined, WarningOutlined } from "@ant-design/icons";
import styles from "@shared/styles/Exam.module.css";
import QuestionNavigator from "./QuestionNavigator";
import QuestionCard from "./QuestionCard";
import { submitTest, submitAssessmentBulk, saveProgress, startTest } from "@services/testExamService";
import { uploadFile } from "@services/filesService";
import { getMyQuestionReports } from "@services/questionReportService";
import { translateErrorMessage } from "@utils/translateError";
import { useNavigate } from "react-router-dom";
import { SaveOutlined } from "@ant-design/icons";
import { useAuth } from "@shared/hooks/useAuth";
import { saveAudioBlob, getAudioBlob, deleteAudioBlob, clearAllAudioBlobs, openDB } from "@utils/audioStorage";

const { Header, Content } = Layout;
const { Text } = Typography;
const MOBILE_NAV_BREAKPOINT = 992;
const TOEIC_TEST_DATA_KEY = "toeic_testData";
const TOEIC_RESULT_META_KEY = "toeic_resultMeta";

const safeReadSessionJson = (key, fallback = {}) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
};

const clearToeicSession = () => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(TOEIC_TEST_DATA_KEY);
    // KHÔNG xóa TOEIC_RESULT_META_KEY vì cần dùng để chặn quay lại ExamScreen
    // sessionStorage.removeItem(TOEIC_RESULT_META_KEY);
  } catch (e) {
    // ignore
  }
};

const clearTestDataOnly = () => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(TOEIC_TEST_DATA_KEY);
  } catch (e) {
    // ignore
  }
};

const getIsCompactViewport = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < MOBILE_NAV_BREAKPOINT;
};

export default function ExamScreen() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const currentUserId = useMemo(() => user?.id || user?.userId || user?.Id || null, [user]);
  const rawTestData = safeReadSessionJson(TOEIC_TEST_DATA_KEY, {});
  // Reset hasRedirectedRef mỗi lần component mount để guard luôn chạy
  const hasRedirectedRef = useRef(false);
  // Track lần cuối cùng guard đã redirect để tránh redirect liên tục
  const lastRedirectTimeRef = useRef(0);
  const [questions] = useState(rawTestData.questions || []);
  // Lần đầu vào: dùng answers từ sessionStorage (đã được load từ ExamSelection/Profile)
  // Khi reload: sẽ load lại từ API startTest
  const [answers, setAnswers] = useState(rawTestData.answers || {});
  const answersRef = useRef(answers);
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
  const [isCompactView, setIsCompactView] = useState(() => getIsCompactViewport());
  const [isNavVisible, setIsNavVisible] = useState(() => !getIsCompactViewport());
  const lastCompactStateRef = useRef(isCompactView);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineAnswers, setOfflineAnswers] = useState(null);
  const [offlineTimestamp, setOfflineTimestamp] = useState(null);
  const offlineAnswersRef = useRef(null);
  const [showSaveInfoAlert, setShowSaveInfoAlert] = useState(true);
  const [reportedQuestionIds, setReportedQuestionIds] = useState(new Set()); // Set các testQuestionId đã report
  const timerRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const startTimestampRef = useRef(safeStartTimestamp);

  const isExamSessionValid = useMemo(() => {
    const hasIds = !!rawTestData?.testId && !!rawTestData?.testResultId;
    const hasQuestions = Array.isArray(questions) && questions.length > 0;
    return hasIds && hasQuestions;
  }, [rawTestData?.testId, rawTestData?.testResultId, questions]);

  // Helper function để xác định trang list test tương ứng dựa trên testMeta
  const resolveListTestPath = useCallback((testMeta) => {
    if (!testMeta) return "/test-list";
    
    const testType = testMeta.testType;
    const testSkill = testMeta.testSkill;
    
    // Kiểm tra xem có phải Practice không
    const isPractice = testType === "Practice" || testType === 2 || 
                       (typeof testType === "string" && testType.toLowerCase().includes("practice"));
    
    if (isPractice) {
      // Kiểm tra skill để xác định trang tương ứng
      if (testSkill === "Speaking" || testSkill === "Writing" || testSkill === "S&W" || 
          testSkill === 1 || testSkill === 2 || testSkill === 4) {
        return "/practice-sw";
      }
      if (testSkill === "Listening & Reading" || testSkill === "L&R" || 
          testSkill === 3) {
        return "/practice-lr";
      }
    }
    
    return "/test-list";
  }, []);

  // Guard 1: Kiểm tra resultMeta TRƯỚC TIÊN, LUÔN LUÔN chạy (không phụ thuộc vào hasRedirectedRef)
  // Điều này đảm bảo mỗi lần vào ExamScreen đều kiểm tra xem bài thi đã được nộp chưa
  // Khi phát hiện bài thi đã được nộp, redirect về trang list test tương ứng (không qua result)
  useEffect(() => {
    try {
      const resultMeta = JSON.parse(sessionStorage.getItem("toeic_resultMeta") || "null");
      if (resultMeta && resultMeta.testResultId) {
        // Kiểm tra xem testResultId trong resultMeta có khớp với testResultId hiện tại không
        // Nếu khớp nghĩa là bài thi này đã được nộp, redirect về trang list test tương ứng NGAY LẬP TỨC
        if (resultMeta.testResultId === rawTestData?.testResultId) {
          // Chỉ redirect nếu chưa redirect trong 100ms gần đây để tránh redirect liên tục
          const now = Date.now();
          if (now - lastRedirectTimeRef.current > 100) {
            lastRedirectTimeRef.current = now;
            // Đánh dấu đã redirect để tránh chạy lại các logic khác
            hasRedirectedRef.current = true;
            // Đánh dấu đã load để không gọi startTest
            hasLoadedFromBackendRef.current = true;
            message.warning({
              content: "Bài thi này đã được nộp. Bạn không thể quay lại màn làm bài.",
              key: "exam_guard",
              duration: 3,
            });
            // Chỉ clear testData, giữ lại resultMeta để tiếp tục chặn
            clearTestDataOnly();
            // Xác định trang list test tương ứng dựa trên testMeta
            const listTestPath = resolveListTestPath(resultMeta);
            // Thay thế entry ExamScreen trong history bằng trang list test TRƯỚC KHI navigate
            // Điều này đảm bảo ExamScreen không được thêm vào history
            window.history.replaceState(null, "", listTestPath);
            // Sau đó navigate để React Router cập nhật state
            navigate(listTestPath, { replace: true });
          }
        }
      }
    } catch (e) {
      // Ignore error
    }
  }, [rawTestData?.testResultId, navigate, resolveListTestPath]); // Thêm resolveListTestPath vào dependencies

  // Guard 2: Các kiểm tra khác (chỉ chạy nếu chưa redirect)
  useEffect(() => {
    // Các kiểm tra khác chỉ chạy nếu chưa redirect
    if (hasRedirectedRef.current) return;

    if (!isExamSessionValid) {
      hasRedirectedRef.current = true;
      message.error({
        content:
          'Phiên làm bài không hợp lệ hoặc bạn chưa bắt đầu bài thi. Vui lòng chọn bài thi và nhấn "Bắt đầu làm bài".',
        key: "exam_guard",
      });
      clearToeicSession();
      navigate("/test-list", { replace: true });
      return;
    }

    // Only check ownership once auth is resolved
    if (authLoading) return;

    // If user is logged in but session has no owner (legacy), block to prevent cross-account leakage
    if (isAuthenticated && currentUserId && !rawTestData?.ownerUserId) {
      hasRedirectedRef.current = true;
      message.error({
        content:
          'Phiên làm bài này không được gắn với tài khoản (dữ liệu cũ). Vui lòng bắt đầu lại từ danh sách bài thi.',
        key: "exam_guard",
      });
      clearToeicSession();
      navigate("/test-list", { replace: true });
      return;
    }

    if (isAuthenticated && currentUserId && rawTestData?.ownerUserId && rawTestData.ownerUserId !== currentUserId) {
      const ownerLabel = rawTestData?.ownerEmail ? ` (${rawTestData.ownerEmail})` : "";
      hasRedirectedRef.current = true;
      message.error({
        content:
          `Bài thi này thuộc về tài khoản khác${ownerLabel}. Vui lòng đăng nhập đúng tài khoản hoặc bắt đầu bài thi mới.`,
        key: "exam_guard",
      });
      clearToeicSession();
      navigate("/test-list", { replace: true });
    }
  }, [authLoading, isAuthenticated, currentUserId, isExamSessionValid, navigate, rawTestData?.ownerUserId, rawTestData?.ownerEmail]);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  
  // Cập nhật startTimestampRef khi safeStartTimestamp thay đổi (ví dụ: khi tiếp tục từ history)
  useEffect(() => {
    startTimestampRef.current = safeStartTimestamp;
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

  // Map hỗ trợ lấy SubQuestionId (questionId của sub-question trong group) từ raw parts
  const subQuestionIdMap = useMemo(() => {
    const map = {};
    try {
      const parts = rawTestData.parts || [];
      parts.forEach((part) => {
        part?.testQuestions?.forEach((tq) => {
          if (tq.isGroup && tq.questionGroupSnapshotDto) {
            const group = tq.questionGroupSnapshotDto;
            group.questionSnapshots?.forEach((qs, idx) => {
              if (qs && typeof qs.questionId === "number") {
                const key = `${tq.testQuestionId}_${idx}`;
                map[key] = qs.questionId;
              }
            });
          }
        });
      });
    } catch (e) {
      // Error building subQuestionIdMap
    }
    return map;
  }, [rawTestData.parts]);

  // Tính toán lại part number để liên tục giữa Writing và Speaking
  const questionsWithAdjustedPartNames = useMemo(() => {
    // Kiểm tra xem có cả Writing và Speaking không
    const hasWriting = questions.some(q => q.partId >= 8 && q.partId <= 10);
    const hasSpeaking = questions.some(q => q.partId >= 11 && q.partId <= 15);
    
    if (!hasWriting || !hasSpeaking) {
      // Nếu không có cả 2, trả về questions gốc
      return questions;
    }

    // Đếm số Writing parts (unique partId từ 8-10)
    const writingPartIds = new Set();
    questions.forEach(q => {
      if (q.partId >= 8 && q.partId <= 10) {
        writingPartIds.add(q.partId);
      }
    });
    const writingPartCount = writingPartIds.size;

    // Tạo map để lưu part number mới cho mỗi partId
    const partNumberMap = new Map();
    let currentPartNumber = 1;

    // Xử lý Writing parts (sắp xếp theo partId tăng dần)
    const sortedWritingPartIds = Array.from(writingPartIds).sort((a, b) => a - b);
    sortedWritingPartIds.forEach(partId => {
      partNumberMap.set(partId, currentPartNumber);
      currentPartNumber++;
    });

    // Xử lý Speaking parts (sắp xếp theo partId tăng dần, cộng thêm số Writing parts)
    const speakingPartIds = new Set();
    questions.forEach(q => {
      if (q.partId >= 11 && q.partId <= 15) {
        speakingPartIds.add(q.partId);
      }
    });
    const sortedSpeakingPartIds = Array.from(speakingPartIds).sort((a, b) => a - b);
    sortedSpeakingPartIds.forEach(partId => {
      partNumberMap.set(partId, currentPartNumber);
      currentPartNumber++;
    });

    // Tạo mảng questions mới với partName đã được cập nhật
    return questions.map(q => {
      if (q.partId >= 11 && q.partId <= 15) {
        // Nếu là Speaking part, cập nhật partName
        const newPartNumber = partNumberMap.get(q.partId);
        if (newPartNumber && q.partName) {
          // Thay thế số part trong partName
          // Hỗ trợ các format: "S-PART 1", "S-PART 1 - ...", "SPART 1", v.v.
          let updatedPartName = q.partName;
          
          // Thử thay thế với format "S-PART X" hoặc "SPART X"
          if (updatedPartName.match(/S[- ]?PART\s+\d+/i)) {
            updatedPartName = updatedPartName.replace(
              /(S[- ]?PART\s+)\d+/i,
              `$1${newPartNumber}`
            );
          } else {
            // Nếu không match format trên, thử tìm và thay thế số đầu tiên sau "PART"
            updatedPartName = updatedPartName.replace(
              /(PART\s+)\d+/i,
              `$1${newPartNumber}`
            );
          }
          
          return {
            ...q,
            partName: updatedPartName
          };
        }
      }
      return q;
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
      
      // KIỂM TRA TRƯỚC: Nếu bài thi đã được nộp (có resultMeta), KHÔNG gọi startTest
      // Kiểm tra này phải chạy TRƯỚC khi gọi startTest để tránh tạo test mới
      try {
        const resultMeta = JSON.parse(sessionStorage.getItem("toeic_resultMeta") || "null");
        if (resultMeta && resultMeta.testResultId) {
          // Nếu testResultId trong resultMeta khớp với testResultId hiện tại → bài đã nộp
          if (resultMeta.testResultId === rawTestData?.testResultId) {
            hasLoadedFromBackendRef.current = true;
            // Không gọi startTest, để guard xử lý redirect
            // Đảm bảo không tạo test mới
            return;
          }
        }
      } catch (e) {
        // Ignore error
      }
      
      // Kiểm tra nếu guard đã redirect (hasRedirectedRef)
      if (hasRedirectedRef.current) {
        hasLoadedFromBackendRef.current = true;
        return;
      }
      
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
            
            // Xử lý đặc biệt cho speaking_group: map answers từ sub-question đầu tiên sang group testQuestionId
            // Nếu backend lưu với testQuestionId của sub-question đầu tiên, cần map lại sang testQuestionId của group
            questions.forEach((q) => {
              if (q.type === "speaking_group" && q.subQuestions && q.subQuestions.length > 0) {
                const firstSubQ = q.subQuestions[0];
                const groupTestQuestionId = String(q.testQuestionId);
                const firstSubQTestQuestionId = String(firstSubQ.testQuestionId);
                
                // Nếu có answer với testQuestionId của sub-question đầu tiên, map sang testQuestionId của group
                if (firstSubQTestQuestionId !== groupTestQuestionId) {
                  const subQAnswerKey = firstSubQTestQuestionId; // subQuestionIndex = 0
                  if (savedAnswersObj[subQAnswerKey] && !savedAnswersObj[groupTestQuestionId]) {
                    savedAnswersObj[groupTestQuestionId] = savedAnswersObj[subQAnswerKey];
                  }
                }
              }
            });
            
            // Chỉ dùng answers từ API, không merge với sessionStorage
            setAnswers(savedAnswersObj);
            
            // Cập nhật sessionStorage với answers từ backend
            const savedData = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
            savedData.answers = savedAnswersObj;
            savedData.lastBackendLoadTime = Date.now();
            sessionStorage.setItem("toeic_testData", JSON.stringify(savedData));
            
          } else {
            // Nếu không có savedAnswers từ API, set answers rỗng
            setAnswers({});
            const savedData = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
            savedData.answers = {};
            savedData.lastBackendLoadTime = Date.now();
            sessionStorage.setItem("toeic_testData", JSON.stringify(savedData));
          }
        } catch (error) {
          // Nếu lỗi, vẫn dùng answers từ sessionStorage (fallback)
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
        
        // Chỉ lấy những reports có trạng thái khác "Resolved" (Đã xử lý) và "Rejected" (Từ chối)
        // Vì backend cho phép báo cáo lại nếu đã được xử lý hoặc từ chối
        const activeReports = reportsData.filter(report => {
          const status = (report.status || "").toLowerCase();
          return status !== "resolved" && status !== "rejected";
        });
        
        // Tạo Set các key đã report: "testQuestionId_subQuestionId" 
        // Backend luôn trả về subQuestionId (có thể là questionId) cho cả câu đơn và câu nhóm
        // Với nhóm câu: subQuestionId là questionId của sub-question
        // Với câu đơn: subQuestionId cũng có thể là questionId (không phải 0)
        const reportedIds = new Set();
        activeReports.forEach(report => {
          if (report.testQuestionId) {
            // Backend luôn trả về subQuestionId, dùng trực tiếp (không phân biệt câu đơn/nhóm)
            if (report.subQuestionId !== null && report.subQuestionId !== undefined) {
              const key = `${report.testQuestionId}_${report.subQuestionId}`;
              reportedIds.add(key);
              if (process.env.NODE_ENV === 'development') {
                const isGroup = !!report.isQuestionGroup;
              }
            }
          }
        });
        
        setReportedQuestionIds(reportedIds);
      } catch (error) {
        // Không hiển thị error vì đây là tính năng phụ
      }
    };
    
    loadReports();
  }, []);

  // Function để check xem câu hỏi đã report chưa
  // Backend luôn trả về subQuestionId (có thể là questionId) cho cả câu đơn và câu nhóm
  // Với nhóm câu: subQuestionId là questionId của sub-question
  // Với câu đơn: subQuestionId cũng có thể là questionId (không phải 0)
  const isQuestionReported = (testQuestionId, subQuestionId = null, isGroup = false) => {
    if (!testQuestionId) return false;
    // Backend luôn trả về subQuestionId, dùng trực tiếp nếu có
    // Nếu không có subQuestionId, không thể check (cả câu đơn và nhóm)
    if (subQuestionId === null || subQuestionId === undefined) {
      return false;
    }
    const key = `${testQuestionId}_${subQuestionId}`;
    const isReported = reportedQuestionIds.has(key);
    return isReported;
  };

  // Callback khi report thành công
  // Backend luôn trả về subQuestionId (có thể là questionId) cho cả câu đơn và câu nhóm
  const handleReportSuccess = async (testQuestionId, subQuestionId = null, isGroup = false) => {
    if (!testQuestionId) return;
    // Backend luôn trả về subQuestionId, dùng trực tiếp nếu có
    // Nếu không có subQuestionId, không thể tạo key (cả câu đơn và nhóm)
    if (subQuestionId === null || subQuestionId === undefined) {
      return;
    }
    const key = `${testQuestionId}_${subQuestionId}`;
    // Cập nhật state ngay lập tức để UI phản hồi nhanh
    setReportedQuestionIds(prev => new Set([...prev, key]));
    
    // Reload reports từ API để lấy status mới nhất
    try {
      const response = await getMyQuestionReports(1, 1000);
      const reportsData = response?.data || [];
      
      // Chỉ lấy những reports có trạng thái khác "Resolved" (Đã xử lý) và "Rejected" (Từ chối)
      const activeReports = reportsData.filter(report => {
        const status = (report.status || "").toLowerCase();
        return status !== "resolved" && status !== "rejected";
      });
      
      // Cập nhật lại Set với dữ liệu mới từ API
      // Backend luôn trả về subQuestionId (có thể là questionId) cho cả câu đơn và câu nhóm
      const reportedIds = new Set();
      activeReports.forEach(report => {
        if (report.testQuestionId) {
          // Backend luôn trả về subQuestionId, dùng trực tiếp (không phân biệt câu đơn/nhóm)
          if (report.subQuestionId !== null && report.subQuestionId !== undefined) {
            const keyReport = `${report.testQuestionId}_${report.subQuestionId}`;
            reportedIds.add(keyReport);
          }
        }
      });
      
      setReportedQuestionIds(reportedIds);
    } catch (error) {
      // Nếu lỗi, vẫn giữ key đã thêm vào để UI vẫn hiển thị đúng
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      history.go(1);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    if (!rawTestData.testResultId || questions.length === 0) {
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        message.error({
          content:
            'Phiên làm bài không hợp lệ hoặc bạn chưa bắt đầu bài thi. Vui lòng chọn bài thi và nhấn "Bắt đầu làm bài".',
          key: "exam_guard",
        });
        clearToeicSession();
        navigate("/test-list", { replace: true });
      }
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      const compact = getIsCompactViewport();
      setIsCompactView(compact);
      if (lastCompactStateRef.current !== compact) {
        if (compact) {
          setIsNavVisible(false);
        } else {
          setIsNavVisible(true);
        }
        lastCompactStateRef.current = compact;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        // Error saving answers to sessionStorage
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
        // Error saving currentIndex to sessionStorage
      }
    }
  };

  // Hàm format answers cho tất cả loại bài thi (L&R, Writing, Speaking)
  const formatAllAnswers = useCallback((answersToFormat) => {
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
      // Với speaking_group, audio được lưu với key là testQuestionId của câu đầu tiên (subQuestionIndex = 0)
      let q = questions.find((q) => {
        // Nếu là speaking_group, kiểm tra xem answerKey có khớp với testQuestionId của câu đầu không
        if (q.type === "speaking_group" && q.subQuestions && q.subQuestions.length > 0) {
          const firstSubQ = q.subQuestions[0];
          // Audio được lưu với key là testQuestionId của câu đầu (subQuestionIndex = 0)
          if (String(firstSubQ.testQuestionId) === String(testQuestionId) && subQuestionIndex === null) {
            return true;
          }
        }
        // Câu hỏi thường
        return q.testQuestionId === testQuestionId && 
          (q.subQuestionIndex === subQuestionIndex || (subQuestionIndex === null && !q.subQuestionIndex));
      });
      if (!q) continue;

      const isLrPart = q.partId >= 1 && q.partId <= 7;
      const isWritingPart = q.partId >= 8 && q.partId <= 10;
      const isSpeakingPart = q.partId >= 11 && q.partId <= 15;
      const isSpeakingGroup = q.type === "speaking_group" && q.subQuestions && q.subQuestions.length > 0;

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
        // Speaking: kiểm tra xem có phải speaking_group không
        if (isSpeakingGroup) {
          // speaking_group: format answer cho tất cả sub-questions
          const audioUrl = typeof answerValue === "string" && answerValue.startsWith("http") 
            ? answerValue 
            : null;
          // Chỉ lưu nếu đã upload (có URL)
          if (audioUrl) {
            q.subQuestions.forEach((subQ) => {
              formattedAnswers.push({
                testQuestionId: subQ.testQuestionId,
                chosenOptionLabel: null,
                answerText: null,
                answerAudioUrl: audioUrl,
                subQuestionIndex: subQ.subQuestionIndex,
              });
            });
          }
        } else {
          // Câu đơn hoặc group thường: format như bình thường
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
    }
    return formattedAnswers;
  }, [questions]);

  // Hàm lưu tiến độ làm bài (cho tất cả loại bài thi)
  const handleSaveProgress = useCallback(async (answersSnapshot = null) => {
    const testResultId = rawTestData.testResultId;
    if (!testResultId) {
      message.error(
        'Phiên làm bài không hợp lệ hoặc đã hết hạn. Vui lòng bắt đầu lại từ danh sách bài thi.'
      );
      clearToeicSession();
      navigate("/test-list", { replace: true });
      return;
    }

    // Kiểm tra mạng
    if (!navigator.onLine) {
      message.warning("Không có kết nối mạng. Vui lòng kiểm tra lại kết nối.");
      return;
    }

    // Ưu tiên dùng snapshot nếu có, nếu không thì dùng answers state (cho lưu thủ công), 
    // cuối cùng mới dùng answersRef (cho auto-save)
    const snapshot = answersSnapshot || answers || answersRef.current || {};
    const formattedAnswers = formatAllAnswers(snapshot);

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
      // Nếu lỗi do mất mạng, lưu answers vào offlineAnswers
      if (!navigator.onLine || error.code === 'ERR_NETWORK' || error.message.includes('Network')) {
        setOfflineAnswers({ ...snapshot });
        setOfflineTimestamp(new Date());
        setIsOnline(false);
        setShowOfflineModal(true);
      } else if (error.response?.status === 405) {
        // Endpoint chưa được implement trên backend
        message.warning("Tính năng lưu tiến độ chưa được kích hoạt. Vui lòng liên hệ quản trị viên.");
      } else {
        message.error("Không thể lưu tiến độ: " + translateErrorMessage(error.response?.data?.message || error.message));
      }
    } finally {
      setIsSaving(false);
    }
  }, [rawTestData.testResultId, formatAllAnswers, answers]);

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

  // Hàm retry upload các audio Blob đã lưu trong IndexedDB
  const retryPendingAudioUploads = useCallback(async () => {
    if (!navigator.onLine) return;
    
    try {
      // Lấy tất cả keys từ IndexedDB
      const db = await openDB();
      const transaction = db.transaction(["audioBlobs"], "readonly");
      const store = transaction.objectStore("audioBlobs");
      const keysRequest = store.getAllKeys();
      
      const keys = await new Promise((resolve, reject) => {
        keysRequest.onsuccess = () => resolve(keysRequest.result);
        keysRequest.onerror = () => reject(keysRequest.error);
      });
      
      if (keys.length === 0) return;
      
      console.log(`[Retry] Found ${keys.length} pending audio uploads, retrying...`);
      message.info(`Đang thử lại upload ${keys.length} audio chưa hoàn thành...`);
      
      let successCount = 0;
      let failCount = 0;
      
      // Retry từng Blob
      for (const key of keys) {
        try {
          const blob = await getAudioBlob(key);
          if (!blob) continue;
          
          // Parse key để lấy testQuestionId và subQuestionIndex
          let testQuestionId, subQuestionIndex;
          if (key.startsWith("group_")) {
            testQuestionId = parseInt(key.replace("group_", ""));
            subQuestionIndex = 0;
          } else {
            const parts = key.split("_");
            testQuestionId = parseInt(parts[0]);
            subQuestionIndex = parseInt(parts[1]) || 0;
          }
          
          // Tìm question để xác định partType
          const q = questions.find(q => {
            if (key.startsWith("group_")) {
              return q.type === "speaking_group" && q.testQuestionId === testQuestionId;
            }
            return q.testQuestionId === testQuestionId && 
              (q.subQuestionIndex === subQuestionIndex || (subQuestionIndex === 0 && !q.subQuestionIndex));
          });
          
          if (!q) {
            // Nếu không tìm thấy question, xóa Blob
            await deleteAudioBlob(key);
            continue;
          }
          
          // Upload Blob
          const audioFile = new File([blob], `speaking_${testQuestionId}_${subQuestionIndex}.webm`, {
            type: "audio/webm",
          });
          
          const audioUrl = await uploadFile(audioFile, "audio");
          
          // Cập nhật answers với URL mới
          const answerKey = key.startsWith("group_") 
            ? String(testQuestionId) 
            : `${testQuestionId}_${subQuestionIndex}`;
          
          setAnswers(prev => ({
            ...prev,
            [answerKey]: audioUrl
          }));
          
          // Xóa Blob khỏi IndexedDB sau khi upload thành công
          await deleteAudioBlob(key);
          successCount++;
          
          console.log(`[Retry] Successfully uploaded audio for key: ${key}`);
        } catch (error) {
          console.error(`[Retry] Failed to upload audio for key ${key}:`, error);
          failCount++;
          
          // Nếu lỗi không phải do mạng, xóa Blob (không retry nữa)
          if (error.code !== 'ERR_NETWORK' && !error.message.includes('Network') && !error.message.includes('timeout')) {
            await deleteAudioBlob(key);
          }
        }
      }
      
      if (successCount > 0) {
        message.success(`Đã upload thành công ${successCount} audio. ${failCount > 0 ? `${failCount} audio còn lại sẽ thử lại sau.` : ''}`);
      } else if (failCount > 0) {
        message.warning(`Không thể upload ${failCount} audio. Sẽ thử lại khi kết nối ổn định hơn.`);
      }
    } catch (error) {
      console.error("[Retry] Error retrying audio uploads:", error);
    }
  }, [questions]);

  // ExamScreen.jsx
  const handleSubmit = async (auto = false, answersToSubmit = null) => {
    // Nếu có answersToSubmit (khi mất mạng), dùng nó, nếu không dùng answers hiện tại
    const finalAnswers = answersToSubmit || answers;
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    // Guard invalid session early (avoid "Không tìm thấy testResultId" noise)
    if (!rawTestData?.testResultId || !rawTestData?.testId || !questions?.length) {
      message.error(
        'Phiên làm bài không hợp lệ hoặc bạn chưa bắt đầu bài thi. Vui lòng bắt đầu lại từ danh sách bài thi.'
      );
      clearToeicSession();
      navigate("/test-list", { replace: true });
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
      const durationSeconds = Math.max(1, elapsedSeconds); // API yêu cầu duration tính bằng giây
      const durationMinutes = Math.round(durationSeconds / 60); // Tính durationMinutes từ durationSeconds (cho L&R và resultMeta)
      const testType = rawTestData.testType || "Simulator";
      // API yêu cầu "Simulator" hoặc "Practice" (case-sensitive), không phải lowercase
      const testTypeForSW = testType === "Simulator" || testType === "simulator" ? "Simulator" : "Practice";

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
        // Với speaking_group, audio được lưu với key là testQuestionId của câu đầu tiên (subQuestionIndex = 0)
        let q = questions.find((q) => {
          // Nếu là speaking_group, kiểm tra xem answerKey có khớp với testQuestionId của câu đầu không
          if (q.type === "speaking_group" && q.subQuestions && q.subQuestions.length > 0) {
            const firstSubQ = q.subQuestions[0];
            // Audio được lưu với key là testQuestionId của câu đầu (subQuestionIndex = 0)
            if (String(firstSubQ.testQuestionId) === String(testQuestionId) && subQuestionIndex === 0) {
              return true;
            }
          }
          // Câu hỏi thường
          return q.testQuestionId === testQuestionId && 
            (q.subQuestionIndex === subQuestionIndex || (subQuestionIndex === 0 && !q.subQuestionIndex));
        });
        if (!q) continue;

        const isWritingPart = q.partId >= 8 && q.partId <= 10;
        const isSpeakingPart = q.partId >= 11 && q.partId <= 15;
        const isLrPart = q.partId >= 1 && q.partId <= 7;
        const isSpeakingGroup = q.type === "speaking_group" && q.subQuestions && q.subQuestions.length > 0;

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
          // Speaking: kiểm tra xem có phải speaking_group không
          if (isSpeakingGroup) {
            // speaking_group: Theo API doc, chỉ gửi 1 entry với testQuestionId của group
            // Backend sẽ xử lý và trả về 1 score cho cả group
            let audioUrl = null;
            
            // Nếu answerValue là URL (string) thì dùng trực tiếp
            if (typeof answerValue === "string" && answerValue.startsWith("http")) {
              audioUrl = answerValue;
            } 
              // Nếu answerValue là Blob thì upload lên
              else if (answerValue instanceof Blob) {
                try {
                  // Upload audio file với timeout
                  const audioFile = new File([answerValue], `speaking_group_${q.testQuestionId}.webm`, {
                    type: "audio/webm",
                  });
                  
                  // Thử upload với timeout 30 giây
                  const uploadPromise = uploadFile(audioFile, "audio");
                  const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("Upload timeout")), 30000)
                  );
                  
                  audioUrl = await Promise.race([uploadPromise, timeoutPromise]);
                  
                  // Nếu upload thành công, xóa Blob khỏi IndexedDB (nếu có)
                  try {
                    await deleteAudioBlob(`group_${q.testQuestionId}`);
                  } catch (e) {
                    // Ignore error khi xóa
                  }
                } catch (error) {
                  console.error(`Upload audio failed for speaking group ${q.testQuestionId}:`, error);
                  
                  // Nếu lỗi do mất mạng, lưu Blob vào IndexedDB để retry sau
                  const isNetworkError = !navigator.onLine || error.code === 'ERR_NETWORK' || error.message.includes('Network') || error.message.includes('timeout');
                  if (isNetworkError) {
                    try {
                      await saveAudioBlob(`group_${q.testQuestionId}`, answerValue);
                      console.log(`[Retry] Saved audio blob for speaking group ${q.testQuestionId} to IndexedDB`);
                      message.warning(`Mất mạng khi upload audio cho nhóm câu ${q.globalIndex || q.testQuestionId}. Sẽ tự động thử lại khi kết nối lại.`);
                    } catch (saveError) {
                      console.error(`Failed to save audio blob to IndexedDB:`, saveError);
                      message.warning(`Không thể upload audio cho nhóm câu ${q.globalIndex || q.testQuestionId}. Nhóm này sẽ bị bỏ qua.`);
                    }
                  } else {
                    message.warning(`Không thể upload audio cho nhóm câu ${q.globalIndex || q.testQuestionId}. Nhóm này sẽ bị bỏ qua.`);
                  }
                  audioUrl = null;
                }
              }
            
            // Chỉ lưu nếu đã upload thành công (có URL hợp lệ)
            if (audioUrl !== null && audioUrl !== undefined && audioUrl.trim() !== "") {
              const partType = getPartType(q.partId);
              if (partType) {
                // q.testQuestionId chính là testQuestionId của group (từ backend)
                // Chỉ gửi 1 entry cho cả group, không gửi từng sub-question
                swAnswers.push({
                  testQuestionId: q.testQuestionId, // testQuestionId của group (không phải của sub-question)
                  partType: partType,
                  answerText: null,
                  audioFileUrl: audioUrl,
                });
              }
            } else if (answerValue instanceof Blob) {
              // Nếu upload thất bại, log để debug nhưng không push vào swAnswers
              console.warn(`Skipping speaking group ${q.testQuestionId} - upload failed`);
            }
          } else {
            // Câu đơn hoặc group thường: format như bình thường
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
                  // Upload audio file với timeout
                  const audioFile = new File([answerValue], `speaking_${testQuestionId}_${subQuestionIndex}.webm`, {
                    type: "audio/webm",
                  });
                  
                  // Thử upload với timeout 30 giây
                  const uploadPromise = uploadFile(audioFile, "audio");
                  const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("Upload timeout")), 30000)
                  );
                  
                  audioFileUrl = await Promise.race([uploadPromise, timeoutPromise]);
                  
                  // Nếu upload thành công, xóa Blob khỏi IndexedDB (nếu có)
                  try {
                    await deleteAudioBlob(`${testQuestionId}_${subQuestionIndex}`);
                  } catch (e) {
                    // Ignore error khi xóa
                  }
                } catch (error) {
                  console.error(`Upload audio failed for question ${testQuestionId}:`, error);
                  
                  // Nếu lỗi do mất mạng, lưu Blob vào IndexedDB để retry sau
                  const isNetworkError = !navigator.onLine || error.code === 'ERR_NETWORK' || error.message.includes('Network') || error.message.includes('timeout');
                  if (isNetworkError) {
                    try {
                      await saveAudioBlob(`${testQuestionId}_${subQuestionIndex}`, answerValue);
                      console.log(`[Retry] Saved audio blob for question ${testQuestionId} to IndexedDB`);
                      message.warning(`Mất mạng khi upload audio cho câu ${q.globalIndex || testQuestionId}. Sẽ tự động thử lại khi kết nối lại.`);
                    } catch (saveError) {
                      console.error(`Failed to save audio blob to IndexedDB:`, saveError);
                      message.warning(`Không thể upload audio cho câu ${q.globalIndex || testQuestionId}. Câu này sẽ bị bỏ qua.`);
                    }
                  } else {
                    message.warning(`Không thể upload audio cho câu ${q.globalIndex || testQuestionId}. Câu này sẽ bị bỏ qua.`);
                  }
                  audioFileUrl = null;
                }
              }
              
              // QUAN TRỌNG: Chỉ thêm vào swAnswers nếu có audioFileUrl hợp lệ (không null)
              // Backend sẽ throw exception nếu audioFileUrl là null/empty cho speaking part
              if (audioFileUrl !== null && audioFileUrl !== undefined && audioFileUrl.trim() !== "") {
                swAnswers.push({
                  testQuestionId: testQuestionId,
                  partType: partType,
                  answerText: null,
                  audioFileUrl: audioFileUrl,
                });
              } else if (answerValue instanceof Blob) {
                // Nếu upload thất bại, log để debug nhưng không push vào swAnswers
                console.warn(`Skipping question ${testQuestionId} - upload failed`);
              }
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
      
      
      if (lrAnswers.length > 0) {
        const lrPayload = {
          userId: currentUserId || rawTestData.ownerUserId || null,
          testId: rawTestData.testId,
          testResultId: finalTestResultId, // Dùng testResultId ban đầu (từ history nếu tiếp tục test)
          duration: durationMinutes,
          testType: testType,
          answers: lrAnswers,
        };
        lrResult = await submitTest(lrPayload);

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
            // Error syncing testResultId to sessionStorage
          }
        } else if (isContinueFromHistory) {
        }
      }

      // Submit S&W nếu có (dùng CÙNG testResultId ban đầu, hoặc từ history nếu tiếp tục test)
      let swResult = null;
      if (swAnswers.length > 0) {
        // Log để debug: số lượng câu sẽ gửi
        console.log(`[Submit] Sending ${swAnswers.length} S&W answers to backend:`, 
          swAnswers.map(a => ({ testQuestionId: a.testQuestionId, partType: a.partType, hasAudio: !!a.audioFileUrl }))
        );
        
        const swPayload = {
          testResultId: finalTestResultId, // Dùng CÙNG testResultId ban đầu (từ history nếu tiếp tục test)
          testType: testTypeForSW, // "Simulator" hoặc "Practice" (case-sensitive)
          duration: durationMinutes, // API yêu cầu duration tính bằng phút
          parts: swAnswers,
        };
        swResult = await submitAssessmentBulk(swPayload);
        // KHÔNG cập nhật testResultId từ response - luôn dùng testResultId ban đầu hoặc từ history
      } else {
        // Log nếu không có câu nào để gửi
        const speakingAnswers = Object.entries(finalAnswers).filter(([key, value]) => {
          const testQuestionId = parseInt(key.split('_')[0]);
          const q = questions.find(q => q.testQuestionId === testQuestionId);
          return q && q.partId >= 11 && q.partId <= 15;
        });
        if (speakingAnswers.length > 0) {
          console.warn(`[Submit] Có ${speakingAnswers.length} câu speaking nhưng không có câu nào được thêm vào swAnswers. Có thể do upload thất bại.`);
        }
      }

      // Kiểm tra lại nếu không có câu nào được trả lời (sau khi format)
      // Lưu ý: Kiểm tra này có thể xảy ra nếu tất cả answers không hợp lệ (ví dụ: Speaking chưa upload)
      if (lrAnswers.length === 0 && swAnswers.length === 0) {
        message.warning("Bạn chưa trả lời câu nào hoặc các câu trả lời chưa hợp lệ!");
        setShowSubmitModal(false);
        setIsSubmitting(false); // Reset flag để nút không bị disable
        return;
      }

      // Lưu metadata cơ bản để màn kết quả có thể lấy lại thông tin test
      const resultMeta = {
        testResultId: finalTestResultId,
        testId: rawTestData.testId,
        testType,
        testSkill: rawTestData.testSkill,
        duration: durationMinutes,
        questionQuantity:
          rawTestData.questionQuantity ||
          rawTestData.quantityQuestion ||
          questions.length,
        isSelectTime,
        title: rawTestData.title || rawTestData.testTitle || "",
      };

      try {
        sessionStorage.setItem("toeic_resultMeta", JSON.stringify(resultMeta));
      } catch (e) {
        // Error saving result meta to sessionStorage
      }

      // Xóa tất cả audio Blob trong IndexedDB sau khi submit thành công
      try {
        await clearAllAudioBlobs();
        console.log("[Submit] Cleared all audio blobs from IndexedDB after successful submission");
      } catch (error) {
        console.error("[Submit] Error clearing audio blobs:", error);
      }

      setTimeout(() => {
        setShowSubmitModal(false);
        // Dùng replace: true để thay thế history entry của ExamScreen, không cho phép back về
        navigate("/result", {
          state: { testResultId: finalTestResultId, testMeta: resultMeta, autoSubmit: auto },
          replace: true,
        });
      }, 900);
    } catch (error) {
      message.error("Nộp bài thất bại: " + translateErrorMessage(error.response?.data?.message || error.message));
      setShowSubmitModal(false);
      setIsSubmitting(false); // Reset flag on error
    }
  };

  useEffect(() => {
    if (!isExamSessionValid) return;
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
  }, [isSelectTime, timeLeft, isExamSessionValid]);

  // Sync offlineAnswers với ref
  useEffect(() => {
    offlineAnswersRef.current = offlineAnswers;
  }, [offlineAnswers]);

  // Phát hiện mất mạng/kết nối lại - check liên tục
  useEffect(() => {
    if (!isExamSessionValid) return;

    let networkCheckInterval = null;
    let lastOnlineState = navigator.onLine;

    // Hàm check mạng bằng cách kiểm tra navigator.onLine
    const checkNetworkConnection = () => {
      // Nếu đang submit, không check mạng
      if (isSubmittingRef.current) return;

      const currentOnlineState = navigator.onLine;

      // Nếu trạng thái mạng thay đổi
      if (currentOnlineState !== lastOnlineState) {
        if (currentOnlineState) {
          // Từ offline chuyển sang online
          lastOnlineState = true;
          setIsOnline(true);
          setShowOfflineModal(false);
          
          // Nếu có offlineAnswers, thử lưu lại
          const savedOfflineAnswers = offlineAnswersRef.current;
          if (savedOfflineAnswers) {
            message.info("Đã kết nối lại mạng. Đang lưu lại tiến độ...");
            // Cập nhật answers với offlineAnswers và thử lưu
            setAnswers(savedOfflineAnswers);
            setTimeout(() => {
              handleSaveProgress(savedOfflineAnswers);
            }, 1000);
          }
          
          // Tự động retry upload các audio Blob đã lưu trong IndexedDB
          retryPendingAudioUploads();
        } else {
          // Từ online chuyển sang offline
          lastOnlineState = false;
          setIsOnline(false);
          // Lưu answers hiện tại vào offlineAnswers
          const currentAnswers = answersRef.current || {};
          const answersToSave = { ...currentAnswers };
          setOfflineAnswers(answersToSave);
          offlineAnswersRef.current = answersToSave;
          setOfflineTimestamp(new Date());
          setShowOfflineModal(true);
        }
      }
    };

    // Event listeners cho online/offline events
    const handleOnline = () => {
      lastOnlineState = true;
      setIsOnline(true);
      setShowOfflineModal(false);
      // Nếu có offlineAnswers, thử lưu lại
      const savedOfflineAnswers = offlineAnswersRef.current;
      if (savedOfflineAnswers) {
        message.info("Đã kết nối lại mạng. Đang lưu lại tiến độ...");
        // Cập nhật answers với offlineAnswers và thử lưu
        setAnswers(savedOfflineAnswers);
        setTimeout(() => {
          handleSaveProgress(savedOfflineAnswers);
        }, 1000);
      }
      
      // Tự động retry upload các audio Blob đã lưu trong IndexedDB
      retryPendingAudioUploads();
    };

    const handleOffline = () => {
      lastOnlineState = false;
      setIsOnline(false);
      // Lưu answers hiện tại vào offlineAnswers
      const currentAnswers = answersRef.current || {};
      const answersToSave = { ...currentAnswers };
      setOfflineAnswers(answersToSave);
      offlineAnswersRef.current = answersToSave;
      setOfflineTimestamp(new Date());
      setShowOfflineModal(true);
    };

    // Đăng ký event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check mạng định kỳ mỗi 3 giây để đảm bảo phát hiện mất mạng ngay lập tức
    // (ngay cả khi event listeners không hoạt động)
    networkCheckInterval = setInterval(() => {
      checkNetworkConnection();
    }, 3000);

    // Check ngay lập tức khi mount
    checkNetworkConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (networkCheckInterval) {
        clearInterval(networkCheckInterval);
      }
    };
  }, [isExamSessionValid, handleSaveProgress]); // Chỉ phụ thuộc vào isExamSessionValid và handleSaveProgress

  // Auto-save tiến độ mỗi 5 phút (cho tất cả loại bài thi)
  useEffect(() => {
    if (!rawTestData.testResultId) {
      return;
    }
    // Hàm kiểm tra có câu trả lời hợp lệ không (dùng answersRef để tránh reset interval)
    const checkHasAnswers = () => {
      const currentAnswers = answersRef.current || {};
      if (Object.keys(currentAnswers).length === 0) {
        return false;
      }

      for (const [answerKey, answerValue] of Object.entries(currentAnswers)) {
        if (!answerValue) continue;

        let testQuestionId, subQuestionIndex;
        if (answerKey.includes('_')) {
          const parts = answerKey.split('_');
          testQuestionId = parseInt(parts[0]);
          subQuestionIndex = parseInt(parts[1]);
        } else {
          testQuestionId = parseInt(answerKey);
          subQuestionIndex = 0;
        }

        const q = questions.find((q) => 
          q.testQuestionId === testQuestionId && 
          (q.subQuestionIndex === subQuestionIndex || (subQuestionIndex === 0 && !q.subQuestionIndex))
        );
        
        if (!q) continue;

        if (q.partId >= 1 && q.partId <= 7) {
          return true;
        }
        
        if (q.partId >= 8 && q.partId <= 10 && typeof answerValue === "string" && answerValue.trim() !== "") {
          return true;
        }
        
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

    const hasAnswers = checkHasAnswers();
    if (!hasAnswers) {
      return;
    }

    if (!navigator.onLine) {
      return;
    }

    // Đã có interval thì không tạo thêm, tránh reset mỗi lần đổi đáp án
    if (autoSaveIntervalRef.current) {
      return;
    }

    autoSaveIntervalRef.current = setInterval(() => {
      const stillHasAnswers = checkHasAnswers();
      if (!stillHasAnswers) {
        return;
      }

      if (!navigator.onLine) {
        return;
      }

      if (isSubmittingRef.current) {
        return;
      }

      handleSaveProgress();
    }, 5 * 60 * 1000); // 5 phút
  }, [rawTestData.testResultId, questions, handleSaveProgress, answers]);

  useEffect(() => {
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    };
  }, []);

  const formatTime = (value) => {
    const safeSeconds = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };
  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;

  const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  const renderNavigator = () => (
    <div
      className={`${styles.sideNav} ${isCompactView ? styles.sideNavCompact : ""}`}
    >
      <QuestionNavigator
        questions={questionsWithAdjustedPartNames}
        currentIndex={currentIndex}
        answers={answers}
        goToQuestionByIndex={goToQuestionByIndex}
      />
      </div>
    );

  const renderActionButtons = (variant = "desktop") => {
    const containerClass =
      variant === "mobile" ? styles.mobileActionBar : styles.headerRight;
    const btnClassExtra =
      variant === "mobile" ? styles.actionBtnMobile : "";
    const metricClass =
      variant === "mobile"
        ? `${styles.answerCounter} ${styles.mobileMetric}`
        : styles.answerCounter;

  return (
      <div className={containerClass}>
            <Button 
              icon={<SaveOutlined />}
              onClick={() => handleSaveProgress(answers)}
              disabled={isSaving || isSubmitting}
              loading={isSaving}
          className={`${styles.actionBtn} ${styles.saveBtn} ${btnClassExtra}`}
            >
              Lưu
            </Button>
            <Button 
              onClick={() => {
                Modal.confirm({
                  title: "Xác nhận nộp bài",
                  content: "Bạn có chắc chắn muốn nộp bài? Sau khi nộp bạn sẽ không thể tiếp tục làm bài này.",
                  okText: "Nộp bài",
                  cancelText: "Hủy",
                  onOk: () => {
                    // Gọi handleSubmit ngay lập tức, modal sẽ tự động đóng khi onOk được gọi
                    // Không return Promise để modal đóng ngay, không đợi handleSubmit hoàn thành
                    handleSubmit(false);
                  },
                });
              }}
              disabled={isSubmitting}
              loading={isSubmitting}
          className={`${styles.actionBtn} ${styles.submitBtn} ${btnClassExtra}`}
            >
              Nộp bài
            </Button>
            <Button 
          className={`${styles.actionBtn} ${styles.timerBtn} ${btnClassExtra}`}
              type="dashed"
            >
              {formatTime(isSelectTime ? timeLeft : timeElapsed)}
            </Button>
        <Text className={metricClass}>
              {answeredCount}/{totalCount} câu
            </Text>
          </div>
    );
  };

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
          {!isCompactView && renderActionButtons("desktop")}
        </div>
      </Header>

      {isCompactView && (
        <div className={styles.mobileActionWrapper}>
          {renderActionButtons("mobile")}
        </div>
      )}

      <Content className={styles.contentArea}>
        {isCompactView && isNavVisible && (
          <>
            <div
              className={styles.navBackdrop}
              onClick={() => setIsNavVisible(false)}
            />
            {renderNavigator()}
          </>
          )}
        <div className={styles.examBody}>
          {!isCompactView && isNavVisible && renderNavigator()}
          <div className={styles.questionArea}>
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
              question={questionsWithAdjustedPartNames[currentIndex]}
              currentIndex={currentIndex}
              totalCount={totalCount}
              answers={answers}
              onAnswer={onAnswer}
              goToQuestionByIndex={goToQuestionByIndex}
              handleSubmit={() => handleSubmit(false)}
              isSubmitting={isSubmitting}
              globalAudioUrl={rawTestData.globalAudioUrl}
              testType={rawTestData.testType || "Simulator"}
              testResultId={rawTestData.testResultId}
        // Truyền thêm subQuestionId để report câu group
        subQuestionId={(() => {
          const q = questionsWithAdjustedPartNames[currentIndex];
          if (!q) return null;
          const subIndex =
            q.subQuestionIndex !== undefined && q.subQuestionIndex !== null
              ? q.subQuestionIndex
              : 0;
          if (subIndex === 0) return null; // câu đơn
          const key = `${q.testQuestionId}_${subIndex}`;
          return subQuestionIdMap[key] ?? q.questionId ?? null;
        })()}
        isReported={(() => {
          const q = questionsWithAdjustedPartNames[currentIndex];
          if (!q) return false;
          // Xác định nhóm câu: kiểm tra type === "group" hoặc có subQuestionIndex (không quan tâm giá trị)
          const isGroup = q.type === "group" || 
                         (q.subQuestionIndex !== undefined && q.subQuestionIndex !== null);
          
          // Lấy subQuestionId (questionId) để check
          // Với nhóm câu: lấy từ map hoặc questionId
          // Với câu đơn: lấy questionId trực tiếp
          let subId = null;
          if (isGroup) {
            // câu group: lấy subQuestionId từ map hoặc questionId
            const subIndex = q.subQuestionIndex !== undefined && q.subQuestionIndex !== null
              ? q.subQuestionIndex
              : 0;
            const key = `${q.testQuestionId}_${subIndex}`;
            subId = subQuestionIdMap[key] ?? q.questionId ?? null;
          } else {
            // câu đơn: lấy questionId trực tiếp
            subId = q.questionId ?? null;
          }
          
          return isQuestionReported(q.testQuestionId, subId, isGroup);
        })()}
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
            <WarningOutlined style={{ fontSize: 20, color: "#faad14" }} />
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
                  <WarningOutlined style={{ marginRight: 4 }} /> Lưu ý: Các câu trả lời sau thời điểm mất mạng sẽ không được lưu tự động. Vui lòng kết nối lại mạng để đảm bảo tiến độ được lưu đầy đủ.
                </Text>
              </>
            )}
          </Text>
        </div>
      </Modal>
    </Layout>
  );
}