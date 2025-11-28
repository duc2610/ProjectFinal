import React, { useState, useEffect } from "react";
import { Modal, Form, Input, message, Tabs, Button, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { createFlashcard, bulkCreateFlashcards } from "@services/flashcardService";

export default function AddFlashcardModal({ open, onClose, onSuccess, setId }) {
  const [form] = Form.useForm();
  const [bulkForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("single");
  const [bulkCards, setBulkCards] = useState([{ term: "", definition: "", pronunciation: "", notes: "", example1: "", example2: "" }]);

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
      console.error("Error creating flashcard:", error);
      const errorMsg = error?.response?.data?.message || "Không thể thêm thẻ flashcard";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    bulkForm.resetFields();
    setBulkCards([{ term: "", definition: "", pronunciation: "", notes: "", example1: "", example2: "" }]);
    setActiveTab("single");
    onClose?.();
  };

  const handleBulkSubmit = async () => {
    try {
      await bulkForm.validateFields();
      setLoading(true);
      
      // Lấy giá trị từ form
      const formValues = bulkForm.getFieldsValue();
      
      // Lọc các flashcard có đủ thông tin (term và definition bắt buộc)
      const validCards = bulkCards
        .map((card, index) => {
          const term = formValues[`card_${index}_term`]?.trim() || card.term?.trim() || "";
          const definition = formValues[`card_${index}_definition`]?.trim() || card.definition?.trim() || "";
          
          return {
            term,
            definition,
            pronunciation: formValues[`card_${index}_pronunciation`]?.trim() || card.pronunciation?.trim() || null,
            notes: formValues[`card_${index}_notes`]?.trim() || card.notes?.trim() || null,
            example1: formValues[`card_${index}_example1`]?.trim() || card.example1?.trim() || null,
            example2: formValues[`card_${index}_example2`]?.trim() || card.example2?.trim() || null,
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

      const result = await bulkCreateFlashcards(data);
      message.success(`Đã thêm ${validCards.length} thẻ flashcard thành công!`);
      bulkForm.resetFields();
      setBulkCards([{ term: "", definition: "", pronunciation: "", notes: "", example1: "", example2: "" }]);
      onSuccess?.(result);
      onClose?.();
    } catch (error) {
      console.error("Error creating bulk flashcards:", error);
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
    setBulkCards([...bulkCards, { term: "", definition: "", pronunciation: "", notes: "", example1: "", example2: "" }]);
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
        newFormValues[`card_${newIndex}_notes`] = formValues[`card_${oldIndex}_notes`] || "";
        newFormValues[`card_${newIndex}_example1`] = formValues[`card_${oldIndex}_example1`] || "";
        newFormValues[`card_${newIndex}_example2`] = formValues[`card_${oldIndex}_example2`] || "";
      });
      
      // Xóa các field của card đã xóa
      for (let i = bulkCards.length - 1; i >= 0; i--) {
        if (i >= newCards.length) {
          newFormValues[`card_${i}_term`] = undefined;
          newFormValues[`card_${i}_definition`] = undefined;
          newFormValues[`card_${i}_pronunciation`] = undefined;
          newFormValues[`card_${i}_notes`] = undefined;
          newFormValues[`card_${i}_example1`] = undefined;
          newFormValues[`card_${i}_example2`] = undefined;
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
        formValues[`card_${index}_notes`] = card.notes;
        formValues[`card_${index}_example1`] = card.example1;
        formValues[`card_${index}_example2`] = card.example2;
      });
      bulkForm.setFieldsValue(formValues);
    }
  }, [bulkCards.length, activeTab]);

  const handleModalOk = () => {
    if (activeTab === "single") {
      handleSubmit();
    } else {
      handleBulkSubmit();
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
          <div style={{ marginBottom: 16 }}>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddBulkCard}
              block
            >
              Thêm flashcard
            </Button>
          </div>

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
                  onClick={() => handleRemoveBulkCard(index)}
                  disabled={bulkCards.length === 1}
                >
                  Xóa
                </Button>
              </div>

              <Form.Item
                name={`card_${index}_term`}
                label="Từ vựng / Thuật ngữ"
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
                  rows={3}
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

              <Space direction="vertical" style={{ width: "100%" }} size="small">
                <Form.Item
                  name={`card_${index}_pronunciation`}
                  label="Phiên âm (tùy chọn)"
                  initialValue={card.pronunciation}
                  validateTrigger={['onBlur']}
                  rules={[
                    { max: 255, message: "Phiên âm tối đa 255 ký tự" },
                  ]}
                  style={{ marginBottom: 8 }}
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
                  name={`card_${index}_example1`}
                  label="Ví dụ 1 (tùy chọn)"
                  initialValue={card.example1}
                  validateTrigger={['onBlur']}
                  rules={[
                    { max: 500, message: "Ví dụ tối đa 500 ký tự" },
                  ]}
                  style={{ marginBottom: 8 }}
                >
                  <Input
                    placeholder="Ví dụ: She accomplished her goal."
                    maxLength={500}
                    onChange={(e) => {
                      handleBulkCardChange(index, "example1", e.target.value);
                      // Xóa lỗi khi đang sửa (nếu có)
                      const errors = bulkForm.getFieldsError([`card_${index}_example1`]);
                      if (errors[0]?.errors?.length > 0) {
                        bulkForm.setFields([{ name: `card_${index}_example1`, errors: [] }]);
                      }
                    }}
                    onFocus={() => {
                      // Validate các trường trước đó khi focus vào trường này
                      bulkForm.validateFields([`card_${index}_term`, `card_${index}_definition`]).catch(() => {});
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name={`card_${index}_example2`}
                  label="Ví dụ 2 (tùy chọn)"
                  initialValue={card.example2}
                  validateTrigger={['onBlur']}
                  rules={[
                    { max: 500, message: "Ví dụ tối đa 500 ký tự" },
                  ]}
                  style={{ marginBottom: 8 }}
                >
                  <Input
                    placeholder="Ví dụ: We accomplished the task on time."
                    maxLength={500}
                    onChange={(e) => {
                      handleBulkCardChange(index, "example2", e.target.value);
                      // Xóa lỗi khi đang sửa (nếu có)
                      const errors = bulkForm.getFieldsError([`card_${index}_example2`]);
                      if (errors[0]?.errors?.length > 0) {
                        bulkForm.setFields([{ name: `card_${index}_example2`, errors: [] }]);
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
                  style={{ marginBottom: 0 }}
                >
                  <Input.TextArea
                    rows={2}
                    placeholder="Ví dụ: Verb - Common in business"
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
              </Space>
            </div>
          ))}

          <div style={{ marginTop: 16, padding: 12, backgroundColor: "#e6f7ff", borderRadius: 4 }}>
            <strong>Số flashcard hợp lệ: {bulkCards.filter(c => c.term && c.definition).length} / {bulkCards.length}</strong>
          </div>
        </Form>
      )}
    </Modal>
  );
}

