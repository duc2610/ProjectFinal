import React, { useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { updateFlashcard } from "@services/flashcardService";

export default function UpdateFlashcardModal({ open, onClose, onSuccess, card }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (open && card) {
      form.setFieldsValue({
        term: card.term || card.frontText || "",
        definition: card.definition || card.backText || "",
        pronunciation: card.pronunciation || "",
        wordType: card.wordType || "",
        notes: card.notes || "",
      });
    }
  }, [open, card, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const data = {
        term: values.term.trim(),
        definition: values.definition?.trim() || null,
        pronunciation: values.pronunciation?.trim() || null,
        wordType: values.wordType?.trim() || null,
        notes: values.notes?.trim() || null,
      };

      const result = await updateFlashcard(card.cardId, data);
      message.success("Cập nhật thẻ flashcard thành công!");
      form.resetFields();
      onSuccess?.(result);
      onClose?.();
    } catch (error) {
      console.error("Error updating flashcard:", error);
      const errorMsg = error?.response?.data?.message || "Không thể cập nhật thẻ flashcard";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose?.();
  };

  if (!card) return null;

  return (
    <Modal
      title="Chỉnh sửa thẻ flashcard"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Cập nhật"
      cancelText="Hủy"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="term"
          label="Từ vựng / Thuật ngữ"
          validateTrigger={['onBlur']}
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
          <Input 
            placeholder="Nhập từ vựng hoặc thuật ngữ"
            onChange={() => {
              // Xóa lỗi khi đang sửa (nếu có)
              const errors = form.getFieldsError(['term']);
              if (errors[0]?.errors?.length > 0) {
                form.setFields([{ name: 'term', errors: [] }]);
              }
            }}
          />
        </Form.Item>

        <Form.Item
          name="definition"
          label="Định nghĩa / Nghĩa"
          validateTrigger={['onBlur']}
          rules={[
            { required: true, message: "Vui lòng nhập định nghĩa" },
            { max: 1000, message: "Định nghĩa tối đa 1000 ký tự" },
            {
              validator: (_, value) => {
                if (!value || !String(value).trim()) {
                  return Promise.reject(new Error("Định nghĩa không được để trống hoặc chỉ có khoảng trắng"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Nhập định nghĩa hoặc nghĩa của từ"
            maxLength={1000}
            showCount
            onChange={() => {
              // Xóa lỗi khi đang sửa (nếu có)
              const errors = form.getFieldsError(['definition']);
              if (errors[0]?.errors?.length > 0) {
                form.setFields([{ name: 'definition', errors: [] }]);
              }
            }}
            onFocus={() => {
              // Validate trường trước đó khi focus vào trường này
              form.validateFields(['term']).catch(() => {});
            }}
          />
        </Form.Item>

        <Form.Item
          name="pronunciation"
          label="Phiên âm (tùy chọn)"
          validateTrigger={['onBlur']}
          rules={[
            { max: 255, message: "Phiên âm tối đa 255 ký tự" },
          ]}
        >
          <Input 
            placeholder="Ví dụ: /əˈkʌmplɪʃ/"
            onChange={() => {
              // Xóa lỗi khi đang sửa (nếu có)
              const errors = form.getFieldsError(['pronunciation']);
              if (errors[0]?.errors?.length > 0) {
                form.setFields([{ name: 'pronunciation', errors: [] }]);
              }
            }}
            onFocus={() => {
              // Validate các trường trước đó khi focus vào trường này
              form.validateFields(['term', 'definition']).catch(() => {});
            }}
          />
        </Form.Item>

        <Form.Item
          name="wordType"
          label="Loại từ (tùy chọn)"
          validateTrigger={['onBlur']}
          rules={[
            { max: 50, message: "Loại từ tối đa 50 ký tự" },
          ]}
        >
          <Input 
            placeholder="Ví dụ: N (Noun), V (Verb), ADJ (Adjective)"
            onChange={() => {
              // Xóa lỗi khi đang sửa (nếu có)
              const errors = form.getFieldsError(['wordType']);
              if (errors[0]?.errors?.length > 0) {
                form.setFields([{ name: 'wordType', errors: [] }]);
              }
            }}
            onFocus={() => {
              // Validate các trường trước đó khi focus vào trường này
              form.validateFields(['term', 'definition']).catch(() => {});
            }}
          />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Ghi chú (tùy chọn)"
          validateTrigger={['onBlur']}
        >
          <Input.TextArea
            rows={2}
            placeholder="Nhập ghi chú bổ sung"
            maxLength={500}
            showCount
            onChange={() => {
              // Xóa lỗi khi đang sửa (nếu có)
              const errors = form.getFieldsError(['notes']);
              if (errors[0]?.errors?.length > 0) {
                form.setFields([{ name: 'notes', errors: [] }]);
              }
            }}
            onFocus={() => {
              // Validate các trường trước đó khi focus vào trường này
              form.validateFields(['term', 'definition']).catch(() => {});
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

