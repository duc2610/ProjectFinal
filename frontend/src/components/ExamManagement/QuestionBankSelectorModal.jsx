import React, { useState, useEffect, useRef, useMemo } from "react";
import { Modal, Table, Input, Select, Space, Tag, message, Tooltip, Alert, Button, Drawer, Divider } from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { getQuestions, buildQuestionListParams, getQuestionById } from "@services/questionsService";
import { loadPartsBySkill, TEST_SKILL } from "@constants/toeicStructure";

const { Option } = Select;

// Parts dành cho group questions: 3, 4, 6, 7 (L&R) và 13, 14 (Speaking)
const GROUP_PARTS = [3, 4, 6, 7, 13, 14];
const isGroupPart = (p) => GROUP_PARTS.includes(Number(p));

export default function QuestionBankSelectorModal({ 
    open, 
    onClose, 
    onSelect,
    skill, // Skill đã chọn (1: Speaking, 2: Writing, 3: L&R)
    selectedIds = [] // Danh sách ID đã chọn
}) {
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [parts, setParts] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const selectedIdsSet = useMemo(() => new Set(selectedIds || []), [selectedIds]);
    
    // Filters
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterPart, setFilterPart] = useState(null);
    const searchDebounceRef = useRef(null);
    
    // Detail view
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [viewingQuestionId, setViewingQuestionId] = useState(null);
    const [questionDetail, setQuestionDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        if (open && skill) {
            loadParts();
            loadQuestions(1, pagination.pageSize);
            setSelectedRowKeys(selectedIds);
        }
    }, [open, skill]);

    const loadParts = async () => {
        try {
            const loadedParts = await loadPartsBySkill(skill);
            // Filter: loại bỏ các part group (3, 4, 6, 7, 13, 14) - chỉ dành cho group questions
            const filteredParts = (loadedParts || []).filter(p => {
                const pid = Number(p.partId || p.id);
                return !isGroupPart(pid);
            });
            // Chuẩn hóa dữ liệu part để tránh mất part (ví dụ Part 5)
            const formattedParts = filteredParts.map(p => {
                const pid = Number(p.partId || p.id);
                return {
                    ...p,
                    partId: pid,
                    name: p.name || p.partName || `Part ${pid}`,
                };
            });
            setParts(formattedParts);
        } catch (error) {
            // Error loading parts
        }
    };

    const mapQuestions = (data = []) => {
        return (data || [])
            .filter((q) => {
                // Filter: loại bỏ single questions có part group (3, 4, 6, 7)
                const partId = Number(q.partId || q.part?.id);
                return !isGroupPart(partId);
            })
            .filter((q) => {
                const id = q.questionId ?? q.id;
                return !selectedIdsSet.has(id);
            })
            .map((q) => {
                const rawStatus = q.status;
                let statusNum;
                if (typeof rawStatus === "number") {
                    // BE: 1 = Active, -1 = Inactive
                    statusNum = rawStatus === 1 ? 1 : -1;
                } else if (typeof rawStatus === "string") {
                    const s = rawStatus.toLowerCase();
                    statusNum = s === "active" ? 1 : -1;
                } else {
                    statusNum = q.isActive === true ? 1 : -1;
                }

                const partId = Number(q.partId || q.part?.id);
                const isContentOptional = [1, 2, 6].includes(partId);

                return {
                    id: q.questionId ?? q.id,
                    partName: q.partName ?? q.part ?? q.partId,
                    questionTypeName: q.questionTypeName ?? q.QuestionTypeName ?? q.typeName ?? q.name ?? "",
                    content: q.content ?? "",
                    status: statusNum,
                    partId: partId,
                    hasAudio: !!(q.audioUrl || q.audioName),
                    hasImage: !!(q.imageUrl || q.imageName),
                    optionsCount: Array.isArray(q.options) ? q.options.length : 0,
                    isContentOptional: isContentOptional,
                };
            });
    };

    const loadQuestions = async (page = 1, pageSize = 10, withFilters = false) => {
        setLoading(true);
        try {
            const partFilter = withFilters && filterPart !== null ? Number(filterPart) : undefined;
            const keywordFilter = withFilters ? searchKeyword : undefined;

            // Nếu skill = L&R, cần tách skill Listening (3) và Reading (4)
            if (skill === TEST_SKILL.LR) {
                // Khi chọn part cụ thể: xác định skill theo part
                if (partFilter != null) {
                    const effectiveSkill = partFilter >= 5 ? 4 : 3;
                    const params = buildQuestionListParams({ 
                        page, 
                        pageSize, 
                        skill: effectiveSkill,
                        partId: partFilter,
                        keyword: keywordFilter
                    });
                    const response = await getQuestions(params);
                    const payload = response?.data || response || {};
                    const data = payload.dataPaginated || payload.items || payload.records || [];
                    const currentPage = payload.currentPage || page;
                    const size = payload.pageSize || pageSize;
                    const totalCount = payload.totalCount || payload.total || data.length || 0;
                    const mapped = mapQuestions(data);
                    setQuestions(mapped);
                    setPagination({ current: currentPage, pageSize: size, total: totalCount });
                } else {
                    // Không chọn part: load cả Listening + Reading rồi paginate ở frontend
                    const paramsListening = buildQuestionListParams({
                        page: 1,
                        pageSize: 1000,
                        skill: 3, // Listening
                        keyword: keywordFilter,
                    });
                    const paramsReading = buildQuestionListParams({
                        page: 1,
                        pageSize: 1000,
                        skill: 4, // Reading
                        keyword: keywordFilter,
                    });
                    const [resL, resR] = await Promise.all([
                        getQuestions(paramsListening),
                        getQuestions(paramsReading),
                    ]);
                    const payloadL = resL?.data || resL || {};
                    const payloadR = resR?.data || resR || {};
                    const dataL = payloadL.dataPaginated || payloadL.items || payloadL.records || [];
                    const dataR = payloadR.dataPaginated || payloadR.items || payloadR.records || [];
                    const combined = [...mapQuestions(dataL), ...mapQuestions(dataR)];
                    const start = (page - 1) * pageSize;
                    const paged = combined.slice(start, start + pageSize);
                    setQuestions(paged);
                    setPagination({ current: page, pageSize, total: combined.length });
                }
            } else {
                // Skill khác: logic cũ
                const params = buildQuestionListParams({ 
                    page, 
                    pageSize, 
                    skill,
                    partId: partFilter,
                    keyword: keywordFilter
                });

                const response = await getQuestions(params);
                const payload = response?.data || response || {};
                const data = payload.dataPaginated || payload.items || payload.records || [];
                const currentPage = payload.currentPage || page;
                const size = payload.pageSize || pageSize;
                const totalCount = payload.totalCount || payload.total || data.length || 0;

                const mapped = mapQuestions(data);

                setQuestions(mapped);
                setPagination({ current: currentPage, pageSize: size, total: totalCount });
            }
        } catch (error) {
            // Error loading questions
            message.error("Lỗi khi tải danh sách câu hỏi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!open || !skill) return;
        
        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }
        
        searchDebounceRef.current = setTimeout(() => {
            const hasFilters = filterPart !== null || searchKeyword.trim() !== "";
            loadQuestions(1, pagination.pageSize, hasFilters);
        }, 400);
        
        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
        };
    }, [searchKeyword, filterPart, open, skill]);

    const handleTableChange = (newPagination) => {
        const hasFilters = filterPart !== null || searchKeyword !== "";
        loadQuestions(newPagination.current, newPagination.pageSize, hasFilters);
    };

    const handlePartFilterChange = (partId) => {
        setFilterPart(partId);
        setPagination({ ...pagination, current: 1 });
    };


    const handleOk = () => {
        if (selectedRowKeys.length === 0) {
            message.warning("Vui lòng chọn ít nhất 1 câu hỏi!");
            return;
        }
        onSelect(selectedRowKeys);
        onClose();
    };

    const handleViewDetail = async (questionId) => {
        setViewingQuestionId(questionId);
        setDetailDrawerOpen(true);
        setLoadingDetail(true);
        
        try {
            const question = await getQuestionById(questionId);
            const q = question?.data || question || {};
            const options = (q.options || q.Options || []).map(opt => ({
                label: opt.label || opt.Label || "",
                content: opt.content || opt.Content || "",
                isCorrect: opt.isCorrect || opt.IsCorrect || false,
            }));
            
            setQuestionDetail({
                id: q.questionId || q.id,
                content: q.content || q.Content || "",
                partName: q.partName || q.PartName || q.part?.name || "",
                questionTypeName: q.questionTypeName || q.QuestionTypeName || "",
                options: options,
                audioUrl: q.audioUrl || q.AudioUrl || "",
                imageUrl: q.imageUrl || q.ImageUrl || "",
                explanation: q.explanation || q.Explanation || q.solution || q.Solution || "",
            });
        } catch (error) {
            // Error loading question detail
            message.error("Không tải được chi tiết câu hỏi");
            setQuestionDetail(null);
        } finally {
            setLoadingDetail(false);
        }
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => {
            setSelectedRowKeys(keys);
        },
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 70,
            align: "center",
        },
        {
            title: "Part",
            dataIndex: "partName",
            key: "partName",
            width: 120,
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: "Loại",
            dataIndex: "questionTypeName",
            key: "questionTypeName",
            width: 350,
            ellipsis: { showTitle: false },
            render: (text) => {
                if (!text || !text.trim()) {
                    return <span style={{ color: "#999", fontStyle: "italic" }}>-</span>;
                }
                return (
                    <Tooltip title={text}>
                        <div style={{ 
                            maxWidth: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        }}>
                            <Tag color="purple" style={{ margin: 0 }}>
                                {text}
                            </Tag>
                        </div>
                    </Tooltip>
                );
            }
        },
        {
            title: "Nội dung",
            dataIndex: "content",
            key: "content",
            width: 200,
            ellipsis: { showTitle: false },
            render: (text, record) => {
                if (text && text.trim()) {
                    return (
                        <Tooltip title={text}>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                                {text}
                            </span>
                        </Tooltip>
                    );
                } else if (record.isContentOptional) {
                    // Part 1, 2, 6 không có content: hiển thị thông tin khác
                    const info = [];
                    if (record.hasAudio) {
                        info.push(<Tag key="audio" color="green" style={{ fontSize: 11 }}>🔊 Audio</Tag>);
                    }
                    if (record.hasImage) {
                        info.push(<Tag key="image" color="orange" style={{ fontSize: 11 }}>🖼️ Ảnh</Tag>);
                    }
                    if (record.optionsCount > 0) {
                        info.push(<Tag key="options" color="blue" style={{ fontSize: 11 }}>{record.optionsCount} đáp án</Tag>);
                    }
                    
                    if (info.length > 0) {
                        return (
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                                {info}
                            </div>
                        );
                    }
                    
                    return <span style={{ color: "#999", fontStyle: "italic", fontSize: 12 }}>Không có nội dung (Part {record.partId})</span>;
                } else {
                    return <span style={{ color: "#999" }}>Không có nội dung</span>;
                }
            }
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 100,
            align: "center",
            render: (status) => (
                <Tag color={status === 1 ? "green" : "default"}>
                    {status === 1 ? "Active" : "Inactive"}
                </Tag>
            )
        },
        {
            title: "Hành động",
            key: "action",
            width: 100,
            align: "center",
            render: (_, record) => (
                <Tooltip title="Xem chi tiết">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(record.id)}
                        style={{ color: '#1890ff' }}
                    />
                </Tooltip>
            )
        },
    ];

    return (
        <>
        <Modal
            title={`Chọn câu hỏi đơn - ${skill === 1 ? "Speaking" : skill === 2 ? "Writing" : "L&R"}`}
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            width={1400}
            okText={`Chọn (${selectedRowKeys.length})`}
            cancelText="Hủy"
        >
            <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                message="Câu hỏi đơn"
                description="Chỉ hiển thị các câu hỏi đơn. Part 3, 4 (Nghe) và Part 6, 7 (Đọc) chỉ có thể chọn dưới dạng nhóm câu hỏi."
            />
            
            <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }} size="middle">
                <Space>
                    <Input
                        placeholder="Tìm kiếm theo nội dung..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        style={{ width: 300 }}
                        prefix={<SearchOutlined />}
                        allowClear
                    />
                    
                    <Select
                        placeholder="Chọn Part"
                        value={filterPart}
                        onChange={(value) => {
                            const partId = value === "all" ? null : Number(value);
                            handlePartFilterChange(partId);
                        }}
                        style={{ width: 180 }}
                        allowClear
                    >
                        <Option value="all">Tất cả Part</Option>
                        {parts.map(part => (
                            <Option key={part.partId} value={part.partId}>
                                {part.name || `Part ${part.partId}`}
                            </Option>
                        ))}
                    </Select>

                </Space>

                {selectedRowKeys.length > 0 && (
                    <Tag color="blue">
                        Đã chọn: {selectedRowKeys.length} câu hỏi
                    </Tag>
                )}
            </Space>

            <Table
                columns={columns}
                dataSource={questions}
                rowKey="id"
                loading={loading}
                rowSelection={rowSelection}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} câu hỏi`,
                    pageSizeOptions: ['10', '20', '50'],
                }}
                onChange={handleTableChange}
                scroll={{ y: 400, x: 1200 }}
            />
        </Modal>

        <Drawer
            title={`Chi tiết câu hỏi #${viewingQuestionId || ''}`}
            placement="right"
            width={600}
            onClose={() => {
                setDetailDrawerOpen(false);
                setViewingQuestionId(null);
                setQuestionDetail(null);
            }}
            open={detailDrawerOpen}
            loading={loadingDetail}
        >
            {questionDetail && (
                <div>
                    <div style={{ marginBottom: 16 }}>
                        <Space>
                            <Tag color="blue">ID: {questionDetail.id}</Tag>
                            {questionDetail.partName && <Tag color="green">{questionDetail.partName}</Tag>}
                            {questionDetail.questionTypeName && <Tag color="purple">{questionDetail.questionTypeName}</Tag>}
                        </Space>
                    </div>

                    {questionDetail.content && questionDetail.content.trim() && (
                        <>
                            <Divider orientation="left">Nội dung câu hỏi</Divider>
                            <div style={{ 
                                padding: 12, 
                                background: "#f5f5f5", 
                                borderRadius: 4,
                                marginBottom: 16,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word"
                            }}>
                                {questionDetail.content}
                            </div>
                        </>
                    )}

                    {questionDetail.imageUrl && (
                        <>
                            <Divider orientation="left">Hình ảnh</Divider>
                            <div style={{ marginBottom: 16 }}>
                                <img 
                                    src={questionDetail.imageUrl} 
                                    alt="Question" 
                                    style={{ 
                                        maxWidth: "100%", 
                                        maxHeight: 400, 
                                        borderRadius: 4,
                                        border: "1px solid #e8e8e8",
                                        objectFit: "contain"
                                    }} 
                                />
                            </div>
                        </>
                    )}

                    {questionDetail.audioUrl && (
                        <>
                            <Divider orientation="left">Audio</Divider>
                            <div style={{ marginBottom: 16 }}>
                                <audio
                                    controls
                                    src={questionDetail.audioUrl}
                                    style={{ width: "100%" }}
                                >
                                    Trình duyệt không hỗ trợ phát audio.
                                </audio>
                            </div>
                        </>
                    )}

                    {questionDetail.options && questionDetail.options.length > 0 && (
                        <>
                            <Divider orientation="left">Đáp án ({questionDetail.options.length})</Divider>
                            <div style={{ marginBottom: 16 }}>
                                {questionDetail.options.map((opt, idx) => (
                                    <div 
                                        key={idx}
                                        style={{ 
                                            marginBottom: 8,
                                            padding: 12,
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
                        </>
                    )}

                    {questionDetail.explanation && questionDetail.explanation.trim() && (
                        <>
                            <Divider orientation="left">Giải thích</Divider>
                            <div style={{ 
                                padding: 12, 
                                background: "#f5f5f5", 
                                borderRadius: 4,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word"
                            }}>
                                {questionDetail.explanation}
                            </div>
                        </>
                    )}

                    {!questionDetail.content && !questionDetail.imageUrl && !questionDetail.audioUrl && 
                     (!questionDetail.options || questionDetail.options.length === 0) && 
                     !questionDetail.explanation && (
                        <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
                            Không có thông tin chi tiết
                        </div>
                    )}
                </div>
            )}
        </Drawer>
        </>
    );
}



