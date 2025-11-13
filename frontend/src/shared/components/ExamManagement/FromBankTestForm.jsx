import React, { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, message, Tabs, Table, Space, Tag, Row, Col, Statistic } from "antd";
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { createTestFromBank, getTestById, updateTestFromBank } from "@services/testsService";
import { loadPartsBySkill, TOTAL_QUESTIONS_BY_SKILL, TEST_SKILL } from "@shared/constants/toeicStructure";
import QuestionBankSelectorModal from "./QuestionBankSelectorModal";
import QuestionGroupSelectorModal from "./QuestionGroupSelectorModal";

const { TextArea } = Input;
const { Option } = Select;

export default function FromBankTestForm({ open, onClose, onSuccess, editingId = null, readOnly = false }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [parts, setParts] = useState([]);
    const [selectedSingleQuestions, setSelectedSingleQuestions] = useState([]);
    const [selectedGroupQuestions, setSelectedGroupQuestions] = useState([]);

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
        setSelectedSingleQuestions([]);
        setSelectedGroupQuestions([]);

        const loadForEdit = async (id) => {
            try {
                const detail = await getTestById(id);
                const d = detail?.data || detail || {};
                const skillVal = toSkillId(d.testSkill ?? d.TestSkill);
                const titleVal = d.title ?? d.Title;
                const descVal = d.description ?? d.Description;
                const durationVal = d.duration ?? d.Duration;

                setSelectedSkill(skillVal);
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
                                const isGroup = tq.isGroup ?? tq.IsGroup;
                                if (isGroup) {
                                    const gSnap = tq.questionGroupSnapshotDto || tq.QuestionGroupSnapshotDto;
                                    if (gSnap) {
                                        const gid = gSnap.questionGroupId ?? gSnap.QuestionGroupId;
                                        if (gid != null && !groupIds.includes(gid)) {
                                            groupIds.push(gid);
                                        }
                                    }
                                } else {
                                    const qSnap = tq.questionSnapshotDto || tq.QuestionSnapshotDto;
                                    if (qSnap) {
                                        const qid = qSnap.questionId ?? qSnap.QuestionId;
                                        if (qid != null && !singleIds.includes(qid)) {
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

            setLoading(true);
            if (editingId) {
                await updateTestFromBank(editingId, payload);
            } else {
                await createTestFromBank(payload);
            }

            message.success(editingId ? "Cập nhật bài thi thành công" : `Tạo bài thi thành công! (${totalQuestions} câu hỏi)`);
            
            // Delay nhỏ để đảm bảo backend đã lưu xong version mới
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
                            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
                        >
                            <Input placeholder="Ví dụ: Bài Thi Luyện Tập 1" disabled={readOnly} />
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
                            rules={[{ required: true, message: "Vui lòng nhập thời lượng!" }]}
                        >
                            <InputNumber min={1} max={300} style={{ width: "100%" }} disabled={readOnly} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="description" label="Mô tả">
                    <TextArea rows={2} placeholder="Mô tả về bài thi (tùy chọn)" disabled={readOnly} />
                </Form.Item>

                {selectedSkill && (
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
                            onSelectSingleQuestions={setSelectedSingleQuestions}
                            onSelectGroupQuestions={setSelectedGroupQuestions}
                            readOnly={readOnly}
                        />
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
    readOnly,
}) {
    const [activeTab, setActiveTab] = useState("single");
    const [singleQuestionModalOpen, setSingleQuestionModalOpen] = useState(false);
    const [groupQuestionModalOpen, setGroupQuestionModalOpen] = useState(false);
    const isLR = skill === TEST_SKILL.LR;

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
                    <div style={{ maxHeight: 300, overflowY: "auto" }}>
                        {selectedSingleQuestions.map((qid, index) => (
                            <div 
                                key={`single-${qid}-${index}`}
                                style={{ 
                                    display: "flex", 
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: 12,
                                    marginBottom: 8,
                                    border: "1px solid #d9d9d9",
                                    borderRadius: 6,
                                    background: "#fafafa"
                                }}
                            >
                                <div>
                                    <Tag color="blue">ID: {qid}</Tag>
                                    <span>Câu hỏi #{index + 1}</span>
                                </div>
                                {!readOnly && (
                                <Button 
                                    danger 
                                    size="small"
                                    icon={<DeleteOutlined />} 
                                    onClick={() => handleRemoveSingle(qid)}
                                >
                                    Xóa
                                </Button>
                                )}
                            </div>
                        ))}
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
                    <div style={{ maxHeight: 300, overflowY: "auto" }}>
                        {selectedGroupQuestions.map((gid, index) => (
                            <div 
                                key={`group-${gid}-${index}`}
                                style={{ 
                                    display: "flex", 
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: 12,
                                    marginBottom: 8,
                                    border: "1px solid #d9d9d9",
                                    borderRadius: 6,
                                    background: "#fafafa"
                                }}
                            >
                                <div>
                                    <Tag color="green">Group ID: {gid}</Tag>
                                    <span>Nhóm câu hỏi #{index + 1}</span>
                                </div>
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
                        ))}
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

