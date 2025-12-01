import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Card, Button, Typography, Tag, message, Spin, Alert, Tooltip } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
  SoundOutlined,
  ReadOutlined,
  CheckCircleTwoTone,
  EditOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
  LoadingOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { getTestResultDetail, startTest } from "@services/testExamService";
import { translateErrorMessage } from "@shared/utils/translateError";
import {
  reportQuestion as reportQuestionAPI,
  getMyQuestionReports,
} from "@services/questionReportService";
import styles from "@shared/styles/Result.module.css";
import { ResultSidebar } from "./TestResult/ResultSidebar";
import { ScoreDisplaySection } from "./TestResult/ScoreDisplaySection";
import { LRQuestionsSection } from "./TestResult/LRQuestionsSection";
import { SWAnswersSection } from "./TestResult/SWAnswersSection";
import { QuestionDetailModal } from "./TestResult/modals/QuestionDetailModal";
import { ReportQuestionModal } from "./TestResult/modals/ReportQuestionModal";
import { SwDetailModal } from "./TestResult/modals/SwDetailModal";
import { RetakeConfirmModal } from "./TestResult/modals/RetakeConfirmModal";
import {
  EMPTY_LR_MESSAGE,
  SCORE_META,
  SW_PART_TYPE_MAP,
  SW_PART_ORDER,
  normalizeTestType,
  normalizeTestSkill,
  normalizeNumber,
  getSwPartDisplayName,
  formatQuestionText,
  resolveSwPartType,
  inferSkillGroup,
  buildQuestions,
} from "./TestResult/utils.jsx";

const { Title, Text } = Typography;

