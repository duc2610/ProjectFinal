import React, { useState, useEffect, useRef } from "react";
import { Modal, Table, Input, Select, Space, Tag, message, Tooltip, Alert } from "antd";
import { SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { buildQuestionListParams } from "@services/questionsService";
import { getQuestionGroups } from "@services/questionGroupService";
import { loadPartsBySkill, TEST_SKILL } from "@shared/constants/toeicStructure";

const { Option } = Select;

// Parts dành cho group questions: 3, 4, 6, 7 (L&R) và 13, 14 (Speaking)
const GROUP_PARTS = [3, 4, 6, 7, 13, 14];
const isGroupPart = (p) => GROUP_PARTS.includes(Number(p));

export default function QuestionGroupSelectorModal({ 
    open, 
    onClose, 
    onSelect,
    skill, 
    selectedIds = []
}) {
    const [loading, setLoading] = useState(false);
    const [questionGroups, setQuestionGroups] = useState([]);
    const [parts, setParts] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    
    // Filters
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterPart, setFilterPart] = useState(null);
    const searchDebounceRef = useRef(null);

    useEffect(() => {
        if (open && skill) {
            loadParts();
            loadQuestionGroups(1, pagination.pageSize);
            setSelectedRowKeys(selectedIds);
        }
    }, [open, skill]);

    const loadParts = async () => {
        try {
            // Sử dụng loadPartsBySkill để tự động merge Listening + Reading khi skill = LR
            const loadedParts = await loadPartsBySkill(skill);
            // Filter: chỉ hiển thị các part group (3, 4, 6, 7, 13, 14)
            const filteredParts = (loadedParts || []).filter(p => {
                const pid = Number(p.partId || p.id);
                return isGroupPart(pid);
            });
            setParts(filteredParts);
        } catch (error) {
            console.error("Error loading parts:", error);
        }
    };

    const loadQuestionGroups = async (page = 1, pageSize = 10, withFilters = false) => {
        setLoading(true);
        try {
            // Nếu skill = LR, cần gọi cả Listening (3) và Reading (4) rồi merge
            let allGroups = [];
            let totalCount = 0;
            
            if (skill === TEST_SKILL.LR) {
                // Gọi cả Listening và Reading
                const [listeningResponse, readingResponse] = await Promise.all([
                    getQuestionGroups(buildQuestionListParams({ 
                        page, 
                        pageSize, 
                        skill: 3, // Listening
                        partId: withFilters ? filterPart : undefined,
                        keyword: withFilters ? searchKeyword : undefined
                    })),
                    getQuestionGroups(buildQuestionListParams({ 
                        page, 
                        pageSize, 
                        skill: 4, // Reading
                        partId: withFilters ? filterPart : undefined,
                        keyword: withFilters ? searchKeyword : undefined
                    }))
                ]);
                
                const listeningPayload = listeningResponse?.data || listeningResponse || {};
                const readingPayload = readingResponse?.data || readingResponse || {};
                
                const listeningData = listeningPayload.dataPaginated || listeningPayload.items || listeningPayload.records || [];
                const readingData = readingPayload.dataPaginated || readingPayload.items || readingPayload.records || [];
                
                allGroups = [...listeningData, ...readingData];
                totalCount = (listeningPayload.totalCount || listeningPayload.total || 0) + 
                            (readingPayload.totalCount || readingPayload.total || 0);
            } else {
                // Các skill khác: gọi bình thường
                const baseParams = buildQuestionListParams({ 
                    page, 
                    pageSize, 
                    skill,
                    partId: withFilters ? filterPart : undefined,
                    keyword: withFilters ? searchKeyword : undefined
                });
                const response = await getQuestionGroups(baseParams);
                const payload = response?.data || response || {};
                allGroups = payload.dataPaginated || payload.items || payload.records || [];
                totalCount = payload.totalCount || payload.total || allGroups.length || 0;
            }

            const mapped = (allGroups || [])
                .filter((g) => {
                    // Filter: chỉ hiển thị group questions có part group (3, 4, 6, 7, 13, 14)
                    const partId = Number(g.partId || g.part?.id);
                    return isGroupPart(partId);
                })
                .map((g) => {
                    const partId = Number(g.partId || g.part?.id);
                    const isPassageOptional = [3, 4].includes(partId);
                    
                    return {
                        id: g.questionGroupId ?? g.groupId ?? g.id,
                        partName: g.partName,
                        passage: g.passageContent ?? g.passage ?? g.content ?? "",
                        imageUrl: g.imageUrl,
                        questionCount: g.questionCount ?? (Array.isArray(g.questions) ? g.questions.length : undefined),
                        partId: partId,
                        isPassageOptional: isPassageOptional,
                    };
                });

            setQuestionGroups(mapped);
            setPagination({ current: page, pageSize, total: totalCount });
        } catch (error) {
            console.error("Error loading question groups:", error);
            message.error("Lỗi khi tải danh sách nhóm câu hỏi");
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
            loadQuestionGroups(1, pagination.pageSize, hasFilters);
        }, 400);

        return () => {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
        };
    }, [searchKeyword, filterPart, open, skill]);

    const handleTableChange = (newPagination) => {
        const hasFilters = filterPart !== null || searchKeyword !== "";
        loadQuestionGroups(newPagination.current, newPagination.pageSize, hasFilters);
    };

    const handlePartFilterChange = (partId) => {
        setFilterPart(partId);
        setPagination({ ...pagination, current: 1 });
    };

    const handleOk = () => {
        if (selectedRowKeys.length === 0) {
            message.warning("Vui lòng chọn ít nhất 1 nhóm câu hỏi!");
            return;
        }
        onSelect(selectedRowKeys);
        onClose();
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys) => {
            setSelectedRowKeys(keys);
        },
    };

    const columns = [
        {
            title: "Group ID",
            dataIndex: "id",
            key: "id",
            width: 100,
            align: "center",
            render: (id) => <Tag color="green">#{id}</Tag>
        },
        {
            title: "Part",
            dataIndex: "partName",
            key: "partName",
            width: 120,
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: "Số câu hỏi",
            dataIndex: "questionCount",
            key: "questionCount",
            width: 120,
            align: "center",
            render: (count) => (
                <Tag color="purple">{count} câu</Tag>
            )
        },
        {
            title: "Đoạn văn / Passage",
            dataIndex: "passage",
            key: "passage",
            ellipsis: { showTitle: false },
            render: (text, record) => {
                if (text && text.trim()) {
                    return (
                        <Space>
                            {text.length > 100 ? (
                                <Tooltip title={text}>
                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                                        {text.substring(0, 100)}...
                                    </span>
                                </Tooltip>
                            ) : (
                                <span>{text}</span>
                            )}
                            {record.imageUrl && (
                                <Tooltip title="Có hình ảnh">
                                    <InfoCircleOutlined style={{ color: "#1890ff" }} />
                                </Tooltip>
                            )}
                        </Space>
                    );
                } else if (record.isPassageOptional) {
                    // Part 3, 4 không có passage: hiển thị thông báo
                    return (
                        <Space>
                            <span style={{ color: "#999", fontStyle: "italic", fontSize: 12 }}>
                                Không có đoạn văn (Part {record.partId})
                            </span>
                            {record.imageUrl && (
                                <Tooltip title="Có hình ảnh">
                                    <InfoCircleOutlined style={{ color: "#1890ff" }} />
                                </Tooltip>
                            )}
                        </Space>
                    );
                } else {
                    // Part 6, 7 bắt buộc có passage
                    return (
                        <Space>
                            <span style={{ color: "#ff4d4f", fontStyle: "italic", fontSize: 12 }}>
                                ⚠️ Chưa có đoạn văn
                            </span>
                            {record.imageUrl && (
                                <Tooltip title="Có hình ảnh">
                                    <InfoCircleOutlined style={{ color: "#1890ff" }} />
                                </Tooltip>
                            )}
                        </Space>
                    );
                }
            }
        },
    ];

    return (
        <Modal
            title={`Chọn nhóm câu hỏi - ${skill === 1 ? "Speaking" : skill === 2 ? "Writing" : "L&R"}`}
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            width={1000}
            okText={`Chọn (${selectedRowKeys.length})`}
            cancelText="Hủy"
        >
            <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                message="Nhóm câu hỏi"
                description={skill === TEST_SKILL.LR 
                    ? "Chỉ hiển thị các nhóm câu hỏi. Hiển thị Part 3, 4 (Nghe) và Part 6, 7 (Đọc)."
                    : skill === TEST_SKILL.SPEAKING
                    ? "Chỉ hiển thị các nhóm câu hỏi. Hiển thị Part 13, 14 (Nói)."
                    : "Chỉ hiển thị các nhóm câu hỏi."}
            />
            
            <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }} size="middle">
                <Space>
                    <Input
                        placeholder="Tìm kiếm theo đoạn văn..."
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
                            const partId = value === "all" ? null : value;
                            handlePartFilterChange(partId);
                        }}
                        style={{ width: 180 }}
                        allowClear
                    >
                        <Option value="all">Tất cả Part</Option>
                        {parts.map(part => (
                            <Option key={part.partId} value={part.partId}>
                                {part.name}
                            </Option>
                        ))}
                    </Select>

                </Space>

                {selectedRowKeys.length > 0 && (
                    <Tag color="green">
                        Đã chọn: {selectedRowKeys.length} nhóm câu hỏi
                    </Tag>
                )}
            </Space>

            <Table
                columns={columns}
                dataSource={questionGroups}
                rowKey="id"
                loading={loading}
                rowSelection={rowSelection}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} nhóm`,
                    pageSizeOptions: ['10', '20', '50'],
                }}
                onChange={handleTableChange}
                scroll={{ y: 400 }}
            />
        </Modal>
    );
}



