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
} from "antd";
import { 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UndoOutlined 
} from "@ant-design/icons";

import SingleQuestionModal from "@shared/components/QuestionBank/SingleQuestionModal.jsx";
import QuestionGroupModal from "@shared/components/QuestionBank/QuestionGroupModal.jsx";

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
  const [partsList, setPartsList] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Modal - Single
  const [singleModalOpen, setSingleModalOpen] = useState(false);
  const [editingSingleId, setEditingSingleId] = useState(null);

  // Modal - Group
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);

  const loadList = async (page = 1, pageSize = 10, keyword = "", skill = "all", partId = "all") => {
    try {
      setListLoading(true);
      const params = buildQuestionListParams({ 
        page, 
        pageSize,
        keyword: keyword || undefined,
        skill: skill !== "all" ? skill : undefined,
        partId: partId !== "all" ? partId : undefined,
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

      const items = (raw || []).map((r) => {
        const st = normalizeStatus(r.status ?? r.isActive ?? r.active);
        const skillStr =
          r.skill ?? r.skillName ?? inferSkillFromPartName(r.partName);
        const skillId =
          typeof skillStr === "number" ? skillStr : skillNameToId(skillStr);

        if (tabKey === "group") {
          const id = (r.questionGroupId ?? r.groupId ?? r.id) ?? r.id;
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
          };
        }

        const id = (r.questionId ?? r.id) ?? r.id;
        return {
          ...r,
          id,
          isGroupQuestion: false,
          isActive: st.isActive,
          statusText: st.text,
          statusColor: st.color,
          __skillId: skillId,
          __skillName: skillStr,
        };
      });

      const total = data?.totalCount ?? data?.total ?? items.length;
      setDataSource(items);
      setPagination({ current: page, pageSize, total });

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
      console.error(e);
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
          setPartsList(partsData.map(p => ({
            id: p.partId || p.id,
            name: p.partName || p.name,
          })));
        } catch (e) {
          console.error("Error loading parts:", e);
        }
      } else {
        setPartsList([]);
      }
    };
    loadParts();
  }, [filterSkill]);

  useEffect(() => {
    loadList(1, 10, searchKeyword, filterSkill, filterPart);
    
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [showDeleted, tabKey, filterPart]);

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
    loadList(pagination.current, pagination.pageSize, searchKeyword, filterSkill, filterPart);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const newTimeout = setTimeout(() => {
      setPagination({ ...pagination, current: 1 });
      loadList(1, pagination.pageSize, value, filterSkill, filterPart);
    }, 500);
    
    setSearchTimeout(newTimeout);
  };

  const handleSkillFilterChange = (skill) => {
    setFilterSkill(skill);
    setFilterPart("all"); // Reset part filter when skill changes
    setPagination({ ...pagination, current: 1 });
    loadList(1, pagination.pageSize, searchKeyword, skill, "all");
  };

  const handlePartFilterChange = (partId) => {
    setFilterPart(partId);
    setPagination({ ...pagination, current: 1 });
    loadList(1, pagination.pageSize, searchKeyword, filterSkill, partId);
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
            <Space size="middle" style={{ width: '100%' }}>
              <Input
                placeholder="Tìm kiếm theo nội dung..."
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
          pagination={pagination}
          columns={[
            { title: "ID", dataIndex: "id", width: 80 },
            {
              title: "Part",
              dataIndex: "partName",
              width: 140,
              render: (_, r) => r.partName || r.partId || "-",
            },
            {
              title: "Kỹ năng",
              dataIndex: "__skillName",
              width: 120,
              render: (v, r) => {
                const skillName = r.__skillName || "";
                const skillMap = {
                  "Listening": "Nghe",
                  "Reading": "Đọc",
                  "Speaking": "Nói",
                  "Writing": "Viết",
                };
                return skillMap[skillName] || skillName || "-";
              },
            },
            {
              title: "Loại",
              dataIndex: "isGroupQuestion",
              width: 100,
              render: (v) =>
                v ? <Tag color="purple">Nhóm</Tag> : <Tag color="orange">Đơn</Tag>,
            },
            {
              title: "Nội dung / Đoạn văn",
              dataIndex: "content",
              ellipsis: true,
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              width: 110,
              render: (_, r) => <Tag color={r.statusColor}>{r.statusText}</Tag>,
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
