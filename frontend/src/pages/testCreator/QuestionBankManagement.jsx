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
} from "antd";

import SingleQuestionModal from "@shared/components/QuestionBank/SingleQuestionModal.jsx";
import QuestionGroupModal from "@shared/components/QuestionBank/QuestionGroupModal.jsx";

import {
  getQuestions,
  getDeletedQuestions,
  deleteQuestion,
  restoreQuestion,
  buildQuestionListParams,
} from "@services/questionsService";

const QUESTION_SKILLS = [
  { value: 3, label: "Listening" },
  { value: 4, label: "Reading" },
  { value: 1, label: "Speaking" },
  { value: 2, label: "Writing" },
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
    if (n === 1) return { isActive: true, text: "Active", color: "green" };
    if (n === 0) return { isActive: false, text: "Draft", color: "gold" };
    return { isActive: false, text: "Inactive", color: "red" };
  }
  const s = String(raw ?? "").toLowerCase();
  if (s === "active") return { isActive: true, text: "Active", color: "green" };
  if (s === "draft") return { isActive: false, text: "Draft", color: "gold" };
  return { isActive: false, text: "Inactive", color: "red" };
};

export default function QuestionBankManagement() {
  const [listLoading, setListLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [showDeleted, setShowDeleted] = useState(false);
  const [tabKey, setTabKey] = useState("single");

  // Modal state - Single
  const [singleModalOpen, setSingleModalOpen] = useState(false);
  const [editingSingleId, setEditingSingleId] = useState(null);

  // Modal state - Group
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);

  const loadList = async (page = 1, pageSize = 10) => {
    try {
      setListLoading(true);
      const params = buildQuestionListParams({ page, pageSize });
      const res = showDeleted
        ? await getDeletedQuestions(params)
        : await getQuestions(params);

      const data = res?.data || res;
      const raw = data?.dataPaginated || data?.items || data?.records || [];

      const items = (raw || []).map((r) => {
        const st = normalizeStatus(r.status ?? r.isActive ?? r.active);
        const skillStr =
          r.skill ?? r.skillName ?? inferSkillFromPartName(r.partName);
        const skillId =
          typeof skillStr === "number" ? skillStr : skillNameToId(skillStr);

        const isGroup = !!r.isGroupQuestion;
        const id =
          (isGroup
            ? r.questionGroupId ?? r.groupId ?? r.id
            : r.questionId ?? r.id) ?? r.id;

        return {
          ...r,
          id,
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
    } catch (e) {
      message.error("Không tải được danh sách câu hỏi");
      console.error(e);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadList(1, 10);
  }, [showDeleted]);

  const filteredData = useMemo(
    () =>
      dataSource.filter((r) =>
        tabKey === "single" ? !r.isGroupQuestion : !!r.isGroupQuestion
      ),
    [dataSource, tabKey]
  );

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
    loadList(pagination.current, pagination.pageSize);
  };

  return (
    <>
      <Card
        title="Question List"
        size="small"
        extra={
          <Space>
            <span>Show Deleted</span>
            <Switch checked={showDeleted} onChange={setShowDeleted} />
            {!showDeleted && (
              <>
                <Button type="primary" onClick={openAddSingle}>
                  Add Single
                </Button>
                <Button onClick={openAddGroup}>Add Group</Button>
              </>
            )}
          </Space>
        }
      >
        <Tabs
          activeKey={tabKey}
          onChange={setTabKey}
          items={[
            { key: "single", label: "Single" },
            { key: "group", label: "Group" },
          ]}
        />

        <Table
          rowKey={(r) => `${r.id}-${r.isGroupQuestion ? "G" : "S"}`}
          dataSource={filteredData}
          loading={listLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (p, ps) => loadList(p, ps),
          }}
          columns={[
            { title: "ID", dataIndex: "id", width: 80 },
            {
              title: "Part",
              dataIndex: "partName",
              width: 140,
              render: (_, r) => r.partName || r.partId,
            },
            {
              title: "Skill",
              dataIndex: "__skillName",
              width: 120,
              render: (v, r) => r.__skillName || "-",
            },
            {
              title: "Type",
              dataIndex: "isGroupQuestion",
              width: 100,
              render: (v) =>
                v ? <Tag color="purple">Group</Tag> : <Tag>Single</Tag>,
            },
            {
              title: "Content / Passage",
              dataIndex: "content",
              ellipsis: true,
            },
            {
              title: "Status",
              dataIndex: "status",
              width: 110,
              render: (_, r) => <Tag color={r.statusColor}>{r.statusText}</Tag>,
            },
            {
              title: "Actions",
              width: 280,
              render: (_, record) => {
                const isDeleted =
                  String(record?.statusText).toLowerCase() === "inactive" ||
                  record?.isDeleted === true;

                return (
                  <Space>
                    {!showDeleted && (
                      <Button
                        size="small"
                        type="link"
                        onClick={() => openEditRecord(record)}
                      >
                        Edit
                      </Button>
                    )}

                    {!showDeleted ? (
                      <Popconfirm
                        title="Xoá?"
                        onConfirm={async () => {
                          try {
                            await deleteQuestion(
                              record.id,
                              !!record.isGroupQuestion
                            );
                            loadList(pagination.current, pagination.pageSize);
                          } catch (e) {
                            const msg =
                              e?.response?.data?.message ||
                              e?.response?.data?.data ||
                              e?.message;
                            if (msg) message.error(String(msg));
                          }
                        }}
                      >
                        <Button size="small" danger type="link">
                          Delete
                        </Button>
                      </Popconfirm>
                    ) : (
                      <Popconfirm
                        title="Khôi phục?"
                        onConfirm={async () => {
                          try {
                            await restoreQuestion(
                              record.id,
                              !!record.isGroupQuestion
                            );
                            loadList(pagination.current, pagination.pageSize);
                          } catch (e) {
                            const msg =
                              e?.response?.data?.message ||
                              e?.response?.data?.data ||
                              e?.message;
                            if (msg) message.error(String(msg));
                          }
                        }}
                      >
                        <Button size="small" type="link">
                          Restore
                        </Button>
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
