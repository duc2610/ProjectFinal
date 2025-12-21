import React, { useState, useEffect } from "react";
import { Modal, Form, Input, message, Tabs, Button, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { createFlashcard, bulkCreateFlashcards } from "@services/flashcardService";

export default function AddFlashcardModal({ open, onClose, onSuccess, setId }) {
  const [form] = Form.useForm();
  const [bulkForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("single");
  const [bulkCards, setBulkCards] = useState([{ term: "", definition: "", pronunciation: "", wordType: "", notes: "", examples: "" }]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const examples =
        values.examples
          ?.split("\n")
          .map((s) => s.trim())
          .filter(Boolean) || [];

      const data = {
        setId: setId,
        term: values.term.trim(),
        definition: values.definition?.trim() || null,
        pronunciation: values.pronunciation?.trim() || null,
        wordType: values.wordType?.trim() || null,
        notes: values.notes?.trim() || null,
        examples,
      };

      const result = await createFlashcard(data);
      message.success("Thêm thẻ flashcard thành công!");
      form.resetFields();
      onSuccess?.(result);
      onClose?.();
    } catch (error) {
      // Error creating flashcard
      const errorMsg = error?.response?.data?.message || "Không thể thêm thẻ flashcard";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    bulkForm.resetFields();
    setBulkCards([{ term: "", definition: "", pronunciation: "", wordType: "", notes: "", examples: "" }]);
    setActiveTab("single");
    onClose?.();
  };

  const handleBulkSubmit = async () => {
    try {
      await bulkForm.validateFields();
      setLoading(true);
      
      // Lấy giá trị từ form - đảm bảo lấy tất cả các trường (kể cả chưa touched)
      const formValues = bulkForm.getFieldsValue(true);
      
      // Lọc các flashcard có đủ thông tin (term và definition bắt buộc)
      const validCards = bulkCards
        .map((card, index) => {
          // Lấy tất cả giá trị trực tiếp từ form, xử lý giống như tab "Thêm một"
          const term = (formValues[`card_${index}_term`] || "").trim();
          const definition = (formValues[`card_${index}_definition`] || "").trim();
          
          // Xử lý các trường tùy chọn giống như tab "Thêm một": trim và chuyển empty string thành null
          const pronunciation = (formValues[`card_${index}_pronunciation`] || "").trim() || null;
          const wordType = (formValues[`card_${index}_wordType`] || "").trim() || null;
          const notes = (formValues[`card_${index}_notes`] || "").trim() || null;
          
          // Xử lý examples giống như tab "Thêm một" - split theo dòng
          const examplesText = (formValues[`card_${index}_examples`] || "").trim();
          const examples = examplesText
            ? examplesText.split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
            : [];
          
          return {
            term,
            definition,
            pronunciation,
            wordType,
            examples,
            notes,
          };
        })
        .filter(card => card.term && card.definition);

      if (validCards.length === 0) {
        message.warning("Vui lòng nhập ít nhất một flashcard với từ vựng và định nghĩa");
        setLoading(false);
        return;
      }

      const data = {
        setId: setId,
        flashcards: validCards,
      };

      // Debug: log dữ liệu để kiểm tra

      const result = await bulkCreateFlashcards(data);
      message.success(`Đã thêm ${validCards.length} thẻ flashcard thành công!`);
      bulkForm.resetFields();
      setBulkCards([{ term: "", definition: "", pronunciation: "", wordType: "", notes: "", examples: "" }]);
      onSuccess?.(result);
      onClose?.();
    } catch (error) {
      // Error creating bulk flashcards
      // Nếu là lỗi validation, không hiển thị message error
      if (error.errorFields) {
        message.warning("Vui lòng kiểm tra lại các trường bắt buộc");
      } else {
        const errorMsg = error?.response?.data?.message || "Không thể thêm flashcard";
        message.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddBulkCard = () => {
      setBulkCards([...bulkCards, { term: "", definition: "", pronunciation: "", wordType: "", notes: "", examples: "" }]);
  };

  const handleRemoveBulkCard = (index) => {
    if (bulkCards.length > 1) {
      const newCards = bulkCards.filter((_, i) => i !== index);
      setBulkCards(newCards);
      
      // Xóa form fields cho card đã xóa và reindex các field còn lại
      const formValues = bulkForm.getFieldsValue();
      const newFormValues = {};
      
      newCards.forEach((_, newIndex) => {
        const oldIndex = newIndex < index ? newIndex : newIndex + 1;
        newFormValues[`card_${newIndex}_term`] = formValues[`card_${oldIndex}_term`] || "";
        newFormValues[`card_${newIndex}_definition`] = formValues[`card_${oldIndex}_definition`] || "";
        newFormValues[`card_${newIndex}_pronunciation`] = formValues[`card_${oldIndex}_pronunciation`] || "";
        newFormValues[`card_${newIndex}_wordType`] = formValues[`card_${oldIndex}_wordType`] || "";
        newFormValues[`card_${newIndex}_notes`] = formValues[`card_${oldIndex}_notes`] || "";
        newFormValues[`card_${newIndex}_examples`] = formValues[`card_${oldIndex}_examples`] || "";
      });
      
      // Xóa các field của card đã xóa
      for (let i = bulkCards.length - 1; i >= 0; i--) {
        if (i >= newCards.length) {
          newFormValues[`card_${i}_term`] = undefined;
          newFormValues[`card_${i}_definition`] = undefined;
          newFormValues[`card_${i}_pronunciation`] = undefined;
          newFormValues[`card_${i}_wordType`] = undefined;
          newFormValues[`card_${i}_notes`] = undefined;
          newFormValues[`card_${i}_examples`] = undefined;
        }
      }
      
      bulkForm.setFieldsValue(newFormValues);
    } else {
      message.warning("Phải có ít nhất một flashcard");
    }
  };

  const handleBulkCardChange = (index, field, value) => {
    const newCards = [...bulkCards];
    newCards[index][field] = value;
    setBulkCards(newCards);
    // Sync với form
    bulkForm.setFieldsValue({
      [`card_${index}_${field}`]: value,
    });
  };

  // Sync form values với bulkCards khi bulkCards thay đổi
  useEffect(() => {
    if (activeTab === "bulk") {
      const formValues = {};
      bulkCards.forEach((card, index) => {
        formValues[`card_${index}_term`] = card.term;
        formValues[`card_${index}_definition`] = card.definition;
        formValues[`card_${index}_pronunciation`] = card.pronunciation;
        formValues[`card_${index}_wordType`] = card.wordType;
        formValues[`card_${index}_notes`] = card.notes;
        formValues[`card_${index}_examples`] = card.examples;
      });
      bulkForm.setFieldsValue(formValues);
    }
  }, [bulkCards.length, activeTab]);

  const handleModalOk = () => {
    if (activeTab === "single") {
      Modal.confirm({
        title: "Xác nhận thêm thẻ flashcard",
        content: "Bạn có chắc chắn muốn thêm thẻ flashcard này vào bộ hiện tại?",
        okText: "Thêm thẻ",
        cancelText: "Hủy",
        onOk: () => handleSubmit(),
      });
    } else {
      Modal.confirm({
        title: "Xác nhận thêm nhiều thẻ flashcard",
        content: "Bạn có chắc chắn muốn thêm tất cả các thẻ hợp lệ trong danh sách vào bộ hiện tại?",
        okText: "Thêm các thẻ",
        cancelText: "Hủy",
        onOk: () => handleBulkSubmit(),
      });
    }
  };

  return (
    <Modal
      title="Thêm thẻ flashcard"
      open={open}
      onOk={handleModalOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={activeTab === "single" ? "Thêm" : `Thêm ${bulkCards.filter(c => c.term && c.definition).length} thẻ`}
      cancelText="Hủy"
      width={activeTab === "single" ? 600 : 800}
      style={{ top: 20 }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "single",
            label: "Thêm một",
          },
          {
            key: "bulk",
            label: "Thêm nhiều",
          },
        ]}
      />
      
      {activeTab === "single" && (
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
        <Form.Item
          name="term"
          label="Từ vựng / Thuật ngữ"
          required
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
          required
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

        <Form.Item
          name="examples"
          label="Ví dụ (mỗi dòng một câu, tùy chọn)"
          tooltip="Nhập 1–3 câu ví dụ cho từ này. Mỗi câu một dòng."
          validateTrigger={['onBlur']}
        >
          <Input.TextArea
            rows={3}
            placeholder={"Ví dụ:\nShe accomplished her goal of running a marathon.\nWe accomplished the task on time."}
            maxLength={1000}
            showCount
            onFocus={() => {
              form.validateFields(['term', 'definition']).catch(() => {});
            }}
          />
        </Form.Item>
      </Form>
      )}

      {activeTab === "bulk" && (
        <Form
          form={bulkForm}
          layout="vertical"
          style={{ marginTop: 16, maxHeight: "60vh", overflowY: "auto" }}
        >
          {bulkCards.map((card, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
                backgroundColor: "#fafafa",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h4 style={{ margin: 0 }}>Flashcard {index + 1}</h4>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: "Xác nhận xóa thẻ khỏi danh sách tạo mới",
                      content:
                        "Bạn có chắc chắn muốn xóa thẻ này khỏi danh sách? Thao tác này chỉ ảnh hưởng tới form hiện tại và không thể hoàn tác.",
                      okText: "Xóa",
                      okType: "danger",
                      cancelText: "Hủy",
                      onOk: () => handleRemoveBulkCard(index),
                    });
                  }}
                  disabled={bulkCards.length === 1}
                >
                  Xóa
                </Button>
              </div>

              <Form.Item
                name={`card_${index}_term`}
                label="Từ vựng / Thuật ngữ"
                required
                initialValue={card.term}
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
                style={{ marginBottom: 12 }}
              >
                <Input
                  placeholder="Nhập từ vựng hoặc thuật ngữ"
                  onChange={(e) => {
                    handleBulkCardChange(index, "term", e.target.value);
                    // Xóa lỗi khi đang sửa (nếu có)
                    const errors = bulkForm.getFieldsError([`card_${index}_term`]);
                    if (errors[0]?.errors?.length > 0) {
                      bulkForm.setFields([{ name: `card_${index}_term`, errors: [] }]);
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                name={`card_${index}_definition`}
                label="Định nghĩa / Nghĩa"
                required
                initialValue={card.definition}
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
                style={{ marginBottom: 12 }}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Nhập định nghĩa hoặc nghĩa của từ"
                  maxLength={1000}
                  showCount
                  onChange={(e) => {
                    handleBulkCardChange(index, "definition", e.target.value);
                    // Xóa lỗi khi đang sửa (nếu có)
                    const errors = bulkForm.getFieldsError([`card_${index}_definition`]);
                    if (errors[0]?.errors?.length > 0) {
                      bulkForm.setFields([{ name: `card_${index}_definition`, errors: [] }]);
                    }
                  }}
                  onFocus={() => {
                    // Validate trường trước đó khi focus vào trường này
                    bulkForm.validateFields([`card_${index}_term`]).catch(() => {});
                  }}
                />
              </Form.Item>

              <Form.Item
                name={`card_${index}_pronunciation`}
                label="Phiên âm (tùy chọn)"
                initialValue={card.pronunciation}
                validateTrigger={['onBlur']}
                rules={[
                  { max: 255, message: "Phiên âm tối đa 255 ký tự" },
                ]}
                style={{ marginBottom: 12 }}
              >
                <Input
                  placeholder="Ví dụ: /əˈkʌmplɪʃ/"
                  maxLength={255}
                  onChange={(e) => {
                    handleBulkCardChange(index, "pronunciation", e.target.value);
                    // Xóa lỗi khi đang sửa (nếu có)
                    const errors = bulkForm.getFieldsError([`card_${index}_pronunciation`]);
                    if (errors[0]?.errors?.length > 0) {
                      bulkForm.setFields([{ name: `card_${index}_pronunciation`, errors: [] }]);
                    }
                  }}
                  onFocus={() => {
                    // Validate các trường trước đó khi focus vào trường này
                    bulkForm.validateFields([`card_${index}_term`, `card_${index}_definition`]).catch(() => {});
                  }}
                />
              </Form.Item>

              <Form.Item
                name={`card_${index}_wordType`}
                label="Loại từ (tùy chọn)"
                initialValue={card.wordType}
                validateTrigger={['onBlur']}
                rules={[
                  { max: 50, message: "Loại từ tối đa 50 ký tự" },
                ]}
                style={{ marginBottom: 12 }}
              >
                <Input
                  placeholder="Ví dụ: N (Noun), V (Verb), ADJ (Adjective)"
                  maxLength={50}
                  onChange={(e) => {
                    handleBulkCardChange(index, "wordType", e.target.value);
                    // Xóa lỗi khi đang sửa (nếu có)
                    const errors = bulkForm.getFieldsError([`card_${index}_wordType`]);
                    if (errors[0]?.errors?.length > 0) {
                      bulkForm.setFields([{ name: `card_${index}_wordType`, errors: [] }]);
                    }
                  }}
                  onFocus={() => {
                    // Validate các trường trước đó khi focus vào trường này
                    bulkForm.validateFields([`card_${index}_term`, `card_${index}_definition`]).catch(() => {});
                  }}
                />
              </Form.Item>

              <Form.Item
                name={`card_${index}_notes`}
                label="Ghi chú (tùy chọn)"
                initialValue={card.notes}
                validateTrigger={['onBlur']}
                style={{ marginBottom: 12 }}
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Nhập ghi chú bổ sung"
                  maxLength={500}
                  showCount
                  onChange={(e) => {
                    handleBulkCardChange(index, "notes", e.target.value);
                    // Xóa lỗi khi đang sửa (nếu có)
                    const errors = bulkForm.getFieldsError([`card_${index}_notes`]);
                    if (errors[0]?.errors?.length > 0) {
                      bulkForm.setFields([{ name: `card_${index}_notes`, errors: [] }]);
                    }
                  }}
                  onFocus={() => {
                    // Validate các trường trước đó khi focus vào trường này
                    bulkForm.validateFields([`card_${index}_term`, `card_${index}_definition`]).catch(() => {});
                  }}
                />
              </Form.Item>

              <Form.Item
                name={`card_${index}_examples`}
                label="Ví dụ (mỗi dòng một câu, tùy chọn)"
                tooltip="Nhập 1–3 câu ví dụ cho từ này. Mỗi câu một dòng."
                initialValue={card.examples}
                validateTrigger={['onBlur']}
                style={{ marginBottom: 0 }}
              >
                <Input.TextArea
                  rows={3}
                  placeholder={"Ví dụ:\nShe accomplished her goal of running a marathon.\nWe accomplished the task on time."}
                  maxLength={1000}
                  showCount
                  onChange={(e) => {
                    handleBulkCardChange(index, "examples", e.target.value);
                  }}
                  onFocus={() => {
                    bulkForm.validateFields([`card_${index}_term`, `card_${index}_definition`]).catch(() => {});
                  }}
                />
              </Form.Item>
            </div>
          ))}

          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddBulkCard}
              block
            >
              Thêm flashcard
            </Button>
          </div>

          <div style={{ marginTop: 16, padding: 12, backgroundColor: "#e6f7ff", borderRadius: 4 }}>
            <strong>Số flashcard hợp lệ: {bulkCards.filter(c => c.term && c.definition).length} / {bulkCards.length}</strong>
          </div>
        </Form>
      )}
    </Modal>
  );
}

