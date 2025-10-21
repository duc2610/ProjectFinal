// Filename: SingleQuestionModal.jsx
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
import { UploadOutlined } from "@ant-design/icons";
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
    { value: 3, label: "Listening" },
    { value: 4, label: "Reading" },
    { value: 1, label: "Speaking" },
    { value: 2, label: "Writing" },
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

  const isImageVisible = useMemo(
    () => [8, 12].includes(Number(selectedPart)),
    [selectedPart]
  );
  const isImageRequired = isImageVisible;

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
    cur = cur.map((o, i) => ({ ...o, label: o.label || labels[i] }));
    if (cur.filter((x) => x.isCorrect).length !== 1) {
      cur = cur.map((x) => ({ ...x, isCorrect: false }));
    }
    form.setFieldsValue({ answerOptions: cur });
  };

  const requiredOptionsCount = useMemo(() => {
    if (!isOptionSkill) return undefined;
    return Number(selectedSkill) === 3 && Number(selectedPart) === 2 ? 3 : 4;
  }, [isOptionSkill, selectedSkill, selectedPart]);

  const handleToggleCorrect = (index, checked) => {
    const list = (form.getFieldValue("answerOptions") || []).map((o, i) => ({
      ...o,
      isCorrect: isOptionSkill ? (i === index ? checked : false) : false,
    }));
    form.setFieldsValue({ answerOptions: list });
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
        const opts = rawOpts.map((o, i) => ({
          id: o.optionId,
          label: o.label ?? labels[i] ?? "",
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
        throw {
          errorFields: [
            { name: ["image"], errors: ["Listening Part 1 bắt buộc Image"] },
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
        values.answerOptions = list;
      } else {
        values.answerOptions = [];
      }

      const fd = new FormData();
      fd.append("Content", (values.content ?? "").trim());
      fd.append("QuestionTypeId", String(typeNum));
      fd.append("PartId", String(partNum));
      fd.append("Number", String(Number(values.number || 1)));
      if (values.solution) fd.append("Solution", values.solution);

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
      title={isEdit ? "Edit Question" : "Add Question"}
      open={open}
      onCancel={onClose}
      onOk={onSubmit}
      confirmLoading={submitting}
      okText={isEdit ? "Update" : "Create"}
      destroyOnClose
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
                options={QUESTION_SKILLS}
                placeholder="Chọn Skill"
                allowClear
                onChange={async (skill) => {
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
              rules={[{ required: true, message: "Chọn Part" }]}
            >
              <Select
                placeholder="Chọn Part"
                options={parts?.map((p) => ({
                  value: toNum(p.partId ?? p.id ?? p),
                  label: p.name || p.partName || `Part ${p}`,
                }))}
                showSearch
                optionFilterProp="label"
                onChange={async (partId) => {
                  form.setFieldsValue({
                    partId: toNum(partId),
                    questionTypeId: undefined,
                  });
                  setQuestionTypes([]);
                  syncAnswerOptionsForPart(
                    Number(form.getFieldValue("skill")),
                    partId
                  );
                  try {
                    await form.validateFields([
                      "answerOptions",
                      "audio",
                      "image",
                    ]);
                  } catch {}
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
              label="Question Type"
              rules={[{ required: true, message: "Chọn Question Type" }]}
            >
              <Select
                placeholder="Chọn Type"
                options={questionTypes?.map((t) => ({
                  value: t.__val ?? toNum(t.questionTypeId ?? t.id ?? t),
                  label: t.typeName || t.name,
                }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="content"
          label="Content"
          rules={[
            { required: true, message: "Nhập nội dung câu hỏi" },
            { max: 1000, message: "Tối đa 1000 ký tự" },
          ]}
        >
          <Input.TextArea
            rows={4}
            showCount
            maxLength={1000}
            placeholder="Nhập nội dung..."
          />
        </Form.Item>

        <Row gutter={12}>
          {isAudioVisible && (
            <Col span={12}>
              <Form.Item
                name="audio"
                label={`Audio ${
                  isAudioRequired ? "(bắt buộc - MP3)" : "(tuỳ chọn - MP3)"
                }`}
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
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
                            new Error("Listening bắt buộc Audio (.mp3)")
                          );
                    },
                  }),
                  validateMp3("Chỉ chấp nhận tệp .mp3"),
                ]}
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
          )}

          {isImageVisible && (
            <Col span={12}>
              <Form.Item
                name="image"
                label={`Image ${isImageRequired ? "(bắt buộc)" : "(tuỳ chọn)"}`}
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
                rules={[
                  () => ({
                    validator(_, value) {
                      if (!isImageRequired) return Promise.resolve();
                      const hasNew =
                        Array.isArray(value) &&
                        value.length > 0 &&
                        !!value[0]?.originFileObj;
                      const hasOld = !!value?.[0]?.url;
                      return hasNew || hasOld
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Listening Part 1 bắt buộc Image")
                          );
                    },
                  }),
                ]}
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
          )}
        </Row>

        {(Number(selectedSkill) === 3 || Number(selectedSkill) === 4) && (
          <>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              Answer Options{" "}
              {requiredOptionsCount ? `(yêu cầu: ${requiredOptionsCount})` : ""}
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
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, ...restField }, idx) => (
                    <Row
                      key={key}
                      gutter={8}
                      align="middle"
                      style={{ marginBottom: 8 }}
                    >
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[restField.name, "label"]}
                          rules={[
                            { required: true, message: "Nhập label" },
                            { max: 3, message: "<= 3 ký tự" },
                          ]}
                        >
                          <Input placeholder="A" />
                        </Form.Item>
                      </Col>
                      <Col span={16}>
                        <Form.Item
                          {...restField}
                          name={[restField.name, "content"]}
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
                      <Col span={3}>
                        <Form.Item
                          valuePropName="checked"
                          name={[restField.name, "isCorrect"]}
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
                          type="link"
                          onClick={() => remove(restField.name)}
                          disabled={
                            requiredOptionsCount
                              ? fields.length <= requiredOptionsCount
                              : fields.length <= 1
                          }
                        >
                          X
                        </Button>
                      </Col>
                    </Row>
                  ))}
                  <Button
                    onClick={() =>
                      add({ label: "", content: "", isCorrect: false })
                    }
                    style={{ marginTop: 4 }}
                    disabled={
                      !!requiredOptionsCount &&
                      (answerOptions?.length || 0) >= requiredOptionsCount
                    }
                  >
                    + Thêm đáp án
                  </Button>
                </>
              )}
            </Form.List>
          </>
        )}

        <Form.Item name="solution" label="Solution (tuỳ chọn)">
          <Input.TextArea rows={3} placeholder="Giải thích / lời giải" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
