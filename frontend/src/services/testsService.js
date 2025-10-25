import { api } from "./apiClient";

export async function getTests(params = {}) {
  const res = await api.get("/api/tests", { params });
  // Backend returns: { statusCode, message, data: { dataPaginated, ... }, success }
  return res?.data ?? res;
}

export async function getTestById(id) {
  const res = await api.get(`/api/tests/${id}`);
  return res?.data?.data ?? res?.data;
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
};

export const TEST_STATUS = {
  INACTIVE: -1,
  DRAFT: 0,
  ACTIVE: 1,
};

export const TEST_TYPE_LABELS = {
  1: "Simulator",
  2: "Practice",
};

export const TEST_SKILL_LABELS = {
  1: "Speaking",
  2: "Writing",
  3: "Listening & Reading",
};

export const TEST_STATUS_LABELS = {
  "-1": "Inactive",
  0: "Draft",
  1: "Active",
};

export const TEST_STATUS_COLORS = {
  "-1": "default",
  0: "warning",
  1: "success",
};

