import React, { useState, useEffect } from "react";
import { Card, Button, Tag, Row, Col, Empty, Spin, Space, Collapse, Typography, Divider, message } from "antd";
import { 
    PlayCircleOutlined, 
    ClockCircleOutlined, 
    FileTextOutlined,
    BulbOutlined,
    CheckCircleOutlined,
    AudioOutlined,
    ReadOutlined,
    BookOutlined,
    RocketOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getPracticeTests, TEST_SKILL, TEST_TYPE, TEST_TYPE_LABELS, TEST_SKILL_LABELS } from "@services/testsService";
import styles from "@shared/styles/PracticeLR.module.css";

const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;

export default function PracticeLR() {
    const navigate = useNavigate();
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
        navigate(`/toeic-exam?testId=${testId}`);
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

                {/* Study Tips Section */}
                <Card
                    className={styles.studyTipsCard}
                    title={
                        <Space>
                            <BulbOutlined className={styles.studyTipsTitleIcon} />
                            <Title level={4} style={{ margin: 0 }}>
                                Cách ôn tập hiệu quả
                            </Title>
                        </Space>
                    }
                >
                    <Row gutter={[24, 24]}>
                        <Col xs={24} lg={12}>
                            <Card
                                size="small"
                                className={`${styles.skillCard} ${styles.skillCardListening}`}
                            >
                                <Space align="start" style={{ width: "100%" }}>
                                    <AudioOutlined className={`${styles.skillIcon} ${styles.skillIconListening}`} />
                                    <div className={styles.skillContent}>
                                        <Title level={5} className={`${styles.skillTitle} ${styles.skillTitleListening}`}>
                                            Kỹ năng Listening
                                        </Title>
                                        <ul className={styles.skillList}>
                                            <li>Nghe toàn bộ câu hỏi trước khi chọn đáp án</li>
                                            <li>Tập trung vào từ khóa và ngữ cảnh</li>
                                            <li>Luyện nghe các accent khác nhau (Anh, Mỹ, Úc)</li>
                                            <li>Làm quen với các dạng câu hỏi trong từng Part</li>
                                            <li>Xem lại transcript sau khi làm bài để học từ vựng</li>
                                        </ul>
                                    </div>
                                </Space>
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card
                                size="small"
                                className={`${styles.skillCard} ${styles.skillCardReading}`}
                            >
                                <Space align="start" style={{ width: "100%" }}>
                                    <ReadOutlined className={`${styles.skillIcon} ${styles.skillIconReading}`} />
                                    <div className={styles.skillContent}>
                                        <Title level={5} className={`${styles.skillTitle} ${styles.skillTitleReading}`}>
                                            Kỹ năng Reading
                                        </Title>
                                        <ul className={styles.skillList}>
                                            <li>Đọc lướt để nắm ý chính trước khi làm bài</li>
                                            <li>Xác định từ khóa trong câu hỏi để tìm thông tin nhanh</li>
                                            <li>Quản lý thời gian: phân bổ đều cho các phần</li>
                                            <li>Học từ vựng theo chủ đề (business, travel, health...)</li>
                                            <li>Làm nhiều bài tập về đoạn văn dài để tăng tốc độ đọc</li>
                                        </ul>
                                    </div>
                                </Space>
                            </Card>
                        </Col>
                    </Row>

                    <Divider className={styles.collapseDivider} />

                    <Collapse
                        defaultActiveKey={['1']}
                        className={styles.collapseContainer}
                        items={[
                            {
                                key: '1',
                                label: (
                                    <Space>
                                        <RocketOutlined className={`${styles.collapseIcon} ${styles.collapseIconRocket}`} />
                                        <Text strong>Lộ trình ôn tập đề xuất</Text>
                                    </Space>
                                ),
                                children: (
                                    <div>
                                        <Paragraph>
                                            <CheckCircleOutlined className={styles.checkIcon} />
                                            <strong>Tuần 1-2:</strong> Làm quen với format bài thi và các dạng câu hỏi cơ bản
                                        </Paragraph>
                                        <Paragraph>
                                            <CheckCircleOutlined className={styles.checkIcon} />
                                            <strong>Tuần 3-4:</strong> Tập trung vào các phần yếu, làm nhiều bài tập theo từng Part
                                        </Paragraph>
                                        <Paragraph>
                                            <CheckCircleOutlined className={styles.checkIcon} />
                                            <strong>Tuần 5-6:</strong> Luyện tập full test, quản lý thời gian và làm bài dưới áp lực
                                        </Paragraph>
                                        <Paragraph>
                                            <CheckCircleOutlined className={styles.checkIcon} />
                                            <strong>Tuần 7-8:</strong> Xem lại các lỗi đã mắc, củng cố kiến thức và chuẩn bị thi
                                        </Paragraph>
                                    </div>
                                )
                            },
                            {
                                key: '2',
                                label: (
                                    <Space>
                                        <BookOutlined className={`${styles.collapseIcon} ${styles.collapseIconBook}`} />
                                        <Text strong>Tips tăng điểm số</Text>
                                    </Space>
                                ),
                                children: (
                                    <ul className={styles.tipsList}>
                                        <li><strong>Phân bổ thời gian hợp lý:</strong> Dành 45 phút cho Listening và 75 phút cho Reading</li>
                                        <li><strong>Không bỏ sót câu hỏi:</strong> Nếu không biết, hãy đoán thay vì để trống</li>
                                        <li><strong>Xem lại bài thường xuyên:</strong> Học từ lỗi sai để không lặp lại</li>
                                        <li><strong>Luyện tập đều đặn:</strong> Dành ít nhất 30 phút mỗi ngày để luyện tập</li>
                                        <li><strong>Mở rộng vốn từ vựng:</strong> Học từ mới mỗi ngày theo chủ đề</li>
                                    </ul>
                                )
                            }
                        ]}
                    />
                </Card>

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
            </div>
        </div>
    );
}

