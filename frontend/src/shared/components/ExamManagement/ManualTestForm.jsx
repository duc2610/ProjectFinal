import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, message, Tabs, Collapse, Space, Tag, Row, Col, Statistic, Upload, Alert } from "antd";
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined, UploadOutlined, PictureOutlined } from "@ant-design/icons";
import { createTestManual, getTestById, updateTestManual, createTestDraft, saveTestPart } from "@services/testsService";
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

// Parts chỉ có group questions (3, 4, 6, 7)
const GROUP_PARTS = [3, 4, 6, 7];
const isGroupPart = (p) => GROUP_PARTS.includes(Number(p));

export default function ManualTestForm({ open, onClose, onSuccess, editingId = null, readOnly = false }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [parts, setParts] = useState([]);
    const [partsData, setPartsData] = useState({}); 
    const [activePartTab, setActivePartTab] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [currentTestId, setCurrentTestId] = useState(null); 
    const [savingPartId, setSavingPartId] = useState(null);
    const [showValidation, setShowValidation] = useState(false); 
    const [isCloningVersion, setIsCloningVersion] = useState(false);

    const trimOrNull = (value) => {
        if (value === undefined || value === null) return null;
        if (typeof value !== "string") return value;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    };

    const buildFullTestPayload = () => {
        const values = form.getFieldsValue();
        const partOrder = (parts || []).map(p => p.partId);
        const fallbackOrder = Object.keys(partsData || {}).map(key => Number(key));
        const uniquePartIds = Array.from(new Set([...partOrder, ...fallbackOrder].filter(id => id != null)));

        const sanitizeQuestion = (q, partId) => {
            const isWritingSpeaking = isWritingOrSpeakingPart(partId);
            return {
                content: trimOrNull(q?.content),
                imageUrl: trimOrNull(q?.imageUrl),
                audioUrl: trimOrNull(q?.audioUrl),
                explanation: trimOrNull(q?.explanation),
                options: isWritingSpeaking ? [] : (q?.options || []).map(opt => ({
                    label: opt.label,
                    content: trimOrNull(opt.content),
                    isCorrect: !!opt.isCorrect,
                })),
            };
        };

        const normalizedParts = uniquePartIds.map(partId => {
            const data = partsData?.[partId] || { groups: [], questions: [] };
            return {
                partId,
                groups: (data.groups || []).map(group => ({
                    passage: trimOrNull(group?.passage),
                    imageUrl: trimOrNull(group?.imageUrl),
                    audioUrl: trimOrNull(group?.audioUrl),
                    questions: (group?.questions || []).map(q => sanitizeQuestion(q, partId)),
                })),
                questions: (data.questions || []).map(q => sanitizeQuestion(q, partId)),
            };
        });

        return {
            title: (values?.title || "").trim(),
            description: trimOrNull(values?.description),
            testSkill: selectedSkill,
            testType: TEST_TYPE.SIMULATOR,
            audioUrl: trimOrNull(audioUrl),
            parts: normalizedParts,
        };
    };

    const extractTestIdFromMessage = (text) => {
        if (!text || typeof text !== "string") return null;
        const match = text.match(/TestId\s*=?\s*(\d+)/i);
        return match ? Number(match[1]) : null;
    };

    const confirmCloneVersion = () => {
        return new Promise((resolve) => {
            Modal.confirm({
                title: "Tạo phiên bản mới để chỉnh sửa?",
                content: "Bài thi đã được phát hành. Hệ thống cần tạo một phiên bản nháp mới (clone) để bạn tiếp tục chỉnh sửa. Toàn bộ dữ liệu hiện tại sẽ được sao chép sang phiên bản mới.",
                okText: "Tạo phiên bản mới",
                cancelText: "Hủy",
                onOk: () => resolve(true),
                onCancel: () => resolve(false),
            });
        });
    };

    const clonePublishedTestToDraft = async () => {
        if (!currentTestId) return null;
        setIsCloningVersion(true);
        const hide = message.loading("Đang tạo phiên bản mới...", 0);
        try {
            const payload = buildFullTestPayload();
            const result = await updateTestManual(currentTestId, payload);
            const responseText = typeof result === "string" ? result : result?.data || result?.message;
            const newId = extractTestIdFromMessage(responseText);
            if (newId) {
                setCurrentTestId(newId);
            }
            message.success(responseText || "Đã tạo phiên bản mới.");
            if (onSuccess) {
                onSuccess();
            }
            return newId;
        } finally {
            if (hide) hide();
            setIsCloningVersion(false);
        }
    };

    const getErrorMessage = (error) => {
        return error?.response?.data?.message 
            || error?.response?.data?.data 
            || error?.message 
            || "Unknown error";
    };

    const toSkillId = (val) => {
        if (val == null) return undefined;
        if (typeof val === "number") return val;
        const s = String(val).toLowerCase();
        if (s === "3" || s.includes("lr") || s.includes("listening")) return TEST_SKILL.LR;
        if (s === "1" || s.includes("speaking")) return TEST_SKILL.SPEAKING;
        if (s === "2" || s.includes("writing")) return TEST_SKILL.WRITING;
        const n = Number(val);
        return Number.isFinite(n) ? n : undefined;
    };

    useEffect(() => {
        if (!open) {
            // Reset state khi modal đóng
            setShowValidation(false);
            setSavingPartId(null);
            return;
        }
        form.resetFields();
        setParts([]);
        setPartsData({});
        setAudioUrl(null);
        
        // Đảm bảo editingId là số hợp lệ
        let validEditingId = editingId;
        if (editingId && typeof editingId === 'object' && editingId !== null) {
            validEditingId = editingId.id || editingId.testId || editingId.Id || editingId.TestId;
        }
        
        // Xử lý trường hợp editingId là string có format "TestId: 5023"
        if (validEditingId && typeof validEditingId === 'string') {
            const numberMatch = validEditingId.match(/\d+/);
            if (numberMatch) {
                validEditingId = Number(numberMatch[0]);
            } else if (/^\d+$/.test(validEditingId)) {
                validEditingId = Number(validEditingId);
            }
        }
        
        // Đảm bảo validEditingId là số hợp lệ hoặc null/undefined
        if (validEditingId !== null && validEditingId !== undefined) {
            if (typeof validEditingId !== 'number' || isNaN(validEditingId)) {
                console.warn("Invalid editingId format:", editingId);
                validEditingId = null;
            }
        }
        
        setCurrentTestId(validEditingId); // Nếu có editingId, set làm currentTestId
        setShowValidation(false); // Reset validation khi mở modal

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

                const partsArr = d.parts || d.Parts || [];
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
                const parsedTotal = Object.keys(newPartsData).reduce((sum, partIdStr) => {
                    const partId = Number(partIdStr);
                    const part = newPartsData[partId];
                    const groupCount = (part.groups || []).length;
                    const groupQuestions = (part.groups || []).reduce((gSum, g) => gSum + (g.questions || []).length, 0);
                    const singleQuestions = (part.questions || []).length;
                    const total = groupQuestions + singleQuestions;
                    
                    
                    return sum + total;
                }, 0);
                
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
        // Không cho phép thêm single questions cho group parts (3, 4, 6, 7)
        if (isGroupPart(partId)) {
            message.warning(`Part ${partId} chỉ hỗ trợ nhóm câu hỏi (Group Questions), không thể thêm câu hỏi đơn.`);
            return;
        }
        setShowValidation(false);
        // Writing và Speaking parts không có options (partId 8-15)
        const defaultOptions = isWritingOrSpeakingPart(partId) ? [] : createDefaultOptions(partId);
        setPartsData(prev => {
            // Đảm bảo partId được khởi tạo đúng cấu trúc
            const currentPartData = prev[partId] || { groups: [], questions: [] };
            return {
                ...prev,
                [partId]: {
                    ...currentPartData,
                    questions: [
                        ...(currentPartData.questions || []),
                        {
                            content: "",
                            imageUrl: "",
                            audioUrl: "",
                            explanation: "",
                            options: defaultOptions,
                        },
                    ],
                },
            };
        });
    };

    const addGroup = (partId) => {
        setShowValidation(false);
        // Writing và Speaking parts không có options (partId 8-15)
        const defaultOptions = isWritingOrSpeakingPart(partId) ? [] : createDefaultOptions(partId);
        setPartsData(prev => {
            // Đảm bảo partId được khởi tạo đúng cấu trúc
            const currentPartData = prev[partId] || { groups: [], questions: [] };
            return {
                ...prev,
                [partId]: {
                    ...currentPartData,
                    groups: [
                        ...(currentPartData.groups || []),
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
            };
        });
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
        setShowValidation(false);
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
                // Content bắt buộc (trừ parts 1, 2, 6)
                const isContentOptional = [1, 2, 6].includes(partId);
                if (!isContentOptional && !isValidString(q.content)) {
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
                // Passage bắt buộc cho parts 6, 7 (không bắt buộc cho parts 3, 4)
                const isPassageOptional = [3, 4].includes(partId);
                if (!isPassageOptional && !isValidString(g.passage)) {
                    errors.push(`Part ${partId}, Nhóm ${gIdx + 1}: Passage không được để trống!`);
                }
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

    // Helper để validate string (không chỉ space) - dùng chung
    const validateString = (value) => {
        if (!value || typeof value !== "string") return false;
        return value.trim().length > 0;
    };

    // Hàm lưu một part cụ thể
    const handleSavePart = async (partId) => {
        if (!currentTestId) {
            message.warning("Vui lòng tạo bài thi trước!");
            return;
        }
        
        // Đảm bảo testId là số hợp lệ
        let testId = currentTestId;
        if (typeof testId === 'object' && testId !== null) {
            testId = testId.id || testId.testId || testId.Id || testId.TestId;
        }
        
        // Xử lý trường hợp testId là string có format "TestId: 5023" hoặc tương tự
        if (typeof testId === 'string') {
            // Tìm số trong string (ví dụ: "TestId: 5023" -> "5023")
            const numberMatch = testId.match(/\d+/);
            if (numberMatch) {
                testId = Number(numberMatch[0]);
            } else if (!/^\d+$/.test(testId)) {
                message.error("ID bài thi không hợp lệ!");
                return;
            } else {
                // Nếu là string số thuần, convert sang number
                testId = Number(testId);
            }
        }
        
        // Đảm bảo testId là số hợp lệ
        if (!testId || typeof testId !== 'number' || isNaN(testId)) {
            message.error("ID bài thi không hợp lệ!");
            return;
        }

        const partData = partsData[partId];
        if (!partData) {
            message.warning("Part không có dữ liệu!");
            return;
        }

        // Bật validation để hiển thị lỗi trong form
        setShowValidation(true);

        // Validate tất cả câu hỏi trước khi lưu
        const errors = [];
        const isWritingOrSpeaking = isWritingOrSpeakingPart(partId);
        const imageConfig = requiresImage(partId, selectedSkill);
        const requireImage = imageConfig.required;

        // Validate questions đơn
        (partData.questions || []).forEach((q, qIdx) => {
            // Content bắt buộc (trừ parts 1, 2, 6)
            const isContentOptional = [1, 2, 6].includes(partId);
            if (!isContentOptional && !validateString(q.content)) {
                errors.push(`Câu hỏi ${qIdx + 1}: Nội dung không được để trống hoặc chỉ có khoảng trắng!`);
            }

            // Image bắt buộc cho các part cần ảnh
            if (requireImage && !validateString(q.imageUrl)) {
                errors.push(`Câu hỏi ${qIdx + 1}: Image URL là bắt buộc!`);
            }
            // Image nếu có thì phải hợp lệ
            if (q.imageUrl && !validateString(q.imageUrl)) {
                errors.push(`Câu hỏi ${qIdx + 1}: Image URL không hợp lệ!`);
            }

            // Validate options cho L&R
            if (!isWritingOrSpeaking && (q.options || []).length > 0) {
                // Kiểm tra tất cả options phải có nội dung (không chỉ space)
                (q.options || []).forEach((opt, optIdx) => {
                    if (!validateString(opt.content)) {
                        errors.push(`Câu hỏi ${qIdx + 1}, Đáp án ${opt.label}: Không được để trống hoặc chỉ có khoảng trắng!`);
                    }
                });

                // Kiểm tra phải chọn ít nhất 1 đáp án đúng
                const hasCorrectAnswer = (q.options || []).some(opt => opt.isCorrect && validateString(opt.content));
                if (!hasCorrectAnswer) {
                    errors.push(`Câu hỏi ${qIdx + 1}: Phải chọn ít nhất 1 đáp án đúng!`);
                }
            }
        });

        // Validate questions trong groups
        (partData.groups || []).forEach((g, gIdx) => {
            // Passage bắt buộc cho parts 6, 7 (không bắt buộc cho parts 3, 4)
            const isPassageOptional = [3, 4].includes(partId);
            if (!isPassageOptional && !validateString(g.passage)) {
                errors.push(`Nhóm ${gIdx + 1}: Passage không được để trống hoặc chỉ có khoảng trắng!`);
            }
            
            (g.questions || []).forEach((q, qIdx) => {
                if (!validateString(q.content)) {
                    errors.push(`Nhóm ${gIdx + 1}, Câu hỏi ${qIdx + 1}: Nội dung không được để trống hoặc chỉ có khoảng trắng!`);
                }

                // Image bắt buộc cho các part cần ảnh
                if (requireImage && !validateString(q.imageUrl)) {
                    errors.push(`Nhóm ${gIdx + 1}, Câu hỏi ${qIdx + 1}: Image URL là bắt buộc!`);
                }
                // Image nếu có thì phải hợp lệ
                if (q.imageUrl && !validateString(q.imageUrl)) {
                    errors.push(`Nhóm ${gIdx + 1}, Câu hỏi ${qIdx + 1}: Image URL không hợp lệ!`);
                }

                // Validate options cho L&R
                if (!isWritingOrSpeaking && (q.options || []).length > 0) {
                    // Kiểm tra tất cả options phải có nội dung
                    (q.options || []).forEach((opt, optIdx) => {
                        if (!validateString(opt.content)) {
                            errors.push(`Nhóm ${gIdx + 1}, Câu hỏi ${qIdx + 1}, Đáp án ${opt.label}: Không được để trống hoặc chỉ có khoảng trắng!`);
                        }
                    });

                    // Kiểm tra phải chọn ít nhất 1 đáp án đúng
                    const hasCorrectAnswer = (q.options || []).some(opt => opt.isCorrect && validateString(opt.content));
                    if (!hasCorrectAnswer) {
                        errors.push(`Nhóm ${gIdx + 1}, Câu hỏi ${qIdx + 1}: Phải chọn ít nhất 1 đáp án đúng!`);
                    }
                }
            });
        });

        // Nếu có lỗi, hiển thị và không cho lưu
        if (errors.length > 0) {
            message.error(`Có ${errors.length} lỗi trong dữ liệu Part ${partId}. Vui lòng kiểm tra lại.`);
            return;
        }

        // Build part payload
        const partPayload = {
            groups: (partData.groups || []).map(g => ({
                passage: trimOrNull(g.passage),
                imageUrl: trimOrNull(g.imageUrl),
                questions: (g.questions || []).map(q => {
                    const isWritingOrSpeaking = isWritingOrSpeakingPart(partId);
                    const optionsPayload = isWritingOrSpeaking ? [] : (q.options || []).map(o => ({
                        label: o.label,
                        content: trimOrNull(o.content),
                        isCorrect: o.isCorrect || false,
                    }));
                    
                    return {
                        content: trimOrNull(q.content),
                        imageUrl: trimOrNull(q.imageUrl),
                        options: optionsPayload,
                        explanation: trimOrNull(q.explanation),
                    };
                }),
            })),
            questions: (partData.questions || []).map(q => {
                const isWritingOrSpeaking = isWritingOrSpeakingPart(partId);
                const optionsPayload = isWritingOrSpeaking ? [] : (q.options || []).map(o => ({
                    label: o.label,
                    content: trimOrNull(o.content),
                    isCorrect: o.isCorrect || false,
                }));
                
                return {
                    content: trimOrNull(q.content),
                    imageUrl: trimOrNull(q.imageUrl),
                    options: optionsPayload,
                    explanation: trimOrNull(q.explanation),
                };
            }),
        };

        try {
            setSavingPartId(partId);
            await saveTestPart(testId, partId, partPayload);
            message.success(`Đã lưu Part ${partId} thành công!`);
            setShowValidation(false);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error(`Error saving part ${partId}:`, error);
            const errorMessage = getErrorMessage(error);
            const normalizedError = (errorMessage || "").toLowerCase();

            if (normalizedError.includes("cannot edit a published test")) {
                const shouldClone = await confirmCloneVersion();
                if (!shouldClone) {
                    message.info("Đã hủy thao tác tạo phiên bản mới.");
                } else {
                    try {
                        const newId = await clonePublishedTestToDraft();
                        if (newId) {
                            await saveTestPart(newId, partId, partPayload);
                            message.success(`Đã tạo phiên bản mới (ID ${newId}) và lưu Part ${partId} thành công!`);
                            setShowValidation(false);
                        } else {
                            message.success("Đã tạo phiên bản mới. Vui lòng mở lại bài thi để tiếp tục chỉnh sửa.");
                        }
                    } catch (cloneError) {
                        console.error("clonePublishedTestToDraft error:", cloneError);
                        const cloneMessage = getErrorMessage(cloneError);
                        message.error(`Không thể tạo phiên bản mới: ${cloneMessage}`);
                    }
                }
            } else {
                message.error(`Lỗi khi lưu Part ${partId}: ${errorMessage}`);
            }
        } finally {
            setSavingPartId(null);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (!selectedSkill) {
                message.warning("Vui lòng chọn kỹ năng!");
                return;
            }
            if (currentTestId) {
                message.info("Bài thi đã được tạo. Bạn có thể thêm câu hỏi và lưu từng part.");
                return;
            }

            // Tạo draft test ngay
            setLoading(true);
            
            const draftPayload = {
                title: (values.title || "").trim(),
                testSkill: selectedSkill,
                description: values.description ? values.description.trim() : null,
                audioUrl: audioUrl ? audioUrl.trim() : null,
            };
            
            const response = await createTestDraft(draftPayload);
            
            let testId = response;
            if (typeof response === 'object' && response !== null) {
                testId = response.id || response.testId || response.Id || response.TestId;
            }
            
            if (typeof testId === 'string') {
                const numberMatch = testId.match(/\d+/);
                if (numberMatch) {
                    testId = Number(numberMatch[0]);
                } else if (!/^\d+$/.test(testId)) {
                    throw new Error(`Không thể extract ID từ response: ${testId}`);
                } else {
                    testId = Number(testId);
                }
            }

            if (!testId || typeof testId !== 'number' || isNaN(testId)) {
                throw new Error(`ID bài thi không hợp lệ: ${JSON.stringify(response)}`);
            }
            
            setCurrentTestId(testId);
            message.success("Đã tạo bài thi draft! Bạn có thể thêm câu hỏi cho từng part và lưu lại.");
            
            setShowValidation(false);
            

            if (!parts.length) {
                const loadedParts = await loadPartsBySkill(selectedSkill);
                setParts(loadedParts);
                
                const newPartsData = {};
                loadedParts.forEach(p => {
                    newPartsData[p.partId] = { groups: [], questions: [] };
                });
                setPartsData(newPartsData);
                
                if (loadedParts.length > 0) {
                    setActivePartTab(loadedParts[0].partId);
                }
            } else {
                const newPartsData = { ...partsData };
                parts.forEach(p => {
                    if (!newPartsData[p.partId]) {
                        newPartsData[p.partId] = { groups: [], questions: [] };
                    }
                });
                setPartsData(newPartsData);
            }
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error creating draft test:", error);
            console.error("Error response:", error.response?.data);
            
            const errorMessage = error.response?.data?.message 
                || error.response?.data?.data 
                || error.message 
                || "Unknown error";
            
            message.error("Lỗi khi tạo bài thi: " + errorMessage);
        } finally {
            setLoading(false);
        }
    };


    const totalQuestions = calculateTotalQuestions();
    const expectedTotal = selectedSkill ? TOTAL_QUESTIONS_BY_SKILL[selectedSkill] : 0;

    return (
        <Modal
            title={readOnly ? "Xem Bài Thi Mô Phỏng" : (currentTestId ? "Chỉnh Sửa Bài Thi Mô Phỏng" : "Tạo Bài Thi Mô Phỏng")}
            open={open}
            onCancel={onClose}
            onOk={readOnly ? undefined : handleSubmit}
            width={1400}
            confirmLoading={loading}
            okText={currentTestId ? "Đã tạo" : "Tạo bài thi"}
            cancelText="Hủy"
            footer={readOnly ? null : (
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={loading}
                        style={{ marginLeft: 8 }}
                    >
                        {currentTestId ? "Đã tạo" : "Tạo bài thi"}
                    </Button>
                </div>
            )}
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
                            validateTrigger={['onBlur']}
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (!value || !String(value).trim()) {
                                            return Promise.reject(new Error("Vui lòng nhập tiêu đề!"));
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <Input 
                                placeholder="Ví dụ: TOEIC Simulator Test 1" 
                                disabled={readOnly}
                                onChange={() => {
                                    const errors = form.getFieldsError(['title']);
                                    if (errors[0]?.errors?.length > 0) {
                                        form.setFields([{ name: 'title', errors: [] }]);
                                    }
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="skill"
                            label="Kỹ năng"
                            validateTrigger={['onBlur', 'onChange']}
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (!value) {
                                            return Promise.reject(new Error("Vui lòng chọn kỹ năng!"));
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn kỹ năng"
                                onChange={(value) => {
                                    handleSkillChange(value);
                                    const errors = form.getFieldsError(['skill']);
                                    if (errors[0]?.errors?.length > 0) {
                                        form.setFields([{ name: 'skill', errors: [] }]);
                                    }
                                }}
                                onFocus={() => {
                                    form.validateFields(['title']);
                                }}
                                disabled={readOnly || !!editingId}
                            >
                                <Option value={TEST_SKILL.LR}>Nghe & Đọc</Option>
                                <Option value={TEST_SKILL.SPEAKING}>Nói</Option>
                                <Option value={TEST_SKILL.WRITING}>Viết</Option>
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
                                <div style={{ marginTop: 8, position: "relative" }}>
                                    <audio
                                        controls
                                        preload="none"
                                        src={audioUrl}
                                        style={{ width: "100%" }}
                                    />
                                    {!readOnly && (
                                        <Button
                                            danger
                                            type="primary"
                                            icon={<DeleteOutlined />}
                                            size="small"
                                            onClick={() => setAudioUrl(null)}
                                            style={{
                                                marginTop: 8,
                                            }}
                                        >
                                            Xóa audio
                                        </Button>
                                    )}
                                </div>
                            )}
                        </Space>
                    </Form.Item>
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
                                <Col span={12}>
                                    <Statistic
                                        title="Tổng số câu"
                                        value={totalQuestions}
                                        suffix={`/ ${expectedTotal}`}
                                        valueStyle={{
                                            color: totalQuestions === expectedTotal ? "#52c41a" : "#faad14"
                                        }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Số Parts"
                                        value={parts.length}
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
                                        {/* Single Questions - Chỉ hiển thị cho các part không phải group parts */}
                                        {!isGroupPart(part.partId) && (
                                            <div style={{ marginBottom: 16 }}>
                                                {part.partId === 6 && (
                                                    <Alert
                                                        message="Lưu ý"
                                                        description={`Part ${part.partId} không yêu cầu nội dung câu hỏi. Câu hỏi sẽ dựa vào passage và đáp án.`}
                                                        type="info"
                                                        showIcon
                                                        style={{ marginBottom: 12 }}
                                                    />
                                                )}
                                                {[1, 2].includes(part.partId) && (
                                                    <Alert
                                                        message="Lưu ý"
                                                        description={`Part ${part.partId}: Nội dung câu hỏi là tùy chọn. Bạn có thể nhập hoặc để trống.`}
                                                        type="info"
                                                        showIcon
                                                        style={{ marginBottom: 12 }}
                                                    />
                                                )}
                                                <Space style={{ marginBottom: 8 }}>
                                                    <strong>Câu hỏi đơn ({partData.questions?.length || 0})</strong>
                                                </Space>
                                            <Collapse>
                                                {(partData.questions || []).map((q, qIdx) => {
                                                    const questionLabel = `Part ${part.partId}: Câu ${qIdx + 1}`;
                                                    return (
                                                    <Panel
                                                        header={questionLabel}
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
                                                            showValidation={showValidation}
                                                        />
                                                    </Panel>
                                                    );
                                                })}
                                            </Collapse>
                                            {/* Nút thêm câu hỏi ở dưới cùng */}
                                            {!readOnly && (
                                                <div style={{ marginTop: 16, textAlign: "center" }}>
                                                    <Button
                                                        type="dashed"
                                                        size="large"
                                                        icon={<PlusOutlined />}
                                                        onClick={() => addQuestion(part.partId)}
                                                        style={{ width: "100%" }}
                                                    >
                                                        Thêm câu hỏi
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        )}

                                        {/* Question Groups - Chỉ hiển thị cho các part hỗ trợ groups */}
                                        {supportsQuestionGroups(part.partId) && (
                                            <div>
                                                {isGroupPart(part.partId) && (
                                                    <Alert
                                                        message="Lưu ý"
                                                        description={`Part ${part.partId} chỉ hỗ trợ nhóm câu hỏi (Group Questions). ${[3, 4].includes(part.partId) ? 'Passage là tùy chọn cho part này.' : 'Passage là bắt buộc cho part này.'}`}
                                                        type="info"
                                                        showIcon
                                                        style={{ marginBottom: 12 }}
                                                    />
                                                )}
                                                <Space style={{ marginBottom: 8 }}>
                                                    <strong>Nhóm câu hỏi ({partData.groups?.length || 0})</strong>
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
                                                                showValidation={showValidation}
                                                            />
                                                        </Panel>
                                                    ))}
                                                </Collapse>
                                                {/* Nút thêm nhóm ở dưới cùng */}
                                                {!readOnly && (
                                                    <div style={{ marginTop: 16, textAlign: "center" }}>
                                                        <Button
                                                            type="dashed"
                                                            size="large"
                                                            icon={<PlusOutlined />}
                                                            onClick={() => addGroup(part.partId)}
                                                            style={{ width: "100%" }}
                                                        >
                                                            Thêm nhóm
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Nút Lưu Part */}
                                        {!readOnly && currentTestId && (
                                            <div style={{ marginTop: 16, textAlign: "right" }}>
                                                <Button
                                                    type="primary"
                                                    icon={<CheckCircleOutlined />}
                                                    loading={savingPartId === part.partId}
                                                    onClick={() => handleSavePart(part.partId)}
                                                >
                                                    Lưu Part {part.partId}
                                                </Button>
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
function QuestionEditor({ question, partId, questionIndex, skill, onUpdate, onUpdateOption, readOnly, showValidation = false }) {
    const [contentValidated, setContentValidated] = useState(false);
    const [imageValidated, setImageValidated] = useState(false);
    
    // Kiểm tra part nào cần ảnh
    const imageConfig = requiresImage(partId, skill);
    const requireImage = imageConfig.required;
    const showImage = imageConfig.show;
    // Writing và Speaking parts không có options (partId 8-15)
    const isWritingOrSpeaking = isWritingOrSpeakingPart(partId);
    
    // Part 6: không hiển thị trường content
    // Part 1, 2: hiển thị trường content nhưng là tùy chọn (không bắt buộc)
    const isContentVisible = partId !== 6;
    
    // Helper để validate string
    const isValidString = (value) => {
        if (!value || typeof value !== "string") return false;
        return value.trim().length > 0;
    };

    // Reset validation states khi showValidation thay đổi hoặc khi question content/imageUrl hợp lệ
    useEffect(() => {
        if (!showValidation) {
            // Reset khi tắt showValidation
            if (isValidString(question.content)) {
                setContentValidated(false);
            }
            if (isValidString(question.imageUrl)) {
                setImageValidated(false);
            }
        }
    }, [showValidation, question.content, question.imageUrl]);

    // Validate các fields - hiển thị lỗi khi showValidation = true hoặc khi đã validated
    // Content chỉ bắt buộc cho các part không phải 1, 2, 6
    const shouldShowContentError = showValidation || contentValidated;
    const isContentOptional = [1, 2, 6].includes(partId);
    const contentError = shouldShowContentError && !isContentOptional && !isValidString(question.content) ? "Nội dung câu hỏi không được để trống!" : "";
    
    const shouldShowImageError = showValidation || imageValidated;
    const imageError = shouldShowImageError && showImage && requireImage && !isValidString(question.imageUrl) 
        ? "Image URL là bắt buộc!" 
        : shouldShowImageError && showImage && question.imageUrl && !isValidString(question.imageUrl)
        ? "Image URL không hợp lệ!"
        : "";
    const explanationError = showValidation && question.explanation && !isValidString(question.explanation) 
        ? "Giải thích không hợp lệ!" 
        : "";
    
    return (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {/* Chỉ hiển thị trường content cho các part không phải 6 */}
            {isContentVisible && (
                <Form.Item 
                    label="Nội dung câu hỏi"
                    required={!isContentOptional}
                    validateStatus={contentError ? "error" : ""}
                    help={contentError}
                >
                    <TextArea
                        value={question.content || ""}
                        onChange={(e) => {
                            onUpdate("content", e.target.value);
                            // Xóa lỗi khi đang sửa
                            if (contentValidated && isValidString(e.target.value)) {
                                setContentValidated(false);
                            }
                        }}
                        onBlur={() => {
                            // Validate khi blur (chỉ cho các part bắt buộc)
                            if (!isContentOptional && !isValidString(question.content)) {
                                setContentValidated(true);
                            }
                        }}
                        rows={3}
                        disabled={readOnly}
                        status={contentError ? "error" : ""}
                        placeholder={isContentOptional ? "Nhập nội dung câu hỏi (nếu có)" : "Nhập nội dung câu hỏi"}
                    />
                </Form.Item>
            )}

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
                            onChange={(e) => {
                                onUpdate("imageUrl", e.target.value);
                                // Xóa lỗi khi đang sửa
                                if (imageValidated && isValidString(e.target.value)) {
                                    setImageValidated(false);
                                }
                            }}
                            onFocus={() => {
                                // Validate trường content khi focus vào Image
                                if (!isValidString(question.content)) {
                                    setContentValidated(true);
                                }
                            }}
                            onBlur={() => {
                                // Validate khi blur (nếu bắt buộc)
                                if (requireImage && !isValidString(question.imageUrl)) {
                                    setImageValidated(true);
                                }
                            }}
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
                                beforeUpload={() => {
                                    if (!isContentOptional && !isValidString(question.content)) {
                                        setContentValidated(true);
                                        return false; // Prevent upload
                                    }
                                    return true;
                                }}
                            >
                                <Button 
                                    icon={<PictureOutlined />} 
                                    size="small"
                                    onClick={() => {
                                        // Chỉ yêu cầu content cho các part mà nội dung là bắt buộc
                                        if (!isContentOptional && !isValidString(question.content)) {
                                            setContentValidated(true);
                                        }
                                    }}
                                >
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
                                {!readOnly && (
                                    <Button
                                        danger
                                        type="primary"
                                        icon={<DeleteOutlined />}
                                        size="small"
                                        onClick={() => onUpdate("imageUrl", "")}
                                        style={{
                                            marginTop: 8,
                                        }}
                                    >
                                        Xóa ảnh
                                    </Button>
                                )}
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
                    onFocus={() => {
                        // Validate các trường trước đó khi focus vào Giải thích
                        if (!isValidString(question.content)) {
                            setContentValidated(true);
                        }
                        if (requireImage && !isValidString(question.imageUrl)) {
                            setImageValidated(true);
                        }
                    }}
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
                            const optionError = showValidation && !isValidString(option.content) ? "Đáp án không được để trống!" : "";
                            
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
                                                onFocus={() => {
                                                    // Validate các trường trước đó khi focus vào đáp án
                                                    if (!isValidString(question.content)) {
                                                        setContentValidated(true);
                                                    }
                                                    if (requireImage && !isValidString(question.imageUrl)) {
                                                        setImageValidated(true);
                                                    }
                                                }}
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
                            return showValidation && !hasCorrectAnswer && (question.options || []).length > 0 ? (
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
function GroupEditor({ group, partId, groupIndex, skill, onUpdate, onUpdateQuestion, onUpdateOption, onAddQuestion, onDeleteQuestion, readOnly, showValidation = false }) {
    // Helper để validate string
    const isValidString = (value) => {
        if (!value || typeof value !== "string") return false;
        return value.trim().length > 0;
    };

    // Parts 3, 4: không hiển thị trường passage
    const isPassageVisible = !([3, 4].includes(partId));
    const isPassageOptional = [3, 4].includes(partId);

    // Validate group fields - chỉ hiển thị lỗi khi showValidation = true
    const passageError = showValidation && !isPassageOptional && !isValidString(group.passage) 
        ? "Passage không được để trống!" 
        : showValidation && group.passage && !isValidString(group.passage) 
        ? "Passage không hợp lệ!" 
        : "";
    const imageError = showValidation && group.imageUrl && !isValidString(group.imageUrl) ? "Image URL không hợp lệ!" : "";
    
    return (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {/* Chỉ hiển thị trường passage cho các part không phải 3, 4 */}
            {isPassageVisible && (
                <Form.Item 
                    label="Passage/Đoạn văn"
                    required={!isPassageOptional}
                    validateStatus={passageError ? "error" : ""}
                    help={passageError}
                >
                    <TextArea
                        value={group.passage || ""}
                        onChange={(e) => onUpdate("passage", e.target.value)}
                        rows={6}
                        placeholder={isPassageOptional ? "Nhập passage/đoạn văn cho nhóm câu hỏi (tùy chọn)" : "Nhập passage/đoạn văn cho nhóm câu hỏi"}
                        disabled={readOnly}
                        status={passageError ? "error" : ""}
                    />
                </Form.Item>
            )}

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
                                {!readOnly && (
                                    <Button
                                        danger
                                        type="primary"
                                        icon={<DeleteOutlined />}
                                        size="small"
                                        onClick={() => onUpdate("imageUrl", "")}
                                        style={{
                                            marginTop: 8,
                                        }}
                                    >
                                        Xóa ảnh
                                    </Button>
                                )}
                            </div>
                        )}
                    </Space>
                </Form.Item>
            )}


            <Form.Item
                label={<span>Câu hỏi trong nhóm ({group.questions?.length || 0})</span>}
            >
                <Collapse>
                    {(group.questions || []).map((q, qIdx) => {
                        const questionLabel = `Part ${partId}: Câu ${qIdx + 1}`;
                        return (
                        <Panel
                            header={questionLabel}
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
                                showValidation={showValidation}
                            />
                        </Panel>
                        );
                    })}
                </Collapse>
                {/* Nút thêm câu hỏi trong nhóm ở dưới cùng */}
                {!readOnly && (
                    <div style={{ marginTop: 16, textAlign: "center" }}>
                        <Button
                            type="dashed"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={onAddQuestion}
                            style={{ width: "100%" }}
                        >
                            Thêm câu hỏi
                        </Button>
                    </div>
                )}
            </Form.Item>
        </Space>
    );
}

