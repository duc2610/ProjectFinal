import React, { useState, useEffect } from "react";
import { Modal, Table, Input, Select, Button, Space, Tag, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getQuestions, buildQuestionListParams } from "@services/questionsService";
import { getPartsBySkill } from "@services/partsService";

const { Option } = Select;

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
    
    // Filters
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterPart, setFilterPart] = useState(null);

    useEffect(() => {
        if (open && skill) {
            loadParts();
            loadQuestions(1, pagination.pageSize);
            setSelectedRowKeys(selectedIds);
        }
    }, [open, skill]);

    const loadParts = async () => {
        try {
            const loadedParts = await getPartsBySkill(skill);
            setParts(loadedParts || []);
        } catch (error) {
            console.error("Error loading parts:", error);
        }
    };

    const loadQuestions = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const params = buildQuestionListParams({
                page,
                pageSize,
                skill,
                partId: filterPart,
                keyword: searchKeyword,
            });

            const response = await getQuestions(params);
            
            if (response?.dataPaginated) {
                const { data, currentPage, pageSize: size, totalCount } = response;
                setQuestions(data || []);
                setPagination({
                    current: currentPage,
                    pageSize: size,
                    total: totalCount,
                });
            } else {
                setQuestions([]);
            }
        } catch (error) {
            console.error("Error loading questions:", error);
            message.error("Lỗi khi tải danh sách câu hỏi");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        loadQuestions(1, pagination.pageSize);
    };

    const handleTableChange = (newPagination) => {
        loadQuestions(newPagination.current, newPagination.pageSize);
    };

    const handlePartFilterChange = (partId) => {
        setFilterPart(partId);
        setPagination({ ...pagination, current: 1 });
    };

    useEffect(() => {
        if (open && skill) {
            loadQuestions(1, pagination.pageSize);
        }
    }, [filterPart]);

    const handleOk = () => {
        if (selectedRowKeys.length === 0) {
            message.warning("Vui lòng chọn ít nhất 1 câu hỏi!");
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
            width: 150,
        },
        {
            title: "Nội dung",
            dataIndex: "content",
            key: "content",
            ellipsis: true,
            render: (text) => text || <span style={{ color: "#999" }}>Không có nội dung</span>
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
    ];

    return (
        <Modal
            title={`Chọn câu hỏi đơn - ${skill === 1 ? "Speaking" : skill === 2 ? "Writing" : "L&R"}`}
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            width={1000}
            okText={`Chọn (${selectedRowKeys.length})`}
            cancelText="Hủy"
        >
            <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }} size="middle">
                <Space>
                    <Input
                        placeholder="Tìm kiếm theo nội dung..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onPressEnter={handleSearch}
                        style={{ width: 300 }}
                        prefix={<SearchOutlined />}
                        allowClear
                    />
                    
                    <Select
                        placeholder="Chọn Part"
                        value={filterPart}
                        onChange={handlePartFilterChange}
                        style={{ width: 180 }}
                        allowClear
                    >
                        {parts.map(part => (
                            <Option key={part.partId} value={part.partId}>
                                {part.name}
                            </Option>
                        ))}
                    </Select>

                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                        Tìm kiếm
                    </Button>
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
                scroll={{ y: 400 }}
            />
        </Modal>
    );
}


