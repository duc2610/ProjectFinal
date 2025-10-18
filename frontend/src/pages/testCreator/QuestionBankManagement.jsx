import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Table,
  Popconfirm,
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  Upload,
  Checkbox,
  Row,
  Col,
  message,
  Tag,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  getQuestions,
  deleteQuestion,
  createQuestion,
  getQuestionById,
  updateQuestion,
} from "@services/questionsService";
import { getPartsBySkill } from "@services/partsService";
import { getQuestionTypesByPart } from "@services/questionTypesService";

/* ====== constants/helpers ====== */
const TEST_SKILLS = [
  { value: 0, label: "L&R" },
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

const normalizeStatus = (raw) => {
  const n = Number(raw);
  if (Number.isFinite(n)) {
    if (n === 1) return { isActive: true, text: "Active", color: "green" };
    if (n === 0) return { isActive: false, text: "Draft", color: "gold" };
    return { isActive: false, text: "Inactive", color: "red" };
  }
  const s = String(raw ?? "").toLowerCase();
  if (s === "active") return { isActive: true, text: "Active", color: "green" };
  if (s === "draft") return { isActive: false, text: "Draft", color: "gold" };
  return { isActive: false, text: "Inactive", color: "red" };
};

/* ====== component ====== */
export default function QuestionBankManagement() {
  // list state
  const [listLoading, setListLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // modal/form
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // selects
  const [parts, setParts] = useState([]);
  const [questionTypes, setQuestionTypes] = useState([]);

  // watch
  const selectedSkill = Form.useWatch("skill", form);
  const selectedPart = Form.useWatch("partId", form);
  const answerOptions = Form.useWatch("answerOptions", form);
  const audioList = Form.useWatch("audio", form);
  const imageList = Form.useWatch("image", form);

  const isLR = Number(selectedSkill) === 0;

  // previews
  const [audioSrc, setAudioSrc] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);

  /* ====== previews ====== */
  useEffect(() => {
    (async () => {
      const f = Array.isArray(audioList) && audioList[0] ? audioList[0] : null;
      if (!f) return void setAudioSrc(null);
      if (f.url) return void setAudioSrc(f.url);
      if (f.originFileObj) {
        try {
          setAudioSrc(await toDataURL(f.originFileObj));
        } catch {
          setAudioSrc(null);
        }
      }
    })();
  }, [audioList]);

  useEffect(() => {
    (async () => {
      const f = Array.isArray(imageList) && imageList[0] ? imageList[0] : null;
      if (!f) return void setImageSrc(null);
      if (f.url) return void setImageSrc(f.url);
      if (f.originFileObj) {
        try {
          setImageSrc(await toDataURL(f.originFileObj));
        } catch {
          setImageSrc(null);
        }
      }
    })();
  }, [imageList]);

  /* ====== loaders ====== */
  const loadList = async (page = 1, pageSize = 10) => {
    try {
      setListLoading(true);
      const res = await getQuestions({ page, pageSize });
      const data = res?.data || res;
      const raw =
        data?.items || data?.data || data?.dataPaginated || data?.records || [];
      const items = raw.map((r) => {
        const st = normalizeStatus(r.status ?? r.isActive ?? r.active);
        return {
          ...r,
          isActive: st.isActive,
          statusText: st.text,
          statusColor: st.color,
        };
      });
      const total =
        data?.total || data?.totalCount || data?.totalItems || items.length;
      setDataSource(items);
      setPagination({ current: page, pageSize, total });
    } catch {
      message.error("Không tải được danh sách câu hỏi");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadList(1, 10);
  }, []);

  const loadPartsBySkill = async (skill) => {
    try {
      if (skill === undefined || skill === null || skill === "") {
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
      if (!partId && partId !== 0) {
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

  const inferSkillFromPart = async (partId) => {
    for (const s of [0, 1, 2]) {
      try {
        const payload = await getPartsBySkill(s);
        const arr = payload?.data || payload || [];
        const hit = arr.some(
          (p) => String(p.partId ?? p.id ?? p) === String(partId)
        );
        if (hit) return s;
      } catch {
        /* ignore */
      }
    }
    return undefined;
  };

  /* ====== answer options sync (only here!) ====== */
  const syncAnswerOptionsForPart = (partId) => {
    const required = Number(partId) === 2 ? 3 : 4;
    const labels = ["A", "B", "C", "D", "E"];
    let cur = form.getFieldValue("answerOptions") || [];
    cur = cur.slice(0, required);
    while (cur.length < required) {
      cur.push({
        label: labels[cur.length] || "",
        content: "",
        isCorrect: false,
      });
    }
    cur = cur.map((o, i) => ({
      ...o,
      label: (o.label || labels[i] || "").toString(),
    }));
    // nếu != 1 đáp án đúng thì reset hết false, để user chọn lại
    if (cur.filter((x) => x.isCorrect === true).length !== 1) {
      cur = cur.map((x) => ({ ...x, isCorrect: false }));
    }
    form.setFieldsValue({ answerOptions: cur });
  };

  /* ====== modal actions ====== */
  const openAdd = () => {
    setIsEdit(false);
    setEditingId(null);
    setModalOpen(true);
    setTimeout(() => {
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
        number: undefined,
        questionGroupId: undefined,
        solution: "",
        audio: [],
        image: [],
        answerOptions: [
          { label: "A", content: "", isCorrect: false },
          { label: "B", content: "", isCorrect: false },
          { label: "C", content: "", isCorrect: false },
          { label: "D", content: "", isCorrect: false },
        ],
      });
    });
  };

  const openEdit = async (id) => {
    try {
      setIsEdit(true);
      setEditingId(id);
      setModalOpen(true);
      setAudioSrc(null);
      setImageSrc(null);

      const detail = await getQuestionById(id);
      const api = detail?.data ?? detail;
      const q = api?.data ?? api; // QuestionResponseDto

      // infer & load parts/types
      let skill;
      if (q?.partId != null) {
        skill = await inferSkillFromPart(q.partId);
        if (Number.isFinite(skill)) await loadPartsBySkill(skill);
        await loadTypesByPart(q.partId);
      }

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

      const audioFiles = toUploadFile(q?.audioUrl || "", q?.audioName);
      const imageFiles = toUploadFile(q?.imageUrl || "", q?.imageName);
      if (audioFiles.length) setAudioSrc(audioFiles[0].url);
      if (imageFiles.length) setImageSrc(imageFiles[0].url);

      // map options
      const rawOpts = q?.options ?? [];
      const labels = ["A", "B", "C", "D", "E"];
      const opts = (
        rawOpts.length
          ? rawOpts
          : [
              { label: "A", content: "", isCorrect: false },
              { label: "B", content: "", isCorrect: false },
              { label: "C", content: "", isCorrect: false },
              { label: "D", content: "", isCorrect: false },
            ]
      ).map((o, i) => ({
        id: o.optionId,
        label: (o.label ?? labels[i] ?? "").toString(),
        content: (o.content ?? "").toString(),
        isCorrect: !!o.isCorrect,
        optionOrder: i + 1,
      }));

      form.setFieldsValue({
        skill: Number.isFinite(skill) ? Number(skill) : undefined,
        partId: toNum(q?.partId),
        questionTypeId: toNum(q?.questionTypeId),
        content: q?.content ?? "",
        number: q?.number ?? undefined,
        questionGroupId: q?.questionGroupId ?? undefined,
        solution: q?.solution ?? "",
        audio: audioFiles,
        image: imageFiles,
        answerOptions: opts,
      });

      // chỉ đồng bộ đáp án khi là L&R
      if (Number(skill) === 0 && q?.partId != null) {
        syncAnswerOptionsForPart(q.partId);
      }
    } catch (e) {
      message.error("Không tải được chi tiết câu hỏi");
      setModalOpen(false);
      setIsEdit(false);
      setEditingId(null);
      console.error(e);
    }
  };

  /* ====== computed ====== */
  const requiredOptionsCount = useMemo(() => {
    if (!isLR) return undefined;
    return Number(selectedPart) === 2 ? 3 : 4;
  }, [isLR, selectedPart]);

  /* ====== handlers ====== */
  const handleToggleCorrect = (index, checked) => {
    const list = (form.getFieldValue("answerOptions") || []).map((o, i) => ({
      ...o,
      isCorrect: isLR ? (i === index ? checked : false) : false,
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

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();

      const partNum = Number(values.partId);
      const typeNum = Number(values.questionTypeId);
      if (!Number.isFinite(partNum)) {
        throw { errorFields: [{ name: ["partId"], errors: ["Chọn Part"] }] };
      }
      if (!Number.isFinite(typeNum)) {
        throw {
          errorFields: [
            { name: ["questionTypeId"], errors: ["Chọn Question Type"] },
          ],
        };
      }

      const audioFile = values.audio?.[0]?.originFileObj;
      const imageFile = values.image?.[0]?.originFileObj;

      if (isLR) {
        const list = (values.answerOptions || []).map((o) => ({
          ...o,
          label: (o.label || "").trim(),
          content: (o.content || "").trim(),
        }));
        const required = Number(values.partId) === 2 ? 3 : 4;
        if (list.length !== required) {
          throw {
            errorFields: [
              {
                name: ["answerOptions"],
                errors: [`Số lượng đáp án phải là ${required}`],
              },
            ],
          };
        }
        const correctCount = list.filter((x) => x?.isCorrect).length;
        if (correctCount !== 1) {
          throw {
            errorFields: [
              {
                name: ["answerOptions"],
                errors: ["Phải chọn đúng 1 đáp án đúng"],
              },
            ],
          };
        }
        // L&R bắt buộc audio (mới hoặc url cũ)
        if (!audioFile && !values.audio?.[0]?.url) {
          throw {
            errorFields: [
              { name: ["audio"], errors: ["Vui lòng chọn tệp audio (.mp3)"] },
            ],
          };
        }
        values.answerOptions = list; // đã clean
      }

      // Image bắt buộc (mới hoặc url cũ)
      if (!imageFile && !values.image?.[0]?.url) {
        throw {
          errorFields: [
            { name: ["image"], errors: ["Vui lòng chọn hình ảnh"] },
          ],
        };
      }

      const fd = new FormData();
      fd.append("Content", (values.content ?? "").trim());
      fd.append("QuestionTypeId", String(typeNum));
      fd.append("PartId", String(partNum));
      fd.append("Number", String(Number(values.number)));
      if (values.solution) fd.append("Solution", values.solution);

      if (audioFile) fd.append("Audio", audioFile);
      if (imageFile) fd.append("Image", imageFile);

      if (isLR) {
        (values.answerOptions || []).forEach((opt, idx) => {
          if (opt.id != null)
            fd.append(`AnswerOptions[${idx}].Id`, String(opt.id));
          fd.append(`AnswerOptions[${idx}].Label`, opt.label);
          fd.append(`AnswerOptions[${idx}].Content`, opt.content);
          fd.append(
            `AnswerOptions[${idx}].IsCorrect`,
            opt.isCorrect ? "true" : "false"
          );
          fd.append(`AnswerOptions[${idx}].OptionOrder`, String(idx + 1));
        });
      }
      // speaking/writing: KHÔNG append AnswerOptions → BE sẽ bỏ qua/giữ nguyên/xoá tùy logic đã fix

      setSubmitting(true);
      const res = isEdit
        ? await updateQuestion(editingId, fd)
        : await createQuestion(fd);

      message.success(
        res?.data ||
          res?.message ||
          (isEdit ? "Cập nhật thành công" : "Tạo câu hỏi thành công")
      );

      setModalOpen(false);
      form.resetFields();
      setAudioSrc(null);
      setImageSrc(null);
      setIsEdit(false);
      setEditingId(null);
      loadList(pagination.current, pagination.pageSize);
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

  /* ====== render ====== */
  return (
    <>
      <Card
        title="Question List"
        size="small"
        extra={
          <Button type="primary" onClick={openAdd}>
            Add Question
          </Button>
        }
      >
        <Table
          rowKey={(r) => r.questionId || r.id}
          dataSource={dataSource}
          loading={listLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (p, ps) => loadList(p, ps),
          }}
          columns={[
            {
              title: "ID",
              dataIndex: "questionId",
              width: 70,
              render: (v, r) => v ?? r.id,
            },
            {
              title: "Part",
              dataIndex: "partName",
              width: 100,
              render: (_, r) => r.partName || r.part?.name || r.partId,
            },
            {
              title: "Type",
              dataIndex: "questionTypeName",
              width: 160,
              render: (_, r) =>
                r.questionTypeName ||
                r.questionType?.typeName ||
                r.questionTypeId,
            },
            { title: "Content", dataIndex: "content", ellipsis: true },
            { title: "Number", dataIndex: "number", width: 90 },
            {
              title: "Status",
              dataIndex: "status",
              width: 110,
              render: (_, r) => (
                <Tag color={r.statusColor || (r.isActive ? "green" : "red")}>
                  {r.statusText || (r.isActive ? "Active" : "Inactive")}
                </Tag>
              ),
            },
            {
              title: "Actions",
              width: 190,
              render: (_, record) => (
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    size="small"
                    type="link"
                    onClick={() => openEdit(record.questionId || record.id)}
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Xoá câu hỏi?"
                    onConfirm={async () => {
                      try {
                        await deleteQuestion(record.questionId || record.id);
                        loadList(pagination.current, pagination.pageSize);
                      } catch {
                        /* ignore */
                      }
                    }}
                  >
                    <Button size="small" danger type="link">
                      Delete
                    </Button>
                  </Popconfirm>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={isEdit ? "Edit Question" : "Add Question"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setIsEdit(false);
          setEditingId(null);
        }}
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
                  options={TEST_SKILLS}
                  placeholder="Chọn Skill"
                  allowClear
                  onChange={async (skill) => {
                    form.setFieldsValue({
                      skill,
                      partId: undefined,
                      questionTypeId: undefined,
                      answerOptions: [],
                      audio: [],
                      image: [],
                    });
                    setAudioSrc(null);
                    setImageSrc(null);
                    setParts([]);
                    setQuestionTypes([]);
                    if (skill !== undefined && skill !== null) {
                      await loadPartsBySkill(skill);
                    }
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

                    // đồng bộ số đáp án theo part (chỉ khi L&R)
                    if (Number(form.getFieldValue("skill")) === 0) {
                      syncAnswerOptionsForPart(partId);
                      try {
                        await form.validateFields(["answerOptions"]);
                      } catch {}
                    }

                    const types = await loadTypesByPart(partId);
                    const firstVal = toNum(types?.[0]?.__val);
                    if (firstVal !== undefined) {
                      form.setFieldsValue({ questionTypeId: firstVal });
                    }
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
                    value: t?.__val ?? toNum(t.questionTypeId ?? t.id ?? t),
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
            <Col span={8}>
              <Form.Item
                name="number"
                label="Number"
                rules={[
                  { required: true, message: "Nhập số thứ tự" },
                  {
                    type: "number",
                    min: 1,
                    max: 200,
                    message: "Giá trị 1–200",
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  max={200}
                  style={{ width: "100%" }}
                  placeholder="Nhập số 1–200"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="questionGroupId" label="Group (tuỳ chọn)">
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            {isLR && (
              <Col span={12}>
                <Form.Item
                  name="audio"
                  label="Audio (bắt buộc - MP3)"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                  dependencies={["skill"]}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const isLRNow = Number(getFieldValue("skill")) === 0;
                        if (!isLRNow) return Promise.resolve();
                        const has = Array.isArray(value) && value.length > 0;
                        const hadUrl = !!value?.[0]?.url;
                        return has || hadUrl
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error("Vui lòng chọn tệp audio (.mp3)")
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

            <Col span={isLR ? 12 : 24}>
              <Form.Item
                name="image"
                label="Image (bắt buộc)"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
                rules={[
                  () => ({
                    validator(_, value) {
                      const has = Array.isArray(value) && value.length > 0;
                      const hadUrl = !!value?.[0]?.url;
                      return has || hadUrl
                        ? Promise.resolve()
                        : Promise.reject(new Error("Vui lòng chọn hình ảnh"));
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
          </Row>

          {/* Answer options chỉ render khi L&R */}
          {isLR && (
            <>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                Answer Options{" "}
                {requiredOptionsCount
                  ? `(yêu cầu: ${requiredOptionsCount})`
                  : ""}
              </div>

              <Form.List
                name="answerOptions"
                rules={[
                  {
                    validator: async (_, list) => {
                      if (Number(form.getFieldValue("skill")) !== 0) return;
                      const required =
                        Number(form.getFieldValue("partId")) === 2 ? 3 : 4;
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
    </>
  );
}
