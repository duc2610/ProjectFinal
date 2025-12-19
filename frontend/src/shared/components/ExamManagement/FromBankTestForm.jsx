import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, message, Tabs, Table, Space, Tag, Row, Col, Statistic, Alert, Drawer, Divider } from "antd";
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { createTestFromBank, getTestById, updateTestFromBank, createTestFromBankRandom } from "@services/testsService";
import { getQuestionById } from "@services/questionsService";
import { getQuestionGroupById } from "@services/questionGroupService";
import { loadPartsBySkill, TOTAL_QUESTIONS_BY_SKILL, TEST_SKILL } from "@shared/constants/toeicStructure";
import QuestionBankSelectorModal from "./QuestionBankSelectorModal";
import QuestionGroupSelectorModal from "./QuestionGroupSelectorModal";

// Parts chỉ dành cho group questions:
// - Listening: 3, 4
// - Reading: 6, 7
// - Speaking: 13, 14
const GROUP_PARTS = [3, 4, 6, 7, 13, 14];
const isGroupPart = (p) => GROUP_PARTS.includes(Number(p));

const { TextArea } = Input;
const { Option } = Select;

export default function FromBankTestForm({ open, onClose, onSuccess, editingId = null, readOnly = false }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [parts, setParts] = useState([]);
    const [selectedSingleQuestions, setSelectedSingleQuestions] = useState([]);
    const [selectedGroupQuestions, setSelectedGroupQuestions] = useState([]);
    const [questionDetails, setQuestionDetails] = useState({});
    const [groupDetails, setGroupDetails] = useState({}); 
    const [viewingQuestionId, setViewingQuestionId] = useState(null);
    const [viewingGroupId, setViewingGroupId] = useState(null);
    const [activeTab, setActiveTab] = useState("single");
    const [selectionMode, setSelectionMode] = useState("manual");
    const [questionRanges, setQuestionRanges] = useState([]);
    const [isEditingPublished, setIsEditingPublished] = useState(false);
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [detailMode, setDetailMode] = useState(null); // "single" | "group"
    const [detailId, setDetailId] = useState(null);

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

    const normalizeVisibilityStatusValue = (value) => {
        if (value === undefined || value === null) return undefined;
        const str = String(value).toLowerCase();
        if (str === "published" || str === "1" || str === "3" || str === "active") return "Published";
        if (str === "hidden" || str === "hide" || str === "-1" || str === "0" || str === "inactive") {
            return "Hidden";
        }
        return undefined;
    };

    const loadQuestionDetails = async (questionIds) => {
        const details = {};
        for (const qid of questionIds) {
            if (!questionDetails[qid]) {
                try {
                    const question = await getQuestionById(qid);
                    const q = question?.data || question || {};
                    const options = (q.options || q.Options || []).map(opt => ({
                        label: opt.label || opt.Label || "",
                        content: opt.content || opt.Content || "",
                        isCorrect: opt.isCorrect || opt.IsCorrect || false,
                    }));
                    details[qid] = {
                        content: q.content || q.Content || "",
                        partName: q.partName || q.PartName || q.part?.name || "",
                        questionTypeName: q.questionTypeName || q.QuestionTypeName || q.questionType?.typeName || q.questionType?.name || q.type?.name || "",
                        options: options,
                        audioUrl: q.audioUrl || q.AudioUrl || "",
                        imageUrl: q.imageUrl || q.ImageUrl || "",
                        explanation: q.explanation || q.Explanation || q.solution || q.Solution || "",
                    };
                } catch (error) {
                    console.error(`Error loading question ${qid}:`, error);
                    details[qid] = {
                        content: "Không tải được nội dung",
                        partName: "",
                        questionTypeName: "",
                        options: [],
                        imageUrl: "",
                        explanation: "",
                    };
                }
            } else {
                details[qid] = questionDetails[qid];
            }
        }
        setQuestionDetails(prev => ({ ...prev, ...details }));
    };

    const loadGroupDetails = async (groupIds) => {
        const details = {};
        for (const gid of groupIds) {
            if (!groupDetails[gid]) {
                try {
                    const group = await getQuestionGroupById(gid);
                    const g = group?.data || group || {};
                    const questions = (g.questions || g.Questions || []).map(q => ({
                        content: q.content || q.Content || "",
                        imageUrl: q.imageUrl || q.ImageUrl || "",
                        explanation: q.explanation || q.Explanation || "",
                        audioUrl: q.audioUrl || q.AudioUrl || "",
                        options: (q.options || q.Options || []).map(opt => ({
                            label: opt.label || opt.Label || "",
                            content: opt.content || opt.Content || "",
                            isCorrect: opt.isCorrect || opt.IsCorrect || false,
                        })),
                    }));
                    details[gid] = {
                        passage: g.passageContent || g.passage || g.PassageContent || g.Passage || "",
                        partName: g.partName || g.PartName || g.part?.name || "",
                        imageUrl: g.imageUrl || g.ImageUrl || "",
                        audioUrl: g.audioUrl || g.AudioUrl || "",
                        questions: questions,
                    };
                } catch (error) {
                    console.error(`Error loading group ${gid}:`, error);
                    details[gid] = {
                        passage: "Không tải được nội dung",
                        partName: "",
                        imageUrl: "",
                        questions: [],
                    };
                }
            } else {
                details[gid] = groupDetails[gid];
            }
        }
        setGroupDetails(prev => ({ ...prev, ...details }));
    };

    useEffect(() => {
        if (!open) return;
        
        // Chỉ reset khi mở modal mới (không phải edit) hoặc khi editingId thay đổi
        const shouldReset = !editingId;
        
        if (shouldReset) {
            form.resetFields();
            setParts([]);
            setSelectedSingleQuestions([]);
            setSelectedGroupQuestions([]);
            setQuestionDetails({});
            setGroupDetails({});
            setViewingQuestionId(null);
            setViewingGroupId(null);
            setActiveTab("single");
            setSelectionMode("manual");
            setQuestionRanges([]);
            setIsEditingPublished(false);
        }

        const loadForEdit = async (id) => {
            try {
                const detail = await getTestById(id);
                const d = detail?.data || detail || {};
                const skillVal = toSkillId(d.testSkill ?? d.TestSkill);
                const titleVal = d.title ?? d.Title;
                const descVal = d.description ?? d.Description;
                const durationVal = d.duration ?? d.Duration;
                const visibilityRaw = d.visibilityStatus ?? d.VisibilityStatus ?? d.status ?? d.Status;
                const normalizedVisibility = normalizeVisibilityStatusValue(visibilityRaw);

                setSelectedSkill(skillVal);
                setIsEditingPublished(normalizedVisibility === "Published");
                form.setFieldsValue({
                    title: titleVal,
                    description: descVal,
                    duration: durationVal,
                    skill: skillVal,
                });

                const loadedParts = await loadPartsBySkill(skillVal);
                setParts(loadedParts);

                const singleIds = [];
                const groupIds = [];
                const partsArr = d.parts || d.Parts || [];
                
                if (partsArr && partsArr.length > 0) {
                    (partsArr).forEach((p) => {
                        const tqs = p.testQuestions || p.TestQuestions || [];
                        if (tqs && tqs.length > 0) {
                            tqs.forEach((tq) => {
                                // Check isGroup với nhiều cách parse để đảm bảo đúng
                                const isGroup = tq.isGroup === true || tq.IsGroup === true || 
                                               (typeof tq.isGroup === 'boolean' && tq.isGroup) ||
                                               (typeof tq.IsGroup === 'boolean' && tq.IsGroup);
                                
                                if (isGroup) {
                                    const gSnap = tq.questionGroupSnapshotDto || tq.QuestionGroupSnapshotDto;
                                    if (gSnap) {
                                        const gid = gSnap.questionGroupId ?? gSnap.QuestionGroupId ?? gSnap.id;
                                        // Chỉ thêm nếu ID hợp lệ (không phải 0, null, undefined)
                                        if (gid != null && gid !== 0 && !groupIds.includes(gid)) {
                                            groupIds.push(gid);
                                        }
                                    }
                                } else {
                                    const qSnap = tq.questionSnapshotDto || tq.QuestionSnapshotDto;
                                    if (qSnap) {
                                        const qid = qSnap.questionId ?? qSnap.QuestionId ?? qSnap.id;
                                        // Chỉ thêm nếu ID hợp lệ (không phải 0, null, undefined)
                                        if (qid != null && qid !== 0 && !singleIds.includes(qid)) {
                                            singleIds.push(qid);
                                        }
                                    }
                                }
                            });
                        }
                    });
                }

                setSelectedSingleQuestions(singleIds);
                setSelectedGroupQuestions(groupIds);
                

                if (singleIds.length > 0) {
                    loadQuestionDetails(singleIds);
                }
                
    
                if (groupIds.length > 0) {
                    loadGroupDetails(groupIds);
                    // Tự động chuyển sang tab group nếu có group questions
                    setActiveTab("group");
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
        setSelectedSingleQuestions([]);
        setSelectedGroupQuestions([]);
        
        // Load parts từ backend
        const loadedParts = await loadPartsBySkill(skill);
        setParts(loadedParts);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Xử lý mode Random
            if (selectionMode === "random") {
                if (!questionRanges || questionRanges.length === 0) {
                    message.warning("Vui lòng thêm ít nhất 1 cấu hình part!");
                    return;
                }

                // Validate question ranges
                for (const range of questionRanges) {
                    const partId = Number(range.partId);
                    const singleCount = Number(range.singleQuestionCount || 0);
                    const groupCount = Number(range.groupQuestionCount || 0);

                    if (isGroupPart(partId)) {
                        // Các part group (3, 4, 6, 7, 13, 14): chỉ cho phép group questions
                        if (singleCount > 0) {
                            message.error(`Part ${partId} chỉ có thể chọn nhóm câu hỏi (Group Questions), không thể chọn câu hỏi đơn (Single Questions).`);
                            return;
                        }
                        if (groupCount <= 0) {
                            message.error(`Part ${partId} cần có ít nhất 1 nhóm câu hỏi.`);
                            return;
                        }
                    } else {
                        // Các part khác: chỉ cho phép single questions
                        if (groupCount > 0) {
                            message.error(`Part ${partId} chỉ có thể chọn câu hỏi đơn (Single Questions), không thể chọn nhóm câu hỏi (Group Questions).`);
                            return;
                        }
                        if (singleCount <= 0) {
                            message.error(`Part ${partId} cần có ít nhất 1 câu hỏi đơn.`);
                            return;
                        }
                    }
                }

                const randomPayload = {
                    Title: values.title,
                    TestSkill: selectedSkill,
                    Description: values.description || null,
                    Duration: values.duration,
                    QuestionRanges: questionRanges.map(r => ({
                        PartId: Number(r.partId),
                        QuestionTypeId: r.questionTypeId ? Number(r.questionTypeId) : null,
                        SingleQuestionCount: isGroupPart(Number(r.partId)) ? 0 : Number(r.singleQuestionCount || 0),
                        GroupQuestionCount: isGroupPart(Number(r.partId)) ? Number(r.groupQuestionCount || 0) : 0,
                    })),
                };

                setLoading(true);
                try {
                    await createTestFromBankRandom(randomPayload);
                    message.success(`Tạo bài thi random thành công!`);
                    setTimeout(() => {
                        onSuccess();
                        onClose();
                    }, 300);
                } catch (error) {
                    console.error("Error creating random test:", error);
                    const errorMessage = error?.response?.data?.message || 
                                      error?.response?.data?.error || 
                                      error?.message || 
                                      "Unknown error";
                    message.error(`Lỗi khi tạo bài thi random: ${errorMessage}`);
                    throw error; // Re-throw để finally block vẫn chạy
                } finally {
                    setLoading(false);
                }
                return;
            }

            // Xử lý mode Manual (chọn thủ công)
            const totalQuestions = selectedSingleQuestions.length + selectedGroupQuestions.length;
            if (totalQuestions === 0) {
                message.warning("Vui lòng chọn ít nhất 1 câu hỏi!");
                return;
            }

            const payload = {
                title: values.title,
                testSkill: selectedSkill,
                testType: 2, // Practice = 2
                description: values.description || null,
                duration: values.duration,
                singleQuestionIds: selectedSingleQuestions,
                groupQuestionIds: selectedGroupQuestions,
            };

            // Nếu đang sửa 1 bài đã publish, hỏi confirm trước khi clone version mới
            if (editingId && isEditingPublished) {
                const confirmed = await new Promise((resolve) => {
                    Modal.confirm({
                        title: "Tạo phiên bản mới để chỉnh sửa?",
                        content:
                            "Bài thi luyện tập này đang được công khai. Hệ thống sẽ tạo một phiên bản mới (clone) để bạn chỉnh sửa, và ẩn các phiên bản cũ. Bạn có chắc chắn muốn tiếp tục?",
                        okText: "Tạo phiên bản mới",
                        cancelText: "Hủy",
                        onOk: () => resolve(true),
                        onCancel: () => resolve(false),
                    });
                });

                if (!confirmed) {
                    return;
                }
            }

            setLoading(true);
            if (editingId) {
                await updateTestFromBank(editingId, payload);
            } else {
                await createTestFromBank(payload);
            }

            message.success(editingId ? "Cập nhật bài thi thành công" : `Tạo bài thi thành công! (${totalQuestions} câu hỏi)`);
            
            // Sau khi update hoặc create thành công, đóng modal
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 300);
        } catch (error) {
            console.error("Error creating test:", error);
            const errorMessage = error?.response?.data?.message || 
                                error?.response?.data?.error || 
                                error?.message || 
                                "Unknown error";
            message.error(`Lỗi khi ${editingId ? 'cập nhật' : 'tạo'} bài thi: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleShowQuestionDetail = (questionId) => {
        if (!questionId) return;
        setDetailMode("single");
        setDetailId(questionId);
        setDetailDrawerOpen(true);
    };

    const handleShowGroupDetail = (groupId) => {
        if (!groupId) return;
        setDetailMode("group");
        setDetailId(groupId);
        setDetailDrawerOpen(true);
    };

    const totalSelected = selectedSingleQuestions.length + selectedGroupQuestions.length;
    const expectedTotal = selectedSkill ? TOTAL_QUESTIONS_BY_SKILL[selectedSkill] : 0;

    return (
        <Modal
            title={readOnly ? "Xem Bài Thi Luyện Tập" : (editingId ? "Cập nhật Bài Thi Luyện Tập" : "Tạo Bài Thi Luyện Tập từ Ngân hàng câu hỏi")}
            open={open}
            onCancel={onClose}
            onOk={readOnly ? undefined : handleSubmit}
            width={1200}
            confirmLoading={loading}
            okText={editingId ? "Cập nhật" : "Tạo bài thi"}
            cancelText="Hủy"
            footer={readOnly ? null : undefined}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    duration: 60,
                }}
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
                                placeholder="Ví dụ: Bài Thi Luyện Tập 1" 
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
                        <Form.Item
                            name="duration"
                            label="Thời lượng (phút)"
                            validateTrigger={['onBlur']}
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (!value && value !== 0) {
                                            return Promise.reject(new Error("Vui lòng nhập thời lượng!"));
                                        }
                                        if (value < 1 || value > 300) {
                                            return Promise.reject(new Error("Thời lượng phải từ 1 đến 300 phút!"));
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <InputNumber 
                                min={1} 
                                max={300} 
                                style={{ width: "100%" }} 
                                disabled={readOnly}
                                onChange={() => {
                                    const errors = form.getFieldsError(['duration']);
                                    if (errors[0]?.errors?.length > 0) {
                                        form.setFields([{ name: 'duration', errors: [] }]);
                                    }
                                }}
                                onFocus={() => {
                                    form.validateFields(['title', 'skill']);
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="description" label="Mô tả">
                    <TextArea rows={2} placeholder="Mô tả về bài thi (tùy chọn)" disabled={readOnly} />
                </Form.Item>

                {selectedSkill && (
                    <>
                        <Tabs
                            activeKey={selectionMode}
                            onChange={setSelectionMode}
                            items={[
                                { key: "manual", label: "Chọn thủ công" },
                                { key: "random", label: "Chọn random" },
                            ]}
                            style={{ marginBottom: 16 }}
                        />

                        {selectionMode === "manual" ? (
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
                                                title="Câu hỏi đơn đã chọn" 
                                                value={selectedSingleQuestions.length}
                                                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                                            />
                                        </Col>
                                        <Col span={8}>
                                            <Statistic 
                                                title="Nhóm câu hỏi đã chọn" 
                                                value={selectedGroupQuestions.length}
                                                prefix={<CheckCircleOutlined style={{ color: "#1890ff" }} />}
                                            />
                                        </Col>
                                        <Col span={8}>
                                            <Statistic 
                                                title="Tổng số câu" 
                                                value={totalSelected}
                                                suffix={`/ ${expectedTotal}`}
                                                valueStyle={{ 
                                                    color: totalSelected === expectedTotal ? "#52c41a" : "#faad14" 
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </div>

                                <QuestionSelector
                                    skill={selectedSkill}
                                    parts={parts}
                                    selectedSingleQuestions={selectedSingleQuestions}
                                    selectedGroupQuestions={selectedGroupQuestions}
                                    onSelectSingleQuestions={(ids) => {
                                        setSelectedSingleQuestions(ids);
                                        loadQuestionDetails(ids);
                                    }}
                                    onSelectGroupQuestions={(ids) => {
                                        setSelectedGroupQuestions(ids);
                                        loadGroupDetails(ids);
                                    }}
                                    questionDetails={questionDetails}
                                    groupDetails={groupDetails}
                                    viewingQuestionId={null}
                                    viewingGroupId={null}
                                    setViewingQuestionId={null}
                                    setViewingGroupId={null}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    readOnly={readOnly}
                                    onShowQuestionDetail={handleShowQuestionDetail}
                                    onShowGroupDetail={handleShowGroupDetail}
                                />
                            </>
                        ) : (
                            <RandomQuestionSelector
                                skill={selectedSkill}
                                parts={parts}
                                questionRanges={questionRanges}
                                setQuestionRanges={setQuestionRanges}
                                readOnly={readOnly}
                            />
                        )}
                    </>
                )}

                {!selectedSkill && (
                    <div style={{ 
                        textAlign: "center", 
                        padding: 40, 
                        color: "#999" 
                    }}>
                        👆 Vui lòng chọn kỹ năng để bắt đầu chọn câu hỏi
                    </div>
                )}
            </Form>

            {/* Drawer hiển thị chi tiết câu hỏi */}
            <Drawer
                title={detailMode === "group" ? `Chi tiết nhóm câu hỏi #${detailId || ""}` : `Chi tiết câu hỏi #${detailId || ""}`}
                placement="right"
                width={detailMode === "group" ? 700 : 600}
                onClose={() => setDetailDrawerOpen(false)}
                open={detailDrawerOpen}
            >
                {detailMode === "single" && detailId && questionDetails[detailId] && (
                    <div>
                        <Space style={{ marginBottom: 16 }}>
                            <Tag color="blue">ID: {detailId}</Tag>
                            {questionDetails[detailId].partName && (
                                <Tag color="green">{questionDetails[detailId].partName}</Tag>
                            )}
                            {questionDetails[detailId].questionTypeName && (
                                <Tag color="purple">{questionDetails[detailId].questionTypeName}</Tag>
                            )}
                        </Space>

                        {questionDetails[detailId].content && (
                            <>
                                <Divider orientation="left">Nội dung câu hỏi</Divider>
                                <div
                                    style={{
                                        padding: 12,
                                        background: "#f5f5f5",
                                        borderRadius: 4,
                                        marginBottom: 16,
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {questionDetails[detailId].content}
                                </div>
                            </>
                        )}

                        {questionDetails[detailId].audioUrl && (
                            <>
                                <Divider orientation="left">Audio</Divider>
                                <audio
                                    controls
                                    src={questionDetails[detailId].audioUrl}
                                    style={{ width: "100%", marginBottom: 16 }}
                                />
                            </>
                        )}

                        {questionDetails[detailId].imageUrl && (
                            <>
                                <Divider orientation="left">Hình ảnh</Divider>
                                <img
                                    src={questionDetails[detailId].imageUrl}
                                    alt="Question"
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: 300,
                                        objectFit: "contain",
                                        borderRadius: 4,
                                        border: "1px solid #f0f0f0",
                                    }}
                                />
                            </>
                        )}

                        {Array.isArray(questionDetails[detailId].options) && questionDetails[detailId].options.length > 0 && (
                            <>
                                <Divider orientation="left">Đáp án</Divider>
                                <Space direction="vertical" style={{ width: "100%" }}>
                                    {questionDetails[detailId].options.map((opt, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                padding: 8,
                                                borderRadius: 4,
                                                border: "1px solid #e8e8e8",
                                                background: opt.isCorrect ? "#f6ffed" : "#fafafa",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}
                                        >
                                            <Tag color={opt.isCorrect ? "success" : "default"}>{opt.label}</Tag>
                                            <span style={{ flex: 1 }}>{opt.content || "(Không có nội dung)"}</span>
                                            {opt.isCorrect && <Tag color="success">Đúng</Tag>}
                                        </div>
                                    ))}
                                </Space>
                            </>
                        )}

                        {questionDetails[detailId].explanation && (
                            <>
                                <Divider orientation="left">Giải thích</Divider>
                                <div
                                    style={{
                                        padding: 12,
                                        background: "#fafafa",
                                        borderRadius: 4,
                                        border: "1px solid #f0f0f0",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {questionDetails[detailId].explanation}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {detailMode === "group" && detailId && groupDetails[detailId] && (
                    <div>
                        <Space style={{ marginBottom: 16 }}>
                            <Tag color="green">Group ID: {detailId}</Tag>
                            {groupDetails[detailId].partName && (
                                <Tag color="blue">{groupDetails[detailId].partName}</Tag>
                            )}
                        </Space>

                        {groupDetails[detailId].audioUrl && (
                            <>
                                <Divider orientation="left">Audio</Divider>
                                <audio
                                    controls
                                    src={groupDetails[detailId].audioUrl}
                                    style={{ width: "100%", marginBottom: 16 }}
                                />
                            </>
                        )}

                        {groupDetails[detailId].imageUrl && (
                            <>
                                <Divider orientation="left">Hình ảnh</Divider>
                                <img
                                    src={groupDetails[detailId].imageUrl}
                                    alt="Group"
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: 300,
                                        objectFit: "contain",
                                        borderRadius: 4,
                                        border: "1px solid #f0f0f0",
                                    }}
                                />
                            </>
                        )}

                        {Array.isArray(groupDetails[detailId].questions) && groupDetails[detailId].questions.length > 0 && (
                            <>
                                <Divider orientation="left">Câu hỏi trong nhóm</Divider>
                                <Space direction="vertical" style={{ width: "100%" }}>
                                    {groupDetails[detailId].questions.map((q, qIdx) => (
                                        <div
                                            key={qIdx}
                                            style={{
                                                padding: 12,
                                                borderRadius: 4,
                                                border: "1px solid #e8e8e8",
                                                background: "#fafafa",
                                            }}
                                        >
                                            <div style={{ marginBottom: 8, fontWeight: 500 }}>
                                                Câu {qIdx + 1}: {q.content || "(Không có nội dung)"}
                                            </div>

                                            {q.imageUrl && (
                                                <img
                                                    src={q.imageUrl}
                                                    alt={`Question ${qIdx + 1}`}
                                                    style={{
                                                        maxWidth: "100%",
                                                        maxHeight: 200,
                                                        objectFit: "contain",
                                                        borderRadius: 4,
                                                        border: "1px solid #f0f0f0",
                                                        marginBottom: 8,
                                                    }}
                                                />
                                            )}

                                            {q.audioUrl && (
                                                <audio
                                                    controls
                                                    src={q.audioUrl}
                                                    style={{ width: "100%", marginBottom: 8 }}
                                                />
                                            )}

                                            {Array.isArray(q.options) && q.options.length > 0 && (
                                                <Space direction="vertical" style={{ width: "100%", marginTop: 4 }}>
                                                    {q.options.map((opt, optIdx) => (
                                                        <div
                                                            key={optIdx}
                                                            style={{
                                                                padding: 8,
                                                                borderRadius: 4,
                                                                border: "1px solid #e8e8e8",
                                                                background: opt.isCorrect ? "#f6ffed" : "#fff",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 8,
                                                            }}
                                                        >
                                                            <Tag color={opt.isCorrect ? "success" : "default"}>{opt.label}</Tag>
                                                            <span style={{ flex: 1 }}>{opt.content || "(Không có nội dung)"}</span>
                                                            {opt.isCorrect && <Tag color="success">Đúng</Tag>}
                                                        </div>
                                                    ))}
                                                </Space>
                                            )}

                                            {q.explanation && (
                                                <div
                                                    style={{
                                                        marginTop: 8,
                                                        padding: 8,
                                                        borderRadius: 4,
                                                        border: "1px solid #f0f0f0",
                                                        background: "#fff",
                                                        whiteSpace: "pre-wrap",
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </Space>
                            </>
                        )}
                    </div>
                )}
            </Drawer>
        </Modal>
    );
}

// Component để chọn câu hỏi
function QuestionSelector({ 
    skill, 
    parts,
    selectedSingleQuestions, 
    selectedGroupQuestions,
    onSelectSingleQuestions,
    onSelectGroupQuestions,
    questionDetails = {},
    groupDetails = {},
    viewingQuestionId = null,
    viewingGroupId = null,
    setViewingQuestionId = null,
    setViewingGroupId = null,
    activeTab: activeTabProp = "single",
    setActiveTab: setActiveTabProp = null,
    readOnly,
    onShowQuestionDetail,
    onShowGroupDetail,
}) {
    const [internalActiveTab, setInternalActiveTab] = useState(activeTabProp);
    const [singleQuestionModalOpen, setSingleQuestionModalOpen] = useState(false);
    const [groupQuestionModalOpen, setGroupQuestionModalOpen] = useState(false);
    const isLR = skill === TEST_SKILL.LR;
    
    // Sử dụng prop nếu có, nếu không thì dùng state nội bộ
    const activeTab = setActiveTabProp ? activeTabProp : internalActiveTab;
    const setActiveTab = setActiveTabProp || setInternalActiveTab;
    
    // Sync state nội bộ với prop khi prop thay đổi (chỉ khi không có setActiveTabProp)
    useEffect(() => {
        if (!setActiveTabProp && activeTabProp !== internalActiveTab) {
            setInternalActiveTab(activeTabProp);
        }
    }, [activeTabProp, setActiveTabProp, internalActiveTab]);

    const handleAddSingleQuestion = () => {
        setSingleQuestionModalOpen(true);
    };

    const handleAddGroupQuestion = () => {
        setGroupQuestionModalOpen(true);
    };

    const handleSelectSingleQuestions = (questionIds) => {
        // Merge với danh sách đã chọn, loại bỏ duplicate
        const newIds = [...new Set([...selectedSingleQuestions, ...questionIds])];
        onSelectSingleQuestions(newIds);
        message.success(`Đã thêm ${questionIds.length} câu hỏi`);
    };

    const handleSelectGroupQuestions = (groupIds) => {
        // Merge với danh sách đã chọn, loại bỏ duplicate
        const newIds = [...new Set([...selectedGroupQuestions, ...groupIds])];
        onSelectGroupQuestions(newIds);
        // Tự động chuyển sang tab group khi thêm group questions
        setActiveTab("group");
        message.success(`Đã thêm ${groupIds.length} nhóm câu hỏi`);
    };

    const handleRemoveSingle = (id) => {
        onSelectSingleQuestions(prev => {
            const newList = prev.filter(qid => qid !== id);
            return newList;
        });
        message.success("Đã xóa câu hỏi");
    };

    const handleRemoveGroup = (id) => {
        onSelectGroupQuestions(prev => {
            const newList = prev.filter(gid => gid !== id);
            return newList;
        });
        message.success("Đã xóa nhóm câu hỏi");
    };

    return (
        <>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <Tabs.TabPane tab={`Câu hỏi đơn (${selectedSingleQuestions.length})`} key="single">
                        {!readOnly && (
                        <div style={{ marginBottom: 16 }}>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={handleAddSingleQuestion}
                    >
                        Thêm câu hỏi đơn
                    </Button>
                        </div>
                        )}

                {selectedSingleQuestions.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
                        Chưa có câu hỏi nào được chọn
                    </div>
                ) : (
                    <div style={{ maxHeight: 500, overflowY: "auto" }}>
                        {selectedSingleQuestions.map((qid, index) => {
                            const detail = questionDetails[qid] || {};
                            const content = detail.content || "";
                            const partName = detail.partName || "";
                            const questionTypeName = detail.questionTypeName || "";
                            const options = detail.options || [];
                            const imageUrl = detail.imageUrl || "";
                            const explanation = detail.explanation || "";
                            const hasOptions = options.length > 0;
                            
                            return (
                            <div 
                                key={`single-${qid}-${index}`}
                                style={{ 
                                        padding: 16,
                                        marginBottom: 12,
                                    border: "1px solid #d9d9d9",
                                    borderRadius: 6,
                                    background: "#fafafa"
                                }}
                            >
                                    <div style={{ marginBottom: 12 }}>
                                        <Space style={{ marginBottom: 8 }}>
                                    <Tag color="blue">ID: {qid}</Tag>
                                            {partName && <Tag color="green">{partName}</Tag>}
                                            {questionTypeName && <Tag>{questionTypeName}</Tag>}
                                        </Space>
                                        <div style={{ marginTop: 8 }}>
                                            <strong>Câu hỏi #{index + 1}:</strong>
                                            {content && content.trim() ? (
                                                <div style={{ 
                                                    marginTop: 8, 
                                                    padding: 12, 
                                                    background: "#fff", 
                                                    borderRadius: 4,
                                                    border: "1px solid #e8e8e8",
                                                    whiteSpace: "pre-wrap",
                                                    wordBreak: "break-word"
                                                }}>
                                                    {content}
                                                </div>
                                            ) : (
                                                <div style={{ marginTop: 8 }}>
                                                    {/* Kiểm tra partId từ partName để xác định có phải part 1, 2, 6 không */}
                                                    {(() => {
                                                        const partIdMatch = partName?.match(/Part\s*(\d+)/i);
                                                        const partId = partIdMatch ? Number(partIdMatch[1]) : null;
                                                        const isContentOptional = partId && [1, 2, 6].includes(partId);
                                                        
                                                        if (isContentOptional) {
                                                            const info = [];
                                                            if (detail.audioUrl) {
                                                                info.push(<Tag key="audio" color="green" style={{ fontSize: 11 }}>🔊 Audio</Tag>);
                                                            }
                                                            if (imageUrl) {
                                                                info.push(<Tag key="image" color="orange" style={{ fontSize: 11 }}>🖼️ Ảnh</Tag>);
                                                            }
                                                            if (hasOptions) {
                                                                info.push(<Tag key="options" color="blue" style={{ fontSize: 11 }}>{options.length} đáp án</Tag>);
                                                            }
                                                            
                                                            if (info.length > 0) {
                                                                return (
                                                                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                                                                        <span style={{ color: "#999", fontStyle: "italic", fontSize: 12, marginRight: 8 }}>
                                                                            Không có nội dung (Part {partId})
                                                                        </span>
                                                                        {info}
                                                                    </div>
                                                                );
                                                            }
                                                            
                                                            return (
                                                                <span style={{ color: "#999", fontStyle: "italic", fontSize: 12 }}>
                                                                    Không có nội dung (Part {partId})
                                                                </span>
                                                            );
                                                        }
                                                        
                                                        return (
                                                            <div style={{ color: "#999", fontStyle: "italic", marginTop: 4 }}>
                                                                Đang tải nội dung...
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Hiển thị ảnh nếu có */}
                                        {false && imageUrl && (
                                            <div style={{ marginTop: 12 }}>
                                                <strong style={{ display: "block", marginBottom: 8 }}>Hình ảnh:</strong>
                                                <img 
                                                    src={imageUrl} 
                                                    alt="Question" 
                                                    style={{ 
                                                        maxWidth: "100%", 
                                                        maxHeight: 300, 
                                                        borderRadius: 4,
                                                        border: "1px solid #e8e8e8",
                                                        objectFit: "contain"
                                                    }} 
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Hiển thị audio nếu có */}
                                        {false && detail.audioUrl && (
                                            <div style={{ marginTop: 12 }}>
                                                <strong style={{ display: "block", marginBottom: 8 }}>Audio:</strong>
                                                <audio
                                                    controls
                                                    src={detail.audioUrl}
                                                    style={{ width: "100%" }}
                                                >
                                                    Trình duyệt không hỗ trợ phát audio.
                                                </audio>
                                            </div>
                                        )}
                                        
                                        {/* Hiển thị đáp án nếu có */}
                                        {false && hasOptions && (
                                            <div style={{ marginTop: 12 }}>
                                                <strong style={{ display: "block", marginBottom: 8 }}>Đáp án:</strong>
                                                <div style={{ 
                                                    padding: 12, 
                                                    background: "#fff", 
                                                    borderRadius: 4,
                                                    border: "1px solid #e8e8e8"
                                                }}>
                                                    {options.map((opt, optIdx) => (
                                                        <div 
                                                            key={optIdx}
                                                            style={{ 
                                                                marginBottom: 8,
                                                                padding: 8,
                                                                background: opt.isCorrect ? "#f6ffed" : "#fafafa",
                                                                border: opt.isCorrect ? "1px solid #b7eb8f" : "1px solid #e8e8e8",
                                                                borderRadius: 4,
                                                                display: "flex",
                                                                alignItems: "flex-start",
                                                                gap: 8
                                                            }}
                                                        >
                                                            <Tag color={opt.isCorrect ? "success" : "default"} style={{ margin: 0, minWidth: 30, textAlign: "center" }}>
                                                                {opt.label}
                                                            </Tag>
                                                            <span style={{ flex: 1, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                                                {opt.content || "(Không có nội dung)"}
                                                            </span>
                                                            {opt.isCorrect && (
                                                                <Tag color="success" style={{ margin: 0 }}>Đúng</Tag>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Hiển thị giải thích nếu có */}
                                        {false && explanation && (
                                            <div style={{ marginTop: 12 }}>
                                                <strong style={{ display: "block", marginBottom: 8 }}>Giải thích:</strong>
                                                <div style={{ 
                                                    marginTop: 4, 
                                                    padding: 12, 
                                                    background: "#fff", 
                                                    borderRadius: 4,
                                                    border: "1px solid #e8e8e8",
                                                    whiteSpace: "pre-wrap",
                                                    wordBreak: "break-word"
                                                }}>
                                                    {explanation}
                                                </div>
                                            </div>
                                        )}
                                </div>
                                    
                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "1px solid #e8e8e8", paddingTop: 12 }}>
                                        <Button 
                                            size="small"
                                            icon={<EyeOutlined />} 
                                            onClick={() => onShowQuestionDetail && onShowQuestionDetail(qid)}
                                        >
                                            Xem chi tiết
                                        </Button>
                                {!readOnly && (
                                <Button 
                                    danger 
                                    size="small"
                                    icon={<DeleteOutlined />} 
                                    onClick={() => {
                                        Modal.confirm({
                                            title: "Xác nhận xóa câu hỏi khỏi đề",
                                            content: "Bạn có chắc chắn muốn xóa câu hỏi đơn này khỏi đề? Câu hỏi trong ngân hàng vẫn được giữ lại.",
                                            okText: "Xóa khỏi đề",
                                            okType: "danger",
                                            cancelText: "Hủy",
                                            onOk: () => handleRemoveSingle(qid),
                                        });
                                    }}
                                >
                                    Xóa
                                </Button>
                                )}
                            </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Tabs.TabPane>

            {isLR && (
            <Tabs.TabPane tab={`Nhóm câu hỏi (${selectedGroupQuestions.length})`} key="group">
                {!readOnly && (
                <div style={{ marginBottom: 16 }}>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={handleAddGroupQuestion}
                    >
                        Thêm nhóm câu hỏi
                    </Button>
                </div>
                )}

                {selectedGroupQuestions.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
                        Chưa có nhóm câu hỏi nào được chọn
                    </div>
                ) : (
                    <div style={{ maxHeight: 600, overflowY: "auto" }}>
                        {selectedGroupQuestions.map((gid, index) => {
                            const detail = groupDetails[gid] || {};
                            const passage = detail.passage || "";
                            const partName = detail.partName || "";
                            const imageUrl = detail.imageUrl || "";
                            const audioUrl = detail.audioUrl || "";
                            const questions = detail.questions || [];
                            
                            // Kiểm tra partId từ partName để xác định có phải part 3, 4 không (không có passage)
                            const partIdMatch = partName?.match(/Part\s*(\d+)/i);
                            const partId = partIdMatch ? Number(partIdMatch[1]) : null;
                            const isPassageOptional = partId && [3, 4].includes(partId);
                            
                            return (
                            <div 
                                key={`group-${gid}-${index}`}
                                style={{ 
                                        padding: 16,
                                        marginBottom: 12,
                                    border: "1px solid #d9d9d9",
                                    borderRadius: 6,
                                    background: "#fafafa"
                                }}
                            >
                                    <div style={{ marginBottom: 12 }}>
                                        <Space style={{ marginBottom: 8 }}>
                                    <Tag color="green">Group ID: {gid}</Tag>
                                            {partName && <Tag color="blue">{partName}</Tag>}
                                        </Space>
                                        <div style={{ marginTop: 8 }}>
                                            <strong>Nhóm câu hỏi #{index + 1}</strong>
                                            {passage && passage.trim() ? (
                                                <div style={{ 
                                                    marginTop: 8, 
                                                    padding: 12, 
                                                    background: "#fff", 
                                                    borderRadius: 4,
                                                    border: "1px solid #e8e8e8",
                                                    whiteSpace: "pre-wrap",
                                                    wordBreak: "break-word"
                                                }}>
                                                    <strong>Passage:</strong>
                                                    <div style={{ marginTop: 4 }}>
                                                        {passage}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ marginTop: 8 }}>
                                                    {(() => {
                                                        // Nếu đã load xong (có partName) nhưng không có passage
                                                        if (partName) {
                                                            if (isPassageOptional) {
                                                                // Part 3, 4 không có passage là bình thường
                                                                const info = [];
                                                                if (audioUrl) {
                                                                    info.push(<Tag key="audio" color="green" style={{ fontSize: 11 }}>🔊 Audio</Tag>);
                                                                }
                                                                if (imageUrl) {
                                                                    info.push(<Tag key="image" color="orange" style={{ fontSize: 11 }}>🖼️ Ảnh</Tag>);
                                                                }
                                                                if (questions.length > 0) {
                                                                    info.push(<Tag key="questions" color="blue" style={{ fontSize: 11 }}>{questions.length} câu hỏi</Tag>);
                                                                }
                                                                
                                                                if (info.length > 0) {
                                                                    return (
                                                                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                                                                            <span style={{ color: "#999", fontStyle: "italic", fontSize: 12, marginRight: 8 }}>
                                                                                Không có đoạn văn (Part {partId})
                                                                            </span>
                                                                            {info}
                                                                        </div>
                                                                    );
                                                                }
                                                                
                                                                return (
                                                                    <span style={{ color: "#999", fontStyle: "italic", fontSize: 12 }}>
                                                                        Không có đoạn văn (Part {partId})
                                                                    </span>
                                                                );
                                                            } else {
                                                                // Part 6, 7 bắt buộc có passage
                                                                return (
                                                                    <span style={{ color: "#ff4d4f", fontStyle: "italic", fontSize: 12 }}>
                                                                        Chưa có đoạn văn
                                                                    </span>
                                                                );
                                                            }
                                                        }
                                                        // Chưa load xong
                                                        return (
                                                            <div style={{ color: "#999", fontStyle: "italic", marginTop: 4 }}>
                                                                Đang tải nội dung...
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Hiển thị audio của group nếu có */}
                                        {false && audioUrl && (
                                            <div style={{ marginTop: 12 }}>
                                                <strong style={{ display: "block", marginBottom: 8 }}>Audio:</strong>
                                                <audio
                                                    controls
                                                    src={audioUrl}
                                                    style={{ width: "100%" }}
                                                >
                                                    Trình duyệt không hỗ trợ phát audio.
                                                </audio>
                                            </div>
                                        )}
                                        
                                        {/* Hiển thị ảnh nếu có */}
                                        {false && imageUrl && (
                                            <div style={{ marginTop: 12 }}>
                                                <strong style={{ display: "block", marginBottom: 8 }}>Hình ảnh:</strong>
                                                <img 
                                                    src={imageUrl} 
                                                    alt="Group" 
                                                    style={{ 
                                                        maxWidth: "100%", 
                                                        maxHeight: 300, 
                                                        borderRadius: 4,
                                                        border: "1px solid #e8e8e8",
                                                        objectFit: "contain"
                                                    }} 
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Hiển thị câu hỏi trong group */}
                                        {false && questions.length > 0 && (
                                            <div style={{ marginTop: 12 }}>
                                                <strong style={{ display: "block", marginBottom: 8 }}>
                                                    Câu hỏi trong nhóm ({questions.length}):
                                                </strong>
                                                <div style={{ 
                                                    padding: 12, 
                                                    background: "#fff", 
                                                    borderRadius: 4,
                                                    border: "1px solid #e8e8e8",
                                                    maxHeight: "none",
                                                    overflow: "visible"
                                                }}>
                                                    {questions.map((q, qIdx) => (
                                                        <div 
                                                            key={`group-q-${gid}-${qIdx}`} 
                                                            style={{ 
                                                                marginBottom: 16, 
                                                                paddingBottom: 16, 
                                                                borderBottom: qIdx < questions.length - 1 ? "1px solid #e8e8e8" : "none",
                                                                display: "block",
                                                                visibility: "visible",
                                                                opacity: 1
                                                            }}
                                                        >
                                                            <div style={{ marginBottom: 8, fontWeight: 500, fontSize: 14 }}>
                                                                <strong>Câu {qIdx + 1}:</strong> {q.content || "(Không có nội dung)"}
                                                            </div>
                                                            
                                                            {/* Hiển thị ảnh của câu hỏi nếu có */}
                                                            {q.imageUrl && (
                                                                <div style={{ marginTop: 8, marginBottom: 8 }}>
                                                                    <img 
                                                                        src={q.imageUrl} 
                                                                        alt={`Question ${qIdx + 1}`} 
                                                                        style={{ 
                                                                            maxWidth: "100%", 
                                                                            maxHeight: 200, 
                                                                            borderRadius: 4,
                                                                            border: "1px solid #e8e8e8",
                                                                            objectFit: "contain",
                                                                            display: "block"
                                                                        }} 
                                                                    />
                                                                </div>
                                                            )}
                                                            
                                                            {/* Hiển thị audio nếu có */}
                                                            {q.audioUrl && (
                                                                <div style={{ marginTop: 8, marginBottom: 8 }}>
                                                                    <strong style={{ display: "block", marginBottom: 4 }}>Audio:</strong>
                                                                    <audio
                                                                        controls
                                                                        src={q.audioUrl}
                                                                        style={{ width: "100%" }}
                                                                    >
                                                                        Trình duyệt không hỗ trợ phát audio.
                                                                    </audio>
                                                                </div>
                                                            )}
                                                            
                                                            {/* Hiển thị đáp án */}
                                                            {q.options && q.options.length > 0 && (
                                                                <div style={{ marginTop: 8, paddingLeft: 16 }}>
                                                                    <strong style={{ display: "block", marginBottom: 8, fontSize: 13 }}>Đáp án:</strong>
                                                                    {q.options.map((opt, optIdx) => (
                                                                        <div 
                                                                            key={`opt-${qIdx}-${optIdx}`}
                                                                            style={{ 
                                                                                marginBottom: 4,
                                                                                padding: 8,
                                                                                background: opt.isCorrect ? "#f6ffed" : "#fafafa",
                                                                                borderRadius: 4,
                                                                                border: opt.isCorrect ? "1px solid #b7eb8f" : "1px solid #e8e8e8",
                                                                                display: "flex",
                                                                                alignItems: "flex-start",
                                                                                gap: 8
                                                                            }}
                                                                        >
                                                                            <Tag color={opt.isCorrect ? "success" : "default"} style={{ margin: 0, minWidth: 30, textAlign: "center" }}>
                                                                                {opt.label}
                                                                            </Tag>
                                                                            <span style={{ flex: 1, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                                                                {opt.content || "(Không có nội dung)"}
                                                                            </span>
                                                                            {opt.isCorrect && (
                                                                                <Tag color="success" style={{ margin: 0 }}>Đúng</Tag>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            
                                                            {/* Hiển thị giải thích nếu có */}
                                                            {q.explanation && (
                                                                <div style={{ marginTop: 8, paddingLeft: 16 }}>
                                                                    <strong style={{ display: "block", marginBottom: 4, fontSize: 13 }}>Giải thích:</strong>
                                                                    <div style={{ 
                                                                        padding: 8, 
                                                                        background: "#fafafa", 
                                                                        borderRadius: 4,
                                                                        border: "1px solid #e8e8e8",
                                                                        whiteSpace: "pre-wrap",
                                                                        wordBreak: "break-word"
                                                                    }}>
                                                                        {q.explanation}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                </div>
                                    
                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "1px solid #e8e8e8", paddingTop: 12 }}>
                                        <Button 
                                            size="small"
                                            icon={<EyeOutlined />} 
                                            onClick={() => onShowGroupDetail && onShowGroupDetail(gid)}
                                        >
                                            Xem chi tiết
                                        </Button>
                                {!readOnly && (
                                <Button 
                                    danger 
                                    size="small"
                                    icon={<DeleteOutlined />} 
                                    onClick={() => handleRemoveGroup(gid)}
                                >
                                    Xóa
                                </Button>
                                )}
                            </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Tabs.TabPane>
            )}
        </Tabs>

        {!readOnly && (
        <QuestionBankSelectorModal
            open={singleQuestionModalOpen}
            onClose={() => setSingleQuestionModalOpen(false)}
            onSelect={handleSelectSingleQuestions}
            skill={skill}
            selectedIds={selectedSingleQuestions}
        />
        )}

        {isLR && !readOnly && (
          <QuestionGroupSelectorModal
              open={groupQuestionModalOpen}
              onClose={() => setGroupQuestionModalOpen(false)}
              onSelect={handleSelectGroupQuestions}
              skill={skill}
              selectedIds={selectedGroupQuestions}
          />
        )}
    </>
    );
}

// Component để chọn random questions
function RandomQuestionSelector({ 
    skill, 
    parts,
    questionRanges,
    setQuestionRanges,
    readOnly,
}) {
    const [questionTypes, setQuestionTypes] = useState({}); // { partId: [types] }

    const loadQuestionTypes = async (partId) => {
        try {
            const { getQuestionTypesByPart } = await import("@services/questionTypesService");
            const types = await getQuestionTypesByPart(partId);
            const typesData = Array.isArray(types) ? types : (types?.data || []);
            setQuestionTypes(prev => ({
                ...prev,
                [partId]: typesData,
            }));
        } catch (error) {
            console.error(`Error loading question types for part ${partId}:`, error);
        }
    };

    const handleAddRange = () => {
        const newRange = {
            partId: undefined,
            questionTypeId: undefined,
            singleQuestionCount: 0,
            groupQuestionCount: 0,
        };
        setQuestionRanges([...questionRanges, newRange]);
    };

    const handleRemoveRange = (index) => {
        const newRanges = questionRanges.filter((_, i) => i !== index);
        setQuestionRanges(newRanges);
    };

    const handleRangeChange = (index, field, value) => {
        const newRanges = [...questionRanges];
        newRanges[index] = {
            ...newRanges[index],
            [field]: value,
        };
        
        // Khi partId thay đổi, reset questionTypeId và load question types
        if (field === "partId") {
            newRanges[index].questionTypeId = undefined;
            if (value) {
                loadQuestionTypes(value);
            }
        }
        
        // Tự động điều chỉnh single/group count dựa trên part
        if (field === "partId" && value) {
            const partId = Number(value);
            if (isGroupPart(partId)) {
                // Part group: chỉ cho phép group questions
                newRanges[index].singleQuestionCount = 0;
                if (!newRanges[index].groupQuestionCount || newRanges[index].groupQuestionCount === 0) {
                    newRanges[index].groupQuestionCount = 1;
                }
            } else {
                // Part khác: chỉ cho phép single questions
                newRanges[index].groupQuestionCount = 0;
                if (!newRanges[index].singleQuestionCount || newRanges[index].singleQuestionCount === 0) {
                    newRanges[index].singleQuestionCount = 1;
                }
            }
        }
        
        setQuestionRanges(newRanges);
    };

    // Filter parts: hiển thị tất cả parts
    const filteredParts = parts || [];

    return (
        <>
            <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                message="Chọn ngẫu nhiên câu hỏi"
                description="Cấu hình số lượng câu hỏi ngẫu nhiên cho từng part. Part 3, 4, 6, 7 chỉ có thể chọn nhóm câu hỏi hoặc câu hỏi đơn."
            />

            {!readOnly && (
                <div style={{ marginBottom: 16 }}>
                    <Button 
                        type="dashed" 
                        icon={<PlusOutlined />} 
                        onClick={handleAddRange}
                        block
                    >
                        Thêm cấu hình Part
                    </Button>
                </div>
            )}

            {questionRanges.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
                    Chưa có cấu hình part nào. Nhấn "Thêm cấu hình Part" để bắt đầu.
                </div>
            ) : (
                <div style={{ maxHeight: 500, overflowY: "auto" }}>
                    {questionRanges.map((range, index) => {
                        const partId = Number(range.partId);
                        const isGroupPartId = isGroupPart(partId);
                        const partOptions = filteredParts.map(p => ({
                            value: Number(p.partId || p.id),
                            label: p.name || p.partName || `Part ${p.partId || p.id}`,
                        }));

                        return (
                            <div
                                key={index}
                                style={{
                                    padding: 16,
                                    marginBottom: 12,
                                    border: "1px solid #d9d9d9",
                                    borderRadius: 6,
                                    background: "#fafafa",
                                }}
                            >
                                <Row gutter={12} align="middle">
                                    <Col span={6}>
                                        <div style={{ marginBottom: 4, fontSize: 12, color: "#666" }}>
                                            Part
                                        </div>
                                        <Select
                                            placeholder="Chọn Part"
                                            value={range.partId}
                                            onChange={(value) => handleRangeChange(index, "partId", value)}
                                            style={{ width: "100%" }}
                                            disabled={readOnly}
                                            options={partOptions}
                                        />
                                    </Col>
                                    <Col span={6}>
                                        <div style={{ marginBottom: 4, fontSize: 12, color: "#666" }}>
                                            Loại câu hỏi (tùy chọn)
                                        </div>
                                        <Select
                                            placeholder="Tất cả loại"
                                            value={range.questionTypeId}
                                            onChange={(value) => handleRangeChange(index, "questionTypeId", value)}
                                            style={{ width: "100%" }}
                                            disabled={readOnly || !range.partId}
                                            allowClear
                                            options={questionTypes[range.partId]?.map(t => ({
                                                value: Number(t.questionTypeId || t.id),
                                                label: t.typeName || t.name,
                                            })) || []}
                                        />
                                    </Col>
                                    <Col span={isGroupPartId ? 6 : 8}>
                                        <div style={{ marginBottom: 4, fontSize: 12, color: "#666" }}>
                                            {isGroupPartId ? "Số nhóm câu hỏi" : "Số câu hỏi đơn"}
                                        </div>
                                        <InputNumber
                                            min={0}
                                            value={isGroupPartId ? range.groupQuestionCount : range.singleQuestionCount}
                                            onChange={(value) => handleRangeChange(
                                                index, 
                                                isGroupPartId ? "groupQuestionCount" : "singleQuestionCount", 
                                                value || 0
                                            )}
                                            style={{ width: "100%" }}
                                            disabled={readOnly || !range.partId}
                                            placeholder="0"
                                        />
                                    </Col>
                                    {!isGroupPartId && (
                                        <Col span={4}>
                                            <div style={{ marginBottom: 4, fontSize: 12, color: "#666" }}>
                                                &nbsp;
                                            </div>
                                            
                                        </Col>
                                    )}
                                    {isGroupPartId && (
                                        <Col span={4}>
                                            <div style={{ marginBottom: 4, fontSize: 12, color: "#666" }}>
                                                &nbsp;
                                            </div>
                                            
                                        </Col>
                                    )}
                                    <Col span={2}>
                                        <div style={{ marginBottom: 4, fontSize: 12, color: "#666" }}>
                                            &nbsp;
                                        </div>
                                        {!readOnly && (
                                            <Button
                                                danger
                                                type="text"
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleRemoveRange(index)}
                                                disabled={questionRanges.length <= 1}
                                            />
                                        )}
                                    </Col>
                                </Row>
                            </div>
                        );
                    })}
                </div>
            )}

            {questionRanges.length > 0 && (
                <div style={{ 
                    marginTop: 16, 
                    padding: 12, 
                    background: "#f0f5ff", 
                    borderRadius: 6,
                    border: "1px solid #adc6ff"
                }}>
                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                        <div>
                            <strong>Tổng số cấu hình:</strong> {questionRanges.length} part(s)
                        </div>
                        <div>
                            <strong>Tổng số câu hỏi đơn:</strong>{" "}
                            {questionRanges.reduce((sum, r) => sum + Number(r.singleQuestionCount || 0), 0)}
                        </div>
                        <div>
                            <strong>Tổng số nhóm câu hỏi:</strong>{" "}
                            {questionRanges.reduce((sum, r) => sum + Number(r.groupQuestionCount || 0), 0)}
                        </div>
                    </Space>
                </div>
            )}
        </>
    );
}

