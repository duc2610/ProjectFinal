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
    12: 2,  // S-Part 2 - Describe a picture
    13: 3,  // S-Part 3 - Respond to questions
    14: 3,  // S-Part 4 - Respond to questions using information provided
    15: 1,  // S-Part 5 - Express an opinion
};

// Tổng số câu hỏi theo skill
export const TOTAL_QUESTIONS_BY_SKILL = {
    1: 11,   // Speaking (2+2+3+3+1 = 11)
    2: 8,    // Writing
    3: 200,  // L&R
    4: 219,  // FourSkills (L+R+W+S: 200+8+11 = 219)
};

// Yêu cầu audio theo skill
export const REQUIRES_AUDIO = {
    1: false, // Speaking - không yêu cầu audio
    2: false, // Writing - không yêu cầu audio
    3: true,  // L&R - YÊU CẦU audio tổng
    4: true,  // FourSkills - YÊU CẦU audio tổng
};

// Enum TestSkill (phải khớp với backend)
export const TEST_SKILL = {
    SPEAKING: 1,
    WRITING: 2,
    LR: 3,
    FOUR_SKILLS: 4, // L+R+W+S (219 questions total)
};

// Enum TestType (phải khớp với backend)
export const TEST_TYPE = {
    SIMULATOR: 1,
    PRACTICE: 2,
};

export async function loadPartsBySkill(skill) {
    try {
        let parts = [];
        if (skill === TEST_SKILL.LR) {
            // L&R bao gồm cả Listening (skill=3) và Reading (skill=4)
            const listeningParts = await getPartsBySkill(3); // Listening = 3
            const readingParts = await getPartsBySkill(4); // Reading = 4
            parts = [...(listeningParts || []), ...(readingParts || [])];
        } else if (skill === TEST_SKILL.FOUR_SKILLS) {
            // FourSkills bao gồm tất cả 15 parts: L&R (7 parts) + Writing (3 parts) + Speaking (5 parts)
            const listeningParts = await getPartsBySkill(3); // Listening = 3
            const readingParts = await getPartsBySkill(4); // Reading = 4
            const writingParts = await getPartsBySkill(2); // Writing = 2
            const speakingParts = await getPartsBySkill(1); // Speaking = 1
            parts = [
                ...(listeningParts || []), 
                ...(readingParts || []), 
                ...(writingParts || []), 
                ...(speakingParts || [])
            ];
        } else if (skill === TEST_SKILL.SPEAKING) {
            parts = await getPartsBySkill(1); // Speaking = 1
        } else if (skill === TEST_SKILL.WRITING) {
            parts = await getPartsBySkill(2); // Writing = 2
        }
        return parts || [];
    } catch (error) {
        console.error("Error loading parts:", error);
        return [];
    }
}


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


export function requiresAudio(skill) {
    return REQUIRES_AUDIO[skill] || false;
}


export function supportsQuestionGroups(partId) {
    // Part 3, 4, 6, 7 (L&R) hỗ trợ question groups
    // Part 1, 2, 5 (L&R) chỉ có single questions
    // Speaking và Writing parts có thể có groups tùy vào cấu trúc
    const partsWithGroups = [3, 4, 6, 7]; // L&R parts có groups
    return partsWithGroups.includes(partId);
}


export function getOptionCountForPart(partId) {
    // Part 2 (Question-Response) chỉ có 3 đáp án (A, B, C)
    // Các part khác có 4 đáp án (A, B, C, D)
    return partId === 2 ? 3 : 4;
}


export function createDefaultOptions(partId) {
    const count = getOptionCountForPart(partId);
    const labels = ['A', 'B', 'C', 'D'];
    return labels.slice(0, count).map(label => ({
        label,
        content: "",
        isCorrect: false,
    }));
}

export function requiresImage(partId, skill) {
    // Parts bắt buộc phải có ảnh
    const mandatoryImageParts = [1, 8, 12]; // L&R Part 1, Writing Part 1, Speaking Part 2
    
    if (mandatoryImageParts.includes(partId)) {
        return { required: true, show: true };
    }
    
    // Các part L&R khác có thể có ảnh (tùy chọn)
    if (skill === 3 && partId >= 1 && partId <= 7) {
        return { required: false, show: true };
    }
    
    // Writing và Speaking parts khác KHÔNG cần ảnh - ẩn hoàn toàn
    return { required: false, show: false };
}