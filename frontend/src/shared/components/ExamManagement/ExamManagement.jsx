// ExamManager.jsx
import React, { useMemo, useState } from "react";
import { Card, Button, Input, Table, Space, Popconfirm, Modal, Tag, Tabs, Switch, Select, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { MOCK_EXAMS, QUESTION_BANK } from "./mockData";
import ExamForm from "./ExamForm";
import QuestionForm from "./QuestionForm";
import styles from "../../styles/ExamManagement.module.css";

export default function ExamManager() {
  const [exams, setExams] = useState(MOCK_EXAMS);
  const [questionBank, setQuestionBank] = useState(QUESTION_BANK);
  const [questionsByExam, setQuestionsByExam] = useState({}); // examId -> question[]
  const [openExamForm, setOpenExamForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [searchExam, setSearchExam] = useState("");
  const [viewQuestionsModal, setViewQuestionsModal] = useState({ open:false, exam:null, questions:[] });

  // Questions tab states
  const [searchQ, setSearchQ] = useState("");
  const [filterExamQ, setFilterExamQ] = useState("all");
  const [filterTypeQ, setFilterTypeQ] = useState("all");
  const [filterPartQ, setFilterPartQ] = useState("all");
  const [filterStatusQ, setFilterStatusQ] = useState("all");
  const [sortQ, setSortQ] = useState("createdDesc");

  // Question editing modal (from Questions tab)
  const [questionEditModalOpen, setQuestionEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const openCreateExam = () => { setEditingExam(null); setOpenExamForm(true); };
  const openEditExam = (exam) => { setEditingExam(exam); setOpenExamForm(true); };

  const handleSaveExam = (payload) => {
    if (payload.id) {
      setExams(prev => prev.map(e => e.id === payload.id ? { ...e, ...payload } : e));
      setQuestionsByExam(prev => ({ ...prev, [payload.id]: payload.questions || [] }));
    } else {
      const newExam = { id: `exam-${Date.now()}`, title: payload.title, description: payload.description, duration: payload.duration, createdAt: payload.createdAt, parts: payload.parts, isActive: payload.isActive !== false };
      setExams(prev => [newExam, ...prev]);
      setQuestionsByExam(prev => ({ ...prev, [newExam.id]: payload.questions || [] }));
    }
    message.success("Exam saved");
  };

  const handleDeleteExam = (id) => {
    setExams(prev => prev.filter(e => e.id !== id));
    setQuestionsByExam(prev => { const c = {...prev}; delete c[id]; return c; });
  };

  const openViewQuestions = (exam) => {
    setViewQuestionsModal({ open:true, exam, questions: questionsByExam[exam.id] || [] });
  };

  // toggle disable exam
  const toggleExamActive = (examId, val) => {
    setExams(prev => prev.map(e => e.id === examId ? { ...e, isActive: val } : e));
  };

  // Questions aggregated across exams
  const allQuestions = useMemo(() => {
    const rows = [];
    exams.forEach(e => {
      const qs = questionsByExam[e.id] || [];
      qs.forEach(q => rows.push({ ...q, examId: e.id, examTitle: e.title }));
    });
    return rows;
  }, [questionsByExam, exams]);

  const filteredQuestions = useMemo(() => {
    let arr = allQuestions.concat(questionBank.map(q=> ({...q, examId: null, examTitle: 'Bank'})));
    // filters
    if (filterExamQ !== "all") arr = arr.filter(a => a.examId === filterExamQ);
    if (filterTypeQ !== "all") arr = arr.filter(a => a.type === filterTypeQ);
    if (filterPartQ !== "all") arr = arr.filter(a => a.part === filterPartQ);
    if (filterStatusQ !== "all") arr = arr.filter(a => (filterStatusQ === "active" ? a.isActive !== false : a.isActive === false));
    if (searchQ.trim()) {
      const s = searchQ.toLowerCase();
      arr = arr.filter(a => (a.question + JSON.stringify(a.options)).toLowerCase().includes(s));
    }
    // sort
    if (sortQ === "createdAsc") arr.sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt));
    else arr.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    return arr;
  }, [allQuestions, questionBank, filterExamQ, filterTypeQ, filterPartQ, filterStatusQ, searchQ, sortQ]);

  const examColumns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Duration", dataIndex: "duration", key: "duration", width:120, render: d=> `${d} min` },
    { title: "Questions", key: "questions", width:120, render: (_,rec) => (questionsByExam[rec.id] ? questionsByExam[rec.id].length : 0) },
    { title: "Status", dataIndex: "isActive", key: "isActive", width:140, render: (_,rec)=> <Space><Tag color={rec.isActive ? 'green':'default'}>{rec.isActive ? 'Active':'Disabled'}</Tag><Switch checked={rec.isActive} onChange={(val)=> toggleExamActive(rec.id,val)} /></Space> },
    {
      title: "Actions", key: "actions", width:260, render: (_,rec)=> (
        <Space>
          <Button onClick={()=> openViewQuestions(rec)}>View Questions</Button>
          <Button icon={<EditOutlined />} onClick={()=> openEditExam(rec)} />
          <Popconfirm title="Delete exam?" onConfirm={()=> handleDeleteExam(rec.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const questionColumns = [
    { title: "No.", dataIndex: "createdAt", key: "no", width:80, render: (_,r,i)=> i+1 },
    { title: "Exam", dataIndex: "examTitle", key: "examTitle", width:180 },
    { title: "Type", dataIndex: "type", key: "type", width:120, render: t=> <Tag>{t}</Tag> },
    { title: "Part", dataIndex: "part", key: "part", width:120 },
    { title: "Question", dataIndex: "question", key: "question" },
    { title: "Answer", dataIndex: "correct", key: "correct", width:100, align:"center", render: v=>(<div className={styles.answerBadge}>{v}</div>)},
    { title: "Status", dataIndex: "isActive", key: "status", width:120, render: (isActive)=> isActive ? <Tag color="green">Active</Tag> : <Tag>Disabled</Tag> },
    {
      title: "Actions", key: "actions", width:160, render: (_,row) => (
        <Space>
          <Button onClick={()=> { setEditingQuestion(row); setQuestionEditModalOpen(true); }}>Edit</Button>
          <Popconfirm title="Delete question?" onConfirm={()=>{
            // remove from questionsByExam mapping
            setQuestionsByExam(prev=>{
              const copy = {...prev};
              Object.keys(copy).forEach(k => { copy[k] = copy[k].filter(q => q.id !== row.id) });
              return copy;
            });
            // also remove from bank if present
            setQuestionBank(prev => prev.filter(q => q.id !== row.id));
          }}>
            <Button danger>Delete</Button>
          </Popconfirm>
          <Button onClick={()=>{
            // toggle active
            const isBank = row.examId === null;
            if (isBank) {
              setQuestionBank(prev => prev.map(q => q.id === row.id ? { ...q, isActive: !(q.isActive !== false) } : q));
            } else {
              setQuestionsByExam(prev => {
                const copy = {...prev};
                copy[row.examId] = (copy[row.examId] || []).map(q => q.id === row.id ? { ...q, isActive: !(q.isActive !== false) } : q);
                return copy;
              });
            }
          }}>{row.isActive ? 'Disable' : 'Enable'}</Button>
        </Space>
      )
    }
  ];

  // handle saving question from Questions tab edit modal
  const handleSaveEditedQuestion = (payload) => {
    // save back to mapping or bank
    if (!payload) return;
    if (payload.examId) {
      setQuestionsByExam(prev => {
        const copy = {...prev};
        copy[payload.examId] = (copy[payload.examId]||[]).map(q => q.id === payload.id ? { ...q, ...payload } : q);
        return copy;
      });
    } else {
      setQuestionBank(prev => prev.map(q => q.id === payload.id ? { ...q, ...payload } : q));
    }
    setQuestionEditModalOpen(false);
    setEditingQuestion(null);
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.headerRow}>
        <h2>TOEIC Exam Management</h2>
      </div>

      <Tabs defaultActiveKey="exams">
        <Tabs.TabPane tab="Exams" key="exams">
          <Card className={styles.controlCard}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <Input.Search placeholder="Search exams..." style={{ width: 360 }} value={searchExam} onChange={(e)=> setSearchExam(e.target.value)} />
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateExam}>Create New Exam</Button>
            </div>
          </Card>

          <Card>
            <Table columns={examColumns} dataSource={exams.filter(e => !searchExam.trim() ? true : (e.title+e.description).toLowerCase().includes(searchExam.toLowerCase()))} rowKey="id" />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Questions" key="questions">
          <Card className={styles.controlCard}>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <Input.Search placeholder="Search question..." style={{ width:360 }} value={searchQ} onChange={(e)=> setSearchQ(e.target.value)} />
              <Select value={filterExamQ} onChange={setFilterExamQ} style={{ width:200 }}>
                <Select.Option value="all">All Exams</Select.Option>
                {exams.map(e => <Select.Option key={e.id} value={e.id}>{e.title}</Select.Option>)}
                <Select.Option value="bank">Question Bank</Select.Option>
              </Select>
              <Select value={filterTypeQ} onChange={setFilterTypeQ} style={{ width:160 }}>
                <Select.Option value="all">All Types</Select.Option>
                <Select.Option value="Listening">Listening</Select.Option>
                <Select.Option value="Reading">Reading</Select.Option>
              </Select>
              <Select value={filterPartQ} onChange={setFilterPartQ} style={{ width:160 }}>
                <Select.Option value="all">All Parts</Select.Option>
                {["Part 1","Part 2","Part 3","Part 4","Part 5","Part 6","Part 7"].map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}
              </Select>
              <Select value={filterStatusQ} onChange={setFilterStatusQ} style={{ width:140 }}>
                <Select.Option value="all">All Status</Select.Option>
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="disabled">Disabled</Select.Option>
              </Select>
              <Select value={sortQ} onChange={setSortQ} style={{ width:160 }}>
                <Select.Option value="createdDesc">Newest First</Select.Option>
                <Select.Option value="createdAsc">Oldest First</Select.Option>
              </Select>
              {/* No create button on Questions tab as requested */}
            </div>
          </Card>

          <Card>
            <Table columns={questionColumns} dataSource={filteredQuestions} rowKey="id" pagination={{ pageSize: 8 }} />
          </Card>
        </Tabs.TabPane>
      </Tabs>

      <ExamForm
        open={openExamForm}
        onClose={() => { setOpenExamForm(false); setEditingExam(null); }}
        onSaveExam={handleSaveExam}
        initial={editingExam ? { ...editingExam, questions: questionsByExam[editingExam.id] || [] } : null}
        questionBank={questionBank}
        exams={exams}
      />

      <Modal title={`Questions - ${viewQuestionsModal.exam?.title || ""}`} open={viewQuestionsModal.open} onCancel={()=> setViewQuestionsModal({ open:false, exam:null, questions:[] })} footer={null} width={900}>
        {viewQuestionsModal.questions && viewQuestionsModal.questions.length ? (
          <div>
            {viewQuestionsModal.questions.map(q => (
              <div key={q.id} style={{ border: "1px solid #eee", padding: 12, borderRadius: 6, marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>{q.question}</div>
                <div style={{ marginTop: 6, color:'#555' }}>
                  <strong>Part:</strong> {q.part} · <strong>Type:</strong> {q.type} · <strong>Answer:</strong> {q.correct}
                </div>
                <div style={{ marginTop: 8 }}>
                  {q.imageUrl && <img src={q.imageUrl} alt="img" style={{ maxHeight: 120, marginRight: 8 }} />}
                  {q.audioUrl && <audio src={q.audioUrl} controls />}
                </div>
              </div>
            ))}
          </div>
        ) : <div>No questions yet for this exam.</div>}
      </Modal>

      <QuestionForm
        open={questionEditModalOpen}
        onClose={() => { setQuestionEditModalOpen(false); setEditingQuestion(null); }}
        onSave={handleSaveEditedQuestion}
        initial={editingQuestion}
        partsList={["Part 1","Part 2","Part 3","Part 4","Part 5","Part 6","Part 7"]}
        exams={exams}
      />
    </div>
  );
}
