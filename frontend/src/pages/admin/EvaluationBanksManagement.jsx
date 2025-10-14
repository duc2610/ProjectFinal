import React, { useMemo, useState } from "react";
import {
  Card,
  Typography,
  Space,
  Segmented,
  Button,
  Input,
  Table,
  Tag,
  Tooltip,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Radio,
  Select,
  Divider,
  Upload,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ProfileOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Search } = Input;
const { Dragger } = Upload;

const SKILLS = [
  { key: "listening", label: "Listening" },
  { key: "reading", label: "Reading" },
  { key: "speaking", label: "Speaking" },
  { key: "writing", label: "Writing" },
];

export default function EvaluationBanksManagement() {
  const [activeTab, setActiveTab] = useState("exams");
  const [activeSkill, setActiveSkill] = useState("listening");
  const [query, setQuery] = useState("");

  const [exams, setExams] = useState([
    {
      key: "ex1",
      title: "TOEIC Practice Test 1",
      description:
        "Full-length TOEIC practice test with listening and reading sections",
      durationMin: 120,
      numQuestions: 200,
      createdAt: "2024-01-15",
      type: "Full Test",
      entryMethod: "From Bank",
      section: null,
      selectedQuestionIds: [],
    },
    {
      key: "ex2",
      title: "TOEIC Practice Test 2",
      description: "Advanced level TOEIC practice test",
      durationMin: 120,
      numQuestions: 200,
      createdAt: "2024-02-01",
      type: "Section",
      entryMethod: "Blank",
      section: "Reading",
      selectedQuestionIds: [],
    },
  ]);

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

  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const [importSelected, setImportSelected] = useState([]);

  const [questionsBySkill, setQuestionsBySkill] = useState({
    listening: [
      {
        key: "qL1",
        code: "L-001",
        text: "What did the man say?",
        level: "Easy",
        skill: "listening",
      },
      {
        key: "qL2",
        code: "L-002",
        text: "Where are they going?",
        level: "Medium",
        skill: "listening",
      },
    ],
    reading: [
      {
        key: "qR1",
        code: "R-001",
        text: "Choose the correct synonym",
        level: "Medium",
        skill: "reading",
      },
      {
        key: "qR2",
        code: "R-002",
        text: "Fill in the blank",
        level: "Hard",
        skill: "reading",
      },
    ],
    speaking: [
      {
        key: "qS1",
        code: "S-001",
        text: "Describe the picture",
        level: "Easy",
        skill: "speaking",
      },
    ],
    writing: [
      {
        key: "qW1",
        code: "W-001",
        text: "Write an email to...",
        level: "Medium",
        skill: "writing",
      },
    ],
  });

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkForm] = Form.useForm();

  const filteredExams = useMemo(() => {
    let data = exams;
    if (query?.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }
    return data;
  }, [query, exams]);

  const filteredQuestions = useMemo(() => {
    let data = questionsBySkill[activeSkill] || [];
    if (query?.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (x) =>
          x.code.toLowerCase().includes(q) ||
          x.text.toLowerCase().includes(q) ||
          (x.level || "").toLowerCase().includes(q)
      );
    }
    return data;
  }, [query, questionsBySkill, activeSkill]);

  const allBank = useMemo(
    () => Object.values(questionsBySkill).flat(),
    [questionsBySkill]
  );
  const bankColumns = [
    { title: "Code", dataIndex: "code", key: "code", width: 110 },
    { title: "Question", dataIndex: "text", key: "text", ellipsis: true },
    {
      title: "Skill",
      dataIndex: "skill",
      key: "skill",
      width: 120,
      render: (v) => SKILLS.find((s) => s.key === v)?.label || v,
    },
    { title: "Level", dataIndex: "level", key: "level", width: 110 },
  ];
  const bankData = useMemo(() => {
    let data = allBank;
    if (pendingSetup?.examType === "section" && pendingSetup?.section) {
      data = data.filter((q) => q.skill === pendingSetup.section);
    }
    if (bankSkill !== "all") data = data.filter((q) => q.skill === bankSkill);
    if (bankLevel !== "all")
      data = data.filter(
        (q) => (q.level || "").toLowerCase() === bankLevel.toLowerCase()
      );
    if (bankSearch.trim()) {
      const q = bankSearch.toLowerCase();
      data = data.filter(
        (x) =>
          x.code.toLowerCase().includes(q) ||
          x.text.toLowerCase().includes(q) ||
          (x.level || "").toLowerCase().includes(q)
      );
    }
    return data;
  }, [allBank, bankSkill, bankLevel, bankSearch, pendingSetup]);

  const examColumns = [
    {
      title: "Exam Title",
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
      dataIndex: "type",
      key: "type",
      width: 150,
      render: (t, r) => (
        <Space size={4}>
          <Tag>{t}</Tag>
          {r.section ? <Tag color="blue">{r.section}</Tag> : null}
        </Space>
      ),
    },
    {
      title: "Entry",
      dataIndex: "entryMethod",
      key: "entryMethod",
      width: 140,
      render: (v) => <Tag color="geekblue">{v}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (v) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Duration",
      dataIndex: "durationMin",
      key: "durationMin",
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
      dataIndex: "numQuestions",
      key: "numQuestions",
      width: 110,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (d) => dayjs(d).format("M/D/YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      align: "right",
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingRight: 8,
          }}
        >
          <Space size={8}>
            <Tooltip title="View Questions">
              <Button
                type="text"
                icon={<SmileOutlined />}
                onClick={() => console.log("view", record)}
                style={{ width: 32, height: 32 }}
              />
            </Tooltip>
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEditExam(record)}
                style={{ width: 32, height: 32 }}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDeleteExam(record.key)}
                style={{ width: 32, height: 32 }}
              />
            </Tooltip>
          </Space>
        </div>
      ),
    },
  ];

  const questionColumns = [
    { title: "Code", dataIndex: "code", key: "code", width: 120 },
    { title: "Question", dataIndex: "text", key: "text", ellipsis: true },
    { title: "Level", dataIndex: "level", key: "level", width: 120 },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      align: "right",
      render: (_, record) => (
        <Space size={8} style={{ justifyContent: "flex-end", width: "100%" }}>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEditQuestion(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDeleteQuestion(record.key)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  function onEditExam(rec) {
    setPendingSetup({
      examType:
        rec.type === "Full Test"
          ? "full"
          : rec.type === "Section"
          ? "section"
          : "custom",
      entryMethod:
        rec.entryMethod === "From Bank"
          ? "bank"
          : rec.entryMethod === "Import"
          ? "import"
          : "blank",
      section: rec.section
        ? SKILLS.find((s) => s.label === rec.section)?.key || "listening"
        : undefined,
      selectedQuestionIds: rec.selectedQuestionIds || [],
    });
    form.setFieldsValue({
      title: rec.title,
      description: rec.description,
      durationMin: rec.durationMin,
      numQuestions: rec.numQuestions,
      createdAt: dayjs(rec.createdAt),
    });
    setCreateOpen(true);
  }

  function onDeleteExam(key) {
    Modal.confirm({
      title: "Delete this exam?",
      content: "This action cannot be undone.",
      okButtonProps: { danger: true },
      onOk: () => setExams((prev) => prev.filter((x) => x.key !== key)),
    });
  }

  function openCreateExamSetup() {
    setupForm.resetFields();
    setPendingSetup(null);
    setBankSelectedKeys([]);
    setBankSkill("all");
    setBankLevel("all");
    setBankSearch("");
    setImportRows([]);
    setImportSelected([]);
    setSetupOpen(true);
  }

  function handleSetupOk(values) {
    setPendingSetup(values);
    if (values.entryMethod === "bank") {
      setSetupOpen(false);
      setBankOpen(true);
    } else if (values.entryMethod === "import") {
      setSetupOpen(false);
      setImportOpen(true);
    } else {
      const defaults =
        values.examType === "full"
          ? { numQuestions: 200, durationMin: 120 }
          : values.examType === "section"
          ? { numQuestions: 100, durationMin: 60 }
          : {};
      form.resetFields();
      form.setFieldsValue({ ...defaults, createdAt: dayjs() });
      setSetupOpen(false);
      setCreateOpen(true);
    }
  }

  function handleCreateExam(values) {
    const setup = pendingSetup || {};
    const newExam = {
      key: String(Date.now()),
      title: values.title,
      description: values.description,
      durationMin: values.durationMin,
      numQuestions: values.numQuestions,
      createdAt: values.createdAt.format("YYYY-MM-DD"),
      type:
        setup.examType === "full"
          ? "Full Test"
          : setup.examType === "section"
          ? "Section"
          : "Custom",
      entryMethod:
        setup.entryMethod === "bank"
          ? "From Bank"
          : setup.entryMethod === "import"
          ? "Import"
          : "Blank",
      section:
        setup.examType === "section"
          ? SKILLS.find((s) => s.key === setup.section)?.label || "Section"
          : null,
      selectedQuestionIds: setup.selectedQuestionIds || [],
    };
    setExams((prev) => [newExam, ...prev]);
    setCreateOpen(false);
  }

  const [qForm] = Form.useForm();
  const [qOpen, setQOpen] = useState(false);
  const [editingQ, setEditingQ] = useState(null);

  function onEditQuestion(rec) {
    setEditingQ(rec);
    qForm.setFieldsValue(rec);
    setQOpen(true);
  }

  function onDeleteQuestion(key) {
    Modal.confirm({
      title: "Delete this question?",
      okButtonProps: { danger: true },
      onOk: () =>
        setQuestionsBySkill((prev) => ({
          ...prev,
          [activeSkill]: (prev[activeSkill] || []).filter((x) => x.key !== key),
        })),
    });
  }

  function openCreateQuestion() {
    setEditingQ(null);
    qForm.resetFields();
    setQOpen(true);
  }

  function handleSaveQuestion(values) {
    setQuestionsBySkill((prev) => {
      const list = prev[activeSkill] || [];
      if (editingQ) {
        return {
          ...prev,
          [activeSkill]: list.map((x) =>
            x.key === editingQ.key ? { ...editingQ, ...values } : x
          ),
        };
      }
      const newQ = { key: String(Date.now()), skill: activeSkill, ...values };
      return { ...prev, [activeSkill]: [newQ, ...list] };
    });
    setQOpen(false);
  }

  function handleBankConfirm() {
    const selected = bankSelectedKeys;
    const defaults =
      pendingSetup?.examType === "full"
        ? { durationMin: 120 }
        : pendingSetup?.examType === "section"
        ? { durationMin: 60 }
        : {};
    const num = selected.length || undefined;

    setPendingSetup((prev) => ({
      ...(prev || {}),
      selectedQuestionIds: selected,
    }));
    setBankOpen(false);

    form.resetFields();
    form.setFieldsValue({ numQuestions: num, ...defaults, createdAt: dayjs() });
    setCreateOpen(true);
  }

  function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return [];
    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1).map((line, idx) => {
      const cols = line.split(",");
      const obj = {};
      headers.forEach((h, i) => (obj[h] = (cols[i] || "").trim()));
      return {
        key: `imp_${idx}`,
        code: obj.code || "",
        text: obj.text || "",
        level: obj.level || "",
        skill: obj.skill || "",
      };
    });
    return rows.filter((r) => r.code || r.text);
  }

  function parseJSON(text) {
    try {
      const arr = JSON.parse(text);
      return (Array.isArray(arr) ? arr : [])
        .map((x, i) => ({
          key: `imp_${i}`,
          code: x.code || "",
          text: x.text || "",
          level: x.level || "",
          skill: x.skill || "",
        }))
        .filter((r) => r.code || r.text);
    } catch {
      return [];
    }
  }

  function beforeReadFile(file, onDone) {
    const ok = /(\.csv|\.json)$/i.test(file.name);
    if (!ok) {
      message.error("Chỉ hỗ trợ .csv hoặc .json");
      return Upload.LIST_IGNORE;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = /\.csv$/i.test(file.name) ? parseCSV(text) : parseJSON(text);
      if (!rows.length) message.warning("Không đọc được dữ liệu hợp lệ");
      onDone(rows);
    };
    reader.readAsText(file, "utf-8");
    return false;
  }

  return (
    <div style={{ padding: 24, background: "#f6f7fb", minHeight: "100vh" }}>
      <Space direction="vertical" size={6} style={{ width: "100%" }}>
        <Title level={3} style={{ margin: 0 }}>
          TOEIC Exam Management
        </Title>
        <Text type="secondary">
          Management system for TOEIC exams and questions
        </Text>

        <div style={{ marginTop: 8 }}>
          <Segmented
            value={activeTab}
            onChange={setActiveTab}
            options={[
              { label: "Exams", value: "exams", icon: <ProfileOutlined /> },
              {
                label: "Questions",
                value: "questions",
                icon: <FileTextOutlined />,
              },
            ]}
            size="large"
          />
        </div>

        <Card
          style={{ marginTop: 12 }}
          bodyStyle={{ paddingTop: 16 }}
          title={
            <Space direction="vertical" size={0}>
              <Text strong style={{ fontSize: 16 }}>
                {activeTab === "exams" ? "Exam List" : "Question Bank"}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {activeTab === "exams"
                  ? "Manage your TOEIC exams"
                  : "Manage your TOEIC questions"}
              </Text>
            </Space>
          }
          extra={
            activeTab === "exams" ? (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateExamSetup}
              >
                Create New Exam
              </Button>
            ) : (
              <Space>
                <Tag style={{ marginRight: 0 }} onClick={openCreateQuestion}>
                  + New Question
                </Tag>
                <Tag
                  style={{ marginRight: 0 }}
                  onClick={() => setBulkOpen(true)}
                >
                  + Bulk Create
                </Tag>
                <Tag style={{ marginRight: 0 }}>Import</Tag>
                <Tag style={{ marginRight: 0 }}>Export</Tag>
              </Space>
            )
          }
        >
          {activeTab === "questions" && (
            <div style={{ marginBottom: 8 }}>
              <Segmented
                value={activeSkill}
                onChange={setActiveSkill}
                options={SKILLS.map((s) => ({ label: s.label, value: s.key }))}
              />
            </div>
          )}

          <Search
            placeholder={
              activeTab === "exams" ? "Search exams..." : "Search questions..."
            }
            allowClear
            onSearch={setQuery}
            onChange={(e) => setQuery(e.target.value)}
            style={{ maxWidth: 420, marginBottom: 12 }}
          />

          {activeTab === "exams" ? (
            <Table
              rowKey="key"
              columns={examColumns}
              dataSource={filteredExams}
              pagination={{ pageSize: 5, showSizeChanger: false }}
              scroll={{ x: "max-content" }}
            />
          ) : (
            <Table
              rowKey="key"
              columns={questionColumns}
              dataSource={filteredQuestions}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              scroll={{ x: "max-content" }}
            />
          )}
        </Card>
      </Space>

      <Modal
        title="New Exam Setup"
        open={setupOpen}
        onCancel={() => setSetupOpen(false)}
        onOk={() => setupForm.submit()}
        okText="Next"
      >
        <Form
          form={setupForm}
          layout="vertical"
          onFinish={handleSetupOk}
          initialValues={{ examType: "full", entryMethod: "bank" }}
        >
          <Form.Item
            label="Exam Type"
            name="examType"
            rules={[{ required: true }]}
          >
            <Radio.Group style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Radio.Button value="full">Full Test</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(p, c) => p.examType !== c.examType}>
            {({ getFieldValue }) =>
              getFieldValue("examType") === "section" ? (
                <Form.Item
                  label="Section"
                  name="section"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Select section"
                    options={SKILLS.map((s) => ({
                      label: s.label,
                      value: s.key,
                    }))}
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Divider style={{ margin: "8px 0 16px" }} />

          <Form.Item
            label="Entry Method"
            name="entryMethod"
            rules={[{ required: true }]}
          >
            <Radio.Group style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Radio.Button value="bank">From Bank</Radio.Button>
              <Radio.Button value="import">Import File</Radio.Button>
              <Radio.Button value="blank">Create Blank</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Create / Edit Exam"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => form.submit()}
        okText="Save"
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleCreateExam}
          initialValues={{
            durationMin: 120,
            numQuestions: 200,
            createdAt: dayjs(),
          }}
        >
          <Form.Item label="Title" name="title" rules={[{ required: true }]}>
            <Input placeholder="TOEIC Practice Test 1" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} placeholder="Short description…" />
          </Form.Item>
          <Space size="middle" style={{ width: "100%" }}>
            <Form.Item
              label="Duration (minutes)"
              name="durationMin"
              style={{ flex: 1 }}
              rules={[{ required: true }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Questions"
              name="numQuestions"
              style={{ flex: 1 }}
              rules={[{ required: true }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Space>
          <Form.Item
            label="Created date"
            name="createdAt"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          {pendingSetup && <AlertSetupSummary setup={pendingSetup} />}
        </Form>
      </Modal>

      <Modal
        title="Select Questions from Bank"
        open={bankOpen}
        onCancel={() => setBankOpen(false)}
        onOk={handleBankConfirm}
        okText={`Use ${bankSelectedKeys.length} questions`}
        width={900}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Space wrap>
            <Select
              value={bankSkill}
              onChange={setBankSkill}
              style={{ width: 180 }}
              options={[
                { label: "All skills", value: "all" },
                ...SKILLS.map((s) => ({ label: s.label, value: s.key })),
              ]}
            />
            <Select
              value={bankLevel}
              onChange={setBankLevel}
              style={{ width: 160 }}
              options={[
                { label: "All levels", value: "all" },
                { label: "Easy", value: "Easy" },
                { label: "Medium", value: "Medium" },
                { label: "Hard", value: "Hard" },
              ]}
            />
            <Input
              placeholder="Search code/text/level…"
              allowClear
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              style={{ width: 260 }}
            />
          </Space>

          <Table
            size="small"
            rowKey="key"
            columns={bankColumns}
            dataSource={bankData}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            rowSelection={{
              selectedRowKeys: bankSelectedKeys,
              onChange: setBankSelectedKeys,
            }}
          />
        </Space>
      </Modal>

      <Modal
        title="Import Questions from File"
        open={importOpen}
        onCancel={() => setImportOpen(false)}
        onOk={() => {
          const setup = { ...(pendingSetup || {}) };
          setup.selectedQuestionIds = importSelected.slice();
          setPendingSetup(setup);

          const defaults =
            setup.examType === "full"
              ? { durationMin: 120 }
              : setup.examType === "section"
              ? { durationMin: 60 }
              : {};
          form.resetFields();
          form.setFieldsValue({
            numQuestions: importSelected.length,
            ...defaults,
            createdAt: dayjs(),
          });

          setImportOpen(false);
          setCreateOpen(true);
        }}
        okText={`Use ${importSelected.length} questions`}
        width={900}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Dragger
            accept=".csv,.json"
            multiple={false}
            showUploadList={false}
            beforeUpload={(file) =>
              beforeReadFile(file, (rows) => {
                setImportRows(rows);
                setImportSelected(rows.map((r) => r.key));
              })
            }
          >
            <p className="ant-upload-drag-icon">
              <FileTextOutlined />
            </p>
            <p className="ant-upload-text">
              Kéo thả hoặc click để chọn file (.csv / .json)
            </p>
            <p className="ant-upload-hint">CSV header: code,text,level,skill</p>
          </Dragger>

          <Table
            size="small"
            rowKey="key"
            columns={bankColumns}
            dataSource={importRows}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            rowSelection={{
              selectedRowKeys: importSelected,
              onChange: setImportSelected,
            }}
          />
        </Space>
      </Modal>

      <QuestionModal
        qForm={qForm}
        qOpen={qOpen}
        setQOpen={setQOpen}
        editingQ={editingQ}
        onSave={handleSaveQuestion}
      />

      <Modal
        title="Bulk Create Questions"
        open={bulkOpen}
        onCancel={() => setBulkOpen(false)}
        onOk={() => bulkForm.submit()}
        okText="Add to Bank"
        width={900}
      >
        <Form
          layout="vertical"
          form={bulkForm}
          onFinish={(values) => {
            const items = (values.items || [])
              .map((x, i) => ({
                key: `bulk_${Date.now()}_${i}`,
                code: x.code || "",
                text: x.text || "",
                level: x.level || "",
                skill: x.skill || activeSkill,
              }))
              .filter((x) => x.text || x.code);

            setQuestionsBySkill((prev) => {
              const grouped = { ...prev };
              items.forEach((it) => {
                const skill = it.skill || activeSkill;
                grouped[skill] = [it, ...(grouped[skill] || [])];
              });
              return grouped;
            });
            setBulkOpen(false);
            bulkForm.resetFields();
          }}
          initialValues={{ items: [{}, {}, {}, {}] }}
        >
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                <Table
                  size="small"
                  pagination={false}
                  columns={[
                    {
                      title: "Skill",
                      dataIndex: "skill",
                      width: 150,
                      render: (_, __, idx) => (
                        <Form.Item
                          name={["items", idx, "skill"]}
                          style={{ margin: 0 }}
                        >
                          <Select
                            allowClear
                            placeholder="Auto by current"
                            options={SKILLS.map((s) => ({
                              label: s.label,
                              value: s.key,
                            }))}
                            style={{ width: 140 }}
                          />
                        </Form.Item>
                      ),
                    },
                    {
                      title: "Code",
                      dataIndex: "code",
                      width: 140,
                      render: (_, __, idx) => (
                        <Form.Item
                          name={["items", idx, "code"]}
                          style={{ margin: 0 }}
                        >
                          <Input placeholder="e.g., L-010" />
                        </Form.Item>
                      ),
                    },
                    {
                      title: "Question",
                      dataIndex: "text",
                      render: (_, __, idx) => (
                        <Form.Item
                          name={["items", idx, "text"]}
                          style={{ margin: 0 }}
                        >
                          <Input placeholder="Enter question…" />
                        </Form.Item>
                      ),
                    },
                    {
                      title: "Level",
                      dataIndex: "level",
                      width: 140,
                      render: (_, __, idx) => (
                        <Form.Item
                          name={["items", idx, "level"]}
                          style={{ margin: 0 }}
                        >
                          <Select
                            allowClear
                            placeholder="Level"
                            options={[
                              { label: "Easy", value: "Easy" },
                              { label: "Medium", value: "Medium" },
                              { label: "Hard", value: "Hard" },
                            ]}
                            style={{ width: 120 }}
                          />
                        </Form.Item>
                      ),
                    },
                    {
                      title: "",
                      width: 60,
                      render: (_, __, idx) => (
                        <Button
                          danger
                          type="text"
                          onClick={() => remove(fields[idx].name)}
                        >
                          Delete
                        </Button>
                      ),
                    },
                  ]}
                  dataSource={fields.map((f, i) => ({ key: i }))}
                />

                <div style={{ marginTop: 8 }}>
                  <Button onClick={() => add()} icon={<PlusOutlined />}>
                    Add Row
                  </Button>
                </div>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}

function AlertSetupSummary({ setup }) {
  const mapType =
    setup.examType === "full"
      ? "Full Test"
      : setup.examType === "section"
      ? "Section"
      : "Custom";
  const mapEntry =
    setup.entryMethod === "bank"
      ? "From Bank"
      : setup.entryMethod === "import"
      ? "Import"
      : "Blank";
  const section =
    setup.examType === "section"
      ? SKILLS.find((s) => s.key === setup.section)?.label || "Section"
      : null;

  return (
    <div
      style={{
        marginTop: 8,
        padding: 12,
        border: "1px dashed #e5e7eb",
        borderRadius: 8,
        fontSize: 12,
      }}
    >
      <strong>Setup:</strong>{" "}
      <Space size={8}>
        <Tag>{mapType}</Tag>
        {section ? <Tag color="blue">{section}</Tag> : null}
        <Tag color="geekblue">{mapEntry}</Tag>
        {Array.isArray(setup.selectedQuestionIds) &&
        setup.selectedQuestionIds.length > 0 ? (
          <Tag color="green">{setup.selectedQuestionIds.length} selected</Tag>
        ) : null}
      </Space>
    </div>
  );
}

function QuestionModal({ qForm, qOpen, setQOpen, editingQ, onSave }) {
  return (
    <Modal
      title={editingQ ? "Edit Question" : "Create Question"}
      open={qOpen}
      onCancel={() => setQOpen(false)}
      onOk={() => qForm.submit()}
      okText="Save"
    >
      <Form form={qForm} layout="vertical" onFinish={onSave}>
        <Form.Item label="Code" name="code" rules={[{ required: true }]}>
          <Input placeholder="e.g., L-002" />
        </Form.Item>
        <Form.Item label="Question" name="text" rules={[{ required: true }]}>
          <Input.TextArea rows={3} placeholder="Enter question text…" />
        </Form.Item>
        <Form.Item label="Level" name="level">
          <Input placeholder="Easy / Medium / Hard" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
