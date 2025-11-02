import React, { useState, useEffect } from "react";
import { Card, Button, Tag, Row, Col, Empty, Spin, Space, Collapse, Typography, Divider, message } from "antd";
import { 
    PlayCircleOutlined, 
    ClockCircleOutlined, 
    FileTextOutlined,
    BulbOutlined,
    CheckCircleOutlined,
    AudioOutlined,
    EditOutlined,
    BookOutlined,
    RocketOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getPracticeTests, TEST_SKILL, TEST_TYPE, TEST_TYPE_LABELS, TEST_SKILL_LABELS } from "@services/testsService";
import styles from "@shared/styles/PracticeSW.module.css";

const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;

export default function PracticeSW() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [speakingTests, setSpeakingTests] = useState([]);
    const [writingTests, setWritingTests] = useState([]);

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const response = await getPracticeTests();
            const testsData = response?.data || (Array.isArray(response) ? response : []);
            
            if (Array.isArray(testsData) && testsData.length > 0) {
                // Filter chỉ lấy Practice tests
                const practiceTests = testsData.filter(test => {
                    const isPractice = test.testType === "Practice" || 
                                     test.testType === TEST_TYPE.PRACTICE || 
                                     test.testType === 2;
                    
                    const isActive = test.status === "Active" || 
                                   test.status === 1 || 
                                   test.status === "1";
                    
                    return isPractice && isActive;
                });

                // Tách riêng Speaking và Writing
                const speaking = practiceTests
                    .filter(test => {
                        const isSpeaking = (test.testSkill === "Speaking" || 
                                           test.testSkill === TEST_SKILL.SPEAKING || 
                                           test.testSkill === 1) &&
                                           test.testSkill !== 0;
                        return isSpeaking;
                    })
                    .map(test => ({
                        id: test.id,
                        title: test.title || "Untitled Test",
                        testType: test.testType === "Practice" ? "Practice" : (TEST_TYPE_LABELS[test.testType] || "Practice"),
                        testSkill: test.testSkill === "Speaking" ? "Speaking" : (TEST_SKILL_LABELS[test.testSkill] || "Speaking"),
                        duration: test.duration || 0,
                        questionQuantity: test.questionQuantity || 0,
                        status: test.status,
                        version: test.version,
                        description: test.description || "Bài luyện tập Speaking"
                    }));

                const writing = practiceTests
                    .filter(test => {
                        const isWriting = (test.testSkill === "Writing" || 
                                          test.testSkill === TEST_SKILL.WRITING || 
                                          test.testSkill === 2) &&
                                          test.testSkill !== 0;
                        return isWriting;
                    })
                    .map(test => ({
                        id: test.id,
                        title: test.title || "Untitled Test",
                        testType: test.testType === "Practice" ? "Practice" : (TEST_TYPE_LABELS[test.testType] || "Practice"),
                        testSkill: test.testSkill === "Writing" ? "Writing" : (TEST_SKILL_LABELS[test.testSkill] || "Writing"),
                        duration: test.duration || 0,
                        questionQuantity: test.questionQuantity || 0,
                        status: test.status,
                        version: test.version,
                        description: test.description || "Bài luyện tập Writing"
                    }));
                
                setSpeakingTests(speaking);
                setWritingTests(writing);
            } else {
                setSpeakingTests([]);
                setWritingTests([]);
            }
        } catch (error) {
            console.error("Error fetching practice tests:", error);
            message.error("Không thể tải danh sách bài test. Vui lòng thử lại sau.");
            setSpeakingTests([]);
            setWritingTests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStartTest = (testId) => {
        navigate(`/toeic-exam?testId=${testId}`);
    };

    const getSkillColor = (skill) => {
        switch(skill) {
            case "Speaking":
                return "red";
            case "Writing":
                return "geekblue";
            default: 
                return "blue";
        }
    };

    const getSkillLabel = (skill) => {
        switch(skill) {
            case "Speaking":
                return "Speaking";
            case "Writing":
                return "Writing";
            default: 
                return skill;
        }
    };

    const renderTestCards = (tests) => {
        if (loading) {
            return (
                <div className={styles.loadingContainer}>
                    <Spin size="large" />
                </div>
            );
        }

        if (tests.length === 0) {
            return (
                <Card className={styles.emptyCard}>
                    <Empty 
                        description="Không tìm thấy bài test nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </Card>
            );
        }

        return (
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
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                {/* Header Section */}
                <div className={styles.headerSection}>
                    <h1 className={styles.headerTitle}>
                        Practice Speaking & Writing
                    </h1>
                    <p className={styles.headerDescription}>
                        Luyện tập kỹ năng nói và viết với hàng ngàn câu hỏi đa dạng từ cơ bản đến nâng cao
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
                                className={`${styles.skillCard} ${styles.skillCardSpeaking}`}
                            >
                                <Space align="start" style={{ width: "100%" }}>
                                    <AudioOutlined className={`${styles.skillIcon} ${styles.skillIconSpeaking}`} />
                                    <div className={styles.skillContent}>
                                        <Title level={5} className={`${styles.skillTitle} ${styles.skillTitleSpeaking}`}>
                                            Kỹ năng Speaking
                                        </Title>
                                        <ul className={styles.skillList}>
                                            <li>Phát âm rõ ràng, chuẩn xác từng từ</li>
                                            <li>Nói với tốc độ vừa phải, không quá nhanh</li>
                                            <li>Sử dụng ngữ điệu tự nhiên khi nói</li>
                                            <li>Luyện tập các chủ đề thường gặp (business, daily life, travel...)</li>
                                            <li>Ghi âm và nghe lại để tự đánh giá phát âm</li>
                                        </ul>
                                    </div>
                                </Space>
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card
                                size="small"
                                className={`${styles.skillCard} ${styles.skillCardWriting}`}
                            >
                                <Space align="start" style={{ width: "100%" }}>
                                    <EditOutlined className={`${styles.skillIcon} ${styles.skillIconWriting}`} />
                                    <div className={styles.skillContent}>
                                        <Title level={5} className={`${styles.skillTitle} ${styles.skillTitleWriting}`}>
                                            Kỹ năng Writing
                                        </Title>
                                        <ul className={styles.skillList}>
                                            <li>Sử dụng cấu trúc ngữ pháp đúng và đa dạng</li>
                                            <li>Viết câu hoàn chỉnh, logic và mạch lạc</li>
                                            <li>Mở rộng vốn từ vựng để viết tự nhiên hơn</li>
                                            <li>Kiểm tra chính tả và dấu câu cẩn thận</li>
                                            <li>Luyện viết theo các dạng đề thường xuất hiện</li>
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
                                        <li><strong>Phân bổ thời gian hợp lý:</strong> Dành đều thời gian cho Speaking và Writing</li>
                                        <li><strong>Luyện tập thường xuyên:</strong> Nói và viết mỗi ngày để tăng phản xạ</li>
                                        <li><strong>Xem lại bài thường xuyên:</strong> Học từ lỗi sai để không lặp lại</li>
                                        <li><strong>Mở rộng vốn từ vựng:</strong> Học từ mới mỗi ngày theo chủ đề</li>
                                        <li><strong>Tự đánh giá và cải thiện:</strong> Ghi âm, viết lại và so sánh với đáp án mẫu</li>
                                    </ul>
                                )
                            }
                        ]}
                    />
                </Card>

                {/* Speaking Tests Section */}
                <div className={styles.testsHeaderSection}>
                    <Divider className={styles.testsHeaderDivider}>
                        <Space>
                            <PlayCircleOutlined className={styles.testsHeaderIcon} />
                            <Title level={3} className={styles.testsHeaderTitle}>
                                Bài luyện tập Speaking
                            </Title>
                        </Space>
                    </Divider>
                    <Paragraph className={styles.testsHeaderDescription}>
                        Chọn một bài test để bắt đầu luyện tập kỹ năng Speaking
                    </Paragraph>
                </div>

                {renderTestCards(speakingTests)}

                {/* Writing Tests Section */}
                <div className={styles.testsHeaderSection} style={{ marginTop: 48 }}>
                    <Divider className={styles.testsHeaderDivider}>
                        <Space>
                            <PlayCircleOutlined className={styles.testsHeaderIcon} />
                            <Title level={3} className={styles.testsHeaderTitle}>
                                Bài luyện tập Writing
                            </Title>
                        </Space>
                    </Divider>
                    <Paragraph className={styles.testsHeaderDescription}>
                        Chọn một bài test để bắt đầu luyện tập kỹ năng Writing
                    </Paragraph>
                </div>

                {renderTestCards(writingTests)}
            </div>
        </div>
    );
}

