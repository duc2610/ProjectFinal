import React, { useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { createFlashcard } from "@services/flashcardService";

export default function AddFlashcardModal({ open, onClose, onSuccess, setId }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const data = {
        setId: setId,
        term: values.term.trim(),
        definition: values.definition?.trim() || null,
        pronunciation: values.pronunciation?.trim() || null,
        wordType: values.wordType?.trim() || null,
        notes: values.notes?.trim() || null,
      };

      const result = await createFlashcard(data);
      message.success("Thêm thẻ flashcard thành công!");
      form.resetFields();
      onSuccess?.(result);
      onClose?.();
    } catch (error) {
      console.error("Error creating flashcard:", error);
      const errorMsg = error?.response?.data?.message || "Không thể thêm thẻ flashcard";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose?.();
  };

  return (
    <Modal
      title="Thêm thẻ flashcard"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Thêm"
      cancelText="Hủy"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        validateTrigger={[]}
      >
        <Form.Item
          name="term"
          label="Từ vựng / Thuật ngữ"
          rules={[
            { required: true, message: "Vui lòng nhập từ vựng" },
            { max: 500, message: "Từ vựng tối đa 500 ký tự" },
            {
              validator: (_, value) => {
                if (!value || !String(value).trim()) {
                  return Promise.reject(new Error("Từ vựng không được để trống hoặc chỉ có khoảng trắng"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="Nhập từ vựng hoặc thuật ngữ" />
        </Form.Item>

        <Form.Item
          name="definition"
          label="Định nghĩa / Nghĩa"
          rules={[
            { max: 1000, message: "Định nghĩa tối đa 1000 ký tự" },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Nhập định nghĩa hoặc nghĩa của từ"
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="pronunciation"
          label="Phiên âm (tùy chọn)"
          rules={[
            { max: 255, message: "Phiên âm tối đa 255 ký tự" },
          ]}
        >
          <Input placeholder="Ví dụ: /əˈkʌmplɪʃ/" />
        </Form.Item>

        <Form.Item
          name="wordType"
          label="Loại từ (tùy chọn)"
          rules={[
            { max: 50, message: "Loại từ tối đa 50 ký tự" },
          ]}
        >
          <Input placeholder="Ví dụ: N (Noun), V (Verb), ADJ (Adjective)" />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Ghi chú (tùy chọn)"
        >
          <Input.TextArea
            rows={2}
            placeholder="Nhập ghi chú bổ sung"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

