import React, { useState, useEffect } from "react";
import { Table, Tag, Space, Empty, message, Button, Row, Col } from "antd";
import styles from "@shared/styles/Profile.module.css";
import { getMyQuestionReports } from "@services/questionReportService";

export function ReportTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedReports, setExpandedReports] = useState(new Set());
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const toggleExpand = (reportId) => {
    setExpandedReports((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  const partLabelMap = {
    1: "L-Part 1",
    2: "L-Part 2",
    3: "L-Part 3",
    4: "L-Part 4",
    5: "L-Part 5",
    6: "L-Part 6",
    7: "L-Part 7",
    8: "R-Part 1",
    9: "R-Part 2",
  };

  const resolvePartLabel = (partId, fallback) => {
    if (!partId && !fallback) return undefined;
    if (fallback) return fallback;
    return partLabelMap[partId] || `Part ${partId}`;
  };

  const fetchReports = async (page = 1, pageSize = 20) => {
    try {
      setLoading(true);
      const response = await getMyQuestionReports(page, pageSize);
      
      // Response structure: { data: { data: [], pageNumber, pageSize, totalRecords, ... } }
      const reportsData = response?.data?.data || response?.data || [];
      const totalRecords = response?.data?.totalRecords || response?.totalRecords || 0;
      const currentPage = response?.data?.pageNumber || response?.pageNumber || page;
      
      // Map dữ liệu để hiển thị đúng
      const mappedReports = reportsData.map((report) => {
        const snapshot = report.questionSnapshot || {};
        const questionContent = snapshot.content || report.questionContent || null;
        const partLabel = resolvePartLabel(
          snapshot.partId || report.partId,
          snapshot.partName || report.partName
        );

        return {
          key: report.reportId || report.id,
          reportId: report.reportId,
          testQuestionId: report.testQuestionId,
          questionContent,
          description: report.description || null,
          reportType: report.reportType,
          status: report.status,
          createdAt: report.createdAt,
          updatedAt: report.reviewedAt || report.updatedAt || report.createdAt,
          partName: partLabel,
          testName: report.testName || snapshot.testName || null,
          testTitle: report.testName || snapshot.testName || null,
          // Thông tin xử lý
          reviewedBy: report.reviewedBy || null,
          reviewerName: report.reviewerName || null,
          reviewerNotes: report.reviewerNotes || null,
          reviewedAt: report.reviewedAt || null,
        };
      });
      
      setReports(mappedReports);
      setPagination({
        current: currentPage,
        pageSize: pageSize,
        total: totalRecords,
      });
    } catch (error) {
      console.error("Error fetching question reports:", error);
      // Không hiển thị thông báo lỗi, chỉ log lỗi vào console
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    fetchReports(newPagination.current, newPagination.pageSize);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const cellCardStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    background: "#fafafa",
    border: "1px solid #f0f0f0",
  };

  const sectionTitleStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  };

  const columns = [
    {
      title: "Chi tiết câu hỏi",
      key: "questionDetail",
      width: 380,
      render: (_, record) => {
        const isExpanded = expandedReports.has(record.reportId);
        const questionText = record.questionContent || "—";
        const hasLongText = questionText.length > 150; // Ước tính text dài
        
        return (
          <div style={cellCardStyle}>
            <Space direction="vertical" size={6} style={{ width: "100%" }}>
              <div style={sectionTitleStyle}>Chi tiết câu hỏi</div>
              <Space direction="vertical" size={2} style={{ width: "100%" }}>
            <span>
              <strong>Bài thi:</strong> {record.testName || "—"}
            </span>
            <span>
              <strong>Phần:</strong> {record.partName || "—"}
            </span>
              </Space>
            <div>
              <strong>Câu hỏi:</strong>
              <div
                style={{
                  marginTop: 4,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: isExpanded ? "none" : "100px",
                  overflow: isExpanded ? "visible" : "hidden",
                  position: "relative",
                }}
              >
                {questionText}
                {!isExpanded && hasLongText && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "30px",
                      background: "linear-gradient(to bottom, transparent, #fff)",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      paddingBottom: 4,
                    }}
                  />
                )}
              </div>
              {hasLongText && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => toggleExpand(record.reportId)}
                  style={{ padding: 0, height: "auto", marginTop: 4 }}
                >
                  {isExpanded ? "Thu gọn" : "Xem thêm..."}
                </Button>
              )}
            </div>
          </Space>
          </div>
        );
      },
    },
    {
      title: "Báo cáo & xử lý",
      key: "reportAndReview",
      width: 340,
      render: (_, record) => {
        const description = record.description;
        const hasReviewer = !!record.reviewerName;
        const hasNotes = !!record.reviewerNotes;
        const reviewedTime = record.reviewedAt && formatDate(record.reviewedAt);

        return (
          <div style={cellCardStyle}>
            <Space direction="vertical" size={6} style={{ width: "100%" }}>
              {/* Nội dung báo cáo */}
              <div>
                <div style={sectionTitleStyle}>Nội dung báo cáo</div>
        <div
          style={{
                    marginTop: 4,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {description || "—"}
        </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  background: "#e5e7eb",
                  margin: "4px 0 4px",
                  opacity: 0.7,
                }}
              />

              {/* Thông tin xử lý */}
              <div>
                <div style={sectionTitleStyle}>Thông tin xử lý</div>
                {(!hasReviewer && !hasNotes && !reviewedTime) ? (
                  <div style={{ marginTop: 4, color: "#9ca3af" }}>
                    Chưa được xử lý
                  </div>
                ) : (
                  <Space direction="vertical" size={2} style={{ marginTop: 4 }}>
                    {hasReviewer && (
                      <div>
                        <strong>Người xử lý:</strong> {record.reviewerName}
                      </div>
                    )}
                    {hasNotes && (
                      <div>
                        <strong>Nội dung xử lý:</strong>{" "}
                        <span
                          style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {record.reviewerNotes}
                        </span>
                      </div>
                    )}
                    {reviewedTime && (
                      <div style={{ fontSize: 12, color: "#888" }}>
                        <strong>Thời gian xử lý:</strong> {reviewedTime}
                      </div>
                    )}
                  </Space>
                )}
              </div>
            </Space>
          </div>
        );
      },
    },
    {
      title: "Loại báo cáo",
      dataIndex: "reportType",
      key: "reportType",
      width: 150,
      render: (type) => {
        const typeMap = {
          "IncorrectAnswer": "Đáp án sai",
          "Typo": "Lỗi chính tả",
          "AudioIssue": "Vấn đề về âm thanh",
          "ImageIssue": "Vấn đề về hình ảnh",
          "Unclear": "Câu hỏi không rõ ràng",
          "Other": "Khác",
        };
        const label = typeMap[type] || type || "—";
        return (
          <div style={cellCardStyle}>
            <div style={sectionTitleStyle}>Loại báo cáo</div>
            <div>{label}</div>
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusMap = {
          "Pending": { label: "Chờ xử lý", color: "warning" },
          "Processing": { label: "Đang xử lý", color: "processing" },
          "Resolved": { label: "Đã xử lý", color: "success" },
          "Rejected": { label: "Từ chối", color: "error" },
        };
        const statusInfo = statusMap[status] || { label: status || "—", color: "default" };
        return (
          <div style={cellCardStyle}>
            <div style={sectionTitleStyle}>Trạng thái</div>
            <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
          </div>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date) => (
        <div style={cellCardStyle}>
          <div style={sectionTitleStyle}>Ngày tạo</div>
          <div>{formatDate(date)}</div>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.tabPane}>
      <h2 className={styles.title}>Lịch sử báo cáo</h2>
      <Row gutter={24} justify="center">
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          {reports.length === 0 && !loading ? (
            <Empty
              description="Chưa có báo cáo nào"
              style={{ marginTop: 40 }}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={reports}
              rowKey={(record, index) => record.reportId || record.key || `report-${index}`}
              loading={loading}
              showHeader={false}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} báo cáo`,
                pageSizeOptions: ["10", "20", "50"],
              }}
              onChange={handleTableChange}
              scroll={{ x: 1000 }}
              size="middle"
              bordered
            />
          )}
        </Col>
      </Row>
    </div>
  );
}

