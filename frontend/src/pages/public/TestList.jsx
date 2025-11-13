import React, { useState, useEffect } from "react";
import { Card, Button, Tag, Row, Col, Empty, Spin, Space, Typography, Divider, message, Select } from "antd";
import { 
    PlayCircleOutlined, 
    ClockCircleOutlined, 
    FileTextOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { getSimulatorTests, TEST_SKILL, TEST_TYPE, TEST_TYPE_LABELS, TEST_SKILL_LABELS } from "@services/testsService";
import styles from "@shared/styles/PracticeLR.module.css";

const { Title, Paragraph } = Typography;
const { Option } = Select;

export default function TestList() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [tests, setTests] = useState([]);
    const [filterSkill, setFilterSkill] = useState("all");
    const [allTests, setAllTests] = useState([]);

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        setLoading(true);
        try {
            const response = await getSimulatorTests();
            const testsData = response?.data || (Array.isArray(response) ? response : []);
            
            if (Array.isArray(testsData) && testsData.length > 0) {
                const processed = testsData
                    .filter(test => {
                        const isSimulator = test.testType === "Simulator" || 
                                          test.testType === TEST_TYPE.SIMULATOR || 
                                          test.testType === 1;
                        
                        // Check status: Published = 3 (theo backend enum)
                        const isPublished = test.status === "Published" || 
                                          test.status === 3 || 
                                          test.status === "3";
                        
                        return isSimulator && isPublished && test.testSkill !== 0;
                    })
                    .map(test => ({
                        id: test.id,
                        title: test.title || "Untitled Test",
                        testType: test.testType === "Simulator" ? "Simulator" : (TEST_TYPE_LABELS[test.testType] || "Simulator"),
                        testSkill: test.testSkill === "Speaking" ? "Speaking" :
                                  test.testSkill === "Writing" ? "Writing" :
                                  test.testSkill === "LR" ? "Listening & Reading" :
                                  test.testSkill === "FourSkills" || test.testSkill === 4 ? "Four Skills" :
                                  (TEST_SKILL_LABELS[test.testSkill] || "Unknown"),
                        testSkillValue: test.testSkill,
                        duration: test.duration || 0,
                        questionQuantity: test.questionQuantity || 0,
                        status: test.status,
                        version: test.version,
                        description: test.description || "Bài thi mô phỏng TOEIC"
                    }));
                
                setAllTests(processed);
                applyFilter(processed, filterSkill);
            } else {
                setAllTests([]);
                setTests([]);
            }
        } catch (error) {
            console.error("Error fetching simulator tests:", error);
            if (error.response?.status === 404) {
                setAllTests([]);
                setTests([]);
            } else {
                message.error("Không thể tải danh sách bài test. Vui lòng thử lại sau.");
                setAllTests([]);
                setTests([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = (testsList, skill) => {
        if (skill === "all") {
            setTests(testsList);
            return;
        }
        
        const skillValue = skill === "lr" ? TEST_SKILL.LR :
                         skill === "speaking" ? TEST_SKILL.SPEAKING :
                         skill === "writing" ? TEST_SKILL.WRITING :
                         skill === "fourSkills" ? TEST_SKILL.FOUR_SKILLS : null;
        
        if (skillValue === null) {
            setTests(testsList);
            return;
        }
        
        const filtered = testsList.filter(test => {
            const testSkillNum = Number(test.testSkillValue);
            const skillNum = Number(skillValue);

            if (testSkillNum === skillNum) {
                return true;
            }
            
            if (test.testSkillValue === skillValue || test.testSkillValue === skillNum) {
                return true;
            }
            
            if (skill === "lr" && (test.testSkillValue === 3 || test.testSkill === "LR" || test.testSkillValue === "LR")) {
                return true;
            }
            if (skill === "speaking" && (test.testSkillValue === 1 || test.testSkill === "Speaking" || test.testSkillValue === "Speaking")) {
                return true;
            }
            if (skill === "writing" && (test.testSkillValue === 2 || test.testSkill === "Writing" || test.testSkillValue === "Writing")) {
                return true;
            }
            if (skill === "fourSkills" && (test.testSkillValue === 4 || test.testSkill === "FourSkills" || test.testSkill === "Four Skills" || test.testSkillValue === "FourSkills" || test.testSkillValue === "Four Skills")) {
                return true;
            }
            
            return false;
        });
        setTests(filtered);
    };

    const handleFilterChange = (skill) => {
        setFilterSkill(skill);
        if (allTests.length > 0) {
            applyFilter(allTests, skill);
        }
    };

    useEffect(() => {
        if (allTests.length > 0 && filterSkill) {
            applyFilter(allTests, filterSkill);
        }
    }, [filterSkill, allTests]);

    const handleStartTest = (test) => {
        navigate(`/toeic-exam?testId=${test.id}`, { state: { from: location.pathname, testMeta: test } });
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
            case "Four Skills":
            case "FourSkills":
                return "blue";
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
            case "Four Skills":
            case "FourSkills":
                return "Four Skills";
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

                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
                    <Select
                        value={filterSkill}
                        onChange={handleFilterChange}
                        style={{ width: 200 }}
                        placeholder="Lọc theo kỹ năng"
                    >
                        <Option value="all">Tất cả</Option>
                        <Option value="lr">Listening & Reading</Option>
                        <Option value="speaking">Speaking</Option>
                        <Option value="writing">Writing</Option>
                        <Option value="fourSkills">Four Skills</Option>
                    </Select>
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
                                            onClick={() => handleStartTest(test)}
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
