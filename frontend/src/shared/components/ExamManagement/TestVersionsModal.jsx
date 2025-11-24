import React, { useState, useEffect } from "react";
import { Modal, Table, Tag, message, Switch, Tooltip } from "antd";
import { getTestVersions, hideTest, publishTest } from "@services/testsService";

export default function TestVersionsModal({ open, onClose, parentTestId, onSelectVersion }) {
    const [loading, setLoading] = useState(false);
    const [versions, setVersions] = useState([]);
    const [actionLoadingId, setActionLoadingId] = useState(null);

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

    const getTestId = (record) => {
        return record?.testId ?? record?.TestId ?? record?.id ?? record?.Id ?? null;
    };

    const handleToggleVisibility = async (record, targetChecked) => {
        const currentStatus = deriveVersionStatus(record);
        const testId = getTestId(record);
        if (!testId) {
            message.error("Không xác định được ID version");
            return;
        }

        if (targetChecked && currentStatus !== "Inactive") {
            message.warning("Chỉ có thể hiển thị version đã hoàn tất và đang ẩn.");
            return;
        }
        if (!targetChecked && currentStatus !== "Active") {
            message.warning("Chỉ có thể ẩn version đang hoạt động.");
            return;
        }

        setActionLoadingId(testId);
        try {
            if (targetChecked) {
                await publishTest(testId);
                message.success("Đã hiển thị version.");
            } else {
                await hideTest(testId);
                message.success("Đã ẩn version.");
            }
            await loadVersions();
        } catch (error) {
            console.error("Toggle visibility error:", error);
            const errorMessage = error?.response?.data?.message
                || error?.response?.data?.data
                || error?.message
                || "Unknown error";
            message.error(errorMessage);
        } finally {
            setActionLoadingId(null);
        }
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
        {
            title: "Ẩn / Hiện",
            key: "action",
            width: 140,
            align: "center",
            render: (_, record) => {
                const status = deriveVersionStatus(record);
                const canToggle = status === "Active" || status === "Inactive";
                const testId = getTestId(record);
                const tooltip = status === "Draft"
                    ? "Version chưa hoàn tất"
                    : status === "Active"
                        ? "Đang hiển thị"
                        : "Đang ẩn";
                return (
                    <Tooltip title={!canToggle ? tooltip : ""}>
                        <Switch
                            checked={status === "Active"}
                            disabled={!canToggle || actionLoadingId === testId}
                            loading={actionLoadingId === testId}
                            checkedChildren="Hiện"
                            unCheckedChildren="Ẩn"
                            onChange={(checked) => handleToggleVisibility(record, checked)}
                        />
                    </Tooltip>
                );
            }
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

