import React, { useState, useEffect } from "react";
import { Card, Button, Tag, Row, Col, Empty, Spin, Space, Typography, Divider, message } from "antd";
import { 
    PlayCircleOutlined, 
    ClockCircleOutlined, 
    FileTextOutlined,
    AudioOutlined,
    ReadOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { getPracticeTests, TEST_SKILL, TEST_TYPE, TEST_TYPE_LABELS, TEST_SKILL_LABELS } from "@services/testsService";
import styles from "@shared/styles/PracticeLR.module.css";

const { Title, Text, Paragraph } = Typography;

export default function PracticeLR() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [tests, setTests] = useState([]);

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const response = await getPracticeTests();
            // Backend trả về { statusCode, message, data: [...], success }
            const testsData = response?.data || (Array.isArray(response) ? response : []);
            
            if (Array.isArray(testsData) && testsData.length > 0) {
                // Filter chỉ lấy Practice tests với skill LR (Listening & Reading)
                const filtered = testsData
                    .filter(test => {
                        // Check testType: có thể là "Practice" (string) hoặc 2 (number)
                        const isPractice = test.testType === "Practice" || 
                                         test.testType === TEST_TYPE.PRACTICE || 
                                         test.testType === 2;
                        
                        // Check testSkill: có thể là "LR" (string) hoặc 3 (number)
                        // Bỏ qua các test có testSkill = 0 hoặc không hợp lệ
                        const isLR = (test.testSkill === "LR" || 
                                     test.testSkill === TEST_SKILL.LR || 
                                     test.testSkill === 3) &&
                                     test.testSkill !== 0;
                        
                        // Check status: có thể là "Active" (string) hoặc 1 (number)
                        const isActive = test.status === "Active" || 
                                       test.status === 1 || 
                                       test.status === "1";
                        
                        return isPractice && isLR && isActive;
                    })
                    .map(test => ({
                        id: test.id,
                        title: test.title || "Untitled Test",
                        testType: test.testType === "Practice" ? "Practice" : (TEST_TYPE_LABELS[test.testType] || "Practice"),
                        testSkill: test.testSkill === "LR" ? "LR" : (TEST_SKILL_LABELS[test.testSkill] || "LR"),
                        duration: test.duration || 0,
                        questionQuantity: test.questionQuantity || 0,
                        status: test.status,
                        version: test.version,
                        description: test.description || "Bài luyện tập Listening & Reading"
                    }));
                
                setTests(filtered);
            } else {
                setTests([]);
            }
        } catch (error) {
            console.error("Error fetching practice tests:", error);
            message.error("Không thể tải danh sách bài test. Vui lòng thử lại sau.");
            setTests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStartTest = (testId) => {
        // Navigate to test selection/start page
        navigate(`/toeic-exam?testId=${testId}`, { state: { from: location.pathname } });
    };

    const getSkillColor = (skill) => {
        switch(skill) {
            case "Listening & Reading":
            case "LR":
                return "purple";
            default: 
                return "blue";
        }
    };

    const getSkillLabel = (skill) => {
        switch(skill) {
            case "Listening & Reading":
            case "LR":
                return "Listening & Reading";
            default: 
                return skill;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                {/* Header Section */}
                <div className={styles.headerSection}>
                    <h1 className={styles.headerTitle}>
                        Practice Listening & Reading
                    </h1>
                    <p className={styles.headerDescription}>
                        Luyện tập kỹ năng nghe và đọc với hàng ngàn câu hỏi đa dạng từ cơ bản đến nâng cao
                    </p>
                </div>

                {/* Tests Section Header */}
                <div className={styles.testsHeaderSection}>
                    <Divider className={styles.testsHeaderDivider}>
                        <Space>
                            <PlayCircleOutlined className={styles.testsHeaderIcon} />
                            <Title level={3} className={styles.testsHeaderTitle}>
                                Danh sách bài luyện tập
                            </Title>
                        </Space>
                    </Divider>
                    <Paragraph className={styles.testsHeaderDescription}>
                        Chọn một bài test để bắt đầu luyện tập kỹ năng Listening & Reading của bạn
                    </Paragraph>
                </div>

                {/* Tests Grid */}
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <Spin size="large" />
                    </div>
                ) : tests.length === 0 ? (
                    <Card className={styles.emptyCard}>
                        <Empty 
                            description="Không tìm thấy bài test nào"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </Card>
                ) : (
                    <Row gutter={[16, 16]}>
                        {tests.map((test) => (
                            <Col xs={24} sm={12} lg={6} key={test.id}>
                                <Card
                                    hoverable
                                    className={styles.testCard}
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
                                            size="middle"
                                            onClick={() => handleStartTest(test.id)}
                                            className={styles.testStartButton}
                                        >
                                            Bắt đầu làm bài
                                        </Button>
                                    ]}
                                >
                                    <div className={styles.testTagsContainer}>
                                        <Tag 
                                            color={getSkillColor(test.testSkill)}
                                            className={styles.testTag}
                                        >
                                            {getSkillLabel(test.testSkill)}
                                        </Tag>
                                        <Tag 
                                            color="orange"
                                            className={styles.testTag}
                                        >
                                            {test.testType}
                                        </Tag>
                                    </div>

                                    <h3 className={styles.testTitle}>
                                        {test.title}
                                    </h3>

                                    <p className={styles.testDescription}>
                                        {test.description}
                                    </p>

                                    <div className={styles.testFooter}>
                                        <Space>
                                            <ClockCircleOutlined className={`${styles.testFooterIcon} ${styles.testFooterIconClock}`} />
                                            <span className={styles.testFooterIcon}>
                                                {test.duration} phút
                                            </span>
                                        </Space>
                                        <Space>
                                            <FileTextOutlined className={`${styles.testFooterIcon} ${styles.testFooterIconFile}`} />
                                            <span className={styles.testFooterIcon}>
                                                {test.questionQuantity} câu
                                            </span>
                                        </Space>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Test Structure Section */}
                <div className={styles.testStructureSection}>
                    <Divider className={styles.structureDivider}>
                        <Space>
                            <FileTextOutlined className={styles.structureIcon} />
                            <Title level={3} className={styles.structureTitle}>
                                Cấu trúc đề thi TOEIC Listening & Reading
                            </Title>
                        </Space>
                    </Divider>
                    <Paragraph className={styles.structureDescription}>
                        Tìm hiểu về cấu trúc và format của bài thi TOEIC để chuẩn bị tốt nhất cho kỳ thi của bạn
                    </Paragraph>

                    <Row gutter={[24, 24]}>
                        {/* Listening Section */}
                        <Col xs={24} lg={12}>
                            <Card
                                className={`${styles.structureCard} ${styles.structureCardListening}`}
                                title={
                                    <Space>
                                        <AudioOutlined className={styles.structureCardIcon} />
                                        <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
                                            Listening (Nghe)
                                        </Title>
                                    </Space>
                                }
                            >
                                <div className={styles.structureInfo}>
                                    <Text strong className={styles.structureInfoText}>
                                        Tổng cộng: 100 câu hỏi | Thời gian: 45 phút
                                    </Text>
                                </div>
                                <Divider style={{ margin: "16px 0" }} />
                                <div className={styles.partList}>
                                    <div className={styles.partItem}>
                                        <Tag color="blue" className={styles.partTag}>Part 1</Tag>
                                        <div className={styles.partContent}>
                                            <Text strong>Photographs (Mô tả hình ảnh)</Text>
                                            <Text type="secondary" className={styles.partDetail}>6 câu hỏi</Text>
                                        </div>
                                    </div>
                                    <div className={styles.partItem}>
                                        <Tag color="blue" className={styles.partTag}>Part 2</Tag>
                                        <div className={styles.partContent}>
                                            <Text strong>Question-Response (Hỏi - Đáp)</Text>
                                            <Text type="secondary" className={styles.partDetail}>25 câu hỏi</Text>
                                        </div>
                                    </div>
                                    <div className={styles.partItem}>
                                        <Tag color="blue" className={styles.partTag}>Part 3</Tag>
                                        <div className={styles.partContent}>
                                            <Text strong>Conversations (Hội thoại)</Text>
                                            <Text type="secondary" className={styles.partDetail}>39 câu hỏi (13 đoạn hội thoại)</Text>
                                        </div>
                                    </div>
                                    <div className={styles.partItem}>
                                        <Tag color="blue" className={styles.partTag}>Part 4</Tag>
                                        <div className={styles.partContent}>
                                            <Text strong>Short Talks (Bài nói ngắn)</Text>
                                            <Text type="secondary" className={styles.partDetail}>30 câu hỏi (10 bài nói)</Text>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        {/* Reading Section */}
                        <Col xs={24} lg={12}>
                            <Card
                                className={`${styles.structureCard} ${styles.structureCardReading}`}
                                title={
                                    <Space>
                                        <ReadOutlined className={styles.structureCardIcon} />
                                        <Title level={4} style={{ margin: 0, color: "#52c41a" }}>
                                            Reading (Đọc)
                                        </Title>
                                    </Space>
                                }
                            >
                                <div className={styles.structureInfo}>
                                    <Text strong className={styles.structureInfoText}>
                                        Tổng cộng: 100 câu hỏi | Thời gian: 75 phút
                                    </Text>
                                </div>
                                <Divider style={{ margin: "16px 0" }} />
                                <div className={styles.partList}>
                                    <div className={styles.partItem}>
                                        <Tag color="green" className={styles.partTag}>Part 5</Tag>
                                        <div className={styles.partContent}>
                                            <Text strong>Incomplete Sentences (Hoàn thành câu)</Text>
                                            <Text type="secondary" className={styles.partDetail}>30 câu hỏi</Text>
                                        </div>
                                    </div>
                                    <div className={styles.partItem}>
                                        <Tag color="green" className={styles.partTag}>Part 6</Tag>
                                        <div className={styles.partContent}>
                                            <Text strong>Text Completion (Hoàn thành đoạn văn)</Text>
                                            <Text type="secondary" className={styles.partDetail}>16 câu hỏi (4 đoạn văn)</Text>
                                        </div>
                                    </div>
                                    <div className={styles.partItem}>
                                        <Tag color="green" className={styles.partTag}>Part 7</Tag>
                                        <div className={styles.partContent}>
                                            <Text strong>Reading Comprehension (Đọc hiểu)</Text>
                                            <Text type="secondary" className={styles.partDetail}>54 câu hỏi (Đơn văn bản và Đa văn bản)</Text>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <Card className={styles.totalInfoCard}>
                        <Row gutter={[24, 16]} align="middle">
                            <Col xs={24} sm={8}>
                                <div className={styles.totalInfoItem}>
                                    <Title level={2} className={styles.totalInfoNumber}>200</Title>
                                    <Text className={styles.totalInfoLabel}>Tổng số câu hỏi</Text>
                                </div>
                            </Col>
                            <Col xs={24} sm={8}>
                                <div className={styles.totalInfoItem}>
                                    <Title level={2} className={styles.totalInfoNumber}>120</Title>
                                    <Text className={styles.totalInfoLabel}>Phút làm bài</Text>
                                </div>
                            </Col>
                            <Col xs={24} sm={8}>
                                <div className={styles.totalInfoItem}>
                                    <Title level={2} className={styles.totalInfoNumber}>990</Title>
                                    <Text className={styles.totalInfoLabel}>Điểm tối đa</Text>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </div>
            </div>
        </div>
    );
}

