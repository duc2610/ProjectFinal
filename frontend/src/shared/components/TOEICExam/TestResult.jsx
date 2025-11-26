import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Card,
  Button,
  Typography,
  Tag,
  Table,
  Modal,
  Input,
  message,
  Progress,
  Spin,
  Checkbox,
  Alert,
  Select,
  Tooltip,
} from "antd";
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
import { getTestResultDetail, startTest } from "../../../services/testExamService";
import { translateErrorMessage } from "@shared/utils/translateError";
import { reportQuestion as reportQuestionAPI, getTestResultReports, getMyQuestionReports } from "../../../services/questionReportService";
import styles from "../../styles/Result.module.css";

const { Title, Text } = Typography;

// Helper functions từ ExamSelection
const normalizeTestType = (value) => {
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower.includes("practice") || lower.includes("luyện")) return "Practice";
    return "Simulator";
  }
  if (value === 2) return "Practice";
  return "Simulator";
};

const normalizeTestSkill = (value) => {
  if (typeof value === "string") {
    return value;
  }
  const mapping = {
    1: "Speaking",
    2: "Writing",
    3: "Listening & Reading",
    4: "S&W",
  };
  return mapping[value] || "Unknown";
};

const normalizeNumber = (value) => {
  if (value === undefined || value === null) return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

const EMPTY_LR_MESSAGE =
  "Không có câu trả lời cho phần này. Có thể bạn chưa làm hoặc dữ liệu chưa được ghi nhận.";

const SCORE_META = [
  {
    key: "listening",
    label: "Nghe",
    resultKey: "listeningScore",
    max: 495,
    color: "#1890ff",
    icon: <SoundOutlined />,
  },
  {
    key: "reading",
    label: "Đọc",
    resultKey: "readingScore",
    max: 495,
    color: "#fa8c16",
    icon: <ReadOutlined />,
  },
  {
    key: "writing",
    label: "Viết",
    resultKey: "writingScore",
    max: 200,
    color: "#722ed1",
    icon: <FileTextOutlined />,
  },
  {
    key: "speaking",
    label: "Nói",
    resultKey: "speakingScore",
    max: 200,
    color: "#13c2c2",
    icon: <CustomerServiceOutlined />,
  },
];

const SW_PART_TYPE_MAP = {
  8: "writing_sentence",
  9: "writing_email",
  10: "writing_essay",
  11: "speaking_read_aloud",
  12: "speaking_describe_picture",
  13: "speaking_respond_questions",
  14: "speaking_respond_questions_info",
  15: "speaking_express_opinion",
};

const SW_PART_ORDER = {
  writing_sentence: 1,
  writing_email: 2,
  writing_essay: 3,
  speaking_read_aloud: 4,
  speaking_describe_picture: 5,
  speaking_respond_questions: 6,
  speaking_respond_questions_info: 7,
  speaking_express_opinion: 8,
};

const getSwPartDisplayName = (partType = "") => {
  switch (partType) {
    case "writing_sentence":
      return "Viết câu";
    case "writing_email":
      return "Viết email";
    case "writing_essay":
      return "Viết luận";
    case "speaking_read_aloud":
      return "Đọc to";
    case "speaking_describe_picture":
      return "Mô tả tranh";
    case "speaking_respond_questions":
      return "Trả lời câu hỏi";
    case "speaking_respond_questions_info":
      return "Trả lời câu hỏi (thông tin)";
    case "speaking_express_opinion":
      return "Bày tỏ ý kiến";
    default:
      return partType;
  }
};

const formatQuestionText = (text) => {
  if (typeof text !== "string") return text || "";
  return text.replace(/\r\n/g, "\n");
};

const resolveSwPartType = (feedback = {}) => {
  if (feedback.partType) return feedback.partType;
  if (feedback.partId && SW_PART_TYPE_MAP[feedback.partId]) {
    return SW_PART_TYPE_MAP[feedback.partId];
  }
  if (feedback.partName) {
    const name = feedback.partName.toLowerCase();
    if (name.includes("email")) return "writing_email";
    if (name.includes("essay") || name.includes("viết luận")) return "writing_essay";
    if (name.includes("sentence")) return "writing_sentence";
    if (name.includes("describe")) return "speaking_describe_picture";
    if (name.includes("read")) return "speaking_read_aloud";
    if (name.includes("opinion")) return "speaking_express_opinion";
    if (name.includes("question") && name.includes("info")) {
      return "speaking_respond_questions_info";
    }
    if (name.includes("question")) return "speaking_respond_questions";
  }
  return "";
};

const inferSkillGroup = (skill) => {

  if (skill === undefined || skill === null) return null;

  if (typeof skill === "string") {
    const upper = skill.toUpperCase();
    if (upper.includes("LISTENING") || upper.includes("READING") || upper === "LR") {
      return "lr";
    }
    if (
      upper.includes("S&W") ||
      upper === "SW" ||
      upper === "SPEAKING" ||
      upper === "WRITING" ||
      upper.includes("SPEAKING") ||
      upper.includes("WRITING")
    ) {
      return "sw";
    }
  } else if (typeof skill === "number") {
    if (skill === 3) return "lr";
    if ([1, 2, 4].includes(skill)) return "sw";
  }
  return null;
};

const buildQuestions = (parts = []) => {
  const questions = [];
  let globalIndex = 1;

  // Sắp xếp parts theo partId tăng dần (bắt đầu từ part 1)
  const sortedParts = [...parts].sort((a, b) => (a.partId || 0) - (b.partId || 0));

  sortedParts.forEach((part) => {
    part?.testQuestions?.forEach((tq) => {
      if (tq.isGroup && tq.questionGroupSnapshotDto) {
        const group = tq.questionGroupSnapshotDto;
        group.questionSnapshots?.forEach((qs, idx) => {
          questions.push({
            testQuestionId: tq.testQuestionId,
            subQuestionIndex: idx,
            partId: part.partId,
            partName: part.partName,
            partDescription: part.description,
            globalIndex: globalIndex++,
            type: "group",
            question: qs.content,
            passage: group.passage,
            imageUrl: qs.imageUrl,
            audioUrl: qs.audioUrl,
            options: (qs.options || []).map((o) => ({ key: o.label, text: o.content })),
            correctAnswer: qs.options?.find((o) => o.isCorrect)?.label,
            userAnswer: qs.userAnswer,
          });
        });
      } else if (!tq.isGroup && tq.questionSnapshotDto) {
        const qs = tq.questionSnapshotDto;
        questions.push({
          testQuestionId: tq.testQuestionId,
          subQuestionIndex: 0,
          partId: part.partId,
          partName: part.partName,
          partDescription: part.description,
          globalIndex: globalIndex++,
          type: "single",
          question: qs.content,
          imageUrl: qs.imageUrl,
          audioUrl: qs.audioUrl,
          options: (qs.options || []).map((o) => ({ key: o.label, text: o.content })),
          correctAnswer: qs.options?.find((o) => o.isCorrect)?.label,
          userAnswer: qs.userAnswer,
        });
      }
    });
  });

  return questions;
};

export default function ResultScreen() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { testResultId: stateTestResultId, testMeta: stateTestMeta, autoSubmit } = state || {};

  // Chặn back ở màn hình kết quả
  useEffect(() => {
    const handlePopState = () => {
      history.go(1);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const [result, setResult] = useState(null);
  const [selectedSection, setSelectedSection] = useState("overall");
  const [displayScore, setDisplayScore] = useState(0);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportQuestion, setReportQuestion] = useState(null);
  const [reportText, setReportText] = useState("");
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
  const [practiceCountdown, setPracticeCountdown] = useState(true);
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
    const isPractice = normalizeTestType(testInfo.testType) === "Practice";
    setPracticeCountdown(isPractice ? !!currentIsSelectTime : true);

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
    setPracticeCountdown(true);
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
      console.log("TestResult - Loaded reports:", relevantReports.length, "questions reported out of", allReports.length, "total reports");
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
            <div style={{ fontStyle: "italic", color: "#666", marginBottom: 6, whiteSpace: "pre-wrap" }}>
              {formatQuestionText(row.passage)}
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

  const handleReportSubmit = () => {
    message.success("Báo cáo đã được gửi!");
    setReportModalVisible(false);
    setReportQuestion(null);
    setReportText("");
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

  const renderPracticeSummary = () => {
    const partStat =
      selectedSection === "listening"
        ? practiceLrStats.listening
        : selectedSection === "reading"
        ? practiceLrStats.reading
        : null;
    const tiles = [
      { label: "Tổng số câu trong đề", value: practiceLrStats.totalQuestions },
      { label: "Câu đã làm", value: practiceLrStats.totalAnswered, color: "#1d39c4" },
      { label: "Câu chưa làm", value: practiceLrStats.unanswered, color: "#fa8c16" },
      {
        label: "Độ chính xác (trên toàn đề)",
        value: `${practiceLrStats.accuracy}%`,
        color: "#389e0d",
      },
    ];
    return (
      <div
        style={{
          width: "100%",
          padding: 32,
          borderRadius: 20,
          border: "1px dashed #91caff",
          background: "linear-gradient(135deg, #e6f7ff, #f0f9ff)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>ℹ️</div>
        <Title level={3} style={{ marginBottom: 8, color: "#0958d9" }}>
          Chế độ Practice (Listening & Reading)
        </Title>
        <Text style={{ fontSize: 16, color: "#1f3b76" }}>
          Chế độ luyện tập không chấm điểm tự động. Hệ thống chỉ hiển thị danh sách câu hỏi bạn
          đã làm cùng trạng thái đúng/sai để tự đánh giá.
        </Text>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            flexWrap: "wrap",
            marginTop: 24,
          }}
        >
          {tiles.map((tile) => (
            <div
              key={tile.label}
              style={{
                minWidth: 160,
                padding: "16px 20px",
                borderRadius: 12,
                background: "#fff",
                border: "1px solid rgba(145,202,255,0.7)",
                boxShadow: "0 6px 16px rgba(9,88,217,0.08)",
              }}
            >
              <Text type="secondary">{tile.label}</Text>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 700,
                  color: tile.color || "#0c1d4f",
                }}
              >
                {tile.value}
              </div>
            </div>
          ))}
        </div>
        {partStat && (
            <div
              style={{
                marginTop: 24,
                padding: 16,
                borderRadius: 12,
                background: "#fff",
                display: "flex",
                justifyContent: "center",
                gap: 24,
                flexWrap: "wrap",
                border: "1px solid #e0e7ff",
              }}
            >
              <div>
                <Text type="secondary">
                  Tổng câu ({selectedSection === "listening" ? "Nghe" : "Đọc"})
                </Text>
                <Title level={4} style={{ margin: 0, color: "#003a8c" }}>
                  {partStat.total}
                </Title>
              </div>
              <div>
                <Text type="secondary">Đã làm</Text>
                <Title level={4} style={{ margin: 0, color: "#1d39c4" }}>
                  {partStat.answered}
                </Title>
              </div>
              <div>
                <Text type="secondary">Chưa làm</Text>
                <Title level={4} style={{ margin: 0, color: "#fa8c16" }}>
                  {partStat.unanswered}
                </Title>
              </div>
              <div>
                <Text type="secondary">Đúng</Text>
                <Title level={4} style={{ margin: 0, color: "#389e0d" }}>
                  {partStat.correct}
                </Title>
              </div>
              <div>
                <Text type="secondary">Sai</Text>
                <Title level={4} style={{ margin: 0, color: "#cf1322" }}>
                  {partStat.wrong}
                </Title>
              </div>
            </div>
        )}
      </div>
    );
  };

  // Khối thông tin chi tiết dùng chung cho tất cả các màn kết quả
  const renderGlobalDetailTiles = () => {
    const tiles = [];

    tiles.push({
      label: "Thời gian làm bài",
      value: `${displayedTimeSpent} phút`,
      color: "#1d39c4",
    });

    tiles.push({
      label: "Thời lượng đề",
      value: displayedIsSelectTime ? `${displayedDuration} phút` : "Không giới hạn",
      color: "#531dab",
    });

    if (skillGroup === "lr") {
      tiles.push({
        label: "Tổng số câu trong đề",
        value: practiceLrStats.totalQuestions,
        color: "#0958d9",
      });
      tiles.push({
        label: "Câu đã làm",
        value: practiceLrStats.totalAnswered,
        color: "#1d39c4",
      });
      tiles.push({
        label: "Câu chưa làm",
        value: practiceLrStats.unanswered,
        color: "#fa8c16",
      });
      tiles.push({
        label: "Đúng",
        value: practiceLrStats.correct,
        color: "#389e0d",
      });
      tiles.push({
        label: "Sai",
        value: practiceLrStats.wrong,
        color: "#cf1322",
      });
      tiles.push({
        label: "Độ chính xác (trên toàn đề)",
        value: `${practiceLrStats.accuracy}%`,
        color: "#08979c",
      });
    } else {
      const totalQuestions =
        result?.questionQuantity ?? testMeta?.questionQuantity ?? 0;
      if (totalQuestions > 0) {
        tiles.push({
          label: "Tổng số câu trong đề",
          value: totalQuestions,
          color: "#0958d9",
        });
      }
      if (skillGroup === "sw" || skillGroup === "writing") {
        if (result?.writingScore != null) {
          tiles.push({
            label: "Điểm Writing",
            value: result.writingScore,
            color: "#fa541c",
          });
        }
        if (result?.speakingScore != null) {
          tiles.push({
            label: "Điểm Speaking",
            value: result.speakingScore,
            color: "#fa8c16",
          });
        }
      }
      if (result?.totalScore != null && normalizedTestType !== "Practice") {
        tiles.push({
          label: "Tổng điểm",
          value: result.totalScore,
          color: "#722ed1",
        });
      }
    }

    return (
      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px dashed #e6f4ff",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
          }}
        >
          <Title level={5} style={{ marginBottom: 12, textAlign: "center" }}>
            Thông tin chi tiết
          </Title>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              justifyContent: "center",
            }}
          >
            {tiles.map((tile) => (
              <div
                key={tile.label}
                style={{
                  flex: "1 1 180px",
                  minWidth: 160,
                  padding: "14px 18px",
                  borderRadius: 12,
                  background: "#ffffff",
                  border: "1px solid #e6f4ff",
                  boxShadow: "0 3px 10px rgba(15, 23, 42, 0.08)",
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {tile.label}
                </Text>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 20,
                    fontWeight: 700,
                    color: tile.color || "#111827",
                  }}
                >
                  {tile.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderScoreDisplay = () => {
    if (isPracticeLrMode) {
      return (
        <>
          {renderPracticeSummary()}
          {renderGlobalDetailTiles()}
        </>
      );
    }
    if (selectedSection === "overall") {
      return (
        <div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              width: "100%",
            }}
          >
            <div
            style={{
              flex: "1 1 280px",
              minWidth: 260,
              background: "linear-gradient(135deg, #1d39c4, #2f54eb)",
              borderRadius: 16,
              padding: 24,
              color: "#fff",
              boxShadow: "0 15px 35px rgba(47, 84, 235, 0.25)",
            }}
            >
              <Text strong style={{ color: "rgba(255,255,255,0.85)" }}>
                Kết quả tổng quan
              </Text>
              <Title level={1} style={{ color: "#fff", margin: "12px 0 0" }}>
                {displayScore}
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 16 }}>
                Trên tổng {getMaxScore} điểm
              </Text>
              <div style={{ marginTop: 16 }}>
                <Tag
                  color={
                    displayedTotalScore >= 785
                      ? "green"
                      : displayedTotalScore >= 600
                      ? "orange"
                      : "default"
                  }
                  style={{ padding: "4px 12px", borderRadius: 999 }}
                >
                  {displayedTotalScore >= 785
                    ? "Nâng cao"
                    : displayedTotalScore >= 600
                    ? "Trung bình"
                    : "Cơ bản"}
                </Tag>
              </div>
              <div style={{ marginTop: 12, fontSize: 14, color: "rgba(255,255,255,0.9)" }}>
                Ngày thi:{" "}
                {result.createdAt
                  ? new Date(result.createdAt).toLocaleDateString("vi-VN")
                  : new Date().toLocaleDateString("vi-VN")}
                <br />
                {displayedIsSelectTime && (
                  <>
                    Thời lượng:{" "}
                    {result.duration ||
                      retakeTestInfo?.duration ||
                      testMeta?.duration ||
                      0}{" "}
                    phút
                  </>
                )}
              </div>
            </div>

            <div
              style={{
                flex: "1 1 260px",
                minWidth: 260,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {availableScoreConfigs.length === 0 ? (
                <div
                  style={{
                    padding: 24,
                    borderRadius: 12,
                    border: "1px dashed #d9d9d9",
                    background: "#fafafa",
                    textAlign: "center",
                  }}
                >
                  <Text type="secondary">Không có dữ liệu điểm chi tiết</Text>
                </div>
              ) : (
                availableScoreConfigs.map((item) => {
                  const percent = Math.min(
                    100,
                    Math.round(((Number(item.score) || 0) / item.max) * 100)
                  );
                  return (
                    <div
                      key={item.key}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: "1px solid #f0f0f0",
                        background: "#fff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Text strong>{item.label}</Text>
                        <Text style={{ color: item.color, fontWeight: 600 }}>
                          {item.score}/{item.max}
                        </Text>
                      </div>
                      <Progress
                        percent={percent}
                        strokeColor={item.color}
                        showInfo={false}
                        size="small"
                        trailColor="#f5f5f5"
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
          {renderGlobalDetailTiles()}
        </div>
      );
    }
    return (
      <>
        <Title level={1} style={{ color: "#fa8c16", margin: 0 }}>
          {displayScore}
        </Title>
        <Text strong>{selectedScoreConfig?.label || "Điểm phần thi"}</Text>
        <br />
        <Text type="secondary">Trên tổng {selectedScoreConfig?.max || 0} điểm</Text>
        {renderGlobalDetailTiles()}
      </>
    );
  };

  // === CÓ TRẢ LỜI → HIỂN THỊ KẾT QUẢ ===
  return (
    <div className={styles.resultPage}>
      {/* SIDEBAR */}
      <div className={styles.sidebar}>
        <Title level={4}>Các phần thi</Title>
        {sections.map((s) => (
          <Card
            key={s.key}
            size="small"
            onClick={() => setSelectedSection(s.key)}
            className={`${styles.sidebarCard} ${
              selectedSection === s.key ? styles.activeCard : ""
            }`}
            style={{ marginBottom: 10, cursor: "pointer" }}
          >
            <div>
              <Text strong>
                {s.icon} {s.title}
              </Text>
              <br />
              <Text type="secondary">
                {isPracticeLrMode
                  ? s.description
                  : `${s.score}/${s.max} điểm`}
              </Text>
            </div>
          </Card>
        ))}

         <div className={styles.infoBox}>
          <Title level={5}>Thông tin bài thi</Title>
          <Text>
            Ngày:{" "}
            {(result?.createdAt
              ? new Date(result.createdAt)
              : new Date()
            ).toLocaleDateString("vi-VN")}
          </Text>
          <br />
          <Text>Thời gian làm bài: {displayedTimeSpent} phút</Text>
          <br />
          {displayedIsSelectTime && (
            <>
              <Text>Thời lượng đề: {displayedDuration} phút</Text>
              <br />
            </>
          )}
          <Text>
            Loại: {normalizeTestType(result?.testType || testMeta?.testType || "Simulator")}
          </Text>
        </div>

        <div className={styles.performanceBox}>
          <Title level={5}>Mức độ</Title>
          <CheckCircleTwoTone twoToneColor="#52c41a" />
          <Text style={{ marginLeft: 8 }}>
            {displayedTotalScore >= 785
              ? "Nâng cao"
              : displayedTotalScore >= 600
              ? "Trung bình"
              : "Cơ bản"}
          </Text>
        </div>
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
            <div className={styles.scoreDisplay}>{renderScoreDisplay()}</div>

            {/* BẢNG CÂU HỎI L&R */}
            {(selectedSection === "listening" || selectedSection === "reading") && (
              <Table
                dataSource={
                  selectedSection === "listening"
                    ? questionRowsBySection.listening
                    : questionRowsBySection.reading
                }
                columns={columns}
                rowKey="key"
                pagination={{
                  current: lrPagination.current,
                  pageSize: lrPagination.pageSize,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50", "100"],
                  showTotal: (total) => `Tổng ${total} câu`,
                  onChange: (page, size) =>
                    setLrPagination({
                      current: page,
                      pageSize: size || lrPagination.pageSize,
                    }),
                }}
                style={{ marginTop: 20 }}
                locale={{ emptyText: EMPTY_LR_MESSAGE }}
              />
            )}

            {/* DANH SÁCH CÂU HỎI WRITING/SPEAKING - DÙNG CARD */}
            {(selectedSection === "writing" || selectedSection === "speaking") && (
              <div style={{ marginTop: 20 }}>
                {(selectedSection === "writing"
                  ? swFeedbacks.writing
                  : swFeedbacks.speaking
                ).length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40 }}>
                    <Text type="secondary">Chưa có dữ liệu câu hỏi</Text>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {(selectedSection === "writing"
                      ? swFeedbacks.writing
                      : swFeedbacks.speaking
                    ).map((item) => (
                      <Card
                        key={item.key}
                        style={{
                          borderRadius: 8,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                        actions={[
                          <Button
                            key="detail"
                            type="primary"
                            onClick={() => {
                              setSelectedSwFeedback(item);
                              setSwDetailModalVisible(true);
                            }}
                          >
                            Xem chi tiết
                          </Button>,
                        ]}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                              <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px" }}>
                                Câu {item.index}
                              </Tag>
                              {item.partName && (
                                <Tag color="purple" style={{ fontSize: 13, padding: "3px 10px" }}>
                                  {item.partName}
                                </Tag>
                              )}
                              <Text strong style={{ fontSize: 16 }}>
                                {getSwPartDisplayName(item.partType)}
                              </Text>
                            </div>
                            {item.questionContent && (
                              <div style={{ marginBottom: 8 }}>
                                <Text strong>Đề bài:</Text>
                                <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>
                                  {formatQuestionText(item.questionContent)}
                                </div>
                              </div>
                            )}
                            <div style={{ marginBottom: 8 }}>
                              <Text type="secondary" style={{ fontSize: 13 }}>
                                {item.content || "Chưa có đánh giá tổng quan"}
                              </Text>
                            </div>
                            {item.answerText && (
                              <div style={{ marginTop: 8 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Câu trả lời:</Text>
                                <div style={{ marginTop: 4, background: "#fafafa", borderRadius: 6, padding: 10, maxHeight: 120, overflowY: "auto" }}>
                                  <Text style={{ whiteSpace: "pre-wrap" }}>{item.answerText}</Text>
                                </div>
                              </div>
                            )}
                            {item.answerAudioUrl && !item.answerText && (
                              <div style={{ marginTop: 8 }}>
                                <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                  Câu trả lời:
                                </Text>
                                <audio controls src={item.answerAudioUrl} style={{ width: "100%" }}>
                                  Trình duyệt không hỗ trợ audio.
                                </audio>
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, marginLeft: 16 }}>
                            <div>
                              <Text type="secondary" style={{ fontSize: 12 }}>Điểm tổng</Text>
                              <div>
                                <Text strong style={{ fontSize: 20, color: "#1890ff" }}>
                                  {item.overallScore || 0}/100
                                </Text>
                              </div>
                            </div>
                            <div>
                              <Text type="secondary" style={{ fontSize: 12 }}>Điểm số</Text>
                              <div>
                                <Text strong style={{ fontSize: 18, color: "#52c41a" }}>
                                  {item.score || 0}
                                </Text>
                              </div>
                            </div>
                            <div>
                              {isQuestionReported(item.testQuestionId) ? (
                                <Tag color="success" icon={<FlagOutlined />}>
                                  Đã báo cáo
                                </Tag>
                              ) : (
                                <Button
                                  size="small"
                                  icon={<FlagOutlined />}
                                  onClick={() => {
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
                                >
                                  Báo cáo
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

          </Card>
        </div>
      </div>

      {/* MODAL CHI TIẾT */}
      <Modal
        title="Chi tiết câu hỏi và đáp án"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={1200}
      >
        {loadingDetail ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin indicator={loadingIcon} size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Đang tải chi tiết câu hỏi...</Text>
            </div>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={detailQuestions}
            rowKey="key"
            pagination={{
              pageSize: modalPagination.size,
              current: modalPagination.current,
              showSizeChanger: true,
              onChange: (page, size) =>
                setModalPagination({ current: page, size: size || modalPagination.size }),
              showTotal: (total) => `Tổng ${total} câu`,
            }}
            scroll={{ x: 1000 }}
            locale={{ emptyText: EMPTY_LR_MESSAGE }}
          />
        )}
      </Modal>

      {/* MODAL BÁO CÁO */}
      <Modal
        title="Báo cáo câu hỏi"
        open={reportModalVisible}
        onOk={async () => {
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
            
            // Cập nhật state ngay lập tức TRƯỚC KHI đóng modal
            handleReportSuccess(reportedTestQuestionId);
            
            // Đóng modal và reset form
            setReportModalVisible(false);
            setReportQuestion(null);
            setReportDescription("");
            setReportType("IncorrectAnswer");
            
            // Reload reports sau một chút để đảm bảo server đã xử lý xong
            // Nhưng state đã được cập nhật rồi nên UI sẽ hiển thị ngay
            if (result?.testResultId) {
              setTimeout(async () => {
                await loadReports(result.testResultId, swFeedbacks);
              }, 500);
            }
          } catch (error) {
            console.error("Error reporting question:", error);
            const errorMsg = translateErrorMessage(error?.response?.data?.message || error?.message) || "Không thể gửi báo cáo";
            // Xử lý lỗi "đã báo cáo rồi" một cách thân thiện hơn
            if (errorMsg.includes("already reported") || errorMsg.includes("đã báo cáo") || errorMsg.includes("Bạn đã báo cáo")) {
              message.warning("Câu hỏi này đã được báo cáo rồi");
              // Cập nhật state để hiển thị trạng thái "đã báo cáo"
              if (reportQuestion?.testQuestionId) {
                handleReportSuccess(reportQuestion.testQuestionId);
                if (result?.testResultId) {
                  await loadReports(result.testResultId, swFeedbacks);
                }
              }
              setReportModalVisible(false);
              setReportQuestion(null);
              setReportDescription("");
              setReportType("IncorrectAnswer");
            } else {
              message.error(errorMsg);
            }
          } finally {
            setReporting(false);
          }
        }}
        onCancel={() => {
          setReportModalVisible(false);
          setReportQuestion(null);
          setReportDescription("");
          setReportType("IncorrectAnswer");
        }}
        okText="Gửi báo cáo"
        cancelText="Hủy"
        confirmLoading={reporting}
        width={600}
      >
        {reportQuestion && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                Câu hỏi:
              </Text>
              <div
                style={{
                  padding: 12,
                  backgroundColor: "#fafafa",
                  borderRadius: 6,
                  border: "1px solid #f0f0f0",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                }}
              >
                {formatQuestionText(reportQuestion.question || reportQuestion.content || "—")}
              </div>
            </div>
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
                <Input.TextArea
                  rows={4}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
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
          </>
        )}
      </Modal>

      {/* MODAL CHI TIẾT CÂU HỎI */}
      <Modal
        title={`Chi tiết câu hỏi ${selectedQuestionDetail?.index || ""}`}
        open={questionDetailModalVisible}
        onCancel={() => {
          setQuestionDetailModalVisible(false);
          setSelectedQuestionDetail(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setQuestionDetailModalVisible(false);
            setSelectedQuestionDetail(null);
          }}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedQuestionDetail && (
          <div>
            {/* Passage (nếu có) */}
            {selectedQuestionDetail.passage && (
              <div style={{ 
                marginBottom: 16, 
                padding: 12, 
                backgroundColor: "#f5f5f5", 
                borderRadius: 4,
                fontStyle: "italic",
                color: "#666"
              }}>
                <Text strong>Đoạn văn:</Text>
                <div style={{ marginTop: 8 }}>{selectedQuestionDetail.passage}</div>
              </div>
            )}

            {/* Câu hỏi */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 16 }}>Câu hỏi:</Text>
              <div style={{ marginTop: 8, fontSize: 15 }}>
                {formatQuestionText(selectedQuestionDetail.question)}
              </div>
            </div>

            {/* Hình ảnh (nếu có) */}
            {selectedQuestionDetail.imageUrl && (
              <div style={{ marginBottom: 16, textAlign: "center" }}>
                <img 
                  src={selectedQuestionDetail.imageUrl} 
                  alt="Question" 
                  style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 4 }}
                />
              </div>
            )}

            {/* Tất cả các đáp án */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 16, marginBottom: 12, display: "block" }}>
                Các đáp án:
              </Text>
              {selectedQuestionDetail.options && selectedQuestionDetail.options.length > 0 ? (
                selectedQuestionDetail.options.map((option, idx) => {
                  const isCorrect = option.isCorrect;
                  const isUserAnswer = option.label === selectedQuestionDetail.userAnswer;
                  let bgColor = "#fff";
                  let borderColor = "#d9d9d9";
                  let textColor = "#000";

                  if (isCorrect) {
                    bgColor = "#f6ffed";
                    borderColor = "#52c41a";
                    textColor = "#52c41a";
                  } else if (isUserAnswer && !isCorrect) {
                    bgColor = "#fff1f0";
                    borderColor = "#f5222d";
                    textColor = "#f5222d";
                  }

                  return (
                    <div
                      key={idx}
                      style={{
                        marginBottom: 8,
                        padding: 12,
                        backgroundColor: bgColor,
                        border: `2px solid ${borderColor}`,
                        borderRadius: 4,
                        color: textColor,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Text strong style={{ fontSize: 16, color: textColor }}>
                          {option.label}.
                        </Text>
                        <Text style={{ flex: 1, color: textColor }}>{option.content}</Text>
                        {isCorrect && (
                          <Tag color="success" style={{ margin: 0 }}>Đáp án đúng</Tag>
                        )}
                        {isUserAnswer && !isCorrect && (
                          <Tag color="error" style={{ margin: 0 }}>Bạn đã chọn</Tag>
                        )}
                        {isUserAnswer && isCorrect && (
                          <Tag color="success" style={{ margin: 0 }}>Bạn đã chọn (Đúng)</Tag>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <Text type="secondary">Không có đáp án</Text>
              )}
            </div>

            {/* Giải thích */}
            {selectedQuestionDetail.explanation && (
              <div style={{ 
                marginTop: 16, 
                padding: 12, 
                backgroundColor: "#e6f7ff", 
                borderRadius: 4,
                borderLeft: "4px solid #1890ff"
              }}>
                <Text strong style={{ display: "block", marginBottom: 8 }}>
                  Giải thích:
                </Text>
                <Text>{selectedQuestionDetail.explanation}</Text>
              </div>
            )}

            {/* Kết quả */}
            <div style={{ 
              marginTop: 16, 
              padding: 12, 
              backgroundColor: selectedQuestionDetail.isCorrect ? "#f6ffed" : "#fff1f0",
              borderRadius: 4,
              textAlign: "center"
            }}>
              <Text strong style={{ fontSize: 16 }}>
                Kết quả:{" "}
                <Tag color={selectedQuestionDetail.isCorrect ? "success" : "error"} style={{ fontSize: 14 }}>
                  {selectedQuestionDetail.isCorrect ? "Đúng" : "Sai"}
                </Tag>
              </Text>
              <div style={{ marginTop: 8 }}>
                <Text>Đáp án của bạn: </Text>
                <Text strong style={{ color: selectedQuestionDetail.isCorrect ? "#52c41a" : "#f5222d" }}>
                  {selectedQuestionDetail.userAnswer || "—"}
                </Text>
              </div>
              <div>
                <Text>Đáp án đúng: </Text>
                <Text strong style={{ color: "#52c41a" }}>
                  {selectedQuestionDetail.correctAnswer}
                </Text>
              </div>
            </div>

            {/* Nút Report - chỉ hiển thị khi câu hỏi làm sai */}
            <div style={{ 
              marginTop: 16, 
              padding: 12, 
              borderTop: "1px solid #e2e8f0",
              textAlign: "center"
            }}>
              {isQuestionReported(selectedQuestionDetail.testQuestionId) ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#52c41a" }}>
                  <FlagOutlined />
                  <Text type="success" strong>Đã báo cáo câu hỏi này</Text>
                </div>
              ) : (
                <Button
                  icon={<FlagOutlined />}
                  onClick={() => {
                    // Kiểm tra xem câu hỏi đã được báo cáo chưa
                    if (isQuestionReported(selectedQuestionDetail.testQuestionId)) {
                      message.info("Câu hỏi này đã được báo cáo rồi");
                      return;
                    }
                    setReportQuestion({
                      testQuestionId: selectedQuestionDetail.testQuestionId,
                      question: selectedQuestionDetail.question,
                      content: selectedQuestionDetail.question,
                    });
                    setReportModalVisible(true);
                  }}
                  size="middle"
                >
                  Báo cáo câu hỏi
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL CHI TIẾT WRITING/SPEAKING - GIAO DIỆN KHÁC L&R */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <FileTextOutlined style={{ fontSize: 24, color: "#1890ff" }} />
            <span>
              Chi tiết đánh giá {getSwPartDisplayName(selectedSwFeedback?.partType)}
            </span>
          </div>
        }
        open={swDetailModalVisible}
        onCancel={() => {
          setSwDetailModalVisible(false);
          setSelectedSwFeedback(null);
        }}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => {
              setSwDetailModalVisible(false);
              setSelectedSwFeedback(null);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={1200}
        style={{ top: 20 }}
      >
        {selectedSwFeedback && (
          <div>
            {selectedSwFeedback.partName && (
              <div style={{ marginBottom: 16 }}>
                <Title level={5} style={{ margin: 0 }}>
                  Phần: {selectedSwFeedback.partName}
                </Title>
                <Text type="secondary">{getSwPartDisplayName(selectedSwFeedback.partType)}</Text>
              </div>
            )}
            {(selectedSwFeedback.questionContent ||
              selectedSwFeedback.questionContentFull?.content) && (
              <div style={{ marginBottom: 16 }}>
                <Title level={5}>Đề bài:</Title>
                <div
                  style={{
                    padding: 12,
                    backgroundColor: "#fff",
                    border: "1px solid #f0f0f0",
                    borderRadius: 4,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <Text>
                    {formatQuestionText(
                      selectedSwFeedback.questionContent ||
                        selectedSwFeedback.questionContentFull?.content
                    )}
                  </Text>
                </div>
              </div>
            )}
            {/* Điểm số tổng quan */}
            <div
              style={{
                marginBottom: 24,
                padding: 16,
                backgroundColor: "#f0f2f5",
                borderRadius: 4,
              }}
            >
              <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                Điểm số: {selectedSwFeedback.detailedScores?.overall || 0}/100
              </Title>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
                {selectedSwFeedback.detailedScores?.word_count !== undefined && (
                  <div>
                    <Text type="secondary">Số từ: </Text>
                    <Text strong>{selectedSwFeedback.detailedScores.word_count}</Text>
                  </div>
                )}
                {selectedSwFeedback.detailedScores?.grammar !== undefined && (
                  <div>
                    <Text type="secondary">Ngữ pháp: </Text>
                    <Text strong>{selectedSwFeedback.detailedScores.grammar}/100</Text>
                  </div>
                )}
                {selectedSwFeedback.detailedScores?.vocabulary !== undefined && (
                  <div>
                    <Text type="secondary">Từ vựng: </Text>
                    <Text strong>{selectedSwFeedback.detailedScores.vocabulary}/100</Text>
                  </div>
                )}
                {selectedSwFeedback.detailedScores?.organization !== undefined && (
                  <div>
                    <Text type="secondary">Tổ chức: </Text>
                    <Text strong>{selectedSwFeedback.detailedScores.organization}/100</Text>
                  </div>
                )}
                {selectedSwFeedback.detailedScores?.relevance !== undefined && (
                  <div>
                    <Text type="secondary">Liên quan: </Text>
                    <Text strong>{selectedSwFeedback.detailedScores.relevance}/100</Text>
                  </div>
                )}
                {selectedSwFeedback.detailedScores?.sentence_variety !== undefined && (
                  <div>
                    <Text type="secondary">Đa dạng câu: </Text>
                    <Text strong>{selectedSwFeedback.detailedScores.sentence_variety}/100</Text>
                  </div>
                )}
                {selectedSwFeedback.detailedScores?.opinion_support !== undefined && (
                  <div>
                    <Text type="secondary">Hỗ trợ ý kiến: </Text>
                    <Text strong>{selectedSwFeedback.detailedScores.opinion_support}/100</Text>
                  </div>
                )}
              </div>
            </div>

            {/* Câu trả lời gốc của bạn - tìm từ questions hoặc answers */}
            {(() => {
              const answerText =
                selectedSwFeedback.answerText ||
                selectedSwFeedback.feedback?.answerText ||
                "";
              if (answerText && answerText.trim().length > 0) {
                return (
                  <div style={{ marginBottom: 16 }}>
                    <Title level={5}>Câu trả lời của bạn:</Title>
                    <div
                      style={{
                        padding: 12,
                        backgroundColor: "#fff",
                        border: "1px solid #d9d9d9",
                        borderRadius: 4,
                        whiteSpace: "pre-wrap",
                        maxHeight: 200,
                        overflowY: "auto",
                      }}
                    >
                      <Text>{answerText}</Text>
                    </div>
                  </div>
                );
              }

              const answerAudio =
                selectedSwFeedback.answerAudioUrl ||
                selectedSwFeedback.feedback?.answerAudioUrl;
              if (answerAudio) {
                return (
                  <div style={{ marginBottom: 16 }}>
                    <Title level={5}>Câu trả lời của bạn:</Title>
                    <audio
                      controls
                      src={answerAudio}
                      style={{ width: "100%" }}
                    >
                      Trình duyệt không hỗ trợ audio.
                    </audio>
                  </div>
                );
              }

              return null;
            })()}

            {/* Câu trả lời đã chỉnh sửa */}
            {selectedSwFeedback.correctedText && (
              <div style={{ marginBottom: 16 }}>
                <Title level={5}>Câu trả lời đã chỉnh sửa:</Title>
                <div
                  style={{
                    padding: 12,
                    backgroundColor: "#f6ffed",
                    border: "1px solid #52c41a",
                    borderRadius: 4,
                    whiteSpace: "pre-wrap",
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  <Text>{selectedSwFeedback.correctedText}</Text>
                </div>
              </div>
            )}

            {/* Lỗi ngữ pháp */}
            {selectedSwFeedback.detailedAnalysis?.grammar_errors &&
              selectedSwFeedback.detailedAnalysis.grammar_errors.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>Lỗi ngữ pháp:</Title>
                  <div style={{ maxHeight: 300, overflowY: "auto" }}>
                    {selectedSwFeedback.detailedAnalysis.grammar_errors.map((error, idx) => (
                      <div
                        key={idx}
                        style={{
                          marginBottom: 8,
                          padding: 12,
                          backgroundColor: "#fff1f0",
                          borderLeft: "4px solid #f5222d",
                          borderRadius: 4,
                        }}
                      >
                        <div>
                          <Text strong style={{ color: "#f5222d" }}>
                            ✗ {error.wrong}
                          </Text>
                          {" → "}
                          <Text strong style={{ color: "#52c41a" }}>
                            ✓ {error.correct}
                          </Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {error.rule} ({error.severity})
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Vấn đề từ vựng */}
            {selectedSwFeedback.detailedAnalysis?.vocabulary_issues &&
              selectedSwFeedback.detailedAnalysis.vocabulary_issues.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>Gợi ý từ vựng:</Title>
                  <div style={{ maxHeight: 300, overflowY: "auto" }}>
                    {selectedSwFeedback.detailedAnalysis.vocabulary_issues.map((issue, idx) => (
                      <div
                        key={idx}
                        style={{
                          marginBottom: 8,
                          padding: 12,
                          backgroundColor: "#e6f7ff",
                          borderLeft: "4px solid #1890ff",
                          borderRadius: 4,
                        }}
                      >
                        <div>
                          <Text strong>"{issue.word}"</Text>
                          {" → "}
                          <Text strong style={{ color: "#1890ff" }}>
                            "{issue.better}"
                          </Text>
                        </div>
                        {issue.example && (
                          <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 4 }}>
                            Ví dụ: {issue.example}
                          </Text>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Khuyến nghị */}
            {selectedSwFeedback.recommendations &&
              selectedSwFeedback.recommendations.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>Khuyến nghị:</Title>
                  <div
                    style={{
                      padding: 12,
                      backgroundColor: "#fffbe6",
                      border: "1px solid #faad14",
                      borderRadius: 4,
                      whiteSpace: "pre-wrap",
                      maxHeight: 300,
                      overflowY: "auto",
                    }}
                  >
                    <Text>{selectedSwFeedback.recommendations.join("\n")}</Text>
                  </div>
                </div>
              )}

            {/* Matched Points */}
            {selectedSwFeedback.detailedAnalysis?.matched_points &&
              selectedSwFeedback.detailedAnalysis.matched_points.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>✅ Các điểm đã đạt được:</Title>
                  <div style={{ maxHeight: 200, overflowY: "auto" }}>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {selectedSwFeedback.detailedAnalysis.matched_points.map((point, idx) => (
                        <li key={idx} style={{ marginBottom: 4 }}>
                          <Text>{point}</Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            {/* Missing Points */}
            {selectedSwFeedback.detailedAnalysis?.missing_points &&
              selectedSwFeedback.detailedAnalysis.missing_points.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>❌ Các điểm còn thiếu:</Title>
                  <div style={{ maxHeight: 200, overflowY: "auto" }}>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {selectedSwFeedback.detailedAnalysis.missing_points.map((point, idx) => (
                        <li key={idx} style={{ marginBottom: 4 }}>
                          <Text>{point}</Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            {/* Opinion Support Issues */}
            {selectedSwFeedback.detailedAnalysis?.opinion_support_issues &&
              selectedSwFeedback.detailedAnalysis.opinion_support_issues.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>💭 Vấn đề hỗ trợ ý kiến:</Title>
                  <div style={{ maxHeight: 200, overflowY: "auto" }}>
                    {selectedSwFeedback.detailedAnalysis.opinion_support_issues.map((issue, idx) => (
                      <div
                        key={idx}
                        style={{
                          marginBottom: 8,
                          padding: 12,
                          backgroundColor: "#fffbe6",
                          borderLeft: "4px solid #faad14",
                          borderRadius: 4,
                        }}
                      >
                        <Text>{issue}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Mô tả hình ảnh (cho writing_sentence) */}
            {selectedSwFeedback.detailedAnalysis?.image_description && (
              <div style={{ marginBottom: 16 }}>
                <Title level={5}>🖼️ Mô tả hình ảnh:</Title>
                <div
                  style={{
                    padding: 12,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 4,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <Text>{selectedSwFeedback.detailedAnalysis.image_description}</Text>
                </div>
              </div>
            )}

            {selectedSwFeedback.testQuestionId && (
              <div
                style={{
                  marginTop: 24,
                  paddingTop: 16,
                  borderTop: "1px solid #f0f0f0",
                  textAlign: "center",
                }}
              >
                {isQuestionReported(selectedSwFeedback.testQuestionId) ? (
                  <Tag color="success" icon={<FlagOutlined />}>
                    Câu hỏi này đã được báo cáo
                  </Tag>
                ) : (
                  <Button
                    icon={<FlagOutlined />}
                    onClick={() => {
                      setReportQuestion({
                        testQuestionId: selectedSwFeedback.testQuestionId,
                        question: selectedSwFeedback.questionContent || "",
                        content: selectedSwFeedback.questionContent || "",
                      });
                      setReportModalVisible(true);
                    }}
                  >
                    Báo cáo câu hỏi
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* MODAL CONFIRM LÀM LẠI BÀI THI */}
      <Modal
        title={
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>
              {retakeTestInfo?.title || result?.testTitle || "Bài thi TOEIC"}
            </Title>
            <Text type="secondary">
              {normalizeTestType(retakeTestInfo?.testType || result?.testType) === "Simulator"
                ? "Mô phỏng theo đề thi thật"
                : "Bài luyện tập"}
            </Text>
          </div>
        }
        open={retakeModalVisible}
        onOk={handleRetakeConfirm}
        onCancel={handleRetakeCancel}
        okText="Bắt đầu làm bài"
        cancelText="Hủy"
        confirmLoading={retakeConfirmLoading}
        maskClosable={false}
        closable={!retakeConfirmLoading}
        width={640}
      >
        <div>
          <Alert
            type="info"
            showIcon
            message="Làm lại bài thi"
            description={`Bạn sẽ làm lại bài thi với các chế độ đã chọn từ lần thi trước: ${
              retakeTestInfo?.isSelectTime ? "Có giới hạn thời gian" : "Không giới hạn thời gian"
            }`}
            style={{ marginBottom: 16 }}
          />
          
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 4 }}>
              Thông tin bài thi
            </Text>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Text>
                <strong>Loại bài thi:</strong>{" "}
                {normalizeTestType(retakeTestInfo?.testType || result?.testType)}
              </Text>
              {retakeTestInfo?.testSkill && (
                <Text>
                  <strong>Kỹ năng:</strong> {normalizeTestSkill(retakeTestInfo.testSkill)}
                </Text>
              )}
              <Text>
                <strong>Thời lượng đề:</strong>{" "}
                {normalizeNumber(retakeTestInfo?.duration || result?.duration) > 0
                  ? `${normalizeNumber(retakeTestInfo?.duration || result?.duration)} phút`
                  : "Không giới hạn"}
              </Text>
              <Text>
                <strong>Số lượng câu hỏi:</strong>{" "}
                {normalizeNumber(retakeTestInfo?.questionQuantity || result?.questionQuantity) || "Không rõ"}
              </Text>
              <Text>
                <strong>Chế độ thời gian:</strong>{" "}
                {retakeTestInfo?.isSelectTime ? "Có giới hạn thời gian" : "Không giới hạn thời gian"}
              </Text>
            </div>
          </div>

          {normalizeTestType(retakeTestInfo?.testType || result?.testType) === "Simulator" ? (
            <Alert
              type="info"
              showIcon
              message="Chế độ Simulator"
              description="Bài thi sẽ tự động đếm ngược theo thời lượng chuẩn của đề và tự nộp khi hết giờ (giống lần thi trước)."
              style={{ marginBottom: 16 }}
            />
          ) : (
            <Alert
              type="info"
              showIcon
              message="Chế độ Practice"
              description={`Bạn sẽ làm bài với chế độ ${
                retakeTestInfo?.isSelectTime ? "đếm ngược theo thời gian đề" : "đếm thời gian lên từ 00:00"
              } như lần thi trước.`}
              style={{ marginBottom: 16 }}
            />
          )}

          <Alert
            type="info"
            showIcon
            message="Tính năng lưu tiến độ"
            description={
              <div>
                <div style={{ marginBottom: 8 }}>
                  Hệ thống sẽ tự động lưu tiến độ làm bài của bạn mỗi 5 phút. Bạn cũng có thể nhấn nút <strong>"Lưu"</strong> trên thanh công cụ để lưu thủ công bất cứ lúc nào.
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  💡 Lưu ý: Nếu mất kết nối mạng, hệ thống sẽ lưu tạm thời các câu trả lời của bạn. Khi kết nối lại, tiến độ sẽ được lưu tự động.
                </div>
              </div>
            }
            style={{ marginBottom: 16 }}
          />

          <Alert
            type="warning"
            showIcon
            message="Lưu ý"
            description="Ngay sau khi xác nhận, đề thi sẽ bắt đầu và thời gian làm bài được ghi nhận."
          />
        </div>
      </Modal>
    </div>
  );
}