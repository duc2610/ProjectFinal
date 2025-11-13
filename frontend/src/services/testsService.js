import { api } from "./apiClient";

export async function getTests(params = {}) {
  const res = await api.get("/api/tests", { params });
  // Backend returns: { statusCode, message, data: { dataPaginated, ... }, success }
  return res?.data ?? res;
}

export async function getPracticeTests(testResultId = null) {
  const params = testResultId ? { testResultId } : {};
  const res = await api.get("/api/tests/examinee/list/practice", { params });
  return res?.data?.data ?? res?.data ?? res;
}

export async function getSimulatorTests(testResultId = null) {
  const params = testResultId ? { testResultId } : {};
  const res = await api.get("/api/tests/examinee/list/simulator", { params });
  return res?.data?.data ?? res?.data ?? res;
}

export async function getTestById(id) {
  const res = await api.get(`/api/tests/${id}`);
  return res?.data?.data ?? res?.data;
}

export async function getTestHistory() {
  const res = await api.get("/api/tests/history");
  return res?.data?.data ?? res?.data ?? [];
}


export async function createTestFromBank(data) {
  const payload = {
    Title: data.title,
    TestSkill: data.testSkill,
    Description: data.description || null,
    Duration: data.duration,
    SingleQuestionIds: data.singleQuestionIds || [],
    GroupQuestionIds: data.groupQuestionIds || [],
  };
  const res = await api.post("/api/tests/from-bank", payload);
  return res?.data?.data ?? res?.data;
}


export async function createTestFromBankRandom(data) {
  const res = await api.post("/api/tests/from-bank/random", data);
  return res?.data?.data ?? res?.data;
}

export async function createTestManual(data) {
  // Transform to PascalCase for backend
  const payload = {
    Title: data.title,
    TestType: data.testType,
    TestSkill: data.testSkill,
    Description: data.description || null,
    AudioUrl: data.audioUrl || null,
    Parts: (data.parts || []).map(part => ({
      PartId: part.partId,
      Groups: (part.groups || []).map(group => ({
        Passage: group.passage || null,
        ImageUrl: group.imageUrl || null,
        Questions: (group.questions || []).map(q => ({
          Content: q.content || null,
          ImageUrl: q.imageUrl || null,
          Options: (q.options || []).map(opt => ({
            Label: opt.label,
            Content: opt.content || null,
            IsCorrect: opt.isCorrect || false,
          })),
          Explanation: q.explanation || null,
        })),
      })),
      Questions: (part.questions || []).map(q => ({
        Content: q.content || null,
        ImageUrl: q.imageUrl || null,
        Options: (q.options || []).map(opt => ({
          Label: opt.label,
          Content: opt.content || null,
          IsCorrect: opt.isCorrect || false,
        })),
        Explanation: q.explanation || null,
      })),
    })),
  };
  
  const res = await api.post("/api/tests/manual", payload);
  return res?.data?.data ?? res?.data;
}

export async function updateTestManual(id, data) {
  // Transform to PascalCase for backend
  const payload = {
    Title: data.title,
    TestType: data.testType,
    TestSkill: data.testSkill,
    Description: data.description || null,
    AudioUrl: data.audioUrl || null,
    Parts: (data.parts || []).map(part => ({
      PartId: part.partId,
      Groups: (part.groups || []).map(group => ({
        Passage: group.passage || null,
        ImageUrl: group.imageUrl || null,
        Questions: (group.questions || []).map(q => ({
          Content: q.content || null,
          ImageUrl: q.imageUrl || null,
          Options: (q.options || []).map(opt => ({
            Label: opt.label,
            Content: opt.content || null,
            IsCorrect: opt.isCorrect || false,
          })),
          Explanation: q.explanation || null,
        })),
      })),
      Questions: (part.questions || []).map(q => ({
        Content: q.content || null,
        ImageUrl: q.imageUrl || null,
        Options: (q.options || []).map(opt => ({
          Label: opt.label,
          Content: opt.content || null,
          IsCorrect: opt.isCorrect || false,
        })),
        Explanation: q.explanation || null,
      })),
    })),
  };
  
  const res = await api.put(`/api/tests/manual/${id}`, payload);
  return res?.data?.data ?? res?.data;
}

export async function updateTestFromBank(id, data) {
  const payload = {
    Title: data.title,
    TestSkill: data.testSkill,
    Description: data.description || null,
    Duration: data.duration,
    SingleQuestionIds: data.singleQuestionIds || [],
    GroupQuestionIds: data.groupQuestionIds || [],
  };
  const res = await api.put(`/api/tests/from-bank/${id}`, payload);
  return res?.data?.data ?? res?.data;
}
export async function hideTest(id) {
  const res = await api.put(`/api/tests/hide/${id}`);
  return res?.data?.data ?? res?.data;
}

export async function publishTest(id) {
  const res = await api.put(`/api/tests/public/${id}`);
  return res?.data?.data ?? res?.data;
}

export async function getTestVersions(parentTestId) {
  const res = await api.get(`/api/tests/versions/${parentTestId}`);
  return res?.data?.data ?? res?.data;
}

export const TEST_TYPE = {
  SIMULATOR: 1,
  PRACTICE: 2,
};

