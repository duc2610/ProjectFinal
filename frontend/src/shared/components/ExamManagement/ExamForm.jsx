import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Input, Row, Col, Button, Collapse, List, Space, Popconfirm, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import AddQuestionModal from "./AddQuestionModal";
import QuestionForm from "./QuestionForm";

const { Panel } = Collapse;

export default function ExamForm({ open, onClose, onSaveExam, initial = null, questionBank = [], exams = [] }) {
  const [form] = Form.useForm();
  const parts = ["Part 1","Part 2","Part 3","Part 4","Part 5","Part 6","Part 7"];
  const [partsQuestions, setPartsQuestions] = useState({});
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [targetPartForAdd, setTargetPartForAdd] = useState(null);

  useEffect(() => {
    if (open) {
      if (initial) {
        form.setFieldsValue({
          title: initial.title,
          description: initial.description,
          duration: initial.duration,
          isActive: initial.isActive !== false
        });
        const map = {};
        parts.forEach(p => map[p] = (initial.questions || []).filter(q => q.part === p));
        setPartsQuestions(map);
      } else {
        form.resetFields();
        const map = {};
        parts.forEach(p => map[p] = []);
        setPartsQuestions(map);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const openAddModal = (part) => {
    setTargetPartForAdd(part);
    setAddModalOpen(true);
  };

  const handleAddQuestions = (items, examTarget=null) => {
    // items: array of question objects (from bank or manual). Add to targetPartForAdd or examTarget
    const partToUse = examTarget ? items[0]?.part || targetPartForAdd : targetPartForAdd;
    setPartsQuestions(prev => {
      const copy = { ...prev };
      copy[partToUse] = [...(items.map(it => ({ ...it, id: it.id || `q-${Date.now()}-${Math.random()}` }))), ...(copy[partToUse] || [])];
      return copy;
    });
    setAddModalOpen(false);
  };

  const handleManualAddFromExam = (items, examTarget) => {
    // from AddQuestionModal manual: items with examId; find part
    items.forEach(it => {
      setPartsQuestions(prev => {
        const copy = {...prev};
        const part = it.part || parts[0];
        copy[part] = [{ ...it, id: it.id || `q-${Date.now()}` }, ...(copy[part] || [])];
        return copy;
      });
    });
  };

  const handleEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionModalOpen(true);
  };

  const handleSaveEditedQuestion = (payload) => {
    // find payload.id in partsQuestions and update
    setPartsQuestions(prev => {
      const copy = {...prev};
      Object.keys(copy).forEach(p => {
        copy[p] = copy[p].map(q => q.id === payload.id ? { ...q, ...payload } : q);
      });
      return copy;
    });
    setQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const handleDelete = (part, qid) => {
    setPartsQuestions(prev => ({ ...prev, [part]: prev[part].filter(q => q.id !== qid) }));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const allQuestions = parts.flatMap(p => (partsQuestions[p] || []).map(q => ({ ...q })));
      const payload = {
        id: initial?.id,
        title: values.title,
        description: values.description,
        duration: values.duration,
        createdAt: initial?.createdAt || new Date().toISOString().split("T")[0],
        parts,
        questions: allQuestions,
        isActive: values.isActive !== undefined ? values.isActive : true
      };
      onSaveExam(payload);
      onClose();
    } catch (err) {}
  };

  return (
    <>
      <Modal title={initial ? "Edit Exam" : "Create New Exam"} open={open} onCancel={() => { onClose(); form.resetFields(); }} onOk={handleSubmit} width={1000} okText="Save Exam">
        <Form layout="vertical" form={form} initialValues={{ duration: 120 }}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="title" label="Exam Title" rules={[{ required: true }]}><Input/></Form.Item></Col>
            <Col span={12}><Form.Item name="duration" label="Duration (minutes)" rules={[{ required: true }]}><Input type="number"/></Form.Item></Col>
          </Row>
          <Form.Item name="description" label="Description"><Input.TextArea rows={2}/></Form.Item>

          <Collapse defaultActiveKey={parts} ghost>
            {parts.map(part=>(
              <Panel header={part} key={part}>
                <div style={{ display:'flex', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                      <Button type="dashed" onClick={()=> openAddModal(part)} icon={<PlusOutlined />}>Add Question</Button>
                    </div>

                    {(partsQuestions[part] || []).length === 0 ? <div style={{ color:'#888' }}>No questions in this part</div> : (
                      <ListQuestions
                        questions={partsQuestions[part] || []}
                        onEdit={(q)=> handleEditQuestion(q)}
                        onDelete={(qid)=> handleDelete(part, qid)}
                      />
                    )}
                  </div>

                  <div style={{ width:360 }}>
                    <div style={{ fontWeight:600, marginBottom:8 }}>Quick actions</div>
                    <div style={{ color:'#666' }}>Use Add Question to pick from bank (search/filter/sort) or create manually.</div>
                  </div>
                </div>
              </Panel>
            ))}
          </Collapse>
        </Form>
      </Modal>

      <AddQuestionModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        questionBank={questionBank}
        exams={exams}
        parts={parts}
        onAddQuestions={(items, examTarget) => handleAddQuestions(items, examTarget)}
      />

      <QuestionForm
        open={questionModalOpen}
        onClose={() => { setQuestionModalOpen(false); setEditingQuestion(null); }}
        onSave={(payload) => handleSaveEditedQuestion(payload)}
        initial={editingQuestion}
        partsList={parts}
        exams={exams}
      />
    </>
  );
}

function ListQuestions({ questions, onEdit, onDelete }) {
  return (
    <div>
      {questions.map(q=>(
        <div key={q.id} style={{ border:'1px solid #eee', padding:8, borderRadius:6, marginBottom:8, display:'flex', justifyContent:'space-between' }}>
          <div style={{ maxWidth:640 }}>
            <div style={{ fontWeight:600 }}>{q.question}</div>
            <div style={{ marginTop:6, color:'#666' }}>{q.correct} · {q.part}</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <Button size="small" onClick={()=> onEdit(q)} icon={<EditOutlined />}>Edit</Button>
            <Popconfirm title="Delete question?" onConfirm={()=> onDelete(q.id)}>
              <Button size="small" danger icon={<DeleteOutlined />}>Delete</Button>
            </Popconfirm>
          </div>
        </div>
      ))}
    </div>
  );
}
