import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, message, Tabs, Collapse, Space, Tag, Row, Col, Statistic, Upload, Alert } from "antd";
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined, UploadOutlined, PictureOutlined } from "@ant-design/icons";
import { createTestManual, getTestById, updateTestManual } from "@services/testsService";
import { uploadFile } from "@services/filesService";
import { loadPartsBySkill, TOTAL_QUESTIONS_BY_SKILL, TEST_SKILL, PART_QUESTION_COUNT, validateTestStructure, requiresAudio, supportsQuestionGroups, createDefaultOptions } from "@shared/constants/toeicStructure";
import { TEST_TYPE } from "@shared/constants/toeicStructure";

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

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
                const newPartsData = {};
                
                loadedParts.forEach(p => {
                    newPartsData[p.partId] = { groups: [], questions: [] };
                });

                partsArr.forEach((p) => {
                    const partId = p.partId || p.PartId;
                    if (!newPartsData[partId]) {
                        newPartsData[partId] = { groups: [], questions: [] };
                    }

                    const tqs = p.testQuestions || p.TestQuestions || [];
                    tqs.forEach((tq) => {
                        const isGroup = tq.isGroup ?? tq.IsGroup;
                        if (isGroup) {
                            const gSnap = tq.questionGroupSnapshotDto || tq.QuestionGroupSnapshotDto;
                            if (gSnap) {
                                newPartsData[partId].groups.push({
                                    passage: gSnap.passage || gSnap.Passage || "",
                                    imageUrl: gSnap.imageUrl || gSnap.ImageUrl || "",
                                    audioUrl: gSnap.audioUrl || gSnap.AudioUrl || "",
                                    questions: (gSnap.questionSnapshots || gSnap.QuestionSnapshots || []).map(q => {
                                        const loadedOptions = (q.options || q.Options || []).map(o => ({
                                            label: o.label || o.Label || "",
                                            content: o.content || o.Content || "",
                                            isCorrect: o.isCorrect || o.IsCorrect || false,
                                        }));
                                        // Đảm bảo số lượng options đúng với part (Part 2 = 3, các part khác = 4)
                                        const expectedCount = createDefaultOptions(partId).length;
                                        const normalizedOptions = loadedOptions.slice(0, expectedCount);
                                        // Nếu thiếu, bổ sung options rỗng
                                        while (normalizedOptions.length < expectedCount) {
                                            const labels = ['A', 'B', 'C', 'D'];
                                            normalizedOptions.push({
                                                label: labels[normalizedOptions.length],
                                                content: "",
                                                isCorrect: false,
                                            });
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
                            }
                        } else {
                            const qSnap = tq.questionSnapshotDto || tq.QuestionSnapshotDto;
                            if (qSnap) {
                                const loadedOptions = (qSnap.options || qSnap.Options || []).map(o => ({
                                    label: o.label || o.Label || "",
                                    content: o.content || o.Content || "",
                                    isCorrect: o.isCorrect || o.IsCorrect || false,
                                }));
                                // Đảm bảo số lượng options đúng với part (Part 2 = 3, các part khác = 4)
                                const expectedCount = createDefaultOptions(partId).length;
                                const normalizedOptions = loadedOptions.slice(0, expectedCount);
                                // Nếu thiếu, bổ sung options rỗng
                                while (normalizedOptions.length < expectedCount) {
                                    const labels = ['A', 'B', 'C', 'D'];
                                    normalizedOptions.push({
                                        label: labels[normalizedOptions.length],
                                        content: "",
                                        isCorrect: false,
                                    });
                                }
                                newPartsData[partId].questions.push({
                                    content: qSnap.content || qSnap.Content || "",
                                    imageUrl: qSnap.imageUrl || qSnap.ImageUrl || "",
                                    audioUrl: qSnap.audioUrl || qSnap.AudioUrl || "",
                                    explanation: qSnap.explanation || qSnap.Explanation || "",
                                    options: normalizedOptions,
                                });
                            }
                        }
                    });
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
        const defaultOptions = createDefaultOptions(partId);
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
        const defaultOptions = createDefaultOptions(partId);
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
        const defaultOptions = createDefaultOptions(partId);
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

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (!selectedSkill) {
                message.warning("Vui lòng chọn kỹ năng!");
                return;
            }

            // Build parts data cho API
            const partsPayload = parts.map(p => {
                const partData = partsData[p.partId] || { groups: [], questions: [] };
                return {
                    partId: p.partId,
                    groups: (partData.groups || []).map(g => ({
                        passage: g.passage || null,
                        imageUrl: g.imageUrl || null,
                        audioUrl: g.audioUrl || null,
                        questions: (g.questions || []).map(q => ({
                            content: q.content || null,
                            imageUrl: q.imageUrl || null,
                            audioUrl: q.audioUrl || null,
                            explanation: q.explanation || null,
                            options: (q.options || []).map(o => ({
                                label: o.label,
                                content: o.content || null,
                                isCorrect: o.isCorrect || false,
                            })),
                        })),
                    })),
                    questions: (partData.questions || []).map(q => ({
                        content: q.content || null,
                        imageUrl: q.imageUrl || null,
                        audioUrl: q.audioUrl || null,
                        explanation: q.explanation || null,
                        options: (q.options || []).map(o => ({
                            label: o.label,
                            content: o.content || null,
                            isCorrect: o.isCorrect || false,
                        })),
                    })),
                };
            });

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

            // Kiểm tra image bắt buộc cho Part 1
            const part1Data = partsPayload.find(p => p.partId === 1);
            if (part1Data) {
                // Kiểm tra questions đơn trong Part 1
                const part1Questions = part1Data.questions || [];
                const part1MissingImage = part1Questions.some(q => !q.imageUrl || q.imageUrl.trim() === "");
                
                // Kiểm tra questions trong groups của Part 1
                const part1Groups = part1Data.groups || [];
                const part1GroupMissingImage = part1Groups.some(g => {
                    const questions = g.questions || [];
                    return questions.some(q => !q.imageUrl || q.imageUrl.trim() === "");
                });

                if (part1MissingImage || part1GroupMissingImage) {
                    message.warning("Part 1 (Photographs) yêu cầu Image URL cho tất cả câu hỏi!");
                    return;
                }
            }

            const payload = {
                title: values.title,
                testSkill: selectedSkill,
                testType: TEST_TYPE.SIMULATOR,
                description: values.description || null,
                audioUrl: audioUrl || null,
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
function QuestionEditor({ question, partId, questionIndex, onUpdate, onUpdateOption, readOnly }) {
    // Part 1 (L-Part 1: Photographs) bắt buộc phải có ảnh
    const requireImage = partId === 1;
    
    return (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Form.Item label="Nội dung câu hỏi">
                <TextArea
                    value={question.content || ""}
                    onChange={(e) => onUpdate("content", e.target.value)}
                    rows={3}
                    disabled={readOnly}
                />
            </Form.Item>

            <Form.Item 
                label={requireImage ? "Image (Bắt buộc)" : "Image"}
                required={requireImage}
            >
                <Space direction="vertical" style={{ width: "100%" }} size="small">
                    <Input
                        value={question.imageUrl || ""}
                        onChange={(e) => onUpdate("imageUrl", e.target.value)}
                        placeholder={requireImage ? "URL hình ảnh (bắt buộc)" : "URL hình ảnh (nếu có)"}
                        disabled={readOnly}
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


            <Form.Item label="Giải thích">
                <TextArea
                    value={question.explanation || ""}
                    onChange={(e) => onUpdate("explanation", e.target.value)}
                    rows={2}
                    disabled={readOnly}
                />
            </Form.Item>

            <Form.Item label="Đáp án">
                <Space direction="vertical" style={{ width: "100%" }}>
                    {(question.options || []).map((option, oIdx) => (
                        <Row key={oIdx} gutter={8} align="middle">
                            <Col span={2}>
                                <Tag>{option.label}</Tag>
                            </Col>
                            <Col span={18}>
                                <Input
                                    value={option.content || ""}
                                    onChange={(e) => onUpdateOption(oIdx, "content", e.target.value)}
                                    placeholder={`Nhập đáp án ${option.label}`}
                                    disabled={readOnly}
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
                    ))}
                </Space>
            </Form.Item>
        </Space>
    );
}

// Component để edit một nhóm câu hỏi
function GroupEditor({ group, partId, groupIndex, onUpdate, onUpdateQuestion, onUpdateOption, onAddQuestion, onDeleteQuestion, readOnly }) {
    return (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Form.Item label="Passage/Đoạn văn">
                <TextArea
                    value={group.passage || ""}
                    onChange={(e) => onUpdate("passage", e.target.value)}
                    rows={6}
                    placeholder="Nhập passage/đoạn văn cho nhóm câu hỏi"
                    disabled={readOnly}
                />
            </Form.Item>

            <Form.Item label="Image">
                <Space direction="vertical" style={{ width: "100%" }} size="small">
                    <Input
                        value={group.imageUrl || ""}
                        onChange={(e) => onUpdate("imageUrl", e.target.value)}
                        placeholder="URL hình ảnh cho nhóm (nếu có)"
                        disabled={readOnly}
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

