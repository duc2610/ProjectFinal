import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Upload, Button, Radio, Row, Col } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { TextArea } = Input;

export default function QuestionModal({
  open,
  onClose,
  onSave,
  exams,
  initialData = null, // when editing
}) {
  const [form] = Form.useForm();
  const [imagePreview, setImagePreview] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          examId: initialData.examId,
          number: initialData.number,
          type: initialData.type,
          part: initialData.part,
          question: initialData.question,
          optA: initialData.options?.A || "",
          optB: initialData.options?.B || "",
          optC: initialData.options?.C || "",
          optD: initialData.options?.D || "",
          correct: initialData.correct || "A",
          imageUrl: initialData.imageUrl || null,
          audioUrl: initialData.audioUrl || null,
          explanation: initialData.explanation || "",
        });
        setImagePreview(initialData.imageUrl || null);
        setAudioPreview(initialData.audioUrl || null);
      } else {
        form.resetFields();
        setImagePreview(null);
        setAudioPreview(null);
      }
    }
  }, [open, initialData, form]);

  // custom upload: create object URL (mock saving)
  const beforeUploadImage = (file) => {
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    // store file in form as object for later (we'll pass File object)
    form.setFieldsValue({ imageFile: file });
    return false; // prevent antd Upload from auto uploading
  };

  const beforeUploadAudio = (file) => {
    const url = URL.createObjectURL(file);
    setAudioPreview(url);
    form.setFieldsValue({ audioFile: file });
    return false;
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        examId: values.examId,
        number: values.number,
        type: values.type,
        part: values.part,
        question: values.question,
        options: { A: values.optA, B: values.optB, C: values.optC, D: values.optD },
        correct: values.correct,
        imageUrl: values.imageFile ? URL.createObjectURL(values.imageFile) : imagePreview,
        audioUrl: values.audioFile ? URL.createObjectURL(values.audioFile) : audioPreview,
        explanation: values.explanation || "",
      };
      // If editing, keep id
      if (initialData && initialData.id) payload.id = initialData.id;
      onSave(payload);
      onClose();
      form.resetFields();
      setImagePreview(null);
      setAudioPreview(null);
    } catch (err) {
      // validation error
    }
  };

  return (
    <Modal
      title={initialData ? "Update Question" : "Create New Question"}
      open={open}
      onCancel={() => { onClose(); form.resetFields(); }}
      onOk={handleOk}
      width={880}
      okText="Save"
    >
      <Form layout="vertical" form={form} initialValues={{ correct: "A", type: "Reading", part: "Part 5" }}>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="examId" label="Exam" rules={[{ required: true }]}>
              <Select>
                {exams.map((e) => <Select.Option key={e.id} value={e.id}>{e.title}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="number" label="Question Number" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="type" label="Question Type" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="Listening">Listening</Select.Option>
                <Select.Option value="Reading">Reading</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="part" label="Part" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="Part 1">Part 1</Select.Option>
                <Select.Option value="Part 2">Part 2</Select.Option>
                <Select.Option value="Part 3">Part 3</Select.Option>
                <Select.Option value="Part 4">Part 4</Select.Option>
                <Select.Option value="Part 5">Part 5</Select.Option>
                <Select.Option value="Part 6">Part 6</Select.Option>
                <Select.Option value="Part 7">Part 7</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="question" label="Question Text" rules={[{ required: true }]}>
          <TextArea rows={3} />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="optA" label="A." rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="optB" label="B." rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="optC" label="C." rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="optD" label="D." rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Correct Answer" name="correct" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio value="A">A</Radio>
            <Radio value="B">B</Radio>
            <Radio value="C">C</Radio>
            <Radio value="D">D</Radio>
          </Radio.Group>
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="Image (optional)">
              <Upload beforeUpload={beforeUploadImage} showUploadList={false}>
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
              {imagePreview && <div style={{ marginTop: 8 }}><img src={imagePreview} alt="preview" style={{ maxHeight: 120 }} /></div>}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Audio (optional)">
              <Upload beforeUpload={beforeUploadAudio} showUploadList={false} accept="audio/*">
                <Button icon={<UploadOutlined />}>Upload Audio</Button>
              </Upload>
              {audioPreview && <div style={{ marginTop: 8 }}><audio controls src={audioPreview} /></div>}
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="explanation" label="Explanation (optional)">
          <TextArea rows={2} />
        </Form.Item>

        {/* Hidden fields to carry File objects */}
        <Form.Item name="imageFile" hidden><Input /></Form.Item>
        <Form.Item name="audioFile" hidden><Input /></Form.Item>
      </Form>
    </Modal>
  );
}
