import React, { useState } from "react";
import { Card, Button, Tag, Row, Col, Empty, Spin, Space } from "antd";
import { 
    PlayCircleOutlined, 
    ClockCircleOutlined, 
    FileTextOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export default function PracticeLR() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Mock data - sẽ được thay bằng API call sau
    const mockTests = [
        {
            id: 1,
            title: "Practice Test 1 - Listening & Reading",
            testType: "Practice",
            testSkill: "LR",
            duration: 60,
            questionQuantity: 100,
            version: 1,
            status: "Active",
            description: "Bài luyện tập Listening & Reading cơ bản với 100 câu hỏi"
        },
        {
            id: 2,
            title: "Practice Test 2 - Advanced Listening",
            testType: "Practice",
            testSkill: "LR",
            duration: 90,
            questionQuantity: 150,
            version: 2,
            status: "Active",
            description: "Bài luyện tập nâng cao tập trung vào kỹ năng Listening"
        },
        {
            id: 3,
            title: "Practice Test 3 - Reading Comprehension",
            testType: "Practice",
            testSkill: "LR",
            duration: 75,
            questionQuantity: 120,
            version: 1,
            status: "Active",
            description: "Bài luyện tập chuyên sâu về Reading với các đoạn văn dài"
        },
    ];

    const filteredTests = mockTests;

    const handleStartTest = (testId) => {
        // Navigate to test selection/start page
        navigate(`/toeic-exam?testId=${testId}`);
    };

    const getSkillColor = (skill) => {
        switch(skill) {
            case "LR": return "purple";
            default: return "blue";
        }
    };

    const getSkillLabel = (skill) => {
        switch(skill) {
            case "LR": return "Listening & Reading";
            default: return skill;
        }
    };

    return (
        <div style={{ 
            minHeight: "100vh", 
            padding: "40px 20px",
            background: "#f5f5f5"
        }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                {/* Header Section */}
                <div style={{ 
                    textAlign: "center", 
                    marginBottom: 40
                }}>
                    <h1 style={{ 
                        fontSize: "42px", 
                        fontWeight: "bold",
                        marginBottom: 16,
                        color: "#262626"
                    }}>
                        Practice Listening & Reading
                    </h1>
                    <p style={{ 
                        fontSize: "18px", 
                        color: "#595959",
                        maxWidth: 600,
                        margin: "0 auto"
                    }}>
                        Luyện tập kỹ năng nghe và đọc với hàng ngàn câu hỏi đa dạng từ cơ bản đến nâng cao
                    </p>
                </div>

                {/* Tests Grid */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <Spin size="large" />
                    </div>
                ) : filteredTests.length === 0 ? (
                    <Card style={{ borderRadius: 12 }}>
                        <Empty 
                            description="Không tìm thấy bài test nào"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </Card>
                ) : (
                    <Row gutter={[16, 16]}>
                        {filteredTests.map((test) => (
                            <Col xs={24} sm={12} lg={6} key={test.id}>
                                <Card
                                    hoverable
                                    style={{
                                        borderRadius: 12,
                                        height: "100%",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                        transition: "all 0.3s",
                                        border: "1px solid #e8e8e8",
                                        display: "flex",
                                        flexDirection: "column"
                                    }}
                                    bodyStyle={{ 
                                        padding: "24px",
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column"
                                    }}
                                    actions={[
                                        <Button
                                            type="primary"
                                            icon={<PlayCircleOutlined />}
                                            size="large"
                                            block
                                            onClick={() => handleStartTest(test.id)}
                                            style={{
                                                borderRadius: 8,
                                                height: 44,
                                                fontSize: "16px",
                                                fontWeight: 600
                                            }}
                                        >
                                            Bắt đầu làm bài
                                        </Button>
                                    ]}
                                >
                                    <div style={{ marginBottom: 16 }}>
                                        <Tag 
                                            color={getSkillColor(test.testSkill)}
                                            style={{ 
                                                fontSize: "12px",
                                                padding: "4px 12px",
                                                borderRadius: 4,
                                                marginBottom: 12
                                            }}
                                        >
                                            {getSkillLabel(test.testSkill)}
                                        </Tag>
                                        <Tag 
                                            color="orange"
                                            style={{ 
                                                fontSize: "12px",
                                                padding: "4px 12px",
                                                borderRadius: 4,
                                                marginBottom: 12
                                            }}
                                        >
                                            {test.testType}
                                        </Tag>
                                        {test.version && (
                                            <Tag 
                                                color="blue"
                                                style={{ 
                                                    fontSize: "12px",
                                                    padding: "4px 12px",
                                                    borderRadius: 4,
                                                    marginBottom: 12
                                                }}
                                            >
                                                v{test.version}
                                            </Tag>
                                        )}
                                    </div>

                                    <h3 style={{ 
                                        fontSize: "20px", 
                                        fontWeight: "bold",
                                        marginBottom: 12,
                                        color: "#262626",
                                        lineHeight: 1.4
                                    }}>
                                        {test.title}
                                    </h3>

                                    <p style={{ 
                                        color: "#8c8c8c",
                                        marginBottom: 20,
                                        fontSize: "14px",
                                        lineHeight: 1.6,
                                        flex: 1
                                    }}>
                                        {test.description}
                                    </p>

                                    <div style={{ 
                                        display: "flex", 
                                        justifyContent: "space-between",
                                        paddingTop: 16,
                                        borderTop: "1px solid #f0f0f0",
                                        marginTop: "auto"
                                    }}>
                                        <Space>
                                            <ClockCircleOutlined style={{ color: "#1890ff" }} />
                                            <span style={{ fontSize: "14px", color: "#595959" }}>
                                                {test.duration} phút
                                            </span>
                                        </Space>
                                        <Space>
                                            <FileTextOutlined style={{ color: "#52c41a" }} />
                                            <span style={{ fontSize: "14px", color: "#595959" }}>
                                                {test.questionQuantity} câu
                                            </span>
                                        </Space>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </div>
    );
}

