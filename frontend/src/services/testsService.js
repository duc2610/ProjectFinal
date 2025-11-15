import { api } from "./apiClient";

const buildLookup = (entries) => {
  const map = new Map();
  entries.forEach(([key, value]) => {
    map.set(String(key).toLowerCase(), value);
  });
  return map;
};

const CREATION_STATUS_LOOKUP = buildLookup([
  ["draft", "Draft"],
  ["inprogress", "InProgress"],
  ["in_progress", "InProgress"],
  ["completed", "Completed"],
  ["0", "Draft"],
  ["1", "InProgress"],
  ["2", "Completed"],
]);

const VISIBILITY_STATUS_LOOKUP = buildLookup([
  ["hidden", "Hidden"],
  ["hide", "Hidden"],
  ["inactive", "Hidden"],
  ["published", "Published"],
  ["active", "Published"],
  ["0", "Hidden"],
  ["-1", "Hidden"],
  ["1", "Published"],
]);

const LEGACY_STATUS_LOOKUP = buildLookup([
  ["-1", "Hidden"],
  ["hidden", "Hidden"],
  ["hide", "Hidden"],
  ["inactive", "Hidden"],
  ["0", "Draft"],
  ["draft", "Draft"],
  ["1", "InProgress"],
  ["inprogress", "InProgress"],
  ["in_progress", "InProgress"],
  ["2", "Completed"],
  ["completed", "Completed"],
  ["3", "Published"],
  ["published", "Published"],
  ["active", "Published"],
]);

const normalizeEnumValue = (value, lookup) => {
  if (value === undefined || value === null) return undefined;
  const key = String(value).toLowerCase();
  return lookup.get(key) ?? (typeof value === "string" ? value : undefined);
};

const deriveLegacyStatus = (creationStatus, visibilityStatus, statusValue) => {
  const normalizedStatus = normalizeEnumValue(statusValue, LEGACY_STATUS_LOOKUP);
  if (normalizedStatus) return normalizedStatus;

  if (visibilityStatus === "Published") return "Published";
  if (visibilityStatus === "Hidden") return "Hidden";

  if (creationStatus === "Completed") return "Completed";
  if (creationStatus === "InProgress") return "InProgress";
  if (creationStatus === "Draft") return "Draft";

  return undefined;
};

const normalizeTestRecord = (record) => {
  if (!record || typeof record !== "object") return record;

  const creationRaw = record.creationStatus ?? record.CreationStatus;
  const visibilityRaw = record.visibilityStatus ?? record.VisibilityStatus;

  const creationStatus = normalizeEnumValue(creationRaw, CREATION_STATUS_LOOKUP);
  const visibilityStatus = normalizeEnumValue(visibilityRaw, VISIBILITY_STATUS_LOOKUP);
  const legacyStatus = deriveLegacyStatus(creationStatus, visibilityStatus, record.status ?? record.Status);

  const normalized = { ...record };

  if (creationStatus) normalized.creationStatus = creationStatus;
  if (visibilityStatus) normalized.visibilityStatus = visibilityStatus;
  if (legacyStatus) {
    normalized.status = legacyStatus;
  } else if (!normalized.status) {
    normalized.status = "Draft";
  }

  return normalized;
};

const normalizeCollection = (data) => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(normalizeTestRecord);
  }

  if (typeof data === "object") {
    let updated = false;
    const normalized = { ...data };
    const collectionKeys = [
      "dataPaginated",
      "DataPaginated",
      "items",
      "Items",
      "results",
      "Results",
      "tests",
      "Tests",
      "list",
      "List",
      "data",
      "Data",
    ];

    collectionKeys.forEach((key) => {
      if (Array.isArray(normalized[key])) {
        normalized[key] = normalized[key].map(normalizeTestRecord);
        updated = true;
      }
    });

    return updated ? normalized : data;
  }

  return data;
};

export async function getTests(params = {}) {
  const res = await api.get("/api/tests", { params });
  const raw = res?.data ?? res;
  if (raw && typeof raw === "object") {
    const dataKey = raw.data !== undefined ? "data" : raw.Data !== undefined ? "Data" : null;
    if (dataKey) {
      const normalizedData = normalizeCollection(raw[dataKey]);
      if (normalizedData !== raw[dataKey]) {
        return { ...raw, [dataKey]: normalizedData };
      }
      return raw;
    }
  }
  return normalizeCollection(raw);
}

export async function getPracticeTests(testResultId = null) {
  const params = testResultId ? { testResultId } : {};
  const res = await api.get("/api/tests/examinee/list/practice", { params });
  const raw = res?.data?.data ?? res?.data ?? res;
  return normalizeCollection(raw);
}

export async function getSimulatorTests(testResultId = null) {
  const params = testResultId ? { testResultId } : {};
  const res = await api.get("/api/tests/examinee/list/simulator", { params });
  const raw = res?.data?.data ?? res?.data ?? res;
  return normalizeCollection(raw);
}

export async function getTestById(id) {
  const res = await api.get(`/api/tests/${id}`);
  const raw = res?.data?.data ?? res?.data;
  return normalizeTestRecord(raw);
}

export async function getTestHistory() {
  const res = await api.get("/api/tests/history");
  const raw = res?.data?.data ?? res?.data ?? [];
  return normalizeCollection(raw);
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
    TestType: data.testType || 2, // Practice = 2
    TestSkill: data.testSkill,
    Description: data.description || null,
    Duration: data.duration,
    SingleQuestionIds: Array.isArray(data.singleQuestionIds) ? data.singleQuestionIds : [],
    GroupQuestionIds: Array.isArray(data.groupQuestionIds) ? data.groupQuestionIds : [],
  };
  try {
    const res = await api.put(`/api/tests/from-bank/${id}`, payload);
    return res?.data?.data ?? res?.data;
  } catch (error) {
    console.error("Error message:", error?.message);
    throw error;
  }
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
  const raw = res?.data?.data ?? res?.data ?? res;
  return normalizeCollection(raw);
}

export const TEST_TYPE = {
  SIMULATOR: 1,
  PRACTICE: 2,
};

export const TEST_SKILL = {
  SPEAKING: 1,
  WRITING: 2,
  LR: 3,
  SW: 4,
};

export const TEST_STATUS = {
  HIDDEN: -1,
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
  4: "S&W",
};

export const TEST_STATUS_LABELS = {
  "-1": "Hidden",
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

// Download Excel template for S&W test (Speaking & Writing)
export async function downloadTemplateSW() {
  const res = await api.get("/api/tests/download-template-sw", {
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

// Import S&W test from Excel file (Speaking & Writing only, no audio needed)
export async function importTestSWFromExcel(excelFile) {
  const formData = new FormData();
  formData.append("ExcelFile", excelFile);
  
  // apiClient will automatically handle FormData and remove Content-Type header
  const res = await api.post("/api/tests/import-excel-sw", formData);
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

