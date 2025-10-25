import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Upload, Button, Radio, Row, Col } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { TextArea } = Input;

export default function QuestionForm({ open, onClose, onSave, initial, partsList }) {
  const [form] = Form.useForm();
  const [imgPreview, setImgPreview] = useState(initial?.imageUrl || null);
  const [audioPreview, setAudioPreview] = useState(initial?.audioUrl || null);

  useEffect(() => {
    if (open) {
      if (initial) {
        form.setFieldsValue({
          type: initial.type,
          part: initial.part,
          question: initial.question,
          optA: initial.options?.A || "",
          optB: initial.options?.B || "",
          optC: initial.options?.C || "",
          optD: initial.options?.D || "",
          correct: initial.correct || "A",
          explanation: initial.explanation || ""
        });
        setImgPreview(initial.imageUrl || null);
        setAudioPreview(initial.audioUrl || null);
      } else {
        form.resetFields();
        setImgPreview(null);
        setAudioPreview(null);
      }
    }
  }, [open, initial, form]);

  // prevent antd auto upload - we create objectURL and keep the File
  const beforeUploadImage = (file) => {
    const url = URL.createObjectURL(file);
    setImgPreview(url);
    form.setFieldsValue({ imageFile: file });
    return false;
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
        id: initial?.id,
        type: values.type,
        part: values.part,
        question: values.question,
        options: { A: values.optA, B: values.optB, C: values.optC, D: values.optD },
        correct: values.correct,
        explanation: values.explanation || "",
        imageFile: values.imageFile || null,
        audioFile: values.audioFile || null,
        imageUrl: values.imageFile ? URL.createObjectURL(values.imageFile) : imgPreview,
        audioUrl: values.audioFile ? URL.createObjectURL(values.audioFile) : audioPreview
      };
      onSave(payload);
      onClose();
      form.resetFields();
    } catch (err) {
      // validation errors auto shown
    }
  };

  return (
    <Modal
      title={initial ? "Update Question" : "Create New Question"}
      open={open}
      onCancel={() => { onClose(); form.resetFields(); }}
      onOk={handleOk}
      width={900}
      okText="Save"
    >
      <Form layout="vertical" form={form} initialValues={{ type: "Reading", part: partsList[0] || "Part 5", correct: "A" }}>
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
                {partsList.map(p => <Select.Option key={p} value={p}>{p}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="question" label="Question Text" rules={[{ required: true }]}>
          <TextArea rows={3} />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}><Form.Item name="optA" label="A." rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col span={12}><Form.Item name="optB" label="B." rules={[{ required: true }]}><Input /></Form.Item></Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}><Form.Item name="optC" label="C." rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col span={12}><Form.Item name="optD" label="D." rules={[{ required: true }]}><Input /></Form.Item></Col>
        </Row>

        <Form.Item name="correct" label="Correct Answer" rules={[{ required: true }]}>
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
              <Upload beforeUpload={beforeUploadImage} showUploadList={false} accept="image/*">
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
              {imgPreview && <div style={{ marginTop: 8 }}><img src={imgPreview} alt="preview" style={{ maxHeight: 140 }} /></div>}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Audio (optional)">
              <Upload beforeUpload={beforeUploadAudio} showUploadList={false} accept="audio/*">
                <Button icon={<UploadOutlined />}>Upload Audio</Button>
              </Upload>
              {audioPreview && <div style={{ marginTop: 8 }}><audio src={audioPreview} controls /></div>}
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="explanation" label="Explanation (optional)">
          <TextArea rows={2} />
        </Form.Item>

        <Form.Item name="imageFile" hidden><Input /></Form.Item>
        <Form.Item name="audioFile" hidden><Input /></Form.Item>
      </Form>
    </Modal>
  );
}
