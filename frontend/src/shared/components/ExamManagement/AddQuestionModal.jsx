// AddQuestionModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Tabs, Table, Input, Select, Button, Space, Tag, message } from "antd";
import QuestionForm from "./QuestionForm";

const { TabPane } = Tabs;

export default function AddQuestionModal({
  open,
  onClose,
  questionBank = [],
  exams = [],
  parts = [],
  onAddQuestions // function(selectedArray) - add to specific exam/part handled by parent
}) {
  const [activeTab, setActiveTab] = useState("existing");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPart, setFilterPart] = useState("all");
  const [sortBy, setSortBy] = useState("createdDesc");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualInitial, setManualInitial] = useState(null);
  const [manualExamTarget, setManualExamTarget] = useState(null);

  useEffect(()=> {
    if (!open) {
      setActiveTab("existing");
      setSearch("");
      setFilterType("all");
      setFilterPart("all");
      setSortBy("createdDesc");
      setSelectedRowKeys([]);
      setSelectedRows([]);
    }
  }, [open]);

  const filtered = useMemo(()=> {
    const s = search.trim().toLowerCase();
    let arr = questionBank.filter(q => q.isActive !== false);
    if (filterType !== "all") arr = arr.filter(q=> q.type === filterType);
    if (filterPart !== "all") arr = arr.filter(q=> q.part === filterPart);
    if (s) arr = arr.filter(q=> (q.question + JSON.stringify(q.options)).toLowerCase().includes(s));
    if (sortBy === "createdAsc") arr.sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt));
    else arr.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    return arr;
  }, [questionBank, search, filterType, filterPart, sortBy]);

  const columns = [
    { title: 'Question', dataIndex: 'question', key: 'question', render: (t,r)=>(<div><div style={{fontWeight:600}}>{t}</div><div style={{color:'#666', marginTop:6}}>{r.part} · {r.type}</div></div>) },
    { title: 'Answer', dataIndex: 'correct', key: 'correct', width:100, align:'center', render: (v)=>(<Tag>{v}</Tag>)},
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', width:140 }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => { setSelectedRowKeys(keys); setSelectedRows(rows); }
  };

  const handleAddSelected = () => {
    if (!selectedRows.length) return message.warn("Please select at least one question to add.");
    onAddQuestions(selectedRows);
    message.success(`${selectedRows.length} question(s) added`);
    onClose();
  };

  // manual add: open internal QuestionForm; after saved we call onAddQuestions with single item
  const handleManualSave = (payload) => {
    // ensure createdAt
    const item = { ...payload, id: payload.id || `q-${Date.now()}`, createdAt: new Date().toISOString().split("T")[0], isActive: true };
    // add to parent
    onAddQuestions([item], manualExamTarget);
    setManualModalOpen(false);
    setManualInitial(null);
    message.success("Question added");
  };

  return (
    <>
      <Modal title="Add Questions" open={open} onCancel={onClose} footer={null} width={1000}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Existing Questions" key="existing">
            <div style={{ display:'flex', gap:12, marginBottom:12 }}>
              <Input.Search placeholder="Search question..." style={{ width: 320 }} value={search} onChange={(e)=>setSearch(e.target.value)} />
              <Select value={filterType} onChange={setFilterType} style={{ width:140 }}>
                <Select.Option value="all">All Types</Select.Option>
                <Select.Option value="Listening">Listening</Select.Option>
                <Select.Option value="Reading">Reading</Select.Option>
              </Select>
              <Select value={filterPart} onChange={setFilterPart} style={{ width:180 }}>
                <Select.Option value="all">All Parts</Select.Option>
                {parts.map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}
              </Select>
              <Select value={sortBy} onChange={setSortBy} style={{ width:160 }}>
                <Select.Option value="createdDesc">Newest First</Select.Option>
                <Select.Option value="createdAsc">Oldest First</Select.Option>
              </Select>
              <div style={{ marginLeft: 'auto'}}>
                <Space>
                  <Button onClick={() => { setManualExamTarget(exams[0]?.id || null); setManualModalOpen(true); setActiveTab("addnew"); }}>Add Manually</Button>
                </Space>
              </div>
            </div>

            <Table
              columns={columns}
              dataSource={filtered}
              rowKey="id"
              rowSelection={rowSelection}
              pagination={{ pageSize: 6 }}
            />

            <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
              <Button onClick={onClose}>Cancel</Button>
              <Button type="primary" onClick={handleAddSelected}>Add Selected</Button>
            </div>
          </TabPane>

          <TabPane tab="Add New" key="addnew">
            <div style={{ marginBottom: 12, display:'flex', gap:12 }}>
              <Select placeholder="Select exam to add to" style={{ width: 320 }} value={manualExamTarget} onChange={setManualExamTarget}>
                {exams.map(e => <Select.Option key={e.id} value={e.id}>{e.title}</Select.Option>)}
              </Select>
              <div style={{ marginLeft: 'auto' }}>
                <Button onClick={() => { setManualExamTarget(exams[0]?.id || null); setManualModalOpen(true); }}>Open Manual Form</Button>
              </div>
            </div>

            <div style={{ color:'#666' }}>
              Click "Open Manual Form" to add a new question by filling form (supports image/audio upload). After saving the new question will be added to the selected exam/part.
            </div>
          </TabPane>
        </Tabs>
      </Modal>

      {/* internal manual QuestionForm modal */}
      <QuestionForm
        open={manualModalOpen}
        onClose={() => { setManualModalOpen(false); setManualInitial(null); }}
        onSave={(payload) => handleManualSave(payload)}
        initial={manualInitial}
        partsList={parts}
        exams={exams}
      />
    </>
  );
}
