import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Switch, Select, message } from "antd";
import { updateFlashcardSet, getFlashcardSetById } from "@services/flashcardService";

export default function UpdateFlashcardSetModal({ open, onClose, onSuccess, setId }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (open && setId) {
      loadSetData();
    }
  }, [open, setId]);

  const loadSetData = async () => {
    try {
      setLoadingData(true);
      const data = await getFlashcardSetById(setId);
      form.setFieldsValue({
        title: data.title,
        description: data.description || "",
        language: data.language || "en-US",
        isPublic: data.isPublic || false,
      });
    } catch (error) {
      console.error("Error loading flashcard set:", error);
      message.error("Không thể tải thông tin flashcard set");
    } finally {
      setLoadingData(false);
    }
  };

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

      const result = await updateFlashcardSet(setId, data);
      message.success("Cập nhật flashcard set thành công!");
      onSuccess?.(result);
      onClose?.();
    } catch (error) {
      console.error("Error updating flashcard set:", error);
      const errorMsg = error?.response?.data?.message || "Không thể cập nhật flashcard set";
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
      title="Chỉnh sửa flashcard set"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Cập nhật"
      cancelText="Hủy"
      width={600}
    >
      {loadingData ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          Đang tải...
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          validateTrigger={[]}
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
      )}
    </Modal>
  );
}