export default function ResultScreen() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { testResultId: stateTestResultId, testMeta: stateTestMeta, autoSubmit } = state || {};


  const [result, setResult] = useState(null);
  const [selectedSection, setSelectedSection] = useState("overall");
  const [displayScore, setDisplayScore] = useState(0);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportQuestion, setReportQuestion] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailQuestions, setDetailQuestions] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [testId, setTestId] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [questionDetailModalVisible, setQuestionDetailModalVisible] = useState(false);
  const [selectedQuestionDetail, setSelectedQuestionDetail] = useState(null);
  const [swDetailModalVisible, setSwDetailModalVisible] = useState(false);
  const [selectedSwFeedback, setSelectedSwFeedback] = useState(null);
  const [retakeModalVisible, setRetakeModalVisible] = useState(false);
  const [retakeConfirmLoading, setRetakeConfirmLoading] = useState(false);
  const [retakeTestInfo, setRetakeTestInfo] = useState(null);
  const [reports, setReports] = useState([]); // Danh sách reports của test result
  const [reportedQuestionIds, setReportedQuestionIds] = useState(new Set()); // Set các testQuestionId đã report
  const [reportType, setReportType] = useState("IncorrectAnswer");
  const [reportDescription, setReportDescription] = useState("");
  const [reporting, setReporting] = useState(false);
  const [testMeta, setTestMeta] = useState(stateTestMeta || null);
  const [lrPagination, setLrPagination] = useState({ current: 1, pageSize: 10 });
  const [modalPagination, setModalPagination] = useState({ current: 1, size: 10 });

  const questionOrderMap = useMemo(() => {
    const map = {};
    try {
      const saved = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
      (saved.questions || []).forEach((q) => {
        if (q && q.testQuestionId !== undefined && q.testQuestionId !== null) {
          const order =
            q.globalIndex ??
            q.index ??
            q.questionOrder ??
            q.displayOrder ??
            null;
          if (order !== null) {
            const baseKey = String(q.testQuestionId);
            if (
              q.subQuestionIndex !== undefined &&
              q.subQuestionIndex !== null &&
              q.subQuestionIndex !== 0
            ) {
              map[`${baseKey}_${q.subQuestionIndex}`] = order;
            } else {
              map[baseKey] = order;
            }
          }
        }
      });
    } catch (e) {
      console.error("Error building question order map:", e);
    }
    return map;
  }, [stateTestResultId]);

  const getSavedTestData = useCallback(() => {
    try {
      return JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
    } catch (e) {
      console.error("Error reading test data from sessionStorage:", e);
      return {};
    }
  }, []);


  const resolveBackPath = useCallback(() => {
    const savedTestData = getSavedTestData();
    const normalizedType = normalizeTestType(
      result?.testType || testMeta?.testType || savedTestData?.testType
    );
    if (normalizedType === "Practice") {
      const skillGroup = inferSkillGroup(
        result?.testSkill ?? testMeta?.testSkill ?? savedTestData?.testSkill
      );
      if (skillGroup === "sw") return "/practice-sw";
      if (skillGroup === "lr") return "/practice-lr";
    }
    return "/test-list";
  }, [getSavedTestData, result, testMeta]);

  // Chặn quay lại màn thi: nếu người dùng nhấn back, ép chuyển tới màn an toàn
  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault?.();
      const savedTestData = getSavedTestData();
      const normalizedType = normalizeTestType(
        result?.testType || testMeta?.testType || savedTestData?.testType
      );
      let safePath = "/test-list";
      if (normalizedType === "Practice") {
        const skillGroup = inferSkillGroup(
          result?.testSkill ?? testMeta?.testSkill ?? savedTestData?.testSkill
        );
        if (skillGroup === "sw") safePath = "/practice-sw";
        if (skillGroup === "lr") safePath = "/practice-lr";
      }
      navigate(safePath, { replace: true });
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, getSavedTestData, result, testMeta]);

  // Hàm xử lý quay lại - quay về trang chủ hoặc test-list
  const handleGoBack = () => {
    const path = resolveBackPath() || "/test-list";

    const navigationEntries = window.performance?.getEntriesByType("navigation");
    const hasReloaded =
      Array.isArray(navigationEntries) &&
      navigationEntries.length > 0 &&
      navigationEntries[navigationEntries.length - 1].type === "reload";

    if (hasReloaded) {
      window.location.replace(path);
      return;
    }

    navigate(path, { replace: true });
  };

  // Hàm xử lý làm lại bài thi - hiển thị modal confirm
  const handleRetakeTest = () => {
    // Ưu tiên lấy từ result (API ResultDetail) trước
    const currentTestId = result?.testId;
    const currentIsSelectTime = result?.isSelectTime;

    if (!currentTestId) {
      message.warning("Không tìm thấy thông tin bài test. Vui lòng chọn lại từ danh sách.");
      navigate(resolveBackPath());
      return;
    }

    // Lấy thông tin test từ result (API ResultDetail)
    const testInfo = {
      testId: currentTestId,
      title: result?.testTitle || result?.title,
      testType: result?.testType,
      testSkill: result?.testSkill,
      duration: result?.duration,
      questionQuantity: result?.questionQuantity,
      isSelectTime: currentIsSelectTime,
    };

    setRetakeTestInfo(testInfo);

    // Sử dụng chế độ đã chọn từ lần thi trước
    setRetakeModalVisible(true);
  };

  // Hàm xử lý confirm làm lại bài thi - gọi API startTest để tạo bài thi mới
  const handleRetakeConfirm = async () => {
    if (retakeConfirmLoading) return;

    // Lấy testId từ retakeTestInfo hoặc result hoặc state testId
    let currentTestId =
      retakeTestInfo?.testId || result?.testId || testMeta?.testId || testId;
    
    // Nếu vẫn không có, thử lấy từ sessionStorage
    if (!currentTestId) {
      const savedTestData = getSavedTestData();
      if (savedTestData.testId) {
        currentTestId = savedTestData.testId;
      }
    }

    if (!currentTestId) {
      message.error("Không tìm thấy testId. Vui lòng thử lại.");
      return;
    }

    const testIdNum = Number(currentTestId);
    if (Number.isNaN(testIdNum)) {
      message.error("TestId không hợp lệ.");
      return;
    }

    const isSimulator =
      normalizeTestType(retakeTestInfo?.testType || result?.testType || testMeta?.testType) ===
      "Simulator";
    // Khi làm lại, luôn sử dụng chế độ từ lần thi trước (không cho phép thay đổi)
    const finalSelectTime = isSimulator ? true : !!retakeTestInfo?.isSelectTime;

    setRetakeConfirmLoading(true);
    try {
      // Gọi API startTest để tạo bài thi MỚI với cùng testId
      const data = await startTest(testIdNum, finalSelectTime);
      if (!data) {
        message.error("Không thể bắt đầu bài thi. Vui lòng thử lại.");
        return;
      }

      // Kiểm tra xem có parts không
      if (!data.parts || !Array.isArray(data.parts) || data.parts.length === 0) {
        message.error("Không có câu hỏi trong bài thi. Vui lòng thử lại.");
        console.error("API response không có parts:", data);
        return;
      }

      // Build questions từ response với đầy đủ thông tin
      const questions = buildQuestions(data.parts);
      
      // Kiểm tra xem có questions không
      if (!questions || questions.length === 0) {
        message.error("Không thể tạo danh sách câu hỏi. Vui lòng thử lại.");
        console.error("Không build được questions từ parts:", data.parts);
        return;
      }
      
      // Tạo payload cho bài thi mới
      const payload = {
        ...data,
        testId: testIdNum, // ID của bài test (giữ nguyên)
        testResultId: data.testResultId, // ID của bài thi mới (từ API trả về)
        testType: normalizeTestType(data.testType || retakeTestInfo?.testType || result?.testType),
        testSkill: data.testSkill || retakeTestInfo?.testSkill || result?.testSkill,
        duration: data.duration ?? retakeTestInfo?.duration ?? result?.duration ?? 0,
        questionQuantity: data.quantityQuestion ?? data.questionQuantity ?? retakeTestInfo?.questionQuantity ?? result?.questionQuantity ?? 0,
        questions,
        isSelectTime: finalSelectTime,
        timerMode: finalSelectTime ? "countdown" : "countup",
        startedAt: Date.now(),
        globalAudioUrl: data.audioUrl || null,
      };

      // Lưu vào sessionStorage và navigate đến màn hình làm bài
      sessionStorage.setItem("toeic_testData", JSON.stringify(payload));
      setRetakeModalVisible(false);
      navigate("/exam");
    } catch (error) {
      console.error("Error starting test:", error);
      message.error(translateErrorMessage(error.response?.data?.message) || "Không thể bắt đầu bài thi. Vui lòng thử lại.");
    } finally {
      setRetakeConfirmLoading(false);
    }
  };

  // Hàm hủy modal làm lại bài thi
  const handleRetakeCancel = () => {
    setRetakeModalVisible(false);
    setRetakeTestInfo(null);
  };

  // === LOAD DETAIL TỪ API ===
  const loadDetailFromAPI = useCallback(
    async (targetTestResultId, meta) => {
      if (!targetTestResultId) {
        return;
      }

      if (detailData && detailData.testResultId === targetTestResultId) {
        return;
      }

      setLoadingDetail(true);
      try {
        const data = await getTestResultDetail(targetTestResultId);
        const mergedResult = {
          ...data,
          testId: data.testId || meta?.testId,
          testType: data.testType || meta?.testType,
          testSkill: data.testSkill || meta?.testSkill,
          duration: data.duration ?? meta?.duration,
          questionQuantity:
            data.quantityQuestion ?? data.questionQuantity ?? meta?.questionQuantity,
          isSelectTime: data.isSelectTime ?? meta?.isSelectTime,
          title: data.title || data.testTitle || meta?.title,
        };

        setResult(mergedResult);
        setDetailData(data);
        setTestId(mergedResult.testId || null);
        setApiError(null); // Clear any previous errors

        const nextMeta = {
          testResultId: targetTestResultId,
          testId: mergedResult.testId,
          testType: mergedResult.testType,
          testSkill: mergedResult.testSkill,
          duration: mergedResult.duration,
          questionQuantity: mergedResult.questionQuantity,
          isSelectTime: mergedResult.isSelectTime,
          title: mergedResult.title || mergedResult.testTitle,
        };
        setTestMeta(nextMeta);
        sessionStorage.setItem("toeic_resultMeta", JSON.stringify(nextMeta));
      } catch (error) {
        console.error("Error loading detail:", error);
        
        // Set API error instead of showing message.error
        setApiError({
          type: 'api_failed',
          message: error.response?.data?.message || error.message,
          statusCode: error.response?.status,
          details: error.response?.data
        });
        
        // Don't show message.error to avoid batch notifications
        // message.error(
        //   "Không thể tải chi tiết câu hỏi: " +
        //     translateErrorMessage(error.response?.data?.message || error.message)
        // );
      } finally {
        setLoadingDetail(false);
      }
    },
    [detailData]
  );

  // === XỬ LÝ DỮ LIỆU TỪ SUBMIT ===
  useEffect(() => {
    if (autoSubmit) {
      message.info("Hết thời gian! Bài thi đã được nộp tự động.");
    }

    let meta = stateTestMeta || null;
    if (!meta) {
      try {
        meta = JSON.parse(sessionStorage.getItem("toeic_resultMeta") || "null");
      } catch (e) {
        meta = null;
      }
    }

    let targetTestResultId = stateTestResultId || meta?.testResultId || null;

    if (!targetTestResultId) {
      message.error("Không có dữ liệu kết quả.");
      navigate(resolveBackPath());
      return;
    }

    if (meta) {
      setTestMeta(meta);
      if (meta.testId) {
        setTestId(meta.testId);
      }
      try {
        sessionStorage.setItem("toeic_resultMeta", JSON.stringify(meta));
      } catch (e) {
        console.error("Error saving result meta to sessionStorage:", e);
      }
    }

    loadDetailFromAPI(targetTestResultId, meta).finally(() => {
      setIsLoading(false);
    });
  }, [
    autoSubmit,
    stateTestResultId,
    stateTestMeta,
    navigate,
    loadDetailFromAPI,
    resolveBackPath,
  ]);


  // Kiểm tra xem câu hỏi đã được report chưa
  const isQuestionReported = (testQuestionId) => {
    return reportedQuestionIds.has(testQuestionId);
  };

  // Callback khi report thành công
  const handleReportSuccess = (testQuestionId) => {
    setReportedQuestionIds(prev => new Set([...prev, testQuestionId]));
    // Cập nhật reports array
    setReports(prev => [...prev, { testQuestionId, status: "Pending" }]);
  };

  const handleSwReportRequest = (payload) => {
    if (!payload) return;
    setReportQuestion(payload);
    setReportModalVisible(true);
  };

  const resetReportState = () => {
    setReportModalVisible(false);
    setReportQuestion(null);
    setReportDescription("");
    setReportType("IncorrectAnswer");
  };

  const handleReportSubmit = async () => {
    if (!reportDescription.trim()) {
      message.warning("Vui lòng nhập mô tả chi tiết");
      return;
    }
    if (!reportQuestion?.testQuestionId) {
      message.error("Không tìm thấy thông tin câu hỏi");
      return;
    }
    try {
      setReporting(true);
      const reportedTestQuestionId = reportQuestion.testQuestionId;
      await reportQuestionAPI(reportQuestion.testQuestionId, reportType, reportDescription);
      message.success("Đã gửi báo cáo thành công");
      handleReportSuccess(reportedTestQuestionId);
      resetReportState();

      if (result?.testResultId) {
        setTimeout(async () => {
          await loadReports(result.testResultId, swFeedbacks);
        }, 500);
      }
    } catch (error) {
      console.error("Error reporting question:", error);
      const errorMsg =
        translateErrorMessage(error?.response?.data?.message || error?.message) ||
        "Không thể gửi báo cáo";
      if (
        errorMsg.includes("already reported") ||
        errorMsg.includes("đã báo cáo") ||
        errorMsg.includes("Bạn đã báo cáo")
      ) {
        message.warning("Câu hỏi này đã được báo cáo rồi");
        if (reportQuestion?.testQuestionId) {
          handleReportSuccess(reportQuestion.testQuestionId);
          if (result?.testResultId) {
            await loadReports(result.testResultId, swFeedbacks);
          }
        }
        resetReportState();
      } else {
        message.error(errorMsg);
      }
    } finally {
      setReporting(false);
    }
  };

  // === XỬ LÝ CÂU HỎI TỪ API DETAIL ===
  const processQuestionsFromDetail = (detailData) => {
    if (!detailData?.parts) return { listening: [], reading: [], all: [] };

    const rows = { listening: [], reading: [], all: [] };
    let globalIndex = 1;

    // Sắp xếp parts theo partId để đảm bảo thứ tự giống màn thi
    const sortedParts = [...(detailData.parts || [])].sort((a, b) => (a.partId || 0) - (b.partId || 0));

    sortedParts.forEach((part) => {
      part.testQuestions?.forEach((tq) => {
        const partTitle = part.partName || `Part ${part.partId}`;

        // Xử lý single question
        if (!tq.isGroup && tq.questionSnapshotDto) {
          const qs = tq.questionSnapshotDto;
          const userAnswer = qs.userAnswer || "";
          const options = qs.options || [];
          const correctOption = options.find((o) => o.isCorrect);
          const selectedOption = options.find((o) => o.label === userAnswer);
          const currentGlobalIndex = globalIndex++; // Tăng globalIndex cho TẤT CẢ câu hỏi
          
          const correctAnswer = correctOption?.label || "";
          const hasAnswer =
            userAnswer !== null && userAnswer !== undefined && String(userAnswer).trim() !== "";
          const isCorrect =
            hasAnswer && qs.isCorrect !== null ? qs.isCorrect : hasAnswer && userAnswer === correctAnswer;

          if (!hasAnswer) {
            return;
          }

          const orderKey = String(tq.testQuestionId);
          const mappedOrder = questionOrderMap[orderKey];
          const row = {
            key: tq.testQuestionId,
            testQuestionId: tq.testQuestionId, // Thêm testQuestionId để dùng cho report
            index: mappedOrder ?? currentGlobalIndex, // Dùng globalIndex đã tính cho TẤT CẢ câu hỏi
            partId: qs.partId || part.partId,
            partTitle,
            question: qs.content || "",
            passage: null,
            userAnswer: hasAnswer ? userAnswer : "",
            correctAnswer,
            isCorrect: hasAnswer ? isCorrect : null,
            imageUrl: qs.imageUrl,
            explanation: qs.explanation,
            options,
            userAnswerText: hasAnswer ? selectedOption?.content || "" : "",
            correctAnswerText: correctOption?.content || "",
          };

          rows.all.push(row);
          if (row.partId >= 1 && row.partId <= 4) rows.listening.push(row);
          if (row.partId >= 5 && row.partId <= 7) rows.reading.push(row);
        }

        // Xử lý group question
        if (tq.isGroup && tq.questionGroupSnapshotDto) {
          const group = tq.questionGroupSnapshotDto;
          group.questionSnapshots?.forEach((qs, idx) => {
            const userAnswer = qs.userAnswer || "";
            const options = qs.options || [];
            const correctOption = options.find((o) => o.isCorrect);
            const selectedOption = options.find((o) => o.label === userAnswer);
            const currentGlobalIndex = globalIndex++; // Tăng globalIndex cho TẤT CẢ câu hỏi
            
            const correctAnswer = correctOption?.label || "";
            const hasAnswer =
              userAnswer !== null && userAnswer !== undefined && String(userAnswer).trim() !== "";
            const isCorrect =
              hasAnswer && qs.isCorrect !== null ? qs.isCorrect : hasAnswer && userAnswer === correctAnswer;

            if (!hasAnswer) {
              return;
            }

            const subKey = `${tq.testQuestionId}_${idx}`;
            const mappedOrder =
              questionOrderMap[subKey] ?? questionOrderMap[String(tq.testQuestionId)];
            const row = {
              key: `${tq.testQuestionId}_${idx}`,
              testQuestionId: tq.testQuestionId, // Thêm testQuestionId để dùng cho report
              subQuestionIndex: idx, // Lưu subQuestionIndex cho group questions
              index: mappedOrder ?? currentGlobalIndex, // Dùng globalIndex đã tính cho TẤT CẢ câu hỏi
              partId: qs.partId || part.partId,
              partTitle,
              question: qs.content || "",
              passage: group.passage || null,
              userAnswer: hasAnswer ? userAnswer : "",
              correctAnswer,
              isCorrect: hasAnswer ? isCorrect : null,
              imageUrl: qs.imageUrl || group.imageUrl,
              explanation: qs.explanation,
              options,
              userAnswerText: hasAnswer ? selectedOption?.content || "" : "",
              correctAnswerText: correctOption?.content || "",
            };

            rows.all.push(row);
            if (row.partId >= 1 && row.partId <= 4) rows.listening.push(row);
            if (row.partId >= 5 && row.partId <= 7) rows.reading.push(row);
          });
        }
      });
    });

    const sortByIndex = (arr) =>
      arr.sort((a, b) => {
        const indexA = a.index ?? 0;
        const indexB = b.index ?? 0;
        return indexA - indexB;
      });
    sortByIndex(rows.all);
    sortByIndex(rows.listening);
    sortByIndex(rows.reading);

    return rows;
  };

  // === XỬ LÝ CÂU HỎI ===
  const questionRowsBySection = useMemo(() => {
    // CHỈ sử dụng dữ liệu từ API detail, không lấy từ state
    if (detailData) {
      return processQuestionsFromDetail(detailData);
    }

    // Nếu chưa có detailData, trả về empty để đợi load từ API
    return { listening: [], reading: [], all: [] };
  }, [detailData]);

  // Load danh sách reports - định nghĩa sau questionRowsBySection
  const loadReports = useCallback(async (testResultId, swData = { writing: [], speaking: [] }) => {
    try {
      // Lấy tất cả reports của user (bao gồm cả reports từ màn làm bài)
      const allReportsResponse = await getMyQuestionReports(1, 1000);
      const allReports = Array.isArray(allReportsResponse?.data) 
        ? allReportsResponse.data 
        : (Array.isArray(allReportsResponse) ? allReportsResponse : []);
      
      // Lấy danh sách testQuestionId từ test result hiện tại
      const currentTestQuestionIds = new Set();
      if (questionRowsBySection && typeof questionRowsBySection === 'object') {
        const allRows = [
          ...(questionRowsBySection.listening || []),
          ...(questionRowsBySection.reading || []),
          ...(questionRowsBySection.all || []),
        ];
        allRows.forEach(row => {
          if (row && row.testQuestionId) {
            currentTestQuestionIds.add(row.testQuestionId);
          }
        });
      }

      (swData.writing || []).forEach(item => {
        if (item?.testQuestionId) currentTestQuestionIds.add(item.testQuestionId);
      });
      (swData.speaking || []).forEach(item => {
        if (item?.testQuestionId) currentTestQuestionIds.add(item.testQuestionId);
      });
      
      // Filter chỉ lấy reports của các câu hỏi trong test result hiện tại
      const relevantReports = allReports.filter(report => 
        report.testQuestionId && currentTestQuestionIds.has(report.testQuestionId)
      );
      
      setReports(relevantReports);
      
      // Tạo Set các testQuestionId đã report để check nhanh hơn
      // Merge với state hiện tại để không mất dữ liệu đã cập nhật
      setReportedQuestionIds(prev => {
        const newSet = new Set(prev); // Giữ lại các ID đã có
        relevantReports.forEach(report => {
          if (report.testQuestionId) {
            newSet.add(report.testQuestionId);
          }
        });
        return newSet;
      });
    } catch (error) {
      console.error("Error loading reports:", error);
      // Không hiển thị error vì đây là tính năng phụ
    }
  }, [questionRowsBySection]);

  // === LẤY ĐIỂM READING TỪ API - KHÔNG TỰ TÍNH ===
  const getReadingScore = useMemo(() => {
    if (!result) return 0;
    // Chỉ lấy từ API, không tự tính
    return result.readingScore || 0;
  }, [result]);

  // === XỬ LÝ DỮ LIỆU WRITING/SPEAKING TỪ PERPARTFEEDBACKS ===
  const swFeedbacks = useMemo(() => {
    if (!result?.perPartFeedbacks || !Array.isArray(result.perPartFeedbacks)) {
      return { writing: [], speaking: [] };
    }

    const sortedFeedbacks = [...result.perPartFeedbacks].sort((a, b) => {
      const typeA = resolveSwPartType(a);
      const typeB = resolveSwPartType(b);
      const questionOrderA = questionOrderMap[a.testQuestionId];
      const questionOrderB = questionOrderMap[b.testQuestionId];

      if (questionOrderA !== undefined && questionOrderB !== undefined) {
        if (questionOrderA !== questionOrderB) {
          return questionOrderA - questionOrderB;
        }
      }

      const orderA = SW_PART_ORDER[typeA] ?? a.partId ?? 100;
      const orderB = SW_PART_ORDER[typeB] ?? b.partId ?? 100;
      if (orderA !== orderB) return orderA - orderB;
      return (a.testQuestionId || 0) - (b.testQuestionId || 0);
    });

    const writing = [];
    const speaking = [];
    let writingIndex = 1;
    let speakingIndex = 1;
    let rowKeyCounter = 1;

    sortedFeedbacks.forEach((feedback) => {
      const partType = resolveSwPartType(feedback);
      const scorer = (feedback.aiScorer || "").toLowerCase();
      const isWriting = scorer === "writing" || partType.startsWith("writing");
      const isSpeaking = scorer === "speaking" || partType.startsWith("speaking");

      if (!isWriting && !isSpeaking) {
        return;
      }

      const mappedIndex = questionOrderMap[feedback.testQuestionId];
      const baseRow = {
        key: feedback.testQuestionId || rowKeyCounter++,
        testQuestionId: feedback.testQuestionId,
        partType,
        partName: feedback.partName || "",
        questionContent: feedback.questionContent?.content || "",
        answerText: feedback.answerText || "",
        answerAudioUrl: feedback.answerAudioUrl || "",
        score: feedback.score || 0,
        overallScore: feedback.detailedScores?.overall || 0,
        content: feedback.content || "",
        feedback,
        aiScorer: feedback.aiScorer,
        detailedScores: feedback.detailedScores || {},
        detailedAnalysis: feedback.detailedAnalysis || {},
        recommendations: feedback.recommendations || [],
        questionContentFull: feedback.questionContent || null,
      };

      const hasAnswer =
        (baseRow.answerText && baseRow.answerText.trim().length > 0) ||
        !!baseRow.answerAudioUrl;
      if (!hasAnswer) {
        return;
      }

      if (isWriting) {
        const indexValue = mappedIndex ?? writingIndex++;
        writing.push({ ...baseRow, index: indexValue });
      } else if (isSpeaking) {
        const indexValue = mappedIndex ?? speakingIndex++;
        speaking.push({ ...baseRow, index: indexValue });
      }
    });

    return { writing, speaking };
  }, [result, questionOrderMap]);

  const swSummary = useMemo(() => {
    const buildSummary = (items = []) => {
      if (!items.length) return null;
      const total = items.length;
      const scored = items
        .map((item) => {
          if (item.overallScore != null) return item.overallScore;
          if (item.score != null) return item.score;
          return null;
        })
        .filter((score) => typeof score === "number");
      const scoredCount = scored.length;
      const avgScore =
        scoredCount > 0
          ? Number((scored.reduce((sum, val) => sum + val, 0) / scoredCount).toFixed(1))
          : null;
      const maxScore = scoredCount > 0 ? Math.max(...scored) : null;
      const minScore = scoredCount > 0 ? Math.min(...scored) : null;
      return {
        total,
        scoredCount,
        avgScore,
        maxScore,
        minScore,
      };
    };

    return {
      writing: buildSummary(swFeedbacks.writing),
      speaking: buildSummary(swFeedbacks.speaking),
    };
  }, [swFeedbacks]);

  // Reload reports khi questionRowsBySection hoặc SW feedbacks thay đổi (đã có dữ liệu)
  useEffect(() => {
    if (!result?.testResultId) return;

    const hasLRData =
      questionRowsBySection.all.length > 0 ||
      questionRowsBySection.listening.length > 0 ||
      questionRowsBySection.reading.length > 0;
    const hasSWData =
      swFeedbacks.writing.length > 0 || swFeedbacks.speaking.length > 0;

    if (hasLRData || hasSWData) {
      loadReports(result.testResultId, swFeedbacks);
    }
  }, [questionRowsBySection, swFeedbacks, result?.testResultId, loadReports, result]);

  const listeningReadingPresence = useMemo(() => {
    const presence = { listening: false, reading: false };

    (detailData?.parts || []).forEach((part) => {
      const partId = part.partId;
      const length = part.testQuestions?.length || 0;
      if (!length) return;
      if (partId >= 1 && partId <= 4) {
        presence.listening = true;
      } else if (partId >= 5 && partId <= 7) {
        presence.reading = true;
      }
    });

    return presence;
  }, [detailData]);

  const normalizedTestType = useMemo(
    () =>
      normalizeTestType(
        result?.testType || testMeta?.testType || getSavedTestData()?.testType
      ),
    [result?.testType, testMeta?.testType, getSavedTestData]
  );

  const skillGroup = useMemo(
    () =>
      inferSkillGroup(
        result?.testSkill ?? testMeta?.testSkill ?? getSavedTestData()?.testSkill
      ),
    [result?.testSkill, testMeta?.testSkill, getSavedTestData]
  );

  const isPracticeLrMode = useMemo(
    () => normalizedTestType === "Practice" && skillGroup === "lr",
    [normalizedTestType, skillGroup]
  );

  const scoreConfigs = useMemo(
    () =>
      SCORE_META.map((meta) => ({
        ...meta,
        score: result ? result[meta.resultKey] : undefined,
      })),
    [result]
  );

  const lrQuestionTotals = useMemo(() => {
    const totals = { listening: 0, reading: 0, all: 0 };
    if (!detailData?.parts) return totals;

    (detailData.parts || []).forEach((part) => {
      const partId = part.partId;
      const isListening = partId >= 1 && partId <= 4;
      const isReading = partId >= 5 && partId <= 7;
      if (!isListening && !isReading) return;

      part.testQuestions?.forEach((tq) => {
        let count = 0;
        if (tq.isGroup && tq.questionGroupSnapshotDto) {
          count = tq.questionGroupSnapshotDto.questionSnapshots?.length || 0;
        } else if (!tq.isGroup && tq.questionSnapshotDto) {
          count = 1;
        }
        if (isListening) totals.listening += count;
        if (isReading) totals.reading += count;
        totals.all += count;
      });
    });

    return totals;
  }, [detailData]);

  const practiceLrStats = useMemo(() => {
    const listeningRows = questionRowsBySection.listening || [];
    const readingRows = questionRowsBySection.reading || [];

    const calcAnswered = (rows) => {
      const answered = rows.length;
      const correct = rows.filter((r) => r.isCorrect === true).length;
      const wrong = rows.filter((r) => r.isCorrect === false).length;
      return { answered, correct, wrong };
    };

    const listeningAnswered = calcAnswered(listeningRows);
    const readingAnswered = calcAnswered(readingRows);

    const totalQuestions = lrQuestionTotals.all;
    const totalAnswered = listeningAnswered.answered + readingAnswered.answered;
    const correct = listeningAnswered.correct + readingAnswered.correct;
    const wrong = listeningAnswered.wrong + readingAnswered.wrong;
    const unanswered = Math.max(0, totalQuestions - totalAnswered);

    const accuracy =
      totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

    const listening = {
      total: lrQuestionTotals.listening,
      answered: listeningAnswered.answered,
      correct: listeningAnswered.correct,
      wrong: listeningAnswered.wrong,
      unanswered: Math.max(0, lrQuestionTotals.listening - listeningAnswered.answered),
    };

    const reading = {
      total: lrQuestionTotals.reading,
      answered: readingAnswered.answered,
      correct: readingAnswered.correct,
      wrong: readingAnswered.wrong,
      unanswered: Math.max(0, lrQuestionTotals.reading - readingAnswered.answered),
    };

    return {
      totalQuestions,
      totalAnswered,
      correct,
      wrong,
      unanswered,
      accuracy,
      listening,
      reading,
    };
  }, [questionRowsBySection, lrQuestionTotals]);

  const skillPresenceMap = useMemo(
    () => ({
      listening: listeningReadingPresence.listening,
      reading: listeningReadingPresence.reading,
      writing: swFeedbacks.writing.length > 0,
      speaking: swFeedbacks.speaking.length > 0,
    }),
    [listeningReadingPresence, swFeedbacks]
  );

  const availableScoreConfigs = useMemo(
    () =>
      scoreConfigs.filter((cfg) => {
        const hasScore = cfg.score !== undefined && cfg.score !== null;
        if (!hasScore) return false;
        const presence = skillPresenceMap[cfg.key];
        if (presence === undefined) return true;
        return presence;
      }),
    [scoreConfigs, skillPresenceMap]
  );

  // === LẤY ĐIỂM TỔNG TỪ API ===
  const getTotalScore = useMemo(() => {
    if (!result) return 0;

    if (result.totalScore !== undefined && result.totalScore !== null) {
      return result.totalScore;
    }

    return availableScoreConfigs.reduce((sum, cfg) => sum + (Number(cfg.score) || 0), 0);
  }, [result, availableScoreConfigs]);

  // === TÍNH MAX ĐIỂM DỰA TRÊN CÁC PHẦN CÓ TRONG BÀI TEST ===
  const getMaxScore = useMemo(() => {
    if (availableScoreConfigs.length === 0) {
      return 990;
    }
    return availableScoreConfigs.reduce((sum, cfg) => sum + cfg.max, 0);
  }, [availableScoreConfigs]);

  const selectedScoreConfig = useMemo(
    () => availableScoreConfigs.find((cfg) => cfg.key === selectedSection),
    [availableScoreConfigs, selectedSection]
  );

  // === ANIMATION ĐIỂM SỐ ===
  useEffect(() => {
    if (!result) return;

    let target = 0;
    if (selectedSection === "overall") {
      target = getTotalScore;
    } else if (selectedSection === "reading") {
      target = getReadingScore;
    } else {
      target = selectedScoreConfig?.score || 0;
    }

    let curr = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const id = setInterval(() => {
      curr += step;
      if (curr >= target) {
        setDisplayScore(target);
        clearInterval(id);
      } else {
        setDisplayScore(curr);
      }
    }, 20);
    return () => clearInterval(id);
  }, [selectedSection, result, getReadingScore, getTotalScore, selectedScoreConfig]);

  // === KIỂM TRA CÓ TRẢ LỜI KHÔNG ===
  // Kiểm tra cả L&R (detailData) và S&W (perPartFeedbacks)
  const hasAnswered = useMemo(() => {
    const hasLRAnswers = questionRowsBySection.all.length > 0;
    const hasSWAnswers = swFeedbacks.writing.length > 0 || swFeedbacks.speaking.length > 0;
    return hasLRAnswers || hasSWAnswers;
  }, [questionRowsBySection, swFeedbacks]);

  const displayedTotalScore = result?.totalScore ?? getTotalScore;
  const savedTestData = getSavedTestData();
  const resolveTimeSpent = (source) => {
    if (!source) return undefined;
    if (source.timeResuilt !== undefined && source.timeResuilt !== null) {
      return Number(source.timeResuilt);
    }
    if (source.timeResult !== undefined && source.timeResult !== null) {
      return Number(source.timeResult);
    }
    return undefined;
  };
  // Thời lượng đề (phút) – luôn lấy đúng từ duration của đề
  const displayedDuration =
    result?.duration ??
    testMeta?.duration ??
    savedTestData?.duration ??
    0;
  // Thời gian làm bài – luôn lấy từ timeResuilt (thực tế làm bao nhiêu phút)
  const displayedTimeSpent =
    resolveTimeSpent(result) ??
    resolveTimeSpent(testMeta) ??
    resolveTimeSpent(savedTestData) ??
    displayedDuration;
  // Chế độ thời gian: true = đếm ngược theo thời lượng đề, false = đếm từ 0
  const displayedIsSelectTime =
    result?.isSelectTime ??
    testMeta?.isSelectTime ??
    savedTestData?.isSelectTime ??
    true;

  // === SIDEBAR SECTIONS - CHỈ LẤY TỪ API, KHÔNG TỰ SUY LUẬN ===
  const sections = useMemo(() => {
    if (!result) return [];
    if (isPracticeLrMode) {
      return [
        {
          key: "overall",
          title: "Tiến độ tổng quan",
          description: `${practiceLrStats.correct}/${practiceLrStats.totalQuestions} câu đúng`,
          icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
        },
        {
          key: "listening",
          title: "Nghe",
          description: `${practiceLrStats.listening.correct}/${practiceLrStats.listening.answered} câu đúng`,
          icon: <SoundOutlined />,
        },
        {
          key: "reading",
          title: "Đọc",
          description: `${practiceLrStats.reading.correct}/${practiceLrStats.reading.answered} câu đúng`,
          icon: <ReadOutlined />,
        },
      ];
    }
    return [
      {
        key: "overall",
        title: "Tổng điểm",
        score: getTotalScore,
        max: getMaxScore,
        icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
      },
      ...availableScoreConfigs.map((cfg) => ({
        key: cfg.key,
        title: cfg.label,
        score: cfg.score,
        max: cfg.max,
        icon: cfg.icon,
      })),
    ];
  }, [
    result,
    isPracticeLrMode,
    practiceLrStats,
    availableScoreConfigs,
    getTotalScore,
    getMaxScore,
  ]);

  useEffect(() => {
    setLrPagination((prev) => ({ ...prev, current: 1 }));
  }, [selectedSection]);

  // === TABLE COLUMNS CHO L&R ===
  const columns = [
    {
      title: "Câu hỏi",
      dataIndex: "question",
      render: (text, row) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <Tag color="purple" style={{ fontSize: 13, padding: "3px 10px" }}>
              {row.partTitle || "—"}
            </Tag>
            <Tag color="blue" style={{ fontSize: 13, padding: "3px 10px" }}>
              Câu {row.index}
            </Tag>
          </div>
          {row.passage && (
            <div style={{ fontStyle: "italic", color: "#666", marginBottom: 6 }}>
              {typeof row.passage === "string" ? (
                <div
                  style={{ whiteSpace: "normal", wordBreak: "normal" }}
                  dangerouslySetInnerHTML={{ __html: row.passage }}
                />
              ) : (
                formatQuestionText(row.passage)
              )}
            </div>
          )}
          <div style={{ whiteSpace: "pre-wrap" }}>{formatQuestionText(text)}</div>
        </div>
      ),
    },
    {
      title: "Đáp án của bạn",
      dataIndex: "userAnswer",
      width: 160,
      render: (v, row) => (
        <div>
          <Text style={{ color: row.isCorrect ? "#52c41a" : "#f5222d", fontWeight: "bold" }}>
            {v || "—"}
          </Text>
          {row.userAnswerText && (
            <div style={{ fontSize: 12, color: "#595959" }}>{row.userAnswerText}</div>
          )}
        </div>
      ),
    },
    {
      title: "Đáp án đúng",
      dataIndex: "correctAnswer",
      width: 180,
      render: (_, row) => (
        <div>
          <Text strong>{row.correctAnswer}</Text>
          {row.correctAnswerText && (
            <div style={{ fontSize: 12, color: "#595959" }}>{row.correctAnswerText}</div>
          )}
        </div>
      ),
    },
    {
      title: "Kết quả",
      dataIndex: "isCorrect",
      width: 120,
      render: (val) => (
        <Tag color={val === null ? "default" : val ? "success" : "error"}>
          {val === null ? "Chưa trả lời" : val ? "Đúng" : "Sai"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      width: 160,
      render: (_, row) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            size="small"
            onClick={() => {
              setSelectedQuestionDetail(row);
              setQuestionDetailModalVisible(true);
            }}
          >
            Xem
          </Button>
          {/* Nút Báo cáo - luôn hiển thị, nếu đã báo cáo thì hiển thị trạng thái */}
          {isQuestionReported(row.testQuestionId) ? (
            <Tooltip title="Đã báo cáo câu hỏi này">
              <FlagOutlined style={{ color: "#52c41a", fontSize: "16px", marginTop: "4px" }} />
            </Tooltip>
          ) : (
            <Button
              size="small"
              icon={<FlagOutlined />}
              onClick={() => {
                if (!row.testQuestionId) {
                  message.error("Không tìm thấy thông tin câu hỏi");
                  return;
                }
                // Kiểm tra xem câu hỏi đã được báo cáo chưa
                if (isQuestionReported(row.testQuestionId)) {
                  message.info("Câu hỏi này đã được báo cáo rồi");
                  return;
                }
                const formattedQuestion = formatQuestionText(row.question || row.content || "");
                setReportQuestion({
                  testQuestionId: row.testQuestionId,
                  question: formattedQuestion,
                  content: formattedQuestion,
                });
                setReportModalVisible(true);
              }}
            >
              Báo cáo
            </Button>
          )}
        </div>
      ),
    },
  ];

  // === TABLE COLUMNS CHO WRITING/SPEAKING ===
  const swColumns = [
    { 
      title: "Câu hỏi", 
      dataIndex: "index", 
      width: 100, 
      align: "center",
      render: (index) => `Câu ${index}`
    },
    {
      title: "Loại câu hỏi",
      dataIndex: "partType",
      width: 200,
      render: (text) => {
        const typeMap = {
          writing_sentence: "Viết câu",
          writing_email: "Viết email",
          writing_essay: "Viết luận",
          speaking_read_aloud: "Đọc to",
          speaking_describe_picture: "Mô tả tranh",
          speaking_respond_questions: "Trả lời câu hỏi",
          speaking_respond_questions_info: "Trả lời câu hỏi (thông tin)",
          speaking_express_opinion: "Bày tỏ ý kiến",
        };
        return typeMap[text] || text;
      },
    },
    {
      title: "Điểm tổng",
      dataIndex: "overallScore",
      width: 120,
      align: "center",
      render: (score) => (
        <Text strong style={{ fontSize: 16 }}>
          {score || 0}/100
        </Text>
      ),
    },
    {
      title: "Điểm số",
      dataIndex: "score",
      width: 120,
      align: "center",
      render: (score) => (
        <Text strong style={{ color: "#1890ff" }}>
          {score || 0}
        </Text>
      ),
    },
    {
      title: "Tóm tắt",
      dataIndex: "content",
      render: (text) => (
        <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 300 }}>
          {text || "—"}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      width: 120,
      render: (_, row) => (
        <Button
          size="small"
          type="primary"
          onClick={() => {
            setSelectedSwFeedback(row);
            setSwDetailModalVisible(true);
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const openDetailForSection = async (key) => {
    // Đảm bảo detail đã được load
    if (!detailData && result?.testResultId) {
      await loadDetailFromAPI(result.testResultId);
    }

    const data =
      key === "overall"
        ? questionRowsBySection.all
        : key === "listening"
        ? questionRowsBySection.listening
        : questionRowsBySection.reading;
    setDetailQuestions(data);
    setDetailModalVisible(true);
  };

  // === LOADING ===
  const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
  
  // Show loading only when still loading and no error
  if (isLoading && !apiError) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin indicator={loadingIcon} size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang xử lý kết quả...</Text>
        </div>
      </div>
    );
  }

  // Show API error screen if there's an error
  if (apiError) {
    return (
      <div className={styles.resultPage}>
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={handleGoBack}
                type="text"
                style={{ color: "#fff", padding: 0 }}
              >
                Quay lại
              </Button>
              <Title level={3} style={{ color: "#fff", margin: 0 }}>
                Kết quả bài thi TOEIC
              </Title>
            </div>
          </div>
          <div className={styles.content} style={{ textAlign: "center", padding: 60 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
              <Title level={2} style={{ color: "#ff4d4f", marginBottom: 16 }}>
                Lỗi kết nối API chấm bài
              </Title>
            </div>
            
            <Alert
              type="error"
              showIcon
              message="Không thể kết nối đến hệ thống chấm bài"
              description={
                <div style={{ textAlign: "left" }}>
                  <p style={{ marginBottom: 8 }}>
                    <strong>Chi tiết lỗi:</strong>
                  </p>
                  <div style={{ 
                    backgroundColor: "#fff2f0", 
                    padding: 12, 
                    borderRadius: 4, 
                    marginBottom: 16,
                    fontFamily: "monospace",
                    fontSize: 13
                  }}>
                    {apiError.statusCode && <div>Mã lỗi: {apiError.statusCode}</div>}
                    <div>Thông báo: {translateErrorMessage(apiError.message)}</div>
                  </div>
                  <p style={{ marginBottom: 8 }}>
                    <strong>Nguyên nhân có thể:</strong>
                  </p>
                  <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
                    <li>Hệ thống AI chấm bài đang bảo trì hoặc quá tải</li>
                    <li>Kết quả chưa được xử lý xong (cần thêm thời gian)</li>
                    <li>Lỗi mạng hoặc server tạm thời</li>
                    <li>Bài thi chưa được nộp đúng cách</li>
                  </ul>
                  <p style={{ marginBottom: 0 }}>
                    <strong>Giải pháp:</strong> Vui lòng thử lại sau 5-10 phút hoặc liên hệ hỗ trợ kỹ thuật nếu vấn đề vẫn tiếp diễn.
                  </p>
                </div>
              }
              style={{ 
                marginBottom: 32, 
                textAlign: "left",
                maxWidth: 700,
                margin: "0 auto 32px auto"
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <Button
                type="primary"
                size="large"
                style={{ backgroundColor: "#177ddc", borderColor: "#177ddc" }}
                onClick={() => {
                  setApiError(null);
                  setIsLoading(true);
                  window.location.reload();
                }}
              >
                Thử lại
              </Button>
              <Button
                size="large"
                style={{
                  backgroundColor: "#f0f5ff",
                  borderColor: "#adc6ff",
                  color: "#1d39c4",
                }}
                onClick={handleGoBack}
              >
                Về danh sách bài thi
              </Button>
            </div>
            
            <div style={{ marginTop: 24, padding: 16, backgroundColor: "#f6f6f6", borderRadius: 8 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                💡 <strong>Lưu ý:</strong> Nếu bạn vừa nộp bài, hãy đợi 5-10 phút để hệ thống AI xử lý kết quả. 
                Đối với bài Writing/Speaking, thời gian chấm có thể lâu hơn.
              </Text>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show no data error if no result after loading
  if (!result) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin indicator={loadingIcon} size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Đang xử lý kết quả...</Text>
        </div>
      </div>
    );
  }

  // === KHÔNG TẢI ĐƯỢC TRẢ LỜI (COI NHƯ LỖI HỆ THỐNG) ===
  if (!hasAnswered && !apiError && !isLoading) {
    return (
      <div className={styles.resultPage}>
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={handleGoBack}
                type="text"
                style={{ color: "#fff", padding: 0 }}
              >
                Quay lại
              </Button>
              <Title level={3} style={{ color: "#fff", margin: 0 }}>
                Kết quả bài thi TOEIC
              </Title>
            </div>
          </div>
          <div className={styles.content} style={{ textAlign: "center", padding: 60 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
              <Title level={2} style={{ color: "#ff4d4f", marginBottom: 16 }}>
                Lỗi hệ thống chấm bài
              </Title>
            </div>
            
            <Alert
              type="error"
              showIcon
              message="Không thể tải kết quả bài thi"
              description={
                <div style={{ textAlign: "left" }}>
                  <p style={{ marginBottom: 8 }}>
                    <strong>Nguyên nhân có thể:</strong>
                  </p>
                  <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
                    <li>Hệ thống AI đang gặp sự cố khi chấm bài</li>
                    <li>Dữ liệu bài thi chưa được xử lý hoàn tất</li>
                    <li>Lỗi đồng bộ dữ liệu giữa các hệ thống</li>
                    <li>Bài thi chưa được nộp thành công</li>
                  </ul>
                  <p style={{ marginBottom: 0 }}>
                    <strong>Giải pháp:</strong> Vui lòng thử tải lại trang sau vài phút hoặc liên hệ bộ phận hỗ trợ kỹ thuật để được trợ giúp.
                  </p>
                </div>
              }
              style={{ 
                marginBottom: 32, 
                textAlign: "left",
                maxWidth: 600,
                margin: "0 auto 32px auto"
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <Button
                type="primary"
                size="large"
                style={{ backgroundColor: "#177ddc", borderColor: "#177ddc" }}
                onClick={() => window.location.reload()}
              >
                Thử tải lại kết quả
              </Button>
              <Button
                size="large"
                style={{
                  backgroundColor: "#f0f5ff",
                  borderColor: "#adc6ff",
                  color: "#1d39c4",
                }}
                onClick={handleGoBack}
              >
                Về danh sách bài thi
              </Button>
            </div>
            <div style={{ marginTop: 24, padding: 16, backgroundColor: "#f6f6f6", borderRadius: 8 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                💡 <strong>Lưu ý:</strong> Nếu vấn đề vẫn tiếp diễn sau 10-15 phút, có thể hệ thống AI đang bảo trì. 
                Vui lòng liên hệ bộ phận hỗ trợ kỹ thuật để được trợ giúp nhanh nhất.
              </Text>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // === CÓ TRẢ LỜI → HIỂN THỊ KẾT QUẢ ===
  return (
    <div className={styles.resultPage}>
      {/* SIDEBAR */}
      <div className={styles.sidebar}>
        <ResultSidebar
          sections={sections}
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
          isPracticeMode={isPracticeLrMode}
          result={result}
          testMeta={testMeta}
          displayedTimeSpent={displayedTimeSpent}
          displayedIsSelectTime={displayedIsSelectTime}
          displayedDuration={displayedDuration}
          displayedTotalScore={displayedTotalScore}
          normalizeTestType={normalizeTestType}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleGoBack}
              type="text"
              style={{ color: "#fff", padding: 0 }}
            >
              Quay lại
            </Button>
            <Title level={3} style={{ color: "#fff", margin: 0 }}>
              Kết quả bài thi TOEIC
            </Title>
          </div>
          <Button
            ghost
            style={{ borderColor: "#fff", color: "#fff" }}
            onClick={handleRetakeTest}
          >
            Làm lại bài thi
          </Button>
        </div>

        <div className={styles.content}>
          <Title level={4} style={{ color: "#003a8c" }}>
            {selectedSection === "overall"
              ? "Kết quả tổng quan"
              : sections.find((s) => s.key === selectedSection)?.title}
          </Title>

          <Card className={styles.scoreCard}>
            <ScoreDisplaySection
              selectedSection={selectedSection}
              isPracticeLrMode={isPracticeLrMode}
              displayScore={displayScore}
              practiceLrStats={practiceLrStats}
              availableScoreConfigs={availableScoreConfigs}
              totalScore={getTotalScore}
              maxScore={getMaxScore}
              selectedScoreConfig={selectedScoreConfig}
              skillGroup={skillGroup}
              displayedTimeSpent={displayedTimeSpent}
              displayedIsSelectTime={displayedIsSelectTime}
              displayedDuration={displayedDuration}
              totalQuestions={result?.questionQuantity ?? testMeta?.questionQuantity ?? 0}
              writingScore={result?.writingScore}
              speakingScore={result?.speakingScore}
              totalScoreFromApi={result?.totalScore}
              normalizedTestType={normalizedTestType}
              swSummary={swSummary}
            />

            {(selectedSection === "listening" || selectedSection === "reading") && (
              <LRQuestionsSection
                sectionKey={selectedSection}
                dataSource={
                  selectedSection === "listening"
                    ? questionRowsBySection.listening
                    : questionRowsBySection.reading
                }
                pagination={lrPagination}
                onPaginationChange={(page, size) =>
                    setLrPagination({
                      current: page,
                      pageSize: size || lrPagination.pageSize,
                  })
                }
                emptyMessage={EMPTY_LR_MESSAGE}
                onViewQuestionDetail={(row) => {
                  setSelectedQuestionDetail(row);
                  setQuestionDetailModalVisible(true);
                }}
                onReportQuestion={(row) => {
                  if (!row.testQuestionId) {
                    message.error("Không tìm thấy thông tin câu hỏi");
                    return;
                  }
                  const formattedQuestion = formatQuestionText(row.question || row.content || "");
                  setReportQuestion({
                    testQuestionId: row.testQuestionId,
                    question: formattedQuestion,
                    content: formattedQuestion,
                  });
                  setReportModalVisible(true);
                }}
                isQuestionReported={isQuestionReported}
              />
            )}

            {(selectedSection === "writing" || selectedSection === "speaking") && (
              <div style={{ marginTop: 20 }}>
                <SWAnswersSection
                  feedbacks={
                    selectedSection === "writing"
                  ? swFeedbacks.writing
                  : swFeedbacks.speaking
                  }
                  onSelectFeedback={(item) => {
                              setSelectedSwFeedback(item);
                              setSwDetailModalVisible(true);
                            }}
                  onReportQuestion={(item) => {
                                    if (!item.testQuestionId) {
                                      message.error("Không tìm thấy thông tin câu hỏi");
                                      return;
                                    }
                                const formattedQuestion = formatQuestionText(
                                  item.questionContent || item.content || ""
                                );
                                setReportQuestion({
                                  testQuestionId: item.testQuestionId,
                                  question: formattedQuestion,
                                  content: formattedQuestion,
                                });
                                    setReportModalVisible(true);
                                  }}
                  isQuestionReported={isQuestionReported}
                  getSwPartDisplayName={getSwPartDisplayName}
                  formatQuestionText={formatQuestionText}
                />
                  </div>
                )}
          </Card>
        </div>
      </div>

      <QuestionDetailModal
        open={detailModalVisible}
        loading={loadingDetail}
        questions={detailQuestions}
            columns={columns}
        pagination={modalPagination}
        onPaginationChange={({ current, size }) =>
          setModalPagination({ current, size })
        }
        emptyMessage={EMPTY_LR_MESSAGE}
        loadingIcon={loadingIcon}
        onCancel={() => setDetailModalVisible(false)}
      />

      <ReportQuestionModal
        open={reportModalVisible}
        question={reportQuestion}
        reportType={reportType}
        reportDescription={reportDescription}
        reporting={reporting}
        onChangeType={setReportType}
        onChangeDescription={setReportDescription}
        onSubmit={handleReportSubmit}
        onCancel={resetReportState}
      />

      <SwDetailModal
        open={swDetailModalVisible}
        feedback={selectedSwFeedback}
        onClose={() => {
          setSwDetailModalVisible(false);
          setSelectedSwFeedback(null);
        }}
        onReportQuestion={handleSwReportRequest}
        isQuestionReported={isQuestionReported}
      />


      <RetakeConfirmModal
        open={retakeModalVisible}
        loading={retakeConfirmLoading}
        testInfo={retakeTestInfo}
        fallbackInfo={result}
        onConfirm={handleRetakeConfirm}
        onCancel={handleRetakeCancel}
      />

    </div>
  );
}
