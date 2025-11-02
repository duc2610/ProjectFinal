import React, { useState, useEffect } from "react";
import { Modal, Table, Tag, message, Space } from "antd";
import { getTestVersions } from "@services/testsService";

export default function TestVersionsModal({ open, onClose, parentTestId, onSelectVersion }) {
    const [loading, setLoading] = useState(false);
    const [versions, setVersions] = useState([]);

    useEffect(() => {
        if (open && parentTestId) {
            loadVersions();
        }
    }, [open, parentTestId]);

    const loadVersions = async () => {
        try {
            setLoading(true);
            const data = await getTestVersions(parentTestId);
            const arr = data?.data || data || [];
            setVersions(arr);
        } catch (error) {
            console.error("Error loading versions:", error);
            message.error("Không tải được danh sách version");
        } finally {
            setLoading(false);
        }
    };

    const statusColorMap = {
        "Active": "success",
        "Draft": "warning",
        "Inactive": "default"
    };

    const statusLabelMap = {
        "Active": "Đang hoạt động",
        "Draft": "Bản nháp",
        "Inactive": "Đã ẩn"
    };

    const columns = [
        {
            title: "Version",
            dataIndex: "version",
            key: "version",
            width: 100,
            align: "center",
            render: (version) => <Tag color="blue">v{version}</Tag>
        },
        {
            title: "ID",
            dataIndex: "testId",
            key: "testId",
            width: 80,
            align: "center",
        },
        {
            title: "Tiêu đề",
            dataIndex: "title",
            key: "title",
            ellipsis: true,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            align: "center",
            render: (status) => (
                <Tag color={statusColorMap[status] || "default"}>
                    {statusLabelMap[status] || status}
                </Tag>
            )
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 150,
            render: (date) => date ? new Date(date).toLocaleString("vi-VN") : "-"
        },
        {
            title: "Cập nhật",
            dataIndex: "updatedAt",
            key: "updatedAt",
            width: 150,
            render: (date) => date ? new Date(date).toLocaleString("vi-VN") : "-"
        },
    ];

    return (
        <Modal
            title="Danh sách Version"
            open={open}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <Table
                columns={columns}
                dataSource={versions}
                rowKey="testId"
                loading={loading}
                pagination={false}
            />
        </Modal>
    );
}

