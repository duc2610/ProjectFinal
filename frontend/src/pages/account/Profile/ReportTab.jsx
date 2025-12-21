import React, { useState, useEffect, useMemo } from "react";
import { Table, Tag, Space, Empty, message, Button, Row, Col, Modal, Grid, Card, Pagination, Input, Select, DatePicker } from "antd";
import { SearchOutlined, FilterOutlined, ClearOutlined } from "@ant-design/icons";
import styles from "@shared/styles/Profile.module.css";
import { getMyQuestionReports } from "@services/questionReportService";
import dayjs from "dayjs";

export function ReportTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedReports, setExpandedReports] = useState(new Set());
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [mobilePagination, setMobilePagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [detailReport, setDetailReport] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterReportType, setFilterReportType] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState(null);
  const screens = Grid.useBreakpoint();
  // Màn hình dưới xl (bao gồm tablet ngang) dùng layout "màn nhỏ"
  const isMobile = !screens.xl;

  // Lọc dữ liệu theo search và filter
  const filteredReports = useMemo(() => {
    let filtered = [...reports];

    // Tìm kiếm theo text
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter((report) => {
        const testName = (report.testName || "").toLowerCase();
        const questionContent = (report.questionContent || "").toLowerCase();
        const description = (report.description || "").toLowerCase();
        const partName = (report.partName || "").toLowerCase();
        return (
          testName.includes(searchLower) ||
          questionContent.includes(searchLower) ||
          description.includes(searchLower) ||
          partName.includes(searchLower)
        );
      });
    }

    // Lọc theo trạng thái
    if (filterStatus) {
      filtered = filtered.filter((report) => {
        const status = (report.status || "").toLowerCase();
        return status === filterStatus.toLowerCase();
      });
    }

    // Lọc theo loại báo cáo
    if (filterReportType) {
      filtered = filtered.filter((report) => report.reportType === filterReportType);
    }

    // Lọc theo khoảng thời gian
    if (filterDateRange && filterDateRange.length === 2) {
      filtered = filtered.filter((report) => {
        if (!report.createdAt) return false;
        const reportDate = dayjs(report.createdAt);
        const startDate = filterDateRange[0].startOf("day");
        const endDate = filterDateRange[1].endOf("day");
        return reportDate.isAfter(startDate) && reportDate.isBefore(endDate) || reportDate.isSame(startDate) || reportDate.isSame(endDate);
      });
    }

    return filtered;
  }, [reports, searchText, filterStatus, filterReportType, filterDateRange]);

  // Tính toán dữ liệu hiển thị cho mobile
  const mobileReports = useMemo(() => {
    const start = (mobilePagination.current - 1) * mobilePagination.pageSize;
    const end = start + mobilePagination.pageSize;
    return filteredReports.slice(start, end);
  }, [filteredReports, mobilePagination.current, mobilePagination.pageSize]);

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
      let mappedReports = reportsData.map((report) => {
        // Ưu tiên dùng reportedSubQuestion cho question groups, sau đó mới tới questionSnapshot (single)
        const snapshot =
          report.reportedSubQuestion ||
          report.questionSnapshot ||
          {};

        // Nội dung câu hỏi: ưu tiên content của snapshot, sau đó tới questionContent backend đã tính sẵn
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
      
      // Sắp xếp theo thời gian tạo giảm dần (report mới nhất lên đầu)
      // Ưu tiên createdAt, nếu không có thì dùng reportId (id lớn hơn = mới hơn)
      mappedReports.sort((a, b) => {
        const dateA = a.createdAt;
        const dateB = b.createdAt;
        
        if (dateA && dateB) {
          return new Date(dateB) - new Date(dateA);
        }
        if (dateA) return -1;
        if (dateB) return 1;
        
        // Nếu không có createdAt, sắp xếp theo reportId (id lớn hơn = mới hơn)
        const idA = a.reportId ?? a.id ?? 0;
        const idB = b.reportId ?? b.id ?? 0;
        return idB - idA;
      });
      
      setReports(mappedReports);
      setPagination({
        current: currentPage,
        pageSize: pageSize,
        total: totalRecords,
      });
    } catch (error) {
      // Không hiển thị thông báo lỗi
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    fetchReports(newPagination.current, newPagination.pageSize);
  };

  const handleResetFilters = () => {
    setSearchText("");
    setFilterStatus(null);
    setFilterReportType(null);
    setFilterDateRange(null);
    setMobilePagination({ current: 1, pageSize: 10 });
  };

  const hasActiveFilters = searchText || filterStatus || filterReportType || filterDateRange;

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
        const questionTextRaw = record.questionContent;
        const questionText =
          questionTextRaw && questionTextRaw.trim()
            ? questionTextRaw
            : "Câu hỏi không có nội dung văn bản, chỉ hình ảnh/âm thanh.";
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
          "Reviewing": { label: "Đang xem xét", color: "processing" },
          "Approved": { label: "Đã duyệt", color: "success" },
          "Closed": { label: "Đã đóng", color: "default" },
        };
        
        // Nếu không tìm thấy trong map, dịch sang tiếng Việt hoặc dùng label mặc định
        let statusInfo = statusMap[status];
        if (!statusInfo && status) {
          // Dịch các trạng thái tiếng Anh phổ biến sang tiếng Việt
          const fallbackTranslations = {
            "pending": "Chờ xử lý",
            "processing": "Đang xử lý",
            "resolved": "Đã xử lý",
            "rejected": "Từ chối",
            "reviewing": "Đang xem xét",
            "approved": "Đã duyệt",
            "closed": "Đã đóng",
          };
          const lowerStatus = status.toLowerCase();
          const translatedLabel = fallbackTranslations[lowerStatus] || status;
          statusInfo = { label: translatedLabel, color: "default" };
        }
        
        const finalStatusInfo = statusInfo || { label: "—", color: "default" };
        
        return (
          <div style={cellCardStyle}>
            <div style={sectionTitleStyle}>Trạng thái</div>
            <Tag color={finalStatusInfo.color}>{finalStatusInfo.label}</Tag>
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
      
      {/* Search and Filter Section */}
      <Card
        size="small"
        style={{ marginBottom: 16, background: "#fafafa" }}
        bodyStyle={{ padding: 12 }}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={24} md={8} lg={6}>
            <Input
              placeholder="Tìm kiếm theo bài thi, câu hỏi..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setMobilePagination({ current: 1, pageSize: 10 });
              }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: "100%" }}
              value={filterStatus}
              onChange={(value) => {
                setFilterStatus(value);
                setMobilePagination({ current: 1, pageSize: 10 });
              }}
              allowClear
            >
              <Select.Option value="Pending">Chờ xử lý</Select.Option>
              <Select.Option value="Processing">Đang xử lý</Select.Option>
              <Select.Option value="Resolved">Đã xử lý</Select.Option>
              <Select.Option value="Rejected">Từ chối</Select.Option>
              <Select.Option value="Reviewing">Đang xem xét</Select.Option>
              <Select.Option value="Approved">Đã duyệt</Select.Option>
              <Select.Option value="Closed">Đã đóng</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              placeholder="Lọc theo loại báo cáo"
              style={{ width: "100%" }}
              value={filterReportType}
              onChange={(value) => {
                setFilterReportType(value);
                setMobilePagination({ current: 1, pageSize: 10 });
              }}
              allowClear
            >
              <Select.Option value="IncorrectAnswer">Đáp án sai</Select.Option>
              <Select.Option value="Typo">Lỗi chính tả</Select.Option>
              <Select.Option value="AudioIssue">Vấn đề về âm thanh</Select.Option>
              <Select.Option value="ImageIssue">Vấn đề về hình ảnh</Select.Option>
              <Select.Option value="Unclear">Câu hỏi không rõ ràng</Select.Option>
              <Select.Option value="Other">Khác</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              value={filterDateRange}
              onChange={(dates) => {
                setFilterDateRange(dates);
                setMobilePagination({ current: 1, pageSize: 10 });
              }}
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Col>
          {hasActiveFilters && (
            <Col xs={24} sm={12} md={4} lg={4}>
              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                style={{ width: "100%" }}
              >
                Xóa bộ lọc
              </Button>
            </Col>
          )}
        </Row>
        {hasActiveFilters && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            Đang hiển thị {filteredReports.length} / {reports.length} báo cáo
          </div>
        )}
      </Card>

      <Row gutter={24} justify="center">
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          {filteredReports.length === 0 && !loading ? (
            <Empty
              description="Chưa có báo cáo nào"
              style={{ marginTop: 40 }}
            />
          ) : (
            <>
              {isMobile ? (
                <>
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    {mobileReports.map((report, index) => (
                    <Card
                      key={report.reportId || `report-${index}`}
                      size="small"
                      className={styles.statsCard}
                    >
                      <Space
                        direction="vertical"
                        size={6}
                        style={{ width: "100%" }}
                      >
                        <div style={{ fontWeight: 600 }}>
                          {report.testName || "Bài thi không xác định"}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          Phần: {report.partName || "—"}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          Loại báo cáo:{" "}
                          {(() => {
                            const typeMap = {
                              "IncorrectAnswer": "Đáp án sai",
                              "Typo": "Lỗi chính tả",
                              "AudioIssue": "Vấn đề về âm thanh",
                              "ImageIssue": "Vấn đề về hình ảnh",
                              "Unclear": "Câu hỏi không rõ ràng",
                              "Other": "Khác",
                            };
                            return typeMap[report.reportType] || report.reportType || "—";
                          })()}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          Ngày tạo: {formatDate(report.createdAt)}
                        </div>
                        <div>
                          <Tag
                            color={(() => {
                              const statusColorMap = {
                                "Pending": "warning",
                                "Processing": "processing",
                                "Resolved": "success",
                                "Rejected": "error",
                                "Reviewing": "processing",
                                "Approved": "success",
                                "Closed": "default",
                              };
                              const lowerStatus = (report.status || "").toLowerCase();
                              const fallbackColorMap = {
                                "pending": "warning",
                                "processing": "processing",
                                "resolved": "success",
                                "rejected": "error",
                                "reviewing": "processing",
                                "approved": "success",
                                "closed": "default",
                              };
                              return statusColorMap[report.status] || fallbackColorMap[lowerStatus] || "default";
                            })()}
                          >
                            {(() => {
                              const statusMap = {
                                "Pending": "Chờ xử lý",
                                "Processing": "Đang xử lý",
                                "Resolved": "Đã xử lý",
                                "Rejected": "Từ chối",
                                "Reviewing": "Đang xem xét",
                                "Approved": "Đã duyệt",
                                "Closed": "Đã đóng",
                              };
                              const lowerStatus = (report.status || "").toLowerCase();
                              const fallbackTranslations = {
                                "pending": "Chờ xử lý",
                                "processing": "Đang xử lý",
                                "resolved": "Đã xử lý",
                                "rejected": "Từ chối",
                                "reviewing": "Đang xem xét",
                                "approved": "Đã duyệt",
                                "closed": "Đã đóng",
                              };
                              return statusMap[report.status] || fallbackTranslations[lowerStatus] || report.status || "—";
                            })()}
                          </Tag>
                        </div>
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => {
                            setDetailReport(report);
                            setDetailVisible(true);
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </Space>
                    </Card>
                    ))}
                  </Space>
                  {filteredReports.length > 0 && (
                    <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
                      <Pagination
                        current={mobilePagination.current}
                        pageSize={mobilePagination.pageSize}
                        total={filteredReports.length}
                        onChange={(page) => {
                          setMobilePagination((prev) => ({ ...prev, current: page }));
                        }}
                        showSizeChanger={false}
                        showTotal={(total) => `Tổng ${total} báo cáo`}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.tableWrapper}>
            <Table
              columns={columns}
              dataSource={filteredReports}
              rowKey={(record, index) => record.reportId || record.key || `report-${index}`}
              loading={loading}
              showHeader={false}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredReports.length,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} báo cáo`,
                pageSizeOptions: ["10", "20", "50"],
              }}
              onChange={handleTableChange}
                    scroll={{ x: 900 }}
              size="middle"
              bordered
            />
                </div>
              )}
            </>
          )}
        </Col>
      </Row>

      <Modal
        title="Chi tiết báo cáo"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        destroyOnClose
      >
        {detailReport && (
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <div>
              <strong>Bài thi:</strong> {detailReport.testName || "—"}
            </div>
            <div>
              <strong>Phần:</strong> {detailReport.partName || "—"}
            </div>
            <div>
              <strong>Câu hỏi:</strong>
              <div
                style={{
                  marginTop: 4,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {detailReport.questionContent ||
                  "Câu hỏi không có nội dung văn bản, chỉ hình ảnh/âm thanh."}
              </div>
            </div>
            <div>
              <strong>Nội dung báo cáo:</strong>
              <div
                style={{
                  marginTop: 4,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {detailReport.description || "—"}
              </div>
            </div>
            <div>
              <strong>Trạng thái:</strong>{" "}
              <Tag
                color={(() => {
                  const statusColorMap = {
                    "Pending": "warning",
                    "Processing": "processing",
                    "Resolved": "success",
                    "Rejected": "error",
                    "Reviewing": "processing",
                    "Approved": "success",
                    "Closed": "default",
                  };
                  const lowerStatus = (detailReport.status || "").toLowerCase();
                  const fallbackColorMap = {
                    "pending": "warning",
                    "processing": "processing",
                    "resolved": "success",
                    "rejected": "error",
                    "reviewing": "processing",
                    "approved": "success",
                    "closed": "default",
                  };
                  return statusColorMap[detailReport.status] || fallbackColorMap[lowerStatus] || "default";
                })()}
              >
                {(() => {
                  const statusMap = {
                    "Pending": "Chờ xử lý",
                    "Processing": "Đang xử lý",
                    "Resolved": "Đã xử lý",
                    "Rejected": "Từ chối",
                    "Reviewing": "Đang xem xét",
                    "Approved": "Đã duyệt",
                    "Closed": "Đã đóng",
                  };
                  const lowerStatus = (detailReport.status || "").toLowerCase();
                  const fallbackTranslations = {
                    "pending": "Chờ xử lý",
                    "processing": "Đang xử lý",
                    "resolved": "Đã xử lý",
                    "rejected": "Từ chối",
                    "reviewing": "Đang xem xét",
                    "approved": "Đã duyệt",
                    "closed": "Đã đóng",
                  };
                  return statusMap[detailReport.status] || fallbackTranslations[lowerStatus] || detailReport.status || "—";
                })()}
              </Tag>
            </div>
            <div>
              <strong>Ngày tạo:</strong> {formatDate(detailReport.createdAt)}
            </div>
            {detailReport.reviewedAt && (
              <div>
                <strong>Thời gian xử lý:</strong>{" "}
                {formatDate(detailReport.reviewedAt)}
              </div>
            )}
            {detailReport.reviewerName && (
              <div>
                <strong>Người xử lý:</strong> {detailReport.reviewerName}
              </div>
            )}
            {detailReport.reviewerNotes && (
              <div>
                <strong>Nội dung xử lý:</strong>
                <div
                  style={{
                    marginTop: 4,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {detailReport.reviewerNotes}
                </div>
              </div>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
}

