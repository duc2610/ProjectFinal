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

    const normalizeCreationStatusValue = (value) => {
        if (value === undefined || value === null) return undefined;
        const str = String(value).toLowerCase();
        if (str === "completed" || str === "2") return "Completed";
        if (str === "inprogress" || str === "in_progress" || str === "1") return "InProgress";
        if (str === "draft" || str === "0") return "Draft";
        return undefined;
    };

    const normalizeVisibilityStatusValue = (value) => {
        if (value === undefined || value === null) return undefined;
        const str = String(value).toLowerCase();
        if (str === "published" || str === "1" || str === "active") return "Published";
        if (str === "hidden" || str === "hide" || str === "-1" || str === "0" || str === "inactive") {
            return "Hidden";
        }
        return undefined;
    };

    const normalizeLegacyStatusValue = (value) => {
        if (value === undefined || value === null) return undefined;
        const str = String(value).toLowerCase();
        if (str === "published" || str === "3" || str === "active") return "Published";
        if (str === "hidden" || str === "hide" || str === "-1" || str === "inactive") return "Hidden";
        if (str === "completed" || str === "2") return "Completed";
        if (str === "inprogress" || str === "in_progress" || str === "1") return "InProgress";
        if (str === "draft" || str === "0") return "Draft";
        return undefined;
    };

    const deriveVersionStatus = (record) => {
        if (!record) return "Draft";
        const legacyStatus = normalizeLegacyStatusValue(record.status ?? record.Status);
        if (legacyStatus === "Published") return "Active";
        if (legacyStatus === "Hidden") {
            const creation = normalizeCreationStatusValue(record.creationStatus ?? record.CreationStatus);
            return creation === "Completed" ? "Inactive" : "Draft";
        }
        if (legacyStatus === "Completed") return "Inactive";

        const visibility = normalizeVisibilityStatusValue(record.visibilityStatus ?? record.VisibilityStatus);
        if (visibility === "Published") return "Active";
        if (visibility === "Hidden") {
            const creation = normalizeCreationStatusValue(record.creationStatus ?? record.CreationStatus);
            return creation === "Completed" ? "Inactive" : "Draft";
        }

        const creation = normalizeCreationStatusValue(record.creationStatus ?? record.CreationStatus);
        if (creation === "Completed") return "Inactive";

        return "Draft";
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
            key: "status",
            width: 120,
            align: "center",
            render: (_, record) => {
                const status = deriveVersionStatus(record);
                return (
                    <Tag color={statusColorMap[status] || "default"}>
                        {statusLabelMap[status] || status}
                    </Tag>
                );
            }
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

