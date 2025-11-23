import React, { useState, useEffect } from "react";
import { Card, Button, Tag, Row, Col, Empty, Spin, Space, Typography, Divider, message } from "antd";
import { 
    PlayCircleOutlined, 
    ClockCircleOutlined, 
    FileTextOutlined,
    AudioOutlined,
    ReadOutlined,
    LoadingOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { getPracticeTests, TEST_SKILL, TEST_TYPE, TEST_TYPE_LABELS, TEST_SKILL_LABELS } from "@services/testsService";
import { startTest } from "@services/testExamService";
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
            // getPracticeTests đã normalize và trả về array hoặc object có data property
            const testsData = Array.isArray(response) ? response : (response?.data || []);
            
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
                        
                        // Chỉ check visibilityStatus để xác định test đã Published
                        const isPublished = test.visibilityStatus === "Published" ||
                                          test.visibilityStatus === 3 ||
                                          test.visibilityStatus === "3";
                        
                        return isPractice && isLR && isPublished;
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
                        description: test.description || "Bài luyện tập Listening & Reading",
                        resultProgress: test.resultProgress || null
                    }));
                
                setTests(filtered);
            } else {
                setTests([]);
            }
        } catch (error) {
            console.error("Error fetching practice tests:", error);
            // Nếu là lỗi 404, chỉ set data rỗng, không hiển thị thông báo lỗi
            if (error.response?.status === 404) {
                setTests([]);
            } else {
                message.error("Không thể tải danh sách bài test. Vui lòng thử lại sau.");
                setTests([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStartTest = (test) => {
        // Navigate to confirmation modal/start page with metadata
        navigate(`/toeic-exam?testId=${test.id}`, { state: { from: location.pathname, testMeta: test } });
    };

    const handleContinueTest = async (test) => {
        if (!test.resultProgress || test.resultProgress.status !== "InProgress") {
            message.error("Không tìm thấy thông tin bài test đang làm dở");
            return;
        }

        try {
            message.loading({ content: "Đang tải bài thi...", key: "continueTest" });
            
            const testIdNum = Number(test.id);
            if (Number.isNaN(testIdNum)) {
                message.error({ content: "TestId không hợp lệ", key: "continueTest" });
                return;
            }

            const isSelectTime = test.resultProgress.isSelectTime !== undefined ? !!test.resultProgress.isSelectTime : true;
            const createdAt = test.resultProgress.createdAt;
            
            const data = await startTest(testIdNum, isSelectTime);
            
            if (!data) {
                message.error({ content: "Không thể tải bài thi. Vui lòng thử lại.", key: "continueTest" });
                return;
            }

            if (!data.parts || !Array.isArray(data.parts) || data.parts.length === 0) {
                message.error({ content: "Không có câu hỏi trong bài thi. Vui lòng thử lại.", key: "continueTest" });
                return;
            }

            const buildQuestions = (parts = []) => {
                const questions = [];
                let globalIndex = 1;
                const sortedParts = [...parts].sort((a, b) => (a.partId || 0) - (b.partId || 0));
                sortedParts.forEach((part) => {
                    part?.testQuestions?.forEach((tq) => {
                        if (tq.isGroup && tq.questionGroupSnapshotDto) {
                            const group = tq.questionGroupSnapshotDto;
                            group.questionSnapshots?.forEach((qs, idx) => {
                                questions.push({
                                    testQuestionId: tq.testQuestionId,
                                    subQuestionIndex: idx,
                                    partId: part.partId,
                                    partName: part.partName,
                                    partDescription: part.description,
                                    globalIndex: globalIndex++,
                                    type: "group",
                                    question: qs.content,
                                    passage: group.passage,
                                    imageUrl: qs.imageUrl,
                                    audioUrl: qs.audioUrl,
                                    options: (qs.options || []).map((o) => ({ key: o.label, text: o.content })),
                                    correctAnswer: qs.options?.find((o) => o.isCorrect)?.label,
                                    userAnswer: qs.userAnswer,
                                });
                            });
                        } else if (!tq.isGroup && tq.questionSnapshotDto) {
                            const qs = tq.questionSnapshotDto;
                            questions.push({
                                testQuestionId: tq.testQuestionId,
                                subQuestionIndex: 0,
                                partId: part.partId,
                                partName: part.partName,
                                partDescription: part.description,
                                globalIndex: globalIndex++,
                                type: "single",
                                question: qs.content,
                                imageUrl: qs.imageUrl,
                                audioUrl: qs.audioUrl,
                                options: (qs.options || []).map((o) => ({ key: o.label, text: o.content })),
                                correctAnswer: qs.options?.find((o) => o.isCorrect)?.label,
                                userAnswer: qs.userAnswer,
                            });
                        }
                    });
                });
                return questions;
            };

            const questions = buildQuestions(data.parts);
            
            if (!questions || questions.length === 0) {
                message.error({ content: "Không thể tạo danh sách câu hỏi. Vui lòng thử lại.", key: "continueTest" });
                return;
            }

            const savedAnswers = data.savedAnswers || [];
            const answersMap = new Map();
            
            savedAnswers.forEach((saved) => {
                const subIndex = saved.subQuestionIndex !== undefined && saved.subQuestionIndex !== null 
                    ? saved.subQuestionIndex 
                    : 0;
                
                const testQuestionIdStr = String(saved.testQuestionId);
                const answerKey = subIndex !== 0
                    ? `${testQuestionIdStr}_${subIndex}`
                    : testQuestionIdStr;
                
                const timestamp = saved.updatedAt 
                    ? new Date(saved.updatedAt).getTime()
                    : new Date(saved.createdAt || 0).getTime();
                
                const existing = answersMap.get(answerKey);
                if (!existing || timestamp > existing.timestamp) {
                    let answerValue = null;
                    if (saved.chosenOptionLabel) {
                        answerValue = saved.chosenOptionLabel;
                    } else if (saved.answerText) {
                        answerValue = saved.answerText;
                    } else if (saved.answerAudioUrl) {
                        answerValue = saved.answerAudioUrl;
                    }
                    
                    if (answerValue !== null) {
                        answersMap.set(answerKey, { value: answerValue, timestamp });
                    }
                }
            });
            
            const answers = {};
            answersMap.forEach((item, key) => {
                answers[key] = item.value;
            });

            const testResultId = data.testResultId;
            if (!testResultId) {
                message.error({ content: "Không tìm thấy testResultId. Vui lòng thử lại.", key: "continueTest" });
                return;
            }

            const payload = {
                ...data,
                testId: testIdNum,
                testResultId: testResultId,
                originalTestResultId: testResultId,
                createdAt: createdAt,
                testType: test.testType || "Practice",
                testSkill: data.testSkill || test.testSkill,
                duration: data.duration ?? test.duration ?? 0,
                questionQuantity: data.quantityQuestion ?? data.questionQuantity ?? test.questionQuantity ?? 0,
                questions,
                answers,
                isSelectTime: isSelectTime,
                timerMode: isSelectTime ? "countdown" : "countup",
                startedAt: Date.now(),
                globalAudioUrl: data.audioUrl || null,
                lastBackendLoadTime: Date.now(),
            };

            sessionStorage.setItem("toeic_testData", JSON.stringify(payload));
            
            message.success({ content: "Đã tải bài thi thành công", key: "continueTest" });
            navigate("/exam");
        } catch (error) {
            console.error("Error continuing test:", error);
            message.error({ 
                content: error.response?.data?.message || "Không thể tiếp tục bài test. Vui lòng thử lại.", 
                key: "continueTest" 
            });
        }
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
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} size="large" />
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
                                        test.resultProgress?.status === "InProgress" ? (
                                            <Button
                                                type="default"
                                                size="middle"
                                                onClick={() => handleContinueTest(test)}
                                                className={styles.testStartButton}
                                            >
                                                <Space>
                                                    <PlayCircleOutlined />
                                                    <span>Chưa hoàn thành</span>
                                                </Space>
                                            </Button>
                                        ) : (
                                            <Button
                                                type="primary"
                                                size="middle"
                                                onClick={() => handleStartTest(test)}
                                                className={styles.testStartButton}
                                            >
                                                <Space>
                                                    <PlayCircleOutlined />
                                                    <span>Bắt đầu làm bài</span>
                                                </Space>
                                            </Button>
                                        )
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

