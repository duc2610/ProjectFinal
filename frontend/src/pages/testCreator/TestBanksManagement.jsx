import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Card,
  Typography,
  Space,
  Button,
  Input,
  Table,
  Tag,
  Tooltip,
  Modal,
  Form,
  InputNumber,
  Radio,
  Select,
  message,
  Steps,
  Divider,
  Checkbox,
  Row,
  Col,
  Upload,
} from "antd";
import {
  PlusOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  SmileOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ReloadOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  ProfileOutlined,
  FormOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  UploadOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getTests,
  getTestById,
  createTestFromBank,
  createTestManual,
  updateTestFromBank,
  updateTestManual,
  hideTest,
  publishTest,
  TEST_TYPE,
  TEST_SKILL,
  TEST_STATUS,
  TEST_TYPE_LABELS,
  TEST_SKILL_LABELS,
  TEST_STATUS_LABELS,
  TEST_STATUS_COLORS,
} from "@services/testsService";
import { getQuestions } from "@services/questionsService";
import { getPartsBySkill } from "@services/partsService";
import { uploadFile, deleteFiles } from "@services/filesService";

const { Title, Text } = Typography;
const { Search } = Input;

const SKILLS = [
  { key: TEST_SKILL.LR, label: "Listening & Reading" },
  { key: TEST_SKILL.SPEAKING, label: "Speaking" },
  { key: TEST_SKILL.WRITING, label: "Writing" },
];

const PART_RULES = {
  // Listening Parts (PartId 1-4)
  1: { requireImage: true, optionCount: 4 },  // Part 1: Photographs
  2: { requireImage: false, optionCount: 3 }, // Part 2: Question-Response
  3: { requireImage: false, optionCount: 4 }, // Part 3: Conversations
  4: { requireImage: false, optionCount: 4 }, // Part 4: Talks
  
  // Reading Parts (PartId 5-7)
  5: { requireImage: false, optionCount: 4 }, // Part 5: Incomplete Sentences
  6: { requireImage: false, optionCount: 4 }, // Part 6: Text Completion
  7: { requireImage: false, optionCount: 4 }, // Part 7: Reading Comprehension
  
  // Writing Parts (PartId 8-10)
  8: { requireImage: true, optionCount: 0 },  // Write sentence based on picture
  9: { requireImage: false, optionCount: 0 }, // Respond to written request
  10: { requireImage: false, optionCount: 0 }, // Write opinion essay
  
  // Speaking Parts (PartId 11-15)
  11: { requireImage: true, optionCount: 0 },  // Read text aloud
  12: { requireImage: true, optionCount: 0 },  // Describe a picture
  13: { requireImage: false, optionCount: 0 }, // Respond to questions
  14: { requireImage: false, optionCount: 0 }, // Respond using information
  15: { requireImage: false, optionCount: 0 }, // Express opinion
};

// TOEIC Simulator Test Requirements
const TOEIC_REQUIREMENTS = {
  [TEST_SKILL.LR]: {
    totalQuestions: 200,
    duration: 120,
    parts: {
      1: { name: "Part 1: Mô tả tranh", minQuestions: 6, maxQuestions: 6, hasPassage: false },
      2: { name: "Part 2: Hỏi – đáp", minQuestions: 25, maxQuestions: 25, hasPassage: false },
      3: { name: "Part 3: Hội thoại", minQuestions: 39, maxQuestions: 39, hasPassage: true, minPerGroup: 2, maxPerGroup: 5 },
      4: { name: "Part 4: Bài nói ngắn", minQuestions: 30, maxQuestions: 30, hasPassage: true, minPerGroup: 2, maxPerGroup: 5 },
      5: { name: "Part 5: Hoàn thành câu", minQuestions: 30, maxQuestions: 30, hasPassage: false },
      6: { name: "Part 6: Hoàn thành đoạn văn", minQuestions: 16, maxQuestions: 16, hasPassage: true, minPerGroup: 2, maxPerGroup: 5 },
      7: { name: "Part 7: Đọc hiểu", minQuestions: 54, maxQuestions: 54, hasPassage: true, minPerGroup: 2, maxPerGroup: 5 },
    }
  },
  [TEST_SKILL.SPEAKING]: {
    totalQuestions: 11,
    duration: 20,
    parts: {
      11: { name: "Part 1: Đọc to (Q1-2)", minQuestions: 2, maxQuestions: 2 },
      12: { name: "Part 2: Có hình ảnh bài toán (Q3-4)", minQuestions: 2, maxQuestions: 2 },
      13: { name: "Part 3: Trả lời câu hỏi thông thường (Q5-7)", minQuestions: 3, maxQuestions: 3 },
      14: { name: "Part 4: Trả lời theo tình huống (Q8-10)", minQuestions: 3, maxQuestions: 3 },
      15: { name: "Part 5: Bài nói dài (Q11)", minQuestions: 1, maxQuestions: 1 },
    }
  },
  [TEST_SKILL.WRITING]: {
    totalQuestions: 8,
    duration: 60,
    parts: {
      8: { name: "Part 1: Có hình ảnh bài toán (Q1-5)", minQuestions: 5, maxQuestions: 5 },
      9: { name: "Part 2: Câu hỏi ngắn (Q6-7)", minQuestions: 2, maxQuestions: 2 },
      10: { name: "Part 3: Viết luận (Q8)", minQuestions: 1, maxQuestions: 1 },
    }
  }
};

const SKILL_COLORS = {
  1: "#52c41a", 
  2: "#fa8c16", 
  3: "#1890ff", 
  4: "#1890ff",
};

const SKILL_NAMES = {
  1: "Speaking",
  2: "Writing",
  3: "Listening",
  4: "Reading",
};

