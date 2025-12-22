import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Table,
  Popconfirm,
  message,
  Tag,
  Space,
  Switch,
  Tabs,
  Tooltip,
  Input,
  Select,
  Row,
  Col,
  Alert,
  Typography,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import { 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UndoOutlined,
  WarningOutlined,
  SoundOutlined,
  PictureOutlined
} from "@ant-design/icons";

import SingleQuestionModal from "@components/QuestionBank/SingleQuestionModal.jsx";
import QuestionGroupModal from "@components/QuestionBank/QuestionGroupModal.jsx";

import {
  getQuestions,
  getDeletedQuestions,
  deleteQuestion,
  restoreQuestion,
  buildQuestionListParams,
} from "@services/questionsService";
import {
  getQuestionGroups,
  getDeletedQuestionGroups,
  deleteQuestionGroup,
  restoreQuestionGroup,
} from "@services/questionGroupService";
import { getPartsBySkill } from "@services/partsService";
import { getQuestionTypesByPart } from "@services/questionTypesService";

const QUESTION_SKILLS = [
  { value: 3, label: "Nghe" },
  { value: 4, label: "Đọc" },
  { value: 1, label: "Nói" },
  { value: 2, label: "Viết" },
];

const skillNameToId = (s) => {
  const t = String(s ?? "").toLowerCase();
  if (t.startsWith("l")) return 3;
  if (t.startsWith("r")) return 4;
  if (t.startsWith("s")) return 1;
  if (t.startsWith("w")) return 2;
  return undefined;
};
const inferSkillFromPartName = (partName) =>
  skillNameToId(String(partName ?? "").split("-")[0]);

const toNum = (v) => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

// Parts chỉ dành cho group questions:
// - Listening: 3, 4
// - Reading: 6, 7
// - Speaking: 13, 14
const GROUP_PARTS = [3, 4, 6, 7, 13, 14];
const isGroupPart = (p) => GROUP_PARTS.includes(Number(p));

const normalizeStatus = (raw) => {
  const n = Number(raw);
  if (Number.isFinite(n)) {
    if (n === 1) return { isActive: true, text: "Hoạt động", color: "green" };
    if (n === 0) return { isActive: false, text: "Bản nháp", color: "gold" };
    return { isActive: false, text: "Ngưng hoạt động", color: "red" };
  }
  const s = String(raw ?? "").toLowerCase();
  if (s === "active") return { isActive: true, text: "Hoạt động", color: "green" };
  if (s === "draft") return { isActive: false, text: "Bản nháp", color: "gold" };
  return { isActive: false, text: "Ngưng hoạt động", color: "red" };
};

const { Text } = Typography;

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    const date = dayjs(dateString);
    return date.format("DD/MM/YYYY, HH:mm");
  } catch (error) {
    return dateString;
  }
};

