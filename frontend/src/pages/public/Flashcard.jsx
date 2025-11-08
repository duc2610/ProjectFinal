import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col, Tag, Space, Empty, message } from "antd";
import { PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Flashcard.css";

export default function Flashcard() {
  const [activeTab, setActiveTab] = useState("flashcard");
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFlashcardSets();
  }, []);

  const fetchFlashcardSets = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // Mock data for now
      const mockData = [
        {
          setId: 1,
          title: "Present Perfect structure",
          description: "Learn the structure and usage of Present Perfect tense",
          isPublic: true,
          lastStudyDate: "2 days ago",
          cardCount: 15,
        },
        {
          setId: 2,
          title: "Business vocabulary: Revenue",
          description: "Essential business vocabulary related to revenue and finance",
          isPublic: false,
          lastStudyDate: "1 week ago",
          cardCount: 20,
        },
      ];
      setFlashcardSets(mockData);
    } catch (error) {
      console.error("Error fetching flashcard sets:", error);
      message.error("Không thể tải danh sách flashcard");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return dateString || "Chưa học";
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
                onClick={() => message.info("Tính năng đang phát triển")}
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
          {flashcardSets.length === 0 && !loading ? (
            <Empty
              description="Chưa có flashcard nào"
              style={{ marginTop: 60 }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => message.info("Tính năng đang phát triển")}
              >
                Tạo flashcard mới
              </Button>
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
                          message.info("Tính năng đang phát triển");
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
                      {set.description || "Mô tả"}
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
                          {set.cardCount} thẻ
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: "#999",
                          marginTop: 8,
                        }}
                      >
                        Lần học cuối: {formatDate(set.lastStudyDate)}
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
          <Empty
            description="Tính năng đang phát triển"
            style={{ marginTop: 60 }}
          />
        </div>
      )}
    </div>
  );
}

