import React, { useState, useEffect } from "react";
import { Card, Button, Tag, Row, Col, Empty, Spin, Space, Typography, Divider, message } from "antd";
import { 
    PlayCircleOutlined, 
    ClockCircleOutlined, 
    FileTextOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getSimulatorTests, TEST_SKILL, TEST_TYPE, TEST_TYPE_LABELS, TEST_SKILL_LABELS } from "@services/testsService";
import styles from "@shared/styles/PracticeLR.module.css";

const { Title, Paragraph } = Typography;

export default function TestList() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [tests, setTests] = useState([]);

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const response = await getSimulatorTests();
            const testsData = response?.data || (Array.isArray(response) ? response : []);
            
            if (Array.isArray(testsData) && testsData.length > 0) {
                const filtered = testsData
                    .filter(test => {
                        const isSimulator = test.testType === "Simulator" || 
                                          test.testType === TEST_TYPE.SIMULATOR || 
                                          test.testType === 1;
                        
                        const isActive = test.status === "Active" || 
                                       test.status === 1 || 
                                       test.status === "1";
                        
                        return isSimulator && isActive && test.testSkill !== 0;
                    })
                    .map(test => ({
                        id: test.id,
                        title: test.title || "Untitled Test",
                        testType: test.testType === "Simulator" ? "Simulator" : (TEST_TYPE_LABELS[test.testType] || "Simulator"),
                        testSkill: test.testSkill === "Speaking" ? "Speaking" :
                                  test.testSkill === "Writing" ? "Writing" :
                                  test.testSkill === "LR" ? "Listening & Reading" :
                                  (TEST_SKILL_LABELS[test.testSkill] || "Unknown"),
                        duration: test.duration || 0,
                        questionQuantity: test.questionQuantity || 0,
                        status: test.status,
                        version: test.version,
                        description: test.description || "Bài thi mô phỏng TOEIC"
                    }));
                
                setTests(filtered);
            } else {
                setTests([]);
            }
        } catch (error) {
            console.error("Error fetching simulator tests:", error);
            message.error("Không thể tải danh sách bài test. Vui lòng thử lại sau.");
            setTests([]);
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
            case "Speaking":
                return "Speaking";
            case "Writing":
                return "Writing";
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
                        Simulator Tests
                    </h1>
                    <p className={styles.headerDescription}>
                        Làm bài thi mô phỏng TOEIC với format giống như bài thi thật, đánh giá năng lực toàn diện
                    </p>
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
                                            color="cyan"
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
