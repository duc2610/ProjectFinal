import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Select,
  Input,
  Upload,
  Checkbox,
  Row,
  Col,
  message,
} from "antd";
import { UploadOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  createQuestion,
  getQuestionById,
  updateQuestion,
} from "@services/questionsService";
import { getPartsBySkill } from "@services/partsService";
import { getQuestionTypesByPart } from "@services/questionTypesService";

export default function SingleQuestionModal({
  open,
  editingId,
  onClose,
  onSaved,
}) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const [isEdit, setIsEdit] = useState(false);
  const [parts, setParts] = useState([]);
  const [questionTypes, setQuestionTypes] = useState([]);

  const selectedSkill = Form.useWatch("skill", form);
  const selectedPart = Form.useWatch("partId", form);
  const answerOptions = Form.useWatch("answerOptions", form);
  const audioList = Form.useWatch("audio", form);
  const imageList = Form.useWatch("image", form);

  const [audioSrc, setAudioSrc] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);

  const QUESTION_SKILLS = [
    { value: 3, label: "Nghe" },
    { value: 4, label: "Đọc" },
    { value: 1, label: "Nói" },
    { value: 2, label: "Viết" },
  ];

  const skillNameToId = (s) => {
    const t = String(s ?? "").toLowerCase();
    if (t.startsWith("l")) return 3;
    if (t.startsWith("r")) return 4;
    if (t.startsWith("s")) return 1;
    if (t.startsWith("w")) return 2;
    return undefined;
  };
  const inferSkillFromPartName = (partName) =>
    skillNameToId(String(partName ?? "").split("-")[0]);

  const toNum = (v) => {
    if (v === undefined || v === null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const toDataURL = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const isListening = useMemo(
    () => Number(selectedSkill) === 3,
    [selectedSkill]
  );

  const isAudioVisible = isListening;
  const isAudioRequired = isListening;

  // Các part cần ảnh theo chuẩn TOEIC:
  // ẢNH BẮT BUỘC:
  //   - partId = 1: L-Part 1 (Photographs)
  //   - partId = 8: W-Part 1 (Write a sentence based on a picture)
  //   - partId = 12: S-Part 2 (Describe a picture)
  // ẢNH TÙY CHỌN:
  //   - partId = 3: L-Part 3 (Conversations - một số câu có biểu đồ/bảng)
  //   - partId = 4: L-Part 4 (Talks - một số câu có biểu đồ/bảng)
  //   - partId = 7: R-Part 7 (Reading Comprehension - một số câu có hình ảnh)
  //   - partId = 14: S-Part 4 (Respond using information - bảng/lịch)
  const isImageVisible = useMemo(
    () => [1, 3, 4, 7, 8, 12, 14].includes(Number(selectedPart)),
    [selectedPart]
  );
  const isImageRequired = useMemo(
    () => [1, 8, 12].includes(Number(selectedPart)), // L-Part 1, W-Part 1, S-Part 2
    [selectedPart]
  );

  const isOptionSkill =
    Number(selectedSkill) === 3 || Number(selectedSkill) === 4;

  const loadPartsBySkill = async (skill) => {
    try {
      if (skill == null || skill === "") {
        setParts([]);
        return;
      }
      const payload = await getPartsBySkill(skill);
      setParts(payload?.data || payload || []);
    } catch {
      setParts([]);
    }
  };

  const loadTypesByPart = async (partId) => {
    try {
      if (partId == null) {
        setQuestionTypes([]);
        return [];
      }
      const payload = await getQuestionTypesByPart(partId);
      const arr = (payload?.data || payload || []).map((t) => ({
        ...t,
        __val: toNum(t.questionTypeId ?? t.id ?? t),
      }));
      setQuestionTypes(arr);
      return arr;
    } catch {
      setQuestionTypes([]);
      return [];
    }
  };

  useEffect(() => {
    (async () => {
      const f = Array.isArray(audioList) && audioList[0] ? audioList[0] : null;
      if (!f) return void setAudioSrc(null);
      if (f.url) return void setAudioSrc(f.url);
      if (f.originFileObj) setAudioSrc(await toDataURL(f.originFileObj));
    })().catch(() => setAudioSrc(null));
  }, [audioList]);

  useEffect(() => {
    (async () => {
      const f = Array.isArray(imageList) && imageList[0] ? imageList[0] : null;
      if (!f) return void setImageSrc(null);
      if (f.url) return void setImageSrc(f.url);
      if (f.originFileObj) setImageSrc(await toDataURL(f.originFileObj));
    })().catch(() => setImageSrc(null));
  }, [imageList]);

  const syncAnswerOptionsForPart = (skill, partId) => {
    if (!(skill === 3 || skill === 4)) {
      form.setFieldsValue({ answerOptions: [] });
      return;
    }
    const required = skill === 3 && Number(partId) === 2 ? 3 : 4;
    const labels = ["A", "B", "C", "D", "E"];
    let cur = form.getFieldValue("answerOptions") || [];
    cur = cur.slice(0, required);
    while (cur.length < required) {
      cur.push({ label: labels[cur.length], content: "", isCorrect: false });
    }
    // Luôn set label theo index (A, B, C, D hoặc A, B, C)
    cur = cur.map((o, i) => ({ ...o, label: labels[i] }));
    if (cur.filter((x) => x.isCorrect).length !== 1) {
      cur = cur.map((x) => ({ ...x, isCorrect: false }));
    }
    form.setFieldsValue({ answerOptions: cur });
  };

  const requiredOptionsCount = useMemo(() => {
    if (!isOptionSkill) return undefined;
    return Number(selectedSkill) === 3 && Number(selectedPart) === 2 ? 3 : 4;
  }, [isOptionSkill, selectedSkill, selectedPart]);

  // Tự động sync label cho answerOptions
  useEffect(() => {
    if (!isOptionSkill || !answerOptions || answerOptions.length === 0) return;
    if (requiredOptionsCount === undefined) return;
    
    const labels = requiredOptionsCount === 3 
      ? ["A", "B", "C"] 
      : ["A", "B", "C", "D"];
    
    const needsUpdate = answerOptions.some((opt, idx) => {
      return opt?.label !== labels[idx];
    });
    
    if (needsUpdate) {
      const updated = answerOptions.map((opt, idx) => ({
        ...opt,
        label: labels[idx] || "A",
      }));
      // Chỉ update nếu thực sự cần thiết để tránh vòng lặp
      const currentValues = form.getFieldValue("answerOptions") || [];
      const hasChanged = updated.some((opt, idx) => {
        return opt.label !== (currentValues[idx]?.label || labels[idx]);
      });
      if (hasChanged) {
        form.setFieldsValue({ answerOptions: updated });
      }
    }
  }, [answerOptions?.length, requiredOptionsCount, isOptionSkill, form]);

  const handleToggleCorrect = (index, checked) => {
    const list = (form.getFieldValue("answerOptions") || []).map((o, i) => ({
      ...o,
      isCorrect: isOptionSkill ? (i === index ? checked : false) : false,
    }));
    form.setFieldsValue({ answerOptions: list });
  };

  const handleMediaChange = (field) => (info) => {
    const fileList = info?.fileList || [];
    const latest = fileList.slice(-1);
    form.setFieldsValue({ [field]: latest });

    if (latest.length === 0) {
      if (field === "audio") setAudioSrc(null);
      if (field === "image") setImageSrc(null);
    }

    const errors = form.getFieldsError([field]);
    if (errors[0]?.errors?.length > 0) {
      form.setFields([{ name: field, errors: [] }]);
    }
  };

  const validateMp3 = (msg) => ({
    validator(_, value) {
      if (!Array.isArray(value) || value.length === 0) return Promise.resolve();
      const f = value[0]?.originFileObj;
      if (!f) return Promise.resolve();
      const okExt = /\.mp3$/i.test(f.name || "");
      const okMime =
        (f.type || "").includes("audio/mpeg") ||
        (f.type || "").includes("audio/mp3");
      return okExt || okMime
        ? Promise.resolve()
        : Promise.reject(new Error(msg));
    },
  });

  const resetForCreate = () => {
    form.resetFields();
    setAudioSrc(null);
    setImageSrc(null);
    setParts([]);
    setQuestionTypes([]);
    form.setFieldsValue({
      skill: undefined,
      partId: undefined,
      questionTypeId: undefined,
      content: "",
      solution: "",
      audio: [],
      image: [],
      answerOptions: [],
    });
  };

  useEffect(() => {
    if (!open) return;

    const isValidId =
      editingId !== null &&
      editingId !== undefined &&
      Number.isInteger(Number(editingId));

    setIsEdit(!!isValidId);

    const run = async () => {
      if (!isValidId) {
        // chế độ Add
        resetForCreate();
        return;
      }

      try {
        const detail = await getQuestionById(Number(editingId));
        const q = detail?.data || detail || {};

        let skill = q.skillId || skillNameToId(q.skill || q.skillName);
        if (!skill) skill = inferSkillFromPartName(q.partName);

        if (skill != null) await loadPartsBySkill(skill);
        const types = await loadTypesByPart(q.partId);

        const toUploadFile = (url, name) =>
          url
            ? [
                {
                  uid: url,
                  name: name || String(url).split("/").pop(),
                  status: "done",
                  url,
                },
              ]
            : [];
        const audioFiles = toUploadFile(q.audioUrl || "", q.audioName);
        const imageFiles = toUploadFile(q.imageUrl || "", q.imageName);
        if (audioFiles.length) setAudioSrc(audioFiles[0].url);
        if (imageFiles.length) setImageSrc(imageFiles[0].url);

        const labels = ["A", "B", "C", "D", "E"];
        const rawOpts = q.options ?? [];
        // Tự động set label theo index (A, B, C, D hoặc A, B, C)
        const opts = rawOpts.map((o, i) => ({
          id: o.optionId,
          label: labels[i] ?? "A", // Luôn dùng label theo index
          content: o.content ?? "",
          isCorrect: !!o.isCorrect,
        }));

        form.setFieldsValue({
          skill,
          partId: toNum(q.partId),
          questionTypeId: toNum(q.questionTypeId ?? types?.[0]?.__val),
          content: q.content ?? "",
          solution: q.solution ?? "",
          audio: audioFiles,
          image: imageFiles,
          answerOptions: opts,
        });

        if (skill === 3 || skill === 4) {
          syncAnswerOptionsForPart(skill, q.partId);
        } else {
          form.setFieldsValue({ answerOptions: [] });
        }
      } catch (e) {
        message.error("Không tải được chi tiết câu hỏi");
        onClose?.();
        console.error(e);
      }
    };

    run();
  }, [open, editingId]);

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();

      const partNum = Number(values.partId);
      const typeNum = Number(values.questionTypeId);
      if (!Number.isFinite(partNum))
        throw { errorFields: [{ name: ["partId"], errors: ["Chọn Part"] }] };
      if (!Number.isFinite(typeNum))
        throw {
          errorFields: [
            { name: ["questionTypeId"], errors: ["Chọn Question Type"] },
          ],
        };

      const audioFile = values.audio?.[0]?.originFileObj;
      const imageFile = values.image?.[0]?.originFileObj;
      const hasOldAudio = !!values.audio?.[0]?.url;
      const hasOldImage = !!values.image?.[0]?.url;

      if (isAudioRequired && !audioFile && !hasOldAudio) {
        throw {
          errorFields: [
            { name: ["audio"], errors: ["Listening bắt buộc Audio (.mp3)"] },
          ],
        };
      }
      if (isImageRequired && !imageFile && !hasOldImage) {
        const partNum = Number(values.partId);
        let errorMsg = "Bắt buộc phải có ảnh";
        if (partNum === 1) errorMsg = "L-Part 1 (Photographs) bắt buộc phải có ảnh";
        else if (partNum === 8) errorMsg = "W-Part 1 (Write sentence) bắt buộc phải có ảnh";
        else if (partNum === 12) errorMsg = "S-Part 2 (Describe picture) bắt buộc phải có ảnh";
        
        throw {
          errorFields: [
            { name: ["image"], errors: [errorMsg] },
          ],
        };
      }

      if (isOptionSkill) {
        const required =
          Number(values.skill) === 3 && Number(values.partId) === 2 ? 3 : 4;
        const list = (values.answerOptions || []).map((o) => ({
          ...o,
          label: (o.label || "").trim(),
          content: (o.content || "").trim(),
        }));
        if (list.length !== required)
          throw {
            errorFields: [
              {
                name: ["answerOptions"],
                errors: [`Số lượng đáp án phải là ${required}`],
              },
            ],
          };
        if (list.filter((x) => x.isCorrect).length !== 1)
          throw {
            errorFields: [
              {
                name: ["answerOptions"],
                errors: ["Phải chọn đúng 1 đáp án đúng"],
              },
            ],
          };
        // Kiểm tra không được chỉ có space sau khi trim
        for (let i = 0; i < list.length; i++) {
          const opt = list[i];
          if (!opt.label || !opt.label.trim()) {
            throw {
              errorFields: [
                {
                  name: ["answerOptions", i, "label"],
                  errors: ["Nhãn không được để trống hoặc chỉ có khoảng trắng"],
                },
              ],
            };
          }
          if (!opt.content || !opt.content.trim()) {
            throw {
              errorFields: [
                {
                  name: ["answerOptions", i, "content"],
                  errors: ["Nội dung đáp án không được để trống hoặc chỉ có khoảng trắng"],
                },
              ],
            };
          }
        }
        values.answerOptions = list;
      } else {
        values.answerOptions = [];
      }

      const fd = new FormData();
      fd.append("Content", (values.content ?? "").trim());
      fd.append("QuestionTypeId", String(typeNum));
      fd.append("PartId", String(partNum));
      fd.append("Number", String(Number(values.number || 1)));
      if (values.solution) fd.append("Solution", (values.solution || "").trim());

      if (audioFile) fd.append("Audio", audioFile);
      if (imageFile) fd.append("Image", imageFile);

      (values.answerOptions || []).forEach((opt, idx) => {
        if (opt.id != null)
          fd.append(`AnswerOptions[${idx}].Id`, String(opt.id));
        fd.append(`AnswerOptions[${idx}].Label`, opt.label);
        fd.append(`AnswerOptions[${idx}].Content`, opt.content);
        fd.append(
          `AnswerOptions[${idx}].IsCorrect`,
          opt.isCorrect ? "true" : "false"
        );
      });

      setSubmitting(true);
      const res = isEdit
        ? await updateQuestion(Number(editingId), fd)
        : await createQuestion(fd);
      message.success(
        res?.data ||
          res?.message ||
          (isEdit ? "Cập nhật thành công" : "Tạo câu hỏi thành công")
      );
      onSaved?.();
      onClose?.();
    } catch (e) {
      const apiMessage =
        e?.response?.data?.message || e?.response?.data?.data || e?.message;
      if (apiMessage) message.error(String(apiMessage));
      const first = e?.errorFields?.[0]?.name;
      if (first) form.scrollToField(first, { block: "center" });
      console.error("Question submit error:", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Chỉnh sửa Câu hỏi" : "Thêm Câu hỏi"}
      open={open}
      onCancel={onClose}
      onOk={onSubmit}
      confirmLoading={submitting}
      okText={isEdit ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy"
      destroyOnClose
    >
      <Form 
        form={form} 
        layout="vertical"
      >
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              name="skill"
              label="Kỹ năng"
              validateTrigger={['onBlur', 'onChange']}
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.reject(new Error("Vui lòng chọn kỹ năng"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select
                options={QUESTION_SKILLS}
                placeholder="Chọn kỹ năng"
                allowClear
                onChange={async (skill) => {
                  // Nếu chọn giá trị hợp lệ, xóa lỗi
                  if (skill) {
                    const errors = form.getFieldsError(['skill']);
                    if (errors[0]?.errors?.length > 0) {
                      form.setFields([{ name: 'skill', errors: [] }]);
                    }
                  }
                  const keepAudio = form.getFieldValue("audio");
                  const keepImage = form.getFieldValue("image");
                  form.setFieldsValue({
                    skill,
                    partId: undefined,
                    questionTypeId: undefined,
                    answerOptions: [],
                    audio: keepAudio,
                    image: keepImage,
                  });
                  setQuestionTypes([]);
                  if (skill != null) await loadPartsBySkill(skill);
                }}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="partId"
              label="Part"
              validateTrigger={['onBlur', 'onChange']}
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.reject(new Error("Vui lòng chọn Part"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select
                placeholder="Chọn Part"
                options={parts?.map((p) => ({
                  value: toNum(p.partId ?? p.id ?? p),
                  label: p.name || p.partName || `Part ${p}`,
                }))}
                showSearch
                optionFilterProp="label"
                onFocus={() => {
                  // Validate trường trước đó khi focus vào trường này
                  form.validateFields(['skill']).catch(() => {});
                }}
                onChange={async (partId) => {
                  // Nếu chọn giá trị hợp lệ, xóa lỗi
                  if (partId) {
                    const errors = form.getFieldsError(['partId']);
                    if (errors[0]?.errors?.length > 0) {
                      form.setFields([{ name: 'partId', errors: [] }]);
                    }
                  }
                  form.setFieldsValue({
                    partId: toNum(partId),
                    questionTypeId: undefined,
                  });
                  setQuestionTypes([]);
                  syncAnswerOptionsForPart(
                    Number(form.getFieldValue("skill")),
                    partId
                  );
                  form.setFields([
                    { name: "audio", errors: [] },
                    { name: "image", errors: [] },
                    { name: "answerOptions", errors: [] },
                  ]);
                  const types = await loadTypesByPart(partId);
                  const firstVal = toNum(types?.[0]?.__val);
                  if (firstVal !== undefined)
                    form.setFieldsValue({ questionTypeId: firstVal });
                }}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="questionTypeId"
              label="Loại câu hỏi"
              validateTrigger={['onBlur', 'onChange']}
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise.reject(new Error("Vui lòng chọn loại câu hỏi"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Select
                placeholder="Chọn loại câu hỏi"
                options={questionTypes?.map((t) => ({
                  value: t.__val ?? toNum(t.questionTypeId ?? t.id ?? t),
                  label: t.typeName || t.name,
                }))}
                showSearch
                optionFilterProp="label"
                onChange={(value) => {
                  // Nếu chọn giá trị hợp lệ, xóa lỗi
                  if (value) {
                    const errors = form.getFieldsError(['questionTypeId']);
                    if (errors[0]?.errors?.length > 0) {
                      form.setFields([{ name: 'questionTypeId', errors: [] }]);
                    }
                  }
                }}
                onFocus={() => {
                  // Validate các trường trước đó khi focus vào trường này
                  form.validateFields(['skill', 'partId']).catch(() => {});
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="content"
          label="Nội dung câu hỏi"
          validateTrigger={['onBlur']}
          rules={[
            {
              validator: (_, value) => {
                if (!value || !String(value).trim()) {
                  return Promise.reject(new Error("Vui lòng nhập nội dung câu hỏi"));
                }
                if (String(value).length > 1000) {
                  return Promise.reject(new Error("Tối đa 1000 ký tự"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            showCount
            maxLength={1000}
            placeholder="Nhập nội dung câu hỏi..."
            onChange={(e) => {
              // Xóa lỗi khi đang sửa (nếu có)
              const errors = form.getFieldsError(['content']);
              if (errors[0]?.errors?.length > 0) {
                form.setFields([{ name: 'content', errors: [] }]);
              }
            }}
            onFocus={(e) => {
              // Validate các trường trước đó khi focus vào trường này
              form.validateFields(['skill', 'partId', 'questionTypeId']).catch(() => {});
            }}
          />
        </Form.Item>

        <Row gutter={12}>
          {isAudioVisible && (
            <Col span={12}>
              <Form.Item
                name="audio"
                label={`Audio ${
                  isAudioRequired ? "(bắt buộc - MP3)" : "(tùy chọn - MP3)"
                }`}
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
                validateTrigger={['onBlur']}
                rules={[
                  () => ({
                    validator(_, value) {
                      if (!isAudioRequired) return Promise.resolve();
                      const hasNew =
                        Array.isArray(value) &&
                        value.length > 0 &&
                        !!value[0]?.originFileObj;
                      const hasOld = !!value?.[0]?.url;
                      return hasNew || hasOld
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Kỹ năng Nghe bắt buộc phải có Audio (.mp3)")
                          );
                    },
                  }),
                  validateMp3("Chỉ chấp nhận file .mp3"),
                ]}
              >
                <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  accept=".mp3,audio/mpeg,audio/mp3"
                  showUploadList={false}
                  onChange={handleMediaChange("audio")}
                  onRemove={() => {
                    form.setFieldsValue({ audio: [] });
                    return true;
                  }}
                >
                  <Button 
                    icon={<UploadOutlined />}
                    onClick={() => {
                      // Validate các trường trước đó khi click vào Upload audio
                      form.validateFields(['skill', 'partId', 'questionTypeId', 'content']).catch(() => {});
                    }}
                  >
                    Chọn file audio (.mp3)
                  </Button>
                </Upload>
                {audioSrc && (
                  <div style={{ marginTop: 8, position: "relative" }}>
                    <audio
                      controls
                      preload="none"
                      src={audioSrc}
                      style={{ width: "100%" }}
                    />
                    {audioList?.length ? (
                      <Button
                        danger
                        type="primary"
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => {
                          form.setFieldsValue({ audio: [] });
                          setAudioSrc(null);
                        }}
                        style={{
                          marginTop: 8,
                        }}
                      >
                        Xóa audio
                      </Button>
                    ) : null}
                  </div>
                )}
              </Form.Item>
            </Col>
          )}

          {isImageVisible && (
            <Col span={12}>
              <Form.Item
                name="image"
                label={`Ảnh ${isImageRequired ? "(bắt buộc)" : "(tùy chọn)"}`}
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
                validateTrigger={['onBlur']}
                rules={[
                  () => ({
                    validator(_, value) {
                      if (!isImageRequired) return Promise.resolve();
                      const hasNew =
                        Array.isArray(value) &&
                        value.length > 0 &&
                        !!value[0]?.originFileObj;
                      const hasOld = !!value?.[0]?.url;
                      
                      if (hasNew || hasOld) return Promise.resolve();
                      
                      const partNum = Number(form.getFieldValue("partId"));
                      let errorMsg = "Bắt buộc phải có ảnh";
                      if (partNum === 1) errorMsg = "Part 1 (Nghe - Hình ảnh) bắt buộc phải có ảnh";
                      else if (partNum === 8) errorMsg = "Part 1 (Viết - Viết câu dựa trên hình ảnh) bắt buộc phải có ảnh";
                      else if (partNum === 12) errorMsg = "Part 2 (Nói - Mô tả hình ảnh) bắt buộc phải có ảnh";
                      
                      return Promise.reject(new Error(errorMsg));
                    },
                  }),
                ]}
              >
                <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                  listType="picture"
                  showUploadList={false}
                  onChange={handleMediaChange("image")}
                  onRemove={() => {
                    form.setFieldsValue({ image: [] });
                    return true;
                  }}
                >
                  <Button 
                    icon={<UploadOutlined />}
                    onClick={() => {
                      // Validate các trường trước đó khi click vào Upload image
                      form.validateFields(['skill', 'partId', 'questionTypeId', 'content']).catch(() => {});
                      // Validate audio nếu bắt buộc
                      if (isAudioRequired) {
                        form.validateFields(['audio']).catch(() => {});
                      }
                    }}
                  >
                    Chọn ảnh
                  </Button>
                </Upload>
                {imageSrc && (
                  <div style={{ marginTop: 8, position: "relative" }}>
                    <img
                      src={imageSrc}
                      alt="preview"
                      style={{
                        maxWidth: "100%",
                        height: 140,
                        objectFit: "contain",
                        border: "1px solid #f0f0f0",
                        borderRadius: 6,
                        padding: 6,
                        background: "#fff",
                      }}
                    />
                    {imageList?.length ? (
                      <Button
                        danger
                        type="primary"
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => {
                          form.setFieldsValue({ image: [] });
                          setImageSrc(null);
                        }}
                        style={{
                          marginTop: 8,
                        }}
                      >
                        Xóa ảnh
                      </Button>
                    ) : null}
                  </div>
                )}
              </Form.Item>
            </Col>
          )}
        </Row>

        {(Number(selectedSkill) === 3 || Number(selectedSkill) === 4) && (
          <>
            <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>
              Đáp án{" "}
              {requiredOptionsCount ? `(yêu cầu: ${requiredOptionsCount} đáp án)` : ""}
            </div>
            <Form.List
              name="answerOptions"
              rules={[
                {
                  validator: async (_, list) => {
                    const skill = Number(form.getFieldValue("skill"));
                    if (!(skill === 3 || skill === 4)) return;
                    const required =
                      skill === 3 && Number(form.getFieldValue("partId")) === 2
                        ? 3
                        : 4;
                    const arr = list || [];
                    if (arr.length !== required)
                      throw new Error(`Số lượng đáp án phải là ${required}`);
                    const correctCount = arr.filter(
                      (x) => x?.isCorrect === true
                    ).length;
                    if (correctCount !== 1)
                      throw new Error("Phải chọn đúng 1 đáp án đúng");
                    // Kiểm tra trim cho label và content
                    for (let i = 0; i < arr.length; i++) {
                      const opt = arr[i];
                      const labelTrimmed = String(opt?.label || "").trim();
                      const contentTrimmed = String(opt?.content || "").trim();
                      if (!labelTrimmed) {
                        throw new Error(`Đáp án ${i + 1}: nhãn không được để trống hoặc chỉ có khoảng trắng`);
                      }
                      if (!contentTrimmed) {
                        throw new Error(`Đáp án ${opt?.label || i + 1}: nội dung không được để trống hoặc chỉ có khoảng trắng`);
                      }
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, ...restField }, idx) => (
                    <div
                      key={key}
                      style={{
                        marginBottom: 12,
                        padding: 12,
                        background: "#fafafa",
                        border: "1px solid #e8e8e8",
                        borderRadius: 8,
                      }}
                    >
                      <Row gutter={12} align="middle">
                        <Col span={3}>
                          <Form.Item
                            {...restField}
                            name={[restField.name, "label"]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input 
                              disabled 
                              readOnly
                              value={(() => {
                                const labels = requiredOptionsCount === 3 
                                  ? ["A", "B", "C"] 
                                  : ["A", "B", "C", "D"];
                                return labels[idx] || "A";
                              })()}
                              style={{ 
                                backgroundColor: "#1890ff",
                                color: "#fff",
                                cursor: "not-allowed",
                                fontWeight: "bold",
                                textAlign: "center",
                                border: "none",
                                height: 32,
                              }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={17}>
                          <Form.Item
                            {...restField}
                            name={[restField.name, "content"]}
                            validateTrigger={['onBlur']}
                            style={{ marginBottom: 0 }}
                            rules={[
                              {
                                validator: (_, value) => {
                                  if (!value || !String(value).trim()) {
                                    return Promise.reject(new Error("Vui lòng nhập nội dung đáp án"));
                                  }
                                  if (String(value).length > 500) {
                                    return Promise.reject(new Error("Tối đa 500 ký tự"));
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input 
                              placeholder="Nhập nội dung đáp án"
                              onChange={(e) => {
                                // Xóa lỗi khi đang sửa (nếu có)
                                const fieldName = ['answerOptions', restField.name, 'content'];
                                const errors = form.getFieldsError(fieldName);
                                if (errors[0]?.errors?.length > 0) {
                                  form.setFields([{ name: fieldName, errors: [] }]);
                                }
                              }}
                              onFocus={(e) => {
                                // Validate các trường trước đó khi focus vào trường này
                                form.validateFields(['skill', 'partId', 'questionTypeId', 'content']).catch(() => {});
                                // Validate audio nếu bắt buộc
                                if (isAudioRequired) {
                                  form.validateFields(['audio']).catch(() => {});
                                }
                                // Validate image nếu bắt buộc
                                if (isImageRequired) {
                                  form.validateFields(['image']).catch(() => {});
                                }
                              }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Form.Item
                            valuePropName="checked"
                            name={[restField.name, "isCorrect"]}
                            style={{ marginBottom: 0 }}
                          >
                            <Checkbox
                              onChange={(e) =>
                                handleToggleCorrect(idx, e.target.checked)
                              }
                            >
                              Đúng
                            </Checkbox>
                          </Form.Item>
                        </Col>
                        <Col span={1}>
                          <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => remove(restField.name)}
                            disabled={
                              requiredOptionsCount
                                ? fields.length <= requiredOptionsCount
                                : fields.length <= 1
                            }
                            style={{ 
                              padding: 0,
                              height: 32,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          />
                        </Col>
                      </Row>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => {
                      const labels = requiredOptionsCount === 3 
                        ? ["A", "B", "C"] 
                        : ["A", "B", "C", "D"];
                      const nextIndex = (answerOptions?.length || 0);
                      add({ 
                        label: labels[nextIndex] || "A", 
                        content: "", 
                        isCorrect: false 
                      });
                    }}
                    style={{ 
                      marginTop: 8,
                      width: "100%",
                      height: 40,
                      borderStyle: "dashed",
                      borderColor: "#d9d9d9"
                    }}
                    disabled={
                      !!requiredOptionsCount &&
                      (answerOptions?.length || 0) >= requiredOptionsCount
                    }
                    icon={<PlusOutlined />}
                  >
                    Thêm đáp án
                  </Button>
                </>
              )}
            </Form.List>
          </>
        )}

        <Form.Item name="solution" label="Giải thích (tùy chọn)">
          <Input.TextArea 
            rows={3} 
            placeholder="Nhập giải thích / lời giải..."
            onFocus={() => {
              // Validate các trường trước đó khi focus vào trường này
              form.validateFields(['skill', 'partId', 'questionTypeId', 'content']).catch(() => {});
              // Validate audio nếu bắt buộc
              if (isAudioRequired) {
                form.validateFields(['audio']).catch(() => {});
              }
              // Validate image nếu bắt buộc
              if (isImageRequired) {
                form.validateFields(['image']).catch(() => {});
              }
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
