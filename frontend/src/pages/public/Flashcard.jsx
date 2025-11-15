import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col, Tag, Space, Empty, message, Spin } from "antd";
import { PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getUserFlashcardSets, getPublicFlashcardSets } from "@services/flashcardService";
import { useAuth } from "@shared/hooks/useAuth";
import CreateFlashcardSetModal from "@shared/components/Flashcard/CreateFlashcardSetModal";
import UpdateFlashcardSetModal from "@shared/components/Flashcard/UpdateFlashcardSetModal";
import "./Flashcard.css";

export default function Flashcard() {
  const [activeTab, setActiveTab] = useState("flashcard");
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [publicSets, setPublicSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSetId, setEditingSetId] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchFlashcardSets();
  }, [activeTab, isAuthenticated]);

  const fetchFlashcardSets = async () => {
    try {
      setLoading(true);
      if (activeTab === "flashcard") {
        if (isAuthenticated) {
          const data = await getUserFlashcardSets();
          setFlashcardSets(Array.isArray(data) ? data : []);
        } else {
          setFlashcardSets([]);
        }
      } else if (activeTab === "discover") {
        const data = await getPublicFlashcardSets();
        setPublicSets(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching flashcard sets:", error);
      const errorMsg = error?.response?.data?.message || "Không thể tải danh sách flashcard";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa học";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Hôm nay";
      if (diffDays === 1) return "Hôm qua";
      if (diffDays < 7) return `${diffDays} ngày trước`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
      return `${Math.floor(diffDays / 365)} năm trước`;
    } catch {
      return dateString;
    }
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header Section */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "#1a1a1a",
            marginBottom: 12,
          }}
        >
          FlashCards - Học từ vựng hiệu quả
        </h1>
        <p
          style={{
            fontSize: 16,
            color: "#666",
            marginBottom: 32,
          }}
        >
          Tạo và học flashcard của riêng bạn hoặc khám phá các bộ từ cộng đồng
        </p>

        {/* Navigation Tabs */}
        <Space size="middle" style={{ marginTop: 24 }}>
          <Button
            type={activeTab === "flashcard" ? "primary" : "default"}
            size="large"
            onClick={() => setActiveTab("flashcard")}
            style={{
              borderRadius: 8,
              height: 44,
              paddingLeft: 24,
              paddingRight: 24,
              fontWeight: 500,
            }}
            >
              Flashcard của tôi
            </Button>
            <Button
              type={activeTab === "discover" ? "primary" : "default"}
              size="large"
              onClick={() => setActiveTab("discover")}
              style={{
                borderRadius: 8,
                height: 44,
                paddingLeft: 24,
                paddingRight: 24,
                fontWeight: 500,
              }}
            >
              Khám phá
            </Button>
        </Space>
      </div>

      {/* Main Content */}
      {activeTab === "flashcard" && (
        <div>
          {/* Section Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <h2
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: "#1a1a1a",
                margin: 0,
              }}
              >
                Flashcard của tôi
              </h2>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => {
                  if (!isAuthenticated) {
                    message.warning("Vui lòng đăng nhập để tạo flashcard");
                    return;
                  }
                  setCreateModalOpen(true);
                }}
                style={{
                  borderRadius: 8,
                  height: 44,
                  paddingLeft: 24,
                  paddingRight: 24,
                  fontWeight: 500,
                }}
              >
                Thêm mới
              </Button>
          </div>

          {/* Flashcard Sets Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Spin size="large" />
            </div>
          ) : flashcardSets.length === 0 ? (
            <Empty
              description={isAuthenticated ? "Chưa có flashcard nào" : "Đăng nhập để xem flashcard của bạn"}
              style={{ marginTop: 60 }}
            >
              {isAuthenticated && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalOpen(true)}
                >
                  Tạo flashcard mới
                </Button>
              )}
            </Empty>
          ) : (
            <Row gutter={[24, 24]}>
              {flashcardSets.map((set) => (
                <Col xs={24} sm={12} lg={8} key={set.setId}>
                  <Card
                    hoverable
                    onClick={() => navigate(`/flashcard/${set.setId}`)}
                    className="flashcard-card"
                    style={{
                      borderRadius: 12,
                      border: "1px solid #e8e8e8",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      height: "100%",
                      position: "relative",
                      borderLeft: "4px solid #ff6b9d",
                      cursor: "pointer",
                    }}
                    bodyStyle={{ padding: 20 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                      }}
                    >
                      <h3
                        className="flashcard-title"
                        style={{
                          fontSize: 18,
                          fontWeight: 600,
                          color: "#1a1a1a",
                          margin: 0,
                          flex: 1,
                          marginRight: 8,
                        }}
                      >
                        {set.title}
                      </h3>
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        size="small"
                        className="flashcard-edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSetId(set.setId);
                          setEditModalOpen(true);
                        }}
                        style={{ color: "#666" }}
                      />
                    </div>

                    <p
                      className="flashcard-description"
                      style={{
                        fontSize: 14,
                        color: "#666",
                        marginBottom: 16,
                        minHeight: 40,
                      }}
                    >
                      {set.description || "Không có mô tả"}
                    </p>

                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Tag
                          className="flashcard-tag"
                          color={set.isPublic ? "blue" : "default"}
                          style={{
                            borderRadius: 6,
                            padding: "4px 12px",
                            fontWeight: 500,
                          }}
                        >
                          {set.isPublic ? "Công khai" : "Riêng tư"}
                        </Tag>
                        <span
                          className="flashcard-card-count"
                          style={{
                            fontSize: 12,
                            color: "#999",
                          }}
                        >
                          {set.totalCards || 0} thẻ
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: "#999",
                          marginTop: 8,
                        }}
                      >
                        Tạo: {formatDate(set.createdAt)}
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      )}

      {activeTab === "discover" && (
        <div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: "#1a1a1a",
              marginBottom: 24,
            }}
          >
            Khám phá flashcard
          </h2>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Spin size="large" />
            </div>
          ) : publicSets.length === 0 ? (
            <Empty
              description="Chưa có flashcard công khai nào"
              style={{ marginTop: 60 }}
            />
          ) : (
            <Row gutter={[24, 24]}>
              {publicSets.map((set) => (
                <Col xs={24} sm={12} lg={8} key={set.setId}>
                  <Card
                    hoverable
                    onClick={() => navigate(`/flashcard/${set.setId}`)}
                    className="flashcard-card"
                    style={{
                      borderRadius: 12,
                      border: "1px solid #e8e8e8",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      height: "100%",
                      position: "relative",
                      borderLeft: "4px solid #ff6b9d",
                      cursor: "pointer",
                    }}
                    bodyStyle={{ padding: 20 }}
                  >
                    <h3
                      className="flashcard-title"
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#1a1a1a",
                        margin: 0,
                        marginBottom: 12,
                      }}
                    >
                      {set.title}
                    </h3>
                    <p
                      className="flashcard-description"
                      style={{
                        fontSize: 14,
                        color: "#666",
                        marginBottom: 16,
                        minHeight: 40,
                      }}
                    >
                      {set.description || "Không có mô tả"}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Tag color="blue" style={{ borderRadius: 6, padding: "4px 12px", fontWeight: 500 }}>
                        Công khai
                      </Tag>
                      <span style={{ fontSize: 12, color: "#999" }}>
                        {set.totalCards || 0} thẻ
                      </span>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      )}

      <CreateFlashcardSetModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          fetchFlashcardSets();
        }}
      />

      <UpdateFlashcardSetModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingSetId(null);
        }}
        onSuccess={() => {
          fetchFlashcardSets();
        }}
        setId={editingSetId}
      />
    </div>
  );
}

