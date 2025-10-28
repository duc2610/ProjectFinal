import { getPartsBySkill } from "@services/partsService";

export const PART_QUESTION_COUNT = {
    // L&R (Skill = 3)
    1: 6,   // L-Part 1 - Photographs
    2: 25,  // L-Part 2 - Question-Response
    3: 39,  // L-Part 3 - Conversations
    4: 30,  // L-Part 4 - Talks
    5: 30,  // R-Part 5 - Incomplete Sentences
    6: 16,  // R-Part 6 - Text Completion
    7: 54,  // R-Part 7 - Reading Comprehension
    // Writing (Skill = 2)
    8: 5,   // W-Part 1 - Write a sentence based on a picture
    9: 2,   // W-Part 2 - Respond to a written request
    10: 1,  // W-Part 3 - Write an opinion essay
    // Speaking (Skill = 1)
    11: 2,  // S-Part 1 - Read a text aloud
    12: 1,  // S-Part 2 - Describe a picture
    13: 3,  // S-Part 3 - Respond to questions
    14: 3,  // S-Part 4 - Respond to questions using information provided
    15: 1,  // S-Part 5 - Express an opinion
};

// Tổng số câu hỏi theo skill
export const TOTAL_QUESTIONS_BY_SKILL = {
    1: 11,   // Speaking
    2: 8,    // Writing
    3: 200,  // L&R
};

// Yêu cầu audio theo skill
export const REQUIRES_AUDIO = {
    1: false, // Speaking - không yêu cầu audio
    2: false, // Writing - không yêu cầu audio
    3: true,  // L&R - YÊU CẦU audio tổng
};

// Enum TestSkill (phải khớp với backend)
export const TEST_SKILL = {
    SPEAKING: 1,
    WRITING: 2,
    LR: 3,
};

// Enum TestType (phải khớp với backend)
export const TEST_TYPE = {
    SIMULATOR: 1,
    PRACTICE: 2,
};

/**
 * Load danh sách Parts từ backend theo Skill
 * @param {number} skill - 1: Speaking, 2: Writing, 3: L&R
 * @returns {Promise<Array>} - Danh sách parts
 */
export async function loadPartsBySkill(skill) {
    try {
        const parts = await getPartsBySkill(skill);
        return parts || [];
    } catch (error) {
        console.error("Error loading parts:", error);
        return [];
    }
}

/**
 * Validate số câu hỏi theo cấu trúc TOEIC
 * @param {number} skill - 1: Speaking, 2: Writing, 3: L&R
 * @param {Array} parts - Danh sách parts với questions
 * @returns {Object} - { valid, message, errors }
 */
export function validateTestStructure(skill, parts) {
    if (!TOTAL_QUESTIONS_BY_SKILL[skill]) {
        return { valid: false, message: "Skill không hợp lệ", errors: ["Skill không hợp lệ"] };
    }

    const errors = [];
    
    // Tính tổng số câu hỏi
    const totalQuestions = parts.reduce((sum, part) => {
        const partQuestions = (part.groups || []).reduce((pSum, g) => pSum + (g.questions || []).length, 0) 
                            + (part.questions || []).length;
        return sum + partQuestions;
    }, 0);

    const expectedTotal = TOTAL_QUESTIONS_BY_SKILL[skill];
    if (totalQuestions !== expectedTotal) {
        errors.push(`Tổng số câu hỏi phải là ${expectedTotal} (hiện tại: ${totalQuestions})`);
    }

    // Validate từng part
    parts.forEach(part => {
        const expectedCount = PART_QUESTION_COUNT[part.partId];
        if (!expectedCount) {
            errors.push(`Part ${part.partId} không hợp lệ`);
            return;
        }

        const actualCount = (part.groups || []).reduce((sum, g) => sum + (g.questions || []).length, 0) 
                          + (part.questions || []).length;
        
        if (actualCount !== expectedCount) {
            errors.push(`Part ${part.partId} phải có ${expectedCount} câu (hiện tại: ${actualCount})`);
        }
    });

    return {
        valid: errors.length === 0,
        message: errors.length > 0 ? errors.join("; ") : "Hợp lệ",
        errors
    };
}

/**
 * Kiểm tra xem skill có yêu cầu audio không
 * @param {number} skill
 * @returns {boolean}
 */
export function requiresAudio(skill) {
    return REQUIRES_AUDIO[skill] || false;
}
