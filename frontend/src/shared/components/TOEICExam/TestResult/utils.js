import React from "react";
import {
  SoundOutlined,
  ReadOutlined,
  EditOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";

export const EMPTY_LR_MESSAGE =
  "Không có câu trả lời cho phần này. Có thể bạn chưa làm hoặc dữ liệu chưa được ghi nhận.";

export const SCORE_META = [
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

export const SW_PART_TYPE_MAP = {
  8: "writing_sentence",
  9: "writing_email",
  10: "writing_essay",
  11: "speaking_read_aloud",
  12: "speaking_describe_picture",
  13: "speaking_respond_questions",
  14: "speaking_respond_questions_info",
  15: "speaking_express_opinion",
};

export const SW_PART_ORDER = {
  writing_sentence: 1,
  writing_email: 2,
  writing_essay: 3,
  speaking_read_aloud: 4,
  speaking_describe_picture: 5,
  speaking_respond_questions: 6,
  speaking_respond_questions_info: 7,
  speaking_express_opinion: 8,
};

export const normalizeTestType = (value) => {
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower.includes("practice") || lower.includes("luyện")) return "Practice";
    return "Simulator";
  }
  if (value === 2) return "Practice";
  return "Simulator";
};

export const normalizeTestSkill = (value) => {
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

export const normalizeNumber = (value) => {
  if (value === undefined || value === null) return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

export const getSwPartDisplayName = (partType = "") => {
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

export const formatQuestionText = (text) => {
  if (typeof text !== "string") return text || "";
  return text.replace(/\r\n/g, "\n");
};

export const resolveSwPartType = (feedback = {}) => {
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

export const inferSkillGroup = (skill) => {
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

export const buildQuestions = (parts = []) => {
  const questions = [];
  let globalIndex = 1;

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