export default function TestBanksManagement() {
  const [query, setQuery] = useState("");


  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  

  const [filters, setFilters] = useState({
    testType: undefined,
    testSkill: undefined,
    status: undefined,
  });
  

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    practice: 0,
  });

  const [setupOpen, setSetupOpen] = useState(false);
  const [setupForm] = Form.useForm();
  const [pendingSetup, setPendingSetup] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();

  const [bankOpen, setBankOpen] = useState(false);
  const [bankSkill, setBankSkill] = useState("all");
  const [bankLevel, setBankLevel] = useState("all");
  const [bankSearch, setBankSearch] = useState("");
  const [bankSelectedKeys, setBankSelectedKeys] = useState([]);
  const [editingTest, setEditingTest] = useState(null);
  
  // Questions from API for bank selection
  const [allQuestions, setAllQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Manual Test Creation
  const [manualOpen, setManualOpen] = useState(false);
  const [manualForm] = Form.useForm();
  const [manualStep, setManualStep] = useState(0);
  const [manualParts, setManualParts] = useState([]);
  const [availableParts, setAvailableParts] = useState([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});

  // Load parts from API based on selected skill
  const loadPartsBySkill = useCallback(async (testSkill) => {
    try {
      setLoadingParts(true);
      // Map TEST_SKILL to QuestionSkill enum (Backend: Speaking=1, Writing=2, Listening=3, Reading=4)
      let parts = [];
      if (testSkill === TEST_SKILL.LR) {
        const listeningParts = await getPartsBySkill(3); // Listening = 3
        const readingParts = await getPartsBySkill(4); // Reading = 4
        parts = [...listeningParts, ...readingParts];
      } else if (testSkill === TEST_SKILL.SPEAKING) {
        parts = await getPartsBySkill(1); // Speaking = 1
      } else if (testSkill === TEST_SKILL.WRITING) {
        parts = await getPartsBySkill(2); // Writing = 2
      }
      
      // Enhance parts with business rules
      const enhancedParts = parts.map(part => ({
        ...part,
        ...PART_RULES[part.partId],
        color: SKILL_COLORS[part.skill],
        skillName: SKILL_NAMES[part.skill],
        displayName: `${part.name}: ${part.description}`,
      }));
      
      setAvailableParts(enhancedParts);
    } catch (error) {
      console.error("Load parts error:", error);
      message.error("Cannot load parts");
    } finally {
      setLoadingParts(false);
    }
  }, []);

  const loadTests = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await getTests({
        page: params.page || pagination.current,
        pageSize: params.pageSize || pagination.pageSize,
        KeyWord: params.keyword || query,
        TestType: params.testType,
        TestSkill: params.testSkill,
        Status: params.status,
        SortOrder: params.sortOrder || "desc",
      });

      if (response) {
        const data = response.data || response;
        const items = data.dataPaginated || data.items || [];
        setTests(items);
        setPagination({
          current: data.currentPage || 1,
          pageSize: data.pageSize || 10,
          total: data.totalCount || data.totalRecords || 0,
        });
        
        // Calculate stats
        setStats({
          total: data.totalCount || 0,
          active: items.filter(t => t.status === TEST_STATUS.ACTIVE || t.status === "Active").length,
          draft: items.filter(t => t.status === TEST_STATUS.DRAFT || t.status === "Draft").length,
          practice: items.filter(t => t.testType === TEST_TYPE.PRACTICE || t.testType === "Practice").length,
        });
      }
    } catch (error) {
      console.error("Load tests error:", error);
      message.error("Không thể tải danh sách tests");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, query]);


  useEffect(() => {
    loadTests();
  }, []);

  const filteredExams = useMemo(() => {
    return tests;
  }, [tests]);

  // Load questions from API
  const loadQuestions = useCallback(async () => {
    try {
      setLoadingQuestions(true);
      const response = await getQuestions({
        page: 1,
        pageSize: 1000, // Load nhiều để có đủ questions
        status: 1, // Active only
      });
      
      if (response) {
        const data = response.data || response;
        const items = data.dataPaginated || data.items || [];
        
        // Add unique key để phân biệt single vs group questions
        const itemsWithUniqueKey = items.map(item => ({
          ...item,
          uniqueKey: item.isGroupQuestion ? `group_${item.id}` : `single_${item.id}`,
        }));
        
        setAllQuestions(itemsWithUniqueKey);
      }
    } catch (error) {
      console.error("Load questions error:", error);
      message.error("Không thể tải danh sách câu hỏi");
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  const bankColumns = [
    { 
      title: "ID", 
      dataIndex: "id", 
      key: "id", 
      width: 80,
      render: (id, record) => (
        <span>{id} {record.isGroupQuestion && <Tag size="small" color="purple">Group</Tag>}</span>
      ),
    },
    { title: "Content", dataIndex: "content", key: "content", ellipsis: true },
    {
      title: "Part",
      dataIndex: "partName",
      key: "partName",
      width: 120,
    },
    {
      title: "Type",
      dataIndex: "typeName",
      key: "typeName",
      width: 200,
      ellipsis: true,
    },
  ];
  
  const bankData = useMemo(() => {
    let data = allQuestions;
    
    // Filter by skill nếu cần
    if (bankSkill !== "all") {
      data = data.filter((q) => {
        const partName = q.partName || "";
        if (bankSkill === TEST_SKILL.LR) {
          return partName.startsWith("L-") || partName.startsWith("R-");
        } else if (bankSkill === TEST_SKILL.SPEAKING) {
          return partName.startsWith("S-");
        } else if (bankSkill === TEST_SKILL.WRITING) {
          return partName.startsWith("W-");
        }
        return true;
      });
    }
    
    // Search filter
    if (bankSearch.trim()) {
      const q = bankSearch.toLowerCase();
      data = data.filter((x) => {
        const content = (x.content || "").toLowerCase();
        const partName = (x.partName || "").toLowerCase();
        const typeName = (x.typeName || "").toLowerCase();
        return content.includes(q) || partName.includes(q) || typeName.includes(q);
      });
    }
    
    return data;
  }, [allQuestions, bankSkill, bankSearch]);

  const examColumns = [
    {
      title: "Test Title",
      dataIndex: "title",
      key: "title",
      render: (v) => (
        <Space>
          <FileTextOutlined />
          <Text strong>{v}</Text>
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "testType",
      key: "testType",
      width: 120,
      render: (type) => {
        // Handle both string and number from backend
        const typeLabel = typeof type === 'string' ? type : TEST_TYPE_LABELS[type];
        return <Tag>{typeLabel || type}</Tag>;
      },
    },
    {
      title: "Skill",
      dataIndex: "testSkill",
      key: "testSkill",
      width: 160,
      render: (skill) => {
        // Handle both string and number from backend
        const skillLabel = typeof skill === 'string' ? skill : TEST_SKILL_LABELS[skill];
        return <Tag color="blue">{skillLabel || skill}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => {
        // Handle both string and number from backend
        const statusStr = typeof status === 'string' ? status : String(status);
        const statusLabel = typeof status === 'string' ? status : TEST_STATUS_LABELS[statusStr];
        const statusColor = TEST_STATUS_COLORS[statusStr] || "default";
        return (
          <Tag color={statusColor}>
            {statusLabel || status}
          </Tag>
        );
      },
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 110,
      render: (min) => (
        <Space>
          <ClockCircleOutlined />
          <span>{min} min</span>
        </Space>
      ),
    },
    {
      title: "Questions",
      dataIndex: "questionQuantity",
      key: "questionQuantity",
      width: 110,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (d) => (d ? dayjs(d).format("M/D/YYYY") : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      align: "right",
      fixed: "right",
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingRight: 8,
          }}
        >
          <Space size={4}>
            <Tooltip title={record.status === TEST_STATUS.ACTIVE ? "Hide" : "Publish"}>
              <Button
                type="text"
                size="small"
                icon={record.status === TEST_STATUS.ACTIVE ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => handleToggleStatus(record)}
              />
            </Tooltip>
            <Tooltip title="View Details">
              <Button
                type="text"
                size="small"
                icon={<SmileOutlined />}
                onClick={() => handleViewTest(record.id)}
              />
            </Tooltip>
            <Tooltip title="Edit">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditTest(record.id)}
              />
            </Tooltip>
          </Space>
        </div>
      ),
    },
  ];

  // Handle toggle test status (Active/Inactive)
  const handleToggleStatus = async (test) => {
    const isActive = test.status === TEST_STATUS.ACTIVE || test.status === "Active";
    
    Modal.confirm({
      title: isActive ? "Hide this test?" : "Publish this test?",
      content: isActive 
        ? "Test will be hidden from examinees." 
        : "Test will be visible to examinees.",
      onOk: async () => {
        try {
          if (isActive) {
            await hideTest(test.id);
            message.success("Test đã được ẩn");
          } else {
            await publishTest(test.id);
            message.success("Test đã được công khai");
          }
          loadTests();
        } catch (error) {
          console.error("Toggle status error:", error);
          message.error("Không thể thay đổi trạng thái test");
        }
      },
    });
  };

  // Handle view test details
  const handleViewTest = async (testId) => {
    try {
      const detail = await getTestById(testId);
      Modal.info({
        title: detail.title,
        width: 800,
        content: (
          <div>
            <p><strong>Description:</strong> {detail.description || "N/A"}</p>
            <p><strong>Type:</strong> {TEST_TYPE_LABELS[detail.testType]}</p>
            <p><strong>Skill:</strong> {TEST_SKILL_LABELS[detail.testSkill]}</p>
            <p><strong>Duration:</strong> {detail.duration} minutes</p>
            <p><strong>Questions:</strong> {detail.quantityQuestion}</p>
            <p><strong>Status:</strong> {TEST_STATUS_LABELS[detail.status]}</p>
            <p><strong>Created:</strong> {dayjs(detail.createdAt).format("DD/MM/YYYY HH:mm")}</p>
          </div>
        ),
      });
    } catch (error) {
      console.error("View test error:", error);
      message.error("Không thể tải chi tiết test");
    }
  };

  // Handle edit test
  const handleEditTest = async (testId) => {
    try {
      const detail = await getTestById(testId);
      setEditingTest(detail);
      
      // Set up form based on test type
      if (detail.testType === TEST_TYPE.PRACTICE) {
        // Practice test - from bank
    setPendingSetup({
          examType: "practice",
          testType: detail.testType,
          testSkill: detail.testSkill,
        });
      } else {
        // Simulator test - manual
        setPendingSetup({
          examType: "simulator",
          testType: detail.testType,
          testSkill: detail.testSkill,
        });
      }
      
      form.setFieldsValue({
        title: detail.title,
        description: detail.description,
        duration: detail.duration,
        testType: detail.testType,
        testSkill: detail.testSkill,
      });
      
      setCreateOpen(true);
    } catch (error) {
      console.error("Edit test error:", error);
      message.error("Không thể tải dữ liệu test để chỉnh sửa");
    }
  };

  function openCreateExamSetup() {
    setupForm.resetFields();
    setPendingSetup(null);
    setEditingTest(null);
    setBankSelectedKeys([]);
    setBankSkill("all");
    setBankLevel("all");
    setBankSearch("");
    setSetupOpen(true);
    // Load questions when opening setup
    loadQuestions();
  }

  function handleSetupOk(values) {
    setPendingSetup(values);
    setSetupOpen(false);
    
    if (values.entryMethod === "bank") {
      // Practice Test: Open bank selection modal
      setBankOpen(true);
    } else if (values.entryMethod === "manual") {
      // Simulator Test: Open manual creation modal
      setManualStep(0);
      setManualParts([]);
      setAvailableParts([]);
      // Reset form to initial values BEFORE opening modal
      manualForm.resetFields();
    
      setManualOpen(true);
    }
  }

  async function handleCreateExam(values) {
    try {
    const setup = pendingSetup || {};
      
      if (editingTest) {
        // Update existing test
        if (editingTest.testType === TEST_TYPE.PRACTICE) {
          await updateTestFromBank(editingTest.testId, {
      title: values.title,
      description: values.description,
            duration: values.duration,
            testSkill: values.testSkill,
            singleQuestionIds: setup.selectedQuestionIds || [],
            groupQuestionIds: setup.selectedGroupIds || [],
          });
        } else {
          // Update manual test - simplified for now
          message.warning("Cập nhật manual test chưa được implement đầy đủ");
        }
        message.success("Cập nhật test thành công");
        setEditingTest(null);
      } else {
        if (setup.examType === "practice") {
          await createTestFromBank({
            title: values.title,
            description: values.description,
            duration: values.duration,
            testSkill: values.testSkill || TEST_SKILL.LR,
            singleQuestionIds: setup.selectedQuestionIds || [],
            groupQuestionIds: setup.selectedGroupIds || [],
          });
        } else {
          // Simulator test manual
          message.warning("Tạo simulator test manual chưa được implement trong UI này");
          return;
        }
        message.success("Tạo test thành công");
      }
      
      setCreateOpen(false);
      loadTests();
    } catch (error) {
      console.error("Create/Update test error:", error);
      message.error(error?.response?.data?.message || "Không thể lưu test");
    }
  }

  function handleBankConfirm() {
    const selected = bankSelectedKeys;
    
    if (selected.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 câu hỏi");
      return;
    }

    // Parse uniqueKey để lấy IDs
    const singleQuestions = [];
    const groupQuestions = [];
    
    selected.forEach(key => {
      if (key.startsWith('single_')) {
        singleQuestions.push(parseInt(key.replace('single_', '')));
      } else if (key.startsWith('group_')) {
        groupQuestions.push(parseInt(key.replace('group_', '')));
      }
    });

    console.log('Single Questions:', singleQuestions);
    console.log('Group Questions:', groupQuestions);

    setPendingSetup((prev) => ({
      ...(prev || {}),
      examType: "practice",
      selectedQuestionIds: singleQuestions,
      selectedGroupIds: groupQuestions,
    }));
    
    setBankOpen(false);

    form.resetFields();
    form.setFieldsValue({
      duration: 120,
      testSkill: TEST_SKILL.LR,
    });
    setCreateOpen(true);
  }


  const handleClearFilters = () => {
    setFilters({
      testType: undefined,
      testSkill: undefined,
      status: undefined,
    });
    setQuery("");
    loadTests({ page: 1 });
  };

  return (
    <div style={{ padding: 24, background: "#f6f7fb", minHeight: "100vh" }}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <div>
        <Title level={3} style={{ margin: 0 }}>
            Test Management
        </Title>
        <Text type="secondary">
            Quản lý bài test TOEIC Practice
        </Text>
        </div>

        {/* Statistics Cards */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Card size="small" style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Total Tests</Text>
                <div style={{ fontSize: 24, fontWeight: 600, color: "#1890ff" }}>
                  {stats.total}
                </div>
              </div>
              <FileTextOutlined style={{ fontSize: 32, color: "#1890ff", opacity: 0.3 }} />
            </div>
          </Card>
          
          <Card size="small" style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Active Tests</Text>
                <div style={{ fontSize: 24, fontWeight: 600, color: "#52c41a" }}>
                  {stats.active}
                </div>
              </div>
              <EyeOutlined style={{ fontSize: 32, color: "#52c41a", opacity: 0.3 }} />
            </div>
          </Card>
          
          <Card size="small" style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Draft Tests</Text>
                <div style={{ fontSize: 24, fontWeight: 600, color: "#faad14" }}>
                  {stats.draft}
                </div>
              </div>
              <ClockCircleOutlined style={{ fontSize: 32, color: "#faad14", opacity: 0.3 }} />
            </div>
          </Card>
          
          <Card size="small" style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Practice Tests</Text>
                <div style={{ fontSize: 24, fontWeight: 600, color: "#722ed1" }}>
                  {stats.practice}
                </div>
              </div>
              <ProfileOutlined style={{ fontSize: 32, color: "#722ed1", opacity: 0.3 }} />
            </div>
          </Card>
        </div>

        <Card
          style={{ marginTop: 12 }}
          styles={{ body: { paddingTop: 16 } }}
          title={
            <Space direction="vertical" size={0}>
              <Text strong style={{ fontSize: 16 }}>
                Test List
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Danh sách bài test TOEIC Practice
              </Text>
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateExamSetup}
            >
              Create New Test
            </Button>
          }
        >
          <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap" }}>
              <Select
                placeholder="All Types"
                allowClear
                style={{ width: 150 }}
                value={filters.testType}
                onChange={(value) => {
                  setFilters(prev => ({ ...prev, testType: value }));
                  loadTests({ testType: value, testSkill: filters.testSkill, status: filters.status, page: 1 });
                }}
                options={[
                  { label: "Simulator", value: TEST_TYPE.SIMULATOR },
                  { label: "Practice", value: TEST_TYPE.PRACTICE },
                ]}
              />
              <Select
                placeholder="All Skills"
                allowClear
                style={{ width: 180 }}
                value={filters.testSkill}
                onChange={(value) => {
                  setFilters(prev => ({ ...prev, testSkill: value }));
                  loadTests({ testType: filters.testType, testSkill: value, status: filters.status, page: 1 });
                }}
                options={SKILLS.map((s) => ({ label: s.label, value: s.key }))}
              />
              <Select
                placeholder="All Status"
                allowClear
                style={{ width: 130 }}
                value={filters.status}
                onChange={(value) => {
                  setFilters(prev => ({ ...prev, status: value }));
                  loadTests({ testType: filters.testType, testSkill: filters.testSkill, status: value, page: 1 });
                }}
                options={[
                  { label: "Active", value: TEST_STATUS.ACTIVE },
                  { label: "Draft", value: TEST_STATUS.DRAFT },
                  { label: "Inactive", value: TEST_STATUS.INACTIVE },
                ]}
              />

          <Search
                placeholder="Search tests..."
            allowClear
                value={query}
                onSearch={(value) => {
                  setQuery(value);
                  loadTests({ keyword: value, page: 1 });
                }}
            onChange={(e) => setQuery(e.target.value)}
                style={{ width: 300 }}
              />
            </div>
            
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => loadTests()}
                loading={loading}
              >
                Refresh
              </Button>
              <Button
                icon={<FilterOutlined />}
                onClick={handleClearFilters}
                disabled={!filters.testType && !filters.testSkill && !filters.status && !query}
              >
                Clear Filters
              </Button>
            </div>
          </div>

            <Table
            rowKey="id"
              columns={examColumns}
              dataSource={filteredExams}
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} tests`,
              onChange: (page, pageSize) => {
                loadTests({ 
                  page, 
                  pageSize,
                  testType: filters.testType,
                  testSkill: filters.testSkill,
                  status: filters.status,
                  keyword: query,
                });
              },
            }}
              scroll={{ x: "max-content" }}
            locale={{
              emptyText: (
                <div style={{ padding: "40px 0" }}>
                  <FileTextOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                  <div style={{ marginTop: 16, color: "#999" }}>
                    {query || filters.testType || filters.testSkill || filters.status
                      ? "No tests found matching your filters"
                      : "No tests yet. Create your first test!"}
                  </div>
                  {!query && !filters.testType && !filters.testSkill && !filters.status && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={openCreateExamSetup}
                      style={{ marginTop: 16 }}
                    >
                      Create New Test
                    </Button>
                  )}
                </div>
              ),
            }}
          />
        </Card>
      </Space>

      <Modal
        title="Create New Test"
        open={setupOpen}
        onCancel={() => setSetupOpen(false)}
        onOk={() => setupForm.submit()}
        okText="Next"
        okButtonProps={{ type: "primary" }}
      >
        <Form
          form={setupForm}
          layout="vertical"
          onFinish={handleSetupOk}
        >
          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ fontSize: 16 }}>Chọn loại test bạn muốn tạo:</Text>
          </div>

          <Form.Item
            name="entryMethod"
            initialValue="bank"
            rules={[{ required: true, message: "Please select test type" }]}
          >
            <Radio.Group style={{ width: "100%" }}>
              <Space direction="vertical" style={{ width: "100%" }} size={12}>
                {/* Practice Test Option */}
                <Card
                  hoverable
                  style={{ 
                    cursor: "pointer",
                    border: "2px solid transparent",
                  }}
                  styles={{
                    body: { padding: 16 }
                  }}
                  onClick={() => setupForm.setFieldValue("entryMethod", "bank")}
                >
                  <Radio value="bank" style={{ width: "100%" }}>
                    <Space direction="vertical" size={8} style={{ width: "100%", marginLeft: 8 }}>
                      <Space>
                        <ProfileOutlined style={{ fontSize: 20, color: "#722ed1" }} />
                        <Text strong style={{ fontSize: 16 }}>Practice Test</Text>
                        <Tag color="purple">From Question Bank</Tag>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 13, display: "block", marginLeft: 28 }}>
                        • Chọn câu hỏi có sẵn từ ngân hàng<br />
                        • Linh hoạt về số lượng câu và parts<br />
                        • Nhanh chóng và tiện lợi
                      </Text>
                    </Space>
                  </Radio>
                </Card>

                {/* Simulator Test Option */}
                <Card
                  hoverable
                  style={{ 
                    cursor: "pointer",
                    border: "2px solid transparent",
                  }}
                  styles={{
                    body: { padding: 16 }
                  }}
                  onClick={() => setupForm.setFieldValue("entryMethod", "manual")}
                >
                  <Radio value="manual" style={{ width: "100%" }}>
                    <Space direction="vertical" size={8} style={{ width: "100%", marginLeft: 8 }}>
                      <Space>
                        <FormOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                        <Text strong style={{ fontSize: 16 }}>Simulator Test</Text>
                        <Tag color="blue">Manual Creation</Tag>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 13, display: "block", marginLeft: 28 }}>
                        • Tạo test thủ công từ đầu<br />
                        • Tuân thủ cấu trúc TOEIC chuẩn<br />
                        • Phù hợp cho bài thi chính thức
                      </Text>
                    </Space>
                  </Radio>
                </Card>
              </Space>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingTest ? "Edit Test" : "Create Test"}
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false);
          setEditingTest(null);
        }}
        onOk={() => form.submit()}
        okText="Save"
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleCreateExam}
          initialValues={{
            duration: 120,
            testSkill: TEST_SKILL.LR,
          }}
        >
          <Form.Item label="Title" name="title" rules={[{ required: true, message: "Nhập tiêu đề test" }]}>
            <Input placeholder="TOEIC Practice Test 1" />
          </Form.Item>
          
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả test (optional)..." />
          </Form.Item>

          <Form.Item
            label="Test Skill"
            name="testSkill"
            rules={[{ required: true, message: "Chọn loại test" }]}
          >
            <Select
              options={SKILLS.map((s) => ({ label: s.label, value: s.key }))}
              placeholder="Chọn test skill"
            />
          </Form.Item>

            <Form.Item
              label="Duration (minutes)"
            name="duration"
            rules={[{ required: true, message: "Nhập thời gian làm bài" }]}
          >
            <InputNumber min={1} max={500} style={{ width: "100%" }} placeholder="120" />
          </Form.Item>

          {pendingSetup && (
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">
                Selected questions: <Tag color="blue">{bankSelectedKeys.length}</Tag>
              </Text>
            </div>
          )}

          {editingTest && (
            <div style={{ marginBottom: 16 }}>
              <Tag color="orange">Editing existing test</Tag>
            </div>
          )}
        </Form>
      </Modal>

      <Modal
        title="Select Questions from Bank"
        open={bankOpen}
        onCancel={() => setBankOpen(false)}
        onOk={handleBankConfirm}
        okText={`Use ${bankSelectedKeys.length} questions`}
        width={1000}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Space wrap>
            <Select
              value={bankSkill}
              onChange={setBankSkill}
              style={{ width: 200 }}
              options={[
                { label: "All skills", value: "all" },
                ...SKILLS.map((s) => ({ label: s.label, value: s.key })),
              ]}
            />
            <Input
              placeholder="Search content/part/type..."
              allowClear
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              style={{ width: 300 }}
            />
          </Space>

          <Table
            size="small"
            rowKey="uniqueKey"
            columns={bankColumns}
            dataSource={bankData}
            loading={loadingQuestions}
            pagination={{ 
              pageSize: 10, 
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} questions`
            }}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: bankSelectedKeys,
              onChange: (selectedRowKeys, selectedRows) => {
               
                setBankSelectedKeys(selectedRowKeys);
              },
              preserveSelectedRowKeys: true,
            }}
          />
        </Space>
      </Modal>

      {/* Simulator Test Creation Modal */}
      <Modal
        title={
          <Space>
            <FormOutlined style={{ color: "#1890ff" }} />
            <span>Create Simulator Test</span>
          </Space>
        }
        open={manualOpen}
        onCancel={() => {
          setManualOpen(false);
          setManualStep(0);
          manualForm.resetFields();
          setManualParts([]);
        }}
        width={900}
        footer={null}
      >
        <Steps
          current={manualStep}
          items={[
            { title: "Basic Info", icon: <FileTextOutlined /> },
            { title: "Configure Parts", icon: <FormOutlined /> },
            { title: "Review", icon: <CheckOutlined /> },
          ]}
          style={{ marginBottom: 24 }}
        />

        <Form
          form={manualForm}
          layout="vertical"
          preserve
          initialValues={{
            testType: TEST_TYPE.SIMULATOR,
            testSkill: TEST_SKILL.LR,
          }}
        >
          {/* Step 0: Basic Info */}
          {manualStep === 0 && (
            <>
              <Form.Item
                name="title"
                label="Test Title"
                rules={[{ required: true, message: "Please enter test title" }]}
              >
                <Input placeholder="e.g., TOEIC Simulator Test 1" />
                        </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                        <Form.Item
                    name="testType"
                    label="Test Type"
                    rules={[{ required: true }]}
                        >
                    <Select>
                      <Select.Option value={TEST_TYPE.SIMULATOR}>Simulator</Select.Option>
                      <Select.Option value={TEST_TYPE.PRACTICE}>Practice</Select.Option>
                    </Select>
                        </Form.Item>
                </Col>
                <Col span={12}>
                        <Form.Item
                    name="testSkill"
                    label="Test Skill"
                    rules={[{ required: true }]}
                  >
                    <Select
                      onChange={(value) => {
                        // Clear audio when switching to Speaking/Writing
                        if (value !== TEST_SKILL.LR) {
                          manualForm.setFieldValue('audioUrl', null);
                          manualForm.setFieldValue('audioFile', null);
                        }
                      }}
                    >
                      {SKILLS.map(s => (
                        <Select.Option key={s.key} value={s.key}>{s.label}</Select.Option>
                      ))}
                    </Select>
                        </Form.Item>
                </Col>
              </Row>

                        <Form.Item
                name="description"
                label="Description"
              >
                <Input.TextArea rows={3} placeholder="Test description (optional)" />
                        </Form.Item>

              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.testSkill !== currentValues.testSkill}>
                {({ getFieldValue }) => {
                  const testSkill = getFieldValue('testSkill');
                  
                  // Only show audio for Listening & Reading
                  if (testSkill === TEST_SKILL.LR) {
                    return (
                      <>
                        {/* Hidden field to store the actual URL string */}
                        <Form.Item name="audioUrl" hidden>
                          <Input />
                        </Form.Item>
                        
                        <Form.Item
                          label="Audio File (for Listening section)"
                          help="Upload full 45-minute audio file for listening section (optional)"
                        >
                          <Upload
                            maxCount={1}
                            accept="audio/*"
                            fileList={manualForm.getFieldValue('audioUrl') ? [{
                              uid: '-1',
                              name: 'Audio file',
                              status: 'done',
                              url: manualForm.getFieldValue('audioUrl'),
                            }] : []}
                            beforeUpload={async (file) => {
                              try {
                                setUploadingFiles(prev => ({ ...prev, audioFile: true }));
                                const url = await uploadFile(file, "audio");
                                manualForm.setFieldValue('audioUrl', url);
                                message.success('Audio uploaded successfully');
                              } catch (error) {
                                console.error('Upload audio error:', error);
                                message.error('Failed to upload audio file');
                              } finally {
                                setUploadingFiles(prev => ({ ...prev, audioFile: false }));
                              }
                              return false;
                            }}
                            onRemove={async () => {
                              const audioUrl = manualForm.getFieldValue('audioUrl');
                              if (audioUrl) {
                                try {
                                  await deleteFiles([audioUrl]);
                                  manualForm.setFieldValue('audioUrl', null);
                                  message.success('Audio removed');
                                } catch (error) {
                                  console.error('Delete audio error:', error);
                                  message.error('Failed to delete audio file');
                                }
                              }
                            }}
                          >
                          <Button
                              icon={<UploadOutlined />} 
                              loading={uploadingFiles.audioFile}
                            >
                              {uploadingFiles.audioFile ? 'Uploading...' : 'Select Audio File'}
                            </Button>
                          </Upload>
                        </Form.Item>
                      </>
                    );
                  }
                  
                  return null;
                }}
              </Form.Item>

              <div style={{ textAlign: "right" }}>
                        <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  onClick={async () => {
                    try {
                      const values = await manualForm.validateFields(['title', 'testType', 'testSkill']);              
                      // Load parts based on selected skill
                      await loadPartsBySkill(values.testSkill);
                      setManualStep(1);
                    } catch (error) {              
                      message.error("Please fill in all required fields");
                    }
                  }}
                >
                  Next: Configure Parts
                        </Button>
              </div>
            </>
          )}

          {/* Step 1: Configure Parts */}
          {manualStep === 1 && (
            <>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Configure Test Parts</Text>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Add parts and their questions. You can add questions directly to a part or group them.
                  </Text>
                </div>
              </div>

              {/* TOEIC Simulator Requirements */}
              {manualForm.getFieldValue('testType') === TEST_TYPE.SIMULATOR && (
                <Card 
                  size="small" 
                  style={{ marginBottom: 16, background: "#e6f7ff", borderColor: "#1890ff" }}
                  title={
                    <Space>
                      <FileTextOutlined style={{ color: "#1890ff" }} />
                      <Text strong style={{ color: "#1890ff" }}>TOEIC Simulator Requirements</Text>
                    </Space>
                  }
                >
                  {(() => {
                    const testSkill = manualForm.getFieldValue('testSkill');
                    const requirements = TOEIC_REQUIREMENTS[testSkill];
                    
                    if (!requirements) return null;
                    
                    return (
                      <Space direction="vertical" style={{ width: "100%" }} size={8}>
                        <div>
                          <Text strong>Total Questions: </Text>
                          <Tag color="blue">{requirements.totalQuestions} câu</Tag>
                          <Text strong style={{ marginLeft: 16 }}>Duration: </Text>
                          <Tag color="green">{requirements.duration} phút</Tag>
                        </div>
                        <Divider style={{ margin: "8px 0" }} />
                        <Text strong>Required Parts Structure:</Text>
                        <div style={{ paddingLeft: 16 }}>
                          {Object.entries(requirements.parts).map(([partId, partReq]) => (
                            <div key={partId} style={{ marginBottom: 4 }}>
                              <Text style={{ fontSize: 12 }}>
                                • {partReq.name}: <Tag size="small" color="orange">{partReq.minQuestions} câu</Tag>
                                {partReq.hasPassage && (
                                  <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                                    (Group: {partReq.minPerGroup}-{partReq.maxPerGroup} câu/nhóm)
                                  </Text>
                                )}
                              </Text>
                            </div>
                          ))}
                        </div>
                        <div style={{ background: "#fff", padding: 8, borderRadius: 4, marginTop: 8 }}>
                          <Text type="warning" style={{ fontSize: 12 }}>
                            ⚠️ <strong>Important:</strong> Simulator test MUST follow exact TOEIC structure above. Practice test can be flexible.
                          </Text>
                        </div>
                      </Space>
                    );
                  })()}
                </Card>
              )}

              {/* Current Progress Summary */}
              {manualParts.length > 0 && (
                <Card size="small" style={{ marginBottom: 16, background: "#f6ffed", borderColor: "#52c41a" }}>
                  <Space direction="vertical" style={{ width: "100%" }} size={4}>
                    <Text strong>Current Progress:</Text>
                    {(() => {
                      const testType = manualForm.getFieldValue('testType');
                      const testSkill = manualForm.getFieldValue('testSkill');
                      const requirements = TOEIC_REQUIREMENTS[testSkill];
                      const currentTotal = manualParts.reduce((sum, part) => {
                        const singleQ = (part.questions || []).length;
                        const groupQ = (part.groups || []).reduce((gsum, g) => gsum + (g.questions || []).length, 0);
                        return sum + singleQ + groupQ;
                      }, 0);
                      
                      if (testType === TEST_TYPE.SIMULATOR && requirements) {
                        const isCorrect = currentTotal === requirements.totalQuestions;
                        return (
                          <div>
                            <Text>Total Questions: </Text>
                            <Tag color={isCorrect ? "success" : "warning"} style={{ fontSize: 16, padding: "4px 12px" }}>
                              {currentTotal} / {requirements.totalQuestions} {isCorrect ? "✓" : ""}
                            </Tag>
                            <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                              ({manualParts.length} / {Object.keys(requirements.parts).length} parts selected)
                            </Text>
                          </div>
                        );
                      }
                      
                      return (
                        <div>
                          <Text>Total Questions: </Text>
                          <Tag color="blue" style={{ fontSize: 16, padding: "4px 12px" }}>
                            {currentTotal}
                          </Tag>
                          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                            ({manualParts.length} parts selected)
                          </Text>
                        </div>
                      );
                    })()}
                  </Space>
                </Card>
              )}

              <Card size="small" style={{ marginBottom: 16, background: "#fafafa" }}>
                <Space direction="vertical" style={{ width: "100%" }} size={16}>
                  <Text strong>Select Parts to Include:</Text>
                  
                  {loadingParts ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <Text type="secondary">Loading parts...</Text>
                    </div>
                  ) : (
                    <Checkbox.Group
                      value={manualParts.map(p => p.partId)}
                      onChange={(checkedValues) => {
                        const newParts = checkedValues.map(partId => {
                          const existing = manualParts.find(p => p.partId === partId);
                          const partInfo = availableParts.find(p => p.partId === partId);
                          return existing || { partId, partInfo, questions: [], groups: [] };
                        });
                        setManualParts(newParts);
                      }}
                      style={{ width: "100%" }}
                    >
                      {/* Group parts by skill */}
                      {Object.entries(
                        availableParts.reduce((acc, part) => {
                          const skillName = part.skillName || "_nogroup";
                          if (!acc[skillName]) acc[skillName] = [];
                          acc[skillName].push(part);
                          return acc;
                        }, {})
                      ).map(([skillName, parts], groupIdx, arr) => {
                        if (skillName === "_nogroup") {
                          // Don't show group header for parts without skill
                          return (
                            <div key={skillName}>
                              <Row gutter={[8, 8]}>
                                {parts.map(part => (
                                  <Col span={24} key={part.partId}>
                                    <Checkbox value={part.partId} style={{ width: "100%" }}>
                                      <Space>
                                        <Text strong>{part.name}</Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                          {part.description}
                                        </Text>
                                      </Space>
                                    </Checkbox>
                                  </Col>
                                ))}
                              </Row>
                            </div>
                          );
                        }
                        
                        return (
                        <div key={skillName} style={{ marginBottom: groupIdx < arr.length - 1 ? 16 : 0 }}>
                          <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                            <Tag color={parts[0]?.color || "#999"}>{skillName}</Tag>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {parts.length} part{parts.length > 1 ? 's' : ''}
                            </Text>
                          </div>
                          <Row gutter={[8, 8]}>
                            {parts.map(part => (
                              <Col span={24} key={part.partId}>
                                <Checkbox value={part.partId} style={{ width: "100%" }}>
                                  <Space>
                                    <Text strong>{part.name}</Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      {part.description}
                                    </Text>
                                  </Space>
                                </Checkbox>
                              </Col>
                            ))}
                          </Row>
                        </div>
                        );
                      })}
                    </Checkbox.Group>
                  )}
                </Space>
              </Card>

              {manualParts.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
                  <FileTextOutlined style={{ fontSize: 48, opacity: 0.3 }} />
                  <div style={{ marginTop: 16 }}>
                    Please select at least one part to configure
                  </div>
                </div>
              )}

              {manualParts.map((part, partIdx) => {
                const partInfo = availableParts.find(p => p.partId === part.partId) || part.partInfo;
                if (!partInfo) return null;
                
                return (
                <Card
                  key={part.partId}
                  size="small"
                  title={
                    <Space>
                      <span>{partInfo.displayName || `${partInfo.name}: ${partInfo.description}`}</span>
                      <Tag color={partInfo.color} style={{ marginLeft: 8 }}>
                        {partInfo.skillName}
                      </Tag>
                    </Space>
                  }
                  style={{ marginBottom: 16 }}
                  extra={
                    <Button
                      size="small"
                      danger
                      onClick={() => {
                        setManualParts(prev => prev.filter((_, i) => i !== partIdx));
                      }}
                    >
                      Remove
                  </Button>
                  }
                >
                  <Space direction="vertical" style={{ width: "100%" }} size={12}>
                    <div>
                      <Text strong>Question Count: </Text>
                      {(() => {
                        const testType = manualForm.getFieldValue('testType');
                        const testSkill = manualForm.getFieldValue('testSkill');
                        const currentCount = (part.questions || []).length + (part.groups || []).reduce((sum, g) => sum + (g.questions || []).length, 0);
                        const requirements = TOEIC_REQUIREMENTS[testSkill];
                        const partReq = requirements?.parts[part.partId];
                        
                        if (testType === TEST_TYPE.SIMULATOR && partReq) {
                          const isCorrect = currentCount === partReq.minQuestions;
                          return (
                            <Tag color={isCorrect ? "success" : "error"}>
                              {currentCount} / {partReq.minQuestions} {isCorrect ? "✓" : "✗"}
                            </Tag>
                          );
                        }
                        
                        return <Text>{currentCount}</Text>;
                      })()}
                </div>
                    
                    <div style={{ background: "#f0f5ff", padding: 8, borderRadius: 4 }}>
                      <Space direction="vertical" size={4}>
                        {partInfo.requireImage ? (
                          <Text style={{ fontSize: 12, color: "#ff4d4f" }}>
                            📷 <strong>Image REQUIRED</strong> for all questions in this part
                          </Text>
                        ) : (partInfo.optionCount === 0) ? (
                          <Text style={{ fontSize: 12, color: "#1890ff" }}>
                            📷 Image optional for this part (can add if helpful)
                          </Text>
                        ) : (
                          <Text style={{ fontSize: 12, color: "#52c41a" }}>
                            ✓ No image needed for this part
                          </Text>
                        )}
                        {partInfo.optionCount === 3 && (
                          <Text style={{ fontSize: 12, color: "#52c41a" }}>
                            ℹ️ This part uses 3 options (A, B, C)
                          </Text>
                        )}
                        {partInfo.optionCount === 4 && (
                          <Text style={{ fontSize: 12, color: "#52c41a" }}>
                            ℹ️ This part uses 4 options (A, B, C, D)
                          </Text>
                        )}
                        {partInfo.optionCount === 0 && (
                          <Text style={{ fontSize: 12, color: "#fa8c16" }}>
                            ℹ️ This part does not use multiple choice options (open-ended)
                          </Text>
                        )}
                      </Space>
    </div>
                    
                    <Space>
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          const newParts = [...manualParts];
                          if (!newParts[partIdx].questions) newParts[partIdx].questions = [];
                          
                          // Create options based on part requirements
                          const currentPartInfo = availableParts.find(p => p.partId === part.partId) || part.partInfo;
                          const options = [];
                          if (currentPartInfo.optionCount === 3) {
                            options.push(
                              { label: "A", content: "", isCorrect: false },
                              { label: "B", content: "", isCorrect: false },
                              { label: "C", content: "", isCorrect: false }
                            );
                          } else if (currentPartInfo.optionCount === 4) {
                            options.push(
                              { label: "A", content: "", isCorrect: false },
                              { label: "B", content: "", isCorrect: false },
                              { label: "C", content: "", isCorrect: false },
                              { label: "D", content: "", isCorrect: false }
                            );
                          }
                          
                          newParts[partIdx].questions.push({
                            content: "",
                            imageUrl: null,
                            options: options,
                            explanation: null,
                          });
                          setManualParts(newParts);
                        }}
                      >
                        Add Single Question
                      </Button>
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          const newParts = [...manualParts];
                          if (!newParts[partIdx].groups) newParts[partIdx].groups = [];
                          newParts[partIdx].groups.push({
                            passage: "",
                            imageUrl: null,
                            questions: [],
                          });
                          setManualParts(newParts);
                        }}
                      >
                        Add Question Group
                      </Button>
                    </Space>

                    {/* Single Questions */}
                    {(part.questions || []).map((q, qIdx) => (
                      <Card
                        key={`q-${qIdx}`}
                        size="small"
                        type="inner"
                        title={`Question ${qIdx + 1}`}
                        extra={
                          <Button
                            size="small"
                          danger
                          type="text"
                            onClick={() => {
                              const newParts = [...manualParts];
                              newParts[partIdx].questions.splice(qIdx, 1);
                              setManualParts(newParts);
                            }}
                          >
                            Remove
                        </Button>
                        }
                      >
                        <Space direction="vertical" style={{ width: "100%" }} size={8}>
                          <Input
                            placeholder="Question content *"
                            value={q.content}
                            onChange={(e) => {
                              const newParts = [...manualParts];
                              newParts[partIdx].questions[qIdx].content = e.target.value;
                              setManualParts(newParts);
                            }}
                            status={!q.content || q.content.trim() === "" ? "error" : ""}
                          />
                          
                          {/* Only show image upload for parts that need it */}
                          {(partInfo.requireImage || partInfo.optionCount === 0) && (
                            <div>
                              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                {partInfo.requireImage ? "Image *" : "Image (optional)"}
                              </Text>
                              <Upload
                                listType="picture-card"
                                maxCount={1}
                                beforeUpload={async (file) => {
                                  const uploadKey = `q-${partIdx}-${qIdx}`;
                                  try {
                                    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));
                                    const url = await uploadFile(file, "image");
                                    const newParts = [...manualParts];
                                    newParts[partIdx].questions[qIdx].imageUrl = url;
                                    setManualParts(newParts);
                                    message.success('Image uploaded');
                                  } catch (error) {
                                    console.error('Upload image error:', error);
                                    message.error('Failed to upload image');
                                  } finally {
                                    setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }));
                                  }
                                  return false;
                                }}
                                onRemove={async () => {
                                  const imageUrl = q.imageUrl;
                                  if (imageUrl) {
                                    try {
                                      await deleteFiles([imageUrl]);
                                      const newParts = [...manualParts];
                                      newParts[partIdx].questions[qIdx].imageUrl = null;
                                      setManualParts(newParts);
                                      message.success('Image removed');
                                    } catch (error) {
                                      console.error('Delete image error:', error);
                                    }
                                  }
                                }}
                              >
                                {!q.imageUrl && (
                                  <div>
                                    <PlusOutlined />
                <div style={{ marginTop: 8 }}>
                                      {uploadingFiles[`q-${partIdx}-${qIdx}`] ? 'Uploading...' : 'Upload'}
                                    </div>
                                  </div>
                                )}
                              </Upload>
                              {partInfo.requireImage && (!q.imageUrl || q.imageUrl.trim() === "") && (
                                <Text type="danger" style={{ fontSize: 12 }}>Image is required</Text>
                              )}
                            </div>
                          )}
                          {partInfo.optionCount > 0 && (
                            <div>
                              <Text strong style={{ fontSize: 12 }}>Options: (Select correct answer)</Text>
                              {q.options.map((opt, optIdx) => (
                              <div key={optIdx} style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                <Checkbox
                                  checked={opt.isCorrect}
                                  onChange={(e) => {
                                    const newParts = [...manualParts];
                                    newParts[partIdx].questions[qIdx].options[optIdx].isCorrect = e.target.checked;
                                    setManualParts(newParts);
                                  }}
                                />
                                <Input
                                  size="small"
                                  style={{ width: 40 }}
                                  value={opt.label}
                                  disabled
                                />
                                <Input
                                  size="small"
                                  placeholder="Option content"
                                  value={opt.content}
                                  onChange={(e) => {
                                    const newParts = [...manualParts];
                                    newParts[partIdx].questions[qIdx].options[optIdx].content = e.target.value;
                                    setManualParts(newParts);
                                  }}
                                />
                              </div>
                              ))}
                            </div>
                          )}
                          <Input.TextArea
                            rows={2}
                            placeholder="Explanation (optional)"
                            value={q.explanation || ""}
                            onChange={(e) => {
                              const newParts = [...manualParts];
                              newParts[partIdx].questions[qIdx].explanation = e.target.value || null;
                              setManualParts(newParts);
                            }}
                          />
      </Space>
                      </Card>
                    ))}

                    {/* Question Groups */}
                    {(part.groups || []).map((group, gIdx) => (
                      <Card
                        key={`g-${gIdx}`}
                        size="small"
                        type="inner"
                        title={`Group ${gIdx + 1}`}
                        extra={
                          <Button
                            size="small"
                            danger
                            type="text"
                            onClick={() => {
                              const newParts = [...manualParts];
                              newParts[partIdx].groups.splice(gIdx, 1);
                              setManualParts(newParts);
                            }}
                          >
                            Remove
                  </Button>
                        }
                      >
                        <Space direction="vertical" style={{ width: "100%" }} size={8}>
                          <Input.TextArea
                            rows={3}
                            placeholder="Passage/Context for this group *"
                            value={group.passage || ""}
                            onChange={(e) => {
                              const newParts = [...manualParts];
                              newParts[partIdx].groups[gIdx].passage = e.target.value || null;
                              setManualParts(newParts);
                            }}
                            status={!group.passage || group.passage.trim() === "" ? "error" : ""}
                          />
                          
                          {/* Only show image upload for parts that need it */}
                          {(partInfo.requireImage || partInfo.optionCount === 0) && (
                            <div>
                              <Text strong style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                Group Image (optional)
                              </Text>
                              <Upload
                                listType="picture-card"
                                maxCount={1}
                                beforeUpload={async (file) => {
                                  const uploadKey = `g-${partIdx}-${gIdx}`;
                                  try {
                                    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));
                                    const url = await uploadFile(file, "image");
                                    const newParts = [...manualParts];
                                    newParts[partIdx].groups[gIdx].imageUrl = url;
                                    setManualParts(newParts);
                                    message.success('Group image uploaded');
                                  } catch (error) {
                                    console.error('Upload group image error:', error);
                                    message.error('Failed to upload image');
                                  } finally {
                                    setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }));
                                  }
                                  return false;
                                }}
                                onRemove={async () => {
                                  const imageUrl = group.imageUrl;
                                  if (imageUrl) {
                                    try {
                                      await deleteFiles([imageUrl]);
                                      const newParts = [...manualParts];
                                      newParts[partIdx].groups[gIdx].imageUrl = null;
                                      setManualParts(newParts);
                                      message.success('Image removed');
                                    } catch (error) {
                                      console.error('Delete group image error:', error);
                                    }
                                  }
                                }}
                              >
                                {!group.imageUrl && (
                                  <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>
                                      {uploadingFiles[`g-${partIdx}-${gIdx}`] ? 'Uploading...' : 'Upload'}
                </div>
                                  </div>
            )}
                              </Upload>
    </div>
                          )}
                          <Divider style={{ margin: "8px 0" }} />
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Text strong style={{ fontSize: 12 }}>Questions in Group:</Text>
                            <Button
                              size="small"
                              type="dashed"
                              icon={<PlusOutlined />}
                              onClick={() => {
                                const newParts = [...manualParts];
                                if (!newParts[partIdx].groups[gIdx].questions) {
                                  newParts[partIdx].groups[gIdx].questions = [];
                                }
                                // Create options based on part requirements
                                const currentPartInfo = availableParts.find(p => p.partId === part.partId) || part.partInfo;
                                const options = [];
                                if (currentPartInfo.optionCount === 3) {
                                  options.push(
                                    { label: "A", content: "", isCorrect: false },
                                    { label: "B", content: "", isCorrect: false },
                                    { label: "C", content: "", isCorrect: false }
                                  );
                                } else if (currentPartInfo.optionCount === 4) {
                                  options.push(
                                    { label: "A", content: "", isCorrect: false },
                                    { label: "B", content: "", isCorrect: false },
                                    { label: "C", content: "", isCorrect: false },
                                    { label: "D", content: "", isCorrect: false }
                                  );
                                }
                                
                                newParts[partIdx].groups[gIdx].questions.push({
                                  content: "",
                                  imageUrl: null,
                                  options: options,
                                  explanation: null,
                                });
                                setManualParts(newParts);
                              }}
                            >
                              Add Question
                            </Button>
    </div>
                          {(group.questions || []).map((gq, gqIdx) => (
                            <Card
                              key={`gq-${gqIdx}`}
                              size="small"
                              style={{ background: "#f9f9f9" }}
                            >
                              <Space direction="vertical" style={{ width: "100%" }} size={4}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <Text strong style={{ fontSize: 11 }}>Q{gqIdx + 1}</Text>
                                  <Button
                                    size="small"
                                    danger
                                    type="text"
                                    style={{ padding: 0, height: "auto" }}
                                    onClick={() => {
                                      const newParts = [...manualParts];
                                      newParts[partIdx].groups[gIdx].questions.splice(gqIdx, 1);
                                      setManualParts(newParts);
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </div>
                                <Input
                                  size="small"
                                  placeholder="Question content *"
                                  value={gq.content}
                                  onChange={(e) => {
                                    const newParts = [...manualParts];
                                    newParts[partIdx].groups[gIdx].questions[gqIdx].content = e.target.value;
                                    setManualParts(newParts);
                                  }}
                                  status={!gq.content || gq.content.trim() === "" ? "error" : ""}
                                />
                                
                                {/* Only show image upload for parts that need it */}
                                {(partInfo.requireImage || partInfo.optionCount === 0) && (
                                  <div>
                                    <Text strong style={{ fontSize: 11, display: "block", marginBottom: 2 }}>
                                      {partInfo.requireImage ? "Image *" : "Image (optional)"}
                                    </Text>
                                    <Upload
                                      listType="picture-card"
                                      maxCount={1}
                                      beforeUpload={async (file) => {
                                        const uploadKey = `gq-${partIdx}-${gIdx}-${gqIdx}`;
                                        try {
                                          setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));
                                          const url = await uploadFile(file, "image");
                                          const newParts = [...manualParts];
                                          newParts[partIdx].groups[gIdx].questions[gqIdx].imageUrl = url;
                                          setManualParts(newParts);
                                          message.success('Image uploaded');
                                        } catch (error) {
                                          console.error('Upload question image error:', error);
                                          message.error('Failed to upload image');
                                        } finally {
                                          setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }));
                                        }
                                        return false;
                                      }}
                                      onRemove={async () => {
                                        const imageUrl = gq.imageUrl;
                                        if (imageUrl) {
                                          try {
                                            await deleteFiles([imageUrl]);
                                            const newParts = [...manualParts];
                                            newParts[partIdx].groups[gIdx].questions[gqIdx].imageUrl = null;
                                            setManualParts(newParts);
                                            message.success('Image removed');
                                          } catch (error) {
                                            console.error('Delete question image error:', error);
                                          }
                                        }
                                      }}
                                    >
                                      {!gq.imageUrl && (
                                        <div>
                                          <PlusOutlined />
                                          <div style={{ marginTop: 4, fontSize: 11 }}>
                                            {uploadingFiles[`gq-${partIdx}-${gIdx}-${gqIdx}`] ? 'Uploading...' : 'Upload'}
                                          </div>
                                        </div>
                                      )}
                                    </Upload>
                                    {partInfo.requireImage && (!gq.imageUrl || gq.imageUrl.trim() === "") && (
                                      <Text type="danger" style={{ fontSize: 11 }}>Required</Text>
                                    )}
                                  </div>
                                )}
                                {partInfo.optionCount > 0 && gq.options.map((opt, optIdx) => (
                                  <div key={optIdx} style={{ display: "flex", gap: 4 }}>
                                    <Checkbox
                                      checked={opt.isCorrect}
                                      onChange={(e) => {
                                        const newParts = [...manualParts];
                                        newParts[partIdx].groups[gIdx].questions[gqIdx].options[optIdx].isCorrect = e.target.checked;
                                        setManualParts(newParts);
                                      }}
                                    />
                                    <Input
                                      size="small"
                                      style={{ width: 30 }}
                                      value={opt.label}
                                      disabled
                                    />
                                    <Input
                                      size="small"
                                      placeholder="Option"
                                      value={opt.content}
                                      onChange={(e) => {
                                        const newParts = [...manualParts];
                                        newParts[partIdx].groups[gIdx].questions[gqIdx].options[optIdx].content = e.target.value;
                                        setManualParts(newParts);
                                      }}
                                    />
                                  </div>
                                ))}
                              </Space>
                            </Card>
                          ))}
                        </Space>
                      </Card>
                    ))}
                  </Space>
                </Card>
                );
              })}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setManualStep(0)}
                >
                  Back
                </Button>
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  onClick={() => {
                    /* VALIDATION COMMENTED OUT - UNCOMMENT TO ENABLE
                    // Validate all parts
                    if (manualParts.length === 0) {
                      message.error("Please select at least one part");
                      return;
                    }

                    const validationErrors = [];
                    const testType = manualForm.getFieldValue('testType');
                    const testSkill = manualForm.getFieldValue('testSkill');
                    const requirements = TOEIC_REQUIREMENTS[testSkill];
                    
                    // Calculate total questions
                    const totalQuestions = manualParts.reduce((sum, part) => {
                      const singleQ = (part.questions || []).length;
                      const groupQ = (part.groups || []).reduce((gsum, g) => gsum + (g.questions || []).length, 0);
                      return sum + singleQ + groupQ;
                    }, 0);
                    
                    // SIMULATOR: Strict validation for TOEIC structure
                    if (testType === TEST_TYPE.SIMULATOR && requirements) {
                      // Check total questions
                      if (totalQuestions !== requirements.totalQuestions) {
                        validationErrors.push(`TOEIC Simulator requires exactly ${requirements.totalQuestions} questions. Current: ${totalQuestions}`);
                      }
                      
                      // Check each part structure
                      Object.entries(requirements.parts).forEach(([partId, partReq]) => {
                        const part = manualParts.find(p => p.partId === parseInt(partId));
                        
                        if (!part) {
                          validationErrors.push(`${partReq.name} is required for TOEIC Simulator`);
                          return;
                        }
                        
                        const partInfo = availableParts.find(p => p.partId === part.partId) || part.partInfo;
                        const singleQCount = (part.questions || []).length;
                        const groupQCount = (part.groups || []).reduce((sum, g) => sum + (g.questions || []).length, 0);
                        const partTotal = singleQCount + groupQCount;
                        
                        // Check question count
                        if (partTotal !== partReq.minQuestions) {
                          validationErrors.push(`${partReq.name}: Must have exactly ${partReq.minQuestions} questions. Current: ${partTotal}`);
                        }
                        
                        // Check group structure
                        if (partReq.hasPassage) {
                          if (singleQCount > 0) {
                            validationErrors.push(`${partReq.name}: All questions must be in groups (passages)`);
                          }
                          
                          (part.groups || []).forEach((group, gIdx) => {
                            const groupQuestionsCount = (group.questions || []).length;
                            if (groupQuestionsCount < partReq.minPerGroup || groupQuestionsCount > partReq.maxPerGroup) {
                              validationErrors.push(`${partReq.name} - Group ${gIdx + 1}: Must have ${partReq.minPerGroup}-${partReq.maxPerGroup} questions. Current: ${groupQuestionsCount}`);
                            }
                          });
                        }
                      });
                    }
                    
                    // Validate each part content
                    manualParts.forEach((part, partIdx) => {
                      const currentPartInfo = availableParts.find(p => p.partId === part.partId) || part.partInfo;
                      if (!currentPartInfo) return;
                      
                      const totalQuestions = (part.questions || []).length + 
                        (part.groups || []).reduce((sum, g) => sum + (g.questions || []).length, 0);
                      
                      if (totalQuestions === 0) {
                        validationErrors.push(`${currentPartInfo.displayName || currentPartInfo.name}: No questions added`);
                        return;
                      }

                      // Validate single questions
                      (part.questions || []).forEach((q, qIdx) => {
                        const partName = currentPartInfo.displayName || currentPartInfo.name;
                        if (!q.content || q.content.trim() === "") {
                          validationErrors.push(`${partName} - Question ${qIdx + 1}: Content is required`);
                        }
                        
                        if (currentPartInfo.requireImage && (!q.imageUrl || q.imageUrl.trim() === "")) {
                          validationErrors.push(`${partName} - Question ${qIdx + 1}: Image is required`);
                        }
                        
                        // Validate options if required
                        if (currentPartInfo.optionCount > 0) {
                          const hasCorrectAnswer = q.options.some(opt => opt.isCorrect);
                          if (!hasCorrectAnswer) {
                            validationErrors.push(`${partName} - Question ${qIdx + 1}: Please select a correct answer`);
                          }
                          
                          const emptyOptions = q.options.filter(opt => !opt.content || opt.content.trim() === "");
                          if (emptyOptions.length > 0) {
                            validationErrors.push(`${partName} - Question ${qIdx + 1}: All options must have content`);
                          }
                        }
                      });

                      // Validate groups
                      (part.groups || []).forEach((group, gIdx) => {
                        const partName = currentPartInfo.displayName || currentPartInfo.name;
                        if (!group.passage || group.passage.trim() === "") {
                          validationErrors.push(`${partName} - Group ${gIdx + 1}: Passage is required`);
                        }
                        
                        if (group.questions.length === 0) {
                          validationErrors.push(`${partName} - Group ${gIdx + 1}: No questions in group`);
                        }
                        
                        group.questions.forEach((gq, gqIdx) => {
                          if (!gq.content || gq.content.trim() === "") {
                            validationErrors.push(`${partName} - Group ${gIdx + 1} - Question ${gqIdx + 1}: Content is required`);
                          }
                          
                          if (currentPartInfo.optionCount > 0) {
                            const hasCorrectAnswer = gq.options.some(opt => opt.isCorrect);
                            if (!hasCorrectAnswer) {
                              validationErrors.push(`${partName} - Group ${gIdx + 1} - Question ${gqIdx + 1}: Please select a correct answer`);
                            }
                            
                            const emptyOptions = gq.options.filter(opt => !opt.content || opt.content.trim() === "");
                            if (emptyOptions.length > 0) {
                              validationErrors.push(`${partName} - Group ${gIdx + 1} - Question ${gqIdx + 1}: All options must have content`);
                            }
                          }
                        });
                      });
                    });

                    if (validationErrors.length > 0) {
                      Modal.error({
                        title: "Validation Errors",
                        content: (
                          <div style={{ maxHeight: 400, overflow: "auto" }}>
                            <ul style={{ paddingLeft: 20 }}>
                              {validationErrors.map((error, idx) => (
                                <li key={idx} style={{ marginBottom: 8 }}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        ),
                        width: 600,
                      });
                      return;
                    }
                    END OF VALIDATION COMMENT */

                    setManualStep(2);
                  }}
                  disabled={false}
                >
                  Next: Review
                </Button>
              </div>
            </>
          )}

          {manualStep === 2 && (
            <>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Review Your Test</Text>
              </div>

              <Card size="small" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <Text type="secondary">Title:</Text> <Text strong>{manualForm.getFieldValue("title")}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Type:</Text> <Tag>{TEST_TYPE_LABELS[manualForm.getFieldValue("testType")]}</Tag>
                  </div>
                  <div>
                    <Text type="secondary">Skill:</Text> <Tag>{TEST_SKILL_LABELS[manualForm.getFieldValue("testSkill")]}</Tag>
                  </div>
                  <div>
                    <Text type="secondary">Total Parts:</Text> <Text strong>{manualParts.length}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Total Questions:</Text>{" "}
                    <Text strong>
                      {manualParts.reduce((sum, part) => {
                        const singleQ = (part.questions || []).length;
                        const groupQ = (part.groups || []).reduce((gsum, g) => gsum + (g.questions || []).length, 0);
                        return sum + singleQ + groupQ;
                      }, 0)}
                    </Text>
                  </div>
                </Space>
              </Card>

              {manualParts.map(part => {
                const partInfo = availableParts.find(p => p.partId === part.partId) || part.partInfo;
                if (!partInfo) return null;
                
  return (
                  <Card key={part.partId} size="small" style={{ marginBottom: 12 }}>
                    <Space direction="vertical" size={4} style={{ width: "100%" }}>
                      <div>
                        <Text strong>{partInfo.displayName || `${partInfo.name}: ${partInfo.description}`}</Text>
                        <Tag color={partInfo.color} style={{ marginLeft: 8 }}>
                          {partInfo.skillName}
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {(part.questions || []).length} single questions, {(part.groups || []).length} groups
                      </Text>
                    </Space>
                  </Card>
                );
              })}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setManualStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={loading}
                  onClick={async () => {
                    try {
                      // Get all form values (including hidden fields)
                      const allValues = manualForm.getFieldsValue(true);
                      
                      // Validate required fields
                      if (!allValues.title) {
                        message.error("Please enter test title");
                        setManualStep(0);
                        return;
                      }
                      
                      if (allValues.testType === undefined || allValues.testType === null) {
                        message.error("Please select test type");
                        setManualStep(0);
                        return;
                      }
                      
                      if (allValues.testSkill === undefined || allValues.testSkill === null) {
                        message.error("Please select test skill");
                        setManualStep(0);
                        return;
                      }
                      
                      if (!manualParts || manualParts.length === 0) {
                        message.error("Please add at least one part with questions");
                        setManualStep(1);
                        return;
                      }
                      
                      let audioUrl = null;
                      if (allValues.audioUrl) {
                        if (typeof allValues.audioUrl === 'string') {
                          audioUrl = allValues.audioUrl;
                        }
                      }
                      
                      const payload = {
                        title: allValues.title,
                        testType: allValues.testType,
                        testSkill: allValues.testSkill,
                        description: allValues.description || null,
                        audioUrl: audioUrl,
                        parts: manualParts,
                      };

                      setLoading(true);
                      await createTestManual(payload);
                      message.success("Test created successfully!");
                      setManualOpen(false);
                      setManualStep(0);
                      manualForm.resetFields();
                      setManualParts([]);
                      loadTests();
                    } catch (error) {
                      const errorMsg = error?.response?.data?.message || error?.message || "Failed to create test";
                      message.error(`Failed to create test: ${errorMsg}`);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Create Test
                </Button>
              </div>
            </>
          )}
      </Form>
    </Modal>
    </div>
  );
}


