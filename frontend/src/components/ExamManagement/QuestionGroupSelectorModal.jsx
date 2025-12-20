import React, { useState, useEffect, useRef } from "react";
import { Modal, Table, Input, Select, Space, Tag, message, Tooltip, Alert, Button, Drawer, Divider } from "antd";
import { SearchOutlined, InfoCircleOutlined, EyeOutlined, WarningOutlined } from "@ant-design/icons";
import { buildQuestionListParams } from "@services/questionsService";
import { getQuestionGroups, getQuestionGroupById } from "@services/questionGroupService";
import { loadPartsBySkill, TEST_SKILL } from "@constants/toeicStructure";

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
    const [allFilteredGroups, setAllFilteredGroups] = useState([]); // Lưu tất cả data đã filter để paginate
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
    
    // Detail view
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [viewingGroupId, setViewingGroupId] = useState(null);
    const [groupDetail, setGroupDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const selectedIdsSet = React.useMemo(() => new Set(selectedIds || []), [selectedIds]);

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
            // Vì cần filter theo part group ở frontend, nên load tất cả data và paginate ở frontend
            let allGroups = [];
            let totalCount = 0;
            
            if (skill === TEST_SKILL.LR) {
                // Load tất cả data (với pageSize lớn) để có thể filter và paginate ở frontend
                const [listeningResponse, readingResponse] = await Promise.all([
                    getQuestionGroups(buildQuestionListParams({ 
                        page: 1, 
                        pageSize: 1000, // Load nhiều để có đủ data filter
                        skill: 3, // Listening
                        partId: withFilters ? filterPart : undefined,
                        keyword: withFilters ? searchKeyword : undefined
                    })),
                    getQuestionGroups(buildQuestionListParams({ 
                        page: 1, 
                        pageSize: 1000, // Load nhiều để có đủ data filter
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

            // Filter và map data
            const mapped = (allGroups || [])
                .filter((g) => {
                    // Filter: chỉ hiển thị group questions có part group (3, 4, 6, 7, 13, 14)
                    const partId = Number(g.partId || g.part?.id);
                    return isGroupPart(partId);
                })
                .filter((g) => {
                    // Ẩn các group đã được chọn trước đó (selectedIds)
                    const gid = g.questionGroupId ?? g.groupId ?? g.id;
                    return !selectedIdsSet.has(gid);
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
                        questionTypeName: g.questionTypeName || g.questionType?.typeName || g.questionType?.name || "",
                        partId: partId,
                        isPassageOptional: isPassageOptional,
                    };
                });

            // Nếu skill = LR, paginate ở frontend sau khi filter
            if (skill === TEST_SKILL.LR) {
                // Lưu tất cả data đã filter
                setAllFilteredGroups(mapped);
                totalCount = mapped.length;
                const startIndex = (page - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                const pagedData = mapped.slice(startIndex, endIndex);
                setQuestionGroups(pagedData);
            } else {
                setAllFilteredGroups([]); // Không cần lưu cho skill khác
                setQuestionGroups(mapped);
            }
            
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
        // Nếu skill = LR và đã có data trong allFilteredGroups, chỉ cần paginate ở frontend
        if (skill === TEST_SKILL.LR && allFilteredGroups.length > 0) {
            const startIndex = (newPagination.current - 1) * newPagination.pageSize;
            const endIndex = startIndex + newPagination.pageSize;
            const pagedData = allFilteredGroups.slice(startIndex, endIndex);
            setQuestionGroups(pagedData);
            setPagination({ 
                current: newPagination.current, 
                pageSize: newPagination.pageSize, 
                total: allFilteredGroups.length 
            });
        } else {
            // Các trường hợp khác: reload từ API
            const hasFilters = filterPart !== null || searchKeyword !== "";
            loadQuestionGroups(newPagination.current, newPagination.pageSize, hasFilters);
        }
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

    const handleViewDetail = async (groupId) => {
        setViewingGroupId(groupId);
        setDetailDrawerOpen(true);
        setLoadingDetail(true);
        
        try {
            const group = await getQuestionGroupById(groupId);
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
            
            setGroupDetail({
                id: g.questionGroupId || g.groupId || g.id,
                passage: g.passageContent || g.passage || g.PassageContent || g.Passage || "",
                partName: g.partName || g.PartName || g.part?.name || "",
                imageUrl: g.imageUrl || g.ImageUrl || "",
                audioUrl: g.audioUrl || g.AudioUrl || "",
                questions: questions,
            });
        } catch (error) {
            console.error(`Error loading group detail ${groupId}:`, error);
            message.error("Không tải được chi tiết nhóm câu hỏi");
            setGroupDetail(null);
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
                                <WarningOutlined style={{ marginRight: 4 }} /> Chưa có đoạn văn
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
            title={`Chọn nhóm câu hỏi - ${skill === 1 ? "Speaking" : skill === 2 ? "Writing" : "L&R"}`}
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
                scroll={{ y: 400, x: 1200 }}
            />
        </Modal>

        <Drawer
            title={`Chi tiết nhóm câu hỏi #${viewingGroupId || ''}`}
            placement="right"
            width={700}
            onClose={() => {
                setDetailDrawerOpen(false);
                setViewingGroupId(null);
                setGroupDetail(null);
            }}
            open={detailDrawerOpen}
            loading={loadingDetail}
        >
            {groupDetail && (
                <div>
                    <div style={{ marginBottom: 16 }}>
                        <Space>
                            <Tag color="green">Group ID: {groupDetail.id}</Tag>
                            {groupDetail.partName && <Tag color="blue">{groupDetail.partName}</Tag>}
                        </Space>
                    </div>

                    {groupDetail.passage && groupDetail.passage.trim() && (
                        <>
                            <Divider orientation="left">Đoạn văn / Passage</Divider>
                            <div style={{ 
                                padding: 12, 
                                background: "#f5f5f5", 
                                borderRadius: 4,
                                marginBottom: 16,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word"
                            }}>
                                {groupDetail.passage}
                            </div>
                        </>
                    )}

                    {groupDetail.audioUrl && (
                        <>
                            <Divider orientation="left">Audio</Divider>
                            <div style={{ marginBottom: 16 }}>
                                <audio
                                    controls
                                    src={groupDetail.audioUrl}
                                    style={{ width: "100%" }}
                                >
                                    Trình duyệt không hỗ trợ phát audio.
                                </audio>
                            </div>
                        </>
                    )}

                    {groupDetail.imageUrl && (
                        <>
                            <Divider orientation="left">Hình ảnh</Divider>
                            <div style={{ marginBottom: 16 }}>
                                <img 
                                    src={groupDetail.imageUrl} 
                                    alt="Group" 
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

                    {groupDetail.questions && groupDetail.questions.length > 0 && (
                        <>
                            <Divider orientation="left">Câu hỏi ({groupDetail.questions.length})</Divider>
                            <div style={{ marginBottom: 16 }}>
                                {groupDetail.questions.map((q, qIdx) => (
                                    <div 
                                        key={qIdx}
                                        style={{ 
                                            marginBottom: 24,
                                            padding: 16,
                                            background: "#fafafa",
                                            border: "1px solid #e8e8e8",
                                            borderRadius: 4
                                        }}
                                    >
                                        <div style={{ marginBottom: 12, fontWeight: "bold", color: "#1890ff" }}>
                                            Câu hỏi #{qIdx + 1}
                                        </div>

                                        {q.content && q.content.trim() && (
                                            <div style={{ 
                                                marginBottom: 12,
                                                padding: 8,
                                                background: "#fff",
                                                borderRadius: 4,
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word"
                                            }}>
                                                {q.content}
                                            </div>
                                        )}

                                        {q.audioUrl && (
                                            <div style={{ marginBottom: 12 }}>
                                                <audio
                                                    controls
                                                    src={q.audioUrl}
                                                    style={{ width: "100%" }}
                                                >
                                                    Trình duyệt không hỗ trợ phát audio.
                                                </audio>
                                            </div>
                                        )}

                                        {q.imageUrl && (
                                            <div style={{ marginBottom: 12 }}>
                                                <img 
                                                    src={q.imageUrl} 
                                                    alt={`Question ${qIdx + 1}`}
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

                                        {q.options && q.options.length > 0 && (
                                            <div style={{ marginTop: 12 }}>
                                                <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500 }}>Đáp án:</div>
                                                {q.options.map((opt, optIdx) => (
                                                    <div 
                                                        key={optIdx}
                                                        style={{ 
                                                            marginBottom: 6,
                                                            padding: 8,
                                                            background: opt.isCorrect ? "#f6ffed" : "#fff",
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
                                        )}

                                        {q.explanation && q.explanation.trim() && (
                                            <div style={{ 
                                                marginTop: 12,
                                                padding: 8,
                                                background: "#fff",
                                                borderRadius: 4,
                                                fontSize: 12,
                                                color: "#666",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word"
                                            }}>
                                                <strong>Giải thích:</strong> {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {!groupDetail.passage && !groupDetail.audioUrl && !groupDetail.imageUrl && 
                     (!groupDetail.questions || groupDetail.questions.length === 0) && (
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



