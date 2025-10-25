import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Input, Row, Col, Button, Select, Space, Collapse, List, Tooltip, Popconfirm, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import QuestionForm from "./QuestionForm";

const { Panel } = Collapse;

export default function ExamForm({ open, onClose, onSaveExam, initial, questionBank }) {
  const [form] = Form.useForm();
  const [partsQuestions, setPartsQuestions] = useState({}); // { "Part 1": [qObj,...], ... }
  const [qModalOpen, setQModalOpen] = useState(false);
  const [qEditing, setQEditing] = useState(null);
  const parts = ["Part 1","Part 2","Part 3","Part 4","Part 5","Part 6","Part 7"];

  useEffect(() => {
    if (open) {
      if (initial) {
        form.setFieldsValue({
          title: initial.title,
          description: initial.description,
          duration: initial.duration,
        });
        // load existing questions attached to the exam
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

  // helper to pick from bank into part
  const addFromBank = (part, bankItem) => {
    setPartsQuestions(prev => {
      const copy = {...prev};
      copy[part] = [{ ...bankItem, id: `local-${Date.now()}` }, ...copy[part]];
      return copy;
    });
    message.success("Added question from bank to " + part);
  };

  const handleAddQuestionDirect = (part) => {
    setQEditing({ part });
    setQModalOpen(true);
  };

  const handleSaveQuestionFromModal = (payload) => {
    // payload includes image/audio (objectURLs) and possibly id
    const part = payload.part;
    const qToSave = { ...payload, id: payload.id || `q-${Date.now()}` };
    setPartsQuestions(prev => {
      const copy = { ...prev };
      copy[part] = [qToSave, ...(copy[part] || [])];
      return copy;
    });
  };

  const handleDeleteQuestion = (part, qid) => {
    setPartsQuestions(prev => {
      const copy = { ...prev };
      copy[part] = (copy[part] || []).filter(q => q.id !== qid);
      return copy;
    });
  };

  const handleEditQuestion = (part, q) => {
    setQEditing({ ...q, part });
    setQModalOpen(true);
  };

  const handleSubmitExam = async () => {
    try {
      const values = await form.validateFields();
      // collect all part questions into single array
      const allQs = parts.flatMap(p => (partsQuestions[p] || []).map(q => ({ ...q })));
      const payload = {
        id: initial?.id,
        title: values.title,
        description: values.description,
        duration: values.duration,
        createdAt: initial?.createdAt || (new Date()).toISOString().split('T')[0],
        parts: parts,
        questions: allQs
      };
      onSaveExam(payload);
      onClose();
    } catch (err) {
      // validations
    }
  };

  // filter bank per part
  const bankByPart = useMemo(() => {
    const map = {};
    parts.forEach(p => map[p] = questionBank.filter(qb => qb.part === p));
    return map;
  }, [questionBank]);

  return (
    <>
      <Modal
        title={initial ? "Edit Exam" : "Create New Exam"}
        open={open}
        onCancel={() => { onClose(); form.resetFields(); }}
        onOk={handleSubmitExam}
        width={1000}
        okText="Save Exam"
      >
        <Form layout="vertical" form={form} initialValues={{ duration: 120 }}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="title" label="Exam Title" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="duration" label="Duration (minutes)" rules={[{ required: true }]}><Input type="number" /></Form.Item></Col>
          </Row>
          <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>

          <Collapse defaultActiveKey={parts} ghost>
            {parts.map(part => (
              <Panel header={`${part}`} key={part}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <Button type="dashed" onClick={() => handleAddQuestionDirect(part)} icon={<PlusOutlined />}>Add Question to {part}</Button>
                    <div style={{ marginTop: 12 }}>
                      <ListQuestions
                        questions={partsQuestions[part] || []}
                        onDelete={(qid)=> handleDeleteQuestion(part, qid)}
                        onEdit={(q)=> handleEditQuestion(part, q)}
                      />
                    </div>
                  </div>

                  <div style={{ width: 360 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Question Bank (for {part})</div>
                    {(bankByPart[part] || []).length === 0 ? <div style={{ color: "#888" }}>No bank questions for this part</div> : (
                      <div style={{ maxHeight: 320, overflowY: "auto" }}>
                        {bankByPart[part].map(b => (
                          <div key={b.id} style={{ border: "1px solid #eee", padding: 8, marginBottom: 8, borderRadius: 6 }}>
                            <div style={{ fontWeight: 500 }}>{b.question}</div>
                            <div style={{ marginTop: 6 }}><Space>
                              <Button size="small" onClick={() => addFromBank(part, b)}>Add to part</Button>
                            </Space></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Panel>
            ))}
          </Collapse>
        </Form>
      </Modal>

      <QuestionForm
        open={qModalOpen}
        onClose={() => { setQModalOpen(false); setQEditing(null); }}
        onSave={(payload) => {
          // if qEditing contains id -> update else add
          if (qEditing?.id) {
            // update existing in the relevant part
            setPartsQuestions(prev => {
              const copy = {...prev};
              const part = qEditing.part;
              copy[part] = (copy[part] || []).map(q => q.id === qEditing.id ? { ...q, ...payload } : q);
              return copy;
            });
          } else {
            // payload.part may be provided; default to qEditing.part
            const part = payload.part || qEditing?.part;
            const qToAdd = { ...payload, id: payload.id || `q-${Date.now()}` };
            setPartsQuestions(prev => {
              const copy = {...prev};
              copy[part] = [qToAdd, ...(copy[part] || [])];
              return copy;
            });
          }
          setQModalOpen(false);
          setQEditing(null);
        }}
        initial={qEditing}
        partsList={parts}
      />
    </>
  );
}

// small helper component to list questions inside a part
function ListQuestions({ questions, onDelete, onEdit }) {
  return (
    <>
      {questions.length === 0 && <div style={{ color: "#888" }}>No questions in this part.</div>}
      <div>
        {questions.map(q => (
          <div key={q.id} style={{ border: "1px solid #eee", padding: 8, borderRadius: 6, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ maxWidth: 560 }}>{q.question}</div>
              <div>
                <TooltipIcon label="Edit" onClick={() => onEdit(q)} icon={<PlusOutlined style={{ transform: "rotate(45deg)" }} />} />
                <Popconfirm title="Delete this question?" onConfirm={() => onDelete(q.id)}>
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function TooltipIcon({ label, onClick, icon }) {
  return (
    <Button size="small" style={{ marginRight: 8 }} onClick={onClick}>
      {icon}
    </Button>
  );
}
