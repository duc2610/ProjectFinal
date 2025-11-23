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
import { getTestResultDetailLR, startTest } from "../../../services/testExamService";
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
  const { resultData, autoSubmit } = state || {};

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

  // Hàm xử lý quay lại - quay về trang chủ hoặc test-list
  const handleGoBack = () => {
    navigate("/test-list");
  };

  // Hàm xử lý làm lại bài thi - hiển thị modal confirm
  const handleRetakeTest = () => {
    // Lấy testId từ resultData hoặc từ sessionStorage
    let currentTestId = testId;
    
    if (!currentTestId) {
      // Thử lấy từ sessionStorage
      try {
        const savedTestData = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
        currentTestId = savedTestData.testId;
      } catch (e) {
        console.error("Error reading testId from sessionStorage:", e);
      }
    }
    
    if (!currentTestId) {
      message.warning("Không tìm thấy thông tin bài test. Vui lòng chọn lại từ danh sách.");
      navigate("/test-list");
      return;
    }

    // Lấy thông tin test từ result hoặc sessionStorage (không cần gọi API)
    let testInfo = null;
    try {
      const savedTestData = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
      if (savedTestData.testId) {
        testInfo = {
          testId: savedTestData.testId,
          title: savedTestData.title || result?.testTitle,
          testType: savedTestData.testType || result?.testType,
          testSkill: savedTestData.testSkill || result?.testSkill,
          duration: savedTestData.duration || result?.duration,
          questionQuantity: savedTestData.questionQuantity || result?.questionQuantity,
        };
      }
    } catch (e) {
      console.error("Error reading test data from sessionStorage:", e);
    }

    // Nếu không có từ sessionStorage, dùng từ result
    if (!testInfo && result) {
      testInfo = {
        testId: currentTestId,
        title: result.testTitle,
        testType: result.testType,
        testSkill: result.testSkill,
        duration: result.duration,
        questionQuantity: result.questionQuantity,
      };
    }

    setRetakeTestInfo(testInfo);
    
    // Nếu là practice, mặc định bật countdown
    const isPractice = normalizeTestType(testInfo?.testType || result?.testType) === "Practice";
    setPracticeCountdown(isPractice ? true : false);
    
    setRetakeModalVisible(true);
  };

  // Hàm xử lý confirm làm lại bài thi - gọi API startTest để tạo bài thi mới
  const handleRetakeConfirm = async () => {
    if (retakeConfirmLoading) return;

    // Lấy testId từ retakeTestInfo hoặc result hoặc state testId
    let currentTestId = retakeTestInfo?.testId || result?.testId || testId;
    
    // Nếu vẫn không có, thử lấy từ sessionStorage
    if (!currentTestId) {
      try {
        const savedTestData = JSON.parse(sessionStorage.getItem("toeic_testData") || "{}");
        currentTestId = savedTestData.testId;
      } catch (e) {
        console.error("Error reading testId from sessionStorage:", e);
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

    const isSimulator = normalizeTestType(retakeTestInfo?.testType || result?.testType) === "Simulator";
    const finalSelectTime = isSimulator ? true : !!practiceCountdown;

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
      message.error(error.response?.data?.message || "Không thể bắt đầu bài thi. Vui lòng thử lại.");
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
  const loadDetailFromAPI = useCallback(async (testResultId) => {
    if (!testResultId) {
      return;
    }

    // Kiểm tra xem đã load chưa (dựa vào testResultId trong detailData)
    if (detailData && detailData.testResultId === testResultId) {
      return;
    }

    setLoadingDetail(true);
    try {
      const data = await getTestResultDetailLR(testResultId);
      setDetailData(data);
      // Không hiển thị message success khi auto load
    } catch (error) {
      console.error("Error loading detail:", error);
      message.error("Không thể tải chi tiết câu hỏi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoadingDetail(false);
    }
  }, [detailData]);

  // === XỬ LÝ DỮ LIỆU TỪ SUBMIT ===
  useEffect(() => {
    if (autoSubmit) {
      message.info("Hết thời gian! Bài thi đã được nộp tự động.");
    }

    // Nếu không có resultData từ router state, thử lấy từ sessionStorage (fallback khi refresh trang)
    if (!resultData) {
      try {
        const savedResultData = JSON.parse(sessionStorage.getItem("toeic_resultData") || "null");
        if (savedResultData) {
          setResult(savedResultData);
          if (savedResultData?.testId) setTestId(savedResultData.testId);
          if (savedResultData?.testResultId) {
            loadDetailFromAPI(savedResultData.testResultId);
          }
          return;
        }
      } catch (e) {
        console.error("Error reading resultData from sessionStorage:", e);
      }
      message.error("Không có dữ liệu kết quả.");
      navigate("/test-list");
      return;
    }

    setResult(resultData);
    // Lưu lại resultData để hỗ trợ refresh trang kết quả
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
    
    // Tự động load detail từ API khi có testResultId (CHỈ CHO L&R)
    // Nếu chỉ có S&W thì không cần load detail từ API L&R
    if (resultData?.testResultId) {
      // Chỉ load detail nếu có listeningScore hoặc readingScore (có L&R)
      if (resultData.listeningScore !== undefined || resultData.readingScore !== undefined) {
        loadDetailFromAPI(resultData.testResultId);
      }
      // Nếu chỉ có S&W, không cần load detail từ API L&R
      // Không gọi loadReports ở đây, sẽ gọi sau khi questionRowsBySection có dữ liệu
    }
  }, [resultData, autoSubmit, navigate, loadDetailFromAPI]);


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

    detailData.parts.forEach((part) => {
      part.testQuestions?.forEach((tq) => {
        // Xử lý single question
        if (!tq.isGroup && tq.questionSnapshotDto) {
          const qs = tq.questionSnapshotDto;
          const userAnswer = qs.userAnswer || "";
          
          // CHỈ thêm vào danh sách nếu có userAnswer (đã trả lời)
          if (userAnswer !== null && userAnswer !== undefined && userAnswer.trim() !== "") {
            const correctAnswer = qs.options?.find((o) => o.isCorrect)?.label || "";
            const isCorrect = qs.isCorrect !== null ? qs.isCorrect : userAnswer === correctAnswer;

            const row = {
              key: tq.testQuestionId,
              testQuestionId: tq.testQuestionId, // Thêm testQuestionId để dùng cho report
              index: globalIndex++,
              partId: qs.partId || part.partId,
              partTitle: part.partName || `Part ${qs.partId || part.partId}`,
              question: qs.content || "",
              passage: null,
              userAnswer,
              correctAnswer,
              isCorrect,
              imageUrl: qs.imageUrl,
              explanation: qs.explanation,
              options: qs.options || [], // Lưu tất cả các options để hiển thị
            };

            rows.all.push(row);
            if (row.partId >= 1 && row.partId <= 4) rows.listening.push(row);
            if (row.partId >= 5 && row.partId <= 7) rows.reading.push(row);
          }
        }

        // Xử lý group question
        if (tq.isGroup && tq.questionGroupSnapshotDto) {
          const group = tq.questionGroupSnapshotDto;
          group.questionSnapshots?.forEach((qs, idx) => {
            const userAnswer = qs.userAnswer || "";
            
            // CHỈ thêm vào danh sách nếu có userAnswer (đã trả lời)
            if (userAnswer !== null && userAnswer !== undefined && userAnswer.trim() !== "") {
              const correctAnswer = qs.options?.find((o) => o.isCorrect)?.label || "";
              const isCorrect = qs.isCorrect !== null ? qs.isCorrect : userAnswer === correctAnswer;

              const row = {
                key: `${tq.testQuestionId}_${idx}`,
                testQuestionId: tq.testQuestionId, // Thêm testQuestionId để dùng cho report
                subQuestionIndex: idx, // Lưu subQuestionIndex cho group questions
                index: globalIndex++,
                partId: qs.partId || part.partId,
                partTitle: part.partName || `Part ${qs.partId || part.partId}`,
                question: qs.content || "",
                passage: group.passage || null,
                userAnswer,
                correctAnswer,
                isCorrect,
                imageUrl: qs.imageUrl || group.imageUrl,
                explanation: qs.explanation,
                options: qs.options || [], // Lưu tất cả các options để hiển thị
              };

              rows.all.push(row);
              if (row.partId >= 1 && row.partId <= 4) rows.listening.push(row);
              if (row.partId >= 5 && row.partId <= 7) rows.reading.push(row);
            }
          });
        }
      });
    });

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
        const row = {
          key: feedback.testQuestionId || index,
          index: index++,
          testQuestionId: feedback.testQuestionId,
          partType: partType,
          score: feedback.score || 0,
          overallScore: feedback.detailedScores?.overall || 0,
          content: feedback.content || "",
          feedback: feedback, // Lưu toàn bộ feedback để hiển thị chi tiết
        };

        if (isWriting) {
          writing.push(row);
        } else if (isSpeaking) {
          speaking.push(row);
        }
      }
    });

    return { writing, speaking };
  }, [result]);

  // === LẤY ĐIỂM TỔNG TỪ API ===
  const getTotalScore = useMemo(() => {
    if (!result) return 0;
    
    // Nếu API trả về totalScore, dùng nó
    if (result.totalScore !== undefined && result.totalScore !== null) {
      return result.totalScore;
    }
    
    // Nếu API không trả totalScore, tính từ các điểm API trả về (vẫn là dữ liệu từ API)
    let total = 0;
    if (result.listeningScore !== undefined && result.listeningScore !== null) {
      total += result.listeningScore;
    }
    if (result.readingScore !== undefined && result.readingScore !== null) {
      total += result.readingScore;
    }
    if (result.writingScore !== undefined && result.writingScore !== null) {
      total += result.writingScore;
    }
    if (result.speakingScore !== undefined && result.speakingScore !== null) {
      total += result.speakingScore;
    }
    
    return total;
  }, [result]);
  
  // === TÍNH MAX ĐIỂM DỰA TRÊN CÁC PHẦN CÓ TRONG BÀI TEST ===
  const getMaxScore = useMemo(() => {
    if (!result) return 990;
    
    // Nếu API trả về maxScore hoặc totalMaxScore, dùng nó
    if (result.maxScore !== undefined && result.maxScore !== null) {
      return result.maxScore;
    }
    if (result.totalMaxScore !== undefined && result.totalMaxScore !== null) {
      return result.totalMaxScore;
    }
    
    // Tính max điểm dựa trên các phần có trong bài test
    let maxScore = 0;
    
    // Kiểm tra các phần có điểm
    const hasListening = result.listeningScore !== undefined && result.listeningScore !== null;
    const hasReading = result.readingScore !== undefined && result.readingScore !== null;
    const hasWriting = result.writingScore !== undefined && result.writingScore !== null;
    const hasSpeaking = result.speakingScore !== undefined && result.speakingScore !== null;
    
    // Tính tổng max điểm của các phần có trong bài test
    if (hasListening) maxScore += 495;
    if (hasReading) maxScore += 495;
    if (hasWriting) maxScore += 200;
    if (hasSpeaking) maxScore += 200;
    
    // Nếu không có phần nào, trả về giá trị mặc định
    return maxScore > 0 ? maxScore : 990;
  }, [result]);

  // === ANIMATION ĐIỂM SỐ ===
  useEffect(() => {
    if (!result) return;

    let target = 0;
    if (selectedSection === "overall") {
      target = getTotalScore;
    } else if (selectedSection === "listening") {
      target = result.listeningScore || 0;
    } else if (selectedSection === "reading") {
      target = getReadingScore;
    } else if (selectedSection === "writing") {
      target = result.writingScore || 0;
    } else if (selectedSection === "speaking") {
      target = result.speakingScore || 0;
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
  }, [selectedSection, result, getReadingScore, getTotalScore]);

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
        // CHỈ hiển thị Listening nếu có listeningScore trong API response
        ...(result.listeningScore !== undefined && result.listeningScore !== null
          ? [
              {
                key: "listening",
                title: "Nghe",
                score: result.listeningScore,
                max: 495,
                icon: <SoundOutlined />,
              },
            ]
          : []),
        // CHỈ hiển thị Reading nếu có readingScore trong API response
        ...(result.readingScore !== undefined && result.readingScore !== null
          ? [
              {
                key: "reading",
                title: "Đọc",
                score: result.readingScore,
                max: 495,
                icon: <ReadOutlined />,
              },
            ]
          : []),
        // CHỈ hiển thị Writing nếu có writingScore trong API response
        ...(result.writingScore !== undefined && result.writingScore !== null
          ? [
              {
                key: "writing",
                title: "Viết",
                score: result.writingScore,
                max: 200,
                icon: <FileTextOutlined />,
              },
            ]
          : []),
        // CHỈ hiển thị Speaking nếu có speakingScore trong API response
        ...(result.speakingScore !== undefined && result.speakingScore !== null
          ? [
              {
                key: "speaking",
                title: "Nói",
                score: result.speakingScore,
                max: 200,
                icon: <CustomerServiceOutlined />,
              },
            ]
          : []),
      ]
    : [];

  // === TABLE COLUMNS CHO L&R ===
  const columns = [
    { title: "STT", dataIndex: "index", width: 80, align: "center" },
    {
      title: "Câu hỏi",
      dataIndex: "question",
      render: (text, row) => (
        <div>
          {row.passage && (
            <div style={{ fontStyle: "italic", color: "#666", marginBottom: 6 }}>
              {row.passage}
            </div>
          )}
          <div>{text}</div>
        </div>
      ),
    },
    {
      title: "Đáp án của bạn",
      dataIndex: "userAnswer",
      width: 160,
      render: (v, row) => (
        <Text style={{ color: row.isCorrect ? "#52c41a" : "#f5222d", fontWeight: "bold" }}>
          {v || "—"}
        </Text>
      ),
    },
    { title: "Đáp án đúng", dataIndex: "correctAnswer", width: 140 },
    {
      title: "Kết quả",
      dataIndex: "isCorrect",
      width: 120,
      render: (val) => (
        <Tag color={val ? "success" : "error"}>{val ? "Đúng" : "Sai"}</Tag>
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
    { title: "STT", dataIndex: "index", width: 80, align: "center" },
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

  // === CHƯA TRẢ LỜI GÌ ===
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
            <Button onClick={handleRetakeTest} ghost>
              Làm lại bài thi
            </Button>
          </div>
          <div className={styles.content} style={{ textAlign: "center", padding: 60 }}>
            <Title level={1} style={{ color: "#fa8c16", margin: 0 }}>
              0
            </Title>
            <Text strong style={{ fontSize: 18 }}>
              Bạn chưa trả lời câu nào
            </Text>
            <br />
            <Text type="secondary">
              Hệ thống không tính điểm khi chưa chọn đáp án.
            </Text>
            <br />
            <br />
            <Button type="primary" size="large" onClick={handleRetakeTest}>
              Quay lại làm bài
            </Button>
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
              TOEIC Test Results
            </Title>
          </div>
          <Button onClick={handleRetakeTest} ghost>
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
              <Title level={1} style={{ color: "#fa8c16", margin: 0 }}>
                {displayScore}
              </Title>
              <Text strong>
                {selectedSection === "overall"
                  ? "Tổng điểm"
                  : selectedSection === "listening"
                  ? "Điểm nghe"
                  : selectedSection === "reading"
                  ? "Điểm đọc"
                  : selectedSection === "writing"
                  ? "Điểm viết"
                  : "Điểm nói"}
              </Text>
              <br />
              <Text type="secondary">
                Trên tổng{" "}
                {selectedSection === "overall"
                  ? getMaxScore
                  : selectedSection === "writing" || selectedSection === "speaking"
                  ? 200
                  : 495}{" "}
                điểm
              </Text>
              {/* ĐÃ XÓA: AI Evaluation */}
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
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
                            <div style={{ marginBottom: 8 }}>
                              <Text type="secondary" style={{ fontSize: 13 }}>
                                {item.content || "Không có tóm tắt"}
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
              <div style={{ marginTop: 12, fontSize: 16 }}>
                {result.listeningScore !== undefined && result.listeningScore !== null && (
                  <p>
                    <strong>Nghe:</strong> {result.listeningScore} / 495
                  </p>
                )}
                {result.readingScore !== undefined && result.readingScore !== null && (
                  <p>
                    <strong>Đọc:</strong> {getReadingScore} / 495
                  </p>
                )}
                {result.writingScore !== undefined && result.writingScore !== null && (
                  <p>
                    <strong>Viết:</strong> {result.writingScore} / 200
                  </p>
                )}
                {result.speakingScore !== undefined && result.speakingScore !== null && (
                  <p>
                    <strong>Nói:</strong> {result.speakingScore} / 200
                  </p>
                )}
                {(result.listeningScore !== undefined || result.readingScore !== undefined) && (
                  <div style={{ marginTop: 16 }}>
                    <Button
                      onClick={() => openDetailForSection("overall")}
                      type="primary"
                      loading={loadingDetail}
                    >
                      Xem tất cả câu hỏi L&R
                    </Button>
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
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
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
            const errorMsg = error?.response?.data?.message || error?.message || "Không thể gửi báo cáo";
            // Xử lý lỗi "đã báo cáo rồi" một cách thân thiện hơn
            if (errorMsg.includes("already reported") || errorMsg.includes("đã báo cáo")) {
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
            <div>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                Mô tả chi tiết:
              </Text>
              <Input.TextArea
                rows={4}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
                maxLength={500}
                showCount
              />
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
              // Tìm câu trả lời gốc từ result.questions hoặc result.answers
              let originalAnswer = null;
              
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

              return originalAnswer ? (
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
                    <Text>{originalAnswer}</Text>
                  </div>
                </div>
              ) : null;
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
            </div>
          </div>

          {normalizeTestType(retakeTestInfo?.testType || result?.testType) === "Simulator" ? (
            <Alert
              type="info"
              showIcon
              message="Chế độ Simulator"
              description="Bài thi sẽ tự động đếm ngược theo thời lượng chuẩn của đề và tự nộp khi hết giờ."
              style={{ marginBottom: 16 }}
            />
          ) : (
            <>
              <Alert
                type="info"
                showIcon
                message="Chế độ Practice"
                description="Bạn có thể luyện tập với chế độ đếm ngược theo thời gian đề (nếu bật) hoặc luyện tự do đếm thời gian lên từ 00:00."
                style={{ marginBottom: 16 }}
              />
              <div style={{ marginBottom: 12 }}>
                <Checkbox
                  checked={practiceCountdown}
                  onChange={(e) => setPracticeCountdown(e.target.checked)}
                  disabled={retakeConfirmLoading}
                >
                  Bật đếm ngược theo thời gian của đề
                </Checkbox>
                <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
                  Nếu không chọn, thời gian sẽ đếm lên từ 00:00 và bạn có thể nộp bài bất cứ lúc nào.
                </Text>
              </div>
            </>
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