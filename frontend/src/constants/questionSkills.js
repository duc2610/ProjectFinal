/**
 * Enum Question Skills (phải khớp với backend)
 * Dùng cho quản lý câu hỏi (Question), khác với TEST_SKILL dùng cho bài thi (Test)
 */
export const QUESTION_SKILL = {
  SPEAKING: 1,
  WRITING: 2,
  LISTENING: 3,
  READING: 4,
};

/**
 * Mapping: Skill ID → Skill Name (English)
 */
export const QUESTION_SKILL_NAME = {
  [QUESTION_SKILL.SPEAKING]: "Speaking",
  [QUESTION_SKILL.WRITING]: "Writing",
  [QUESTION_SKILL.LISTENING]: "Listening",
  [QUESTION_SKILL.READING]: "Reading",
};

/**
 * Mapping: Skill Name (Vietnamese) → Skill ID
 */
export const QUESTION_SKILL_LABELS = {
  [QUESTION_SKILL.SPEAKING]: "Nói",
  [QUESTION_SKILL.WRITING]: "Viết",
  [QUESTION_SKILL.LISTENING]: "Nghe",
  [QUESTION_SKILL.READING]: "Đọc",
};

/**
 * Reverse mapping: Skill Name (string) → Skill ID (number)
 * Hỗ trợ nhiều format: "Listening", "listening", "L", "l"
 */
export const QUESTION_SKILL_NAME_TO_ID = {
  "speaking": QUESTION_SKILL.SPEAKING,
  "s": QUESTION_SKILL.SPEAKING,
  "writing": QUESTION_SKILL.WRITING,
  "w": QUESTION_SKILL.WRITING,
  "listening": QUESTION_SKILL.LISTENING,
  "l": QUESTION_SKILL.LISTENING,
  "reading": QUESTION_SKILL.READING,
  "r": QUESTION_SKILL.READING,
};

/**
 * Danh sách skills để hiển thị trong dropdown/select
 */
export const QUESTION_SKILLS_LIST = [
  { value: QUESTION_SKILL.LISTENING, label: QUESTION_SKILL_LABELS[QUESTION_SKILL.LISTENING] },
  { value: QUESTION_SKILL.READING, label: QUESTION_SKILL_LABELS[QUESTION_SKILL.READING] },
  { value: QUESTION_SKILL.SPEAKING, label: QUESTION_SKILL_LABELS[QUESTION_SKILL.SPEAKING] },
  { value: QUESTION_SKILL.WRITING, label: QUESTION_SKILL_LABELS[QUESTION_SKILL.WRITING] },
];

/**
 * Chuyển đổi skill name (string) sang skill ID (number)
 * @param {string|number} skillName - Tên skill hoặc ID skill
 * @returns {number|undefined} Skill ID hoặc undefined nếu không hợp lệ
 */
export const skillNameToId = (skillName) => {
  if (skillName === undefined || skillName === null || skillName === "") {
    return undefined;
  }
  
  // Nếu đã là number, trả về luôn
  if (typeof skillName === "number") {
    return Object.values(QUESTION_SKILL).includes(skillName) ? skillName : undefined;
  }
  
  // Chuyển sang string và lowercase
  const skillStr = String(skillName).toLowerCase().trim();
  
  // Tìm trong mapping
  // Ưu tiên tìm exact match, sau đó tìm startsWith
  if (QUESTION_SKILL_NAME_TO_ID[skillStr]) {
    return QUESTION_SKILL_NAME_TO_ID[skillStr];
  }
  
  // Tìm theo ký tự đầu tiên (fallback)
  if (skillStr.startsWith("l")) return QUESTION_SKILL.LISTENING;
  if (skillStr.startsWith("r")) return QUESTION_SKILL.READING;
  if (skillStr.startsWith("s")) return QUESTION_SKILL.SPEAKING;
  if (skillStr.startsWith("w")) return QUESTION_SKILL.WRITING;
  
  return undefined;
};

/**
 * Suy luận skill từ part name
 * Ví dụ: "Listening-Part1" → QUESTION_SKILL.LISTENING
 * @param {string} partName - Tên part
 * @returns {number|undefined} Skill ID hoặc undefined
 */
export const inferSkillFromPartName = (partName) => {
  if (!partName) return undefined;
  const firstPart = String(partName).split("-")[0];
  return skillNameToId(firstPart);
};

/**
 * Chuyển đổi skill ID sang skill name (English)
 * @param {number} skillId - Skill ID
 * @returns {string|undefined} Skill name hoặc undefined
 */
export const skillIdToName = (skillId) => {
  return QUESTION_SKILL_NAME[skillId];
};

/**
 * Chuyển đổi skill ID sang label (Vietnamese)
 * @param {number} skillId - Skill ID
 * @returns {string|undefined} Skill label hoặc undefined
 */
export const skillIdToLabel = (skillId) => {
  return QUESTION_SKILL_LABELS[skillId];
};

