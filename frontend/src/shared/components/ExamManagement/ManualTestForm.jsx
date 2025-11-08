import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, message, Tabs, Collapse, Space, Tag, Row, Col, Statistic, Upload, Alert } from "antd";
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined, UploadOutlined, PictureOutlined } from "@ant-design/icons";
import { createTestManual, getTestById, updateTestManual } from "@services/testsService";
import { uploadFile } from "@services/filesService";
import { loadPartsBySkill, TOTAL_QUESTIONS_BY_SKILL, TEST_SKILL, PART_QUESTION_COUNT, validateTestStructure, requiresAudio, supportsQuestionGroups, createDefaultOptions, requiresImage } from "@shared/constants/toeicStructure";
import { TEST_TYPE } from "@shared/constants/toeicStructure";

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

// Helper function để kiểm tra partId có phải là Writing hoặc Speaking part không
const isWritingOrSpeakingPart = (partId) => {
    // Writing parts: 8, 9, 10
    // Speaking parts: 11, 12, 13, 14, 15
    return (partId >= 8 && partId <= 10) || (partId >= 11 && partId <= 15);
};

export default function ManualTestForm({ open, onClose, onSuccess, editingId = null, readOnly = false }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [parts, setParts] = useState([]);
    const [partsData, setPartsData] = useState({}); // { partId: { groups: [], questions: [] } }
    const [activePartTab, setActivePartTab] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);

    const toSkillId = (val) => {
        if (val == null) return undefined;
        if (typeof val === "number") return val;
        const s = String(val).toLowerCase();
        if (s === "3" || s.includes("lr") || s.includes("listening")) return TEST_SKILL.LR;
        if (s === "4" || s.includes("four") || s.includes("4skills") || s.includes("4-skills")) return TEST_SKILL.FOUR_SKILLS;
        if (s === "1" || s.includes("speaking")) return TEST_SKILL.SPEAKING;
        if (s === "2" || s.includes("writing")) return TEST_SKILL.WRITING;
        const n = Number(val);
        return Number.isFinite(n) ? n : undefined;
    };

    useEffect(() => {
        if (!open) return;
        form.resetFields();
        setParts([]);
        setPartsData({});
        setAudioUrl(null);

        const loadForEdit = async (id) => {
            try {
                const detail = await getTestById(id);
                const d = detail?.data || detail || {};
                const skillVal = toSkillId(d.testSkill ?? d.TestSkill);
                const titleVal = d.title ?? d.Title;
                const descVal = d.description ?? d.Description;
                const audioVal = d.audioUrl ?? d.AudioUrl;

                setSelectedSkill(skillVal);
                setAudioUrl(audioVal);
                form.setFieldsValue({
                    title: titleVal,
                    description: descVal,
                    skill: skillVal,
                });

                const loadedParts = await loadPartsBySkill(skillVal);
                setParts(loadedParts);

                // Parse parts data từ detail
                const partsArr = d.parts || d.Parts || [];
                console.log("=== DỮ LIỆU TỪ API ===");
                console.log(`API trả về ${partsArr.length} parts`);
                partsArr.forEach((p, idx) => {
                    const partId = p.partId || p.PartId;
                    const tqs = p.testQuestions || p.TestQuestions || [];
                    const groupCount = tqs.filter(tq => (tq.isGroup ?? tq.IsGroup) === true).length;
                    const singleCount = tqs.filter(tq => (tq.isGroup ?? tq.IsGroup) === false).length;
                    console.log(`Part ${partId} (index ${idx}): ${tqs.length} testQuestions (${groupCount} groups, ${singleCount} single)`);
                });
                console.log("====================");
                
                const newPartsData = {};
                
                // Chỉ khởi tạo parts có trong response từ API
                // Không khởi tạo tất cả parts từ skill để tránh mất dữ liệu khi một part không có trong response
                partsArr.forEach((p) => {
                    try {
                        const partId = p.partId || p.PartId;
                        if (!partId) {
                            console.warn("Part không có partId:", p);
                            return;
                        }
                        
                        if (!newPartsData[partId]) {
                            newPartsData[partId] = { groups: [], questions: [] };
                        }

                        const tqs = p.testQuestions || p.TestQuestions || [];
                        console.log(`Part ${partId} có ${tqs.length} testQuestions`);
                        tqs.forEach((tq, tqIndex) => {
                            try {
                                // Thử nhiều cách để xác định isGroup
                                const isGroup = tq.isGroup ?? tq.IsGroup ?? tq.isQuestionGroup ?? tq.IsQuestionGroup ?? false;
                                if (isGroup) {
                                    const gSnap = tq.questionGroupSnapshotDto || tq.QuestionGroupSnapshotDto;
                                    if (!gSnap) {
                                        console.warn(`Part ${partId}, TestQuestion ${tqIndex}: Group snapshot không tồn tại`, tq);
                                        return;
                                    }
                                    
                                    // Kiểm tra questionSnapshots
                                    const questionSnapshots = gSnap.questionSnapshots || gSnap.QuestionSnapshots || [];
                                    console.log(`Part ${partId}, Group ${tqIndex}: có ${questionSnapshots.length} questions trong group`);
                                    
                                    if (questionSnapshots.length === 0) {
                                        console.warn(`Part ${partId}, Group ${tqIndex}: Group không có questions!`, gSnap);
                                    }
                                    
                                    newPartsData[partId].groups.push({
                                        passage: gSnap.passage || gSnap.Passage || "",
                                        imageUrl: gSnap.imageUrl || gSnap.ImageUrl || "",
                                        audioUrl: gSnap.audioUrl || gSnap.AudioUrl || "",
                                        questions: questionSnapshots.map((q, qIdx) => {
                                            // Writing và Speaking parts không có options (partId 8-15)
                                            let normalizedOptions = [];
                                            
                                            if (!isWritingOrSpeakingPart(partId)) {
                                                const loadedOptions = (q.options || q.Options || []).map(o => ({
                                                    label: o.label || o.Label || "",
                                                    content: o.content || o.Content || "",
                                                    isCorrect: o.isCorrect || o.IsCorrect || false,
                                                }));
                                                // Đảm bảo số lượng options đúng với part (Part 2 = 3, các part khác = 4)
                                                const expectedCount = createDefaultOptions(partId).length;
                                                normalizedOptions = loadedOptions.slice(0, expectedCount);
                                                // Nếu thiếu, bổ sung options rỗng
                                                while (normalizedOptions.length < expectedCount) {
                                                    const labels = ['A', 'B', 'C', 'D'];
                                                    normalizedOptions.push({
                                                        label: labels[normalizedOptions.length],
                                                        content: "",
                                                        isCorrect: false,
                                                    });
                                                }
                                            }
                                            
                                            return {
                                                content: q.content || q.Content || "",
                                                imageUrl: q.imageUrl || q.ImageUrl || "",
                                                audioUrl: q.audioUrl || q.AudioUrl || "",
                                                explanation: q.explanation || q.Explanation || "",
                                                options: normalizedOptions,
                                            };
                                        }),
                                    });
                                } else {
                                    const qSnap = tq.questionSnapshotDto || tq.QuestionSnapshotDto;
                                    if (!qSnap) {
                                        console.warn(`Part ${partId}, TestQuestion ${tqIndex}: Question snapshot không tồn tại`, tq);
                                        return;
                                    }
                                    console.log(`Part ${partId}, Single Question ${tqIndex}: đã parse`);
                                    // Writing và Speaking parts không có options (partId 8-15)
                                    let normalizedOptions = [];
                                    
                                    if (!isWritingOrSpeakingPart(partId)) {
                                        const loadedOptions = (qSnap.options || qSnap.Options || []).map(o => ({
                                            label: o.label || o.Label || "",
                                            content: o.content || o.Content || "",
                                            isCorrect: o.isCorrect || o.IsCorrect || false,
                                        }));
                                        // Đảm bảo số lượng options đúng với part (Part 2 = 3, các part khác = 4)
                                        const expectedCount = createDefaultOptions(partId).length;
                                        normalizedOptions = loadedOptions.slice(0, expectedCount);
                                        // Nếu thiếu, bổ sung options rỗng
                                        while (normalizedOptions.length < expectedCount) {
                                            const labels = ['A', 'B', 'C', 'D'];
                                            normalizedOptions.push({
                                                label: labels[normalizedOptions.length],
                                                content: "",
                                                isCorrect: false,
                                            });
                                        }
                                    }
                                    
                                    newPartsData[partId].questions.push({
                                        content: qSnap.content || qSnap.Content || "",
                                        imageUrl: qSnap.imageUrl || qSnap.ImageUrl || "",
                                        audioUrl: qSnap.audioUrl || qSnap.AudioUrl || "",
                                        explanation: qSnap.explanation || qSnap.Explanation || "",
                                        options: normalizedOptions,
                                    });
                                }
                            } catch (err) {
                                console.error(`Lỗi khi parse testQuestion cho partId ${partId}:`, err, tq);
                            }
                        });
                    } catch (err) {
                        console.error("Lỗi khi parse part:", err, p);
                    }
                });
                
                // Log để debug: kiểm tra số lượng câu hỏi đã parse theo từng part
                console.log("=== TÓM TẮT PARSE ===");
                const parsedTotal = Object.keys(newPartsData).reduce((sum, partIdStr) => {
                    const partId = Number(partIdStr);
                    const part = newPartsData[partId];
                    const groupCount = (part.groups || []).length;
                    const groupQuestions = (part.groups || []).reduce((gSum, g) => gSum + (g.questions || []).length, 0);
                    const singleQuestions = (part.questions || []).length;
                    const total = groupQuestions + singleQuestions;
                    
                    console.log(`Part ${partId}: ${groupCount} groups (${groupQuestions} questions) + ${singleQuestions} single = ${total} total`);
                    
                    return sum + total;
                }, 0);
                console.log(`Tổng: Đã parse ${parsedTotal} câu hỏi từ ${partsArr.length} parts trong API response`);
                console.log("====================");
                
                // Sau khi parse xong, khởi tạo các parts còn lại (từ loadedParts) với dữ liệu rỗng
                // Nhưng chỉ khởi tạo nếu part đó chưa có trong newPartsData
                loadedParts.forEach(p => {
                    if (!newPartsData[p.partId]) {
                        newPartsData[p.partId] = { groups: [], questions: [] };
                    }
                });

                setPartsData(newPartsData);
                if (loadedParts.length > 0) {
                    setActivePartTab(loadedParts[0].partId);
                }
            } catch (e) {
                message.error("Không tải được chi tiết bài thi");
            }
        };

        if (editingId) {
            loadForEdit(editingId);
        } else {
            setSelectedSkill(null);
        }
    }, [open, editingId]);

    const handleSkillChange = async (skill) => {
        setSelectedSkill(skill);
        setPartsData({});
        setAudioUrl(null);
        
        const loadedParts = await loadPartsBySkill(skill);
        setParts(loadedParts);
        
        // Khởi tạo empty data cho mỗi part
        const newPartsData = {};
        loadedParts.forEach(p => {
            newPartsData[p.partId] = { groups: [], questions: [] };
        });
        setPartsData(newPartsData);
        
        if (loadedParts.length > 0) {
            setActivePartTab(loadedParts[0].partId);
        }
    };

    const addQuestion = (partId) => {
        // Writing và Speaking parts không có options (partId 8-15)
        const defaultOptions = isWritingOrSpeakingPart(partId) ? [] : createDefaultOptions(partId);
        setPartsData(prev => ({
            ...prev,
            [partId]: {
                ...prev[partId],
                questions: [
                    ...(prev[partId]?.questions || []),
                    {
                        content: "",
                        imageUrl: "",
                        audioUrl: "",
                        explanation: "",
                        options: defaultOptions,
                    },
                ],
            },
        }));
    };

    const addGroup = (partId) => {
        // Writing và Speaking parts không có options (partId 8-15)
        const defaultOptions = isWritingOrSpeakingPart(partId) ? [] : createDefaultOptions(partId);
        setPartsData(prev => ({
            ...prev,
            [partId]: {
                ...prev[partId],
                groups: [
                    ...(prev[partId]?.groups || []),
                    {
                        passage: "",
                        imageUrl: "",
                        audioUrl: "",
                        questions: [
                            {
                                content: "",
                                imageUrl: "",
                                audioUrl: "",
                                explanation: "",
                                options: defaultOptions,
                            },
                        ],
                    },
                ],
            },
        }));
    };

    const updateQuestion = (partId, questionIndex, field, value) => {
        setPartsData(prev => {
            const newData = { ...prev };
            const questions = [...(newData[partId]?.questions || [])];
            questions[questionIndex] = { ...questions[questionIndex], [field]: value };
            newData[partId] = { ...newData[partId], questions };
            return newData;
        });
    };

    const updateGroup = (partId, groupIndex, field, value) => {
        setPartsData(prev => {
            const newData = { ...prev };
            const groups = [...(newData[partId]?.groups || [])];
            groups[groupIndex] = { ...groups[groupIndex], [field]: value };
            newData[partId] = { ...newData[partId], groups };
            return newData;
        });
    };

    const updateGroupQuestion = (partId, groupIndex, questionIndex, field, value) => {
        setPartsData(prev => {
            const newData = { ...prev };
            const groups = [...(newData[partId]?.groups || [])];
            const questions = [...groups[groupIndex].questions];
            questions[questionIndex] = { ...questions[questionIndex], [field]: value };
            groups[groupIndex] = { ...groups[groupIndex], questions };
            newData[partId] = { ...newData[partId], groups };
            return newData;
        });
    };

    const updateOption = (partId, questionIndex, optionIndex, field, value, isGroup = false, groupIndex = null) => {
        setPartsData(prev => {
            const newData = { ...prev };
            if (isGroup && groupIndex !== null) {
                const groups = [...(newData[partId]?.groups || [])];
                const questions = [...groups[groupIndex].questions];
                const options = [...questions[questionIndex].options];
                options[optionIndex] = { ...options[optionIndex], [field]: value };
                questions[questionIndex] = { ...questions[questionIndex], options };
                groups[groupIndex] = { ...groups[groupIndex], questions };
                newData[partId] = { ...newData[partId], groups };
            } else {
                const questions = [...(newData[partId]?.questions || [])];
                const options = [...questions[questionIndex].options];
                options[optionIndex] = { ...options[optionIndex], [field]: value };
                questions[questionIndex] = { ...questions[questionIndex], options };
                newData[partId] = { ...newData[partId], questions };
            }
            return newData;
        });
    };

    const deleteQuestion = (partId, questionIndex) => {
        setPartsData(prev => ({
            ...prev,
            [partId]: {
                ...prev[partId],
                questions: prev[partId]?.questions.filter((_, i) => i !== questionIndex) || [],
            },
        }));
    };

    const deleteGroup = (partId, groupIndex) => {
        setPartsData(prev => ({
            ...prev,
            [partId]: {
                ...prev[partId],
                groups: prev[partId]?.groups.filter((_, i) => i !== groupIndex) || [],
            },
        }));
    };

    const addQuestionToGroup = (partId, groupIndex) => {
        // Writing và Speaking parts không có options (partId 8-15)
        const defaultOptions = isWritingOrSpeakingPart(partId) ? [] : createDefaultOptions(partId);
        setPartsData(prev => {
            const newData = { ...prev };
            const groups = [...(newData[partId]?.groups || [])];
            groups[groupIndex].questions.push({
                content: "",
                imageUrl: "",
                audioUrl: "",
                explanation: "",
                options: defaultOptions,
            });
            newData[partId] = { ...newData[partId], groups };
            return newData;
        });
    };

    const deleteQuestionFromGroup = (partId, groupIndex, questionIndex) => {
        setPartsData(prev => {
            const newData = { ...prev };
            const groups = [...(newData[partId]?.groups || [])];
            groups[groupIndex].questions = groups[groupIndex].questions.filter((_, i) => i !== questionIndex);
            newData[partId] = { ...newData[partId], groups };
            return newData;
        });
    };

    const calculateTotalQuestions = () => {
        return Object.values(partsData).reduce((sum, part) => {
            const groupQuestions = (part.groups || []).reduce((gSum, g) => gSum + (g.questions || []).length, 0);
            const singleQuestions = (part.questions || []).length;
            return sum + groupQuestions + singleQuestions;
        }, 0);
    };

    // Helper function để kiểm tra string không rỗng và không chỉ có space
    const isValidString = (value) => {
        if (!value || typeof value !== "string") return false;
        return value.trim().length > 0;
    };

    // Validate toàn bộ parts data trước khi submit
    const validatePartsData = () => {
        const errors = [];

        // Validate từng part
        Object.keys(partsData).forEach(partIdStr => {
            const partId = Number(partIdStr);
            const partData = partsData[partId];
            const imageConfig = requiresImage(partId, selectedSkill);
            // Sử dụng partId để kiểm tra thay vì skill
            const isWritingOrSpeaking = isWritingOrSpeakingPart(partId);

            // Validate questions đơn
            (partData.questions || []).forEach((q, qIdx) => {
                // Content bắt buộc
                if (!isValidString(q.content)) {
                    errors.push(`Part ${partId}, Câu hỏi ${qIdx + 1}: Nội dung câu hỏi không được để trống!`);
                }

                // Image bắt buộc cho các part cần ảnh
                if (imageConfig.required && !isValidString(q.imageUrl)) {
                    errors.push(`Part ${partId}, Câu hỏi ${qIdx + 1}: Image URL là bắt buộc!`);
                }

                // Image nếu có thì phải hợp lệ (không chỉ space)
                if (q.imageUrl && !isValidString(q.imageUrl)) {
                    errors.push(`Part ${partId}, Câu hỏi ${qIdx + 1}: Image URL không hợp lệ!`);
                }

                // Options validation cho L&R
                if (!isWritingOrSpeaking && (q.options || []).length > 0) {
                    const validOptions = (q.options || []).filter(opt => isValidString(opt.content));
                    if (validOptions.length === 0) {
                        errors.push(`Part ${partId}, Câu hỏi ${qIdx + 1}: Phải có ít nhất 1 đáp án!`);
                    }

                    // Kiểm tra có đáp án đúng không
                    const hasCorrectAnswer = (q.options || []).some(opt => opt.isCorrect && isValidString(opt.content));
                    if (!hasCorrectAnswer) {
                        errors.push(`Part ${partId}, Câu hỏi ${qIdx + 1}: Phải chọn ít nhất 1 đáp án đúng!`);
                    }

                    // Kiểm tra tất cả options phải có nội dung (không được trống hoặc chỉ space)
                    (q.options || []).forEach((opt, optIdx) => {
                        if (!isValidString(opt.content)) {
                            errors.push(`Part ${partId}, Câu hỏi ${qIdx + 1}, Đáp án ${opt.label}: Không được để trống!`);
                        }
                    });
                }

                // Explanation nếu có thì phải hợp lệ
                if (q.explanation && !isValidString(q.explanation)) {
                    errors.push(`Part ${partId}, Câu hỏi ${qIdx + 1}: Giải thích không hợp lệ!`);
                }
            });

            // Validate groups
            (partData.groups || []).forEach((g, gIdx) => {
                // Passage nếu có thì phải hợp lệ
                if (g.passage && !isValidString(g.passage)) {
                    errors.push(`Part ${partId}, Nhóm ${gIdx + 1}: Passage không hợp lệ!`);
                }

                // Image nếu có thì phải hợp lệ
                if (g.imageUrl && !isValidString(g.imageUrl)) {
                    errors.push(`Part ${partId}, Nhóm ${gIdx + 1}: Image URL không hợp lệ!`);
                }

                // Validate questions trong group
                (g.questions || []).forEach((q, qIdx) => {
                    // Content bắt buộc
                    if (!isValidString(q.content)) {
                        errors.push(`Part ${partId}, Nhóm ${gIdx + 1}, Câu hỏi ${qIdx + 1}: Nội dung câu hỏi không được để trống!`);
                    }

                    // Image bắt buộc cho các part cần ảnh
                    if (imageConfig.required && !isValidString(q.imageUrl)) {
                        errors.push(`Part ${partId}, Nhóm ${gIdx + 1}, Câu hỏi ${qIdx + 1}: Image URL là bắt buộc!`);
                    }

                    // Image nếu có thì phải hợp lệ
                    if (q.imageUrl && !isValidString(q.imageUrl)) {
                        errors.push(`Part ${partId}, Nhóm ${gIdx + 1}, Câu hỏi ${qIdx + 1}: Image URL không hợp lệ!`);
                    }

                    // Options validation cho L&R
                    if (!isWritingOrSpeaking && (q.options || []).length > 0) {
                        const validOptions = (q.options || []).filter(opt => isValidString(opt.content));
                        if (validOptions.length === 0) {
                            errors.push(`Part ${partId}, Nhóm ${gIdx + 1}, Câu hỏi ${qIdx + 1}: Phải có ít nhất 1 đáp án!`);
                        }

                        // Kiểm tra có đáp án đúng không
                        const hasCorrectAnswer = (q.options || []).some(opt => opt.isCorrect && isValidString(opt.content));
                        if (!hasCorrectAnswer) {
                            errors.push(`Part ${partId}, Nhóm ${gIdx + 1}, Câu hỏi ${qIdx + 1}: Phải chọn ít nhất 1 đáp án đúng!`);
                        }

                        // Kiểm tra tất cả options phải có nội dung
                        (q.options || []).forEach((opt, optIdx) => {
                            if (!isValidString(opt.content)) {
                                errors.push(`Part ${partId}, Nhóm ${gIdx + 1}, Câu hỏi ${qIdx + 1}, Đáp án ${opt.label}: Không được để trống!`);
                            }
                        });
                    }

                    // Explanation nếu có thì phải hợp lệ
                    if (q.explanation && !isValidString(q.explanation)) {
                        errors.push(`Part ${partId}, Nhóm ${gIdx + 1}, Câu hỏi ${qIdx + 1}: Giải thích không hợp lệ!`);
                    }
                });
            });
        });

        return errors;
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (!selectedSkill) {
                message.warning("Vui lòng chọn kỹ năng!");
                return;
            }

            // Validate tất cả inputs
            const validationErrors = validatePartsData();
            if (validationErrors.length > 0) {
                message.error({
                    content: (
                        <div>
                            <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Có lỗi trong dữ liệu:</div>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {validationErrors.slice(0, 5).map((err, idx) => (
                                    <li key={idx} style={{ marginBottom: 4 }}>{err}</li>
                                ))}
                            </ul>
                            {validationErrors.length > 5 && (
                                <div style={{ marginTop: 8, color: '#999' }}>
                                    ... và {validationErrors.length - 5} lỗi khác
                                </div>
                            )}
                        </div>
                    ),
                    duration: 5,
                });
                return;
            }

            // Build parts data cho API
            console.log("=== CHUẨN BỊ SUBMIT ===");
            console.log(`parts array có ${parts.length} parts:`, parts.map(p => p.partId));
            console.log(`partsData có keys:`, Object.keys(partsData).map(k => Number(k)));
            
            // Đảm bảo gửi TẤT CẢ parts có trong partsData (không filter theo parts array)
            // Vì parts array chỉ chứa parts từ skill, nhưng partsData có thể có thêm parts từ API
            const partsPayload = Object.keys(partsData)
                .map(partIdStr => {
                    const partId = Number(partIdStr);
                    const partData = partsData[partId];
                    const groupCount = (partData.groups || []).reduce((sum, g) => sum + (g.questions || []).length, 0);
                    const questionCount = (partData.questions || []).length;
                    const totalQuestions = groupCount + questionCount;
                    
                    console.log(`Part ${partId}: ${groupCount} questions từ groups + ${questionCount} single = ${totalQuestions} total`);
                    
                    // Chỉ gửi part nếu có ít nhất 1 câu hỏi
                    if (totalQuestions === 0) {
                        console.warn(`Part ${partId}: Bỏ qua vì rỗng`);
                        return null;
                    }
                    
                    // Helper để trim string hoặc return null
                    const trimOrNull = (str) => {
                        if (!str || typeof str !== "string") return null;
                        const trimmed = str.trim();
                        return trimmed.length > 0 ? trimmed : null;
                    };

                    return {
                        partId: partId,
                        groups: (partData.groups || []).map(g => ({
                            passage: trimOrNull(g.passage),
                            imageUrl: trimOrNull(g.imageUrl),
                            audioUrl: trimOrNull(g.audioUrl),
                            questions: (g.questions || []).map(q => {
                                // Writing và Speaking không có options
                                // Sử dụng partId để kiểm tra thay vì skill
            const isWritingOrSpeaking = isWritingOrSpeakingPart(partId);
                                const optionsPayload = isWritingOrSpeaking ? [] : (q.options || []).map(o => ({
                                    label: o.label,
                                    content: trimOrNull(o.content),
                                    isCorrect: o.isCorrect || false,
                                }));
                                
                                return {
                                    content: trimOrNull(q.content),
                                    imageUrl: trimOrNull(q.imageUrl),
                                    audioUrl: trimOrNull(q.audioUrl),
                                    explanation: trimOrNull(q.explanation),
                                    options: optionsPayload,
                                };
                            }),
                        })),
                        questions: (partData.questions || []).map(q => {
                            // Writing và Speaking không có options
                            // Sử dụng partId để kiểm tra thay vì skill
            const isWritingOrSpeaking = isWritingOrSpeakingPart(partId);
                            const optionsPayload = isWritingOrSpeaking ? [] : (q.options || []).map(o => ({
                                label: o.label,
                                content: trimOrNull(o.content),
                                isCorrect: o.isCorrect || false,
                            }));
                            
                            return {
                                content: trimOrNull(q.content),
                                imageUrl: trimOrNull(q.imageUrl),
                                audioUrl: trimOrNull(q.audioUrl),
                                explanation: trimOrNull(q.explanation),
                                options: optionsPayload,
                            };
                        }),
                    };
                })
                .filter(p => p !== null); // Loại bỏ các parts null

            // Log tổng hợp payload
            const payloadTotal = partsPayload.reduce((sum, part) => {
                const groupQ = (part.groups || []).reduce((gSum, g) => gSum + (g.questions || []).length, 0);
                const singleQ = (part.questions || []).length;
                return sum + groupQ + singleQ;
            }, 0);
            console.log(`Payload sẽ gửi: ${partsPayload.length} parts, tổng ${payloadTotal} câu hỏi`);
            console.log("====================");

            // Validate cấu trúc TOEIC
            const validation = validateTestStructure(selectedSkill, partsPayload);
            if (!validation.valid) {
                message.warning(`Lỗi cấu trúc: ${validation.message}`);
                return;
            }

            // Kiểm tra audio cho LR - chỉ kiểm tra nếu chưa upload
            if (selectedSkill === TEST_SKILL.LR && !audioUrl) {
                message.warning("L&R test yêu cầu audio file!");
                return;
            }

            // Kiểm tra image bắt buộc cho các parts cần ảnh: Part 1 (L&R), Part 8 (Writing Part 1), Part 12 (Speaking Part 2)
            const mandatoryImageParts = [1, 8, 12];
            const partNames = { 1: "Part 1 (Photographs)", 8: "Writing Part 1", 12: "Speaking Part 2" };
            
            for (const partId of mandatoryImageParts) {
                const partData = partsPayload.find(p => p.partId === partId);
                if (partData) {
                    // Kiểm tra questions đơn
                    const questions = partData.questions || [];
                    const missingImage = questions.some(q => !q.imageUrl || q.imageUrl.trim() === "");
                    
                    // Kiểm tra questions trong groups
                    const groups = partData.groups || [];
                    const groupMissingImage = groups.some(g => {
                        const groupQuestions = g.questions || [];
                        return groupQuestions.some(q => !q.imageUrl || q.imageUrl.trim() === "");
                    });

                    if (missingImage || groupMissingImage) {
                        message.warning(`${partNames[partId]} yêu cầu Image URL cho tất cả câu hỏi!`);
                        return;
                    }
                }
            }

            // Helper để trim string hoặc return null
            const trimOrNull = (str) => {
                if (!str || typeof str !== "string") return null;
                const trimmed = str.trim();
                return trimmed.length > 0 ? trimmed : null;
            };

            const payload = {
                title: (values.title || "").trim(),
                testSkill: selectedSkill,
                testType: TEST_TYPE.SIMULATOR,
                description: trimOrNull(values.description),
                audioUrl: trimOrNull(audioUrl),
                parts: partsPayload,
            };

            setLoading(true);
            if (editingId) {
                await updateTestManual(editingId, payload);
                message.success("Cập nhật bài thi thành công");
            } else {
                await createTestManual(payload);
                message.success("Tạo bài thi thành công!");
            }

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 300);
        } catch (error) {
            console.error("Error creating test:", error);
            message.error("Lỗi khi tạo bài thi: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const totalQuestions = calculateTotalQuestions();
    const expectedTotal = selectedSkill ? TOTAL_QUESTIONS_BY_SKILL[selectedSkill] : 0;
    const validation = selectedSkill ? validateTestStructure(selectedSkill, Object.keys(partsData).map(partId => {
        const partData = partsData[partId] || { groups: [], questions: [] };
        const part = parts.find(p => p.partId === Number(partId));
        return {
            partId: Number(partId),
            groups: partData.groups || [],
            questions: partData.questions || [],
        };
    })) : { valid: true, errors: [] };

    return (
        <Modal
            title={readOnly ? "Xem Simulator Test" : (editingId ? "Cập nhật Simulator Test" : "Tạo Simulator Test")}
            open={open}
            onCancel={onClose}
            onOk={readOnly ? undefined : handleSubmit}
            width={1400}
            confirmLoading={loading}
            okText={editingId ? "Cập nhật" : "Tạo bài thi"}
            cancelText="Hủy"
            footer={readOnly ? null : undefined}
            style={{ top: 20 }}
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="title"
                            label="Tiêu đề bài thi"
                            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
                        >
                            <Input placeholder="Ví dụ: TOEIC Simulator Test 1" disabled={readOnly} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="skill"
                            label="Kỹ năng"
                            rules={[{ required: true, message: "Vui lòng chọn kỹ năng!" }]}
                        >
                            <Select
                                placeholder="Chọn kỹ năng"
                                onChange={handleSkillChange}
                                disabled={readOnly || !!editingId}
                            >
                                <Option value={TEST_SKILL.LR}>Listening & Reading</Option>
                                <Option value={TEST_SKILL.FOUR_SKILLS}>Four Skills (L+R+W+S)</Option>
                                <Option value={TEST_SKILL.SPEAKING}>Speaking</Option>
                                <Option value={TEST_SKILL.WRITING}>Writing</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Tổng số câu">
                            <Statistic
                                value={totalQuestions}
                                suffix={`/ ${expectedTotal}`}
                                valueStyle={{
                                    color: totalQuestions === expectedTotal ? "#52c41a" : "#faad14"
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="description" label="Mô tả">
                    <TextArea rows={2} placeholder="Mô tả về bài thi (tùy chọn)" disabled={readOnly} />
                </Form.Item>

                {selectedSkill === TEST_SKILL.LR && (
                    <Form.Item 
                        label={audioUrl ? "Audio file (Đã upload)" : "Audio file (Bắt buộc cho L&R)"}
                        required={!audioUrl}
                    >
                        <Space direction="vertical" style={{ width: "100%" }} size="small">
                            <Input
                                value={audioUrl || ""}
                                onChange={(e) => setAudioUrl(e.target.value)}
                                placeholder="URL audio file (45 phút)"
                                disabled={readOnly}
                            />
                            {!readOnly && (
                                <Upload
                                    customRequest={async ({ file, onSuccess, onError }) => {
                                        try {
                                            const url = await uploadFile(file, "audio");
                                            setAudioUrl(url);
                                            onSuccess(url);
                                            message.success("Upload audio thành công");
                                        } catch (error) {
                                            console.error("Upload error:", error);
                                            onError(error);
                                            message.error("Upload audio thất bại: " + (error.message || "Unknown error"));
                                        }
                                    }}
                                    showUploadList={false}
                                    accept="audio/*"
                                >
                                    <Button icon={<UploadOutlined />}>
                                        {audioUrl ? "Upload Audio khác" : "Upload Audio"}
                                    </Button>
                                </Upload>
                            )}
                            {audioUrl && (
                                <div style={{ marginTop: 8 }}>
                                    <audio
                                        controls
                                        preload="none"
                                        src={audioUrl}
                                        style={{ width: "100%" }}
                                    />
                                </div>
                            )}
                        </Space>
                    </Form.Item>
                )}

                {!validation.valid && validation.errors.length > 0 && (
                    <Alert
                        message="Lỗi cấu trúc TOEIC"
                        description={validation.errors.map((e, i) => <div key={i}>{e}</div>)}
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

                {selectedSkill && parts.length > 0 && (
                    <>
                        <div style={{
                            marginBottom: 16,
                            padding: 16,
                            background: "#f0f5ff",
                            borderRadius: 8,
                            border: "1px solid #adc6ff"
                        }}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Statistic
                                        title="Tổng số câu"
                                        value={totalQuestions}
                                        suffix={`/ ${expectedTotal}`}
                                        valueStyle={{
                                            color: totalQuestions === expectedTotal ? "#52c41a" : "#faad14"
                                        }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Số Parts"
                                        value={parts.length}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Trạng thái"
                                        value={validation.valid ? "Hợp lệ" : "Chưa hợp lệ"}
                                        valueStyle={{
                                            color: validation.valid ? "#52c41a" : "#ff4d4f"
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>

                        <Tabs
                            activeKey={activePartTab?.toString()}
                            onChange={(key) => setActivePartTab(Number(key))}
                            type="card"
                        >
                            {parts.map(part => {
                                const partData = partsData[part.partId] || { groups: [], questions: [] };
                                const expectedCount = PART_QUESTION_COUNT[part.partId] || 0;
                                const actualCount = (partData.groups || []).reduce((sum, g) => sum + (g.questions || []).length, 0) + (partData.questions || []).length;
                                const isPartValid = actualCount === expectedCount;

                                return (
                                    <Tabs.TabPane
                                        key={part.partId}
                                        tab={
                                            <span>
                                                {part.name || `Part ${part.partId}`}
                                                <Tag color={isPartValid ? "success" : "error"} style={{ marginLeft: 8 }}>
                                                    {actualCount}/{expectedCount}
                                                </Tag>
                                            </span>
                                        }
                                    >
                                        {/* Single Questions */}
                                        <div style={{ marginBottom: 16 }}>
                                            <Space style={{ marginBottom: 8 }}>
                                                <strong>Câu hỏi đơn ({partData.questions?.length || 0})</strong>
                                                {!readOnly && (
                                                    <Button
                                                        size="small"
                                                        icon={<PlusOutlined />}
                                                        onClick={() => addQuestion(part.partId)}
                                                    >
                                                        Thêm câu hỏi
                                                    </Button>
                                                )}
                                            </Space>
                                            <Collapse>
                                                {(partData.questions || []).map((q, qIdx) => (
                                                    <Panel
                                                        header={`Câu hỏi ${qIdx + 1}`}
                                                        key={`q-${qIdx}`}
                                                        extra={!readOnly && (
                                                            <DeleteOutlined
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteQuestion(part.partId, qIdx);
                                                                }}
                                                            />
                                                        )}
                                                    >
                                                        <QuestionEditor
                                                            question={q}
                                                            partId={part.partId}
                                                            questionIndex={qIdx}
                                                            skill={selectedSkill}
                                                            onUpdate={(field, value) => updateQuestion(part.partId, qIdx, field, value)}
                                                            onUpdateOption={(optionIndex, field, value) => updateOption(part.partId, qIdx, optionIndex, field, value)}
                                                            readOnly={readOnly}
                                                        />
                                                    </Panel>
                                                ))}
                                            </Collapse>
                                        </div>

                                        {/* Question Groups - Chỉ hiển thị cho các part hỗ trợ groups */}
                                        {supportsQuestionGroups(part.partId) && (
                                            <div>
                                                <Space style={{ marginBottom: 8 }}>
                                                    <strong>Nhóm câu hỏi ({partData.groups?.length || 0})</strong>
                                                    {!readOnly && (
                                                        <Button
                                                            size="small"
                                                            icon={<PlusOutlined />}
                                                            onClick={() => addGroup(part.partId)}
                                                        >
                                                            Thêm nhóm
                                                        </Button>
                                                    )}
                                                </Space>
                                                <Collapse>
                                                    {(partData.groups || []).map((group, gIdx) => (
                                                        <Panel
                                                            header={`Nhóm ${gIdx + 1} (${group.questions?.length || 0} câu)`}
                                                            key={`g-${gIdx}`}
                                                            extra={!readOnly && (
                                                                <DeleteOutlined
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteGroup(part.partId, gIdx);
                                                                    }}
                                                                />
                                                            )}
                                                        >
                                                            <GroupEditor
                                                                group={group}
                                                                partId={part.partId}
                                                                groupIndex={gIdx}
                                                                skill={selectedSkill}
                                                                onUpdate={(field, value) => updateGroup(part.partId, gIdx, field, value)}
                                                                onUpdateQuestion={(questionIndex, field, value) => updateGroupQuestion(part.partId, gIdx, questionIndex, field, value)}
                                                                onUpdateOption={(questionIndex, optionIndex, field, value) => updateOption(part.partId, questionIndex, optionIndex, field, value, true, gIdx)}
                                                                onAddQuestion={() => addQuestionToGroup(part.partId, gIdx)}
                                                                onDeleteQuestion={(questionIndex) => deleteQuestionFromGroup(part.partId, gIdx, questionIndex)}
                                                                readOnly={readOnly}
                                                            />
                                                        </Panel>
                                                    ))}
                                                </Collapse>
                                            </div>
                                        )}
                                    </Tabs.TabPane>
                                );
                            })}
                        </Tabs>
                    </>
                )}

                {!selectedSkill && (
                    <div style={{
                        textAlign: "center",
                        padding: 40,
                        color: "#999"
                    }}>
                        👆 Vui lòng chọn kỹ năng để bắt đầu tạo bài thi
                    </div>
                )}
            </Form>
        </Modal>
    );
}

// Component để edit một câu hỏi
function QuestionEditor({ question, partId, questionIndex, skill, onUpdate, onUpdateOption, readOnly }) {
    // Kiểm tra part nào cần ảnh
    const imageConfig = requiresImage(partId, skill);
    const requireImage = imageConfig.required;
    const showImage = imageConfig.show;
    // Writing và Speaking parts không có options (partId 8-15)
    const isWritingOrSpeaking = isWritingOrSpeakingPart(partId);
    
    // Helper để validate string
    const isValidString = (value) => {
        if (!value || typeof value !== "string") return false;
        return value.trim().length > 0;
    };

    // Validate các fields
    const contentError = !isValidString(question.content) ? "Nội dung câu hỏi không được để trống!" : "";
    const imageError = showImage && requireImage && !isValidString(question.imageUrl) 
        ? "Image URL là bắt buộc!" 
        : showImage && question.imageUrl && !isValidString(question.imageUrl)
        ? "Image URL không hợp lệ!"
        : "";
    const explanationError = question.explanation && !isValidString(question.explanation) 
        ? "Giải thích không hợp lệ!" 
        : "";
    
    return (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Form.Item 
                label="Nội dung câu hỏi" 
                required
                validateStatus={contentError ? "error" : ""}
                help={contentError}
            >
                <TextArea
                    value={question.content || ""}
                    onChange={(e) => onUpdate("content", e.target.value)}
                    rows={3}
                    disabled={readOnly}
                    status={contentError ? "error" : ""}
                />
            </Form.Item>

            {showImage && (
                <Form.Item 
                    label={requireImage ? "Image (Bắt buộc)" : "Image"}
                    required={requireImage}
                    validateStatus={imageError ? "error" : ""}
                    help={imageError}
                >
                    <Space direction="vertical" style={{ width: "100%" }} size="small">
                        <Input
                            value={question.imageUrl || ""}
                            onChange={(e) => onUpdate("imageUrl", e.target.value)}
                            placeholder={requireImage ? "URL hình ảnh (bắt buộc)" : "URL hình ảnh (nếu có)"}
                            disabled={readOnly}
                            status={imageError ? "error" : ""}
                        />
                        {!readOnly && (
                            <Upload
                                customRequest={async ({ file, onSuccess, onError }) => {
                                    try {
                                        const url = await uploadFile(file, "image");
                                        onUpdate("imageUrl", url);
                                        onSuccess(url);
                                        message.success("Upload ảnh thành công");
                                    } catch (error) {
                                        console.error("Upload error:", error);
                                        onError(error);
                                        message.error("Upload ảnh thất bại: " + (error.message || "Unknown error"));
                                    }
                                }}
                                showUploadList={false}
                                accept="image/*"
                            >
                                <Button icon={<PictureOutlined />} size="small">
                                    Upload ảnh
                                </Button>
                            </Upload>
                        )}
                        {question.imageUrl && (
                            <div style={{ marginTop: 8 }}>
                                <img
                                    src={question.imageUrl}
                                    alt="preview"
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: 200,
                                        objectFit: "contain",
                                        border: "1px solid #f0f0f0",
                                        borderRadius: 6,
                                        padding: 6,
                                        background: "#fff",
                                    }}
                                />
                            </div>
                        )}
                    </Space>
                </Form.Item>
            )}


            <Form.Item 
                label="Giải thích"
                validateStatus={explanationError ? "error" : ""}
                help={explanationError}
            >
                <TextArea
                    value={question.explanation || ""}
                    onChange={(e) => onUpdate("explanation", e.target.value)}
                    rows={2}
                    disabled={readOnly}
                    status={explanationError ? "error" : ""}
                />
            </Form.Item>

            {!isWritingOrSpeaking && (
                <Form.Item 
                    label="Đáp án"
                    required
                >
                    <Space direction="vertical" style={{ width: "100%" }}>
                        {(question.options || []).map((option, oIdx) => {
                            const optionError = !isValidString(option.content) ? "Đáp án không được để trống!" : "";
                            
                            return (
                                <div key={oIdx}>
                                    <Row gutter={8} align="middle">
                                        <Col span={2}>
                                            <Tag>{option.label}</Tag>
                                        </Col>
                                        <Col span={18}>
                                            <Input
                                                value={option.content || ""}
                                                onChange={(e) => onUpdateOption(oIdx, "content", e.target.value)}
                                                placeholder={`Nhập đáp án ${option.label}`}
                                                disabled={readOnly}
                                                status={optionError ? "error" : ""}
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <Button
                                                type={option.isCorrect ? "primary" : "default"}
                                                onClick={() => {
                                                    // Reset tất cả về false, rồi set cái này thành true
                                                    (question.options || []).forEach((_, idx) => {
                                                        onUpdateOption(idx, "isCorrect", idx === oIdx);
                                                    });
                                                }}
                                                disabled={readOnly}
                                            >
                                                {option.isCorrect ? "Đúng" : "Chọn"}
                                            </Button>
                                        </Col>
                                    </Row>
                                    {optionError && (
                                        <div style={{ color: "#ff4d4f", fontSize: "12px", marginTop: "4px", marginLeft: "40px" }}>
                                            {optionError}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {(() => {
                            const hasCorrectAnswer = (question.options || []).some(opt => opt.isCorrect && isValidString(opt.content));
                            return !hasCorrectAnswer && (question.options || []).length > 0 ? (
                                <div style={{ color: "#ff4d4f", fontSize: "12px", marginTop: "4px" }}>
                                    Phải chọn ít nhất 1 đáp án đúng!
                                </div>
                            ) : null;
                        })()}
                    </Space>
                </Form.Item>
            )}
        </Space>
    );
}

// Component để edit một nhóm câu hỏi
function GroupEditor({ group, partId, groupIndex, skill, onUpdate, onUpdateQuestion, onUpdateOption, onAddQuestion, onDeleteQuestion, readOnly }) {
    // Helper để validate string
    const isValidString = (value) => {
        if (!value || typeof value !== "string") return false;
        return value.trim().length > 0;
    };

    // Validate group fields
    const passageError = group.passage && !isValidString(group.passage) ? "Passage không hợp lệ!" : "";
    const imageError = group.imageUrl && !isValidString(group.imageUrl) ? "Image URL không hợp lệ!" : "";
    
    return (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Form.Item 
                label="Passage/Đoạn văn"
                validateStatus={passageError ? "error" : ""}
                help={passageError}
            >
                <TextArea
                    value={group.passage || ""}
                    onChange={(e) => onUpdate("passage", e.target.value)}
                    rows={6}
                    placeholder="Nhập passage/đoạn văn cho nhóm câu hỏi"
                    disabled={readOnly}
                    status={passageError ? "error" : ""}
                />
            </Form.Item>

            {/* Image cho group - chỉ hiển thị cho L&R parts có thể có ảnh */}
            {skill === TEST_SKILL.LR && (
                <Form.Item 
                    label="Image"
                    validateStatus={imageError ? "error" : ""}
                    help={imageError}
                >
                    <Space direction="vertical" style={{ width: "100%" }} size="small">
                        <Input
                            value={group.imageUrl || ""}
                            onChange={(e) => onUpdate("imageUrl", e.target.value)}
                            placeholder="URL hình ảnh cho nhóm (nếu có)"
                            disabled={readOnly}
                            status={imageError ? "error" : ""}
                        />
                        {!readOnly && (
                            <Upload
                                customRequest={async ({ file, onSuccess, onError }) => {
                                    try {
                                        const url = await uploadFile(file, "image");
                                        onUpdate("imageUrl", url);
                                        onSuccess(url);
                                        message.success("Upload ảnh thành công");
                                    } catch (error) {
                                        console.error("Upload error:", error);
                                        onError(error);
                                        message.error("Upload ảnh thất bại: " + (error.message || "Unknown error"));
                                    }
                                }}
                                showUploadList={false}
                                accept="image/*"
                            >
                                <Button icon={<PictureOutlined />} size="small">
                                    Upload ảnh
                                </Button>
                            </Upload>
                        )}
                        {group.imageUrl && (
                            <div style={{ marginTop: 8 }}>
                                <img
                                    src={group.imageUrl}
                                    alt="preview"
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: 200,
                                        objectFit: "contain",
                                        border: "1px solid #f0f0f0",
                                        borderRadius: 6,
                                        padding: 6,
                                        background: "#fff",
                                    }}
                                />
                            </div>
                        )}
                    </Space>
                </Form.Item>
            )}


            <Form.Item
                label={
                    <Space>
                        <span>Câu hỏi trong nhóm ({group.questions?.length || 0})</span>
                        {!readOnly && (
                            <Button
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={onAddQuestion}
                            >
                                Thêm câu hỏi
                            </Button>
                        )}
                    </Space>
                }
            >
                <Collapse>
                    {(group.questions || []).map((q, qIdx) => (
                        <Panel
                            header={`Câu ${qIdx + 1}`}
                            key={`gq-${qIdx}`}
                            extra={!readOnly && (
                                <DeleteOutlined
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteQuestion(qIdx);
                                    }}
                                />
                            )}
                        >
                            <QuestionEditor
                                question={q}
                                partId={partId}
                                questionIndex={qIdx}
                                skill={skill}
                                onUpdate={(field, value) => onUpdateQuestion(qIdx, field, value)}
                                onUpdateOption={(optionIndex, field, value) => onUpdateOption(qIdx, optionIndex, field, value)}
                                readOnly={readOnly}
                            />
                        </Panel>
                    ))}
                </Collapse>
            </Form.Item>
        </Space>
    );
}

