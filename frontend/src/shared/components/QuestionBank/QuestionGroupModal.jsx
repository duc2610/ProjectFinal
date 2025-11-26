// Filename: QuestionGroupModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Select,
  Input,
  Upload,
  Row,
  Col,
  Checkbox,
  Space,
  message,
  Divider,
  Alert,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { getPartsBySkill } from "@services/partsService";
import { getQuestionTypesByPart } from "@services/questionTypesService";
import {
  createQuestionGroup,
  getQuestionGroupById,
  updateQuestionGroup,
} from "@services/questionGroupService";

const GROUP_PARTS = [3, 4, 6, 7];
const isGroupPart = (p) => GROUP_PARTS.includes(Number(p));

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

export default function QuestionGroupModal({
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

  const [audioSrc, setAudioSrc] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);

  const selectedSkill = Form.useWatch("skill", form);
  const selectedPart = Form.useWatch("partId", form);
  const audioList = Form.useWatch("audio", form);
  const imageList = Form.useWatch("image", form);

  // Chỉ hiển thị các kỹ năng có Group Question
  // Listening (3) có Part 3, 4
  // Reading (4) có Part 6, 7
  const SKILLS = [
    { value: 3, label: "Nghe" },
    { value: 4, label: "Đọc" },
  ];

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

  // Part 3, 4: Listening - yêu cầu audio, có thể có image → hiển thị cả audio và image
  // Part 6, 7: Reading - không yêu cầu audio, không cần image → ẩn cả hai
  // Chỉ hiển thị audio và image cho các part yêu cầu cả hai (3, 4)
  const isAudioRequired = useMemo(
    () => [3, 4].includes(Number(selectedPart)),
    [selectedPart]
  );
  const isImageRequired = useMemo(
    () => false, // Image không bắt buộc cho group questions
    [selectedPart]
  );
  const showAudioField = useMemo(
    () => [3, 4].includes(Number(selectedPart)), // Part 3, 4 cần audio
    [selectedPart]
  );
  const showImageField = useMemo(
    () => [3, 4].includes(Number(selectedPart)), // Part 3, 4 có thể có image
    [selectedPart]
  );

  const requiredOptionsPerQuestion = 4;

  const loadParts = async (skillId) => {
    try {
      if (!skillId) {
        setParts([]);
        return;
      }
      const res = await getPartsBySkill(skillId);
      const all = res?.data || res || [];
      const filtered = all.filter((p) => isGroupPart(p.partId ?? p.id ?? p));
      setParts(filtered.length ? filtered : all);
    } catch {
      setParts([]);
    }
  };

  const loadTypes = async (partId) => {
    try {
      if (!partId) {
        setQuestionTypes([]);
        return [];
      }
      const res = await getQuestionTypesByPart(partId);
      const arr = (res?.data || res || []).map((t) => ({
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

  const createEmptyQuestion = (groupPartId = undefined) => ({
    questionId: null,
    content: "",
    questionTypeId: undefined,
    partId: groupPartId ? toNum(groupPartId) : undefined,
    solution: "",
    answerOptions: [
      { optionId: null, label: "A", content: "", isCorrect: false },
      { optionId: null, label: "B", content: "", isCorrect: false },
      { optionId: null, label: "C", content: "", isCorrect: false },
      { optionId: null, label: "D", content: "", isCorrect: false },
    ],
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
      passageContent: "",
      audio: [],
      image: [],
      questions: [createEmptyQuestion(), createEmptyQuestion()],
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
        resetForCreate();
        return;
      }
      try {
        const detail = await getQuestionGroupById(Number(editingId));
        const g = detail?.data || detail || {};

        // --- Chuẩn hoá skillId: ưu tiên số, fallback từ tên hoặc partName ---
        let skillId =
          toNum(g.skillId) ??
          toNum(g.skill) ??
          skillNameToId(g.skill || g.skillName) ??
          inferSkillFromPartName(g.partName);

        await loadParts(skillId);
        const types = await loadTypes(g.partId);

        // map files to Upload
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

        const audioFiles = toUploadFile(g.audioUrl || "", g.audioName);
        const imageFiles = toUploadFile(g.imageUrl || "", g.imageName);
        if (audioFiles.length) setAudioSrc(audioFiles[0].url);
        if (imageFiles.length) setImageSrc(imageFiles[0].url);

        // map questions
        const mappedQs = (g.questions || []).map((q) => ({
          questionId: q.questionId ?? null,
          content: q.content ?? "",
          questionTypeId: toNum(q.questionTypeId),
          partId: toNum(q.partId ?? g.partId),
          solution: q.solution ?? "",
          answerOptions: (q.options || []).map((op, i) => ({
            optionId: op.optionId ?? null,
            label: op.label ?? ["A", "B", "C", "D"][i] ?? "",
            content: op.content ?? "",
            isCorrect: !!op.isCorrect,
          })),
        }));

        const groupPartId = toNum(g.partId);
        form.setFieldsValue({
          skill: toNum(skillId),
          partId: groupPartId,
          passageContent: g.passageContent ?? "",
          audio: audioFiles,
          image: imageFiles,
          questions: mappedQs.length
            ? mappedQs
            : [createEmptyQuestion(groupPartId), createEmptyQuestion(groupPartId)],
        });

        // set default questionTypeId cho câu con nếu thiếu
        if (types?.length) {
          const firstType = toNum(types[0]?.__val);
          if (firstType != null) {
            const cur = form.getFieldValue("questions") || [];
            form.setFieldsValue({
              questions: cur.map((qq) => ({
                ...qq,
                questionTypeId: qq.questionTypeId ?? firstType,
                partId: qq.partId ?? toNum(g.partId),
              })),
            });
          }
        }
      } catch (e) {
        message.error("Không tải được chi tiết nhóm câu hỏi");
        onClose?.();
        console.error(e);
      }
    };

    run();
  }, [open, editingId]);

  const onChangeSkill = async (skill) => {
    const keepAudio = form.getFieldValue("audio");
    const keepImage = form.getFieldValue("image");

    form.setFieldsValue({
      skill,
      partId: undefined,
      passageContent: form.getFieldValue("passageContent"),
      audio: keepAudio,
      image: keepImage,
      questions: [createEmptyQuestion(), createEmptyQuestion()],
    });
    setQuestionTypes([]);
    await loadParts(skill);
  };

  const onChangePart = async (partId) => {
    setQuestionTypes([]);
    const types = await loadTypes(partId);
    const firstType = toNum(types?.[0]?.__val);
    const cur = form.getFieldValue("questions") || [];
    const partIdNum = toNum(partId);
    
    // Xóa audio/image nếu part mới không cần
    const partNum = Number(partId);
    const needsAudio = [3, 4].includes(partNum);
    const needsImage = [3, 4].includes(partNum);
    
    const updates = {
      questions: cur.map((q) => ({
        ...q,
        partId: partIdNum, // Luôn set partId từ nhóm
        questionTypeId: q.questionTypeId ?? firstType,
      })),
    };
    
    // Xóa audio nếu part mới không cần
    if (!needsAudio) {
      updates.audio = [];
      setAudioSrc(null);
    }
    
    // Xóa image nếu part mới không cần
    if (!needsImage) {
      updates.image = [];
      setImageSrc(null);
    }
    
    form.setFieldsValue(updates);
    
    // Xóa lỗi của audio và image khi Part thay đổi (không validate ngay)
    form.setFields([
      { name: "audio", errors: [] },
      { name: "image", errors: [] },
    ]);
  };

  // Tự động sync partId của các câu hỏi con khi partId của nhóm thay đổi
  useEffect(() => {
    if (!selectedPart) return;
    
    const questions = form.getFieldValue("questions") || [];
    const partIdNum = toNum(selectedPart);
    
    // Chỉ update nếu có câu hỏi nào chưa có partId hoặc partId khác với nhóm
    const needsUpdate = questions.some(q => {
      const qPartId = toNum(q?.partId);
      return qPartId !== partIdNum;
    });
    
    if (needsUpdate && questions.length > 0) {
      form.setFieldsValue({
        questions: questions.map((q) => ({
          ...q,
          partId: partIdNum, // Luôn sync với partId của nhóm
        })),
      });
    }
  }, [selectedPart]);
  // Chọn đáp án đúng (radio behavior)
  const handleToggleCorrect = (qIndex, optIndex, checked) => {
    const list = form.getFieldValue("questions") || [];
    const question = list[qIndex] || {};
    const opts = (question.answerOptions || []).map((o, i) => ({
      ...o,
      isCorrect: i === optIndex ? checked : false,
    }));
    list[qIndex] = { ...question, answerOptions: opts };
    form.setFieldsValue({ questions: list });
  };
  // validations
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

  const validateGroupAudio = () => ({
    validator(_, value) {
      if (!isAudioRequired || !showAudioField) return Promise.resolve();
      const hasNew =
        Array.isArray(value) && value.length > 0 && !!value[0]?.originFileObj;
      const hasOld = !!value?.[0]?.url;
      return hasNew || hasOld
        ? Promise.resolve()
        : Promise.reject(new Error("Part 3/4 bắt buộc có Audio (.mp3)"));
    },
  });

  const validateQuestions = async (_, list) => {
    const arr = list || [];
    if (arr.length < 2) throw new Error("Tối thiểu 2 câu hỏi");
    if (arr.length > 5) throw new Error("Tối đa 5 câu hỏi");
    for (let i = 0; i < arr.length; i++) {
      const q = arr[i];
      const opts = q?.answerOptions || [];
      if (opts.length !== requiredOptionsPerQuestion)
        throw new Error(
          `Câu ${i + 1}: Phải có đúng ${requiredOptionsPerQuestion} đáp án`
        );
      const correctCount = opts.filter((o) => o?.isCorrect === true).length;
      if (correctCount !== 1)
        throw new Error(`Câu ${i + 1}: Phải chọn đúng 1 đáp án đúng`);
      for (let j = 0; j < opts.length; j++) {
        const op = opts[j];
        const labelTrimmed = String(op?.label || "").trim();
        const contentTrimmed = String(op?.content || "").trim();
        if (!labelTrimmed)
          throw new Error(
            `Câu ${i + 1} - Đáp án ${j + 1}: nhãn không được để trống hoặc chỉ có khoảng trắng`
          );
        if (!contentTrimmed)
          throw new Error(
            `Câu ${i + 1} - Đáp án ${op?.label || j + 1}: nội dung không được để trống hoặc chỉ có khoảng trắng`
          );
      }
      const questionContentTrimmed = String(q.content || "").trim();
      if (!questionContentTrimmed) 
        throw new Error(`Câu ${i + 1}: nội dung không được để trống hoặc chỉ có khoảng trắng`);
      if (!q.questionTypeId)
        throw new Error(`Câu ${i + 1}: chọn Question Type`);
    }
  };

  // submit handler
  const onSubmit = async () => {
    try {
      const v = await form.validateFields();

      // Chặn submit nếu part không thuộc group TOEIC
      if (!isGroupPart(v.partId)) {
        message.error(
          "Part này không phải dạng Group của TOEIC (chỉ Part 3, 4, 6, 7)."
        );
        return;
      }

      const audioFile = v.audio?.[0]?.originFileObj;
      const imageFile = v.image?.[0]?.originFileObj;

      const questionsPayload = (v.questions || []).map((q) => ({
        questionId: q.questionId ?? null,
        content: (q.content || "").trim(),
        questionTypeId: Number(q.questionTypeId),
        partId: Number(q.partId ?? v.partId),
        solution: (q.solution || "").trim(),
        answerOptions: (q.answerOptions || []).map((op) => ({
          optionId: op.optionId ?? null,
          content: (op.content || "").trim(),
          label: (op.label || "").trim(),
          isCorrect: !!op.isCorrect,
        })),
      }));

      const fd = new FormData();
      fd.append("PartId", String(Number(v.partId)));
      fd.append("PassageContent", (v.passageContent || "").trim());
      fd.append("QuestionsJson", JSON.stringify(questionsPayload));
      if (audioFile) fd.append("Audio", audioFile);
      if (imageFile) fd.append("Image", imageFile);

      setSubmitting(true);
      const res = isEdit
        ? await updateQuestionGroup(Number(editingId), fd)
        : await createQuestionGroup(fd);

      message.success(
        res?.message ||
          (isEdit ? "Cập nhật nhóm thành công" : "Tạo nhóm thành công")
      );
      onSaved?.();
      onClose?.();
    } catch (e) {
      const apiMessage =
        e?.response?.data?.message || e?.response?.data?.data || e?.message;
      if (apiMessage) message.error(String(apiMessage));
      const first = e?.errorFields?.[0]?.name;
      if (first) form.scrollToField(first, { block: "center" });
      console.error("Group submit error:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const partOptions = useMemo(() => {
    const current = toNum(selectedPart);
    const list = (parts || []).filter((p) =>
      isGroupPart(p.partId ?? p.id ?? p)
    );
    const mapped = list.map((p) => ({
      value: toNum(p.partId ?? p.id ?? p),
      label: p.name || p.partName || `Part ${p.partId ?? p.id ?? p}`,
    }));
    if (isEdit && current != null && !mapped.some((m) => m.value === current)) {
      mapped.unshift({
        value: current,
        label: `Part ${current} (không phải group TOEIC)`,
      });
    }
    return mapped;
  }, [parts, selectedPart, isEdit]);

  const showGroupWarning = useMemo(
    () => selectedPart != null && !isGroupPart(selectedPart),
    [selectedPart]
  );

  return (
    <Modal
      title={isEdit ? "Chỉnh sửa Nhóm câu hỏi" : "Thêm Nhóm câu hỏi"}
      open={open}
      onCancel={onClose}
      onOk={onSubmit}
      okText={isEdit ? "Cập nhật" : "Tạo mới"}
      cancelText="Hủy"
      confirmLoading={submitting}
      destroyOnClose
      width={1000}
      okButtonProps={{ disabled: showGroupWarning }}
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
                placeholder="Chọn kỹ năng"
                options={SKILLS}
                allowClear
                onChange={async (skill) => {
                  // Nếu chọn giá trị hợp lệ, xóa lỗi
                  if (skill) {
                    const errors = form.getFieldsError(['skill']);
                    if (errors[0]?.errors?.length > 0) {
                      form.setFields([{ name: 'skill', errors: [] }]);
                    }
                  }
                  await onChangeSkill(skill);
                }}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="partId"
              label="Part (Nhóm chỉ: 3, 4, 6, 7)"
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
                options={partOptions}
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
                  await onChangePart(partId);
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        {showGroupWarning && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message="Part này không thuộc dạng 'Group' của TOEIC. Vui lòng chọn Part 3, 4, 6 hoặc 7."
          />
        )}

        <Form.Item
          name="passageContent"
          label="Nội dung đoạn văn / Passage"
          validateTrigger={['onBlur']}
          rules={[
            {
              validator: (_, value) => {
                if (!value || !value.trim()) {
                  return Promise.reject(new Error("Vui lòng nhập nội dung đoạn văn"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input.TextArea 
            rows={4} 
            placeholder="Nhập nội dung đoạn văn..."
            onChange={() => {
              // Xóa lỗi khi đang sửa (nếu có)
              const errors = form.getFieldsError(['passageContent']);
              if (errors[0]?.errors?.length > 0) {
                form.setFields([{ name: 'passageContent', errors: [] }]);
              }
            }}
            onFocus={() => {
              // Validate các trường trước đó khi focus vào trường này
              form.validateFields(['skill', 'partId']).catch(() => {});
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

        {(showAudioField || showImageField) && (
          <Row gutter={12}>
            {showAudioField && (
              <Col span={showImageField ? 12 : 24}>
                <Form.Item
                  name="audio"
                  label={`Audio nhóm ${
                    isAudioRequired ? "(bắt buộc - MP3)" : "(tùy chọn - MP3)"
                  }`}
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                  validateTrigger={['onBlur']}
                  rules={[validateGroupAudio(), validateMp3("Chỉ chấp nhận file .mp3")]}
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
                        form.validateFields(['skill', 'partId', 'passageContent']).catch(() => {});
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

            {showImageField && (
              <Col span={showAudioField ? 12 : 24}>
                <Form.Item
                  name="image"
                  label={`Ảnh nhóm ${
                    isImageRequired ? "(bắt buộc)" : "(tùy chọn)"
                  }`}
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
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
                        form.validateFields(['skill', 'partId', 'passageContent']).catch(() => {});
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
        )}

        <Divider style={{ margin: "12px 0" }} />
        <Form.List name="questions" rules={[{ validator: validateQuestions }]}>
          {(fields, { add, remove }) => (
            <>
              <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: 8 }}
              >
                <Col>
                  <strong>Câu hỏi trong nhóm (2–5 câu)</strong>
                </Col>
                <Col>
                  <Button
                    onClick={() => {
                      const groupPartId = form.getFieldValue("partId");
                      const currentQuestions = form.getFieldValue("questions") || [];
                      const firstType = questionTypes?.[0]?.__val 
                        ? toNum(questionTypes[0].__val) 
                        : undefined;
                      
                      add({
                        questionId: null,
                        content: "",
                        questionTypeId: firstType,
                        partId: groupPartId ? toNum(groupPartId) : undefined,
                        solution: "",
                        answerOptions: [
                          {
                            optionId: null,
                            label: "A",
                            content: "",
                            isCorrect: false,
                          },
                          {
                            optionId: null,
                            label: "B",
                            content: "",
                            isCorrect: false,
                          },
                          {
                            optionId: null,
                            label: "C",
                            content: "",
                            isCorrect: false,
                          },
                          {
                            optionId: null,
                            label: "D",
                            content: "",
                            isCorrect: false,
                          },
                        ],
                      });
                    }}
                    icon={<PlusOutlined />}
                    disabled={fields.length >= 5}
                  >
                    Thêm câu hỏi
                  </Button>
                </Col>
              </Row>

              {fields.map(({ key, name, ...restField }, qIndex) => (
                <div
                  key={key}
                  style={{
                    background: "#fafafa",
                    border: "1px solid #eee",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <Row gutter={8} align="middle">
                    <Col flex="auto">
                      <Space align="center">
                        <div style={{ fontWeight: 600 }}>Câu {qIndex + 1}</div>
                      </Space>
                    </Col>
                    <Col>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        disabled={fields.length <= 2}
                      >
                        Xoá
                      </Button>
                    </Col>
                  </Row>

                  <Row gutter={12} style={{ marginTop: 8 }}>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "questionTypeId"]}
                        label="Loại câu hỏi"
                        validateTrigger={['onBlur', 'onChange']}
                        rules={[
                          { required: true, message: "Vui lòng chọn loại câu hỏi" },
                        ]}
                      >
                        <Select
                          placeholder="Chọn loại câu hỏi"
                          options={questionTypes?.map((t) => ({
                            value:
                              t.__val ?? toNum(t.questionTypeId ?? t.id ?? t),
                            label: t.typeName || t.name,
                          }))}
                          showSearch
                          optionFilterProp="label"
                          onChange={(value) => {
                            // Nếu chọn giá trị hợp lệ, xóa lỗi
                            if (value) {
                              const fieldName = ['questions', name, 'questionTypeId'];
                              const errors = form.getFieldsError(fieldName);
                              if (errors[0]?.errors?.length > 0) {
                                form.setFields([{ name: fieldName, errors: [] }]);
                              }
                            }
                          }}
                          onFocus={() => {
                            // Validate các trường trước đó khi focus vào trường này
                            form.validateFields(['skill', 'partId', 'passageContent']).catch(() => {});
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
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "partId"]}
                        label="Part (của câu)"
                        initialValue={selectedPart}
                      >
                        <Select
                          disabled
                          value={selectedPart}
                          options={(parts || [])
                            .filter((p) => isGroupPart(p.partId ?? p.id ?? p))
                            .map((p) => ({
                              value: toNum(p.partId ?? p.id ?? p),
                              label:
                                p.name ||
                                p.partName ||
                                `Part ${p.partId ?? p.id ?? p}`,
                            }))}
                          showSearch
                          optionFilterProp="label"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    {...restField}
                    name={[name, "content"]}
                    label="Nội dung câu hỏi"
                    validateTrigger={['onBlur']}
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || !String(value).trim()) {
                            return Promise.reject(new Error("Vui lòng nhập nội dung câu hỏi"));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input.TextArea 
                      rows={3}
                      onChange={() => {
                        // Xóa lỗi khi đang sửa (nếu có)
                        const fieldName = ['questions', name, 'content'];
                        const errors = form.getFieldsError(fieldName);
                        if (errors[0]?.errors?.length > 0) {
                          form.setFields([{ name: fieldName, errors: [] }]);
                        }
                      }}
                      onFocus={() => {
                        // Validate các trường trước đó khi focus vào trường này
                        form.validateFields(['skill', 'partId', 'passageContent']).catch(() => {});
                        // Validate audio nếu bắt buộc
                        if (isAudioRequired) {
                          form.validateFields(['audio']).catch(() => {});
                        }
                        // Validate image nếu bắt buộc
                        if (isImageRequired) {
                          form.validateFields(['image']).catch(() => {});
                        }
                        // Validate questionTypeId của câu hỏi này
                        const fieldName = ['questions', name, 'questionTypeId'];
                        form.validateFields([fieldName]).catch(() => {});
                      }}
                    />
                  </Form.Item>

                  <Form.List name={[name, "answerOptions"]}>
                    {(optFields) => (
                      <>
                        {optFields.map(
                          ({ key: k2, name: n2, ...rest2 }, idx) => (
                            <div
                              key={k2}
                              style={{
                                marginBottom: 8,
                                padding: 10,
                                background: "#fafafa",
                                border: "1px solid #e8e8e8",
                                borderRadius: 6,
                              }}
                            >
                              <Row gutter={12} align="middle">
                                <Col span={3}>
                                  <Form.Item
                                    {...rest2}
                                    name={[n2, "label"]}
                                    validateTrigger={['onBlur']}
                                    style={{ marginBottom: 0 }}
                                    rules={[
                                      {
                                        validator: (_, value) => {
                                          if (!value || !String(value).trim()) {
                                            return Promise.reject(new Error("Vui lòng nhập nhãn"));
                                          }
                                          if (String(value).length > 3) {
                                            return Promise.reject(new Error("Tối đa 3 ký tự"));
                                          }
                                          return Promise.resolve();
                                        },
                                      },
                                    ]}
                                  >
                                    <Input
                                      placeholder={
                                        ["A", "B", "C", "D", "E"][idx] || "A"
                                      }
                                      style={{
                                        textAlign: "center",
                                        height: 32,
                                        fontWeight: 500,
                                      }}
                                      onChange={() => {
                                        // Xóa lỗi khi đang sửa (nếu có)
                                        const fieldName = ['questions', name, 'answerOptions', n2, 'label'];
                                        const errors = form.getFieldsError(fieldName);
                                        if (errors[0]?.errors?.length > 0) {
                                          form.setFields([{ name: fieldName, errors: [] }]);
                                        }
                                      }}
                                      onFocus={() => {
                                        // Validate các trường trước đó khi focus vào trường này
                                        form.validateFields(['skill', 'partId', 'passageContent']).catch(() => {});
                                        // Validate audio nếu bắt buộc
                                        if (isAudioRequired) {
                                          form.validateFields(['audio']).catch(() => {});
                                        }
                                        // Validate image nếu bắt buộc
                                        if (isImageRequired) {
                                          form.validateFields(['image']).catch(() => {});
                                        }
                                        // Validate questionTypeId và content của câu hỏi này
                                        const questionTypeField = ['questions', name, 'questionTypeId'];
                                        const questionContentField = ['questions', name, 'content'];
                                        form.validateFields([questionTypeField, questionContentField]).catch(() => {});
                                      }}
                                    />
                                  </Form.Item>
                                </Col>
                                <Col span={17}>
                                  <Form.Item
                                    {...rest2}
                                    name={[n2, "content"]}
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
                                      onChange={() => {
                                        // Xóa lỗi khi đang sửa (nếu có)
                                        const fieldName = ['questions', name, 'answerOptions', n2, 'content'];
                                        const errors = form.getFieldsError(fieldName);
                                        if (errors[0]?.errors?.length > 0) {
                                          form.setFields([{ name: fieldName, errors: [] }]);
                                        }
                                      }}
                                      onFocus={() => {
                                        // Validate các trường trước đó khi focus vào trường này
                                        form.validateFields(['skill', 'partId', 'passageContent']).catch(() => {});
                                        // Validate audio nếu bắt buộc
                                        if (isAudioRequired) {
                                          form.validateFields(['audio']).catch(() => {});
                                        }
                                        // Validate image nếu bắt buộc
                                        if (isImageRequired) {
                                          form.validateFields(['image']).catch(() => {});
                                        }
                                        // Validate questionTypeId và content của câu hỏi này
                                        const questionTypeField = ['questions', name, 'questionTypeId'];
                                        const questionContentField = ['questions', name, 'content'];
                                        form.validateFields([questionTypeField, questionContentField]).catch(() => {});
                                      }}
                                    />
                                  </Form.Item>
                                </Col>
                                <Col span={4}>
                                  <Form.Item
                                    valuePropName="checked"
                                    name={[n2, "isCorrect"]}
                                    style={{ marginBottom: 0 }}
                                  >
                                    <Checkbox
                                      onChange={(e) =>
                                        handleToggleCorrect(
                                          qIndex,
                                          idx,
                                          e.target.checked
                                        )
                                      }
                                    >
                                      Đúng
                                    </Checkbox>
                                  </Form.Item>
                                </Col>
                              </Row>
                            </div>
                          )
                        )}
                      </>
                    )}
                  </Form.List>

                  <Form.Item
                    {...restField}
                    name={[name, "solution"]}
                    label="Giải thích (tùy chọn)"
                  >
                    <Input.TextArea 
                      rows={2} 
                      placeholder="Nhập giải thích..."
                      onFocus={() => {
                        // Validate các trường trước đó khi focus vào trường này
                        form.validateFields(['skill', 'partId', 'passageContent']).catch(() => {});
                        // Validate audio nếu bắt buộc
                        if (isAudioRequired) {
                          form.validateFields(['audio']).catch(() => {});
                        }
                        // Validate image nếu bắt buộc
                        if (isImageRequired) {
                          form.validateFields(['image']).catch(() => {});
                        }
                        // Validate questionTypeId và content của câu hỏi này
                        const questionTypeField = ['questions', name, 'questionTypeId'];
                        const questionContentField = ['questions', name, 'content'];
                        form.validateFields([questionTypeField, questionContentField]).catch(() => {});
                      }}
                    />
                  </Form.Item>
                </div>
              ))}
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}
