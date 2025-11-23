import React, { useState, useEffect } from "react";
import { Card, Button, Tag, Row, Col, Empty, Spin, Space, Typography, Divider, message } from "antd";
import { 
    PlayCircleOutlined, 
    ClockCircleOutlined, 
    FileTextOutlined,
    AudioOutlined,
    EditOutlined,
    LoadingOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { getPracticeTests, TEST_SKILL, TEST_TYPE, TEST_TYPE_LABELS, TEST_SKILL_LABELS } from "@services/testsService";
import { startTest } from "@services/testExamService";
import styles from "@shared/styles/PracticeSW.module.css";

const { Title, Text, Paragraph } = Typography;

export default function PracticeSW() {
    const navigate = useNavigate();
    const location = useLocation();
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
            // getPracticeTests đã normalize và trả về array hoặc object có data property
            const testsData = Array.isArray(response) ? response : (response?.data || []);
            
            if (Array.isArray(testsData) && testsData.length > 0) {
                // Filter chỉ lấy Practice tests
                const practiceTests = testsData.filter(test => {
                    const isPractice = test.testType === "Practice" || 
                                     test.testType === TEST_TYPE.PRACTICE || 
                                     test.testType === 2;
                    
                    // Chỉ check visibilityStatus để xác định test đã Published
                    const isPublished = test.visibilityStatus === "Published" ||
                                      test.visibilityStatus === 3 ||
                                      test.visibilityStatus === "3";
                    
                    return isPractice && isPublished;
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
                        description: test.description || "Bài luyện tập Speaking",
                        resultProgress: test.resultProgress || null
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
                        description: test.description || "Bài luyện tập Writing",
                        resultProgress: test.resultProgress || null
                    }));
                
                setSpeakingTests(speaking);
                setWritingTests(writing);
            } else {
                setSpeakingTests([]);
                setWritingTests([]);
            }
        } catch (error) {
            console.error("Error fetching practice tests:", error);
            // Nếu là lỗi 404, chỉ set data rỗng, không hiển thị thông báo lỗi
            if (error.response?.status === 404) {
                setSpeakingTests([]);
                setWritingTests([]);
            } else {
                message.error("Không thể tải danh sách bài test. Vui lòng thử lại sau.");
                setSpeakingTests([]);
                setWritingTests([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStartTest = (test) => {
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
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} size="large" />
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
                                test.resultProgress?.status === "InProgress" ? (
                                    <Button
                                        type="default"
                                        icon={<PlayCircleOutlined />}
                                        size="middle"
                                        onClick={() => handleContinueTest(test)}
                                        className={styles.testStartButton}
                                    >
                                        Chưa hoàn thành
                                    </Button>
                                ) : (
                                    <Button
                                        type="primary"
                                        icon={<PlayCircleOutlined />}
                                        size="middle"
                                        onClick={() => handleStartTest(test)}
                                        className={styles.testStartButton}
                                    >
                                        Bắt đầu làm bài
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

                {/* Test Structure Section */}
                <div className={styles.testStructureSection}>
                    <Divider className={styles.structureDivider}>
                        <Space>
                            <FileTextOutlined className={styles.structureIcon} />
                            <Title level={3} className={styles.structureTitle}>
                                Cấu trúc đề thi TOEIC Speaking & Writing
                            </Title>
                        </Space>
                    </Divider>
                    <Paragraph className={styles.structureDescription}>
                        Tìm hiểu về cấu trúc và format của bài thi TOEIC Speaking & Writing để chuẩn bị tốt nhất cho kỳ thi của bạn
                    </Paragraph>

                    <Row gutter={[24, 24]}>
                        {/* Speaking Section */}
                        <Col xs={24} lg={12}>
                            <Card
                                className={`${styles.structureCard} ${styles.structureCardSpeaking}`}
                                title={
                                    <Space>
                                        <AudioOutlined className={styles.structureCardIcon} />
                                        <Title level={4} style={{ margin: 0, color: "#ff4d4f" }}>
                                            Speaking (Nói)
                                        </Title>
                                    </Space>
                                }
                            >
                                <div className={styles.structureInfo}>
                                    <Text strong className={styles.structureInfoText}>
                                        Tổng cộng: 11 câu hỏi | Thời gian: ~20 phút
                                    </Text>
                                </div>
                                <Divider style={{ margin: "16px 0" }} />
                                <div className={styles.partList}>
                                    <div className={styles.partItem}>
                                        <Tag color="red" className={styles.partTag}>Part 1</Tag>
                                        <div className={styles.partContent}>
                                            <Text strong>Read a text aloud (Đọc to một đoạn văn)</Text>
                                            <Text type="secondary" className={styles.partDetail}>2 câu hỏi</Text>
                                        </div>
                                    </div>
                                    <div className={styles.partItem}>
                                        <Tag color="red" className={styles.partTag}>Part 2</Tag>
                                        <div className={styles.partContent}>
                                            <Text strong>Describe a picture (Mô tả hình ảnh)</Text>
                                            <Text type="secondary" className={styles.partDetail}>1 câu hỏi</Text>
                                        </div>
                                    </div>
                                    <div className={styles.partItem}>
                                        <Tag color="red" className={styles.partTag}>Part 3</Tag>
                                        <div className={styles.partContent}>
                                            <Text strong>Respond to questions (Trả lời câu hỏi)</Text>
                                            <Text type="secondary" className={styles.partDetail}>3 câu hỏi</Text>
                                        </div>
                                    </div>
                                    <div className={styles.partItem}>
                                        <Tag color="red" className={styles.partTag}>Part 4</Tag>
                                        <div className={styles.partContent}>
                                            <Text strong>Respond to questions using information provided (Trả lời câu hỏi dựa trên thông tin cho sẵn)</Text>
                                            <Text type="secondary" className={styles.partDetail}>3 câu hỏi</Text>
                                        </div>
                                    </div>
                                    <div className={styles.partItem}>
                                        <Tag color="red" className={styles.partTag}>Part 5</Tag>
                                        <div className={styles.partContent}>
                                            <Text strong>Propose a solution (Đề xuất giải pháp)</Text>
                                            <Text type="secondary" className={styles.partDetail}>1 câu hỏi</Text>
                                        </div>
                                    </div>
                                    <div className={styles.partItem}>
                                        <Tag color="red" className={styles.partTag}>Part 6</Tag>
                                        <div className={styles.partContent}>
                                            <Text strong>Express an opinion (Bày tỏ quan điểm)</Text>
                                            <Text type="secondary" className={styles.partDetail}>1 câu hỏi</Text>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        {/* Writing Section */}
                        <Col xs={24} lg={12}>
                            <Card
                                className={`${styles.structureCard} ${styles.structureCardWriting}`}
                                title={
                                    <Space>
                                        <EditOutlined className={styles.structureCardIcon} />
                                        <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
                                            Writing (Viết)
                                        </Title>
                                    </Space>
                                }
                            >
                                <div className={styles.structureInfo}>
                                    <Text strong className={styles.structureInfoText}>
                                        Tổng cộng: 8 câu hỏi | Thời gian: ~60 phút
                                    </Text>
                                </div>
                                <Divider style={{ margin: "16px 0" }} />
                                <div className={styles.partList}>
                                    <div className={styles.partItem}>
                                        <Tag color="blue" className={styles.partTag}>Part 1</Tag>
                                        <div className={styles.partContent}>
                                            <Text strong>Write a sentence based on a picture (Viết câu dựa trên hình ảnh)</Text>
                                            <Text type="secondary" className={styles.partDetail}>5 câu hỏi</Text>
                                        </div>
                                    </div>
                                    <div className={styles.partItem}>
                                        <Tag color="blue" className={styles.partTag}>Part 2</Tag>
                                        <div className={styles.partContent}>
                                            <Text strong>Respond to a written request (Trả lời yêu cầu bằng văn bản)</Text>
                                            <Text type="secondary" className={styles.partDetail}>2 câu hỏi</Text>
                                        </div>
                                    </div>
                                    <div className={styles.partItem}>
                                        <Tag color="blue" className={styles.partTag}>Part 3</Tag>
                                        <div className={styles.partContent}>
                                            <Text strong>Write an opinion essay (Viết bài luận bày tỏ quan điểm)</Text>
                                            <Text type="secondary" className={styles.partDetail}>1 câu hỏi</Text>
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
                                    <Title level={2} className={styles.totalInfoNumber}>19</Title>
                                    <Text className={styles.totalInfoLabel}>Tổng số câu hỏi</Text>
                                </div>
                            </Col>
                            <Col xs={24} sm={8}>
                                <div className={styles.totalInfoItem}>
                                    <Title level={2} className={styles.totalInfoNumber}>80</Title>
                                    <Text className={styles.totalInfoLabel}>Phút làm bài</Text>
                                </div>
                            </Col>
                            <Col xs={24} sm={8}>
                                <div className={styles.totalInfoItem}>
                                    <Title level={2} className={styles.totalInfoNumber}>400</Title>
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

