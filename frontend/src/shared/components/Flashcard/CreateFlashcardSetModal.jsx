import React, { useState } from "react";
import { Modal, Form, Input, Switch, Select, message } from "antd";
import { createFlashcardSet } from "@services/flashcardService";

export default function CreateFlashcardSetModal({ open, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const data = {
        title: values.title.trim(),
        description: values.description?.trim() || null,
        language: values.language || "en-US",
        isPublic: values.isPublic || false,
      };

      const result = await createFlashcardSet(data);
      message.success("Tạo flashcard set thành công!");
      form.resetFields();
      onSuccess?.(result);
      onClose?.();
    } catch (error) {
      console.error("Error creating flashcard set:", error);
      const errorMsg = error?.response?.data?.message || "Không thể tạo flashcard set";
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
      title="Tạo flashcard set mới"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Tạo mới"
      cancelText="Hủy"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          language: "en-US",
          isPublic: false,
        }}
      >
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[
            { required: true, message: "Vui lòng nhập tiêu đề" },
            { max: 255, message: "Tiêu đề tối đa 255 ký tự" },
            {
              validator: (_, value) => {
                if (!value || !value.trim()) {
                  return Promise.reject(new Error("Tiêu đề không được để trống hoặc chỉ có khoảng trắng"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="Nhập tiêu đề flashcard set" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả (tùy chọn)"
        >
          <Input.TextArea
            rows={3}
            placeholder="Nhập mô tả cho flashcard set"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="language"
          label="Ngôn ngữ"
          rules={[{ required: true, message: "Vui lòng chọn ngôn ngữ" }]}
        >
          <Select placeholder="Chọn ngôn ngữ">
            <Select.Option value="en-US">Tiếng Anh (Mỹ)</Select.Option>
            <Select.Option value="en-GB">Tiếng Anh (Anh)</Select.Option>
            <Select.Option value="vi">Tiếng Việt</Select.Option>
            <Select.Option value="ja">Tiếng Nhật</Select.Option>
            <Select.Option value="zh">Tiếng Trung</Select.Option>
            <Select.Option value="ko">Tiếng Hàn</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="isPublic"
          label="Công khai"
          valuePropName="checked"
        >
          <Switch
            checkedChildren="Công khai"
            unCheckedChildren="Riêng tư"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