export const TEST_SKILL = {
  SPEAKING: 1,
  WRITING: 2,
  LR: 3,
  FOUR_SKILLS: 4,
};

export const TEST_STATUS = {
  HIDE: -1,
  DRAFT: 0,
  INPROGRESS: 1,
  COMPLETED: 2,
  PUBLISHED: 3,
};

export const TEST_TYPE_LABELS = {
  1: "Simulator",
  2: "Practice",
};

export const TEST_SKILL_LABELS = {
  1: "Speaking",
  2: "Writing",
  3: "Listening & Reading",
  4: "Four Skills",
};

export const TEST_STATUS_LABELS = {
  "-1": "Hide",
  0: "Draft",
  1: "InProgress",
  2: "Completed",
  3: "Published",
};

export const TEST_STATUS_COLORS = {
  "-1": "default",
  0: "warning",
  1: "processing",
  2: "success",
  3: "success",
};

// Download Excel template for L&R test
export async function downloadTemplate() {
  const res = await api.get("/api/tests/download-template", {
    responseType: "blob",
  });
  return res.data;
}

// Download Excel template for 4-skills test (L+R+W+S)
export async function downloadTemplate4Skills() {
  const res = await api.get("/api/tests/download-template-4skills", {
    responseType: "blob",
  });
  return res.data;
}

// Import test from Excel file (L&R)
export async function importTestFromExcel(excelFile, audioFile) {
  const formData = new FormData();
  formData.append("ExcelFile", excelFile);
  formData.append("AudioFile", audioFile);
  
  // apiClient will automatically handle FormData and remove Content-Type header
  const res = await api.post("/api/tests/import-excel", formData);
  return res?.data?.data ?? res?.data;
}

// Import 4-skills test from Excel file
export async function importTest4SkillsFromExcel(excelFile, audioFile) {
  const formData = new FormData();
  formData.append("ExcelFile", excelFile);
  formData.append("AudioFile", audioFile);
  
  // apiClient will automatically handle FormData and remove Content-Type header
  const res = await api.post("/api/tests/import-excel-4skills", formData);
  return res?.data?.data ?? res?.data;
}

// Create draft test (empty test with Draft status)
export async function createTestDraft(data) {
  const payload = {
    Title: data.title,
    Description: data.description || null,
    AudioUrl: data.audioUrl || null,
    TestSkill: data.testSkill,
  };
  const res = await api.post("/api/tests/draft", payload);
  return res?.data?.data ?? res?.data;
}

// Save or update a part of a test
export async function saveTestPart(testId, partId, partData) {
  let normalizedTestId = testId;
  if (typeof testId === 'object' && testId !== null) {
    normalizedTestId = testId.id || testId.testId || testId.Id || testId.TestId;
  }
  
  if (typeof normalizedTestId === 'string') {

    const numberMatch = normalizedTestId.match(/\d+/);
    if (numberMatch) {
      normalizedTestId = Number(numberMatch[0]);
    } else if (!/^\d+$/.test(normalizedTestId)) {
      throw new Error(`Invalid testId format: ${JSON.stringify(testId)}`);
    } else {
      // Nếu là string số thuần, convert sang number
      normalizedTestId = Number(normalizedTestId);
    }
  }
  
  // Đảm bảo testId là số hợp lệ
  if (!normalizedTestId || typeof normalizedTestId !== 'number' || isNaN(normalizedTestId)) {
    throw new Error(`Invalid testId: ${JSON.stringify(testId)}`);
  }
  
  // Convert to string để đảm bảo URL đúng format
  normalizedTestId = String(normalizedTestId);
  
  // Validate partId
  if (!partId || (typeof partId !== 'number' && typeof partId !== 'string')) {
    throw new Error(`Invalid partId: ${JSON.stringify(partId)}`);
  }
  const normalizedPartId = String(partId);
  
  // Transform to PascalCase for backend
  const payload = {
    PartId: partId,
    Groups: (partData.groups || []).map(group => ({
      Passage: group.passage || null,
      ImageUrl: group.imageUrl || null,
      Questions: (group.questions || []).map(q => ({
        Content: q.content || null,
        ImageUrl: q.imageUrl || null,
        Options: (q.options || []).map(opt => ({
          Label: opt.label,
          Content: opt.content || null,
          IsCorrect: opt.isCorrect || false,
        })),
        Explanation: q.explanation || null,
      })),
    })),
    Questions: (partData.questions || []).map(q => ({
      Content: q.content || null,
      ImageUrl: q.imageUrl || null,
      Options: (q.options || []).map(opt => ({
        Label: opt.label,
        Content: opt.content || null,
        IsCorrect: opt.isCorrect || false,
      })),
      Explanation: q.explanation || null,
    })),
  };
  
  const url = `/api/tests/${normalizedTestId}/parts/${normalizedPartId}`;
  const res = await api.post(url, payload);
  return res?.data?.data ?? res?.data;
}

// Finalize test (validate and mark as Completed)
export async function finalizeTest(testId) {
  const res = await api.patch(`/api/tests/${testId}/finalize`);
  return res?.data?.data ?? res?.data;
}

// Get list of saved parts for a test (optional API)
export async function getTestParts(testId) {
  const res = await api.get(`/api/tests/${testId}/parts`);
  return res?.data?.data ?? res?.data ?? [];
}

