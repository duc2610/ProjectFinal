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

  const SKILLS = [
    { value: 3, label: "Listening" },
    { value: 4, label: "Reading" },
    { value: 1, label: "Speaking" },
    { value: 2, label: "Writing" },
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

  const isAudioRequired = useMemo(
    () => [3, 4].includes(Number(selectedPart)),
    [selectedPart]
  );
  const isImageRequired = false;

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

  const createEmptyQuestion = () => ({
    questionId: null,
    content: "",
    questionTypeId: undefined,
    partId: undefined,
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

        form.setFieldsValue({
          skill: toNum(skillId),
          partId: toNum(g.partId),
          passageContent: g.passageContent ?? "",
          audio: audioFiles,
          image: imageFiles,
          questions: mappedQs.length
            ? mappedQs
            : [createEmptyQuestion(), createEmptyQuestion()],
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
    form.setFieldsValue({
      questions: cur.map((q) => ({
        ...q,
        partId: toNum(partId),
        questionTypeId: q.questionTypeId ?? firstType,
      })),
    });
    try {
      await form.validateFields(["audio", "image", ["questions"]]);
    } catch {}
  };
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

  const validateGroupAudio = () => ({
    validator(_, value) {
      if (!isAudioRequired) return Promise.resolve();
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
        if (!op?.label || !op?.content?.trim())
          throw new Error(
            `Câu ${i + 1} - Đáp án ${op?.label || j + 1}: thiếu nội dung`
          );
      }
      if (!q.content?.trim()) throw new Error(`Câu ${i + 1}: thiếu nội dung`);
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
        solution: q.solution || "",
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
      title={isEdit ? "Edit Question Group" : "Add Question Group"}
      open={open}
      onCancel={onClose}
      onOk={onSubmit}
      okText={isEdit ? "Update" : "Create"}
      confirmLoading={submitting}
      destroyOnClose
      width={1000}
      okButtonProps={{ disabled: showGroupWarning }}
    >
      <Form form={form} layout="vertical">
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              name="skill"
              label="Skill"
              rules={[{ required: true, message: "Chọn Skill" }]}
            >
              <Select
                placeholder="Chọn Skill"
                options={SKILLS}
                allowClear
                onChange={onChangeSkill}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="partId"
              label="Part (Group chỉ: 3, 4, 6, 7)"
              rules={[{ required: true, message: "Chọn Part" }]}
            >
              <Select
                placeholder="Chọn Part"
                options={partOptions}
                showSearch
                optionFilterProp="label"
                onChange={onChangePart}
              />
            </Form.Item>
          </Col>
        </Row>

        {showGroupWarning && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message="Part này không thuộc dạng ‘Group’ của TOEIC. Vui lòng chọn Part 3, 4, 6 hoặc 7."
          />
        )}

        <Form.Item
          name="passageContent"
          label="Passage / Content (nhóm)"
          rules={[
            { required: true, message: "Nhập nội dung nhóm (passage/content)" },
          ]}
        >
          <Input.TextArea rows={4} placeholder="Nhập nội dung..." />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="audio"
              label={`Group Audio ${
                isAudioRequired ? "(bắt buộc - MP3)" : "(tuỳ chọn - MP3)"
              }`}
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList}
              rules={[validateGroupAudio(), validateMp3("Chỉ chấp nhận .mp3")]}
            >
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                accept=".mp3,audio/mpeg,audio/mp3"
                showUploadList={{
                  showPreviewIcon: false,
                  showRemoveIcon: true,
                }}
                onRemove={() => {
                  form.setFieldsValue({ audio: [] });
                  return true;
                }}
              >
                <Button icon={<UploadOutlined />}>Chọn audio (.mp3)</Button>
              </Upload>
              {audioSrc && (
                <div style={{ marginTop: 8 }}>
                  <audio
                    controls
                    preload="none"
                    src={audioSrc}
                    style={{ width: "100%" }}
                  />
                </div>
              )}
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="image"
              label={`Group Image ${
                isImageRequired ? "(bắt buộc)" : "(tuỳ chọn)"
              }`}
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList}
            >
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                accept="image/*"
                listType="picture"
                showUploadList={{
                  showPreviewIcon: false,
                  showRemoveIcon: true,
                }}
                onRemove={() => {
                  form.setFieldsValue({ image: [] });
                  return true;
                }}
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>
              {imageSrc && (
                <div style={{ marginTop: 8 }}>
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
                </div>
              )}
            </Form.Item>
          </Col>
        </Row>

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
                  <strong>Questions in Group (2–5)</strong>
                </Col>
                <Col>
                  <Button
                    onClick={() =>
                      add({
                        questionId: null,
                        content: "",
                        questionTypeId: undefined,
                        partId: undefined,
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
                      })
                    }
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
                        label="Question Type"
                        rules={[
                          { required: true, message: "Chọn Question Type" },
                        ]}
                      >
                        <Select
                          placeholder="Chọn type"
                          options={questionTypes?.map((t) => ({
                            value:
                              t.__val ?? toNum(t.questionTypeId ?? t.id ?? t),
                            label: t.typeName || t.name,
                          }))}
                          showSearch
                          optionFilterProp="label"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "partId"]}
                        label="Part (của câu)"
                      >
                        <Select
                          placeholder="Theo group Part nếu bỏ trống"
                          allowClear
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
                    rules={[
                      { required: true, message: "Nhập nội dung câu hỏi" },
                    ]}
                  >
                    <Input.TextArea rows={3} />
                  </Form.Item>

                  <Form.List name={[name, "answerOptions"]}>
                    {(optFields) => (
                      <>
                        {optFields.map(
                          ({ key: k2, name: n2, ...rest2 }, idx) => (
                            <Row
                              key={k2}
                              gutter={8}
                              align="middle"
                              style={{ marginBottom: 6 }}
                            >
                              <Col span={4}>
                                <Form.Item
                                  {...rest2}
                                  name={[n2, "label"]}
                                  label={idx === 0 ? "Label" : ""}
                                  rules={[
                                    { required: true, message: "Nhập label" },
                                    { max: 3, message: "<= 3 ký tự" },
                                  ]}
                                >
                                  <Input
                                    placeholder={
                                      ["A", "B", "C", "D", "E"][idx] || "A"
                                    }
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={16}>
                                <Form.Item
                                  {...rest2}
                                  name={[n2, "content"]}
                                  label={idx === 0 ? "Đáp án" : ""}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Nhập nội dung đáp án",
                                    },
                                    { max: 500, message: "<= 500 ký tự" },
                                  ]}
                                >
                                  <Input placeholder="Nội dung đáp án" />
                                </Form.Item>
                              </Col>
                              <Col span={4}>
                                <Form.Item
                                  valuePropName="checked"
                                  name={[n2, "isCorrect"]}
                                  label={idx === 0 ? "Đúng?" : ""}
                                >
                                  <Checkbox
                                    onChange={(e) =>
                                      handleToggleCorrect(
                                        qIndex,
                                        idx,
                                        e.target.checked
                                      )
                                    }
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          )
                        )}
                      </>
                    )}
                  </Form.List>

                  <Form.Item
                    {...restField}
                    name={[name, "solution"]}
                    label="Solution (tuỳ chọn)"
                  >
                    <Input.TextArea rows={2} />
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
