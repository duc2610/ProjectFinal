// ExamManager.jsx
import React, { useMemo, useState } from "react";
import { Card, Button, Input, Table, Space, Popconfirm, Tag, Modal } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { MOCK_EXAMS, QUESTION_BANK } from "./mockData";
import ExamForm from "./ExamForm";
import styles from "../../styles/ExamManagement.module.css";

export default function ExamManager() {
  const [exams, setExams] = useState(MOCK_EXAMS);
  const [questionBank, setQuestionBank] = useState(QUESTION_BANK);
  const [questionsByExam, setQuestionsByExam] = useState({}); // store exam.questions here keyed by examId
  const [openForm, setOpenForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [search, setSearch] = useState("");
  const [viewQuestionsModal, setViewQuestionsModal] = useState({ open:false, exam:null, questions:[] });

  const openCreate = () => { setEditingExam(null); setOpenForm(true); };
  const openEdit = (exam) => { setEditingExam(exam); setOpenForm(true); };

  const handleSaveExam = (payload) => {
    if (payload.id) {
      setExams(prev => prev.map(e => e.id === payload.id ? { ...e, title: payload.title, description: payload.description, duration: payload.duration } : e));
      // save questions
      setQuestionsByExam(prev => ({ ...prev, [payload.id]: payload.questions || [] }));
    } else {
      const newExam = { id: `exam-${Date.now()}`, title: payload.title, description: payload.description, duration: payload.duration, createdAt: payload.createdAt };
      setExams(prev => [newExam, ...prev]);
      setQuestionsByExam(prev => ({ ...prev, [newExam.id]: payload.questions || [] }));
    }
  };

  const handleDeleteExam = (id) => {
    setExams(prev => prev.filter(e => e.id !== id));
    setQuestionsByExam(prev => { const c = { ...prev }; delete c[id]; return c; });
  };

  const openViewQuestions = (exam) => {
    setViewQuestionsModal({ open:true, exam, questions: questionsByExam[exam.id] || [] });
  };

  const filteredExams = useMemo(() => {
    if (!search.trim()) return exams;
    const s = search.toLowerCase();
    return exams.filter(e => e.title.toLowerCase().includes(s) || (e.description||"").toLowerCase().includes(s));
  }, [exams, search]);

  const columns = [
    { title: "Exam Title", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Duration", dataIndex: "duration", key: "duration", width: 120, render: d => `${d} min` },
    { title: "Questions", dataIndex: "questionsCount", key: "questionsCount", width: 120, render: (_,rec) => (questionsByExam[rec.id] ? questionsByExam[rec.id].length : 0) },
    { title: "Created", dataIndex: "createdAt", key: "createdAt", width: 140 },
    {
      title: "Actions", key: "actions", width: 200, render: (_, rec) => (
        <Space>
          <Button onClick={() => openViewQuestions(rec)}>View Questions</Button>
          <Button icon={<EditOutlined />} onClick={() => openEdit(rec)} />
          <Popconfirm title="Delete exam?" onConfirm={() => handleDeleteExam(rec.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className={styles.pageWrap}>
      <h2>TOEIC Exam Management</h2>
      <Card className={styles.controlCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Input.Search placeholder="Search exams..." style={{ width: 360 }} value={search} onChange={(e)=>setSearch(e.target.value)} />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Create New Exam</Button>
        </div>
      </Card>

      <Card>
        <Table columns={columns} dataSource={filteredExams} rowKey="id" />
      </Card>

      <ExamForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSaveExam={handleSaveExam}
        initial={editingExam ? { ...editingExam, questions: questionsByExam[editingExam.id] || [] } : null}
        questionBank={questionBank}
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
    </div>
  );
}
