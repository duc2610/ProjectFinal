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
  const { resultData, autoSubmit, detailData: initialDetailData } = state || {};
  const autoSubmitFlag = useMemo(() => {
    if (typeof autoSubmit === "boolean") return autoSubmit;
    try {
      const saved = sessionStorage.getItem("toeic_resultAutoSubmit");
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  }, [autoSubmit]);

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

  const handleDetailLoaded = useCallback((detail, metaSource) => {
    if (!detail) return;
    let meta = metaSource;
    if (!meta) {
      try {
        meta = JSON.parse(sessionStorage.getItem("toeic_resultData") || "null");
      } catch (e) {
        meta = null;
      }
    }

    const mergedResult = {
      ...detail,
      testId: meta?.testId || detail.testId,
      testType: meta?.testType || detail.testType,
      testSkill: meta?.testSkill || detail.testSkill,
      duration: meta?.duration ?? detail.duration,
      isSelectTime: meta?.isSelectTime ?? detail.isSelectTime,
      createdAt: detail.createdAt || meta?.createdAt,
    };

    setDetailData(detail);
    setResult(mergedResult);

    try {
      sessionStorage.setItem("toeic_resultDetail", JSON.stringify(detail));
    } catch (e) {
      console.error("Error saving result detail to sessionStorage:", e);
    }
  }, []);

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
    const normalizedType = normalizeTestType(result?.testType || savedTestData?.testType);
    if (normalizedType === "Practice") {
      const skillGroup = inferSkillGroup(result?.testSkill ?? savedTestData?.testSkill);
      if (skillGroup === "sw") return "/practice-sw";
      if (skillGroup === "lr") return "/practice-lr";
    }
    return "/test-list";
  }, [getSavedTestData, result]);

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
    const savedTestData = getSavedTestData();
    const sourceResult = result || savedTestData || {};
    // Ưu tiên dữ liệu từ API detail (result), sau đó đến sessionStorage
    let currentTestId = sourceResult.testId || testId || savedTestData.testId;

    if (!currentTestId) {
      message.warning("Không tìm thấy thông tin bài test. Vui lòng chọn lại từ danh sách.");
      navigate(resolveBackPath());
      return;
    }

    // Lấy thông tin test từ sessionStorage nếu có, nếu không dùng result
    let testInfo = null;
    if (sourceResult && (sourceResult.testId || currentTestId)) {
      testInfo = {
        testId: sourceResult.testId || currentTestId,
        title: sourceResult.testTitle || sourceResult.title || result?.testTitle,
        testType: sourceResult.testType || result?.testType,
        testSkill: sourceResult.testSkill || result?.testSkill,
        duration: sourceResult.duration ?? result?.duration,
        questionQuantity: sourceResult.questionQuantity ?? result?.questionQuantity,
        isSelectTime:
          sourceResult.isSelectTime ??
          result?.isSelectTime ??
          savedTestData?.isSelectTime,
      };
    }

    if (!testInfo) {
      message.error("Không thể xác định thông tin bài thi để làm lại.");
      return;
    }

    setRetakeTestInfo(testInfo);
    
    // Nếu là practice, mặc định bật countdown
    const defaultSelectTime =
      testInfo?.isSelectTime ?? result?.isSelectTime ?? true;
    setPracticeCountdown(!!defaultSelectTime);
    
    setRetakeModalVisible(true);
  };

  // Hàm xử lý confirm làm lại bài thi - gọi API startTest để tạo bài thi mới
  const handleRetakeConfirm = async () => {
    if (retakeConfirmLoading) return;

    // Lấy testId từ retakeTestInfo hoặc result hoặc state testId
    let currentTestId = retakeTestInfo?.testId || result?.testId || testId;
    
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
      normalizeTestType(retakeTestInfo?.testType || result?.testType) ===
      "Simulator";
    const finalSelectTime = isSimulator
      ? true
      : !!(retakeTestInfo?.isSelectTime ?? practiceCountdown ?? true);

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
    async (testResultId, meta) => {
    if (!testResultId) {
      return;
    }

    // Kiểm tra xem đã load chưa (dựa vào testResultId trong detailData)
    if (detailData && detailData.testResultId === testResultId) {
      return;
    }

    setLoadingDetail(true);
    try {
      const data = await getTestResultDetail(testResultId);

      handleDetailLoaded(data, meta);
      console.log("TestResult - Loaded full detail from API:", data);

      // Không hiển thị message success khi auto load
    } catch (error) {
      console.error("Error loading detail:", error);
      message.error("Không thể tải chi tiết kết quả: " + translateErrorMessage(error.response?.data?.message || error.message));
      
      // Nếu không load được detail, vẫn hiển thị thông tin cơ bản từ sessionStorage
      try {
        const savedResultData = JSON.parse(sessionStorage.getItem("toeic_resultData") || "null");
        if (savedResultData) {
          setResult(savedResultData);
        }
      } catch (e) {
        console.error("Error reading resultData from sessionStorage:", e);
      }
    } finally {
      setLoadingDetail(false);
    }
    },
    [detailData, handleDetailLoaded]
  );

  // === XỬ LÝ DỮ LIỆU TỪ SUBMIT ===
  useEffect(() => {
    if (autoSubmitFlag) {
      message.info("Hết thời gian! Bài thi đã được nộp tự động.");
    }

    // Nếu không có resultData từ router state, thử lấy từ sessionStorage (fallback khi refresh trang)
    if (!resultData) {
      try {
        const savedResultData = JSON.parse(
          sessionStorage.getItem("toeic_resultData") || "null"
        );
        if (savedResultData) {
          setResult(savedResultData);
          if (savedResultData?.testId) setTestId(savedResultData.testId);

          const savedDetail = JSON.parse(
            sessionStorage.getItem("toeic_resultDetail") || "null"
          );
          if (
            savedDetail &&
            savedResultData?.testResultId &&
            savedDetail.testResultId === savedResultData.testResultId
          ) {
            handleDetailLoaded(savedDetail, savedResultData);
            return;
          }

          if (savedResultData?.testResultId) {
            loadDetailFromAPI(savedResultData.testResultId, savedResultData);
            return;
          } else {
            message.error("Không tìm thấy testResultId trong dữ liệu đã lưu.");
            navigate(resolveBackPath());
            return;
          }
        }
      } catch (e) {
        console.error("Error reading resultData from sessionStorage:", e);
      }
      message.error("Không có dữ liệu kết quả.");
      navigate(resolveBackPath());
      return;
    }

    // Lưu lại resultData cơ bản để hỗ trợ refresh trang kết quả
    try {
      sessionStorage.setItem("toeic_resultData", JSON.stringify(resultData));
    } catch (e) {
      console.error("Error saving resultData to sessionStorage:", e);
    }
    
    // Lấy testId từ resultData hoặc từ sessionStorage
    if (resultData?.testId) {
      setTestId(resultData.testId);
    } else {
      // Thử lấy từ sessionStorage
      try {
        const savedTestData = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
        if (savedTestData.testId) {
          setTestId(savedTestData.testId);
        }
      } catch (e) {
        console.error("Error reading testId from sessionStorage:", e);
      }
    }
    
    // Set result tạm thời từ resultData để hiển thị loading
    // Sau đó sẽ được cập nhật từ API detail
    setResult(resultData);
    
    // QUAN TRỌNG: Gọi API detail ngay lập tức với testResultId để lấy TẤT CẢ thông tin
    if (resultData?.testResultId) {
      if (!initialDetailData) {
        loadDetailFromAPI(resultData.testResultId, resultData);
      }
    } else {
      message.error("Không tìm thấy testResultId. Không thể tải chi tiết kết quả.");
      navigate(resolveBackPath());
    }
  }, [
    resultData,
    autoSubmitFlag,
    navigate,
    loadDetailFromAPI,
    resolveBackPath,
    initialDetailData,
    handleDetailLoaded,
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

  const questionOrderMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(result?.questions)) {
      result.questions.forEach((q) => {
        if (!q?.testQuestionId) return;
        const subIndex =
          q.subQuestionIndex !== undefined && q.subQuestionIndex !== null
            ? q.subQuestionIndex
            : null;
        const key = subIndex !== null ? `${q.testQuestionId}_${subIndex}` : `${q.testQuestionId}`;
        const orderValue =
          q.globalIndex ??
          q.index ??
          q.order ??
          q.displayOrder ??
          q.questionNumber ??
          null;
        if (orderValue !== null && orderValue !== undefined) {
          map.set(key, Number(orderValue));
        }
      });
    }
    return map;
  }, [result?.questions]);

  // === XỬ LÝ CÂU HỎI TỪ API DETAIL ===
  const processQuestionsFromDetail = (detailData) => {
    if (!detailData?.parts) return { listening: [], reading: [], all: [] };

    const rows = { listening: [], reading: [], all: [] };
    let globalIndex = 1;

    const normalizeOptions = (options = []) =>
      options.map((option) => ({
        label: option?.label,
        content: option?.content,
        isCorrect: option?.isCorrect,
      }));

    // Sắp xếp parts theo partId để đảm bảo thứ tự giống màn thi
    const sortedParts = [...(detailData.parts || [])].sort((a, b) => (a.partId || 0) - (b.partId || 0));

    sortedParts.forEach((part) => {
      part.testQuestions?.forEach((tq) => {
        const pushRow = (qs, extra = {}) => {
          const options = normalizeOptions(qs.options || []);
          const optionTextMap = options.reduce((map, option) => {
            if (option?.label) {
              map[option.label] = option.content || "";
            }
            return map;
          }, {});

          const baseIndex = globalIndex++;
          const userAnswerRaw = typeof qs.userAnswer === "string" ? qs.userAnswer.trim() : qs.userAnswer || "";
          const hasUserAnswer = !!userAnswerRaw;
          if (!hasUserAnswer) {
            return;
          }
          const correctOption = options.find((o) => o.isCorrect);
          const correctAnswerLabel = correctOption?.label || "";
          const normalizedSubIndex =
            extra.subQuestionIndex !== undefined && extra.subQuestionIndex !== null
              ? extra.subQuestionIndex
              : null;
          const orderKey =
            normalizedSubIndex !== null ? `${tq.testQuestionId}_${normalizedSubIndex}` : `${tq.testQuestionId}`;
          const mappedIndex = questionOrderMap.get(orderKey);
          const displayIndex = mappedIndex || baseIndex;

          const row = {
            key: extra.key || tq.testQuestionId,
            testQuestionId: tq.testQuestionId,
            subQuestionIndex: extra.subQuestionIndex,
            index: displayIndex,
            sortOrder: baseIndex,
            partId: qs.partId || part.partId,
            partTitle: part.partName || `Part ${qs.partId || part.partId}`,
            partDescription: part.description,
            question: qs.content || "",
            passage: extra.passage || null,
            userAnswer: userAnswerRaw,
            userAnswerText: optionTextMap[userAnswerRaw] || "",
            correctAnswer: correctAnswerLabel,
            correctAnswerText: correctOption?.content || "",
            isCorrect:
              qs.isCorrect !== null && qs.isCorrect !== undefined
                ? qs.isCorrect
                : userAnswerRaw === correctAnswerLabel,
            imageUrl: qs.imageUrl || extra.imageUrl || null,
            explanation: qs.explanation,
            options,
            hasAnswer: true,
          };

          rows.all.push(row);
          if (row.partId >= 1 && row.partId <= 4) rows.listening.push(row);
          if (row.partId >= 5 && row.partId <= 7) rows.reading.push(row);
        };

        // Xử lý single question
        if (!tq.isGroup && tq.questionSnapshotDto) {
          pushRow(tq.questionSnapshotDto);
        }

        // Xử lý group question
        if (tq.isGroup && tq.questionGroupSnapshotDto) {
          const group = tq.questionGroupSnapshotDto;
          group.questionSnapshots?.forEach((qs, idx) => {
            pushRow(qs, {
              key: `${tq.testQuestionId}_${idx}`,
              subQuestionIndex: idx,
              passage: group.passage || null,
              imageUrl: group.imageUrl,
            });
          });
        }
      });
    });

    const compare = (a, b) => {
      const partA = a.partId ?? Number.MAX_SAFE_INTEGER;
      const partB = b.partId ?? Number.MAX_SAFE_INTEGER;
      if (partA !== partB) return partA - partB;
      const orderA = a.sortOrder ?? a.index ?? 0;
      const orderB = b.sortOrder ?? b.index ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return (a.index || 0) - (b.index || 0);
    };

    rows.all.sort(compare);
    rows.listening.sort(compare);
    rows.reading.sort(compare);

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
  }, [detailData, questionOrderMap]);

  // Load danh sách reports - định nghĩa sau questionRowsBySection
  const loadReports = useCallback(async (testResultId) => {
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
          ...(questionRowsBySection.all || [])
        ];
        allRows.forEach(row => {
          if (row && row.testQuestionId) {
            currentTestQuestionIds.add(row.testQuestionId);
          }
        });
      }
      
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

  // Reload reports khi questionRowsBySection thay đổi (đã có dữ liệu câu hỏi)
  useEffect(() => {
    if (resultData?.testResultId && (questionRowsBySection.all.length > 0 || questionRowsBySection.listening.length > 0 || questionRowsBySection.reading.length > 0)) {
      loadReports(resultData.testResultId);
    }
  }, [questionRowsBySection, resultData?.testResultId, loadReports]);

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

    const writing = [];
    const speaking = [];
    let index = 1;

    result.perPartFeedbacks.forEach((feedback) => {
      // Dựa vào aiScorer để phân loại writing/speaking
      const aiScorer = feedback.aiScorer || "";
      const isWriting = aiScorer === "writing";
      const isSpeaking = aiScorer === "speaking";

      // Tìm partType từ result.questions dựa vào testQuestionId
      let partType = feedback.partType || "";
      if (!partType && result?.questions) {
        const question = result.questions.find(
          (q) => q.testQuestionId === feedback.testQuestionId
        );
        if (question) {
          // Map partId sang partType
          const partTypeMap = {
            8: "writing_sentence",
            9: "writing_email",
            10: "writing_essay",
            11: "speaking_read_aloud",
            12: "speaking_describe_picture",
            13: "speaking_respond_questions",
            14: "speaking_respond_questions_info",
            15: "speaking_express_opinion",
          };
          partType = partTypeMap[question.partId] || "";
        }
      }

      if (isWriting || isSpeaking) {
        const baseIndex = index++;
        const orderKey = `${feedback.testQuestionId}`;
        const mappedIndex = questionOrderMap.get(orderKey);
        const displayIndex = mappedIndex || baseIndex;

        const hasMappedIndex = mappedIndex !== undefined && mappedIndex !== null;
        const row = {
          key: feedback.testQuestionId || displayIndex,
          index: hasMappedIndex ? Number(displayIndex) : null,
          sortOrder: hasMappedIndex
            ? Number(displayIndex)
            : Number(feedback.order ?? feedback.testQuestionId ?? baseIndex),
          testQuestionId: feedback.testQuestionId,
          partId: feedback.partId,
          partType: partType,
          score: feedback.score || 0,
          overallScore: feedback.detailedScores?.overall || 0,
          content: feedback.content || "",
          partName: feedback.partName || (feedback.partId ? `Part ${feedback.partId}` : ""),
          questionPrompt: feedback.questionContent?.content || "",
          answerText: feedback.answerText || "",
          answerAudioUrl: feedback.answerAudioUrl,
          hasMappedIndex,
          feedback: feedback, // Lưu toàn bộ feedback để hiển thị chi tiết
        };

        if (isWriting) {
          writing.push(row);
        } else if (isSpeaking) {
          speaking.push(row);
        }
      }
    });

    const compare = (a, b) => {
      const partA = a.partId ?? Number.MAX_SAFE_INTEGER;
      const partB = b.partId ?? Number.MAX_SAFE_INTEGER;
      if (partA !== partB) return partA - partB;
      const orderA = a.sortOrder ?? a.index ?? 0;
      const orderB = b.sortOrder ?? b.index ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return (a.index || 0) - (b.index || 0);
    };

    const applySequentialIndexIfNeeded = (items) => {
      const hasMapped = items.some((item) => item.hasMappedIndex && typeof item.index === "number");
      if (hasMapped) {
        return items.map((item) => ({
          ...item,
          index: Number(item.index ?? item.sortOrder ?? 0),
          sortOrder: Number(item.sortOrder ?? item.index ?? 0),
          hasMappedIndex: undefined,
        }));
      }

      return items.map((item, idx) => ({
        ...item,
        index: idx + 1,
        sortOrder: idx + 1,
        hasMappedIndex: undefined,
      }));
    };

    return {
      writing: applySequentialIndexIfNeeded(writing.sort(compare)),
      speaking: applySequentialIndexIfNeeded(speaking.sort(compare)),
    };
  }, [result, questionOrderMap]);

  const listeningReadingPresence = useMemo(() => {
    const presence = { listening: false, reading: false };

    const markPresenceByPartId = (partId, testQuestionsLength = 0) => {
      if (!testQuestionsLength || testQuestionsLength === 0) return;
      if (partId >= 1 && partId <= 4) {
        presence.listening = true;
      } else if (partId >= 5 && partId <= 7) {
        presence.reading = true;
      }
    };

    (detailData?.parts || []).forEach((part) => {
      markPresenceByPartId(part.partId, part.testQuestions?.length || 0);
    });

    if ((!presence.listening || !presence.reading) && Array.isArray(result?.questions)) {
      result.questions.forEach((question) => {
        if (question?.partId) {
          markPresenceByPartId(question.partId, 1);
        }
      });
    }

    return presence;
  }, [detailData, result?.questions]);

  const scoreConfigs = useMemo(
    () =>
      SCORE_META.map((meta) => ({
        ...meta,
        score: result ? result[meta.resultKey] : undefined,
      })),
    [result]
  );

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

  // === CẬP NHẬT ĐIỂM SỐ HIỂN THỊ ===
  useEffect(() => {
    if (!result) {
      setDisplayScore(0);
      return;
    }

    let target = 0;
    if (selectedSection === "overall") {
      target = getTotalScore;
    } else if (selectedSection === "reading") {
      target = getReadingScore;
    } else {
      target = selectedScoreConfig?.score || 0;
    }

    setDisplayScore(Math.max(0, Number(target) || 0));
  }, [selectedSection, result, getReadingScore, getTotalScore, selectedScoreConfig]);

  // === KIỂM TRA CÓ TRẢ LỜI KHÔNG ===
  // Kiểm tra cả L&R (detailData) và S&W (perPartFeedbacks)
  const hasAnswered = useMemo(() => {
    // Kiểm tra L&R từ detailData
    const hasLRAnswers = detailData?.parts?.some(part => 
      part.testQuestions?.some(tq => {
        if (tq.questionSnapshotDto) {
          return tq.questionSnapshotDto.userAnswer !== null && tq.questionSnapshotDto.userAnswer !== undefined;
        }
        if (tq.questionGroupSnapshotDto) {
          return tq.questionGroupSnapshotDto.questionSnapshots?.some(qs => 
            qs.userAnswer !== null && qs.userAnswer !== undefined
          );
        }
        return false;
      })
    ) || false;

    // Kiểm tra S&W từ perPartFeedbacks
    const hasSWAnswers = result?.perPartFeedbacks && Array.isArray(result.perPartFeedbacks) && result.perPartFeedbacks.length > 0;

    return hasLRAnswers || hasSWAnswers;
  }, [detailData, result]);

  const displayedTotalScore = getTotalScore;

  // === SIDEBAR SECTIONS - CHỈ LẤY TỪ API, KHÔNG TỰ SUY LUẬN ===
  const sections = result
    ? [
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
      ]
    : [];

  // === TABLE COLUMNS CHO L&R ===
  const columns = [
    { 
      title: "Câu hỏi", 
      dataIndex: "index", 
      width: 320, 
      render: (_, row) => {
        const questionIndex = row.index ?? row.sortOrder ?? "—";
        return (
          <div>
            <div style={{ fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span>Câu {questionIndex}</span>
              <Tag color="geekblue" style={{ marginBottom: 0 }}>
                {row.partTitle || `Part ${row.partId}`}
              </Tag>
            </div>
            {row.partDescription && (
              <Text type="secondary" style={{ display: "block", fontSize: 12, marginBottom: 6 }}>
                {row.partDescription}
              </Text>
            )}
            {row.passage && (
              <div style={{ fontStyle: "italic", color: "#666", marginBottom: 6 }}>
                {row.passage}
              </div>
            )}
            <div>{row.question}</div>
          </div>
        );
      }
    },
    {
      title: "Đáp án của bạn",
      dataIndex: "userAnswer",
      width: 160,
      render: (_, row) => {
        if (!row.hasAnswer) {
          return <Text type="secondary">Chưa trả lời</Text>;
        }
        return (
          <div>
            <Text style={{ color: row.isCorrect ? "#52c41a" : "#f5222d", fontWeight: "bold" }}>
              {row.userAnswer || "—"}
            </Text>
            {row.userAnswerText && (
              <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>{row.userAnswerText}</div>
            )}
          </div>
        );
      },
    },
    { 
      title: "Đáp án đúng", 
      dataIndex: "correctAnswer", 
      width: 180,
      render: (_, row) => (
        <div>
          <Text strong>{row.correctAnswer || "—"}</Text>
          {row.correctAnswerText && (
            <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>{row.correctAnswerText}</div>
          )}
        </div>
      ),
    },
    {
      title: "Kết quả",
      dataIndex: "isCorrect",
      width: 120,
      render: (val) => {
        if (val === true) {
          return <Tag color="success">Đúng</Tag>;
        }
        if (val === false) {
          return <Tag color="error">Sai</Tag>;
        }
        return <Tag color="default">Chưa trả lời</Tag>;
      },
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
                setReportQuestion({
                  testQuestionId: row.testQuestionId,
                  question: row.question,
                  content: row.question,
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
            setSelectedSwFeedback(row.feedback);
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
  if (!hasAnswered) {
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
            <Title level={3} style={{ color: "#fa541c", marginBottom: 12 }}>
              Không thể hiển thị kết quả
            </Title>
            <Text strong style={{ fontSize: 16 }}>
              Có thể đang có lỗi khi chấm bài hoặc đồng bộ dữ liệu.
            </Text>
            <div style={{ marginTop: 12 }}>
              <Text type="secondary">
                Vui lòng thử tải lại hoặc quay lại danh sách bài thi. Nếu tình trạng tiếp diễn hãy liên hệ hỗ trợ.
              </Text>
            </div>
            <div
              style={{
                marginTop: 32,
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
            <Text type="secondary" style={{ display: "block", marginTop: 16 }}>
              Nếu bạn đã báo cáo hoặc cần hỗ trợ gấp, vui lòng gửi thông tin tới đội ngũ kỹ thuật.
            </Text>
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
                {s.score}/{s.max} điểm
              </Text>
            </div>
          </Card>
        ))}

        <div className={styles.infoBox}>
          <Title level={5}>Thông tin bài thi</Title>
          <Text>Ngày: {new Date().toLocaleDateString("vi-VN")}</Text>
          <br />
          <Text>Thời gian: {result.duration || 0} phút</Text>
          <br />
          <Text>Loại: TOEIC Simulator</Text>
        </div>

        <div className={styles.performanceBox}>
          <Title level={5}>Mức độ</Title>
          <CheckCircleTwoTone twoToneColor="#52c41a" />
          <Text style={{ marginLeft: 8 }}>
            {result.totalScore >= 785
              ? "Nâng cao"
              : result.totalScore >= 600
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
            <div className={styles.scoreDisplay}>
              {selectedSection === "overall" ? (
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
                      Thời lượng: {result.duration || retakeTestInfo?.duration || 0} phút
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
              ) : (
                <>
                  <Title level={1} style={{ color: "#fa8c16", margin: 0 }}>
                    {displayScore}
                  </Title>
                  <Text strong>{selectedScoreConfig?.label || "Điểm phần thi"}</Text>
                  <br />
                  <Text type="secondary">
                    Trên tổng {selectedScoreConfig?.max || 0} điểm
                  </Text>
                </>
              )}
            </div>

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
                pagination={{ pageSize: 10 }}
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
                              setSelectedSwFeedback(item.feedback);
                              setSwDetailModalVisible(true);
                            }}
                          >
                            Xem chi tiết
                          </Button>,
                        ]}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                              {item.partName && (
                                <Tag color="geekblue" style={{ fontSize: 13, padding: "4px 10px" }}>
                                  {item.partName}
                                </Tag>
                              )}
                              <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px" }}>
                                Câu {item.index}
                              </Tag>
                              <Text strong style={{ fontSize: 16 }}>
                                {item.partType === "writing_sentence"
                                  ? "Viết câu"
                                  : item.partType === "writing_email"
                                  ? "Viết email"
                                  : item.partType === "writing_essay"
                                  ? "Viết luận"
                                  : item.partType === "speaking_read_aloud"
                                  ? "Đọc to"
                                  : item.partType === "speaking_describe_picture"
                                  ? "Mô tả tranh"
                                  : item.partType === "speaking_respond_questions"
                                  ? "Trả lời câu hỏi"
                                  : item.partType === "speaking_respond_questions_info"
                                  ? "Trả lời câu hỏi (thông tin)"
                                  : item.partType === "speaking_express_opinion"
                                  ? "Bày tỏ ý kiến"
                                  : item.partType}
                              </Text>
                            </div>
                            {item.questionPrompt && (
                              <div style={{ marginBottom: 8 }}>
                                <Text strong style={{ display: "block", marginBottom: 4 }}>Đề bài:</Text>
                                <Text style={{ fontSize: 13 }}>{item.questionPrompt}</Text>
                              </div>
                            )}
                            <div style={{ marginBottom: 8 }}>
                              <Text strong style={{ display: "block", marginBottom: 4 }}>Câu trả lời của bạn:</Text>
                              <div
                                style={{
                                  padding: 12,
                                  backgroundColor: "#f7f7f7",
                                  borderRadius: 6,
                                  border: "1px solid #e6e6e6",
                                  maxHeight: 140,
                                  overflowY: "auto",
                                  whiteSpace: "pre-wrap",
                                  fontSize: 13,
                                }}
                              >
                                {item.answerText ? (
                                  <Text>{item.answerText}</Text>
                                ) : (
                                  <Text type="secondary">Chưa có câu trả lời</Text>
                                )}
                              </div>
                              {item.answerAudioUrl && (
                                <audio
                                  controls
                                  src={item.answerAudioUrl}
                                  style={{ width: "100%", marginTop: 8 }}
                                >
                                  Your browser does not support the audio element.
                                </audio>
                              )}
                            </div>
                            <div style={{ marginBottom: 8 }}>
                              <Text type="secondary" style={{ fontSize: 13, fontStyle: "italic" }}>
                                {item.content || "Không có nhận xét"}
                              </Text>
                            </div>
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
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* OVERALL */}
            {selectedSection === "overall" && (
              (result.listeningScore !== undefined || result.readingScore !== undefined) && (
                <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
                  <Button
                    onClick={() => openDetailForSection("overall")}
                    type="primary"
                    loading={loadingDetail}
                    size="large"
                    style={{ minWidth: 220, borderRadius: 999 }}
                  >
                    Xem tất cả câu hỏi L&R
                  </Button>
                </div>
              )
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
            pagination={{ pageSize: 10 }}
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
                await loadReports(result.testResultId);
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
                  await loadReports(result.testResultId);
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
              <Text>{reportQuestion.question || reportQuestion.content || "—"}</Text>
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
            <div style={{ position: "relative", paddingBottom: 24 }}>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                Mô tả chi tiết:
              </Text>
              <Input.TextArea
                rows={4}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
                maxLength={500}
              />
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 4,
                  fontSize: 12,
                  color: "#999",
                }}
              >
                {reportDescription.length}/500
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

            {/* Part info */}
            {selectedQuestionDetail.partTitle && (
              <div style={{ marginBottom: 12 }}>
                <Tag color="geekblue">{selectedQuestionDetail.partTitle}</Tag>
              </div>
            )}

            {/* Câu hỏi */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 16 }}>Câu hỏi:</Text>
              <div style={{ marginTop: 8, fontSize: 15 }}>{selectedQuestionDetail.question}</div>
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
                {selectedQuestionDetail.userAnswerText && (
                  <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
                    {selectedQuestionDetail.userAnswerText}
                  </div>
                )}
              </div>
              <div>
                <Text>Đáp án đúng: </Text>
                <Text strong style={{ color: "#52c41a" }}>
                  {selectedQuestionDetail.correctAnswer}
                </Text>
                {selectedQuestionDetail.correctAnswerText && (
                  <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
                    {selectedQuestionDetail.correctAnswerText}
                  </div>
                )}
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
              Chi tiết đánh giá{" "}
              {selectedSwFeedback?.aiScorer === "writing" ? "Viết" : 
               selectedSwFeedback?.aiScorer === "speaking" ? "Nói" :
               selectedSwFeedback?.partType?.includes("writing") ? "Viết" : "Nói"}
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
            <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {selectedSwFeedback.partName && (
                <Tag color="geekblue">{selectedSwFeedback.partName}</Tag>
              )}
              {selectedSwFeedback.partType && (
                <Tag color="blue">{selectedSwFeedback.partType}</Tag>
              )}
            </div>

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

            {/* Câu hỏi gốc */}
            {selectedSwFeedback.questionContent?.content && (
              <div style={{ marginBottom: 16 }}>
                <Title level={5}>Đề bài:</Title>
                <div
                  style={{
                    padding: 12,
                    backgroundColor: "#fff",
                    border: "1px solid #d9d9d9",
                    borderRadius: 4,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <Text>{selectedSwFeedback.questionContent.content}</Text>
                </div>
              </div>
            )}

            {/* Câu trả lời gốc của bạn - tìm từ questions hoặc answers */}
            {(() => {
              // Tìm câu trả lời gốc từ result.questions hoặc result.answers
              let originalAnswer = selectedSwFeedback.answerText || null;
              
              // Thử tìm từ questions (nếu có cấu trúc với answerText hoặc userAnswer)
              if (result?.questions) {
                const question = result.questions.find(
                  (q) => q.testQuestionId === selectedSwFeedback.testQuestionId
                );
                if (question) {
                  originalAnswer = question.answerText || question.userAnswer || question.answer;
                }
              }
              
              // Nếu không tìm thấy, thử tìm từ answers object
              if (!originalAnswer && result?.answers) {
                originalAnswer = result.answers[selectedSwFeedback.testQuestionId];
              }

              const hasAudio = !!selectedSwFeedback.answerAudioUrl;
              const hasText = !!originalAnswer;

              if (!hasText && !hasAudio) {
                return null;
              }

              return (
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>Câu trả lời của bạn:</Title>
                  {hasText && (
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
                      <Text>{originalAnswer}</Text>
                    </div>
                  )}
                  {hasAudio && (
                    <audio
                      controls
                      src={selectedSwFeedback.answerAudioUrl}
                      style={{ width: "100%", marginTop: 12 }}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
              );
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
          <div style={{ marginBottom: 16 }}>
            <Text>
              Bạn sắp làm lại bài thi{" "}
              <strong>{retakeTestInfo?.title || result?.testTitle || "TOEIC"}</strong>.
              Bài thi sẽ được khởi tạo lại với những chế độ bạn đã chọn trước đó.
            </Text>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              padding: 16,
              borderRadius: 8,
              background: "#f5f5f5",
              marginBottom: 16,
            }}
          >
            <Text>
              <strong>Loại bài thi:</strong>{" "}
              {normalizeTestType(retakeTestInfo?.testType || result?.testType)}
            </Text>
            {retakeTestInfo?.testSkill && (
              <Text>
                <strong>Kỹ năng:</strong>{" "}
                {normalizeTestSkill(retakeTestInfo.testSkill)}
              </Text>
            )}
            <Text>
              <strong>Chế độ thời gian:</strong>{" "}
              {normalizeTestType(retakeTestInfo?.testType || result?.testType) ===
              "Simulator"
                ? "Đếm ngược theo đề (Simulator)"
                : retakeTestInfo?.isSelectTime
                ? "Đếm ngược theo đề"
                : "Tự do (đếm thời gian lên)"}
            </Text>
          </div>

          <Alert
            type="warning"
            showIcon
            message="Bạn có chắc chắn muốn làm lại bài thi?"
            description="Nếu bạn đồng ý, bài thi sẽ bắt đầu lại ngay với các chế độ bạn đã chọn trước đó."
          />
        </div>
      </Modal>
    </div>
  );
}