export default function QuanLyNganHangCauHoi() {
  const [listLoading, setListLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [showDeleted, setShowDeleted] = useState(false);
  const [tabKey, setTabKey] = useState("single");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterSkill, setFilterSkill] = useState("all");
  const [filterPart, setFilterPart] = useState("all");
  const [filterQuestionType, setFilterQuestionType] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [partsList, setPartsList] = useState([]);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Modal - Single
  const [singleModalOpen, setSingleModalOpen] = useState(false);
  const [editingSingleId, setEditingSingleId] = useState(null);

  // Modal - Group
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);

  const loadList = async (
    page = 1,
    pageSize = 10,
    keyword = "",
    skill = "all",
    partId = "all",
    questionTypeId = "all",
    dateRangeFilter = null
  ) => {
    try {
      setListLoading(true);
      // Nếu keyword là số (có thể là ID), không gửi lên API vì API có thể không hỗ trợ tìm kiếm theo ID
      // Sẽ filter trên frontend thay vào đó
      // Cần lấy nhiều dữ liệu hơn để có thể tìm trên toàn bộ
      const isNumericKeyword = keyword && /^\d+$/.test(keyword.trim());
      const effectivePageSize = isNumericKeyword ? 10000 : pageSize; // Lấy nhiều hơn khi tìm theo ID
      const params = buildQuestionListParams({ 
        page: isNumericKeyword ? 1 : page, // Reset về trang 1 khi tìm theo ID
        pageSize: effectivePageSize,
        // Chỉ gửi keyword lên API nếu không phải là số (ID)
        // Nếu là số, sẽ filter trên frontend
        keyword: (keyword && !isNumericKeyword) ? keyword : undefined,
        skill: skill !== "all" ? skill : undefined,
        partId: partId !== "all" ? partId : undefined,
        questionTypeId: questionTypeId !== "all" ? questionTypeId : undefined,
      });
      let res;
      if (tabKey === "single") {
        res = showDeleted
          ? await getDeletedQuestions(params)
          : await getQuestions(params);
      } else {
        res = showDeleted
          ? await getDeletedQuestionGroups(params)
          : await getQuestionGroups(params);
      }

      const data = res?.data || res;
      const raw = data?.dataPaginated || data?.items || data?.records || [];

      const items = (raw || [])
        .map((r) => {
          const st = normalizeStatus(r.status ?? r.isActive ?? r.active);
          const skillStr =
            r.skill ?? r.skillName ?? inferSkillFromPartName(r.partName);
          const skillId =
            typeof skillStr === "number" ? skillStr : skillNameToId(skillStr);

          if (tabKey === "group") {
            const id = (r.questionGroupId ?? r.groupId ?? r.id) ?? r.id;
            const partId = toNum(r.partId);
            return {
              ...r,
              id,
              isGroupQuestion: true,
              content: r.passageContent ?? r.content,
              isActive: st.isActive,
              statusText: st.text,
              statusColor: st.color,
              __skillId: skillId,
              __skillName: skillStr,
              __partId: partId,
              // Lưu thông tin để hiển thị
              __hasAudio: !!(r.audioUrl || r.audioName),
              __hasImage: !!(r.imageUrl || r.imageName),
              __questionsCount: Array.isArray(r.questions) ? r.questions.length : 0,
              __createdAt: r.createdAt || r.CreatedAt || r.created_at,
              __questionTypeName: r.questionTypeName || r.questionType?.name || r.typeName,
            };
          }

          const id = (r.questionId ?? r.id) ?? r.id;
          const partId = toNum(r.partId);
          return {
            ...r,
            id,
            isGroupQuestion: false,
            isActive: st.isActive,
            statusText: st.text,
            statusColor: st.color,
            __skillId: skillId,
            __skillName: skillStr,
            __partId: partId,
            // Lưu thông tin để hiển thị
            __hasAudio: !!(r.audioUrl || r.audioName),
            __hasImage: !!(r.imageUrl || r.imageName),
            __optionsCount: Array.isArray(r.options) ? r.options.length : 0,
            __createdAt: r.createdAt || r.CreatedAt || r.created_at,
            __questionTypeName: r.questionTypeName || r.questionType?.name || r.typeName,
          };
        })
        .filter((item) => {
          // Filter: Tab "Câu lẻ" không hiển thị single questions có part group
          // Tab "Nhóm câu" chỉ hiển thị group questions có part group
          const partId = toNum(item.partId);
          if (tabKey === "single") {
            // Loại bỏ single questions có part group (3, 4, 6, 7)
            return !isGroupPart(partId);
          } else {
            // Chỉ hiển thị group questions có part group (3, 4, 6, 7)
            return isGroupPart(partId);
          }
        });

      // Client-side filtering theo keyword (ID và nội dung)
      // Luôn filter trên frontend để đảm bảo tìm kiếm theo ID hoạt động
      let filteredItems = items;
      if (keyword && keyword.trim()) {
        const searchLower = keyword.toLowerCase().trim();
        filteredItems = items.filter((item) => {
          // Tìm theo ID - kiểm tra tất cả các trường ID có thể
          const itemId = String(item.id || "");
          const questionId = String(item.questionId || item.QuestionId || "");
          const questionGroupId = String(item.questionGroupId || item.QuestionGroupId || "");
          const groupId = String(item.groupId || item.GroupId || "");
          const rawId = String(item.id || item.Id || "");
          
          if (
            itemId.toLowerCase().includes(searchLower) ||
            questionId.toLowerCase().includes(searchLower) ||
            questionGroupId.toLowerCase().includes(searchLower) ||
            groupId.toLowerCase().includes(searchLower) ||
            rawId.toLowerCase().includes(searchLower)
          ) {
            return true;
          }
          
          // Tìm theo nội dung (content hoặc passageContent)
          const content = (item.content || item.passageContent || "").toLowerCase();
          if (content.includes(searchLower)) {
            return true;
          }
          
          // Tìm theo nội dung các câu hỏi con (cho group questions)
          if (item.isGroupQuestion && Array.isArray(item.questions)) {
            const hasMatchingQuestion = item.questions.some((q) => {
              const qContent = (q.content || "").toLowerCase();
              return qContent.includes(searchLower);
            });
            if (hasMatchingQuestion) {
              return true;
            }
          }
          
          // Tìm theo nội dung các đáp án (cho single questions)
          if (!item.isGroupQuestion && Array.isArray(item.options)) {
            const hasMatchingOption = item.options.some((opt) => {
              const optContent = (opt.content || "").toLowerCase();
              return optContent.includes(searchLower);
            });
            if (hasMatchingOption) {
              return true;
            }
          }
          
          return false;
        });
      }

      // Total là số lượng sau khi filter trên frontend
      // Nếu có keyword, total sẽ là số lượng items sau khi filter
      // Nếu không có keyword, có thể dùng total từ API hoặc items.length
      const total = (keyword && keyword.trim()) 
        ? filteredItems.length 
        : (data?.totalCount ?? data?.total ?? filteredItems.length);
      
      // Nếu đang tìm kiếm theo ID (numeric keyword), reset về trang 1
      const finalPage = isNumericKeyword ? 1 : page;
      
      setDataSource(filteredItems);
      setPagination({ current: finalPage, pageSize, total });

      // Extract unique parts from dataSource for filter (only when no skill filter)
      if (skill === "all") {
        const uniqueParts = [...new Map(
          items
            .filter(item => item.partName || item.partId)
            .map(item => ({
              id: item.partId || item.part?.id,
              name: item.partName || item.part?.name || item.partId,
            }))
            .map(item => [item.id || item.name, item])
        ).values()];
        setPartsList(uniqueParts);
      }
    } catch (e) {
      message.error("Không tải được danh sách câu hỏi");
    } finally {
      setListLoading(false);
    }
  };

  // Load parts when skill changes
  useEffect(() => {
    const loadParts = async () => {
      if (filterSkill !== "all") {
        try {
          const parts = await getPartsBySkill(filterSkill);
          const partsData = Array.isArray(parts) ? parts : (parts?.data || []);
          // Filter parts dựa trên tab hiện tại
          const filteredParts = partsData
            .filter((p) => {
              const pid = toNum(p.partId || p.id);
              if (tabKey === "single") {
                // Tab "Câu lẻ": loại bỏ part group (3, 4, 6, 7)
                return !isGroupPart(pid);
              } else {
                // Tab "Nhóm câu": chỉ hiển thị part group (3, 4, 6, 7)
                return isGroupPart(pid);
              }
            })
            .map((p) => ({
              id: p.partId || p.id,
              name: p.partName || p.name,
            }));
          setPartsList(filteredParts);
        } catch (e) {
        }
      } else {
        setPartsList([]);
        setQuestionTypes([]);
      }
    };
    loadParts();
  }, [filterSkill, tabKey]);

  useEffect(() => {
    // Reset filters khi chuyển tab
    setFilterPart("all");
    setFilterQuestionType("all");
    setQuestionTypes([]);
    loadList(1, 10, searchKeyword, filterSkill, "all", "all", dateRange);
    
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [showDeleted, tabKey]);
  
  useEffect(() => {
    loadList(1, 10, searchKeyword, filterSkill, filterPart, filterQuestionType, dateRange);
  }, [filterPart, filterQuestionType, dateRange]);

  const filteredData = useMemo(() => dataSource, [dataSource]);

  const openAddSingle = () => {
    setEditingSingleId(null);
    setSingleModalOpen(true);
  };

  const openAddGroup = () => {
    setEditingGroupId(null);
    setGroupModalOpen(true);
  };

  const openEditRecord = (record) => {
    if (record?.isGroupQuestion) {
      setEditingGroupId(record.id);
      setGroupModalOpen(true);
    } else {
      setEditingSingleId(record.id);
      setSingleModalOpen(true);
    }
  };

  const afterSaved = () => {
    loadList(pagination.current, pagination.pageSize, searchKeyword, filterSkill, filterPart, filterQuestionType, dateRange);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    setPagination({ ...pagination, current: 1 });
    loadList(1, pagination.pageSize, searchKeyword, filterSkill, filterPart, filterQuestionType, dates);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const newTimeout = setTimeout(() => {
      setPagination({ ...pagination, current: 1 });
      loadList(
        1,
        pagination.pageSize,
        value,
        filterSkill,
        filterPart,
        filterQuestionType,
        dateRange
      );
    }, 500);
    
    setSearchTimeout(newTimeout);
  };

  const handleSkillFilterChange = (skill) => {
    setFilterSkill(skill);
    setFilterPart("all"); // Reset part filter when skill changes
    setFilterQuestionType("all");
    setQuestionTypes([]);
    setPagination({ ...pagination, current: 1 });
    loadList(1, pagination.pageSize, searchKeyword, skill, "all", "all", dateRange);
  };

  const handlePartFilterChange = (partId) => {
    setFilterPart(partId);
    setFilterQuestionType("all");
    setPagination({ ...pagination, current: 1 });
    loadList(1, pagination.pageSize, searchKeyword, filterSkill, partId, "all", dateRange);

    // Load question types theo Part (chỉ khi chọn một Part cụ thể)
    (async () => {
      try {
        const numericPartId = toNum(partId);
        if (!numericPartId) {
          setQuestionTypes([]);
          return;
        }
        const res = await getQuestionTypesByPart(numericPartId);
        const items = Array.isArray(res) ? res : res?.data || [];
        const mapped = items.map((t) => ({
          id: t.questionTypeId || t.id,
          name: t.typeName || t.name,
        }));
        setQuestionTypes(mapped);
      } catch (err) {
        setQuestionTypes([]);
      }
    })();
  };

  const handleQuestionTypeFilterChange = (questionTypeId) => {
    setFilterQuestionType(questionTypeId);
    setPagination({ ...pagination, current: 1 });
    loadList(
      1,
      pagination.pageSize,
      searchKeyword,
      filterSkill,
      filterPart,
      questionTypeId,
      dateRange
    );
  };

  return (
    <>
      <Card
        title="Danh sách câu hỏi"
        size="small"
        extra={
          <Space>
            <span>Hiện câu đã xoá</span>
            <Switch checked={showDeleted} onChange={setShowDeleted} />
            {!showDeleted && (
              <>
                <Button type="primary" onClick={openAddSingle}>
                  Thêm câu
                </Button>
                <Button onClick={openAddGroup}>Thêm nhóm câu</Button>
              </>
            )}
          </Space>
        }
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Space size="middle" style={{ width: '100%', flexWrap: 'wrap' }}>
              <Input
                placeholder="Tìm kiếm theo ID, nội dung..."
                style={{ width: 300 }}
                value={searchKeyword}
                onChange={handleSearchChange}
                allowClear
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              />
              <Select
                value={filterSkill}
                onChange={handleSkillFilterChange}
                style={{ width: 180 }}
                placeholder="Chọn kỹ năng"
              >
                <Select.Option value="all">Tất cả kỹ năng</Select.Option>
                {QUESTION_SKILLS.map((skill) => (
                  <Select.Option key={skill.value} value={skill.value}>
                    {skill.label}
                  </Select.Option>
                ))}
              </Select>
              <Select
                value={filterPart}
                onChange={handlePartFilterChange}
                style={{ width: 200 }}
                placeholder="Chọn Part"
                disabled={filterSkill === "all"}
              >
                <Select.Option value="all">Tất cả Part</Select.Option>
                {partsList.map((part) => (
                  <Select.Option key={part.id || part.name} value={part.id || part.name}>
                    {part.name}
                  </Select.Option>
                ))}
              </Select>
              <Select
                value={filterQuestionType}
                onChange={handleQuestionTypeFilterChange}
                style={{ width: 220 }}
                placeholder="Chọn loại câu hỏi"
                disabled={filterPart === "all" || questionTypes.length === 0}
              >
                <Select.Option value="all">Tất cả loại câu hỏi</Select.Option>
                {questionTypes.map((qt) => (
                  <Select.Option key={qt.id || qt.name} value={qt.id || qt.name}>
                    {qt.name}
                  </Select.Option>
                ))}
              </Select>
              <DatePicker.RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                style={{ width: 300 }}
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
                allowClear
              />
            </Space>
          </Col>
        </Row>
        
        <Tabs
          activeKey={tabKey}
          onChange={setTabKey}
          items={[
            { key: "single", label: "Câu lẻ" },
            { key: "group", label: "Nhóm câu" },
          ]}
        />


        <Table
          rowKey={(r) => `${r.id}-${r.isGroupQuestion ? "G" : "S"}`}
          dataSource={filteredData}
          loading={listLoading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} câu hỏi`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={(pager) => {
            const current = pager?.current || 1;
            const pageSize = pager?.pageSize || 10;
            setPagination((prev) => ({
              ...prev,
              current,
              pageSize,
            }));
            loadList(current, pageSize, searchKeyword, filterSkill, filterPart, filterQuestionType, dateRange);
          }}
          columns={[
            {
              title: "STT",
              key: "stt",
              width: 60,
              align: "center",
              render: (_, __, index) => {
                const currentPage = pagination.current;
                const pageSize = pagination.pageSize;
                return (currentPage - 1) * pageSize + index + 1;
              }
            },
            { 
              title: "ID", 
              dataIndex: "id", 
              width: 80,
              align: "center",
              render: (id) => {
                return <Text strong style={{ color: "#1890ff" }}>{id}</Text>;
              }
            },
            {
              title: "Part",
              dataIndex: "partName",
              width: 140,
              render: (_, r) => r.partName || r.partId || "-",
            },
            {
              title: "Thông tin câu hỏi",
              key: "questionInfo",
              width: 300,
              render: (_, record) => {
                const skillName = record.__skillName || "";
                const skillMap = {
                  "Listening": "Nghe",
                  "Reading": "Đọc",
                  "Speaking": "Nói",
                  "Writing": "Viết",
                };
                const skillLabel = skillMap[skillName] || skillName || "-";
                const typeName = record.__questionTypeName;
                const isGroup = record.isGroupQuestion;
                
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <Tag color="blue">{skillLabel}</Tag>
                      {isGroup ? <Tag color="purple">Nhóm</Tag> : <Tag color="orange">Đơn</Tag>}
                    </div>
                    {typeName ? (
                      <Tooltip title={typeName}>
                        <Text style={{ fontSize: 12 }} ellipsis={{ tooltip: typeName }}>
                          {typeName}
                        </Text>
                      </Tooltip>
                    ) : (
                      <Text type="secondary" style={{ fontSize: 12 }}>—</Text>
                    )}
                  </div>
                );
              },
            },
            {
              title: "Nội dung / Đoạn văn",
              dataIndex: "content",
              ellipsis: { showTitle: false },
              render: (content, record) => {
                if (record.isGroupQuestion) {
                  // Group questions: hiển thị passage content hoặc số lượng câu hỏi
                  if (content && content.trim()) {
                    return (
                      <Tooltip title={content}>
                        <div>
                          <div style={{ marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {content}
                          </div>
                          {record.__questionsCount > 0 && (
                            <Tag color="blue" style={{ fontSize: 11 }}>
                              {record.__questionsCount} câu hỏi
                            </Tag>
                          )}
                        </div>
                      </Tooltip>
                    );
                  }
                  return (
                    <div>
                      <span style={{ color: "#999", fontStyle: "italic" }}>
                        Không có đoạn văn
                      </span>
                      {record.__questionsCount > 0 && (
                        <Tag color="blue" style={{ fontSize: 11, marginLeft: 8 }}>
                          {record.__questionsCount} câu hỏi
                        </Tag>
                      )}
                    </div>
                  );
                } else {
                  // Single questions
                  const partId = record.__partId;
                  const isContentOptional = [1, 2, 6].includes(partId);
                  
                  if (content && content.trim()) {
                    // Có content: hiển thị content với tooltip
                    return (
                      <Tooltip title={content}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                          {content}
                        </span>
                      </Tooltip>
                    );
                  } else if (isContentOptional) {
                    // Part 1, 2, 6 không có content: hiển thị thông tin khác
                    const info = [];
                    if (record.__hasAudio) {
                      info.push(
                        <Tag key="audio" color="green" style={{ fontSize: 11 }}>
                          <SoundOutlined style={{ marginRight: 4 }} /> Audio
                        </Tag>
                      );
                    }
                    if (record.__hasImage) {
                      info.push(
                        <Tag key="image" color="orange" style={{ fontSize: 11 }}>
                          <PictureOutlined style={{ marginRight: 4 }} /> Ảnh
                        </Tag>
                      );
                    }
                    if (record.__optionsCount > 0) {
                      info.push(
                        <Tag key="options" color="blue" style={{ fontSize: 11 }}>
                          {record.__optionsCount} đáp án
                        </Tag>
                      );
                    }
                    
                    if (info.length > 0) {
                      return (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                          {info}
                        </div>
                      );
                    }
                    
                    return (
                      <span style={{ color: "#999", fontStyle: "italic", fontSize: 12 }}>
                        Không có nội dung (Part {partId})
                      </span>
                    );
                  } else {
                    // Các part khác nhưng không có content (có thể là lỗi)
                    return (
                      <span style={{ color: "#ff4d4f", fontStyle: "italic", fontSize: 12 }}>
                        <WarningOutlined style={{ marginRight: 4 }} /> Chưa có nội dung
                      </span>
                    );
                  }
                }
              },
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              width: 110,
              render: (_, r) => <Tag color={r.statusColor}>{r.statusText}</Tag>,
            },
            {
              title: "Ngày tạo",
              dataIndex: "__createdAt",
              key: "createdAt",
              width: 180,
              align: "center",
              render: (dateString, record) => {
                const dateValue = dateString || record.createdAt || record.CreatedAt || record.created_at;
                if (!dateValue) return "—";
                return (
                  <div style={{ fontSize: 12 }}>
                    <div>{formatDate(dateValue)}</div>
                    {dateValue && (
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {(() => {
                          try {
                            const dateObj = dayjs(dateValue);
                            const now = dayjs();
                            const diffDays = now.diff(dateObj, 'day');
                            
                            if (diffDays === 0) {
                              const diffHours = now.diff(dateObj, 'hour');
                              if (diffHours === 0) {
                                const diffMins = now.diff(dateObj, 'minute');
                                return diffMins <= 1 ? "Vừa xong" : `${diffMins} phút trước`;
                              }
                              return `${diffHours} giờ trước`;
                            } else if (diffDays === 1) {
                              return "Hôm qua";
                            } else if (diffDays < 7) {
                              return `${diffDays} ngày trước`;
                            } else if (diffDays < 30) {
                              const weeks = Math.floor(diffDays / 7);
                              return `${weeks} tuần trước`;
                            } else if (diffDays < 365) {
                              const months = Math.floor(diffDays / 30);
                              return `${months} tháng trước`;
                            } else {
                              const years = Math.floor(diffDays / 365);
                              return `${years} năm trước`;
                            }
                          } catch (e) {
                            return "";
                          }
                        })()}
                      </Text>
                    )}
                  </div>
                );
              },
              sorter: (a, b) => {
                const dateA = a.__createdAt || a.createdAt || a.CreatedAt || a.created_at;
                const dateB = b.__createdAt || b.createdAt || b.CreatedAt || b.created_at;
                if (!dateA && !dateB) return 0;
                if (!dateA) return 1;
                if (!dateB) return -1;
                return dayjs(dateA).valueOf() - dayjs(dateB).valueOf();
              },
              defaultSortOrder: 'descend',
            },
            {
              title: "Hành động",
              width: 120,
              render: (_, record) => {
                return (
                  <Space>
                    {!showDeleted && (
                      <Tooltip title="Chỉnh sửa">
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => openEditRecord(record)}
                          style={{ color: '#1890ff' }}
                        />
                      </Tooltip>
                    )}

                    {!showDeleted ? (
                      <Popconfirm
                        title="Bạn chắc chắn muốn xoá?"
                        onConfirm={async () => {
                          try {
                            if (record.isGroupQuestion) {
                              await deleteQuestionGroup(record.id);
                            } else {
                              await deleteQuestion(record.id, false);
                            }
                             message.success(
                               record.isGroupQuestion
                                 ? "Đã xoá nhóm câu hỏi"
                                 : "Đã xoá câu hỏi"
                             );
                            afterSaved();
                          } catch (e) {
                            const msg =
                              e?.response?.data?.message ||
                              e?.response?.data?.data ||
                              e?.message;
                            if (msg) message.error(String(msg));
                          }
                        }}
                      >
                        <Tooltip title="Xoá">
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Tooltip>
                      </Popconfirm>
                    ) : (
                      <Popconfirm
                        title="Khôi phục?"
                        onConfirm={async () => {
                          try {
                            if (record.isGroupQuestion) {
                              await restoreQuestionGroup(record.id);
                            } else {
                              await restoreQuestion(record.id, false);
                            }
                             message.success(
                               record.isGroupQuestion
                                 ? "Đã khôi phục nhóm câu hỏi"
                                 : "Đã khôi phục câu hỏi"
                             );
                            afterSaved();
                          } catch (e) {
                            const msg =
                              e?.response?.data?.message ||
                              e?.response?.data?.data ||
                              e?.message;
                            if (msg) message.error(String(msg));
                          }
                        }}
                      >
                        <Tooltip title="Khôi phục">
                          <Button
                            type="text"
                            icon={<UndoOutlined />}
                            style={{ color: '#52c41a' }}
                          />
                        </Tooltip>
                      </Popconfirm>
                    )}
                  </Space>
                );
              },
            },
          ]}
        />
      </Card>

      {!showDeleted && (
        <SingleQuestionModal
          open={singleModalOpen}
          editingId={editingSingleId}
          onClose={() => {
            setSingleModalOpen(false);
            setEditingSingleId(null);
          }}
          onSaved={() => {
            setSingleModalOpen(false);
            setEditingSingleId(null);
            afterSaved();
          }}
        />
      )}

      {!showDeleted && (
        <QuestionGroupModal
          open={groupModalOpen}
          editingId={editingGroupId}
          onClose={() => {
            setGroupModalOpen(false);
            setEditingGroupId(null);
          }}
          onSaved={() => {
            setGroupModalOpen(false);
            setEditingGroupId(null);
            afterSaved();
          }}
        />
      )}
    </>
  );
}
