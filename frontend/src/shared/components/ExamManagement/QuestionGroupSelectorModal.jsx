import React, { useState, useEffect, useRef } from "react";
import { Modal, Table, Input, Select, Space, Tag, message, Tooltip, Alert } from "antd";
import { SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { buildQuestionListParams } from "@services/questionsService";
import { getQuestionGroups } from "@services/questionGroupService";
import { getPartsBySkill } from "@services/partsService";

const { Option } = Select;

// Parts chỉ dành cho group questions: 3, 4 (Listening), 6, 7 (Reading)
const GROUP_PARTS = [3, 4, 6, 7];
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
            const loadedParts = await getPartsBySkill(skill);
            // Filter: chỉ hiển thị các part group (3, 4, 6, 7)
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
            const baseParams = buildQuestionListParams({ 
                page, 
                pageSize, 
                skill,
                partId: withFilters ? filterPart : undefined,
                keyword: withFilters ? searchKeyword : undefined
            });
            const params = baseParams;

            const response = await getQuestionGroups(params);

            const payload = response?.data || response || {};
            const data = payload.dataPaginated || payload.items || payload.records || [];
            const currentPage = payload.currentPage || page;
            const size = payload.pageSize || pageSize;
            const totalCount = payload.totalCount || payload.total || data.length || 0;

            const mapped = (data || [])
                .filter((g) => {
                    // Filter: chỉ hiển thị group questions có part group (3, 4, 6, 7)
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
            setPagination({ current: currentPage, pageSize: size, total: totalCount });
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
                description="Chỉ hiển thị các nhóm câu hỏi. Chỉ hiển thị Part 3, 4 (Nghe) và Part 6, 7 (Đọc)."
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



